/**
 * Lighthouse (a11y + best-practices + pwa) em três vistas: `/`, `/mesa`, `/tiragens`.
 *
 * Requer Chrome/Chromium disponível. Se não existir nem `CHROME_PATH` nem um binário do
 * sistema, o script sai com código 0 e um aviso explícito — em CI sem navegador isto é
 * "ignorado com nota", não "passou".
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const BASE = process.env.LIGHTHOUSE_BASE_URL ?? 'http://127.0.0.1:3000'
const ROUTES = ['/', '/mesa', '/tiragens']
const MIN_A11Y = Number(process.env.LIGHTHOUSE_MIN_A11Y ?? 0.9)
const OUT = fileURLToPath(new URL('../.cache/lighthouse', import.meta.url))
mkdirSync(OUT, { recursive: true })

const findChrome = () => {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    process.env.HOME + '/.cache/ms-playwright/chromium-1169/chrome-linux/chrome',
  ]
  for (const path of candidates) if (path && existsSync(path)) return path
  const which = spawnSync('which', ['google-chrome-stable'], { encoding: 'utf8' })
  return which.status === 0 ? which.stdout.trim() : null
}

const chrome = findChrome()
if (!chrome) {
  console.warn('Lighthouse ignorado: nenhum Chrome/Chromium encontrado.')
  console.warn('Para correr: `npx playwright install chromium` e depois CHROME_PATH=$(find ~/.cache/ms-playwright -name chrome -type f | head -1) npm run a11y:lighthouse')
  process.exit(0)
}

const { default: lighthouse } = await import('lighthouse')
const { enableAuditCategory } = await import('lighthouse/core/config/desktop-config.js').catch(() => ({}))

let worst = 1
for (const route of ROUTES) {
  const url = BASE + route
  const result = await lighthouse(url, {
    output: 'json',
    onlyCategories: ['accessibility', 'best-practices', 'performance'],
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
    port: undefined,
    ...(enableAuditCategory ? {} : {}),
  }, undefined, { chromePath: chrome })

  const scores = result?.lhr?.categories ?? {}
  const report = result?.lhr
  const a11y = scores.accessibility?.score ?? 0
  worst = Math.min(worst, a11y)
  console.log(
    `${url}  a11y ${(a11y * 100).toFixed(0)}%  best-practices ${((scores['best-practices']?.score ?? 0) * 100).toFixed(0)}%  perf ${((scores.performance?.score ?? 0) * 100).toFixed(0)}%`,
  )
  const failing = Object.values(report.audits ?? {}).filter((audit) => audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode === 'binary')
  for (const audit of failing.slice(0, 6)) console.log(`   ! ${audit.id}: ${audit.title}`)
  mkdirSync(OUT, { recursive: true })
  const { writeFileSync } = await import('node:fs')
  writeFileSync(`${OUT}${route.replace(/\//g, '_') || '/index'}.json`, JSON.stringify(report, null, 2))
}

if (worst < MIN_A11Y) {
  console.error(`FALHOU: pior score de acessibilidade ${(worst * 100).toFixed(0)}% < mínimo ${(MIN_A11Y * 100).toFixed(0)}%`)
  console.error(`relatórios em ${OUT}`)
  process.exit(1)
}
console.log(`OK: todas as vistas acima de ${(MIN_A11Y * 100).toFixed(0)}% em acessibilidade.`)
