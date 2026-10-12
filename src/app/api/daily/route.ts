import { ensureDb } from '@/server/bootstrap.ts'
import { dailyCard } from '@/server/service.ts'
import { authContext, json, route } from '@/server/http.ts'
import { mergePreferences } from '@/domain/experience.ts'

/**
 * `GET /api/daily?data=AAAA-MM-DD`
 *
 * Carta do dia: a seed é derivada da data (e do sal opcional da conta), portanto é a
 * mesma para toda a gente no mesmo dia — e reprodutível para sempre. A Lua e os sabbats
 * vêm do motor de ciclo (efeméride aproximada) e são apresentados como moldura simbólica,
 * nunca como previsão.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const url = new URL(req.url)
  const requested = url.searchParams.get('data')
  const salt = url.searchParams.get('salt') ?? (prefs.dailySalt || '')
  const today = new Date().toISOString().slice(0, 10)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requested ?? '') ? (requested as string) : today
  const spreadId = url.searchParams.get('spread') ?? undefined
  return json({
    ...dailyCard(date, salt, spreadId),
    personalised: !!salt,
    today,
    editableSalt: !!ctx.user,
  })
})
