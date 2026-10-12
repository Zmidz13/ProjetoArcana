'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useApp } from '@/components/providers.tsx'
import { Toaster } from '@/components/ui/primitives.tsx'
import { useArtManifest } from '@/components/ui/art.tsx'

const PRIMARY_NAV = [
  { href: '/tiragens', label: 'Tiragens' },
  { href: '/baralho', label: 'Baralho' },
  { href: '/historico', label: 'Histórico' },
  { href: '/diario', label: 'Diário' },
]

const SECONDARY_NAV = [
  { href: '/calendario', label: 'Calendário' },
  { href: '/estatisticas', label: 'Estatísticas' },
  { href: '/som', label: 'Som e ambiente' },
  { href: '/preferencias', label: 'Preferências' },
  { href: '/conta', label: 'Conta e dados' },
  { href: '/diagnostico', label: 'Diagnóstico' },
  { href: '/sobre', label: 'Sobre o projecto' },
  { href: '/acessibilidade', label: 'Acessibilidade' },
]

/** Barra superior fixa: navegação, estado da sessão, som, tema. Tudo funcional. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { audio, audioState, prefs, patchPrefs, session, deckTheme, setDeckTheme, vfx, attachVfx } = useApp()
  const { manifest } = useArtManifest()
  const themeList = manifest?.themes ?? []
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    attachVfx(canvasRef.current)
    return () => attachVfx(null)
  }, [attachVfx])

  useEffect(() => setMenuOpen(false), [pathname])

  const onRitual = pathname.startsWith('/ritual')

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo
      </a>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-700" style={{ background: `radial-gradient(120% 75% at 50% -12%, ${prefs.environment ? audioTint(prefs.environment) : 'transparent'}, transparent 62%)` }} />
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface-solid)]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-md px-1 py-1" aria-label="ARCANA — início">
            <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden className="text-gold transition-transform duration-500 group-hover:rotate-180">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M20 4l4.4 11.6L36 20l-7.6 4.4L20 36l-4.4-11.6L4 20l7.6-4.4z" fill="currentColor" fillOpacity=".85" />
            </svg>
            <span className="font-display text-lg leading-none tracking-[0.18em]">ARCANA</span>
          </Link>

          <nav aria-label="Navegação principal" className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
            {PRIMARY_NAV.map((item) => (
              < NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
            ))}
            <Link href="/mesa" className={`ml-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${onRitual ? 'border-gold bg-gold text-[#12100a]' : 'border-gold/50 text-gold-bright hover:bg-gold/15'}`}>
              Abrir mesa
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <SoundToggle running={audioState.running} enabled={prefs.audio.enabled} onToggle={(next) => patchPrefs({ audio: { ...prefs.audio, enabled: next } })} muted={!audioState.enabled} onStart={() => void audio.resume()} />
            <ThemeQuickPick theme={prefs.theme} onPick={(theme) => patchPrefs({ theme })} />
            <DeckQuickPick theme={deckTheme} themes={themeList} onPick={setDeckTheme} />
            {session?.user ? (
              <Link href="/conta" className="hidden rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold sm:inline-flex">
                @{session.user.handle}
              </Link>
            ) : (
              <Link href="/entrar" className="hidden rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs hover:border-gold sm:inline-flex">
                Entrar
              </Link>
            )}
            <button type="button" className="rounded-md border border-[var(--line)] p-2 md:hidden" aria-expanded={menuOpen} aria-controls="menu-secundario" onClick={() => setMenuOpen((open) => !open)}>
              <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav id="menu-secundario" aria-label="Mais páginas" className="border-t border-[var(--line)] bg-[var(--surface-solid)] px-4 py-3 md:hidden">
            <ul className="grid grid-cols-2 gap-1 text-sm">
              {[...PRIMARY_NAV, ...SECONDARY_NAV, { href: '/mesa', label: 'Mesa do ritual' }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-md px-2 py-2 hover:bg-white/10">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5">
        {children}
      </main>

      <footer className="border-t border-[var(--line)] bg-black/25">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm md:grid-cols-4">
          <div>
            <p className="font-display text-base tracking-[0.14em]">ARCANA</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Tarot como linguagem simbólica. Conteúdo apresentado como tradição e ferramenta de reflexão — não como previsão, diagnóstico ou evidência.
            </p>
          </div>
          <nav aria-label="Páginas do projecto">
            <ul className="space-y-1.5">
              {SECONDARY_NAV.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[var(--text-muted)] underline-offset-4 hover:text-gold hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Projecto e documentação">
            <ul className="space-y-1.5">
              <li><Link href="/sobre" className="text-[var(--text-muted)] hover:text-gold">Sobre e fontes</Link></li>
              <li><Link href="/privacidade" className="text-[var(--text-muted)] hover:text-gold">Privacidade</Link></li>
              <li><Link href="/termos" className="text-[var(--text-muted)] hover:text-gold">Termos de uso</Link></li>
              <li><Link href="/acessibilidade" className="text-[var(--text-muted)] hover:text-gold">Declaração de acessibilidade</Link></li>
            </ul>
          </nav>
          <div className="text-xs text-[var(--text-muted)]">
            <p className="font-medium text-[var(--text)]">Estado actual</p>
            <ul className="mt-1.5 space-y-1">
              <li>Baralho: 78 cartas · {themeList.length || 7} temas de arte</li>
              <li>Tiragens: 76 no catálogo</li>
              <li>IA: {audioState.running ? 'som activo · ' : ''}{session?.ai.configured ? 'provedor ligado' : 'motor simbólico local'}</li>
            </ul>
          </div>
        </div>
      </footer>

      <canvas ref={canvasRef} className="vfx-layer" aria-hidden data-effects={vfx.snapshot.running ? 'on' : 'off'} />
      <Toaster />
    </div>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${active ? 'bg-white/10 text-gold-bright' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]'}`}>
      {label}
    </Link>
  )
}

function SoundToggle({ running, enabled, muted, onToggle, onStart }: { running: boolean; enabled: boolean; muted: boolean; onToggle: (next: boolean) => void; onStart: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={enabled && running}
      title={enabled ? (running ? 'Silenciar som ambiente' : 'Ouvir o ambiente (precisa de um clique)') : 'Som desligado'}
      onClick={() => {
        if (!enabled) {
          onToggle(true)
          onStart()
        } else {
          onToggle(false)
        }
      }}
      className="flex items-center gap-1.5 rounded-md border border-[var(--line)] px-2 py-1.5 text-xs transition-colors hover:border-gold"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {muted ? <path d="M17 8l4 8M21 8l-4 8" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
      <span className="hidden sm:inline">{muted ? 'Som off' : running ? 'Ambiente' : 'Ligar som'}</span>
    </button>
  )
}

function ThemeQuickPick({ theme, onPick }: { theme: string; onPick: (next: 'noite' | 'crepusculo' | 'claro') => void }) {
  const next = theme === 'noite' ? 'crepusculo' : theme === 'crepusculo' ? 'claro' : 'noite'
  const label = theme === 'noite' ? 'Noite' : theme === 'crepusculo' ? 'Crepúsculo' : 'Claro'
  return (
    <button type="button" onClick={() => onPick(next as 'noite' | 'crepusculo' | 'claro')} className="hidden items-center gap-1.5 rounded-md border border-[var(--line)] px-2 py-1.5 text-xs hover:border-gold sm:inline-flex" title={`Tema da interface: ${label}. Clique para ${next}.`}>
      <span aria-hidden className="inline-block h-3 w-3 rounded-full border border-current" style={{ background: theme === 'claro' ? '#f6f1e7' : theme === 'crepusculo' ? '#4b3f66' : '#0b0a12' }} />
      {label}
    </button>
  )
}

function DeckQuickPick({ theme, themes, onPick }: { theme: string; themes: string[]; onPick: (next: string) => void }) {
  const list = themes.length ? themes : [theme]
  const index = list.indexOf(theme)
  const nextTheme = () => onPick(list[(index + 1) % list.length] ?? list[0] ?? 'obsidiana')
  return (
    <button type="button" onClick={nextTheme} className="hidden items-center gap-1.5 rounded-md border border-[var(--line)] px-2 py-1.5 text-xs capitalize hover:border-gold lg:inline-flex" title="Tema de ilustração do baralho (avança para o próximo)">
      Baralho: <span className="font-medium text-gold-bright">{theme}</span>
    </button>
  )
}

function audioTint(environment: string): string {
  const tints: Record<string, string> = {
    templo: 'rgba(198,166,107,0.09)',
    'jardim-noturno': 'rgba(143,227,192,0.09)',
    lareira: 'rgba(255,138,61,0.1)',
    observatorio: 'rgba(120,170,255,0.09)',
    'praia-lunar': 'rgba(150,205,235,0.1)',
    biblioteca: 'rgba(210,180,120,0.08)',
    montanha: 'rgba(180,170,230,0.09)',
  }
  return tints[environment] ?? 'rgba(198,166,107,0.08)'
}
