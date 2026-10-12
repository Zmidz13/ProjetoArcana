import { ensureDb } from '@/server/bootstrap.ts'
import { PreferencesPatchSchema } from '@/server/api-schemas.ts'
import { DEFAULT_PREFERENCES, mergePreferences, type Preferences } from '@/domain/experience.ts'
import { authContext, json, readJson, requireUser, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { savePreferences } from '@/server/repositories.ts'

/**
 * `GET /api/preferences` · `PUT /api/preferences`
 *
 * As preferências são um documento único validado por esquema (`PreferencesSchema`): a UI
 * nunca guarda objectos soltos e um campo inválido volta ao padrão em vez de rebentar a
 * aplicação. Visitantes sem conta recebem os padrões (o estado local deles vive no
 * `localStorage` e é copiado para a conta no registo, quando existe).
 */
export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  return json({ preferences: ctx.user ? mergePreferences(ctx.user.preferences) : DEFAULT_PREFERENCES, authenticated: !!ctx.user })
})

export const PUT = route(async (req: Request) => {
  await ensureDb()
  const { user } = await requireUser(req)
  const patch = await readJson(req, PreferencesPatchSchema)
  const merged: Preferences = mergePreferences({ ...user.preferences, ...stripUndefined(patch as Record<string, unknown>) })
  const db = await getDb()
  await savePreferences(db, user.id, merged as unknown as Record<string, unknown>)
  return json({ ok: true, preferences: merged })
})

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) if (entry !== undefined) out[key] = entry
  return out as Partial<T>
}
