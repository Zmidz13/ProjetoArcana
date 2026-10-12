'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Badge, Button, Panel, Segmented, TextInput, Skeleton } from '@/components/ui/primitives.tsx'
import { SpreadMap } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { api } from '@/lib/api.ts'
import { layoutFor } from '@/engine/layout.ts'
import { SPREADS } from '@/domain/content.ts'
import type { SpreadCategory, SpreadDef } from '@/domain/types.ts'

const CATEGORIES: { value: SpreadCategory | 'todas' | 'fixadas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'fixadas', label: 'Fixadas' },
  { value: 'rapida', label: 'Rápida' },
  { value: 'tres', label: 'Três cartas' },
  { value: 'amor', label: 'Amor' },
  { value: 'autoconhecimento', label: 'Autoconhecimento' },
  { value: 'profissional', label: 'Profissional' },
  { value: 'avancada', label: 'Avançada' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'personalizada', label: 'Personalizada' },
]

/**
 * Painel do catálogo de tiragens. Serve duas páginas: a lista pública (/tiragens, com
 * ficha) e a selecção para a mesa (/mesa, com ligação directa ao ritual).
 */
export function CatalogPanel({ mode = 'browse' }: { mode?: 'browse' | 'pick' }) {
  const { prefs, patchPrefs, session, sfx } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['value']>('todas')
  const [size, setSize] = useState<'todas' | '1' | '2-3' | '4-6' | '7+'>('todas')
  const [mine, setMine] = useState<SpreadDef[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void api<{ spreads: SpreadDef[] }>('/api/catalog')
      .then((response) => {
        if (!alive) return
        const builtin = new Set(SPREADS.map((spread) => spread.id))
        setMine(response.spreads.filter((spread) => !builtin.has(spread.id)))
      })
      .catch((caught) => alive && setError(caught instanceof Error ? caught.message : 'Não foi possível ler o catálogo.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [session?.user?.id])

  const all = useMemo(() => [...SPREADS, ...mine], [mine])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const keywords = needle ? needle.split(/\s+/).filter(Boolean) : []
    return all
      .filter((spread) => {
        if (category === 'fixadas') return prefs.pinnedSpreadIds.includes(spread.id)
        if (category !== 'todas' && spread.category !== category) return false
        if (size === '1' && spread.cardCount !== 1) return false
        if (size === '2-3' && (spread.cardCount < 2 || spread.cardCount > 3)) return false
        if (size === '4-6' && (spread.cardCount < 4 || spread.cardCount > 6)) return false
        if (size === '7+' && spread.cardCount < 7) return false
        if (keywords.length === 0) return true
        const haystack = `${spread.name} ${spread.summary} ${spread.purpose} ${spread.tags.join(' ')} ${spread.positions.map((position) => position.label).join(' ')}`.toLowerCase()
        return keywords.every((keyword) => haystack.includes(keyword))
      })
      .sort((a, b) => {
        const pin = Number(prefs.pinnedSpreadIds.includes(b.id)) - Number(prefs.pinnedSpreadIds.includes(a.id))
        if (pin !== 0) return pin
        return a.cardCount - b.cardCount || a.name.localeCompare(b.name, 'pt')
      })
  }, [all, category, prefs.pinnedSpreadIds, query, size])

  return (
    <Panel
      title={`Catálogo de tiragens — ${all.length}`}
      subtitle="Cada uma tem layout próprio, ordem de leitura, animação e interpretação estruturada por posição."
      actions={
        <div className="flex items-center gap-2">
          <Segmented
            label="Número de cartas"
            size="sm"
            value={size}
            onChange={setSize}
            options={[
              { value: 'todas', label: 'Qualquer' },
              { value: '1', label: '1' },
              { value: '2-3', label: '2–3' },
              { value: '4-6', label: '4–6' },
              { value: '7+', label: '7+' },
            ]}
          />
          {mode === 'browse' ? (
            <Link href="/tiragens/criar" className="rounded-md border border-gold/50 px-3 py-1.5 text-xs text-gold-bright hover:bg-gold/15">
              + Criar tiragem
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Procurar por tema, posição, palavra-chave…"
            aria-label="Procurar tiragens"
            className="min-w-[240px] flex-1"
          />
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} resultados</span>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {CATEGORIES.map((item) => {
            const active = category === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  sfx('select', { gain: 0.4 })
                  setCategory(item.value)
                }}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${active ? 'border-gold bg-gold text-[#12100a]' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-gold/60'}`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">Nenhuma tiragem corresponde ao filtro. Limpa a pesquisa ou muda a categoria.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((spread) => (
              <SpreadCard key={spread.id} spread={spread} mode={mode} pinned={prefs.pinnedSpreadIds.includes(spread.id)} onPin={() => patchPrefs({ pinnedSpreadIds: spreadPin(prefs.pinnedSpreadIds, spread.id) })} custom={mine.some((item) => item.id === spread.id)} />
            ))}
          </ul>
        )}
      </div>
    </Panel>
  )
}

