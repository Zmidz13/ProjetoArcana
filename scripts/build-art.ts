/**
 * Gera a arte estática do baralho.
 *
 *   node scripts/build-art.ts [--themes obsidiana,ouro-velho] [--check] [--pretty]
 *
 * Saída:
 *   public/art/<tema>/<carta>.svg     78 cartas por tema
 *   public/art/<tema>/verso.svg      verso do baralho
 *   public/art/manifest.json         índice (id, tema, hash, bytes, camadas, glifos)
 *
 * `--check` valida sem escrever: é o modo usado por `npm run content:validate` e pelo CI, e
 * falha se algum glifo declarado no conteúdo não for resolvível pelo motor.
 */

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

import type { CardDef } from '../src/domain/types.ts'
import { DECK_THEMES, renderBackFallback, renderCard, renderCardBack, themeByKey } from '../src/art/render.ts'
import { glyphIsResolvable } from '../src/art/glyphs.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outDir = join(root, 'public', 'art')
const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const pretty = args.includes('--pretty')
const themeArg = args[args.indexOf('--themes') + 1]
const themes = themeArg && themeArg !== '--themes' ? themeArg.split(',').map((value) => value.trim()).filter(Boolean) : DECK_THEMES.map((theme) => theme.key)

/**
 * O conteúdo é lido do JSON gerado por `build-content.ts` (e não via `src/domain/content.ts`)
 * para que este script corra em Node puro, sem bundler: mesma fonte de verdade, zero
 * dependência de aliases `@/` ou de import attributes de JSON.
 */
const CARDS = (JSON.parse(readFileSync(join(root, 'src/domain/data/content.json'), 'utf8')) as { cards: CardDef[] }).cards

const errors: string[] = []
const warnings: string[] = []

/* 1. Glifos: cada id declarado tem de resolver para desenho. */
const glyphIds = new Set<string>()
for (const card of CARDS) for (const id of card.art.glyphs) glyphIds.add(id)
const unresolvable = [...glyphIds].filter((id) => !glyphIsResolvable(id))
if (unresolvable.length) errors.push(`glifos sem resolução (${unresolvable.length}): ${unresolvable.slice(0, 12).join(', ')}`)

/* 2. Render e unicidade. */
type ManifestEntry = {
  id: string
  name: string
  theme: string
  file: string
  bytes: number
  hash: string
  layers: string[]
  glyphs: { id: string; base: string; count: number; states: string[] }[]
}

const manifest: ManifestEntry[] = []
const seen = new Map<string, string>()
let totalBytes = 0
let written = 0

for (const themeKey of themes) {
  if (!DECK_THEMES.some((entry) => entry.key === themeKey)) {
    errors.push(`tema inexistente: ${themeKey}`)
    continue
  }
  const theme = themeByKey(themeKey)
  const dir = join(outDir, theme.key)
  if (!checkOnly) {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
  }
  for (const card of CARDS) {
    const upright = renderCard(card, { theme: theme.key, orientation: 'upright' })
    const reversed = renderCard(card, { theme: theme.key, orientation: 'reversed' })
    if (upright.svg.length < 1200) errors.push(`${card.id}: SVG demasiado pequeno (${upright.svg.length} bytes) — desenho incompleto`)
    if (upright.svg.length > 60000) warnings.push(`${card.id}: SVG com ${Math.round(upright.svg.length / 1024)} kB`)
    if (/<script|onerror=|javascript:/i.test(upright.svg)) errors.push(`${card.id}: SVG contém conteúdo executivo proibido`)
    const hash = createHash('sha1').update(upright.svg).digest('hex').slice(0, 16)
    const previous = seen.get(hash)
    if (previous && previous !== card.id) errors.push(`${card.id}: idêntico a ${previous} — as cartas têm de se distinguir`)
    seen.set(hash, card.id)
    const file = `${card.id}.svg`
    if (!checkOnly) {
      writeFileSync(join(dir, file), pretty ? formatSvg(upright.svg) : upright.svg, 'utf8')
      writeFileSync(join(dir, `${card.id}.reversed.svg`), reversed.svg, 'utf8')
      written += 2
    }
    totalBytes += upright.svg.length
    manifest.push({
      id: card.id,
      name: card.name.pt,
      theme: theme.key,
      file: `art/${theme.key}/${file}`,
      bytes: upright.svg.length,
      hash,
      layers: upright.layers,
      glyphs: upright.glyphs,
    })
  }
  if (!checkOnly) {
    writeFileSync(join(dir, 'verso.svg'), renderCardBack(theme.key), 'utf8')
    const back = renderBackFallback(theme.key)
    if (back.length < 400) errors.push(`${theme.key}: verso de reserva demasiado simples`)
    writeFileSync(join(dir, 'verso-mini.svg'), back, 'utf8')
    written += 2
  }
}

if (!checkOnly) {
  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        themes,
        cards: CARDS.length,
        entries: manifest,
        glyphCoverage: { declared: glyphIds.size, resolved: glyphIds.size - unresolvable.length },
      },
      null,
      2,
    ),
    'utf8',
  )
}

if (errors.length) {
  console.error(`✖ build-art: ${errors.length} problema(s)`)
  for (const error of errors.slice(0, 30)) console.error('  · ' + error)
  process.exit(1)
}

const perFile = manifest.length ? totalBytes / manifest.length : 0
console.log(
  `✔ build-art: ${CARDS.length} cartas × ${themes.length} tema(s) · ${written} ficheiros · média ${(perFile / 1024).toFixed(1)} kB por carta ( frente), total ${(totalBytes / 1024 / 1024).toFixed(2)} MB${checkOnly ? ' (verificação)' : ''}`,
)
if (warnings.length) {
  console.log(`  · avisos: ${warnings.length}`)
  for (const warning of warnings.slice(0, 8)) console.log('  · ' + warning)
}

function formatSvg(svg: string): string {
  return svg.replace(/></g, '>\n<')
}

/** Sanity check de sistema de ficheiros: nada fica órfão de um tema conhecido. */
if (!checkOnly) {
  const present = readdirSync(outDir).filter((entry) => statSync(join(outDir, entry)).isDirectory())
  const unknown = present.filter((entry) => !themes.includes(entry))
  if (unknown.length) console.log(`  · temas existentes mas não gerados agora: ${unknown.join(', ')}`)
}
