import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

import type { z } from 'zod'

import { getDb } from '@/db/index.ts'
import type { SqlValue } from '@/db/types.ts'
import {
  createSession,
  findUserByHandle,
  revokeSession,
  sessionUser,
  SESSION_COOKIE,
  verifyPassword,
  type PublicUser,
} from '@/server/repositories.ts'

/**
 * Camada HTTP partilhada por todas as rotas da API.
 *
 * Decisões de segurança (requisito 12 do caderno de encargos):
 *  - A cookie de sessão é `httpOnly` + `SameSite=Lax`; o token aleatório nunca é
 *    armazenado — a base de dados só guarda o seu HMAC com o segredo do servidor.
 *  - Toda a mutação autenticada exige `X-CSRF-Token` igual ao valor derivado da cookie
 *    legível `arcana_csrf` (double-submit) **e** origem/`Sec-Fetch-Site` compatível.
 *  - Nenhum segredo (chave de IA, pepper, hash de palavra-passe) é serializado para o
 *    cliente: as rotas devolvem apenas estado resolvido (`provider`, `model`, limites).
 */

export const CSRF_COOKIE = 'arcana_csrf'
export const DEVICE_COOKIE = 'arcana_device'
export const SESSION_TTL_DAYS = 30

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'erro',
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/* ─────────────────────────── segredo do servidor ─────────────────────────── */

let processPepper = ''

/**
 * Segredo usado para HMAC de sessões, CSRF e ids anónimos.
 * Em produção deve vir de `ARCANA_SESSION_SECRET`; sem ele o processo gera um segredo
 * efémero (as sessões morrem ao reiniciar) e avisa no arranque — nunca usa um valor fixo.
 */
export function sessionPepper(): string {
  const fromEnv = process.env.ARCANA_SESSION_SECRET ?? process.env.AUTH_SECRET ?? ''
  if (fromEnv) return fromEnv
  if (!processPepper) {
    processPepper = createHmac('sha256', 'arcana-efemero').update(`${process.pid}:${Date.now()}`).digest('hex')
    console.warn('[arcana] ARCANA_SESSION_SECRET ausente — a usar segredo efémero; as sessões não sobrevivem a reinícios.')
  }
  return processPepper
}

/* ─────────────────────────── respostas ─────────────────────────── */

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers ?? {}),
    },
  })
}

export function fail(status: number, message: string, code = 'erro', details?: unknown): Response {
  return json({ error: message, code, ...(details === undefined ? {} : { details }) }, { status })
}

export function unauthorized(message = 'É preciso iniciar sessão para fazer isto.'): Response {
  return fail(401, message, 'nao_autenticado')
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return fail(429, `Demasiados pedidos seguidos. Tenta de novo em ${retryAfterSeconds} segundos.`, 'limite_atingido', {
    retryAfterSeconds,
  })
}

/** Converte qualquer erro em resposta HTTP; nunca expõe pilhas nem SQL ao cliente. */
export function toResponse(error: unknown): Response {
  if (error instanceof HttpError) return fail(error.status, error.message, error.code, error.details)
  const message = error instanceof Error ? error.message : String(error)
  console.error('[arcana] erro não tratado na rota:', message)
  return fail(500, 'Não foi possível completar o pedido.', 'erro_interno')
}

export async function readJson<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    throw new HttpError(400, 'O corpo do pedido não é JSON válido.', 'json_invalido')
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    throw new HttpError(
      422,
      'O pedido não cumpre o formato esperado.',
      'validacao',
      parsed.error.issues.map((issue) => ({ campo: issue.path.join('.') || '(raiz)', problema: issue.message })),
    )
  }
  return parsed.data as z.infer<T>
}

/* ─────────────────────────── cookies ─────────────────────────── */

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.get('cookie')
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx <= 0) continue
    const name = part.slice(0, idx).trim()
    if (!name) continue
    const value = part.slice(idx + 1).trim()
    try {
      out[name] = decodeURIComponent(value)
    } catch {
      out[name] = value
    }
  }
  return out
}

export interface CookieAttributes {
  maxAge?: number
  path?: string
  sameSite?: 'lax' | 'strict' | 'none'
  secure?: boolean
  httpOnly?: boolean
}

export function serializeCookie(name: string, value: string, attrs: CookieAttributes = {}): string {
  const bits = [`${name}=${encodeURIComponent(value)}`, `Path=${attrs.path ?? '/'}`]
  if (attrs.maxAge !== undefined) bits.push(`Max-Age=${Math.max(0, Math.floor(attrs.maxAge))}`)
  bits.push(`SameSite=${attrs.sameSite === 'none' ? 'None' : attrs.sameSite === 'strict' ? 'Strict' : 'Lax'}`)
  if (attrs.secure) bits.push('Secure')
  if (attrs.httpOnly) bits.push('HttpOnly')
  return bits.join('; ')
}

