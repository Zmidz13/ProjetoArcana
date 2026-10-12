import { ensureDb } from '@/server/bootstrap.ts'
import { calendarSeries } from '@/server/service.ts'
import { authContext, json, route } from '@/server/http.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { moonSeries, sabbatsOfYear } from '@/engine/cycle.ts'

/**
 * `GET /api/calendar?de=AAAA-MM-DA&dias=31`
 *
 * Calendário temático: uma carta por dia + fase da Lua + sabbats do ano. É um calendário
 * de prática simbólica (o dia tem uma carta-âncora), não um almanaque determinístico: a
 * UI tem de o dizer e a fase lunar tem margem de ±0,5 dia junto das fronteiras.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const url = new URL(req.url)
  const from = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('de') ?? '') ? (url.searchParams.get('de') as string) : new Date().toISOString().slice(0, 10)
  const days = Math.min(400, Math.max(1, Number(url.searchParams.get('dias') ?? 31) || 31))
  const year = Number(from.slice(0, 4))
  return json({
    from,
    days,
    series: calendarSeries(from, days, prefs.dailySalt || ''),
    moons: moonSeries(days, new Date(from + 'T12:00:00Z')),
    sabbats: sabbatsOfYear(year),
    accuracyNote: 'Fase lunar calculada por efeméride média (Meeus, 14 termos): precisa a nível de hora, pode divergir ±0,5 dia de um almanaque local junto da fronteira entre dias.',
  })
})
