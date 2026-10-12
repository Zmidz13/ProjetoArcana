import type { Metadata } from 'next'
import Link from 'next/link'

import { notFound } from 'next/navigation'

import { Badge, Panel } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { CardDetailClient } from '@/components/pages/card-detail.tsx'
import { CARDS, getCard } from '@/domain/content.ts'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return CARDS.map((card) => ({ id: card.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const card = getCard(id)
  if (!card) return { title: 'Carta não encontrada' }
  return {
    title: card.name.pt,
    description: `${card.name.pt} (${card.name.intl}) — ${card.meanings.upright.slice(0, 160)}`,
    openGraph: { images: [{ url: `/art/obsidiana/${card.id}.svg`, alt: card.a11y.alt }] },
  }
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = getCard(id)
  if (!card) notFound()
  const index = CARDS.findIndex((item) => item.id === card.id)
  const previous = CARDS[(index - 1 + CARDS.length) % CARDS.length]!
  const next = CARDS[(index + 1) % CARDS.length]!

  return (
    <div className="space-y-5">
      <nav aria-label="Cartas vizinhas" className="flex items-center justify-between gap-3 text-sm">
        <Link href={`/baralho/${previous.id}`} className="truncate text-[var(--text-muted)] hover:text-gold">
          ← {previous.name.pt}
        </Link>
        <Link href="/baralho" className="shrink-0 text-xs uppercase tracking-[0.16em] text-gold-bright">
          {index + 1} / {CARDS.length}
        </Link>
        <Link href={`/baralho/${next.id}`} className="truncate text-right text-[var(--text-muted)] hover:text-gold">
          {next.name.pt} →
        </Link>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="card-face animate-veil-in">
            <CardArt cardId={card.id} theme="obsidiana" eager alt={`${card.name.pt} — ${card.a11y.alt}`} />
          </div>
          <p className="sr-only sm:not-sr-only sm:text-xs sm:leading-relaxed sm:text-[var(--text-muted)]">{card.a11y.long}</p>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            {card.art.palette.map((color, position) => (
              <li key={color + position} className="flex items-center gap-2 rounded border border-[var(--line)] px-2 py-1.5">
                <span aria-hidden className="h-4 w-4 rounded-sm border border-white/20" style={{ background: color }} />
                <code className="text-[10px] text-[var(--text-muted)]">{color}</code>
                <span className="ml-auto text-[10px] uppercase text-[var(--text-muted)]">{['figura', 'luz', 'fundo'][position] ?? 'extra'}</span>
              </li>
            ))}
            <li className="rounded border border-[var(--line)] px-2 py-1.5">
              <span className="block text-[10px] uppercase text-[var(--text-muted)]">Céu / terreno</span>
              {card.art.sky} · {card.art.terrain}
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {card.art.glyphs.map((glyph) => (
              <Badge key={glyph} tone="neutral" title="Glifo desenhado pelo motor de arte">
                {glyph}
              </Badge>
            ))}
          </div>
        </div>

        <CardDetailClient cardId={card.id} />
      </div>

      <Panel title="Fontes do registo" subtitle="De onde vem o que está escrito acima — nada foi inventado à margem da tradição consultada.">
        <ul className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
          {card.sources.map((source) => (
            <li key={source} className="rounded border border-[var(--line)] px-2 py-1">
              {source}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
