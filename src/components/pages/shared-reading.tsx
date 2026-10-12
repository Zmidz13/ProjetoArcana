'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge, Panel, Skeleton } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api, formatDateTime } from '@/lib/api.ts'
import { getCard } from '@/domain/content.ts'
import type { DrawnCard, Orientation } from '@/domain/types.ts'
import type { Interpretation } from '@/domain/interpretation.ts'

interface SharedPayload {
  reading: {
    spreadName: string
    question: string
    createdAt: string
    seed: number
    algorithm: string
    cuts: number
    allowReversed: boolean
    environment: string
    cards: DrawnCard[]
    interpretation?: Interpretation
  }
}

/** Vista pública: distribuição + interpretação, sem notas privadas nem rasto de conta. */
export function SharedReading({ token }: { token: string }) {
  const { deckTheme } = useApp()
  const [payload, setPayload] = useState<SharedPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void api<{ shared: SharedPayload['reading'] }>(`/api/shared/${token}`)
      .then((response) => setPayload({ reading: response.shared }))
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : 'Partilha indisponível.'))
  }, [token])

  if (error) return <Panel title="Partilha indisponível" subtitle={error} />
  if (!payload) return <Skeleton className="h-96 w-full rounded-xl" />

  const { reading } = payload
  const interpretation = reading.interpretation

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Panel
        title={interpretation?.title ?? reading.question ?? 'Leitura partilhada'}
        subtitle={`${reading.spreadName} · ${formatDateTime(reading.createdAt)} · partilhado sem notas privadas`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge tone="gold">seed {reading.seed}</Badge>
            <Badge tone="neutral">{reading.algorithm}</Badge>
            <Badge tone="neutral">{reading.cuts} corte(s)</Badge>
            {interpretation ? <Badge tone={interpretation.meta.generator === 'llm' ? 'astral' : 'neutral'}>{interpretation.meta.generator}</Badge> : null}
          </div>
        }
      >
        <ol className="grid gap-2.5 sm:grid-cols-3">
          {reading.cards.map((card, index) => (
            <li key={`${card.positionId}-${index}`}>
              <span className="card-face block h-[132px] w-full">
                <CardArt cardId={card.cardId} theme={deckTheme} orientation={card.orientation as Orientation} />
              </span>
              <span className="mt-1 block text-xs font-medium">{getCard(card.cardId)?.name.pt}</span>
              <span className="block text-[10px] text-[var(--text-muted)]">posição {index + 1}</span>
            </li>
          ))}
        </ol>
        {reading.question ? <p className="mt-3 text-sm italic text-[var(--text-muted)]">“{reading.question}”</p> : null}
      </Panel>

      {interpretation ? (
        <Panel title="Interpretação partilhada">
          <div className="space-y-3 text-sm leading-relaxed">
            <p className="text-pretty">{interpretation.opening}</p>
            <ul className="space-y-2">
              {interpretation.perCard.map((item) => (
                <li key={`${item.positionId}-${item.cardId}`} className="rounded-lg border border-[var(--line)] p-2.5 text-pretty">
                  <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    {item.cardName} · {item.positionLabel}
                    {item.orientation === 'reversed' ? ' · invertida' : ''}
                  </span>
                  {item.core}
                </li>
              ))}
            </ul>
            <p className="rounded-lg border-l-2 border-gold/60 bg-black/20 p-3 font-display text-base leading-relaxed text-pretty">{interpretation.closing}</p>
          </div>
        </Panel>
      ) : (
        <Panel title="Sem interpretação publicada" subtitle="Quem partilhou escolheu publicar só a distribuição." />
      )}

      <p className="text-center text-xs text-[var(--text-muted)]">
        Leitura simbólica partilhada por alguém — não é previsão nem aconselhamento profissional.{' '}
        <Link href="/" className="text-gold-bright underline-offset-4 hover:underline">
          Fazer a minha
        </Link>
        .
      </p>
    </div>
  )
}
