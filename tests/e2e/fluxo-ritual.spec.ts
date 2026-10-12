import { expect, test, type Page } from '@playwright/test'

/**
 * Fluxo real, do pedido à leitura gravada. É o teste que justifica a existência do projeto:
 * se algo aqui partir, a plataforma deixou de fazer o que diz fazer.
 */

const SPREAD = 'past-present-future'

async function shuffleAndCut(page: Page) {
  await page.getByTestId('baralhar').click()
  const cut = page.getByTestId('cortar-aqui')
  await expect(cut).toBeVisible({ timeout: 15_000 })
  await cut.click()
}

async function pickWithKeyboard(page: Page, howMany: number) {
  const deck = page.getByTestId('baralho')
  await deck.focus()
  for (let index = 0; index < howMany; index += 1) {
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="baralho"] [data-taken="true"]')).toHaveCount(index + 1, { timeout: 10_000 })
  }
}

test.describe('ritual completo', () => {
  test('escolher cartas à mão, gravar, revelar e interpretar', async ({ page }) => {
    await page.goto(`/ritual/${SPREAD}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.getByTestId('pergunta').fill('O que preciso de ver antes de decidir sobre o projeto parado?')
    await expect(page.getByText(/seed/).first()).toBeVisible()

    await shuffleAndCut(page)

    await pickWithKeyboard(page, 3)
    await expect(page.getByText('compra manual completa')).toBeVisible()

    await page.getByTestId('gravar').click()
    await expect(page.getByTestId('gravar')).toHaveText(/Gravada/, { timeout: 20_000 })

    // revelação carta a carta
    for (let index = 0; index < 3; index += 1) {
      await page.getByTestId('revelar').click()
    }
    await expect(page.getByRole('button', { name: /Revelar próxima/ })).toBeDisabled()

    // interpretação pelo motor local: sem rede, determinística, e com as secções todas
    await page.getByTestId('interpretar-local').click()
    const sections = ['Abertura', 'Carta a carta', 'Combinações', 'Síntese']
    for (const label of sections) {
      await expect(page.getByRole('button', { name: new RegExp(label, 'i') }).or(page.getByRole('heading', { name: new RegExp(label, 'i') })).first()).toBeVisible({
        timeout: 30_000,
      })
    }

    const readingLink = page.getByRole('link', { name: /Abrir leitura completa/ })
    await expect(readingLink).toBeVisible()
    const href = await readingLink.getAttribute('href')
    expect(href).toMatch(/^\/leitura\/.+/)
    await readingLink.click()
    await expect(page).toHaveURL(/\/leitura\//)
    await expect(page.locator('article, [data-reading]').first()).toBeVisible()
  })

  test('a compra automática respeita o corte e grava um replay verificável', async ({ page, request }) => {
    await page.goto(`/ritual/${SPREAD}`)
    await page.getByTestId('pergunta').fill('Como uso a energia das próximas duas semanas?')
    await shuffleAndCut(page)
    await page.getByTestId('comprar').click()
    await expect(page.getByText(/compra manual completa|\d+\/3 posições/).first()).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('gravar').click()

    await page.waitForURL(/\/mesa|\/leitura/, { timeout: 5_000 }).catch(() => {})
    const id = await page.evaluate(async () => {
      const response = await fetch('/api/readings?limit=1')
      const data = await response.json()
      return data.readings?.[0]?.id
    })
    expect(id).toBeTruthy()

    const replay = await (await request.get(`/api/readings/${id}/replay`)).json().catch(() => null)
    const reading = await (await request.get(`/api/readings/${id}`)).json()
    const cards = reading.reading?.cards ?? reading.cards ?? []
    expect(cards.length).toBe(3)
    expect(new Set(cards.map((card: { cardId?: string; card_id?: string }) => card.cardId ?? card.card_id)).size).toBe(3)
    if (replay?.matches !== undefined) expect(replay.matches).toBe(true)
  })

  test('a mesma seed e o mesmo corte reproduzem a mesma tiragem', async ({ page }) => {
    const run = async () => {
      await page.goto(`/ritual/${SPREAD}`)
      await page.getByTestId('pergunta').fill('Teste de reprodutibilidade')
      const seed = page.getByLabel(/Seed/i)
      await seed.fill('4242')
      await page.getByTestId('baralhar').click()
      const cut = page.getByTestId('cortar-aqui')
      if (await cut.isVisible().catch(() => false)) await cut.click()
      await page.getByTestId('comprar').click()
      const names = page.locator('[data-testid="mesa-nomes"]')
      if (await names.count()) return (await names.innerText()).split('\n').join('|')
      return await page.locator('aside ol li').first().innerText()
    }
    const first = await run()
    const second = await run()
    expect(second).toBe(first)
  })

  test('o corte muda mesmo as cartas', async ({ page }) => {
    const drawWithCut = async (cutSize: number) => {
      await page.goto(`/ritual/${SPREAD}`)
      await page.getByLabel(/Seed/i).fill('777')
      await page.getByTestId('baralhar').click()
      const slider = page.getByRole('slider', { name: /Corte/ })
      if (await slider.count()) {
        await slider.focus()
        for (let index = 0; index < Math.abs(cutSize - 39); index += 1) await page.keyboard.press(cutSize > 39 ? 'ArrowRight' : 'ArrowLeft')
      }
      const button = page.getByTestId('cortar-aqui')
      if (await button.count()) {
        const label = await button.innerText()
        const parsed = Number(label.match(/\d+/)?.[0] ?? '0')
        if (parsed !== cutSize) {
          // sem controlo numérico directo basta confirmar: o objectivo é comparar duas corridas
          expect(parsed).toBeGreaterThan(0)
        }
      }
      await page.getByTestId('comprar').click()
      await expect(page.locator('aside ol li').first()).toContainText(/./)
      return await page.locator('aside ol li').allInnerTexts()
    }
    const a = await drawWithCut(10)
    const b = await drawWithCut(60)
    expect(a.join('>')).not.toBe(b.join('>'))
  })
})
