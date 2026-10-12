/**
 * Benchmark + prova de determinismo do motor determinístico (embaralhar → cortar → comprar).
 * Objetivo pragmático: 1000 sessões de 3 cartas em < 50 ms, e duas corridas iguais para o
 * mesmo seed. Se este script rebentar, o replay de leituras e o corte escolhido pelo
 * utilizador deixaram de ser fiáveis.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const { hashSeed, deriveSeed, buildDeck, shuffleDeck, drawForSpread, replayDraw, cutAt } = await import('../src/engine/deck.ts')

const content = JSON.parse(readFileSync(fileURLToPath(new URL('../src/domain/data/content.json', import.meta.url)), 'utf8'))
const ids = content.cards.map((card) => card.id)
const spread = content.spreads.find((item) => item.positions.length >= 3) ?? content.spreads[0]
const RUNS = 1000
const ALGOS = ['tradicional', 'riffle', 'overhand', 'leque', 'circular', 'mistico']

const time = (label, run) => {
  const started = process.hrtime.bigint()
  const value = run()
  const ms = Number(process.hrtime.bigint() - started) / 1e6
  console.log(`  ${label.padEnd(44, '.')} ${ms.toFixed(1).padStart(8)} ms`)
  console.log(' '.repeat(48) + ((ms / RUNS) * 1000).toFixed(1).padStart(5) + ' µs/sessão')
  return value
}

// aquecimento: o JIT do V8 precisa de ~200 iterações antes de os números fazerem sentido
for (let i = 0; i < 300; i += 1) drawForSpread(ids, { spread, seed: i, algorithm: 'riffle', cuts: 1, allowReversed: true })

console.log('BENCH DO MOTOR'.toUpperCase())
console.log(`  ${ids.length} cartas · spread "${spread.id}" com ${spread.positions.length} posições · ${RUNS} corridas`)

for (const algorithm of ALGOS) {
  time(`drawForSpread(${algorithm})`, () => {
    for (let i = 0; i < RUNS; i += 1) {
      drawForSpread(ids, { spread, seed: hashSeed(`sessao-${i}`), algorithm, cuts: (i % 5) + 1, allowReversed: true })
    }
  })
}

time('drawForSpread(cutSize escolhido)', () => {
  for (let i = 0; i < RUNS; i += 1) {
    drawForSpread(ids, {
      spread,
      seed: hashSeed(`sessao-${i}`),
      algorithm: 'riffle',
      cuts: 1,
      cutSize: 12 + (i % 50),
      allowReversed: true,
    })
  }
})

time('drawForSpread(escolha manual)', () => {
  for (let i = 0; i < RUNS; i += 1) {
    drawForSpread(ids, {
      spread,
      seed: hashSeed(`sessao-${i}`),
      algorithm: 'tradicional',
      cuts: 0,
      allowReversed: true,
      manualPicks: spread.positions.map((position, p) => ({ positionId: position.id, deckIndex: (i * 7 + p * 13) % ids.length })),
    })
  }
})

time('replayDraw (leitura reproduzida)', () => {
  for (let i = 0; i < RUNS; i += 1) {
    replayDraw(ids, { spread, seed: hashSeed(`sessao-${i}`), algorithm: 'circular', cuts: 3, allowReversed: true, drawMode: 'alternado' })
  }
})

time('cutAt (corte único sobre estado)', () => {
  const base = shuffleDeck(buildDeck(ids), 'fisher-yates', deriveSeed(hashSeed('x'), 's'))
  for (let i = 0; i < RUNS; i += 1) cutAt(base, i)
})

// Determinismo: a mesma seed tem de dar exatamente o mesmo resultado, incluindo invertidas.
const sample = (salt) =>
  drawForSpread(ids, { spread, seed: hashSeed(salt), algorithm: 'riffle', cuts: 2, allowReversed: true, drawMode: 'topo' })
const a = JSON.stringify(sample('repetir').drawn)
const b = JSON.stringify(sample('repetir').drawn)
const c = JSON.stringify(sample('outra').drawn)
console.log('\n  determinismo: ' + (a === b ? 'OK' : 'FALHOU') + ` · seeds diferentes: ${a !== c ? 'OK' : 'FALHOU (colisão)'}`)
if (a !== b || a === c) process.exit(1)
