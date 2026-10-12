import { getDb } from '@/db/index.ts'
import { ensureDb } from '@/server/bootstrap.ts'
import { CreateReadingSchema, PaginationSchema } from '@/server/api-schemas.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { authContext, json, queryOne, readJson, route, takeQuota, tooManyRequests } from '@/server/http.ts'
import { createReading, listStoredReadings } from '@/server/service.ts'
import { generateInterpretation, setNote } from '@/server/reading-helpers.ts'

/**
 * `GET /api/readings` — histórico paginado (filtrável por tiragem e por favoritas).
 * `POST /api/readings` — grava o registo de distribuição de um ritual.
 *
 * O pedido traz a seed e os parâmetros físicos do baralhar; o servidor reproduz a
 * distribuição com o mesmo motor e compara-a com `clientCards`. Se divergirem, responde
 * 409: é isto que garante que nem o cliente nem a IA podem escolher cartas à revelia do
 * registo do ritual.
 *
 * No mesmo pedido é gerada e guardada a **interpretação local** (motor simbólico +
 * narrativo). Assim uma leitura existe completa sem rede, sem chave de IA e sem custo, e a
 * reescrita por modelo (`/interpret`) é sempre uma camada por cima deste texto.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = route(async (req: Request) => {
  await ensureDb()
  const url = new URL(req.url)
  const query = PaginationSchema.parse(Object.fromEntries(url.searchParams))
  const ctx = await authContext(req)
  const page = await listStoredReadings(ctx.user?.id ?? null, ctx.deviceId, query)
  return json({
    readings: page.readings.map(summarise),
    total: page.total,
    limit: query.limit,
    offset: query.offset,
    account: ctx.user ? 'autenticada' : 'anonima',
  })
})

export interface ReadingSummary {
  id: string
  createdAt: string
  spreadId: string
  spreadName: string
  question: string
  environment: string
  seed: number
  algorithm: string
  cuts: number
  allowReversed: boolean
  cards: unknown
  starred: boolean
  hasInterpretation: boolean
  shareToken: string | null
  durationSeconds: number | null
  generator: string | null
  voice: string | null
  register: string | null
  depth: string | null
  querentNote?: string
}

/** O que a listagem revela: o suficiente para reconhecer a leitura, sem despejar o corpo todo. */
function summarise(reading: Awaited<ReturnType<typeof listStoredReadings>>['readings'][number]): ReadingSummary {
  return {
    id: reading.id,
    createdAt: reading.createdAt,
    spreadId: reading.spreadId,
    spreadName: reading.spreadName,
    question: reading.question,
    environment: reading.environment,
    seed: reading.seed,
    algorithm: reading.algorithm,
    cuts: reading.cuts,
    allowReversed: reading.allowReversed,
    cards: reading.cards,
    starred: reading.starred,
    hasInterpretation: !!reading.interpretation,
    shareToken: reading.shareToken ?? null,
    durationSeconds: reading.durationSeconds ?? null,
    generator: reading.interpretation?.meta.generator ?? null,
    voice: reading.interpretation?.meta.voice ?? null,
    register: reading.interpretation?.meta.register ?? null,
    depth: reading.interpretation?.meta.depth ?? null,
    ...(reading.querentNote ? { querentNote: reading.querentNote } : {}),
  }
}

export const POST = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const quota = takeQuota(`${ctx.limitKey}:leituras`, { capacity: 40, refillPerMinute: 6 })
  if (!quota.ok) return tooManyRequests(quota.retryAfterSeconds)
  const body = await readJson(req, CreateReadingSchema)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const voice = body.voice ?? prefs.voice
  const register = body.register ?? prefs.register
  const depth = body.depth ?? prefs.depth

  const prepared = await createReading(
    {
      spreadId: body.spreadId,
      question: body.question,
      seed: body.seed,
      algorithm: body.algorithm,
      cuts: body.cuts,
      allowReversed: body.allowReversed && prefs.allowReversed,
      drawMode: body.drawMode,
      environment: body.environment,
      clientCards: body.clientCards,
      ...(body.picks?.length ? { picks: body.picks } : {}),
      ...(body.positionOrder?.length ? { positionOrder: body.positionOrder } : {}),
      ...(body.querentNote ? { querentNote: body.querentNote } : {}),
      deckId: body.deckId ?? prefs.deckId,
      majorsOnly: body.majorsOnly,
      deviceId: ctx.deviceId,
      ...(body.durationSeconds !== undefined ? { durationSeconds: body.durationSeconds } : {}),
    },
    ctx.user?.id ?? null,
    { isDaily: body.isDaily },
  )

  const db = await getDb()
  if (body.querentNote) await setNote(db, prepared.id, body.querentNote)

  let outcome: Awaited<ReturnType<typeof generateInterpretation>> | null = null
  if (body.autoInterpret) {
    outcome = await generateInterpretation(prepared.reading, ctx.user?.id ?? null, {
      voice,
      register,
      depth,
      mode: 'local',
      includeHistory: true,
      ...(ctx.user ? { limitKey: ctx.limitKey } : {}),
    })
  }

  const collisions = await queryOne<{ count: number }>(
    'SELECT count(*) AS count FROM readings WHERE seed = ? AND spread_id = ? AND deleted_at IS NULL',
    [prepared.seed, prepared.spread.id],
  )

  return json(
    {
      id: prepared.id,
      reading: summarise({ ...prepared.reading, interpretation: outcome?.interpretation }),
      spread: prepared.spread,
      drawn: prepared.drawn,
      deckOrder: prepared.deckOrder,
      audit: { ...prepared.audit, verified: prepared.verified, replayable: true },
      ...(outcome ? { interpretation: outcome.interpretation, safety: outcome.safety, analysis: outcome.analysis } : {}),
      // Quantas outras leituras deste dispositivo partilham exactamente este registo de
      // distribuição. Deve ser 1: mais do que isso só quando a seed foi copiada de propósito.
      seedCollisions: Math.max(0, (collisions?.count ?? 1) - 1),
    },
    { status: 201 },
  )
})
