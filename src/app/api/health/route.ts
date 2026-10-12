import { aiStatus } from '@/ai/index.ts'
import { CONTENT_STATS, contentMeta } from '@/domain/content.ts'
import { ENVIRONMENT_LIST, SFX_LIST } from '@/domain/experience.ts'
import { authContext, json, queryOne, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { ensureDb } from '@/server/bootstrap.ts'
import { SPREADS } from '@/domain/content.ts'

/**
 * `GET /api/health` — diagnóstico público e honesto do estado do serviço:
 * base de dados, migrações aplicadas, hash do conteúdo simbólico, dimensões do catálogo,
 * ambientes/efeitos registados e disponibilidade do motor de IA (sem nunca revelar chaves).
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  const started = Date.now()
  await ensureDb()
  const db = await getDb()
  const ctx = await authContext(req)
  const counts = await queryOne<{ readings: number; users: number }>(
    `SELECT (SELECT count(*) FROM readings) AS readings, (SELECT count(*) FROM users) AS users`,
  )
  return json({
    ok: true,
    service: 'arcana',
    version: process.env.npm_package_version ?? '1.0.0',
    time: new Date().toISOString(),
    latencyMs: Date.now() - started,
    database: { kind: db.kind, migrations: (await db.appliedMigrations()).length, path: db.kind === 'sqlite' ? process.env.ARCANA_DB_PATH ?? 'var/arcana.db' : 'postgres' },
    content: { hash: contentMeta.hash, builtAt: contentMeta.builtAt, ...CONTENT_STATS, spreadsWithLayout: SPREADS.length },
    experience: { environments: ENVIRONMENT_LIST.length, soundEffects: SFX_LIST.length },
    totals: counts ?? { readings: 0, users: 0 },
    ai: aiStatus(),
    session: { authenticated: !!ctx.user },
  })
})
