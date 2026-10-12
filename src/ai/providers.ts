import { z } from 'zod'

/**
 * Provedores de linguagem.
 *
 * Nenhum SDK: só `fetch`, para que o mesmo código corra em Node runtime e em edge,
 * e para que trocar de provedor não troque o produto. As chaves vivem exclusivamente
 * no servidor (variáveis de ambiente lidas aqui, nunca re-exportadas para o cliente).
 */

export interface ProviderConfig {
  /** 'openai' usa a resposta /chat/completions; 'anthropic' usa /v1/messages; 'local' desliga o LLM. */
  kind: 'openai' | 'anthropic' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
  /** Temperature por secção: criativa na abertura, contida na análise. */
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  /** Se true, envia `response_format: json_object` (provedores OpenAI-compatíveis que o suportam). */
  jsonMode?: boolean
}

export const ProviderConfigSchema = z.object({
  kind: z.enum(['openai', 'anthropic', 'custom']),
  baseUrl: z.string().url(),
  apiKey: z.string().min(8),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(64).max(16384).optional(),
  timeoutMs: z.number().int().min(1000).max(180000).optional(),
  jsonMode: z.boolean().optional(),
})

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmRequest {
  messages: LlmMessage[]
  /** Identificador da secção pedida (para telemetria e cache). */
  section?: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  /** true quando o chamador quer receber deltas de texto em vez de aguardar tudo. */
  stream?: boolean
}

export interface LlmUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  /** Custo estimado em USD, com a tabela de preços configurada. */
  costUsd: number
  latencyMs: number
  model: string
  provider: ProviderConfig['kind']
}

export interface LlmResult {
  text: string
  usage: LlmUsage
  /** true quando o provedor respondeu com JSON parcial e o cliente fez o parse tolerante. */
  repaired: boolean
}

export interface LlmProvider {
  readonly config: ProviderConfig
  complete(request: LlmRequest): Promise<LlmResult>
  /** streamComplete emite texto incremental; o chamador decide o que fazer com ele. */
  streamComplete?(request: LlmRequest, onDelta: (chunk: string) => void): Promise<LlmResult>
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryable: boolean,
    readonly provider: string,
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

/** Preço em USD por 1M tokens — configurável por ambiente (nada é "chutado" no código). */
const DEFAULT_PRICES: Record<string, { in: number; out: number }> = {
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-4o': { in: 2.5, out: 10 },
  'gpt-4.1-mini': { in: 0.4, out: 1.6 },
  'o4-mini': { in: 1.1, out: 4.4 },
  'claude-sonnet-4-5': { in: 3, out: 15 },
  'claude-haiku-4-5': { in: 0.8, out: 4 },
  'gemini-2.0-flash': { in: 0.1, out: 0.4 },
}

function priceFor(model: string): { in: number; out: number } {
  const override = process.env.ARCANA_TOKEN_PRICES_USD
  if (override) {
    try {
      const table = JSON.parse(override) as Record<string, { in: number; out: number }>
      if (table[model]) return table[model]!
      const anyKey = Object.keys(table).find((k) => model.startsWith(k))
      if (anyKey) return table[anyKey]!
    } catch {
      /* config inválida: ignorar e usar a tabela base (nunca rebentar a leitura por isto) */
    }
  }
  const exact = DEFAULT_PRICES[model]
  if (exact) return exact
  const prefix = Object.keys(DEFAULT_PRICES).find((k) => model.startsWith(k))
  return prefix ? DEFAULT_PRICES[prefix]! : { in: 1, out: 3 }
}

function buildUrl(config: ProviderConfig, path: string): string {
  const base = config.baseUrl.replace(/\/+$/, '')
  if (base.endsWith(path)) return base
  return `${base}${path}`
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => '')
  if (!raw) return `${res.status} ${res.statusText}`
  try {
    const json = JSON.parse(raw) as { error?: { message?: string }; message?: string }
    return json.error?.message ?? json.message ?? raw.slice(0, 400)
  } catch {
    return raw.slice(0, 400)
  }
}

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529])

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs)
  const onAbort = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/** Extrai JSON mesmo com cercas markdown ou texto à volta (provedores "não-JSON-mode"). */
