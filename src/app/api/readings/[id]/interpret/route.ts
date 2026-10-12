import { ensureDb } from '@/server/bootstrap.ts'
import { InterpretSchema } from '@/server/api-schemas.ts'
import { aiStatus, getRuntime } from '@/ai/index.ts'
import { authContext, HttpError, json, readJson, route, sseStream, takeQuota } from '@/server/http.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { logUsage, usageTotals } from '@/server/repositories.ts'
import { generateInterpretation } from '@/server/reading-helpers.ts'
import { storedReading } from '@/server/service.ts'

/**
 * `POST /api/readings/[id]/interpret`
 *
 * Gera a leitura A–G. Dois canais, mesmo motor:
 *  - `stream: true` (padrão) → Server-Sent Events: `meta`, um `section` por secção
 *    concluída (ou `fallback` quando o modelo não passou a validação de esquema), e `done`
 *    com a interpretação completa. O ecrã mostra o texto local a ser substituído secção a
 *    secção, o que é exactamente o comportamento do pipeline.
 *  - `stream: false` → JSON único (usado por testes, exportações e modo offline).
 *
 * Orçamento: o limite diário por utilizador (`preferences.ai.dailyBudgetUsd`) é comparado
 * com o custo já acumulado do dia; ao ultrapassá-lo a leitura continua — com o motor
 * local — e a resposta diz-no explicitamente. Nunca falha uma leitura por falta de IA.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 300

type Params = { params: Promise<{ id: string }> }

export const POST = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const body = await readJson(req, InterpretSchema)
  const { db, reading } = await storedReading(id, ctx.user?.id ?? null, ctx.deviceId)

  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const status = aiStatus()
  const wantsLlm = body.useLlm && prefs.ai.useLlm && status.enabled && getRuntime().provider !== null
  let budgetNote = ''
  let llmAllowed = wantsLlm
  if (wantsLlm && ctx.user) {
    const today = await usageTotals(db, ctx.user.id, 1)
    if (prefs.ai.dailyBudgetUsd > 0 && today.cost >= prefs.ai.dailyBudgetUsd) {
      llmAllowed = false
      budgetNote = `Orçamento diário de IA atingido (${today.cost.toFixed(4)} USD / limite ${prefs.ai.dailyBudgetUsd} USD): esta leitura foi gerada pelo motor local.`
    }
  }
  if (llmAllowed) {
    const quota = takeQuota(`${ctx.limitKey}:ai`, { capacity: 12, refillPerMinute: 2 })
    if (!quota.ok) throw new HttpError(429, `Atingiste o limite de pedidos de IA. Tenta de novo em ${quota.retryAfterSeconds}s.`, 'limite_atingido', { retryAfterSeconds: quota.retryAfterSeconds })
  }

  const options = {
    voice: body.voice,
    register: body.register,
    depth: body.depth,
    mode: (llmAllowed ? 'hibrido' : 'local') as 'hibrido' | 'local',
    includeHistory: body.includeHistory,
    ...(body.querentContext ? { querentContext: body.querentContext } : {}),
    ...(ctx.user?.displayName ? { querentName: ctx.user.displayName } : {}),
    ...(body.onlySections?.length ? { onlySections: body.onlySections } : {}),
    limitKey: ctx.limitKey,
  }

  if (!body.stream) {
    const result = await generateInterpretation(reading, ctx.user?.id ?? null, options)
    await logUsage(db, {
      userId: ctx.user?.id ?? null,
      kind: 'interpretacao',
      section: result.llm.used ? 'hibrida' : 'local',
      tokensIn: result.llm.usage.reduce((sum, use) => sum + use.promptTokens, 0),
      tokensOut: result.llm.usage.reduce((sum, use) => sum + use.completionTokens, 0),
      costUsd: result.llm.totalCostUsd,
      latencyMs: result.meta.elapsedMs,
      fallback: !result.llm.used,
    })
    return json({
      id,
      interpretation: result.interpretation,
      analysis: result.analysis,
      safety: result.safety,
      llm: result.llm,
      meta: { ...result.meta, cacheHit: result.meta.cacheHit, provider: status, budgetNote: budgetNote || undefined },
    })
  }

  const clientSignal = req.signal

  return sseStream(async (send, streamSignal) => {
    send({ event: 'meta', data: { readingId: id, mode: options.mode, provider: status.provider, model: status.model, sections: body.onlySections ?? null, budgetNote: budgetNote || null } })
    try {
      const result = await generateInterpretation(reading, ctx.user?.id ?? null, {
        ...options,
        signal: AbortSignal.any([clientSignal, streamSignal]),
        persist: true,
        onSection: (event) => send({ event: event.status === 'done' ? 'section' : 'fallback', data: event }),
      })
      await logUsage(db, {
        userId: ctx.user?.id ?? null,
        kind: 'interpretacao',
        section: result.llm.used ? 'hibrida' : 'local',
        tokensIn: result.llm.usage.reduce((sum, use) => sum + use.promptTokens, 0),
        tokensOut: result.llm.usage.reduce((sum, use) => sum + use.completionTokens, 0),
        costUsd: result.llm.totalCostUsd,
        latencyMs: result.meta.elapsedMs,
        fallback: !result.llm.used,
      })
      send({
        event: 'done',
        data: {
          interpretation: result.interpretation,
          safety: result.safety,
          llm: result.llm,
          meta: { ...result.meta, budgetNote: budgetNote || undefined },
        },
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      // O cliente já tem o texto local no ecrã: um erro aqui só cancela a reescrita.
      send({ event: 'error', data: { message, fallbackAvailable: true } })
    }
  })
})

/** Estado do motor para este pedido (sem nunca revelar chaves). */
export const GET = route<Params>(async (req, { params }) => {
  await params
  const ctx = await authContext(req)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  return json({ ...aiStatus(), localAlways: true, useLlmByDefault: prefs.ai.useLlm, dailyBudgetUsd: prefs.ai.dailyBudgetUsd })
})
