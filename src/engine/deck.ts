import type { DrawnCard, Orientation, ShuffleAlgorithm } from '../domain/types.ts'
import type { SpreadDef } from '../domain/types.ts'

/**
 * Motor de baralho determinístico.
 *
 * Princípios inegociáveis:
 *  - O resultado é gerado ANTES e INDEPENDENTEMENTE de qualquer chamada de IA.
 *  - Cada algoritmo de embaralhamento é uma permutação verificável: a mesma seed
 *    produz o mesmo baralho final, seja qual for o caminho de animação escolhido.
 *  - As animações de embaralhamento são decoradas à volta desta lógica: nunca a chamam
 *    para "produzir" o resultado visual de forma assíncrona.
 */

/* ─────────────────────────── PRNG: sfc32 (seedável e rápido) ─────────────────────────── */

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

/** Expande um inteiro 32-bit em quatro palavras de estado (constantes de Weyl). */
export function makeRng(seed: number) {
  let s = seed >>> 0
  const words = [0, 0, 0, 0].map(() => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s
  })
  return sfc32(words[0]!, 0x9e3779b9 + words[1]!, 0x243f6a88 + words[2]!, 0xb5297a4d + words[3]!)
}

/** String → seed estável (xorshift 32 sobre FNV-1a), independente da plataforma. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 15
  h = Math.imul(h, 0x2545f491)
  h ^= h >>> 13
  return h >>> 0
}

/** Seed derivada e determinística (ex.: "carta do dia" de uma data). */
export function deriveSeed(seed: number, label: string): number {
  return (Math.imul(seed >>> 0, 0x9e3779b1) ^ hashSeed(label)) >>> 0
}

/* ─────────────────────────── Permutações ─────────────────────────── */

/** Fisher–Yates sem viés, na direção correta (i decrescente). */
export function fisherYates<T>(input: readonly T[], rng: () => number): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

/**
 * Dois-pile riffle (modelo Gilbert–Shannon–Reeds).
 *
 * Corte aproximadamente binomial seguido de intercalação em que a probabilidade de
 * tirar de uma pilha é proporcional ao seu tamanho remanescente. É o modelo matemático
 * do riffle real: sete passagens correspondem a um 2^7-shuffle, que para 78 cartas já
 * está muito próximo da uniformidade — e é isso que torna o baralhar justo.
 */
function riffleOnce(order: number[], rng: () => number): number[] {
  const n = order.length
  const cut = Math.round(n * (0.5 + (rng() + rng() + rng() - 1.5) * 0.12))
  const left = order.slice(0, Math.max(1, Math.min(n - 1, cut)))
  const right = order.slice(Math.max(1, Math.min(n - 1, cut)))
  const out: number[] = []
  let i = 0
  let j = 0
  while (i < left.length || j < right.length) {
    const remL = left.length - i
    const remR = right.length - j
    const takeLeft = remL <= 0 ? false : remR <= 0 ? true : rng() < remL / (remL + remR)
    out.push(takeLeft ? left[i++]! : right[j++]!)
  }
  return out
}

function rifflePermutation(n: number, rng: () => number): number[] {
  let order = Array.from({ length: n }, (_, i) => i)
  for (let round = 0; round < 7; round++) order = riffleOnce(order, rng)
  return order
}

/**
 * Overhand: pacotes pequenos retirados do topo e repostos por cima, várias passagens.
 * Mistura mais devagar que o riffle; por isso usamos cinco passagens — a mesma razão
 * pela qual um baralhador humano faz "uns quantos montes" antes de dar as cartas.
 */
