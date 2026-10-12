import type { Metadata } from 'next'

import { CatalogPanel } from '@/components/pages/catalog-panel.tsx'

export const metadata: Metadata = {
  title: 'Tiragens',
  description: 'Catálogo completo de tiragens de tarot: posições, layouts, quando usar e tempo estimado. Todas implementadas na mesa, mais o criador.',
}

export default function TiragensPage() {
  return <CatalogPanel mode="browse" />
}
