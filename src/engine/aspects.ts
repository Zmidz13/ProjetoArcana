/**
 * Aspetos astrológicos entre as cartas de uma tiragem.
 *
 * Fonte das correspondências: o campo `astro` de cada carta (attributions clássicas da
 * Golden Dawn / Livro T de Mathers para os menores — 7 planetas clássicos × 12 signos —
 * e signos/planetas para os maiores). Não inventamos atribuições: quando o texto não
 * permite extrair signo, a carta simplesmente não entra no cálculo de aspetos, e isso é
 * reportado no `warnings` da análise.
 */

export type ElementKey = 'fire' | 'water' | 'air' | 'earth'
export type AspectKind = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'

export interface Aspect {
  kind: AspectKind
  a: string
  b: string
  signA: string
  signB: string
  /** Ângulo entre os dois signos, em graus (0–180). */
  orbDeg: number
  harmony: 'desafio' | 'fluxo' | 'foco'
}

export const SIGNS_PT = [
  'Áries',
  'Touro',
  'Gémeos',
  'Caranguejo',
  'Leão',
  'Virgem',
  'Balança',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
] as const

export type SignPt = (typeof SIGNS_PT)[number]

/**
 * Alias ortográficos encontrados no conteúdo. O baralho segue a nomenclatura tradicional
 * portuguesa dos signos ("Carneiro"), que coexiste com a forma astronómica ("Áries").
 */
export const SIGN_ALIASES: Record<string, SignPt> = {
  Carneiro: 'Áries',
  Aries: 'Áries',
  'Balança': 'Balança',
  Libra: 'Balança',
  Escorpiao: 'Escorpião',
  'Escorpião': 'Escorpião',
  Peixes: 'Peixes',
  'Caranguejo': 'Caranguejo',
}

export const SIGN_ELEMENT: Record<SignPt, ElementKey> = {
  'Áries': 'fire',
  Touro: 'earth',
  'Gémeos': 'air',
  'Caranguejo': 'water',
  'Leão': 'fire',
  Virgem: 'earth',
  'Balança': 'air',
  'Escorpião': 'water',
  'Sagitário': 'fire',
  Capricórnio: 'earth',
  'Aquário': 'air',
  Peixes: 'water',
}

export const SIGN_MODALITY: Record<SignPt, 'cardinal' | 'fixed' | 'mutable'> = {
  'Áries': 'cardinal',
  Touro: 'fixed',
  'Gémeos': 'mutable',
  'Caranguejo': 'cardinal',
  'Leão': 'fixed',
  Virgem: 'mutable',
  'Balança': 'cardinal',
  'Escorpião': 'fixed',
  'Sagitário': 'mutable',
  Capricórnio: 'cardinal',
  'Aquário': 'fixed',
  Peixes: 'mutable',
}

export const PLANETS = ['Sol', 'Lua', 'Mercúrio', 'Vénus', 'Vénis', 'Marte', 'Júpiter', 'Saturno'] as const

export const PLANET_ELEMENT: Record<string, ElementKey> = {
  Sol: 'fire',
  Lua: 'water',
  'Mercúrio': 'air',
  'Vénus': 'water',
  'Vénis': 'water',
  Marte: 'fire',
  'Júpiter': 'fire',
  Saturno: 'earth',
}

/** Relações de aspeto usadas: conjunção 0°, sextil 60°, quadratura 90°, trígono 120°, oposição 180°. */
const ASPECT_TABLE: [AspectKind, number, Aspect['harmony']][] = [
  ['conjunction', 0, 'foco'],
  ['sextile', 60, 'fluxo'],
  ['square', 90, 'desafio'],
  ['trine', 120, 'fluxo'],
  ['opposition', 180, 'desafio'],
]

export function signFor(astro: string | null | undefined): SignPt | null {
  if (!astro) return null
  for (const sign of SIGNS_PT) {
    const tokens = [sign, ...Object.keys(SIGN_ALIASES).filter((alias) => SIGN_ALIASES[alias] === sign)]
    for (const token of tokens) {
      const re = new RegExp(`(^|[^a-zà-ÿ])(em|de|no|na)\\s+${escapeRe(token)}([^a-zà-ÿ]|$)`, 'i')
      if (re.test(astro)) return sign
      if (new RegExp(`^${escapeRe(token)}([^a-zà-ÿ]|$)`, 'i').test(astro.trim())) return sign
    }
  }
  return null
}

