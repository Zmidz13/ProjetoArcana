import type { CardDef, DrawnCard, SpreadDef } from '../domain/types.ts'
import type { Depth, Interpretation, Register, VoiceKey } from '../domain/interpretation.ts'
import { analyze, type Analysis } from '../engine/symbolic.ts'
import { buildInterpretation, hashHex } from '../engine/narrative.ts'
import { safetyFor, type SafetyFlag } from '../domain/safety.ts'
import { buildChatMessages, buildMessages, promptFingerprint, sharedContext, type PromptContext } from './prompts.ts'
import { buildOutputSchemas, SECTION_ORDER, type ChatReply, type SectionKind } from './schema.ts'
import { callSection, auditText, mergeSections, normalizeText, TokenBucketLimiter, TtlLru, type ValidatedSection } from './pipeline.ts'
import { createProvider, providerFromEnv, type LlmProvider, type LlmUsage } from './providers.ts'

/**
 * Orquestrador da IA híbrida.
 *
 * 1. O motor determinístico decide tudo o que é facto simbólico e escreve o esqueleto A–G.
 * 2. Se houver provedor configurado e orçamento disponível, cada secção é reescrita pelo
 *    modelo em paralelo (com validação por esquema e uma tentativa de correcção).
 * 3. Secção que falhe a validação fica com o texto local; a leitura nunca fica incompleta.
 * 4. Auditoria final bloqueia frases proibidas (previsões, diagnósticos, aconselhamento
 *    clínico/financeiro) — se algo passar no filtro e falhar na auditoria, a secção
 *    ofensiva é substituída pela versão local.
 */

export interface InterpretRequest {
  spread: SpreadDef
  drawn: DrawnCard[]
  cards: CardDef[]
  question: string
  depth: Depth
  register: Register
  voice: VoiceKey
  history?: { date: string; question: string; summary: string }[]
  querent?: { name?: string; context?: string }
  /** true quando o utilizador pede explicitamente leitura local (sem LLM). */
  forceLocal?: boolean
  /** Chave de quota (userId ou IP) — nunca um segredo. */
  limitKey?: string
  signal?: AbortSignal
  /** Secções a ignorar (o caller pode querer só A+D para resposta rápida). */
  onlySections?: SectionKind[]
  onSection?: (event: { section: SectionKind; status: 'start' | 'done' | 'fallback'; message?: string }) => void
}

export interface InterpretResult {
  interpretation: Interpretation
  analysis: Analysis
  safety: SafetyFlag[]
  llm: {
    attempted: boolean
    used: boolean
    provider: string | null
    model: string | null
    sections: { section: SectionKind; ok: boolean; fromCache: boolean; attempts: number; issues: string[] }[]
    usage: LlmUsage[]
    totalCostUsd: number
    skippedReason?: string
  }
  meta: {
    elapsedMs: number
    contextHash: string
    cacheHit: boolean
  }
}

export interface AiRuntime {
  provider: LlmProvider | null
  limiter: TokenBucketLimiter
  cache: TtlLru<ValidatedSection>
  chatCache: TtlLru<string>
}

let runtime: AiRuntime | null = null

export function getRuntime(env?: NodeJS.ProcessEnv): AiRuntime {
  if (runtime) return runtime
  const config = providerFromEnv(env)
  runtime = {
    provider: config ? createProvider(config) : null,
    limiter: new TokenBucketLimiter({
      burst: Number(env?.ARCANA_AI_BURST_TOKENS ?? 12000),
      refillPerMinute: Number(env?.ARCANA_AI_TOKENS_PER_MINUTE ?? 24000),
    }),
    cache: new TtlLru<ValidatedSection>(400, 1000 * 60 * 60 * 12),
    chatCache: new TtlLru<string>(200, 1000 * 60 * 30),
  }
  return runtime
}

/** Só para testes: limpa o singleton de runtime. */
export function resetRuntime(): void {
  runtime = null
}

export function aiStatus(env?: NodeJS.ProcessEnv): { enabled: boolean; provider: string; model: string; note: string } {
  const config = providerFromEnv(env)
  if (!config)
    return {
      enabled: false,
      provider: 'local',
      model: 'motor-simbólico',
      note: 'Sem ARCANA_AI_API_KEY: a plataforma usa o motor simbólico + narrativo local, que produz a leitura completa A–G sem rede.',
    }
  return {
    enabled: true,
    provider: config.kind,
    model: config.model,
    note: `As secções são reescritas por ${config.model} via ${config.baseUrl.replace(/^https?:\/\//, '')}; as chaves ficam apenas no servidor.`,
  }
}

