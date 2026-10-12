import { ensureDb } from '@/server/bootstrap.ts'
import { UserSpreadSchema } from '@/server/api-schemas.ts'
import { SPREADS, THEME_INDEX, matchThemeKeywords, spreadsByCategory } from '@/domain/content.ts'
import type { SpreadDef } from '@/domain/types.ts'
import { authContext, json, readJson, requireUser, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { deleteSpread, listUserSpreads } from '@/server/repositories.ts'
import { persistUserSpread } from '@/server/spread-service.ts'
import type { z } from 'zod'

/**
 * `GET /api/spreads` — catálogo curado + tiragens próprias da conta, com busca por
 * palavra-chave, categoria e número de cartas.
 * `POST` — cria/atualiza uma tiragem própria: o layout, a ordem de leitura, a estrutura em
 * blocos e o layout mobile são derivados pelo **mesmo** motor do build de conteúdo e o
 * resultado passa pelo `SpreadSchema` canónico. Uma tiragem do utilizador não é um
 * formato paralelo: é exactamente o mesmo tipo de objecto.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const url = new URL(req.url)
  const search = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  const category = url.searchParams.get('categoria')
  const cards = Number(url.searchParams.get('cartas') ?? 0)
  const db = await getDb()
  const mine = ctx.user ? await listUserSpreads(db, ctx.user.id) : []
  const own = mine.map((row) => row.definition as SpreadDef | null).filter((value): value is SpreadDef => !!value)
  let all: SpreadDef[] = [...SPREADS, ...own]
  if (category) all = all.filter((spread) => spread.category === category)
  if (cards) all = all.filter((spread) => spread.cardCount === cards)
  if (search) {
    const scored = matchThemeKeywords(search)
    const ids = new Set(scored.flatMap((hit) => THEME_INDEX[hit.keyword] ?? []))
    all = all.filter(
      (spread) =>
        ids.has(spread.id) ||
        spread.name.toLowerCase().includes(search) ||
        spread.summary.toLowerCase().includes(search) ||
        spread.purpose.toLowerCase().includes(search) ||
        spread.positions.some((position) => position.label.toLowerCase().includes(search)),
    )
  }
  return json({
    spreads: all,
    total: all.length,
    byCategory: Object.fromEntries([...new Set(SPREADS.map((s) => s.category))].map((key) => [key, spreadsByCategory(key).length])),
    counts: { catalog: SPREADS.length, own: own.length },
  })
})

export const POST = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const body: z.infer<typeof UserSpreadSchema> = await readJson(req, UserSpreadSchema)
  const created = await persistUserSpread(body, user.id)
  return json({ ...created, shared: false }, { status: 201 })
})

export const DELETE = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return json({ error: 'Falta o id da tiragem.', code: 'validacao' }, { status: 422 })
  const db = await getDb()
  return json({ ok: await deleteSpread(db, id, user.id) })
})
