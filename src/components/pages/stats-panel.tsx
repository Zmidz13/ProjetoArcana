'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Badge, Bars, Panel, Segmented, Skeleton, Stat } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api, formatDate } from '@/lib/api.ts'
import { CARDS, getCard } from '@/domain/content.ts'

interface StatsPayload {
  totalDraws: number
  dailyDraws: number
  coverage: { seen: number; size: number; ratio: number }
  bySuit: Record<string, { drawn: number; reversed: number }>
  cards: { cardId: string; name: string; timesDrawn: number; timesReversed: number; reversedRatio: number; positions: Record<string, number>; inDaily: number; lastSeenAt: string | null }[]
  totals: { readings: number; days: number; questions: number; minutes: number; starred: number }
  bySpread: { spread_id: string; spread_name: string; count: number }[]
  usage: { calls: number; tokens: number; cost: number; fallbacks: number; days: number }
  streak: number
  lastDay: string | null
  reversedTrend: { day: string; reversed: number; total: number }[]
  deckSize: number
  note: string
}

/** Estatísticas da própria prática. Contagens, não oráculo: a nota do servidor diz isso. */
export function StatsPanel() {
  const { deckTheme } = useApp()
  const [payload, setPayload] = useState<StatsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<'drawn' | 'reversed' | 'never'>('drawn')

  useEffect(() => {
    void api<StatsPayload>('/api/stats')
      .then(setPayload)
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : 'Falha a ler as estatísticas.'))
  }, [])

  const cards = useMemo(() => {
    if (!payload) return []
    const list = payload.cards.slice()
    if (sort === 'reversed') return list.sort((a, b) => b.reversedRatio - a.reversedRatio || b.timesReversed - a.timesReversed).slice(0, 12)
    if (sort === 'never') {
      const seen = new Set(payload.cards.map((card) => card.cardId))
      return CARDS.filter((card) => !seen.has(card.id))
        .slice(0, 24)
        .map((card) => ({ cardId: card.id, name: card.name.pt, timesDrawn: 0, timesReversed: 0, reversedRatio: 0, positions: {}, inDaily: 0, lastSeenAt: null }))
    }
    return list.sort((a, b) => b.timesDrawn - a.timesDrawn).slice(0, 12)
  }, [payload, sort])

  if (error) return <Panel title="Estatísticas indisponíveis" subtitle={error} />
  if (!payload) return <Skeleton className="h-96 w-full rounded-xl" />

  const neverCount = Math.max(0, CARDS.length - payload.cards.length)
  const trend = payload.reversedTrend.slice().reverse().slice(-30)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat label="Leituras" value={payload.totals.readings} tone="gold" hint={`${payload.totals.days} dias diferentes`} />
            <Stat label="Sequência actual" value={`${payload.streak} d`} hint={payload.lastDay ? `último registo ${formatDate(payload.lastDay)}` : 'sem registos'} />
            <Stat label="Perguntas escritas" value={payload.totals.questions} hint="as restantes foram tiragens abertas" />
            <Stat label="Tempo em mesa" value={`${Math.round(payload.totals.minutes)} min`} hint={payload.totals.minutes > 60 ? `${(payload.totals.minutes / 60).toFixed(1)} h acumuladas` : 'ainda pouco — e está tudo bem'} />
          </dl>
        </Panel>
        <Panel title="Cobertura do baralho" subtitle={`${payload.coverage.seen} de ${payload.deckSize} cartas já saíram pelo menos uma vez.`} actions={<Badge tone={neverCount === 0 ? 'ok' : 'neutral'}>{neverCount === 0 ? 'baralho completo' : `faltam ${neverCount}`}</Badge>}>
          <div className="h-2 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Cobertura de ${Math.round(payload.coverage.ratio * 100)}%`}>
            <span className="block h-full rounded-full bg-gradient-to-r from-gold to-astral transition-[width] duration-700" style={{ width: `${Math.round(payload.coverage.ratio * 100)}%` }} />
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(payload.bySuit).map(([key, value]) => (
              <li key={key} className="rounded border border-[var(--line)] px-2 py-1.5">
                <span className="block uppercase tracking-wider text-[var(--text-muted)]">{key.replace('menores-', '')}</span>
                <span className="text-[var(--text)]">{value.drawn} saídas</span>
                <span className="ml-1 text-wine/90">· {value.reversed} invertidas</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Tiragens mais usadas">
          <Bars label="Leituras por tiragem" data={payload.bySpread.map((row) => ({ label: row.spread_name, value: row.count, hint: row.spread_id }))} />
        </Panel>
        <Panel title="Uso de IA" subtitle={`últimos ${payload.usage.days} dias`} actions={<Badge tone={payload.usage.fallbacks > 0 ? 'warn' : 'ok'}>{payload.usage.fallbacks} fallbacks</Badge>}>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Stat label="Chamadas" value={payload.usage.calls} />
            <Stat label="Tokens" value={payload.usage.tokens} />
            <Stat label="Custo" value={`${payload.usage.cost.toFixed(3)} $`} tone="astral" />
            <Stat label="Custo por leitura" value={payload.totals.readings ? `${(payload.usage.cost / payload.totals.readings).toFixed(3)} $` : '—'} />
          </dl>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Quando o orçamento diário das preferências é ultrapassado, o servidor degrada para o motor local e avisa — não há surpresa na factura.
          </p>
        </Panel>
      </div>

      <Panel
        title="As tuas cartas"
        subtitle="Frequência com que saem e com que caem invertidas — o teu baralho, não o de mais ninguém."
        actions={
          <Segmented
            label="Ordenar"
            size="sm"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'drawn', label: 'Mais vistas' },
              { value: 'reversed', label: 'Mais invertidas' },
              { value: 'never', label: 'Ainda não saíram' },
            ]}
          />
        }
      >
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => (
            <li key={card.cardId}>
              <Link href={`/baralho/${card.cardId}`} className="block rounded-lg border border-[var(--line)] p-1.5 transition-colors hover:border-gold/60">
                <span className="card-face block h-[92px] w-full">
                  <CardArt cardId={card.cardId} theme={deckTheme} />
                </span>
                <span className="mt-1 block truncate text-[11px] font-medium">{getCard(card.cardId)?.name.pt ?? card.name}</span>
                <span className="block text-[10px] text-[var(--text-muted)]">
                  {card.timesDrawn > 0 ? `${card.timesDrawn}× · ${Math.round(card.reversedRatio * 100)}% inv.` : 'nunca saiu'}
                </span>
              </Link>
            </li>
          ))}
          {cards.length === 0 ? <li className="col-span-full text-sm text-[var(--text-muted)]">Faz uma leitura e volta aqui.</li> : null}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Invertidas por dia" subtitle="Últimos 30 dias com leituras.">
          <ul className="flex h-28 items-end gap-1" aria-label="Proporção de cartas invertidas por dia">
            {trend.map((day) => (
              <li key={day.day} className="group relative flex-1" title={`${day.day}: ${day.reversed}/${day.total} invertidas`}>
                <span className="block w-full rounded-t bg-gradient-to-t from-gold/70 to-astral/70" style={{ height: `${Math.max(4, (day.reversed / Math.max(1, day.total)) * 100)}%` }} />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] group-hover:block">{Math.round((day.reversed / Math.max(1, day.total)) * 100)}%</span>
              </li>
            ))}
            {trend.length === 0 ? <li className="text-xs text-[var(--text-muted)]">sem dados</li> : null}
          </ul>
        </Panel>
        <Panel title="Enquadramento">
          <p className="text-sm leading-relaxed text-[var(--text-muted)] text-pretty">{payload.note}</p>
          <p className="mt-2 text-sm leading-relaxed text-pretty">
            A frequência com que uma carta aparece diz mais da tua atenção do que do teu destino. Usei os mesmos critérios em todas as contagens: {payload.dailyDraws} saídas vieram da carta do dia e estão incluídas.
          </p>
        </Panel>
      </div>
    </div>
  )
}
