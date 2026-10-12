import type { CardDef, SkyLayer, TerrainLayer } from '@/domain/types.ts'

import { circle, ellipse, figure, line, mix, path, pentacle, poly, rays, rect, star, text, VIEW, waves } from './svg.ts'
import { escapeXml, rng } from './svg.ts'
import { renderGlyph, type GlyphContext } from './glyphs.ts'

/**
 * Motor de ilustração do ARCANA.
 *
 * Cada carta é desenhada a partir dos dados do conteúdo (`CardDef.art`): céu, terreno,
 * glifos, paleta, cena e motivos. Não há ficheiros de imagem de terceiros nem geradores
 * aleatórios — o mesmo `id` produz sempre o mesmo desenho, o que permite servir os SVG
 * estáticos em `public/art`, animá-los por camada no cliente e reconstruí-los à mão num
 * teste.
 *
 * Camadas (por ordem de pintura):
 *   moldura → céu → astro → terreno → cena → glifos → tarja de nome → numeração
 * A cena roda 180° quando a carta sai invertida; a moldura e o nome ficam direitos, como
 * num baralho físico.
 */

export interface DeckTheme {
  key: string
  name: string
  /** Cor do papel/cartão e da tinta de contorno. */
  paper: string
  ink: string
  gild: string
  /** Espessura do filete interior e raio dos cantos. */
  keyline: number
  corner: number
  /** Estilo da textura sobreposta. */
  texture: 'liso' | 'linho' | 'graos' | 'papel-velho'
  back: BackPattern
  /** Modo de cor: `cor` usa a paleta da carta; `mono` reduz a duas tintas. */
  mode: 'cor' | 'duo' | 'mono' | 'vitral'
}

export interface BackPattern {
  kind: 'grid' | 'arcs' | 'rays' | 'weave' | 'stars' | 'diamonds' | 'labyrinth'
  density: number
}

export const DECK_THEMES: DeckTheme[] = [
  { key: 'obsidiana', name: 'Obsidiana', paper: '#14121b', ink: '#efe6d6', gild: '#c9a227', keyline: 2.2, corner: 14, texture: 'graos', back: { kind: 'arcs', density: 9 }, mode: 'cor' },
  { key: 'ouro-velho', name: 'Ouro Velho', paper: '#f3e7c9', ink: '#3b2a14', gild: '#a6791f', keyline: 2.6, corner: 12, texture: 'papel-velho', back: { kind: 'diamonds', density: 11 }, mode: 'duo' },
  { key: 'linho', name: 'Linho', paper: '#eae4d8', ink: '#2d2f33', gild: '#7f8b7a', keyline: 1.6, corner: 10, texture: 'linho', back: { kind: 'weave', density: 14 }, mode: 'duo' },
  { key: 'nanquim', name: 'Nanquim', paper: '#f7f5f0', ink: '#15161a', gild: '#15161a', keyline: 1.2, corner: 6, texture: 'liso', back: { kind: 'grid', density: 16 }, mode: 'mono' },
  { key: 'vitral', name: 'Vitrail', paper: '#0d1220', ink: '#f2e9d8', gild: '#e0b567', keyline: 3.4, corner: 4, texture: 'liso', back: { kind: 'rays', density: 12 }, mode: 'vitral' },
  { key: 'nocturno', name: 'Nocturno', paper: '#090a12', ink: '#c8d4e8', gild: '#6f8fbf', keyline: 1.8, corner: 16, texture: 'graos', back: { kind: 'stars', density: 22 }, mode: 'cor' },
  { key: 'cinza', name: 'Cinza', paper: '#25262a', ink: '#e6e6e6', gild: '#9aa0a6', keyline: 1.4, corner: 8, texture: 'linho', back: { kind: 'labyrinth', density: 8 }, mode: 'duo' },
]

export const THEME_KEYS = DECK_THEMES.map((theme) => theme.key)

export function themeByKey(key: string | null | undefined): DeckTheme {
  return DECK_THEMES.find((theme) => theme.key === key) ?? DECK_THEMES[0]!
}

const SKY: Record<SkyLayer, { top: string; bottom: string; glow: string; stars: number; clouds: number }> = {
  void: { top: '#05060c', bottom: '#0d0f1c', glow: '#2b2f55', stars: 60, clouds: 0 },
  astral: { top: '#0a0f2a', bottom: '#1b1147', glow: '#7f6fd6', stars: 48, clouds: 2 },
  dawn: { top: '#f7c887', bottom: '#5d3f78', glow: '#ffd9a0', stars: 6, clouds: 3 },
  dusk: { top: '#c65f4a', bottom: '#2b1e45', glow: '#f0956b', stars: 10, clouds: 4 },
  storm: { top: '#3b4553', bottom: '#141a24', glow: '#8fa3bd', stars: 0, clouds: 6 },
  day: { top: '#8fc4e8', bottom: '#dfeaf2', glow: '#ffffff', stars: 0, clouds: 3 },
  night: { top: '#0b1030', bottom: '#160f2e', glow: '#c7d7ff', stars: 42, clouds: 1 },
  overcast: { top: '#7d8591', bottom: '#495059', glow: '#b9c2cc', stars: 0, clouds: 5 },
  underworld: { top: '#160c14', bottom: '#050307', glow: '#8c3a2e', stars: 12, clouds: 2 },
}

interface SkyPaint {
  (ctx: SceneContext): string
}

interface SceneContext {
  card: CardDef
  theme: DeckTheme
  palette: [string, string, string]
  sky: ReturnType<typeof SKY[keyof typeof SKY] extends never ? never : () => { top: string; bottom: string; glow: string; stars: number; clouds: number }>
  random: () => number
  seed: string
  /** Área útil da cena. */
  x0: number
  y0: number
  x1: number
  y1: number
}

