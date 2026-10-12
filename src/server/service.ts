import { randomUUID } from 'node:crypto'

import { CARDS, DECK_IDS, getSpread, requireSpread } from '@/domain/content.ts'
import type { CardDef, DrawnCard, ShuffleAlgorithm, SpreadDef } from '@/domain/types.ts'
import { drawForSpread, hashSeed, replayDraw, type DrawResult } from '@/engine/deck.ts'
import { dailySeed, moonFor, previousFullMoons, sabbatFor, upcomingSabbat } from '@/engine/cycle.ts'
import { getDb } from '@/db/index.ts'
import {
  cardStats,
  getReading,
  getReadingByShare,
  listReadings,
  logUsage,
  recordDrawnCards,
  saveReading,
  setShareToken,
  usageTotals,
  type PersistedReading,
} from '@/server/repositories.ts'
import { HttpError } from '@/server/http.ts'

/**
 * Serviços de domínio usados pelas rotas HTTP.
 *
 * A regra estruturante: **a IA não escolhe cartas**. A distribuição é produzida pelo
 * motor físico a partir do registo do ritual (seed + algoritmo + cortes + modo) e o
 * servidor *reverifica* o resultado com `replayDraw`. Se o cliente enviar cartas que não
 * correspondem ao registo, o pedido é rejeitado — é isto que torna o histórico auditável.
 */

export interface DeckRow {
  id: string
  user_id: string | null
  name: string
  deck_kind: string
  size: number
  allow_reversed: number
  card_ids: string
  theme: string
}

/** Cartas efectivas de um baralho do utilizador (fallback: baralho canónico de 78). */
export async function resolveDeck(userId: string | null, deckId?: string | null): Promise<{ ids: string[]; allowReversed: boolean; theme: string; name: string; deckId: string | null }> {
  const fallback = { ids: [...DECK_IDS], allowReversed: true, theme: 'obsidiana', name: 'Rider-Waite completo', deckId: null }
  if (!deckId) return fallback
  const db = await getDb()
  const rows = await db.query<DeckRow>('SELECT * FROM decks WHERE id = ?', [deckId])
  const row = rows.rows[0]
  if (!row) throw new HttpError(404, 'Baralho não encontrado.', 'baralho_inexistente')
  if (row.user_id && row.user_id !== userId) throw new HttpError(403, 'Este baralho pertence a outra conta.', 'baralho_alheio')
  const ids = JSON.parse(row.card_ids) as string[]
  const known = ids.filter((id) => DECK_IDS.includes(id))
  if (known.length < 3) throw new HttpError(422, 'O baralho tem cartas insuficientes.', 'baralho_invalido')
  return { ids: known, allowReversed: row.allow_reversed === 1, theme: row.theme, name: row.name, deckId: row.id }
}

export interface ReadingInput {
  spreadId: string
  question: string
  querentNote?: string
  seed?: number
  algorithm: ShuffleAlgorithm
  cuts: number
  allowReversed: boolean
  drawMode?: 'topo' | 'fundo' | 'alternado'
  environment?: string
  deckId?: string | null
  /** Escolhas manuais do utilizador (índice no baralho já embaralhado/cortado). */
  picks?: { positionId: string; deckIndex: number }[]
  /** Ordem de retirada (animação/ritual) — o baralho consome por esta ordem. */
  positionOrder?: string[]
  /** Cartas que o cliente afirma ter recebido; o servidor reverifica e rejeita divergência. */
  clientCards?: { positionId: string; cardId: string; orientation: 'upright' | 'reversed' }[]
  /** Restringir aos arcanos maiores (opção do ritual). */
  majorsOnly?: boolean
  /** Corte escolhido pelo utilizador (índice onde o baralho foi partido). */
  cutSize?: number
  durationSeconds?: number
  /** Identificador do dispositivo (só usado quando não há conta associada). */
  deviceId?: string
}

const DAY_MS = 86400000

export interface PreparedReading {
  id: string
  createdAt: string
  seed: number
  spread: SpreadDef
  drawn: DrawnCard[]
  deckOrder: string[]
  audit: DrawResult<string>['audit']
  verified: boolean
  reading: PersistedReading
}

