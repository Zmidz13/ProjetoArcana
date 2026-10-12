import { blade, circle, crescent, chalice, ellipse, figure, line, mix, path, pentacle, poly, rays, star, type FigurePosture } from './svg.ts'

/**
 * Glifos da ARCANA.
 *
 * Cada carta declara 3 a 5 glifos (`CardDef.art.glyphs`) que o motor resolve para um
 * desenho concreto. Há duas camadas aqui:
 *
 *  1. `LEXICON` — ~40 motivos elementares (espada, vara, taça, disco, coroa, serpente,
 *     águia, torre, roda, balança…), cada um desenhado à mão em geometria.
 *  2. `resolveGlyph` — o compositor: lê o id (`five-crossed-staves`, `moon-pool`,
 *     `eight-standing-wands`) e deriva quantidade, estado (cruzadas/erguidas/partidas/
 *     flutuantes/a arder) e agrupamento do próprio nome. Assim os 302 glifos declarados
 *     no conteúdo produzem todos um marcador legível e distinto, e a adição de uma carta
 *     nova não obriga a tocar n este ficheiro.
 *
 * O build de conteúdo falha se um glifo não for resolvível — não existe "caixa vazia".
 */

export interface GlyphContext {
  x: number
  y: number
  size: number
  color: string
  accent: string
  ink: string
  /** Semente por glifo+carta: controla pequenas variações (ângulo, número de detalhes). */
  seed: string
}

type GlyphFn = (ctx: GlyphContext) => string

const strokeBase = (ctx: GlyphContext, multiplier = 0.06): number => Math.max(1.2, ctx.size * multiplier)

function frame(ctx: GlyphContext, extra: Record<string, string | number> = {}): Record<string, string | number> {
  return { fill: 'none', stroke: ctx.color, 'stroke-width': strokeBase(ctx), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }
}

function filled(ctx: GlyphContext, color = ctx.color, extra: Record<string, string | number> = {}): Record<string, string | number> {
  return { fill: color, stroke: ctx.ink, 'stroke-width': strokeBase(ctx, 0.03), ...extra }
}

/* ─────────────────────────── léxicoelementar ─────────────────────────── */