const TERRAIN_PAINT: Record<TerrainLayer, (ctx: SceneContext, baseY: number) => string> = {
  cliff: (ctx, baseY) => poly([[ctx.x0, baseY + 40], [ctx.x0 + 60, baseY - 6], [ctx.x0 + 108, baseY + 18], [ctx.x1, baseY + 6], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]], { fill: ctx.palette[2], 'fill-opacity': 0.9 }) + line([ctx.x0 + 60, baseY - 6], [ctx.x0 + 108, baseY + 18], { stroke: ctx.theme.ink, 'stroke-width': 1.4, opacity: 0.5 }),
  plain: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: ctx.palette[2], 'fill-opacity': 0.7 }),
  water: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[0], '#0a1a2a', 0.55), 'fill-opacity': 0.85 }) + `<g transform="translate(${ctx.x0} ${baseY - 8})" opacity="0.5">${waves(40, ctx.x1 - ctx.x0, 7, 5, { stroke: ctx.theme.ink })}</g>`,
  ruins: (ctx, baseY) => [0.1, 0.32, 0.55, 0.78].map((offset, index) => rect(ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 30 - (index % 2) * 26, 16, 60 + (index % 2) * 26, { fill: ctx.palette[2], 'fill-opacity': 0.85 })).join(''),
  garden: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[2], '#1d3a24', 0.5) }) + [0.16, 0.4, 0.66, 0.86].map((offset, index) => circle(ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 8 - index * 3, 8 + (index % 2) * 4, { fill: ctx.palette[1], opacity: 0.85 })).join(''),
  mountain: (ctx, baseY) => poly([[ctx.x0, baseY + 18], [ctx.x0 + 52, baseY - 46], [ctx.x0 + 96, baseY - 4], [ctx.x0 + 140, baseY - 62], [ctx.x0 + 186, baseY - 6], [ctx.x1, baseY + 18], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]], { fill: mix(ctx.palette[0], '#101425', 0.45) }),
  interior: (ctx, baseY) => rect(ctx.x0, baseY - 46, ctx.x1 - ctx.x0, ctx.y1 - baseY + 46, { fill: mix(ctx.palette[0], '#000000', 0.35) }) + rect(ctx.x0 + 40, baseY - 30, 44, 66, { fill: ctx.palette[1], 'fill-opacity': 0.5 }) + rect(ctx.x1 - 92, baseY - 14, 52, 50, { fill: ctx.palette[1], 'fill-opacity': 0.3 }),
  path: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[2], '#20201c', 0.45) }) + path(`M${ctx.x0 + 30},${ctx.y1}Q${ctx.x0 + 96},${baseY + 20} ${ctx.x0 + 128},${baseY - 10}`, { fill: 'none', stroke: ctx.theme.ink, 'stroke-width': 6, opacity: 0.4 }),
  sea: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[0], '#031018', 0.6) }) + `<g opacity="0.6">${[0, 1, 2, 3].map((index) => waves(baseY + 10 + index * 16, ctx.x1 - ctx.x0, 6, 4 + index, { stroke: mix(ctx.palette[1], '#ffffff', 0.3) })).join('')}</g>`,
  forest: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[2], '#0d1a12', 0.5) }) + [0.1, 0.24, 0.38, 0.52, 0.68, 0.84].map((offset, index) => poly([[ctx.x0 + (ctx.x1 - ctx.x0) * offset - 12, baseY + 6], [ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 40 - (index % 3) * 12], [ctx.x0 + (ctx.x1 - ctx.x0) * offset + 12, baseY + 6]], { fill: mix(ctx.palette[0], '#122518', 0.6) })).join(''),
  city: (ctx, baseY) => [0.06, 0.2, 0.33, 0.47, 0.61, 0.75, 0.9].map((offset, index) => rect(ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 24 - ((index * 37) % 46), 24 + (index % 3) * 8, 90, { fill: mix(ctx.palette[0], '#0b0d14', 0.4 + (index % 3) * 0.1) })).join(''),
  sky: (ctx, baseY) => `<g opacity="0.5">${[0, 1, 2].map((index) => ellipse(ctx.x0 + 40 + index * 74, baseY - 16 - index * 18, 46, 12, { fill: ctx.theme.ink, 'fill-opacity': 0.25 })).join('')}</g>`,
  desert: (ctx, baseY) => poly([[ctx.x0, baseY + 8], [ctx.x0 + 70, baseY - 18], [ctx.x0 + 140, baseY + 6], [ctx.x1, baseY - 12], [ctx.x1, ctx.y1], [ctx.x0, ctx.y1]], { fill: mix(ctx.palette[1], '#c9a26a', 0.4) }),
  cave: (ctx, baseY) => path(`M${ctx.x0},${ctx.y1}V${baseY - 30}Q${(ctx.x0 + ctx.x1) / 2},${baseY - 92} ${ctx.x1},${baseY - 30}V${ctx.y1}Z`, { fill: mix(ctx.palette[0], '#000000', 0.55) }),
  camp: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[2], '#1a1410', 0.4) }) + poly([[ctx.x0 + 60, baseY + 6], [ctx.x0 + 96, baseY - 34], [ctx.x0 + 132, baseY + 6]], { fill: ctx.palette[0] }) + circle(ctx.x0 + 168, baseY + 2, 10, { fill: '#ff9d4a' }),
  field: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[1], '#2d3a1c', 0.45) }) + [0, 1, 2, 3, 4].map((index) => line([ctx.x0 + 8, baseY + 8 + index * 12], [ctx.x1 - 8, baseY + 4 + index * 12], { stroke: ctx.theme.ink, 'stroke-width': 1, opacity: 0.25 })).join(''),
  orchard: (ctx, baseY) => rect(ctx.x0, baseY, ctx.x1 - ctx.x0, ctx.y1 - baseY, { fill: mix(ctx.palette[2], '#20301a', 0.5) }) + [0.14, 0.36, 0.58, 0.8].map((offset, index) => circle(ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 14 - (index % 2) * 10, 16, { fill: mix(ctx.palette[0], '#2c4a2a', 0.35) })).join(''),
  bridge: (ctx, baseY) => rect(ctx.x0, baseY + 16, ctx.x1 - ctx.x0, ctx.y1 - baseY - 16, { fill: mix(ctx.palette[0], '#0b1420', 0.6) }) + path(`M${ctx.x0 + 10},${baseY + 18}Q${(ctx.x0 + ctx.x1) / 2},${baseY - 34} ${ctx.x1 - 10},${baseY + 18}`, { fill: 'none', stroke: ctx.palette[2], 'stroke-width': 9 }) + [0.2, 0.4, 0.6, 0.8].map((offset) => line([ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY - 6], [ctx.x0 + (ctx.x1 - ctx.x0) * offset, baseY + 20], { stroke: ctx.palette[2], 'stroke-width': 3 })).join(''),
}

const SKY_PAINT: SkyPaint = (ctx) => {
  const sky = SKY[ctx.card.art.sky]
  const parts: string[] = []
  for (let index = 0; index < sky.stars; index += 1) {
    const x = ctx.x0 + ctx.random() * (ctx.x1 - ctx.x0)
    const y = ctx.y0 + ctx.random() * (ctx.y1 - ctx.y0) * 0.62
    const r = 0.6 + ctx.random() * 1.5
    parts.push(circle(x, y, r, { fill: '#ffffff', opacity: 0.3 + ctx.random() * 0.6 }))
  }
  for (let index = 0; index < sky.clouds; index += 1) {
    const x = ctx.x0 + 20 + ctx.random() * (ctx.x1 - ctx.x0 - 40)
    const y = ctx.y0 + 18 + ctx.random() * (ctx.y1 - ctx.y0) * 0.42
    parts.push(ellipse(x, y, 34 + ctx.random() * 26, 9 + ctx.random() * 7, { fill: '#ffffff', opacity: 0.1 + ctx.random() * 0.16 }))
  }
  return `<g data-layer="estrelas-nuvens">${parts.join('')}</g>`
}

/** Astro principal: deriva da correspondência declarada da carta (`card.astro`). */
function astroMark(ctx: SceneContext): string {
  const astro = ctx.card.astro ?? ''
  const cx = ctx.x0 + (ctx.x1 - ctx.x0) * 0.74
  const cy = ctx.y0 + 34
  if (/sol|leo|Sun/i.test(astro)) return circle(cx, cy, 13, { fill: ctx.palette[1] }) + rays(cx, cy, 17, 30, 12, { fill: ctx.palette[1], opacity: 0.85 })
  if (/lua|moon|cancer|capric/i.test(astro)) return `<g>${moonShape(cx, cy, 12, ctx.palette[1])}</g>`
  if (/merc/i.test(astro)) return circle(cx, cy, 8, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2 }) + line([cx - 10, cy + 12], [cx + 10, cy + 12], { stroke: ctx.palette[1], 'stroke-width': 2 }) + line([cx, cy - 14], [cx, cy - 8], { stroke: ctx.palette[1], 'stroke-width': 2 })
  if (/venus|ouro|tourm/i.test(astro)) return circle(cx, cy - 3, 8, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2 }) + line([cx, cy + 5], [cx, cy + 15], { stroke: ctx.palette[1], 'stroke-width': 2 }) + line([cx - 5, cy + 11], [cx + 5, cy + 11], { stroke: ctx.palette[1], 'stroke-width': 2 })
  if (/marte/i.test(astro)) return circle(cx - 3, cy - 3, 7, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2 }) + line([cx + 2, cy - 8], [cx + 11, cy - 17], { stroke: ctx.palette[1], 'stroke-width': 2 }) + path(`M${cx + 5},${cy - 17}h7v7`, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2 })
  if (/jup/i.test(astro)) return path(`M${cx - 8},${cy - 10}q8,-4 8,10t8,6`, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2.4 })
  if (/sat/i.test(astro)) return path(`M${cx - 9},${cy - 8}h10l-6,16h9`, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2.4 })
  if (/urano|neptuno|plutao/i.test(astro)) return star(cx, cy, 11, 4, 6, { fill: ctx.palette[1], opacity: 0.9 })
  return star(cx, cy, 9, 3.4, 5, { fill: ctx.palette[1], opacity: 0.75 })
}

function moonShape(cx: number, cy: number, r: number, color: string): string {
  return `<path d="M${cx + r},${cy - r}A${r},${r} 0 1 0 ${cx + r},${cy + r}A${r * 0.86},${r * 0.86} 0 1 1 ${cx + r},${cy - r}Z" fill="${color}"/>`
}

/* ─────────────────────────── arcanos maiores ─────────────────────────── */

type SceneFn = (ctx: SceneContext, figureX: number, figureY: number, height: number) => string

/**
 * Vinte e duas composições próprias — uma por maior. Cada uma usa a geometria do símbolo
 * (o que a carta realmente mostra) e é a razão pela qual os maiores se reconhecem entre si.
 */