/** Constrói o registo de distribuição sem o gravar (serve para pré-visualização e para o teste unitário). */
export function prepareDistribution(input: {
  spread: SpreadDef
  deckIds: string[]
  seed: number
  algorithm: ShuffleAlgorithm
  cuts: number
  allowReversed: boolean
  drawMode?: 'topo' | 'fundo' | 'alternado'
  picks?: { positionId: string; deckIndex: number }[]
  positionOrder?: string[]
  majorsOnly?: boolean
  cutSize?: number
}): DrawResult<string> {
  const ids = input.majorsOnly ? input.deckIds.filter((id) => id.startsWith('major-')) : input.deckIds
  if (ids.length < input.spread.positions.length) {
    throw new HttpError(422, `O baralho tem ${ids.length} cartas e a tiragem precisa de ${input.spread.positions.length}.`, 'baralho_curto')
  }
  return drawForSpread(ids, {
    spread: input.spread,
    seed: input.seed,
    algorithm: input.algorithm,
    cuts: input.cuts,
    allowReversed: input.allowReversed,
    drawMode: input.drawMode ?? 'topo',
    manualPicks: input.picks ?? [],
    positionOrder: input.positionOrder?.length ? input.positionOrder : undefined,
    cutSize: input.cutSize,
  })
}

/**
 * Distribui, reverifica e grava uma leitura.
 *
 * A verificação usa `replayDraw` com os mesmos parâmetros: é a mesma função que o
 * ecrã de história usa para reconstruir uma leitura anos depois, logo o que fica
 * na base de dados é garantidamente reproduzível.
 */
export async function createReading(input: ReadingInput, userId: string | null, options: { isDaily?: boolean } = {}): Promise<PreparedReading> {
  const spread = getSpread(input.spreadId) ?? (await userSpreadById(userId, input.spreadId))
  if (!spread) throw new HttpError(404, 'Tiragem desconhecida.', 'tiragem_inexistente')
  if (input.cuts < 0 || input.cuts > 3) throw new HttpError(422, 'Cortes possíveis: 0 a 3.', 'cortes')
  if (input.question.length > 600) throw new HttpError(422, 'A pergunta tem de ter no máximo 600 caracteres.', 'pergunta_longa')
  const deck = await resolveDeck(userId, input.deckId)
  const allowReversed = deck.allowReversed && input.allowReversed
  const seed = input.seed ?? hashSeed(`${Date.now()}:${randomUUID()}`) >>> 0

  const result = prepareDistribution({
    spread,
    deckIds: deck.ids,
    seed,
    algorithm: input.algorithm,
    cuts: input.cuts,
    allowReversed,
    drawMode: input.drawMode,
    picks: input.picks,
    positionOrder: input.positionOrder,
    majorsOnly: input.majorsOnly,
    cutSize: input.cutSize,
  })

  const replay = replayDraw(deck.ids, { spread, seed, algorithm: input.algorithm, cuts: input.cuts, allowReversed, cutSize: input.cutSize })
  const expectedIds = result.drawn.map((d) => d.cardId).join('|')
  // Com escolhas manuais o replay automático não tem de coincidir; o que tem de coincidir
  // é a *origem*: cada carta escolhida manualmente tem de estar no índice declarado.
  let verified = input.picks?.length ? true : expectedIds === replay.drawn.map((d) => d.cardId).join('|')
  if (input.picks?.length) {
    verified = result.drawn.every((d) => result.audit.positions.find((p) => p.positionId === d.positionId)?.deckIndex === d.deckIndex)
  }
  if (input.clientCards?.length) {
    const mine = result.drawn.map(cardKey).sort()
    const theirs = input.clientCards.map(cardKey).sort()
    if (mine.join('|') !== theirs.join('|')) {
      throw new HttpError(409, 'As cartas recebidas não coincidem com o registo do ritual (seed + algoritmo + cortes).', 'distribuidor_divergente', {
        esperado: mine,
        recebido: theirs,
      })
    }
  }
  if (!verified) {
    throw new HttpError(500, 'A verificação interna da distribuição falhou; nada foi gravado.', 'verificacao_falhou')
  }

  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const reading: PersistedReading = {
    id,
    userId,
    spreadId: spread.id,
    spreadName: spread.name,
    question: input.question,
    querentNote: input.querentNote,
    deckId: deck.deckId ?? undefined,
    sessionId: userId ? null : input.deviceId ?? null,
    seed,
    algorithm: input.algorithm,
    cuts: input.cuts,
    allowReversed,
    drawMode: input.drawMode ?? 'topo',
    deckOrder: result.deckOrder,
    cards: result.drawn,
    audit: { ...result.audit, verified, deckName: deck.name, theme: deck.theme, isDaily: options.isDaily === true, baseOrder: result.baseOrder, cutSizes: result.cutSizes },
    environment: input.environment ?? 'templo',
    createdAt,
    starred: false,
    shareToken: null,
    durationSeconds: input.durationSeconds ?? null,
  }
  const db = await getDb()
  await saveReading(db, reading)
  if (userId) await recordDrawnCards(db, userId, result.drawn, { isDaily: options.isDaily })
  await logUsage(db, { userId, kind: 'leitura', section: spread.id })
  return { id, createdAt, seed, spread, drawn: result.drawn, deckOrder: result.deckOrder, audit: result.audit, verified, reading }
}

