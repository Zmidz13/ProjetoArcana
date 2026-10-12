'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Badge, Panel, Skeleton } from '@/components/ui/primitives.tsx'
import { SpreadMap } from '@/components/ui/art.tsx'
import { api } from '@/lib/api.ts'
import { layoutFor } from '@/engine/layout.ts'
import { getSpread, SPREADS } from '@/domain/content.ts'
import type { SpreadDef } from '@/domain/types.ts'
import { useApp } from '@/components/providers.tsx'

/** Ficha de uma tiragem — catálogo ou criada por ti (por isso passa pelo API). */
export function SpreadDetailClient({ spreadId }: { spreadId: string }) {
  const { session } = useApp()
  const [mine, setMine] = useState<SpreadDef[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void api<{ spreads: SpreadDef[] }>('/api/catalog')
      .then((response) => alive && setMine(response.spreads))
      .catch((caught) => alive && setError(caught instanceof Error ? caught.message : 'Catálogo indisponível.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const spread = useMemo(() => mine.find((item) => item.id === spreadId) ?? getSpread(spreadId), [mine, spreadId])

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (!spread) {
    return (
      <Panel title="Tiragem não encontrada" subtitle={`Nada com o identificador “${spreadId}”.`}>
        <Link href="/tiragens" className="text-sm text-gold-bright underline-offset-4 hover:underline">
          Voltar ao catálogo ({SPREADS.length} tiragens)
        </Link>
      </Panel>
    )
  }

  const hasCoords = spread.positions.every((position) => typeof position.x === 'number' && typeof position.y === 'number')
  const computed = hasCoords ? [] : layoutFor(spread.shape, { count: spread.positions.length })
  const points = spread.positions.map((position, index) => ({ x: position.x, y: position.y, label: position.label, ...({ ...(computed[index] ?? {}) } as object) }))
  const related = SPREADS.filter((item) => item.id !== spread.id && (item.category === spread.category || item.shape === spread.shape)).slice(0, 6)
  const editable = spread.author === 'utilizador' && !!session?.user

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <Panel
        title={spread.name}
        subtitle={spread.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/ritual/${spread.id}`} className="rounded-md bg-gold px-3 py-2 text-sm font-semibold text-[#12100a] hover:bg-gold-bright">
              Abrir na mesa
            </Link>
            <Link href={`/ritual/${spread.id}?auto=1`} className="rounded-md border border-[var(--line)] px-3 py-2 text-sm hover:border-gold" title="O motor baralha e compra; a leitura fica registada">
              Tiragem automática
            </Link>
            {editable ? <Link href={`/tiragens/criar?id=${spread.id}`} className="rounded-md border border-[var(--line)] px-3 py-2 text-sm hover:border-gold">Editar</Link> : null}
          </div>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-3">
            <dl className="grid gap-2 text-xs sm:grid-cols-3">
              <Meta label="Categoria" value={spread.category} />
              <Meta label="Forma" value={spread.shape} />
              <Meta label="Cartas" value={`${spread.cardCount}`} />
              <Meta label="Tempo estimado" value={`~${spread.estimatedMinutes} min`} />
              <Meta label="Dificuldade" value={spread.difficulty} />
              <Meta label="Cinematografia" value={spread.cinematic} />
              <Meta label="Invertidas" value={spread.allowReversed === false ? 'não recomendadas' : 'bem-vindas'} />
              <Meta label="Autoria" value={spread.author} />
              <Meta label="Requer conta" value={spread.requiresAccounts ? 'sim' : 'não'} />
            </dl>
            <section>
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Para que serve</h3>
              <p className="mt-1 text-sm leading-relaxed text-pretty">{spread.purpose}</p>
            </section>
            <section>
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Quando usar</h3>
              <p className="mt-1 text-sm leading-relaxed text-pretty">{spread.whenToUse}</p>
            </section>
            {spread.tags.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {spread.tags.map((tag) => (
                  <li key={tag}>
                    <Badge tone="neutral">#{tag}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-[var(--line)] bg-black/25 p-3">
              <h3 className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Layout</h3>
              <div className="flex justify-center">
                <SpreadMap points={points} size={196} />
              </div>
            </div>
            {spread.structure ? (
              <div className="rounded-xl border border-[var(--line)] bg-black/25 p-3">
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Estrutura ({spread.structure.kind})</h3>
                <ul className="mt-1.5 space-y-1.5 text-xs">
                  {spread.structure.blocks.map((block) => (
                    <li key={block.id}>
                      <span className="font-medium text-[var(--text)]">{block.label}</span>
                      <span className="text-[var(--text-muted)]"> — {block.positions.join(', ')}</span>
                      {block.note ? <p className="text-[var(--text-muted)]">{block.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {spread.mobileLayout ? (
              <div className="rounded-xl border border-[var(--line)] bg-black/25 p-3 text-xs">
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Mobile</h3>
                <p>
                  Adaptado em <span className="text-gold-bright">{spread.mobileLayout.shape}</span>
                  {spread.mobileLayout.pageGroups?.length ? ` — ${spread.mobileLayout.pageGroups.map((group) => group.label).join(' · ')}` : ''}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel title="Posições e o que cada uma pede" subtitle="A mesma informação que o motor usa para modular a interpretação por posição.">
        <ol className="space-y-2">
          {spread.positions.map((position, index) => (
            <li key={position.id} className="grid gap-2 rounded-lg border border-[var(--line)] bg-black/20 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/45 font-mono text-xs text-gold-bright">{index + 1}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {position.label}
                  {position.group ? <span className="ml-2 text-[11px] font-normal text-[var(--text-muted)]">grupo: {position.group}</span> : null}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{position.description}</span>
                {position.meaningWhenReversed ? (
                  <span className="mt-1 block text-xs leading-relaxed text-wine/90 text-pretty">invertida: {position.meaningWhenReversed}</span>
                ) : null}
              </span>
              <span className="flex flex-col items-end gap-1 text-[10px] text-[var(--text-muted)]">
                <span>
                  x {position.x.toFixed(2)} · y {position.y.toFixed(2)}
                </span>
                {typeof position.rotation === 'number' && position.rotation !== 0 ? <span>rodada {position.rotation}°</span> : null}
                {position.links?.length ? <span title={position.links.join(', ')}>{position.links.length} ligações</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      {related.length ? (
        <Panel title="Tiragens aparentadas" subtitle="Mesma categoria ou mesma forma — útil quando queres aprofundar sem mudar de linguagem.">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/tiragens/${item.id}`} className="block rounded-lg border border-[var(--line)] p-2.5 text-sm transition-colors hover:border-gold/60">
                  <span className="block font-medium">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    {item.cardCount} cartas · {item.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--line)] px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className="text-xs">{value}</dd>
    </div>
  )
}
