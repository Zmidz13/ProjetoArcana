import './globals.css'

import type { Metadata, Viewport } from 'next'

import { AppProviders } from '@/components/providers.tsx'
import { AppShell } from '@/components/app-shell.tsx'
import { CONTENT_STATS } from '@/domain/content.ts'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.ARCANA_PUBLIC_URL ?? 'http://localhost:3000'),
  title: {
    default: 'ARCANA — Tarot com interpretação simbólica e IA',
    template: '%s · ARCANA',
  },
  description: `Plataforma completa de tarot: ${CONTENT_STATS.cards} cartas ilustradas, ${CONTENT_STATS.spreads} tiragens, sistema físico de baralhar, ambientes sonoros gerados e interpretação contextual. Conteúdo simbólico, não previsão.`,
  applicationName: 'ARCANA',
  keywords: ['tarot', 'tarô', 'baralho', 'leitura', 'autoconhecimento', 'IA', 'português'],
  authors: [{ name: 'ARCANA' }],
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    title: 'ARCANA — Tarot com interpretação simbólica e IA',
    description: '78 cartas originais, 76 tiragens, mesa cinematográfica e leitura híbrida (motor simbólico + LLM).',
    images: [{ url: '/og/arcana.png', width: 1200, height: 630, alt: 'ARCANA — três cartas sobre feltro escuro' }],
  },
  twitter: { card: 'summary_large_image', title: 'ARCANA', description: 'Tarot simbólico com IA, em português.' },
  icons: {
    icon: [{ url: '/art/obsidiana/verso-mini.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/art/obsidiana/verso-mini.svg' }],
  },
  other: {
    'content-language': 'pt-PT',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080D' },
    { media: '(prefers-color-scheme: light)', color: '#F3ECE0' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" data-theme="noite" suppressHydrationWarning>
      <head>
        {/* Evita flash do tema errado: lê o localStorage antes da primeira pintura. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var r=JSON.parse(localStorage.getItem('arcana:preferences')||'{}');if(r&&r.theme){document.documentElement.dataset.theme=r.theme}if(r&&r.accessibility){document.documentElement.dataset.highContrast=String(!!r.accessibility.highContrast);document.documentElement.dataset.largeText=String(!!r.accessibility.largeText)}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
