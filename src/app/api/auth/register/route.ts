import { ensureDb } from '@/server/bootstrap.ts'
import { RegisterSchema } from '@/server/api-schemas.ts'
import { claimDeviceReadings, createUser, findUserByHandle } from '@/server/repositories.ts'
import { deviceId, HttpError, issueSession, readJson, route, takeQuota, fail } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'

/**
 * `POST /api/auth/register`
 *
 * Além de criar a conta, anexa ao utilizador as leituras que aquele dispositivo tinha em
 * anónimo (`claimDeviceReadings`): o histórico não se perde quando alguém decide criar conta.
 * A resposta devolve o número de leituras recuperadas, que é o que o ecrã de boas-vindas mostra.
 */
export const dynamic = 'force-dynamic'

export const POST = route(async (req: Request) => {
  await ensureDb()
  const body = await readJson(req, RegisterSchema)
  const db = await getDb()
  const quota = takeQuota(`register:${deviceId(req)}`, { capacity: 3, refillPerMinute: 0.05 })
  if (!quota.ok) return fail(429, 'Registos a mais a partir deste dispositivo. Tenta mais tarde.', 'limite_atingido', { retryAfterSeconds: quota.retryAfterSeconds })
  const handle = body.handle.toLowerCase()
  if (await findUserByHandle(db, handle)) throw new HttpError(409, 'Esse nome de utilizador já está em uso.', 'em_uso')
  const user = await createUser(db, {
    handle,
    password: body.password,
    ...(body.email ? { email: body.email } : {}),
    ...(body.displayName ? { displayName: body.displayName } : {}),
  })
  const claimed = await claimDeviceReadings(db, deviceId(req), user.id)
  const res = await issueSession(req, handle)
  const issued = (await res.json()) as { user?: Record<string, unknown> }
  // IMPORTANTE: a resposta de `issueSession` traz as cookies de sessão/CSRF/dispositivo.
  // Construir uma resposta nova a partir do `json()` perdê-las-ia — o utilizador ficava com
  // conta criada mas continuava anónimo. Por isso reaproveitamos os cabeçalhos de `res`.
  const payload = JSON.stringify({ ...issued, user: { ...(issued.user ?? {}), ...user, claimedReadings: claimed } })
  return new Response(payload, { status: 200, headers: res.headers })
})
