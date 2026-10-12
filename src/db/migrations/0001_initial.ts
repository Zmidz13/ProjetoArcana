import type { Migration } from '../types.ts'

/**
 * Esquema base do ARCANA.
 *
 * Notas de decisão:
 *  - `readings` guarda o *registo de distribuição* (seed, algoritmo, cortes, ordem) e não
 *    só o resultado: isto permite reproduzir exactamente uma leitura anos depois, e é o
 *    que prova que a IA não escolheu as cartas.
 *  - `interpretations` é separado de `readings` (1:N): a mesma tiragem pode ser lida com
 *    outra voz, outro registo ou outra profundidade sem perder a distribuição original.
 *  - `usage_events` alimenta limites de custo e o ecrã de telemetria; nada de conteúdo
 *    pessoal é copiado para ali.
 *  - Estrutura textual em JSONB/TEXT: o conteúdo editável vive na base de dados, o conteúdo
 *    canónico vive no repositório (ficheiros gerados). Assim as actualizações de conteúdo
 *    não esmagam personalizações e vice-versa.
 */

export const MIGRATION_0001: Migration[] = [
  {
    id: '0001_initial',
    up: `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT,
  preferences TEXT NOT NULL DEFAULT '{}',
  tier TEXT NOT NULL DEFAULT 'gratuito',
  ai_tokens_used INTEGER NOT NULL DEFAULT 0,
  ai_cost_used_usd REAL NOT NULL DEFAULT 0,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT
);
CREATE INDEX IF NOT EXISTS verification_token_hash_idx ON verification_tokens(token_hash);

CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  deck_kind TEXT NOT NULL DEFAULT 'riders',
  size INTEGER NOT NULL DEFAULT 78,
  allow_reversed INTEGER NOT NULL DEFAULT 1,
  card_ids TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'obsidiana',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS decks_user_idx ON decks(user_id);

CREATE TABLE IF NOT EXISTS spreads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  definition TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'utilizador',
  shared INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS spreads_user_idx ON spreads(user_id);

CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  spread_id TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  querent_note TEXT,
  deck_id TEXT,
  -- seed PRNG (uint32): BIGINT porque 4294967295 não cabe em INTEGER no Postgres
  seed BIGINT NOT NULL,
  shuffle_algorithm TEXT NOT NULL,
  cuts INTEGER NOT NULL,
  allow_reversed INTEGER NOT NULL,
  draw_mode TEXT NOT NULL DEFAULT 'topo',
  deck_order TEXT NOT NULL,
  cards TEXT NOT NULL,
  audit TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'templo',
  created_at TEXT NOT NULL,
  starred INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  share_token TEXT UNIQUE,
  duration_seconds INTEGER
);
CREATE INDEX IF NOT EXISTS readings_user_created_idx ON readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS readings_spread_idx ON readings(spread_id);
CREATE INDEX IF NOT EXISTS readings_share_idx ON readings(share_token);

CREATE TABLE IF NOT EXISTS interpretations (
  id TEXT PRIMARY KEY,
  reading_id TEXT NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  generator TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  voice TEXT NOT NULL,
  register TEXT NOT NULL,
  depth TEXT NOT NULL,
  body TEXT NOT NULL,
  context_hash TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS interpretations_reading_idx ON interpretations(reading_id);
CREATE INDEX IF NOT EXISTS interpretations_hash_idx ON interpretations(context_hash);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  reading_id TEXT NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_reading_idx ON chat_messages(reading_id, created_at);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_id TEXT REFERENCES readings(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  mood INTEGER,
  sleep_hours REAL,
  energy INTEGER,
  clarity INTEGER,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS journal_user_date_idx ON journal_entries(user_id, date);

CREATE TABLE IF NOT EXISTS card_statistics (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  times_drawn INTEGER NOT NULL DEFAULT 0,
  times_reversed INTEGER NOT NULL DEFAULT 0,
  positions TEXT NOT NULL DEFAULT '{}',
  in_daily INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT,
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  section TEXT,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  fallback INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS usage_created_idx ON usage_events(created_at);
CREATE INDEX IF NOT EXISTS usage_user_idx ON usage_events(user_id, created_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_overrides (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  patch TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (entity, entity_id)
);
`,
  },
]

export default MIGRATION_0001
