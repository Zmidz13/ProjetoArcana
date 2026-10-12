import type { Metadata } from 'next'

import { PreferencesForm } from '@/components/pages/preferences-form.tsx'

export const metadata: Metadata = {
  title: 'Preferências',
  description: 'Voz, registo, física do baralho, ambiente sonoro, movimento, acessibilidade e orçamento de IA.',
}

export default function PreferencesPage() {
  return <PreferencesForm />
}
