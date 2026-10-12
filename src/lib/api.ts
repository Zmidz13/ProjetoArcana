/**
 * Cliente HTTP do ARCANA.
 *
 * Regras:
 *  - `credentials: 'same-origin'` sempre (a cookie de sessão é httpOnly; o cliente nunca a vê).
 *  - Em mutações autenticadas ecoa-se o cookie `arcana_csrf` no cabeçalho `X-CSRF-Token`,
 *    que é o que o `assertCsrf` do servidor exige.
 *  - Erros do servidor (`{ error, code, details }`) são materializados em `ApiError`, com
 *    mensagem legível para mostrar no ecrã.
 */

export interface ApiErrorBody {
  error?: string
  code?: string
  details?: unknown
  fieldErrors?: Record<string, string[]>
  retryAfterSeconds?: number
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown
  readonly fieldErrors: Record<string, string[]>
  readonly retryAfterSeconds?: number

  constructor(status: number, body: ApiErrorBody | null, fallback: string) {
    super(body?.error ?? fallback)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code ?? (status >= 500 ? 'servidor' : 'pedido')
    this.details = body?.details ?? null
    this.fieldErrors = body?.fieldErrors ?? {}
    this.retryAfterSeconds = body?.retryAfterSeconds
  }
}

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const escaped = name.replace(/[[$^*+?()|[\]{}]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function csrfToken(): string | null {
  return readCookie('arcana_csrf')
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Não junta o cabeçalho CSRF (para rotas públicas de autenticação). */
  anonymous?: boolean
  headers?: Record<string, string>
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { accept: 'application/json', ...options.headers }
  if (options.body !== undefined) headers['content-type'] = 'application/json'
  if (method !== 'GET' && !options.anonymous) {
    const token = csrfToken()
    if (token) headers['x-csrf-token'] = token
  }
  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      signal: options.signal,
      cache: 'no-store',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, { error: 'Sem ligação ao servidor. Confirma que `npm run dev` está a correr.' }, 'rede')
  }
  const text = await response.text()
  const payload: unknown = text ? safeJson(text) : null
  if (!response.ok) {
    throw new ApiError(response.status, (payload ?? null) as ApiErrorBody, `Erro ${response.status}`)
  }
  return payload as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return { error: 'Resposta do servidor não é JSON válido.', raw: text.slice(0, 400) }
  }
}

export interface SseEvent {
  event: string
  data: unknown
}

/**
 * Leitor de `text/event-stream` para a interpretação. Se o servidor responder JSON (pedido
 * sem streaming ou fallback), o corpo é entregue como um único evento `done`.
 */
export async function streamApi(
  path: string,
  body: unknown,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = csrfToken()
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream, application/json',
      ...(token ? { 'x-csrf-token': token } : {}),
    },
    credentials: 'same-origin',
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(response.status, (text ? safeJson(text) : null) as ApiErrorBody, `Erro ${response.status}`)
  }
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('event-stream')) {
    onEvent({ event: 'done', data: safeJson(await response.text()) })
    return
  }
  if (!response.body) throw new ApiError(500, { error: 'Resposta sem corpo legível.' }, 'stream')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const parsed = parseEvent(chunk)
      if (parsed) onEvent(parsed)
      boundary = buffer.indexOf('\n\n')
    }
  }
  const tail = parseEvent(buffer)
  if (tail) onEvent(tail)
}

function parseEvent(raw: string): SseEvent | null {
  const lines = raw.split('\n').map((line) => line.replace(/\r$/, ''))
  let event = 'message'
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
  }
  if (dataLines.length === 0) return null
  const text = dataLines.join('\n')
  let data: unknown = text
  if (text.startsWith('{') || text.startsWith('[')) data = safeJson(text)
  return { event, data }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date)
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return `${Math.round(seconds)} s`
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ${String(minutes % 60).padStart(2, '0')} min`
}

export class Debouncer<T extends unknown[]> {
  private handle: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly fn: (...args: T) => void, private readonly ms = 320) {}

  run(...args: T): void {
    if (this.handle) clearTimeout(this.handle)
    this.handle = setTimeout(() => this.fn(...args), this.ms)
  }

  cancel(): void {
    if (this.handle) clearTimeout(this.handle)
    this.handle = null
  }
}
