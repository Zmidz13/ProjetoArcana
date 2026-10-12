/**
 * ARCANA — Modelo de domínio canónico.
 *
 * Este ficheiro é a única fonte de verdade para as formas dos dados.
 * Nada na aplicação deve inventar campos à margem daqui:
 *  - `content/pt-PT/**` produz `CardDraft` / `SpreadDraft`
 *  - `scripts/build-content.ts` valida com Zod e emite `data/*.json`
 *  - `src/engine`, `src/ai`, `src/app` consomem os tipos abaixo
 */

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'
export type Arcana = 'major' | 'minor'
export type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit'
export type Orientation = 'upright' | 'reversed'

export type Rank =
  | 'ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king'

/** Relações simbólicas estáticas usadas pelo motor determinístico. */
export type RelationKind =
  | 'reforca'
  | 'tensao'
  | 'espelho'
  | 'sombra'
  | 'complementa'
  | 'continuidade'

/** Camadas de composição da ilustração (o motor de arte é procedural e determinístico). */
export type SkyLayer =
  | 'void'
  | 'astral'
  | 'dawn'
  | 'dusk'
  | 'storm'
  | 'day'
  | 'night'
  | 'overcast'
  | 'underworld'
export type TerrainLayer =
  | 'cliff'
  | 'plain'
  | 'water'
  | 'ruins'
  | 'garden'
  | 'mountain'
  | 'interior'
  | 'path'
  | 'sea'
  | 'forest'
  | 'city'
  | 'sky'
  | 'desert'
  | 'cave'
  | 'camp'
  | 'field'
  | 'orchard'
  | 'bridge'

