import { describe, expect, it } from 'vitest'
import {
  applyPermutation,
  buildDeck,
  cutDeck,
  deriveSeed,
  drawForSpread,
  fisherYates,
  hashSeed,
  makeRng,
  permutationFor,
  replayDraw,
  threeCuts,
} from '@/engine/deck.ts'
import { CARDS, DECK_IDS, SPREADS, requireSpread } from '@/domain/content.ts'

const SHUFFLE_ALGORITHMS = ['tradicional', 'riffle', 'overhand', 'leque', 'circular', 'mistico'] as const

describe('PRNG e seeds', () => {
  it('hashSeed é estável entre chamadas e independente da ordem', () => {
    expect(hashSeed('arcana')).toBe(hashSeed('arcana'))
    expect(hashSeed('arcana')).not.toBe(hashSeed('Arcana'))
    expect(hashSeed('')).toBeGreaterThanOrEqual(0)
    for (const value of ['a', '2026-10-12', 'celtic-cross-10:42', 'únicode-é-à-õ']) {
      const h = hashSeed(value)
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    }
  })

  it('deriveSeed produz streams ortogonais (sem correlação óbvia)', () => {
    const base = hashSeed('semente-mestra')
    const a = makeRng(deriveSeed(base, 'shuffle'))
    const b = makeRng(deriveSeed(base, 'orientation'))
    const seqA = Array.from({ length: 200 }, () => a())
    const seqB = Array.from({ length: 200 }, () => b())
    expect(seqA.some((v, i) => v === seqB[i])).toBe(false)
    for (const v of [...seqA, ...seqB]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('fisherYates é uma permutação sem viés de comprimento', () => {
    const rng = makeRng(1234)
    const input = Array.from({ length: 78 }, (_, i) => i)
    const out = fisherYates(input, rng)
    expect(out).toHaveLength(78)
    expect(new Set(out).size).toBe(78)
    expect(out.sort((x, y) => x - y)).toEqual(input)
  })

  it('fisherYates não devolve o array original (imutabilidade)', () => {
    const input = [1, 2, 3, 4, 5]
    const out = fisherYates(input, makeRng(7))
    expect(out).not.toBe(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('algoritmos de embaralhamento', () => {
  it.each(SHUFFLE_ALGORITHMS)('%s gera uma bijeção válida sobre 78 cartas', (algorithm) => {
    const perm = permutationFor(algorithm, 78, makeRng(hashSeed(algorithm)))
    expect(perm).toHaveLength(78)
    expect(new Set(perm).size).toBe(78)
    expect(Math.min(...perm)).toBe(0)
    expect(Math.max(...perm)).toBe(77)
  })

  it('cada algoritmo produz uma ordem final distinta para a mesma seed', () => {
    const seed = hashSeed('mesma-semente')
    const orders = SHUFFLE_ALGORITHMS.map((algorithm) => applyPermutation(DECK_IDS, permutationFor(algorithm, 78, makeRng(seed))).join('|'))
    expect(new Set(orders).size).toBe(SHUFFLE_ALGORITHMS.length)
  })

  it('o mesmo algoritmo + seed reproduzem exactamente o baralho', () => {
    const spread = requireSpread('past-present-future')
    const opts = { spread, seed: 987654, algorithm: 'riffle' as const, cuts: 1, allowReversed: true }
    const a = drawForSpread(DECK_IDS, opts)
    const b = drawForSpread(DECK_IDS, opts)
    expect(a.drawn).toEqual(b.drawn)
    expect(a.deckOrder).toEqual(b.deckOrder)
  })

  it('applyPermutation rejeita permutações de tamanho errado', () => {
    expect(() => applyPermutation(['a', 'b', 'c'], [0, 1])).toThrow(/permutação/)
  })
})

describe('cortes', () => {
  it('cutDeck é inversível: cortar n e depois length-n recupera a ordem', () => {
    const deck = DECK_IDS.slice()
    const cut = cutDeck(deck, 31)
    expect(cut).toHaveLength(78)
    expect(cutDeck(cut, 78 - 31)).toEqual(deck)
  })

  it('cutDeck normaliza cortes maiores que o baralho e negativos', () => {
    const deck = ['a', 'b', 'c', 'd']
    expect(cutDeck(deck, 4)).toEqual(deck)
    expect(cutDeck(deck, 0)).toEqual(deck)
    expect(cutDeck(deck, -1)).toEqual(cutDeck(deck, 3))
    expect(cutDeck([], 5)).toEqual([])
  })

  it('três cortes ritualísticos alteram a ordem e preservam o conjunto', () => {
    const before = buildDeck(DECK_IDS).order
    const after = threeCuts(before, makeRng(hashSeed('cortes')))
    expect(after).toHaveLength(78)
    expect(new Set(after).size).toBe(78)
    expect(after).not.toEqual(before)
  })

  it('cortar muda o resultado da tiragem (não é decorativo)', () => {
    const spread = requireSpread('celtic-cross-10')
    const base = { spread, seed: 4242, algorithm: 'tradicional' as const, allowReversed: false }
    const noCut = drawForSpread(DECK_IDS, { ...base, cuts: 0 })
    const oneCut = drawForSpread(DECK_IDS, { ...base, cuts: 1 })
    const threeCut = drawForSpread(DECK_IDS, { ...base, cuts: 3 })
    expect(noCut.drawn.map((d) => d.cardId)).not.toEqual(oneCut.drawn.map((d) => d.cardId))
    expect(oneCut.drawn.map((d) => d.cardId)).not.toEqual(threeCut.drawn.map((d) => d.cardId))
    expect(threeCut.audit.cuts).toBe(3)
  })

  it('escolher do fundo difere de escolher do topo', () => {
    const spread = requireSpread('past-present-future')
    const common = { spread, seed: 17, algorithm: 'overhand' as const, cuts: 0, allowReversed: false }
    const top = drawForSpread(DECK_IDS, { ...common, drawMode: 'topo' })
    const bottom = drawForSpread(DECK_IDS, { ...common, drawMode: 'fundo' })
    expect(top.drawn.map((d) => d.cardId)).not.toEqual(bottom.drawn.map((d) => d.cardId))
    // sem cortes, o primeiro consumo do fundo é literalmente a última carta do baralho
    expect(top.drawn[0]!.cardId).toBe(top.deckOrder[0])
    expect(bottom.drawn[0]!.cardId).toBe(top.deckOrder[77])
    expect(bottom.drawn[1]!.cardId).toBe(top.deckOrder[76])
  })
})

describe('distribuição', () => {
  it('não repete cartas em nenhuma das 76 tiragens', () => {
    for (const spread of SPREADS) {
      const result = drawForSpread(DECK_IDS, {
        spread,
        seed: hashSeed(spread.id),
        algorithm: 'tradicional',
        cuts: 3,
        allowReversed: true,
      })
      expect(result.drawn).toHaveLength(spread.cardCount)
      expect(new Set(result.uniqueCardIds).size).toBe(spread.cardCount)
    }
  })

  it('retira as 78 cartas exactamente uma vez na tiragem completa', () => {
    const spread = requireSpread('full-78-reading')
    const result = drawForSpread(DECK_IDS, { spread, seed: 1, algorithm: 'mistico', cuts: 3, allowReversed: true })
    expect(result.uniqueCardIds).toHaveLength(78)
    expect([...result.uniqueCardIds].sort()).toEqual([...DECK_IDS].sort())
  })

  it('respeita filtros de baralho (só maiores / só menores)', () => {
    const spread = requireSpread('life-purpose')
    const majorsOnly = drawForSpread(DECK_IDS, {
      spread,
      seed: 5,
      algorithm: 'riffle',
      cuts: 0,
      allowReversed: false,
      filter: (id) => id.startsWith('major-'),
    })
    expect(majorsOnly.uniqueCardIds.every((id) => id.startsWith('major-'))).toBe(true)
    expect(majorsOnly.uniqueCardIds).toHaveLength(spread.cardCount)

    const minorsOnly = drawForSpread(DECK_IDS, {
      spread,
      seed: 5,
      algorithm: 'riffle',
      cuts: 0,
      allowReversed: false,
      filter: (id) => !id.startsWith('major-'),
    })
    expect(minorsOnly.uniqueCardIds.every((id) => !id.startsWith('major-'))).toBe(true)
  })

  it('falha de forma controlada quando o baralho filtrado é pequeno demais', () => {
    const spread = requireSpread('grand-table')
    expect(() =>
      drawForSpread(DECK_IDS, { spread, seed: 1, algorithm: 'tradicional', cuts: 0, allowReversed: false, filter: (id) => id.startsWith('major-') }),
    ).toThrow(/não foi possível distribuir/)
  })

  it('a escolha manual no leque é respeitada e não duplica cartas', () => {
    const spread = requireSpread('past-present-future')
    const auto = drawForSpread(DECK_IDS, { spread, seed: 77, algorithm: 'leque', cuts: 2, allowReversed: false })
    const manual = drawForSpread(DECK_IDS, {
      spread,
      seed: 77,
      algorithm: 'leque',
      cuts: 2,
      allowReversed: false,
      manualPicks: [
        { positionId: spread.positions[0]!.id, deckIndex: 0 },
        { positionId: spread.positions[spread.positions.length - 1]!.id, deckIndex: 77 },
      ],
    })
    expect(manual.drawn[0]!.cardId).toBe(auto.deckOrder[0])
    expect(manual.drawn[2]!.cardId).toBe(auto.deckOrder[77])
    expect(new Set(manual.uniqueCardIds).size).toBe(3)
    // a carta do meio vem da ordem do baralho, ignorando as duas já escolhidas
    expect(manual.drawn[1]!.cardId).not.toBe(manual.drawn[0]!.cardId)
    expect(manual.drawn[1]!.cardId).not.toBe(manual.drawn[2]!.cardId)
  })

  it('índices de escolha manual fora do intervalo são normalizados, não ignorados', () => {
    const spread = requireSpread('yes-no')
    const result = drawForSpread(DECK_IDS, {
      spread,
      seed: 9,
      algorithm: 'circular',
      cuts: 0,
      allowReversed: false,
      manualPicks: [{ positionId: spread.positions[0]!.id, deckIndex: 78 + 3 }],
    })
    const expected = drawForSpread(DECK_IDS, { spread, seed: 9, algorithm: 'circular', cuts: 0, allowReversed: false })
    expect(result.drawn[0]!.cardId).toBe(expected.deckOrder[3])
  })

  it('permitir invertidas não altera as cartas retiradas', () => {
    const spread = requireSpread('celtic-cross-10')
    const common = { spread, seed: 2024, algorithm: 'circular' as const, cuts: 3 }
    const withRev = drawForSpread(DECK_IDS, { ...common, allowReversed: true })
    const withoutRev = drawForSpread(DECK_IDS, { ...common, allowReversed: false })
    expect(withRev.drawn.map((d) => d.cardId)).toEqual(withoutRev.drawn.map((d) => d.cardId))
    expect(withoutRev.drawn.every((d) => d.orientation === 'upright')).toBe(true)
    expect(withRev.audit.orientationRngSeed).not.toBe(withoutRev.audit.orientationRngSeed)
  })

  it('a proporção de invertidas fica perto de 25% em muitas amostras', () => {
    const spread = requireSpread('yes-no')
    let reversed = 0
    let total = 0
    for (let i = 0; i < 400; i++) {
      const r = drawForSpread(DECK_IDS, { spread, seed: i * 7919, algorithm: 'riffle', cuts: 1, allowReversed: true })
      reversed += r.audit.reversedCount
      total += r.drawn.length
    }
    const ratio = reversed / total
    expect(ratio).toBeGreaterThan(0.18)
    expect(ratio).toBeLessThan(0.34)
  })

  it('a orientação por carta é estável para a mesma seed e posição', () => {
    const spread = requireSpread('mind-body-spirit')
    const a = drawForSpread(DECK_IDS, { spread, seed: 31337, algorithm: 'tradicional', cuts: 3, allowReversed: true })
    const b = drawForSpread(DECK_IDS, { spread, seed: 31337, algorithm: 'tradicional', cuts: 3, allowReversed: true })
    expect(a.drawn.map((d) => `${d.cardId}:${d.orientation}`)).toEqual(b.drawn.map((d) => `${d.cardId}:${d.orientation}`))
  })

  it('positionOrder permite ler noutra ordem sem trocar as cartas', () => {
    const spread = requireSpread('past-present-future')
    const natural = drawForSpread(DECK_IDS, { spread, seed: 6, algorithm: 'overhand', cuts: 0, allowReversed: false })
    const reversedOrder = [...spread.readingOrder].reverse()
    const reordered = drawForSpread(DECK_IDS, {
      spread,
      seed: 6,
      algorithm: 'overhand',
      cuts: 0,
      allowReversed: false,
      positionOrder: reversedOrder,
    })
    expect([...natural.drawn.map((d) => d.cardId)].sort()).toEqual([...reordered.drawn.map((d) => d.cardId)].sort())
    expect(reordered.drawn.map((d) => d.positionId)).toEqual(reversedOrder)
  })

  it('o baralho consumido reflecte o número de cartas distribuídas', () => {
    const spread = requireSpread('horseshoe-7')
    const result = drawForSpread(DECK_IDS, { spread, seed: 12, algorithm: 'tradicional', cuts: 3, allowReversed: true })
    expect(result.deck.consumed).toBe(7)
    expect(result.deck.order).toHaveLength(78)
    expect(result.deck.algorithm).toBe('tradicional')
  })

  it('replay reproduz a tiragem a partir do registo', () => {
    const spread = requireSpread('tree-of-life-10')
    const original = drawForSpread(DECK_IDS, { spread, seed: 90210, algorithm: 'riffle', cuts: 3, allowReversed: true })
    const replayed = replayDraw(DECK_IDS, {
      spread,
      seed: original.audit.seed,
      algorithm: original.audit.algorithm,
      cuts: original.audit.cuts,
      allowReversed: true,
    })
    expect(replayed.drawn).toEqual(original.drawn)
  })

  it('todas as cartas retiradas existem no baralho e as posições batem certo', () => {
    const byId = new Map(CARDS.map((c) => [c.id, c]))
    for (const spread of SPREADS.slice(0, 30)) {
      const result = drawForSpread(DECK_IDS, { spread, seed: hashSeed(spread.id + 'x'), algorithm: 'mistico', cuts: 3, allowReversed: true })
      for (const d of result.drawn) {
        expect(byId.has(d.cardId)).toBe(true)
        expect(spread.positions.some((p) => p.id === d.positionId)).toBe(true)
        expect(['upright', 'reversed']).toContain(d.orientation)
        expect(d.deckIndex).toBeGreaterThanOrEqual(0)
        expect(d.deckIndex).toBeLessThan(78)
        expect(d.seed).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('a mesma seed em tiragens diferentes dá conjuntos de cartas diferentes', () => {
    const seed = 555
    const small = drawForSpread(DECK_IDS, { spread: requireSpread('yes-no'), seed, algorithm: 'tradicional', cuts: 3, allowReversed: false })
    const big = drawForSpread(DECK_IDS, { spread: requireSpread('celtic-cross-10'), seed, algorithm: 'tradicional', cuts: 3, allowReversed: false })
    expect(small.drawn[0]!.cardId).toBe(big.drawn[0]!.cardId) // mesma stream de baralho
    expect(big.uniqueCardIds.length).toBe(10)
  })
})
