import { ensureDb } from '@/server/bootstrap.ts'
import { json, route } from '@/server/http.ts'
import { sharedReading } from '@/server/service.ts'

/** `GET /api/shared/[token]` — leitura partilhada, sem exigir sessão e sem dados da conta. */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ token: string }> }

export const GET = route<Params>(async (_req, { params }) => {
  await ensureDb()
  const { token } = await params
  return json({ shared: await sharedReading(token) })
})
