import type { Metadata } from 'next'

import { JournalPanel } from '@/components/pages/journal-panel.tsx'

export const metadata: Metadata = {
  title: 'Diário',
  description: 'Diário de prática: humor, energia, clareza e sono por dia, ligados às leituras que fizeste.',
}

export default function JournalPage() {
  return <JournalPanel />
}
