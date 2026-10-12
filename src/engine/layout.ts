/**
 * Motor de disposição geométrica das tiragens.
 *
 * Todas as coordenadas são normalizadas (0..1) num sistema com origem no canto
 * superior esquerdo da mesa. O renderidor multiplica pelas dimensões do contentor,
 * o que faz com que a mesma tiragem funcione em telemóvel, tablet e ecrã grande,
 * e que o criador de tiragens possa usar exatamente o mesmo formato de dados.
 *
 * `rotation` está em graus no plano da mesa (0 = carta vertical, positiva = sentido
 * dos ponteiros do relógio) e `scale` é um multiplicador do tamanho base da carta.
 */

export interface LayoutPoint {
  x: number
  y: number
  rotation: number
  scale: number
}

export interface LayoutParams {
  /** Número de posições a distribuir. Omitir = usar a geometria natural da forma. */
  count?: number
  /** Raio normalizado para formas radiais. */
  radius?: number
  /** Centro da forma radial. */
  cx?: number
  cy?: number
  /** Ângulo inicial em graus (0 = topo, sentido horário). */
  startAngle?: number
  /** Varrimento em graus (360 = círculo completo). */
  sweep?: number
  /** Nº de colunas para grelhas. */
  cols?: number
  /** Espaçamento entre linhas/colunas, em unidades normalizadas. */
  gap?: number
  /** Nº de linhas para pirâmide/triângulo. */
  rows?: number
  /** Inclinação global da fila (efeito de leque na mesa). */
  tilt?: number
  /** Curvatura vertical aplicada a fileiras (mesa em perspetiva). */
  curve?: number
  /** Distância vertical entre pares em espelho/grade. */
  rowGap?: number
  /** Amplitude lateral do trajecto em S. */
  amplitude?: number
  /** Distância horizontal entre colunas em grelha. */
  colGap?: number
  /** Inclinação em graus por camada da pirâmide. */
  layerTilt?: number
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const rad = (deg: number) => (deg * Math.PI) / 180

/** Fila horizontal com leve curvatura para simular a perspectiva da mesa. */
export function row({ count = 3 , cx = 0.5 , cy = 0.5 , gap , tilt = 0 , curve = 0 }: LayoutParams): LayoutPoint[] {
  const spacing = gap ?? (count > 5 ? 0.115 : 0.16)
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5
    const x = cx + t * spacing * (count - 1)
    const y = cy + curve * (t * t) * 4
    out.push({ x: clamp01(x), y: clamp01(y), rotation: tilt * t * 2, scale: 1 })
  }
  return out
}

export function column({ count = 3 , cx = 0.5 , cy = 0.5 , gap = 0.17 }: LayoutParams): LayoutPoint[] {
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5
    out.push({ x: clamp01(cx + t * 0.1), y: clamp01(cy + t * gap * (count - 1)), rotation: 0, scale: 1 })
  }
  return out
}

export function grid({ count = 3 , cols = Math.ceil(Math.sqrt(count)) , cx = 0.5 , cy = 0.5 , gap = 0.18 }: LayoutParams): LayoutPoint[] {
  const rows = Math.ceil(count / cols)
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const inRow = Math.min(cols, count - r * cols)
    const offsetX = (cols - inRow) / 2
    out.push({
      x: clamp01(cx + (c + offsetX - (cols - 1) / 2) * gap),
      y: clamp01(cy + (r - (rows - 1) / 2) * gap * 1.25),
      rotation: 0,
      scale: count > 20 ? 0.62 : count > 10 ? 0.82 : 1,
    })
  }
  return out
}

/** Círculo / mandala / roda do ano — 0° no topo, sentido horário. */
export function radial({ count = 3 , radius = 0.3 , cx = 0.5 , cy = 0.5 , startAngle = 0 , sweep = 360 ,  }: LayoutParams): LayoutPoint[] {
  const out: LayoutPoint[] = []
  const step = sweep / count
  for (let i = 0; i < count; i++) {
    const angle = startAngle + step * (i + (Math.abs(sweep - 360) < 0.001 ? 0 : 0.5))
    const a = rad(angle - 90)
    out.push({
      x: clamp01(cx + Math.cos(a) * radius),
      y: clamp01(cy + Math.sin(a) * radius * 1.18), // compensa a proporção da mesa
      rotation: sweep >= 359.9 ? angle : 0,
      scale: count > 10 ? 0.78 : count > 6 ? 0.9 : 1,
    })
  }
  return out
}