/** Cena por número de arcano (0..21) — independente da língua do `id`. */
const MAJOR_SCENES: SceneFn[] = [
  /* 00 louco */ (ctx, x, y, h) => figure(x - 20, y, h, { arms: 'one-raised', legs: 'stride', robe: false }, { fill: ctx.palette[1] }) + circle(x + 44, y - h * 0.62, 9, { fill: ctx.palette[2] }) + poly([[x + 26, y - h * 0.2], [x + 56, y - h * 0.24], [x + 34, y + 6]], { fill: ctx.palette[0], 'fill-opacity': 0.7 }) + circle(x + 6, y + 14, 7, { fill: ctx.theme.paper, stroke: ctx.theme.ink, 'stroke-width': 1.4 }),
  /* 01 mago */ (ctx, x, y, h) => figure(x, y, h, { arms: 'holding-up', legs: 'stand', robe: true }, { fill: ctx.palette[0] }) + path(`M${x},${y - h * 1.02}q-9,-16 0,-24q9,8 0,24`, { fill: ctx.palette[1] }) + ellipse(x, y + 26, 46, 10, { fill: 'none', stroke: ctx.palette[2], 'stroke-width': 2 }) + line([x - 30, y + 20], [x - 30, y + 8], { stroke: ctx.palette[1], 'stroke-width': 3 }) + circle(x + 30, y + 14, 5, { fill: ctx.palette[1] }),
  /* 02 sacerdotisa */ (ctx, x, y, h) => figure(x, y, h, { arms: 'crossed', legs: 'stand', robe: true }, { fill: mix(ctx.palette[0], '#1c2a4a', 0.25) }) + crescentShape(x, y - h * 0.98, 12, ctx.palette[1]) + rect(x - 58, y - h * 0.9, 12, h * 0.95, { fill: ctx.palette[2], 'fill-opacity': 0.55 }) + rect(x + 46, y - h * 0.9, 12, h * 0.95, { fill: ctx.palette[2], 'fill-opacity': 0.55 }) + rect(x - 16, y + 16, 32, 22, { fill: '#f2e9d6', 'fill-opacity': 0.85 }),
  /* 03 imperatriz */ (ctx, x, y, h) => figure(x, y, h, { arms: 'open', legs: 'stand', robe: true }, { fill: ctx.palette[0] }) + crownShape(x, y - h * 0.96, 20, ctx.palette[1]) + [0, 1, 2, 3, 4].map((index) => circle(x - 42 + index * 21, y - h * 0.5 + (index % 2) * 8, 5, { fill: ctx.palette[1], opacity: 0.8 })).join('') + ellipse(x, y + 30, 52, 8, { fill: mix(ctx.palette[2], '#2e4a2a', 0.4) }),
  /* 04 imperador */ (ctx, x, y, h) => figure(x, y - 8, h * 0.94, { arms: 'holding-up', legs: 'folded', robe: true }, { fill: ctx.palette[0] }) + rect(x - 46, y - h * 0.34, 92, 44, { fill: mix(ctx.palette[2], '#4a3a2a', 0.3) }) + rect(x - 52, y + 8, 104, 12, { fill: ctx.palette[2] }) + crownShape(x, y - h * 0.92, 16, ctx.palette[1]) + ramShape(x - 44, y - h * 0.3, 9, ctx.palette[1]) + ramShape(x + 44, y - h * 0.3, 9, ctx.palette[1]),
  /* 05 hierofante */ (ctx, x, y, h) => figure(x, y, h, { arms: 'one-raised', legs: 'stand', robe: true }, { fill: ctx.palette[0] }) + tripleCross(x + 34, y - h * 0.5, 30, ctx.palette[1]) + rect(x - 60, y - h * 0.86, 10, h * 0.9, { fill: ctx.palette[2], opacity: 0.6 }) + rect(x + 50, y - h * 0.86, 10, h * 0.9, { fill: ctx.palette[2], opacity: 0.6 }) + circle(x - 26, y + 26, 5, { fill: ctx.palette[1] }) + circle(x + 26, y + 26, 5, { fill: ctx.palette[1] }),
  /* 06 amantes */ (ctx, x, y, h) => figure(x - 30, y, h * 0.82, { arms: 'open', legs: 'stand' }, { fill: ctx.palette[1] }) + figure(x + 30, y, h * 0.82, { arms: 'open', legs: 'stand' }, { fill: mix(ctx.palette[0], '#ffffff', 0.2) }) + path(`M${x - 30},${y - h * 0.7}q30,-26 60,0`, { fill: 'none', stroke: ctx.palette[2], 'stroke-width': 3 }) + treeShape(x, y - h * 0.28, 26, ctx.palette[0]) + circle(x, y - h * 0.98, 11, { fill: ctx.palette[2], opacity: 0.85 }),
  /* 07 carro */ (ctx, x, y, h) => figure(x, y - 22, h * 0.6, { arms: 'holding-up', legs: 'stand', robe: true }, { fill: ctx.palette[0] }) + rect(x - 54, y - 18, 108, 34, { fill: mix(ctx.palette[2], '#3a2a1a', 0.25) }) + circle(x - 40, y + 24, 12, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 3 }) + circle(x + 40, y + 24, 12, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 3 }) + [0, 1].map((index) => star(x - 30 + index * 60, y - 34, 6, 2.4, 8, { fill: ctx.palette[1] })).join('') + sphinx(x - 66, y + 4, 16, ctx.palette[1]) + sphinx(x + 66, y + 4, 16, ctx.palette[2]),
  /* 08 forca */ (ctx, x, y, h) => figure(x, y - 6, h * 0.8, { arms: 'open', legs: 'stand' }, { fill: ctx.palette[1] }) + path(`M${x - 26},${y - h * 0.5}a26,20 0 1 1 52,0a26,20 0 1 1 -52,0`, { fill: 'none', stroke: ctx.palette[2], 'stroke-width': 3.4 }) + path(`M${x + 34},${y - h * 0.86}q-6,12 4,16q10,-4 4,-16`, { fill: ctx.palette[0] }) + circle(x, y - h * 0.2, 4, { fill: ctx.theme.paper }),
  /* 09 eremita */ (ctx, x, y, h) => figure(x, y, h * 0.92, { arms: 'carry-staff', legs: 'stride', robe: true }, { fill: mix(ctx.palette[0], '#2a2418', 0.4) }) + line([x + 30, y - h * 0.42], [x + 30, y + 26], { stroke: ctx.palette[2], 'stroke-width': 4 }) + star(x + 30, y - h * 0.52, 13, 5, 6, { fill: ctx.palette[1] }) + poly([[x - 46, y + 26], [x, y - h * 0.16], [x + 46, y + 26]], { fill: mix(ctx.palette[2], '#1b1f2a', 0.4), 'fill-opacity': 0.8 }),
  /* 10 roda */ (ctx, x, y, h) => circle(x, y - h * 0.36, h * 0.34, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 5 }) + circle(x, y - h * 0.36, h * 0.12, { fill: ctx.palette[2], opacity: 0.8 }) + [0, 1, 2, 3, 4, 5].map((index) => line([x, y - h * 0.36], [x + Math.cos((index / 6) * Math.PI * 2) * h * 0.34, y - h * 0.36 + Math.sin((index / 6) * Math.PI * 2) * h * 0.34], { stroke: ctx.palette[1], 'stroke-width': 2.4 })).join('') + rect(x - 8, y - h * 0.06, 16, h * 0.3, { fill: ctx.palette[0] }) + [0, 1].map((side) => figure(x + (side ? 52 : -52), y + 18, h * 0.3, { arms: 'raised', legs: 'stand' }, { fill: ctx.palette[1], opacity: 0.85 })).join(''),
  /* 11 justica */ (ctx, x, y, h) => figure(x, y, h, { arms: 'holding-up', legs: 'stand', robe: true }, { fill: ctx.palette[0] }) + line([x + 40, y - h * 0.86], [x + 40, y - h * 0.3], { stroke: ctx.palette[1], 'stroke-width': 3.4 }) + bladeShape(x + 40, y - h * 0.9, 18, ctx.palette[1]) + scalesShape(x - 40, y - h * 0.6, 26, ctx.palette[2]) + rect(x - 30, y + 24, 60, 10, { fill: mix(ctx.palette[2], '#000', 0.2) }),
  /* 12 enforcado */ (ctx, x, y, h) => rect(x - 6, y - h * 0.98, 12, h * 0.44, { fill: mix(ctx.palette[2], '#4a3a24', 0.3) }) + line([x - 44, y - h * 0.96], [x + 44, y - h * 0.96], { stroke: mix(ctx.palette[2], '#4a3a24', 0.3), 'stroke-width': 9 }) + figure(x, y - h * 0.16, h * 0.66, { arms: 'crossed', legs: 'folded' }, { fill: ctx.palette[1] }) + `<g transform="rotate(180 ${x} ${y - h * 0.44})">${figure(x, y - h * 0.16, h * 0.66, { arms: 'crossed', legs: 'folded' }, { fill: ctx.palette[1] })}</g>` + halo(x, y + h * 0.1, 16, ctx.palette[2]),
  /* 13 morte */ (ctx, x, y, h) => figure(x - 6, y, h * 0.96, { arms: 'carry-staff', legs: 'stride' }, { fill: '#e9e3d3' }) + skullShape(x - 6, y - h * 0.88, 15) + scytheShape(x + 30, y - h * 0.6, 46, ctx.palette[1]) + risingSun(x + 56, y - h * 0.16, 16, ctx.palette[2]) + poly([[x - 62, y + 18], [x + 62, y + 18], [x + 52, y + 30], [x - 52, y + 30]], { fill: mix(ctx.palette[0], '#000', 0.3) }),
  /* 14 temperanca */ (ctx, x, y, h) => figure(x, y, h * 0.94, { arms: 'open', legs: 'stride' }, { fill: ctx.palette[1] }) + pourStream(x - 34, y - h * 0.28, ctx.palette[2]) + pourStream(x + 34, y - h * 0.3, mix(ctx.palette[2], '#ffffff', 0.3)) + ellipse(x, y + 26, 62, 12, { fill: mix(ctx.palette[0], '#1d3a2a', 0.5), opacity: 0.85 }) + star(x, y - h * 1.04, 10, 4, 5, { fill: ctx.palette[2] }),
  /* 15 diabo */ (ctx, x, y, h) => rect(x - 62, y - h * 0.92, 124, 10, { fill: mix(ctx.palette[2], '#000', 0.2) }) + invertedStar(x, y - h * 0.62, 30, ctx.palette[1]) + figure(x - 40, y + 16, h * 0.46, { arms: 'one-raised', legs: 'stand' }, { fill: ctx.palette[0], opacity: 0.9 }) + figure(x + 40, y + 16, h * 0.46, { arms: 'one-raised', legs: 'stand' }, { fill: ctx.palette[0], opacity: 0.75 }) + chainLinks(x, y - h * 0.1, 5, ctx.palette[2]),
  /* 16 torre */ (ctx, x, y, h) => rect(x - 20, y - h * 0.86, 40, h * 0.92, { fill: mix(ctx.palette[0], '#2a2118', 0.25) }) + path(`M${x - 26},${y - h * 0.86}L${x},${y - h * 1.06}L${x + 26},${y - h * 0.86}Z`, { fill: ctx.palette[2] }) + bolt(x + 4, y - h * 1.1, 34, ctx.palette[1]) + windowShape(x, y - h * 0.6, 10) + fallingFigure(x - 44, y - h * 0.3, 22, ctx.palette[1]) + fallingFigure(x + 46, y - h * 0.06, 20, ctx.palette[2]) + crownShape(x, y + 22, 14, ctx.palette[1]),
  /* 17 estrela */ (ctx, x, y, h) => star(x, y - h * 0.72, 26, 8, 8, { fill: ctx.palette[1] }) + [0, 1, 2, 3, 4, 5, 6].map((index) => star(x - 62 + index * 21, y - h * 0.92 + (index % 3) * 12, 6, 2.2, 8, { fill: ctx.palette[1], opacity: 0.75 })).join('') + figure(x, y + 6, h * 0.6, { arms: 'open', legs: 'kneel' }, { fill: ctx.palette[2], opacity: 0.9 }) + pourStream(x - 30, y + 18, ctx.palette[1]) + pourStream(x + 30, y + 18, ctx.palette[1]) + treeShape(x + 58, y + 8, 22, mix(ctx.palette[0], '#20401f', 0.5)),
  /* 18 lua */ (ctx, x, y, h) => moonShape(x, y - h * 0.8, 24, ctx.palette[1]) + faceMarks(x, y - h * 0.8, 24) + path(`M${x - 46},${y + 6}Q${x - 30},${y - 18} ${x - 14},${y + 6}Q${x},${y - 30} ${x + 14},${y + 6}Q${x + 30},${y - 18} ${x + 46},${y + 6}`, { fill: 'none', stroke: ctx.palette[2], 'stroke-width': 3 }) + rect(x - 64, y - h * 0.44, 12, h * 0.44, { fill: ctx.palette[0], opacity: 0.8 }) + rect(x + 52, y - h * 0.44, 12, h * 0.44, { fill: ctx.palette[0], opacity: 0.8 }) + dogShape(x - 26, y + 20, 12, ctx.palette[2]) + dogShape(x + 26, y + 20, 12, mix(ctx.palette[2], '#000', 0.3)) + pool(x, y + 42, 60, ctx.palette[1]),
  /* 19 sol */ (ctx, x, y, h) => circle(x, y - h * 0.6, 34, { fill: ctx.palette[1] }) + rays(x, y - h * 0.6, 40, 66, 18, { fill: ctx.palette[1], opacity: 0.8 }) + sunFace(x, y - h * 0.6, 34, ctx.theme.ink) + poly([[x - 70, y + 20], [x + 70, y + 20], [x + 58, y + 38], [x - 58, y + 38]], { fill: mix(ctx.palette[2], '#a4762a', 0.4) }) + sunflower(x - 44, y + 4, 11, ctx.palette[2]) + sunflower(x + 44, y + 4, 11, ctx.palette[2]) + figure(x, y + 12, h * 0.34, { arms: 'one-raised', legs: 'stride' }, { fill: mix(ctx.palette[0], '#000', 0.1), opacity: 0.85 }),
  /* 20 julgamento */ (ctx, x, y, h) => angelShape(x, y - h * 0.72, h * 0.4, ctx.palette[1]) + trumpet(x + 18, y - h * 0.6, 40, ctx.palette[2]) + coffinShape(x - 44, y + 26, 22, ctx.palette[0]) + risingFigure(x - 44, y + 12, 30, ctx.palette[2]) + risingFigure(x + 40, y + 16, 26, mix(ctx.palette[2], '#ffffff', 0.2)) + crossShape(x, y - h * 1.02, 14, ctx.palette[1]),
  /* 21 mundo */ (ctx, x, y, h) => ellipse(x, y - h * 0.44, 56, 76, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 5 }) + ellipse(x, y - h * 0.44, 44, 62, { fill: 'none', stroke: ctx.palette[1], 'stroke-width': 2.4, opacity: 0.7 }) + figure(x, y - h * 0.2, h * 0.44, { arms: 'one-raised', legs: 'stand' }, { fill: ctx.palette[2] }) + [0, 1, 2, 3].map((index) => cornerBeast(x + (index < 2 ? -72 : 72), y - h * (index % 2 ? 0.86 : 0.02), index, ctx.palette[0])).join(''),
]

