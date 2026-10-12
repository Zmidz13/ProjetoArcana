'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useApp } from '@/components/providers.tsx'
import { Badge, Bars, Button, Field, Panel, Select, Skeleton, TextArea } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { ApiError, api, formatDateTime, formatDuration, streamApi } from '@/lib/api.ts'
import { getCard } from '@/domain/content.ts'
import type { Interpretation, VoiceKey } from '@/domain/interpretation.ts'
import type { Depth, Register } from '@/domain/interpretation.ts'
import type { DrawnCard, Orientation, SpreadDef } from '@/domain/types.ts'

interface InterpretationRow {
  id: string
  generator: 'local' | 'llm'
  provider: string | null
  model: string | null
  voice: string
  register: string
  depth: string
  createdAt: string
  costUsd: number | null
  tokensIn: number | null
  tokensOut: number | null
  body: Interpretation | null
}

interface ChatRow {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  focus_positions?: string[] | null
  used_llm?: number
  out_of_scope?: number
}

interface ReadingPayload {
  reading: {
    id: string
    createdAt: string
    spreadId: string
    spreadName: string
    question: string
    querentNote?: string | null
    seed: number
    algorithm: string
    cuts: number
    allowReversed: boolean
    drawMode: string
    environment: string
    starred: boolean
    shareToken: string | null
    durationSeconds: number | null
    cards: DrawnCard[]
    audit: Record<string, unknown>
    interpretation?: Interpretation
  }
  spread: SpreadDef
  interpretations: InterpretationRow[]
  chat: ChatRow[]
  cards: { cardId: string; name: string; orientation: Orientation }[]
  replay: { matches: boolean | null; note?: string }
}

const SECTION_ORDER: { key: string; label: string; note: string }[] = [
  { key: 'opening', label: 'A · Abertura', note: 'o tom e o limiar da leitura' },
  { key: 'per-card', label: 'B · Carta a carta', note: 'posição, carta e o que ela modula' },
  { key: 'combinations', label: 'C · Combinações e padrões', note: 'tensões, reforços, elementos' },
  { key: 'synthesis', label: 'D · Síntese narrativa', note: 'a frase que liga tudo' },
  { key: 'guidance', label: 'E · Orientações práticas', note: 'o que fazer com isto' },
  { key: 'reflection', label: 'F · Perguntas', note: 'para levar contigo' },
  { key: 'closing', label: 'G · Mensagem final', note: 'fecho, não previsão' },
]

