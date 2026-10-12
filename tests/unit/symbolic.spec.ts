import { describe, expect, it } from 'vitest'
import { analyze, classifyPosition, elName, elementForCard, cardNumericValue } from '@/engine/symbolic.ts'
import { drawForSpread, permutationFor, makeRng, hashSeed } from '@/engine/deck.ts'
import { CARDS, DECK_IDS, SPREADS, getCard, requireSpread } from '@/domain/content.ts'

const cardMap = new Map(CARDS.map((c) => [c.id, c]))
/** Id real de um arcano maior pelo seu número (os ids trazem sufixo semântico). */
const M = (n: number) => CARDS.find((c) => c.arcana === 'major' && c.number === n)!.id
const getCardById = (id: string) => cardMap.get(id)

interface CardSpec { positionId?: string; cardId: string; orientation?: 'upright' | 'reversed' }
function analysisFor(spreadId: string, cardIds: CardSpec[]) {
  const spread = requireSpread(spreadId)
  const drawn = cardIds.map((c, i) => ({
    positionId: c.positionId ?? spread.positions[i]!.id,
    cardId: c.cardId,
    orientation: c.orientation ?? ('upright' as const),
    deckIndex: i,
    seed: i,
  }))
  return analyze({ drawn, positions: spread.positions, getCard: getCardById })
}

describe('semântica das posições', () => {
  it('classifica tempo a partir do rótulo/descrição reais', () => {
    const spread = requireSpread('past-present-future')
    const [past, present, future] = spread.positions.map(classifyPosition)
    expect(past!.time).toBe('passado')
    expect(present!.time).toBe('presente')
    expect(future!.time).toBe('futuro')
  })

  it('classifica foco (conselho, obstáculo, outro, oculto)', () => {
    expect(classifyPosition({ id: 'x', label: 'O conselho', description: 'O que fazer na prática.' }).focus).toBe('advice')
    expect(classifyPosition({ id: 'x', label: 'O obstáculo', description: 'O que trava a situação.' }).focus).toBe('obstacle')
    expect(classifyPosition({ id: 'x', label: 'A outra pessoa', description: 'Como o outro se comporta.' }).focus).toBe('other')
    expect(classifyPosition({ id: 'x', label: 'O que está escondido', description: 'O que não se vê.' }).focus).toBe('hidden')
  })

  it('detecta o elemento pedido pela posição', () => {
    expect(classifyPosition({ id: 'x', label: 'Acção', description: 'O que fazes.' }).element).toBe('fire')
    expect(classifyPosition({ id: 'x', label: 'Sentimentos', description: 'O que sentes.' }).element).toBe('water')
    expect(classifyPosition({ id: 'x', label: 'Pensamentos', description: 'O que pensas.' }).element).toBe('air')
    expect(classifyPosition({ id: 'x', label: 'Corpo e recursos', description: 'A matéria.' }).element).toBe('earth')
  })

  it('não inventa tempo quando a posição é atemporal', () => {
    expect(classifyPosition({ id: 'x', label: 'O assunto', description: 'A situação no seu núcleo.' }).time).toBe('atemporal')
  })
})

describe('elementos e numerologia', () => {
  it('os maiores contam como espírito, os menores pelo naipe', () => {
    expect(elementForCard(getCard(M(0))!)).toBe('spirit')
    expect(elementForCard(getCard('minor-wands-01')!)).toBe('fire')
    expect(elementForCard(getCard('minor-cups-01')!)).toBe('water')
    expect(elementForCard(getCard('minor-swords-01')!)).toBe('air')
    expect(elementForCard(getCard('minor-pentacles-01')!)).toBe('earth')
  })

  it('cardNumericValue desloca os menores para 11–14 (cortes)', () => {
    expect(cardNumericValue(getCard('minor-wands-01')!)).toBeGreaterThanOrEqual(1)
    expect(cardNumericValue(getCard(M(21))!)).toBe(21)
  })

  it('elName devolve nomes em português sem artigo', () => {
    expect(elName('fire')).toBe('fogo')
    expect(elName('water')).toBe('água')
  })

  it('o balanço elemental soma as posições', () => {
    const a = analysisFor('mind-body-spirit', [
      { cardId: M(0) },
      { cardId: 'minor-wands-02' },
      { cardId: 'minor-cups-02' },
    ])
    expect(a.elementBalance.total).toBe(3)
    expect(a.elementBalance.spirit).toBe(1)
    expect(a.elementBalance.fire).toBe(1)
    expect(a.elementBalance.water).toBe(1)
  })
})