/* Figuras auxiliares usadas só pelos maiores. */
function crescentShape(cx: number, cy: number, r: number, color: string): string {
  return `<path d="M${cx + r},${cy - r}A${r},${r} 0 1 0 ${cx + r},${cy + r}A${r * 0.84},${r * 0.84} 0 1 1 ${cx + r},${cy - r}Z" fill="${color}"/>`
}
function crownShape(cx: number, cy: number, size: number, color: string): string {
  return poly([[cx - size, cy + size * 0.4], [cx - size, cy - size * 0.2], [cx - size * 0.5, cy + size * 0.1], [cx, cy - size * 0.6], [cx + size * 0.5, cy + size * 0.1], [cx + size, cy - size * 0.2], [cx + size, cy + size * 0.4]], { fill: color })
}
function ramShape(cx: number, cy: number, r: number, color: string): string {
  return path(`M${cx - r},${cy}a${r},${r} 0 1 1 ${r * 0.4},${r}M${cx + r},${cy}a${r},${r} 0 1 0 ${-r * 0.4},${r}`, { fill: 'none', stroke: color, 'stroke-width': 3 })
}
function tripleCross(cx: number, cy: number, height: number, color: string): string {
  return [0, 1, 2].map((index) => line([cx - 8 + index * 4, cy + height * 0.2 - index * 9], [cx + 8 - index * 4, cy + height * 0.2 - index * 9], { stroke: color, 'stroke-width': 3.4 })).join('') + line([cx, cy - height * 0.5], [cx, cy + height * 0.3], { stroke: color, 'stroke-width': 3.4 })
}
function treeShape(cx: number, cy: number, size: number, color: string): string {
  return line([cx, cy + size], [cx, cy - size * 0.2], { stroke: color, 'stroke-width': size * 0.24 }) + circle(cx, cy - size * 0.5, size * 0.62, { fill: color, opacity: 0.9 })
}
function sphinx(cx: number, cy: number, size: number, color: string): string {
  return poly([[cx - size, cy + size * 0.6], [cx - size * 0.4, cy - size * 0.2], [cx + size * 0.2, cy - size], [cx + size * 0.6, cy - size * 0.3], [cx + size, cy + size * 0.6]], { fill: color, opacity: 0.9 })
}
function halo(cx: number, cy: number, r: number, color: string): string {
  return ellipse(cx, cy - r * 1.4, r, r * 0.34, { fill: 'none', stroke: color, 'stroke-width': 2.4 })
}
function bladeShape(cx: number, cy: number, size: number, color: string): string {
  return poly([[cx, cy - size], [cx + size * 0.22, cy], [cx, cy + size * 0.2], [cx - size * 0.22, cy]], { fill: color })
}
function scalesShape(cx: number, cy: number, size: number, color: string): string {
  return line([cx - size, cy], [cx + size, cy], { stroke: color, 'stroke-width': 2.6 }) + path(`M${cx - size},${cy}a${size * 0.4},${size * 0.4} 0 0 0 ${size * 0.8},0Z`, { fill: color, opacity: 0.8 }) + path(`M${cx + size * 0.2},${cy}a${size * 0.4},${size * 0.4} 0 0 0 ${size * 0.8},0Z`, { fill: color, opacity: 0.8 })
}
function skullShape(cx: number, cy: number, r: number): string {
  return circle(cx, cy, r, { fill: '#f0ece0' }) + rect(cx - r * 0.55, cy + r * 0.6, r * 1.1, r * 0.5, { fill: '#f0ece0' }) + circle(cx - r * 0.36, cy - r * 0.1, r * 0.2, { fill: '#17151a' }) + circle(cx + r * 0.36, cy - r * 0.1, r * 0.2, { fill: '#17151a' })
}
function scytheShape(cx: number, cy: number, size: number, color: string): string {
  return line([cx - size * 0.5, cy + size], [cx + size * 0.3, cy - size * 0.6], { stroke: color, 'stroke-width': 3.4 }) + path(`M${cx + size * 0.3},${cy - size * 0.6}Q${cx - size * 0.6},${cy - size * 0.9} ${cx - size * 0.9},${cy - size * 0.3}Q${cx - size * 0.2},${cy - size * 0.5} ${cx + size * 0.3},${cy - size * 0.6}Z`, { fill: color })
}
function risingSun(cx: number, cy: number, r: number, color: string): string {
  return path(`M${cx - r},${cy}A${r},${r} 0 0 1 ${cx + r},${cy}Z`, { fill: color, opacity: 0.9 }) + [0, 1, 2, 3, 4].map((index) => line([cx - r + index * (r / 2), cy - 2], [cx - r + index * (r / 2), cy - r * 0.6], { stroke: color, 'stroke-width': 1.6 })).join('')
}
function pourStream(cx: number, cy: number, color: string): string {
  return path(`M${cx},${cy}q6,20 -4,34q-4,10 6,16`, { fill: 'none', stroke: color, 'stroke-width': 3.4, opacity: 0.9 }) + ellipse(cx + 2, cy + 54, 12, 4, { fill: color, opacity: 0.5 })
}
function invertedStar(cx: number, cy: number, size: number, color: string): string {
  return `<g transform="rotate(180 ${cx} ${cy})">${star(cx, cy, size, size * 0.42, 5, { fill: 'none', stroke: color, 'stroke-width': 3 })}</g>`
}
function bolt(cx: number, cy: number, size: number, color: string): string {
  return poly([[cx, cy], [cx - size * 0.36, cy + size * 0.44], [cx + size * 0.08, cy + size * 0.44], [cx - size * 0.24, cy + size], [cx + size * 0.4, cy + size * 0.36], [cx - size * 0.04, cy + size * 0.36], [cx + size * 0.26, cy]], { fill: color })
}
function windowShape(cx: number, cy: number, r: number): string {
  return circle(cx, cy, r, { fill: '#ffd9a0', opacity: 0.95 })
}
function fallingFigure(cx: number, cy: number, size: number, color: string): string {
  return `<g transform="rotate(140 ${cx} ${cy})">${figure(cx, cy, size * 2.2, { arms: 'raised', legs: 'stride' }, { fill: color, opacity: 0.9 })}</g>`
}
function sunFace(cx: number, cy: number, r: number, ink: string): string {
  return circle(cx - r * 0.3, cy - r * 0.12, r * 0.09, { fill: ink }) + circle(cx + r * 0.3, cy - r * 0.12, r * 0.09, { fill: ink }) + path(`M${cx - r * 0.3},${cy + r * 0.3}Q${cx},${cy + r * 0.56} ${cx + r * 0.3},${cy + r * 0.3}`, { fill: 'none', stroke: ink, 'stroke-width': 2 })
}
function sunflower(cx: number, cy: number, r: number, color: string): string {
  return rays(cx, cy, r * 0.5, r, 10, { fill: color }) + circle(cx, cy, r * 0.42, { fill: '#4a2f14' })
}
function dogShape(cx: number, cy: number, size: number, color: string): string {
  return path(`M${cx - size},${cy}q2,-${size} ${size * 1.4},-${size * 0.8}q${size * 0.6},0 ${size * 0.4},${size * 0.5}l0,${size * 0.5}h-${size * 1.8}Z`, { fill: color, opacity: 0.9 })
}
function faceMarks(cx: number, cy: number, r: number): string {
  return (
    circle(cx - r * 0.3, cy - r * 0.16, r * 0.09, { fill: '#2b2418' }) +
    circle(cx + r * 0.26, cy - r * 0.16, r * 0.09, { fill: '#2b2418' }) +
    path(`M${cx - r * 0.26},${cy + r * 0.28}Q${cx},${cy + r * 0.5} ${cx + r * 0.26},${cy + r * 0.24}`, { fill: 'none', stroke: '#2b2418', 'stroke-width': 1.6 })
  )
}
function pool(cx: number, cy: number, width: number, color: string): string {
  return ellipse(cx, cy, width * 0.5, width * 0.14, { fill: color, opacity: 0.4 }) + line([cx - width * 0.3, cy], [cx + width * 0.3, cy], { stroke: color, 'stroke-width': 1.6, opacity: 0.8 })
}
function angelShape(cx: number, cy: number, size: number, color: string): string {
  return figure(cx, cy + size * 0.5, size, { arms: 'raised', legs: 'float', robe: true }, { fill: color }) + path(`M${cx - size * 0.5},${cy}Q${cx - size * 0.9},${cy - size * 0.6} ${cx - size * 0.2},${cy - size * 0.35}Z`, { fill: '#f6f1e4', opacity: 0.9 }) + path(`M${cx + size * 0.5},${cy}Q${cx + size * 0.9},${cy - size * 0.6} ${cx + size * 0.2},${cy - size * 0.35}Z`, { fill: '#f6f1e4', opacity: 0.9 })
}
function trumpet(cx: number, cy: number, size: number, color: string): string {
  return path(`M${cx},${cy}l${size},${-size * 0.24}l0,${size * 0.5}l-${size},${-size * 0.12}Z`, { fill: color })
}
function coffinShape(cx: number, cy: number, size: number, color: string): string {
  return poly([[cx - size * 0.5, cy], [cx - size * 0.28, cy - size * 0.7], [cx + size * 0.28, cy - size * 0.7], [cx + size * 0.5, cy], [cx + size * 0.3, cy + size * 0.7], [cx - size * 0.3, cy + size * 0.7]], { fill: color, opacity: 0.85 })
}
function risingFigure(cx: number, cy: number, size: number, color: string): string {
  return figure(cx, cy, size, { arms: 'raised', legs: 'kneel' }, { fill: color, opacity: 0.9 })
}
function crossShape(cx: number, cy: number, size: number, color: string): string {
  return line([cx, cy - size], [cx, cy + size * 0.6], { stroke: color, 'stroke-width': 3.4 }) + line([cx - size * 0.5, cy - size * 0.4], [cx + size * 0.5, cy - size * 0.4], { stroke: color, 'stroke-width': 3.4 })
}
function chainLinks(cx: number, cy: number, count: number, color: string): string {
  let out = ''
  for (let index = 0; index < count; index += 1) out += ellipse(cx - count * 6 + index * 12, cy, 6, 4, { fill: 'none', stroke: color, 'stroke-width': 2 })
  return out
}
function cornerBeast(cx: number, cy: number, index: number, color: string): string {
  const tone = index % 2 ? mix(color, '#ffffff', 0.25) : color
  if (index === 0) return bookShape(cx, cy, tone)
  if (index === 1) return cupShape(cx, cy, tone)
  if (index === 2) return swordShape(cx, cy, tone)
  return pentacle(cx, cy, 11, { fill: 'none', stroke: tone, 'stroke-width': 2.4 })
}
function bookShape(cx: number, cy: number, color: string): string {
  return rect(cx - 9, cy - 7, 18, 14, { fill: color, opacity: 0.9 })
}
function cupShape(cx: number, cy: number, color: string): string {
  return path(`M${cx - 8},${cy - 6}q8,14 16,0Z`, { fill: color, opacity: 0.9 })
}
function swordShape(cx: number, cy: number, color: string): string {
  return poly([[cx, cy - 9], [cx + 5, cy + 6], [cx - 5, cy + 6]], { fill: color, opacity: 0.9 })
}