const LEXICON: Record<string, GlyphFn> = {
  sword: (ctx) => blade([ctx.x, ctx.y + ctx.size * 0.5], [ctx.x, ctx.y - ctx.size * 0.5], ctx.size * 0.1, 0.2, frame(ctx, { fill: ctx.color, 'fill-opacity': 0.16 })),
  blade: (ctx) => blade([ctx.x, ctx.y + ctx.size * 0.45], [ctx.x, ctx.y - ctx.size * 0.5], ctx.size * 0.11, 0.22, frame(ctx, { fill: ctx.accent, 'fill-opacity': 0.2 })),
  wand: (ctx) => {
    const s = ctx.size
    return (
      line([ctx.x - s * 0.02, ctx.y + s * 0.45], [ctx.x + s * 0.02, ctx.y - s * 0.45], frame(ctx, { 'stroke-width': s * 0.12, stroke: mix(ctx.color, '#000000', 0.15) })) +
      circle(ctx.x + s * 0.02, ctx.y - s * 0.5, s * 0.09, { fill: ctx.accent }) +
      circle(ctx.x - s * 0.02, ctx.y + s * 0.5, s * 0.08, { fill: ctx.accent })
    )
  },
  staff: (ctx) => {
    const s = ctx.size
    return line([ctx.x, ctx.y - s * 0.5], [ctx.x, ctx.y + s * 0.5], frame(ctx, { 'stroke-width': s * 0.11 })) + path(`M${ctx.x - s * 0.16},${ctx.y - s * 0.42}Q${ctx.x},${ctx.y - s * 0.68} ${ctx.x + s * 0.16},${ctx.y - s * 0.42}`, frame(ctx))
  },
  cup: (ctx) => chalice(ctx.x, ctx.y, ctx.size * 0.42, frame(ctx, { fill: ctx.color, 'fill-opacity': 0.18 })),
  chalice: (ctx) => chalice(ctx.x, ctx.y - ctx.size * 0.06, ctx.size * 0.44, frame(ctx, { fill: ctx.color, 'fill-opacity': 0.18 })) + ellipse(ctx.x, ctx.y - ctx.size * 0.26, ctx.size * 0.36, ctx.size * 0.08, { fill: ctx.accent, opacity: 0.75 }),
  pentacle: (ctx) => pentacle(ctx.x, ctx.y, ctx.size * 0.44, frame(ctx, { stroke: ctx.color })),
  coin: (ctx) => circle(ctx.x, ctx.y, ctx.size * 0.42, frame(ctx, { fill: ctx.accent, 'fill-opacity': 0.28 })) + circle(ctx.x, ctx.y, ctx.size * 0.28, frame(ctx, { 'stroke-width': ctx.size * 0.03, stroke: ctx.ink, opacity: 0.7 })),
  crown: (ctx) => {
    const s = ctx.size
    const base = ctx.y + s * 0.2
    return poly(
      [
        [ctx.x - s * 0.42, base],
        [ctx.x - s * 0.42, base - s * 0.22],
        [ctx.x - s * 0.21, base - s * 0.02],
        [ctx.x, base - s * 0.4],
        [ctx.x + s * 0.21, base - s * 0.02],
        [ctx.x + s * 0.42, base - s * 0.22],
        [ctx.x + s * 0.42, base],
      ],
      filled(ctx, ctx.accent),
    ) + poly([[ctx.x - s * 0.42, base], [ctx.x + s * 0.42, base], [ctx.x + s * 0.36, base + s * 0.12], [ctx.x - s * 0.36, base + s * 0.12]], filled(ctx, ctx.color))
  },
  rose: (ctx) => {
    const s = ctx.size
    const petals: string[] = []
    for (let index = 0; index < 7; index += 1) {
      const angle = (index / 7) * Math.PI * 2
      petals.push(ellipse(ctx.x + Math.cos(angle) * s * 0.14, ctx.y + Math.sin(angle) * s * 0.14, s * 0.19, s * 0.13, { fill: ctx.color, 'fill-opacity': 0.5 + (index % 3) * 0.12, transform: `rotate(${(angle * 180) / Math.PI} ${ctx.x} ${ctx.y})` }))
    }
    return petals.join('') + circle(ctx.x, ctx.y, s * 0.1, { fill: ctx.accent })
  },
  lily: (ctx) => {
    const s = ctx.size
    return (
      line([ctx.x, ctx.y + s * 0.5], [ctx.x, ctx.y - s * 0.1], frame(ctx, { 'stroke-width': s * 0.06 })) +
      path(`M${ctx.x},${ctx.y - s * 0.1}Q${ctx.x - s * 0.34},${ctx.y - s * 0.36} ${ctx.x - s * 0.1},${ctx.y - s * 0.56}Q${ctx.x},${ctx.y - s * 0.3} ${ctx.x + s * 0.1},${ctx.y - s * 0.56}Q${ctx.x + s * 0.34},${ctx.y - s * 0.36} ${ctx.x},${ctx.y - s * 0.1}Z`, filled(ctx, ctx.color))
    )
  },
  lotus: (ctx) => {
    const s = ctx.size
    const out: string[] = []
    for (let index = -2; index <= 2; index += 1) {
      out.push(path(`M${ctx.x},${ctx.y + s * 0.2}Q${ctx.x + index * s * 0.2},${ctx.y - s * 0.1} ${ctx.x + index * s * 0.12},${ctx.y - s * 0.42}Q${ctx.x + index * s * 0.05},${ctx.y - s * 0.1} ${ctx.x},${ctx.y + s * 0.2}Z`, filled(ctx, index % 2 === 0 ? ctx.color : mix(ctx.color, '#ffffff', 0.25))))
    }
    return out.join('')
  },
  wheat: (ctx) => {
    const s = ctx.size
    const grains: string[] = []
    for (let index = 0; index < 7; index += 1) {
      const y = ctx.y - s * 0.4 + index * s * 0.11
      grains.push(ellipse(ctx.x - s * 0.09, y, s * 0.07, s * 0.045, { fill: ctx.accent }))
      grains.push(ellipse(ctx.x + s * 0.09, y, s * 0.07, s * 0.045, { fill: ctx.accent }))
    }
    return line([ctx.x, ctx.y + s * 0.5], [ctx.x, ctx.y - s * 0.45], frame(ctx, { 'stroke-width': s * 0.05 })) + grains.join('')
  },
  vine: (ctx) => {
    const s = ctx.size
    let d = `M${ctx.x - s * 0.45},${ctx.y + s * 0.3}`
    for (let index = 0; index < 4; index += 1) {
      const x0 = ctx.x - s * 0.45 + index * s * 0.24
      d += `Q${x0 + s * 0.1},${ctx.y + s * (index % 2 ? 0.05 : 0.5)} ${x0 + s * 0.24},${ctx.y + s * 0.3 - index * s * 0.05}`
    }
    return path(d, frame(ctx, { 'stroke-width': s * 0.07 })) + circle(ctx.x + s * 0.1, ctx.y - s * 0.05, s * 0.07, { fill: ctx.accent }) + circle(ctx.x - s * 0.12, ctx.y + s * 0.12, s * 0.06, { fill: ctx.accent })
  },
  leaf: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.25}Q${ctx.x},${ctx.y - ctx.size * 0.5} ${ctx.x + ctx.size * 0.4},${ctx.y - ctx.size * 0.1}Q${ctx.x},${ctx.y + ctx.size * 0.45} ${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.25}Z`, filled(ctx, ctx.color)) + line([ctx.x - ctx.size * 0.34, ctx.y + ctx.size * 0.18], [ctx.x + ctx.size * 0.32, ctx.y - ctx.size * 0.08], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.03 })),
  sun: (ctx) => circle(ctx.x, ctx.y, ctx.size * 0.2, { fill: ctx.accent }) + rays(ctx.x, ctx.y, ctx.size * 0.26, ctx.size * 0.5, 12, { fill: ctx.color }),
  moon: (ctx) => crescent(ctx.x - ctx.size * 0.06, ctx.y, ctx.size * 0.36, 0.4, { fill: ctx.accent }),
  star: (ctx) => star(ctx.x, ctx.y, ctx.size * 0.46, ctx.size * 0.19, 8, { fill: ctx.accent }) + star(ctx.x, ctx.y, ctx.size * 0.46, ctx.size * 0.19, 8, { fill: 'none', stroke: ctx.color, 'stroke-width': strokeBase(ctx, 0.04) }),
  sparkle: (ctx) => path(`M${ctx.x},${ctx.y - ctx.size * 0.45}L${ctx.x + ctx.size * 0.12},${ctx.y - ctx.size * 0.1}L${ctx.x + ctx.size * 0.45},${ctx.y}L${ctx.x + ctx.size * 0.12},${ctx.y + ctx.size * 0.1}L${ctx.x},${ctx.y + ctx.size * 0.45}L${ctx.x - ctx.size * 0.12},${ctx.y + ctx.size * 0.1}L${ctx.x - ctx.size * 0.45},${ctx.y}L${ctx.x - ctx.size * 0.12},${ctx.y - ctx.size * 0.1}Z`, { fill: ctx.accent }),
  cloud: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.45},${ctx.y + s * 0.1}Q${ctx.x - s * 0.4},${ctx.y - s * 0.28} ${ctx.x - s * 0.08},${ctx.y - s * 0.2}Q${ctx.x + s * 0.05},${ctx.y - s * 0.42} ${ctx.x + s * 0.28},${ctx.y - s * 0.14}Q${ctx.x + s * 0.5},${ctx.y - s * 0.1} ${ctx.x + s * 0.4},${ctx.y + s * 0.12}Z`, filled(ctx, ctx.color, { 'stroke-opacity': 0.5 }))
  },
  wave: (ctx) => {
    const s = ctx.size
    let d = `M${ctx.x - s * 0.5},${ctx.y}`
    for (let index = 0; index < 3; index += 1) d += `Q${ctx.x - s * 0.5 + index * s * 0.33 + s * 0.08},${ctx.y - s * 0.22} ${ctx.x - s * 0.5 + (index + 1) * s * 0.33},${ctx.y}`
    return path(d, frame(ctx, { 'stroke-width': s * 0.08 })) + path(d.replace(new RegExp(String(ctx.y), 'g'), String(ctx.y + s * 0.2)), frame(ctx, { 'stroke-width': s * 0.05, opacity: 0.6 }))
  },
  water: (ctx) => path(`M${ctx.x},${ctx.y - ctx.size * 0.42}Q${ctx.x + ctx.size * 0.34},${ctx.y + ctx.size * 0.06} ${ctx.x},${ctx.y + ctx.size * 0.42}Q${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.06} ${ctx.x},${ctx.y - ctx.size * 0.42}Z`, filled(ctx, ctx.accent, { 'fill-opacity': 0.7, stroke: ctx.color })),
  mountain: (ctx) => poly([[ctx.x - ctx.size * 0.5, ctx.y + ctx.size * 0.35], [ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.4], [ctx.x + ctx.size * 0.12, ctx.y - ctx.size * 0.05], [ctx.x + ctx.size * 0.3, ctx.y - ctx.size * 0.3], [ctx.x + ctx.size * 0.5, ctx.y + ctx.size * 0.35]], filled(ctx, ctx.color)),
  rock: (ctx) => poly([[ctx.x - ctx.size * 0.4, ctx.y + ctx.size * 0.3], [ctx.x - ctx.size * 0.26, ctx.y - ctx.size * 0.18], [ctx.x + ctx.size * 0.08, ctx.y - ctx.size * 0.34], [ctx.x + ctx.size * 0.4, ctx.y - ctx.size * 0.04], [ctx.x + ctx.size * 0.3, ctx.y + ctx.size * 0.3]], filled(ctx, mix(ctx.color, '#000000', 0.2))),
  tower: (ctx) => {
    const s = ctx.size
    return (
      path(`M${ctx.x - s * 0.24},${ctx.y + s * 0.45}V${ctx.y - s * 0.24}H${ctx.x + s * 0.24}V${ctx.y + s * 0.45}Z`, filled(ctx, ctx.color)) +
      path(`M${ctx.x - s * 0.3},${ctx.y - s * 0.24}L${ctx.x},${ctx.y - s * 0.52}L${ctx.x + s * 0.3},${ctx.y - s * 0.24}Z`, filled(ctx, ctx.accent)) +
      rect2(ctx, ctx.x - s * 0.1, ctx.y - s * 0.14, s * 0.2, s * 0.24, ctx.ink)
    )
  },
  house: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.34},${ctx.y + s * 0.4}V${ctx.y - s * 0.08}L${ctx.x},${ctx.y - s * 0.38}L${ctx.x + s * 0.34},${ctx.y - s * 0.08}V${ctx.y + s * 0.4}Z`, filled(ctx, ctx.color)) + rect2(ctx, ctx.x - s * 0.09, ctx.y + s * 0.08, s * 0.18, s * 0.32, ctx.ink)
  },
  gate: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.34},${ctx.y + s * 0.45}V${ctx.y - s * 0.1}Q${ctx.x},${ctx.y - s * 0.5} ${ctx.x + s * 0.34},${ctx.y - s * 0.1}V${ctx.y + s * 0.45}`, frame(ctx, { 'stroke-width': s * 0.09 })) + line([ctx.x, ctx.y - s * 0.12], [ctx.x, ctx.y + s * 0.45], frame(ctx, { 'stroke-width': s * 0.05 }))
  },
  arch: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.42}V${ctx.y}Q${ctx.x},${ctx.y - ctx.size * 0.48} ${ctx.x + ctx.size * 0.4},${ctx.y}V${ctx.y + ctx.size * 0.42}`, frame(ctx, { 'stroke-width': ctx.size * 0.09 })),
  pillar: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.11, ctx.y - s * 0.36, s * 0.22, s * 0.72, ctx.color) + rect2(ctx, ctx.x - s * 0.2, ctx.y - s * 0.46, s * 0.4, s * 0.12, ctx.accent) + rect2(ctx, ctx.x - s * 0.2, ctx.y + s * 0.36, s * 0.4, s * 0.1, ctx.accent)
  },
  book: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.42},${ctx.y - s * 0.24}Q${ctx.x - s * 0.2},${ctx.y - s * 0.36} ${ctx.x},${ctx.y - s * 0.18}Q${ctx.x + s * 0.2},${ctx.y - s * 0.36} ${ctx.x + s * 0.42},${ctx.y - s * 0.24}V${ctx.y + s * 0.3}Q${ctx.x + s * 0.18},${ctx.y + s * 0.18} ${ctx.x},${ctx.y + s * 0.34}Q${ctx.x - s * 0.18},${ctx.y + s * 0.18} ${ctx.x - s * 0.42},${ctx.y + s * 0.3}Z`, filled(ctx, ctx.color)) + line([ctx.x, ctx.y - s * 0.18], [ctx.x, ctx.y + s * 0.34], frame(ctx, { stroke: ctx.ink, 'stroke-width': s * 0.04 }))
  },
  scroll: (ctx) => rect2(ctx, ctx.x - ctx.size * 0.34, ctx.y - ctx.size * 0.22, ctx.size * 0.68, ctx.size * 0.44, ctx.color, true) + line([ctx.x - ctx.size * 0.2, ctx.y - ctx.size * 0.06], [ctx.x + ctx.size * 0.2, ctx.y - ctx.size * 0.06], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.035 })) + line([ctx.x - ctx.size * 0.2, ctx.y + ctx.size * 0.1], [ctx.x + ctx.size * 0.12, ctx.y + ctx.size * 0.1], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.035 })),
  shield: (ctx) => path(`M${ctx.x - ctx.size * 0.34},${ctx.y - ctx.size * 0.38}H${ctx.x + ctx.size * 0.34}V${ctx.y + ctx.size * 0.06}Q${ctx.x},${ctx.y + ctx.size * 0.5} ${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.06}Z`, filled(ctx, ctx.color, { stroke: ctx.accent })) + line([ctx.x, ctx.y - ctx.size * 0.3], [ctx.x, ctx.y + ctx.size * 0.28], frame(ctx, { stroke: ctx.accent, 'stroke-width': ctx.size * 0.05 })),
  armor: (ctx) => path(`M${ctx.x - ctx.size * 0.3},${ctx.y - ctx.size * 0.3}Q${ctx.x},${ctx.y - ctx.size * 0.5} ${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.3}L${ctx.x + ctx.size * 0.22},${ctx.y + ctx.size * 0.4}H${ctx.x - ctx.size * 0.22}Z`, filled(ctx, mix(ctx.color, '#ffffff', 0.15))) + line([ctx.x - ctx.size * 0.2, ctx.y], [ctx.x + ctx.size * 0.2, ctx.y], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.04 })),
  helm: (ctx) => path(`M${ctx.x - ctx.size * 0.28},${ctx.y + ctx.size * 0.14}V${ctx.y - ctx.size * 0.1}Q${ctx.x},${ctx.y - ctx.size * 0.46} ${ctx.x + ctx.size * 0.28},${ctx.y - ctx.size * 0.1}V${ctx.y + ctx.size * 0.14}Z`, filled(ctx, ctx.color)) + line([ctx.x - ctx.size * 0.24, ctx.y - ctx.size * 0.02], [ctx.x + ctx.size * 0.24, ctx.y - ctx.size * 0.02], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.05 })),
  key: (ctx) => circle(ctx.x - ctx.size * 0.2, ctx.y, ctx.size * 0.16, frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + line([ctx.x - ctx.size * 0.04, ctx.y], [ctx.x + ctx.size * 0.42, ctx.y], frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + line([ctx.x + ctx.size * 0.3, ctx.y], [ctx.x + ctx.size * 0.3, ctx.y + ctx.size * 0.16], frame(ctx, { 'stroke-width': ctx.size * 0.07 })) + line([ctx.x + ctx.size * 0.42, ctx.y], [ctx.x + ctx.size * 0.42, ctx.y + ctx.size * 0.2], frame(ctx, { 'stroke-width': ctx.size * 0.07 })),
  lantern: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.22},${ctx.y - s * 0.2}H${ctx.x + s * 0.22}L${ctx.x + s * 0.16},${ctx.y + s * 0.28}H${ctx.x - s * 0.16}Z`, filled(ctx, ctx.accent, { 'fill-opacity': 0.55, stroke: ctx.color })) + line([ctx.x, ctx.y - s * 0.2], [ctx.x, ctx.y - s * 0.44], frame(ctx, { 'stroke-width': s * 0.06 })) + circle(ctx.x, ctx.y - s * 0.46, s * 0.06, { fill: ctx.color })
  },
  hourglass: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.26},${ctx.y - s * 0.42}H${ctx.x + s * 0.26}L${ctx.x},${ctx.y}L${ctx.x + s * 0.26},${ctx.y + s * 0.42}H${ctx.x - s * 0.26}L${ctx.x},${ctx.y}Z`, filled(ctx, ctx.color, { 'fill-opacity': 0.4 })) + line([ctx.x - s * 0.3, ctx.y - s * 0.44], [ctx.x + s * 0.3, ctx.y - s * 0.44], frame(ctx, { 'stroke-width': s * 0.08 })) + line([ctx.x - s * 0.3, ctx.y + s * 0.44], [ctx.x + s * 0.3, ctx.y + s * 0.44], frame(ctx, { 'stroke-width': s * 0.08 }))
  },
  wheel: (ctx) => {
    const s = ctx.size
    const spokes: string[] = []
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2
      spokes.push(line([ctx.x, ctx.y], [ctx.x + Math.cos(angle) * s * 0.42, ctx.y + Math.sin(angle) * s * 0.42], frame(ctx, { 'stroke-width': s * 0.05 })))
    }
    return circle(ctx.x, ctx.y, s * 0.44, frame(ctx, { 'stroke-width': s * 0.08 })) + circle(ctx.x, ctx.y, s * 0.12, frame(ctx, { 'stroke-width': s * 0.06 })) + spokes.join('')
  },
  scales: (ctx) => {
    const s = ctx.size
    return (
      line([ctx.x, ctx.y - s * 0.42], [ctx.x, ctx.y + s * 0.36], frame(ctx, { 'stroke-width': s * 0.07 })) +
      line([ctx.x - s * 0.36, ctx.y - s * 0.28], [ctx.x + s * 0.36, ctx.y - s * 0.28], frame(ctx, { 'stroke-width': s * 0.06 })) +
      path(`M${ctx.x - s * 0.5},${ctx.y - s * 0.2}A${s * 0.14},${s * 0.14} 0 0 0 ${ctx.x - s * 0.22},${ctx.y - s * 0.2}Z`, filled(ctx, ctx.accent)) +
      path(`M${ctx.x + s * 0.22},${ctx.y - s * 0.12}A${s * 0.14},${s * 0.14} 0 0 0 ${ctx.x + s * 0.5},${ctx.y - s * 0.12}Z`, filled(ctx, ctx.accent))
    )
  },
  cross: (ctx) => rect2(ctx, ctx.x - ctx.size * 0.07, ctx.y - ctx.size * 0.44, ctx.size * 0.14, ctx.size * 0.88, ctx.color, true) + rect2(ctx, ctx.x - ctx.size * 0.32, ctx.y - ctx.size * 0.16, ctx.size * 0.64, ctx.size * 0.14, ctx.color, true),
  path: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.45}Q${ctx.x - ctx.size * 0.1},${ctx.y + ctx.size * 0.1} ${ctx.x + ctx.size * 0.06},${ctx.y - ctx.size * 0.1}T${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.46}`, frame(ctx, { 'stroke-width': ctx.size * 0.09, 'stroke-dasharray': `${ctx.size * 0.16} ${ctx.size * 0.08}` })),
  bridge: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.48},${ctx.y + s * 0.1}Q${ctx.x},${ctx.y - s * 0.36} ${ctx.x + s * 0.48},${ctx.y + s * 0.1}`, frame(ctx, { 'stroke-width': s * 0.08 })) + line([ctx.x - s * 0.48, ctx.y + s * 0.24], [ctx.x + s * 0.48, ctx.y + s * 0.24], frame(ctx, { 'stroke-width': s * 0.05 }))
  },
  ship: (ctx) => {
    const s = ctx.size
    return (
      path(`M${ctx.x - s * 0.42},${ctx.y + s * 0.14}Q${ctx.x},${ctx.y + s * 0.42} ${ctx.x + s * 0.42},${ctx.y + s * 0.14}L${ctx.x + s * 0.3},${ctx.y + s * 0.02}H${ctx.x - s * 0.3}Z`, filled(ctx, ctx.color)) +
      line([ctx.x, ctx.y + s * 0.04], [ctx.x, ctx.y - s * 0.42], frame(ctx, { 'stroke-width': s * 0.06 })) +
      path(`M${ctx.x},${ctx.y - s * 0.4}L${ctx.x + s * 0.3},${ctx.y - s * 0.02}H${ctx.x}Z`, filled(ctx, ctx.accent))
    )
  },
  snake: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.44},${ctx.y + s * 0.3}Q${ctx.x - s * 0.1},${ctx.y + s * 0.34} ${ctx.x - s * 0.06},${ctx.y + s * 0.04}Q${ctx.x - s * 0.02},${ctx.y - s * 0.32} ${ctx.x + s * 0.24},${ctx.y - s * 0.24}Q${ctx.x + s * 0.46},${ctx.y - s * 0.16} ${ctx.x + s * 0.34},${ctx.y + s * 0.04}`, frame(ctx, { 'stroke-width': s * 0.11 })) + circle(ctx.x + s * 0.34, ctx.y + s * 0.04, s * 0.05, { fill: ctx.accent })
  },
  serpent: (ctx) => LEXICON.snake!(ctx),
  dragon: (ctx) => {
    const s = ctx.size
    return (
      path(`M${ctx.x - s * 0.45},${ctx.y + s * 0.28}Q${ctx.x - s * 0.1},${ctx.y - s * 0.1} ${ctx.x + s * 0.2},${ctx.y - s * 0.28}Q${ctx.x + s * 0.45},${ctx.y - s * 0.4} ${ctx.x + s * 0.4},${ctx.y - s * 0.12}`, frame(ctx, { 'stroke-width': s * 0.12 })) +
      path(`M${ctx.x - s * 0.05},${ctx.y - s * 0.05}L${ctx.x + s * 0.1},${ctx.y - s * 0.42}L${ctx.x + s * 0.3},${ctx.y - s * 0.05}Z`, filled(ctx, ctx.accent, { 'fill-opacity': 0.7 }))
    )
  },
  bird: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.45},${ctx.y}Q${ctx.x - s * 0.2},${ctx.y - s * 0.32} ${ctx.x},${ctx.y}Q${ctx.x + s * 0.2},${ctx.y - s * 0.32} ${ctx.x + s * 0.45},${ctx.y}`, frame(ctx, { 'stroke-width': s * 0.08 })) + circle(ctx.x, ctx.y + s * 0.06, s * 0.07, { fill: ctx.color })
  },
  wing: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.26}Q${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.42} ${ctx.x + ctx.size * 0.42},${ctx.y - ctx.size * 0.26}Q${ctx.x + ctx.size * 0.06},${ctx.y - ctx.size * 0.02} ${ctx.x - ctx.size * 0.1},${ctx.y + ctx.size * 0.3}Z`, filled(ctx, ctx.color, { 'fill-opacity': 0.8 })),
  feather: (ctx) => path(`M${ctx.x - ctx.size * 0.24},${ctx.y + ctx.size * 0.46}Q${ctx.x + ctx.size * 0.3},${ctx.y + ctx.size * 0.1} ${ctx.x + ctx.size * 0.2},${ctx.y - ctx.size * 0.46}Q${ctx.x - ctx.size * 0.24},${ctx.y - ctx.size * 0.02} ${ctx.x - ctx.size * 0.24},${ctx.y + ctx.size * 0.46}Z`, filled(ctx, ctx.color)) + line([ctx.x - ctx.size * 0.16, ctx.y + ctx.size * 0.36], [ctx.x + ctx.size * 0.14, ctx.y - ctx.size * 0.34], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.03 })),
  horse: (ctx) => {
    const s = ctx.size
    return (
      path(`M${ctx.x - s * 0.42},${ctx.y + s * 0.3}V${ctx.y - s * 0.02}Q${ctx.x - s * 0.3},${ctx.y - s * 0.3} ${ctx.x},${ctx.y - s * 0.24}Q${ctx.x + s * 0.22},${ctx.y - s * 0.2} ${ctx.x + s * 0.3},${ctx.y - s * 0.44}L${ctx.x + s * 0.42},${ctx.y - s * 0.24}V${ctx.y + s * 0.3}`, frame(ctx, { 'stroke-width': s * 0.09 })) +
      line([ctx.x - s * 0.42, ctx.y + s * 0.3], [ctx.x + s * 0.42, ctx.y + s * 0.3], frame(ctx, { 'stroke-width': s * 0.09 }))
    )
  },
  lion: (ctx) => circle(ctx.x, ctx.y, ctx.size * 0.26, { fill: ctx.accent }) + rays(ctx.x, ctx.y, ctx.size * 0.3, ctx.size * 0.46, 12, { fill: ctx.color }) + circle(ctx.x - ctx.size * 0.08, ctx.y - ctx.size * 0.04, ctx.size * 0.03, { fill: ctx.ink }) + circle(ctx.x + ctx.size * 0.08, ctx.y - ctx.size * 0.04, ctx.size * 0.03, { fill: ctx.ink }),
  bull: (ctx) => ellipse(ctx.x, ctx.y + ctx.size * 0.04, ctx.size * 0.26, ctx.size * 0.2, { fill: ctx.color }) + path(`M${ctx.x - ctx.size * 0.26},${ctx.y - ctx.size * 0.08}Q${ctx.x - ctx.size * 0.46},${ctx.y - ctx.size * 0.32} ${ctx.x - ctx.size * 0.2},${ctx.y - ctx.size * 0.34}`, frame(ctx, { 'stroke-width': ctx.size * 0.07 })) + path(`M${ctx.x + ctx.size * 0.26},${ctx.y - ctx.size * 0.08}Q${ctx.x + ctx.size * 0.46},${ctx.y - ctx.size * 0.32} ${ctx.x + ctx.size * 0.2},${ctx.y - ctx.size * 0.34}`, frame(ctx, { 'stroke-width': ctx.size * 0.07 })),
  dog: (ctx) => path(`M${ctx.x - ctx.size * 0.36},${ctx.y + ctx.size * 0.24}Q${ctx.x - ctx.size * 0.3},${ctx.y - ctx.size * 0.14} ${ctx.x},${ctx.y - ctx.size * 0.1}Q${ctx.x + ctx.size * 0.26},${ctx.y - ctx.size * 0.08} ${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.32}L${ctx.x + ctx.size * 0.42},${ctx.y - ctx.size * 0.12}V${ctx.y + ctx.size * 0.24}Z`, filled(ctx, ctx.color)),
  cat: (ctx) => path(`M${ctx.x - ctx.size * 0.3},${ctx.y + ctx.size * 0.26}V${ctx.y - ctx.size * 0.06}L${ctx.x - ctx.size * 0.18},${ctx.y - ctx.size * 0.36}L${ctx.x - ctx.size * 0.06},${ctx.y - ctx.size * 0.12}H${ctx.x + s2(ctx, 0.06)}L${ctx.x + ctx.size * 0.18},${ctx.y - ctx.size * 0.36}L${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.06}V${ctx.y + ctx.size * 0.26}Z`, filled(ctx, ctx.color)),
  eagle: (ctx) => path(`M${ctx.x - ctx.size * 0.48},${ctx.y - ctx.size * 0.1}Q${ctx.x - ctx.size * 0.2},${ctx.y - ctx.size * 0.4} ${ctx.x},${ctx.y}Q${ctx.x + ctx.size * 0.2},${ctx.y - ctx.size * 0.4} ${ctx.x + ctx.size * 0.48},${ctx.y - ctx.size * 0.1}Q${ctx.x + ctx.size * 0.2},${ctx.y + ctx.size * 0.26} ${ctx.x},${ctx.y + ctx.size * 0.1}Q${ctx.x - ctx.size * 0.2},${ctx.y + ctx.size * 0.26} ${ctx.x - ctx.size * 0.48},${ctx.y - ctx.size * 0.1}Z`, filled(ctx, ctx.color)),
  dove: (ctx) => path(`M${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.14}Q${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.3} ${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.16}L${ctx.x + ctx.size * 0.44},${ctx.y - ctx.size * 0.06}L${ctx.x + ctx.size * 0.26},${ctx.y + ctx.size * 0.04}Q${ctx.x + ctx.size * 0.04},${ctx.y + ctx.size * 0.3} ${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.14}Z`, filled(ctx, '#F4EFE4')) + circle(ctx.x + ctx.size * 0.26, ctx.y - ctx.size * 0.1, ctx.size * 0.026, { fill: ctx.ink }),
  ox: (ctx) => LEXICON.bull!(ctx),
  ape: (ctx) => circle(ctx.x, ctx.y, ctx.size * 0.28, { fill: ctx.color }) + circle(ctx.x, ctx.y + ctx.size * 0.08, ctx.size * 0.16, { fill: ctx.accent }) + circle(ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.04, ctx.size * 0.03, { fill: ctx.ink }) + circle(ctx.x + ctx.size * 0.1, ctx.y - ctx.size * 0.04, ctx.size * 0.03, { fill: ctx.ink }),
  salamander: (ctx) => path(`M${ctx.x - ctx.size * 0.44},${ctx.y + ctx.size * 0.2}Q${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.34} ${ctx.x + ctx.size * 0.2},${ctx.y - ctx.size * 0.1}Q${ctx.x + ctx.size * 0.4},${ctx.y + ctx.size * 0.06} ${ctx.x + ctx.size * 0.44},${ctx.y - ctx.size * 0.24}`, frame(ctx, { 'stroke-width': ctx.size * 0.13 })) + circle(ctx.x + ctx.size * 0.44, ctx.y - ctx.size * 0.24, ctx.size * 0.05, { fill: ctx.accent }),
  butterfly: (ctx) => ellipse(ctx.x, ctx.y, ctx.size * 0.04, ctx.size * 0.3, { fill: ctx.ink }) + ellipse(ctx.x - ctx.size * 0.22, ctx.y - ctx.size * 0.1, ctx.size * 0.22, ctx.size * 0.18, { fill: ctx.color, 'fill-opacity': 0.85 }) + ellipse(ctx.x + ctx.size * 0.22, ctx.y - ctx.size * 0.1, ctx.size * 0.22, ctx.size * 0.18, { fill: ctx.color, 'fill-opacity': 0.85 }) + ellipse(ctx.x - ctx.size * 0.16, ctx.y + ctx.size * 0.18, ctx.size * 0.16, ctx.size * 0.13, { fill: ctx.accent, 'fill-opacity': 0.8 }) + ellipse(ctx.x + ctx.size * 0.16, ctx.y + ctx.size * 0.18, ctx.size * 0.16, ctx.size * 0.13, { fill: ctx.accent, 'fill-opacity': 0.8 }),
  hand: (ctx) => {
    const s = ctx.size
    const fingers = [-0.16, -0.05, 0.06, 0.17].map((offset, index) => line([ctx.x + s * offset, ctx.y + s * 0.1], [ctx.x + s * offset, ctx.y - s * (index === 0 || index === 3 ? 0.22 : 0.34)], frame(ctx, { 'stroke-width': s * 0.075 })))
    return path(`M${ctx.x - s * 0.24},${ctx.y + s * 0.34}Q${ctx.x},${ctx.y + s * 0.46} ${ctx.x + s * 0.24},${ctx.y + s * 0.34}V${ctx.y + s * 0.08}H${ctx.x - s * 0.24}Z`, filled(ctx, ctx.color)) + fingers.join('')
  },
  eye: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y}Q${ctx.x},${ctx.y - ctx.size * 0.34} ${ctx.x + ctx.size * 0.4},${ctx.y}Q${ctx.x},${ctx.y + ctx.size * 0.34} ${ctx.x - ctx.size * 0.4},${ctx.y}Z`, filled(ctx, '#F4EFE4', { stroke: ctx.color })) + circle(ctx.x, ctx.y, ctx.size * 0.12, { fill: ctx.ink }),
  heart: (ctx) => path(`M${ctx.x},${ctx.y + ctx.size * 0.36}Q${ctx.x - ctx.size * 0.5},${ctx.y - ctx.size * 0.06} ${ctx.x - ctx.size * 0.22},${ctx.y - ctx.size * 0.34}Q${ctx.x},${ctx.y - ctx.size * 0.12} ${ctx.x + ctx.size * 0.22},${ctx.y - ctx.size * 0.34}Q${ctx.x + ctx.size * 0.5},${ctx.y - ctx.size * 0.06} ${ctx.x},${ctx.y + ctx.size * 0.36}Z`, filled(ctx, ctx.color)),
  skull: (ctx) => circle(ctx.x, ctx.y - ctx.size * 0.06, ctx.size * 0.26, { fill: '#EFE6D6' }) + path(`M${ctx.x - ctx.size * 0.16},${ctx.y + ctx.size * 0.16}H${ctx.x + ctx.size * 0.16}V${ctx.y + ctx.size * 0.34}H${ctx.x - ctx.size * 0.16}Z`, { fill: '#EFE6D6' }) + circle(ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.08, ctx.size * 0.06, { fill: ctx.ink }) + circle(ctx.x + ctx.size * 0.1, ctx.y - ctx.size * 0.08, ctx.size * 0.06, { fill: ctx.ink }),
  torch: (ctx) => line([ctx.x, ctx.y + ctx.size * 0.5], [ctx.x, ctx.y - ctx.size * 0.1], frame(ctx, { stroke: mix(ctx.color, '#000', 0.4), 'stroke-width': ctx.size * 0.1 })) + path(`M${ctx.x},${ctx.y - ctx.size * 0.52}Q${ctx.x + ctx.size * 0.22},${ctx.y - ctx.size * 0.22} ${ctx.x},${ctx.y - ctx.size * 0.06}Q${ctx.x - ctx.size * 0.22},${ctx.y - ctx.size * 0.22} ${ctx.x},${ctx.y - ctx.size * 0.52}Z`, { fill: ctx.accent }),
  fire: (ctx) => path(`M${ctx.x},${ctx.y + ctx.size * 0.42}Q${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.06} ${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.24}Q${ctx.x - ctx.size * 0.06},${ctx.y - ctx.size * 0.02} ${ctx.x},${ctx.y - ctx.size * 0.5}Q${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.12} ${ctx.x + ctx.size * 0.12},${ctx.y + ctx.size * 0.18}Q${ctx.x + ctx.size * 0.06},${ctx.y + ctx.size * 0.02} ${ctx.x},${ctx.y + ctx.size * 0.42}Z`, { fill: ctx.accent }) + path(`M${ctx.x},${ctx.y + ctx.size * 0.34}Q${ctx.x - ctx.size * 0.14},${ctx.y} ${ctx.x},${ctx.y - ctx.size * 0.24}Q${ctx.x + ctx.size * 0.16},${ctx.y + ctx.size * 0.02} ${ctx.x},${ctx.y + ctx.size * 0.34}Z`, { fill: mix(ctx.accent, '#ffffff', 0.5) }),
  smoke: (ctx) => {
    const s = ctx.size
    return [0, 1, 2].map((index) => path(`M${ctx.x - s * 0.3 + index * s * 0.14},${ctx.y + s * 0.3}q${s * 0.16},${-s * 0.2} 0,${-s * 0.36}q${-s * 0.16},${-s * 0.18} 0,${-s * 0.3}`, frame(ctx, { 'stroke-width': s * 0.07, opacity: 0.75 - index * 0.18 }))).join('')
  },
  dust: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = 0; index < 12; index += 1) {
      const angle = index * 2.399
      const radius = s * (0.1 + (index % 5) * 0.08)
      out += circle(ctx.x + Math.cos(angle) * radius, ctx.y + Math.sin(angle) * radius * 0.6, s * 0.026 + (index % 3) * 0.006 * s, { fill: ctx.color, opacity: 0.4 + (index % 4) * 0.14 })
    }
    return out
  },
  snow: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI
      out += line([ctx.x - Math.cos(angle) * s * 0.34, ctx.y - Math.sin(angle) * s * 0.34], [ctx.x + Math.cos(angle) * s * 0.34, ctx.y + Math.sin(angle) * s * 0.34], frame(ctx, { stroke: mix(ctx.color, '#ffffff', 0.6), 'stroke-width': s * 0.045 }))
    }
    return out + circle(ctx.x, ctx.y, s * 0.06, { fill: '#ffffff' })
  },
  rain: (ctx) => {
    const s = ctx.size
    let out = LEXICON.cloud!(ctx)
    for (let index = 0; index < 5; index += 1) out += line([ctx.x - s * 0.34 + index * s * 0.17, ctx.y + s * 0.2], [ctx.x - s * 0.4 + index * s * 0.17, ctx.y + s * 0.48], frame(ctx, { stroke: ctx.accent, 'stroke-width': s * 0.045 }))
    return out
  },
  wind: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = 0; index < 3; index += 1) {
      const y = ctx.y - s * 0.2 + index * s * 0.2
      out += path(`M${ctx.x - s * 0.46},${y}H${ctx.x + s * (0.2 + index * 0.08)}Q${ctx.x + s * 0.46},${y} ${ctx.x + s * 0.4},${y - s * 0.12}`, frame(ctx, { 'stroke-width': s * 0.055, opacity: 0.9 - index * 0.2 }))
    }
    return out
  },
  tree: (ctx) => line([ctx.x, ctx.y + ctx.size * 0.48], [ctx.x, ctx.y - ctx.size * 0.02], frame(ctx, { stroke: mix(ctx.color, '#000', 0.35), 'stroke-width': ctx.size * 0.1 })) + circle(ctx.x, ctx.y - ctx.size * 0.22, ctx.size * 0.3, { fill: ctx.color, 'fill-opacity': 0.85 }),
  garden: (ctx) => ([[-0.32, 0], [0, 1], [0.32, 2]] as [number, number][]).map(([offset, index]) => line([ctx.x + offset * ctx.size, ctx.y + ctx.size * 0.4], [ctx.x + offset * ctx.size, ctx.y - ctx.size * 0.1], frame(ctx, { 'stroke-width': ctx.size * 0.05 })) + circle(ctx.x + offset * ctx.size, ctx.y - ctx.size * 0.2, ctx.size * (0.1 + index * 0.015), { fill: index % 2 ? ctx.accent : ctx.color })).join(''),
  cave: (ctx) => path(`M${ctx.x - ctx.size * 0.45},${ctx.y + ctx.size * 0.4}Q${ctx.x - ctx.size * 0.4},${ctx.y - ctx.size * 0.42} ${ctx.x},${ctx.y - ctx.size * 0.42}Q${ctx.x + ctx.size * 0.4},${ctx.y - ctx.size * 0.42} ${ctx.x + ctx.size * 0.45},${ctx.y + ctx.size * 0.4}Z`, filled(ctx, mix(ctx.color, '#000', 0.5))),
  chain: (ctx) => {
    const s = ctx.size
    return [-0.28, 0, 0.28].map((offset) => ellipse(ctx.x + offset * s, ctx.y, s * 0.15, s * 0.1, frame(ctx, { 'stroke-width': s * 0.06 }))).join('')
  },
  rope: (ctx) => path(`M${ctx.x - ctx.size * 0.45},${ctx.y - ctx.size * 0.2}Q${ctx.x},${ctx.y + ctx.size * 0.4} ${ctx.x + ctx.size * 0.45},${ctx.y - ctx.size * 0.2}`, frame(ctx, { 'stroke-width': ctx.size * 0.1, 'stroke-dasharray': `${ctx.size * 0.1} ${ctx.size * 0.05}` })),
  knot: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.3},${ctx.y - s * 0.3}Q${ctx.x + s * 0.4},${ctx.y} ${ctx.x - s * 0.3},${ctx.y + s * 0.3}Q${ctx.x + s * 0.4},${ctx.y} ${ctx.x - s * 0.3},${ctx.y - s * 0.3}`, frame(ctx, { 'stroke-width': s * 0.09 }))
  },
  net: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = 0; index <= 3; index += 1) {
      out += line([ctx.x - s * 0.4 + index * s * 0.26, ctx.y - s * 0.4], [ctx.x - s * 0.4 + index * s * 0.26, ctx.y + s * 0.4], frame(ctx, { 'stroke-width': s * 0.035, opacity: 0.8 }))
      out += line([ctx.x - s * 0.4, ctx.y - s * 0.4 + index * s * 0.26], [ctx.x + s * 0.4, ctx.y - s * 0.4 + index * s * 0.26], frame(ctx, { 'stroke-width': s * 0.035, opacity: 0.8 }))
    }
    return out
  },
  'cloak-hood': (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x},${ctx.y - s * 0.46}Q${ctx.x + s * 0.42},${ctx.y - s * 0.2} ${ctx.x + s * 0.3},${ctx.y + s * 0.4}H${ctx.x - s * 0.3}Q${ctx.x - s * 0.42},${ctx.y - s * 0.2} ${ctx.x},${ctx.y - s * 0.46}Z`, filled(ctx, ctx.color)) + circle(ctx.x, ctx.y - ctx.size * 0.12, ctx.size * 0.14, { fill: ctx.ink, opacity: 0.55 })
  },
  mask: (ctx) => path(`M${ctx.x - ctx.size * 0.3},${ctx.y - ctx.size * 0.34}H${ctx.x + ctx.size * 0.3}Q${ctx.x + ctx.size * 0.24},${ctx.y + ctx.size * 0.4} ${ctx.x},${ctx.y + ctx.size * 0.44}Q${ctx.x - ctx.size * 0.24},${ctx.y + ctx.size * 0.4} ${ctx.x - ctx.size * 0.3},${ctx.y - ctx.size * 0.34}Z`, filled(ctx, ctx.color)) + circle(ctx.x - ctx.size * 0.12, ctx.y - ctx.size * 0.08, ctx.size * 0.05, { fill: ctx.ink }) + circle(ctx.x + ctx.size * 0.12, ctx.y - ctx.size * 0.08, ctx.size * 0.05, { fill: ctx.ink }),
  mirror: (ctx) => ellipse(ctx.x, ctx.y - ctx.size * 0.08, ctx.size * 0.28, ctx.size * 0.34, frame(ctx, { fill: mix(ctx.accent, '#ffffff', 0.6), 'fill-opacity': 0.5, 'stroke-width': ctx.size * 0.07 })) + line([ctx.x, ctx.y + ctx.size * 0.26], [ctx.x, ctx.y + ctx.size * 0.48], frame(ctx, { 'stroke-width': ctx.size * 0.08 })),
  bell: (ctx) => path(`M${ctx.x - ctx.size * 0.26},${ctx.y + ctx.size * 0.2}Q${ctx.x - ctx.size * 0.26},${ctx.y - ctx.size * 0.34} ${ctx.x},${ctx.y - ctx.size * 0.4}Q${ctx.x + ctx.size * 0.26},${ctx.y - ctx.size * 0.34} ${ctx.x + ctx.size * 0.26},${ctx.y + ctx.size * 0.2}Z`, filled(ctx, ctx.accent)) + circle(ctx.x, ctx.y + ctx.size * 0.3, ctx.size * 0.06, { fill: ctx.color }),
  candle: (ctx) => rect2(ctx, ctx.x - ctx.size * 0.09, ctx.y - ctx.size * 0.12, ctx.size * 0.18, ctx.size * 0.5, mix('#F4EFE4', ctx.color, 0.15), true) + path(`M${ctx.x},${ctx.y - ctx.size * 0.46}Q${ctx.x + ctx.size * 0.11},${ctx.y - ctx.size * 0.26} ${ctx.x},${ctx.y - ctx.size * 0.14}Q${ctx.x - ctx.size * 0.11},${ctx.y - ctx.size * 0.26} ${ctx.x},${ctx.y - ctx.size * 0.46}Z`, { fill: ctx.accent }),
  swordbundle: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = -1; index <= 1; index += 1) out += blade([ctx.x + index * s * 0.12, ctx.y + s * 0.42], [ctx.x + index * s * 0.04, ctx.y - s * 0.44], s * 0.06, 0.2, frame(ctx, { 'stroke-width': s * 0.05 }))
    return out + path(`M${ctx.x - s * 0.26},${ctx.y + s * 0.24}Q${ctx.x},${ctx.y + s * 0.14} ${ctx.x + s * 0.26},${ctx.y + s * 0.24}`, frame(ctx, { 'stroke-width': s * 0.06 }))
  },
  scythe: (ctx) => line([ctx.x - ctx.size * 0.28, ctx.y + ctx.size * 0.48], [ctx.x + ctx.size * 0.22, ctx.y - ctx.size * 0.36], frame(ctx, { stroke: mix(ctx.color, '#000', 0.35), 'stroke-width': ctx.size * 0.08 })) + path(`M${ctx.x + ctx.size * 0.22},${ctx.y - ctx.size * 0.36}Q${ctx.x - ctx.size * 0.16},${ctx.y - ctx.size * 0.5} ${ctx.x - ctx.size * 0.36},${ctx.y - ctx.size * 0.2}Q${ctx.x - ctx.size * 0.06},${ctx.y - ctx.size * 0.3} ${ctx.x + ctx.size * 0.22},${ctx.y - ctx.size * 0.36}Z`, filled(ctx, ctx.accent)),
  axe: (ctx) => line([ctx.x - ctx.size * 0.1, ctx.y + ctx.size * 0.48], [ctx.x + ctx.size * 0.05, ctx.y - ctx.size * 0.44], frame(ctx, { stroke: mix(ctx.color, '#000', 0.35), 'stroke-width': ctx.size * 0.09 })) + path(`M${ctx.x + ctx.size * 0.05},${ctx.y - ctx.size * 0.4}Q${ctx.x + ctx.size * 0.42},${ctx.y - ctx.size * 0.24} ${ctx.x + ctx.size * 0.1},${ctx.y - ctx.size * 0.02}Q${ctx.x - ctx.size * 0.02},${ctx.y - ctx.size * 0.2} ${ctx.x + ctx.size * 0.05},${ctx.y - ctx.size * 0.4}Z`, filled(ctx, ctx.accent)),
  hammer: (ctx) => line([ctx.x, ctx.y + ctx.size * 0.48], [ctx.x, ctx.y - ctx.size * 0.16], frame(ctx, { stroke: mix(ctx.color, '#000', 0.35), 'stroke-width': ctx.size * 0.09 })) + rect2(ctx, ctx.x - ctx.size * 0.28, ctx.y - ctx.size * 0.44, ctx.size * 0.56, ctx.size * 0.26, ctx.accent, true),
  ankh: (ctx) => ellipse(ctx.x, ctx.y - ctx.size * 0.26, ctx.size * 0.16, ctx.size * 0.2, frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + line([ctx.x, ctx.y - ctx.size * 0.06], [ctx.x, ctx.y + ctx.size * 0.46], frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + line([ctx.x - ctx.size * 0.24, ctx.y + ctx.size * 0.08], [ctx.x + ctx.size * 0.24, ctx.y + ctx.size * 0.08], frame(ctx, { 'stroke-width': ctx.size * 0.08 })),
  ouroboros: (ctx) => circle(ctx.x, ctx.y, ctx.size * 0.36, frame(ctx, { 'stroke-width': ctx.size * 0.12, 'stroke-dasharray': `${ctx.size * 0.9} ${ctx.size * 0.12}` })) + path(`M${ctx.x + ctx.size * 0.36},${ctx.y}l${ctx.size * 0.12},${-ctx.size * 0.08}l0,${ctx.size * 0.16}Z`, { fill: ctx.color }),
  obelisk: (ctx) => path(`M${ctx.x - ctx.size * 0.14},${ctx.y + ctx.size * 0.46}V${ctx.y - ctx.size * 0.32}L${ctx.x},${ctx.y - ctx.size * 0.5}L${ctx.x + ctx.size * 0.14},${ctx.y - ctx.size * 0.32}V${ctx.y + ctx.size * 0.46}Z`, filled(ctx, ctx.color)),
  pyramid: (ctx) => poly([[ctx.x - ctx.size * 0.44, ctx.y + ctx.size * 0.34], [ctx.x, ctx.y - ctx.size * 0.42], [ctx.x + ctx.size * 0.44, ctx.y + ctx.size * 0.34]], filled(ctx, ctx.color)) + line([ctx.x, ctx.y - ctx.size * 0.42], [ctx.x + ctx.size * 0.1, ctx.y + ctx.size * 0.34], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.03, opacity: 0.6 })),
  urn: (ctx) => path(`M${ctx.x - ctx.size * 0.26},${ctx.y - ctx.size * 0.2}Q${ctx.x - ctx.size * 0.36},${ctx.y + ctx.size * 0.3} ${ctx.x},${ctx.y + ctx.size * 0.38}Q${ctx.x + ctx.size * 0.36},${ctx.y + ctx.size * 0.3} ${ctx.x + ctx.size * 0.26},${ctx.y - ctx.size * 0.2}Z`, filled(ctx, ctx.color)) + ellipse(ctx.x, ctx.y - ctx.size * 0.24, ctx.size * 0.3, ctx.size * 0.08, { fill: ctx.accent }),
  jar: (ctx) => LEXICON.urn!(ctx),
  well: (ctx) => ellipse(ctx.x, ctx.y - ctx.size * 0.1, ctx.size * 0.34, ctx.size * 0.14, frame(ctx, { fill: mix(ctx.ink, '#000', 0.4) })) + path(`M${ctx.x - ctx.size * 0.34},${ctx.y - ctx.size * 0.1}V${ctx.y + ctx.size * 0.34}Q${ctx.x},${ctx.y + ctx.size * 0.52} ${ctx.x + ctx.size * 0.34},${ctx.y + ctx.size * 0.34}V${ctx.y - ctx.size * 0.1}`, frame(ctx, { 'stroke-width': ctx.size * 0.07 })),
  thron: (ctx) => path(`M${ctx.x - ctx.size * 0.3},${ctx.y + ctx.size * 0.4}V${ctx.y - ctx.size * 0.4}H${ctx.x + ctx.size * 0.3}V${ctx.y + ctx.size * 0.4}`, frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + rect2(ctx, ctx.x - ctx.size * 0.34, ctx.y + ctx.size * 0.06, ctx.size * 0.68, ctx.size * 0.12, ctx.accent, true),
  stairs: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let index = 0; index < 4; index += 1) out += rect2(ctx, ctx.x - s * 0.4 + index * s * 0.1, ctx.y + s * 0.36 - index * s * 0.2, s * 0.36, s * 0.2, mix(ctx.color, '#000', index * 0.08), true)
    return out
  },
  gate2: (ctx) => LEXICON.gate!(ctx),
  infinity: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x},${ctx.y}C${ctx.x - s * 0.5},${ctx.y - s * 0.42} ${ctx.x - s * 0.5},${ctx.y + s * 0.42} ${ctx.x},${ctx.y}C${ctx.x + s * 0.5},${ctx.y - s * 0.42} ${ctx.x + s * 0.5},${ctx.y + s * 0.42} ${ctx.x},${ctx.y}Z`, frame(ctx, { 'stroke-width': s * 0.09 }))
  },
  figure: (ctx) => figure(ctx.x, ctx.y + ctx.size * 0.5, ctx.size, { arms: 'open', legs: 'stand', robe: true } as FigurePosture, { fill: ctx.color }),
}

/** `rect2` desenha rectângulos cheios sem depender do helper de attrs do svg.ts. */
function rect2(ctx: GlyphContext, x: number, y: number, w: number, h: number, fill: string, rounded = false): string {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="${fill}"${rounded ? ` rx="${round(Math.min(w, h) * 0.18)}"` : ''} stroke="${ctx.ink}" stroke-opacity="0.28" stroke-width="${round(strokeBase(ctx, 0.03))}"/>`
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function s2(ctx: GlyphContext, factor: number): number {
  return ctx.x + ctx.size * factor
}