export function extractJson(text: string): { value: unknown; repaired: boolean } {
  const trimmed = text.trim()
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed)
  const candidate = (fenced ? fenced[1]! : trimmed).trim()
  try {
    return { value: JSON.parse(candidate), repaired: fenced != null }
  } catch {
    /* continua para as tentativas tolerantes */
  }
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const slice = candidate.slice(start, end + 1)
    try {
      return { value: JSON.parse(slice), repaired: true }
    } catch {
      const cleaned = slice
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      try {
        return { value: JSON.parse(cleaned), repaired: true }
      } catch {
        throw new ProviderError('o modelo não devolveu JSON válido', null, true, 'parser')
      }
    }
  }
  throw new ProviderError('resposta do modelo sem objecto JSON', null, true, 'parser')
}

export function createProvider(config: ProviderConfig): LlmProvider {
  ProviderConfigSchema.parse(config)
  const timeout = config.timeoutMs ?? 45000
  const maxTokens = config.maxTokens ?? 1400

  const commonHeaders = (): Record<string, string> =>
    config.kind === 'anthropic'
      ? { 'content-type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' }
      : { 'content-type': 'application/json', authorization: `Bearer ${config.apiKey}` }

  async function callOnce(body: Record<string, unknown>, signal?: AbortSignal): Promise<{ raw: string; usage: { in: number; out: number } }> {
    const path = config.kind === 'anthropic' ? '/v1/messages' : '/chat/completions'
    const res = await fetchWithTimeout(buildUrl(config, path), { method: 'POST', headers: commonHeaders(), body: JSON.stringify(body) }, timeout, signal)
    if (!res.ok) {
      const detail = await readError(res)
      throw new ProviderError(`${config.kind}/${config.model}: ${detail}`, res.status, RETRYABLE_STATUS.has(res.status), config.kind)
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string; reasoning_content?: string } }[]
      content?: { type: string; text?: string }[]
      usage?: { prompt_tokens?: number; completion_tokens?: number; input_tokens?: number; output_tokens?: number }
    }
    if (config.kind === 'anthropic') {
      const text = (json.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('')
      return { raw: text, usage: { in: json.usage?.input_tokens ?? 0, out: json.usage?.output_tokens ?? 0 } }
    }
    const message = json.choices?.[0]?.message
    const text = message?.content ?? message?.reasoning_content ?? ''
    return { raw: text, usage: { in: json.usage?.prompt_tokens ?? 0, out: json.usage?.completion_tokens ?? 0 } }
  }

  async function callStreaming(body: Record<string, unknown>, onDelta: (chunk: string) => void, signal?: AbortSignal): Promise<{ raw: string; usage: { in: number; out: number } }> {
    const path = config.kind === 'anthropic' ? '/v1/messages' : '/chat/completions'
    const res = await fetchWithTimeout(
      buildUrl(config, path),
      { method: 'POST', headers: { ...commonHeaders(), accept: 'text/event-stream' }, body: JSON.stringify({ ...body, stream: true }) },
      timeout,
      signal,
    )
    if (!res.ok) {
      const detail = await readError(res)
      throw new ProviderError(`${config.kind}/${config.model} (stream): ${detail}`, res.status, RETRYABLE_STATUS.has(res.status), config.kind)
    }
    if (!res.body) throw new ProviderError('provedor sem corpo de resposta para streaming', null, true, config.kind)
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let full = ''
    let usage = { in: 0, out: 0 }
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split(/\n\n/)
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        const line = frame.split('\n').find((l) => l.startsWith('data:'))
        if (!line) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const event = JSON.parse(payload) as {
            type?: string
            delta?: { type?: string; text?: string }
            usage?: { output_tokens?: number; input_tokens?: number; prompt_tokens?: number; completion_tokens?: number }
            message?: { usage?: { input_tokens?: number } }
            choices?: { delta?: { content?: string } }[]
          }
          if (config.kind === 'anthropic') {
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              full += event.delta.text ?? ''
              onDelta(event.delta.text ?? '')
            }
            if (event.type === 'message_delta' && event.usage) usage = { in: usage.in, out: event.usage.output_tokens ?? usage.out }
            if (event.type === 'message_start' && event.message?.usage) usage = { in: event.message.usage.input_tokens ?? 0, out: usage.out }
          } else {
            const delta = event.choices?.[0]?.delta?.content
            if (delta) {
              full += delta
              onDelta(delta)
            }
            if (event.usage) usage = { in: event.usage.prompt_tokens ?? usage.in, out: event.usage.completion_tokens ?? usage.out }
          }
        } catch {
          // keep-alive e comentários do SSE: ignorar
        }
      }
    }
    return { raw: full, usage }
  }

  function bodyFor(request: LlmRequest, extra: Record<string, unknown> = {}): Record<string, unknown> {
    const temperature = request.temperature ?? config.temperature ?? 0.7
    if (config.kind === 'anthropic') {
      const system = request.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
      return {
        model: config.model,
        max_tokens: request.maxTokens ?? maxTokens,
        temperature,
        ...(system ? { system } : {}),
        messages: request.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content })),
        ...extra,
      }
    }
    return {
      model: config.model,
      temperature,
      max_tokens: request.maxTokens ?? maxTokens,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      ...(config.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      ...extra,
    }
  }

  const provider: LlmProvider = {
    config,
    async complete(request) {
      const started = Date.now()
      const { raw, usage } = await callOnce(bodyFor(request), request.signal)
      const price = priceFor(config.model)
      return {
        text: raw,
        repaired: false,
        usage: {
          promptTokens: usage.in,
          completionTokens: usage.out,
          totalTokens: usage.in + usage.out,
          costUsd: (usage.in / 1e6) * price.in + (usage.out / 1e6) * price.out,
          latencyMs: Date.now() - started,
          model: config.model,
          provider: config.kind,
        },
      }
    },
    async streamComplete(request, onDelta) {
      const started = Date.now()
      const { raw, usage } = await callStreaming(bodyFor(request), onDelta, request.signal)
      const price = priceFor(config.model)
      return {
        text: raw,
        repaired: false,
        usage: {
          promptTokens: usage.in,
          completionTokens: usage.out,
          totalTokens: usage.in + usage.out,
          costUsd: (usage.in / 1e6) * price.in + (usage.out / 1e6) * price.out,
          latencyMs: Date.now() - started,
          model: config.model,
          provider: config.kind,
        },
      }
    },
  }
  return provider
}