function spreadPin(current: string[], id: string): string[] {
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-12)
}

function SpreadCard({ spread, mode, pinned, onPin, custom }: { spread: SpreadDef; mode: 'browse' | 'pick'; pinned: boolean; onPin: () => void; custom: boolean }) {
  const points = useMemo(() => {
    const hasCoords = spread.positions.every((position) => typeof position.x === 'number' && typeof position.y === 'number')
    if (hasCoords) return spread.positions
    const computed = layoutFor(spread.shape, { count: spread.positions.length })
    return spread.positions.map((position, index) => ({ ...position, x: computed[index]?.x ?? 0.5, y: computed[index]?.y ?? 0.5 }))
  }, [spread])

  return (
    <li className="panel flex flex-col gap-3 p-3.5 transition-colors hover:border-gold/45">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base leading-tight">{spread.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {spread.category} · {spread.cardCount} {spread.cardCount === 1 ? 'carta' : 'cartas'} · ~{spread.estimatedMinutes} min
          </p>
        </div>
        <button
          type="button"
          onClick={onPin}
          aria-pressed={pinned}
          title={pinned ? 'Desafixar da frente do catálogo' : 'Fixar no topo do catálogo'}
          className={`rounded-md border px-2 py-1 text-xs transition-colors ${pinned ? 'border-gold bg-gold/20 text-gold-bright' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-gold/60'}`}
        >
          {pinned ? '★' : '☆'}
        </button>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)] text-pretty">{spread.summary}</p>
      <div className="flex items-end justify-between gap-3">
        <SpreadMap points={points} size={88} />
        <ul className="min-w-0 flex-1 space-y-0.5 text-[11px] text-[var(--text-muted)]">
          {spread.positions.slice(0, 4).map((position, index) => (
            <li key={position.id} className="truncate">
              <span className="text-gold/70">{index + 1}.</span> {position.label}
            </li>
          ))}
          {spread.positions.length > 4 ? <li className="text-gold-bright/80">+{spread.positions.length - 4} posições</li> : null}
        </ul>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={spread.cinematic === 'ritual' ? 'wine' : 'neutral'}>{spread.cinematic}</Badge>
        <Badge tone="neutral">{spread.difficulty}</Badge>
        {custom ? <Badge tone="astral">minha</Badge> : null}
        <div className="ml-auto flex gap-2">
          {mode === 'browse' ? (
            <Link href={`/tiragens/${spread.id}`} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold">
              Ficha
            </Link>
          ) : null}
          <Link href={`/ritual/${spread.id}`} className="rounded-md bg-gold px-2.5 py-1.5 text-xs font-medium text-[#12100a] hover:bg-gold-bright">
            {mode === 'pick' ? 'Escolher' : 'Para a mesa'}
          </Link>
        </div>
      </div>
    </li>
  )
}

export function SpreadCreatorLink() {
  return (
    <Button variant="outline" onClick={() => window.location.assign('/tiragens/criar')}>
      Criar tiragem
    </Button>
  )
}