/* ─────────────────────────── menores ─────────────────────────── */

/** Arranjos canónicos de pips (as cartas numeradas lêem-se por estas grelhas). */
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.26], [0.5, 0.74]],
  3: [[0.5, 0.2], [0.3, 0.62], [0.7, 0.62]],
  4: [[0.3, 0.26], [0.7, 0.26], [0.3, 0.74], [0.7, 0.74]],
  5: [[0.3, 0.24], [0.7, 0.24], [0.5, 0.5], [0.3, 0.76], [0.7, 0.76]],
  6: [[0.3, 0.22], [0.7, 0.22], [0.3, 0.5], [0.7, 0.5], [0.3, 0.78], [0.7, 0.78]],
  7: [[0.5, 0.16], [0.3, 0.34], [0.7, 0.34], [0.3, 0.6], [0.7, 0.6], [0.3, 0.84], [0.7, 0.84]],
  8: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.42], [0.7, 0.42], [0.3, 0.64], [0.7, 0.64], [0.3, 0.86], [0.7, 0.86]],
  9: [[0.3, 0.16], [0.7, 0.16], [0.3, 0.38], [0.7, 0.38], [0.5, 0.5], [0.3, 0.62], [0.7, 0.62], [0.3, 0.84], [0.7, 0.84]],
  10: [[0.3, 0.14], [0.7, 0.14], [0.3, 0.36], [0.7, 0.36], [0.5, 0.25], [0.5, 0.47], [0.3, 0.58], [0.7, 0.58], [0.3, 0.82], [0.7, 0.82]],
}

