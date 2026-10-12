import type { Metadata } from 'next'

import { SharedReading } from '@/components/pages/shared-reading.tsx'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  return {
    title: 'Leitura partilhada',
    description: 'Uma leitura de tarot partilhada: distribuição das cartas e interpretação, sem dados de conta.',
    alternates: { canonical: `/partilha/${token}` },
    openGraph: { title: 'Leitura partilhada no ARCANA', description: 'Cartas e interpretação, sem notas privadas.' },
  }
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <SharedReading token={token} />
}
