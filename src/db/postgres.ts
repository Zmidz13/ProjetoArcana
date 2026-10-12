import type { DatabaseClient, QueryResult, SqlValue } from './types.ts'

/**
 * Adapter Postgres.
 *
 * Usa `pg` (dependência declarada) e converte os marcadores `?` das queries partilhadas
 * em `$1..$n`. Esta conversão é superficial e segura porque o texto SQL do repositório é
 * sempre gerado no código — nunca interpolado a partir de input do utilizador.
 */
export interface PgOptions {
  connectionString?: string
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
  maxConnections?: number
  ssl?: boolean
}

function toPgParams(params: SqlValue[]): unknown[] {
  return params.map((p) => (typeof p === 'boolean' ? p : p instanceof Uint8Array ? Buffer.from(p) : p))
}

/** `?` → `$n`, sem tocar em `?` dentro de literais de string. */
export function rewritePlaceholders(sql: string): string {
  let out = ''
  let index = 0
  let inString: string | null = null
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]!
    if (inString) {
      out += ch
      if (ch === inString) inString = null
      continue
    }
    if (ch === "'" || ch === '"') {
      inString = ch
      out += ch
      continue
    }
    if (ch === '?') {
      index++
      out += `$${index}`
      continue
    }
    out += ch
  }
  return out
}

interface PgQueryable {
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount?: number | null }>
}
interface PgPoolLike extends PgQueryable {
  connect(): Promise<PgClientLike>
  end(): Promise<void>
}
interface PgClientLike extends PgQueryable {
  release(): void
}

export class PgAdapter implements DatabaseClient {
  readonly kind = 'postgres' as const
  private constructor(
    private readonly pool: PgPoolLike,
    private readonly client?: PgClientLike,
  ) {}

  static async connect(options: PgOptions = {}): Promise<PgAdapter> {
    const pgModule = (await import('pg')) as unknown as { default?: { Pool: new (config: Record<string, unknown>) => PgPoolLike }; Pool: new (config: Record<string, unknown>) => PgPoolLike }
    const Pool = pgModule.default?.Pool ?? pgModule.Pool
    const pool = new Pool({
      connectionString: options.connectionString,
      host: options.host,
      port: options.port,
      database: options.database,
      user: options.user,
      password: options.password,
      max: options.maxConnections ?? 10,
      ssl: options.ssl ? { rejectUnauthorized: false } : undefined,
    })
    await pool.query('SELECT 1')
    return new PgAdapter(pool)
  }

  private get executor(): PgQueryable {
    return this.client ?? this.pool
  }

  async query<T = Record<string, unknown>>(sql: string, params: SqlValue[] = []): Promise<QueryResult<T>> {
    const res = await this.executor.query(rewritePlaceholders(sql), toPgParams(params))
    return { rows: (res.rows ?? []) as T[], changes: Number(res.rowCount ?? 0) }
  }

  async transaction<R>(fn: (tx: DatabaseClient) => Promise<R>): Promise<R> {
    if (this.client) return fn(this)
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const tx = new PgAdapter(this.pool, client)
      const result = await fn(tx)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined)
      throw error
    } finally {
      client.release()
    }
  }

  async appliedMigrations(): Promise<string[]> {
    const table = await this.query<{ table_name: string }>(`SELECT table_name FROM information_schema.tables WHERE table_name = 'schema_migrations'`)
    if (!table.rows.length) return []
    const rows = await this.query<{ id: string }>('SELECT id FROM schema_migrations ORDER BY id')
    return rows.rows.map((r) => r.id)
  }

  async recordMigration(id: string): Promise<void> {
    await this.query('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)', [id, new Date().toISOString()])
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
