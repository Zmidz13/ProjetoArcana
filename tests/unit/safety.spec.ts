import { describe, expect, it } from 'vitest'

import { STANDING_NOTICE, isBlocking, modelDirectives, safetyFor } from '@/domain/safety.ts'

const CRISIS = [
  'já não quero viver, penso em suicídio',
  'quero morrer e não vejo saída',
  'tenho pensado em matar-me',
  'volto a cortar-me quando estou sozinha',
]

describe('deteção de crise', () => {
  it.each(CRISIS)('bloqueia a leitura para %s', (text) => {
    const flags = safetyFor(text)
    expect(flags.length).toBeGreaterThan(0)
    expect(isBlocking(flags)).toBe(true)
    const flag = flags[0]
    expect(flag?.category).toBe('mental-crisis')
    expect(flag?.severity).toBe('critico')
    expect((flag?.userMessage ?? '').length).toBeGreaterThan(40)
    expect(flag?.action ?? '').toMatch(/\d{3}|112|24/)
    expect((flag?.resources ?? []).length).toBeGreaterThan(0)
  })

  it('não transforma melancolia em emergência', () => {
    for (const text of ['estou triste com o fim do ano', 'andou tudo em baixo este mês', 'perdi o emprego e estou ansioso']) {
      expect(isBlocking(safetyFor(text))).toBe(false)
    }
  })

  it('o texto vazio não produz bandeiras', () => {
    expect(safetyFor('')).toEqual([])
    expect(safetyFor('   ')).toEqual([])
  })

  it('ordena por gravidade, crítico primeiro', () => {
    const flags = safetyFor('penso em suicídio e também quero saber se processo o senhorio')
    if (flags.length > 1) expect(flags[0]!.severity).toBe('critico')
    const rank = { critico: 0, alto: 1, medio: 2 } as const
    expect(flags.map((flag) => rank[flag.severity])).toEqual([...flags.map((flag) => rank[flag.severity])].sort((a, b) => a - b))
  })

  it('cada bandeira traz instrução para o modelo e as instruções não se repetem', () => {
    const flags = safetyFor('quero morrer')
    const directives = modelDirectives(flags)
    expect(directives.length).toBe(flags.length)
    expect(new Set(directives).size).toBe(directives.length)
    for (const directive of directives) expect(directive.length).toBeGreaterThan(20)
  })

  it('há um rodapé fixo para as páginas de leitura', () => {
    expect(STANDING_NOTICE).toMatch(/Não fornece diagnóstico/i)
    expect(STANDING_NOTICE.length).toBeGreaterThan(80)
  })
})