/* ─────────────────────────── compositor ─────────────────────────── */

const EXTRA: Record<string, GlyphFn> = {
  trumpet: (ctx) => {
    const s = ctx.size
    return (
      path(`M${ctx.x - s * 0.36},${ctx.y + s * 0.1}L${ctx.x + s * 0.2},${ctx.y - s * 0.16}L${ctx.x + s * 0.2},${ctx.y + s * 0.06}L${ctx.x - s * 0.36},${ctx.y + s * 0.28}Z`, filled(ctx, ctx.accent)) +
      circle(ctx.x - s * 0.4, ctx.y + s * 0.19, s * 0.1, frame(ctx, { 'stroke-width': s * 0.05 })) +
      line([ctx.x + s * 0.2, ctx.y - s * 0.14], [ctx.x + s * 0.42, ctx.y - s * 0.2], frame(ctx, { 'stroke-width': s * 0.06 }))
    )
  },
  bindle: (ctx) => {
    const s = ctx.size
    return line([ctx.x - s * 0.4, ctx.y + s * 0.4], [ctx.x + s * 0.26, ctx.y - s * 0.2], frame(ctx, { 'stroke-width': s * 0.07 })) + circle(ctx.x + s * 0.3, ctx.y - s * 0.3, s * 0.2, filled(ctx, ctx.color)) + [0, 1, 2].map((index) => line([ctx.x + s * 0.26, ctx.y - s * 0.2], [ctx.x + s * 0.1 + index * s * 0.1, ctx.y - s * 0.42], frame(ctx, { 'stroke-width': s * 0.04 }))).join('')
  },
  table: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.44, ctx.y - s * 0.1, s * 0.88, s * 0.12, ctx.color, true) + line([ctx.x - s * 0.32, ctx.y + s * 0.02], [ctx.x - s * 0.32, ctx.y + s * 0.38], frame(ctx, { 'stroke-width': s * 0.07 })) + line([ctx.x + s * 0.32, ctx.y + s * 0.02], [ctx.x + s * 0.32, ctx.y + s * 0.38], frame(ctx, { 'stroke-width': s * 0.07 }))
  },
  pomegranate: (ctx) => {
    const s = ctx.size
    return circle(ctx.x, ctx.y + s * 0.04, s * 0.3, filled(ctx, ctx.color)) + poly([[ctx.x - s * 0.1, ctx.y - s * 0.24], [ctx.x, ctx.y - s * 0.42], [ctx.x + s * 0.1, ctx.y - s * 0.24]], { fill: ctx.accent }) + [-0.1, 0.06, -0.02, 0.14].map((offset, index) => circle(ctx.x + offset * s, ctx.y + (index % 2 ? 0.06 : -0.02) * s, s * 0.035, { fill: mix(ctx.accent, '#ffffff', 0.4) })).join('')
  },
  ram: (ctx) => {
    const s = ctx.size
    return ellipse(ctx.x, ctx.y, s * 0.2, s * 0.26, filled(ctx, ctx.color)) + path(`M${ctx.x - s * 0.2},${ctx.y - s * 0.12}a${s * 0.18},${s * 0.18} 0 1 0 ${-s * 0.02},${s * 0.28}`, frame(ctx, { 'stroke-width': s * 0.08 })) + path(`M${ctx.x + s * 0.2},${ctx.y - s * 0.12}a${s * 0.18},${s * 0.18} 0 1 1 ${s * 0.02},${s * 0.28}`, frame(ctx, { 'stroke-width': s * 0.08 }))
  },
  globe: (ctx) => circle(ctx.x, ctx.y - ctx.size * 0.04, ctx.size * 0.28, frame(ctx, { fill: ctx.accent, 'fill-opacity': 0.25 })) + ellipse(ctx.x, ctx.y - ctx.size * 0.04, ctx.size * 0.12, ctx.size * 0.28, frame(ctx, { 'stroke-width': ctx.size * 0.04 })) + line([ctx.x - ctx.size * 0.28, ctx.y - ctx.size * 0.04], [ctx.x + ctx.size * 0.28, ctx.y - ctx.size * 0.04], frame(ctx, { 'stroke-width': ctx.size * 0.04 })) + line([ctx.x, ctx.y + ctx.size * 0.24], [ctx.x, ctx.y + ctx.size * 0.42], frame(ctx, { 'stroke-width': ctx.size * 0.07 })),
  sphinx: (ctx) => {
    const s = ctx.size
    return poly([[ctx.x - s * 0.46, ctx.y + s * 0.3], [ctx.x - s * 0.2, ctx.y - s * 0.1], [ctx.x + s * 0.1, ctx.y - s * 0.06], [ctx.x + s * 0.2, ctx.y - s * 0.36], [ctx.x + s * 0.36, ctx.y - s * 0.3], [ctx.x + s * 0.46, ctx.y + s * 0.3]], filled(ctx, ctx.color)) + line([ctx.x - s * 0.46, ctx.y + s * 0.3], [ctx.x + s * 0.46, ctx.y + s * 0.3], frame(ctx, { stroke: ctx.ink, 'stroke-width': s * 0.06 }))
  },
  aura: (ctx) => [0, 1, 2].map((index) => ellipse(ctx.x, ctx.y, ctx.size * (0.24 + index * 0.12), ctx.size * (0.3 + index * 0.14), frame(ctx, { 'stroke-width': ctx.size * 0.035, opacity: 0.85 - index * 0.22 }))).join(''),
  bishop: (ctx) => {
    const s = ctx.size
    return figure(ctx.x, ctx.y + s * 0.5, s * 0.98, { arms: 'one-raised', legs: 'stand', robe: true }, { fill: ctx.color }) + poly([[ctx.x - s * 0.1, ctx.y - s * 0.52], [ctx.x, ctx.y - s * 0.8], [ctx.x + s * 0.1, ctx.y - s * 0.52]], { fill: ctx.accent }) + line([ctx.x + s * 0.3, ctx.y - s * 0.34], [ctx.x + s * 0.3, ctx.y + s * 0.24], frame(ctx, { stroke: ctx.accent, 'stroke-width': s * 0.06 }))
  },
  devil: (ctx) => {
    const s = ctx.size
    return circle(ctx.x, ctx.y, s * 0.24, filled(ctx, ctx.color)) + poly([[ctx.x - s * 0.24, ctx.y - s * 0.14], [ctx.x - s * 0.34, ctx.y - s * 0.44], [ctx.x - s * 0.08, ctx.y - s * 0.22]], { fill: ctx.accent }) + poly([[ctx.x + s * 0.24, ctx.y - s * 0.14], [ctx.x + s * 0.34, ctx.y - s * 0.44], [ctx.x + s * 0.08, ctx.y - s * 0.22]], { fill: ctx.accent }) + circle(ctx.x - s * 0.09, ctx.y - s * 0.03, s * 0.04, { fill: '#ffd166' }) + circle(ctx.x + s * 0.09, ctx.y - s * 0.03, s * 0.04, { fill: '#ffd166' }) + path(`M${ctx.x - s * 0.2},${ctx.y + s * 0.2}q${s * 0.2},${s * 0.24} ${s * 0.4},0`, frame(ctx, { 'stroke-width': s * 0.05 }))
  },
  'twin-faces': (ctx) => {
    const s = ctx.size
    return circle(ctx.x - s * 0.14, ctx.y, s * 0.2, filled(ctx, ctx.color)) + circle(ctx.x + s * 0.14, ctx.y, s * 0.2, filled(ctx, ctx.accent)) + path(`M${ctx.x},${ctx.y - s * 0.34}v${s * 0.68}`, frame(ctx, { stroke: ctx.ink, 'stroke-width': s * 0.04 }))
  },
  cage: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.3},${ctx.y - s * 0.1}a${s * 0.3},${s * 0.34} 0 0 1 ${s * 0.6},0`, frame(ctx, { 'stroke-width': s * 0.06 })) + rect2(ctx, ctx.x - s * 0.3, ctx.y - s * 0.1, s * 0.6, s * 0.5, 'none', false) + [-0.18, -0.06, 0.06, 0.18].map((offset) => line([ctx.x + offset * s, ctx.y - s * 0.1], [ctx.x + offset * s, ctx.y + s * 0.4], frame(ctx, { 'stroke-width': s * 0.035 }))).join('')
  },
  crayfish: (ctx) => {
    const s = ctx.size
    return ellipse(ctx.x, ctx.y, s * 0.26, s * 0.14, filled(ctx, ctx.color)) + path(`M${ctx.x - s * 0.24},${ctx.y - s * 0.06}q${-s * 0.2},${-s * 0.2} ${-s * 0.02},${-s * 0.26}`, frame(ctx, { 'stroke-width': s * 0.06 })) + path(`M${ctx.x + s * 0.24},${ctx.y - s * 0.06}q${s * 0.2},${-s * 0.2} ${s * 0.02},${-s * 0.26}`, frame(ctx, { 'stroke-width': s * 0.06 })) + poly([[ctx.x - s * 0.3, ctx.y + s * 0.02], [ctx.x - s * 0.46, ctx.y - s * 0.08], [ctx.x - s * 0.46, ctx.y + s * 0.14]], { fill: ctx.accent })
  },
  sunflower: (ctx) => rays(ctx.x, ctx.y, ctx.size * 0.24, ctx.size * 0.44, 14, { fill: ctx.accent }) + circle(ctx.x, ctx.y, ctx.size * 0.2, { fill: mix(ctx.color, '#000', 0.45) }),
  wall: (ctx) => {
    const s = ctx.size
    let out = ''
    for (let row = 0; row < 4; row += 1) {
      const y = ctx.y - s * 0.36 + row * s * 0.24
      const offset = row % 2 ? -s * 0.16 : 0
      for (let column = 0; column < 3; column += 1) out += rect2(ctx, ctx.x - s * 0.36 + offset + column * s * 0.32, y, s * 0.3, s * 0.2, mix(ctx.color, '#000', row * 0.06), false)
    }
    return out
  },
  banner: (ctx) => {
    const s = ctx.size
    return line([ctx.x - s * 0.34, ctx.y - s * 0.44], [ctx.x - s * 0.34, ctx.y + s * 0.44], frame(ctx, { 'stroke-width': s * 0.06 })) + path(`M${ctx.x - s * 0.3},${ctx.y - s * 0.36}h${s * 0.6}v${s * 0.44}l${-s * 0.3},${-s * 0.12}l${-s * 0.3},${s * 0.12}Z`, filled(ctx, ctx.accent))
  },
  tomb: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.3},${ctx.y + s * 0.4}V${ctx.y - s * 0.1}a${s * 0.3},${s * 0.3} 0 0 1 ${s * 0.6},0V${ctx.y + s * 0.4}Z`, filled(ctx, mix(ctx.color, '#000', 0.3))) + path(`M${ctx.x - s * 0.18},${ctx.y + s * 0.4}V${ctx.y}a${s * 0.18},${s * 0.18} 0 0 1 ${s * 0.36},0V${ctx.y + s * 0.4}Z`, { fill: ctx.ink, opacity: 0.8 }) + ellipse(ctx.x + s * 0.34, ctx.y + s * 0.36, s * 0.24, s * 0.1, { fill: ctx.accent, opacity: 0.8 })
  },
  dancer: (ctx) => {
    const s = ctx.size
    return figure(ctx.x, ctx.y + s * 0.42, s * 0.9, { arms: 'raised', legs: 'stride' }, { fill: ctx.color }) + poly([[ctx.x - s * 0.24, ctx.y + s * 0.02], [ctx.x + s * 0.24, ctx.y + s * 0.02], [ctx.x + s * 0.12, ctx.y + s * 0.3], [ctx.x - s * 0.12, ctx.y + s * 0.3]], { fill: ctx.accent, opacity: 0.85 })
  },
  burden: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.42},${ctx.y - s * 0.18}Q${ctx.x},${ctx.y - s * 0.34} ${ctx.x + s * 0.42},${ctx.y - s * 0.18}`, frame(ctx, { 'stroke-width': s * 0.07 })) + circle(ctx.x - s * 0.34, ctx.y + s * 0.1, s * 0.18, filled(ctx, ctx.color)) + circle(ctx.x + s * 0.34, ctx.y + s * 0.06, s * 0.16, filled(ctx, ctx.accent))
  },
  caduceus: (ctx) => {
    const s = ctx.size
    return line([ctx.x, ctx.y - s * 0.46], [ctx.x, ctx.y + s * 0.46], frame(ctx, { 'stroke-width': s * 0.07 })) + path(`M${ctx.x - s * 0.26},${ctx.y - s * 0.28}q${s * 0.5},${s * 0.14} 0,${s * 0.34}q${-s * 0.5},${s * 0.2} 0,${s * 0.32}`, frame(ctx, { stroke: ctx.accent, 'stroke-width': s * 0.055 })) + path(`M${ctx.x + s * 0.26},${ctx.y - s * 0.28}q${-s * 0.5},${s * 0.14} 0,${s * 0.34}q${s * 0.5},${s * 0.2} 0,${s * 0.32}`, frame(ctx, { stroke: ctx.accent, 'stroke-width': s * 0.055 })) + circle(ctx.x, ctx.y - s * 0.5, s * 0.07, { fill: ctx.accent })
  },
  castle: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.44, ctx.y - s * 0.06, s * 0.88, s * 0.5, ctx.color, false) + rect2(ctx, ctx.x - s * 0.4, ctx.y - s * 0.38, s * 0.2, s * 0.36, mix(ctx.color, '#000', 0.15), false) + rect2(ctx, ctx.x + s * 0.2, ctx.y - s * 0.38, s * 0.2, s * 0.36, mix(ctx.color, '#000', 0.15), false) + rect2(ctx, ctx.x - s * 0.09, ctx.y + s * 0.14, s * 0.18, s * 0.3, ctx.ink, false)
  },
  jewel: (ctx) => {
    const s = ctx.size
    return poly([[ctx.x - s * 0.3, ctx.y - s * 0.08], [ctx.x - s * 0.16, ctx.y - s * 0.3], [ctx.x + s * 0.16, ctx.y - s * 0.3], [ctx.x + s * 0.3, ctx.y - s * 0.08], [ctx.x, ctx.y + s * 0.34]], filled(ctx, ctx.accent)) + line([ctx.x - s * 0.3, ctx.y - s * 0.08], [ctx.x + s * 0.3, ctx.y - s * 0.08], frame(ctx, { stroke: ctx.ink, 'stroke-width': s * 0.035 })) + star(ctx.x + s * 0.36, ctx.y - s * 0.3, s * 0.1, s * 0.04, 4, { fill: '#ffffff' })
  },
  ring: (ctx) => circle(ctx.x, ctx.y + ctx.size * 0.06, ctx.size * 0.26, frame(ctx, { 'stroke-width': ctx.size * 0.1 })) + poly([[ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.2], [ctx.x, ctx.y - ctx.size * 0.4], [ctx.x + ctx.size * 0.1, ctx.y - ctx.size * 0.2], [ctx.x, ctx.y - ctx.size * 0.06]], { fill: ctx.accent }),
  cushion: (ctx) => path(`M${ctx.x - ctx.size * 0.36},${ctx.y - ctx.size * 0.2}Q${ctx.x},${ctx.y - ctx.size * 0.36} ${ctx.x + ctx.size * 0.36},${ctx.y - ctx.size * 0.2}Q${ctx.x + ctx.size * 0.44},${ctx.y + ctx.size * 0.12} ${ctx.x + ctx.size * 0.3},${ctx.y + ctx.size * 0.24}Q${ctx.x},${ctx.y + ctx.size * 0.36} ${ctx.x - ctx.size * 0.3},${ctx.y + ctx.size * 0.24}Q${ctx.x - ctx.size * 0.44},${ctx.y + ctx.size * 0.12} ${ctx.x - ctx.size * 0.36},${ctx.y - ctx.size * 0.2}Z`, filled(ctx, ctx.color)) + circle(ctx.x - ctx.size * 0.3, ctx.y + ctx.size * 0.3, ctx.size * 0.05, { fill: ctx.accent }) + circle(ctx.x + ctx.size * 0.3, ctx.y + ctx.size * 0.3, ctx.size * 0.05, { fill: ctx.accent }),
  rainbow: (ctx) => {
    const s = ctx.size
    return [0, 1, 2].map((index) => path(`M${ctx.x - s * (0.44 - index * 0.1)},${ctx.y + s * 0.24}A${s * (0.44 - index * 0.1)},${s * (0.44 - index * 0.1)} 0 0 1 ${ctx.x + s * (0.44 - index * 0.1)},${ctx.y + s * 0.24}`, { fill: 'none', stroke: [ctx.color, ctx.accent, mix(ctx.accent, '#ffffff', 0.4)][index], 'stroke-width': s * 0.09 })).join('')
  },
  fish: (ctx) => ellipse(ctx.x, ctx.y, ctx.size * 0.28, ctx.size * 0.16, filled(ctx, ctx.color)) + poly([[ctx.x + ctx.size * 0.24, ctx.y], [ctx.x + ctx.size * 0.46, ctx.y - ctx.size * 0.16], [ctx.x + ctx.size * 0.46, ctx.y + ctx.size * 0.16]], { fill: ctx.accent }) + circle(ctx.x - ctx.size * 0.14, ctx.y - ctx.size * 0.04, ctx.size * 0.03, { fill: ctx.ink }),
  gull: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.06}Q${ctx.x - ctx.size * 0.18},${ctx.y - ctx.size * 0.3} ${ctx.x},${ctx.y}Q${ctx.x + ctx.size * 0.18},${ctx.y - ctx.size * 0.3} ${ctx.x + ctx.size * 0.4},${ctx.y + ctx.size * 0.06}`, frame(ctx, { 'stroke-width': ctx.size * 0.07 })) + circle(ctx.x, ctx.y + ctx.size * 0.06, ctx.size * 0.05, { fill: ctx.color }),
  shell: (ctx) => path(`M${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.24}Q${ctx.x},${ctx.y - ctx.size * 0.44} ${ctx.x + ctx.size * 0.34},${ctx.y + ctx.size * 0.24}Z`, filled(ctx, mix(ctx.color, '#ffffff', 0.3))) + [-0.2, -0.06, 0.08, 0.2].map((offset) => line([ctx.x + offset * ctx.size, ctx.y + ctx.size * 0.22], [ctx.x, ctx.y - ctx.size * 0.3], frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.03, opacity: 0.7 }))).join(''),
  dolphin: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.14}Q${ctx.x - ctx.size * 0.06},${ctx.y - ctx.size * 0.42} ${ctx.x + ctx.size * 0.36},${ctx.y - ctx.size * 0.04}L${ctx.x + ctx.size * 0.2},${ctx.y + ctx.size * 0.08}Z`, filled(ctx, ctx.color)) + path(`M${ctx.x - ctx.size * 0.02},${ctx.y - ctx.size * 0.24}l${ctx.size * 0.1},${-ctx.size * 0.16}l${ctx.size * 0.04},${ctx.size * 0.2}Z`, { fill: ctx.accent }),
  palm: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x},${ctx.y + s * 0.46}Q${ctx.x + s * 0.1},${ctx.y} ${ctx.x},${ctx.y - s * 0.24}`, frame(ctx, { stroke: mix(ctx.color, '#000', 0.25), 'stroke-width': s * 0.09 })) + [0, 1, 2, 3, 4].map((index) => path(`M${ctx.x},${ctx.y - s * 0.26}q${(index - 2) * s * 0.2},${-s * 0.22} ${(index - 2) * s * 0.34},${s * 0.06}`, frame(ctx, { stroke: ctx.color, 'stroke-width': s * 0.06 }))).join('')
  },
  blindfold: (ctx) => rect2(ctx, ctx.x - ctx.size * 0.36, ctx.y - ctx.size * 0.1, ctx.size * 0.72, ctx.size * 0.2, ctx.color, true) + line([ctx.x + ctx.size * 0.36, ctx.y - ctx.size * 0.02], [ctx.x + ctx.size * 0.52, ctx.y + ctx.size * 0.16], frame(ctx, { stroke: ctx.color, 'stroke-width': ctx.size * 0.05 })) + circle(ctx.x, ctx.y, ctx.size * 0.03, { fill: ctx.accent }),
  kneeler: (ctx) => {
    const s = ctx.size
    return path(`M${ctx.x - s * 0.4},${ctx.y + s * 0.36}V${ctx.y + s * 0.1}L${ctx.x - s * 0.06},${ctx.y - s * 0.24}V${ctx.y + s * 0.36}Z`, filled(ctx, ctx.color)) + rect2(ctx, ctx.x + s * 0.02, ctx.y + s * 0.08, s * 0.36, s * 0.08, ctx.accent, true) + rect2(ctx, ctx.x + s * 0.06, ctx.y + s * 0.16, s * 0.08, s * 0.2, ctx.color, false)
  },
  reed: (ctx) => {
    const s = ctx.size
    return [-0.24, -0.06, 0.12, 0.3].map((offset, index) => line([ctx.x + offset * s, ctx.y + s * 0.46], [ctx.x + offset * s + s * 0.04, ctx.y - s * (0.3 + (index % 2) * 0.12)], frame(ctx, { stroke: ctx.color, 'stroke-width': s * 0.05 })) + ellipse(ctx.x + offset * s + s * 0.05, ctx.y - s * (0.34 + (index % 2) * 0.14), s * 0.05, s * 0.11, { fill: ctx.accent })).join('')
  },
  tent: (ctx) => poly([[ctx.x - ctx.size * 0.4, ctx.y + ctx.size * 0.3], [ctx.x, ctx.y - ctx.size * 0.38], [ctx.x + ctx.size * 0.4, ctx.y + ctx.size * 0.3]], filled(ctx, ctx.color)) + path(`M${ctx.x},${ctx.y - ctx.size * 0.38}V${ctx.y + ctx.size * 0.3}`, frame(ctx, { stroke: ctx.ink, 'stroke-width': ctx.size * 0.04 })) + poly([[ctx.x, ctx.y + ctx.size * 0.3], [ctx.x - ctx.size * 0.1, ctx.y + ctx.size * 0.02], [ctx.x + ctx.size * 0.1, ctx.y + ctx.size * 0.02]], { fill: ctx.ink, opacity: 0.55 }),
  cord: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.26}Q${ctx.x},${ctx.y - ctx.size * 0.4} ${ctx.x + ctx.size * 0.4},${ctx.y + ctx.size * 0.1}`, frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + circle(ctx.x, ctx.y - ctx.size * 0.08, ctx.size * 0.08, frame(ctx, { 'stroke-width': ctx.size * 0.06 })),
  fortress: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.46, ctx.y - s * 0.1, s * 0.92, s * 0.5, ctx.color, false) + [-0.46, -0.22, 0.02, 0.26].map((offset) => rect2(ctx, ctx.x + offset * s, ctx.y - s * 0.24, s * 0.16, s * 0.16, mix(ctx.color, '#000', 0.12), false)).join('') + rect2(ctx, ctx.x - s * 0.12, ctx.y + s * 0.08, s * 0.24, s * 0.32, ctx.ink, false)
  },
  bed: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.42, ctx.y - s * 0.02, s * 0.84, s * 0.3, mix(ctx.color, '#ffffff', 0.3), true) + rect2(ctx, ctx.x - s * 0.46, ctx.y - s * 0.24, s * 0.12, s * 0.56, ctx.color, false) + rect2(ctx, ctx.x - s * 0.36, ctx.y - s * 0.12, s * 0.2, s * 0.1, ctx.accent, true) + line([ctx.x - s * 0.3, ctx.y + s * 0.28], [ctx.x - s * 0.3, ctx.y + s * 0.42], frame(ctx, { 'stroke-width': s * 0.05 })) + line([ctx.x + s * 0.3, ctx.y + s * 0.28], [ctx.x + s * 0.3, ctx.y + s * 0.42], frame(ctx, { 'stroke-width': s * 0.05 }))
  },
  gargoyle: (ctx) => {
    const s = ctx.size
    return figure(ctx.x, ctx.y + s * 0.4, s * 0.8, { arms: 'open', legs: 'kneel' }, { fill: mix(ctx.color, '#5a5f6a', 0.5) }) + path(`M${ctx.x - s * 0.34},${ctx.y - s * 0.16}Q${ctx.x - s * 0.6},${ctx.y - s * 0.46} ${ctx.x - s * 0.26},${ctx.y - s * 0.4}Z`, { fill: ctx.color }) + path(`M${ctx.x + s * 0.34},${ctx.y - s * 0.16}Q${ctx.x + s * 0.6},${ctx.y - s * 0.46} ${ctx.x + s * 0.26},${ctx.y - s * 0.4}Z`, { fill: ctx.color })
  },
  curtain: (ctx) => {
    const s = ctx.size
    return line([ctx.x - s * 0.44, ctx.y - s * 0.4], [ctx.x + s * 0.44, ctx.y - s * 0.4], frame(ctx, { 'stroke-width': s * 0.07 })) + [-0.36, -0.16, 0.04, 0.24].map((offset, index) => path(`M${ctx.x + offset * s},${ctx.y - s * 0.36}q${s * 0.08},${s * 0.4} 0,${s * 0.82}`, frame(ctx, { stroke: index % 2 ? ctx.color : mix(ctx.color, '#ffffff', 0.2), 'stroke-width': s * 0.12 }))).join('')
  },
  ribbon: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y - ctx.size * 0.2}q${ctx.size * 0.4},${ctx.size * 0.3} 0,${ctx.size * 0.56}q${ctx.size * 0.4},${ctx.size * 0.26} 0,${ctx.size * 0.02}`, frame(ctx, { stroke: ctx.accent, 'stroke-width': ctx.size * 0.12 })) + circle(ctx.x - ctx.size * 0.4, ctx.y - ctx.size * 0.2, ctx.size * 0.06, { fill: ctx.color }),
  chisel: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.06, ctx.y - s * 0.4, s * 0.12, s * 0.44, ctx.accent, false) + poly([[ctx.x - s * 0.06, ctx.y + s * 0.04], [ctx.x + s * 0.06, ctx.y + s * 0.04], [ctx.x + s * 0.1, ctx.y + s * 0.34], [ctx.x - s * 0.1, ctx.y + s * 0.34]], { fill: mix(ctx.color, '#ffffff', 0.4) }) + line([ctx.x + s * 0.3, ctx.y - s * 0.3], [ctx.x + s * 0.3, ctx.y + s * 0.3], frame(ctx, { stroke: ctx.color, 'stroke-width': s * 0.07 }))
  },
  glass: (ctx) => {
    const s = ctx.size
    const colors = [ctx.color, ctx.accent, mix(ctx.color, '#ffffff', 0.35), mix(ctx.accent, '#000', 0.25)]
    let out = ''
    for (let row = 0; row < 3; row += 1) for (let column = 0; column < 3; column += 1) out += rect2(ctx, ctx.x - s * 0.36 + column * s * 0.24, ctx.y - s * 0.36 + row * s * 0.24, s * 0.22, s * 0.22, colors[(row + column) % colors.length]!, false)
    return path(`M${ctx.x - s * 0.4},${ctx.y + s * 0.4}V${ctx.y - s * 0.1}a${s * 0.4},${s * 0.4} 0 0 1 ${s * 0.8},0V${ctx.y + s * 0.4}Z`, { fill: 'none', stroke: ctx.ink, 'stroke-width': s * 0.06 }) + out
  },
  crutch: (ctx) => line([ctx.x - ctx.size * 0.1, ctx.y + ctx.size * 0.46], [ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.3], frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + path(`M${ctx.x - ctx.size * 0.3},${ctx.y - ctx.size * 0.24}a${ctx.size * 0.2},${ctx.size * 0.2} 0 0 1 ${ctx.size * 0.4},0`, frame(ctx, { 'stroke-width': ctx.size * 0.08 })) + rect2(ctx, ctx.x - ctx.size * 0.2, ctx.y - ctx.size * 0.3, ctx.size * 0.14, ctx.size * 0.1, ctx.accent, true),
  purse: (ctx) => path(`M${ctx.x - ctx.size * 0.28},${ctx.y - ctx.size * 0.06}Q${ctx.x},${ctx.y - ctx.size * 0.5} ${ctx.x + ctx.size * 0.28},${ctx.y - ctx.size * 0.06}Q${ctx.x + ctx.size * 0.34},${ctx.y + ctx.size * 0.38} ${ctx.x},${ctx.y + ctx.size * 0.4}Q${ctx.x - ctx.size * 0.34},${ctx.y + ctx.size * 0.38} ${ctx.x - ctx.size * 0.28},${ctx.y - ctx.size * 0.06}Z`, filled(ctx, ctx.color)) + line([ctx.x - ctx.size * 0.2, ctx.y - ctx.size * 0.1], [ctx.x + ctx.size * 0.2, ctx.y - ctx.size * 0.1], frame(ctx, { stroke: ctx.accent, 'stroke-width': ctx.size * 0.05 })) + circle(ctx.x + ctx.size * 0.34, ctx.y + ctx.size * 0.3, ctx.size * 0.08, { fill: ctx.accent }),
  workbench: (ctx) => {
    const s = ctx.size
    return rect2(ctx, ctx.x - s * 0.44, ctx.y - s * 0.06, s * 0.88, s * 0.14, ctx.color, false) + line([ctx.x - s * 0.34, ctx.y + s * 0.08], [ctx.x - s * 0.34, ctx.y + s * 0.42], frame(ctx, { 'stroke-width': s * 0.07 })) + line([ctx.x + s * 0.34, ctx.y + s * 0.08], [ctx.x + s * 0.34, ctx.y + s * 0.42], frame(ctx, { 'stroke-width': s * 0.07 })) + LEXICON.hammer!({ ...ctx, x: ctx.x - s * 0.16, y: ctx.y - s * 0.32, size: s * 0.42 }) + LEXICON.chisel({ ...ctx, x: ctx.x + s * 0.2, y: ctx.y - s * 0.3, size: s * 0.4 })
  },
  falcon: (ctx) => path(`M${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.36}Q${ctx.x + ctx.size * 0.3},${ctx.y - ctx.size * 0.2} ${ctx.x + ctx.size * 0.16},${ctx.y + ctx.size * 0.16}Q${ctx.x},${ctx.y + ctx.size * 0.4} ${ctx.x - ctx.size * 0.24},${ctx.y + ctx.size * 0.16}Q${ctx.x - ctx.size * 0.36},${ctx.y - ctx.size * 0.14} ${ctx.x - ctx.size * 0.1},${ctx.y - ctx.size * 0.36}Z`, filled(ctx, ctx.color)) + circle(ctx.x + ctx.size * 0.06, ctx.y - ctx.size * 0.24, ctx.size * 0.028, { fill: ctx.ink }) + poly([[ctx.x + ctx.size * 0.16, ctx.y - ctx.size * 0.3], [ctx.x + ctx.size * 0.34, ctx.y - ctx.size * 0.24], [ctx.x + ctx.size * 0.16, ctx.y - ctx.size * 0.18]], { fill: ctx.accent }),
  hat: (ctx) => ellipse(ctx.x, ctx.y + ctx.size * 0.1, ctx.size * 0.44, ctx.size * 0.12, filled(ctx, ctx.color)) + path(`M${ctx.x - ctx.size * 0.2},${ctx.y + ctx.size * 0.06}Q${ctx.x},${ctx.y - ctx.size * 0.5} ${ctx.x + ctx.size * 0.2},${ctx.y + ctx.size * 0.06}Z`, filled(ctx, mix(ctx.color, '#ffffff', 0.2))) + line([ctx.x - ctx.size * 0.36, ctx.y + ctx.size * 0.16], [ctx.x + ctx.size * 0.36, ctx.y + ctx.size * 0.2], frame(ctx, { stroke: ctx.accent, 'stroke-width': ctx.size * 0.04, opacity: 0.8 })),
  plough: (ctx) => path(`M${ctx.x - ctx.size * 0.4},${ctx.y + ctx.size * 0.3}Q${ctx.x},${ctx.y + ctx.size * 0.06} ${ctx.x + ctx.size * 0.3},${ctx.y + ctx.size * 0.36}`, frame(ctx, { 'stroke-width': ctx.size * 0.09 })) + line([ctx.x - ctx.size * 0.1, ctx.y + ctx.size * 0.2], [ctx.x + ctx.size * 0.36, ctx.y - ctx.size * 0.4], frame(ctx, { stroke: mix(ctx.color, '#000', 0.2), 'stroke-width': ctx.size * 0.07 })) + circle(ctx.x + ctx.size * 0.4, ctx.y - ctx.size * 0.42, ctx.size * 0.05, { fill: ctx.accent }),
  rabbit: (ctx) => circle(ctx.x, ctx.y + ctx.size * 0.08, ctx.size * 0.2, filled(ctx, ctx.color)) + ellipse(ctx.x - ctx.size * 0.1, ctx.y - ctx.size * 0.28, ctx.size * 0.06, ctx.size * 0.22, { fill: ctx.color, transform: `rotate(-12 ${ctx.x - ctx.size * 0.1} ${ctx.y - ctx.size * 0.28})` }) + ellipse(ctx.x + ctx.size * 0.1, ctx.y - ctx.size * 0.28, ctx.size * 0.06, ctx.size * 0.22, { fill: mix(ctx.color, '#ffffff', 0.2), transform: `rotate(12 ${ctx.x + ctx.size * 0.1} ${ctx.y - ctx.size * 0.28})` }) + circle(ctx.x + ctx.size * 0.06, ctx.y + ctx.size * 0.06, ctx.size * 0.025, { fill: ctx.ink }),
}

