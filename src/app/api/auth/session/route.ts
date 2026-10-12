import { aiStatus } from '@/ai/index.ts'
import { authContext, csrfTokenFor, json, route } from '@/server/http.ts'
import { ensureDb } from '@/server/bootstrap.ts'
import { usageTotals } from '@/server/repositories.ts'
import { getDb } from '@/db/index.ts'

/**
 * `GET /api/auth/session`
 *
 * Fonte única do estado de sessão no arranque da aplicação: utilizador (ou `null`),
 * id anónimo do dispositivo, token CSRF para as mutações, estado do motor de IA e
 * consumo orçamental dos últimos 30 dias.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const usage = ctx.user ? await usageTotals(await getDb(), ctx.user.id, 30) : null
  return json({ user: ctx.user, deviceId: ctx.deviceId, csrfToken: csrfTokenFor(ctx.sessionToken), ai: aiStatus(), usage })
})
