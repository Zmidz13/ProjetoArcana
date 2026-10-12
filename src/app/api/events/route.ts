import { z } from 'zod'

import { ensureDb } from '@/server/bootstrap.ts'
import { UsageEventSchema } from '@/server/api-schemas.ts'
import { getDb } from '@/db/index.ts'
import { logUsage } from '@/server/repositories.ts'
import { authContext, json, readJson, route, takeQuota } from '@/server/http.ts'

/**
 * `POST /api/events` — telemetria de experiência.
 *
 * Guarda apenas números e chaves (duração do ritual, se houve fallback de WebGL, se o
 * áudio foi desligado, erros de cliente). Não recebe texto de perguntas nem conteúdo de
 * leituras: o esquema não tem campo para isso. Serve para o ecrã de diagnóstico e para
 * saber quantas pessoas ficam no caminho.
 */
export const dynamic = 'force-dynamic'

export const POST = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const quota = takeQuota(`${ctx.limitKey}:eventos`, { capacity: 240, refillPerMinute: 120 })
  if (!quota.ok) return json({ ok: false, error: 'limite' }, { status: 201 })
  const batch = await readJson(req, z.array(UsageEventSchema).min(1).max(20))
  const db = await getDb()
  for (const event of batch) {
    await logUsage(db, {
      userId: ctx.user?.id ?? null,
      kind: event.kind,
      ...(event.section ? { section: event.section } : {}),
      latencyMs: event.ms,
      fallback: event.kind === 'fallback-webgl' || event.kind === 'erro-cliente',
    })
  }
  return json({ ok: true, recorded: batch.length }, { status: 202 })
})
