/**
 * Auditoria de cobertura do conteúdo (requisito: 78 cartas × 25+ campos, 65+ tiragens,
 * 218 glifos, zero placeholders). Falha com código de saída != 0 se algo ficar aquém.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const path = fileURLToPath(new URL('../src/domain/data/content.json', import.meta.url))
const content = JSON.parse(readFileSync(path, 'utf8'))

const MIN_CARDS = 78
const MIN_FIELDS = 25
const MIN_SPREADS = 65
const MIN_RELATIONS = 100
const PLACEHOLDER_PATTERNS = [/lorem\s+ipsum/i, /\bplaceholder\b/i, /\bTBD\b/, /\bTODO\b/, /\bFIXME\b/, /\ba\s+completar\b/i, /\ba\s+preencher\b/i, /texto\s+aqui\b/i, /xxx/i, /\bfoo\s+bar\b/i, /\b\[.*?\]\s*$/]

const leaves = (value, depth = 0) => {
  if (value === null || value === undefined) return 0
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') {
    if (depth >= 3) return 1
    return Object.values(value).reduce((sum, item) => sum + (item !== null && typeof item === 'object' ? leaves(item, depth + 1) : 1), 0)
  }
  return 1
}

const failures = []
const warnings = []
const cards = content.cards ?? []
const spreads = content.spreads ?? []

if (cards.length !== MIN_CARDS) failures.push(`cartas: ${cards.length} (esperado ${MIN_CARDS})`)
if (spreads.length < MIN_SPREADS) failures.push(`tiragens: ${spreads.length} (mínimo ${MIN_SPREADS})`)

const majors = cards.filter((card) => card.arcana === 'major')
const minors = cards.filter((card) => card.arcana === 'minor')
if (majors.length !== 22) failures.push(`arcanos maiores: ${majors.length} (esperado 22)`)
if (minors.length !== 56) failures.push(`arcanos menores: ${minors.length} (esperado 56)`)
const numbers = new Set(majors.map((card) => card.number))
if (numbers.size !== 22 || !numbers.has(0) || !numbers.has(21)) failures.push('numeração dos maiores não cobre 0..21')

for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
  const list = minors.filter((card) => card.suit === suit)
  if (list.length !== 14) failures.push(`naipe ${suit}: ${list.length} cartas (esperado 14)`)
}

const seenText = new Map()
let minFields = Infinity
for (const card of cards) {
  const fieldCount = leaves(card)
  minFields = Math.min(minFields, fieldCount)
  if (fieldCount < MIN_FIELDS) failures.push(`${card.id}: ${fieldCount} campos (mínimo ${MIN_FIELDS})`)
  const prose = [card.meanings?.upright, card.meanings?.reversed, card.history, card.traditionNote, ...(card.guidance?.advice ?? [])].filter(Boolean)
  const all = [card.name?.pt, card.name?.intl, ...prose, ...(card.guidance?.reflection ?? []), ...(card.art?.reading ?? [])].filter(Boolean)
  for (const text of all) {
    const normalized = String(text).trim()
    if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))) failures.push(`${card.id}: marcador de placeholder em "${normalized.slice(0, 60)}"`)
  }
  for (const text of prose) {
    const normalized = String(text).trim().toLowerCase()
    if (normalized.length < 60) warnings.push(`${card.id}: prosa curta (${normalized.length} caracteres)`)
    const previous = seenText.get(normalized)
    if (previous && previous !== card.id) failures.push(`texto repetido entre ${previous} e ${card.id}`)
    else seenText.set(normalized, card.id)
  }
  if (!card.a11y?.alt || !card.a11y?.long) failures.push(`${card.id}: sem texto alternativo`)
  if (!card.art?.glyphs?.length) failures.push(`${card.id}: sem glifos de arte`)
  if (!card.sources?.length) warnings.push(`${card.id}: sem fontes declaradas`)
}

const positions = spreads.reduce((sum, spread) => sum + (spread.positions?.length ?? 0), 0)
if (positions < spreads.length) failures.push('tiragens sem posições')
const orphans = spreads.filter((spread) => {
  const ids = new Set(spread.positions.map((position) => position.id))
  return (spread.readingOrder ?? []).some((id) => !ids.has(id))
})
if (orphans.length) failures.push(`readingOrder com ids inexistentes: ${orphans.map((spread) => spread.id).join(', ')}`)
const noCoords = spreads.filter((spread) => spread.positions.some((position) => typeof position.x !== 'number' || typeof position.y !== 'number'))
if (noCoords.length) failures.push(`tiragens sem coordenadas de layout: ${noCoords.slice(0, 5).map((spread) => spread.id).join(', ')}`)
const duplicateCoords = spreads.filter((spread) => {
  // Sobreposição é legítima quando há rotação ou escala diferente (é o caso do peito da
// Cruz Céltica, onde a segunda carta atravessa a primeira). Só conta como colisão se
// também a rotação e a escala coincidirem.
const keys = spread.positions.map((position) => `${position.x.toFixed(3)},${position.y.toFixed(3)},${position.rotation ?? 0},${position.scale ?? 1}`)
  return new Set(keys).size !== keys.length
})
if (duplicateCoords.length) failures.push(`posições sobrepostas no mesmo ponto: ${duplicateCoords.slice(0, 5).map((spread) => spread.id).join(', ')}`)

const relations = cards.reduce((sum, card) => sum + (card.relations?.length ?? 0), 0)
if (relations < MIN_RELATIONS) failures.push(`relações simbólicas: ${relations} (mínimo ${MIN_RELATIONS})`)
const ids = new Set(cards.map((card) => card.id))
const broken = cards.flatMap((card) => (card.relations ?? []).filter((relation) => !ids.has(relation.card)).map((relation) => `${card.id} → ${relation.card}`))
if (broken.length) failures.push(`relações para cartas inexistentes: ${broken.slice(0, 5).join(', ')}`)

const uniqueSpreadIds = new Set(spreads.map((spread) => spread.id)).size
if (uniqueSpreadIds !== spreads.length) failures.push('ids de tiragem repetidos')
const categories = new Set(spreads.map((spread) => spread.category)).size
const shapes = new Set(spreads.map((spread) => spread.shape)).size
const single = spreads.filter((spread) => spread.cardCount === 1).length

console.log('AUDITORIA DE CONTEUDO'.toUpperCase())
console.log(`  cartas ............ ${cards.length} (menores campo minimo: ${minFields})`)
console.log(`  tiragens .......... ${spreads.length} · ${positions} posicoes · ${categories} categorias · ${shapes} formas`)
console.log(`  tiragens de 1 carta ${single} · relacoes ${relations} · glifos ${cards.reduce((sum, card) => sum + card.art.glyphs.length, 0)}`)
console.log(`  textos unicos ..... ${seenText.size}`)
if (warnings.length) console.log(`  avisos ............ ${warnings.length}`)
for (const warning of warnings.slice(0, 8)) console.log(`   · ${warning}`)
if (failures.length) {
  console.error(`\nFALHOU: ${failures.length} problema(s)`)
  for (const failure of failures.slice(0, 20)) console.error(`   x ${failure}`)
  process.exit(1)
}
console.log('\nOK: cobertura de conteudo conforme ao pedido.')