const SECTION_TEMPERATURE: Record<SectionKind, number> = {
  opening: 0.82,
  'per-card': 0.6,
  combinations: 0.55,
  synthesis: 0.74,
  guidance: 0.5,
  closing: 0.86,
}

export async function interpretReading(request: InterpretRequest, rt: AiRuntime = getRuntime()): Promise<InterpretResult> {
  const started = Date.now()
  const cardMap = new Map(request.cards.map((c) => [c.id, c]))
  const analysis = analyze({
    drawn: request.drawn,
    positions: request.spread.positions,
    getCard: (id) => cardMap.get(id),
    spreadPurpose: request.spread.purpose,
    spreadName: request.spread.name,
    spreadCategory: request.spread.category,
  })
  const safety = safetyFor([request.question, request.querent?.context ?? ''].join(' '))
  const local = buildInterpretation({
    analysis,
    drawn: request.drawn,
    spread: request.spread,
    question: request.question,
    depth: request.depth,
    register: request.register,
    voice: request.voice,
    getCard: (id) => cardMap.get(id),
    history: request.history,
    querent: request.querent,
  })

  const contextHash = hashHex(
    [
      request.spread.id,
      request.depth,
      request.register,
      request.voice,
      request.question,
      request.drawn.map((d) => `${d.positionId}:${d.cardId}:${d.orientation}`).join(','),
    ].join('|'),
  )

  if (request.forceLocal || !rt.provider) {
    return {
      interpretation: local.interpretation,
      analysis,
      safety: [...local.safety, ...safety],
      llm: {
        attempted: false,
        used: false,
        provider: null,
        model: null,
        sections: [],
        usage: [],
        totalCostUsd: 0,
        skippedReason: request.forceLocal ? 'modo local pedido pelo utilizador' : 'provedor não configurado no servidor',
      },
      meta: { elapsedMs: Date.now() - started, contextHash, cacheHit: false },
    }
  }

  const schemas = buildOutputSchemas(
    request.drawn.map((d) => d.cardId),
    request.spread.positions.map((p) => p.id),
  )
  const promptContext: PromptContext = {
    spread: request.spread,
    drawn: request.drawn,
    cards: request.cards,
    analysis,
    question: request.question,
    depth: request.depth,
    register: request.register,
    voice: request.voice,
    locale: 'pt-PT',
    safety,
    skeleton: local.interpretation,
    querent: request.querent,
    history: request.history,
  }

  const sections = (request.onlySections ?? SECTION_ORDER) as SectionKind[]
  const results: { section: SectionKind; validated: ValidatedSection; fromCache: boolean; attempts: number }[] = []
  const usage: LlmUsage[] = []

  // Concorrência limitada a 3 chamadas simultâneas: suficiente para esconder a latência
  // e baixo o bastante para não provocar 429 em contas partilhadas.
  const queue = [...sections]
  const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
    for (;;) {
      const section = queue.shift()
      if (!section) return
      if (request.signal?.aborted) {
        results.push({ section, validated: { section, ok: false, issues: [{ section, path: 'abort', message: 'pedido cancelado' }], fellBack: true }, fromCache: false, attempts: 0 })
        continue
      }
      request.onSection?.({ section, status: 'start' })
      const messages = buildMessages(promptContext, section) as { role: 'system' | 'user' | 'assistant'; content: string }[]
      const call = await callSection({
        provider: rt.provider!,
        schemas,
        request: { section, instruction: '', shape: '' },
        messages,
        limiter: rt.limiter,
        limitKey: request.limitKey,
        cache: rt.cache,
        cacheKey: `${contextHash}:${section}:${promptFingerprint(promptContext, section)}`,
        signal: request.signal,
        temperature: SECTION_TEMPERATURE[section],
      })
      usage.push(...call.usage)
      results.push({ section, validated: call.validated, fromCache: call.fromCache, attempts: call.attempts })
      request.onSection?.({
        section,
        status: call.validated.ok ? 'done' : 'fallback',
        message: call.validated.ok ? undefined : call.validated.issues.map((i) => i.message).join('; '),
      })
    }
  })
  await Promise.all(workers)

  let merged = mergeSections(local.interpretation, results.map((r) => r.validated))
  merged = {
    ...merged,
    meta: {
      ...merged.meta,
      generator: results.some((r) => r.validated.ok) ? 'llm' : 'local',
      provider: rt.provider.config.kind,
      model: rt.provider.config.model,
      tokensIn: usage.reduce((s, u) => s + u.promptTokens, 0),
      tokensOut: usage.reduce((s, u) => s + u.completionTokens, 0),
      costUsd: usage.reduce((s, u) => s + u.costUsd, 0),
      latencyMs: usage.reduce((s, u) => s + u.latencyMs, 0),
      contextHash,
    },
  }

  const audit = auditText(merged)
  if (!audit.ok) {
    // Substituição cirúrgica: só as secções com texto proibido voltam ao local.
    const fallback = buildInterpretation({
      analysis,
      drawn: request.drawn,
      spread: request.spread,
      question: request.question,
      depth: request.depth,
      register: request.register,
      voice: request.voice,
      getCard: (id) => cardMap.get(id),
      history: request.history,
      querent: request.querent,
    }).interpretation
    merged = {
      ...merged,
      opening: fallback.opening,
      closing: fallback.closing,
      synthesis: fallback.synthesis,
      practical: fallback.practical,
      disclaimers: [...new Set([...fallback.disclaimers, ...audit.findings.map((f) => `Frase removida pela auditoria de segurança: ${f}.`)]), ...fallback.disclaimers],
    }
  }

  return {
    interpretation: merged,
    analysis,
    safety: [...new Map([...local.safety, ...safety].map((f) => [f.category, f])).values()],
    llm: {
      attempted: true,
      used: results.some((r) => r.validated.ok),
      provider: rt.provider.config.kind,
      model: rt.provider.config.model,
      sections: results
        .sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section))
        .map((r) => ({
          section: r.section,
          ok: r.validated.ok,
          fromCache: r.fromCache,
          attempts: r.attempts,
          issues: r.validated.issues.map((i) => i.message),
        })),
      usage,
      totalCostUsd: usage.reduce((s, u) => s + u.costUsd, 0),
    },
    meta: {
      elapsedMs: Date.now() - started,
      contextHash,
      cacheHit: results.length > 0 && results.every((r) => r.fromCache),
    },
  }
}

