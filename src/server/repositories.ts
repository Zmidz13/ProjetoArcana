import { randomUUID, createHmac, timingSafeEqual, randomBytes, scryptSync, createHash } from 'node:crypto'

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32)
}
import type { DatabaseClient, SqlValue } from '../db/types.ts'
import { json, many, one, parseJsonColumn, update } from '../db/index.ts'
import type { DrawnCard, ShuffleAlgorithm } from '../domain/types.ts'
import type { Interpretation } from '../domain/interpretation.ts'

/**
 * Repositório: todo o SQL do produto vive aqui (as rotas de API não escrevem SQL).
 * Cada função devolve objectos do domínio já reidratados, para que o resto da aplicação
 * nunca dependa da forma das colunas.
 */

/* ─────────────────────────── palavras-passe e tokens ─────────────────────────── */

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 32 } as const

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, SCRYPT_PARAMS.keylen, { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p })
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, N, r, p, salt, hex] = parts
  const derived = scryptSync(password, salt!, Buffer.from(hex!, 'hex').length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  })
  const expected = Buffer.from(hex!, 'hex')
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

export function tokenHash(token: string, pepper: string): string {
  return createHmac('sha256', pepper).update(token).digest('hex')
}

export function newToken(): string {
  return randomBytes(32).toString('base64url')
}

/* ─────────────────────────── utilizadores e sessões ─────────────────────────── */

export interface UserRow {
  id: string
  handle: string
  display_name: string | null
  email: string | null
  password_hash: string
  created_at: string
  last_seen_at: string | null
  preferences: string
  tier: string
  ai_tokens_used: number
  ai_cost_used_usd: number
}

export interface PublicUser {
  id: string
  handle: string
  displayName: string | null
  email: string | null
  createdAt: string
  tier: string
  preferences: Record<string, unknown>
  ai: { tokensUsed: number; costUsd: number }
}

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    email: row.email,
    createdAt: row.created_at,
    tier: row.tier,
    preferences: parseJsonColumn(row.preferences, {}),
    ai: { tokensUsed: row.ai_tokens_used, costUsd: row.ai_cost_used_usd },
  }
}

