import type { Interpretation } from '../domain/interpretation.ts'
import type { OutputSchemas, SectionKind } from './schema.ts'
import { extractJson, ProviderError, type LlmProvider, type LlmUsage } from './providers.ts'
import type { SectionRequest } from './prompts.ts'

/**
 * Validação defensiva do output do modelo + limites de uso.
 *
 * Regra do produto: o LLM é um *roteirista*, não uma fonte de verdade. Se a saída
 * não passa no esquema, a secção fica com o texto do motor local — o utilizador nunca
 * recebe texto a meio, nem um erro vermelho no meio de uma leitura.
 */

export interface ValidationIssue {
  section: SectionKind
  path: string
  message: string
}

export interface ValidatedSection<T = unknown> {
  section: SectionKind
  ok: boolean
  value?: T
  issues: ValidationIssue[]
  /** true quando foi preciso reaproveitar o texto local. */
  fellBack: boolean
}

/** Normaliza texto: remove aspas de fora, markdown, e espaços duplos; mantém o sentido. */
export function normalizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function stringArray(input: unknown, min: number, max: number): string[] | null {
  if (!Array.isArray(input)) return null
  const items = input.map(normalizeText).filter((s) => s.length >= 24)
  if (items.length < min || items.length > max) return null
  return items
}

export interface SectionSpec {
  section: SectionKind
  shape: (raw: Record<string, unknown>, schemas: OutputSchemas) => { ok: boolean; value: unknown; errors: string[] }
}