/** Ferradura: meia-circunferência aberta em baixo, tradicional na leitura de 7 cartas. */
export function horseshoe({ count = 3 , cx = 0.5 , cy = 0.62 , radius = 0.34 }: LayoutParams): LayoutPoint[] {
  return radial({ count, cx, cy, radius, startAngle: 180, sweep: 180 })
}

export function triangle({ count = 3 , rows , cx = 0.5 , cy = 0.55 , gap = 0.16 }: LayoutParams): LayoutPoint[] {
  // Triângulo apontado para cima: linha 1 tem 1 carta, linha 2 tem 2, etc.
  const out: LayoutPoint[] = []
  const n = rows ?? Math.ceil((-1 + Math.sqrt(1 + 8 * count)) / 2)
  let index = 0
  for (let r = 0; r < n && index < count; r++) {
    const perRow = r + 1
    for (let c = 0; c < perRow && index < count; c++) {
      out.push({
        x: clamp01(cx + (c - (perRow - 1) / 2) * gap),
        y: clamp01(cy + (r - (n - 1) / 2) * gap * 1.15 - (perRow - 1) * 0.01),
        rotation: 0,
        scale: 1,
      })
      index++
    }
  }
  return out
}

export function pyramid({ count = 3 , rows , cx = 0.5 , cy = 0.55 , gap = 0.16 }: LayoutParams): LayoutPoint[] {
  // Pirâmide com base larga e topo: linha superior tem 1 carta.
  const n = rows ?? Math.ceil((-1 + Math.sqrt(1 + 8 * count)) / 2)
  const out: LayoutPoint[] = []
  let index = 0
  for (let r = 0; r < n; r++) {
    const perRow = r + 1
    if (index + perRow > count) break
    for (let c = 0; c < perRow; c++) {
      out.push({
        x: clamp01(cx + (c - (perRow - 1) / 2) * gap),
        y: clamp01(cy - (n - 1 - r) * gap * 1.1 + (perRow - 1) * 0.005),
        rotation: 0,
        scale: 1,
      })
      index++
    }
  }
  while (index < count) {
    out.push({ x: clamp01(cx + (index - count / 2) * gap), y: clamp01(cy + n * gap * 1.1), rotation: 0, scale: 1 })
    index++
  }
  return out
}

/** Cruz simples (1 carta central + cruzamentos). */
export function cross({ count = 3 , cx = 0.5 , cy = 0.5 , gap = 0.19 }: LayoutParams): LayoutPoint[] {
  const base: LayoutPoint[] = [
    { x: cx, y: cy, rotation: 0, scale: 1.06 },
    { x: cx, y: cy - gap, rotation: 0, scale: 1 },
    { x: cx, y: cy + gap, rotation: 0, scale: 1 },
    { x: cx - gap * 1.05, y: cy, rotation: 0, scale: 1 },
    { x: cx + gap * 1.05, y: cy, rotation: 0, scale: 1 },
  ]
  const out = base.slice(0, count)
  for (let i = out.length; i < count; i++) {
    out.push(row({ count, cx, cy: clamp01(cy + gap * 2 + 0.1), gap })[i] ?? { x: cx, y: 0.95, rotation: 0, scale: 0.9 })
  }
  return out
}

/** Cruz grega: 5 cartas em cruz com braços iguais. */
export function greekCross(params: LayoutParams): LayoutPoint[] {
  return cross(params)
}

/**
 * Cruz Celta (10): bloco à esquerda (centro + cruz + coroa), coluna à direita.
 * Geometria idêntica à descrita por Waite, com o pilar vertical à direita.
 */
export function celticCross({ count = 10 }: LayoutParams = {}): LayoutPoint[] {
  const pts: LayoutPoint[] = [
    { x: 0.26, y: 0.5, rotation: 0, scale: 1.05 },
    { x: 0.26, y: 0.5, rotation: 90, scale: 1.05 },
    { x: 0.26, y: 0.18, rotation: 0, scale: 0.95 },
    { x: 0.26, y: 0.82, rotation: 0, scale: 0.95 },
    { x: 0.06, y: 0.5, rotation: 0, scale: 0.95 },
    { x: 0.46, y: 0.5, rotation: 0, scale: 0.95 },
    { x: 0.78, y: 0.9, rotation: 0, scale: 0.95 },
    { x: 0.78, y: 0.66, rotation: 0, scale: 0.95 },
    { x: 0.78, y: 0.42, rotation: 0, scale: 0.95 },
    { x: 0.78, y: 0.18, rotation: 0, scale: 0.95 },
  ]
  return pts.slice(0, count)
}

