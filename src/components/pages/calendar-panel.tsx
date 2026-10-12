'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, Button, Field, Panel, Skeleton, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt, MoonDial } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api, formatDate } from '@/lib/api.ts'
import { getCard } from '@/domain/content.ts'
import { SABBATS } from '@/engine/cycle.ts'
import { ENVIRONMENT_LIST } from '@/domain/experience.ts'

interface CalendarDay {
  date: string
  cardId: string | null
  orientation: 'upright' | 'reversed' | null
  phase: string
  sabbat: string | null
  seed: number
}

interface MoonDay {
  date: string
  illum: number
  phase: string
  age: number
}

interface CalendarPayload {
  from: string
  days: number
  series: CalendarDay[]
  moons: MoonDay[]
  sabbats: { id: string; name: string; month: number; day: number; theme: string; spreadSuggestion: string }[]
  accuracyNote: string
}

/**
 * Calendário simbólico: uma carta por dia (determinística), fase lunar e sabbats.
 * É apresentado como tradição e memória visual — nunca como previsão.
 */
export function CalendarPanel() {
  const { deckTheme, sfx } = useApp()
  const today = useMemo(() => new Date(), [])
  const [reference, setReference] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))
  const [salt, setSalt] = useState<string | null>(null)
  const [payload, setPayload] = useState<CalendarPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string>(today.toISOString().slice(0, 10))

  const { from, days } = useMemo(() => {
    const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1))
    const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0))
    const firstWeekday = (start.getUTCDay() + 6) % 7
    return { from: new Date(start.getTime() - firstWeekday * 86400000).toISOString().slice(0, 10), days: 42, end: end.toISOString().slice(0, 10) }
  }, [reference])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPayload(await api<CalendarPayload>(`/api/calendar?de=${from}&dias=${days}`))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Falha a ler o calendário.')
    } finally {
      setLoading(false)
    }
  }, [from, days])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void api<{ preferences: { dailySalt: string } }>('/api/preferences')
      .then((response) => setSalt(response.preferences.dailySalt || ''))
      .catch(() => setSalt(''))
  }, [])

  const byDate = useMemo(() => new Map((payload?.series ?? []).map((day) => [day.date, day])), [payload])
  const moonByDate = useMemo(() => new Map((payload?.moons ?? []).map((moon) => [moon.date, moon])), [payload])
  const sabbatDates = useMemo(() => {
    const map = new Map<string, { id: string; name: string; theme: string; spreadSuggestion: string }>()
    const year = reference.getUTCFullYear()
    for (const sabbat of SABBATS) {
      const key = `${year}-${String(sabbat.month).padStart(2, '0')}-${String(sabbat.day).padStart(2, '0')}`
      map.set(key, sabbat)
    }
    return map
  }, [reference])

  const cells = useMemo(() => {
    const list: string[] = []
    const cursor = new Date(`${from}T00:00:00Z`)
    for (let index = 0; index < days; index += 1) {
      list.push(cursor.toISOString().slice(0, 10))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return list
  }, [days, from])

  const selectedDay = byDate.get(selected)
  const selectedCard = selectedDay?.cardId ? getCard(selectedDay.cardId) : undefined
  const nightEnvironment = ENVIRONMENT_LIST.find((item) => item.key === 'jardim-noturno') ?? ENVIRONMENT_LIST[0]!

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Panel
        title={`Calendário de ${reference.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
        subtitle={salt ? `Cartas derivadas da data + o teu salt pessoal (${salt.length} caracteres).` : 'Cartas derivadas só da data — iguais para todas as pessoas, e reprodutíveis.'}
        actions={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setReference(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1)))} aria-label="Mês anterior">←</Button>
            <Button size="sm" variant="ghost" onClick={() => setReference(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1)))} aria-label="Mês seguinte">→</Button>
            <Button size="sm" variant="outline" onClick={() => setReference(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))}>hoje</Button>
          </div>
        }
      >
        {error ? <p role="alert" className="mb-2 text-sm text-rose-300">{error}</p> : null}
        {loading ? (
          <Skeleton className="h-[420px] w-full rounded-xl" />
        ) : (
          <div role="grid" aria-label="Cartas do mês" className="grid grid-cols-7 gap-1">
            {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((weekday) => (
              <span key={weekday} className="pb-1 text-center text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {weekday}
              </span>
            ))}
            {cells.map((date) => {
              const day = byDate.get(date)
              const inMonth = date.slice(0, 7) === `${reference.getUTCFullYear()}-${String(reference.getUTCMonth() + 1).padStart(2, '0')}`
              const sabbat = sabbatDates.get(date)
              const moon = moonByDate.get(date)
              const card = day?.cardId ? getCard(day.cardId) : undefined
              return (
                <button
                  key={date}
                  type="button"
                  role="gridcell"
                  onClick={() => {
                    setSelected(date)
                    sfx('select', { gain: 0.3 })
                  }}
                  onDoubleClick={() => day && window.open(`/ritual/card-of-the-day?seed=${day.seed}`, '_blank')}
                  aria-selected={selected === date}
                  className={`group relative flex flex-col overflow-hidden rounded-md border p-0.5 text-left transition-colors ${selected === date ? 'border-gold' : inMonth ? 'border-[var(--line)] hover:border-gold/50' : 'border-transparent opacity-45'}`}
                  title={`${formatDate(date)} · ${card?.name.pt ?? 'sem carta'}${day?.orientation === 'reversed' ? ' (invertida)' : ''}${moon ? ` · ${moon.phase}` : ''}${sabbat ? ` · ${sabbat.name}` : ''}`}
                >
                  <span className="flex items-center justify-between px-0.5 text-[10px]">
                    <span className={date === today.toISOString().slice(0, 10) ? 'font-bold text-gold-bright' : 'text-[var(--text-muted)]'}>{Number(date.slice(8))}</span>
                    {moon ? <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: `rgba(239,230,214,${0.25 + moon.illum * 0.7})` }} /> : null}
                  </span>
                  <span className="card-face block aspect-[300/520] w-full rounded-[3px]">
                    {day?.cardId ? <CardArt cardId={day.cardId} theme={deckTheme} orientation={day.orientation ?? 'upright'} /> : <span className="skeleton block h-full w-full" />}
                  </span>
                  {sabbat ? <span className="absolute bottom-0.5 left-0.5 rounded bg-wine/80 px-1 text-[8px] uppercase tracking-wide text-[#ffe6f0]">{sabbat.id}</span> : null}
                </button>
              )
            })}
          </div>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">{payload?.accuracyNote ?? 'A fase lunar é calculada por efeméride média: junto da fronteira entre dias pode divergir ±0,5 dia de um almanaque local.'}</p>
      </Panel>

      <div className="space-y-4">
        <Panel title={formatDate(selected)} subtitle="o que o motor determinístico tirou para esse dia">
          {selectedCard && selectedDay ? (
            <div className="space-y-3">
              <div className="card-face mx-auto h-[190px] w-[110px]">
                <CardArt cardId={selectedCard.id} theme={deckTheme} orientation={selectedDay.orientation ?? 'upright'} eager />
              </div>
              <div className="text-center">
                <p className="font-display text-lg leading-tight">{selectedCard.name.pt}</p>
                <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  {selectedDay.orientation === 'reversed' ? 'invertida' : 'direita'} · seed {selectedDay.seed}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-pretty">{selectedDay.orientation === 'reversed' ? selectedCard.meanings.reversed : selectedCard.meanings.upright}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/baralho/${selectedCard.id}`} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold">
                  Ficha completa
                </Link>
                <Link href={`/ritual/card-of-the-day?auto=1`} className="rounded-md bg-gold px-2.5 py-1.5 text-xs font-medium text-[#12100a]">
                  Registar hoje
                </Link>
                <Link href={`/diario?date=${selected}`} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold">
                  Anotar no diário
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Sem carta para esse dia (fora da janela calculada).</p>
          )}
          {moonByDate.get(selected) ? (
            <div className="mt-3 flex items-center gap-3 border-t border-[var(--line)] pt-3">
              <MoonDial illum={moonByDate.get(selected)!.illum} phase={moonByDate.get(selected)!.phase} age={moonByDate.get(selected)!.age} />
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                {moonByDate.get(selected)!.phase} · {Math.round(moonByDate.get(selected)!.illum * 100)}% iluminada
                <br />
                idade {moonByDate.get(selected)!.age.toFixed(1)} dias
              </p>
            </div>
          ) : null}
          {sabbatDates.get(selected) ? (
            <div className="mt-3 rounded-lg border border-wine/50 bg-wine/20 p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ffd8e6]">{sabbatDates.get(selected)!.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{sabbatDates.get(selected)!.theme}</p>
              <Link href={`/ritual/${sabbatDates.get(selected)!.spreadSuggestion}`} className="mt-1.5 inline-block text-xs text-gold-bright underline-offset-4 hover:underline">
                Tiragem sugerida para este sabbat
              </Link>
            </div>
          ) : null}
        </Panel>

        <Panel title="Roda do ano" subtitle="Os oito sabbats, com a tiragem que o ARCANA sugere para cada um.">
          <ul className="space-y-1.5">
            {SABBATS.map((sabbat) => {
              const key = `${reference.getUTCFullYear()}-${String(sabbat.month).padStart(2, '0')}-${String(sabbat.day).padStart(2, '0')}`
              const isNext = payload?.series.some((day) => day.date === key) && key >= today.toISOString().slice(0, 10)
              return (
                <li key={sabbat.id} className="flex items-center gap-2 text-xs">
                  <Badge tone={isNext ? 'gold' : 'neutral'}>
                    {String(sabbat.day).padStart(2, '0')}/{String(sabbat.month).padStart(2, '0')}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate">{sabbat.name}</span>
                  <Link href={`/ritual/${sabbat.spreadSuggestion}`} className="text-[10px] text-gold-bright underline-offset-4 hover:underline">
                    {sabbat.spreadSuggestion}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Datas fixadas por convenção calenda (dia e mês), como na tradição neopagã: não são efemérides astronómicas. Ambiente {nightEnvironment.name.toLowerCase()} sugerido para as noites de roda.
          </p>
        </Panel>

        <Panel title="Salt pessoal">
          <Field label="Sal da carta do dia" hint="Muda a tua sequência sem mudar a de mais ninguém. Guarda-o nas preferências.">
            <TextInput
              value={salt ?? ''}
              onChange={(event) => setSalt(event.target.value.slice(0, 40))}
              placeholder="ex.: o teu nome de batismo, uma cidade"
              disabled={salt === null}
            />
          </Field>
          <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{salt === null ? 'a ler preferências…' : salt === '' ? 'Sem salt: a carta é comum a todas as pessoas.' : `Com salt, a sequência de ${formatDate(today.toISOString().slice(0, 10))} é só tua.`}</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Para fixar o salt: <Link href="/preferencias" className="text-gold-bright underline-offset-4 hover:underline">preferências</Link>.</p>
        </Panel>
      </div>
    </div>
  )
}
