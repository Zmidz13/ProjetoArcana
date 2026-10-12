'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Badge, Button, Panel, Segmented } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { getCard } from '@/domain/content.ts'
import type { Orientation } from '@/domain/types.ts'

/** Registo completo da carta: tudo o que o motor simbólico tem para dizer sobre ela. */
export function CardDetailClient({ cardId }: { cardId: string }) {
  const card = getCard(cardId)
  const { deckTheme, toast } = useApp()
  const [orientation, setOrientation] = useState<Orientation>('upright')
  if (!card) return <Panel title="Carta inválida" subtitle={`Não há nenhuma carta com o identificador “${cardId}”.`} />

  const reversed = orientation === 'reversed'
  const domains: [string, string][] = [
    ['Psique e padrão', card.domains.psychology],
    ['Emoções', card.domains.emotional],
    ['Amor e vínculos', card.domains.love],
    ['Trabalho e projectos', card.domains.career],
    ['Dinheiro e recursos', card.domains.finances],
    ['Crescimento', card.domains.growth],
    ['Espiritualidade', card.domains.spirituality],
  ]

  const copy = async () => {
    const text = [
      `${card.name.pt} (${card.name.intl}) — ${reversed ? 'invertida' : 'direita'}`,
      card.meanings[reversed ? 'reversed' : 'upright'],
      `Palavras-chave: ${(reversed ? card.keywords.reversed : card.keywords.upright).join(', ')}`,
      ...domains.map(([label, value]) => `${label}: ${value}`),
      `Conselho: ${card.guidance.advice.join(' ')}`,
    ].join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      toast('Ficha da carta copiada.', 'ok')
    } catch {
      toast('O navegador bloqueou a área de transferência.', 'erro')
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xl">{card.name.pt}</span>
            <Badge tone="gold">{card.arcana === 'major' ? `maior · ${String(card.number).padStart(2, '0')}` : `${card.rank} de ${card.suit}`}</Badge>
            {card.astro ? <Badge tone="astral" title="Correspondência astrológica (Golden Dawn, Livro T)">{card.astro}</Badge> : null}
            {card.gdTitle ? <Badge tone="wine">{card.gdTitle}</Badge> : null}
          </span>
        }
        subtitle={`${card.name.intl} · arquétipo: ${card.archetype} · elemento: ${card.element}`}
        actions={
          <div className="flex items-center gap-2">
            <Segmented
              label="Orientação"
              size="sm"
              value={orientation}
              onChange={setOrientation}
              options={[
                { value: 'upright', label: 'Direita' },
                { value: 'reversed', label: 'Invertida' },
              ]}
            />
            <Button size="sm" variant="outline" onClick={() => void copy()}>
              Copiar ficha
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
          <div className="hidden card-face sm:block">
            <CardArt cardId={card.id} theme={deckTheme} orientation={orientation} eager />
          </div>
          <div className="space-y-3">
            <p className="text-[15px] leading-relaxed text-pretty">{card.meanings[reversed ? 'reversed' : 'upright']}</p>
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Palavras-chave</h3>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {(reversed ? card.keywords.reversed : card.keywords.upright).map((keyword) => (
                  <li key={keyword}>
                    <Badge tone={reversed ? 'wine' : 'neutral'}>{keyword}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            {card.traditionNote ? (
              <p className="rounded-md border-l-2 border-gold/50 bg-black/25 px-3 py-2 text-sm leading-relaxed text-[var(--text-muted)] text-pretty">{card.traditionNote}</p>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Domínios de leitura">
          <dl className="space-y-2.5 text-sm leading-relaxed">
            {domains.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] uppercase tracking-[0.1em] text-gold-bright/85">{label}</dt>
                <dd className="text-pretty">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <div className="space-y-4">
          <Panel title="Orientações">
            <div className="space-y-3 text-sm leading-relaxed">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Obstáculo provável</h3>
                <p>{card.guidance.obstacles}</p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Abertura</h3>
                <p>{card.guidance.opportunities}</p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Conselhos</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {card.guidance.advice.map((advice) => (
                    <li key={advice}>{advice}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Perguntas para sentar com isto</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {card.guidance.reflection.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
          <Panel title="Como o motor lê esta carta" subtitle="Notas de composição usadas pela arte e pelas combinações.">
            <ul className="space-y-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
              {card.art.reading.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span className="text-pretty">{note}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Relações no baralho" subtitle={`${card.relations.length} ligações simbólicas registadas (reforço, tensão, sombra, espelho, complemento, continuidade).`} actions={<Link href="/sobre#relacoes" className="text-xs text-gold-bright underline-offset-4 hover:underline">como são derivadas</Link>}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {card.relations.map((relation) => {
            const target = getCard(relation.card)
            return (
              <li key={`${relation.card}-${relation.kind}`} className="rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Link href={target ? `/baralho/${target.id}` : '#'} className="text-sm font-medium text-gold-bright hover:underline">
                    {target?.name.pt ?? relation.card}
                  </Link>
                  <Badge tone={relation.kind === 'tensao' || relation.kind === 'sombra' ? 'wine' : 'neutral'}>{relation.kind}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{relation.note}</p>
                {relation.derived ? <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]/80">derivada por correspondência partilhada</p> : null}
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel title="História e iconografia">
        <p className="text-sm leading-relaxed text-pretty">{card.history}</p>
      </Panel>
    </div>
  )
}