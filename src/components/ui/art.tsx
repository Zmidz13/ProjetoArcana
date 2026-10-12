'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useApp } from '@/components/providers.tsx'
import { getCard } from '@/domain/content.ts'

/**
 * Camada de arte: todas as ilustrações são SVG originais gerados pelo motor em
 * `src/art/*` e materializados em `public/art/<tema>/<id>.svg` por `npm run art:build`.
 * Não há URLs externos nem imagens de terceiros; o `<img>` é suficiente porque o SVG já
 * traz fundo, moldura e tarja.
 */

export interface ManifestGlyph {
  id: string
  base: string
  count: number
  states: string[]
}

export interface ManifestEntry {
  id: string
  name: string
  theme: string
  file: string
  bytes: number
  hash: string
  layers: string[]
  glyphs: ManifestGlyph[]
}

export interface ArtManifest {
  generatedAt: string
  themes: string[]
  cards: number
  entries: ManifestEntry[]
  glyphCoverage: { declared: number; resolved: number }
}

let manifestPromise: Promise<ArtManifest | null> | null = null

export function loadArtManifest(): Promise<ArtManifest | null> {
  if (manifestPromise) return manifestPromise
  manifestPromise = fetch('/art/manifest.json', { cache: 'force-cache' })
    .then((response) => (response.ok ? (response.json() as Promise<ArtManifest>) : null))
    .catch(() => null)
  return manifestPromise
}

export function useArtManifest(): { manifest: ArtManifest | null; error: string | null } {
  const [manifest, setManifest] = useState<ArtManifest | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    void loadArtManifest().then((value) => {
      if (!alive) return
      if (!value) setError('Falta o manifesto de arte. Corre `npm run art:build` para gerar os SVG.')
      else setManifest(value)
    })
    return () => {
      alive = false
    }
  }, [])
  return { manifest, error }
}

export const THEME_LABELS: Record<string, { name: string; note: string }> = {
  obsidiana: { name: 'Obsidiana', note: 'pedra negra, filete de ouro, ar de templo nocturno' },
  'ouro-velho': { name: 'Ouro Velho', note: 'parchment quente e dourado gasto, tipo gravura do séc. XV' },
  linho: { name: 'Linho', note: 'papel de linho, traço fino — o mais leve para impressão' },
  nanquim: { name: 'Nanquim', note: 'tinta-da-china, contraste alto, sombras de pincel' },
  vitral: { name: 'Vitral', note: 'cores de vidro de capela, chumbo a separar as formas' },
  nocturno: { name: 'Nocturno', note: 'azuis profundos e prata — feito para leitura à noite' },
  cinza: { name: 'Cinza', note: 'escala de cinzentos com um único acento, para alta legibilidade' },
}

export function themeLabel(theme: string): string {
  return THEME_LABELS[theme]?.name ?? theme
}

export function artPath(cardId: string, theme: string, orientation: 'upright' | 'reversed' = 'upright'): string {
  const suffix = orientation === 'reversed' ? '.reversed' : ''
  return `/art/${theme}/${cardId}${suffix}.svg`
}

export function backPath(theme: string, mini = false): string {
  return `/art/${theme}/${mini ? 'verso-mini' : 'verso'}.svg`
}

export function CardArt({
  cardId,
  theme,
  orientation = 'upright',
  eager = false,
  className = '',
  alt,
}: {
  cardId: string
  theme: string
  orientation?: 'upright' | 'reversed'
  eager?: boolean
  className?: string
  alt?: string
}) {
  const card = getCard(cardId)
  const text = alt ?? (card ? `${card.name.pt}${orientation === 'reversed' ? ' (invertida)' : ''} — ${card.a11y.alt}` : `Carta ${cardId}`)
  return (
    // `next/image` não acrescenta nada aqui: o SVG é um ficheiro local estático de ~9 kB,
    // servido do próprio `public/`, e o otimizador exigiria dependências nativas no build.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={artPath(cardId, theme, orientation)}
      alt={text}
      width={300}
      height={520}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`h-full w-full select-none object-cover ${className}`}
      style={{ aspectRatio: '300 / 520' }}
    />
  )
}

export function CardBack({ theme, mini = false, className = '' }: { theme: string; mini?: boolean; className?: string }) {
  return (
    // ver o comentário de `CardArt`: SVG estático local, sem ganho no otimizador de imagens
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={backPath(theme, mini)}
      alt=""
      aria-hidden
      width={300}
      height={520}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`h-full w-full select-none object-cover ${className}`}
      style={{ aspectRatio: '300 / 520' }}
    />
  )
}

/**
 * Carta com verso/frente e viragem em 3D. `flipped` é controlado pelo pai (a mesa decide
 * quando a posição é revelada) e `onFlipSound` faz o `flip` soar diferente quando sai
 * invertida — coerência entre o que se vê e o que se ouve.
 */