/** Le a configuração a partir do ambiente do servidor. `null` quando o LLM está desligado. */
export function providerFromEnv(env: NodeJS.ProcessEnv = process.env): ProviderConfig | null {
  const kind = String(env['ARCANA_AI_PROVIDER'] ?? 'auto')
  const apiKey = env.ARCANA_AI_API_KEY ?? env.OPENAI_API_KEY ?? env.ANTHROPIC_API_KEY ?? ''
  if (!apiKey) return null
  const resolvedKind =
    kind === 'openai' || kind === 'anthropic' || kind === 'custom'
      ? kind
      : /^sk-ant-/.test(apiKey)
        ? 'anthropic'
        : 'openai'
  const baseUrl =
    env.ARCANA_AI_BASE_URL ??
    (resolvedKind === 'anthropic' ? 'https://api.anthropic.com' : resolvedKind === 'custom' ? (env.ARCANA_AI_BASE_URL ?? 'http://127.0.0.1:11434/v1') : 'https://api.openai.com/v1')
  const model =
    env.ARCANA_AI_MODEL ??
    (resolvedKind === 'anthropic' ? 'claude-sonnet-4-5' : resolvedKind === 'custom' ? 'llama3.1:8b-instruct' : 'gpt-4o-mini')
  return {
    kind: resolvedKind,
    baseUrl,
    apiKey,
    model,
    temperature: env.ARCANA_AI_TEMPERATURE ? Number(env.ARCANA_AI_TEMPERATURE) : undefined,
    maxTokens: env.ARCANA_AI_MAX_TOKENS ? Number(env.ARCANA_AI_MAX_TOKENS) : undefined,
    timeoutMs: env.ARCANA_AI_TIMEOUT_MS ? Number(env.ARCANA_AI_TIMEOUT_MS) : undefined,
    jsonMode: env.ARCANA_AI_JSON_MODE ? env.ARCANA_AI_JSON_MODE === '1' : resolvedKind === 'openai',
  }
}

export const AI_MODE_ENV = ['ARCANA_AI_PROVIDER', 'ARCANA_AI_BASE_URL', 'ARCANA_AI_MODEL', 'ARCANA_AI_TEMPERATURE', 'ARCANA_AI_MAX_TOKENS', 'ARCANA_AI_TIMEOUT_MS', 'ARCANA_AI_JSON_MODE'] as const