function suitPip(suit: string | null, cx: number, cy: number, size: number, card: CardDef, palette: [string, string, string]): string {
  const fill = { fill: palette[0], opacity: 0.95 }
  if (suit === 'wands') return line([cx, cy + size * 0.5], [cx, cy - size * 0.5], { stroke: mix(palette[2], '#6a4a22', 0.35), 'stroke-width': size * 0.22, 'stroke-linecap': 'round' }) + circle(cx, cy - size * 0.56, size * 0.14, { fill: palette[1] })
  if (suit === 'cups') return path(`M${cx - size * 0.42},${cy - size * 0.3}Q${cx},${cy + size * 0.5} ${cx + size * 0.42},${cy - size * 0.3}Z`, fill) + ellipse(cx, cy - size * 0.32, size * 0.44, size * 0.12, { fill: palette[1] })
  if (suit === 'swords') return poly([[cx, cy - size * 0.55], [cx + size * 0.16, cy + size * 0.2], [cx, cy + size * 0.42], [cx - size * 0.16, cy + size * 0.2]], fill) + line([cx - size * 0.34, cy + size * 0.16], [cx + size * 0.34, cy + size * 0.16], { stroke: palette[1], 'stroke-width': size * 0.1 })
  if (suit === 'pentacles') return pentacle(cx, cy, size * 0.44, { fill: 'none', stroke: palette[1], 'stroke-width': size * 0.09 }) + circle(cx, cy, size * 0.1, { fill: palette[0], opacity: 0.6 })
  return star(cx, cy, size * 0.4, size * 0.16, 6, { fill: palette[1] })
}

function courtPosture(rank: string | null): { posture: Parameters<typeof figure>[3]; crown: boolean; mount: boolean } {
  switch (rank) {
    case 'page':
      return { posture: { arms: 'one-raised', legs: 'stand' }, crown: false, mount: false }
    case 'knight':
      return { posture: { arms: 'carry-staff', legs: 'stride' }, crown: false, mount: true }
    case 'queen':
      return { posture: { arms: 'open', legs: 'stand', robe: true }, crown: true, mount: false }
    case 'king':
      return { posture: { arms: 'holding-up', legs: 'stand', robe: true }, crown: true, mount: false }
    default:
      return { posture: { arms: 'open', legs: 'stand' }, crown: false, mount: false }
  }
}

/* ─────────────────────────── composição final ─────────────────────────── */

export interface RenderOptions {
  orientation?: 'upright' | 'reversed'
  theme?: string
  /** Dimensões do `viewBox` (a proporção é fixa 300×520). */
  width?: number
  height?: number
  /** Incluir `<title>`/`<desc>` de acessibilidade. */
  a11y?: boolean
  /** Marca de água do número/arcano no topo. */
  badge?: boolean
  /** Camadas separadas em `<g data-layer>` (o cliente anima-as). */
  layered?: boolean
  /** Selo de seed: acrescenta um glifo discreto com o hash do ritual (prova de origem). */
  seal?: string
  /** Forçar fundo transparente (para sobrepor na mesa). */
  transparent?: boolean
}

export interface RenderResult {
  svg: string
  /** Camadas presentes (para o motor de animação). */
  layers: string[]
  glyphs: { id: string; base: string; count: number; states: string[] }[]
}

export function renderCard(card: CardDef, options: RenderOptions = {}): RenderResult {
  const theme = themeByKey(options.theme)
  const orientation = options.orientation ?? 'upright'
  const random = rng(card.id + theme.key + (options.seal ?? ''))
  const palette = themePalette(card, theme)
  const layers: string[] = []
  const scene: SceneContext = {
    card,
    theme,
    palette,
    sky: SKY[card.art.sky],
    random,
    seed: card.id,
    x0: 22,
    y0: 74,
    x1: VIEW.w - 22,
    y1: VIEW.h - 96,
  }

  const defs = defsFor(scene, theme)
  const frame = frameFor(card, theme, palette)
  const skyPaint = `<rect x="22" y="60" width="${VIEW.w - 44}" height="${VIEW.h - 156}" fill="url(#sky-${slug(card.id)})" rx="6"/>` + SKY_PAINT(scene) + astroMark(scene)
  const baseY = scene.y1 - 76
  const terrain = TERRAIN_PAINT[card.art.terrain](scene, baseY)
  const body = card.arcana === 'major' ? majorBody(card, scene, baseY) : minorBody(card, scene, baseY)
  const glyphs = glyphLayer(card, scene, theme)
  const band = nameBand(card, theme, palette)
  const number = options.badge === false ? '' : cornerNumbers(card, theme, palette)
  const seal = options.seal ? sealMark(options.seal, scene, theme) : ''

  const sceneGroup = `<g data-layer="cena" transform="${orientation === 'reversed' ? `rotate(180 ${VIEW.w / 2} ${(scene.y0 + scene.y1) / 2})` : ''}">${terrain}${body}${glyphs.svg}</g>`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" width="${options.width ?? VIEW.w}" height="${options.height ?? VIEW.h}" role="img" data-card="${escapeXml(card.id)}" data-orientation="${orientation}" data-theme="${escapeXml(theme.key)}"${options.layered ? ' data-layered="1"' : ''}>` +
    `<defs>${defs}</defs>` +
    (options.transparent ? '' : `<rect width="${VIEW.w}" height="${VIEW.h}" fill="${theme.paper}"/>`) +
    frame +
    `<g data-layer="fundo">${skyPaint}${texture(theme)}</g>` +
    sceneGroup +
    band +
    number +
    seal +
    (options.a11y === false
      ? ''
      : `<title>${escapeXml(card.name.pt)}${orientation === 'reversed' ? ' (invertida)' : ''}</title><desc>${escapeXml(card.a11y.alt)}</desc>`) +
    `</svg>`

  return { svg, layers: ['moldura', 'fundo', 'ceu', 'cena', 'glifos', 'tarja', 'numeracao'].concat(options.layered ? ['textura'] : []).concat(layers), glyphs: glyphs.list }
}