export async function createUser(db: DatabaseClient, input: { handle: string; password: string; email?: string; displayName?: string }): Promise<PublicUser> {
  const now = new Date().toISOString()
  await db.query(
    `INSERT INTO users (id, handle, display_name, email, password_hash, created_at, last_seen_at, preferences, tier)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), input.handle, input.displayName ?? input.handle, input.email ?? null, hashPassword(input.password), now, now, json({}), 'gratuito'],
  )
  const row = await one<UserRow>(db, 'SELECT * FROM users WHERE handle = ?', [input.handle])
  if (!row) throw new Error('utilizador não ficou registado')
  return toPublicUser(row)
}

export async function findUserByHandle(db: DatabaseClient, handle: string): Promise<UserRow | null> {
  return one<UserRow>(db, 'SELECT * FROM users WHERE handle = ? AND deleted_at IS NULL', [handle])
}

export async function touchUser(db: DatabaseClient, userId: string): Promise<void> {
  await update(db, 'users', { last_seen_at: new Date().toISOString() }, { id: userId })
}

export async function savePreferences(db: DatabaseClient, userId: string, preferences: Record<string, unknown>): Promise<void> {
  await update(db, 'users', { preferences: json(preferences) }, { id: userId })
}

export const SESSION_COOKIE = 'arcana_session'

/**
 * A sessão é um token aleatório de 32 bytes. O que fica na base de dados é apenas o
 * HMAC desse token (com o segredo do servidor): uma fuga da base de dados não entrega
 * sessões válidas, e a cookie nunca é armazenável diretamente.
 */
export async function createSession(
  db: DatabaseClient,
  userId: string,
  ttlDays: number,
  meta: { userAgent?: string; ipHash?: string; pepper: string },
): Promise<{ token: string; storedKey: string; expiresAt: string }> {
  const token = newToken()
  const storedKey = tokenHash(token, meta.pepper)
  const expiresAt = new Date(Date.now() + ttlDays * 86400000).toISOString()
  await db.query('INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent, ip_hash) VALUES (?, ?, ?, ?, ?, ?)', [
    storedKey,
    userId,
    new Date().toISOString(),
    expiresAt,
    meta.userAgent ?? null,
    meta.ipHash ?? null,
  ])
  return { token, storedKey, expiresAt }
}

export async function sessionUser(db: DatabaseClient, sessionToken: string, pepper: string): Promise<PublicUser | null> {
  const hash = tokenHash(sessionToken, pepper)
  const row = await one<{ expires_at: string; revoked_at: string | null; user_id: string }>(
    db,
    'SELECT s.expires_at, s.revoked_at, s.user_id FROM sessions s WHERE s.id = ?',
    [hash],
  )
  if (!row || row.revoked_at || new Date(row.expires_at).getTime() < Date.now()) return null
  const user = await one<UserRow>(db, 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [row.user_id])
  return user ? toPublicUser(user) : null
}

export async function revokeSession(db: DatabaseClient, sessionToken: string, pepper: string): Promise<void> {
  await update(db, 'sessions', { revoked_at: new Date().toISOString() }, { id: tokenHash(sessionToken, pepper) })
}

export async function purgeExpiredSessions(db: DatabaseClient): Promise<number> {
  const res = await db.query('DELETE FROM sessions WHERE expires_at < ? OR revoked_at IS NOT NULL', [new Date().toISOString()])
  return res.changes
}

/* ─────────────────────────── leituras ─────────────────────────── */

export interface PersistedReading {
  id: string
  userId: string | null
  /** Dispositivo de um visitante sem conta: permite-lhe recuperar as suas próprias leituras. */
  sessionId?: string | null
  spreadId: string
  spreadName: string
  question: string
  querentNote?: string
  deckId?: string
  seed: number
  algorithm: ShuffleAlgorithm
  cuts: number
  allowReversed: boolean
  drawMode: string
  deckOrder: string[]
  cards: DrawnCard[]
  audit: Record<string, unknown>
  environment: string
  createdAt: string
  starred: boolean
  shareToken?: string | null
  durationSeconds?: number | null
}

export async function saveReading(db: DatabaseClient, reading: PersistedReading): Promise<void> {
  await db.query(
    `INSERT INTO readings (id, user_id, session_id, spread_id, spread_name, question, querent_note, deck_id, seed, shuffle_algorithm, cuts,
      allow_reversed, draw_mode, deck_order, cards, audit, environment, created_at, starred, share_token, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reading.id,
      reading.userId,
      reading.sessionId ?? null,
      reading.spreadId,
      reading.spreadName,
      reading.question,
      reading.querentNote ?? null,
      reading.deckId ?? null,
      reading.seed,
      reading.algorithm,
      reading.cuts,
      reading.allowReversed ? 1 : 0,
      reading.drawMode,
      json(reading.deckOrder),
      json(reading.cards),
      json(reading.audit),
      reading.environment,
      reading.createdAt,
      reading.starred ? 1 : 0,
      reading.shareToken ?? null,
      reading.durationSeconds ?? null,
    ] as SqlValue[],
  )
}