/** Glifos simbólicos desenhados pelo motor de arte. 1 arquivo = 1 vetor próprio. */
export type GlyphKey =
  | 'anchor'
  | 'angel-fixed'
  | 'angel-wing'
  | 'ape'
  | 'arch-temple'
  | 'arm-two'
  | 'armor'
  | 'arrow'
  | 'arrow-loosed'
  | 'aura-circle'
  | 'bag-empty'
  | 'bandage-head'
  | 'banner-red'
  | 'bare-branch'
  | 'bare-tree'
  | 'bed-frame'
  | 'bell'
  | 'bird-pair'
  | 'birds-flock'
  | 'bishop-kneeling'
  | 'black-cat'
  | 'blindfold'
  | 'boar'
  | 'boat-small'
  | 'book-open'
  | 'bow'
  | 'bread-loaf'
  | 'bridge'
  | 'bridge-stone'
  | 'bull-fixed'
  | 'burden-frame'
  | 'butterfly'
  | 'caduceus'
  | 'cage-frame'
  | 'calf'
  | 'camp-tents'
  | 'candle'
  | 'candle-low'
  | 'cart-wheel'
  | 'castle-small'
  | 'cat'
  | 'cauldron'
  | 'chain'
  | 'chain-broken'
  | 'chalice'
  | 'chalice-spill'
  | 'chariot-starband'
  | 'child-naked'
  | 'children-pair'
  | 'chisel-tools'
  | 'city-houses'
  | 'cliff-edge'
  | 'cloak-hood'
  | 'cloud-band'
  | 'cluster-grapes'
  | 'coin-single'
  | 'coin-stack'
  | 'column'
  | 'compass'
  | 'cord-bind'
  | 'crayfish'
  | 'crescent-moon'
  | 'cross-flag'
  | 'crow'
  | 'crowd-figures'
  | 'crown'
  | 'crown-falling'
  | 'crown-lunar'
  | 'crown-solar'
  | 'crown-thorn'
  | 'crutch'
  | 'cup-empty'
  | 'cup-wand'
  | 'curtain'
  | 'curtain-arch'
  | 'cushion'
  | 'dancer-four'
  | 'death-skeleton'
  | 'devil-horned'
  | 'dog'
  | 'dog-howl'
  | 'dog-two'
  | 'dolphin-pair'
  | 'door-arch'
  | 'dove'
  | 'dragon-shape'
  | 'drum'
  | 'dust-cloud'
  | 'eagle'
  | 'eagle-sun'
  | 'eight-blades-flight'
  | 'eight-coin-wall'
  | 'eight-standing-wands'
  | 'emperor-seat'
  | 'empress-throne'
  | 'eye-providence'
  | 'falcon'
  | 'feather'
  | 'fig-tree'
  | 'figure-falling'
  | 'figure-kneeling'
  | 'figure-reaching'
  | 'figure-standing'
  | 'figure-walking'
  | 'fish-hook'
  | 'fish-two'
  | 'five-crossed-staves'
  | 'five-wounds'
  | 'flame-pair'
  | 'flame-single'
  | 'flame-three'
  | 'flower-jar'
  | 'fool-bindle'
  | 'fortress'
  | 'four-coin-guard'
  | 'four-cups-row'
  | 'fox'
  | 'garden-walled'
  | 'gargoyle-blanket'
  | 'gate'
  | 'globe'
  | 'grape-cluster'
  | 'greek-cross'
  | 'greyhound'
  | 'gull'
  | 'hammer'
  | 'hand-offering'
  | 'hand-two'
  | 'hanged-man'
  | 'harp'
  | 'harvest-basket'
  | 'hat-veil'
  | 'heart-open'
  | 'heart-venus'
  | 'hermit-lantern'
  | 'heron-on-tree'
  | 'hierophant-keys'
  | 'highpriestess-veil'
  | 'horse'
  | 'hourglass'
  | 'house-small'
  | 'ibis'
  | 'ibis-moon'
  | 'infinity-top'
  | 'jar-three'
  | 'jewel-cluster'
  | 'judgement-trumpet'
  | 'key-old'
  | 'kneeler'
  | 'kneeling-figures'
  | 'labyrinth'
  | 'lamp-oil'
  | 'lantern-dark'
  | 'laurel-wreath'
  | 'legs-crossed'
  | 'lid-lifted'
  | 'lightning-bolt'
  | 'lily'
  | 'lion-cub'
  | 'lion-fixed'
  | 'loom'
  | 'lotus'
  | 'lotus-bud'
  | 'lovers-sun'
  | 'lyre'
  | 'magician-table'
  | 'market-stall'
  | 'mask-theatre'
  | 'mirror'
  | 'moon-pool'
  | 'moth'
  | 'mountain-peak'
  | 'net'
  | 'nine-blades-bed'
  | 'nine-coin-vines'
  | 'nine-cups-shelf'
  | 'old-figure'
  | 'olive-branch'
  | 'open-tomb'
  | 'owl'
  | 'ox-head'
  | 'ox-yoke'
  | 'palm-frond'
  | 'path-crossroads'
  | 'path-straight'
  | 'path-triple'
  | 'path-winding'
  | 'pentacle-coin'
  | 'pentacle-throne'
  | 'phoenix'
  | 'pillar-single'
  | 'pillars-pair'
  | 'plough'
  | 'pomegranate'
  | 'pool-reflection'
  | 'purse'
  | 'quiver'
  | 'rabbit'
  | 'rain-lines'
  | 'rainbow-arc'
  | 'ram-head'
  | 'raven'
  | 'reeds'
  | 'retreating-figures'
  | 'ribbon'
  | 'ring'
  | 'rising-figures'
  | 'river-band'
  | 'rock-shore'
  | 'rope-knot'
  | 'rose'
  | 'rose-cross'
  | 'rose-window'
  | 'ruins-low'
  | 'salamancaite'
  | 'salamander'
  | 'salt-cellar'
  | 'scales-empty'
  | 'scales-libra'
  | 'scepter'
  | 'scroll'
  | 'scythe-blade'
  | 'serpent-coil'
  | 'serpent-double'
  | 'serpent-eagle'
  | 'seven-blades'
  | 'shell'
  | 'shield'
  | 'ship'
  | 'shovel'
  | 'six-coin-circle'
  | 'six-pentacles'
  | 'six-standing-blades'
  | 'snake-alpha'
  | 'snowdrift'
  | 'sphinx-pair'
  | 'spiral'
  | 'staff-bud'
  | 'staff-six'
  | 'stained-glass'
  | 'stained-window'
  | 'stair-spiral'
  | 'star-eight'
  | 'star-five'
  | 'star-guide'
  | 'still-water'
  | 'stones-three'
  | 'storm-cloud'
  | 'street-view'
  | 'strength-lion'
  | 'sun-disc'
  | 'sun-half'
  | 'sun-rays'
  | 'sunflower'
  | 'swan'
  | 'sword-blade'
  | 'sword-oar'
  | 'sword-raised'
  | 'sword-throne'
  | 'tempest-sea'
  | 'ten-blades-cross'
  | 'ten-coin-gate'
  | 'throne-cup'
  | 'torch'
  | 'torch-low'
  | 'tower-broken'
  | 'tower-intact'
  | 'towers-trio'
  | 'tree-dead'
  | 'tree-living'
  | 'triple-crown'
  | 'tripod'
  | 'tunic-leaf'
  | 'tunic-scallop'
  | 'twin-faces'
  | 'two-shrouded-figures'
  | 'unicorn'
  | 'urn'
  | 'veil-figure'
  | 'vine'
  | 'vine-leaf'
  | 'wall-brick'
  | 'wall-stone'
  | 'walled-garden'
  | 'wand-bud'
  | 'wand-throne'
  | 'water-jar'
  | 'water-lily'
  | 'wave-line'
  | 'well'
  | 'wheat'
  | 'wheat-sheaf'
  | 'wheel-eight'
  | 'white-horse'
  | 'white-rose-shield'
  | 'wind-lines'
  | 'window-round'
  | 'wine-skin'
  | 'winged-figure'
  | 'winged-lion'
  | 'workbench'
  | 'world-wreath'

