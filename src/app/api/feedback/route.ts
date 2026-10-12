import { ensureDb } from '@/server/bootstrap.ts'
import { FeedbackSchema } from '@/server/api-schemas.ts'
import { getDb } from '@/db/index.ts'
import { getSetting, setSetting } from '@/server/repositories.ts'
import { authContext, json, queryOne, readJson, route, takeQuota, HttpError } from '@/server/http.ts'

/**
 * `POST /api/feedback` — feedback sobre o produto (a avaliar: "a carta X estava certa").
 *
 * Guardado na tabela `settings` como lista limitada (200 entradas), com o id da leitura
 * quando o utilizador o forneceu, para se poder reler o contexto. Nunca guarda o texto
 * da pergunta nem a interpretação: só a avaliação e o comentário.
 */
export const dynamic = 'force-dynamic'

export const POST = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const quota = takeQuota(`feedback:${ctx.deviceId.slice(0, 12)}`, { capacity: 6, refillPerMinute: 0.2 })
  if (!quota.ok) throw new HttpError(429, 'Já enviaste feedback suficiente por agora.', 'limite_atingido', { retryAfterSeconds: quota.retryAfterSeconds })
  const body = await readJson(req, FeedbackSchema)
  const db = await getDb()
  const list = await getSetting<{ at: string; area: string; message: string; rating?: number; contact?: string; userId?: string | null }[]>(db, 'feedback', [])
  const next = [{ at: new Date().toISOString(), area: body.area, message: body.message, ...(body.rating ? { rating: body.rating } : {}), ...(body.contact ? { contact: body.contact } : {}), userId: ctx.user?.id ?? null }, ...list].slice(0, 200)
  await setSetting(db, 'feedback', next)
  return json({ ok: true, total: next.length }, { status: 201 })
})

export const GET = route(async () => {
  await ensureDb()
  const db = await getDb()
  const pending = await queryOne<{ count: number }>('SELECT count(*) AS count FROM readings WHERE deleted_at IS NULL')
  return json({ count: (await getSetting<unknown[]>(db, 'feedback', [])).length, readings: pending?.count ?? 0 })
})
