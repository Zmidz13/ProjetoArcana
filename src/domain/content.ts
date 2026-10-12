import raw from './data/content.json'
import rawMeta from './data/content.meta.json'
import { ContentPayloadSchema } from './schema.ts'
import type { CardDef, SpreadDef } from './types.ts'

/**
 * Porta de entrada única para o conteúdo.
 *
 * A UI e o servidor só leem `src/domain/data/content.json` (gerado por
 * `npm run content:build`) e nunca os ficheiros de autoramento em `content/pt-PT`.
 * Assim o pipeline tem um único caminho validado: conteúdo → schema Zod → tipos de runtime.
 */

export interface ContentMeta {
  builtAt: string
  cards: number
  spreads: number
  positions: number
  hash: string
}

const parsed = ContentPayloadSchema.safeParse(raw)
if (!parsed.success) {
  const issues = parsed.error.issues
    .slice(0, 12)
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(
    `content.json inválido — corre \`npm run content:validate\` e depois \`npm run content:build\`.\n${issues}`,
  )
}

const payload = parsed.data
export const contentMeta = rawMeta as ContentMeta
/*
 * `as unknown as` é intencional e limitado a um ponto: o `ContentPayloadSchema` valida
 * estrutura e comprimentos em runtime, mas mantém `glyphs: string[]` (o Zod não conhece a
 * união `GlyphKey`, que é gerada a partir do próprio conteúdo). A verificação glifo-a-glifo
 * é feita em `scripts/build-content.ts`, que falha o build se um glifo não estiver declarado
 * na união — portanto o JSON em `data/content.json` já cumpre o contrato de tipos.
 */
export const CARDS: CardDef[] = payload.cards as unknown as CardDef[]
export const SPREADS: SpreadDef[] = payload.spreads
export const THEME_INDEX: Record<string, string[]> = payload.themeIndex ?? {}
export const DECK_IDS: string[] = CARDS.map((c) => c.id)

const cardIndex = new Map<string, CardDef>(CARDS.map((c) => [c.id, c]))
const spreadIndex = new Map<string, SpreadDef>(SPREADS.map((s) => [s.id, s]))
const byName = new Map<string, CardDef>(CARDS.map((c) => [c.name.pt.toLowerCase(), c]))

export function getCard(id: string): CardDef | undefined {
  return cardIndex.get(id)
}

/** Atalho para a UI: aceita id ou nome em português ("O Louco"). */
export function getCardByName(name: string): CardDef | undefined {
  return cardIndex.get(name) ?? byName.get(name.toLowerCase())
}

export function requireCard(id: string): CardDef {
  const card = cardIndex.get(id)
  if (!card) throw new Error(`carta desconhecida: ${id}`)
  return card
}

export function getSpread(id: string): SpreadDef | undefined {
  return spreadIndex.get(id)
}

export function requireSpread(id: string): SpreadDef {
  const spread = spreadIndex.get(id)
  if (!spread) throw new Error(`tiragem desconhecida: ${id}`)
  return spread
}

export function spreadsByCategory(category: string): SpreadDef[] {
  return SPREADS.filter((s) => s.category === category)
}

export function spreadsByTheme(keyword: string): SpreadDef[] {
  const key = normalize(keyword)
  for (const [theme, ids] of Object.entries(THEME_INDEX)) {
    if (normalize(theme) !== key) continue
    return ids.map((id) => spreadIndex.get(id)).filter((s): s is SpreadDef => Boolean(s))
  }
  return []
}

export function matchThemeKeywords(text: string): { keyword: string; count: number }[] {
  const haystack = normalize(text)
  const hits: { keyword: string; count: number }[] = []
  for (const [theme, ids] of Object.entries(THEME_INDEX)) {
    const needle = normalize(theme)
    if (needle.length < 4) continue
    let count = 0
    let from = haystack.indexOf(needle)
    while (from >= 0) {
      count++
      from = haystack.indexOf(needle, from + needle.length)
    }
    if (count) hits.push({ keyword: theme, count: count + Math.min(ids.length, 3) * 0.15 })
  }
  return hits.sort((a, b) => b.count - a.count)
}

function normalize(v: string): string {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

export function majors(): CardDef[] {
  return CARDS.filter((c) => c.arcana === 'major')
}

export function minors(suit?: string): CardDef[] {
  return CARDS.filter((c) => c.arcana === 'minor' && (!suit || c.suit === suit))
}

/**
 * Número de campos semânticos por carta (folhas do registo, incluindo as listas de
 * conselhos/reflexão e os domínios). É usado na UI para provar que não é um registo vazio.
 */
function leafCount(value: unknown, depth = 0): number {
  if (value === null || value === undefined) return 0
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') {
    let total = 0
    for (const item of Object.values(value as Record<string, unknown>)) {
      total += item !== null && typeof item === 'object' && depth < 3 ? leafCount(item, depth + 1) : 1
    }
    return total
  }
  return 1
}

const FIELDS_PER_CARD = Math.min(...CARDS.map((card) => leafCount(card)))

export const CONTENT_STATS = {
  fieldsPerCard: FIELDS_PER_CARD,
  cards: CARDS.length,
  majors: majors().length,
  minors: minors().length,
  spreads: SPREADS.length,
  positions: SPREADS.reduce((s, x) => s + x.cardCount, 0),
  categories: [...new Set(SPREADS.map((s) => s.category))].length,
  shapes: [...new Set(SPREADS.map((s) => s.shape))].length,
  relations: CARDS.reduce((sum, card) => sum + card.relations.length, 0),
  glyphs: CARDS.reduce((sum, card) => sum + card.art.glyphs.length, 0),
}

/** Todos os ids de cartas usados em `relations`, para verificação de integridade. */
export function relationTargets(): Set<string> {
  const set = new Set<string>()
  for (const card of CARDS) for (const rel of card.relations ?? []) set.add(rel.card)
  return set
}
