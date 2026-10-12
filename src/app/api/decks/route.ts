import { ensureDb } from '@/server/bootstrap.ts'
import { DeckSchema } from '@/server/api-schemas.ts'
import { CARDS, DECK_IDS } from '@/domain/content.ts'
import { authContext, json, readJson, requireUser, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { deleteDeck, listDecks, saveDeck } from '@/server/repositories.ts'

/**
 * `GET /api/decks` · `POST /api/decks` · `DELETE /api/decks?id=`
 *
 * Um baralho próprio é um *subconjunto ordenado* do baralho canónico mais um tema visual:
 * é assim que se pode continuar a usar o mesmo motor de distribuição, as mesmas 78
 * ilustrações originais e a mesma auditoria de replay. Os arcanos maiores isolados são o
 * caso de uso típico (`onlyMajors: true`).
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const db = await getDb()
  const mine = ctx.user ? await listDecks(db, ctx.user.id) : []
  return json({
    decks: mine,
    default: { id: null, name: 'Rider-Waite completo', size: DECK_IDS.length, allowReversed: true, theme: 'obsidiana' },
    palette: [...new Set(CARDS.map((card) => card.suit ?? 'major'))],
  })
})

export const POST = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const body = await readJson(req, DeckSchema)
  const known = DECK_IDS.filter((id) => body.cardIds.length === 0 || body.cardIds.includes(id))
  const ids = (body.onlyMajors ? known.filter((id) => id.startsWith('major-')) : known).slice()
  if (ids.length < 3) return json({ error: 'Escolhe pelo menos três cartas para este baralho.', code: 'baralho_invalido' }, { status: 422 })
  const db = await getDb()
  const deck = await saveDeck(db, {
    ...(body.id ? { id: body.id } : {}),
    userId: user.id,
    name: body.name,
    deckKind: body.deckKind,
    allowReversed: body.allowReversed,
    cardIds: ids,
    theme: body.theme,
  })
  return json({ deck }, { status: 201 })
})

export const DELETE = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return json({ error: 'Falta o id do baralho.', code: 'validacao' }, { status: 422 })
  const db = await getDb()
  return json({ ok: await deleteDeck(db, id, user.id) })
})
