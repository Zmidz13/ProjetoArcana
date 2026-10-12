import { ensureDb } from '@/server/bootstrap.ts'
import { CARDS, CONTENT_STATS, SPREADS, contentMeta } from '@/domain/content.ts'
import { authContext, json, queryRows, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { listUserSpreads } from '@/server/repositories.ts'
import type { CardDef, SpreadDef } from '@/domain/types.ts'

/**
 * `GET /api/catalog`
 *
 * Catálogo *resolvido*: conteúdo canónico gerado em build + `content_overrides` da base de
 * dados (edições guardadas pela conta de administração). A UI lê daqui quando precisa da
 * versão editada; as páginas estáticas importam o `src/domain/content.ts` directamente.
 */
export const dynamic = 'force-dynamic'

interface OverrideRow {
  entity: string
  entity_id: string
  patch: string
}

function applyPatch<T extends { id: string }>(items: T[], rows: OverrideRow[]): T[] {
  if (!rows.length) return items
  const byId = new Map(items.map((item) => [item.id, item]))
  for (const row of rows) {
    const base = byId.get(row.entity_id)
    if (!base) continue
    try {
      byId.set(row.entity_id, { ...base, ...(JSON.parse(row.patch) as object) } as T)
    } catch {
      // Override corrompido: ignora-se, o conteúdo canónico ganha sempre.
    }
  }
  return [...byId.values()]
}

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const db = await getDb()
  const overrides = await queryRows<OverrideRow>('SELECT entity, entity_id, patch FROM content_overrides')
  const cards = applyPatch<CardDef>(CARDS as CardDef[], overrides.filter((row) => row.entity === 'card'))
  const catalog = applyPatch<SpreadDef>(SPREADS as SpreadDef[], overrides.filter((row) => row.entity === 'spread'))
  const mine = ctx.user ? (await listUserSpreads(db, ctx.user.id)).map((row) => row.definition as SpreadDef) : []
  const detail = new URL(req.url).searchParams.get('detalhe')
  const card = detail ? cards.find((item) => item.id === detail) : null
  return json({
    meta: { hash: contentMeta.hash, builtAt: contentMeta.builtAt, overrides: overrides.length, ...CONTENT_STATS },
    cards: detail ? [card].filter(Boolean) : cards,
    spreads: [...catalog, ...mine],
  })
})
