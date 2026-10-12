import { z } from 'zod'

/**
 * Esquema validado do conteúdo. Usado em três sítios:
 *  1. `scripts/build-content.ts` — antes de emitir `data/*.json`
 *  2. `tests/unit/content.test.ts` — para que a validação corra em CI
 *  3. API de edição do painel administrativo — o conteúdo editado passa pelo mesmo crivo
 */

export const SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const
export const ELEMENTS = ['fire', 'water', 'air', 'earth', 'spirit'] as const

/** Os seis algoritmos de baralhar suportados pelo motor físico e pelas animações. */
export const SHUFFLE_ALGORITHMS = ['tradicional', 'riffle', 'overhand', 'leque', 'circular', 'mistico'] as const
export const RANKS = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'page',
  'knight',
  'queen',
  'king',
] as const
export const RELATION_KINDS = [
  'reforca',
  'tensao',
  'espelho',
  'sombra',
  'complementa',
  'continuidade',
] as const
export const SKY_LAYERS = [
  'void',
  'astral',
  'dawn',
  'dusk',
  'storm',
  'day',
  'night',
  'overcast',
  'underworld',
] as const
export const TERRAIN_LAYERS = [
  'cliff',
  'plain',
  'water',
  'ruins',
  'garden',
  'mountain',
  'interior',
  'path',
  'sea',
  'forest',
  'city',
  'sky',
  'desert',
  'cave',
  'camp',
  'field',
  'orchard',
  'bridge',
] as const

const hexColor = /^#[0-9A-Fa-f]{6}$/

export const CardSchema = z
  .object({
    id: z.string().regex(/^(major-\d{2}-[a-z-]+|minor-(wands|cups|swords|pentacles)-(\d{2}|page|knight|queen|king))$/),
    arcana: z.enum(['major', 'minor']),
    suit: z.enum(SUITS).nullable(),
    number: z.number().int().min(0).max(21),
    rank: z.enum(RANKS).nullable(),
    name: z.object({ pt: z.string().min(3), intl: z.string().min(3) }),
    archetype: z.string().min(6),
    element: z.enum(ELEMENTS),
    astro: z.string().min(3),
    gdTitle: z.string().optional(),
    traditionNote: z.string().nullable(),
    keywords: z.object({
      upright: z.array(z.string().min(2)).min(3),
      reversed: z.array(z.string().min(2)).min(2),
    }),
    history: z.string().min(160),
    meanings: z.object({
      upright: z.string().min(160),
      reversed: z.string().min(100),
    }),
    domains: z.object({
      psychology: z.string().min(80),
      emotional: z.string().min(30),
      love: z.string().min(60),
      career: z.string().min(60),
      finances: z.string().min(50),
      growth: z.string().min(50),
      spirituality: z.string().min(50),
    }),
    guidance: z.object({
      obstacles: z.string().min(30),
      opportunities: z.string().min(30),
      advice: z.array(z.string().min(25)).length(3),
      reflection: z.array(z.string().min(25)).length(3),
    }),
    relations: z
      .array(
        z
          .object({
            card: z.string(),
            kind: z.enum(RELATION_KINDS),
            note: z.string().min(20),
            /** true quando o materializador simétrico do build gerou a ligação inversa. */
            derived: z.boolean().optional(),
          }),
      )
      .min(2),
    art: z.object({
      scene: z.string().min(6),
      sky: z.enum(SKY_LAYERS),
      terrain: z.enum(TERRAIN_LAYERS),
      glyphs: z.array(z.string()).min(3),
      palette: z
        .array(z.string().regex(hexColor))
        .length(3)
        .transform((v) => [v[0]!, v[1]!, v[2]!] as [string, string, string]),
      motifs: z.array(z.string().min(4)).min(3),
      reading: z.array(z.string().min(30)).min(3),
    }),
    a11y: z.object({
      alt: z.string().min(40).max(220),
      long: z.string().min(120),
    }),
    sources: z.array(z.string().min(6)).min(1),
  })
  .strict()

export const SpreadPositionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(2),
  description: z.string().min(12),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  rotation: z.number().optional(),
  scale: z.number().min(0.3).max(2).optional(),
  group: z.string().optional(),
  links: z.array(z.string()).optional(),
  allowReversed: z.boolean().optional(),
})

export const SPREAD_CATEGORIES = [
  'rapida',
  'tres',
  'amor',
  'autoconhecimento',
  'profissional',
  'avancada',
  'ritual',
  'personalizada',
] as const

export const SPREAD_SHAPES = [
  'row',
  'column',
  'cross',
  'greek-cross',
  'celtic-cross',
  'horseshoe',
  'circle',
  'mandala',
  'triangle',
  'pyramid',
  'tree',
  'star',
  'wheel',
  'timeline',
  'grid',
  'table',
  'mirror',
  'path',
  'freeform',
] as const