export async function attachInterpretation(db: DatabaseClient, readingId: string, interpretation: Interpretation): Promise<string> {
  const id = randomUUID()
  await db.query(
    `INSERT INTO interpretations (id, reading_id, generator, provider, model, voice, register, depth, body, context_hash,
      tokens_in, tokens_out, cost_usd, latency_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      readingId,
      interpretation.meta.generator,
      interpretation.meta.provider ?? null,
      interpretation.meta.model ?? null,
      interpretation.meta.voice,
      interpretation.meta.register,
      interpretation.meta.depth,
      json(interpretation),
      interpretation.meta.contextHash,
      interpretation.meta.tokensIn ?? 0,
      interpretation.meta.tokensOut ?? 0,
      interpretation.meta.costUsd ?? 0,
      interpretation.meta.latencyMs ?? 0,
      new Date().toISOString(),
    ] as SqlValue[],
  )
  return id
}

interface ReadingRow {
  id: string
  user_id: string | null
  session_id: string | null
  deck_id: string | null
  spread_id: string
  spread_name: string
  question: string
  querent_note: string | null
  seed: number
  shuffle_algorithm: string
  cuts: number
  allow_reversed: number
  draw_mode: string
  deck_order: string
  cards: string
  audit: string
  environment: string
  created_at: string
  starred: number
  share_token: string | null
  duration_seconds: number | null
}

function toReading(row: ReadingRow): PersistedReading & { interpretation?: Interpretation } {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id ?? null,
    deckId: row.deck_id ?? undefined,
    spreadId: row.spread_id,
    spreadName: row.spread_name,
    question: row.question,
    querentNote: row.querent_note ?? undefined,
    seed: Number(row.seed),
    algorithm: row.shuffle_algorithm as ShuffleAlgorithm,
    cuts: row.cuts,
    allowReversed: row.allow_reversed === 1,
    drawMode: row.draw_mode,
    deckOrder: parseJsonColumn<string[]>(row.deck_order, []),
    cards: parseJsonColumn<DrawnCard[]>(row.cards, []),
    audit: parseJsonColumn<Record<string, unknown>>(row.audit, {}),
    environment: row.environment,
    createdAt: row.created_at,
    starred: row.starred === 1,
    shareToken: row.share_token,
    durationSeconds: row.duration_seconds,
  }
}

export async function getReading(db: DatabaseClient, id: string): Promise<(PersistedReading & { interpretation?: Interpretation }) | null> {
  const row = await one<ReadingRow>(db, 'SELECT * FROM readings WHERE id = ? AND deleted_at IS NULL', [id])
  if (!row) return null
  const reading = toReading(row)
  const interp = await one<{ body: string }>(db, 'SELECT body FROM interpretations WHERE reading_id = ? ORDER BY created_at DESC LIMIT 1', [id])
  if (interp) reading.interpretation = parseJsonColumn<Interpretation>(interp.body, undefined as unknown as Interpretation)
  return reading
}

export async function getReadingByShare(db: DatabaseClient, token: string): Promise<PersistedReading | null> {
  const row = await one<ReadingRow>(db, 'SELECT * FROM readings WHERE share_token = ? AND deleted_at IS NULL', [token])
  return row ? toReading(row) : null
}

export async function listReadings(db: DatabaseClient, userId: string, options: { limit?: number; offset?: number; spreadId?: string; starred?: boolean } = {}) {
  const clauses: string[] = ['user_id = ?', 'deleted_at IS NULL']
  const params: SqlValue[] = [userId]
  if (options.spreadId) {
    clauses.push('spread_id = ?')
    params.push(options.spreadId)
  }
  if (options.starred) clauses.push('starred = 1')
  const rows = await many<ReadingRow>(
    db,
    `SELECT * FROM readings WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, options.limit ?? 50, options.offset ?? 0],
  )
  const total = await one<{ count: number }>(db, `SELECT count(*) AS count FROM readings WHERE ${clauses.join(' AND ')}`, params)
  return { readings: rows.map(toReading), total: total?.count ?? rows.length }
}

export async function setStarred(db: DatabaseClient, id: string, starred: boolean): Promise<void> {
  await update(db, 'readings', { starred: starred ? 1 : 0 }, { id })
}

export async function softDeleteReading(db: DatabaseClient, id: string): Promise<void> {
  await update(db, 'readings', { deleted_at: new Date().toISOString() }, { id })
}

export async function setShareToken(db: DatabaseClient, id: string, token: string | null): Promise<void> {
  await update(db, 'readings', { share_token: token }, { id })
}

