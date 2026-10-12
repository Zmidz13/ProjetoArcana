import type { CardDef, DrawnCard, SpreadDef } from '../domain/types.ts'
import type { CombinationNote, Depth, Interpretation, Pattern, PositionReading, Register, VoiceKey } from '../domain/interpretation.ts'
import type { Analysis } from './symbolic.ts'
import { classifyPosition, elPhrase } from './symbolic.ts'
import { safetyFor, type SafetyFlag } from '../domain/safety.ts'

/**
 * Camada narrativa local (determinística).
 *
 * Produz a estrutura completa A–G a partir da análise simbólica, sem rede e sem modelos.
 * Não é um esboço: é a interpretação que o utilizador recebe quando o LLM não está
 * configurado, quando a rede falha, ou quando escolhe "leitura local". O LLM, quando
 * existe, recebe esta mesma estrutura e limita-se a reescrever secção a secção.
 *
 * Duas coisas são deliberadas aqui:
 *  - A escolha de templates é derivada por hash do contexto (mesma entrada → mesmo texto,
 *    mas sem "frase única repetida" entre tiragens diferentes).
 *  - Cada frase que cita uma carta cita o texto dessa carta; nada é gerado por enchimento.
 */

export interface NarrativeInput {
  analysis: Analysis
  drawn: DrawnCard[]
  spread: SpreadDef
  question: string
  depth: Depth
  register: Register
  voice: VoiceKey
  getCard: (id: string) => CardDef | undefined
  /** Histórico recente do utilizador, para continuidade (opcional). */
  history?: { date: string; question: string; summary: string }[]
  querent?: { name?: string; context?: string }
  /** Fuso/tempo declarado pelo utilizador — usado só como moldura narrativa. */
  moment?: 'manha' | 'tarde' | 'noite'
}

const DEPTH_PLAN: Record<Depth, { opening: number; perCard: number; synthesis: number; practical: number; reflection: number }> = {
  breve: { opening: 2, perCard: 2, synthesis: 2, practical: 2, reflection: 2 },
  normal: { opening: 3, perCard: 3, synthesis: 3, practical: 3, reflection: 3 },
  profunda: { opening: 4, perCard: 4, synthesis: 5, practical: 5, reflection: 4 },
  'muito-profunda': { opening: 5, perCard: 5, synthesis: 7, practical: 7, reflection: 6 },
}

