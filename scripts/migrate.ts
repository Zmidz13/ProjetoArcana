/**
 * Aplica as migrações na base configurada por variáveis de ambiente.
 *
 *   node scripts/migrate.ts
 *
 * É idempotente: `schema_migrations` diz o que já foi aplicado e `migrate()` salta o resto.
 * A aplicação também chama as migrações no primeiro pedido (`ensureDb()`), por isto é
 * opcional em desenvolvimento — mas num deploy em Contentor/serverless convém correr este
 * script uma vez (no build ou num job de release) para que várias instâncias frias não
 * disputem o DDL ao mesmo tempo.
 */
import { closeDb, dbConfigFromEnv, getDb, migrate } from '../src/db/index.ts'

const started = Date.now()
const config = dbConfigFromEnv()
const where = config.driver === 'postgres' ? 'PostgreSQL' : `SQLite em ${config.file}`
console.log(`[arcana] motor: ${where}`)

try {
  const db = await getDb()
  const report = await migrate(db)
  const total = (await db.appliedMigrations()).length
  console.log(
    `[arcana] ${report.applied.length} aplicada(s), ${report.alreadyPresent.length} já presentes · ${total} no registo · ${Date.now() - started} ms`,
  )
  for (const id of report.applied) console.log(`   + ${id}`)
  if (report.applied.length === 0) console.log('   (nada a fazer — esquema atualizado)')
} catch (error) {
  console.error(`[arcana] migração falhou (${where}):`, error instanceof Error ? error.message : error)
  console.error('         para Postgres confirma DATABASE_URL; para SQLite confirma que o diretório de dados é gravável (ARCANA_DATA_DIR).')
  process.exitCode = 1
} finally {
  await closeDb().catch(() => {})
}