/** Árvore da Vida — 10 sephiroth com a disposição clássica do diagrama hermético. */
export function treeOfLife({ count = 10 }: LayoutParams = {}): LayoutPoint[] {
  const pts: LayoutPoint[] = [
    { x: 0.5, y: 0.06, rotation: 0, scale: 0.95 }, // Kether
    { x: 0.28, y: 0.19, rotation: 0, scale: 0.9 }, // Binah
    { x: 0.72, y: 0.19, rotation: 0, scale: 0.9 }, // Chokmah
    { x: 0.5, y: 0.32, rotation: 0, scale: 0.9 }, // Daath (opcional)
    { x: 0.26, y: 0.44, rotation: 0, scale: 0.9 }, // Geburah
    { x: 0.74, y: 0.44, rotation: 0, scale: 0.9 }, // Chesed
    { x: 0.5, y: 0.56, rotation: 0, scale: 1 }, // Tiphareth
    { x: 0.26, y: 0.7, rotation: 0, scale: 0.9 }, // Hod
    { x: 0.74, y: 0.7, rotation: 0, scale: 0.9 }, // Netzach
    { x: 0.5, y: 0.82, rotation: 0, scale: 0.9 }, // Yesod
    { x: 0.5, y: 0.95, rotation: 0, scale: 0.9 }, // Malkuth
  ]
  // Por omissão usamos 10 nós (sem Daath); quando a tiragem tem 11, incluímos Daath.
  if (count <= 10) {
    const withoutDaath = pts.filter((_, i) => i !== 3)
    return withoutDaath.slice(0, count)
  }
  return pts.slice(0, count)
}

/** Estrela de N pontas (chakras, estrela de sete pontas). */
export function star({ count = 7 , cx = 0.5 , cy = 0.52 , radius = 0.33 }: LayoutParams): LayoutPoint[] {
  return radial({ count, cx, cy, radius, startAngle: 0, sweep: 360 }).map((p) => ({
    ...p,
    rotation: 0,
  }))
}

/** Roda do Ano: 8 sabás + cartas auxiliares, em círculo fechado. */
export function wheel(params: LayoutParams): LayoutPoint[] {
  return radial({ ...params, radius: params.radius ?? 0.34, startAngle: 0, sweep: 360 }).map((p) => ({
    ...p,
    rotation: 0,
  }))
}

/** Linha temporal com ramificações: 3 filas (presente, passado, futuro) ou mais. */
export function timeline({ count = 3 , cx = 0.5 , cy = 0.5 , gap = 0.14 , rows = 3 }: LayoutParams): LayoutPoint[] {
  const r = Math.max(1, rows)
  const perRow = Math.ceil(count / r)
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const rowIdx = Math.floor(i / perRow)
    const colIdx = i % perRow
    out.push({
      x: clamp01(cx + (colIdx - (perRow - 1) / 2) * gap * 1.25),
      y: clamp01(cy + (rowIdx - (r - 1) / 2) * gap * 2.1),
      rotation: 0,
      scale: 0.92,
    })
  }
  return out
}

/** Espelho: pares um em frente ao outro (relações, dois caminhos). */
export function mirror({ count = 3 , cx = 0.5 , cy = 0.5 , gap = 0.2 , rowGap = 0.3 }: LayoutParams): LayoutPoint[] {
  const out: LayoutPoint[] = []
  const pairs = Math.ceil(count / 2)
  for (let i = 0; i < count; i++) {
    const pairIdx = Math.floor(i / 2)
    const side = i % 2 === 0 ? -1 : 1
    out.push({
      x: clamp01(cx + side * gap),
      y: clamp01(cy + (pairIdx - (pairs - 1) / 2) * rowGap),
      rotation: side < 0 ? -4 : 4,
      scale: 1,
    })
  }
  return out
}

