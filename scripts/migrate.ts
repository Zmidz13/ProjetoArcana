/**
 * Corre as migrações na base de dados configurada.
 * `node scripts/migrate.ts` — idempotente: `schema_migrations` registra o que já foi aplicado.
 */
import { ensureDb, closeDb } from '../src/db/index.ts'

const before = Date.now()
const db = await ensureDb()
const applied = await db.appliedMigrations()
console.log(`✔ migrações aplicadas: ${applied.length} · motor ${db.kind} · ${Date.now() - before} ms`)
if (applied.length === 0) console.warn('aviso: nenhuma migração encontrada em src/db/migrations/')
await closeDb()