/* ─────────────────────────── Conversa pós-leitura ─────────────────────────── */

export interface ChatRequest {
  spread: SpreadDef
  drawn: DrawnCard[]
  cards: CardDef[]
  question: string
  reading: Interpretation
  messages: { role: 'user' | 'assistant'; content: string }[]
  voice: VoiceKey
  /** Última pergunta do utilizador — aquela a que a resposta diz respeito. */
  prompt: string
  limitKey?: string
  signal?: AbortSignal
}

export interface ChatResult {
  reply: string
  focusPositions: string[]
  outOfScope: boolean
  usedLlm: boolean
  usage: LlmUsage[]
  fromCache: boolean
}

export async function continueReading(request: ChatRequest, rt: AiRuntime = getRuntime()): Promise<ChatResult> {
  const cardMap = new Map(request.cards.map((c) => [c.id, c]))
  const safety = safetyFor(request.prompt)
  const byId = new Map(request.spread.positions.map((p) => [p.id, p]))
  const drawnInfo = request.drawn.map((d) => ({
    positionLabel: byId.get(d.positionId)?.label ?? d.positionId,
    cardName: cardMap.get(d.cardId)?.name.pt ?? d.cardId,
    orientation: d.orientation,
  }))

  const summary = [
    request.reading.opening,
    ...request.reading.synthesis,
    ...request.reading.practical.slice(0, 3),
    request.reading.closing,
  ]
    .filter(Boolean)
    .join('\n')

  const positionIds = request.spread.positions.map((p) => p.id)
  const schemas = buildOutputSchemas(request.drawn.map((d) => d.cardId), positionIds)

  if (!rt.provider || rt.limiter.remaining(request.limitKey ?? 'anon') < 400) {
    return {
      ...localChatReply(request, drawnInfo, safety),
      usedLlm: false,
      usage: [],
      fromCache: false,
    }
  }

  const cacheKey = `chat:${hashHex([request.reading.meta.contextHash, request.prompt].join('|'))}`
  const cached = rt.chatCache.get(cacheKey)
  if (cached) {
    return { reply: cached, focusPositions: [], outOfScope: false, usedLlm: false, usage: [], fromCache: true }
  }

  const messages = buildChatMessages({
    readingSummary: summary,
    drawn: drawnInfo,
    question: request.question,
    history: request.messages,
    voice: request.voice,
    safety,
  }) as { role: 'system' | 'user' | 'assistant'; content: string }[]
  // A pergunta actual segue-se ao resumo (o `buildChatMessages` deixa o último slot livre).
  messages[messages.length - 1] = { role: 'user', content: request.prompt }

  const call = await callSection({
    provider: rt.provider,
    schemas,
    request: { section: 'synthesis', instruction: 'resposta de continuação', shape: '{"reply":string,"focusPositions":string[]}' },
    messages,
    limiter: rt.limiter,
    limitKey: request.limitKey,
    signal: request.signal,
    temperature: 0.7,
  })

  if (!call.validated.ok) {
    return { ...localChatReply(request, drawnInfo, safety), usedLlm: false, usage: call.usage, fromCache: false }
  }

  const value = call.validated.value as { paragraphs?: string[] }
  const reply = normalizeText((value.paragraphs ?? []).join(' '))
  rt.chatCache.set(cacheKey, reply)
  return {
    reply,
    focusPositions: [],
    outOfScope: false,
    usedLlm: true,
    usage: call.usage,
    fromCache: false,
  }
}

