import type { Metadata } from 'next'

import { SpreadCreator } from '@/components/pages/spread-creator.tsx'

export const metadata: Metadata = {
  title: 'Criar tiragem',
  description: 'Constrói uma tiragem própria: posições, perguntas, forma na mesa. Fica no teu histórico e usa o mesmo motor de interpretação.',
}

export default function CreateSpreadPage() {
  return <SpreadCreator />
}
