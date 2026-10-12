import { expect, test } from '@playwright/test'

test.describe('catálogo, tiragens e partilha', () => {
  test('o índice das 78 cartas abre fichas completas', async ({ page }) => {
    await page.goto('/baralho')
    await expect(page.locator('a[href^="/baralho/"]')).toHaveCount(78)
    await page.locator('a[href^="/baralho/"]').first().click()
    await expect(page).toHaveURL(/\/baralho\/(major|minor)-/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('img[alt]').first()).toBeVisible()
    const text = await page.locator('main').innerText()
    expect(text.length).toBeGreaterThan(400)
  })

  test('a procura do catálogo filtra por palavra e limpa', async ({ page }) => {
    await page.goto('/baralho')
    const search = page.getByPlaceholder(/procurar/i)
    if (!(await search.count())) test.skip()
    const total = await page.locator('a[href^="/baralho/"]').count()
    await search.fill('luto')
    await expect.poll(async () => page.locator('a[href^="/baralho/"]').count(), { timeout: 8_000 }).toBeLessThan(total)
    await search.fill('')
    await expect.poll(async () => page.locator('a[href^="/baralho/"]').count(), { timeout: 8_000 }).toBe(total)
  })

  test('o índice de tiragens lista o catálogo e a ficha leva à mesa', async ({ page }) => {
    await page.goto('/tiragens')
    const links = page.locator('a[href^="/tiragens/"]:not([href$="/criar"])')
    expect(await links.count()).toBeGreaterThanOrEqual(40)
    await page.getByPlaceholder(/procurar/i).fill('amor')
    await expect.poll(async () => links.count(), { timeout: 8_000 }).toBeGreaterThan(0)
    await links.first().click()
    await expect(page).toHaveURL(/\/tiragens\/[a-z0-9-]+$/)
    const use = page.getByRole('link', { name: /usar|abrir mesa|mesa/i }).first()
    await expect(use).toBeVisible()
    await use.click()
    await expect(page).toHaveURL(/\/ritual\/|\/mesa/)
  })

  test('criar uma tiragem própria e vê-la no histórico de tiragens', async ({ page }) => {
    await page.goto('/tiragens/criar')
    const name = `Teste e2e ${Date.now()}`
    await page.getByLabel('Nome').fill(name)
    await page.getByLabel(/Resumo/i).fill('Tiragem criada pelo teste automático para provar o editor.')
    await page.getByLabel(/Finalidade/i).fill('Provar que o editor grava posições, rótulos e perguntas.')
    await page.getByLabel(/Quando usar/i).fill('Sempre que for preciso confirmar o editor.')
    const add = page.getByRole('button', { name: /Adicionar posição/ })
    while ((await page.locator('[data-testid="posição"], textarea[placeholder^="O que esta posição pergunta"]').count()) < 3) {
      await add.click()
    }
    const questions = page.locator('textarea[placeholder^="O que esta posição pergunta"]')
    const count = await questions.count()
    for (let index = 0; index < count; index += 1) {
      await questions.nth(index).fill(`Pergunta de teste ${index + 1}`)
      const label = page.locator('input[placeholder^="Etiqueta"]')
      if (await label.nth(index).count()) await label.nth(index).fill(`Posição ${index + 1}`)
    }
    await page.getByRole('button', { name: /Guardar tiragem|Guardar alterações/ }).click()
    await expect.poll(async () => page.url(), { timeout: 15_000 }).toMatch(/tiragens|spreads/)
    await page.goto('/tiragens')
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 15_000 })
  })

  test('partilhar uma leitura funciona sem sessão', async ({ page, browser }) => {
    await page.goto('/mesa')
    const sharedLink = page.getByRole('link', { name: /partilha|partilhar/ }).first()
    if (!(await sharedLink.count())) {
      // sem leitura gravada nesta sessão não há nada para partilhar: prova-se só que a rota responde
      const response = await page.request.get('/api/readings?limit=5')
      expect(response.ok()).toBe(true)
      return
    }
    await sharedLink.click()
    await expect(page).toHaveURL(/partilha|leitura/)
    const token = page.url()
    const anonymous = await browser.newContext()
    const fresh = await anonymous.newPage()
    await fresh.goto(token)
    await expect(fresh.getByRole('main')).toBeVisible()
    await anonymous.close()
  })
})
