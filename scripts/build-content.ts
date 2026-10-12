/**
 * Constrói o conteúdo validado do ARCANA.
 *
 *   node --experimental-strip-types scripts/build-content.ts [--check]
 *
 * Pipeline:
 *   content/pt-PT/**  →  layout engine  →  validação Zod  →  src/domain/data/*.json
 *
 * `--check` não escreve ficheiros: é o modo usado em CI e em `npm run content:validate`.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BASE_CARDS } from '../content/pt-PT/cards/index.ts'
import { SPREAD_DRAFTS } from '../content/pt-PT/spreads/index.ts'
import { CardListSchema, SpreadSchema } from '../src/domain/schema.ts'
import { layoutFor, separateOverlaps, bounds } from '../src/engine/layout.ts'
import type { SpreadDef, SpreadPosition } from '../src/domain/types.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const OUT_DIR = join(root, 'src/domain/data')
const checkOnly = process.argv.includes('--check')

const errors: string[] = []
const notes: string[] = []

function fail(msg: string) {
  errors.push(msg)
}

/* ───────────────────────────── 1 · Cartas ───────────────────────────── */

/**
 * Normalizador do formato de autoria.
 *
 * O conteúdo é escrito de forma plana (mais legível de rever), enquanto o modelo
 * canónico agrupa os campos em `domains` e `guidance`. Esta função faz a ponte e
 * garante que ambas as formas são aceites — assim o painel administrativo pode
 * gravar no formato canónico sem reescrever o autorado.
 */
function normalizeCard(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.domains && raw.guidance) return raw
  const domainKeys = ['psychology', 'emotional', 'love', 'career', 'finances', 'growth', 'spirituality'] as const
  const guidanceKeys = ['obstacles', 'opportunities', 'advice', 'reflection'] as const
  const out: Record<string, unknown> = { ...raw }
  const domains: Record<string, unknown> = {}
  for (const k of domainKeys) {
    if (out[k] !== undefined) {
      domains[k] = out[k]
      delete out[k]
    }
  }
  const guidance: Record<string, unknown> = {}
  for (const k of guidanceKeys) {
    if (out[k] !== undefined) {
      guidance[k] = out[k]
      delete out[k]
    }
  }
  if (Object.keys(domains).length) out.domains = domains
  if (Object.keys(guidance).length) out.guidance = guidance
  return out
}

const CARDS = BASE_CARDS.map((c) => normalizeCard(c as unknown as Record<string, unknown>)) as unknown as typeof BASE_CARDS

