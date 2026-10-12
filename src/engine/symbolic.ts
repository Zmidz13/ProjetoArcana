import { aspectsFor, modalityFor, signElementFor, signFor, type Aspect } from './aspects.ts'
import type { CardDef, DrawnCard } from '../domain/types.ts'
import type { CombinationNote, ElementBalance, Pattern, PatternKind } from '../domain/interpretation.ts'

/**
 * Motor simbólico determinístico (camada 1 da IA híbrida).
 *
 * Não usa aleatoriedade nem chama modelos: recebe as cartas retiradas e as posições
 * e devolve a estrutura simbólica objectiva — equilíbrio elemental, aspetos astrológicos,
 * relações canónicas efectivamente presentes na tiragem, numerologia, ressonância
 * posição↔carta e deslocamento temporal. A camada narrativa e o LLM limitam-se a
 * **reescrever** esta estrutura; é também ela que permite ao fallback local produzir
 * uma interpretação completa sem rede.
 *
 * As posições das tiragens não transportam metadados de elemento ou tempo: o vocabulário
 * é extraído do rótulo e da descrição (76 tiragens, 522 posições, sem tabelas paralelas),
 * o que mantém o motor honesto face ao conteúdo real.
 */

export interface PositionSemantic {
  id: string
  label: string
  description: string
  group?: string
  time: 'passado' | 'presente' | 'futuro' | 'atemporal'
  focus: 'self' | 'other' | 'relation' | 'environment' | 'advice' | 'outcome' | 'obstacle' | 'hidden' | 'general'
  element: 'fire' | 'water' | 'air' | 'earth' | null
}

export interface AnalysisInput {
  drawn: DrawnCard[]
  positions: { id: string; label: string; description: string; group?: string }[]
  getCard: (cardId: string) => CardDef | undefined
  /** Foco declarado da tiragem (summary/purpose) — usado na abertura e nas orientações. */
  spreadPurpose?: string
  spreadName?: string
  spreadCategory?: string
}

export interface RelationEdge {
  a: string
  b: string
  aLabel: string
  bLabel: string
  kind: string
  note: string
  /** Força da ligação na base canónica (0..1). */
  strength: number
  /** true quando a aresta é a inversa materializada pelo gerador de conteúdo. */
  derived: boolean
}

export interface PositionResonance {
  positionId: string
  cardId: string
  tone: 'reforca' | 'contrasta' | 'desafia' | 'neutral'
  score: number
  reasons: string[]
}

export interface TemporalShift {
  /** Tendência de velocidade da tiragem (lenta quando predominam signos fixos). */
  pace: 'rapido' | 'moderado' | 'lento'
  /** Índice 0..1 de quanto o peso simbólico está projectado para a frente. */
  forwardBias: number
  notes: string[]
}

export interface Analysis {
  counts: { cards: number; majors: number; minors: number; reversed: number }
  suits: { major: number; wands: number; cups: number; swords: number; pentacles: number }
  elementBalance: ElementBalance
  /** Peso elemental por posição, para o UI pintar o mapa de calor. */
  elementByPosition: { positionId: string; cardId: string; element: string }[]
  aspects: Aspect[]
  aspectByKind: Record<'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition', number>
  modality: { cardinal: number; fixed: number; mutable: number }
  polarity: { yin: number; yang: number }
  relations: RelationEdge[]
  chains: { start: string; path: { from: string; to: string; kind: string }[] }[]
  suitRepeats: { suit: 'wands' | 'cups' | 'swords' | 'pentacles'; cards: string[] }[]
  ladders: { suit: 'wands' | 'cups' | 'swords' | 'pentacles'; cards: string[]; values: number[] }[]
  court: { cards: string[]; ranks: string[] }
  numerology: { sum: number; reduced: number; repeats: { value: number; cards: string[] }[]; bySuit: Record<string, { sum: number; count: number }> }
  reversalRatio: number
  resonance: PositionResonance[]
  temporal: TemporalShift
  journey: { label: string; indices: number[]; description: string }
  themes: { themeId: string; score: number; cards: string[] }[]
  patterns: Pattern[]
  combinations: CombinationNote[]
  /** Fatores que limitam a confiança da leitura (tiragem pequena, baralho filtrado…). */
  warnings: string[]
  /** 0..1 — quão "legível" é a tiragem para o motor (densidade de sinais cruzados). */
  coherence: number
}

const COURT = new Set(['page', 'knight', 'queen', 'king'])

/** Força canónica de cada tipo de ligação (usado para ordenar e para a confiança). */
const STRENGTH_BY_KIND: Record<string, number> = {
  sombra: 0.9,
  tensao: 0.8,
  espelho: 0.75,
  reforca: 0.7,
  continuidade: 0.65,
  complementa: 0.6,
}

/**
 * Classificação lexical das posições.
 *
 * As tiragens não trazem metadados de elemento/tempo por posição; em vez de inventar
 * uma tabela paralela (que divergiria das 522 descrições reais), o motor lê o texto.
 * Trabalhamos sobre texto "dobrado" (minúsculas, sem acentos, ç→c) para que os radicais
 * funcionem em qualquer flexão do português europeu.
 */
export function fold(v: string): string {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/qu/g, 'k')
    .replace(/cc/g, 'c')
    .replace(/[^a-z0-9\s-]/g, ' ')
}

const TIME_STEMS: [PositionSemantic['time'], string[]][] = [
  ['passado', ['passad', 'antes de', 'origem', 'raiz', 'influenci', 'veic', 'ficou para tras', 'ja vive', 'anterior', 'ontem', 'historia', 'o que foi', 'base anti']],
  ['futuro', ['futur', 'vai ser', 'vai acontecer', 'proxim', 'desenlace', 'desfecho', 'resultado', 'consequ', 'evolu', 'acontecera', 'semanas', 'meses', 'adeante', 'para onde', 'o que segue', 'vira', 'destino mais', 'tendencia']],
  ['presente', ['presente', 'agora', 'hoje', 'actual', 'atual', 'neste momento', 'como esta', 'corrente', 'deste momento', 'no dia a dia', 'agora mesmo', 'nesta fase']],
]

