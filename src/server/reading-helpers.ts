import { continueReading, getRuntime, interpretReading, type ChatResult, type InterpretResult } from '@/ai/index.ts'
import type { SectionKind } from '@/ai/schema.ts'
import { getDb, update } from '@/db/index.ts'
import type { DatabaseClient } from '@/db/types.ts'
import { CARDS, getCard, getSpread } from '@/domain/content.ts'
import type { Depth, Interpretation, Register, VoiceKey } from '@/domain/interpretation.ts'
import type { DrawnCard, SpreadDef } from '@/domain/types.ts'
import { attachInterpretation, listReadings, type PersistedReading, type PublicUser } from '@/server/repositories.ts'
import { userSpreadById } from '@/server/service.ts'
import { HttpError } from '@/server/http.ts'

/**
 * Ponte entre o registo guardado de uma leitura e o orquestrador de IA.
 *
 * Dois modos, um único contrato de saída:
 *  - `local`  → motor simbólico + narrativo (determinístico, sem rede, sempre disponível);
 *  - `hibrido` → o mesmo esqueleto, secção a secção, reescrito pelo modelo quando existe
 *    provedor configurado e orçamento; cada secção que falhe validação fica local.
 *
 * Ambos escrevem em `interpretations`, por isso o histórico mostra sempre *como* foi lido.
 */

export type GenerationMode = 'local' | 'hibrido'

export interface GenerateOptions {
  voice: VoiceKey
  register: Register
  depth: Depth
  mode: GenerationMode
  /** Só gera estas secções (leitura rápida: abertura + síntese + fecho). */
  onlySections?: SectionKind[]
  includeHistory?: boolean
  querentContext?: string
  querentName?: string
  limitKey?: string
  signal?: AbortSignal
  onSection?: NonNullable<Parameters<typeof interpretReading>[0]['onSection']>
  persist?: boolean
  /** Questão a usar em vez da guardada (permite reler a mesma tiragem com outra pergunta). */
  question?: string
}

export async function spreadFor(reading: Pick<PersistedReading, 'spreadId'>, userId: string | null): Promise<SpreadDef> {
  const spread = getSpread(reading.spreadId) ?? (await userSpreadById(userId, reading.spreadId))
  if (!spread) throw new HttpError(404, 'A tiragem desta leitura já não existe no catálogo.', 'tiragem_inexistente')
  return spread
}

/** As últimas leituras do mesmo pedido, para a abertura continuar um fio (nunca o corpo). */
export async function readingHistory(db: DatabaseClient, userId: string | null, deviceId: string | null, excludeId?: string, limit = 5) {
  if (!userId && !deviceId) return []
  let entries: { id: string; question: string; createdAt: string; opening?: string }[] = []
  if (userId) {
    const page = await listReadings(db, userId, { limit: limit + 1 })
    entries = page.readings
      .filter((row) => row.id !== excludeId)
      .map((row) => ({ id: row.id, question: row.question, createdAt: row.createdAt, opening: row.interpretation?.opening[0] }))
  } else if (deviceId) {
    const rows = await db.query<{ id: string; created_at: string; question: string }>(
      'SELECT id, created_at, question FROM readings WHERE session_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?',
      [deviceId, limit + 1],
    )
    entries = rows.rows.filter((row) => row.id !== excludeId).map((row) => ({ id: row.id, question: row.question, createdAt: row.created_at }))
  }
  const out: { date: string; question: string; summary: string }[] = []
  for (const entry of entries.slice(0, limit)) {
    let summary = entry.opening
    if (!summary) {
      const interp = await db.query<{ body: string }>('SELECT body FROM interpretations WHERE reading_id = ? ORDER BY created_at DESC LIMIT 1', [entry.id])
      const body = interp.rows[0]?.body
      if (body) {
        const parsed = JSON.parse(body) as Interpretation
        summary = parsed.opening[0]
      }
    }
    if (!summary) continue
    out.push({ date: entry.createdAt.slice(0, 10), question: entry.question, summary })
  }
  return out
}

/** Gera (e opcionalmente grava) a interpretação de uma leitura já distribuída. */
export async function generateInterpretation(reading: PersistedReading, userId: string | null, options: GenerateOptions): Promise<InterpretResult> {
  const db = await getDb()
  if (!reading.cards.length) throw new HttpError(409, 'Esta leitura não tem cartas registadas.', 'sem_cartas')
  const spread = await spreadFor(reading, userId)
  const drawn: DrawnCard[] = reading.cards
  const history = options.includeHistory === false ? [] : await readingHistory(db, userId, reading.sessionId ?? null, reading.id)
  const rt = getRuntime()
  const providerless = rt.provider === null
  const result = await interpretReading(
    {
      spread,
      drawn,
      cards: CARDS,
      question: options.question ?? reading.question,
      depth: options.depth,
      register: options.register,
      voice: options.voice,
      forceLocal: options.mode === 'local' || providerless,
      ...(history.length ? { history } : {}),
      ...(options.querentName || options.querentContext
        ? { querent: { ...(options.querentName ? { name: options.querentName } : {}), ...(options.querentContext ? { context: options.querentContext } : {}) } }
        : {}),
      ...(options.limitKey ? { limitKey: options.limitKey } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.onlySections ? { onlySections: options.onlySections } : {}),
      ...(options.onSection ? { onSection: options.onSection } : {}),
    },
    rt,
  )
  if (options.persist !== false) await attachInterpretation(db, reading.id, result.interpretation)
  return result
}

/** Conversa depois da leitura: o modelo só recebe as cartas e o texto já lidos. */
export async function continueStoredChat(
  reading: PersistedReading & { interpretation?: Interpretation },
  userId: string | null,
  input: { message: string; history: { role: 'user' | 'assistant'; content: string }[]; voice: VoiceKey; focus: string[] },
): Promise<{ result: ChatResult }> {
  if (!reading.interpretation) throw new HttpError(409, 'Ainda não há interpretação para conversar sobre esta leitura.', 'sem_interpretacao')
  const spread = await spreadFor(reading, userId)
  const result = await continueReading({
    spread,
    drawn: reading.cards,
    cards: CARDS,
    question: reading.question,
    reading: reading.interpretation,
    messages: input.history,
    voice: input.voice,
    prompt: input.message,
    limitKey: userId ? `usr:${userId}` : 'anon',
  })
  return { result }
}

export async function setNote(db: DatabaseClient, readingId: string, note: string | null): Promise<void> {
  await update(db, 'readings', { querent_note: note }, { id: readingId })
}

export async function setQuestion(db: DatabaseClient, readingId: string, question: string): Promise<void> {
  await update(db, 'readings', { question }, { id: readingId })
}

/** Cartas da leitura já resolvidas contra o catálogo (para as páginas não repetirem o lookup). */
export function hydrate(reading: PersistedReading) {
  return reading.cards.map((card, index) => ({
    ...card,
    index,
    card: getCard(card.cardId),
  }))
}

export function publicUserOr(user: PublicUser | null): PublicUser | null {
  return user
}
