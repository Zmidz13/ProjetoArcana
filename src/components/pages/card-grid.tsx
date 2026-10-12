'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Badge, Panel, Segmented, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt, THEME_LABELS } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { CARDS, CONTENT_STATS } from '@/domain/content.ts'
import { loadArtManifest } from '@/components/ui/art.tsx'
import type { Suit } from '@/domain/types.ts'

const SUIT_LABELS: Record<Suit | 'todos', string> = {
  todos: 'Todos',
  wands: 'Paus',
  cups: 'Copas',
  swords: 'Espadas',
  pentacles: 'Ouros',
}

/**
 * Índice visual do baralho: as 78 cartas reais geradas pelo motor de arte, filtráveis.
 * Cada miniatura é o próprio SVG da carta (não é uma reprodução ao lado).
 */
export function CardGrid() {
  const { deckTheme } = useApp()
  const [query, setQuery] = useState('')
  const [suit, setSuit] = useState<Suit | 'todos'>('todos')
  const [arcana, setArcana] = useState<'todos' | 'maiores' | 'menores'>('todos')
  const [reversedPreview, setReversedPreview] = useState(false)
  const [themes, setThemes] = useState<string[]>([])
  useEffect(() => {
    void loadArtManifest().then((manifest) => manifest && setThemes(manifest.themes))
  }, [setThemes])

  const cards = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const keywords = needle ? needle.split(/\s+/) : []
    return CARDS.filter((card) => {
      if (arcana === 'maiores' && card.arcana !== 'major') return false
      if (arcana === 'menores' && card.arcana !== 'minor') return false
      if (suit !== 'todos' && card.suit !== suit) return false
      if (keywords.length === 0) return true
      const haystack = `${card.name.pt} ${card.name.intl} ${card.archetype} ${card.keywords.upright.join(' ')} ${card.keywords.reversed.join(' ')} ${card.astro ?? ''}`.toLowerCase()
      return keywords.every((keyword) => haystack.includes(keyword))
    })
  }, [arcana, query, suit])

  return (
    <Panel
      title={`Baralho completo — ${cards.length} de ${CONTENT_STATS.cards}`}
      subtitle="Ilustração vectorial original, gerada por código a partir do registo simbólico de cada carta (céu, terreno, glifos, paleta)."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Arcanos"
            size="sm"
            value={arcana}
            onChange={setArcana}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'maiores', label: '22 maiores' },
              { value: 'menores', label: '56 menores' },
            ]}
          />
          <Segmented
            label="Naipe"
            size="sm"
            value={suit}
            onChange={setSuit}
            options={(Object.keys(SUIT_LABELS) as (Suit | 'todos')[]).map((key) => ({ value: key, label: SUIT_LABELS[key] }))}
          />
          <button
            type="button"
            onClick={() => setReversedPreview((current) => !current)}
            aria-pressed={reversedPreview}
            className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold"
            title="Ver todas invertidas (o SVG do inverso tem composição espelhada)"
          >
            {reversedPreview ? 'Invertidas ✓' : 'Ver invertidas'}
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar por nome, arquétipo, palavra-chave ou astrologia…" aria-label="Procurar carta" className="min-w-[220px] flex-1" />
        <Badge tone="gold" title={THEME_LABELS[deckTheme]?.note}>tema {deckTheme}</Badge>
        {themes.length > 1 ? (
          <span className="text-xs text-[var(--text-muted)]">
            trocar no topo (Baralho: <span className="text-gold-bright">{deckTheme}</span>)
          </span>
        ) : null}
      </div>
      {cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--text-muted)]">Nenhuma carta corresponde à pesquisa.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
          {cards.map((card) => (
            <li key={card.id}>
              <Link href={`/baralho/${card.id}`} className="group block rounded-lg border border-transparent p-1 transition-colors hover:border-gold/60 focus-visible:border-gold">
                <span className="card-face block h-[130px] w-full sm:h-[150px]">
                  <CardArt cardId={card.id} theme={deckTheme} orientation={reversedPreview ? 'reversed' : 'upright'} />
                </span>
                <span className="mt-1 block truncate text-[11px] font-medium text-[var(--text)]">{card.name.pt}</span>
                <span className="block truncate text-[10px] text-[var(--text-muted)]">
                  {card.arcana === 'major' ? 'maior' : SUIT_LABELS[(card.suit ?? 'wands') as Suit]} · {card.archetype}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