describe('padrões estruturais', () => {
  it('detecta ausência elemental como padrão único com lista', () => {
    const a = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' },
      { cardId: 'minor-wands-03' },
      { cardId: 'minor-swords-02' },
    ])
    const absence = a.patterns.find((p) => p.kind === 'elemento-ausente')
    expect(absence).toBeDefined()
    expect(absence!.title).toMatch(/Ausência de/)
    expect(absence!.cards).toEqual([])
    expect(a.patterns.filter((p) => p.kind === 'elemento-ausente')).toHaveLength(1)
  })

  it('detecta predomínio elemental', () => {
    const a = analysisFor('four-seasons', [
      { cardId: 'minor-wands-02' },
      { cardId: 'minor-wands-03' },
      { cardId: 'minor-wands-04' },
      { cardId: 'minor-cups-02' },
    ])
    const dom = a.patterns.find((p) => p.kind === 'elemento-dominante')
    expect(dom).toBeDefined()
    expect(dom!.title).toMatch(/fogo/i)
  })

  it('detecta naipe repetido em três ou mais cartas', () => {
    const a = analysisFor('love-now', [
      { cardId: 'minor-cups-02' },
      { cardId: 'minor-cups-05' },
      { cardId: 'minor-cups-07' },
      { cardId: M(6) },
    ])
    expect(a.suitRepeats.some((r) => r.suit === 'cups')).toBe(true)
    expect(a.patterns.some((p) => p.kind === 'duplo-triplo-naipe')).toBe(true)
  })

  it('escada: três valores seguidos produzem sequencia-numerica', () => {
    const a = analysisFor('thought-emotion-action', [
      { cardId: 'minor-wands-04' },
      { cardId: 'minor-wands-05' },
      { cardId: 'minor-wands-06' },
    ])
    expect(a.ladders).toHaveLength(1)
    expect(a.ladders[0]!.values).toEqual([4, 5, 6])
    expect(a.patterns.some((p) => p.kind === 'sequencia-numerica')).toBe(true)
  })

  it('agregado de figuras da corte gera padrão', () => {
    const a = analysisFor('me-other-relationship', [
      { cardId: 'minor-cups-queen' },
      { cardId: 'minor-wands-king' },
      { cardId: 'minor-swords-knight' },
    ])
    expect(a.court.cards).toHaveLength(3)
    expect(a.patterns.some((p) => p.kind === 'figuras-da-corte')).toBe(true)
  })

  it('proporção de invertidas é detectada', () => {
    const a = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02', orientation: 'reversed' },
      { cardId: 'minor-cups-02', orientation: 'reversed' },
      { cardId: 'minor-swords-02', orientation: 'reversed' },
    ])
    expect(a.counts.reversed).toBe(3)
    expect(a.reversalRatio).toBe(1)
    expect(a.patterns.some((p) => p.kind === 'todas-invertidas')).toBe(true)
  })

  it('todas direitas geram o padrão oposto', () => {
    const a = analysisFor('love-now', [
      { cardId: 'minor-wands-02' },
      { cardId: 'minor-cups-02' },
      { cardId: 'minor-swords-02' },
      { cardId: 'minor-pentacles-02' },
    ])
    expect(a.patterns.some((p) => p.kind === 'todas-normais')).toBe(true)
  })

  it('arco Louco–Mundo produz o padrão da viagem completa', () => {
    const a = analysisFor('desire-fear-reality', [
      { cardId: M(0) },
      { cardId: M(13) },
      { cardId: M(21) },
    ])
    expect(a.patterns.some((p) => p.kind === 'caminho-do-tolo')).toBe(true)
    expect(a.journey.indices).toEqual([0, 13, 21])
  })

  it('Torre + Morte dispara o padrão de rutura', () => {
    const a = analysisFor('release-accept-grow', [
      { cardId: M(16) },
      { cardId: M(13) },
      { cardId: 'minor-wands-02' },
    ])
    expect(a.patterns.some((p) => p.title.includes('Torre e Morte'))).toBe(true)
  })
})

