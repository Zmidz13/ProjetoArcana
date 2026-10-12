'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, Bars, Button, Field, Panel, Select, Slider, TextArea, TextInput } from '@/components/ui/primitives.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api, formatDate } from '@/lib/api.ts'

interface JournalEntry {
  date: string
  readingId: string | null
  mood: number | null
  sleepHours: number | null
  energy: number | null
  clarity: number | null
  note: string | null
  updatedAt?: string
}

interface ReadingLite {
  id: string
  createdAt: string
  spreadName: string
  question: string
}

function monthRange(reference: Date) {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1))
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0))
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), start, end }
}

const iso = (date: Date) => date.toISOString().slice(0, 10)

const text = (value: unknown): string | null => (value === null || value === undefined ? null : String(value))
const count = (value: unknown): number | null => (value === null || value === undefined || value === '' ? null : Number(value))

function normalizeEntry(row: Record<string, unknown>): JournalEntry {
  return {
    date: String(row.date ?? ''),
    readingId: text(row.reading_id ?? row.readingId),
    mood: count(row.mood),
    sleepHours: count(row.sleep_hours ?? row.sleepHours),
    energy: count(row.energy),
    clarity: count(row.clarity),
    note: text(row.note),
    updatedAt: text(row.updated_at ?? row.updatedAt) ?? undefined,
  }
}

