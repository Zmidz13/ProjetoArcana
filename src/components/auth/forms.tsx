'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button, Field, Panel, Switch, TextInput } from '@/components/ui/primitives.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api } from '@/lib/api.ts'

interface SessionResponse {
  user?: { id: string; handle: string; displayName: string }
  csrfToken?: string
  ok?: boolean
}

/** Formulário real de autenticação: fala com `/api/auth/*` e reflete o erro do servidor. */
export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { refreshSession, toast, sfx } = useApp()
  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const submit = async () => {
    setBusy(true)
    setError(null)
    setFieldErrors({})
    try {
      await api<SessionResponse>('/api/auth/login', { method: 'POST', body: { handle: handle.trim().toLowerCase(), password }, anonymous: true })
      await refreshSession()
      sfx('confirm')
      toast(`Bem-vindo de volta, @${handle.trim().toLowerCase()}.`, 'ok')
      router.replace(params.get('next') ?? '/conta')
      router.refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
        setFieldErrors(firstOf(caught.fieldErrors))
      } else {
        setError('Falha inesperada no pedido.')
      }
      sfx('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="Entrar" subtitle="A sessão é uma cookie httpOnly assinada; nada de tokens no localStorage.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Field label="Utilizador" error={fieldErrors.handle ?? null}>
          <TextInput value={handle} onChange={(event) => setHandle(event.target.value)} autoComplete="username" required maxLength={40} />
        </Field>
        <Field label="Palavra-passe" error={fieldErrors.password ?? null}>
          <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </Field>
        {error ? (
          <p role="alert" className="rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="gold" loading={busy}>
            Entrar
          </Button>
          <Link href="/registar" className="text-sm text-gold-bright underline-offset-4 hover:underline">
            criar conta
          </Link>
          <Link href="/" className="ml-auto text-sm text-[var(--text-muted)] hover:underline">
            continuar sem conta
          </Link>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Sem conta funciona tudo: as leituras ficam ligadas a este dispositivo pela cookie `arcana_device`. A conta serve para sincronizar entre aparelhos,
          partilhar e exportar em bloco.
        </p>
      </form>
    </Panel>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const { refreshSession, toast, sfx } = useApp()
  const [form, setForm] = useState({ handle: '', password: '', repeat: '', email: '', displayName: '', acceptFrame: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const submit = async () => {
    if (form.password !== form.repeat) {
      setFieldErrors({ password: 'As palavras-passe não coincidem.' })
      return
    }
    setBusy(true)
    setError(null)
    setFieldErrors({})
    try {
      await api<SessionResponse>('/api/auth/register', {
        method: 'POST',
        anonymous: true,
        body: {
          handle: form.handle.trim().toLowerCase(),
          password: form.password,
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
          ...(form.displayName.trim() ? { displayName: form.displayName.trim() } : {}),
          acceptFrame: true,
        },
      })
      await api('/api/auth/login', { method: 'POST', anonymous: true, body: { handle: form.handle.trim().toLowerCase(), password: form.password } }).catch(() => undefined)
      await refreshSession()
      sfx('confirm')
      toast('Conta criada. As leituras antigas deste dispositivo podem ser reclamadas abaixo.', 'ok')
      router.replace('/conta')
      router.refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
        setFieldErrors(firstOf(caught.fieldErrors))
      } else {
        setError('Não foi possível criar a conta.')
      }
      sfx('error')
    } finally {
      setBusy(false)
    }
  }

  const strength = passwordStrength(form.password)

  return (
    <Panel title="Criar conta" subtitle="Pedimos o mínimo: um nome curto e uma palavra-passe. O enquadramento simbólico tem de ser aceite porque é o modo como a plataforma fala.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Utilizador" hint="3 a 40 caracteres, minúsculas, sem espaços." error={fieldErrors.handle ?? null}>
            <TextInput value={form.handle} onChange={(event) => setForm({ ...form, handle: event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} autoComplete="username" maxLength={40} required />
          </Field>
          <Field label="Nome visível" hint="Opcional; aparece nas partilhas se escolheres." error={fieldErrors.displayName ?? null}>
            <TextInput value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value.slice(0, 60) })} maxLength={60} />
          </Field>
          <Field label="Palavra-passe" hint={`Força: ${strength.label}`} error={fieldErrors.password ?? null}>
            <TextInput type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" required />
          </Field>
          <Field label="Repetir" error={fieldErrors.repeat ?? null}>
            <TextInput type="password" value={form.repeat} onChange={(event) => setForm({ ...form, repeat: event.target.value })} autoComplete="new-password" required />
          </Field>
        </div>
        <Field label="Email" hint="Opcional e nunca partilhado; só serve para recuperação futura." error={fieldErrors.email ?? null}>
          <TextInput type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value.slice(0, 160) })} autoComplete="email" />
        </Field>
        <div className="rounded-lg border border-[var(--line)] bg-black/20 p-3">
          <Switch
            label="Aceito o enquadramento"
            hint="O tarot aqui é linguagem simbólica e reflexão. Não há previsão, diagnóstico médico, aconselhamento jurídico ou financeiro — e a plataforma não promete que as cartas decidam por ti."
            checked={form.acceptFrame}
            onChange={(next) => setForm({ ...form, acceptFrame: next })}
          />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <span className="block h-full rounded-full transition-[width] duration-300" style={{ width: `${strength.score * 25}%`, background: strength.score >= 4 ? 'var(--color-astral)' : strength.score >= 3 ? 'var(--color-gold)' : '#c0556b' }} />
        </div>
        {error ? (
          <p role="alert" className="rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="gold" loading={busy} disabled={!form.acceptFrame}>
            Criar conta
          </Button>
          <a href="/entrar" className="text-sm text-gold-bright underline-offset-4 hover:underline">
            já tenho conta
          </a>
        </div>
      </form>
    </Panel>
  )
}

function firstOf(map: Record<string, string[]> | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  Object.entries(map ?? {}).forEach(([key, values]) => {
    out[key] = values[0] ?? 'valor inválido'
  })
  return out
}

function passwordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: 'vazia' }
  let score = 0
  if (password.length >= 10) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^\w\s]/.test(password)) score += 1
  const bounded = Math.min(4, score)
  return { score: bounded, label: ['muito curta', 'fraca', 'razoável', 'boa', 'forte'][bounded] ?? 'fraca' }
}