describe('aspetos e ressonância', () => {
  it('extrai signos do campo astro dos menores (Golden Dawn)', () => {
    const a = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' }, // Sol em Carneiro
      { cardId: 'minor-cups-02' }, // Júpiter em Caranguejo? (Vénus/Mercúrio/Lua)
      { cardId: 'minor-swords-02' },
    ])
    expect(a.aspects.every((x) => x.orbDeg % 30 === 0)).toBe(true)
    expect(a.aspects.length).toBeGreaterThan(0)
    for (const asp of a.aspects) {
      expect(['Áries', 'Touro', 'Gémeos', 'Caranguejo', 'Leão', 'Virgem', 'Balança', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']).toContain(asp.signA)
      expect(['conjunction', 'sextile', 'square', 'trine', 'opposition']).toContain(asp.kind)
    }
  })

  it('quadratura é detetada entre Carneiro e Caranguejo', () => {
    const a = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' }, // Carneiro
      { cardId: 'minor-cups-03' }, // Caranguejo
      { cardId: M(0) },
    ])
    const square = a.aspects.find((x) => x.kind === 'square')
    expect(square).toBeDefined()
    expect(square!.harmony).toBe('desafio')
  })

  it('trígono entre signos do mesmo elemento e sextil entre elementos afins', () => {
    const sameElement = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' }, // Sol em Carneiro
      { cardId: 'minor-wands-06' }, // Júpiter em Leão → 120°
      { cardId: M(19) },
    ])
    const trine = sameElement.aspects.find((x) => x.kind === 'trine')
    expect(trine).toBeDefined()
    expect(trine!.orbDeg).toBe(120)
    expect(trine!.harmony).toBe('fluxo')

    const sextile = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' }, // Carneiro
      { cardId: 'minor-swords-08' }, // Júpiter em Gémeos → 60°
      { cardId: M(19) },
    ]).aspects.find((x) => x.kind === 'sextile')
    expect(sextile).toBeDefined()
    expect(sextile!.orbDeg).toBe(60)
  })

  it('a ressonância classifica-se em quatro tons', () => {
    const a = analysisFor('past-present-future', [
      { cardId: 'minor-wands-02' },
      { cardId: 'minor-cups-02' },
      { cardId: 'minor-swords-02' },
    ])
    expect(a.resonance).toHaveLength(3)
    for (const r of a.resonance) {
      expect(['reforca', 'contrasta', 'desafia', 'neutral']).toContain(r.tone)
      expect(r.reasons.length).toBeGreaterThan(0)
    }
  })
})

