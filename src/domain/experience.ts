import { z } from 'zod'

import { DEPTHS, REGISTERS, VOICES, type Depth, type Register, type VoiceKey } from '@/domain/interpretation.ts'
import { SHUFFLE_ALGORITHMS } from '@/domain/schema.ts'
import type { ShuffleAlgorithm } from '@/domain/types.ts'

/**
 * Registo das experiências sensoriais (ambientes, música, efeitos sonoros, partículas).
 *
 * Tudo o que aqui está é *gerado por código* no cliente (Web Audio + Canvas/WebGL): não há
 * ficheiros de áudio nem bibliotecas de terceiros, o que cumpre a exigência de material
 * original e licenciado. Cada ambiente define a sua paleta, o preset de VFX e a receita de
 * ambulência; cada efeito tem a sua própria receita sintetizada — nenhuma acção reutiliza o
 * som de outra.
 */

export const ENVIRONMENTS = [
  'templo',
  'jardim-noturno',
  'lareira',
  'observatorio',
  'praia-lunar',
  'biblioteca',
  'montanha',
] as const

export type EnvironmentKey = (typeof ENVIRONMENTS)[number]

export interface EnvironmentDef {
  key: EnvironmentKey
  name: string
  subtitle: string
  /** Cor base do fundo e da iluminação da mesa. */
  palette: { base: string; glow: string; metal: string; smoke: string }
  /** Receita de ambulência (síntese generativa, ver src/audio/engine.ts). */
  ambience: {
    root: number
    scale: number[]
    pad: 'cordas' | 'sino' | 'flauta' | 'drone' | 'harpa'
    texture: 'vento' | 'agua' | 'fogo' | 'grilos' | 'relogio' | 'sino-ao-longe' | 'sala-oca'
    density: number
    brightness: number
  }
  vfx: { particles: 'poeira' | 'fascas' | 'vaga-lumes' | 'estrelas' | 'espuma' | 'neve' | 'incenso'; intensity: number; drift: number }
  reverbSeconds: number
  description: string
}

export const ENVIRONMENT_LIST: EnvironmentDef[] = [
  {
    key: 'templo',
    name: 'Templo de Obsidiana',
    subtitle: 'pedra fria, velas, silêncio que escuta',
    palette: { base: '#0b0a12', glow: '#c9a227', metal: '#8d7b4e', smoke: '#2a2440' },
    ambience: { root: 110, scale: [0, 2, 7, 9, 12], pad: 'cordas', texture: 'sala-oca', density: 0.35, brightness: 0.32 },
    vfx: { particles: 'incenso', intensity: 0.55, drift: 0.25 },
    reverbSeconds: 3.4,
    description: 'A sala original: pedra escura, um círculo de velas, a voz a chegar devolvida pelas paredes.',
  },
  {
    key: 'jardim-noturno',
    name: 'Jardim Noturno',
    subtitle: 'relva húmida, grilos, lua baixa',
    palette: { base: '#06110d', glow: '#8fe3c0', metal: '#6f8f7d', smoke: '#0f2a20' },
    ambience: { root: 146.83, scale: [0, 3, 5, 7, 10], pad: 'flauta', texture: 'grilos', density: 0.5, brightness: 0.45 },
    vfx: { particles: 'vaga-lumes', intensity: 0.7, drift: 0.4 },
    reverbSeconds: 1.6,
    description: 'Ao ar livre: o barulho da erva e dos insectos, as cartas pousadas numa mesa de pedra.',
  },
  {
    key: 'lareira',
    name: 'Lareira',
    subtitle: 'madeira a arder, lã, meia-noite doméstica',
    palette: { base: '#150a06', glow: '#ff8a3d', metal: '#c98a4b', smoke: '#3a1a0d' },
    ambience: { root: 98, scale: [0, 2, 4, 7, 9], pad: 'drone', texture: 'fogo', density: 0.6, brightness: 0.4 },
    vfx: { particles: 'fascas', intensity: 0.8, drift: 0.55 },
    reverbSeconds: 0.9,
    description: 'Sala pequena e quente. A leitura acontece quase ao de leve, com o fogo a responder.',
  },
  {
    key: 'observatorio',
    name: 'Observatório',
    subtitle: 'cúpula aberta, relógios, cartas de céu',
    palette: { base: '#060a17', glow: '#7fb2ff', metal: '#93a6c4', smoke: '#101a33' },
    ambience: { root: 130.81, scale: [0, 2, 5, 7, 11], pad: 'sino', texture: 'relogio', density: 0.3, brightness: 0.55 },
    vfx: { particles: 'estrelas', intensity: 0.75, drift: 0.12 },
    reverbSeconds: 2.2,
    description: 'O tecto abre-se. Lê-se com a carta celeste em cima da mesa e o tic-tac do mecanismo.',
  },
  {
    key: 'praia-lunar',
    name: 'Praia Lunar',
    subtitle: 'mar calmo, areia escura, maré a subir',
    palette: { base: '#04121a', glow: '#bfe9ff', metal: '#79a8b8', smoke: '#0b2733' },
    ambience: { root: 123.47, scale: [0, 2, 7, 10, 12], pad: 'harpa', texture: 'agua', density: 0.65, brightness: 0.38 },
    vfx: { particles: 'espuma', intensity: 0.6, drift: 0.7 },
    reverbSeconds: 2.6,
    description: 'A mesa é uma pedra junto à água; as cartas viram-se com o mesmo ritmo das ondas.',
  },
  {
    key: 'biblioteca',
    name: 'Biblioteca',
    subtitle: 'papel, tinta, prateleiras altas',
    palette: { base: '#100b06', glow: '#e0b567', metal: '#a58a5f', smoke: '#241a10' },
    ambience: { root: 87.31, scale: [0, 2, 3, 7, 8], pad: 'cordas', texture: 'sala-oca', density: 0.22, brightness: 0.3 },
    vfx: { particles: 'poeira', intensity: 0.65, drift: 0.2 },
    reverbSeconds: 1.2,
    description: 'Leitura de estudo: o barulho das páginas a virar acompanha a interpretação secção a secção.',
  },
  {
    key: 'montanha',
    name: 'Montanha',
    subtitle: 'vento alto, sinos ao longe, pedra e gelo',
    palette: { base: '#0a1016', glow: '#ffe6b0', metal: '#9fb2c0', smoke: '#182a36' },
    ambience: { root: 164.81, scale: [0, 5, 7, 12, 17], pad: 'drone', texture: 'sino-ao-longe', density: 0.28, brightness: 0.6 },
    vfx: { particles: 'neve', intensity: 0.7, drift: 0.9 },
    reverbSeconds: 4.2,
    description: 'O ar é fino e o silêncio é grande. As cartas assentam com peso, sem pressa.',
  },
]

