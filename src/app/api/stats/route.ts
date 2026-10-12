import { ensureDb } from '@/server/bootstrap.ts'
import { statistics } from '@/server/service.ts'
import { usageSummary } from '@/server/service.ts'
import { authContext, json, queryOne, queryRows, route } from '@/server/http.ts'
import { CARDS } from '@/domain/content.ts'

/**
 * `GET /api/stats`
 *
 * Estatísticas *da própria prática*: que cartas saíram, com que frequência invertidas, em
 * que posições, cobertura do baralho, tiragens mais usadas, sequência de dias e gasto de
 * IA. São contagens sobre o histórico pessoal — não comparação com ninguém nem previsão.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const userId = ctx.user?.id ?? null
  const stats = await statistics(userId)
  const totals = userId
    ? await queryOne<{ readings: number; days: number; questions: number; minutes: number; starred: number }>(
        `SELECT count(*) AS readings,
                COUNT(DISTINCT substr(created_at,1,10)) AS days,
                SUM(CASE WHEN question <> '' THEN 1 ELSE 0 END) AS questions,
                COALESCE(SUM(duration_seconds),0)/60 AS minutes,
                SUM(CASE WHEN starred = 1 THEN 1 ELSE 0 END) AS starred
           FROM readings WHERE user_id = ? AND deleted_at IS NULL`,
        [userId],
      )
    : await queryOne<{ readings: number; days: number; questions: number; minutes: number; starred: number }>(
        `SELECT count(*) AS readings,
                COUNT(DISTINCT substr(created_at,1,10)) AS days,
                SUM(CASE WHEN question <> '' THEN 1 ELSE 0 END) AS questions,
                COALESCE(SUM(duration_seconds),0)/60 AS minutes,
                SUM(CASE WHEN starred = 1 THEN 1 ELSE 0 END) AS starred
           FROM readings WHERE session_id = ? AND deleted_at IS NULL`,
        [ctx.deviceId],
      )
  const ownerColumn = userId ? 'user_id' : 'session_id'
  const ownerValue = userId ?? ctx.deviceId
  const bySpread = await queryRows<{ spread_id: string; spread_name: string; count: number }>(
    `SELECT spread_id, spread_name, count(*) AS count FROM readings WHERE ${ownerColumn} = ? AND deleted_at IS NULL GROUP BY spread_id, spread_name ORDER BY count DESC LIMIT 12`,
    [ownerValue],
  )
  const streak = await queryRows<{ day: string }>(`SELECT DISTINCT substr(created_at,1,10) AS day FROM readings WHERE ${ownerColumn} = ? AND deleted_at IS NULL ORDER BY day DESC LIMIT 400`, [ownerValue])
  const reversedTrend = await queryRows<{ day: string; cards: string }>(
    `SELECT substr(created_at,1,10) AS day, cards FROM readings WHERE ${ownerColumn} = ? AND deleted_at IS NULL ORDER BY day DESC LIMIT 60`,
    [ownerValue],
  )
  return json({
    ...stats,
    totals: totals ?? { readings: 0, days: 0, questions: 0, minutes: 0, starred: 0 },
    bySpread,
    usage: await usageSummary(userId),
    streak: streakLength(streak.map((row) => row.day)),
    lastDay: streak[0]?.day ?? null,
    reversedTrend: reversedTrend.map((row) => {
      const cards = safeParse(row.cards)
      return { day: row.day, reversed: cards.filter((card) => card.orientation === 'reversed').length, total: cards.length }
    }),
    deckSize: CARDS.length,
    note: 'Estas são contagens do teu próprio histórico. Não medem certeza: medem prática.',
  })
})

function safeParse(raw: unknown): { orientation: string }[] {
  try {
    return (JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) as { orientation: string }[]) ?? []
  } catch {
    return []
  }
}

function streakLength(days: string[]): number {
  let streak = 0
  let cursor: number | null = null
  for (const day of days) {
    const time = Date.parse(`${day}T00:00:00Z`)
    if (cursor === null || cursor - time === 86400000) {
      streak += 1
      cursor = time
    } else break
  }
  return streak
}
