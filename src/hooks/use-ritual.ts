'use client'

/**
 * Máquina de estados do ritual (a mesa).
 *
 * O princípio duro: **a lógica da distribuição é a mesma função do servidor**. O cliente
 * baralha e corta com `src/engine/deck.ts` para animar o que aconteceu; quando envia a
 * leitura, o servidor recomputa a partir de `seed + algoritmo + cortes (+ corte manual)`
 * e recusa (409) qualquer divergência. Assim a animação nunca é cosmética: é a
 * representação visual do registo.
 *
 * Fases: config → baralhar → cortar → escolher → (pronto) → gravar → revelar → interpretar.
 * `auto` salta cortar/escolher e deixa o motor comprar pelo modo escolhido.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useApp } from '@/components/providers.tsx'
import { ApiError, api, streamApi, type SseEvent } from '@/lib/api.ts'
import { buildDeck, cutAt, cutDeck, deriveSeed, makeRng, shuffleDeck, threeCuts } from '@/engine/deck.ts'
import { drawForSpread } from '@/engine/deck.ts'
import { DECK_IDS } from '@/domain/content.ts'
import type { DrawnCard, Orientation, ShuffleAlgorithm, SpreadDef } from '@/domain/types.ts'
import type { Interpretation } from '@/domain/interpretation.ts'
import { hashSeed } from '@/engine/deck.ts'
import type { EnvironmentKey, SfxKey } from '@/domain/experience.ts'

export type RitualPhase = 'config' | 'shuffling' | 'cutting' | 'picking' | 'ready' | 'saving' | 'revealed' | 'interpreting' | 'complete' | 'error'

export interface RitualPick {
  positionId: string
  deckIndex: number
}

export interface RitualConfig {
  seed: number
  algorithm: ShuffleAlgorithm
  cuts: number
  cutSize?: number
  allowReversed: boolean
  drawMode: 'topo' | 'fundo' | 'alternado'
  majorsOnly: boolean
  question: string
  querentNote: string
  environment: EnvironmentKey
  deckIds: string[]
}



const SHAKE_SFX: Record<ShuffleAlgorithm, SfxKey> = {
  riffle: 'riffle',
  overhand: 'overhand',
  leque: 'fan-open',
  tradicional: 'shuffle-loop',
  circular: 'shuffle-loop',
  mistico: 'shuffle-loop',
}

export function randomSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return buffer[0]!
  }
  return hashSeed(`${Date.now()}:${Math.random()}`) >>> 0
}

export interface UseRitual {
  phase: RitualPhase
  setPhase: (phase: RitualPhase) => void
  config: RitualConfig
  patchConfig: (patch: Partial<RitualConfig>) => void
  spread: SpreadDef | undefined
  positions: SpreadDef['positions']
  order: string[]
  cutSizes: number[]
  picks: RitualPick[]
  drawn: DrawnCard[]
  pendingPosition: SpreadDef['positions'][number] | undefined
  nextPositionIndex: number
  shuffle: (algorithm?: ShuffleAlgorithm) => Promise<void>
  cut: (size: number | null) => void
  pick: (deckIndex: number) => void
  undoPick: () => void
  clearPicks: () => void
  autoDraw: () => void
  reset: () => void
  submit: () => Promise<string | null>
  readingId: string | null
  error: string | null
  startled: boolean
  revealAll: () => void
  revealNext: () => void
  revealedCount: number
  interpretation: Interpretation | null
  liveSections: Record<string, string>
  streaming: boolean
  streamError: string | null
  interpret: (options?: { forceLocal?: boolean }) => Promise<void>
  abortInterpretation: () => void
  audit: Record<string, unknown> | null
  orientationOf: (cardId: string, deckIndex: number) => Orientation
  durationSeconds: number
  deckOrder: string[]
}

export function useRitual(spread: SpreadDef | undefined, initial?: Partial<RitualConfig>): UseRitual {
  const { prefs, sfx, vfx, toast } = useApp()
  const [phase, setPhase] = useState<RitualPhase>('config')
  const [error, setError] = useState<string |null>(null)
  const [config, setConfig] = useState<RitualConfig>(() => ({
    seed: randomSeed(),
    algorithm: prefs.algorithm,
    cuts: prefs.cuts,
    allowReversed: prefs.allowReversed,
    drawMode: prefs.drawMode,
    majorsOnly: false,
    question: '',
    querentNote: '',
    environment: prefs.environment as EnvironmentKey,
    deckIds: [...DECK_IDS],
    ...initial,
  }))
  const [baseOrder, setBaseOrder] = useState<string[]>(() => config.deckIds.slice())
  const [order, setOrder] = useState<string[]>(() => config.deckIds.slice())
  const [cutSizes, setCutSizes] = useState<number[]>([])
  const [picks, setPicks] = useState<RitualPick[]>([])
  const [drawn, setDrawn] = useState<DrawnCard[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [audit, setAudit] = useState<Record<string, unknown> | null>(null)
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
  const [liveSections, setLiveSections] = useState<Record<string, string>>({})
  const [streaming, setStreaming] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [startled, setStartled] = useState(false)
  const startedAt = useRef<number>(Date.now())
  const controller = useRef<AbortController | null>(null)

  useEffect(() => {
    setConfig((current) => ({ ...current, environment: prefs.environment as EnvironmentKey }))
  }, [prefs.environment])

  useEffect(() => {
    if (!spread) return
    setPicks([])
    setDrawn([])
    setRevealedCount(0)
    setReadingId(null)
    setInterpretation(null)
    setLiveSections({})
    setPhase('config')
    startedAt.current = Date.now()
    const ids = config.majorsOnly ? config.deckIds.filter((id) => id.startsWith('major-')) : config.deckIds
    setBaseOrder(ids.slice())
    setOrder(ids.slice())
    setCutSizes([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread?.id, config.majorsOnly, config.deckIds])

  const positions = useMemo(() => spread?.positions ?? [], [spread])
  const nextPositionIndex = picks.length
  const pendingPosition = positions[picks.length]

  /** Espelha exatamente o que `drawForSpread` faz, para que cliente e servidor coincidam. */
  const applyShuffle = useCallback(
    (algorithm: ShuffleAlgorithm, seed: number, cuts: number, cutSize?: number) => {
      const deckIds = config.majorsOnly ? baseOrder : config.deckIds
      const state = buildDeck(deckIds)
      const shuffled = shuffleDeck(state, algorithm, deriveSeed(seed, `shuffle:${algorithm}`))
      let working = shuffled
      const sizes: number[] = []
      const rng = makeRng(deriveSeed(seed, `cuts:${cuts}`))
      if (cuts === 3 && cutSize === undefined) {
        working = { ...working, order: threeCuts(working.order, rng), cuts: 3 }
        sizes.push(Math.round(working.order.length / 3))
      } else if (cuts > 0) {
        const size = cutSize !== undefined ? clampCut(cutSize, working.order.length) : 1 + Math.floor(rng() * (working.order.length - 1))
        sizes.push(size)
        working = cutAt(working, size)
        if (cutSize === undefined && cuts > 1) {
          for (let index = 1; index < cuts; index += 1) {
            // o motor só aplica um corte por sorteio; os restantes são apenas registo do ritual
            sizes.push(1 + Math.floor(rng() * (working.order.length - 1)))
          }
        }
      }
      setOrder(working.order)
      setCutSizes(sizes)
      return working.order
    },
    [config.deckIds, config.majorsOnly, baseOrder],
  )

  const shuffle = useCallback(
    async (algorithm?: ShuffleAlgorithm) => {
      if (!spread) return
      const algo = algorithm ?? config.algorithm
      setPhase('shuffling')
      setError(null)
      setStartled(true)
      window.setTimeout(() => setStartled(false), 1600)
      sfx(SHAKE_SFX[algo])
      const deckIds = config.majorsOnly ? baseOrder : config.deckIds
      const length = Math.min(18, Math.max(6, Math.round(deckIds.length / 5)))
      vfx.emit('poeira', { x: window.innerWidth / 2, y: window.innerHeight * 0.62, width: Math.min(window.innerWidth, 900) })
      for (let batch = 0; batch < length; batch += 1) {
        await wait(Math.max(60, 150 / Math.max(0.5, prefs.motion.speed)))
        if (batch % 2 === 0) sfx('shuffle-loop', { gain: 0.35 })
      }
      applyShuffle(algo, config.seed, config.cuts, config.cutSize)
      setPicks([])
      setDrawn([])
      setRevealedCount(0)
      sfx('shuffle-start', { gain: 0.6 })
      setPhase(config.cutSize === undefined && config.cuts > 0 ? 'cutting' : 'picking')
    },
    [applyShuffle, config.algorithm, config.cuts, config.cutSize, config.deckIds, config.majorsOnly, config.seed, baseOrder, prefs.motion.speed, spread, sfx, vfx],
  )

  const cut = useCallback(
    (size: number | null) => {
      const length = order.length
      const chosen = size === null ? 1 + Math.floor(Math.random() * (length - 1)) : clampCut(Math.round(size), length)
      setCutSizes((current) => [...current, chosen])
      setOrder((current) => cutDeck(current, chosen))
      setConfig((current) => ({ ...current, cutSize: chosen, cuts: Math.max(1, current.cuts) }))
      sfx('cut')
      vfx.emit('corte', { x: window.innerWidth / 2, y: window.innerHeight * 0.55, width: Math.min(window.innerWidth, 760) })
      setPhase('picking')
    },
    [order.length, sfx, vfx],
  )

  /** Calcula a distribuição a partir dos índices escolhidos, com as orientações do motor. */
  const computeDraw = useCallback(
    (currentPicks: RitualPick[]): DrawnCard[] => {
      if (!spread || currentPicks.length === 0) return []
      const result = drawForSpread(config.majorsOnly ? baseOrder : config.deckIds, {
        spread,
        seed: config.seed,
        algorithm: config.algorithm,
        cuts: config.cuts,
        cutSize: config.cutSize,
        allowReversed: config.allowReversed,
        drawMode: config.drawMode,
        manualPicks: currentPicks,
        positionOrder: spread.readingOrder?.length ? spread.readingOrder : undefined,
      })
      const wanted = new Set(currentPicks.map((pick) => pick.positionId))
      return result.drawn.filter((card) => wanted.has(card.positionId))
    },
    [baseOrder, config.algorithm, config.allowReversed, config.cuts, config.cutSize, config.deckIds, config.drawMode, config.majorsOnly, config.seed, spread],
  )

  const pick = useCallback(
    (deckIndex: number) => {
      if (!pendingPosition) return
      const index = ((deckIndex % order.length) + order.length) % order.length
      if (picks.some((item) => item.deckIndex === index)) {
        toast('Essa carta já foi escolhida — o baralho não repete cartas.', 'erro')
        return
      }
      const next = [...picks, { positionId: pendingPosition.id, deckIndex: index }]
      setPicks(next)
      setDrawn(computeDraw(next))
      sfx('pick')
      vfx.emit('selo', { x: window.innerWidth / 2, y: window.innerHeight * 0.5 })
      if (next.length === positions.length) setPhase('ready')
    },
    [computeDraw, order.length, pendingPosition, picks, positions.length, sfx, toast, vfx],
  )

  const undoPick = useCallback(() => {
    if (picks.length === 0) return
    const next = picks.slice(0, -1)
    setPicks(next)
    setDrawn(computeDraw(next))
    setPhase(next.length === 0 ? 'picking' : 'picking')
    sfx('flip')
  }, [computeDraw, picks, sfx])

  const clearPicks = useCallback(() => {
    setPicks([])
    setDrawn([])
    setRevealedCount(0)
    setPhase('picking')
  }, [])

  /** Deixa o motor comprar: mantém a coerência porque usa o mesmo `order`. */
  const autoDraw = useCallback(() => {
    if (!spread) return
    applyShuffle(config.algorithm, config.seed, config.cuts, config.cutSize)
    const result = drawForSpread(config.majorsOnly ? baseOrder : config.deckIds, {
      spread,
      seed: config.seed,
      algorithm: config.algorithm,
      cuts: config.cuts,
      cutSize: config.cutSize,
      allowReversed: config.allowReversed,
      drawMode: config.drawMode,
      positionOrder: spread.readingOrder?.length ? spread.readingOrder : undefined,
    })
    setOrder(result.deckOrder)
    setDrawn(result.drawn)
    setPicks(result.drawn.map((card) => ({ positionId: card.positionId, deckIndex: card.deckIndex })))
    setPhase('ready')
    sfx('deal')
    vfx.emit('queda', { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, width: window.innerWidth * 0.6 })
  }, [applyShuffle, baseOrder, config, spread, sfx, vfx])

  const reset = useCallback(() => {
    setPhase('config')
    setPicks([])
    setDrawn([])
    setRevealedCount(0)
    setReadingId(null)
    setInterpretation(null)
    setLiveSections({})
    setAudit(null)
    setError(null)
    setConfig((current) => ({ ...current, seed: randomSeed(), cutSize: undefined }))
    setCutSizes([])
    setOrder(baseOrder.slice())
    controller.current?.abort()
  }, [baseOrder])

  const submit = useCallback(async (): Promise<string | null> => {
    if (!spread) return null
    if (drawn.length === 0) {
      setError('Ainda não há cartas suficientes na mesa.')
      return null
    }
    setPhase('saving')
    setError(null)
    try {
      const response = await api<{ id: string; audit: Record<string, unknown> }>('/api/readings', {
        method: 'POST',
        body: {
          spreadId: spread.id,
          question: config.question,
          querentNote: config.querentNote || undefined,
          seed: config.seed,
          algorithm: config.algorithm,
          cuts: config.cuts,
          cutSize: config.cutSize,
          allowReversed: config.allowReversed,
          drawMode: config.drawMode,
          majorsOnly: config.majorsOnly,
          environment: config.environment,
          positionOrder: spread.readingOrder?.length ? spread.readingOrder : undefined,
          picks: picks.length === positions.length ? picks : undefined,
          clientCards: drawn.map((card) => ({ positionId: card.positionId, cardId: card.cardId, orientation: card.orientation, deckIndex: card.deckIndex })),
          durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
          autoInterpret: false,
        },
      })
      setReadingId(response.id)
      setAudit(response.audit ?? null)
      sfx('confirm')
      vfx.emit('revelacao', { x: window.innerWidth / 2, y: window.innerHeight * 0.5, width: 520, height: 520 })
      setPhase('revealed')
      setRevealedCount(0)
      return response.id
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : 'Não foi possível gravar a leitura.'
      setError(message)
      setPhase('error')
      sfx('error')
      toast(message, 'erro', { label: 'Repetir', onClick: () => void submit() })
      return null
    }
  }, [config, drawn, picks, positions, spread, sfx, toast, vfx])

  const revealNext = useCallback(() => {
    setRevealedCount((current) => {
      const next = Math.min(drawn.length, current + 1)
      const card = drawn[current]
      if (card) sfx(card.orientation === 'reversed' ? 'flip-reversed' : 'flip')
      if (next > current) vfx.emit(card?.orientation === 'reversed' ? 'invertida' : 'revelacao', { x: window.innerWidth / 2, y: window.innerHeight * 0.5, width: 200, height: 340 })
      return next
    })
  }, [drawn, sfx, vfx])

  const revealAll = useCallback(() => {
    setRevealedCount(drawn.length)
    setPhase('revealed')
    sfx('reveal')
  }, [drawn.length, sfx])

  const abortInterpretation = useCallback(() => {
    controller.current?.abort()
    controller.current = null
    setStreaming(false)
  }, [])

  const interpret = useCallback(
    async (options: { forceLocal?: boolean } = {}) => {
      if (!readingId) return
      setPhase('interpreting')
      setStreaming(true)
      setStreamError(null)
      setLiveSections({})
      const controllerRef = new AbortController()
      controller.current = controllerRef
      let done: Interpretation | null = null
      try {
        await streamApi(
          `/api/readings/${readingId}/interpret`,
          {
            voice: prefs.voice,
            register: prefs.register,
            depth: prefs.depth,
            useLlm: options.forceLocal ? false : prefs.ai.useLlm,
            forceLocal: options.forceLocal === true,
            stream: true,
          },
          (event: SseEvent) => {
            const payload = event.data as Record<string, unknown>
            if (event.event === 'section' && payload) {
              const key = String(payload.section ?? payload.id ?? 'corpo')
              const text = String(payload.text ?? payload.markdown ?? '')
              setLiveSections((current) => ({ ...current, [key]: (current[key] ?? '') + text }))
              sfx('stream-tick', { gain: 0.35 })
            } else if (event.event === 'meta') {
              setAudit((current) => ({ ...(current ?? {}), meta: payload }))
            } else if (event.event === 'fallback') {
              setStreamError(typeof payload?.note === 'string' ? payload.note : 'O LLM falhou; a leitura local estruturada substituiu-a.')
            } else if (event.event === 'error') {
              setStreamError(typeof payload?.error === 'string' ? payload.error : 'A interpretação falhou a meio.')
            } else if (event.event === 'done') {
              const body = (payload as { interpretation?: Interpretation } | null)?.interpretation ?? ((payload as unknown) as Interpretation | null)
              if (body && typeof body === 'object' && 'opening' in body) done = body
            }
          },
          controllerRef.signal,
        )
        if (done) {
          setInterpretation(done)
          setLiveSections({})
        }
        setPhase('complete')
        sfx('confirm', { gain: 0.7 })
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setStreamError(caught instanceof ApiError ? caught.message : 'Não foi possível ler a interpretação.')
        sfx('error')
      } finally {
        setStreaming(false)
        controller.current = null
      }
    },
    [prefs.ai.useLlm, prefs.depth, prefs.register, prefs.voice, readingId, sfx],
  )

  const orientationOf = useCallback(
    (cardId: string, deckIndex: number): Orientation => {
      const found = drawn.find((card) => card.cardId === cardId && card.deckIndex === deckIndex)
      if (found) return found.orientation
      return 'upright'
    },
    [drawn],
  )

  const patchConfig = useCallback((patch: Partial<RitualConfig>) => {
    setConfig((current) => ({ ...current, ...patch }))
    if (patch.seed !== undefined || patch.majorsOnly !== undefined) {
      setCutSizes([])
      setPicks([])
      setDrawn([])
    }
  }, [])

  return {
    phase,
    setPhase,
    config,
    patchConfig,
    spread,
    positions,
    order,
    cutSizes,
    picks,
    drawn,
    pendingPosition,
    nextPositionIndex,
    shuffle,
    cut,
    pick,
    undoPick,
    clearPicks,
    autoDraw,
    reset,
    submit,
    readingId,
    error,
    startled,
    revealAll,
    revealNext,
    revealedCount,
    interpretation,
    liveSections,
    streaming,
    streamError,
    interpret,
    abortInterpretation,
    audit,
    orientationOf,
    durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
    deckOrder: order,
  }
}

function clampCut(value: number, length: number): number {
  return Math.max(1, Math.min(length - 1, Math.trunc(value)))
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
