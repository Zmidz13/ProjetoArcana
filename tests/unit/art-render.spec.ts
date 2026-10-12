import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { DECK_THEMES, renderBackFallback, renderCard, renderCardBack, themeByKey } from '@/art/render.ts'
import { GLYPH_BASES, coverage, glyphIsResolvable } from '@/art/glyphs.ts'
import { CARDS } from '@/domain/content.ts'

const FORBIDDEN = ['<filter', '<mask', 'foreignObject', '<script', 'xlink:href', '<image']

const expectValidSvg = (svg: string, viewBox = '0 0 300 520') => {
  expect(svg.startsWith('<svg')).toBe(true)
  expect(svg).toContain(`viewBox="${viewBox}"`)
  expect(svg).toContain('</svg>')
  for (const token of FORBIDDEN) expect(svg.includes(token)).toBe(false)
  // tags equilibradas nos grupos (o motor aninha <g data-layer>)
  const open = (svg.match(/<g\b/g) ?? []).length
  const close = (svg.match(/<\/g>/g) ?? []).length
  expect(close).toBe(open)
}

describe('registos de glifos', () => {
  it('todos os glifos pedidos pelo conteúdo resolvem', () => {
    const used = [...new Set(CARDS.flatMap((card) => card.art.glyphs.map((glyph) => String(glyph))))]
    expect(used.length).toBeGreaterThan(150)
    expect(used.filter((id) => !glyphIsResolvable(id))).toEqual([])
    const result = coverage(used)
    expect(result.unresolved).toEqual([])
    expect(result.direct + result.composed).toBe(used.length)
    expect(GLYPH_BASES.length).toBeGreaterThan(20)
  })
})

describe('renderCard', () => {
  it('é determinístico para a mesma entrada', () => {
    const card = CARDS[0]!
    const a = renderCard(card, { theme: 'obsidiana', layered: true, a11y: true })
    const b = renderCard(card, { theme: 'obsidiana', layered: true, a11y: true })
    expect(a.svg).toBe(b.svg)
    expect(a.layers).toEqual(b.layers)
  })

  it('produz SVG válido e com camadas nomeadas para todas as cartas numa amostra de temas', () => {
    const sample = CARDS.filter((_, index) => index % 7 === 0)
    for (const card of sample) {
      for (const theme of DECK_THEMES.slice(0, 3)) {
        const result = renderCard(card, { theme: theme.key, layered: true, a11y: true, badge: true })
        expectValidSvg(result.svg)
        expect(result.svg).toContain(`<title>${card.name.pt}</title>`.replace('</title>', '</title>'))
        expect(result.svg).toContain('<desc>')
        for (const layer of ['moldura', 'fundo', 'ceu', 'cena', 'glifos', 'tarja']) {
          if (theme.key === DECK_THEMES[0]!.key) expect(result.layers).toContain(layer)
        }
      }
    }
  })

  it('a carta invertida só roda o miolo — a moldura e a tarja ficam no lugar', () => {
    const card = CARDS[12]!
    const upright = renderCard(card, { theme: 'obsidiana' })
    const reversed = renderCard(card, { theme: 'obsidiana', orientation: 'reversed' })
    expect(reversed.svg).not.toBe(upright.svg)
    // a cena roda; a moldura/fundo/tarja não entram no grupo rodado
    expect(reversed.svg).toMatch(/data-layer="cena" transform="rotate\(180/)
    expect(upright.svg).toMatch(/data-layer="cena" transform=""/)
    expect(reversed.svg).not.toMatch(/data-layer="moldura"[^>]*rotate/)
    expect(reversed.layers).toEqual(upright.layers)
  })

  it('escapa textohostil vindo do conteúdo', () => {
    const card = structuredClone(CARDS[0]!)
    card.name.pt = 'Carta <script>alert(1)</script> & "aspas"'
    const result = renderCard(card, { theme: 'obsidiana', a11y: true })
    expect(result.svg).not.toContain('<script')
    expect(result.svg).toContain('&lt;script')
    expectValidSvg(result.svg)
  })

  it('o selo de seed muda o desenho sem o invalidar', () => {
    const card = CARDS[5]!
    const plain = renderCard(card, { theme: 'obsidiana' }).svg
    const sealed = renderCard(card, { theme: 'obsidiana', seal: '9f3ac1' }).svg
    expect(sealed).not.toBe(plain)
    expectValidSvg(sealed)
  })

  it('cada carta é diferente das outras dentro do mesmo tema', () => {
    const svgs = new Set(CARDS.map((card) => renderCard(card, { theme: 'obsidiana' }).svg))
    expect(svgs.size).toBe(CARDS.length)
  })
})

describe('versos de carta', () => {
  it('renderCardBack e renderBackFallback produzem SVG válido por tema', () => {
    for (const theme of DECK_THEMES) {
      expectValidSvg(renderCardBack(theme.key))
      expectValidSvg(renderBackFallback(theme.key), '0 0 30 52')
    }
    expect(themeByKey('tema-que-nao-existe').key).toBe(DECK_THEMES[0]!.key)
  })
})

describe('arte gerada em disco', () => {
  it('o manifest aponta para ficheiros que existem e não mudaram de hash', () => {
    const manifestPath = fileURLToPath(new URL('../../public/art/manifest.json', import.meta.url))
    if (!existsSync(manifestPath)) return // `npm run art:build` ainda não foi corrido nesta máquina
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const files = new Set<string>()
    expect(manifest.entries.length).toBeGreaterThanOrEqual(DECK_THEMES.length * CARDS.length * 0.9)
    for (const entry of manifest.entries) {
      expect(entry.file, entry.id).toBeTruthy()
      expect(files.has(entry.hash), `hash repetido: ${entry.file}`).toBe(false)
      files.add(entry.hash)
      if (entry.bytes) {
        const path = fileURLToPath(new URL(`../../public/${entry.file}`, import.meta.url))
        expect(existsSync(path), entry.file).toBe(true)
        expect(readFileSync(path, 'utf8').startsWith('<svg')).toBe(true)
      }
    }
  })
})
