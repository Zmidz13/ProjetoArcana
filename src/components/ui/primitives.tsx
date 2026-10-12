'use client'

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '@/components/providers.tsx'

/**
 * Primitivas de interface. São componentes reais com comportamento: o `Modal` faz focus
 * trap e fecha com Escape, o `Segmented` é uma radiogroup acessível, o `Slider` emite
 * valores numéricos, o `Toaster` mostra erros acionáveis. Nada aqui é decorativo.
 */

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'gold'

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-[#12100a] hover:bg-gold-bright border-transparent',
  gold: 'bg-gradient-to-b from-gold-bright to-gold text-[#12100a] hover:brightness-110 border-transparent shadow-gild',
  ghost: 'bg-transparent hover:bg-white/10 border-transparent text-[var(--text)]',
  outline: 'bg-transparent border-[var(--line)] hover:border-gold text-[var(--text)]',
  danger: 'bg-[#5b1d2b] text-[#ffe9e9] hover:bg-[#71232f] border-transparent',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  sound = 'select',
  className = '',
  type = 'button',
  ...rest
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  sound?: 'select' | 'confirm' | 'toggle' | 'none'
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { type?: 'button' | 'submit' }) {
  const { sfx } = useApp()
  const [busy, setBusy] = useState(false)
  const onClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (sound !== 'none') sfx(sound)
      const handler = rest.onClick
      if (!handler) return
      setBusy(true)
      try {
        const result = handler(event) as unknown
        if (result && typeof (result as Promise<void>).then === 'function') await (result as Promise<void>)
      } finally {
        setBusy(false)
      }
    },
    [rest, sfx, sound],
  )
  const padding = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      {...rest}
      onClick={onClick}
      disabled={rest.disabled || loading || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-medium tracking-wide transition-[background,color,filter,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${BUTTON_CLASSES[variant]} ${padding} ${className}`}
    >
      {loading || busy ? <Spinner label="a processar" /> : null}
      {children}
    </button>
  )
}

export function Spinner({ label = 'a carregar', size = 14 }: { label?: string; size?: number }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="animate-spin-slow" style={{ animationDuration: '1.1s' }}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function Panel({ title, subtitle, actions, children, className = '', as: Tag = 'section' }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return (
    <Tag className={`panel p-4 sm:p-5 ${className}`}>
      {title || actions ? (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold leading-tight">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-[var(--text-muted)] text-pretty">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </Tag>
  )
}

export function Badge({ children, tone = 'neutral', title }: { children: ReactNode; tone?: 'neutral' | 'gold' | 'astral' | 'wine' | 'ok' | 'warn' | 'erro'; title?: string }) {
  const tones: Record<string, string> = {
    neutral: 'border-white/15 text-[var(--text-muted)]',
    gold: 'border-gold/50 text-gold-bright bg-gold/10',
    astral: 'border-astral/40 text-astral bg-astral/10',
    wine: 'border-wine/60 text-[#f0cfdd] bg-wine/25',
    ok: 'border-emerald-400/40 text-emerald-200 bg-emerald-400/10',
    warn: 'border-amber-400/40 text-amber-200 bg-amber-400/10',
    erro: 'border-rose-400/45 text-rose-200 bg-rose-400/10',
  }
  return (
    <span title={title} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Field({ label, hint, error, children, htmlFor }: { label: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor?: string }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 flex items-baseline justify-between gap-2 text-sm font-medium">{label}</span>
      {hint ? <span className="mb-1.5 block text-xs text-[var(--text-muted)] text-pretty">{hint}</span> : null}
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-rose-300">
          {error}
        </span>
      ) : null}
    </label>
  )
}

const INPUT_CLASS =
  'w-full rounded-md border border-[var(--line)] bg-black/25 px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-gold focus:outline-none'

export function TextInput({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${INPUT_CLASS} ${className}`} />
}

