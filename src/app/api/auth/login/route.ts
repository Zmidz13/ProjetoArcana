import { ensureDb } from '@/server/bootstrap.ts'
import { LoginSchema } from '@/server/api-schemas.ts'
import { authenticate, fail, readJson, route, takeQuota } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { findUserByHandle } from '@/server/repositories.ts'
import { HttpError } from '@/server/http.ts'

/**
 * `POST /api/auth/login`
 *
 * Verificação com scrypt + `timingSafeEqual`; a resposta só devolve o utilizador público e
 * o token CSRF (a cookie de sessão vai em `Set-Cookie`, `httpOnly`). Falhas repetidas
 * esbarram em dois limites: por utilizador e por rede.
 */
export const dynamic = 'force-dynamic'

export const POST = route(async (req: Request) => {
  await ensureDb()
  const body = await readJson(req, LoginSchema)
  const perUser = takeQuota(`login:user:${body.handle.toLowerCase()}`, { capacity: 6, refillPerMinute: 0.6 })
  const perNet = takeQuota(`login:net:${req.headers.get('x-forwarded-for') ?? 'local'}`, { capacity: 30, refillPerMinute: 6 })
  if (!perUser.ok || !perNet.ok) {
    return fail(429, 'Demasiadas tentativas de entrada. Espera uns minutos e tenta de novo.', 'limite_atingido', {
      retryAfterSeconds: Math.max(perUser.ok ? 1 : perUser.retryAfterSeconds, perNet.ok ? 1 : perNet.retryAfterSeconds),
    })
  }
  const db = await getDb()
  const found = await findUserByHandle(db, body.handle.toLowerCase())
  if (!found) throw new HttpError(401, 'Utilizador ou palavra-passe incorretos.', 'credenciais')
  return await authenticate(req, { handle: body.handle.toLowerCase(), password: body.password })
})
