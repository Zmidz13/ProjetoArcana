'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { Badge, Button, Field, Panel, Skeleton, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt, MoonDial } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { api, formatDate } from '@/lib/api.ts'
import { getCard } from '@/domain/content.ts'

interface DailyOutcome {
  date: string
  seed: number
  spreadId: string
  drawn: { positionId: string; cardId: string; orientation: 'upright' | 'reversed' }[]
  moon: { illum: number; phase: string; age: number; sign: string }
  previousFullMoon: string | null
  nextSabbat: { id: string; name: string; theme: string; spreadSuggestion: string; daysUntil: number } | null
  sabbatToday: { id: string; name: string; theme: string; spreadSuggestion: string } | null
  personalised: boolean
  today: boolean
  editableSalt: boolean
}

/** Carta do dia: determinística por data + salt pessoal, com Lua e sabbat por cima. */
export function DailyCard({ compact = false }: { compact?: boolean }) {
  const { deckTheme, prefs, toast, sfx } = useApp()
  const [daily, setDaily] = useState<DailyOutcome | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saltDraft, setSaltDraft] = useState(prefs.dailySalt)
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    async (salt: string) => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams()
        if (salt) query.set('salt', salt)
        setDaily(await api<DailyOutcome>(`/api/daily${query.toString() ? `?${query}` : ''}`))
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Não foi possível ler a carta do dia.')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    void load(prefs.dailySalt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveSalt = async () => {
    setSaving(true)
    try {
      await api('/api/preferences', { method: 'PUT', body: { dailySalt: saltDraft.slice(0, 40) } })
      await load(saltDraft)
      toast(saltDraft ? 'Salt guardado: a carta do dia passa a ser tua.' : 'Salt removido: volta à carta comum.', 'ok')
      sfx('confirm')
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : 'Falha ao guardar.', 'erro')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className={compact ? 'h-56 w-full rounded-xl' : 'h-72 w-full rounded-xl'} />
  if (error || !daily) return <Panel title="Carta do dia indisponível" subtitle={error ?? 'Resposta vazia.'} />

  const first = daily.drawn[0]
  const card = first ? getCard(first.cardId) : undefined
  const meaning = first && card ? (first.orientation === 'reversed' ? card.meanings.reversed : card.meanings.upright) : ''

  return (
    <Panel
      title={daily.today ? 'Carta do dia' : `Carta de ${formatDate(daily.date)}`}
      subtitle={
        <>
          Motor simbólico · seed <code className="kbd">{daily.seed}</code> · algoritmo místico · {daily.personalised ? 'personalizada pelo teu salt' : 'comum a todas as pessoas hoje'}
        </>
      }
      actions={
        <div className="flex items-center gap-2">
          {daily.sabbatToday ? <Badge tone="wine" title={daily.sabbatToday.theme}>{daily.sabbatToday.name}</Badge> : null}
          {daily.nextSabbat ? <Badge tone="neutral">{daily.nextSabbat.name} em {daily.nextSabbat.daysUntil} d</Badge> : null}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(120px,168px)_minmax(0,1fr)]">
        <div className="space-y-2">
          {first && card ? (
            <Link href={`/baralho/${card.id}`} className="block card-face animate-veil-in hover:brightness-110" title={`Ver a ficha completa de ${card.name.pt}`}>
              <CardArt cardId={card.id} theme={deckTheme} orientation={first.orientation} eager />
            </Link>
          ) : null}
          <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-2 py-1.5">
            <MoonDial illum={daily.moon.illum} phase={daily.moon.phase} age={daily.moon.age} />
            <dl className="min-w-0 text-[11px] leading-snug text-[var(--text-muted)]">
              <div>
                <dt className="sr-only">Fase lunar</dt>
                <dd className="truncate text-[var(--text)]">{daily.moon.phase}</dd>
                <dd>{Math.round(daily.moon.illum * 100)}% · {daily.moon.age.toFixed(1)} d</dd>
              </div>
              <div className="mt-1">
                <dt className="sr-only">Lua cheia anterior</dt>
                <dd>{daily.previousFullMoon ? formatDate(daily.previousFullMoon) : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="font-display text-xl leading-tight">
              {card?.name.pt}
              {first?.orientation === 'reversed' ? <span className="ml-2 text-sm font-normal text-wine/90">(invertida)</span> : null}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)] text-pretty">{meaning}</p>
          </div>
          {!compact ? (
            <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
              <li className="rounded border border-[var(--line)] px-2 py-1.5">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Amor</span>
                {card?.domains.love}
              </li>
              <li className="rounded border border-[var(--line)] px-2 py-1.5">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Trabalho</span>
                {card?.domains.career}
              </li>
              <li className="rounded border border-[var(--line)] px-2 py-1.5">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Sombra</span>
                {card?.guidance.obstacles}
              </li>
              <li className="rounded border border-[var(--line)] px-2 py-1.5">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Conselho</span>
                {card?.guidance.advice[0]}
              </li>
            </ul>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/ritual/card-of-the-day?auto=1" className="rounded-md bg-gold px-3 py-2 text-sm font-medium text-[#12100a] hover:bg-gold-bright">
              Registar a carta do dia
            </Link>
            <Link href="/calendario" className="rounded-md border border-[var(--line)] px-3 py-2 text-sm hover:border-gold">
              Ver calendário lunar
            </Link>
            {daily.sabbatToday ? (
              <Link href={`/ritual/${daily.sabbatToday.spreadSuggestion}`} className="rounded-md border border-wine/60 bg-wine/25 px-3 py-2 text-sm hover:border-gold">
                Tiragem do sabbat: {daily.sabbatToday.name}
              </Link>
            ) : null}
          </div>
          <div className="rounded-lg border border-[var(--line)] p-3">
            <Field label="Salt pessoal da carta do dia" hint="A mesma data com um salt diferente dá uma carta diferente — só tua, e reprodutível.">
              <div className="flex gap-2">
                <TextInput value={saltDraft} onChange={(event) => setSaltDraft(event.target.value.slice(0, 40))} placeholder="ex.: nome, cidade, um número" disabled={!daily.editableSalt} />
                <Button variant="outline" onClick={() => void saveSalt()} loading={saving} disabled={!daily.editableSalt}>
                  Guardar
                </Button>
              </div>
            </Field>
            {!daily.editableSalt ? <p className="mt-1.5 text-xs text-[var(--text-muted)]">Entra na tua conta para fixar um salt (fica nas preferências da conta).</p> : null}
          </div>
        </div>
      </div>
    </Panel>
  )
}