/* ─────────────────────────── conversa ─────────────────────────── */

export async function appendChatMessage(
  db: DatabaseClient,
  input: { readingId: string; role: 'user' | 'assistant' | 'system'; content: string; tokensIn?: number; tokensOut?: number },
): Promise<void> {
  await db.query('INSERT INTO chat_messages (id, reading_id, role, content, created_at, tokens_in, tokens_out) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    randomUUID(),
    input.readingId,
    input.role,
    input.content,
    new Date().toISOString(),
    input.tokensIn ?? 0,
    input.tokensOut ?? 0,
  ] as SqlValue[])
}

export async function listChatMessages(db: DatabaseClient, readingId: string) {
  return many<{ role: 'user' | 'assistant' | 'system'; content: string; created_at: string }>(
    db,
    'SELECT role, content, created_at FROM chat_messages WHERE reading_id = ? ORDER BY created_at ASC',
    [readingId],
  )
}

/* ─────────────────────────── diário, estatísticas, tiragem do dia ─────────────────────────── */

export async function upsertJournal(
  db: DatabaseClient,
  input: { userId: string; date: string; readingId?: string; mood?: number; sleepHours?: number; energy?: number; clarity?: number; note?: string },
): Promise<void> {
  const existing = await one<{ id: string }>(db, 'SELECT id FROM journal_entries WHERE user_id = ? AND date = ?', [input.userId, input.date])
  const now = new Date().toISOString()
  if (existing) {
    await update(
      db,
      'journal_entries',
      { reading_id: input.readingId ?? null, mood: input.mood ?? null, sleep_hours: input.sleepHours ?? null, energy: input.energy ?? null, clarity: input.clarity ?? null, note: input.note ?? null, updated_at: now },
      { id: existing.id },
    )
    return
  }
  await db.query(
    `INSERT INTO journal_entries (id, user_id, reading_id, date, mood, sleep_hours, energy, clarity, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), input.userId, input.readingId ?? null, input.date, input.mood ?? null, input.sleepHours ?? null, input.energy ?? null, input.clarity ?? null, input.note ?? null, now, now] as SqlValue[],
  )
}

export async function listJournal(db: DatabaseClient, userId: string, from: string, to: string) {
  return many(db, 'SELECT * FROM journal_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC', [userId, from, to])
}

export async function recordDrawnCards(db: DatabaseClient, userId: string, cards: DrawnCard[], options: { isDaily?: boolean } = {}): Promise<void> {
  const now = new Date().toISOString()
  for (const card of cards) {
    const existing = await one<{ times_drawn: number; times_reversed: number; positions: string }>(
      db,
      'SELECT times_drawn, times_reversed, positions FROM card_statistics WHERE user_id = ? AND card_id = ?',
      [userId, card.cardId],
    )
    const positions = parseJsonColumn<Record<string, number>>(existing?.positions ?? '{}', {})
    positions[card.positionId] = (positions[card.positionId] ?? 0) + 1
    await db.query(
      `INSERT INTO card_statistics (user_id, card_id, times_drawn, times_reversed, positions, in_daily, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, card_id) DO UPDATE SET
         times_drawn = times_drawn + 1,
         times_reversed = times_reversed + excluded.times_reversed,
         positions = excluded.positions,
         in_daily = in_daily + excluded.in_daily,
         last_seen_at = excluded.last_seen_at`,
      [
        userId,
        card.cardId,
        1,
        card.orientation === 'reversed' ? 1 : 0,
        json(positions),
        options.isDaily ? 1 : 0,
        now,
      ] as SqlValue[],
    )
  }
}

export async function cardStats(db: DatabaseClient, userId: string) {
  return many<{ card_id: string; times_drawn: number; times_reversed: number; positions: string; in_daily: number; last_seen_at: string | null }>(
    db,
    'SELECT * FROM card_statistics WHERE user_id = ? ORDER BY times_drawn DESC',
    [userId],
  )
}

export async function logUsage(
  db: DatabaseClient,
  event: { userId?: string | null; kind: string; section?: string; tokensIn?: number; tokensOut?: number; costUsd?: number; latencyMs?: number; fallback?: boolean },
): Promise<void> {
  await db.query(
    `INSERT INTO usage_events (id, user_id, kind, section, tokens_in, tokens_out, cost_usd, latency_ms, fallback, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      event.userId ?? null,
      event.kind,
      event.section ?? null,
      event.tokensIn ?? 0,
      event.tokensOut ?? 0,
      event.costUsd ?? 0,
      event.latencyMs ?? 0,
      event.fallback ? 1 : 0,
      new Date().toISOString(),
    ] as SqlValue[],
  )
  if (event.userId) {
    await db.query('UPDATE users SET ai_tokens_used = ai_tokens_used + ?, ai_cost_used_usd = ai_cost_used_usd + ? WHERE id = ?', [
      (event.tokensIn ?? 0) + (event.tokensOut ?? 0),
      event.costUsd ?? 0,
      event.userId,
    ] as SqlValue[])
  }
}