function overhandPermutation(n: number, rng: () => number): number[] {
  let order = Array.from({ length: n }, (_, i) => i)
  for (let pass = 0; pass < 5; pass++) {
    const remaining = order.slice()
    const out: number[] = []
    while (remaining.length) {
      const take = Math.min(remaining.length, 2 + Math.floor(rng() * Math.max(3, n * 0.13)))
      const packet = remaining.splice(0, take)
      out.unshift(...packet)
      if (remaining.length && rng() < 0.22) out.unshift(...remaining.splice(remaining.length - (1 + Math.floor(rng() * 3)), 1 + Math.floor(rng() * 3)))
    }
    order = out
  }
  return order
}

/**
 * Leque: abre-se o baralho em k pilhas cíclicas e recolhemos as pilhas por ordem
 * aleatória, tirando sempre de baixo (é assim que o leque volta a virar montão).
 */
function fanPermutation(n: number, rng: () => number): number[] {
  const k = 5 + Math.floor(rng() * 5)
  const piles: number[][] = Array.from({ length: k }, () => [])
  for (let i = 0; i < n; i++) piles[i % k]!.push(i)
  const pileOrder = fisherYates(
    piles.map((_, idx) => idx),
    rng,
  )
  const out: number[] = []
  for (const idx of pileOrder) {
    const pile = piles[idx]!
    const from = rng() < 0.5 ? pile.slice().reverse() : pile.slice()
    out.push(...from)
  }
  return out
}

/**
 * Corte circular: montões de tamanho variável em redor da mesa, alguns invertidos,
 * recolhidos por ordem aleatória. Mantém a textura do "dar à volta" sem fixar a ordem.
 */
function circularPermutation(n: number, rng: () => number): number[] {
  const blocks: number[][] = []
  const remaining = Array.from({ length: n }, (_, i) => i)
  while (remaining.length) {
    const size = Math.min(remaining.length, 3 + Math.floor(rng() * Math.max(4, n * 0.18)))
    blocks.push(remaining.splice(0, size))
  }
  const shuffledBlocks = fisherYates(blocks, rng)
  return shuffledBlocks.map((b) => (rng() < 0.34 ? b.slice().reverse() : b)).flat()
}

/** "Místico": riffle + permutação completa + cortes, para as tiragens ritualísticas. */
function mysticPermutation(n: number, rng: () => number): number[] {
  let order = fisherYates(Array.from({ length: n }, (_, i) => i), rng)
  order = riffleOnce(order, rng)
  for (let c = 0; c < 2; c++) {
    const cut = Math.floor(rng() * n)
    order = order.slice(cut).concat(order.slice(0, cut))
  }
  return order
}

export function permutationFor(algorithm: ShuffleAlgorithm, n: number, rng: () => number): number[] {
  switch (algorithm) {
    case 'riffle':
      return rifflePermutation(n, rng)
    case 'overhand':
      return overhandPermutation(n, rng)
    case 'leque':
      return fanPermutation(n, rng)
    case 'circular':
      return circularPermutation(n, rng)
    case 'mistico':
      return mysticPermutation(n, rng)
    case 'tradicional':
    default: {
      // "Tradicional" = riffle seguido de overhand: a sequência clássica de mesa,
      // com uma permutação completa final para que nenhuma posição fique favorecida.
      const a = rifflePermutation(n, rng)
      const b = overhandPermutation(n, rng)
      const composed = a.map((i) => b[i]!)
      return fisherYates(composed, rng)
    }
  }
}

/** Aplica uma permutação (índice destino → índice origem) a um array. */
export function applyPermutation<T>(deck: readonly T[], permutation: readonly number[]): T[] {
  if (permutation.length !== deck.length) throw new Error(`permutação ${permutation.length} ≠ baralho ${deck.length}`)
  return permutation.map((src) => deck[src % deck.length]!)
}

/** Corte simples: desloca `cutSize` cartas do fundo para o topo. */
export function cutDeck<T>(deck: readonly T[], cutSize: number): T[] {
  const n = deck.length
  if (!n) return []
  const k = ((cutSize % n) + n) % n
  return deck.slice(n - k).concat(deck.slice(0, n - k))
}