const VOICE_PROFILE: Record<VoiceKey, { address: string; hedges: string[]; openers: string[]; closers: string[]; connective: string[] }> = {
  mistica: {
    address: 'tu',
    hedges: ['as cartas insinuam', 'o símbolo inclina-se para', 'nisto que se mostra'],
    openers: [
      'Abre-se o baralho como se abre uma janela: {spread} não responde à pergunta, mostra-te a sala onde a pergunta vive.',
      'Há um clima nesta tiragem antes de haver uma resposta. {cards} cartas em {spread}, e o primeiro dado é esse: {climate}.',
      'Antes de interpretar, olha. {cards} cartas, dispostas em {spread}, e um fio que já está aceso: {climate}.',
    ],
    closers: [
      'Que o que ficou dito aqui trabalhe enquanto dormes: as cartas não pedem pressa, pedem verdade.',
      'Fecha-se o baralho. O que ele mostrou já não pode ser desmostrado — e isso é o começo, não o fim.',
      'Guarda esta leitura como se guarda uma semente: sem a esfregar, sem a explicar a toda a gente.',
    ],
    connective: ['E repara que', 'Aí está o nó:', 'O fio continua:', 'Do outro lado da mesa,'],
  },
  acolhedora: {
    address: 'tu',
    hedges: ['pode ser que', 'faz sentido pensar que', 'o que as cartas sugerem é'],
    openers: [
      'Vamos devagar. Trouxeste "{question}" para {spread}, e {cards} cartas aceitaram responder — nenhuma delas te vai julgar.',
      'Respira. Isto é {spread}, com {cards} cartas, à volta de uma coisa que te ocupa: {climate}.',
      'Obrigado por trazeres a pergunta por escrito — ela muda a leitura. {spread} começa assim: {climate}.',
    ],
    closers: [
      'Fica com uma coisa só, e vê se ela te faz bem: é esse o teste. As cartas servem para isso.',
      'Se algo aqui doeu, isso é informação, não sentença. Podes voltar amanhã e perguntar de novo.',
      'Fecha a leitura quando estiveres pronto. O teu ritmo manda mais do que qualquer tiragem.',
    ],
    connective: ['E o que isto tem de teu é:', 'Não é culpa tua, mas é responsabilidade tua:', 'Um passo de cada vez:', 'O que alivia, aqui, é:'],
  },
  direta: {
    address: 'tu',
    hedges: ['os dados dizem', 'a leitura é clara em', 'sem rodeios:'],
    openers: [
      'Directo ao ponto: {spread}, {cards} cartas, pergunta "{question}". O essencial é {climate}.',
      'Sem preâmbulos. A tiragem diz uma coisa com clareza: {climate}.',
      'Isto é {spread}. Responde ao que está na mesa, não ao que gostarias que estivesse: {climate}.',
    ],
    closers: [
      'Ação concreta esta semana, escrita em um parágrafo, e relês isto daqui a trinta dias. É assim que se sabe se a leitura serviu.',
      'Não guardes a leitura como verdade: guarda-a como hipótese com prazo. Age, mede, ajusta.',
      'Fica o seguinte: {action}. O resto é comentário.',
    ],
    connective: ['Consequência prática:', 'O que tens de fazer disto:', 'Sem dramatizar:', 'Em termos de decisão:'],
  },
  sabia: {
    address: 'tu',
    hedges: ['a tradição lê isto como', 'convém distinguir', 'o quadro clássico sugere'],
    openers: [
      '{spread} é uma forma antiga de organizar a atenção: {cards} posições, cada uma com a sua competência própria. {climate}.',
      'Vale a pena começar pela estrutura. {spread} não distribui cartas ao acaso — {climate}.',
      'O que está em causa não é prever, é distinguir. {spread}, {cards} cartas: {climate}.',
    ],
    closers: [
      'Que esta leitura acrescente discernimento, não dependência: as cartas descrevem configurações, não destinos.',
      'Guarda a data, a pergunta e o que decidires. É esse registo — não a intuição do momento — que faz de ti um leitor melhor.',
      'Daqui a um mês, relerás isto com vantagem: saberás exactamente o que aconteceu e o que era só leitura.',
    ],
    connective: ['Distinção útil:', 'O que a tradição acrescenta:', 'Nota de método:', 'Isto separa-se assim:'],
  },
  poetica: {
    address: 'tu',
    hedges: ['dir-se-ia que', 'a imagem insiste em', 'há aqui um tom de'],
    openers: [
      '{cards} cartas sobre a mesa e uma pergunta em voz baixa: {question}. O primeiro som que fazem juntas é {climate}.',
      'A tiragem abre como abre um dia: primeiro a luz, depois as coisas. {spread} começa com {climate}.',
      'Ponhamos de lado a pressa de responder. {spread} traz {cards} imagens, e a primeira é esta: {climate}.',
    ],
    closers: [
      'Que a imagem fique mais tempo do que a explicação. É assim que as leituras amadurecem.',
      'Fecha o baralho como quem fecha uma porta sem ruído: o que tinha a ser dito já está dito.',
      'Leva contigo só a imagem que não te larga. As cartas explicam-se sozinhas com o tempo.',
    ],
    connective: ['A imagem adensa-se:', 'E há nisto um ritmo:', 'O que a cena mostra:', 'Entre as duas cartas,'],
  },
  analitica: {
    address: 'tu',
    hedges: ['o padrão indica', 'em termos estruturais', 'o peso relativo sugere'],
    openers: [
      'Estrutura da leitura: {cards} posições em {spread}. Distribuição simbólica dominante — {climate}.',
      'Antes das cartas, o tabuleiro: {spread} divide a pergunta em blocos funcionais. {climate}.',
      'Três eixos organizam esta leitura: elementos, posições e ligações canónicas. O eixo mais carregado é {climate}.',
    ],
    closers: [
      'Resumo operacional: um padrão forte, um padrão fraco, uma acção testável. É isto que a tiragem suporta.',
      'Se quiseres validar esta leitura, fixa a previsão implícita no ponto de maior força e revê-a em duas semanas.',
      'O que fica: {action}. O que não fica suportado pelas cartas: qualquer garantia sobre pessoas concretas.',
    ],
    connective: ['Correlação observada:', 'Isto mede-se assim:', 'Peso estrutural:', 'O que muda na prática:'],
  },
}

