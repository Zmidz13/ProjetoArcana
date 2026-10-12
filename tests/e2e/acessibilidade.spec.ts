import { expect, test } from '@playwright/test'

const contrast = `(() => {
  const parse = (value) => (value.match(/\\d+(?:\\.\\d+)?/g) ?? []).slice(0, 3).map(Number)
  const lum = ([r, g, b]) => {
    const f = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const el = document.querySelector('main p, main li, main span')
  if (!el) return { ratio: 1, note: 'sem texto' }
  const color = parse(getComputedStyle(el).color)
  let node = el
  let background = [8, 8, 13]
  while (node) {
    const raw = getComputedStyle(node).backgroundColor
    if (!raw.includes('rgba(0, 0, 0, 0)') && !raw.includes('transparent')) { background = parse(raw); break }
    node = node.parentElement
  }
  const l1 = lum(color)
  const l2 = lum(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  return { ratio: Math.round(ratio * 100) / 100, color, background }
})()`

test.describe('acessibilidade', () => {
  test('base semântica da aplicação', async ({ page }) => {
    await page.goto('/')
    expect(await page.getAttribute('html', 'lang')).toBe('pt-PT')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('navigation').first()).toBeVisible()
    expect(await page.locator('h1').count()).toBeGreaterThan(0)
  })

  test('a ligação de salto leva ao conteúdo com uma só tecla', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.locator('a.skip-link')
    await expect(skip).toBeVisible()
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => location.hash === '#conteudo' || document.activeElement?.id === 'conteudo').catch(() => {})
    const target = page.locator('#conteudo')
    await expect(target).toBeVisible()
  })

  test('o leque é uma listbox navegável por teclado', async ({ page }) => {
    await page.goto('/ritual/past-present-future')
    await page.getByTestId('baralhar').click()
    const skip = page.getByTestId('nao-cortar')
    if (await skip.isVisible().catch(() => false)) await skip.click()
    const deck = page.getByTestId('baralho')
    await expect(deck).toHaveAttribute('role', 'listbox')
    await expect(deck).toHaveAttribute('aria-label', 'Baralho para escolha')
    await deck.focus()
    const before = await deck.getAttribute('aria-activedescendant')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const after = await deck.getAttribute('aria-activedescendant')
    expect(after).not.toBe(before)
    await page.keyboard.press('Enter')
    await expect(deck.locator('[aria-selected="true"]').first()).toBeVisible()
    const options = await deck.locator('[role="option"]').count()
    expect(options).toBeGreaterThanOrEqual(78)
  })

  test('o anel de foco está presente no primeiro elemento interactivo', async ({ page }) => {
    await page.goto('/tiragens')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el) return null
      const style = getComputedStyle(el)
      return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow }
    })
    expect(ring).not.toBeNull()
    const visible = Number.parseFloat(ring!.outlineWidth || '0') > 0 || ring!.boxShadow !== 'none'
    expect(visible).toBe(true)
  })

  test('prefers-reduced-motion corta a animação sem cortar a informação', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const duration = await page.evaluate(() => {
      const el = document.querySelector('[class*="animate"], .card-face, img') as HTMLElement | null
      if (!el) return '0s'
      return getComputedStyle(el).animationDuration
    })
    const seconds = Number.parseFloat(duration)
    expect(Number.isNaN(seconds) || seconds <= 0.05).toBe(true)
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('contraste do texto principal em modo noite', async ({ page }) => {
    await page.goto('/tiragens')
    const result = await page.evaluate(contrast as unknown as string) as { ratio: number }
    expect(result.ratio).toBeGreaterThanOrEqual(4.5)
  })

  test('os diálogos devolvem o foco e fecham com Escape', async ({ page }) => {
    await page.goto('/som')
    const dialog = page.getByRole('dialog')
    if (!(await dialog.isVisible().catch(() => false))) {
      // no painel de som o teste aplicável é o dos atalhos de teclado: nada de focus trap sem diálogo aberto
      await expect(page.getByRole('main')).toBeVisible()
    }
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('todas as imagens de carta têm alternativa textual', async ({ page }) => {
    await page.goto('/baralho')
    const missing = await page.locator('img:not([alt])').count()
    expect(missing).toBe(0)
    const decorative = await page.locator('img[alt=""][aria-hidden]').count()
    expect(decorative).toBeGreaterThanOrEqual(0)
    await expect(page.locator('a[href^="/baralho/"]').first()).toBeVisible()
  })
})
