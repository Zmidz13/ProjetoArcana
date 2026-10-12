import type { Metadata } from 'next'

import { Diagnostics } from '@/components/pages/diagnostics.tsx'

export const metadata: Metadata = {
  title: 'Diagnóstico',
  description: 'Estado da base de dados, conteúdo, arte, IA, sessão e consumo — com auto-teste do motor determinístico.',
}

export default function DiagnosticsPage() {
  return <Diagnostics />
}
