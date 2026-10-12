import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/components/auth/forms.tsx'
import { Skeleton } from '@/components/ui/primitives.tsx'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Sessão do ARCANA: sincroniza leituras, diário, tiragens próprias e preferências entre aparelhos.',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