const cardKey = (card: { positionId: string; cardId: string; orientation: string }): string =>
  `${card.positionId}:${card.cardId}:${card.orientation}`

/** As tiragens criadas pelo utilizador vivem na base de dados; o catálogo não. */
export async function userSpreadById(userId: string | null, id: string): Promise<SpreadDef | null> {
  if (!userId) return null
  const db = await getDb()
  const rows = await db.query<{ definition: string }>('SELECT definition FROM spreads WHERE id = ? AND user_id = ?', [id, userId])
  const row = rows.rows[0]
  if (!row) return null
  return JSON.parse(row.definition) as SpreadDef
}

export async function listStoredReadings(userId: string | null, deviceId: string, query: { limit: number; offset: number; spreadId?: string; starred?: boolean }) {
  const db = await getDb()
  if (userId) return await listReadings(db, userId, query)
  // Visitante: as leituras ficam ligadas ao dispositivo através de `session_id`.
  const rows = await db.query<{ id: string }>('SELECT id FROM readings WHERE session_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?', [
    deviceId,
    query.limit,
    query.offset,
  ])
  const readings = await Promise.all(rows.rows.map(async (row) => (await getReading(db, row.id))!))
  return { readings: readings.filter(Boolean), total: readings.length }
}

export async function storedReading(id: string, userId: string | null, deviceId: string) {
  const db = await getDb()
  const reading = await getReading(db, id)
  if (!reading) throw new HttpError(404, 'Leitura não encontrada.', 'inexistente')
  const owns = reading.userId ? reading.userId === userId : !!deviceId && reading.sessionId === deviceId
  if (!owns) throw new HttpError(403, 'Esta leitura pertence a outra sessão.', 'propriedade')
  return { db, reading }
}

/** Publica/retira o link partilhável (apenas leitura, sem dados da conta). */
export async function toggleShare(id: string, share: boolean, userId: string | null, deviceId: string) {
  const { reading } = await storedReading(id, userId, deviceId)
  const db = await getDb()
  if (!share) {
    await setShareToken(db, id, null)
    return { shareToken: null }
  }
  const existing = reading.shareToken
  const token = existing ?? randomUUID().replace(/-/g, '').slice(0, 20)
  await setShareToken(db, id, token)
  return { shareToken: token }
}

export async function sharedReading(token: string) {
  const db = await getDb()
  const reading = await getReadingByShare(db, token)
  if (!reading) throw new HttpError(404, 'Esta partilha deixou de existir.', 'partilha_inexistente')
  return stripPersonal(reading)
}

/** O que uma partilha pública revela: a distribuição e a interpretação, nunca a conta. */
export function stripPersonal(reading: PersistedReading & { interpretation?: unknown }): Record<string, unknown> {
  const { userId: _userId, sessionId: _session, querentNote: _note, ...rest } = reading
  return rest
}

