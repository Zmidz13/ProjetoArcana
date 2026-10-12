import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { DatabaseClient, QueryResult, SqlValue } from './types.ts'

/**
 * Adapter SQLite assente em `node:sqlite` (built-in do Node ≥ 22.5).
 *
 * Escolha deliberada: zero dependências nativas compiladas à parte, o que faz com que
 * `npm install && npm run dev` chegue para correr o produto localmente, sem Docker nem
 * toolchain de C. As queries são as mesmas do Postgres com `?` em vez de `$n`.
 */
export interface SqliteOptions {
  file: string
  /** true para base em memória (testes). */
  memory?: boolean
  verbose?: boolean
}

function toSqliteParam(value: unknown): SqlValue | bigint {
  if (value === undefined || value === null) return null
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'bigint' || typeof value === 'number' || typeof value === 'string') return value as SqlValue
  if (value instanceof Uint8Array) return value
  return JSON.stringify(value)
}

export class SqliteAdapter implements DatabaseClient {
  readonly kind = 'sqlite' as const
  private constructor(
    private readonly db: DatabaseSync,
    private readonly inTx: boolean = false,
    private readonly log: boolean = false,
  ) {}

  static open(options: SqliteOptions): SqliteAdapter {
    if (!options.memory) mkdirSync(dirname(options.file), { recursive: true })
    const db = new DatabaseSync(options.memory ? ':memory:' : options.file)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('PRAGMA busy_timeout = 4000')
    return new SqliteAdapter(db, false, Boolean(options.verbose))
  }

  /** Cadeia de parâmetros partilhada entre instâncias de transacção. */
  private withConn<T>(fn: (db: DatabaseSync) => T): T {
    return fn(this.db)
  }

  async query<T = Record<string, unknown>>(sql: string, params: SqlValue[] = []): Promise<QueryResult<T>> {
    if (this.log) console.info('[sqlite]', sql.replace(/\s+/g, ' ').slice(0, 120), params.length)
    const bound = params.map(toSqliteParam) as never[]
    const isRead = /^\s*(select|with|pragma)/i.test(sql)
    return this.withConn((db) => {
      if (isRead) {
        const stmt = db.prepare(sql)
        const rows = stmt.all(...(bound as never[])) as T[]
        return { rows: rows ?? [], changes: 0 }
      }
      const stmt = db.prepare(sql)
      const info = stmt.run(...(bound as never[])) as unknown as { changes?: number | bigint }
      return { rows: [], changes: Number(info?.changes ?? 0) }
    })
  }

  async transaction<R>(fn: (tx: DatabaseClient) => Promise<R>): Promise<R> {
    if (this.inTx) return fn(this)
    const db = this.db
    db.exec('BEGIN IMMEDIATE')
    const tx = new SqliteAdapter(db, true, this.log)
    try {
      const result = await fn(tx)
      db.exec('COMMIT')
      return result
    } catch (error) {
      try {
        db.exec('ROLLBACK')
      } catch {
        /* rollback pode falhar se a transacção já caiu: não mascarar o erro original */
      }
      throw error
    }
  }

  async appliedMigrations(): Promise<string[]> {
    const table = await this.query<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'`)
    if (!table.rows.length) return []
    const rows = await this.query<{ id: string }>('SELECT id FROM schema_migrations ORDER BY id')
    return rows.rows.map((r) => r.id)
  }

  async recordMigration(id: string): Promise<void> {
    await this.query('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)', [id, new Date().toISOString()])
  }

  async close(): Promise<void> {
    this.db.close()
  }
}
