/**
 * Primitivas de desenho SVG.
 *
 * Todo o motor de arte é paramétrico: functions puras que devolvem strings de caminhos
 * SVG. Vantagens reais para o projecto: (1) as cartas são ilustrações *originais* nossas,
 * não imagens licenciadas de terceiros; (2) a mesma fonte de verdade serve o DOM, o
 * `<img>` estático em `public/art` e o OG image; (3) pesam kilobytes, escalam sem perder
 * definição e podem ser animadas por camada.
 */

export type Pt = [number, number]

export interface Draw {
  /** Largura útil do desenho (unidades de viewBox). */
  w: number
  h: number
}

export const VIEW = { w: 300, h: 520 } as const
/** Área de cena dentro da moldura. */
export const SCENE = { x: 22, y: 60, w: 256, h: 372 } as const

const round = (value: number): number => Math.round(value * 100) / 100

export function pt([x, y]: Pt): string {
  return `${round(x)},${round(y)}`
}

/** PRNG determinístico (mulberry32) para variação por carta sem aleatoriedade em runtime. */
export function rng(seedText: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function poly(points: Pt[], style: Record<string, string | number> = {}): string {
  return `<polygon points="${points.map(pt).join(' ')}"${attrs(style)}/>`
}

export function path(d: string, style: Record<string, string | number> = {}): string {
  return `<path d="${d}"${attrs(style)}/>`
}

export function circle(cx: number, cy: number, r: number, style: Record<string, string | number> = {}): string {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}"${attrs(style)}/>`
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, style: Record<string, string | number> = {}): string {
  return `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}"${attrs(style)}/>`
}

export function line(a: Pt, b: Pt, style: Record<string, string | number> = {}): string {
  return `<line x1="${round(a[0])}" y1="${round(a[1])}" x2="${round(b[0])}" y2="${round(b[1])}"${attrs(style)}/>`
}

export function rect(x: number, y: number, w: number, h: number, style: Record<string, string | number> = {}): string {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}"${attrs(style)}/>`
}

function attrs(values: Record<string, string | number>): string {
  // Chaves duplicadas (camelCase vs kebab-case do mesmo atributo) colapsam: a última ganha.
  const byName = new Map<string, string>()
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue
    byName.set(kebab(key), escapeAttr(String(value)))
  }
  return [...byName.entries()].map(([name, value]) => ` ${name}="${value}"`).join('')
}

/** Valores de atributo nunca podem fechar as aspas nem injectar markup. */
export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/** Caminho fechado a partir de uma função polar (estrelas, rosetas, sóis, mandalas). */
export function polar(
  cx: number,
  cy: number,
  radius: (angle: number, index: number) => number,
  steps: number,
  style: Record<string, string | number> = {},
): string {
  const points: string[] = []
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2 - Math.PI / 2
    const r = radius(angle, index)
    points.push(`${round(cx + Math.cos(angle) * r)},${round(cy + Math.sin(angle) * r)}`)
  }
  return `<path d="M${points.join('L')}Z"${attrs(style)}/>`
}

export function star(cx: number, cy: number, outer: number, inner: number, points = 5, style: Record<string, string | number> = {}): string {
  return polar(cx, cy, (_angle, index) => (index % 2 === 0 ? outer : inner), points * 2, { fill: 'currentColor', ...style })
}

export function rays(cx: number, cy: number, from: number, to: number, count: number, style: Record<string, string | number> = {}): string {
  const parts: string[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2
    const spread = (Math.PI / count) * 0.32
    const a1 = angle - spread
    const a2 = angle + spread
    parts.push(
      `M${round(cx + Math.cos(a1) * from)},${round(cy + Math.sin(a1) * from)}` +
        `L${round(cx + Math.cos(angle) * to)},${round(cy + Math.sin(angle) * to)}` +
        `L${round(cx + Math.cos(a2) * from)},${round(cy + Math.sin(a2) * from)}Z`,
    )
  }
  return `<path d="${parts.join('')}"${attrs({ fill: 'currentColor', ...style })}/>`
}

/** Meia-lua: círculo menos círculo deslocado (sem máscara, para funcionar em <img>). */
export function crescent(cx: number, cy: number, r: number, offset = 0.42, style: Record<string, string | number> = {}): string {
  const dx = r * offset
  return `<path d="${arcPath(cx, cy, r, -Math.PI / 2, (Math.PI * 3) / 2)}Z${arcPath(cx + dx, cy, r * 0.94, (Math.PI * 3) / 2, -Math.PI / 2)}Z" fill-rule="evenodd"${attrs(style)}/>`
}