/** Dois caminhos (choice between two paths): árvore binária simples. */
export function twoPaths({ count = 7 , cx = 0.5 }: LayoutParams = {}): LayoutPoint[] {
  const pts: LayoutPoint[] = [{ x: cx, y: 0.86, rotation: 0, scale: 1 }]
  pts.push({ x: cx - 0.22, y: 0.56, rotation: -6, scale: 0.96 })
  pts.push({ x: cx + 0.22, y: 0.56, rotation: 6, scale: 0.96 })
  pts.push({ x: cx - 0.3, y: 0.28, rotation: -6, scale: 0.92 })
  pts.push({ x: cx - 0.14, y: 0.28, rotation: -6, scale: 0.92 })
  pts.push({ x: cx + 0.14, y: 0.28, rotation: 6, scale: 0.92 })
  pts.push({ x: cx + 0.3, y: 0.28, rotation: 6, scale: 0.92 })
  if (count > 7) {
    for (let i = 7; i < count; i++) {
      pts.push({ x: clamp01(cx + (i % 2 === 0 ? -0.08 : 0.08)), y: 0.08, rotation: 0, scale: 0.9 })
    }
  }
  return pts.slice(0, count)
}

/** Mesa grande: grelha densa para tiragens longas (ex.: 78 arcanos). */
export function table({ count = 3 , cols = 8 }: LayoutParams): LayoutPoint[] {
  const rows = Math.ceil(count / cols)
  const gx = Math.min(0.125, 0.94 / Math.max(1, cols - 1))
  const gy = Math.min(0.115, 0.88 / Math.max(1, rows - 1))
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const inRow = Math.min(cols, count - r * cols)
    out.push({
      x: clamp01(0.5 + (c - (cols - 1) / 2 + (cols - inRow) / 2) * gx),
      y: clamp01(0.5 + (r - (rows - 1) / 2) * gy),
      rotation: 0,
      scale: 0.46,
    })
  }
  return out
}

/** Trajecto: caminho em S (jornadas, iniciações). */
export function path({ count = 3, cx = 0.5, cy: _cy = 0.5, gap = 0.14, amplitude = 0.24 }: LayoutParams): LayoutPoint[] {
  const out: LayoutPoint[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1)
    out.push({
      x: clamp01(cx + Math.sin(t * Math.PI * 2) * amplitude),
      y: clamp01(0.9 - t * 0.8),
      rotation: Math.sin(t * Math.PI * 2) * -8,
      scale: 0.94,
    })
    void gap
  }
  return out
}

export const SHAPES = {
  row,
  column,
  grid,
  circle: (p: LayoutParams) => radial({ sweep: 360, startAngle: 0, ...p }),
  mandala: (p: LayoutParams) => radial({ sweep: 360, startAngle: 0, radius: 0.31, ...p }),
  wheel: (p: LayoutParams) => wheel({ sweep: 360, startAngle: 0, ...p }),
  horseshoe,
  triangle,
  pyramid,
  cross,
  'greek-cross': greekCross,
  'celtic-cross': celticCross,
  tree: treeOfLife,
  star,
  timeline,
  table,
  mirror,
  path,
  freeform: (p: LayoutParams) => row(p),
} as const

export type ShapeKey = keyof typeof SHAPES

export function layoutFor(shape: ShapeKey, params: LayoutParams): LayoutPoint[] {
  const fn = SHAPES[shape] ?? SHAPES.row
  const pts = fn(params)
  return pts.map((p) => ({ ...p, x: Number(p.x.toFixed(4)), y: Number(p.y.toFixed(4)) }))
}

/** Centro geométrico do conjunto de posições (usado para enquadramento de câmara). */
export function bounds(points: LayoutPoint[]) {
  if (!points.length) return { x: 0.5, y: 0.5, w: 1, h: 1 }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, w: maxX - minX || 0.2, h: maxY - minY || 0.2 }
}

/** Empacotamento simples para evitar sobreposição total em layouts radiais densos. */
export function separateOverlaps(points: LayoutPoint[], minDist = 0.11, iterations = 26): LayoutPoint[] {
  const pts = points.map((p) => ({ ...p }))
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!
        const b = pts[j]!
        let dx = b.x - a.x
        let dy = (b.y - a.y) * 1.18
        const dist = Math.hypot(dx, dy)
        if (dist < minDist && dist > 0.0001) {
          const push = (minDist - dist) / 2
          dx = (dx / dist) * push
          dy = (dy / dist) * push
          a.x -= dx
          a.y -= dy / 1.18
          b.x += dx
          b.y += dy / 1.18
          moved = true
        } else if (dist <= 0.0001) {
          b.x += 0.03
          moved = true
        }
      }
    }
    for (const p of pts) {
      p.x = clamp01(p.x)
      p.y = clamp01(p.y)
    }
    if (!moved) break
  }
  return pts
}
