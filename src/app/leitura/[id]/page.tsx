import type { Metadata } from 'next'

import { LeituraClient } from '@/components/reading/leitura.tsx'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Leitura ${id.slice(0, 8)}`,
    description: 'Leitura completa: cartas registadas, interpretação estruturada A–G, análise simbólica e conversa posterior.',
    robots: { index: false, follow: false },
  }
}

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LeituraClient id={id} />
}
