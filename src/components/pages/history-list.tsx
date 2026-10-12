'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, Button, EmptyState, Panel, Segmented, Skeleton, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api, formatDateTime, formatDuration } from '@/lib/api.ts'
import { getCard } from '@/domain/content.ts'
import { SPREADS } from '@/domain/content.ts'
import type { DrawnCard, Orientation } from '@/domain/types.ts'

interface Summary {
  id: string
  createdAt: string
  spreadId: string
  spreadName: string
  question: string
  environment: string
  seed: number
  algorithm: string
  cuts: number
  allowReversed: boolean
  cards: unknown
  starred: boolean
  hasInterpretation: boolean
  shareToken: string | null
  durationSeconds: number | null
  generator: string | null
  voice: string | null
  register: string | null
  depth: string | null
  querentNote?: string
}

/** Histórico real: filtra, favorece, partilha e apaga; cada linha abre a leitura completa. */
export function HistoryList() {
  const { deckTheme, toast, sfx } = useApp()
  const [rows, setRows] = useState<Summary[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'todas' | 'favoritas' | 'partilhadas' | 'sem-ia'>('todas')
  const [spread, setSpread] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api<{ readings: Summary[]; total: number; account: string }>(`/api/readings?limit=100&offset=0`)
      setRows(response.readings)
      setTotal(response.total)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível ler o histórico.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (filter === 'favoritas' && !row.starred) return false
      if (filter === 'partilhadas' && !row.shareToken) return false
      if (filter === 'sem-ia' && row.generator === 'llm') return false
      if (spread && row.spreadId !== spread) return false
      if (!needle) return true
      const cards = parseCards(row.cards)
      const haystack = `${row.question} ${row.spreadName} ${row.querentNote ?? ''} ${cards.map((card) => getCard(card.cardId)?.name.pt ?? '').join(' ')}`.toLowerCase()
      return needle.split(/\s+/).every((word) => haystack.includes(word))
    })
  }, [filter, query, rows, spread])

  const toggleStar = async (row: Summary) => {
    try {
      await api(`/api/readings/${row.id}`, { method: 'PATCH', body: { starred: !row.starred } })
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, starred: !item.starred } : item)))
      sfx('select')
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao favoritar.', 'erro')
    }
  }

  const remove = async (row: Summary) => {
    try {
      await api(`/api/readings/${row.id}`, { method: 'DELETE' })
      setRows((current) => current.filter((item) => item.id !== row.id))
      toast('Leitura removida do histórico.', 'ok')
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao apagar.', 'erro')
    }
  }

  const spreadOptions = useMemo(() => {
    const used = new Map<string, string>()
    rows.forEach((row) => used.set(row.spreadId, row.spreadName))
    SPREADS.forEach((item) => {
      if (!used.has(item.id) && rows.length === 0) used.set(item.id, item.name)
    })
    return [...used.entries()].map(([value, label]) => ({ value: label, id: value }))
  }, [rows])

  return (
    <Panel
      title={`Histórico — ${total ?? rows.length} leituras`}
      subtitle="Tudo o que está aqui vem do registo: seed, algoritmo e cortes reproduzem a tiragem, mesmo sem esta plataforma."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Actualizar
          </Button>
          <Link href="/api/export?format=zip" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold" title="ZIP com JSON legível por máquina + LEIA_ME">
            Exportar ZIP
          </Link>
          <Link href="/api/export?format=csv" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
            CSV
          </Link>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar por pergunta, carta, nota…" aria-label="Procurar no histórico" className="min-w-[220px] flex-1" />
        <Segmented
          label="Filtro"
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todas', label: 'Todas' },
            { value: 'favoritas', label: '★' },
            { value: 'partilhadas', label: 'Partilhadas' },
            { value: 'sem-ia', label: 'Só motor local' },
          ]}
        />
        <select value={spread} onChange={(event) => setSpread(event.target.value)} aria-label="Filtrar por tiragem" className="rounded-md border border-[var(--line)] bg-black/25 px-2 py-1.5 text-xs">
          <option value="">Todas as tiragens</option>
          {spreadOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </select>
      </div>

      {error ? <p role="alert" className="mb-3 rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">{error}</p> : null}

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? 'Ainda não há leituras' : 'Nada com esses filtros'}
          body={rows.length === 0 ? 'Assim que fechares um ritual ele aparece aqui — com conta ou sem ela, ligado a este dispositivo.' : 'Larga a pesquisa ou muda o filtro para veres as outras.'}
          action={
            rows.length === 0 ? (
              <Link href="/mesa" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#12100a]">
                Abrir a mesa
              </Link>
            ) : (
              <Button variant="outline" onClick={() => { setQuery(''); setFilter('todas'); setSpread('') }}>
                Limpar filtros
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((row) => {
            const cards = parseCards(row.cards)
            return (
              <li key={row.id} className="panel p-3">
                <div className="flex flex-wrap items-start gap-3">
                  <ul className="flex gap-1">
                    {cards.slice(0, 4).map((card, index) => (
                      <li key={`${card.cardId}-${index}`} className="card-face h-[54px] w-[31px] shrink-0 sm:h-[62px] sm:w-[36px]">
                        <CardArt cardId={card.cardId} theme={deckTheme} orientation={card.orientation} />
                      </li>
                    ))}
                    {cards.length > 4 ? (
                      <li className="flex h-[54px] items-center rounded border border-[var(--line)] px-1.5 text-[10px] text-[var(--text-muted)] sm:h-[62px]">+{cards.length - 4}</li>
                    ) : null}
                  </ul>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      <span>{formatDateTime(row.createdAt)}</span>
                      <span aria-hidden>·</span>
                      <span>{row.spreadName}</span>
                      {row.generator === 'llm' ? <Badge tone="astral">llm {row.voice}/{row.register}</Badge> : <Badge tone="neutral">motor local</Badge>}
                    </p>
                    <Link href={`/leitura/${row.id}`} className="mt-0.5 block truncate font-display text-base leading-snug text-[var(--text)] hover:text-gold-bright">
                      {row.question || '(sem pergunta escrita)'}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
                      {cards.map((card) => getCard(card.cardId)?.name.pt ?? card.cardId).join(' · ')}
                      {row.querentNote ? ` — nota: ${row.querentNote}` : ''}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--text-muted)]">
                      <span title="Seed + algoritmo + cortes = a mesma tiragem">seed {row.seed}</span>
                      <span>· {row.algorithm}</span>
                      <span>· {row.cuts} corte(s)</span>
                      <span>· {formatDuration(row.durationSeconds)}</span>
                      {row.hasInterpretation ? <span className="text-emerald-300/80">interpretação guardada</span> : <span>sem interpretação</span>}
                      {row.shareToken ? <span className="text-gold-bright">partilhada</span> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant={row.starred ? 'gold' : 'ghost'} sound="none" onClick={() => void toggleStar(row)} aria-label={row.starred ? 'Retirar das favoritas' : 'Marcar como favorita'}>
                      {row.starred ? '★' : '☆'}
                    </Button>
                    <Link href={`/leitura/${row.id}`} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold">
                      Abrir
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => void remove(row)} aria-label={`Apagar a leitura de ${formatDateTime(row.createdAt)}`}>
                      ✕
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

function parseCards(value: unknown): { cardId: string; orientation: Orientation; positionId: string }[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? safeArray(value) : []
  return list
    .filter((item): item is DrawnCard => !!item && typeof item === 'object' && 'cardId' in (item as object))
    .map((item) => ({ cardId: item.cardId, orientation: item.orientation, positionId: item.positionId }))
}

function safeArray(text: string): unknown[] {
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