export function CardFigure({
  cardId,
  theme,
  orientation = 'upright',
  revealed = true,
  onSelect,
  selected = false,
  disabled = false,
  label,
  hint,
  className = '',
  hoverSound = true,
}: {
  cardId?: string
  theme: string
  orientation?: 'upright' | 'reversed'
  revealed?: boolean
  onSelect?: () => void
  selected?: boolean
  disabled?: boolean
  label?: ReactNode
  hint?: ReactNode
  className?: string
  hoverSound?: boolean
}) {
  const { sfx, reducedMotion } = useApp()
  const [hovered, setHovered] = useState(false)
  const flipped = revealed && !!cardId && orientation === 'reversed'
  const showFace = revealed && !!cardId
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion || !hoverSound) return
    if (hovered) sfx('hover', { gain: 0.5 })
  }, [hovered, reducedMotion, hoverSound, sfx])

  const interactive = !!onSelect && !disabled
  return (
    <div className={`card-3d group relative ${className}`}>
      <div
        ref={rootRef}
        className="card-inner h-full w-full"
        data-flipped={String(flipped)}
        style={flipped && !reducedMotion ? { transform: 'rotateY(180deg) rotate(180deg)' } : flipped ? { transform: 'rotate(180deg)' } : undefined}
      >
        <div className="card-side card-face h-full w-full" data-visible={String(!showFace)}>
          <CardBack theme={theme} />
        </div>
        {cardId ? (
          <div className="card-side card-side--back card-face h-full w-full">
            <CardArt cardId={cardId} theme={theme} orientation="upright" eager={revealed} />
          </div>
        ) : null}
      </div>
      {interactive ? (
        <button
          type="button"
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-pressed={selected}
          className="absolute inset-0 rounded-[10px] border border-transparent transition-[border-color,box-shadow] duration-200 group-hover:border-gold/60 group-focus-visible:border-gold"
        >
          <span className="sr-only">{typeof label === 'string' ? label : 'Escolher esta carta'}</span>
        </button>
      ) : null}
      {label || hint ? (
        <div className="mt-1.5 text-center">
          {label ? <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p> : null}
          {hint ? <p className="text-[11px] text-[var(--text-muted)]/80">{hint}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

/** Círculo astrológico do dia — desenhado em SVG, não é imagem. */
export function MoonDial({ illum, phase, age }: { illum: number; phase: string; age: number }) {
  const r = 34
  const offset = (1 - illum * 2) * r
  return (
    <svg viewBox="0 0 100 100" width="88" height="88" role="img" aria-label={`Lua ${phase}: ${Math.round(illum * 100)}% iluminada, ${age.toFixed(1)} dias de idade.`}>
      <defs>
        <clipPath id={`moon-${Math.round(illum * 1000)}`}>
          <circle cx="50" cy="50" r={r} />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r={r + 6} fill="none" stroke="var(--color-gold)" strokeOpacity=".3" />
      <circle cx="50" cy="50" r={r} fill="#efe6d6" clipPath={`url(#moon-${Math.round(illum * 1000)})`} />
      <circle cx={50 + offset} cy="50" r={r} fill="#0b0a12" clipPath={`url(#moon-${Math.round(illum * 1000)})`} />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" />
    </svg>
  )
}

/** Mini-mapa da tiragem: posições relativas a partir do layout normalizado. */
export function SpreadMap({ points, active, size = 120, showNumbers = true }: { points: { x: number; y: number; label?: string }[]; active?: number; size?: number; showNumbers?: boolean }) {
  const scale = size - 18
  const cardW = Math.max(8, Math.min(28, scale / 4.6))
  const cardH = cardW / 0.576923
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Esquema da tiragem com ${points.length} posições.`} className="overflow-visible">
      {points.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`} transform={`translate(${9 + point.x * scale} ${9 + point.y * scale})`}>
          <rect
            x={-cardW / 2}
            y={-cardH / 2}
            width={cardW}
            height={cardH}
            rx={2}
            fill={index === active ? 'var(--color-gold)' : 'none'}
            stroke={index === active ? 'var(--color-gold-bright)' : 'var(--line)'}
            strokeWidth={1}
          />
          {showNumbers ? (
            <text x={0} y={3} textAnchor="middle" fontSize={cardW * 0.5} fill={index === active ? '#12100a' : 'var(--text-muted)'}>
              {index + 1}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

export function useCardAlt(cardId: string | undefined, orientation: 'upright' | 'reversed' = 'upright'): string {
  return useMemo(() => {
    if (!cardId) return 'Carta por descobrir'
    const card = getCard(cardId)
    if (!card) return `Carta ${cardId}`
    return `${card.name.pt}${orientation === 'reversed' ? ', invertida' : ''}. ${card.a11y.long}`
  }, [cardId, orientation])
}

/** Pré-carrega o SVG de uma carta (usado pela mesa antes de animar a viragem). */
export function preloadCard(cardId: string, theme: string, orientation: 'upright' | 'reversed' = 'upright'): void {
  if (typeof window === 'undefined') return
  const image = new Image()
  image.src = artPath(cardId, theme, orientation)
}

export function usePreload(onLoad?: () => void) {
  return useCallback(
    (cardIds: { cardId: string; orientation: 'upright' | 'reversed' }[], theme: string) => {
      const pending = cardIds.length
      if (pending === 0) {
        onLoad?.()
        return
      }
      let done = 0
      cardIds.forEach(({ cardId, orientation }) => {
        const image = new Image()
        const settle = () => {
          done += 1
          if (done === pending) onLoad?.()
        }
        image.onload = settle
        image.onerror = settle
        image.src = artPath(cardId, theme, orientation)
      })
    },
    [onLoad],
  )
}