export async function usageTotals(db: DatabaseClient, userId: string, sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString()
  const row = await one<{ calls: number; tokens: number; cost: number; fallbacks: number }>(
    db,
    `SELECT count(*) AS calls,
            COALESCE(SUM(tokens_in + tokens_out), 0) AS tokens,
            COALESCE(SUM(cost_usd), 0) AS cost,
            COALESCE(SUM(fallback), 0) AS fallbacks
       FROM usage_events WHERE user_id = ? AND created_at >= ?`,
    [userId, since],
  )
  return row ?? { calls: 0, tokens: 0, cost: 0, fallbacks: 0 }
}

/* ─────────────────────────── tiragens do utilizador ─────────────────────────── */

export async function saveUserSpread(db: DatabaseClient, input: { id?: string; userId: string; name: string; definition: unknown }): Promise<string> {
  const now = new Date().toISOString()
  const id = input.id ?? `user-${randomUUID().slice(0, 13)}`
  const existing = await one<{ id: string }>(db, 'SELECT id FROM spreads WHERE id = ?', [id])
  if (existing) {
    await update(db, 'spreads', { name: input.name, definition: json(input.definition), updated_at: now }, { id })
    return id
  }
  await db.query('INSERT INTO spreads (id, user_id, name, definition, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    id,
    input.userId,
    input.name,
    json(input.definition),
    'utilizador',
    now,
    now,
  ] as SqlValue[])
  return id
}

export async function listUserSpreads(db: DatabaseClient, userId: string) {
  const rows = await many<{ id: string; name: string; definition: string; source: string; created_at: string; updated_at: string; shared: number }>(
    db,
    'SELECT * FROM spreads WHERE user_id = ? ORDER BY updated_at DESC',
    [userId],
  )
  return rows.map((r) => ({ ...r, definition: parseJsonColumn<unknown>(r.definition, null) }))
}

export async function deleteSpread(db: DatabaseClient, id: string, userId: string): Promise<boolean> {
  const res = await db.query('DELETE FROM spreads WHERE id = ? AND user_id = ?', [id, userId])
  return res.changes > 0
}

/* ─────────────────────────── baralhos do utilizador ─────────────────────────── */

export interface DeckSummary {
  id: string
  name: string
  deckKind: string
  size: number
  allowReversed: boolean
  cardIds: string[]
  theme: string
  createdAt: string
  updatedAt: string
}

interface DeckRow {
  id: string
  user_id: string | null
  name: string
  deck_kind: string
  size: number
  allow_reversed: number
  card_ids: string
  theme: string
  created_at: string
  updated_at: string
}