/**
 * Resposta local à conversa: sem LLM, mas nunca vazia. Usa as cartas reais e a análise
 * para responder ao que foi perguntado, e declara explicitamente o que a tiragem não cobre.
 */
function localChatReply(
  request: ChatRequest,
  drawnInfo: { positionLabel: string; cardName: string; orientation: string }[],
  safety: SafetyFlag[],
): { reply: string; focusPositions: string[]; outOfScope: boolean } {
  const prompt = request.prompt.toLowerCase()
  const cardMap = new Map(request.cards.map((c) => [c.id, c]))
  const focus = request.drawn
    .map((d) => {
      const card = cardMap.get(d.cardId)
      const pos = request.spread.positions.find((p) => p.id === d.positionId)
      if (!card || !pos) return null
      const haystack = `${pos.label} ${pos.description} ${card.name.pt} ${card.keywords.upright.join(' ')} ${card.archetype}`.toLowerCase()
      const terms = prompt.split(/[^a-zà-ÿ0-9]+/i).filter((t) => t.length > 4)
      const score = terms.filter((t) => haystack.includes(t)).length
      return { d, card, pos, score }
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.score - a.score)

  const top = focus[0]
  const outOfScope = !top || top.score === 0
  const parts: string[] = []

  if (safety.length) parts.push(safety[0]!.userMessage)

  if (top) {
    const text = top.d.orientation === 'reversed' ? top.card.meanings.reversed : top.card.meanings.upright
    parts.push(`A posição que responde a isso é "${top.pos.label}", com ${top.card.name.pt} ${top.d.orientation === 'reversed' ? 'invertida' : 'a direito'}.`)
    parts.push(text)
    if (top.card.guidance.advice[0]) parts.push(`Conselho canónico da carta: ${top.card.guidance.advice[0]}`)
    const second = focus[1]
    if (second && second.score > 0) parts.push(`Vista ao lado de ${second.card.name.pt} (${second.pos.label}), o acento desloca-se: ${second.card.domains.growth}`)
  } else {
    parts.push('Esta tiragem não cobre o que perguntaste — as cartas que saíram não falam desse assunto, e não vou acrescentar cartas que não estão na mesa.')
    parts.push(`O que a tiragem cobre é: ${drawnInfo.map((d) => `${d.cardName} em ${d.positionLabel}`).join('; ')}.`)
    parts.push('Se queres resposta para essa pergunta, faz uma tiragem nova com ela — o motor retira cartas de raiz, em vez de esticar esta leitura.')
  }

  return {
    reply: parts.filter(Boolean).join('\n\n'),
    focusPositions: top ? [top.pos.id, ...(focus[1] ? [focus[1].pos.id] : [])] : [],
    outOfScope,
  }
}

export { sharedContext, promptFingerprint }
export type { SectionKind, ChatReply }
