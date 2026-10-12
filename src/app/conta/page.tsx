import type { Metadata } from 'next'

import { AccountPanel } from '@/components/pages/account-panel.tsx'

export const metadata: Metadata = {
  title: 'Conta e dados',
  description: 'Sessão, baralhos próprios, exportação, eliminação e estado do consumo de IA.',
}

export default function AccountPage() {
  return <AccountPanel />
}