const ELEMENT_STEMS: [('fire' | 'water' | 'air' | 'earth'), string[]][] = [
  ['fire', ['acao', 'agir', 'agiu', 'impulso', 'vontade', 'energia', 'coragem', 'decis', 'projecto', 'projeto', 'trabalho', 'fazer', 'mover', 'inicio', 'comec', 'fogo', 'realiz', 'execu', 'iniciativ', 'conquist', 'arrisc']],
  ['water', ['sentimento', 'emoc', 'afet', 'amor', 'relacao', 'vincul', 'intuic', 'sonho', 'luto', 'cuidar', 'coracao', 'interior', 'agua', 'macoa', 'ternura', 'confi', 'magoa', 'sentir']],
  ['air', ['pensamento', 'ideia', 'mente', 'comunica', 'palavra', 'analise', 'plano', 'informa', 'clareza', 'escolha', 'duvida', 'conversa', 'raciocin', 'verbal', 'diagnostico', 'question', 'ideias']],
  ['earth', ['corpo', 'saude', 'dinheiro', 'recurso', 'casa', 'habito', 'rotina', 'estrutura', 'seguran', 'terra', 'pratic', 'material', 'financ', 'tempo longo', 'bens', 'custo', 'sustentab']],
]

const FOCUS_STEMS: [PositionSemantic['focus'], string[]][] = [
  ['self', ['tua atitude', 'tu no', 'o que trazes', 'como te ves', 'autoimagem', 'tu mesma', 'tu mesmo', 'voce', 'consulente', 'o teu papel', 'a tua parte', 'tu aqui', 'sobre ti', 'como estas']],
  ['hidden', ['inconsciente', 'escondid', 'oculto', 'nao se ve', 'reprimid', 'submers', 'segred', 'silencio', 'por baixo', 'receio', 'medo', 'temor', 'esperanc', 'negad', 'o que nao', 'sombra', 'o que evita']],
  ['obstacle', ['obstacul', 'desafio', 'atrito', 'bloqueio', 'impedimento', 'risco', 'ameac', 'o que trava', 'limita', 'custo', 'perigo', 'impede']],
  ['advice', ['conselho', 'orienta', 'recomenda', 'o que fazer', 'como agir', 'sugest', 'proximo passo', 'pratica', 'instru', 'o que podes', 'como ajudar', 'postura recomendada']],
  ['outcome', ['desfecho', 'resultado', 'final', 'sintese', 'fecho', 'conclus', 'tendencia', 'para onde', 'o que resulta', 'provavel', 'destino']],
  ['relation', ['relacao', 'entre nos', 'entre ambos', 'entre voces', 'o que circula', 'conexao', 'encontro', 'dinamica', 'casal', 'o entre', 'a ponte']],
  ['other', ['outro', 'outra pessoa', 'a pessoa', 'parceir', 'amig', 'familia', 'colega', 'adversari', 'amado', 'outrem', 'ele ou ela', 'a outra face', 'pessoa amada']],
  ['environment', ['ambiente', 'contexto', 'exterior', 'circunstancias', 'sociedade', 'local', 'o entorno', 'externo', 'as pessoas a volta', 'meio']],
]

const MATCH_ORDER: PositionSemantic['time'][] = ['passado', 'futuro', 'presente']

export function classifyPosition(pos: { id: string; label: string; description: string; group?: string }): PositionSemantic {
  const haystack = fold(`${pos.label}. ${pos.description}`)
  const hits = (stems: string[]) => stems.some((stem) => haystack.includes(stem))

  let time: PositionSemantic['time'] = 'atemporal'
  let bestTimeHits = 0
  for (const value of MATCH_ORDER) {
    const own = TIME_STEMS.find(([t]) => t === value)?.[1] ?? []
    const count = own.filter((stem) => haystack.includes(stem)).length
    if (count > bestTimeHits) {
      bestTimeHits = count
      time = value
    }
  }

  let focus: PositionSemantic['focus'] = 'general'
  for (const [value, stems] of FOCUS_STEMS) {
    if (hits(stems)) {
      focus = value
      break
    }
  }

  let element: PositionSemantic['element'] = null
  let bestElementHits = 0
  for (const [value, stems] of ELEMENT_STEMS) {
    const count = stems.filter((stem) => haystack.includes(stem)).length
    if (count > bestElementHits) {
      bestElementHits = count
      element = value
    }
  }

  return { id: pos.id, label: pos.label, description: pos.description, group: pos.group, time, focus, element }
}

export function elementForCard(card: CardDef): 'fire' | 'water' | 'air' | 'earth' | 'spirit' {
  return card.arcana === 'major' ? 'spirit' : card.element
}

export function cardNumericValue(card: CardDef): number {
  return card.arcana === 'major' ? card.number : card.number + 10
}

const SUIT_PT = { major: 'Arcanos Maiores', wands: 'Paus', cups: 'Copas', swords: 'Espadas', pentacles: 'Ouros' } as const
const ELEMENT_PT = { fire: 'Fogo', water: 'Água', air: 'Ar', earth: 'Terra', spirit: 'Espírito' } as const

function reduceToDigit(n: number): number {
  let v = Math.abs(Math.trunc(n))
  while (v > 9) v = String(v).split('').reduce((s, c) => s + Number(c), 0)
  return v
}

/** Nome do elemento sem artigo — para usar depois de preposições. */
export function elName(e: 'fire' | 'water' | 'air' | 'earth' | 'spirit'): string {
  return { fire: 'fogo', water: 'água', air: 'ar', earth: 'terra', spirit: 'espírito' }[e]
}

