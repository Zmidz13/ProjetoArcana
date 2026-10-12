/**
 * Ciclos: lua, dias e repetições anuais.
 *
 * Decisão editorial e técnica em simultâneo: nada aqui é "energia astrológica". São
 * cálculos astronómicos reais (fase da lua por data) combinados com a leitura simbólica
 * tradicional do ciclo, sempre apresentada como tradição — nunca como previsão.
 *
 * A fase lunar é calculada por sinódica média (algoritmo de Conway estendido), com erro
 * < 12 h para o século XXI — o suficiente para "lua nova/cheia" num diário simbólico, e
 * declarado como aproximação no UI.
 */

export const SYNODIC_MONTH = 29.530588853

export type MoonPhaseKey = 'lua-nova' | 'crescente' | 'quarto-crecente' | 'gibosa-crecente' | 'cheia' | 'gibosa-minguante' | 'quarto-minguante' | 'minguante'

export interface MoonInfo {
  date: string
  /** 0 = lua nova, 0.5 = cheia. */
  age: number
  phase: MoonPhaseKey
  illumination: number
  /** Nome tradicional da etapa, em PT-PT. */
  label: string
  /** Leitura simbólica tradicional (não é previsão). */
  tradition: string
  /** Recomendação ritual tradicional. */
  practice: string
  /** true quando a data é exatamente o dia do evento astronómico (lua nova/cheia/quartos). */
  eventDay?: boolean
}

const PHASE_TABLE: { max: number; phase: MoonPhaseKey; label: string; tradition: string; practice: string }[] = [
  {
    max: 0.0334,
    phase: 'lua-nova',
    label: 'Lua nova',
    tradition: 'Começo do ciclo; na tradição, momento de semente e não de colheita.',
    practice: 'Tiragens de intenção, uma carta, perguntas sobre o que ainda não tem forma.',
  },
  {
    max: 0.216,
    phase: 'crescente',
    label: 'Crescente',
    tradition: 'A luz aumenta: associada a construir, ensaiar, arriscar pouco e muitas vezes.',
    practice: 'Tiragens de projecto, dois caminhos, planeamento de acção.',
  },
  {
    max: 0.2834,
    phase: 'quarto-crecente',
    label: 'Quarto crescente',
    tradition: 'Primeiro obstáculo visível; a tradição fala de decisão, não de dúvida.',
    practice: 'Situação-obstáculo-conselho, leitura de bloqueios.',
  },
  {
    max: 0.466,
    phase: 'gibosa-crecente',
    label: 'Gibosa crescente',
    tradition: 'Refinamento: o que foi iniciado precisa de ajuste fino antes de amadurecer.',
    practice: 'Leituras de detalhe, revisão de estratégia, tiragens curtas repetidas.',
  },
  {
    max: 0.533,
    phase: 'cheia',
    label: 'Lua cheia',
    tradition: 'Pleno da luz; na tradição, é quando o assunto se vê inteiro — para bem e para mal.',
    practice: 'Tiragens longas (cruz celta, árvore da vida), trabalhos de integração.',
  },
  {
    max: 0.716,
    phase: 'gibosa-minguante',
    label: 'Gibosa minguante',
    tradition: 'Começa a retirada: partilhar o que se aprendeu, fechar pontas.',
    practice: 'Leituras de síntese, revisão de ciclo, perdão e encerramento.',
  },
  {
    max: 0.783,
    phase: 'quarto-minguante',
    label: 'Quarto minguante',
    tradition: 'Libertação activa; a tradição associa a soltar hábitos, não pessoas.',
    practice: 'Largar-e-aceitar-crescer, leitura de transições e perdas.',
  },
  {
    max: 1.001,
    phase: 'minguante',
    label: 'Minguante',
    tradition: 'Escuro próximo: repouso, silêncio, preparação. Não é fase de lançamentos.',
    practice: 'Uma carta por noite, diário, leitura do próprio ciclo.',
  },
]