export function TextArea({ className = '', ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${INPUT_CLASS} min-h-[96px] resize-y leading-relaxed ${className}`} />
}

export function Select({ options, className = '', ...rest }: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`${INPUT_CLASS} ${className}`}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.05,
  label,
  format,
  onChange,
  disabled,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  label: string
  format?: (value: number) => string
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const id = useId()
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format ? format(value) : String(Math.round(percent)) + '%'}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-gold disabled:opacity-40"
        style={{ background: `linear-gradient(90deg, var(--color-gold) ${percent}%, rgba(255,255,255,.14) ${percent}%)` }}
      />
      <span className="w-14 shrink-0 text-right font-mono text-xs text-[var(--text-muted)]">{format ? format(value) : `${Math.round(percent)}%`}</span>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
    </div>
  )
}

export function Switch({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: ReactNode; hint?: ReactNode; disabled?: boolean }) {
  const { sfx } = useApp()
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-[var(--text-muted)] text-pretty">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          sfx('toggle')
          onChange(!checked)
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${checked ? 'border-gold bg-gold/30' : 'border-white/20 bg-white/5'} disabled:opacity-40`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked ? 'left-6 bg-gold-bright' : 'left-0.5 bg-white/70'}`} />
        <span className="sr-only">{checked ? 'activado' : 'desactivado'}</span>
      </button>
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label, size = 'md' }: { value: T; options: { value: T; label: string; title?: string }[]; onChange: (next: T) => void; label: string; size?: 'sm' | 'md' }) {
  const { sfx } = useApp()
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg border border-[var(--line)] bg-black/25 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => {
              if (!active) sfx('select')
              onChange(option.value)
            }}
            className={`${size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} rounded-md font-medium transition-colors ${active ? 'bg-gold text-[#12100a]' : 'text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text)]'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, width = 'max-w-2xl' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; width?: string }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const node = panelRef.current
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? [])
    focusables()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      ;(lastFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className={`panel max-h-[88vh] w-full ${width} animate-fade-up overflow-y-auto p-5`}>
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" sound="none" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </div>
        {children}
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function Tabs<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; badge?: ReactNode }[]; active: T; onChange: (id: T) => void }) {
  const { sfx } = useApp()
  return (
    <div role="tablist" aria-orientation="horizontal" className="flex flex-wrap gap-1 border-b border-[var(--line)]">
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            onClick={() => {
              sfx('select')
              onChange(tab.id)
            }}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors ${selected ? 'border-gold text-gold-bright' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {tab.label}
            {tab.badge}
          </button>
        )
      })}
    </div>
  )
}

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4" role="region" aria-label="Mensagens">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'erro' ? 'alert' : 'status'}
          className={`panel pointer-events-auto flex w-full max-w-lg items-start gap-3 p-3 text-sm animate-fade-up ${toast.kind === 'erro' ? 'border-rose-400/50' : toast.kind === 'ok' ? 'border-emerald-400/40' : ''}`}
        >
          <span aria-hidden className="mt-0.5 text-base">
            {toast.kind === 'erro' ? '⚠' : toast.kind === 'ok' ? '✓' : '✦'}
          </span>
          <p className="min-w-0 flex-1 text-pretty">{toast.text}</p>
          {toast.action ? (
            <Button size="sm" variant="outline" onClick={toast.action.onClick}>
              {toast.action.label}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" sound="none" aria-label="Dispensar mensagem" onClick={() => dismissToast(toast.id)}>
            ✕
          </Button>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--line)] px-6 py-12 text-center">
      <svg width="56" height="56" viewBox="0 0 100 100" aria-hidden className="text-gold/60">
        <rect x="18" y="10" width="40" height="68" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="42" y="22" width="40" height="68" rx="5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".6" />
        <circle cx="62" cy="56" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity=".8" />
      </svg>
      <h3 className="text-lg font-semibold">{title}</h3>
      {body ? <p className="max-w-md text-sm text-[var(--text-muted)] text-pretty">{body}</p> : null}
      {action}
    </div>
  )
}

export function Stat({ label, value, hint, tone = 'neutral' }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'neutral' | 'gold' | 'astral' }) {
  const toneClass = tone === 'gold' ? 'text-gold-bright' : tone === 'astral' ? 'text-astral' : 'text-[var(--text)]'
  return (
    <div className="rounded-lg border border-[var(--line)] bg-black/20 p-3">
      <dt className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">{label}</dt>
      <dd className={`mt-1 font-display text-2xl leading-none ${toneClass}`}>{value}</dd>
      {hint ? <p className="mt-1.5 text-xs text-[var(--text-muted)] text-pretty">{hint}</p> : null}
    </div>
  )
}

export function Bars({ data, label, color = 'var(--color-gold)' }: { data: { label: string; value: number; hint?: string }[]; label: string; color?: string }) {
  const max = Math.max(1, ...data.map((item) => item.value))
  return (
    <dl className="grid gap-1.5" aria-label={label}>
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[minmax(90px,140px)_1fr_auto] items-center gap-2 text-xs">
          <dt className="truncate text-[var(--text-muted)]" title={item.label}>
            {item.label}
          </dt>
          <dd className="h-2 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: color }} title={item.hint} />
          </dd>
          <dd className="w-10 text-right font-mono tabular-nums">{item.value}</dd>
        </div>
      ))}
      {data.length === 0 ? <p className="text-xs text-[var(--text-muted)]">Ainda sem dados suficientes.</p> : null}
    </dl>
  )
}

export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <span className={`skeleton block rounded ${className}`} aria-hidden />
}

export function KbdHint({ children }: { children: ReactNode }) {
  const { prefs } = useApp()
  if (!prefs.accessibility.keyboardHints) return null
  return <span className="kbd ml-1 align-middle">{children}</span>
}
