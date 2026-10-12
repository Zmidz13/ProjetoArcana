import { getDb } from '@/db/index.ts'
import { SpreadSchema } from '@/domain/schema.ts'
import type { SpreadCategory, SpreadDef, SpreadPosition } from '@/domain/types.ts'
import { bounds, layoutFor, separateOverlaps, type LayoutPoint } from '@/engine/layout.ts'
import { saveUserSpread } from '@/server/repositories.ts'
import { HttpError } from '@/server/http.ts'
import type { z } from 'zod'
import type { UserSpreadSchema } from '@/server/api-schemas.ts'

/**
 * Constrói uma tiragem completa a partir do formulário do criador.
 *
 * O que sai daqui passa pelo **mesmo** `SpreadSchema` do catálogo (com layout, ordem de
 * leitura, estrutura em blocos e layout mobile derivados), por isso uma tiragem própria
 * é interpretada, animada e partilhada exactamente como uma tiragem curada.
 */

type SpreadInput = z.infer<typeof UserSpreadSchema>

const RADIAL = new Set(['circle', 'mandala', 'wheel', 'star', 'horseshoe', 'path'])

function derivedStructure(shape: string, positions: SpreadPosition[]): SpreadDef['structure'] {
  const groups = new Map<string, string[]>()
  for (const position of positions) {
    const key = position.group?.trim() || position.label.trim()
    const bucket = groups.get(key) ?? []
    bucket.push(position.id)
    groups.set(key, bucket)
  }
  const blocks = [...groups.entries()].map(([label, ids]) => ({
    id: `bloco-${ids[0]}`,
    label,
    positions: ids,
    note: ids.length > 1 ? `${ids.length} posições lidas em conjunto.` : 'Posição isolada: o contraste com as vizinhas é que dá o sentido.',
  }))
  // A `kind` diz ao motor narrativo como encadear as posições: blocos com várias cartas
  // lêem-se em conjunto (nested); formas radiais lêem-se como ciclo; acima de três blocos
  // simples assume-se sequência temporal.
  const kind: 'nested' | 'radial' | 'temporal' | 'linear' = blocks.some((block) => block.positions.length > 1)
    ? 'nested'
    : RADIAL.has(shape)
      ? 'radial'
      : blocks.length > 3
        ? 'temporal'
        : 'linear'
  return { kind, blocks }
}

function mobileLayoutFor(positions: SpreadPosition[]): SpreadDef['mobileLayout'] {
  const count = positions.length
  if (count <= 2) return { shape: 'stack', pageGroups: [{ label: 'Tiragem', positions: positions.map((p) => p.id) }] }
  const shape = count <= 4 ? ('grid-2' as const) : count <= 9 ? ('grid-3' as const) : ('carousel' as const)
  const perPage = shape === 'carousel' ? 3 : count <= 4 ? 2 : 3
  const pageGroups: { label: string; positions: string[] }[] = []
  for (let index = 0; index < positions.length; index += perPage) {
    const slice = positions.slice(index, index + perPage)
    pageGroups.push({ label: slice[0]?.group ?? `Grupo ${pageGroups.length + 1}`, positions: slice.map((p) => p.id) })
  }
  return { shape, pageGroups }
}

export function assembleUserSpread(input: SpreadInput, ownerId: string): SpreadDef {
  const ids = input.positions.map((position) => position.id)
  if (new Set(ids).size !== ids.length) throw new HttpError(422, 'Duas posições partilham o mesmo identificador interno.', 'posicoes_repetidas')

  const count = input.positions.length
  const points: LayoutPoint[] = input.positions.every((p) => p.x !== undefined && p.y !== undefined)
    ? input.positions.map((p) => ({ x: p.x ?? 0.5, y: p.y ?? 0.5, rotation: p.rotation ?? 0, scale: p.scale ?? 1 }))
    : layoutFor(input.shape as never, { count })

  const positioned = separateOverlaps(points, 0.105)
  const box = bounds(positioned)
  const positions: SpreadPosition[] = input.positions.map((position, index) => {
    const point = positioned[index] ?? { x: 0.5, y: 0.5, rotation: 0, scale: 1 }
    return {
      id: position.id,
      label: position.label,
      // Coordenadas normalizadas ao centro geométrico: a mesa não depende do número de cartas.
      x: Number((((point.x - box.x) / Math.max(0.001, box.w)) * 0.72 + 0.5).toFixed(4)),
      y: Number((((point.y - box.y) / Math.max(0.001, box.h)) * 0.6 + 0.42).toFixed(4)),
      rotation: point.rotation ?? 0,
      scale: position.scale ?? point.scale ?? 1,
      description: position.meaningWhenReversed ? `${position.description} Invertida: ${position.meaningWhenReversed}` : position.description,
      links: position.linkTo ? [position.linkTo] : [],
      ...(position.group ? { group: position.group } : {}),
    }
  })

  const dangling = positions.filter((position) => position.links?.some((link) => !ids.includes(link)))
  if (dangling.length) throw new HttpError(422, `Ligações a posições inexistentes: ${dangling.map((p) => p.id).join(', ')}.`, 'ligacao_quebrada')
  // Simetrizar ligações: uma relação entre posições é sempre bidireccional no motor.
  for (const position of positions) {
    for (const link of position.links ?? []) {
      const other = positions.find((p) => p.id === link)
      if (other && !(other.links ?? []).includes(position.id)) other.links = [...(other.links ?? []), position.id]
    }
  }

  const readingOrder = input.readingOrder?.length ? input.readingOrder : ids
  if (readingOrder.length !== ids.length || readingOrder.some((id) => !ids.includes(id))) {
    throw new HttpError(422, 'A ordem de leitura tem de listar exactamente as posições criadas.', 'ordem_invalida')
  }

  const estimatedMinutes = Math.max(2, Math.min(90, Math.round(count * 1.6 + (input.shape === 'celtic-cross' || input.shape === 'mandala' ? 6 : 0))))
  const spread: SpreadDef = {
    id: `user-${ownerId.slice(0, 8)}-${stableSlug(input.name)}`,
    name: input.name,
    category: input.category as SpreadCategory,
    shape: input.shape as SpreadDef['shape'],
    summary: input.summary,
    purpose: input.purpose,
    whenToUse: input.whenToUse,
    cardCount: count,
    positions,
    readingOrder,
    structure: derivedStructure(input.shape, positions),
    tags: [input.category, input.shape, 'personalizada', ...(input.occasion ? [input.occasion] : [])],
    estimatedMinutes,
    cinematic: count >= 10 ? 'ritual' : count >= 7 ? 'alto' : count >= 4 ? 'medio' : 'baixo',
    difficulty: count <= 3 ? 'iniciante' : count <= 7 ? 'intermedio' : 'avancado',
    author: 'utilizador',
    mobileLayout: mobileLayoutFor(positions),
  }
  const parsed = SpreadSchema.safeParse(spread)
  if (!parsed.success) {
    throw new HttpError(
      422,
      'A tiragem não passou na validação canónica do catálogo.',
      'tiragem_invalida',
      parsed.error.issues.map((issue) => ({ campo: issue.path.join('.'), problema: issue.message })),
    )
  }
  return spread
}

function stableSlug(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28)
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${base || 'tiragem'}-${(hash >>> 0).toString(36).slice(0, 5)}`
}

export async function persistUserSpread(input: SpreadInput, userId: string) {
  const spread = assembleUserSpread(input, userId)
  const db = await getDb()
  const id = await saveUserSpread(db, { ...(input.id ? { id: input.id } : {}), userId, name: spread.name, definition: spread })
  return { id, spread }
}
