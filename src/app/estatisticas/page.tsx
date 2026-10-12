import type { Metadata } from 'next'

import { StatsPanel } from '@/components/pages/stats-panel.tsx'

export const metadata: Metadata = {
  title: 'Estatísticas',
  description: 'Contagens da tua prática: cartas mais vistas, invertidas por dia, cobertura do baralho, tiragens usadas e gasto de IA.',
}

export default function StatsPage() {
  return <StatsPanel />
}