export const SECTION_SPECS: SectionSpec[] = [
  {
    section: 'opening',
    shape: (raw) => {
      const text = normalizeText(raw.text)
      const errors: string[] = []
      if (text.length < 80) errors.push('abertura demasiado curta para ser útil')
      if (text.length > 2600) errors.push('abertura acima do limite')
      return { ok: !errors.length, value: { text }, errors }
    },
  },
  {
    section: 'per-card',
    shape: (raw, schemas) => {
      const errors: string[] = []
      const items = Array.isArray(raw.items) ? raw.items : []
      const parsed = items
        .map((entry: Record<string, unknown>) => {
          const core = normalizeText(entry.core)
          const modulation = normalizeText(entry.modulation)
          const connection = normalizeText(entry.connection)
          const pos = schemas.positionId.safeParse(entry.positionId)
          const card = schemas.cardId.safeParse(entry.cardId)
          const orientation = entry.orientation === 'reversed' ? 'reversed' : 'upright'
          if (!pos.success) errors.push(`positionId inválido: ${String(entry.positionId)}`)
          if (!card.success) errors.push(`cardId fora da tiragem: ${String(entry.cardId)}`)
          if (core.length < 60) errors.push('core demasiado curto')
          if (modulation.length < 40) errors.push('modulation demasiado curta')
          if (!pos.success || !card.success) return null
          return { positionId: pos.data, cardId: card.data, orientation, core, modulation, connection: connection || undefined }
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
      if (!parsed.length) errors.push('nenhuma posição válida devolvida')
      const seen = new Set(parsed.map((p) => p.positionId))
      const missing = [...new Set(parsed.map((p) => p.positionId))].filter(Boolean)
      void missing
      if (seen.size !== parsed.length) errors.push('posições repetidas na mesma secção')
      return { ok: !errors.length && parsed.length > 0, value: { items: parsed }, errors }
    },
  },
  {
    section: 'combinations',
    shape: (raw, schemas) => {
      const errors: string[] = []
      const items = (Array.isArray(raw.items) ? raw.items : [])
        .map((entry: Record<string, unknown>) => {
          const note = normalizeText(entry.note)
          const kind = ['reforco', 'tensao', 'sombra', 'complemento', 'espelho', 'sequencia'].includes(String(entry.kind))
            ? String(entry.kind)
            : ('reforco' as const)
          if (note.length < 50) errors.push('nota de combinação demasiado curta')
          const cards = Array.isArray(entry.cards) ? entry.cards.map((c: unknown) => schemas.cardId.safeParse(c)) : []
          if (cards.length < 2 || cards.some((c) => !c.success)) {
            errors.push('combinação com cartas que não pertencem à tiragem')
            return null
          }
          return { cards: cards.map((c) => c.data as string), kind: kind as 'reforco', note }
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
      return { ok: !errors.length && items.length > 0, value: { items }, errors }
    },
  },
  {
    section: 'synthesis',
    shape: (raw) => {
      const errors: string[] = []
      const paragraphs = stringArray(raw.paragraphs, 1, 9)
      if (!paragraphs) errors.push('parágrafos de síntesse ausentes ou fora dos limites')
      return { ok: !errors.length, value: { paragraphs: paragraphs ?? [] }, errors }
    },
  },
  {
    section: 'guidance',
    shape: (raw) => {
      const errors: string[] = []
      const practical = stringArray(raw.practical, 1, 9)
      const reflection = stringArray(raw.reflection, 1, 8)
      if (!practical) errors.push('orientações práticas fora dos limites')
      if (!reflection) errors.push('perguntas de reflexão fora dos limites')
      return { ok: !errors.length, value: { practical: practical ?? [], reflection: reflection ?? [] }, errors }
    },
  },
  {
    section: 'closing',
    shape: (raw) => {
      const errors: string[] = []
      const text = normalizeText(raw.text)
      const oneLine = normalizeText(raw.oneLine)
      if (text.length < 40) errors.push('fecho demasiado curto')
      if (oneLine.length > 220) errors.push('frase de partilha acima do limite')
      return { ok: !errors.length, value: { text, oneLine }, errors }
    },
  },
]

export function specFor(section: SectionKind): SectionSpec {
  const spec = SECTION_SPECS.find((s) => s.section === section)!
  return spec
}

/** Valida a resposta bruta de uma secção e devolve o valor limpo ou o motivo da rejeição. */
export function validateSection(section: SectionKind, rawText: string, schemas: OutputSchemas): ValidatedSection {
  let parsed: unknown
  try {
    parsed = extractJson(rawText).value
  } catch (error) {
    return { section, ok: false, issues: [{ section, path: 'json', message: error instanceof Error ? error.message : 'JSON inválido' }], fellBack: true }
  }
  const raw = (parsed ?? {}) as Record<string, unknown>
  const spec = specFor(section)
  const result = spec.shape(raw, schemas)
  if (!result.ok) {
    return {
      section,
      ok: false,
      issues: result.errors.map((message) => ({ section, path: section, message })),
      fellBack: true,
    }
  }
  return { section, ok: true, value: result.value, issues: [], fellBack: false }
}

/** Copia os valores validados para dentro da interpretação do motor local. */
export function mergeSections(base: Interpretation, validated: ValidatedSection[]): Interpretation {
  const out: Interpretation = { ...base, meta: { ...base.meta } }
  for (const v of validated) {
    if (!v.ok || !v.value) continue
    // os payloads por secção são heterogéneos por desenho; cada caso afina o recorte
    const value = v.value as { text?: unknown; items?: unknown[]; paragraphs?: unknown[]; practical?: unknown[]; reflection?: unknown[] }
    switch (v.section) {
      case 'opening':
        if (typeof value.text === 'string' && value.text) out.opening = value.text
        break
      case 'per-card':
        out.perCard = out.perCard.map((existing) => {
          const items = (value.items ?? []) as { positionId?: string; core?: string; modulation?: string; connection?: string }[]
          const patch = items.find((i) => i.positionId === existing.positionId)
          if (!patch) return existing
          return {
            ...existing,
            core: patch.core ?? existing.core,
            positionModulation: patch.modulation ?? existing.positionModulation,
            connections: patch.connection ? [...new Set([patch.connection, ...existing.connections])] : existing.connections,
          }
        })
        break
      case 'combinations':
        if (Array.isArray(value.items) && value.items.length) out.combinations = value.items as typeof out.combinations
        break
      case 'synthesis':
        if (Array.isArray(value.paragraphs) && value.paragraphs.length) out.synthesis = value.paragraphs as string[]
        break
      case 'guidance':
        if (Array.isArray(value.practical) && value.practical.length) out.practical = value.practical as string[]
        if (Array.isArray(value.reflection) && value.reflection.length) out.reflection = value.reflection as string[]
        break
      case 'closing':
        if (typeof value.text === 'string' && value.text) out.closing = value.text
        out.dominantTheme = out.dominantTheme || ''
        break
    }
  }
  const anySection = validated.some((v) => v.ok)
  out.meta = { ...out.meta, generator: anySection ? 'llm' : 'local' }
  return out
}

/** Que frases de "invenção" não podem passar nunca, mesmo validadas. */
const BANNED_PATTERNS: { re: RegExp; why: string }[] = [
  { re: /\b(vais morrer|vão morrer|morre[r]ás|data exata para|o acidente vai acontecer)\b/i, why: 'previsão de morte ou acidente' },
  { re: /\b(diagn[óo]stico de|tem (c[aâ]ncer|depress[eã]o|esquizofrenia|bipolar)|sofre de)\b/i, why: 'afirmação diagnóstica' },
  { re: /\b(esteja certo de que (ele|ela) (n[ãa]o )?(ama|é fiel|trai)|a tua (esposa|marido) trai)\b/i, why: 'asserção sobre fidelidade de terceiros' },
  { re: /\b(invest(e|ir) (todo|tudo)|aposta (segura|certa)|Compra (agora|já) (bitcoin|a[çc][õõ]es]))\b/i, why: 'aconselhamento financeiro imperativo' },
  { re: /\b(n[aã]o procures (ajuda|m[ée]dico)|deixa (a medica[çc][ãa]o|o tratamento))\b/i, why: 'instrução contrária à saúde' },
]

/** Rede de segurança final sobre o texto já integrado. */
export function auditText(interpretation: Interpretation): { ok: boolean; findings: string[] } {
  const corpus = [
    interpretation.opening,
    interpretation.closing,
    ...interpretation.synthesis,
    ...interpretation.practical,
    ...interpretation.reflection,
    ...interpretation.perCard.map((p) => `${p.core} ${p.positionModulation}`),
  ].join('\n')
  const findings = BANNED_PATTERNS.filter((b) => b.re.test(corpus)).map((b) => b.why)
  return { ok: findings.length === 0, findings }
}

/* ─────────────────────────── Rate limiting (token bucket) ─────────────────────────── */

export interface Bucket {
  tokens: number
  updated: number
}

export interface RateLimitOptions {
  /** Custo base em tokens por secção (para não contar pedidos, contar consumo). */
  costPerSection?: number
  burst?: number
  /** Tokens recuperados por minuto. */
  refillPerMinute?: number
  maxBuckets?: number
}

export class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>()
  private readonly cost: number
  private readonly burst: number
  private readonly refillPerMs: number
  private readonly maxBuckets: number

  constructor(options: RateLimitOptions = {}) {
    this.cost = options.costPerSection ?? 600
    this.burst = options.burst ?? 6000
    this.refillPerMs = (options.refillPerMinute ?? 3000) / 60000
    this.maxBuckets = options.maxBuckets ?? 5000
  }

  private refill(key: string, now: number): Bucket {
    const existing = this.buckets.get(key)
    if (!existing) {
      const fresh: Bucket = { tokens: this.burst, updated: now }
      this.buckets.set(key, fresh)
      if (this.buckets.size > this.maxBuckets) {
        // expurgo determinístico: o bucket mais antigo (menor `updated`)
        let oldestKey: string | null = null
        let oldest = Infinity
        for (const [key, bucket] of this.buckets) {
          if (bucket.updated < oldest) {
            oldest = bucket.updated
            oldestKey = key
          }
        }
        if (oldestKey) this.buckets.delete(oldestKey)
      }
      return fresh
    }
    const elapsed = Math.max(0, now - existing.updated)
    existing.tokens = Math.min(this.burst, existing.tokens + elapsed * this.refillPerMs)
    existing.updated = now
    return existing
  }

  /** Tenta consumir `amount` tokens do balde. Devolve false quando o limite é atingido. */
  tryConsume(key: string, amount = this.cost, now = Date.now()): boolean {
    const bucket = this.refill(key, now)
    if (bucket.tokens < amount) return false
    bucket.tokens -= amount
    return true
  }

  remaining(key: string, now = Date.now()): number {
    return Math.floor(this.refill(key, now).tokens)
  }

  /** Tempo em ms até haver `amount` tokens disponíveis (0 quando já há). */
  retryAfterMs(key: string, amount = this.cost, now = Date.now()): number {
    const bucket = this.refill(key, now)
    if (bucket.tokens >= amount) return 0
    return Math.ceil((amount - bucket.tokens) / this.refillPerMs)
  }

  reset(key?: string): void {
    if (key === undefined) this.buckets.clear()
    else this.buckets.delete(key)
  }
}

/* ─────────────────────────── Cache de secções ─────────────────────────── */

export interface CacheEntry<T> {
  value: T
  storedAt: number
  hits: number
}

/** LRU com TTL. A chave inclui o fingerprint do prompt, por isso uma mudança de voz/depth invalida. */
export class TtlLru<T> {
  private map = new Map<string, CacheEntry<T>>()
  constructor(
    private readonly maxEntries: number = 200,
    private readonly ttlMs: number = 1000 * 60 * 60 * 12,
  ) {}

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (now - entry.storedAt > this.ttlMs) {
      this.map.delete(key)
      return undefined
    }
    this.map.delete(key)
    this.map.set(key, { ...entry, hits: entry.hits + 1 })
    return entry.value
  }

  set(key: string, value: T, now = Date.now()): void {
    if (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value
      if (oldest !== undefined) this.map.delete(oldest)
    }
    this.map.set(key, { value, storedAt: now, hits: 0 })
  }

  delete(key: string): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }
}