function toDeck(row: DeckRow): DeckSummary {
  return {
    id: row.id,
    name: row.name,
    deckKind: row.deck_kind,
    size: row.size,
    allowReversed: row.allow_reversed === 1,
    cardIds: parseJsonColumn<string[]>(row.card_ids, []),
    theme: row.theme,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listDecks(db: DatabaseClient, userId: string): Promise<DeckSummary[]> {
  const rows = await many<DeckRow>(db, 'SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC', [userId])
  return rows.map(toDeck)
}

export async function saveDeck(
  db: DatabaseClient,
  input: { id?: string; userId: string; name: string; deckKind?: string; allowReversed: boolean; cardIds: string[]; theme?: string },
): Promise<DeckSummary> {
  const now = new Date().toISOString()
  const id = input.id ?? `deck-${randomUUID().slice(0, 13)}`
  const params = [id, input.userId, input.name, input.deckKind ?? 'riders', input.cardIds.length, input.allowReversed ? 1 : 0, json(input.cardIds), input.theme ?? 'obsidiana', now, now] as SqlValue[]
  const existing = await one<{ id: string }>(db, 'SELECT id FROM decks WHERE id = ?', [id])
  if (existing) {
    await update(db, 'decks', { name: params[2], deck_kind: params[3], size: params[4], allow_reversed: params[5], card_ids: params[6], theme: params[7], updated_at: now }, { id })
  } else {
    await db.query(
      `INSERT INTO decks (id, user_id, name, deck_kind, size, allow_reversed, card_ids, theme, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params,
    )
  }
  const row = await one<DeckRow>(db, 'SELECT * FROM decks WHERE id = ?', [id])
  if (!row) throw new Error('baralho não ficou registado')
  return toDeck(row)
}

export async function deleteDeck(db: DatabaseClient, id: string, userId: string): Promise<boolean> {
  const res = await db.query('DELETE FROM decks WHERE id = ? AND user_id = ?', [id, userId])
  return res.changes > 0
}

/* ─────────────────────────── definições globais e alegações ─────────────────────────── */

export async function getSetting<T>(db: DatabaseClient, key: string, fallback: T): Promise<T> {
  const row = await one<{ value: string }>(db, 'SELECT value FROM settings WHERE key = ?', [key])
  return row ? parseJsonColumn<T>(row.value, fallback) : fallback
}

export async function setSetting(db: DatabaseClient, key: string, value: unknown): Promise<void> {
  const now = new Date().toISOString()
  const res = await db.query('UPDATE settings SET value = ?, updated_at = ? WHERE key = ?', [json(value), now, key] as SqlValue[])
  if (res.changes === 0) await db.query('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)', [key, json(value), now] as SqlValue[])
}

/**
 * Quando alguém cria conta, as leituras feitas nesse dispositivo passam a ser suas.
 * Devolve quantas foram anexadas (é o número mostrado no ecrã de boas-vindas).
 */
export async function claimDeviceReadings(db: DatabaseClient, deviceId: string, userId: string): Promise<number> {
  const res = await db.query('UPDATE readings SET user_id = ? WHERE session_id = ? AND user_id IS NULL', [userId, deviceId] as SqlValue[])
  return res.changes
}

/** Leitura com *todas* as interpretações guardadas (a mesma tiragem lida com outras vozes). */
export async function listInterpretations(db: DatabaseClient, readingId: string) {
  return many<{ id: string; generator: string; provider: string | null; model: string | null; voice: string; register: string; depth: string; created_at: string; cost_usd: number; tokens_in: number; tokens_out: number; body: string }>(
    db,
    'SELECT id, generator, provider, model, voice, register, depth, created_at, cost_usd, tokens_in, tokens_out, body FROM interpretations WHERE reading_id = ? ORDER BY created_at ASC',
    [readingId],
  )
}

/** Contagem global para o ecrã «sobre» e para o health-check. */
export async function countRows(db: DatabaseClient, table: 'readings' | 'users' | 'spreads' | 'journal_entries'): Promise<number> {
  const row = await one<{ count: number }>(db, `SELECT count(*) AS count FROM ${table}`)
  return row?.count ?? 0
}
