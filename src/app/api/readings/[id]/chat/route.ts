import { ensureDb } from '@/server/bootstrap.ts'
import { ChatSchema } from '@/server/api-schemas.ts'
import { aiStatus, getRuntime } from '@/ai/index.ts'
import { appendChatMessage } from '@/server/repositories.ts'
import { listChatMessages, logUsage } from '@/server/repositories.ts'
import { authContext, HttpError, json, readJson, route, takeQuota } from '@/server/http.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { safetyFor } from '@/domain/safety.ts'
import { continueStoredChat } from '@/server/reading-helpers.ts'
import { storedReading } from '@/server/service.ts'

/**
 * `POST /api/readings/[id]/chat` · `GET` = histórico da conversa.
 *
 * Conversa depois da leitura. A regra dura do caderno de encargos é imposta aqui e no
 * pipeline: o modelo recebe **apenas** as cartas efectivamente retiradas, as posições e a
 * interpretação já escrita — não pode inventar uma carta nem relançar o baralho. Quando o
 * modelo sai do âmbito (`outOfScope`) ou falha a validação, a resposta vem do motor local
 * e `usedLlm: false` diz-no explicitamente.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 120

type Params = { params: Promise<{ id: string }> }

export const GET = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const { db } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)
  return json({ messages: await listChatMessages(db, id) })
})

export const POST = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const body = await readJson(req, ChatSchema)
  const { db, reading } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const quota = takeQuota(`${ctx.limitKey}:conversa`, { capacity: 30, refillPerMinute: 10 })
  if (!quota.ok) throw new HttpError(429, `Limite de conversa atingido. Espera ${quota.retryAfterSeconds} segundos.`, 'limite_atingido', { retryAfterSeconds: quota.retryAfterSeconds })

  const safety = safetyFor(body.message)
  const chat = await continueStoredChat(reading, ctx.user?.id ?? null, {
    message: body.message,
    history: body.history,
    voice: body.voice || prefs.voice,
    focus: body.focus,
  })
  await appendChatMessage(db, { readingId: id, role: 'user', content: body.message, tokensIn: Math.ceil(body.message.length / 4) })
  await appendChatMessage(db, {
    readingId: id,
    role: 'assistant',
    content: chat.result.reply,
    tokensOut: chat.result.usage.reduce((sum, use) => sum + use.completionTokens, 0),
  })
  await logUsage(db, {
    userId: ctx.user?.id ?? null,
    kind: 'conversa',
    section: chat.result.usedLlm ? 'llm' : 'local',
    tokensIn: chat.result.usage.reduce((sum, use) => sum + use.promptTokens, 0),
    tokensOut: chat.result.usage.reduce((sum, use) => sum + use.completionTokens, 0),
    costUsd: chat.result.usage.reduce((sum, use) => sum + use.costUsd, 0),
    latencyMs: chat.result.usage.reduce((sum, use) => sum + use.latencyMs, 0),
    fallback: !chat.result.usedLlm,
  })

  return json({
    reply: chat.result.reply,
    usedLlm: chat.result.usedLlm,
    outOfScope: chat.result.outOfScope,
    focusPositions: chat.result.focusPositions,
    fromCache: chat.result.fromCache,
    safety,
    engine: aiStatus(),
    llmAvailable: getRuntime().provider !== null,
  })
})
