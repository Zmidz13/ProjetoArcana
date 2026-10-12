import type { SpreadCategory, SpreadShape, SpreadThemeWeight } from '../../../src/domain/types.ts'
import type { RawPosition } from './positions.ts'

export interface SpreadDraft {
  id: string
  name: string
  category: SpreadCategory
  shape: SpreadShape
  /** Parâmetros passados ao gerador de layout (`src/engine/layout.ts`). */
  layout?: {
    radius?: number
    cx?: number
    cy?: number
    cols?: number
    gap?: number
    rows?: number
    startAngle?: number
    sweep?: number
    tilt?: number
    curve?: number
  }
  /** Quando true, as posições já trazem coordenadas próprias e o gerador não as toca. */
  explicitLayout?: boolean
  /** Separa posições sobrepostas (radiais, cruzamentos). */
  separate?: boolean
  summary: string
  purpose: string
  whenToUse: string
  positions: RawPosition[]
  /** Índice inicial da ordem de leitura (por omissão, todos na ordem dada). */
  readingFrom?: number
  structure?: {
    kind: 'linear' | 'paired' | 'nested' | 'radial' | 'temporal' | 'elemental'
    blocks: { id: string; label: string; positions: number[]; note?: string }[]
  }
  tags: string[]
  estimatedMinutes: number
  cinematic?: 'baixo' | 'medio' | 'alto' | 'ritual'
  difficulty?: 'iniciante' | 'intermedio' | 'avancado'
  author?: 'arcana' | 'tradicional' | 'utilizador'
  themes?: SpreadThemeWeight[]
  requiresAccounts?: boolean
}