export const ENVIRONMENTS_BY_KEY: Record<EnvironmentKey, EnvironmentDef> = Object.fromEntries(ENVIRONMENT_LIST.map((e) => [e.key, e])) as Record<EnvironmentKey, EnvironmentDef>

export function requireEnvironment(key: string | null | undefined): EnvironmentDef {
  return (key && ENVIRONMENTS_BY_KEY[key as EnvironmentKey]) || ENVIRONMENTS_BY_KEY.templo!
}

/* ─────────────────────────── efeitos sonoros ─────────────────────────── */

export const SFX_LIST = [
  { key: 'shuffle-start', name: 'Início do baralhar', recipe: 'rajada de papel seco, ataque curto, ruído filtrado em banda larga', durationMs: 260 },
  { key: 'shuffle-loop', name: 'Baralhar contínuo', recipe: 'sequência de 8 farfalhares com espaçamento irregular', durationMs: 1400 },
  { key: 'riffle', name: 'Dente a dente', recipe: 'dentes de serra metálica com ressonância de caixa', durationMs: 700 },
  { key: 'overhand', name: 'Monte sobre monte', recipe: 'blocos de cartas a cair em monte, grave e surdo', durationMs: 520 },
  { key: 'fan-open', name: 'Leque a abrir', recipe: 'rasgo contínuo com filtros a subir de corte', durationMs: 620 },
  { key: 'cut', name: 'Corte do baralho', recipe: 'impacto de bloco + rebate na mesa', durationMs: 220 },
  { key: 'deal', name: 'Carta distribuída', recipe: 'deslize no feltro seguido de toque seco', durationMs: 300 },
  { key: 'pick', name: 'Carta escolhida', recipe: 'toque de madeira com cauda de sino', durationMs: 420 },
  { key: 'flip', name: 'Carta virada', recipe: 'virar de papel com micro-reverb', durationMs: 360 },
  { key: 'flip-reversed', name: 'Invertida', recipe: 'mesma viragem, afinada uma quinta abaixo e mais escura', durationMs: 460 },
  { key: 'hover', name: 'Sobreposição', recipe: 'tique de veludo (click atenuado)', durationMs: 90 },
  { key: 'select', name: 'Selecção confirmada', recipe: 'toque duplo em madeira', durationMs: 150 },
  { key: 'drag-start', name: 'Arrastar', recipe: 'fricção curta ascendente', durationMs: 180 },
  { key: 'drop', name: 'Larga', recipe: 'queda com ressonância de cavidade', durationMs: 240 },
  { key: 'confirm', name: 'Ritual fechado', recipe: 'taça tibetana (sino com batimento)', durationMs: 2200 },
  { key: 'reveal', name: 'Revelação', recipe: 'crescendo de cordas + sino grave', durationMs: 1500 },
  { key: 'moon-chime', name: 'Marca lunar', recipe: 'três sinos afinados pela fase da Lua', durationMs: 1200 },
  { key: 'sabbat-bell', name: 'Sino do sabbat', recipe: 'sino duplo com batimento lento', durationMs: 2600 },
  { key: 'error', name: 'Falha', recipe: 'madeira dissonante, sem cauda', durationMs: 340 },
  { key: 'stream-tick', name: 'Texto a chegar', recipe: 'grão muito curto, aleatório em altura', durationMs: 60 },
  { key: 'toggle', name: 'Interruptor', recipe: 'clique de chave de latão', durationMs: 120 },
] as const

