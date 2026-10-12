import { ensureDb } from '@/server/bootstrap.ts'
import { DateRangeSchema, JournalSchema } from '@/server/api-schemas.ts'
import { HttpError, json, queryRows, readJson, requireUser, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { listJournal, upsertJournal } from '@/server/repositories.ts'

/**
 * `GET /api/journal?de=&ate=` · `POST /api/journal`
 *
 * O diário guarda o *estado reportado* (humor, sono, energia, clareza) junto da leitura do
 * dia. Serve para a pessoa comparar ciclos consigo própria; nunca é apresentado como
 * evidência de causa nem como previsão, e as séries são mostradas com essa moldura.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const url = new URL(req.url)
  const range = DateRangeSchema.parse({
    from: url.searchParams.get('de') ?? undefined,
    to: url.searchParams.get('ate') ?? undefined,
    days: url.searchParams.get('dias') ?? 30,
  })
  const from = range.from ?? new Date(Date.now() - range.days * 86400000).toISOString().slice(0, 10)
  const to = range.to ?? new Date().toISOString().slice(0, 10)
  const db = await getDb()
  const entries = await listJournal(db, user.id, from, to)
  const readings = await queryRows<{ id: string; date: string; question: string; spread_name: string }>(
    `SELECT r.id, substr(r.created_at, 1, 10) AS date, r.question, r.spread_name
       FROM readings r WHERE r.user_id = ? AND substr(r.created_at,1,10) BETWEEN ? AND ? AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC`,
    [user.id, from, to],
  )
  return json({ from, to, entries, readings })
})

export const POST = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const body = await readJson(req, JournalSchema)
  if (!body.note && !body.mood && !body.readingId) throw new HttpError(422, 'Escreve uma nota, um estado ou liga uma leitura.', 'vazio')
  const db = await getDb()
  await upsertJournal(db, { userId: user.id, ...body })
  return json({ ok: true, date: body.date }, { status: 201 })
})
