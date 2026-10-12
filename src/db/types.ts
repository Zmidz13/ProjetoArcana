/**
 * Contrato de persistência.
 *
 * Dois backends reais, mesma interface: `SqliteAdapter` (default, `node:sqlite`, zero
 * dependências nativas externas, ficheiro em `var/arcana.db`) e `PgAdapter` (Postgres
 * via `pg`) para instalação com servidor de base de dados. As migrações são as mesmas
 * SQL, versionadas em `src/db/migrations`, aplicadas transacionalmente e registadas
 * em `schema_migrations`.
 */

export type SqlValue = string | number | null | Uint8Array
export interface QueryResult<T = Record<string, unknown>> {
  rows: T[]
  /** number de linhas afectadas (INSERT/UPDATE/DELETE) */
  changes: number
}

export interface DatabaseClient {
  readonly kind: 'sqlite' | 'postgres'
  query<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<QueryResult<T>>
  transaction<R>(fn: (tx: DatabaseClient) => Promise<R>): Promise<R>
  /** Migrações já aplicadas (id → versão aplicada). */
  appliedMigrations(): Promise<string[]>
  recordMigration(id: string): Promise<void>
  close(): Promise<void>
}

export interface Migration {
  id: string
  /** SQL a executar dentro de uma transacção. `?` para sqlite, `$n` para postgres é tratado pelo adapter. */
  up: string
}