export function appendCookie(res: Response, cookie: string): void {
  const previous = res.headers.getSetCookie?.() ?? []
  res.headers.set('set-cookie', [...previous, cookie].join(', '))
}

export function isSecureRequest(req: Request): boolean {
  const proto = req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '')
  return proto === 'https'
}

/* ─────────────────────────── CSRF ─────────────────────────── */

/**
 * Token CSRF derivado da sessão (HMAC com o segredo do servidor). É o valor que vai no
 * cookie legível e que o cliente repete no cabeçalho `X-CSRF-Token`: sem o segredo não é
 * possível fabricá-lo, e um pedido de outra origem não consegue lê-lo.
 */
export function csrfTokenFor(sessionToken: string | null): string {
  return createHmac('sha256', sessionPepper()).update(`csrf:${sessionToken ?? 'anon'}`).digest('hex').slice(0, 32)
}

/**
 * Comparação de origem à prova de proxies e de `next start -H 0.0.0.0`.
 *
 * Comparar o `Origin` contra `req.url` não chega: em vários modos de arranque (bind a
 * 0.0.0.0, Contentores, o preview desta sessão) o URL interno do handler carrega o endereço
 * de escuta, não o nome que o navegador usou — e pedidos legítimos passariam a 403. Por isso:
 *  1. `Sec-Fetch-Site: same-origin` (definido pelo navegador, não falsificável entre origens)
 *     é prova suficiente e curto-circuita a verificação;
 *  2. sem esse cabeçalho, comparamos o host do `Origin` com o cabeçalho `Host` (o que o
 *     navegador realmente usou), ignorando a porta quando ela é a padrão do esquema;
 *  3. `ARCANA_PUBLIC_URL` é aceite como origem adicional, para installs atrás de proxy reverso.
 */
function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null
  let host: string
  try {
    host = value.includes('://') ? new URL(value).host : value
  } catch {
    return null
  }
  host = host.trim().toLowerCase().replace(/\.$/, '')
  const withoutPort = host.replace(/:(80|443)$/, '')
  return withoutPort
}

export function allowedOrigins(req: Request): (string | null)[] {
  const publicUrl = process.env.ARCANA_PUBLIC_URL
  return [
    normalizeHost(req.headers.get('host')),
    normalizeHost(req.headers.get('x-forwarded-host')),
    normalizeHost(publicUrl),
    normalizeHost(new URL(req.url, 'http://localhost').host),
  ]
}

export function assertSameOrigin(req: Request): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return
  const site = req.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') throw new HttpError(403, 'Pedido vindo de outra origem não é permitido.', 'csrf')
  if (site === 'same-origin') return
  const origin = req.headers.get('origin')
  if (!origin) return
  const requested = normalizeHost(origin)
  if (!requested) throw new HttpError(403, 'Origem inválida.', 'csrf')
  if (allowedOrigins(req).includes(requested)) return
  throw new HttpError(403, 'Origem não reconhecida.', 'csrf')
}

/**
 * O token CSRF enviado ao cliente no login é `<hash>:<nonce>`; o cookie guarda o `<hash>`.
 * Aceitar só a coincidência do hash evita ter de guardar o nonce em lado nenhum.
 */