/** Três cortes ritualísticos, com profundidades derivadas da mesma seed. */
export function threeCuts<T>(deck: readonly T[], rng: () => number): T[] {
  let out = deck.slice()
  for (let i = 0; i < 3; i++) out = cutDeck(out, 1 + Math.floor(rng() * (out.length - 1)))
  return out
}

/* ─────────────────────────── Estado do baralho ─────────────────────────── */

export interface DeckCard<TId extends string = string> {
  id: TId
}

export interface DeckState<TId extends string = string> {
  /** Ordem actual do baralho (topo = índice 0). */
  order: TId[]
  /** Índice original de cada carta no baralho ordenado, para auditoria e alt-text. */
  origin: Record<TId, number>
  algorithm: ShuffleAlgorithm
  seed: number
  cuts: number
  /** Contador de cartas já distribuídas. */
  consumed: number
}

export function buildDeck<TId extends string>(ids: readonly TId[]): DeckState<TId> {
  const origin = {} as Record<TId, number>
  ids.forEach((id, i) => (origin[id] = i))
  return { order: ids.slice(), origin, algorithm: 'tradicional', seed: 0, cuts: 0, consumed: 0 }
}

/** Aplica o embaralhamento pedido, mantendo a consistência lógica do estado. */
export function shuffleDeck<TId extends string>(
  state: DeckState<TId>,
  algorithm: ShuffleAlgorithm,
  seed: number,
): DeckState<TId> {
  const rng = makeRng(seed)
  const perm = permutationFor(algorithm, state.order.length, rng)
  return {
    ...state,
    order: applyPermutation(state.order, perm),
    algorithm,
    seed,
  }
}

export function cutAt<TId extends string>(state: DeckState<TId>, cutSize: number): DeckState<TId> {
  return { ...state, order: cutDeck(state.order, cutSize), cuts: state.cuts + 1 }
}

/* ─────────────────────────── Distribuição ─────────────────────────── */

export interface DrawOptions {
  spread: SpreadDef
  seed: number
  algorithm: ShuffleAlgorithm
  cuts: number
  allowReversed: boolean
  /** Se definido, só estas cartas podem entrar (ex.: somente arcanos maiores). */
  filter?: (cardId: string) => boolean
  /** Cartas fixas pedidas pelo utilizador (por id), por posição. */
  forced?: { positionId: string; cardId: string }[]
  /**
   * Escolha manual: o utilizador seleccionou a carta que está neste índice da ordem
   * final do baralho (0 = topo). É assim que o leque/a linha/"escolher do fundo"
   * funcionam: a posição no baralho é a escolha, o motor apenas a respeita.
   */
  manualPicks?: { positionId: string; deckIndex: number }[]
  /** Estratégia de retirada automática. `fundo` inverte o consumo do baralho. */
  drawMode?: 'topo' | 'fundo' | 'alternado'
  /**
   * Corte manual: em vez de o tamanho do corte ser sorteado, o utilizador escolheu-o
   * (arrastando o baralho). Guardá-lo no registo é o que permite reproduzir a leitura.
   */
  cutSize?: number
  /** Ordem explícita das posições (por omissão, readingOrder do esquema). */
  positionOrder?: string[]
}

export interface DrawResult<TId extends string = string> {
  deck: DeckState<TId>
  drawn: DrawnCard[]
  /** Todos os ids retirados, garantidamente únicos. */
  uniqueCardIds: TId[]
  /** Índice de cada carta na ordem final do baralho (para reproduzir o leque). */
  deckOrder: TId[]
  /** Ordem canónica antes do embaralhamento (necessária para o replay ser exacto). */
  baseOrder: TId[]
  /** Cortes aplicados, por ordem. */
  cutSizes: number[]
  /** Log auditável da distribuição. */
  audit: {
    algorithm: ShuffleAlgorithm
    seed: number
    cuts: number
    drawMode: NonNullable<DrawOptions['drawMode']>
    orientationRngSeed: number
    reversedCount: number
    positions: { positionId: string; cardId: string; deckIndex: number; positionIndex: number; orientation: Orientation }[]
  }
}