const REGISTER_LENS: Record<Register, keyof CardDef['domains'] | 'meanings'> = {
  narrativa: 'meanings',
  psicologica: 'psychology',
  espiritual: 'spirituality',
  pratica: 'career',
  tradicional: 'meanings',
  poetica: 'emotional',
}

function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

function pick<T>(items: readonly T[], salt: string): T {
  return items[hash(salt) % items.length]!
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))
}

function joinSentences(parts: (string | undefined)[], max: number): string[] {
  const clean = parts.filter((p): p is string => Boolean(p && p.trim().length > 12)).map((p) => tidy(p))
  const unique: string[] = []
  for (const s of clean) if (!unique.some((u) => u === s)) unique.push(s)
  return unique.slice(0, max)
}

function tidy(s: string): string {
  let out = s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/^\s+|\s+$/g, '')
    .replace(/([a-zà-öø-ÿ])\.(?=[A-ZÀ-ÖØ-Þ])/g, '$1. ')
  out = out.replace(/[.,;:\s]+$/, '')
  out = out.replace(/^./, (c) => c.toUpperCase())
  out = out.replace(/["'»\s]+$/, (m) => m.replace(/[\s.]+$/, ''))
  const last = out.slice(-1)
  if (!/[.!?…]/.test(last)) out += '.'
  // jamais pontuação duplicada no fim
  return out.replace(/([.!?…])\1+/g, '$1').replace(/([?!])\.(\s|$)/g, '$1$2')
}

function sentences(text: string, count: number): string[] {
  const parts = text
    .replace(/\s+/g, ' ')
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20)
  return parts.slice(0, count)
}

function climateOf(analysis: Analysis): string {
  const el = analysis.elementBalance
  const dominant = (['fire', 'water', 'air', 'earth', 'spirit'] as const)
    .map((k) => ({ k, v: el[k] }))
    .sort((a, b) => b.v - a.v)[0]!
  const name = {
    fire: 'o fogo — acção, iniciativa, temperatura alta',
    water: 'a água — sentimento, memória, maré',
    air: 'o ar — pensamento, conversa, definição',
    earth: 'a terra — corpo, recursos, tempo longo',
    spirit: 'o espírito — os grandes arquétipos a organizarem o tabuleiro',
  }[dominant.k]
  const majors = analysis.counts.majors
  const reversed = analysis.counts.reversed
  const extras: string[] = []
  if (reversed > 0) extras.push(`${reversed} carta${reversed > 1 ? 's' : ''} invertida${reversed > 1 ? 's' : ''} a ${reversed > 1 ? 'travarem' : 'travar'} o fluxo`)
  if (analysis.aspectByKind.opposition + analysis.aspectByKind.square > 0) extras.push(`${analysis.aspectByKind.square} quadratura(s) e ${analysis.aspectByKind.opposition} oposição(ões) a manterem o tabuleiro tenso`)
  if (analysis.elementBalance.total >= 4) {
    const missing = (['fire', 'water', 'air', 'earth'] as const).filter((e) => el[e] === 0)
    if (missing.length) extras.push(`e ausência total de ${missing.map((m) => elPhrase(m)).join(' e ')}`)
  }
  if (majors >= 3) extras.push(`${majors} arcanos maiores a puxarem o assunto para tema de vida`)
  return name + (extras.length ? ', ' + extras.join(', ') : '')
}

const DOMAIN_BY_WORD: [RegExp, keyof CardDef['domains']][] = [
  [/\b(amor|rela[cç][aã]o|casal|parceir|ex|namorad|casamento|afet|paix|div[oó]rcio)\b/i, 'love'],
  [/(trabalho|empreg|carreira|chefe|equipa|empresa|projeto|projecto|demiss|contrat|promoc|vaga|profiss)/i, 'career'],
  [/(dinheiro|orden|vencimento|contas|aluguer|renda|poupan|poupanç|invest|dívida|banco|casinha)/i, 'finances'],
  [/(medo|ansied|tristez|raiv|coragem|emoç|sentimento|vergonha|culpa|hont)/i, 'emotional'],
  [/(mente|pensar|decid|escolh|confus|dúvid|racioc|ideia|plano|estud|aprend)/i, 'psychology'],
  [/(sentido|prop[oó]sit|alma|deus|espirit|ritual|medit|f[eé,]|[ií]ntui|destino)/i, 'spirituality'],
  [/(crescer|evoluir|transform|mudar|aprender|super|desafio)/i, 'growth'],
]

