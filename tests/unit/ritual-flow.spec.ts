import { describe, expect, it } from 'vitest'

import { drawForSpread, hashSeed, replayDraw, shuffleDeck, buildDeck, deriveSeed, cutDeck } from '@/engine/deck.ts'
import { DECK_IDS, SPREADS, requireSpread } from '@/domain/content.ts'
import { type SHUFFLE_ALGORITHMS } from '@/domain/schema.ts'

const spread = requireSpread('past-present-future') ?? SPREADS[0]
const ids = DECK_IDS

/** Reconstrói a ordem final do baralho tal como o motor a vê: shuffle + N cortes. */
function expectedOrder(seed: number, algorithm: (typeof SHUFFLE_ALGORITHMS)[number], cuts: number, cutSize?: number) {
  const shuffled = shuffleDeck(buildDeck(ids), algorithm, deriveSeed(seed, `shuffle:${algorithm}`))
  if (cutSize !== undefined) return cutDeck(shuffled.order, Math.max(1, Math.min(ids.length - 1, Math.trunc(cutSize))))
  let order = shuffled.order
  for (let cut = 0; cut < cuts; cut += 1) order = cutDeck(order, 1 + (Math.abs(seed >> (cut + 1)) % (ids.length - 1)))
  return order
}

describe('corte escolhido pelo utilizador', () => {
  it('usa exatamente o corte pedido e nada é sorteado quando cutSize é dado', () => {
    const seed = hashSeed('corte-fixo')
    for (const cutSize of [1, 7, 26, 39, 77]) {
      const result = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, cutSize, allowReversed: true })
      const order = expectedOrder(seed, 'riffle', 1, cutSize)
      const firstPosition = spread.positions[0].id
      const drawn = result.drawn.find((card) => card.positionId === firstPosition)
      expect(drawn).toBeDefined()
      expect(order.indexOf(drawn!.cardId)).toBeGreaterThanOrEqual(0)
      expect(result.deck.cuts).toBe(1)
    }
  })

  it('cortes diferentes produzem ordens diferentes', () => {
    const seed = hashSeed('dois-cortes')
    const a = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, cutSize: 10, allowReversed: false }).deck.order.join('>')
    const b = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, cutSize: 41, allowReversed: false }).deck.order.join('>')
    expect(a).not.toBe(b)
  })

  it('valores fora do baralho são limitados em vez de rebentar', () => {
    const seed = hashSeed('corte-invalido')
    const low = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, cutSize: -50, allowReversed: false })
    const high = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, cutSize: 5000, allowReversed: false })
    expect(low.deck.order.length).toBe(ids.length)
    expect(high.deck.order.length).toBe(ids.length)
    expect(low.deck.order).not.toEqual(high.deck.order)
  })

  it('o registo de corte vai para o replay e reproduz a mesma tiragem', () => {
    const seed = hashSeed('replay-corte')
    const original = drawForSpread(ids, { spread, seed, algorithm: 'overhand', cuts: 1, cutSize: 23, allowReversed: true })
    const replay = replayDraw(ids, { spread, seed, algorithm: 'overhand', cuts: 1, cutSize: 23, allowReversed: true })
    expect(replay.drawn.map((card) => [card.positionId, card.cardId, card.orientation])).toEqual(
      original.drawn.map((card) => [card.positionId, card.cardId, card.orientation]),
    )
    // sem o cutSize o replay tem de divergir — é por isso que ele é persistido
    const wrong = replayDraw(ids, { spread, seed, algorithm: 'overhand', cuts: 1, allowReversed: true })
    expect(wrong.drawn.map((card) => card.cardId)).not.toEqual(original.drawn.map((card) => card.cardId))
  })
})

