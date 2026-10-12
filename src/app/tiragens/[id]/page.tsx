import type { Metadata } from 'next'

import { getSpread } from '@/domain/content.ts'
import { SpreadDetailClient } from '@/components/pages/spread-detail.tsx'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const spread = getSpread(id)
  if (!spread) return { title: 'Tiragem' }
  return { title: spread.name, description: spread.summary.slice(0, 180) }
}

export default async function SpreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SpreadDetailClient spreadId={id} />
}
