import type { Metadata } from 'next'

import { HistoryList } from '@/components/pages/history-list.tsx'

export const metadata: Metadata = {
  title: 'Histórico',
  description: 'Todas as leituras registadas, com seed, filtros, favoritos, partilha e exportação.',
}

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <HistoryList />
    </div>
  )
}
