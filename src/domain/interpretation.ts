/** Tipos da camada de interpretação (motor simbólico + motor de linguagem). */

import type { Element, Orientation, Suit } from './types.ts'

export type Depth = 'breve' | 'normal' | 'profunda' | 'muito-profunda'
export type Register =
  | 'narrativa'
  | 'psicologica'
  | 'espiritual'
  | 'pratica'
  | 'tradicional'
  | 'poetica'
export type VoiceKey = 'mistica' | 'acolhedora' | 'direta' | 'sabia' | 'poetica' | 'analitica'

export const DEPTHS: Depth[] = ['breve', 'normal', 'profunda', 'muito-profunda']
export const REGISTERS: Register[] = [
  'narrativa',
  'psicologica',
  'espiritual',
  'pratica',
  'tradicional',
  'poetica',
]
export const VOICES: VoiceKey[] = [
  'mistica',
  'acolhedora',
  'direta',
  'sabia',
  'poetica',
  'analitica',
]

export type PatternKind =
  | 'elemento-dominante'
  | 'elemento-ausente'
  | 'equilibrio-elemental'
  | 'arcanos-maiores'
  | 'figuras-da-corte'
  | 'sequencia-numerica'
  | 'numero-repetido'
  | 'numeros-espelhados'
  | 'reforco'
  | 'tensao'
  | 'sombra'
  | 'complemento'
  | 'invertidas-proporcao'
  | 'todas-normais'
  | 'todas-invertidas'
  | 'modalidade-astrolgica'
  | 'polaridade-yin-yang'
  | 'deslocamento-temporal'
  | 'ressonancia-de-posicao'
  | 'caminho-do-tolo'
  | 'duplo-triplo-naipe'

export interface Pattern {
  kind: PatternKind
  /** forca 0..1 — alimenta destaques visuais e a síntese. */
  strength: number
  cards: string[]
  positions: string[]
  title: string
  detail: string
  /** Implicação prática para a leitura. */
  implication: string
}

export interface ElementBalance {
  fire: number
  water: number
  air: number
  earth: number
  spirit: number
  total: number
}

export interface PositionReading {
  positionId: string
  positionLabel: string
  cardId: string
  cardName: string
  orientation: Orientation
  /** Núcleo simbólico escolhido pelo motor a partir da base de dados. */
  core: string
  /** Como a posição modula o significado. */
  positionModulation: string
  /** Relação com a pergunta do utilizador. */
  questionLink: string
  /** Emoções/padrões representados. */
  emotion: string
  obstacle: string
  opportunity: string
  advice: string
  /** Frases sobre vizinhos diretos na ordem de leitura. */
  connections: string[]
}

export interface CombinationNote {
  cards: [string, string]
  positions: [string, string]
  kind: 'reforco' | 'tensao' | 'sombra' | 'complemento' | 'espelho' | 'sequencia'
  note: string
}

export interface Interpretation {
  schemaVersion: 1
  spreadId: string
  spreadName: string
  title: string
  question: string
  /** A. Abertura */
  opening: string
  /** Dominant theme of the spread. */
  dominantTheme: string
  /** B. Interpretação individual */
  perCard: PositionReading[]
  /** C. Análises de combinações */
  combinations: CombinationNote[]
  /** C. Padrões simbólicos globais */
  patterns: Pattern[]
  elementBalance: ElementBalance
  majorsCount: number
  reversedCount: number
  /** D. Síntese narrativa */
  synthesis: string[]
  /** E. Orientações práticas */
  practical: string[]
  /** F. Perguntas de reflexão */
  reflection: string[]
  /** G. Mensagem final */
  closing: string
  /** Avisos éticos obrigatórios (saúde, legal, financeiro). */
  disclaimers: string[]
  meta: {
    generator: 'local' | 'llm'
    model?: string
    provider?: string
    tokensIn?: number
    tokensOut?: number
    costUsd?: number
    latencyMs?: number
    depth: Depth
    register: Register
    voice: VoiceKey
    language: string
    /** Hash determinístico do contexto (para cache e para provar reprodutibilidade). */
    contextHash: string
  }
}

export interface ReadingContext {
  question: string
  themeHint?: string
  spread: { id: string; name: string; category: string; summary: string; structure?: unknown }
  positions: { id: string; label: string; description: string; group?: string }[]
  cards: {
    positionId: string
    cardId: string
    name: string
    orientation: Orientation
    suit: Suit | null
    arcana: 'major' | 'minor'
    number: number
    element: Element
  }[]
  depth: Depth
  register: Register
  voice: VoiceKey
  language: string
  history?: { date: string; question: string; summary: string }[]
}