/* ─────────────────────────── Chamada por secção, com retry ─────────────────────────── */

export interface SectionCallParams {
  provider: LlmProvider
  schemas: OutputSchemas
  request: SectionRequest
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  limiter?: TokenBucketLimiter
  limitKey?: string
  cache?: TtlLru<ValidatedSection>
  cacheKey?: string
  signal?: AbortSignal
  /** Tentativas extra quando o provedor devolve algo reparável (429/5xx/JSON inválido). */
  retries?: number
  onDelta?: (chunk: string) => void
  temperature?: number
}

export interface SectionCallResult {
  validated: ValidatedSection
  usage: LlmUsage[]
  fromCache: boolean
  attempts: number
}

export async function callSection(params: SectionCallParams): Promise<SectionCallResult> {
  const { provider, schemas, request, messages, limiter, limitKey, cache, cacheKey, signal } = params
  const cost = Math.max(300, Math.round(messages.reduce((s, m) => s + m.content.length, 0) / 3.6))

  if (cache && cacheKey) {
    const cached = cache.get(cacheKey)
    if (cached) return { validated: cached, usage: [], fromCache: true, attempts: 0 }
  }

  if (limiter && limitKey && !limiter.tryConsume(limitKey, cost)) {
    return {
      validated: {
        section: request.section,
        ok: false,
        issues: [{ section: request.section, path: 'rate', message: 'limite de tokens do plano atingido' }],
        fellBack: true,
      },
      usage: [],
      fromCache: false,
      attempts: 0,
    }
  }

  const usage: LlmUsage[] = []
  const retries = params.retries ?? 1
  let lastIssues: ValidationIssue[] = []

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result =
        params.onDelta && provider.streamComplete
          ? await provider.streamComplete({ messages, section: request.section, signal, stream: true, temperature: params.temperature }, params.onDelta)
          : await provider.complete({ messages, section: request.section, signal, temperature: params.temperature })
      usage.push(result.usage)
      const validated = validateSection(request.section, result.text, schemas)
      if (validated.ok) {
        if (cache && cacheKey) cache.set(cacheKey, validated)
        return { validated, usage, fromCache: false, attempts: attempt + 1 }
      }
      lastIssues = validated.issues
      if (attempt < retries) {
        // Repergunta uma única vez, com instrução correctiva explícita.
        messages.push({ role: 'assistant', content: result.text.slice(0, 4000) })
        messages.push({
          role: 'user',
          content: `A tua resposta foi rejeitada pelo validador: ${validated.issues.map((i) => i.message).join('; ')}.
Reescreve APENAS a secção "${request.section}" em JSON estrito com o formato ${request.shape}. Não acrescentes texto fora do objecto.`,
        })
        continue
      }
      return { validated, usage, fromCache: false, attempts: attempt + 1 }
    } catch (error) {
      const isProviderError = error instanceof ProviderError
      const retryable = isProviderError ? error.retryable : false
      lastIssues = [{ section: request.section, path: 'provider', message: error instanceof Error ? error.message : 'falha de rede' }]
      if (!retryable || attempt === retries) {
        return {
          validated: { section: request.section, ok: false, issues: lastIssues, fellBack: true },
          usage,
          fromCache: false,
          attempts: attempt + 1,
        }
      }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }

  return { validated: { section: request.section, ok: false, issues: lastIssues, fellBack: true }, usage, fromCache: false, attempts: retries + 1 }
}
