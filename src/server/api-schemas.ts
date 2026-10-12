import { z } from 'zod'

import { DEPTHS, REGISTERS, VOICES, type Depth, type Register, type VoiceKey } from '@/domain/interpretation.ts'
import { SHUFFLE_ALGORITHMS, SPREAD_CATEGORIES, SPREAD_SHAPES } from '@/domain/schema.ts'
import type { ShuffleAlgorithm } from '@/domain/types.ts'
import { ENVIRONMENTS } from '@/domain/experience.ts'

/**
 * Contratos de entrada da API. Vivem separados das rotas porque o Next só permite
 * exports específicos num `route.ts` — e porque os testes unitários exercitam
 * exactamente o mesmo validador que o servidor usa.
 */

const voiceEnum = z.enum(VOICES as unknown as [VoiceKey, ...VoiceKey[]])
const registerEnum = z.enum(REGISTERS as unknown as [Register, ...Register[]])
const depthEnum = z.enum(DEPTHS as unknown as [Depth, ...Depth[]])
const algorithmEnum = z.enum(SHUFFLE_ALGORITHMS as unknown as [ShuffleAlgorithm, ...ShuffleAlgorithm[]])

/** `0.0.0.0` e `localhost` são úteis em desenvolvimento; o regex rejeita o resto. */
const identifier = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9._:-]*$/i, 'Identificador inválido.')

export const HandleSchema = z
  .string()
  .trim()
  .min(3, 'Mínimo de 3 caracteres.')
  .max(32, 'Máximo de 32 caracteres.')
  .regex(/^[a-z0-9._-]+$/i, 'Usa apenas letras, números, ponto, hífen e sublinhado.')

export const LoginSchema = z.object({
  handle: HandleSchema,
  password: z.string().min(1, 'Falta a palavra-passe.').max(200),
})

export const RegisterSchema = z.object({
  handle: HandleSchema,
  password: z
    .string()
    .min(10, 'A palavra-passe tem de ter pelo menos 10 caracteres.')
    .max(200, 'Máximo de 200 caracteres.')
    .refine((value) => /[a-z]/i.test(value) && /[0-9]/.test(value), 'Inclui pelo menos uma letra e um número.'),
  email: z.string().trim().email('Email inválido.').max(160).optional().or(z.literal('')),
  displayName: z.string().trim().max(60).optional().or(z.literal('')),
  /** Confirmação explícita do enquadramento (tarot como reflexão, não previsão). */
  acceptFrame: z.literal(true, { errorMap: () => ({ message: 'É preciso confirmar o enquadramento simbólico.' }) }),
})

export const DrawnCardSchema = z.object({
  positionId: identifier,
  cardId: identifier,
  orientation: z.enum(['upright', 'reversed']),
  deckIndex: z.number().int().min(0),
})

export const CreateReadingSchema = z.object({
  spreadId: identifier,
  question: z.string().trim().max(600, 'Máximo de 600 caracteres.').default(''),
  querentNote: z.string().trim().max(2000).optional().or(z.literal('')),
  deckId: identifier.nullable().optional(),
  /** Seed uint32 gerada pelo cliente (o ritual é reprodutível); ausente = o servidor gera. */
  seed: z.number().int().min(0).max(4294967295).optional(),
  algorithm: algorithmEnum.default('tradicional'),
  cuts: z.number().int().min(0).max(3).default(1),
  /** Corte manual (índice do baralho onde o utilizador partiu o monte). */
  cutSize: z.number().int().min(1).max(77).optional(),
  allowReversed: z.boolean().default(true),
  drawMode: z.enum(['topo', 'fundo', 'alternado']).default('topo'),
  environment: z.enum(ENVIRONMENTS).default('templo'),
  /** Cartas que o cliente recebeu do motor — servem para o servidor reverificar. */
  clientCards: z.array(DrawnCardSchema).max(78).optional(),
  picks: z.array(z.object({ positionId: identifier, deckIndex: z.number().int().min(0).max(77) })).max(78).optional(),
  positionOrder: z.array(identifier).max(78).optional(),
  majorsOnly: z.boolean().default(false),
  isDaily: z.boolean().default(false),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  /** Gravar já a interpretação local (default: sim; `false` para só registar a distribuição). */
  autoInterpret: z.boolean().default(true),
  voice: voiceEnum.optional(),
  register: registerEnum.optional(),
  depth: depthEnum.optional(),
})

export const UpdateReadingSchema = z.object({
  starred: z.boolean().optional(),
  querentNote: z.string().trim().max(2000).nullable().optional(),
  question: z.string().trim().max(600).optional(),
})

export const InterpretSchema = z.object({
  voice: voiceEnum.default('mistica'),
  register: registerEnum.default('narrativa'),
  depth: depthEnum.default('normal'),
  /** `false` força o motor local (offline, sem custo, sem rede). */
  useLlm: z.boolean().default(true),
  /** Secções a gerar (o ecrã de leitura rápida pede só abertura + síntese + fecho). */
  onlySections: z.array(z.enum(['opening', 'per-card', 'combinations', 'synthesis', 'guidance', 'closing'])).optional(),
  includeHistory: z.boolean().default(true),
  querentContext: z.string().trim().max(1000).optional().or(z.literal('')),
  stream: z.boolean().default(true),
})

export const ChatSchema = z.object({
  message: z.string().trim().min(1, 'Escreve a tua pergunta.').max(1200),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(6000) }))
    .max(20)
    .default([]),
  voice: voiceEnum.default('mistica'),
  focus: z
    .array(identifier)
    .max(10)
    .default([]),
})

