import { z } from 'zod'

import { ensureDb } from '@/server/bootstrap.ts'
import { deviceId, json, readJson, requireUser, route, takeQuota, tooManyRequests } from '@/server/http.ts'
import { claimDeviceReadings } from '@/server/repositories.ts'
import { getDb } from '@/db/index.ts'

/**
 * `POST /api/auth/claim` — junta à conta as leituras gravadas apenas contra o identificador
 * do dispositivo. Ao registar isto acontece automaticamente; esta rota cobre o caso de quem
 * cria conta noutro aparelho, ou importa uma base antiga, e quer as leituras antigas cá dentro.
 *
 * Idempotente por natureza: depois da primeira chamada não ficam mais leituras órfãs.
 */
export const dynamic = 'force-dynamic'

const Body = z.object({ device: z.string().min(8).max(80).optional() })

export const POST = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const quota = takeQuota(`claim:${user.id}`, { capacity: 6, refillPerMinute: 2 })
  if (!quota.ok) return tooManyRequests(quota.retryAfterSeconds)
  const body = await readJson(req, Body).catch(() => ({}) as z.infer<typeof Body>)
  const db = await getDb()
  const claimed = await claimDeviceReadings(db, body.device ?? deviceId(req), user.id)
  return json({ ok: true, claimed })
})