/**
 * Distribui cartas para uma tiragem.
 *
 * Regras duras:
 *  - As cartas são consumidas **por ordem** a partir do topo (ou do fundo) do baralho já
 *    embaralhado e cortado. Cortar muda portanto o resultado — e o histórico prova-o.
 *  - Nunca sai carta repetida: cada índice do baralho é usado uma única vez.
 *  - A stream de orientação é separada da stream de ordem: permitir/desactivar
 *    invertidas **não altera** as cartas retiradas.
 *  - A mesma seed + algoritmo + cortes + modo = exactamente a mesma tiragem.
 */
export function drawForSpread<TId extends string>(
  deckIds: readonly TId[],
  options: DrawOptions,
  initialDeck?: DeckState<TId>,
): DrawResult<TId> {
  const { spread, seed, algorithm, cuts, allowReversed, filter, forced = [], manualPicks = [], drawMode = 'topo', positionOrder, cutSize } = options
  const positions = positionOrder
    ? positionOrder.map((id) => spread.positions.find((p) => p.id === id)!).filter(Boolean)
    : spread.positions

  const base = initialDeck ?? buildDeck(deckIds)
  const shuffled = shuffleDeck(base, algorithm, deriveSeed(seed, 'shuffle:' + algorithm))
  const rngForCuts = makeRng(deriveSeed(seed, `cuts:${cuts}`))
  let working = shuffled
  const recordedCutSizes: number[] = []
  if (cuts === 3 && cutSize === undefined) working = { ...working, order: threeCuts(working.order, rngForCuts), cuts: 3 }
  else if (cuts > 0) {
    for (let cut = 0; cut < (cutSize !== undefined ? 1 : cuts); cut += 1) {
      const size =
        cutSize !== undefined && cut === 0
          ? Math.max(1, Math.min(working.order.length - 1, Math.trunc(cutSize)))
          : 1 + Math.floor(rngForCuts() * (working.order.length - 1))
      recordedCutSizes.push(size)
      working = { ...working, order: cutDeck(working.order, size), cuts: cutSize !== undefined ? 1 : cuts }
    }
  }

  // Filtro de baralho (ex.: só maiores) mantém a ordem relativa do baralho.
  const eligibleOrder = filter ? working.order.filter(filter) : working.order.slice()
  const consumeOrder =
    drawMode === 'fundo' ? eligibleOrder.slice().reverse() : eligibleOrder
  const indexOfInConsume = new Map(consumeOrder.map((id, i) => [id, i]))

  const orientRng = makeRng(deriveSeed(seed, `orientation:${allowReversed ? 'on' : 'off'}`))
  const orientationFor = (cardId: TId): Orientation => {
    if (!allowReversed) return 'upright'
    return orientRng() < orientBias(cardId) ? 'reversed' : 'upright'
  }

  // Resoluções por posição: escolha manual > carta forçada > auto a partir da cabeça da fila.
  const resolvedIds = new Map<string, TId>()
  const usedCardIds = new Set<string>()
  const usedConsumeIndices = new Set<number>()
  let cursor = 0

  const takeNext = (): TId | undefined => {
    while (cursor < consumeOrder.length && usedCardIds.has(consumeOrder[cursor]!)) cursor++
    if (cursor >= consumeOrder.length) return undefined
    const id = consumeOrder[cursor]!
    usedConsumeIndices.add(indexOfInConsume.get(id) ?? cursor)
    cursor++
    return id
  }

  for (const pick of manualPicks) {
    const absolute = ((pick.deckIndex % working.order.length) + working.order.length) % working.order.length
    const cardId = working.order[absolute]
    if (cardId === undefined || usedCardIds.has(cardId)) continue
    if (filter && !filter(cardId)) continue
    resolvedIds.set(pick.positionId, cardId)
    usedCardIds.add(cardId)
    const ci = indexOfInConsume.get(cardId)
    if (ci !== undefined) usedConsumeIndices.add(ci)
  }

  for (const f of forced) {
    if (usedCardIds.has(f.cardId as TId)) continue
    resolvedIds.set(f.positionId, f.cardId as TId)
    usedCardIds.add(f.cardId as TId)
  }

  const drawn: DrawnCard[] = []
  positions.forEach((position, i) => {
    let cardId = resolvedIds.get(position.id)
    if (cardId === undefined) cardId = takeNext()
    if (cardId === undefined) return
    usedCardIds.add(cardId)
    drawn.push({
      positionId: position.id,
      cardId,
      orientation: orientationFor(cardId),
      deckIndex: working.origin[cardId] ?? deckIds.indexOf(cardId),
      positionIndex: i,
      seed: deriveSeed(seed, `card:${cardId}`),
    })
  })

  if (drawn.length !== positions.length) {
    throw new Error(
      `não foi possível distribuir ${positions.length} cartas únicas (obtidas ${drawn.length}) — baralho demasiado pequeno para o filtro aplicado`,
    )
  }

  // "alternado" só faz sentido em distribuições com mais de uma volta: aqui equivale a
  // topo porque as posições são lidas uma a uma, e está documentado para o UI.
  const effectiveMode: NonNullable<DrawOptions['drawMode']> = drawMode === 'alternado' ? 'topo' : drawMode

  return {
    deck: { ...working, consumed: drawn.length },
    drawn,
    uniqueCardIds: drawn.map((d) => d.cardId as TId),
    deckOrder: working.order,
    baseOrder: deckIds.slice(),
    cutSizes: recordedCutSizes,
    audit: {
      algorithm,
      seed,
      cuts,
      drawMode: effectiveMode,
      orientationRngSeed: deriveSeed(seed, `orientation:${allowReversed ? 'on' : 'off'}`),
      reversedCount: drawn.filter((d) => d.orientation === 'reversed').length,
      positions: drawn.map((d, i) => ({
        positionId: d.positionId,
        cardId: d.cardId,
        deckIndex: d.deckIndex,
        positionIndex: i,
        orientation: d.orientation,
      })),
    },
  }
}

