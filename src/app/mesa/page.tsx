import type { Metadata } from 'next'
import Link from 'next/link'

import { CatalogPanel } from '@/components/pages/catalog-panel.tsx'
import { Panel } from '@/components/ui/primitives.tsx'
import { SPREADS } from '@/domain/content.ts'

export const metadata: Metadata = {
  title: 'Abrir mesa',
  description: 'Escolhe uma das tiragens do catálogo e começa o ritual: pergunta, baralho, corte, escolha, interpretação.',
}

export default function MesaPage() {
  const suggested = SPREADS.filter((spread) => ['card-of-the-day', 'three-cards', 'celtic-cross', 'problem-cause-solution'].includes(spread.id))
  return (
    <div className="space-y-6">
      <Panel title="Escolhe a tiragem" subtitle="A mesa abre com o baralho completo (78 cartas) e a pergunta que quiseres. As tiragens criadas por ti aparecem aqui também.">
        <ul className="flex flex-wrap gap-2">
          {suggested.map((spread) => (
            <li key={spread.id}>
              <Link href={`/ritual/${spread.id}`} className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold/10 px-3 py-1.5 text-sm transition-colors hover:bg-gold/20">
                <span className="font-medium">{spread.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{spread.cardCount} cartas</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
      <CatalogPanel mode="pick" />
    </div>
  )
}
