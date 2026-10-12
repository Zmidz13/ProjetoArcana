import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PREFERENCES,
  ENVIRONMENTS,
  ENVIRONMENT_LIST,
  ENVIRONMENTS_BY_KEY,
  PreferencesSchema,
  SFX_BY_KEY,
  SFX_KEYS,
  SFX_LIST,
  mergePreferences,
  requireEnvironment,
  REGISTER_DESCRIPTIONS,
  VOICE_DESCRIPTIONS,
} from '@/domain/experience.ts'
import { DEPTHS, REGISTERS, VOICES } from '@/domain/interpretation.ts'

describe('ambientes e efeitos', () => {
  it('a lista e o índice têm exatamente as mesmas chaves', () => {
    expect(Object.keys(ENVIRONMENTS_BY_KEY).sort()).toEqual([...ENVIRONMENTS].sort())
    expect(ENVIRONMENT_LIST.map((environment) => environment.key).sort()).toEqual([...ENVIRONMENTS].sort())
  })

  it('cada ambiente declara o que os motores de som, imagem e luz precisam', () => {
    for (const environment of ENVIRONMENT_LIST) {
      expect(environment.name.length).toBeGreaterThan(3)
      expect(environment.subtitle.length).toBeGreaterThan(8)
      expect(environment.description.length).toBeGreaterThan(20)
      expect(Object.values(environment.palette).every((hex) => /^#[0-9a-f]{6}$/i.test(hex))).toBe(true)
      expect(environment.ambience.root).toBeGreaterThan(40)
      expect(environment.ambience.root).toBeLessThan(400)
      expect(environment.ambience.scale.length).toBeGreaterThanOrEqual(4)
      expect(environment.ambience.density).toBeGreaterThanOrEqual(0)
      expect(environment.ambience.density).toBeLessThanOrEqual(1)
      expect(environment.vfx.intensity).toBeGreaterThanOrEqual(0)
      expect(environment.vfx.intensity).toBeLessThanOrEqual(1)
      expect(environment.reverbSeconds).toBeGreaterThanOrEqual(0.4)
      expect(environment.reverbSeconds).toBeLessThanOrEqual(8)
    }
  })

  it('uma chave inventada cai no templo em vez de rebentar com a página', () => {
    expect(requireEnvironment('nao-existe').key).toBe('templo')
    expect(requireEnvironment(undefined).key).toBe('templo')
    expect(requireEnvironment('montanha').key).toBe('montanha')
  })

  it('há um efeito por cada acção e nenhum duplicado', () => {
    expect(new Set(SFX_KEYS).size).toBe(SFX_KEYS.length)
    expect(SFX_KEYS.length).toBe(SFX_LIST.length)
    for (const key of SFX_KEYS) {
      const sfx = SFX_BY_KEY[key]
      expect(sfx.durationMs).toBeGreaterThan(0)
      expect(sfx.recipe.length).toBeGreaterThan(8)
    }
  })
})

describe('preferências', () => {
  it('o objeto vazio dá o padrão', () => {
    expect(mergePreferences({})).toEqual(DEFAULT_PREFERENCES)
    expect(mergePreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(mergePreferences(undefined)).toEqual(DEFAULT_PREFERENCES)
  })

  it('guarda o que é válido e completa o resto', () => {
    const merged = mergePreferences({ depth: 'muito-profunda', audio: { ambience: 0.2 } })
    expect(merged.depth).toBe('muito-profunda')
    expect(merged.audio.ambience).toBe(0.2)
    expect(merged.audio.effects).toBe(DEFAULT_PREFERENCES.audio.effects)
    expect(merged.environment).toBe('templo')
  })

  it('valores fora dos limites não passam', () => {
    expect(mergePreferences({ audio: { ambience: 9 } }).audio.ambience).toBe(0.5)
    expect(mergePreferences({ motion: { speed: 12 } }).motion.speed).toBe(1)
    expect(mergePreferences({ ai: { dailyBudgetUsd: -3 } }).ai.dailyBudgetUsd).toBe(1)
    expect(mergePreferences({ cuts: 99 }).cuts).toBe(DEFAULT_PREFERENCES.cuts)
    expect(mergePreferences({ environment: 'discoteca' }).environment).toBe('templo')
  })

  it('preferências antigas com lixo por cima continuam a carregar', () => {
    const merged = mergePreferences({ voice: 42, unknownKey: true, pinnedSpreadIds: Array.from({ length: 40 }, (_, i) => `s${i}`) })
    expect(merged.voice).toBe(DEFAULT_PREFERENCES.voice)
    expect(merged.pinnedSpreadIds.length).toBeLessThanOrEqual(12)
    expect((merged as unknown as Record<string, unknown>).unknownKey).toBeUndefined()
  })

  it('o padrão é válido segundo o próprio schema', () => {
    expect(PreferencesSchema.safeParse(DEFAULT_PREFERENCES).success).toBe(true)
  })

  it('todas as vozes e registos escolhíveis têm descrição legível', () => {
    expect(VOICES.length).toBeGreaterThanOrEqual(5)
    expect(REGISTERS.length).toBeGreaterThanOrEqual(5)
    for (const voice of VOICES) expect((VOICE_DESCRIPTIONS[voice] ?? '').length).toBeGreaterThan(20)
    for (const register of REGISTERS) expect((REGISTER_DESCRIPTIONS[register] ?? '').length).toBeGreaterThan(20)
    expect(DEPTHS).toContain('muito-profunda')
    expect(PreferencesSchema.safeParse({ depth: 'ultra' }).success).toBe(false)
    expect(PreferencesSchema.safeParse({ depth: 'profunda' }).success).toBe(true)
  })
})
