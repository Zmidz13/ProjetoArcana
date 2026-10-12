import { ensureDb } from '@/server/bootstrap.ts'
import { getSpread } from '@/domain/content.ts'
import type { SpreadDef } from '@/domain/types.ts'
import { authContext, HttpError, json, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { deleteSpread, listUserSpreads } from '@/server/repositories.ts'
import { layoutFor } from '@/engine/layout.ts'

/**
 * `GET /api/spreads/[id]` — definição completa (posições com layout, blocos, ordem de
 * leitura) + geometia derivada para o pré-visualizador.
 * `DELETE` — apaga uma tiragem própria (as do catálogo não podem ser apagadas).
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

async function resolve(id: string, userId: string | null): Promise<SpreadDef | null> {
  const catalog = getSpread(id)
  if (catalog) return catalog
  if (!userId) return null
  const db = await getDb()
  const rows = await listUserSpreads(db, userId)
  const found = rows.find((row) => row.id === id)
  return found ? (found.definition as SpreadDef | null) : null
}

export const GET = route<Params>(async (_req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(_req)
  const spread = await resolve(id, ctx.user?.id ?? null)
  if (!spread) throw new HttpError(404, 'Tiragem não encontrada.', 'tiragem_inexistente')
  return json({
    spread,
    preview: {
      points: layoutFor(spread.shape as never, { count: spread.cardCount }),
      aspect: spread.cardCount > 6 ? 'wide' : 'square',
    },
    editable: spread.author === 'utilizador',
  })
})

export const DELETE = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  if (!ctx.user) throw new HttpError(401, 'Só a conta que criou a tiragem a pode apagar.', 'nao_autenticado')
  const db = await getDb()
  const removed = await deleteSpread(db, id, ctx.user.id)
  if (!removed) throw new HttpError(404, 'Essa tiragem não é tua ou não existe.', 'inexistente')
  return json({ ok: true, id })
})
