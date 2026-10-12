import { endSession, logoutResponse, route } from '@/server/http.ts'
import { ensureDb } from '@/server/bootstrap.ts'

/** `POST /api/auth/logout` — revoga a sessão na base de dados e limpa as cookies. */
export const dynamic = 'force-dynamic'

export const POST = route(async (req: Request) => {
  await ensureDb()
  await endSession(req)
  return logoutResponse(req)
})