export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const x1 = cx + Math.cos(from) * r
  const y1 = cy + Math.sin(from) * r
  const x2 = cx + Math.cos(to) * r
  const y2 = cy + Math.sin(to) * r
  const large = Math.abs(to - from) > Math.PI ? 1 : 0
  return `M${round(x1)},${round(y1)}A${round(r)},${round(r)} 0 ${large} 1 ${round(x2)},${round(y2)}`
}

/** Espada/vara/cetro: eixo com ponta e guardas — a geometria base de três naipes. */
export function blade(from: Pt, to: Pt, width: number, hilt = 0.18, style: Record<string, string | number> = {}): string {
  const [x1, y1] = from
  const [x2, y2] = to
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const nx = -uy
  const ny = ux
  const tip: Pt = [x2, y2]
  const shoulder: Pt = [x2 - ux * length * 0.14, y2 - uy * length * 0.14]
  const guardA: Pt = [shoulder[0] + nx * width * 1.9, shoulder[1] + ny * width * 1.9]
  const guardB: Pt = [shoulder[0] - nx * width * 1.9, shoulder[1] - ny * width * 1.9]
  const buttA: Pt = [x1 + nx * width * 0.8, y1 + ny * width * 0.8]
  const buttB: Pt = [x1 - nx * width * 0.8, y1 - ny * width * 0.8]
  const hiltA: Pt = [x1 + ux * length * hilt + nx * width * 1.4, y1 + uy * length * hilt + ny * width * 1.4]
  const hiltB: Pt = [x1 + ux * length * hilt - nx * width * 1.4, y1 + uy * length * hilt - ny * width * 1.4]
  const common = attrs(style)
  return (
    `<path d="M${pt(tip)}L${pt(shoulder)}L${pt([shoulder[0] + width * 0.55, shoulder[1] + 0])}L${pt([x1 + ux * length * hilt, y1 + uy * length * hilt])}L${pt(buttA)}L${pt(buttB)}L${pt([x1 + ux * length * hilt, y1 + uy * length * hilt])}Z"${common}/>` +
    `<line x1="${round(guardA[0])}" y1="${round(guardA[1])}" x2="${round(guardB[0])}" y2="${round(guardB[1])}" stroke="currentColor" stroke-width="${round(width * 0.7)}"/>` +
    `<line x1="${round(hiltA[0])}" y1="${round(hiltA[1])}" x2="${round(hiltB[0])}" y2="${round(hiltB[1])}" stroke="currentColor" stroke-width="${round(width * 0.5)}"/>`
  )
}

/** Taça/cálice. */
export function chalice(cx: number, cy: number, size: number, style: Record<string, string | number> = {}): string {
  const s = size
  const fillStyle = attrs({ fill: 'currentColor', ...style })
  return (
    `<path d="M${round(cx - s)},${round(cy - s * 0.9)}Q${round(cx - s)},${round(cy + s * 0.35)} ${round(cx)},${round(cy + s * 0.45)}Q${round(cx + s)},${round(cy + s * 0.35)} ${round(cx + s)},${round(cy - s * 0.9)}Z"${fillStyle}/>` +
    `<rect x="${round(cx - s * 0.14)}" y="${round(cy + s * 0.4)}" width="${round(s * 0.28)}" height="${round(s * 0.7)}"${fillStyle}/>` +
    `<path d="M${round(cx - s * 0.7)},${round(cy + s * 1.18)}Q${round(cx)},${round(cy + s * 0.92)} ${round(cx + s * 0.7)},${round(cy + s * 1.18)}"${attrs({ fill: 'none', stroke: 'currentColor', strokeWidth: s * 0.16 })}/>`
  )
}

/** Disco/pentáculo com estrela de cinco dentro (o selo clássico dos ouros). */
export function pentacle(cx: number, cy: number, r: number, style: Record<string, string | number> = {}): string {
  const inner = star(cx, cy, r * 0.86, r * 0.36, 5, { fill: 'none', stroke: 'currentColor', strokeWidth: r * 0.12 })
  return circle(cx, cy, r, { fill: 'none', stroke: 'currentColor', strokeWidth: r * 0.16, ...style }) + inner
}