export function planetFor(astro: string | null | undefined): string | null {
  if (!astro) return null
  for (const p of PLANETS) if (new RegExp(`\\b${escapeRe(p)}\\b`).test(astro)) return p === 'Vénis' ? 'Vénus' : p
  return null
}

/** Signo "solto" (sem planeta): usado pelos maiores que são regidos por um signo. */
export function barePlanetFor(astro: string | null | undefined): string | null {
  if (!astro) return null
  const trimmed = astro.trim()
  for (const p of PLANETS) if (trimmed === p) return p === 'Vénis' ? 'Vénus' : p
  return null
}

/** Sub-elemento dos trunfos numerados ("Fogo da Água") e raízes dos poderes. */
export function elementalDignity(astro: string | null | undefined): { suit: ElementKey; sub: ElementKey } | null {
  if (!astro) return null
  const m = /(Fogo|Água|Ar|Terra)\s+da?\s+(Fogo|Água|Ar|Terra)/i.exec(astro)
  if (m) return { suit: keyOf(m[2]!), sub: keyOf(m[1]!) }
  const root = /Raiz dos Poderes (?:do|da|da)\s+(Fogo|Água|Ar|Terra)/i.exec(astro)
  if (root) return { suit: keyOf(root[1]!), sub: keyOf(root[1]!) }
  return null
}

function keyOf(pt: string): ElementKey {
  const map: Record<string, ElementKey> = { Fogo: 'fire', 'Água': 'water', Ar: 'air', Terra: 'earth' }
  return map[pt] ?? 'earth'
}

export function signElementFor(sign: SignPt | null): ElementKey | null {
  return sign ? SIGN_ELEMENT[sign] : null
}

export function modalityFor(sign: SignPt | null): 'cardinal' | 'fixed' | 'mutable' | null {
  return sign ? SIGN_MODALITY[sign] : null
}

/**
 * Ângulo mínimo entre dois signos e o aspeto mais próximo, com orbe.
 * Os signos ocupam 30° cada; usamos a distância entre os seus inícios, que é o
 * método estrutural (não depende de graus decanais) adequado a um tabuleiro de cartas.
 */
export function angleBetween(a: SignPt, b: SignPt): number {
  const ia = SIGNS_PT.indexOf(a)
  const ib = SIGNS_PT.indexOf(b)
  const raw = Math.abs(ia - ib) * 30
  return Math.min(raw, 360 - raw)
}

export function aspectForPair(a: SignPt, b: SignPt, orb = 8): Aspect | null {
  const deg = angleBetween(a, b)
  let best: { kind: AspectKind; harmony: Aspect['harmony']; err: number } | null = null
  for (const [kind, target, harmony] of ASPECT_TABLE) {
    const err = Math.abs(deg - target)
    if (err <= orb && (!best || err < best.err)) best = { kind, harmony, err }
  }
  if (!best) return null
  return { kind: best.kind, a: '', b: '', signA: a, signB: b, orbDeg: deg, harmony: best.harmony }
}

export interface AspectInputCard {
  id: string
  astro: string
  arcana: 'major' | 'minor'
  number: number
}

export function aspectsFor(cards: AspectInputCard[], orb = 8): Aspect[] {
  const signs = cards.map((c) => ({ id: c.id, sign: signFor(c.astro) }))
  const out: Aspect[] = []
  for (let i = 0; i < signs.length; i++) {
    for (let j = i + 1; j < signs.length; j++) {
      const a = signs[i]!
      const b = signs[j]!
      if (!a.sign || !b.sign) continue
      const aspect = aspectForPair(a.sign, b.sign, orb)
      if (!aspect) continue
      out.push({ ...aspect, a: a.id, b: b.id })
    }
  }
  return out.sort((x, y) => x.orbDeg - y.orbDeg)
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