function domainForQuestion(question: string): keyof CardDef['domains'] | null {
  const q = question.toLowerCase()
  for (const [re, domain] of DOMAIN_BY_WORD) if (re.test(q)) return domain
  return null
}

function questionLink(question: string, card: CardDef, focus: string, domain: keyof CardDef['domains'] | null): string {
  if (!question.trim()) return `Sem pergunta escrita, esta carta trabalha em modo retrato: ${card.name.pt} descreve o terreno, não responde a nada.`
  const q = question.toLowerCase()
  const keywords = [...card.keywords.upright, ...card.keywords.reversed, card.archetype]
  const hits = keywords.filter((k) => {
    const stem = k.toLowerCase().replace(/s$/, '').slice(0, Math.max(4, k.length - 3))
    return stem.length >= 4 && q.includes(stem)
  })
  const domainSentence = domain ? sentences(card.domains[domain], 1)[0] : undefined
  const domainText = hits.length
    ? `A pergunta toca-lhe de frente: escreveste ${hits.slice(0, 3).map((h) => `"${h}"`).join(', ')}, e é exatamente aí que ${card.name.pt} incide.${domainSentence ? ' ' + domainSentence : ''}`
    : domain
      ? `A tua pergunta está redigida noutro vocabulário, mas o eixo bate certo: ${domainSentence ?? card.domains[domain]}`
      : `A pergunta é ampla demais para esta carta responder-lhe por dentro: ${card.name.pt} descreve o terreno onde a decisão cai.`
  const focusNote: Record<string, string> = {
    advice: ' Como a posição pede conselho, lê-se como instrução e não como profecia.',
    obstacle: ' Como a posição nomeia o obstáculo, lê-se como o que está a travar.',
    outcome: ' Como a posição é de desfecho, lê-se como tendência, não como garantia.',
    hidden: ' Como a posição é do que está escondido, o consulente não a veria sozinho.',
    self: ' Como a posição é sobre ti, não vale aplicá-la a outra pessoa.',
    other: ' Como a posição é sobre o outro, vale o que for verificável em comportamento, não em intenção.',
    relation: ' Como a posição é da relação, o sujeito é o entre, não nenhum dos dois.',
    environment: ' Como a posição é do ambiente, isto é contexto: não é traço de carácter de ninguém.',
    general: '',
  }
  return domainText + (focusNote[focus] ?? '')
}

function patternImplication(pattern: Pattern): string {
  return pattern.implication
}

function coreReading(card: CardDef, orientation: string, register: Register, salt: string): string {
  const lens = REGISTER_LENS[register]
  const base = orientation === 'reversed' ? card.meanings.reversed : card.meanings.upright
  const extra =
    lens === 'meanings'
      ? pick(card.art.reading, salt + 'art')
      : lens === 'psychology' || lens === 'spirituality' || lens === 'emotional' || lens === 'career'
        ? card.domains[lens]
        : card.domains.growth
  return sentences([base, extra].join(' '), lens === 'meanings' ? 3 : 2).join(' ')
}

export interface BuildOutcome {
  interpretation: Interpretation
  safety: SafetyFlag[]
}

