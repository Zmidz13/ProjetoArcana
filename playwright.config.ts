import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright: fluxo real de utilizador + acessibilidade + catálogo.
 *
 * A configuração arranca o servidor ela própria (dev, com `reuseExistingServer`) para que
 * `npm run test:e2e` seja uma coisa só. O arranque exige conteúdo e arte gerados
 * (`npm run setup`), porque a UI lê `src/domain/data/content.json` e os SVG de `public/art`.
 */
const PORT = Number(process.env.ARCANA_TEST_PORT ?? 3100)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI ? [['github'], ['list']] : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'pt-PT',
    timezoneId: 'Atlantic/Azores',
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 } } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ARCANA_DB_PATH: 'var/arcana-e2e.db', NODE_ENV: 'development', ARCANA_SESSION_SECRET: 'e2e-secret-com-pelo-menos-32-caracteres' },
  },
})
