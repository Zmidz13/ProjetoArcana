import { z } from 'zod'

/**
 * Contratos de saída do modelo.
 *
 * O LLM nunca devolve "um texto": devolve secções validadas por esquema. Tudo o que
 * não cumprir o contrato é descartado (e a secção fica com o texto do motor local),
 * nunca "consertado" por inventação. Os ids de carta são validados contra a tiragem:
 * é isto que torna impossível o modelo falar de uma carta que não saiu.
 */

export const OrientationSchema = z.enum(['upright', 'reversed'])

/** Conjunto de ids permitido = exatamente as cartas retiradas. */
export function buildOutputSchemas(allowedCardIds: readonly string[], allowedPositionIds: readonly string[]) {
  const cardId = z.enum((allowedCardIds.length ? allowedCardIds : ['__none__']) as [string, ...string[]], {
    errorMap: () => ({ message: 'o modelo referenciou uma carta que não saiu na tiragem' }),
  })
  const positionId = z.enum((allowedPositionIds.length ? allowedPositionIds : ['__none__']) as [string, ...string[]], {
    errorMap: () => ({ message: 'posição inexistente nesta tiragem' }),
  })

  const OpeningSection = z.object({
    kind: z.literal('opening'),
    /** 2 a 6 frases, em PT-PT, sem preâmbulos do tipo "Claro!" ou "Com certeza". */
    text: z.string().min(80).max(2600),
  })

  const PerCardSection = z.object({
    kind: z.literal('per-card'),
    items: z
      .array(
        z.object({
          positionId,
          cardId,
          orientation: OrientationSchema,
          core: z.string().min(60).max(1800),
          modulation: z.string().min(40).max(1200),
          connection: z.string().min(30).max(900).optional(),
        }),
      )
      .min(allowedCardIds.length)
      .max(allowedCardIds.length * 2),
  })

  const CombinationsSection = z.object({
    kind: z.literal('combinations'),
    items: z
      .array(
        z.object({
          cards: z.array(cardId).min(2).max(4),
          kind: z.enum(['reforco', 'tensao', 'sombra', 'complemento', 'espelho', 'sequencia']),
          note: z.string().min(50).max(1400),
        }),
      )
      .max(14),
  })

  const SynthesisSection = z.object({
    kind: z.literal('synthesis'),
    paragraphs: z.array(z.string().min(120).max(2200)).min(1).max(9),
  })

  const GuidanceSection = z.object({
    kind: z.literal('guidance'),
    /** E. Orientações práticas — sempre concretas e datáveis. */
    practical: z.array(z.string().min(40).max(900)).min(1).max(9),
    /** F. Perguntas de reflexão. */
    reflection: z.array(z.string().min(25).max(600)).min(1).max(8),
  })

  const ClosingSection = z.object({
    kind: z.literal('closing'),
    text: z.string().min(60).max(1400),
    /** G. Uma frase-síntese para partilhar/copiar. */
    oneLine: z.string().min(20).max(220),
  })

  const SectionSchema = z.discriminatedUnion('kind', [
    OpeningSection,
    PerCardSection,
    CombinationsSection,
    SynthesisSection,
    GuidanceSection,
    ClosingSection,
  ])

  const FullReadingSchema = z.object({
    sections: z.array(SectionSchema).min(4),
    /** Título curto sugerido para o arquivo (máx. 60 caracteres). */
    title: z.string().min(6).max(80).optional(),
    dominantTheme: z.string().min(8).max(160).optional(),
  })

  const ChatReplySchema = z.object({
    reply: z.string().min(20).max(2600),
    /** Posições a realçar na resposta (devem existir na tiragem). */
    focusPositions: z.array(positionId).max(4).optional(),
    /** true quando a pergunta já não pode ser respondida com as cartas desta tiragem. */
    outOfScope: z.boolean().optional(),
  })

  const SymbolicCheckSchema = z.object({
    agrees: z.boolean(),
    corrections: z.array(z.string().max(400)).max(6).default([]),
  })

  return {
    OpeningSection,
    PerCardSection,
    CombinationsSection,
    SynthesisSection,
    GuidanceSection,
    ClosingSection,
    SectionSchema,
    FullReadingSchema,
    ChatReplySchema,
    SymbolicCheckSchema,
    cardId,
    positionId,
  }
}

export type OutputSchemas = ReturnType<typeof buildOutputSchemas>
export type FullReading = z.infer<ReturnType<typeof buildOutputSchemas>['FullReadingSchema']>
export type ChatReply = z.infer<ReturnType<typeof buildOutputSchemas>['ChatReplySchema']>

/** Secções aceites no streaming (nome → esquema). */
export const SECTION_ORDER = ['opening', 'per-card', 'combinations', 'synthesis', 'guidance', 'closing'] as const
export type SectionKind = (typeof SECTION_ORDER)[number]

export const SECTION_LABEL: Record<SectionKind, string> = {
  opening: 'Abertura',
  'per-card': 'Carta a carta',
  combinations: 'Combinações',
  synthesis: 'Síntese narrativa',
  guidance: 'Orientações e perguntas',
  closing: 'Mensagem final',
}
