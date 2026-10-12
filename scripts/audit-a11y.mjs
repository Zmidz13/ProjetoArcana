/**
 * Auditoria estática de acessibilidade na UI: nomes acessíveis, `alt` em toda a imagem,
 * botões de ícone com rótulo, animações dentro de blocos reduzidos, e ausência de
 * `outline: none` sem substituto. É barato e apanha as regressões mais comuns.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../src', import.meta.url))
const files = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.(tsx|ts|css)$/.test(path)) files.push(path)
  }
}
walk(root)

const failures = []
const warnings = []
let checked = 0

const stripComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')

for (const path of files) {
  const source = stripComments(readFileSync(path, 'utf8'))
  const relative = path.replace(root + '/', '')
  checked += 1

  // <img> sem alt (o motor de arte usa sempre alt ou aria-hidden explícito)
  for (const match of source.matchAll(/<img\b[^>]*>/gs)) {
    if (!/alt=/.test(match[0])) failures.push(`${relative}: <img> sem alt`)
  }

  // botões só com ícone precisam de aria-label ou sr-only
  for (const match of source.matchAll(/<button\b[^>]*>([\s\S]{0,160}?)<\/button>/g)) {
    const body = match[1] ?? ''
    const open = match[0]
    const hasText = /[A-Za-zÀ-ÿ]{3,}/.test(body.replace(/<[^>]+>/g, ' '))
    if (!hasText && !/aria-label=|aria-labelledby=|sr-only/.test(open) && !/title=/.test(open)) {
      warnings.push(`${relative}: botão sem nome acessível visível — ${body.replace(/\s+/g, ' ').slice(0, 40)}`)
    }
  }

  // diálogos e listas acessíveis
  if (/role="dialog"/.test(source) && !/aria-modal="true"/.test(source)) failures.push(`${relative}: role=dialog sem aria-modal`)
  if (/onClick=\{[^}]*\n?\s*\}/.test(source) && /onKeyDown/.test(source) === false && /<div[^>]*onClick/.test(source)) {
    warnings.push(`${relative}: <div onClick> sem teclado — confirmar se há alternativa por botão`)
  }

  // movimento: toda a animação tem de viver num bloco respeitando reduced-motion
  if (path.endsWith('.css')) {
    if (/@keyframes/.test(source) && !/prefers-reduced-motion/.test(source)) failures.push(`${relative}: @keyframes sem bloco prefers-reduced-motion`)
    if (/outline:\s*none/.test(source) && !/:focus-visible/.test(source)) failures.push(`${relative}: outline removido sem :focus-visible`)
  }

  // html lang e títulos vivem no layout; são verificados no e2e também
  if (relative === 'app/layout.tsx') {
    if (!/lang="pt-PT"/.test(source)) failures.push(`${relative}: <html> sem lang="pt-PT"`)
    if (!/skip/i.test(readFileSync(join(root, 'components/app-shell.tsx'), 'utf8'))) failures.push('sem ligação de salto para o conteúdo')
  }
}

console.log(`a11y estático: ${checked} ficheiros verificados`)
if (warnings.length) {
  console.log(`avisos: ${warnings.length}`)
  for (const warning of warnings.slice(0, 10)) console.log(`   ! ${warning}`)
}
if (failures.length) {
  console.error(`FALHOU: ${failures.length}`)
  for (const failure of failures.slice(0, 20)) console.error(`   x ${failure}`)
  process.exit(1)
}
console.log('OK: verificações estáticas de acessibilidade passaram.')