export const SpreadSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(3),
    category: z.enum(SPREAD_CATEGORIES),
    shape: z.enum(SPREAD_SHAPES),
    summary: z.string().min(20),
    purpose: z.string().min(40),
    whenToUse: z.string().min(20),
    cardCount: z.number().int().min(1).max(78),
    positions: z.array(SpreadPositionSchema).min(1),
    readingOrder: z.array(z.string()).min(1),
    structure: z
      .object({
        kind: z.enum(['linear', 'paired', 'nested', 'radial', 'temporal', 'elemental']),
        blocks: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              positions: z.array(z.string()).min(1),
              note: z.string().optional(),
            }),
          )
          .min(1),
      })
      .optional(),
    tags: z.array(z.string()).min(1),
    estimatedMinutes: z.number().min(1).max(120),
    cinematic: z.enum(['baixo', 'medio', 'alto', 'ritual']),
    difficulty: z.enum(['iniciante', 'intermedio', 'avancado']),
    author: z.enum(['arcana', 'tradicional', 'utilizador']),
    themes: z
      .array(z.object({ theme: z.string(), weight: z.number().min(0).max(1) }))
      .optional(),
    mobileLayout: z
      .object({
        shape: z.enum(['stack', 'grid-2', 'grid-3', 'carousel', 'column']),
        pageGroups: z
          .array(
            z.object({
              label: z.string(),
              positions: z.array(z.string()).min(1),
            }),
          )
          .optional(),
      })
      .optional(),
    requiresAccounts: z.boolean().optional(),
  })
  .strict()
  .superRefine((spread, ctx) => {
    if (spread.positions.length !== spread.cardCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${spread.id}: cardCount (${spread.cardCount}) ≠ número de posições (${spread.positions.length})`,
      })
    }
    const ids = new Set(spread.positions.map((p) => p.id))
    if (ids.size !== spread.positions.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${spread.id}: ids de posição duplicados` })
    }
    const missing = spread.readingOrder.filter((id) => !ids.has(id))
    if (missing.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${spread.id}: readingOrder refere posições inexistentes: ${missing.join(', ')}`,
      })
    }
    if (spread.readingOrder.length !== spread.positions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${spread.id}: readingOrder tem ${spread.readingOrder.length} posições, deviam ser ${spread.positions.length}`,
      })
    }
    for (const p of spread.positions) {
      for (const link of p.links ?? []) {
        if (!ids.has(link)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${spread.id}.${p.id}: link para posição inexistente "${link}"`,
          })
        }
        if (link === p.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${spread.id}.${p.id}: ligação a si própria`,
          })
        }
      }
    }
    if (spread.structure) {
      const covered = new Set<string>()
      for (const block of spread.structure.blocks) {
        for (const pos of block.positions) {
          if (!ids.has(pos)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${spread.id}: bloco "${block.id}" refere posição inexistente "${pos}"`,
            })
          }
          covered.add(pos)
        }
      }
      const orphan = [...ids].filter((id) => !covered.has(id))
      if (orphan.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${spread.id}: posições fora de qualquer bloco estrutural: ${orphan.join(', ')}`,
        })
      }
    }
    if (spread.mobileLayout?.pageGroups) {
      const covered = new Set<string>()
      for (const g of spread.mobileLayout.pageGroups) for (const p of g.positions) covered.add(p)
      const orphan = [...ids].filter((id) => !covered.has(id))
      if (orphan.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${spread.id}: mobileLayout não cobre ${orphan.length} posições`,
        })
      }
    }
  })

export const CardListSchema = z.array(CardSchema).superRefine((cards, ctx) => {
  const ids = new Set<string>()
  for (const card of cards) {
    if (ids.has(card.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `id duplicado: ${card.id}` })
    ids.add(card.id)
  }
  for (const card of cards) {
    for (const rel of card.relations) {
      if (!ids.has(rel.card)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${card.id}: relação aponta para carta inexistente "${rel.card}"`,
        })
      }
    }
  }
  // Distinção de conteúdo: proibido repetir prosa entre cartas.
  const seen = new Map<string, string>()
  const fields: ((c: (typeof cards)[number]) => string)[] = [
    (c) => c.history,
    (c) => c.meanings.upright,
    (c) => c.meanings.reversed,
    (c) => c.domains.psychology,
    (c) => c.domains.love,
    (c) => c.domains.career,
    (c) => c.domains.finances,
    (c) => c.domains.growth,
    (c) => c.domains.spirituality,
    (c) => c.guidance.obstacles,
    (c) => c.guidance.opportunities,
    ...[0, 1, 2].map((i) => (c: (typeof cards)[number]) => c.guidance.advice[i] ?? ''),
    ...[0, 1, 2].map((i) => (c: (typeof cards)[number]) => c.guidance.reflection[i] ?? ''),
  ]
  for (const card of cards) {
    for (const get of fields) {
      const text = get(card).trim().toLowerCase()
      if (!text) continue
      const first = seen.get(text)
      if (first && first !== card.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `texto repetido entre "${first}" e "${card.id}": ${text.slice(0, 60)}…`,
        })
      }
      seen.set(text, card.id)
    }
  }
})

export type ValidatedCard = z.infer<typeof CardSchema>
export type ValidatedSpread = z.infer<typeof SpreadSchema>

/** Payload gerado por `scripts/build-content.ts` e consumido em runtime. */
export const ContentPayloadSchema = z.object({
  generator: z.string().min(1),
  locale: z.string().min(2),
  deckId: z.string().min(1),
  cardCount: z.number().int().positive(),
  spreadCount: z.number().int().positive(),
  cards: z.array(CardSchema).length(78),
  spreads: z.array(SpreadSchema).min(65),
  themeIndex: z.record(z.string(), z.array(z.string())).optional(),
})
export type ContentPayload = z.infer<typeof ContentPayloadSchema>