/** Cartas mais vistas + cobertura do baralho para o ecrã de estatísticas. */
export async function statistics(userId: string | null) {
  const db = await getDb()
  const rows = userId ? await cardStats(db, userId) : []
  const totals = await db.query<{ count: number; daily: number }>(
    userId
      ? 'SELECT count(*) AS count, COALESCE(SUM(in_daily),0) AS daily FROM card_statistics WHERE user_id = ?'
      : 'SELECT 0 AS count, 0 AS daily',
    userId ? [userId] : [],
  )
  const drawnByCard = new Map(rows.map((row) => [row.card_id, row]))
  const bySuit: Record<string, { drawn: number; reversed: number }> = {}
  const cards: CardDef[] = CARDS
  for (const card of cards) {
    const stat = drawnByCard.get(card.id)
    const bucket = card.arcana === 'major' ? 'maiores' : `menores-${card.suit}`
    const entry = (bySuit[bucket] ??= { drawn: 0, reversed: 0 })
    entry.drawn += stat?.times_drawn ?? 0
    entry.reversed += stat?.times_reversed ?? 0
  }
  const totalDraws = totals.rows[0]?.count ?? 0
  const seen = drawnByCard.size
  return {
    totalDraws,
    dailyDraws: totals.rows[0]?.daily ?? 0,
    coverage: { seen, size: cards.length, ratio: cards.length ? seen / cards.length : 0 },
    bySuit,
    cards: [...drawnByCard.entries()]
      .map(([cardId, row]) => ({
        cardId,
        name: cards.find((c) => c.id === cardId)?.name.pt ?? cardId,
        timesDrawn: row.times_drawn,
        timesReversed: row.times_reversed,
        reversedRatio: row.times_drawn ? row.times_reversed / row.times_drawn : 0,
        positions: JSON.parse(row.positions || '{}') as Record<string, number>,
        inDaily: row.in_daily,
        lastSeenAt: row.last_seen_at,
      }))
      .sort((a, b) => b.timesDrawn - a.timesDrawn),
  }
}

export async function usageSummary(userId: string | null) {
  const db = await getDb()
  if (!userId) return { calls: 0, tokens: 0, cost: 0, fallbacks: 0, days: 30 }
  return usageTotals(db, userId, 30)
}

/**
 * Carta do dia: derivada da data + Lua + sabbat, idêntica para todas as pessoas
 * nesse dia e reprodutível para sempre. Não depende de RNG global.
 */
export interface DailyOutcome {
  date: string
  seed: number
  spreadId: string
  drawn: { positionId: string; cardId: string; orientation: 'upright' | 'reversed' }[]
  moon: ReturnType<typeof moonFor>
  previousFullMoon: string | null
  nextSabbat: { id: string; name: string; theme: string; spreadSuggestion: string; daysUntil: number } | null
  sabbatToday: { id: string; name: string; theme: string; spreadSuggestion: string } | null
}

/**
 * Carta do dia: a data (e um sal opcional por utilizador) gera a seed; a distribuição usa
 * o mesmo motor físico de qualquer leitura, logo é reprodutível anos depois e igual para
 * toda a gente no mesmo dia quando o sal é vazio.
 */
export function dailyCard(dateIso: string, salt = '', spreadId = 'card-of-the-day'): DailyOutcome {
  const seed = dailySeed(dateIso, salt)
  const spread = getSpread(spreadId) ?? requireSpread('card-of-the-day')
  const result = prepareDistribution({ spread, deckIds: [...DECK_IDS], seed, algorithm: 'mistico', cuts: 1, allowReversed: true })
  const moon = moonFor(dateIso)
  const fulls = previousFullMoons(1, new Date(dateIso + 'T12:00:00Z'))
  const next = upcomingSabbat(dateIso)
  const today = sabbatFor(dateIso)
  return {
    date: dateIso,
    seed,
    spreadId: spread.id,
    drawn: result.drawn.map((d) => ({ positionId: d.positionId, cardId: d.cardId, orientation: d.orientation })),
    moon,
    previousFullMoon: fulls[0] ?? null,
    nextSabbat: next
      ? { id: next.sabbat.id, name: next.sabbat.name, theme: next.sabbat.theme, spreadSuggestion: next.sabbat.spreadSuggestion, daysUntil: next.daysUntil }
      : null,
    sabbatToday: today ? { id: today.id, name: today.name, theme: today.theme, spreadSuggestion: today.spreadSuggestion } : null,
  }
}

/** Calendário temático: uma carta por dia durante `days`, com Lua e sabbats. */
export function calendarSeries(fromIso: string, days: number, salt = '') {
  const out = []
  const start = Date.parse(fromIso + 'T00:00:00Z')
  if (!Number.isFinite(start)) throw new HttpError(422, 'Data inicial inválida.', 'data')
  for (let index = 0; index < Math.min(400, Math.max(1, days)); index += 1) {
    const iso = new Date(start + index * DAY_MS).toISOString().slice(0, 10)
    const entry = dailyCard(iso, salt)
    const first = entry.drawn[0]
    out.push({ date: iso, cardId: first?.cardId ?? null, orientation: first?.orientation ?? null, phase: entry.moon.phase, sabbat: entry.sabbatToday?.id ?? null, seed: entry.seed })
  }
  return out
}

