import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SqliteAdapter } from '@/db/sqlite.ts'
import { migrate, MIGRATIONS, splitStatements, dbConfigFromEnv } from '@/db/index.ts'
import { rewritePlaceholders } from '@/db/postgres.ts'

const TABLES = [
  'users',
  'sessions',
  'verification_tokens',
  'decks',
  'spreads',
  'readings',
  'interpretations',
  'chat_messages',
  'journal_entries',
  'card_statistics',
  'usage_events',
  'settings',
  'content_overrides',
]

let dir: string

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'arcana-db-'))
})

afterAll(() => {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
})

describe('migrações', () => {
  it('correm por ordem e ficam registadas', async () => {
    const db = SqliteAdapter.open({ file: join(dir, 'm1.db') })
    const report = await migrate(db)
    expect(report.applied).toEqual(MIGRATIONS.map((m) => m.id).sort())
    expect(report.alreadyPresent).toEqual([])
    const again = await migrate(db)
    expect(again.applied).toEqual([])
    expect(again.alreadyPresent.length).toBe(MIGRATIONS.length)
    await db.close()
  })

  it('criam todas as tabelas esperadas', async () => {
    const db = SqliteAdapter.open({ file: join(dir, 'm2.db') })
    await migrate(db)
    const rows = await db.query<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table'`)
    const names = rows.rows.map((r) => r.name)
    for (const table of TABLES) expect(names).toContain(table)
    expect(names).toContain('schema_migrations')
    await db.close()
  })

  it('splitStatements separa comandos sem partir literais', () => {
    const sql = `CREATE TABLE a (x TEXT);
INSERT INTO a (x) VALUES ('um; dois');
-- comentário
CREATE INDEX i ON a(x);`
    const parts = splitStatements(sql)
    expect(parts.length).toBe(3)
    expect(parts[1]).toContain("'um; dois'")
  })

  it('falha a meio da migração não deixa migração registada nem tabelas órfãs', async () => {
    const db = SqliteAdapter.open({ file: join(dir, 'm3.db') })
    await db.query('CREATE TABLE schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)')
    await expect(
      db.transaction(async (tx) => {
        await tx.query('CREATE TABLE meia (id TEXT)')
        await tx.recordMigration('0090_partial')
        throw new Error('falha simulada')
      }),
    ).rejects.toThrow(/falha simulada/)
    const table = await db.query<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name='meia'`)
    expect(table.rows).toEqual([])
    expect(await db.appliedMigrations()).toEqual([])
    await db.close()
  })
})

describe('adaptador SQLite', () => {
  it('persiste leitura, interpretação e histórico', async () => {
    const db = SqliteAdapter.open({ file: join(dir, 'crud.db') })
    await migrate(db)
    const now = new Date().toISOString()
    await db.query(
      `INSERT INTO users (id, handle, display_name, password_hash, created_at, preferences)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['u1', 'bruxa', 'Bruxa', 'x$scrypt$1', now, '{}'],
    )
    await db.query(
      `INSERT INTO readings (id, user_id, spread_id, spread_name, question, seed, shuffle_algorithm, cuts, allow_reversed, draw_mode, deck_order, cards, audit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['r1', 'u1', 'past-present-future', 'Passado, Presente e Futuro', 'devo mudar?', 12345, 'tradicional', 3, 1, 'topo', '[]', '[{"positionId":"a","cardId":"major-00-fool","orientation":"upright"}]', '{}', now],
    )
    await db.query(
      `INSERT INTO interpretations (id, reading_id, generator, voice, register, depth, body, context_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['i1', 'r1', 'local', 'sabia', 'pratica', 'normal', '{"closing":"ok"}', 'hash1', now],
    )
    const reading = await db.query<Record<string, unknown>>(`SELECT r.id, r.question, u.handle, (SELECT count(*) FROM interpretations i WHERE i.reading_id = r.id) AS interp_count FROM readings r JOIN users u ON u.id = r.user_id WHERE r.id = ?`, ['r1'])
    expect(reading.rows[0]).toMatchObject({ id: 'r1', question: 'devo mudar?', handle: 'bruxa', interp_count: 1 })

    // cascade: apagar o utilizador leva as leituras
    const changes = await db.query('DELETE FROM users WHERE id = ?', ['u1'])
    expect(changes.changes).toBe(1)
    const orphans = await db.query<{ count: number }>('SELECT count(*) AS count FROM readings')
    expect(orphans.rows[0]!.count).toBe(0)
    await db.close()
  })

  it('transacção faz rollback completo', async () => {
    const db = SqliteAdapter.open({ file: join(dir, 'tx.db') })
    await migrate(db)
    const now = new Date().toISOString()
    await expect(
      db.transaction(async (tx) => {
        await tx.query(`INSERT INTO users (id, handle, password_hash, created_at) VALUES (?, ?, ?, ?)`, ['u-tx', 'tx-um', 'h', now])
        await tx.query('INSERT INTO users (id, handle, password_hash, created_at) VALUES (?, ?, ?, ?)', ['u-tx-2', 'tx-dois', 'h', now])
        throw new Error('abortar')
      }),
    ).rejects.toThrow(/abortar/)
    const rows = await db.query<{ count: number }>('SELECT count(*) AS count FROM users')
    expect(rows.rows[0]!.count).toBe(0)
    await db.close()
  })

  it('sobrevive a releitura do ficheiro (persistência real)', async () => {
    const file = join(dir, 'persist.db')
    const db = SqliteAdapter.open({ file })
    await migrate(db)
    await db.query('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)', ['tema', '"obsidiana"', new Date().toISOString()])
    await db.close()

    const reopened = SqliteAdapter.open({ file })
    const rows = await reopened.query<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['tema'])
    expect(rows.rows[0]!.value).toBe('"obsidiana"')
    await reopened.close()
  })
})

describe('paridade de dialecto', () => {
  it('rewritePlaceholders converte ? em $n ignorando literais', () => {
    expect(rewritePlaceholders('SELECT * FROM a WHERE x = ? AND y = ?')).toBe('SELECT * FROM a WHERE x = $1 AND y = $2')
    expect(rewritePlaceholders("INSERT INTO a (t) VALUES ('?') , (?)")).toBe("INSERT INTO a (t) VALUES ('?') , ($1)")
  })

  it('dbConfigFromEnv escolhe postgres quando existe DATABASE_URL', () => {
    const sqlite = dbConfigFromEnv({ NODE_ENV: 'test' })
    expect(sqlite.driver).toBe('sqlite')
    const pg = dbConfigFromEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://user@localhost:5432/arcana' })
    expect(pg.driver).toBe('postgres')
    expect(pg.connectionString).toContain('arcana')
  })
})