function themePalette(card: CardDef, theme: DeckTheme): [string, string, string] {
  const [a, b, c] = card.art.palette
  if (theme.mode === 'mono') {
    const base = theme.paper.startsWith('#f') || theme.paper.startsWith('#e') ? '#2a2a2e' : '#e8e6df'
    return [base, mix(base, theme.paper, 0.55), mix(base, theme.paper, 0.78)]
  }
  if (theme.mode === 'duo') return [a, mix(b, theme.gild, 0.5), mix(c, theme.paper, 0.35)]
  if (theme.mode === 'vitral') return [mix(a, '#000', 0.1), b, mix(c, '#ffffff', 0.15)]
  return [a, b, c]
}

function defsFor(ctx: SceneContext, theme: DeckTheme): string {
  const sky = SKY[ctx.card.art.sky]
  const id = slug(ctx.card.id)
  return (
    `<linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bottom}"/></linearGradient>` +
    `<radialGradient id="glow-${id}" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="${sky.glow}" stop-opacity="0.55"/><stop offset="1" stop-color="${sky.glow}" stop-opacity="0"/></radialGradient>` +
    texturePattern(theme)
  )
}

function texturePattern(theme: DeckTheme): string {
  if (theme.texture === 'linho') return `<pattern id="tex" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0,3h6M3,0v6" stroke="${theme.ink}" stroke-opacity="0.1" stroke-width="0.6"/></pattern>`
  if (theme.texture === 'graos') return `<pattern id="tex" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.5" fill="${theme.ink}" fill-opacity="0.16"/><circle cx="3" cy="2.6" r="0.4" fill="${theme.ink}" fill-opacity="0.1"/></pattern>`
  if (theme.texture === 'papel-velho') return `<pattern id="tex" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M0,17q17,-6 34,0" stroke="${theme.ink}" stroke-opacity="0.07" fill="none" stroke-width="3"/></pattern>`
  return ''
}

function texture(theme: DeckTheme): string {
  return theme.texture === 'liso' ? '' : `<rect x="22" y="60" width="${VIEW.w - 44}" height="${VIEW.h - 156}" fill="url(#tex)" opacity="0.7" data-layer="textura"/>`
}

function frameFor(card: CardDef, theme: DeckTheme, _palette: [string, string, string]): string {
  const outer = rect(3, 3, VIEW.w - 6, VIEW.h - 6, { fill: 'none', stroke: theme.ink, 'stroke-width': 1.2, rx: theme.corner, opacity: 0.5 })
  const key = rect(14, 14, VIEW.w - 28, VIEW.h - 28, { fill: 'none', stroke: theme.gild, 'stroke-width': theme.keyline, rx: Math.max(2, theme.corner - 4), opacity: 0.8 })
  const inner = rect(20, 56, VIEW.w - 40, VIEW.h - 148, { fill: 'none', stroke: theme.ink, 'stroke-width': 0.8, opacity: 0.45 })
  const corner = 16
  const marks = [
    [26, 62],
    [VIEW.w - 26, 62],
    [26, VIEW.h - 96],
    [VIEW.w - 26, VIEW.h - 96],
  ]
    .map(([x, y]) => star(x, y, corner * 0.34, corner * 0.14, 4, { fill: theme.gild, opacity: 0.55 }))
    .join('')
  const plate = rect(20, VIEW.h - 90, VIEW.w - 40, 60, { fill: theme.paper, 'fill-opacity': theme.paper.startsWith('#0') || theme.paper.startsWith('#1') || theme.paper.startsWith('#2') ? 0.92 : 0.82, stroke: theme.ink, 'stroke-width': 0.8, 'stroke-opacity': 0.4 })
  return `<g data-layer="moldura">${outer}${key}${inner}${marks}${plate}</g>`
}

function majorBody(card: CardDef, ctx: SceneContext, baseY: number): string {
  const fn = MAJOR_SCENES[card.number]
  const height = 158
  const figureX = (ctx.x0 + ctx.x1) / 2
  const figureY = baseY + 16
  if (!fn) return fallbackScene(ctx, baseY)
  return `<g data-layer="figura">${fn(ctx, figureX, figureY, height)}</g>`
}

/** Cenas de reserva construídas a partir dos glifos declarados (nunca há caixa vazia). */
function fallbackScene(ctx: SceneContext, baseY: number): string {
  const out: string[] = []
  const ids = ctx.card.art.glyphs
  ids.forEach((id, index) => {
    const angle = (index / Math.max(1, ids.length)) * Math.PI - Math.PI
    const x = (ctx.x0 + ctx.x1) / 2 + Math.cos(angle) * 62
    const y = baseY - 40 + Math.sin(angle) * 26
    const rendered = renderGlyph(id, glyphContext(ctx, x, y, 52, `${ctx.card.id}-${index}`))
    if (rendered) out.push(rendered.svg)
  })
  return `<g data-layer="figura">${out.join('')}</g>`
}

function minorBody(card: CardDef, ctx: SceneContext, baseY: number): string {
  const rank = card.rank
  const number = card.number
  const parts: string[] = []
  if (rank && ['page', 'knight', 'queen', 'king'].includes(rank)) {
    const { posture, crown, mount } = courtPosture(rank)
    const figureX = (ctx.x0 + ctx.x1) / 2
    const figureY = baseY + 10
    const height = 150
    parts.push(figure(figureX, figureY, height, posture, { fill: ctx.palette[0] }))
    if (crown) parts.push(crownShape(figureX, figureY - height * 0.98, 16, ctx.palette[1]))
    if (mount) parts.push(sphinx(figureX - 4, figureY + 26, 30, ctx.palette[2]))
    parts.push(rect(figureX - 58, baseY - 8, 116, 14, { fill: ctx.palette[2], 'fill-opacity': 0.7 }))
    parts.push(star(figureX - 44, figureY - height * 0.56, 8, 3.2, 6, { fill: ctx.palette[1], opacity: 0.8 }))
    parts.push(suitPip(card.suit, figureX + 40, figureY - height * 0.5, 44, card, ctx.palette))
    return `<g data-layer="figura">${parts.join('')}</g>`
  }
  const layout = PIP_LAYOUTS[Math.max(1, Math.min(10, number))] ?? PIP_LAYOUTS[1]!
  const boxW = ctx.x1 - ctx.x0
  const boxH = ctx.y1 - ctx.y0 - 24
  const pipSize = number >= 9 ? 34 : number >= 6 ? 40 : 48
  layout.forEach(([fx, fy], index) => {
    const x = ctx.x0 + fx * boxW
    const y = ctx.y0 + 24 + fy * boxH
    const rotate = number > 4 && index >= layout.length / 2 ? 180 : 0
    parts.push(`<g transform="rotate(${rotate} ${Math.round(x)} ${Math.round(y)})">${suitPip(card.suit, x, y, pipSize, card, ctx.palette)}</g>`)
  })
  if (number === 1) parts.push(ellipse((ctx.x0 + ctx.x1) / 2, ctx.y0 + 24 + 0.5 * boxH - 26, 34, 12, { fill: ctx.palette[1], opacity: 0.55 }))
  return `<g data-layer="pips">${parts.join('')}</g>`
}

function glyphLayer(card: CardDef, ctx: SceneContext, theme: DeckTheme): { svg: string; list: RenderResult['glyphs'] } {
  const ids = card.art.glyphs
  const list: RenderResult['glyphs'] = []
  const parts: string[] = []
  const major = card.arcana === 'major'
  ids.forEach((id, index) => {
    const total = Math.max(1, ids.length)
    // Maiores: atributos em arco sobre a cabeça da figura. Menores: faixa superior e inferior,
    // a ladejar os pips — é assim que os baralhos marselheses mostram os emblemas.
    let x: number
    let y: number
    let size: number
    if (major) {
      const angle = -Math.PI * 0.86 + (index / Math.max(1, total - 1)) * Math.PI * 0.72
      x = (ctx.x0 + ctx.x1) / 2 + Math.cos(angle) * 96
      y = ctx.y0 + 62 + Math.sin(angle) * 34
      size = 30 + (index % 2) * 5
    } else {
      const half = index % 2 === 0
      x = ctx.x0 + 34 + Math.floor(index / 2) * 62
      y = half ? ctx.y0 + 20 : ctx.y1 - 26
      size = 24 + (index % 3) * 3
    }
    const rendered = renderGlyph(id, glyphContext(ctx, x, y, size, `${card.id}-glyph-${index}`))
    if (!rendered) return
    list.push({ id, base: rendered.base, count: rendered.count, states: rendered.states })
    parts.push(`<g data-glyph="${escapeXml(id)}" opacity="${major ? 0.92 : 0.8}">${rendered.svg}</g>`)
  })
  if (!parts.length) parts.push(fallbackGlyphs(card, ctx, theme))
  return { svg: `<g data-layer="glifos">${parts.join('')}</g>`, list }
}