Object.assign(LEXICON, EXTRA)

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
}

const STATE_RULES: { test: RegExp; apply: (inner: string, ctx: GlyphContext) => string; label: string }[] = [
  {
    label: 'cruzadas',
    test: /(cross|cruzad)/,
    apply: (inner, ctx) => `<g transform="rotate(-24 ${round(ctx.x)} ${round(ctx.y)})">${inner}</g><g transform="rotate(24 ${round(ctx.x)} ${round(ctx.y)})" opacity="0.92">${inner}</g>`,
  },
  { label: 'partidas', test: /(broken|partid|snapped)/, apply: (inner, ctx) => `${inner}<line x1="${round(ctx.x - ctx.size * 0.5)}" y1="${round(ctx.y + ctx.size * 0.02)}" x2="${round(ctx.x + ctx.size * 0.5)}" y2="${round(ctx.y - ctx.size * 0.02)}" stroke="${ctx.ink}" stroke-width="${round(ctx.size * 0.07)}" stroke-dasharray="${round(ctx.size * 0.1)} ${round(ctx.size * 0.06)}"/>` },
  { label: 'erguidas', test: /(standing|upright|erguid|raised|up)/, apply: (inner) => inner },
  { label: 'caídas', test: /(fallen|falling|down|inverted)/, apply: (inner, ctx) => `<g transform="rotate(180 ${round(ctx.x)} ${round(ctx.y)})">${inner}</g>` },
  { label: 'a arder', test: /(burning|flaming|fire|ard)/, apply: (inner, ctx) => `${inner}<g opacity="0.9">${LEXICON.fire!({ ...ctx, size: ctx.size * 0.42, y: ctx.y - ctx.size * 0.5 })}</g>` },
  { label: 'a brilhar', test: /(glow|shining|radiant|bright)/, apply: (inner, ctx) => `${circle(ctx.x, ctx.y, ctx.size * 0.6, { fill: ctx.accent, opacity: 0.16 })}${inner}` },
  { label: 'flutuante', test: /(floating|floating-up|levit|air|sky)/, apply: (inner, ctx) => `${inner}${line([ctx.x - ctx.size * 0.3, ctx.y + ctx.size * 0.6], [ctx.x + ctx.size * 0.3, ctx.y + ctx.size * 0.6], { stroke: ctx.ink, 'stroke-width': ctx.size * 0.03, opacity: 0.4, 'stroke-dasharray': `${ctx.size * 0.1} ${ctx.size * 0.06}` })}` },
]

