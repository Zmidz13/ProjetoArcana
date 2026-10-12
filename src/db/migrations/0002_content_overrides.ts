import type { Migration } from '../types.ts'

/**
 * 0002 — índices de consulta e tabelas de suporte às páginas de estatística,
 * calendário e exportação. Nada aqui altera dados existentes.
 */
export const MIGRATION_0002: Migration[] = [
  {
    id: '0002_query_support',
    up: `
CREATE INDEX IF NOT EXISTS readings_created_idx ON readings(created_at);
CREATE INDEX IF NOT EXISTS journal_date_idx ON journal_entries(date);
CREATE INDEX IF NOT EXISTS card_stats_user_idx ON card_statistics(user_id);
-- Sem view: as funções JSON differem entre SQLite e Postgres, e as migrações têm de
-- correr nos dois. As projecções de resumo vivem em src/db/repositories.ts.
`,
  },
]

export default MIGRATION_0002