/* ─────────────────────── astronomia: luas novas verdadeiras (Meeus, cap. 49) ─────────────────────── */

const rad = (deg: number) => (deg * Math.PI) / 180
const sind = (deg: number) => Math.sin(rad(deg))

/** Dia Juliano a partir de uma data UTC (fraccionário). */
export function julianDay(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24
  const yy = m <= 2 ? y - 1 : y
  const mm = m <= 2 ? m + 12 : m
  const A = Math.floor(yy / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + B - 1524.5
}

export function dateFromJulianDay(jd: number): Date {
  // Época J2000 ↔ epoch Unix: conversão exata, sem algoritmo de calendário próprio.
  return new Date(Math.round((jd - 2440587.5) * 86400000))
}

/**
 * JDE da enésima conjunção média (k=0 em 2000-01-06 18:14 UTC) com as correcções
 * principais de Meeus. Precisão de minutos — mais do que suficiente para classificar o
 * dia em que a lua é nova ou cheia.
 */
export function meanPhaseJde(k: number, phase: 'new' | 'full'): number {
  const which = phase === 'new' ? 0 : 0.5
  const kPhase = k + which
  const t = k / 1236.85
  const jde =
    2451550.09766 +
    29.530588861 * kPhase +
    0.00015437 * t * t -
    0.00000015 * t * t * t +
    0.00000000073 * t * t * t * t
  const e = 1 - 0.002516 * t - 0.0000074 * t * t
  const m = 357.52911 + 359.22425 * kPhase - 0.0000151 * t * t + 0.000000073 * t * t * t
  // M' é a anomalia média da Lua contada em lunações (29.105°/lunação) — constante de Meeus.
  const mp = 329.64467 + 29.10535609 * kPhase - 0.00002278 * t * t + 0.000000018 * t * t * t
  const f = 93.27191 + 29.22708356 * kPhase - 0.000001486 * t * t - 0.00000000074 * t * t * t
  const omega = 125.04452 - 0.05295388 * kPhase + 0.0000011 * t * t
  const s2mp = sind(2 * mp)
  const a14 =
    phase === 'new'
      ? -0.4072 * sind(mp) +
        0.17241 * e * sind(m) +
        0.01608 * s2mp +
        0.01039 * sind(2 * f) +
        0.00739 * e * sind(mp - m) -
        0.00514 * e * sind(mp + m) +
        0.00208 * e * e * sind(2 * m) -
        0.00111 * sind(mp - 2 * f) -
        0.00057 * sind(mp + 2 * f) +
        0.00056 * e * sind(2 * mp + m) -
        0.00042 * sind(3 * mp) +
        0.00042 * e * sind(m + 2 * f) +
        0.00038 * e * sind(m - 2 * f) -
        0.00024 * e * sind(2 * mp - m) -
        0.00017 * sind(omega)
      : -0.40614 * sind(mp) +
        0.17302 * e * sind(m) +
        0.01614 * s2mp +
        0.01043 * sind(2 * f) +
        0.00734 * e * sind(mp - m) -
        0.00515 * e * sind(mp + m) +
        0.00209 * e * e * sind(2 * m) -
        0.00111 * sind(mp - 2 * f) -
        0.00057 * sind(mp + 2 * f) +
        0.00056 * e * sind(2 * mp + m) -
        0.00042 * sind(3 * mp) +
        0.00042 * e * sind(m + 2 * f) +
        0.00038 * e * sind(m - 2 * f) -
        0.00024 * e * sind(2 * mp - m) -
        0.00017 * sind(omega)
  return jde + a14
}

/** Encontra as duas luas novas que envolvem o instante (prev ≤ jd < next). */
export function surroundingNewMoons(jd: number): { prev: number; next: number } {
  const rough = (jd - 2451550.09766) / 29.530588861
  let k = Math.floor(rough)
  let prev = meanPhaseJde(k, 'new')
  let guard = 0
  while (prev > jd && guard++ < 6) {
    k -= 1
    prev = meanPhaseJde(k, 'new')
  }
  let next = meanPhaseJde(k + 1, 'new')
  guard = 0
  while (next <= jd && guard++ < 6) {
    k += 1
    prev = meanPhaseJde(k, 'new')
    next = meanPhaseJde(k + 1, 'new')
  }
  return { prev, next }
}

/** Oposição (lua cheia) verdadeira mais próxima do instante. */
export function nearestFullMoonJde(jd: number): number {
  const rough = (jd - 2451550.09766) / 29.530588861 - 0.5
  const k = Math.round(rough)
  let best = meanPhaseJde(k, 'full')
  for (const candidate of [meanPhaseJde(k - 1, 'full'), meanPhaseJde(k + 1, 'full')]) {
    if (Math.abs(candidate - jd) < Math.abs(best - jd)) best = candidate
  }
  return best
}

/** Fração verdadeira do ciclo sinódico (0 = conjunção, 0.5 = oposição). */
export function lunarAge(jd: number): number {
  const { prev, next } = surroundingNewMoons(jd)
  const span = next - prev
  if (!Number.isFinite(span) || span <= 0) return 0
  return Math.min(0.999999, Math.max(0, (jd - prev) / span))
}

function toUtcDateKey(value: Date | string): { key: string; ms: number } {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00Z`) : value
  const key = date.toISOString().slice(0, 10)
  return { key, ms: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12) }
}

export function moonFor(date: Date | string = new Date()): MoonInfo {
  const { key, ms } = toUtcDateKey(date)
  const jdNoon = ms / 86400000 + 2440587.5
  const dayStart = jdNoon - 0.5
  const dayEnd = jdNoon + 0.5
  const age = lunarAge(jdNoon)
  const illumination = (1 - Math.cos(2 * Math.PI * age)) / 2
  const { prev, next } = surroundingNewMoons(jdNoon)
  const within = (jd: number) => jd >= dayStart && jd < dayEnd
  const fullApprox = nearestFullMoonJde(jdNoon)
  // Etiqueta por evento: os almanaques atribuem o dia à fase que ocorre dentro dele.
  let eventPhase: MoonPhaseKey | null = null
  if (within(prev) || within(next)) eventPhase = 'lua-nova'
  else if (within(fullApprox)) eventPhase = 'cheia'
  else if (within(prev + (next - prev) * 0.25)) eventPhase = 'quarto-crecente'
  else if (within(prev + (next - prev) * 0.75)) eventPhase = 'quarto-minguante'
  if (eventPhase) {
    const entry = PHASE_TABLE.find((p) => p.phase === eventPhase) ?? PHASE_TABLE[0]!
    return { date: key, age, phase: eventPhase, illumination, label: entry.label, tradition: entry.tradition, practice: entry.practice, eventDay: true }
  }
  const entry = PHASE_TABLE.find((p) => age <= p.max) ?? PHASE_TABLE[PHASE_TABLE.length - 1]!
  return { date: key, age, phase: entry.phase, illumination, label: entry.label, tradition: entry.tradition, practice: entry.practice }
}

export function moonSeries(days: number, from: Date = new Date()): MoonInfo[] {
  return Array.from({ length: Math.max(0, Math.min(400, days)) }, (_, i) => {
    const d = new Date(from.getTime() + i * 86400000)
    return moonFor(d)
  })
}

/** Sabbats Wheel of the Year (tradição moderna, datas fixas aproximadas). */
export interface Sabbat {
  id: string
  name: string
  /** Data no ano (mês 1-12, dia). */
  month: number
  day: number
  theme: string
  spreadSuggestion: string
}

export const SABBATS: Sabbat[] = [
  { id: 'samhain', name: 'Samhain', month: 10, day: 31, theme: 'limiar entre anos, ancestrais, o que terminou', spreadSuggestion: 'loss-and-recovery' },
  { id: 'yule', name: 'Yule', month: 12, day: 21, theme: 'regresso da luz, espera fértil, silêncio', spreadSuggestion: 'four-seasons' },
  { id: 'imbolc', name: 'Imbolc', month: 2, day: 1, theme: 'primeiras sementes, purificação, começos pequenos', spreadSuggestion: 'new-love' },
  { id: 'ostara', name: 'Ostara', month: 3, day: 20, theme: 'equilíbrio, paridade, decisão simétrica', spreadSuggestion: 'me-other-relationship' },
  { id: 'beltane', name: 'Beltane', month: 5, day: 1, theme: 'união, criatividade, risco alegre', spreadSuggestion: 'loving-relationship' },
  { id: 'litha', name: 'Litha', month: 6, day: 21, theme: 'plenitude da luz, visibilidade, exposição', spreadSuggestion: 'current-energy' },
  { id: 'lugnasadh', name: 'Lughnasadh', month: 8, day: 1, theme: 'primeira colheita, esforço recompensado', spreadSuggestion: 'goals-strategy' },
  { id: 'mabon', name: 'Mabon', month: 9, day: 22, theme: 'segunda colheita, balança, agradecimento e saldo', spreadSuggestion: 'problem-cause-solution' },
]

export function upcomingSabbat(date: Date | string = new Date()): { sabbat: Sabbat; daysUntil: number; occurredThisYear: boolean } {
  const at0 = toUtcDateKey(date).ms
  const day = new Date(at0)
  const year = day.getUTCFullYear()
  const upcoming = SABBATS.map((sabbat) => {
    const at = Date.UTC(year, sabbat.month - 1, sabbat.day)
    const diff = Math.ceil((at - at0) / 86400000)
    return { sabbat, at, diff }
  })
    .filter((entry) => entry.diff >= 0)
    .sort((a, b) => a.diff - b.diff)
  const next = upcoming[0] ?? { sabbat: SABBATS[0]!, at: Date.UTC(year + 1, SABBATS[0]!.month - 1, SABBATS[0]!.day), diff: 365 }
  return { sabbat: next.sabbat, daysUntil: next.diff, occurredThisYear: true }
}

/**
 * Seed da carta do dia. É FNV-1a de `AAAA-MM-DD` (mais um sal opcional, para que cada
 * utilizador possa ter a sua própria sequência diária sem perder a reprodutibilidade).
 */
export function dailySeed(date: Date | string = new Date(), salt = ''): number {
  const { key } = toUtcDateKey(date)
  const input = salt ? `${key}:${salt}` : key
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Sabbat que se celebra no dia (roda da Roda do Ano tem oito datas fixas no calendário
 * civil; a tradição celta marca-as por data aproximada, não por efeméride astronómica).
 */
export function sabbatFor(date: Date | string = new Date()): Sabbat | null {
  const { key } = toUtcDateKey(date)
  const month = Number(key.slice(5, 7))
  const day = Number(key.slice(8, 10))
  return SABBATS.find((sabbat) => sabbat.month === month && sabbat.day === day) ?? null
}

/** Datas dos sabbats de um ano (para o calendário temático). */
export function sabbatsOfYear(year: number): { sabbat: Sabbat; date: string }[] {
  return SABBATS.map((sabbat) => ({
    sabbat,
    date: `${year}-${String(sabbat.month).padStart(2, '0')}-${String(sabbat.day).padStart(2, '0')}`,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

/** Datas em que a mesma lua cheia anterior caiu (para o diário comparar ciclos). */
export function previousFullMoons(count = 6, from: Date = new Date()): string[] {
  const out: string[] = []
  let cursor = new Date(from.getTime())
  let guard = 0
  let lastPhase: MoonPhaseKey | null = null
  while (out.length < count && guard < 4000) {
    const info = moonFor(cursor)
    if (info.phase === 'cheia' && lastPhase !== 'cheia') out.push(info.date)
    lastPhase = info.phase
    cursor = new Date(cursor.getTime() - 86400000)
    guard++
  }
  return out
}

export function daysBetween(a: string | Date, b: string | Date): number {
  return Math.round((toUtcDateKey(b).ms - toUtcDateKey(a).ms) / 86400000)
}