interface Resolved {
  inner: string
  count: number
  states: string[]
  base: string
}

/** Resolve um id de glifo em desenho, com quantidade e estados derivados do nome. */
export function resolveGlyph(id: string, ctx: GlyphContext): Resolved | null {
  const tokens = id.toLowerCase().replace(/[^a-z0-9-]+/g, '-').split('-').filter(Boolean)
  let count = 1
  const rest = [...tokens]
  const head = rest[0] ?? ''
  if (/^\d+$/.test(head)) {
    count = Number(head)
    rest.shift()
  } else if (NUMBER_WORDS[head] !== undefined) {
    count = NUMBER_WORDS[head]!
    rest.shift()
  }
  const states = STATE_RULES.filter((rule) => rule.test.test(id)).map((rule) => rule.label)
  const base = findBase(rest)
  if (!base) return null
  let inner = single(base, ctx, rest)
  for (const rule of STATE_RULES) if (rule.test.test(id)) inner = rule.apply(inner, ctx)
  if (count > 1 && !/(cross|cruzad)/.test(id)) inner = arrange(inner, ctx, count, id)
  return { inner, count, states, base }
}

function findBase(tokens: string[]): string | null {
  const joined = tokens.join('-')
  if (LEXICON[joined]) return joined
  for (const token of [...tokens].reverse()) {
    const normalised = token === 'staves' || token === 'wands' ? 'wand' : token === 'swords' ? 'sword' : token === 'cups' || token === 'chalices' ? 'chalice' : token === 'coins' || token === 'pentacles' || token === 'disks' ? 'pentacle' : token === 'hands' ? 'hand' : token === 'roses' ? 'rose' : token === 'sun' || token === 'solar' ? 'sun' : token
    if (LEXICON[normalised]) return normalised
  }
  // compostos frequentes que merecem desenho próprio
  if (/(sun|moon)-(rays|half)/.test(joined)) return 'sun'
  if (/pool|water/.test(joined)) return 'water'
  if (/window|rose/.test(joined)) return 'rose'
  if (/band/.test(joined)) return 'wave'
  if (/crown|diadem/.test(joined)) return 'crown'
  if (/blade/.test(joined)) return 'blade'
  if (/wing/.test(joined)) return 'wing'
  if (/feather/.test(joined)) return 'feather'
  if (/thread|spindle/.test(joined)) return 'rope'
  if (/chain/.test(joined)) return 'chain'
  if (/mirror/.test(joined)) return 'mirror'
  if (/lantern|lamp/.test(joined)) return 'lantern'
  if (/bell/.test(joined)) return 'bell'
  if (/book|tome|scripture/.test(joined)) return 'book'
  if (/scroll|tablet/.test(joined)) return 'scroll'
  if (/throne|seat/.test(joined)) return 'thron'
  if (/stairs|steps/.test(joined)) return 'stairs'
  if (/well/.test(joined)) return 'well'
  if (/urn|jar|vessel|amphora/.test(joined)) return 'urn'
  if (/pillar|column/.test(joined)) return 'pillar'
  if (/temple|church|cathedral/.test(joined)) return 'arch'
  if (/cliff|edge|precipice/.test(joined)) return 'mountain'
  if (/field|meadow|grass/.test(joined)) return 'garden'
  if (/desert|sand|dune/.test(joined)) return 'mountain'
  if (/snow|ice|frost/.test(joined)) return 'snow'
  if (/storm|lightning|thunder/.test(joined)) return 'fire'
  if (/dust|ash|ashes/.test(joined)) return 'dust'
  if (/(bindle|bundle|knapsack|knave-kit)/.test(joined)) return 'bindle'
  if (/(table|altar|worktop)/.test(joined)) return 'table'
  if (/pomegranate/.test(joined)) return 'pomegranate'
  if (/ram|he-goat/.test(joined)) return 'ram'
  if (/globe|sphere|mundane/.test(joined)) return 'globe'
  if (/sphinx/.test(joined)) return 'sphinx'
  if (/aura|halo|glow-ring/.test(joined)) return 'aura'
  if (/bishop|hierophant-figure|pope/.test(joined)) return 'bishop'
  if (/devil|horned|goatheld/.test(joined)) return 'devil'
  if (/twin|two-faces|duality/.test(joined)) return 'twin-faces'
  if (/cage|prison|grille/.test(joined)) return 'cage'
  if (/crayfish|lobster|crab/.test(joined)) return 'crayfish'
  if (/sunflower/.test(joined)) return 'sunflower'
  if (/wall|brick|masonry/.test(joined)) return 'wall'
  if (/banner|flag|pennant/.test(joined)) return 'banner'
  if (/trumpet|herald/.test(joined)) return 'trumpet'
  if (/tomb|sepulchre|grave|open-tomb/.test(joined)) return 'tomb'
  if (/dancer|dancing/.test(joined)) return 'dancer'
  if (/burden|yoke|pack/.test(joined)) return 'burden'
  if (/caduceus|hermes/.test(joined)) return 'caduceus'
  if (/castle|keep|battlement/.test(joined)) return 'castle'
  if (/jewel|gem|crystal|diamond/.test(joined)) return 'jewel'
  if (/ring|band/.test(joined)) return 'ring'
  if (/cushion|pillow/.test(joined)) return 'cushion'
  if (/rainbow|arc/.test(joined)) return 'rainbow'
  if (/fish/.test(joined)) return 'fish'
  if (/tunic|scallop|garment|clothing/.test(joined)) return 'cloak-hood'
  if (/gull|seagull/.test(joined)) return 'gull'
  if (/shell|scallop-shell/.test(joined)) return 'shell'
  if (/dolphin|whale/.test(joined)) return 'dolphin'
  if (/palm|frond/.test(joined)) return 'palm'
  if (/blindfold|veil-over/.test(joined)) return 'blindfold'
  if (/kneeler|prie/.test(joined)) return 'kneeler'
  if (/reed|rush|bulrush/.test(joined)) return 'reed'
  if (/tent|pavilion/.test(joined)) return 'tent'
  if (/cord|rope-bind|bind/.test(joined)) return 'cord'
  if (/fortress|stronghold/.test(joined)) return 'fortress'
  if (/bed|couch|sleeping/.test(joined)) return 'bed'
  if (/gargoyle|grotesque/.test(joined)) return 'gargoyle'
  if (/curtain|drape/.test(joined)) return 'curtain'
  if (/ruin/.test(joined)) return 'wall'
  if (/ribbon|strand/.test(joined)) return 'ribbon'
  if (/chisel|tool|carpenter/.test(joined)) return 'chisel'
  if (/stained|glass-window|window/.test(joined)) return 'glass'
  if (/crutch|cane|support/.test(joined)) return 'crutch'
  if (/purse|money-bag|coins-in/.test(joined)) return 'purse'
  if (/workbench|bench|craft/.test(joined)) return 'workbench'
  if (/falcon|hawk|bird-of-prey/.test(joined)) return 'falcon'
  if (/hat|wide-brim|veil/.test(joined)) return 'hat'
  if (/plough|plow|harrow/.test(joined)) return 'plough'
  if (/rabbit|hare|coney/.test(joined)) return 'rabbit'
  if (/cloak|hood|mantle/.test(joined)) return 'mask'
  if (/garden-plot|plot/.test(joined)) return 'garden'
  if (/temple-veil|veil/.test(joined)) return 'curtain'
  if (/book-open|open-book|letters/.test(joined)) return 'book'
  if (/river|stream|creek/.test(joined)) return 'wave'
  if (/sea|ocean|tide/.test(joined)) return 'wave'
  if (/still-water/.test(joined)) return 'water'
  if (/wind/.test(joined)) return 'wind'
  if (/cloud/.test(joined)) return 'cloud'
  if (/star/.test(joined)) return 'star'
  if (/infinity/.test(joined)) return 'infinity'
  if (/eye/.test(joined)) return 'eye'
  if (/heart/.test(joined)) return 'heart'
  if (/skull|bone|skeleton/.test(joined)) return 'skull'
  if (/cloak|hood|mantle|robe/.test(joined)) return 'mask'
  if (/scept|scepter|rod/.test(joined)) return 'staff'
  if (/shield/.test(joined)) return 'shield'
  if (/armor|armour|mail/.test(joined)) return 'armor'
  if (/helm|helmet/.test(joined)) return 'helm'
  if (/key/.test(joined)) return 'key'
  if (/hourglass/.test(joined)) return 'hourglass'
  if (/wheel/.test(joined)) return 'wheel'
  if (/scale|balance|libra/.test(joined)) return 'scales'
  if (/cross/.test(joined)) return 'cross'
  if (/path|road|trail/.test(joined)) return 'path'
  if (/bridge/.test(joined)) return 'bridge'
  if (/ship|boat|ark|barque/.test(joined)) return 'ship'
  if (/tower/.test(joined)) return 'tower'
  if (/house|home|cabin|dwelling/.test(joined)) return 'house'
  if (/gate|door|threshold/.test(joined)) return 'gate'
  if (/arch/.test(joined)) return 'arch'
  if (/laurel|wreath|garland/.test(joined)) return 'rose'
  if (/vine|ivy|branch/.test(joined)) return 'vine'
  if (/wheat|grain|harvest|barley/.test(joined)) return 'wheat'
  if (/leaf|leaves/.test(joined)) return 'leaf'
  if (/lily/.test(joined)) return 'lily'
  if (/lotus/.test(joined)) return 'lotus'
  if (/rose/.test(joined)) return 'rose'
  if (/snake|serpent|viper/.test(joined)) return 'serpent'
  if (/dragon|wyrm/.test(joined)) return 'dragon'
  if (/horse|mare|steed|pony/.test(joined)) return 'horse'
  if (/lion/.test(joined)) return 'lion'
  if (/bull|ox|cow|calf/.test(joined)) return 'bull'
  if (/eagle/.test(joined)) return 'eagle'
  if (/dove|bird|crow|raven|swan|phoenix/.test(joined)) return 'bird'
  if (/dog|hound|wolf|jackal/.test(joined)) return 'dog'
  if (/cat/.test(joined)) return 'cat'
  if (/ape|monkey/.test(joined)) return 'ape'
  if (/butterfly|moth/.test(joined)) return 'butterfly'
  if (/salamander|lizard|toad|frog|frog/.test(joined)) return 'salamander'
  if (/scythe|sickle|cythe/.test(joined)) return 'scythe'
  if (/axe|halberd|spear|lance/.test(joined)) return 'blade'
  if (/hammer|anvil/.test(joined)) return 'hammer'
  if (/ankh/.test(joined)) return 'ankh'
  if (/ouroboros/.test(joined)) return 'ouroboros'
  if (/obelisk|monolith|stele/.test(joined)) return 'obelisk'
  if (/pyramid/.test(joined)) return 'pyramid'
  if (/torch|candle|flame/.test(joined)) return 'torch'
  if (/net|web/.test(joined)) return 'net'
  if (/knot/.test(joined)) return 'knot'
  if (/rock|stone|stone-|boulder/.test(joined)) return 'rock'
  if (/cave|grotto/.test(joined)) return 'cave'
  if (/tree|oak|forest/.test(joined)) return 'tree'
  if (/child|infant|figure|person|woman|man|elder|king|queen|priest|angel|spirit|ghost|bride|warrior|pilgrim/.test(joined)) return 'figure'
  return null
}

