import { describe, expect, it } from 'vitest'

import { AmbienceEngine, getAmbience, resetAmbience } from '@/audio/engine.ts'

/**
 * Em Node não existe `AudioContext`, por isso o motor entra em modo "não suportado".
 * É precisamente isto que queremos provar: sem Web Audio a app não rebenta, não toca
 * nada, e o grafo lógico continua coerente para a UI mostrar estado honesto.
 */
describe('AmbienceEngine sem Web Audio', () => {
  it('declara-se não suportado e não toca', async () => {
    const engine = new AmbienceEngine()
    expect(engine.snapshot.supported).toBe(false)
    await engine.resume()
    expect(engine.snapshot.running).toBe(false)
    engine.startAmbience()
    engine.play('riffle')
    engine.play('sabbat-bell', { variation: 3 })
    engine.stopAmbience()
    expect(engine.snapshot.voices).toBe(0)
    engine.dispose()
  })

  it('mantém o estado coerente e emite cada alteração', () => {
    const seen: string[] = []
    const engine = new AmbienceEngine({ onState: (state) => seen.push(`${state.environment}:${state.enabled}:${state.ambience}`) })
    engine.setEnvironment('lareira')
    engine.setAmbienceVolume(0.25)
    engine.setEnabled(false)
    expect(engine.snapshot.environment).toBe('lareira')
    expect(engine.snapshot.ambience).toBe(0.25)
    expect(engine.snapshot.enabled).toBe(false)
    // desligar não desmonta: voltar a ligar recupera o mesmo ambiente e o mesmo volume
    engine.setEnabled(true)
    expect(engine.snapshot.environment).toBe('lareira')
    expect(engine.snapshot.ambience).toBe(0.25)
    expect(seen.length).toBeGreaterThanOrEqual(4)
    engine.dispose()
  })

  it('limita volumes e aceita movimento reduzido', () => {
    const engine = new AmbienceEngine()
    engine.setAmbienceVolume(4)
    engine.setEffectsVolume(-2)
    expect(engine.snapshot.ambience).toBeLessThanOrEqual(1)
    expect(engine.snapshot.effects).toBeGreaterThanOrEqual(0)
    engine.setReducedMotion(true)
    expect(engine.snapshot.reducedMotion).toBe(true)
    engine.dispose()
  })

  it('o singleton é partilhado e pode ser reposto', () => {
    const first = getAmbience()
    expect(getAmbience()).toBe(first)
    resetAmbience()
    expect(getAmbience()).not.toBe(first)
  })
})
