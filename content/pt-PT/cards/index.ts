import type { CardSource } from '../../../src/domain/types.ts'
import { MAJORS_A } from './majors-a.ts'
import { MAJORS_B } from './majors-b.ts'
import { WANDS } from './wands.ts'
import { CUPS } from './cups.ts'
import { SWORDS } from './swords.ts'
import { PENTACLES } from './pentacles.ts'

/** Baralho base ARCANA (Arcana arcana-pt): as 78 cartas tradicionais. */
export const BASE_CARDS: CardSource[] = [...MAJORS_A, ...MAJORS_B, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES]