export function assertCsrf(req: Request, authenticated: boolean): void {
  if (!authenticated) return
  const cookies = parseCookies(req)
  const provided = cookies[CSRF_COOKIE] ?? ''
  const expected = csrfTokenFor(cookies[SESSION_COOKIE] ?? null)
  if (!provided) throw new HttpError(403, 'Falta o cookie CSRF.', 'csrf')
  if (!req.headers.get('x-csrf-token')) throw new HttpError(403, 'Falta o cabeçalho X-CSRF-Token.', 'csrf')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(provided, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(403, 'O token CSRF não corresponde à sessão.', 'csrf')
  if (req.headers.get('x-csrf-token') !== provided) throw new HttpError(403, 'Cabeçalho e cookie CSRF divergem.', 'csrf')
}

/* ─────────────────────────── sessão / contexto ─────────────────────────── */

export interface RequestContext {
  user: PublicUser | null
  /** Id anónimo estável: permite leituras e preferências sem conta. */
  deviceId: string
  sessionToken: string | null
  /** Chave usada em quotas e eventos de utilização (nunca contém segredos). */
  limitKey: string
  /** Cabeçalhos de limpeza/renovação de cookies a aplicar na resposta. */
  cookies: string[]
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local'
}

/** Identificador anónimo: cookie própria se existir, senão deriva de IP+UA (estável por rede). */
export function deviceId(req: Request): string {
  const stored = parseCookies(req)[DEVICE_COOKIE]
  if (stored && /^[a-f0-9]{32,64}$/.test(stored)) return stored
  return createHmac('sha256', sessionPepper())
    .update(`device:${clientIp(req)}:${req.headers.get('user-agent') ?? ''}`)
    .digest('hex')
    .slice(0, 40)
}

export async function authContext(req: Request): Promise<RequestContext> {
  const cookies = parseCookies(req)
  const sessionToken = cookies[SESSION_COOKIE] ?? null
  const device = deviceId(req)
  const base: RequestContext = {
    user: null,
    deviceId: device,
    sessionToken,
    limitKey: `dev:${device.slice(0, 16)}`,
    cookies: [],
  }
  if (!sessionToken) {
    // Dispositivo novo: entrega-se uma cookie anónima para que as leituras sem conta
    // persistam entre visitas.
    if (!cookies[DEVICE_COOKIE]) {
      base.cookies.push(serializeCookie(DEVICE_COOKIE, device, { maxAge: 60 * 60 * 24 * 400, httpOnly: true, sameSite: 'lax', secure: isSecureRequest(req) }))
    }
    return base
  }
  const db = await getDb()
  const user = await sessionUser(db, sessionToken, sessionPepper())
  if (!user) return base
  return { ...base, user, limitKey: `usr:${user.id}` }
}

export interface Owned {
  ctx: RequestContext
  /** `null` quando o visitante é anónimo: as leituras ficam ligadas ao dispositivo. */
  userId: string | null
}

export async function ownership(req: Request): Promise<Owned> {
  const ctx = await authContext(req)
  return { ctx, userId: ctx.user?.id ?? null }
}

export async function requireUser(req: Request): Promise<{ ctx: RequestContext; user: PublicUser }> {
  const ctx = await authContext(req)
  if (!ctx.user) throw new HttpError(401, 'É preciso iniciar sessão para fazer isto.', 'nao_autenticado')
  return { ctx, user: ctx.user }
}

export interface AuthPayload {
  handle: string
  displayName?: string
  email?: string
  password: string
}

/** Regista (ou autentica) e devolve a resposta com cookies de sessão + CSRF já aplicados. */
export async function issueSession(req: Request, handle: string): Promise<Response> {
  const db = await getDb()
  const found = await findUserByHandle(db, handle)
  if (!found) throw new HttpError(401, 'Credenciais incorretas.', 'credenciais')
  const session = await createSession(db, found.id, SESSION_TTL_DAYS, {
    userAgent: req.headers.get('user-agent')?.slice(0, 240) ?? undefined,
    ipHash: createHmac('sha256', sessionPepper()).update(clientIp(req)).digest('hex').slice(0, 32),
    pepper: sessionPepper(),
  })
  const user = await sessionUser(db, session.token, sessionPepper())
  const csrf = csrfTokenFor(session.token)
  const res = json(
    {
      user,
      csrfToken: csrf,
      expiresAt: session.expiresAt,
    },
    { status: 200 },
  )
  const secure = isSecureRequest(req)
  const maxAge = SESSION_TTL_DAYS * 86400
  appendCookie(res, serializeCookie(SESSION_COOKIE, session.token, { maxAge, httpOnly: true, sameSite: 'lax', secure }))
  appendCookie(res, serializeCookie(CSRF_COOKIE, csrf, { maxAge, sameSite: 'lax', secure }))
  appendCookie(res, serializeCookie(DEVICE_COOKIE, deviceId(req), { maxAge: maxAge + 86400, httpOnly: true, sameSite: 'lax', secure }))
  return res
}

export async function authenticate(req: Request, input: AuthPayload): Promise<Response> {
  const db = await getDb()
  const found = await findUserByHandle(db, input.handle.toLowerCase())
  if (!found || !verifyPassword(input.password, found.password_hash)) {
    // espera mínima implícita: o scrypt já custa ~80 ms, suficiente contra força bruta leve
    throw new HttpError(401, 'Utilizador ou palavra-passe incorretos.', 'credenciais')
  }
  return issueSession(req, found.handle)
}

export function logoutResponse(req: Request): Response {
  const res = json({ ok: true })
  const secure = isSecureRequest(req)
  appendCookie(res, serializeCookie(SESSION_COOKIE, '', { maxAge: 0, httpOnly: true, sameSite: 'lax', secure }))
  appendCookie(res, serializeCookie(CSRF_COOKIE, '', { maxAge: 0, sameSite: 'lax', secure }))
  return res
}

export async function endSession(req: Request): Promise<void> {
  const token = parseCookies(req)[SESSION_COOKIE]
  if (!token) return
  const db = await getDb()
  await revokeSession(db, token, sessionPepper())
}

/* ─────────────────────────── quota (cesto de tokens) ─────────────────────────── */

interface Bucket {
  tokens: number
  updated: number
}

const buckets = new Map<string, Bucket>()

export interface QuotaOptions {
  capacity: number
  refillPerMinute: number
  cost?: number
}

/**
 * Limite local por chave (utilizador, dispositivo ou IP). Em várias instâncias o limite
 * global é o do próprio provedor; este cesto protege o processo e o orçamento imediato.
 */
export function takeQuota(key: string, options: QuotaOptions): { ok: true; remaining: number } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now()
  const current = buckets.get(key) ?? { tokens: options.capacity, updated: now }
  const refilled = Math.min(options.capacity, current.tokens + ((now - current.updated) / 60000) * options.refillPerMinute)
  const cost = options.cost ?? 1
  if (refilled < cost) {
    buckets.set(key, { tokens: refilled, updated: now })
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(((cost - refilled) / options.refillPerMinute) * 60)) }
  }
  buckets.set(key, { tokens: refilled - cost, updated: now })
  return { ok: true, remaining: Math.floor(refilled - cost) }
}