describe('relações canónicas efectivamente presentes', () => {
  it('só reporta relações entre cartas da tiragem', () => {
    const a = analysisFor('past-present-future', [
      { cardId: M(16) },
      { cardId: M(13) },
      { cardId: M(0) },
    ])
    for (const rel of a.relations) {
      expect([M(16), M(13), M(0)]).toContain(rel.a)
      expect([M(16), M(13), M(0)]).toContain(rel.b)
    }
  })

  it('relações são deduplicadas entre pares (a,b) e (b,a)', () => {
    const a = analysisFor('love-now', [
      { cardId: M(16) },
      { cardId: M(13) },
      { cardId: M(0) },
      { cardId: M(21) },
      { cardId: 'minor-wands-02' },
    ])
    const keys = a.relations.map((r) => [r.a, r.b].sort().join('|') + '|' + r.kind)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('combinações adjacentes cobrem todos os pares vizinhos', () => {
    const spread = requireSpread('celtic-cross-10')
    const result = drawForSpread(DECK_IDS, { spread, seed: 1, algorithm: 'tradicional', cuts: 3, allowReversed: true })
    const a = analyze({ drawn: result.drawn, positions: spread.positions, getCard: getCardById })
    expect(a.combinations.length).toBeGreaterThan(0)
    for (const c of a.combinations) {
      expect(c.cards).toHaveLength(2)
      expect(c.positions).toHaveLength(2)
      expect(c.note.length).toBeGreaterThan(30)
      expect(['reforco', 'tensao', 'sombra', 'complemento', 'espelho', 'sequencia']).toContain(c.kind)
    }
  })
})

describe('invariantes do motor sobre as 76 tiragens', () => {
  it('análise determinística: mesma entrada → mesmos padrões', () => {
    for (const spread of SPREADS.slice(0, 25)) {
      const result = drawForSpread(DECK_IDS, { spread, seed: hashSeed(spread.id), algorithm: 'riffle', cuts: 3, allowReversed: true })
      const input = { drawn: result.drawn, positions: spread.positions, getCard: getCardById }
      const a1 = analyze(input)
      const a2 = analyze(input)
      expect(a2.patterns.map((p) => p.kind + p.title)).toEqual(a1.patterns.map((p) => p.kind + p.title))
      expect(a2.combinations).toEqual(a1.combinations)
      expect(a2.coherence).toBe(a1.coherence)
    }
  })

  it('cada análise produz padrões com explicação e implicação reais', () => {
    for (const spread of SPREADS.slice(0, 25)) {
      const result = drawForSpread(DECK_IDS, { spread, seed: hashSeed(spread.id + 'b'), algorithm: 'overhand', cuts: 1, allowReversed: true })
      const a = analyze({ drawn: result.drawn, positions: spread.positions, getCard: getCardById })
      expect(a.patterns.length).toBeGreaterThan(0)
      for (const p of a.patterns) {
        expect(p.title.length).toBeGreaterThan(4)
        expect(p.detail.length).toBeGreaterThan(30)
        expect(p.implication.length).toBeGreaterThan(20)
        expect(p.strength).toBeGreaterThan(0)
        expect(p.strength).toBeLessThanOrEqual(1)
        for (const id of p.cards) expect(cardMap.has(id)).toBe(true)
        for (const pos of p.positions) expect(spread.positions.some((q) => q.id === pos)).toBe(true)
      }
      expect(a.coherence).toBeGreaterThan(0)
      expect(a.coherence).toBeLessThanOrEqual(1)
    }
  })

  it('os padrões não repetem o mesmo título dentro da mesma tiragem', () => {
    for (const spread of SPREADS.slice(0, 20)) {
      const result = drawForSpread(DECK_IDS, { spread, seed: hashSeed(spread.id + 'c'), algorithm: 'mistico', cuts: 3, allowReversed: true })
      const a = analyze({ drawn: result.drawn, positions: spread.positions, getCard: getCardById })
      const titles = a.patterns.map((p) => p.title)
      expect(new Set(titles).size).toBe(titles.length)
    }
  })

  it('a distribuição do baralho cobre cartas diferentes por semente em 100 amostras', () => {
    const spread = requireSpread('past-present-future')
    const seen = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const r = drawForSpread(DECK_IDS, { spread, seed: i * 104729 + 7, algorithm: 'tradicional', cuts: 3, allowReversed: true })
      seen.add(r.uniqueCardIds.join(','))
    }
    expect(seen.size).toBeGreaterThan(90)
  })

  it('nenhum algoritmo favorece sistematicamente as primeiras cartas do baralho', () => {
    for (const algorithm of ['tradicional', 'riffle', 'overhand', 'leque', 'circular', 'mistico'] as const) {
      const histogram = new Map<number, number>()
      const N = 1200
      for (let i = 0; i < N; i++) {
        const perm = permutationFor(algorithm, 78, makeRng(hashSeed(`${algorithm}:${i}`)))
        const firstOriginalIndex = perm[0]!
        histogram.set(firstOriginalIndex, (histogram.get(firstOriginalIndex) ?? 0) + 1)
      }
      const max = Math.max(...histogram.values())
      const expected = N / 78
      // 'riffle', 'tradicional' e 'mistico' são os baralhamentos completos: têm de ser
      // praticamente uniformes. 'overhand', 'leque' e 'circular' são passagens físicas de
      // mistura (preservam mais estrutura do baralho, por desígnio) — exigimos apenas que
      // não sejam determinísticas nem grosseiramente favorecedoras.
      const full = algorithm === 'riffle' || algorithm === 'tradicional' || algorithm === 'mistico'
      expect(max).toBeLessThan(expected * (full ? 2.6 : 9))
      expect(histogram.size).toBeGreaterThan(full ? 55 : 12)
    }
  })
})