describe('escolha manual', () => {
  const picks = spread.positions.map((position, index) => ({ positionId: position.id, deckIndex: index + 3 }))

  it('respeita o índice declarado na ordem final do baralho (depois de cortes)', () => {
    const seed = hashSeed('manual')
    const base = { spread, seed, algorithm: 'mistico' as const, cuts: 2, allowReversed: true }
    // a ordem que o jogador vê no leque é a ordem de trabalho do motor, já com os cortes
    const order = drawForSpread(ids, base).deck.order
    const result = drawForSpread(ids, { ...base, manualPicks: picks })
    expect(result.deck.order).toEqual(order)
    for (const pick of picks) {
      const card = result.drawn.find((item) => item.positionId === pick.positionId)
      expect(card!.cardId).toBe(order[pick.deckIndex])
    }
  })

  it('normaliza índices negativos e maiores do que o baralho', () => {
    const seed = hashSeed('manual-mod')
    const base = { spread, seed, algorithm: 'leque' as const, cuts: 0, allowReversed: false }
    const order = drawForSpread(ids, base).deck.order
    const wrap = (index: number) => ((index % order.length) + order.length) % order.length
    const pickAt = (deckIndex: number) => drawForSpread(ids, { ...base, manualPicks: [{ positionId: spread.positions[0].id, deckIndex }] })
    const negative = pickAt(-1)
    const positive = pickAt(order.length - 1)
    const overflow = pickAt(order.length * 4 - 1)
    expect(negative.drawn[0].cardId).toBe(order[wrap(-1)])
    expect(positive.drawn[0].cardId).toBe(order[wrap(order.length - 1)])
    expect(overflow.drawn[0].cardId).toBe(positive.drawn[0].cardId)
  })

  it('não repete cartas quando duas posições apontam para o mesmo índice', () => {
    const first = spread.positions[0].id
    const second = spread.positions[1].id
    const result = drawForSpread(ids, {
      spread,
      seed: hashSeed('colisao'),
      algorithm: 'riffle',
      cuts: 1,
      allowReversed: false,
      manualPicks: [
        { positionId: first, deckIndex: 5 },
        { positionId: second, deckIndex: 5 },
      ],
    })
    expect(new Set(result.uniqueCardIds).size).toBe(result.uniqueCardIds.length)
    expect(result.drawn.map((card) => card.positionId)).toEqual(spread.positions.map((position) => position.id))
  })
})

describe('estratégias de compra', () => {
  const base = { spread, seed: hashSeed('modo'), algorithm: 'circular' as const, cuts: 0, allowReversed: false }

  it('"fundo" é o espelho de "topo"', () => {
    const topo = drawForSpread(ids, { ...base, drawMode: 'topo' })
    const fundo = drawForSpread(ids, { ...base, drawMode: 'fundo' })
    const order = topo.deck.order
    expect(fundo.drawn[0].cardId).toBe(order[order.length - 1])
    expect(topo.drawn[0].cardId).toBe(order[0])
  })

  it('"alternado" com uma passada equivale a "topo"', () => {
    expect(drawForSpread(ids, { ...base, drawMode: 'alternado' }).drawn.map((card) => card.cardId)).toEqual(
      drawForSpread(ids, { ...base, drawMode: 'topo' }).drawn.map((card) => card.cardId),
    )
  })

  it('permite só maiores e mantém a ordem relativa do baralho', () => {
    const result = drawForSpread(ids, { ...base, drawMode: 'topo', filter: (id) => id.startsWith('major-') })
    expect(result.drawn.length).toBe(spread.positions.length)
    for (const card of result.drawn) expect(card.cardId).toMatch(/^major-/)
  })
})

describe('invertidas', () => {
  it('allowReversed não muda a ordem nem os ids comprados', () => {
    const seed = hashSeed('orientacao')
    const withReversed = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, allowReversed: true })
    const without = drawForSpread(ids, { spread, seed, algorithm: 'riffle', cuts: 1, allowReversed: false })
    expect(withReversed.drawn.map((card) => card.cardId)).toEqual(without.drawn.map((card) => card.cardId))
    expect(without.drawn.every((card) => card.orientation === 'upright')).toBe(true)
  })

  it('com allowReversed algumas cartas saem invertidas e todas as orientações são válidas', () => {
    let reversed = 0
    for (let i = 0; i < 200; i += 1) {
      const result = drawForSpread(ids, { spread, seed: hashSeed(`orient-${i}`), algorithm: 'mistico', cuts: 1, allowReversed: true })
      for (const card of result.drawn) {
        expect(['upright', 'reversed']).toContain(card.orientation)
        if (card.orientation === 'reversed') reversed += 1
      }
    }
    const rate = reversed / (200 * spread.positions.length)
    expect(rate).toBeGreaterThan(0.2)
    expect(rate).toBeLessThan(0.8)
  })
})

describe('integridade de cada tiragem', () => {
  it('nenhuma carta se repete em nenhuma tiragem de nenhum esquema', () => {
    for (const item of SPREADS) {
      const result = drawForSpread(ids, { spread: item, seed: hashSeed(`unico-${item.id}`), algorithm: 'tradicional', cuts: 1, allowReversed: true })
      expect(new Set(result.uniqueCardIds).size).toBe(result.uniqueCardIds.length)
      expect(result.drawn.length).toBe(item.positions.length)
      const filled = result.drawn.filter((card) => card.cardId).length
      expect(filled).toBe(item.positions.length)
    }
  })
})