/** Nome do elemento com artigo definido — para uso em início de frase/sujeito. */
export function elPhrase(e: 'fire' | 'water' | 'air' | 'earth' | 'spirit'): string {
  return { fire: 'o fogo', water: 'a água', air: 'o ar', earth: 'a terra', spirit: 'o espírito' }[e]
}

export function analyze(input: AnalysisInput): Analysis {
  const warnings: string[] = []
  type Resolved = { drawn: DrawnCard; def: CardDef; position?: { id: string; label: string; description: string; group?: string } }
  const resolved: Resolved[] = []
  for (const d of input.drawn) {
    const def = input.getCard(d.cardId)
    if (!def) {
      warnings.push(`carta ${d.cardId} não existe no baralho base — ignorada`)
      continue
    }
    resolved.push({ drawn: d, def, position: input.positions.find((p) => p.id === d.positionId) })
  }

  const total = resolved.length
  const suits = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0 }
  const counts = { fire: 0, water: 0, air: 0, earth: 0, spirit: 0 }
  const reversed = resolved.filter((r) => r.drawn.orientation === 'reversed')
  const elementByPosition: Analysis['elementByPosition'] = []
  const bySuitCards = new Map<string, string[]>()
  const bySuitValues = new Map<string, { value: number; id: string }[]>()
  const courtCards: string[] = []
  const courtRanks: string[] = []
  const journey: number[] = []
  const majorIdByNumber = new Map<number, string>()

  for (const r of resolved) {
    const suit = r.def.suit ?? 'major'
    suits[suit]++
    const el = elementForCard(r.def)
    counts[el]++
    elementByPosition.push({ positionId: r.drawn.positionId, cardId: r.def.id, element: el })
    if (r.def.arcana === 'minor' && r.def.suit) {
      const list = bySuitCards.get(r.def.suit) ?? []
      list.push(r.def.id)
      bySuitCards.set(r.def.suit, list)
      const values = bySuitValues.get(r.def.suit) ?? []
      values.push({ value: r.def.number, id: r.def.id })
      bySuitValues.set(r.def.suit, values)
      const rank = r.def.rank ?? ''
      if (COURT.has(rank)) {
        courtCards.push(r.def.id)
        courtRanks.push(rank)
      }
    }
    if (r.def.arcana === 'major') {
      journey.push(r.def.number)
      majorIdByNumber.set(r.def.number, r.def.id)
    }
  }

  const elementBalance: ElementBalance = { ...counts, total }

  /* ── posições: semântica + ressonância ── */
  const positionSemantics = input.positions.map(classifyPosition)
  const aspects = aspectsFor(resolved.map((r) => ({ id: r.def.id, astro: r.def.astro ?? '', arcana: r.def.arcana, number: r.def.number })))
  const aspectByKind = { conjunction: 0, sextile: 0, square: 0, trine: 0, opposition: 0 }
  for (const a of aspects) aspectByKind[a.kind]++
  const modality = { cardinal: 0, fixed: 0, mutable: 0 }
  let yin = 0
  let yang = 0
  for (const r of resolved) {
    const sign = signFor(r.def.astro)
    const m = modalityFor(sign)
    if (m) modality[m]++
    const el = sign ? signElementFor(sign) : null
    if (el === 'fire' || el === 'air') yang++
    else if (el === 'water' || el === 'earth') yin++
    else if (r.def.arcana === 'major') {
      // signos "sem par" dos maiores: Sol, Lua, planetas clássicos
      if (/^Sol$|^Marte$|^J[uú]piter$|^Merc[uú]rio$/.test((r.def.astro ?? '').trim())) yang++
      else if (/^Lua$|^V[eé]n[ui]s$|^Saturno$/.test((r.def.astro ?? '').trim())) yin++
    }
  }

  const defIds = new Set(resolved.map((r) => r.def.id))
  const relations: RelationEdge[] = []
  const adjacency = new Map<string, { to: string; kind: string; strength: number; note: string }[]>()
  for (const r of resolved) {
    for (const rel of r.def.relations ?? []) {
      if (!defIds.has(rel.card)) continue
      const other = input.getCard(rel.card)
      relations.push({
        a: r.def.id,
        b: rel.card,
        aLabel: r.def.name.pt,
        bLabel: other?.name.pt ?? rel.card,
        kind: rel.kind,
        note: rel.note ?? '',
        strength: STRENGTH_BY_KIND[rel.kind] ?? 0.55,
        derived: Boolean(rel.derived),
      })
      const list = adjacency.get(r.def.id) ?? []
      list.push({ to: rel.card, kind: rel.kind, strength: 0.7, note: rel.note ?? '' })
      adjacency.set(r.def.id, list)
    }
  }
  const deduped = new Map<string, RelationEdge>()
  for (const e of relations) {
    const key = [e.a, e.b].sort().join('|') + '|' + e.kind
    const prev = deduped.get(key)
    if (!prev || prev.derived) deduped.set(key, e)
  }
  const relList = [...deduped.values()].sort((x, y) => y.strength - x.strength)

  const chains: Analysis['chains'] = []
  const chainKeys = new Set<string>()
  for (const start of defIds) {
    const firsts = adjacency.get(start) ?? []
    for (const first of firsts) {
      const seconds = adjacency.get(first.to) ?? []
      for (const second of seconds) {
        if (second.to === start) continue
        const key = `${start}>${first.to}>${second.to}`
        if (chainKeys.has(key)) continue
        chainKeys.add(key)
        chains.push({ start, path: [{ from: start, to: first.to, kind: first.kind }, { from: first.to, to: second.to, kind: second.kind }] })
      }
    }
  }

  /* ── escadas numéricas ── */
  const ladders: Analysis['ladders'] = []
  for (const [suit, entries] of bySuitValues) {
    const sorted = entries.slice().sort((a, b) => a.value - b.value)
    let run: { value: number; id: string }[] = []
    for (const entry of sorted) {
      if (run.length && entry.value === run[run.length - 1]!.value + 1) run.push(entry)
      else {
        if (run.length >= 3) ladders.push({ suit: suit as 'wands', cards: run.map((r) => r.id), values: run.map((r) => r.value) })
        run = [entry]
      }
    }
    if (run.length >= 3) ladders.push({ suit: suit as 'wands', cards: run.map((r) => r.id), values: run.map((r) => r.value) })
  }
  const suitRepeats = [...bySuitCards.entries()].filter(([, ids]) => ids.length >= 3).map(([suit, ids]) => ({ suit: suit as 'wands', cards: ids }))

  /* ── numerologia ── */
  const values = resolved.map((r) => cardNumericValue(r.def))
  const sum = values.reduce((s, v) => s + v, 0)
  const valueMap = new Map<number, string[]>()
  resolved.forEach((r, i) => {
    const v = values[i]!
    valueMap.set(v, [...(valueMap.get(v) ?? []), r.def.id])
  })
  const numerologyRepeats = [...valueMap.entries()].filter(([, ids]) => ids.length >= 2).map(([value, cards]) => ({ value, cards }))
  const bySuit = {} as Record<string, { sum: number; count: number }>
  for (const [suit, entries] of bySuitValues) bySuit[suit] = { sum: entries.reduce((s, e) => s + e.value, 0), count: entries.length }
  bySuit.major = { sum: journey.reduce((s, v) => s + v, 0), count: journey.length }

  /* ── ressonância posição ↔ carta ── */
  const resonance: PositionResonance[] = []
  for (const r of resolved) {
    const pos = positionSemantics.find((p) => p.id === r.drawn.positionId)
    if (!pos) continue
    const cardEl = elementForCard(r.def)
    const reasons: string[] = []
    let score = 0
    if (pos.element) {
      if (pos.element === cardEl) {
        score += 2
        reasons.push(`a posição pede ${elName(pos.element)} e a carta é de ${elName(cardEl)}`)
      } else if (
        [['fire', 'air'], ['air', 'earth'], ['earth', 'water'], ['water', 'fire'], ['fire', 'earth'], ['air', 'water']].some(
          ([a, b]) => (a === pos.element && b === cardEl) || (b === pos.element && a === cardEl),
        )
      ) {
        score += 1
        reasons.push(`${elName(cardEl)} alimenta ${elName(pos.element)}, o que a posição pedia, por via indirecta`)
      } else {
        score -= 2
        reasons.push(`a posição pede ${elName(pos.element)}, a carta responde em ${elName(cardEl)}: há tradução a fazer`)
      }
    }
    if (pos.time === 'futuro' && cardEl === 'fire') {
      score += 1
      reasons.push('futuro com fogo: o movimento já começou, falta nomeá-lo')
    }
    if (pos.time === 'passado' && r.def.arcana === 'major' && (r.def.number === 13 || r.def.number === 10)) {
      score += 1
      reasons.push('carta de corte no passado: o que terminou continua a organizar o presente')
    }
    if (pos.focus === 'obstacle' && r.drawn.orientation === 'upright' && /sombra|ilusão|neg|recus/i.test(`${r.def.archetype} ${r.def.meanings.upright}`)) {
      score -= 1
      reasons.push('na casa do obstáculo, uma carta direita pode indicar que o bloqueio está a ser vivido como normal')
    }
    if (pos.focus === 'advice' && r.def.guidance.advice.length) {
      score += 1
      reasons.push('a casa do conselho é respondida pela própria carta, que já traz instrução explícita')
    }
    if (pos.focus === 'hidden' && cardEl === 'water') {
      score += 1
      reasons.push('água na casa do oculto: o que está escondido é sentimento, não facto')
    }
    if (r.drawn.orientation === 'reversed') {
      score -= 1
      reasons.push('invertida: a posição recebe a força da carta em surdina, não em pleno uso')
    }
    if (!reasons.length)
      reasons.push(
        pos.element
          ? `a carta responde ao registo da posição (${elName(cardEl)} contra ${elName(pos.element)}) sem reforço nem atrito`
          : 'a posição não pede elemento nem tempo específicos: a carta é lida no seu sentido corrente',
      )
    const tone: PositionResonance['tone'] = score >= 2 ? 'reforca' : score <= -2 ? 'desafia' : score < 0 ? 'contrasta' : score > 0 ? 'reforca' : 'neutral'
    resonance.push({ positionId: pos.id, cardId: r.def.id, tone, score, reasons })
  }

  /* ── deslocamento temporal ── */
  const fixedish = modality.fixed
  const cardinals = modality.cardinal
  const forwardWeight = positionSemantics.reduce((s, p, i) => {
    const own = resolved[i]?.drawn.positionId === p.id ? 1 : 0
    return s + (p.time === 'futuro' ? 1 : p.time === 'presente' ? 0.5 : p.time === 'passado' ? 0 : 0.5) * own
  }, 0)
  const timePositions = Math.max(1, positionSemantics.filter((p) => p.time !== 'atemporal').length)
  const forwardBias = Math.min(1, forwardWeight / timePositions)
  const pace: TemporalShift['pace'] = cardinals >= fixedish * 1.5 ? 'rapido' : fixedish >= cardinals * 1.5 ? 'lento' : 'moderado'
  const temporal: TemporalShift = {
    pace,
    forwardBias,
    notes: [
      pace === 'rapido'
        ? 'Predomínio de signos cardinais: a situação avança por decisão, não por maturação. Janelas curtas.'
        : pace === 'lento'
          ? 'Predomínio de signos fixos: nada aqui se resolve por pressão. O tempo trabalha a favor de quem sustenta, não de quem acelera.'
          : 'Modalidades equilibradas: o ritmo é o das circunstâncias, nem urgente nem parado.',
      forwardBias > 0.66
        ? 'Mais de dois terços do peso simbólico está projectado para a frente: a tiragem está a responder a "para onde", não a "o que é".'
        : forwardBias < 0.34 && timePositions > 0
          ? 'O peso está no que já aconteceu: há matéria não fechada antes de qualquer projecto fazer sentido.'
          : 'Passado e futuro pesam o mesmo: a leitura é de atravessamento, não de diagnóstico nem de profecia.',
    ],
  }

  /* ── viagem do louco ── */
  const journeySorted = journey.slice().sort((a, b) => a - b)
  const span = journeySorted.length ? journeySorted[journeySorted.length - 1]! - journeySorted[0]! : 0
  const majorNames = new Map(journeySorted.map((n) => [n, resolved.find((r) => r.def.arcana === 'major' && r.def.number === n)?.def.name.pt ?? String(n)]))
  const majorNameFor = (n: number): string => majorNames.get(n) ?? String(n)

  const onlyOneMajor = journeySorted.length === 1
  const journeyLabel = !journeySorted.length
    ? 'sem arcanos maiores'
    : journeySorted[0]! <= 2 && journeySorted[journeySorted.length - 1]! >= 19
      ? 'ciclo quase completo'
      : span > 10
        ? 'percurso longo'
        : span > 4
          ? 'percurso médio'
          : 'foco pontual'
  const stageText = (first: number): string =>
    first <= 6
      ? 'Primeira metade: formação do eu, aprendizagem, primeiros compromissos — o que se constrói ainda aceita forma.'
      : first <= 14
        ? 'Zona moral da viagem: responsabilidade, sacrifício, limite, queda. As escolhas têm custo conhecido.'
        : 'Fim da viagem: sombra, libertação, visão, tempo e fecho. O trabalho é de assunção, não de construção.'
  const journeyDescription = !journeySorted.length
    ? 'Tudo se joga nos arcanos menores: circunstância, acção e relação, sem reconfiguração de identidade. É uma tiragem datada, e deve ser lida como tal.'
    : onlyOneMajor
      ? `Um único arcano maior na mesa (${majorNameFor(journeySorted[0]!)}). ${stageText(journeySorted[0]!)}`
      : `A viagem está na faixa ${journeySorted[0]!}–${journeySorted[journeySorted.length - 1]!}. ${stageText(journeySorted[0]!)}`

  /* ── temas ── */
  const themeCount = new Map<string, string[]>()
  for (const r of resolved) for (const t of r.def.keywords.upright ?? []) themeCount.set(t, [...(themeCount.get(t) ?? []), r.def.id])
  const shared = [...themeCount.entries()].filter(([, ids]) => ids.length >= 2).map(([themeId, cards]) => ({ themeId, score: cards.length / Math.max(1, total), cards }))
  shared.sort((a, b) => b.cards.length - a.cards.length)

  const court = { cards: courtCards, ranks: courtRanks }

  /* ── padrões ── */
  const patterns: Pattern[] = []
  const dominant = (Object.keys(counts) as (keyof typeof counts)[]).sort((a, b) => counts[b] - counts[a])
  const dominantEl = total ? dominant[0]! : null
  const dominantShare = dominantEl ? counts[dominantEl] / total : 0
  const missing = (['fire', 'water', 'air', 'earth'] as const).filter((e) => counts[e] === 0)
  const push = (kind: PatternKind, strength: number, title: string, detail: string, implication: string, cards: string[], positions: string[]) =>
    patterns.push({ kind, strength: Math.max(0, Math.min(1, strength)), title, detail, implication, cards, positions })

  if (dominantEl && dominantShare >= 0.5 && total >= 1) {
    const positions = resonance.filter((r) => resolved.find((x) => x.def.id === r.cardId && elementForCard(x.def) === dominantEl)?.def.id === r.cardId).map((r) => r.positionId)
    push(
      'elemento-dominante',
      dominantShare,
      `Predomínio de ${ELEMENT_PT[dominantEl]}`,
      `${counts[dominantEl]} de ${total} cartas pertencem ao mesmo elemento (${elName(dominantEl)}). A tiragem tem uma língua dominante, o que dá clareza e retira contrapesos.`,
      `Não procures nesta tiragem conselhos em chave de ${missing[0] ? elName(missing[0]) : 'outro elemento'}: eles não estão aqui. O que está é a coerência de ${elName(dominantEl)} — e o seu excesso.`,
      resolved.filter((r) => elementForCard(r.def) === dominantEl).map((r) => r.def.id),
      positions,
    )
  } else if (dominantEl && dominantShare >= 0.4 && total >= 2) {
    push(
      'elemento-dominante',
      dominantShare,
      `Tendência para ${ELEMENT_PT[dominantEl]}`,
      `${counts[dominantEl]} de ${total} cartas em ${ELEMENT_PT[dominantEl]}: há inclinação, não saturação.`,
      `A leitura ganha se o contrapeso for introduzido conscientemente, a partir de ${missing[0] ? elName(missing[0]) : 'um elemento menos representado'}.`,
      resolved.filter((r) => elementForCard(r.def) === dominantEl).map((r) => r.def.id),
      [],
    )
  }
  if (total >= 3 && !missing.length && counts.fire <= 2 && counts.water <= 2 && counts.air <= 2 && counts.earth <= 2) {
    push(
      'equilibrio-elemental',
      0.8,
      'Equilíbrio elemental',
      'Todos os quatro elementos presentes, nenhum acima de metade. A situação tem as quatro linguagens activas ao mesmo tempo.',
      'Tiragens equilibradas raramente indicam "estar tudo bem": indicam que há mais do que uma coisa a pedir decisão em registos diferentes. Lida-las todas de uma vez costuma falhar — ordena-as.',
      resolved.map((r) => r.def.id),
      [],
    )
  }
  if (missing.length && total >= 1) {
    const list = missing.map((e) => elName(e)).join(missing.length > 2 ? ', ' : ' e ')
    push(
      'elemento-ausente',
      0.5 + missing.length * 0.16,
      missing.length === 1 ? `Ausência de ${elName(missing[0]!)}` : `Ausência de ${missing.length} elementos`,
      missing.length === 1
        ? `Nenhuma carta responde em ${elName(missing[0]!)}. O que falta não é defeito da tiragem: é a pergunta em bruto.`
        : `Nenhuma carta responde em ${list}. Um tabuleiro com ${total} posições e só ${4 - missing.length} linguagens activas lê-se como monotonia, não como clareza.`,
      `Há uma ordem de resposta fora da sala. O que falta (${list}) não vai aparecer por revelação: entra por decisão tua. Nomeia tu o que essa ausência está a tapar.`,
      [],
      [],
    )
  }
  if (suits.major >= Math.max(3, Math.ceil(total * 0.5))) {
    push(
      'arcanos-maiores',
      suits.major / Math.max(1, total),
      'Eixo dos arcanos maiores',
      `${suits.major} de ${total} cartas são arcanos maiores. O assunto não é conjuntural: está organizado por temas longos de identidade, compromisso, perda e autoridade interna.`,
      'As decisões práticas pesam menos do que parecem; a recusa em nomear o tema de fundo é o que mantém a situação parada.',
      resolved.filter((r) => r.def.arcana === 'major').map((r) => r.def.id),
      [],
    )
  } else if (suits.major === 0 && total >= 4) {
    push(
      'arcanos-maiores',
      0.4,
      'Nenhum arcano maior',
      `Zero cartas maiores em ${total} posições: o assunto é operativo e datado.`,
      'Ler isto como alívio e não como pobreza. Resolve-se com decisões concretas, não com reconfiguração de vida — e é legítimo dizer exatamente isso ao consulente.',
      [],
      [],
    )
  }
  for (const rep of suitRepeats) {
    push(
      'duplo-triplo-naipe',
      rep.cards.length / Math.max(1, total),
      `${rep.cards.length}× ${SUIT_PT[rep.suit]}`,
      `${rep.cards.length} cartas do mesmo naipe. O tema veio três ou mais vezes: não precisa de ser procurado noutra banda.`,
      `A pergunta útil deixa de ser "o que significa" e passa a ser "o que faço com algo que já se repetiu ${rep.cards.length} vezes".`,
      rep.cards,
      resonance.filter((r) => rep.cards.includes(r.cardId)).map((r) => r.positionId),
    )
  }
  if (court.cards.length >= 2) {
    push(
      'figuras-da-corte',
      court.cards.length / Math.max(1, total),
      `${court.cards.length} figuras da corte`,
      `Concentração de posturas humanas: ${courtRanks.map((r) => ({ page: 'Pajem', knight: 'Cavaleiro', queen: 'Rainha', king: 'Rei' })[r as 'page'] ?? r).join(', ')}. A leitura deixa de ser sobre o que acontece e passa a ser sobre quem age.`,
      !court.cards.length || ladders.length ? 'Há pessoas reais e papéis a nomear; sem sustentação numerada, risco de tudo ser atitude e nada ser substância.' : 'Nomeia as pessoas: cada figura tende a corresponder a um papel concreto à tua volta ou a uma parte tua.',
      court.cards,
      [],
    )
  }
  for (const ladder of ladders) {
    push(
      'sequencia-numerica',
      ladder.values.length / Math.max(1, total),
      `Escada de ${SUIT_PT[ladder.suit]} ${ladder.values.join('–')}`,
      'Valores consecutivos no mesmo naipe: não é repetição, é processo com ordem interna.',
      'Há um degrau por preencher na sequência. Pergunta à tiragem o que falta entre o último número que saiu e o próximo que ainda não está na mesa.',
      ladder.cards,
      [],
    )
  }
  for (const rep of numerologyRepeats.slice(0, 3)) {
    push(
      rep.cards.length >= 3 ? 'numeros-espelhados' : 'numero-repetido',
      rep.cards.length / Math.max(1, total),
      `Número ${rep.value} repetido`,
      `${rep.cards.length} cartas partilham o valor ${rep.value}, em naipes diferentes. O mesmo eixo numérico aparece em vozes distintas.`,
      'O ponto de compressão da tiragem é o tema desse número: tudo o resto é contexto para ele.',
      rep.cards,
      [],
    )
  }
  if (total && reversed.length === total) {
    push('todas-invertidas', 1, 'Tudo invertido', `${total} de ${total} cartas invertidas. Não é má sorte: é ausência total de canal.`, 'Ler de trás para a frente — começar pelo bloqueio e não pelo resultado — e encerrar a sessão com uma única acção pequena.', reversed.map((r) => r.def.id), [])
  } else if (reversed.length && reversed.length / total >= 0.5) {
    push(
      'invertidas-proporcao',
      reversed.length / total,
      'Maioria invertida',
      `${reversed.length} de ${total} cartas saíram invertidas. A energia existe, o canal não.`,
      'Não prometas desenlace: descreve onde está o travão e o que acontece se ele for retirado. O desfecho destas tiragens depende da remoção do obstáculo, não do tempo.',
      reversed.map((r) => r.def.id),
      reversed.map((r) => r.drawn.positionId),
    )
  } else if (!reversed.length && total >= 3) {
    push('todas-normais', 0.5, 'Nenhuma carta invertida', `${total} cartas direitas. As forças estão disponíveis e sem bloqueio declarado.`, 'Tiragem sem invertidas raramente precisa de "tradução": o que falta é decisão, não decifração.', [], [])
  }
  if (aspectByKind.conjunction) {
    push('reforco', Math.min(1, 0.4 + aspectByKind.conjunction * 0.12), `${aspectByKind.conjunction} conjunção(ões) astrológica(s)`, 'Cartas a ocupar o mesmo signo no tabuleiro: dois focos sobrepostos na mesma linguagem.', 'É concentração de sentido e também ponto cego — duas forças iguais no mesmo lugar não se corrigem uma à outra.', [...new Set(aspects.filter((a) => a.kind === 'conjunction').flatMap((a) => [a.a, a.b]))], [])
  }
  const challenge = aspectByKind.square + aspectByKind.opposition
  if (challenge >= Math.max(2, Math.ceil(total / 2))) {
    push(
      'tensao',
      Math.min(1, 0.45 + challenge / Math.max(1, total) / 2),
      `${aspectByKind.square} quadratura(s) e ${aspectByKind.opposition} oposição(ões)`,
      'A tensão não é pontual: é a forma que a situação toma.',
      'Uma decisão que elimine um dos lados vai reproduzir o mesmo impasse. Nomeia o conflito antes de propor a saída.',
      [...new Set(aspects.filter((a) => a.harmony === 'desafio').flatMap((a) => [a.a, a.b]))],
      [],
    )
  }
  const flow = aspectByKind.trine + aspectByKind.sextile
  if (flow >= 2 && challenge === 0) {
    push('complemento', Math.min(1, 0.4 + flow * 0.1), `${flow} aspecto(s) de fluxo sem tensão aparente`, 'Muitos trígonos e sextis, nenhuma quadratura ou oposição. Leitura favorável.', 'Aviso de honestidade: tiragens muito fluidas respondem ao nível mais confortável, não ao mais útil. Acrescenta à conversa a pergunta que a fluidez evita.', [...new Set(aspects.filter((a) => a.harmony === 'fluxo').flatMap((a) => [a.a, a.b]))], [])
  }
  const shadowPair = relList.filter((e) => e.kind === 'sombra' || e.kind === 'tensao')
  if (shadowPair.length) {
    push('sombra', Math.min(1, 0.5 + shadowPair.length * 0.12), 'Pares de sombra na tiragem', `${shadowPair.map((e) => `${e.aLabel} ↔ ${e.bLabel}`).slice(0, 3).join('; ')}: ligações canónicas de inversão entre cartas que saíram juntas.`, 'Estes pares são a mesma força vista de dois lados. Não os leias como cartas independentes: lê-os como uma só frase em duas versões.', [...new Set(shadowPair.flatMap((e) => [e.a, e.b]))], [])
  }
  if (chains.length) {
    const c = chains[0]!
    const names = [c.start, ...c.path.map((p) => p.to)].map((id) => input.getCard(id)?.name.pt ?? id)
    push('ressonancia-de-posicao', 0.75, 'Cadeia de correspondências', `As ligações canónicas encadeiam-se sozinhas: ${names.join(' → ')}. A tiragem tem espinha dorsal própria, anterior a qualquer interpretação.`, 'Segue a cadeia na ordem de leitura; onde ela contradisser a pergunta, é a pergunta que está errada.', [c.start, ...c.path.map((p) => p.to)], [])
  }
  const modalTotal = modality.cardinal + modality.fixed + modality.mutable
  if (modalTotal >= 3) {
    const modalityKeys: ('cardinal' | 'fixed' | 'mutable')[] = ['cardinal', 'fixed', 'mutable']
    const top = modalityKeys.slice().sort((a, b) => modality[b] - modality[a])[0]!
    if (modality[top] / modalTotal >= 0.6)
      push(
        'modalidade-astrolgica',
        modality[top] / modalTotal,
        `Modalidade ${top === 'cardinal' ? 'cardinal' : top === 'fixed' ? 'fixa' : 'mutável'} dominante`,
        `${modality[top]} de ${modalTotal} cartas caem em signos ${top === 'cardinal' ? 'cardinais (início, impulso)' : top === 'fixed' ? 'fixos (sustentação, inércia)' : 'mutáveis (adaptação, dispersão)'}.`,
        top === 'cardinal' ? 'O risco é abrir frentes e não fechar nenhuma.' : top === 'fixed' ? 'A pergunta deixa de ser "o que faço" e passa a ser "o que me recuso a mudar".' : 'Precisas de um compromisso concreto para não dissolver tudo em possibilidades.',
        [],
        [],
      )
  }
  if (yin + yang >= 3) {
    const diff = Math.abs(yin - yang) / (yin + yang)
    push(
      'polaridade-yin-yang',
      0.3 + diff * 0.7,
      `Polaridade ${yin > yang ? 'yin' : yang > yin ? 'yang' : 'equilibrada'} (${yin}/${yang})`,
      diff > 0.45 ? `Assimetria acentuada: ${yin > yang ? 'recepção, interioridade e espera' : 'acção, exterioridade e iniciativa'} dominam.` : 'Yin e yang praticamente equilibrados: nem only espera nem only execução.',
      diff > 0.45 ? (yin > yang ? 'Uma decisão externa concreta precisa de ser tomada — a tiragem não a vai justificar, mas também não a vai adiar.' : 'Algo está a ser forçado; parte do trabalho é reconhecer o que só se resolve parando.') : 'A tiragem permite escolher o registo: lê o conselho como oportunidade e não como obrigação.',
      [],
      [],
    )
  }
  const displaced = resonance.filter((r) => r.tone === 'desafia')
  if (displaced.length) {
    push(
      'deslocamento-temporal',
      Math.min(1, 0.4 + displaced.length / Math.max(1, total) / 2),
      `${displaced.length} posições com registo deslocado`,
      `Em ${displaced.map((d) => input.positions.find((p) => p.id === d.positionId)?.label ?? d.positionId).slice(0, 3).join(', ')} a carta fala uma língua que a posição não esperava.`,
      'O tempo simbólico da tiragem não coincide com o tempo da pergunta: há respostas a chegar cedo demais ou tarde demais. Marca a data em que voltas a ler esta mesma posição.',
      displaced.map((d) => d.cardId),
      displaced.map((d) => d.positionId),
    )
  }
  if (journeySorted.length >= 2) {
    push('caminho-do-tolo', Math.min(1, 0.35 + journeySorted.length * 0.08), `Viagem do Louco: ${journeyLabel}`, journeyDescription, 'As cartas maiores desta tiragem não são conselhos soltos: são etapas. Nomeia em que etapa a pessoa está, não o que cada etapa significa.', journeySorted.map((i) => majorIdByNumber.get(i) ?? `major-${String(i).padStart(2, '0')}`), [])
  }
  const hasMajor = (...nums: number[]) => nums.every((n) => majorIdByNumber.has(n))
  if (hasMajor(0, 21)) {
    push('caminho-do-tolo', 1, 'Louco e Mundo na mesma tiragem', 'Os dois marcos da viagem aparecem juntos: ciclo fechado, não interrompido.', 'O que falta é reconhecimento e passagem, não mais experiência. A carta final raramente é um começo novo — é a decisão de assumir o que já se completou.', [majorIdByNumber.get(0)!, majorIdByNumber.get(21)!], [])
  }
  if (hasMajor(16, 13)) {
    push('tensao', 0.95, 'Torre e Morte juntas', 'Ruptura estrutural e luto simbólico na mesma tiragem.', 'Não é tiragem para acelerar nem para consolar: distingue o que já caiu do que ainda tem de ser largado conscientemente.', [majorIdByNumber.get(16)!, majorIdByNumber.get(13)!], resonance.filter((r) => [majorIdByNumber.get(16), majorIdByNumber.get(13)].includes(r.cardId)).map((r) => r.positionId))
  }

  /* ── combinações (secção C) ── */
  const combinations: CombinationNote[] = []
  const usedPairs = new Set<string>()
  const ordered = resolved.map((r) => r.def.id)
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]!
    const b = ordered[i + 1]!
    const key = [a, b].sort().join('|')
    if (usedPairs.has(key)) continue
    usedPairs.add(key)
    const defA = input.getCard(a)!
    const defB = input.getCard(b)!
    const rel = relList.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))
    const posA = resolved[i]!.drawn.positionId
    const posB = resolved[i + 1]!.drawn.positionId
    const sameEl = elementForCard(defA) === elementForCard(defB)
    const oppositeOrientation = resolved[i]!.drawn.orientation !== resolved[i + 1]!.drawn.orientation
    const kind: CombinationNote['kind'] = rel
      ? rel.kind === 'tensao'
        ? 'tensao'
        : rel.kind === 'sombra'
          ? 'sombra'
          : rel.kind === 'continuidade'
            ? 'sequencia'
            : rel.kind === 'espelho'
              ? 'espelho'
              : rel.kind === 'complementa'
                ? 'complemento'
                : 'reforco'
      : sameEl && !oppositeOrientation
        ? 'reforco'
        : sameEl
          ? 'espelho'
          : 'complemento'
    combinations.push({
      cards: [a, b],
      positions: [posA, posB],
      kind,
      note:
        rel?.note?.trim() ||
        (kind === 'reforco'
          ? `${defA.name.pt} e ${defB.name.pt} reforçam-se: mesma direção, menos necessidade de cautela na interpretação.`
          : kind === 'tensao'
            ? `${defA.name.pt} puxa para ${elementForCard(defA)}, ${defB.name.pt} puxa para ${elementForCard(defB)}. O par não se resolve por média: exige escolha explícita.`
            : kind === 'sombra'
              ? `${defB.name.pt} mostra o que ${defA.name.pt} não admite. Lê o segundo como o custo do primeiro.`
              : kind === 'sequencia'
                ? `As duas cartas são degraus: ${defA.name.pt} antecede ${defB.name.pt}, e a ordem não é trocável.`
                : kind === 'espelho'
                  ? `${defA.name.pt} e ${defB.name.pt} são a mesma força em duas posições da vida. Uma delas está a ser vista de fora.`
                  : `${defA.name.pt} e ${defB.name.pt} cobrem necessidades diferentes; juntas, dizem que o pedido não é um só.`),
    })
  }

  patterns.sort((a, b) => b.strength - a.strength)
  const crossSignals = relList.length + aspects.length + ladders.length + suitRepeats.length + numerologyRepeats.length
  const signalDensity = crossSignals / Math.max(4, total * 1.4)
  const coherence = Math.max(0.12, Math.min(1, 0.28 + signalDensity * 0.34 - Math.max(0, 3 - total) * 0.1))

  if (total < 3) warnings.push('tiragem com menos de 3 cartas: padrões globais pouco fiáveis, privilegiar leitura posicional')
  if (total >= 8 && relList.length === 0) warnings.push('nenhuma relação canónica entre as cartas retiradas: as ligações apresentadas são inferidas por elemento/número')

  return {
    counts: { cards: total, majors: suits.major, minors: total - suits.major, reversed: reversed.length },
    suits,
    elementBalance,
    elementByPosition,
    aspects,
    aspectByKind,
    modality,
    polarity: { yin, yang },
    relations: relList,
    chains,
    suitRepeats,
    ladders,
    court: { cards: courtCards, ranks: courtRanks },
    numerology: { sum, reduced: reduceToDigit(sum), repeats: numerologyRepeats, bySuit },
    reversalRatio: total ? reversed.length / total : 0,
    resonance,
    temporal,
    journey: { label: journeyLabel, indices: journeySorted, description: journeyDescription },
    themes: shared,
    patterns,
    combinations,
    warnings,
    coherence,
  }
}

export type { ElementBalance }