function single(base: string, ctx: GlyphContext, tokens: string[]): string {
  const render = LEXICON[base]!
  // Alguns motivos pedem escala/posição próprias conforme o descritor do nome.
  if (/(top|above|crown-of)/.test(tokens.join('-')) && base === 'infinity') return render({ ...ctx, y: ctx.y - ctx.size * 0.35 })
  if (base === 'moon' && /full/.test(tokens.join('-'))) return circle(ctx.x, ctx.y, ctx.size * 0.34, { fill: ctx.accent })
  if (base === 'sun' && /half/.test(tokens.join('-'))) return `<g clip-path="none">${render(ctx)}</g>`
  if (base === 'cup' && /overflow|spill/.test(tokens.join('-'))) return render(ctx) + line([ctx.x - ctx.size * 0.3, ctx.y + ctx.size * 0.5], [ctx.x + ctx.size * 0.3, ctx.y + ctx.size * 0.5], { stroke: ctx.accent, 'stroke-width': ctx.size * 0.05, opacity: 0.8 })
  return render(ctx)
}

/** Distribuição em grelha/arco conforme a quantidade — as cartas de pips são lidas assim. */
function arrange(unit: string, ctx: GlyphContext, count: number, id: string): string {
  const arc = /(arc|circle|ring|wheel|garland|crown)/.test(id)
  const parts: string[] = []
  const columns = count <= 3 ? count : count <= 6 ? 2 : count <= 12 ? 3 : 4
  const rows = Math.ceil(count / columns)
  const cell = ctx.size * (columns === 1 ? 0.72 : 0.46)
  for (let index = 0; index < count; index += 1) {
    const column = index % columns
    const row = Math.floor(index / columns)
    const offset = columns === 2 ? (row % 2 === 0 ? -0.26 : 0.26) : columns === 3 ? [-0.3, 0, 0.3][column]! : [-0.36, -0.12, 0.12, 0.36][column]!
    let x = ctx.x + offset * ctx.size
    let y = ctx.y - (rows - 1) * cell * 0.52 + row * cell * 1.04
    let rotation = 0
    if (arc) {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2
      x = ctx.x + Math.cos(angle) * ctx.size * 0.4
      y = ctx.y + Math.sin(angle) * ctx.size * 0.4
      rotation = (angle * 180) / Math.PI + 90
    }
    parts.push(`<g transform="translate(${round(x)} ${round(y)}) rotate(${round(rotation)}) scale(${round(cell / ctx.size)})" transform-origin="0 0" data-unit="${index + 1}">${translateUnit(unit, ctx)}</g>`)
  }
  return parts.join('')
}

