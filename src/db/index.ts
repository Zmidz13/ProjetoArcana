import { join } from 'node:path'
import type { DatabaseClient, Migration, SqlValue } from './types.ts'
import { MIGRATION_0001 } from './migrations/0001_initial.ts'
import { MIGRATION_0002 } from './migrations/0002_content_overrides.ts'

/**
 * Ligação à base de dados e runner de migrações.
 *
 * `ARCANA_DB_DRIVER=postgres` usa a `DATABASE_URL`; caso contrário abre SQLite em
 * `ARCANA_DATA_DIR` (default `<repo>/var`). A alternativa SQLite existe para que o
 * produto corra com `npm install && npm run dev`, sem serviços externos — o esquema,
 * as migrações e as queries são as mesmas dos dois lados.
 */

export const MIGRATIONS: Migration[] = [...MIGRATION_0001, ...MIGRATION_0002]

export interface DbConfig {
  driver: 'sqlite' | 'postgres'
  file: string
  connectionString?: string
  verbose: boolean
}

export function dbConfigFromEnv(env: NodeJS.ProcessEnv = process.env): DbConfig {
  const driver = (env.ARCANA_DB_DRIVER ?? (env.DATABASE_URL ? 'postgres' : 'sqlite')) as DbConfig['driver']
  const dataDir = env.ARCANA_DATA_DIR ?? join(process.cwd(), 'var')
  return {
    driver,
    file: join(dataDir, 'arcana.db'),
    connectionString: env.DATABASE_URL,
    verbose: env.ARCANA_DB_VERBOSE === '1',
  }
}

let instance: DatabaseClient | null = null
let connecting: Promise<DatabaseClient> | null = null

export async function getDb(env: NodeJS.ProcessEnv = process.env): Promise<DatabaseClient> {
  if (instance) return instance
  if (connecting) return connecting
  connecting = (async () => {
    const config = dbConfigFromEnv(env)
    const client =
      config.driver === 'postgres'
        ? await (await import('./postgres.ts')).PgAdapter.connect({ connectionString: config.connectionString, verbose: undefined } as never)
        : (await import('./sqlite.ts')).SqliteAdapter.open({ file: config.file, verbose: config.verbose })
    await migrate(client)
    return client
  })()
  try {
    instance = await connecting
    return instance
  } finally {
    connecting = null
  }
}

/** Para testes: injeta um client (normalmente SQLite em memória) e corre as migrações. */
export async function setDbForTests(client: DatabaseClient): Promise<void> {
  await migrate(client)
  instance = client
}

export async function closeDb(): Promise<void> {
  if (instance) await instance.close()
  instance = null
}

export interface MigrationReport {
  applied: string[]
  alreadyPresent: string[]
}

/** Aplica migrações por ordem de id, cada uma dentro da sua transacção. */
export async function migrate(db: DatabaseClient): Promise<MigrationReport> {
  await db.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)',
  )
  const applied = new Set(await db.appliedMigrations())
  const report: MigrationReport = { applied: [], alreadyPresent: [] }
  const ordered = MIGRATIONS.slice().sort((a, b) => (a.id < b.id ? -1 : 1))
  for (const migration of ordered) {
    if (applied.has(migration.id)) {
      report.alreadyPresent.push(migration.id)
      continue
    }
    await db.transaction(async (tx) => {
      for (const statement of splitStatements(migration.up)) await tx.query(statement)
      await tx.recordMigration(migration.id)
    })
    report.applied.push(migration.id)
  }
  return report
}

export function splitStatements(sql: string): string[] {
  const withoutComments = sql
    .split('\n')
    .filter((line) => !/^\s*--/.test(line))
    .join('\n')
  return withoutComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}

/* ───────────────────────── helpers de repositório ───────────────────────── */

export const json = (value: unknown): string => JSON.stringify(value ?? null)
export const bool = (value: boolean | 0 | 1 | null | undefined): boolean => value === 1 || value === true

export function parseJsonColumn<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback
  if (typeof raw === 'object') return raw as T
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

export async function one<T>(db: DatabaseClient, sql: string, params: SqlValue[] = []): Promise<T | null> {
  const res = await db.query<T>(sql, params)
  return res.rows[0] ?? null
}

export async function many<T>(db: DatabaseClient, sql: string, params: SqlValue[] = []): Promise<T[]> {
  const res = await db.query<T>(sql, params)
  return res.rows
}

export async function insert(db: DatabaseClient, table: string, values: Record<string, SqlValue>): Promise<number> {
  const keys = Object.keys(values)
  const placeholders = keys.map(() => '?').join(', ')
  const res = await db.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, keys.map((k) => values[k]!))
  return res.changes
}

export async function update(
  db: DatabaseClient,
  table: string,
  values: Record<string, SqlValue>,
  where: Record<string, SqlValue>,
): Promise<number> {
  const keys = Object.keys(values)
  const whereKeys = Object.keys(where)
  const sql = `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE ${whereKeys.map((k) => `${k} = ?`).join(' AND ')}`
  const res = await db.query(sql, [...keys.map((k) => values[k]!), ...whereKeys.map((k) => where[k]!)])
  return res.changes
}

export { type DatabaseClient, type Migration, type SqlValue }