/** Montanha, onda, árvore, coluna — silhuetas reutilizadas em vários cenários. */
export function mountain(baseY: number, peaks: Pt[], style: Record<string, string | number> = {}): string {
  if (!peaks.length) return ''
  const points: Pt[] = [[peaks[0]![0] - 40, baseY], ...peaks, [peaks[peaks.length - 1]![0] + 40, baseY]]
  return poly(points, { fill: 'currentColor', ...style })
}

export function waves(y: number, width: number, amplitude = 8, count = 4, style: Record<string, string | number> = {}): string {
  const step = width / count
  let d = `M0,${round(y)}`
  for (let index = 0; index < count; index += 1) {
    const x0 = index * step
    d += `Q${round(x0 + step * 0.25)},${round(y - amplitude)} ${round(x0 + step * 0.5)},${round(y)}T${round(x0 + step)},${round(y)}`
  }
  return `<path d="${d}"${attrs({ fill: 'none', stroke: 'currentColor', strokeWidth: 3, ...style })}/>`
}

/** Silhueta humana estilizada. `posture` muda o gesto, não a escala. */
export function figure(x: number, y: number, height: number, posture: FigurePosture, style: Record<string, string | number> = {}): string {
  const h = height
  const ink = style
  const head = h * 0.13
  const shoulderY = y - h * 0.72
  const hipY = y - h * 0.42
  const common = attrs({ fill: 'currentColor', ...ink })
  const arms = ARM_PATHS[posture.arms](x, shoulderY, h)
  const legs = LEG_PATHS[posture.legs](x, hipY, h)
  const headShape = circle(x, y - h + head * 0.9, head, { fill: 'currentColor', ...ink })
  const body = `<path d="M${round(x - h * 0.12)},${round(shoulderY)}Q${round(x)},${round(shoulderY - head * 0.7)} ${round(x + h * 0.12)},${round(shoulderY)}L${round(x + h * 0.1)},${round(hipY)}L${round(x - h * 0.1)},${round(hipY)}Z"${common}/>`
  const robe = posture.robe ? `<path d="M${round(x - h * 0.12)},${round(shoulderY)}Q${round(x)},${round(hipY + h * 0.1)} ${round(x - h * 0.26)},${round(y)}L${round(x + h * 0.26)},${round(y)}Q${round(x)},${round(hipY + h * 0.1)} ${round(x + h * 0.12)},${round(shoulderY)}Z"${attrs({ fill: 'currentColor', opacity: 0.28 })}/>` : ''
  return robe + headShape + body + arms + legs
}

export interface FigurePosture {
  arms: 'down' | 'raised' | 'one-raised' | 'holding-up' | 'open' | 'crossed' | 'pointing' | 'carry-staff'
  legs: 'stand' | 'stride' | 'kneel' | 'float' | 'folded'
  robe?: boolean
}

const ARM_PATHS: Record<FigurePosture['arms'], (x: number, y: number, h: number) => string> = {
  down: (x, y, h) => arms(x, y, h, [-0.16, 0.24], [0.16, 0.24]),
  raised: (x, y, h) => arms(x, y, h, [-0.3, -0.28], [0.3, -0.28]),
  'one-raised': (x, y, h) => arms(x, y, h, [-0.18, 0.24], [0.3, -0.3]),
  'holding-up': (x, y, h) => arms(x, y, h, [-0.2, -0.12], [0.2, -0.12]),
  open: (x, y, h) => arms(x, y, h, [-0.32, 0.02], [0.32, 0.02]),
  crossed: (x, y, h) => arms(x, y, h, [-0.06, 0.06], [0.06, 0.06], true),
  pointing: (x, y, h) => arms(x, y, h, [-0.16, 0.2], [0.34, -0.1]),
  'carry-staff': (x, y, h) => arms(x, y, h, [-0.2, 0.1], [0.24, -0.05]),
}

function arms(x: number, y: number, h: number, a: [number, number], b: [number, number], cross = false): string {
  const ax = x + a[0] * h
  const ay = y + a[1] * h
  const bx = x + b[0] * h
  const by = y + b[1] * h
  const stroke = `stroke="currentColor" stroke-width="${round(h * 0.055)}" stroke-linecap="round" fill="none"`
  if (cross) return `<path d="M${round(x - h * 0.14)},${round(y)}L${round(x + h * 0.12)},${round(y + h * 0.16)}" ${stroke}/><path d="M${round(x + h * 0.14)},${round(y)}L${round(x - h * 0.12)},${round(y + h * 0.16)}" ${stroke}/>`
  return `<path d="M${round(x - h * 0.12)},${round(y)}L${round(ax)},${round(ay)}" ${stroke}/><path d="M${round(x + h * 0.12)},${round(y)}L${round(bx)},${round(by)}" ${stroke}/>`
}