export type SfxKey = (typeof SFX_LIST)[number]['key']
export const SFX_KEYS = SFX_LIST.map((s) => s.key) as SfxKey[]
export const SFX_BY_KEY: Record<SfxKey, (typeof SFX_LIST)[number]> = Object.fromEntries(SFX_LIST.map((s) => [s.key, s])) as Record<SfxKey, (typeof SFX_LIST)[number]>

/* ─────────────────────────── preferências ─────────────────────────── */

export const PreferencesSchema = z.object({
  voice: z.enum(VOICES as unknown as [VoiceKey, ...VoiceKey[]]).default('mistica'),
  register: z.enum(REGISTERS as unknown as [Register, ...Register[]]).default('narrativa'),
  depth: z.enum(DEPTHS as unknown as [Depth, ...Depth[]]).default('normal'),
  allowReversed: z.boolean().default(true),
  algorithm: z.enum(SHUFFLE_ALGORITHMS as unknown as [ShuffleAlgorithm, ...ShuffleAlgorithm[]]).default('riffle'),
  cuts: z.number().int().min(0).max(3).default(1),
  drawMode: z.enum(['topo', 'fundo', 'alternado']).default('topo'),
  environment: z.enum(ENVIRONMENTS).default('templo'),
  theme: z.enum(['noite', 'crepusculo', 'claro']).default('noite'),
  dailySalt: z.string().max(40).default(''),
  audio: z
    .object({
      enabled: z.boolean().default(true),
      ambience: z.number().min(0).max(1).default(0.5),
      effects: z.number().min(0).max(1).default(0.75),
      autoplay: z.boolean().default(false),
    })
    .default({}),
  motion: z
    .object({
      respectSystem: z.boolean().default(true),
      forceReduced: z.boolean().default(false),
      speed: z.number().min(0.4).max(2).default(1),
      vfx: z.number().min(0).max(1).default(0.7),
    })
    .default({}),
  accessibility: z
    .object({
      highContrast: z.boolean().default(false),
      largeText: z.boolean().default(false),
      captions: z.boolean().default(true),
      keyboardHints: z.boolean().default(true),
      reduceFlashes: z.boolean().default(true),
    })
    .default({}),
  ai: z
    .object({
      useLlm: z.boolean().default(true),
      shareContext: z.boolean().default(true),
      dailyBudgetUsd: z.number().min(0).max(50).default(1),
      maxOutputTokens: z.number().int().min(256).max(8192).default(2048),
    })
    .default({}),
  deckId: z.string().max(64).nullable().default(null),
  pinnedSpreadIds: z.array(z.string().max(64)).max(12).default([]),
})

export type Preferences = z.infer<typeof PreferencesSchema>

export const DEFAULT_PREFERENCES: Preferences = PreferencesSchema.parse({})

/** Nunca rebenta com preferências antigas/parciais: o que faltar volta ao padrão. */
export function mergePreferences(stored: unknown): Preferences {
  const parsed = PreferencesSchema.safeParse(stored ?? {})
  if (parsed.success) return parsed.data
  const partial = PreferencesSchema.partial().safeParse(stored ?? {})
  return { ...DEFAULT_PREFERENCES, ...(partial.success ? (partial.data as object) : {}) } as Preferences
}

export const VOICE_DESCRIPTIONS: Record<string, string> = {
  mistica: 'Linguagem de símbolo e limiar; fala devagar e deixa silêncio entre as frases.',
  acolhedora: 'Cuida primeiro do conforto: nomeia o que dói antes de propor trabalho.',
  direta: 'Sem ornato: diz o que a carta mostra e o passo seguinte concreto.',
  sabia: 'Enquadra na tradição (elementos, astros, estrutura do baralho) sem dar lição.',
  poetica: 'Usa imagem e ritmo; aceita ambiguidade e não fecha sentidos.',
  analitica: 'Separa camadas: posição, elemento, número, relação entre cartas.',
}

export const REGISTER_DESCRIPTIONS: Record<string, string> = {
  narrativa: 'A leitura é contada como percurso, com começo, viragem e fecho.',
  psicologica: 'Foco em processos internos, padrões e sombra, sem diagnóstico.',
  espiritual: 'Lê os símbolos como caminho e prática contemplativa.',
  pratica: 'Traduz tudo em decisões, linguagem e gestos do dia.',
  tradicional: 'Segue a leitura clássica ( Rider-Waite-Smith / Golden Dawn ) e as correspondências.',
  poetica: 'Mantém a polissemia: a frase abre, não fecha.',
}
