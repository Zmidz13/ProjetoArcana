'use client'

import { useEffect, useState } from 'react'

import { useApp } from '@/components/providers.tsx'
import { CardArt, THEME_LABELS, loadArtManifest, type ArtManifest } from '@/components/ui/art.tsx'

/** Selector de tema de baralho com amostra real do SVG gerado (não é miniatura falsa). */
export function ThemeShowcase() {
  const { deckTheme, setDeckTheme, sfx } = useApp()
  const [manifest, setManifest] = useState<ArtManifest | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    void loadArtManifest().then((value) => {
      if (!value) setMissing(true)
      else setManifest(value)
    })
  }, [])

  const themes = manifest?.themes ?? []
  const sample = (theme: string) => manifest?.entries.find((entry) => entry.theme === theme && entry.id === 'major-17-star') ?? manifest?.entries.find((entry) => entry.theme === theme)

  if (missing) {
    return (
      <p className="rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-100">
        Ainda não há SVG gerados. Corre <code className="kbd">npm run art:build</code> para materializar as 78 cartas × 7 temas em <code className="kbd">public/art/</code>.
      </p>
    )
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {themes.map((theme) => {
          const entry = sample(theme)
          const active = theme === deckTheme
          return (
            <li key={theme}>
              <button
                type="button"
                onClick={() => {
                  setDeckTheme(theme)
                  sfx('flip')
                }}
                aria-pressed={active}
                title={THEME_LABELS[theme]?.note ?? theme}
                className={`w-full rounded-lg border p-1.5 text-left transition-colors ${active ? 'border-gold bg-gold/12' : 'border-[var(--line)] hover:border-gold/50'}`}
              >
                <span className="block card-face h-[92px] w-full overflow-hidden">
                  {entry ? <CardArt cardId={entry.id} theme={theme} /> : <span className="skeleton block h-full w-full" />}
                </span>
                <span className="mt-1 block truncate text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{THEME_LABELS[theme]?.name ?? theme}</span>
              </button>
            </li>
          )
        })}
        {themes.length === 0 ? <li className="col-span-full text-xs text-[var(--text-muted)]">a carregar manifesto…</li> : null}
      </ul>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {manifest ? `${manifest.cards} cartas por tema · ${manifest.entries.length} ficheiros · glifos resolvidos ${manifest.glyphCoverage.resolved}/${manifest.glyphCoverage.declared}` : ''}
      </p>
    </div>
  )
}