/** Posição de uma carta na mesa: coordenadas normalizadas 0..1 (x,y), rotação em graus, escala. */
export interface SpreadPosition {
  id: string
  label: string
  description: string
  /** O que a posição pede quando a carta sai invertida (tiragens do utilizador). */
  meaningWhenReversed?: string
  x: number
  y: number
  rotation?: number
  scale?: number
  /** Grupo visual (ex.: coluna do passado). Usado para animações e realces. */
  group?: string
  /** Ligações interpretativas para render de arcos/linhas de energia. */
  links?: string[]
  /** Se true a posição aceita/recomenda leitura invertida. */
  allowReversed?: boolean
}

export type SpreadCategory =
  | 'rapida'
  | 'tres'
  | 'amor'
  | 'autoconhecimento'
  | 'profissional'
  | 'avancada'
  | 'ritual'
  | 'personalizada'

export type SpreadShape =
  | 'row'
  | 'column'
  | 'cross'
  | 'greek-cross'
  | 'celtic-cross'
  | 'horseshoe'
  | 'circle'
  | 'mandala'
  | 'triangle'
  | 'pyramid'
  | 'tree'
  | 'star'
  | 'wheel'
  | 'timeline'
  | 'grid'
  | 'table'
  | 'mirror'
  | 'path'
  | 'freeform'

export interface SpreadThemeWeight {
  /** Peso temático 0..1 usado para sugerir tiragens a partir da pergunta. */
  theme: string
  weight: number
}

export interface SpreadDef {
  id: string
  name: string
  category: SpreadCategory
  shape: SpreadShape
  summary: string
  purpose: string
  whenToUse: string
  cardCount: number
  positions: SpreadPosition[]
  /** Sequência de leitura recomendada (ids de posição). */
  readingOrder: string[]
  /** Narrativa estrutural: como o motor deve agrupar posições. */
  structure?: {
    kind: 'linear' | 'paired' | 'nested' | 'radial' | 'temporal' | 'elemental'
    blocks: { id: string; label: string; positions: string[]; note?: string }[]
  }
  tags: string[]
  /** Tempo estimado de leitura em minutos (para o UI e para o modo ritual). */
  estimatedMinutes: number
  cinematic: 'baixo' | 'medio' | 'alto' | 'ritual'
  difficulty: 'iniciante' | 'intermedio' | 'avancado'
  author: 'arcana' | 'tradicional' | 'utilizador'
  /** Algumas tiragens desaconselham invertidas (ex.: leitura somente de maiores). */
  allowReversed?: boolean
  /** Foco temático para sugestão automática. */
  themes?: SpreadThemeWeight[]
  /** Layout específico em mobile (grade adaptada) — obrigatório para > 4 cartas. */
  mobileLayout?: {
    shape: 'stack' | 'grid-2' | 'grid-3' | 'carousel' | 'column'
    pageGroups?: { label: string; positions: string[] }[]
  }
  requiresAccounts?: boolean
}

export interface CardDef {
  id: string
  arcana: Arcana
  suit: Suit | null
  number: number
  rank: Rank | null
  name: { pt: string; intl: string }
  archetype: string
  element: Element
  astro: string | null
  /** Título ritual da Golden Dawn (Livro T), quando aplicável. */
  gdTitle?: string
  traditionNote: string | null
  keywords: { upright: string[]; reversed: string[] }
  history: string
  meanings: { upright: string; reversed: string }
  domains: {
    psychology: string
    emotional: string
    love: string
    career: string
    finances: string
    growth: string
    spirituality: string
  }
  guidance: {
    obstacles: string
    opportunities: string
    advice: string[]
    reflection: string[]
  }
  relations: { card: string; kind: RelationKind; note: string; derived?: boolean }[]
  art: {
    scene: string
    sky: SkyLayer
    terrain: TerrainLayer
    glyphs: GlyphKey[]
    palette: [string, string, string]
    motifs: string[]
    reading: string[]
  }
  a11y: { alt: string; long: string }
  sources: string[]
}

export interface DrawnCard {
  positionId: string
  cardId: string
  orientation: Orientation
  /** Índice original da carta no baralho antes do corte/embaralhamento. */
  deckIndex: number
  /** Índice da posição na ordem de leitura (replay, animação, alt-text). */
  positionIndex?: number
  seed: number
}

export interface RitualState {
  spreadId: string
  question: string
  seed: number
  shuffleAlgorithm: ShuffleAlgorithm
  cuts: number
  drawn: DrawnCard[]
  allowReversed: boolean
  allowMajorArcanaOnly: boolean
}

export type ShuffleAlgorithm =
  | 'tradicional'
  | 'riffle'
  | 'overhand'
  | 'leque'
  | 'circular'
  | 'mistico'

/**
 * Formato de autoria (plano) das cartas. É convertido para `CardDef` por
 * `scripts/build-content.ts`, que agrupa `domains` e `guidance`.
 * Manter os dois em sincronia: o schema Zod (src/domain/schema.ts) valida o resultado.
 */
export interface CardSource extends Omit<CardDef, 'domains' | 'guidance'> {
  psychology: string
  emotional: string
  love: string
  career: string
  finances: string
  growth: string
  spirituality: string
  obstacles: string
  opportunities: string
  advice: string[]
  reflection: string[]
}
