import { aiStatus, getRuntime, resetRuntime } from '@/ai/index.ts'
import { ensureDb } from '@/server/bootstrap.ts'
import { authContext, json, route } from '@/server/http.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { usageTotals } from '@/server/repositories.ts'
import { getDb } from '@/db/index.ts'

/**
 * `GET /api/ai/status`
 *
 * O que o utilizador precisa de saber antes de mandar texto para um modelo: quem é o
 * provedor, que modelo, se há chave configurada e quanto já foi gasto. As chaves vivem só
 * no servidor e não aparecem aqui — nem o nome da variável de ambiente é revelado com o
 * valor, só se está definida.
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const prefs = mergePreferences(ctx.user?.preferences ?? {})
  const status = aiStatus()
  const usage = ctx.user ? await usageTotals(await getDb(), ctx.user.id, 30) : null
  return json({
    ...status,
    keyConfigured: !!process.env.ARCANA_AI_API_KEY,
    modelOverrideAllowed: process.env.ARCANA_ALLOW_BODY_KEY === '1',
    streaming: getRuntime().provider ? true : false,
    sections: ['opening', 'per-card', 'combinations', 'synthesis', 'guidance', 'closing'],
    localFallback: 'O motor simbólico + narrativo produz a leitura completa A–G sem rede.',
    defaults: { useLlm: prefs.ai.useLlm, shareContext: prefs.ai.shareContext, dailyBudgetUsd: prefs.ai.dailyBudgetUsd, maxOutputTokens: prefs.ai.maxOutputTokens },
    usage30d: usage,
    cache: { sections: getRuntime().cache.size, replies: getRuntime().chatCache.size },
  })
})

/** `POST /api/ai/status` com `{reset:true}` limpa o runtime (usado em testes e no ecrã de diagnóstico). */
export const POST = route(async (req: Request) => {
  await ensureDb()
  const body = (await req.json().catch(() => ({}))) as { reset?: boolean }
  if (body.reset) resetRuntime()
  return json(aiStatus())
})