/** Diário: o estado reportado por dia, ligado às leituras. Nada aqui é medido por nós — é declarado por ti. */
export function JournalPanel() {
  const { toast, sfx } = useApp()
  const today = useMemo(() => new Date(), [])
  const [reference, setReference] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))
  const { from, to, start } = useMemo(() => monthRange(reference), [reference])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [readings, setReadings] = useState<ReadingLite[]>([])
  const [selected, setSelected] = useState<string>(iso(today))
  // `?date=` vem do calendário (botão "anotar no diário")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const wanted = params.get('date')
    if (wanted && /^\d{4}-\d{2}-\d{2}$/.test(wanted)) {
      setSelected(wanted)
      setReference(new Date(Date.UTC(Number(wanted.slice(0, 4)), Number(wanted.slice(5, 7)) - 1, 1)))
    }
  }, [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ mood: number; energy: number; clarity: number; sleepHours: number; note: string; readingId: string }>({ mood: 3, energy: 3, clarity: 3, sleepHours: 7.5, note: '', readingId: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // o servidor devolve colunas SQL em snake_case: normalizamos aqui, uma só vez
      const response = await api<{ entries: Record<string, unknown>[]; readings: Record<string, unknown>[] }>(`/api/journal?de=${from}&ate=${to}`)
      setEntries(response.entries.map(normalizeEntry))
      setReadings(
        response.readings.map((row) => ({
          id: String(row.id ?? ''),
          createdAt: String(row.date ?? row.created_at ?? ''),
          spreadName: String(row.spread_name ?? row.spreadName ?? 'Tiragem'),
          question: String(row.question ?? ''),
        })),
      )
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Falha a ler o diário.')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const existing = entries.find((entry) => entry.date === selected)
    setDraft({
      mood: existing?.mood ?? 3,
      energy: existing?.energy ?? 3,
      clarity: existing?.clarity ?? 3,
      sleepHours: existing?.sleepHours ?? 7.5,
      note: existing?.note ?? '',
      readingId: existing?.readingId ?? '',
    })
  }, [selected, entries])

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/journal', {
        method: 'POST',
        body: {
          date: selected,
          mood: draft.mood,
          energy: draft.energy,
          clarity: draft.clarity,
          sleepHours: draft.sleepHours,
          note: draft.note.slice(0, 4000) || undefined,
          readingId: draft.readingId || undefined,
        },
      })
      sfx('confirm')
      toast(`Dia ${formatDate(selected)} guardado.`, 'ok')
      await load()
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao guardar.', 'erro')
    } finally {
      setSaving(false)
    }
  }

  const byDate = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries])
  const days = useMemo(() => {
    const list: { date: string; inMonth: boolean }[] = []
    const firstWeekday = (start.getUTCDay() + 6) % 7
    const cursor = new Date(start)
    cursor.setUTCDate(cursor.getUTCDate() - firstWeekday)
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(cursor)
      list.push({ date: iso(date), inMonth: date.getUTCMonth() === start.getUTCMonth() })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return list
  }, [start])

  const series = (key: 'mood' | 'energy' | 'clarity' | 'sleepHours') =>
    entries
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({ label: entry.date.slice(5), value: Number(entry[key] ?? 0), hint: entry.note?.slice(0, 60) }))

  const filled = entries.filter((entry) => entry.date >= from && entry.date <= to).length

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel
        title={`Diário de ${reference.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
        subtitle={`${filled} dias registados este mês. O diário é teu: nada é inferido automaticamente.`}
        actions={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setReference(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1)))} aria-label="Mês anterior">
              ←
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReference(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1)))} aria-label="Mês seguinte">
              →
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReference(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))}>
              hoje
            </Button>
          </div>
        }
      >
        {error ? <p role="alert" className="mb-2 text-sm text-rose-300">{error}</p> : null}
        <div role="grid" aria-label="Dias do mês" className="grid grid-cols-7 gap-1 text-center text-xs">
          {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((weekday) => (
            <span key={weekday} className="pb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {weekday}
            </span>
          ))}
          {days.map((day) => {
            const entry = byDate.get(day.date)
            const isToday = day.date === iso(today)
            const isSelected = day.date === selected
            const average = entry ? [entry.mood, entry.energy, entry.clarity].filter((value): value is number => typeof value === 'number').reduce((sum, value) => sum + value, 0) / 3 : 0
            return (
              <button
                key={day.date}
                type="button"
                role="gridcell"
                onClick={() => setSelected(day.date)}
                aria-current={isToday ? 'date' : undefined}
                aria-selected={isSelected}
                className={`flex h-14 flex-col items-center justify-center rounded-md border text-[11px] transition-colors ${
                  isSelected ? 'border-gold bg-gold/15' : day.inMonth ? 'border-[var(--line)] hover:border-gold/50' : 'border-transparent text-[var(--text-muted)]/50'
                }`}
              >
                <span className={isToday ? 'font-bold text-gold-bright' : ''}>{Number(day.date.slice(8))}</span>
                {entry ? (
                  <span className="mt-0.5 flex items-center gap-0.5" title={`mood ${entry.mood ?? '—'} · energia ${entry.energy ?? '—'} · clareza ${entry.clarity ?? '—'}`}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: hueFor(average) }} />
                    {entry.readingId ? <span className="h-1.5 w-1.5 rounded-full bg-gold" /> : null}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Humor', 'mood'],
              ['Energia', 'energy'],
              ['Clareza', 'clareza'],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <h3 className="mb-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</h3>
              <Bars label={`Evolução de ${label}`} data={series(key === 'clareza' ? 'clarity' : key)} />
            </div>
          ))}
          <div>
            <h3 className="mb-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Sono (horas)</h3>
            <Bars label="Horas de sono declaradas" color="var(--color-astral)" data={series('sleepHours')} />
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-muted)]">
          O que está aqui é declarado por ti e serve para veres padrões teus — não é avaliação clínica nem comparação com mais ninguém.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel title={`Registo de ${formatDate(selected)}`} actions={loading ? <Badge tone="neutral">a ler…</Badge> : byDate.get(selected) ? <Badge tone="ok">existe</Badge> : <Badge tone="neutral">novo</Badge>}>
          <div className="space-y-3">
            <Field label={`Humor: ${draft.mood}/5`}>
              <Slider label="Humor" min={1} max={5} step={1} value={draft.mood} format={(value) => `${value}/5`} onChange={(value) => setDraft({ ...draft, mood: value })} />
            </Field>
            <Field label={`Energia: ${draft.energy}/5`}>
              <Slider label="Energia" min={1} max={5} step={1} value={draft.energy} format={(value) => `${value}/5`} onChange={(value) => setDraft({ ...draft, energy: value })} />
            </Field>
            <Field label={`Clareza: ${draft.clarity}/5`} hint="Quão nítida ficou a questão depois da leitura.">
              <Slider label="Clareza" min={1} max={5} step={1} value={draft.clarity} format={(value) => `${value}/5`} onChange={(value) => setDraft({ ...draft, clarity: value })} />
            </Field>
            <Field label={`Sono: ${draft.sleepHours.toFixed(1)} h`}>
              <Slider label="Horas de sono" min={0} max={16} step={0.5} value={draft.sleepHours} format={(value) => `${value.toFixed(1)} h`} onChange={(value) => setDraft({ ...draft, sleepHours: value })} />
            </Field>
            <Field label="Leitura associada" hint="Opcional: liga este dia a uma leitura do histórico.">
              <Select
                value={draft.readingId}
                onChange={(event) => setDraft({ ...draft, readingId: event.target.value })}
                options={[{ value: '', label: 'Nenhuma' }, ...readings.map((reading) => ({ value: reading.id, label: `${reading.createdAt.slice(0, 10)} · ${reading.spreadName}${reading.question ? ` · ${reading.question.slice(0, 28)}` : ''}` }))]}
              />
            </Field>
            <Field label="Nota do dia">
              <TextArea rows={4} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value.slice(0, 4000) })} placeholder="O que ficou, o que mudou, o que queres rever…" />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="gold" onClick={() => void save()} loading={saving}>
                Guardar dia
              </Button>
              <TextInput type="date" value={selected} min={from} max={to} onChange={(event) => event.target.value && setSelected(event.target.value)} className="w-40" aria-label="Escolher outro dia" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function hueFor(average: number): string {
  if (!average) return 'rgba(255,255,255,.25)'
  const ratio = Math.max(0, Math.min(1, (average - 1) / 4))
  return `hsl(${Math.round(6 + ratio * 140)}, 70%, 55%)`
}
