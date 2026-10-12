import { ensureDb } from '@/server/bootstrap.ts'
import { UpdateReadingSchema } from '@/server/api-schemas.ts'
import { authContext, HttpError, json, readJson, route } from '@/server/http.ts'
import { parseJsonColumn } from '@/db/index.ts'
import { getCard } from '@/domain/content.ts'
import { replayDraw } from '@/engine/deck.ts'
import { listChatMessages, listInterpretations, setShareToken, setStarred, softDeleteReading } from '@/server/repositories.ts'
import { setNote, setQuestion, spreadFor } from '@/server/reading-helpers.ts'
import { storedReading } from '@/server/service.ts'

/**
 * `GET /api/readings/[id]` — leitura completa: distribuição, registo do ritual, todas as
 * interpretações guardadas (local e híbridas) e a conversa.
 * `PATCH` — favoritar, corrigir a pergunta, nota do consulente.
 * `DELETE` — apagar do histórico; `?hard=1` remove mesmo (exige conta).
 *
 * A resposta inclui `replay`: o servidor volta a distribuir a partir do registo gravado e
 * mostra que coincide carta a carta. É a prova visível de que a IA não mexeu nas cartas.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export const GET = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const { db, reading } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)
  const [interpretations, chat] = await Promise.all([listInterpretations(db, id), listChatMessages(db, id)])
  const spread = await spreadFor(reading, ctx.user?.id ?? null)
  // O replay tem de recomeçar na ordem *canónica* do baralho: a `deck_order` guardada já é
  // o resultado do embaralhamento, e voltar a embaralhá-la daria outra tiragem.
  const audit = (reading.audit ?? {}) as { baseOrder?: string[]; cutSizes?: number[] }
  const order = audit.baseOrder?.length ? audit.baseOrder : []
  const replay = order.length
    ? replayDraw(order, {
        spread,
        seed: reading.seed,
        algorithm: reading.algorithm,
        cuts: reading.cuts,
        allowReversed: reading.allowReversed,
        drawMode: reading.drawMode as 'topo' | 'fundo' | 'alternado',
        cutSize: audit.cutSizes?.[0],
      })
    : null
  return json({
    reading: { ...reading, interpretation: reading.interpretation ?? null },
    spread,
    interpretations: interpretations.map((row) => ({
      id: row.id,
      generator: row.generator,
      provider: row.provider,
      model: row.model,
      voice: row.voice,
      register: row.register,
      depth: row.depth,
      createdAt: row.created_at,
      costUsd: row.cost_usd,
      tokensIn: row.tokens_in,
      tokensOut: row.tokens_out,
      body: parseJsonColumn<unknown>(row.body, null),
    })),
    chat,
    cards: reading.cards.map((card) => ({ ...card, name: getCard(card.cardId)?.name.pt ?? card.cardId, card })),
    replay: replay
      ? {
          matches: replay.drawn.map((card) => `${card.cardId}:${card.orientation}`).join('|') === reading.cards.map((card) => `${card.cardId}:${card.orientation}`).join('|'),
          seed: reading.seed,
          algorithm: reading.algorithm,
          cuts: reading.cuts,
          drawMode: reading.drawMode,
          allowReversed: reading.allowReversed,
        }
      : { matches: null, note: 'Leitura registada antes do campo baseOrder: a ordem guardada não permite reproduzir o embaralhamento, apenas mostrar as cartas.' },
  })
})

export const PATCH = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const { db, reading } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)
  const body = await readJson(req, UpdateReadingSchema)
  if (body.starred !== undefined) await setStarred(db, id, body.starred)
  if (body.querentNote !== undefined) await setNote(db, id, body.querentNote || null)
  if (body.question !== undefined) await setQuestion(db, id, body.question)
  return json({ ok: true, id, starred: body.starred ?? reading.starred })
})

export const DELETE = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const { db } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)
  const hard = new URL(req.url).searchParams.get('hard') === '1'
  if (hard) {
    if (!ctx.user) throw new HttpError(401, 'Apagar definitivamente exige conta.', 'nao_autenticado')
    await softDeleteReading(db, id)
    await setShareToken(db, id, null)
    await db.query('DELETE FROM readings WHERE id = ?', [id])
  } else {
    await softDeleteReading(db, id)
  }
  return json({ ok: true, mode: hard ? 'definitivo' : 'historico' })
})
