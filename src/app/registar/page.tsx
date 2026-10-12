import type { Metadata } from 'next'

import { RegisterForm } from '@/components/auth/forms.tsx'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Conta ARCANA: mínimo de dados, controlo das tuas leituras, exportação e eliminação.',
  robots: { index: false },
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <RegisterForm />
    </div>
  )
}