export function quotaSnapshot(key: string, options: { capacity: number; refillPerMinute: number }): { used: number; capacity: number; windowMinutes: number } {
  const bucket = buckets.get(key)
  return {
    used: Math.max(0, Math.round(options.capacity - (bucket?.tokens ?? options.capacity))),
    capacity: options.capacity,
    windowMinutes: options.capacity / options.refillPerMinute,
  }
}

/** Usada apenas nos testes para isolar estado global. */
export function resetQuota(): void {
  buckets.clear()
}

/* ─────────────────────────── SSE ─────────────────────────── */

export interface SseEvent {
  event: string
  data: unknown
}

/** Codificador SSE partilhado pelas rotas de interpretação e conversa. */
export function sseStream(produce: (send: (event: SseEvent) => void, signal: AbortSignal) => Promise<void>): Response {
  const encoder = new TextEncoder()
  const abort = new AbortController()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const send = ({ event, data }: SseEvent) => {
        if (closed) return
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }
      try {
        await produce(send, abort.signal)
      } catch (error) {
        send({ event: 'error', data: { message: error instanceof Error ? error.message : String(error) } })
      } finally {
        closed = true
        controller.close()
      }
    },
    cancel() {
      abort.abort()
    },
  })
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}

/* ─────────────────────────── utilidades SQL ─────────────────────────── */

export async function queryRows<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const db = await getDb()
  const result = await db.query<T>(sql, params)
  return result.rows
}

export async function queryOne<T>(sql: string, params: SqlValue[] = []): Promise<T | null> {
  const rows = await queryRows<T>(sql, params)
  return rows[0] ?? null
}

export function newId(): string {
  return randomUUID()
}

/* ─────────────────────────── wrapper de rota ─────────────────────────── */

export type RouteHandler<Ctx = { params: Promise<Record<string, string>> }> = (req: Request, ctx: Ctx) => Promise<Response> | Response

export interface RouteOptions {
  /** `same-origin` é sempre verificado em mutações; `csrf` exige também o token double-submit. */
  csrf?: boolean
  /** Quota local: `capacity` pedidos por `refillPerMinute` por chave (dispositivo/utilizador). */
  quota?: { capacity: number; refillPerMinute: number }
}

/**
 * Envolvente única de todas as rotas: garante verificação de origem, quota e que
 * qualquer excepção devolve JSON legível em vez de uma página de erro do Next.
 */
export function route<Ctx = { params: Promise<Record<string, string>> }>(handler: RouteHandler<Ctx>, options: RouteOptions = {}): RouteHandler<Ctx> {
  return async (req: Request, ctx: Ctx) => {
    try {
      assertSameOrigin(req)
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && options.quota) {
        const key = `${req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE' ? 'mut' : 'get'}:${deviceId(req)}`
        const quota = takeQuota(key, options.quota)
        if (!quota.ok) return tooManyRequests(quota.retryAfterSeconds)
      }
      return await handler(req, ctx)
    } catch (error) {
      return toResponse(error)
    }
  }
}

/** Igual a `route`, mas corre também `assertCsrf` quando há sessão iniciada. */
export function secureRoute<Ctx = { params: Promise<Record<string, string>> }>(handler: RouteHandler<Ctx>, options: RouteOptions = {}): RouteHandler<Ctx> {
  return route<Ctx>(async (req, ctx) => {
    const ctx2 = await authContext(req)
    assertCsrf(req, !!ctx2.user)
    return handler(req, ctx)
  }, options)
}