export function buildInterpretation(input: NarrativeInput): BuildOutcome {
  const { analysis, drawn, spread, question, depth, register, voice, getCard } = input
  const plan = DEPTH_PLAN[depth]
  const profile = VOICE_PROFILE[voice]
  const contextKey = `${spread.id}|${depth}|${register}|${voice}|${question}|${drawn.map((d) => d.cardId + d.orientation).join(',')}`
  const salt = String(hash(contextKey))
  const positionsById = new Map(spread.positions.map((p) => [p.id, p]))
  const cardById = new Map(drawn.map((d) => [d.positionId, getCard(d.cardId)]))
  const safety = safetyFor([question, input.querent?.context ?? '', spread.purpose, spread.summary].join(' '))
  const questionDomain = domainForQuestion(question)

  /* ── A. Abertura ── */
  const climate = climateOf(analysis)
  const opener = fill(
    pick(profile.openers, salt + 'open'),
    { spread: spread.name, cards: drawn.length, question: question.trim() || 'o que trouxeste sem nomear', climate },
  )
  const structureSentence = spread.structure
    ? `${spread.name} divide-se em ${spread.structure.blocks.length} blocos: ${spread.structure.blocks.map((b) => `${b.label} (${b.positions.length})`).join(', ')}. ${spread.structure.kind === 'temporal' ? 'A ordem não é decorativa: os blocos acontecem uns dentro dos outros.' : 'Lê por blocos antes de leres por cartas isoladas.'}`
    : `A tiragem tem ${spread.cardCount} posições em forma de ${spread.shape.replace(/-/g, ' ')}, e o padrão geométrico faz parte da resposta: posições próximas comentam-se entre si.`
  const actionFocus = analysis.patterns[0] ? patternImplication(analysis.patterns[0]) : ''
  const journeySentence = analysis.journey.indices.length ? `Na viagem dos arcanos, estás na fase "${analysis.journey.label}": ${analysis.journey.description}` : ''
  const historySentence =
    input.history?.length
      ? `Há continuidade com o que perguntaste em ${input.history[input.history.length - 1]!.date}: "${input.history[input.history.length - 1]!.question}". As cartas de hoje não contradizem essa leitura — deslocam-na.`
      : ''
  const opening = joinSentences(
    [
      opener,
      spread.whenToUse ? `${spread.name} serve precisamente quando: ${lower(spread.whenToUse)}` : spread.summary,
      structureSentence,
      journeySentence,
      historySentence,
      actionFocus,
      safety.length ? 'Antes de continuar: parte do que trazes não é matéria de tarot, e vou dizê-lo onde aparece.' : '',
    ],
    plan.opening,
  ).join(' ')

  /* ── B. Interpretação individual ── */
  const perCard: PositionReading[] = drawn.map((d, i) => {
    const card = getCard(d.cardId)
    const position = positionsById.get(d.positionId)
    if (!card || !position) return null
    const semantic = classifyPosition(position)
    const resonance = analysis.resonance.find((r) => r.positionId === d.positionId)
    const neighbour = drawn[(i + 1) % drawn.length]
    const neighbourCard = cardById.get(neighbour?.positionId ?? '')
    const relationHere = analysis.relations.filter((r) => r.a === d.cardId || r.b === d.cardId)
    const guidance = card.guidance

    const modulation =
      resonance && resonance.tone !== 'neutral'
        ? `${resonance.reasons.join('; ')}. Por isso esta posição não se lê no sentido padrão da carta.`
        : `A posição recebe a carta no seu sentido corrente, sem atrito elemental.`
    const emotionText = card.domains.emotional
    const obstacleText = d.orientation === 'reversed' ? sentences(guidance.obstacles, 1)[0] ?? guidance.obstacles : card.domains.growth
    const opportunityText = sentences(guidance.opportunities, 1)[0] ?? guidance.opportunities

    const reading: PositionReading = {
      positionId: position.id,
      positionLabel: position.label,
      cardId: card.id,
      cardName: card.name.pt,
      orientation: d.orientation,
      core: coreReading(card, d.orientation, register, salt + i),
      positionModulation: modulation,
      questionLink: questionLink(question, card, semantic.focus, questionDomain),
      emotion: sentences(emotionText, 1)[0] ?? emotionText,
      obstacle: sentences(obstacleText, 1)[0] ?? obstacleText,
      opportunity: opportunityText,
      advice: pick(guidance.advice, salt + 'a' + i),
      connections: joinSentences(
        [
          neighbourCard
            ? `${profile.connective[0] ?? 'A seguir,'} ${card.name.pt} e ${neighbourCard.name.pt} ocupam posições vizinhas (${position.label} → ${positionsById.get(neighbour.positionId)?.label ?? ''}), o que faz da segunda um comentário à primeira.`
            : '',
          relationHere[0]
            ? `A tradição liga estas cartas: ${relationHere[0].aLabel} e ${relationHere[0].bLabel} — ${relationHere[0].kind}. ${relationHere[0].note}`
            : '',
          relationHere[1] ? `${relationHere[1].note}` : '',
          d.orientation === 'reversed' ? `Invertida em ${position.label}: ${sentences(card.meanings.reversed, 1)[0]}` : '',
        ],
        plan.perCard - 1,
      ),
    }
    return reading
  }).filter((x): x is PositionReading => Boolean(x))

  /* ── C. Combinações ── */
  const combinations: CombinationNote[] = analysis.combinations.slice(0, depth === 'breve' ? 3 : depth === 'normal' ? 6 : 10)
  const patterns: Pattern[] = analysis.patterns.slice(0, depth === 'breve' ? 3 : depth === 'normal' ? 6 : depth === 'profunda' ? 9 : 12)

  /* ── D. Síntese narrativa ── */
  const synthesisBlocks: string[] = []
  synthesisBlocks.push(
    [
      `O que unifica a tiragem é ${climate}.`,
      patterns[0] ? `${patterns[0].title}: ${patterns[0].detail}` : '',
      analysis.elementBalance.spirit >= Math.max(analysis.elementBalance.fire, analysis.elementBalance.water, analysis.elementBalance.air, analysis.elementBalance.earth) ? 'Com os maiores a pesarem mais do que os naipes, a situação não é um episódio: é um capítulo.' : '',
    ].join(' '),
  )
  if (analysis.temporal.notes.length) synthesisBlocks.push(`Do tempo: ${analysis.temporal.notes.join(' ')}`)
  if (patterns[1]) synthesisBlocks.push(`${profile.connective[1] ?? 'Além disso,'} ${patterns[1].title}. ${patterns[1].detail} ${patternImplication(patterns[1])}`)
  if (combinations[0])
    synthesisBlocks.push(
      `Entre cartas: ${combinations[0].cards.map((id) => getCard(id)?.name.pt ?? id).join(' e ')} formam um vínculo do tipo ${combinations[0].kind}, e é por aí que a tiragem se segura.`,
    )
  if (analysis.reversalRatio > 0 && analysis.reversalRatio < 0.5)
    {
      const n = analysis.counts.reversed
      const where = analysis.resonance.filter((r) => r.tone === 'desafia').map((r) => positionsById.get(r.positionId)?.label).filter(Boolean).slice(0, 3).join(', ') || 'nas posições de passagem'
      synthesisBlocks.push(
        n === 1
          ? `A única carta invertida não é azar: diz-te onde a força está disponível mas ainda sem uso — ${where}.`
          : `As ${n} invertidas não são azar: dizem onde a força está disponível mas ainda sem uso — ${where}.`,
      )
    }
  if (analysis.themes[0])
    synthesisBlocks.push(
      `O tema que se repete no vocabulário das cartas é "${analysis.themes[0].themeId}" (${analysis.themes[0].cards.length} cartas). Não é coincidência de baralho: é o ponto onde a tua pergunta e a tiragem se sobrepõem.`,
    )
  if (depth !== 'breve' && depth !== 'normal' && analysis.chains[0]) {
    const chain = analysis.chains[0]
    const names = [chain.start, ...chain.path.map((p) => p.to)].map((id) => getCard(id)?.name.pt ?? id)
    const chainPattern = patterns.find((x) => x.kind === 'ressonancia-de-posicao')
    synthesisBlocks.push(`A espinha dorsal: ${names.join(' → ')}.${chainPattern ? ' ' + chainPattern.implication : ''}`)
  }
  if (depth === 'muito-profunda' && analysis.numerology.reduced) {
    synthesisBlocks.push(
      `Nota de estrutura, para quem quiser verificar: a soma numerológica das posições dá ${analysis.numerology.sum}, reduzida a ${analysis.numerology.reduced}. Não é uma previsão; é um índice de que o mesmo número ecoa em cartas diferentes${analysis.numerology.repeats.length ? ` (${analysis.numerology.repeats.map((r) => `${r.value}×${r.cards.length}`).join(', ')})` : ''}.`,
    )
  }
  let synthesis = joinSentences(synthesisBlocks, plan.synthesis)

  /* ── E. Orientações práticas ── */
  const adviceCards = drawn
    .map((d) => ({ d, card: getCard(d.cardId), pos: positionsById.get(d.positionId) }))
    .filter((x) => x.card && x.pos)
  const adviceFromPositions = adviceCards
    .filter((x) => {
      const s = classifyPosition(x.pos!)
      return s.focus === 'advice' || s.focus === 'outcome' || s.time === 'futuro'
    })
    .map((x) => x.card!.guidance.advice[0])
  const adviceFromPatterns = patterns.slice(0, 4).map((p) => p.implication)
  const adviceFromObstacles = adviceCards.slice(0, 3).map((x) => `Retira o obstáculo nomeado por ${x.card!.name.pt}: ${sentences(x.card!.guidance.obstacles, 1)[0]}`)
  let practical = joinSentences([...adviceFromPositions, ...adviceFromPatterns, ...adviceFromObstacles, ...(safety.length ? safety.map((s) => s.action) : [])], plan.practical)

  /* ── F. Perguntas de reflexão ── */
  const reflectionSources = adviceCards
    .filter((x) => x.pos && ['hidden', 'self', 'obstacle', 'relation'].includes(classifyPosition(x.pos!).focus))
    .map((x) => x.card!.guidance.reflection[0])
  const reflectionFromPatterns = patterns.slice(0, 2).map((p) => `Se "${p.title}" é o padrão dominante, o que estarias a fazer se ele fosse mesmo verdade?`)
  const REFLECTION_TAIL = [
    'O que nesta tiragem parece dito a teu favor está mesmo a teu favor, ou é o que querias ouvir?',
    'Se as cartas estivessem caladas, o que já saberias disto?',
  ]
  let reflection = joinSentences([...reflectionSources, ...reflectionFromPatterns, ...REFLECTION_TAIL, question ? `A tua pergunta original era "${question}". Depois desta leitura, qual versão dela continuas a querer responder?` : 'Que pergunta terias de fazer para que esta tiragem se tornasse acção?'], plan.reflection)

  /* ── G. Mensagem final ── */
  const closingAction = practical[0] ?? `relê esta tiragem daqui a 30 dias, com a mesma pergunta`
  const closing = [
    fill(pick(profile.closers, salt + 'close'), { action: lower(closingAction) }),
    safety.length ? safety[0]!.userMessage : '',
    depth === 'breve' ? '' : `${spread.name} descreve configurações; a decisão é tua e nada nas cartas a substitui.`,
  ]
    .filter(Boolean)
    .join(' ')

  /* Dedupe entre secções: o mesmo texto não pode aparecer duas vezes na leitura. */
  const seen = new Set<string>()
  const key = (t: string) => t.toLowerCase().replace(/[^a-zà-ÿ0-9]/gi, '').slice(0, 90)
  const fresh = (t: string) => {
    const k = key(t)
    if (k.length < 40 || seen.has(k)) return false
    seen.add(k)
    return true
  }
  const markAll = (text: string) => {
    seen.add(key(text))
    for (const sentence of text.split(/(?<=[.!?])\s+/)) seen.add(key(sentence))
  }
  markAll(opening)
  for (const r of perCard) {
    for (const c of r.connections) markAll(c)
    markAll(r.core)
    markAll(r.obstacle)
    markAll(r.advice)
  }
  for (const c of combinations) markAll(c.note)
  for (const p of patterns) markAll(p.implication)
  synthesis = synthesis.filter(fresh)
  practical = practical.filter(fresh)
  reflection = reflection.filter(fresh)
  const freshCombinations = combinations.filter((c) => fresh(c.note))
  const freshPatterns = patterns.filter((p) => fresh(p.detail))
  const dominantTheme = freshPatterns[0]?.title ?? climate

  const title = `${spread.name} · ${drawn.length} cartas${question ? ` · ${truncate(question, 60)}` : ''}`
  const interpretation: Interpretation = {
    schemaVersion: 1,
    spreadId: spread.id,
    spreadName: spread.name,
    title,
    question,
    opening,
    dominantTheme,
    perCard,
    combinations: freshCombinations,
    patterns: freshPatterns.length ? freshPatterns : patterns.slice(0, 2),
    elementBalance: analysis.elementBalance,
    majorsCount: analysis.counts.majors,
    reversedCount: analysis.counts.reversed,
    synthesis,
    practical,
    reflection,
    closing,
    disclaimers: [...new Set(safety.map((s) => s.userMessage))],
    meta: {
      generator: 'local',
      depth,
      register,
      voice,
      language: 'pt-PT',
      contextHash: hashHex(contextKey),
    },
  }

  return { interpretation, safety }
}

function lower(s: string): string {
  return s.replace(/^./, (c) => c.toLowerCase())
}

function truncate(s: string, n: number): string {
  const t = s.trim()
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

export function hashHex(str: string): string {
  const a = hash(str).toString(16).padStart(8, '0')
  const b = hash(str + '·arcana').toString(16).padStart(8, '0')
  return a + b
}

/** Reordena a leitura para o modo "revelação progressiva" (UI). */
export function readingSequence(spread: SpreadDef, perCard: PositionReading[]): { positionId: string; step: number; group: string }[] {
  const byId = new Map(perCard.map((p) => [p.positionId, p]))
  return spread.readingOrder.filter((id) => byId.has(id)).map((id, i) => {
    const position = spread.positions.find((p) => p.id === id)
    return { positionId: id, step: i + 1, group: position?.group ?? 'geral' }
  })
}