export const PreferencesPatchSchema = z.object({
  voice: voiceEnum.optional(),
  register: registerEnum.optional(),
  depth: depthEnum.optional(),
  allowReversed: z.boolean().optional(),
  algorithm: algorithmEnum.optional(),
  cuts: z.number().int().min(0).max(3).optional(),
  drawMode: z.enum(['topo', 'fundo', 'alternado']).optional(),
  environment: z.enum(ENVIRONMENTS).optional(),
  theme: z.enum(['noite', 'crepusculo', 'claro']).optional(),
  dailySalt: z.string().max(40).optional(),
  audio: z
    .object({
      enabled: z.boolean().optional(),
      ambience: z.number().min(0).max(1).optional(),
      effects: z.number().min(0).max(1).optional(),
      autoplay: z.boolean().optional(),
    })
    .optional(),
  motion: z
    .object({
      respectSystem: z.boolean().optional(),
      forceReduced: z.boolean().optional(),
      speed: z.number().min(0.4).max(2).optional(),
      vfx: z.number().min(0).max(1).optional(),
    })
    .optional(),
  accessibility: z
    .object({
      highContrast: z.boolean().optional(),
      largeText: z.boolean().optional(),
      captions: z.boolean().optional(),
      keyboardHints: z.boolean().optional(),
      reduceFlashes: z.boolean().optional(),
    })
    .optional(),
  ai: z
    .object({
      useLlm: z.boolean().optional(),
      shareContext: z.boolean().optional(),
      dailyBudgetUsd: z.number().min(0).max(50).optional(),
      maxOutputTokens: z.number().int().min(256).max(8192).optional(),
    })
    .optional(),
  deckId: z.string().max(64).nullable().optional(),
  pinnedSpreadIds: z.array(identifier).max(12).optional(),
})

/** Posição de tiragem criada pelo utilizador (o criador de tiragens no browser). */
export const SpreadPositionInputSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9][a-z0-9-]*$/i, 'id de posição: letras, números e hífens.'),
  label: z.string().trim().min(1).max(60),
  description: z.string().trim().min(8).max(400),
  group: z.string().trim().max(40).optional().or(z.literal('')),
  meaningWhenReversed: z.string().trim().max(400).optional().or(z.literal('')),
  linkTo: identifier.optional(),
  /** Coordenada normalizada opcional (o motor calcula a geometria quando falta). */
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  rotation: z.number().min(-180).max(180).optional(),
  scale: z.number().min(0.4).max(2).optional(),
})

export const SpreadShapeSchema = z.enum(SPREAD_SHAPES)

export const UserSpreadSchema = z.object({
  id: identifier.optional(),
  name: z.string().trim().min(3).max(60),
  summary: z.string().trim().min(20, 'Descreve a tiragem em pelo menos 20 caracteres.').max(240),
  purpose: z.string().trim().min(40, 'A finalidade precisa de pelo menos 40 caracteres: é o que a interpretação usa.').max(400),
  whenToUse: z.string().trim().min(20).max(240),
  category: z.enum(SPREAD_CATEGORIES).default('autoconhecimento'),
  shape: SpreadShapeSchema.default('row'),
  occasion: z.string().trim().max(120).optional().or(z.literal('')),
  allowReversed: z.boolean().default(true),
  readingOrder: z.array(identifier).max(20).optional(),
  positions: z
    .array(SpreadPositionInputSchema)
    .min(1, 'Uma tiragem precisa de pelo menos uma posição.')
    .max(20, 'Máximo de 20 posições.'),
})

export const JournalSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD.'),
  readingId: identifier.optional(),
  mood: z.number().int().min(1).max(5).optional(),
  sleepHours: z.number().min(0).max(16).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  clarity: z.number().int().min(1).max(5).optional(),
  note: z.string().trim().max(4000).optional().or(z.literal('')),
})

export const DeckSchema = z.object({
  id: identifier.optional(),
  name: z.string().trim().min(3).max(60),
  deckKind: z.enum(['riders', 'marselha', 'tematico', 'proprio']).default('riders'),
  theme: z.enum(['obsidiana', 'ouro-velho', 'linho', 'nanquim', 'vitral', 'nocturno', 'cinza']).default('obsidiana'),
  allowReversed: z.boolean().default(true),
  /** Subconjunto do baralho canónico (78); vazio = completo. */
  cardIds: z.array(identifier).max(78).default([]),
  onlyMajors: z.boolean().default(false),
})

/** Telemetria do cliente: apenas números e chaves, nunca conteúdo das leituras. */
export const UsageEventSchema = z.object({
  kind: z.enum([
    'leitura',
    'ritual',
    'tempo-mesa',
    'fallback-webgl',
    'reduced-motion',
    'audio-desligado',
    'erro-cliente',
    'partilha',
    'exportacao',
  ]),
  section: identifier.optional(),
  ms: z.number().int().min(0).max(3600000).optional(),
  detail: z.string().max(240).optional(),
})

export const FeedbackSchema = z.object({
  area: identifier,
  message: z.string().trim().min(4).max(2000),
  contact: z.string().trim().max(160).optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional(),
})

export const DateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.number().int().min(1).max(400).default(30),
})

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).max(100000).default(0),
  spreadId: identifier.optional(),
  starred: z
    .enum(['1', '0'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === '1')),
})

export { identifier }
