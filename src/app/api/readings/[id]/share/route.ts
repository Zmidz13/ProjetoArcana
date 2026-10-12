import { z } from 'zod'

import { ensureDb } from '@/server/bootstrap.ts'
import { authContext, json, readJson, route } from '@/server/http.ts'
import { toggleShare } from '@/server/service.ts'

/**
 * `POST /api/readings/[id]/share` — publica ou retira o link de partilha.
 *
 * A partilha é um token aleatório em `readings.share_token`; `/shared/[token]` serve
 * somente a distribuição e a interpretação, nunca a conta nem as notas privadas.
 */
export const dynamic = 'force-dynamic'

const ShareSchema = z.object({ share: z.boolean().default(true) })

type Params = { params: Promise<{ id: string }> }

export const POST = route<Params>(async (req, { params }) => {
  await ensureDb()
  const { id } = await params
  const ctx = await authContext(req)
  const body = await readJson(req, ShareSchema)
  const result = await toggleShare(id, body.share, ctx.user?.id ?? null, ctx.deviceId)
  return json({ ...result, url: result.shareToken ? `/partilha/${result.shareToken}` : null })
})
