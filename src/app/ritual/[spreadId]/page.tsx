import type { Metadata } from 'next'

import { MesaClient } from '@/components/ritual/mesa-client.tsx'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ spreadId: string }> }): Promise<Metadata> {
  const { spreadId } = await params
  return {
    title: `Ritual — ${spreadId}`,
    description: 'Mesa do ritual: baralhar, cortar, escolher e revelar com registo reproduzível.',
    robots: { index: false, follow: false },
  }
}

export default async function RitualPage({ params }: { params: Promise<{ spreadId: string }> }) {
  const { spreadId } = await params
  return <MesaClient spreadId={spreadId} />
}