const LEG_PATHS: Record<FigurePosture['legs'], (x: number, y: number, h: number) => string> = {
  stand: (x, y, h) => legs(x, y, h, -0.08, 0.08),
  stride: (x, y, h) => legs(x, y, h, -0.2, 0.18, true),
  kneel: (x, y, h) => `<path d="M${round(x - h * 0.08)},${round(y)}L${round(x - h * 0.06)},${round(y + h * 0.22)}L${round(x + h * 0.16)},${round(y + h * 0.24)}" stroke="currentColor" stroke-width="${round(h * 0.06)}" fill="none" stroke-linecap="round"/>`,
  float: (x, y, h) => `<path d="M${round(x - h * 0.1)},${round(y)}Q${round(x)},${round(y + h * 0.16)} ${round(x + h * 0.1)},${round(y + h * 0.02)}" stroke="currentColor" stroke-width="${round(h * 0.06)}" fill="none" stroke-linecap="round"/>`,
  folded: (x, y, h) => `<path d="M${round(x - h * 0.16)},${round(y + h * 0.1)}Q${round(x)},${round(y - h * 0.04)} ${round(x + h * 0.16)},${round(y + h * 0.1)}Z" fill="currentColor"/>`,
}

function legs(x: number, y: number, h: number, left: number, right: number, stride = false): string {
  const stroke = `stroke="currentColor" stroke-width="${round(h * 0.06)}" stroke-linecap="round" fill="none"`
  const footY = stride ? y + h * 0.3 : y + h * 0.42
  return `<path d="M${round(x - h * 0.05)},${round(y)}L${round(x + left * h)},${round(footY)}" ${stroke}/><path d="M${round(x + h * 0.05)},${round(y)}L${round(x + right * h)},${round(footY)}" ${stroke}/>`
}

/** Bandeira/pendão com texto a uma linha (usado nas tarjas de nome). */
export function banner(cx: number, y: number, width: number, height: number, label: string, style: Record<string, string | number> = {}): string {
  const x = cx - width / 2
  const notch = width * 0.06
  return (
    `<path d="M${round(x)},${round(y)}H${round(x + width)}V${round(y + height)}H${round(x)}Z"${attrs({ fill: 'currentColor', ...attrs })}/>` +
    `<path d="M${round(x)},${round(y + height)}L${round(x - notch)},${round(y + height * 1.45)}L${round(x + notch * 1.5)},${round(y + height * 1.05)}Z"${attrs({ fill: 'currentColor', opacity: 0.7 })}/>` +
    `<path d="M${round(x + width)},${round(y + height)}L${round(x + width + notch)},${round(y + height * 1.45)}L${round(x + width - notch * 1.5)},${round(y + height * 1.05)}Z"${attrs({ fill: 'currentColor', opacity: 0.7 })}/>` +
    `<text x="${round(cx)}" y="${round(y + height * 0.72)}" text-anchor="middle" font-size="${round(height * 0.62)}" letter-spacing="1.6"${attrs({ fill: 'var(--arcana-ink-on-band, #0b0a12)', ...style })}>${escapeXml(label)}</text>`
  )
}

export function text(value: string, x: number, y: number, size: number, extra: Record<string, string | number> = {}): string {
  return `<text x="${round(x)}" y="${round(y)}" font-size="${round(size)}"${attrs({ 'text-anchor': 'middle', fill: 'currentColor', ...extra })}>${escapeXml(value)}</text>`
}

export function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Mistura simples de hex (para sombreados sem depender de filters). */
export function mix(hexA: string, hexB: string, amount: number): string {
  const a = parseHex(hexA)
  const b = parseHex(hexB)
  const t = Math.max(0, Math.min(1, amount))
  const channel = (i: number): number => Math.round(a[i]! * (1 - t) + b[i]! * t)
  return `#${[channel(0), channel(1), channel(2)].map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

export function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex)
  return (0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)) / 255
}

/** Agrupa num `<g>` com transformação, para camadas animáveis. */
export function group(inner: string, id: string, transform?: string, extra: Record<string, string | number> = {}): string {
  return `<g data-layer="${id}"${transform ? ` transform="${transform}"` : ''}${attrs(extra)}>${inner}</g>`
}
