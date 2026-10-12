import type { SpreadDraft } from './types.ts'
import { RAPID_SPREADS, THREE_SPREADS } from './rapid-and-three.ts'
import { LOVE_SPREADS, SELF_SPREADS, CAREER_SPREADS, ADVANCED_SPREADS } from './themes.ts'
import { EXTRA_SPREADS, RITUAL_SPREADS } from './extras.ts'

/** Catálogo completo de tiragens. A ordem define a navegação no catálogo. */
export const SPREAD_DRAFTS: SpreadDraft[] = [
  ...RAPID_SPREADS,
  ...THREE_SPREADS,
  ...LOVE_SPREADS,
  ...SELF_SPREADS,
  ...CAREER_SPREADS,
  ...ADVANCED_SPREADS,
  ...EXTRA_SPREADS,
  ...RITUAL_SPREADS,
]