function fallbackGlyphs(card: CardDef, ctx: SceneContext, theme: DeckTheme): string {
  return card.art.motifs
    .slice(0, 3)
    .map((motif, index) => {
      const y = ctx.y0 + 20 + index * 18
      return path(`M${ctx.x1 - 70},${y}q18,10 36,0`, { fill: 'none', stroke: theme.gild, 'stroke-width': 2, opacity: 0.6 })
    })
    .join('')
}

function glyphContext(ctx: SceneContext, x: number, y: number, size: number, seed: string): GlyphContext {
  return { x, y, size, color: ctx.palette[0], accent: ctx.palette[1], ink: ctx.theme.ink, seed }
}

function nameBand(card: CardDef, theme: DeckTheme, palette: [string, string, string]): string {
  const label = card.name.pt.toUpperCase()
  const fontSize = label.length > 22 ? 12 : label.length > 16 ? 14 : 16
  const roman = card.arcana === 'major' ? ROMAN[card.number] ?? String(card.number) : String(card.number)
  return (
    `<g data-layer="tarja">` +
    text(label, VIEW.w / 2, VIEW.h - 54, fontSize, { 'letter-spacing': '2.4', fill: theme.ink, 'font-family': "Georgia, 'Times New Roman', serif", 'font-weight': '600' }) +
    text(card.suit ? card.name.intl : roman, VIEW.w / 2, VIEW.h - 34, 9.5, { 'letter-spacing': '3', fill: mix(theme.ink, palette[1], 0.35), opacity: 0.75 }) +
    `</g>`
  )
}

function cornerNumbers(card: CardDef, theme: DeckTheme, palette: [string, string, string]): string {
  const mark = card.arcana === 'major' ? ROMAN[card.number] ?? String(card.number) : String(card.number)
  const suitLetter = SUIT_LETTER[card.suit ?? ''] ?? '★'
  return (
    `<g data-layer="numeracao" font-family="Georgia, serif" fill="${theme.ink}">` +
    text(mark, 40, 44, 18, { 'text-anchor': 'middle', fill: palette[1], opacity: 0.92 }) +
    text(suitLetter, VIEW.w - 40, 44, 12, { 'text-anchor': 'middle', opacity: 0.62 }) +
    `</g>`
  )
}

function sealMark(seed: string, ctx: SceneContext, theme: DeckTheme): string {
  let hash = 0x811c9dc5
  for (const ch of seed) {
    hash ^= ch.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  const value = (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
  return `<g data-layer="selo" opacity="0.5">${circle(VIEW.w - 44, 44, 18, { fill: 'none', stroke: theme.gild, 'stroke-width': 1.2 })}${text(value, VIEW.w - 44, 48, 9.5, { fill: theme.gild, 'letter-spacing': '0.6' })}</g>`
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']
const SUIT_LETTER: Record<string, string> = { wands: '⟨P⟩', cups: '⟨C⟩', swords: '⟨E⟩', pentacles: '⟨O⟩' }

function slug(value: string): string {
  return value.replace(/[^a-z0-9-]/gi, '')
}

/* ─────────────────────────── verso do baralho ─────────────────────────── */

/** Verso compacto para miniaturas e favicons (menos de 400 bytes). */
export function renderBackFallback(themeKey: string): string {
  const theme = themeByKey(themeKey)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 52" width="30" height="52">` +
    `<rect width="30" height="52" rx="3" fill="${theme.paper}"/>` +
    `<rect x="2" y="2" width="26" height="48" rx="2" fill="none" stroke="${theme.gild}" stroke-width="1.2"/>` +
    `<circle cx="15" cy="26" r="6" fill="none" stroke="${theme.gild}" stroke-width="1.2"/>` +
    `<path d="M15,19l1.6,5.4h5.4l-4.4,3.2 1.6,5.4-4.2,-3.2-4.2,3.2 1.6,-5.4-4.4,-3.2h5.4z" fill="${theme.gild}"/>` +
    `</svg>`
  )
}

export function renderCardBack(themeKey: string, options: { width?: number; height?: number; seed?: string } = {}): string {
  const theme = themeByKey(themeKey)
  const random = rng(`back:${theme.key}:${options.seed ?? ''}`)
  const parts: string[] = []
  const cx = VIEW.w / 2
  const cy = VIEW.h / 2
  if (theme.back.kind === 'arcs') {
    for (let index = 0; index < theme.back.density; index += 1) parts.push(circle(cx, cy, 16 + index * ((VIEW.h - 120) / theme.back.density / 2), { fill: 'none', stroke: theme.gild, 'stroke-width': 1.1, opacity: 0.35 + (index % 3) * 0.12 }))
  } else if (theme.back.kind === 'grid') {
    for (let index = 0; index < theme.back.density; index += 1) {
      const step = (VIEW.h - 140) / theme.back.density
      parts.push(line([30, 70 + index * step], [VIEW.w - 30, 70 + index * step], { stroke: theme.gild, 'stroke-width': 0.8, opacity: 0.4 }))
      parts.push(line([30 + index * ((VIEW.w - 60) / theme.back.density), 70], [30 + index * ((VIEW.w - 60) / theme.back.density), VIEW.h - 70], { stroke: theme.gild, 'stroke-width': 0.8, opacity: 0.4 }))
    }
  } else if (theme.back.kind === 'rays') {
    for (let index = 0; index < theme.back.density; index += 1) {
      const angle = (index / theme.back.density) * Math.PI * 2
      parts.push(line([cx, cy], [cx + Math.cos(angle) * 260, cy + Math.sin(angle) * 260], { stroke: theme.gild, 'stroke-width': 1.6, opacity: 0.42 }))
    }
  } else if (theme.back.kind === 'weave') {
    for (let index = 0; index < theme.back.density; index += 1) {
      const offset = index * 22
      parts.push(path(`M${24 - offset},70 L${VIEW.h - offset},450`, { stroke: theme.gild, 'stroke-width': 1, opacity: 0.4 }))
      parts.push(path(`M${24 + offset},70 L${24 + offset - 200},450`, { stroke: theme.gild, 'stroke-width': 1, opacity: 0.3 }))
    }
  } else if (theme.back.kind === 'stars') {
    for (let index = 0; index < theme.back.density * 3; index += 1) parts.push(star(30 + random() * (VIEW.w - 60), 74 + random() * (VIEW.h - 150), 2 + random() * 5, 1 + random() * 2, 5, { fill: theme.gild, opacity: 0.25 + random() * 0.6 }))
  } else if (theme.back.kind === 'diamonds') {
    for (let row = 0; row < theme.back.density / 2; row += 1) for (let column = 0; column < 5; column += 1) parts.push(poly([[54 + column * 50 + (row % 2) * 25, 92 + row * 46], [74 + column * 50 + (row % 2) * 25, 112 + row * 46], [54 + column * 50 + (row % 2) * 25, 132 + row * 46], [34 + column * 50 + (row % 2) * 25, 112 + row * 46]], { fill: 'none', stroke: theme.gild, 'stroke-width': 1, opacity: 0.5 }))
  } else {
    for (let index = 0; index < theme.back.density; index += 1) parts.push(ellipse(cx, cy, 18 + index * 14, 26 + index * 19, { fill: 'none', stroke: theme.gild, 'stroke-width': 1, opacity: 0.45, transform: `rotate(${index * 9} ${cx} ${cy})` }))
  }
  const centre = pentacle(cx, cy, 34, { fill: 'none', stroke: theme.gild, 'stroke-width': 2.4 }) + star(cx, cy, 18, 7, 8, { fill: theme.gild, opacity: 0.85 })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" width="${options.width ?? VIEW.w}" height="${options.height ?? VIEW.h}" role="img" data-theme="${escapeXml(theme.key)}">` +
    `<title> Verso do baralho ${escapeXml(theme.name)}</title>` +
    `<rect width="${VIEW.w}" height="${VIEW.h}" rx="${theme.corner}" fill="${theme.paper}"/>` +
    `<rect x="12" y="12" width="${VIEW.w - 24}" height="${VIEW.h - 24}" rx="${Math.max(4, theme.corner - 2)}" fill="none" stroke="${theme.gild}" stroke-width="${theme.keyline}" opacity="0.85"/>` +
    `<g clip-path="none">${parts.join('')}</g>${centre}` +
    `</svg>`
  )
}
