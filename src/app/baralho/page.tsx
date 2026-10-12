import type { Metadata } from 'next'

import { CardGrid } from '@/components/pages/card-grid.tsx'

export const metadata: Metadata = {
  title: 'O baralho — 78 cartas',
  description: 'As 78 cartas do ARCANA com ilustração vectorial original: 22 arcanos maiores e 56 menores, cada uma com registo simbólico completo.',
}

export default function BaralhoPage() {
  return (
    <div className="space-y-4">
      <CardGrid />
    </div>
  )
}
