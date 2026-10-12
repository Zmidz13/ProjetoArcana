'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Mesa } from '@/components/ritual/mesa.tsx'
import { Panel, Skeleton, EmptyState, Button } from '@/components/ui/primitives.tsx'
import { useApp } from '@/components/providers.tsx'
import { api } from '@/lib/api.ts'
import { useRitual, randomSeed } from '@/hooks/use-ritual.ts'
import { requireSpread } from '@/domain/content.ts'
import type { SpreadDef } from '@/domain/types.ts'

/**
 * Casca da mesa. Resolve a tiragem (catálogo + tiragens da conta), liga o `useRitual` e
 * trata das ligações de estado (ex.: `?auto=1` compra sozinha, para o fluxo da carta do dia).
 */
export function MesaClient({ spreadId }: { spreadId: string }) {
  const { prefs, toast } = useApp()
  const router = useRouter()
  const [catalog, setCatalog] = useState<SpreadDef[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
    setQuery(params.get('q') ?? '')
    void api<{ spreads: SpreadDef[] }>('/api/catalog')
      .then((response) => setCatalog(response.spreads))
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Falha a carregar o catálogo.'))
  }, [])

  const spread = useMemo(() => {
    const fromApi = catalog?.find((item) => item.id === spreadId)
    if (fromApi) return fromApi
    try {
      return requireSpread(spreadId)
    } catch {
      return undefined
    }
  }, [catalog, spreadId])

  const ritual = useRitual(spread, {
    algorithm: prefs.algorithm,
    cuts: prefs.cuts,
    allowReversed: prefs.allowReversed,
    drawMode: prefs.drawMode,
    environment: prefs.environment,
    question: query,
    seed: randomSeed(),
  })

  useEffect(() => {
    if (!spread) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('auto') === '1') {
      ritual.autoDraw()
      void ritual.submit().then((id) => {
        if (id) toast('Tiragem automática do motor registada.', 'ok')
      })
    } else if (params.get('shuffle') === '1') {
      void ritual.shuffle()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread?.id])

  if (error) {
    return (
      <Panel title="Catálogo indisponível" subtitle={error}>
        <p className="text-sm text-[var(--text-muted)]">Confirma que o servidor está a correr (<code className="kbd">npm run dev</code>) e que a base de dados migrou (<code className="kbd">npm run db:migrate</code>).</p>
      </Panel>
    )
  }

  if (!catalog) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    )
  }

  if (!spread) {
    return (
      <EmptyState
        title="Essa tiragem não existe"
        body={`Nada no catálogo tem o identificador “${spreadId}”. Escolhe outra tiragem e a mesa recomeça com um baralho limpo.`}
        action={
          <Button variant="gold" onClick={() => router.push('/tiragens')}>
            Ver as {catalog.length} tiragens
          </Button>
        }
      />
    )
  }

  return <Mesa spread={spread} ritual={ritual} />
}