const cardsParse = CardListSchema.safeParse(CARDS)
if (!cardsParse.success) {
  for (const issue of cardsParse.error.issues) {
    fail(`carta ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
  }
}

/** Completeness do baralho tradicional: 22 maiores + 4 × 14 menores. */
const majorNumbers = new Set(CARDS.filter((c) => c.arcana === 'major').map((c) => c.number))
for (let n = 0; n <= 21; n++) {
  if (!majorNumbers.has(n)) fail(`falta o Arcano Maior número ${n}`)
}
for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
  const ids = new Set(CARDS.filter((c) => c.suit === suit).map((c) => c.id))
  for (const suffix of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'page', 'knight', 'queen', 'king']) {
    if (!ids.has(`minor-${suit}-${suffix}`)) fail(`falta a carta minor-${suit}-${suffix}`)
  }
}
if (CARDS.length !== 78) fail(`esperavam-se 78 cartas, existem ${CARDS.length}`)

/** Verificação de glifos: cada chave usada tem de constar na união de `types.ts`. */
const typesSrc = readFileSync(join(root, 'src/domain/types.ts'), 'utf8')
const glyphUnion = /export type GlyphKey =([\s\S]*?)(?=\n\n)/.exec(typesSrc)?.[1] ?? ''
const declaredGlyphs = new Set([...glyphUnion.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1] as string))
const usedGlyphs = new Map<string, string[]>()
for (const card of CARDS) {
  for (const g of card.art.glyphs) {
    if (!declaredGlyphs.has(g)) fail(`${card.id}: glifo "${g}" não existe na união GlyphKey`)
    usedGlyphs.set(g, [...(usedGlyphs.get(g) ?? []), card.id])
  }
}
notes.push(`glifos usados: ${usedGlyphs.size} de ${declaredGlyphs.size} declarados`)

/**
 * Materialização simétrica das relações simbólicas.
 * O conteúdo autorado é direccional (cada carta declara as suas ligações); o build
 * garante que o grafo é não-dirigido, acrescentando a aresta inversa sempre que falta.
 * Isto é o que permite ao motor falar de "combinações" sem ter de duplicar escrita à mão.
 */
/** O parâmetro é o tipo das cartas já normalizadas: sem casts, porque o `derived` faz parte
 * do registo de relação desde o início (`src/domain/types.ts`). */
function symmetriseRelations(cards: typeof CARDS) {
  const index = new Map(cards.map((c, i) => [c.id, i]))
  const added: string[] = []
  for (const card of cards) {
    for (const rel of card.relations) {
      const targetIdx = index.get(rel.card)
      if (targetIdx === undefined) continue
      const target = cards[targetIdx]!
      if (target.relations.some((r) => r.card === card.id)) continue
      target.relations.push({ card: card.id, kind: rel.kind, note: rel.note, derived: true })
      added.push(`${card.id} → ${rel.card}`)
    }
  }
  return added
}

const addedRelations = symmetriseRelations(CARDS)
notes.push(`ligações simétricas materializadas: ${addedRelations.length}`)

for (const card of CARDS) {
  for (const rel of card.relations) {
    if (!byIdSafe(card, rel, CARDS)) fail(`${card.id}: relação aponta para carta inexistente "${rel.card}"`)
  }
}
function byIdSafe(card: (typeof CARDS)[number], rel: { card: string }, list: typeof CARDS) {
  void card
  return list.some((c) => c.id === rel.card)
}

/* ───────────────────────────── 2 · Tiragens ─────────────────────────── */

function buildSpread(draft: (typeof SPREAD_DRAFTS)[number]): SpreadDef {
  const count = draft.positions.length
  const positions: SpreadPosition[] = []
  const points = draft.explicitLayout
    ? draft.positions.map((p) => ({ x: p.x ?? 0.5, y: p.y ?? 0.5, rotation: p.rotation ?? 0, scale: p.scale ?? 1 }))
    : layoutFor(draft.shape, {
        count,
        ...(draft.layout?.radius !== undefined ? { radius: draft.layout.radius } : {}),
        ...(draft.layout?.cx !== undefined ? { cx: draft.layout.cx } : {}),
        ...(draft.layout?.cy !== undefined ? { cy: draft.layout.cy } : {}),
        ...(draft.layout?.cols !== undefined ? { cols: draft.layout.cols } : {}),
        ...(draft.layout?.gap !== undefined ? { gap: draft.layout.gap } : {}),
        ...(draft.layout?.rows !== undefined ? { rows: draft.layout.rows } : {}),
        ...(draft.layout?.startAngle !== undefined ? { startAngle: draft.layout.startAngle } : {}),
        ...(draft.layout?.sweep !== undefined ? { sweep: draft.layout.sweep } : {}),
        ...(draft.layout?.tilt !== undefined ? { tilt: draft.layout.tilt } : {}),
        ...(draft.layout?.curve !== undefined ? { curve: draft.layout.curve } : {}),
      })

  const finalPoints = draft.separate ? separateOverlaps(points) : points

  finalPoints.forEach((pt, i) => {
    const src = draft.positions[i]
    if (!src) return
    const p: SpreadPosition = {
      id: src.id ?? `${draft.id}-${String(i + 1).padStart(2, '0')}`,
      label: src.label,
      description: src.description,
      x: pt.x,
      y: pt.y,
    }
    if (pt.rotation) p.rotation = Number(pt.rotation.toFixed(1))
    if (pt.scale !== 1) p.scale = Number(pt.scale.toFixed(2))
    if (src.group) p.group = src.group
    if (src.links?.length) p.links = src.links
    positions.push(p)
  })

  if (positions.length !== count) {
    fail(`${draft.id}: ${positions.length} posições geradas para ${count} declaradas`)
  }

  // Ligações por índice (@n) → id da posição
  const idOf = (ref: string) => {
    const m = /^@(\d+)$/.exec(ref)
    if (!m) return ref
    return positions[Number(m[1]) - 1]?.id ?? ref
  }
  for (const p of positions) {
    if (p.links) p.links = p.links.map(idOf)
  }

  const readingOrder = positions.slice(draft.readingFrom ?? 0).map((p) => p.id)

  // Ligações de leitura (arcos de energia no VFX): quando o autor não as declarou,
  // derivamos da geometria + grupos + ordem de leitura. Nunca inventamos posições.
  if (positions.some((p) => !p.links || p.links.length === 0)) {
    const byId = new Map(positions.map((p) => [p.id, p]))
    const dist = (a: SpreadPosition, b: SpreadPosition) => Math.hypot(a.x - b.x, a.y - b.y)
    const order = readingOrder.map((id) => byId.get(id)!).filter(Boolean)
    for (let i = 0; i < order.length; i++) {
      const p = order[i]!
      if (p.links?.length) continue
      const candidates: { id: string; score: number }[] = []
      const next = order[i + 1]
      const prev = order[i - 1]
      if (next) candidates.push({ id: next.id, score: dist(p, next) - 0.02 })
      if (prev) candidates.push({ id: prev.id, score: dist(p, prev) + 0.02 })
      for (const q of order) {
        if (q === p || q.id === next?.id || q.id === prev?.id) continue
        if (p.group && q.group && p.group === q.group) candidates.push({ id: q.id, score: dist(p, q) })
      }
      candidates.sort((a, b) => a.score - b.score)
      const near = candidates.filter((c) => c.score <= 0.34).slice(0, count > 12 ? 2 : 2)
      if (near.length) p.links = near.map((c) => c.id)
    }
  }

  const structure = draft.structure
    ? {
        kind: draft.structure.kind,
        blocks: draft.structure.blocks.map((b) => ({
          id: b.id,
          label: b.label,
          positions: b.positions.map((i) => positions[i]?.id ?? b.id),
          ...(b.note ? { note: b.note } : {}),
        })),
      }
    : undefined

  // Agrupamentos automáticos para mobile (tiragens com muitas cartas precisam de paginação)
  let mobileLayout: SpreadDef['mobileLayout']
  if (count > 4) {
    const perPage = count > 20 ? 12 : count > 10 ? 4 : 3
    const groups = new Map<string, string[]>()
    for (const p of positions) {
      const key = p.group ?? 'geral'
      groups.set(key, [...(groups.get(key) ?? []), p.id])
    }
    const pageGroups: { label: string; positions: string[] }[] = []
    for (const [key, ids] of groups) {
      for (let i = 0; i < ids.length; i += perPage) {
        pageGroups.push({
          label: `${key === 'geral' ? 'Bloco' : key.replace(/[-_]/g, ' ')} ${Math.floor(i / perPage) + 1}`.trim(),
          positions: ids.slice(i, i + perPage),
        })
      }
    }
    const b = bounds(positions.map((p) => ({ x: p.x, y: p.y, rotation: p.rotation ?? 0, scale: p.scale ?? 1 })))
    mobileLayout = {
      shape: count > 20 ? 'carousel' : b.h > b.w ? 'column' : 'grid-2',
      pageGroups,
    }
  }

  const spread: SpreadDef = {
    id: draft.id,
    name: draft.name,
    category: draft.category,
    shape: draft.shape,
    summary: draft.summary,
    purpose: draft.purpose,
    whenToUse: draft.whenToUse,
    cardCount: count,
    positions,
    readingOrder,
    tags: draft.tags,
    estimatedMinutes: draft.estimatedMinutes,
    cinematic: draft.cinematic ?? 'medio',
    difficulty: draft.difficulty ?? 'iniciante',
    author: draft.author ?? 'arcana',
    ...(structure ? { structure } : {}),
    ...(draft.themes ? { themes: draft.themes } : {}),
    ...(mobileLayout ? { mobileLayout } : {}),
    ...(draft.requiresAccounts ? { requiresAccounts: true } : {}),
  }
  return spread
}

const spreads: SpreadDef[] = SPREAD_DRAFTS.map(buildSpread)

for (const spread of spreads) {
  const parsed = SpreadSchema.safeParse(spread)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fail(`tiragem ${issue.path.join('.')}: ${issue.message}`)
  }
  // Distância mínima entre posições (evita cartas sobrepostas sem sentido)
  const pts = spread.positions
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i]!
      const b = pts[j]!
      if ((a.rotation ?? 0) !== (b.rotation ?? 0) || (a.scale ?? 1) !== (b.scale ?? 1)) continue
      const d = Math.hypot(b.x - a.x, (b.y - a.y) * 1.18)
      const min = spread.cardCount > 20 ? 0.02 : 0.055
      if (d < min) fail(`${spread.id}: posições "${a.label}" e "${b.label}" demasiado próximas (${d.toFixed(3)} < ${min})`)
    }
  }
}

const spreadIds = new Set(spreads.map((s) => s.id))
if (spreadIds.size !== spreads.length) fail('ids de tiragem duplicados')
for (const spread of spreads) {
  for (const p of spread.positions) {
    for (const link of p.links ?? []) {
      if (!spread.positions.some((q) => q.id === link)) fail(`${spread.id}.${p.id}: link quebrado "${link}"`)
    }
  }
}

// Nomes de tiragem únicos e não vazios
const names = new Map<string, string>()
for (const s of spreads) {
  const key = s.name.toLowerCase()
  if (names.has(key)) fail(`nome de tiragem duplicado: "${s.name}"`)
  names.set(key, s.id)
}

/* ───────────────────────────── 3 · Índice temático ───────────────────────────── */

const themeIndex: Record<string, string[]> = {}
for (const s of spreads) {
  for (const t of s.themes ?? []) {
    themeIndex[t.theme] = themeIndex[t.theme] ?? []
    if (!themeIndex[t.theme]?.includes(s.id)) themeIndex[t.theme]?.push(s.id)
  }
}

/* ───────────────────────────── 4 · Saída ───────────────────────────── */

const payload = {
  generator: 'scripts/build-content.ts',
  locale: 'pt-PT',
  deckId: 'arcana-classico',
  cardCount: BASE_CARDS.length,
  spreadCount: spreads.length,
  cards: CARDS,
  spreads,
  themeIndex,
}

if (errors.length) {
  console.error(`\n✖ build-content: ${errors.length} problema(s) encontrado(s)\n`)
  for (const e of errors.slice(0, 60)) console.error('  • ' + e)
  if (errors.length > 60) console.error(`  … e mais ${errors.length - 60}`)
  process.exit(1)
}

if (!checkOnly) {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'content.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8')
  const digest = {
    builtAt: new Date().toISOString(),
    cards: CARDS.length,
    spreads: spreads.length,
    positions: spreads.reduce((a, s) => a + s.cardCount, 0),
    hash: (await import('node:crypto')).createHash('sha256').update(JSON.stringify({ cards: CARDS, spreads })).digest('hex').slice(0, 16),
  }
  writeFileSync(join(OUT_DIR, 'content.meta.json'), JSON.stringify(digest, null, 2) + '\n', 'utf8')
}

console.log(
  `✔ build-content: ${CARDS.length} cartas · ${spreads.length} tiragens · ${spreads.reduce((a, s) => a + s.cardCount, 0)} posições${checkOnly ? ' (--check)' : ''}`,
)
for (const n of notes) console.log('  · ' + n)

void existsSync
