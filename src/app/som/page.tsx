import type { Metadata } from 'next'

import { SoundPanel } from '@/components/pages/sound-panel.tsx'

export const metadata: Metadata = {
  title: 'Som e ambiente',
  description: 'Sete ambientes musicais sintetizados, 21 efeitos distintos e controlo de partículas — tudo original, sem ficheiros de terceiros.',
}

export default function SoundPage() {
  return <SoundPanel />
}