/**
 * Probabilidade base de inversão por carta.
 *
 * Mantém-se perto dos 25% tradicionais (o Rider-Waite-Smith "sugere" inversões em
 * metade das cartas, mas o uso comum aceita ~25%), com variação pequena por naipe e
 * número, de modo a que a estatística pessoal do utilizador seja informativa e não
 * artefacto de uma moeda justa.
 */
function orientBias(cardId: string): number {
  const base = 0.25
  if (cardId.startsWith('major-')) return base + 0.03
  const suit = cardId.split('-')[1]
  const bump: Record<string, number> = { wands: 0.01, cups: 0.02, swords: 0.03, pentacles: 0 }
  return base + (bump[suit ?? ''] ?? 0)
}

/** Reproduz uma tiragem a partir do seu registo (histórico, partilha, testes). */
export function replayDraw<TId extends string>(
  deckIds: readonly TId[],
  record: {
    spread: SpreadDef
    seed: number
    algorithm: ShuffleAlgorithm
    cuts: number
    allowReversed: boolean
    drawMode?: 'topo' | 'fundo' | 'alternado'
    positionOrder?: string[]
    cutSize?: number
  },
): DrawResult<TId> {
  return drawForSpread<TId>(deckIds, {
    spread: record.spread,
    seed: record.seed,
    algorithm: record.algorithm,
    cuts: record.cuts,
    allowReversed: record.allowReversed,
    drawMode: record.drawMode ?? 'topo',
    positionOrder: record.positionOrder?.length ? record.positionOrder : undefined,
    cutSize: record.cutSize,
  })
}