/** Página de leitura: o registo completo, a interpretação (A–G) e a conversa posterior. */
export function LeituraClient({ id }: { id: string }) {
  const { deckTheme, toast, sfx, prefs, patchPrefs } = useApp()
  const [payload, setPayload] = useState<ReadingPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [live, setLive] = useState<Record<string, string>>({})
  const [note, setNote] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await api<ReadingPayload>(`/api/readings/${id}`)
      setPayload(next)
      setNote(next.reading.querentNote ?? '')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível abrir a leitura.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => () => controller.current?.abort(), [])

  const interpretation = useMemo(() => payload?.reading.interpretation ?? payload?.interpretations[0]?.body ?? null, [payload])

  const regenerate = useCallback(
    async (forceLocal: boolean) => {
      setStreaming(true)
      setLive({})
      setError(null)
      const abort = new AbortController()
      controller.current = abort
      let final: Interpretation | null = null
      try {
        await streamApi(
          `/api/readings/${id}/interpret`,
          { voice: prefs.voice, register: prefs.register, depth: prefs.depth, useLlm: !forceLocal, stream: true },
          (event) => {
            const data = event.data as Record<string, unknown>
            if (event.event === 'section') {
              const key = String(data.section ?? 'corpo')
              setLive((current) => ({ ...current, [key]: (current[key] ?? '') + String(data.text ?? '') }))
              sfx('stream-tick', { gain: 0.3 })
            } else if (event.event === 'fallback') {
              toast(typeof data.note === 'string' ? data.note : 'IA indisponível — leitura local entregue.', 'info')
            } else if (event.event === 'error') {
              setError(typeof data.error === 'string' ? data.error : 'A interpretação falhou.')
            } else if (event.event === 'done') {
              const body = (data as { interpretation?: Interpretation }).interpretation
              if (body) final = body
            }
          },
          abort.signal,
        )
        await load()
        if (!final && !payloadHasBody(payload)) toast('Leitura recomposta e guardada.', 'ok')
        sfx('confirm')
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setError(caught instanceof ApiError ? caught.message : 'Falha no pedido de interpretação.')
        sfx('error')
      } finally {
        setStreaming(false)
        controller.current = null
      }
    },
    [id, load, payload, prefs.depth, prefs.register, prefs.voice, sfx, toast],
  )

  const patch = useCallback(
    async (body: Record<string, unknown>, message: string) => {
      try {
        await api(`/api/readings/${id}`, { method: 'PATCH', body })
        toast(message, 'ok')
        await load()
      } catch (caught) {
        toast(caught instanceof ApiError ? caught.message : 'Falha ao actualizar.', 'erro')
      }
    },
    [id, load, toast],
  )

  const share = useCallback(async () => {
    if (!payload) return
    try {
      const result = await api<{ shareToken: string | null; url: string | null }>(`/api/readings/${id}/share`, {
        method: 'POST',
        body: { share: !payload.reading.shareToken },
      })
      if (result.shareToken) {
        const url = `${window.location.origin}${result.url}`
        try {
          await navigator.clipboard.writeText(url)
          toast('Link de partilha copiado (sem notas privadas).', 'ok')
        } catch {
          toast(`Link pronto em ${result.url}`, 'ok')
        }
      } else {
        toast('Partilha retirada.', 'ok')
      }
      await load()
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha na partilha.', 'erro')
    }
  }, [id, load, payload, toast])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error && !payload) {
    return (
      <Panel title="Leitura indisponível" subtitle={error}>
        <Link href="/historico" className="text-sm text-gold-bright underline-offset-4 hover:underline">
          Voltar ao histórico
        </Link>
      </Panel>
    )
  }

  if (!payload) return null

  const { reading, spread } = payload
  const drawn = reading.cards.map((card) => ({ ...card, definition: getCard(card.cardId) }))

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {formatDateTime(reading.createdAt)} · {spread?.name ?? reading.spreadName}
          </p>
          <h1 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{interpretation?.title ?? (reading.question || 'Leitura sem pergunta')}</h1>
          {reading.question ? <p className="mt-1 max-w-2xl text-sm italic text-[var(--text-muted)]">“{reading.question}”</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={reading.starred ? 'gold' : 'outline'} onClick={() => void patch({ starred: !reading.starred }, reading.starred ? 'Retirada das favoritas.' : 'Marcada como favorita.')} aria-pressed={reading.starred}>
            {reading.starred ? '★ Favorita' : '☆ Favorita'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void share()}>
            {reading.shareToken ? 'Retirar partilha' : 'Partilhar'}
          </Button>
          <Link href="/api/export?format=json" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold" title="Exportação em JSON de tudo o que a tua sessão guarda">
            Exportar
          </Link>
          <Button size="sm" variant="ghost" sound="none" onClick={() => window.print()}>
            Imprimir
          </Button>
          <Link href="/historico" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
            ← Histórico
          </Link>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Panel
            title="As cartas na mesa"
            subtitle={`${drawn.length} posições · ${reading.algorithm} · ${reading.cuts} corte(s) · seed ${reading.seed}`}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone="gold" title="Reprodutibilidade: o servidor volta a distribuir a partir do registo e compara carta a carta">
                  {payload.replay.matches === true ? 'replay coincide ✓' : payload.replay.matches === false ? 'replay divergente' : 'replay não verificável'}
                </Badge>
                {reading.allowReversed ? <Badge tone="neutral">invertidas permitidas</Badge> : <Badge tone="neutral">só direitas</Badge>}
              </div>
            }
          >
            <ol className={`grid gap-2.5 ${drawn.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : drawn.length <= 6 ? 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-7'}`}>
              {drawn.map((card, index) => (
                <li key={`${card.positionId}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(selected === card.positionId ? null : card.positionId)}
                    aria-pressed={selected === card.positionId}
                    className={`block w-full rounded-lg border p-1 text-left transition-colors ${selected === card.positionId ? 'border-gold bg-gold/10' : 'border-transparent hover:border-gold/50'}`}
                  >
                    <span className="card-face block h-[112px] w-full sm:h-[128px]">
                      <CardArt cardId={card.cardId} theme={deckTheme} orientation={card.orientation} eager={index < 4} />
                    </span>
                    <span className="mt-1 block truncate text-[11px] font-medium">{card.definition?.name.pt ?? card.cardId}</span>
                    <span className="block truncate text-[10px] text-[var(--text-muted)]">
                      {index + 1}. {spread?.positions.find((position) => position.id === card.positionId)?.label ?? card.positionId}
                    </span>
                    {card.orientation === 'reversed' ? <span className="mt-0.5 inline-block rounded bg-wine/40 px-1 text-[9px] uppercase tracking-wide">invertida</span> : null}
                  </button>
                </li>
              ))}
            </ol>
            {payload.replay.note ? <p className="mt-2 text-[11px] text-[var(--text-muted)]">{payload.replay.note}</p> : null}
          </Panel>

          {interpretation ? (
            <article className="space-y-4">
              <nav aria-label="Secções da interpretação" className="sticky top-14 z-30 -mx-1 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface-solid)]/95 px-1 py-1 backdrop-blur">
                <ul className="flex gap-1">
                  {SECTION_ORDER.map((section) => (
                    <li key={section.key}>
                      <a href={`#sec-${section.key}`} className="block whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text)]" title={section.note}>
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <InterpretationBody interpretation={interpretation} live={streaming ? live : null} selected={selected} onPickPosition={setSelected} />
            </article>
          ) : (
            <Panel title="Ainda sem interpretação" subtitle="O motor simbólico produz a leitura completa em segundos, sem rede e sem chave de API.">
              <div className="flex flex-wrap gap-2">
                <Button variant="gold" onClick={() => void regenerate(false)}>
                  Interpretar com IA híbrida
                </Button>
                <Button variant="outline" onClick={() => void regenerate(true)}>
                  Só motor simbólico
                </Button>
              </div>
            </Panel>
          )}

          {streaming ? (
            <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]" role="status">
              <span aria-hidden className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" /> a escrever a interpretação…
              <Button size="sm" variant="ghost" onClick={() => controller.current?.abort()}>
                interromper
              </Button>
            </p>
          ) : null}
          {error ? <p role="alert" className="rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">{error}</p> : null}

          <ChatPanel
            readingId={id}
            initial={payload.chat}
            positions={(spread?.positions ?? []).map((position) => ({ id: position.id, label: position.label }))}
            onSafety={(message) => toast(message, 'info')}
          />
        </div>

        <aside className="space-y-4">
          {interpretation ? <AnalysisPanel interpretation={interpretation} /> : null}
          <Panel title="Registo técnico">
            <dl className="grid gap-1.5 text-xs">
              <Row label="Gerador" value={interpretation ? (interpretation.meta.generator === 'llm' ? `LLM · ${interpretation.meta.provider ?? ''} ${interpretation.meta.model ?? ''}` : 'motor simbólico local') : '—'} />
              <Row label="Voz / registo / profundidade" value={`${reading.interpretation?.meta.voice ?? prefs.voice} · ${reading.interpretation?.meta.register ?? prefs.register} · ${reading.interpretation?.meta.depth ?? prefs.depth}`} />
              <Row label="Custos desta leitura" value={payload.interpretations[0]?.costUsd != null ? `${payload.interpretations[0].costUsd.toFixed(4)} USD · ${payload.interpretations[0].tokensIn ?? 0}↓ ${payload.interpretations[0].tokensOut ?? 0}↑` : 'sem chamada de modelo'} />
              <Row label="Latência" value={interpretation?.meta.latencyMs ? `${interpretation.meta.latencyMs} ms` : '—'} />
              <Row label="Hash do contexto" value={interpretation?.meta.contextHash ?? '—'} />
              <Row label="Duração do ritual" value={formatDuration(reading.durationSeconds)} />
              <Row label="Ambiente" value={reading.environment} />
              <Row label="Modo de compra" value={reading.drawMode} />
              <Row label="Leituras guardadas" value={String(payload.interpretations.length)} />
            </dl>
            {payload.interpretations.length > 1 ? (
              <div className="mt-3 border-t border-[var(--line)] pt-2">
                <h3 className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Histórico de interpretações</h3>
                <ul className="mt-1 space-y-1 text-[11px]">
                  {payload.interpretations.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {formatDateTime(row.createdAt)} · {row.voice}/{row.register}
                      </span>
                      <Badge tone={row.generator === 'llm' ? 'astral' : 'neutral'}>{row.generator}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void regenerate(false)} loading={streaming}>
                Recompor com IA
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void regenerate(true)} disabled={streaming}>
                Só local
              </Button>
            </div>
          </Panel>

          <Panel title="Nota privada" subtitle="Fica só no teu registo; nunca entra na partilha.">
            <TextArea rows={4} value={note ?? ''} onChange={(event) => setNote(event.target.value.slice(0, 2000))} placeholder="O que sentiste, o que ficou, o que queres rever…" />
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => void patch({ querentNote: note ?? '' }, 'Nota guardada.')} disabled={(note ?? '') === (reading.querentNote ?? '')}>
                Guardar nota
              </Button>
              <span className="text-[11px] text-[var(--text-muted)]">{(note ?? '').length}/2000</span>
            </div>
          </Panel>

          <Panel title="Preferências desta leitura" subtitle="Mudam a próxima interpretação; a guardada fica como está.">
            <div className="space-y-2.5">
              <Field label="Voz">
                <Select value={prefs.voice} onChange={(event) => patchPrefs({ voice: event.target.value as VoiceKey })} options={(Object.keys(VOICES_UI) as VoiceKey[]).map((value) => ({ value, label: VOICES_UI[value] }))} />
              </Field>
              <Field label="Registo">
                <Select value={prefs.register} onChange={(event) => patchPrefs({ register: event.target.value as Register })} options={(Object.keys(REGISTERS_UI) as Register[]).map((value) => ({ value, label: REGISTERS_UI[value] }))} />
              </Field>
              <Field label="Profundidade">
                <Select value={prefs.depth} onChange={(event) => patchPrefs({ depth: event.target.value as Depth })} options={(Object.keys(DEPTHS_UI) as Depth[]).map((value) => ({ value, label: DEPTHS_UI[value] }))} />
              </Field>
            </div>
          </Panel>

          {interpretation?.disclaimers.length ? (
            <Panel title="Limites declarados" subtitle="O motor acrescenta estes avisos quando a leitura toca em áreas que não são suas.">
              <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                {interpretation.disclaimers.map((disclaimer) => (
                  <li key={disclaimer} className="rounded border border-[var(--line)] px-2 py-1.5 text-pretty">
                    {disclaimer}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <DangerZone id={id} onDeleted={() => window.location.assign('/historico')} />
        </aside>
      </div>
    </div>
  )
}

const VOICES_UI: Record<string, string> = { mistica: 'Mística', acolhedora: 'Acolhedora', direta: 'Direta', sabia: 'Sábia', poetica: 'Poética', analitica: 'Analítica' }
const REGISTERS_UI: Record<string, string> = { narrativa: 'Narrativa', psicologica: 'Psicológica', espiritual: 'Espiritual', pratica: 'Prática', tradicional: 'Tradicional', poetica: 'Poética' }
const DEPTHS_UI: Record<string, string> = { breve: 'Breve', normal: 'Normal', profunda: 'Profunda', 'muito-profunda': 'Muito profunda' }

function payloadHasBody(payload: ReadingPayload | null): boolean {
  return !!payload?.interpretations[0]?.body
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--line)] pb-1 last:border-0">
      <dt className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className="min-w-0 truncate text-right" title={value}>
        {value}
      </dd>
    </div>
  )
}

function InterpretationBody({ interpretation, live, selected, onPickPosition }: { interpretation: Interpretation; live: Record<string, string> | null; selected: string | null; onPickPosition: (id: string | null) => void }) {
  const balance = interpretation.elementBalance
  return (
    <>
      <section id="sec-opening" className="panel p-4">
        <SectionHead label={SECTION_ORDER[0]!.label} note={SECTION_ORDER[0]!.note} generator={interpretation.meta.generator} />
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-pretty">{live?.opening ?? interpretation.opening}</p>
        {live?.opening === undefined ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Tema dominante: <span className="text-gold-bright">{interpretation.dominantTheme}</span>
          </p>
        ) : null}
      </section>

      <section id="sec-per-card" className="panel p-4">
        <SectionHead label={SECTION_ORDER[1]!.label} note={SECTION_ORDER[1]!.note} />
        <ol className="mt-2 space-y-3">
          {interpretation.perCard.map((item, index) => (
            <li
              key={`${item.positionId}-${item.cardId}-${index}`}
              data-selected={selected === item.positionId ? 'true' : undefined}
              className={`rounded-lg border p-3 transition-colors ${selected === item.positionId ? 'border-gold bg-gold/10' : 'border-[var(--line)] bg-black/20'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  <button type="button" onClick={() => onPickPosition(selected === item.positionId ? null : item.positionId)} className="text-left hover:text-gold-bright">
                    {index + 1}. {item.cardName} <span className="text-[var(--text-muted)]">em “{item.positionLabel}”</span>
                    {item.orientation === 'reversed' ? <span className="ml-1 text-[11px] uppercase text-wine/90">invertida</span> : null}
                  </button>
                </h3>
                <Link href={`/baralho/${item.cardId}`} className="text-[11px] text-gold-bright underline-offset-4 hover:underline">
                  ficha da carta
                </Link>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty">{live?.['per-card'] ?? item.core}</p>
              {live?.['per-card'] ? null : (
                <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                  <Detail label="Posição modula" value={item.positionModulation} />
                  <Detail label="Na tua pergunta" value={item.questionLink} />
                  <Detail label="Emoção / padrão" value={item.emotion} />
                  <Detail label="Obstáculo" value={item.obstacle} />
                  <Detail label="Abertura" value={item.opportunity} />
                  <Detail label="Conselho" value={item.advice} />
                </dl>
              )}
              {item.connections.length ? (
                <ul className="mt-2 space-y-1 border-t border-[var(--line)] pt-2 text-xs text-[var(--text-muted)]">
                  {item.connections.map((connection) => (
                    <li key={connection} className="text-pretty">
                      {connection}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section id="sec-combinations" className="panel p-4">
        <SectionHead label={SECTION_ORDER[2]!.label} note={SECTION_ORDER[2]!.note} />
        {live?.combinations ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{live.combinations}</p> : null}
        <ul className="mt-2 space-y-2 text-sm">
          {interpretation.combinations.map((combination, index) => (
            <li key={`${combination.cards.join('-')}-${index}`} className="rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{combination.cards.join(' + ')}</span>
                <Badge tone={combination.kind === 'tensao' || combination.kind === 'sombra' ? 'wine' : combination.kind === 'reforco' ? 'ok' : 'neutral'}>{combination.kind}</Badge>
                <span className="text-[11px] text-[var(--text-muted)]">{combination.positions.join(' ↔ ')}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{combination.note}</p>
            </li>
          ))}
        </ul>
        {interpretation.patterns.length ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {interpretation.patterns.map((pattern) => (
              <div key={pattern.title} className="rounded-lg border border-[var(--line)] p-2.5">
                <h3 className="text-xs font-semibold text-gold-bright">{pattern.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{pattern.detail}</p>
                {pattern.implication ? <p className="mt-1 text-xs leading-relaxed text-pretty">{pattern.implication}</p> : null}
                <ul className="mt-1 flex flex-wrap gap-1">
                  {pattern.cards.map((cardId) => (
                    <li key={cardId}>
                      <Link href={`/baralho/${cardId}`} className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:border-gold">
                        {getCard(cardId)?.name.pt ?? cardId}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Bars
            label="Equilíbrio de elementos"
            data={[
              { label: 'Fogo', value: balance.fire },
              { label: 'Água', value: balance.water },
              { label: 'Ar', value: balance.air },
              { label: 'Terra', value: balance.earth },
              { label: 'Espírito', value: balance.spirit },
            ]}
          />
          <div className="text-xs text-[var(--text-muted)]">
            {interpretation.majorsCount} maiores · {interpretation.reversedCount} invertidas · {balance.total} cartas
            <Link href="/estatisticas" className="ml-2 text-gold-bright underline-offset-4 hover:underline">
              ver as tuas tendências
            </Link>
          </div>
        </div>
      </section>

      <SectionList id="sec-synthesis" label={SECTION_ORDER[3]!.label} note={SECTION_ORDER[3]!.note} items={live?.synthesis ? live.synthesis.split('\n').filter(Boolean) : interpretation.synthesis} live={!!live?.synthesis} />
      <SectionList id="sec-guidance" label={SECTION_ORDER[4]!.label} note={SECTION_ORDER[4]!.note} items={interpretation.practical} accent />
      <SectionList id="sec-reflection" label={SECTION_ORDER[5]!.label} note={SECTION_ORDER[5]!.note} items={interpretation.reflection} />

      <section id="sec-closing" className="panel p-4">
        <SectionHead label={SECTION_ORDER[6]!.label} note={SECTION_ORDER[6]!.note} />
        <p className="mt-2 whitespace-pre-wrap font-display text-lg leading-relaxed text-pretty">{live?.closing ?? interpretation.closing}</p>
      </section>
    </>
  )
}

function SectionList({ id, label, note, items, accent, live }: { id: string; label: string; note: string; items: string[]; accent?: boolean; live?: boolean }) {
  return (
    <section id={id} className="panel p-4">
      <SectionHead label={label} note={note} />
      {live ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{items.join('\n')}</p> : null}
      {!live ? (
        <ol className="mt-2 space-y-2 text-sm leading-relaxed">
          {items.map((item, index) => (
            <li key={`${id}-${index}`} className={accent ? 'flex gap-2.5' : 'flex gap-2.5'}>
              <span aria-hidden className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent ? 'bg-gold' : 'bg-astral'}`} />
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}

function SectionHead({ label, note, generator }: { label: string; note?: string; generator?: 'local' | 'llm' }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2">
      <h2 className="font-display text-base tracking-wide text-gold-bright">{label}</h2>
      <span className="text-[11px] text-[var(--text-muted)]">
        {note}
        {generator ? ` · ${generator === 'llm' ? 'texto do modelo, validado pelo esquema' : 'texto do motor simbólico'}` : ''}
      </span>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className="text-pretty">{value}</dd>
    </div>
  )
}

function AnalysisPanel({ interpretation }: { interpretation: Interpretation }) {
  return (
    <Panel title="Leitura estruturada" subtitle="O que o motor determinístico extraiu antes de qualquer modelo falar.">
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <Row label="Maiores" value={String(interpretation.majorsCount)} />
        <Row label="Invertidas" value={String(interpretation.reversedCount)} />
        <Row label="Combinações" value={String(interpretation.combinations.length)} />
        <Row label="Padrões" value={String(interpretation.patterns.length)} />
      </dl>
      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Elementos</h3>
        <Bars
          label="Distribuição de elementos"
          color="var(--color-astral)"
          data={[
            { label: 'Fogo', value: interpretation.elementBalance.fire },
            { label: 'Água', value: interpretation.elementBalance.water },
            { label: 'Ar', value: interpretation.elementBalance.air },
            { label: 'Terra', value: interpretation.elementBalance.earth },
            { label: 'Espírito', value: interpretation.elementBalance.spirit },
          ]}
        />
      </div>
    </Panel>
  )
}

function ChatPanel({ readingId, initial, positions, onSafety }: { readingId: string; initial: ChatRow[]; positions: { id: string; label: string }[]; onSafety: (message: string) => void }) {
  const { sfx, toast } = useApp()
  const [messages, setMessages] = useState<ChatRow[]>(initial)
  const [draft, setDraft] = useState('')
  const [focus, setFocus] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initial)
  }, [initial])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    setSending(true)
    setError(null)
    const optimistic: ChatRow = { id: `tmp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages((current) => [...current, optimistic])
    setDraft('')
    try {
      const response = await api<{ reply: string; usedLlm: boolean; outOfScope: boolean; focusPositions: string[]; fromCache: boolean; safety?: { blocked: boolean; message?: string } }>(`/api/readings/${readingId}/chat`, {
        method: 'POST',
        body: { message: text, ...(focus ? { focus } : {}) },
      })
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimistic.id),
        { id: `u-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() },
        { id: `a-${Date.now()}`, role: 'assistant', content: response.reply, created_at: new Date().toISOString(), focus_positions: response.focusPositions, used_llm: response.usedLlm ? 1 : 0, out_of_scope: response.outOfScope ? 1 : 0 },
      ])
      if (response.safety?.blocked && response.safety.message) onSafety(response.safety.message)
      sfx(response.usedLlm ? 'confirm' : 'select', { gain: 0.5 })
      if (response.outOfScope) toast('A resposta ficou fora do âmbito da tiragem: volta às cartas quando quiseres.', 'info')
    } catch (caught) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id))
      setDraft(text)
      setError(caught instanceof ApiError ? caught.message : 'A conversa falhou.')
      sfx('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <Panel
      title="Continuar a ler"
      subtitle="Perguntas sobre esta tiragem. O contexto enviado são as tuas cartas e a pergunta — e nada é inventado: se a conversa não tiver a ver com a leitura, o motor diz-no."
      actions={<Badge tone="neutral">{messages.length} mensagens</Badge>}
    >
      <div ref={listRef} className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? <p className="py-4 text-center text-sm text-[var(--text-muted)]">Ainda não há conversa. Podes começar por perguntar “o que muda se a segunda carta estiver no lugar da primeira?”.</p> : null}
        {messages.map((message) => (
          <div key={message.id} className={`rounded-lg border p-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'border-[var(--line)] bg-black/25' : 'border-gold/35 bg-gold/8'}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <span>{message.role === 'user' ? 'tu' : 'arcana'}</span>
              <span className="flex items-center gap-2">
                {message.used_llm ? <Badge tone="astral">llm</Badge> : <Badge tone="neutral">local</Badge>}
                {message.focus_positions?.length ? <span>foco: {message.focus_positions.join(', ')}</span> : null}
                {formatDateTime(message.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
          </div>
        ))}
      </div>
      {error ? <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p> : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
        <TextArea
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 1200))}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault()
              void send()
            }
          }}
          placeholder="Pergunta sobre uma posição, uma relação entre cartas, ou o que fazer com isto…"
          aria-label="Mensagem para continuar a leitura"
        />
        <Select value={focus} onChange={(event) => setFocus(event.target.value)} options={[{ value: '', label: 'Sem posição específica' }, ...positions.map((position) => ({ value: position.id, label: `foco: ${position.label}` }))]} aria-label="Posição em foco" />
        <Button variant="gold" onClick={() => void send()} loading={sending} disabled={draft.trim().length === 0}>
          Enviar
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
        Limite de conversa por sessão: 30 mensagens/minuto · Ctrl+Enter envia · {(1200 - draft.length) % 1200} caracteres livres
      </p>
    </Panel>
  )
}

function DangerZone({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const { toast } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <Panel title="Apagar esta leitura" subtitle="Remove do histórico. O registo fica marcado como apagado; com conta podes pedir a eliminação definitiva.">
      {confirming ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            loading={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await api(`/api/readings/${id}`, { method: 'DELETE' })
                toast('Leitura apagada do histórico.', 'ok')
                onDeleted()
              } catch (caught) {
                toast(caught instanceof ApiError ? caught.message : 'Falha ao apagar.', 'erro')
                setBusy(false)
              }
            }}
          >
            Confirmar eliminação
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Apagar leitura
        </Button>
      )}
    </Panel>
  )
}
