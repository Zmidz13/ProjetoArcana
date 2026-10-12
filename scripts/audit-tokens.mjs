/**
 * Verifica que os valores partilhados entre `src/styles/tokens.css` e `tailwind.config.mjs`
 * não divergem. O config é importado como módulo, por isso este teste apanha também
 * renomeações de chave (não só o texto do ficheiro).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (relative) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')

const css = read('../src/styles/tokens.css')
const config = (await import('../tailwind.config.mjs')).default

const cssVar = (name) => css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]?.trim().toLowerCase()

const colors = config?.theme?.extend?.colors ?? {}
const failures = []
const checked = []

for (const [key, value] of Object.entries(colors)) {
  const expected = cssVar(`--color-${key}${typeof value === 'object' ? '' : ''}`)
  const actual = typeof value === 'object' ? String(value.DEFAULT ?? '').toLowerCase() : String(value).toLowerCase()
  if (!expected) {
    failures.push(`tailwind define a cor "${key}" mas tokens.css não tem --color-${key}`)
    continue
  }
  checked.push(`${key}=${actual}`)
  if (actual !== expected) failures.push(`${key}: tailwind usa ${actual}, tokens.css pede ${expected}`)
  if (typeof value === 'object') {
    for (const [variant, variantValue] of Object.entries(value)) {
      if (variant === 'DEFAULT') continue
      const variantExpected = cssVar(`--color-${key}-${variant}`)
      if (!variantExpected) failures.push(`tokens.css não define --color-${key}-${variant} para a variante "${variant}"`)
      else if (String(variantValue).toLowerCase() !== variantExpected) failures.push(`${key}.${variant}: ${variantValue} ≠ ${variantExpected}`)
      else checked.push(`${key}.${variant}=${variantValue}`)
    }
  }
}

// tipografia: o config referencia variáveis CSS, não hex — basta existir a definição
for (const family of ['--font-display', '--font-body', '--font-ritual']) {
  if (!cssVar(family)) failures.push(`tokens.css sem ${family} (o config de fontFamily espera-a)`)
  const used = read('../tailwind.config.mjs').includes(`var(${family})`)
  if (!used) failures.push(`tailwind.config.mjs já não usa ${family}`)
}

const cssVars = [...css.matchAll(/(--[a-z-]+)\s*:/g)].map((match) => match[1])
const consumers = ['../src/app/globals.css', '../src/app/layout.tsx', '../src/components/app-shell.tsx', '../src/components/ritual/mesa.tsx', '../src/components/ui/primitives.tsx', '../src/components/ui/art.tsx']
  .map((relative) => read(relative, 'utf8'))
  .join('\n')
const unused = cssVars.filter((name) => !consumers.includes(name) && !name.startsWith('--space') && !name.startsWith('--font') && !name.startsWith('--color'))

console.log(`tokens: ${cssVars.length} variáveis · cores espelhadas no config: ${checked.join(', ')}`)
if (unused.length) console.log(`sem uso direto na UI lida aqui (podem vir de JS/inline styles): ${unused.join(', ')}`)
if (failures.length) {
  console.error(`FALHOU:\n${failures.map((failure) => `   x ${failure}`).join('\n')}`)
  process.exit(1)
}
console.log('OK: tokens e Tailwind em sincronia.')
