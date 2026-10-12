import { describe, expect, it } from 'vitest'

import { dbConfigFromEnv } from '@/db/index.ts'
import { rewritePlaceholders } from '@/db/postgres.ts'

describe('configuração da base por ambiente', () => {
  it('sem DATABASE_URL usa SQLite no diretório de dados', () => {
    const config = dbConfigFromEnv({ ARCANA_DATA_DIR: '/tmp/arcana-x' })
    expect(config.driver).toBe('sqlite')
    expect(config.file).toBe('/tmp/arcana-x/arcana.db')
  })

  it('com DATABASE_URL passa a Postgres', () => {
    const config = dbConfigFromEnv({ DATABASE_URL: 'postgres://u:p@h:5432/db' })
    expect(config.driver).toBe('postgres')
    expect(config.connectionString).toBe('postgres://u:p@h:5432/db')
  })

  it('em serverless o pool é 1 por instância, e é ajustável', () => {
    expect(dbConfigFromEnv({ VERCEL: '1', DATABASE_URL: 'postgres://h/db' }).poolMax).toBe(1)
    expect(dbConfigFromEnv({ AWS_LAMBDA_FUNCTION_NAME: 'fn', DATABASE_URL: 'postgres://h/db' }).poolMax).toBe(1)
    expect(dbConfigFromEnv({ VERCEL: '1', ARCANA_PG_POOL_MAX: '4', DATABASE_URL: 'postgres://h/db' }).poolMax).toBe(4)
    expect(dbConfigFromEnv({ DATABASE_URL: 'postgres://h/db' }).poolMax).toBe(10)
  })

  it('valores absurdos de pool não rebentam com o arranque', () => {
    for (const value of ['0', '-3', 'abc', 'Infinity']) {
      expect(dbConfigFromEnv({ ARCANA_PG_POOL_MAX: value }).poolMax).toBeGreaterThanOrEqual(1)
    }
  })

  it('ssl pode ser ligado por variável (hosted com certificado autosassinado)', () => {
    expect(dbConfigFromEnv({ ARCANA_PG_SSL: '1' }).ssl).toBe(true)
    expect(dbConfigFromEnv({ PGSSLMODE: 'require' }).ssl).toBe(true)
    expect(dbConfigFromEnv({}).ssl).toBe(false)
  })

  it('o condutor explícito ganha à mera presença de DATABASE_URL', () => {
    const config = dbConfigFromEnv({ ARCANA_DB_DRIVER: 'sqlite', DATABASE_URL: 'postgres://h/db' })
    expect(config.driver).toBe('sqlite')
  })

  it('rewritePlaceholders não toca em pontos de interrogação dentro de literais', () => {
    expect(rewritePlaceholders('SELECT * FROM t WHERE a = ? AND b = ?')).toBe('SELECT * FROM t WHERE a = $1 AND b = $2')
    expect(rewritePlaceholders("SELECT '?' AS q, a = ?")).toBe("SELECT '?' AS q, a = $1")
    expect(rewritePlaceholders('SELECT "a?b" FROM t WHERE c = ?')).toBe('SELECT "a?b" FROM t WHERE c = $1')
  })
})