function translateUnit(unit: string, ctx: GlyphContext): string {
  // As unidades foram desenhadas em torno de (ctx.x, ctx.y); translada para a origem.
  return `<g transform="translate(${-round(ctx.x)} ${-round(ctx.y)})">${unit}</g>`
}

export function renderGlyph(id: string, ctx: GlyphContext): { svg: string; base: string; count: number; states: string[] } | null {
  const resolved = resolveGlyph(id, ctx)
  if (!resolved) return null
  return { svg: resolved.inner, base: resolved.base, count: resolved.count, states: resolved.states }
}

/** Todas as chaves que o compositor sabe resolver (validação do build de conteúdo). */
export function glyphIsResolvable(id: string): boolean {
  return resolveGlyph(id, { x: 150, y: 260, size: 60, color: '#000', accent: '#888', ink: '#fff', seed: id }) !== null
}

export const GLYPH_BASES = Object.keys(LEXICON).sort()

/** Cobertura: quantos dos glifos usados pelo conteúdo têm motivo elementar direto. */
export function coverage(ids: string[]): { direct: number; composed: number; unresolved: string[] } {
  let direct = 0
  let composed = 0
  const unresolved: string[] = []
  for (const id of ids) {
    const tokens = id.toLowerCase().split('-').filter((token) => !/^\d+$/.test(token) && NUMBER_WORDS[token] === undefined)
    if (LEXICON[tokens.join('-')]) direct += 1
    else if (findBase(tokens)) composed += 1
    else unresolved.push(id)
  }
  return { direct, composed, unresolved }
}

export { LEXICON }
