import type { Analysis } from '../engine/symbolic.ts'
import type { CardDef, DrawnCard, SpreadDef } from '../domain/types.ts'
import type { Depth, Interpretation, Register, VoiceKey } from '../domain/interpretation.ts'
import type { SectionKind } from './schema.ts'
import { type SafetyFlag } from '../domain/safety.ts'

/**
 * Construção de prompts modulares.
 *
 * Cada secção da leitura é pedida separadamente (A, B, C, D, E+F, G), com um contexto
 * partilhado e mínimo. Vantagens reais, não retóricas:
 *  - o modelo nunca vê o baralho inteiro, só as cartas retiradas e a sua posição;
 *  - uma secção malformada não estraga as outras (validação por secção);
 *  - o streaming mostra progresso útil em vez de um bloco opaco;
 *  - o custo é previsível e o contexto é reutilizável (prefixo idêntico em todas as chamadas).
 *
 * O "skeleton" é o output do motor local: o LLM reescreve e aprofunda, não decide o que
 * as cartas significam. É isso que impede a alucinação por construção.
 */

export interface PromptContext {
  spread: SpreadDef
  drawn: DrawnCard[]
  cards: CardDef[]
  analysis: Analysis
  question: string
  depth: Depth
  register: Register
  voice: VoiceKey
  locale: 'pt-PT'
  safety: SafetyFlag[]
  skeleton: Interpretation
  querent?: { name?: string; context?: string }
  history?: { date: string; question: string; summary: string }[]
}

const VOICE_INSTRUCTION: Record<VoiceKey, string> = {
  mistica: 'Voz de leitura ritual: frases de ritmo lento, imagem concreta, sem linguagem new-age, sem "universo conspira", sem promessas. Nunca ocultes informação difícil atrás de poesia.',
  acolhedora: 'Voz acolhedora e não-julgadora: valida o esforço, nunca consolas com falsidade, não uses diminutivos nem emojis. Chama as coisas pelos nomes, com delicadeza.',
  direta: 'Voz direta e económica: sem elogios à pergunta, sem introduções, sem resumos do que acabaste de dizer. Frases curtas, verbos no infinitivo ou no indicativo.',
  sabia: 'Voz de leitura erudita: podes nomear a tradição (Golden Dawn, Rider-Waite-Smith, numerologia, signos) mas só o que está nos dados fornecidos; explica o método quando acrescenta algo.',
  poetica: 'Voz poética mas legível: uma imagem por parágrafo, zero abstractos encadeados, nunca rima, nunca arcaísmos forçados, nunca mais de uma metáfora por frase.',
  analitica: 'Voz analítica: descreve relações e evidências internas da tiragem ("esta carta repete o elemento desta posição"), evita adjectivação, quantifica quando os dados o permitem.',
}

const REGISTER_INSTRUCTION: Record<Register, string> = {
  narrativa: 'Registo narrativo: lê a tiragem como uma sequência com princípio e fim, não como lista de significados.',
  psicologica: 'Registo psicológico descritivo: fala de padrões, defesas, necessidades e comportamento observável. Não uses linguagem clínica de diagnóstico (não nomeies perturbações).',
  espiritual: 'Registo espiritual não-confessional: símbolo, rito, silêncio, responsabilidade. Não assumas crença do consulente, não evangelizes, não prometas protecção.',
  pratica: 'Registo prático: cada afirmação tem de desaguar em algo que se possa fazer esta semana, com data ou critério de sucesso.',
  tradicional: 'Registo tradicional: usa correspondências (planeta, signo, número, naipe) quando elas explicam; refere a leitura invertida como variação de canal, não como "mau agouro".',
  poetica: 'Registo poético-interpretativo: a imagem serve o sentido, nunca o substitui. Toda a frase tem de ser parafraseável em linguagem corrente.',
}

const DEPTH_INSTRUCTION: Record<Depth, string> = {
  breve: 'Extensão breve: 2 a 3 frases por secção, sem exemplos secundários.',
  normal: 'Extensão média: 3 a 4 frases por secção; uma ilustração concreta quando ajudar.',
  profunda: 'Extensão longa: 4 a 6 frases por secção; explicita contradições entre cartas e nomeia o que não se sabe.',
  'muito-profunda': 'Extensão máxima: 5 a 8 frases por secção; desenvolve a história da tiragem, as sombras, as alternativas de decisão e o que Observar para confirmar ou refutar a leitura.',
}

/** Contexto comum a todas as chamadas (prefixo estável → melhor cache do provedor). */
export function sharedContext(ctx: PromptContext): string {
  const { spread, drawn, cards, analysis, question, depth, register, voice } = ctx
  const byId = new Map(cards.map((c) => [c.id, c]))
  const positionById = new Map(spread.positions.map((p) => [p.id, p]))
  const cardsBlock = drawn
    .map((d, i) => {
      const card = byId.get(d.cardId)!
      const pos = positionById.get(d.positionId)
      const lines = [
        `### ${i + 1}. ${card.name.pt} — ${d.orientation === 'upright' ? 'direita' : 'invertida'}`,
        `Posição: ${pos?.label ?? d.positionId}${pos ? ` — ${pos.description}` : ''}`,
        `Arquétipo: ${card.archetype}`,
        `Elemento: ${card.arcana === 'major' ? 'espírito (maior)' : card.element} | Naipe: ${card.suit ?? 'maior'} ${card.rank ? `| Valor: ${card.rank} (${card.number})` : `| Arcano: ${card.number}`}`,
        card.astro ? `Correspondência: ${card.astro}` : '',
        `Palavras-chave: ${card.keywords[d.orientation === 'upright' ? 'upright' : 'reversed'].join(', ')}`,
        `Sentido (${d.orientation}): ${d.orientation === 'upright' ? card.meanings.upright : card.meanings.reversed}`,
        card.guidance.advice.length ? `Conselho canónico: ${card.guidance.advice[0]}` : '',
        card.guidance.obstacles ? `Obstáculo: ${card.guidance.obstacles}` : '',
      ]
      return lines.filter(Boolean).join('\n')
    })
    .join('\n\n')

  const patternsBlock = analysis.patterns
    .map((p) => `- ${p.title} (força ${p.strength.toFixed(2)}; cartas: ${p.cards.map((id) => byId.get(id)?.name.pt ?? id).join(', ') || 'n/a'}) — ${p.detail} Implicação: ${p.implication}`)
    .join('\n')

  const combosBlock = analysis.combinations
    .map((c) => `- [${c.kind}] ${c.cards.map((id) => byId.get(id)?.name.pt ?? id).join(' + ')} (${c.positions.map((p) => positionById.get(p)?.label ?? p).join(' → ')}): ${c.note}`)
    .join('\n')

  const relationsBlock = analysis.relations
    .map((r) => `- ${r.aLabel} ${r.derived ? '←' : '→'} ${r.bLabel} [${r.kind}] ${r.note}`)
    .slice(0, 12)
    .join('\n')

  const aspectBlock = analysis.aspects
    .slice(0, 12)
    .map((a) => `- ${byId.get(a.a)?.name.pt ?? a.a} (${a.signA}) ${a.kind} ${byId.get(a.b)?.name.pt ?? a.b} (${a.signB}) a ${a.orbDeg}° — ${a.harmony}`)
    .join('\n')

  const elementBlock = `fogo ${analysis.elementBalance.fire} · água ${analysis.elementBalance.water} · ar ${analysis.elementBalance.air} · terra ${analysis.elementBalance.earth} · espírito ${analysis.elementBalance.spirit} (total ${analysis.elementBalance.total})`
  const structureBlock = spread.structure
    ? spread.structure.blocks.map((b) => `${b.label}: ${b.positions.map((p) => positionById.get(p)?.label ?? p).join(', ')}${b.note ? ` (${b.note})` : ''}`).join('\n')
    : 'sem blocos declarados'
  const resonanceBlock = analysis.resonance
    .map((r) => `- ${positionById.get(r.positionId)?.label ?? r.positionId}: ${byId.get(r.cardId)?.name.pt ?? r.cardId} → ${r.tone} — ${r.reasons.join('; ')}`)
    .join('\n')

  return `# TAREFA
Leitura de tarot em português europeu (pt-PT), para um consulente real, na tiragem "${spread.name}".
Pergunta do consulente: ${question ? `"${question}"` : '(sem pergunta escrita — leitura descritiva)'}
${ctx.querent?.context ? `Contexto declarado: ${ctx.querent.context}` : ''}
Modo: ${depth} · registo: ${register} · voz: ${voice}

# CONTRATO INEGOCIÁVEL
1. Só podes usar as ${drawn.length} cartas listadas abaixo, nas posições em que estão. Nunca refiras cartas que não saíram, nunca inventes posições, nunca "amplies" a tiragem.
2. Todo o simbolismo adicional tem de vir dos dados fornecidos (correspondências, padrões, relações). Se um dado não está aqui, não existe para ti.
3. Não previs acontecimentos concretos (datas, mortes, gravidez, diagnóstico, veredictos, fidelidade de terceiros). Fala de tendências, disposições e consequência de escolhas.
4. Não uses hedging vazio ("as coisas podem correr bem") nem frases de enrolação. Zero preâmbulos, zero "claro", zero repetir a pergunta para encher.
5. Escreves para ser lido em voz alta: frases com sujeito e verbo, sem listas de adjectivos.
6. Português de Portugal: "tu" como tratamento, "está a + infinitivo" para progresso, colocação pronominal correcta, sem gerúndio brasileiro, sem "você" misturado com "tu".
7. A tua saída é JSON estrito, sem comentários, sem markdown à volta, sem texto fora do objecto.

# TIRAGEM
Nome: ${spread.name}
Para que serve: ${spread.purpose}
Quando usar: ${spread.whenToUse}
Geometria: ${spread.shape} · ${spread.cardCount} posições · blocos:
${structureBlock}

# CARTAS RETIRADAS
${cardsBlock}

# ESTRUTURA JÁ DETECTADA PELO MOTOR (não contradigas os factos, interpreta-os)
Elementos: ${elementBlock}
Tempo da tiragem: ${analysis.temporal.pace} (peso projectado para a frente: ${(analysis.temporal.forwardBias * 100).toFixed(0)}%) — ${analysis.temporal.notes.join(' ')}
Viagem dos maiores: ${analysis.journey.label} — ${analysis.journey.description}
Padrões:
${patternsBlock || '- nenhum padrão forte'}
Combinações vizinhas:
${combosBlock || '- nenhuma combinação adjacente relevante'}
Relações canónicas presentes:
${relationsBlock || '- nenhuma relação directa entre as cartas retiradas'}
Aspetos astrológicos entre cartas:
${aspectBlock || '- sem signos suficientes para calcular aspetos'}
Ressonância posição↔carta:
${resonanceBlock}

# ESQUELETO DO MOTOR LOCAL (usar como base; melhorar, não anular)
Abertura: ${ctx.skeleton.opening}
Síntese: ${ctx.skeleton.synthesis.join(' ')}
Fecho: ${ctx.skeleton.closing}

# ESTILO
${VOICE_INSTRUCTION[voice]}
${REGISTER_INSTRUCTION[register]}
${DEPTH_INSTRUCTION[depth]}
${ctx.history?.length ? `Continuidade: o consulente perguntou antes (${ctx.history.map((h) => `${h.date}: ${h.question}`).join('; ')}). Sê coerente com essa história, mas não repitas as palavras.` : ''}`
}

export function systemPrompt(): string {
  return [
    'És o interpretante do ARCANA, uma plataforma de tarot em português europeu.',
    'Trabalhas em duas camadas: um motor simbólico determinístico apura os factos da tiragem e tu escreves a leitura por cima desses factos.',
    'A tua função é tornar o símbolo compreensível e accionável, não impressionante. Se uma frase não acrescentar informação verificável na tiragem, corta-a.',
    'Nunca afirmas saber factos sobre pessoas concretas que não estejam no texto fornecido. Nunca dás conselho clínico, jurídico ou financeiro: redescreves a relação do consulente com a decisão e indicas o apoio certo.',
    'Nunca sugeres que o destino está fixo. Onde os dados não chegam, diz "a tiragem não cobre isto".',
  ].join('\n')
}

export interface SectionRequest {
  section: SectionKind
  instruction: string
  /** JSON Schema-like descrição do formato exigido (mantida curta e explícita). */
  shape: string
}

export function sectionRequest(section: SectionKind, ctx: PromptContext): SectionRequest {
  const positionIds = ctx.spread.positions.map((p) => p.id)
  const cardIds = ctx.drawn.map((d) => d.cardId)
  switch (section) {
    case 'opening':
      return {
        section,
        instruction: `Escreve a abertura da leitura (secção A). Tem de dizer, em 2 a 5 frases: que tiragem é esta, o clima simbólico dominante e o ângulo a partir do qual a vais ler. Não resumas ainda as cartas individualmente. Não uses a palavra "energias" no vazio.`,
        shape: `{"kind":"opening","text":string}`,
      }
    case 'per-card':
      return {
        section,
        instruction: `Escreve a interpretação carta a carta (secção B), uma entrada por posição, na ordem de leitura. Para cada carta: "core" = o que a carta quer dizer aqui e agora (com o sentido da orientação); "modulation" = como esta posição específica altera esse sentido; "connection" = o que esta carta passa para a posição seguinte. ${ctx.depth === 'breve' ? 'Uma frase por campo.' : 'Duas a quatro frases por campo.'} Nunca repitas a descrição genérica da carta: tem de ser específica desta posição e desta pergunta.`,
        shape: `{"kind":"per-card","items":[{"positionId":${JSON.stringify(positionIds.join('|'))},"cardId":${JSON.stringify(cardIds.join('|'))},"orientation":"upright|reversed","core":string,"modulation":string,"connection":string}]}`,
      }
    case 'combinations':
      return {
        section,
        instruction: `Escreve a secção C: o que acontece ENTRE as cartas. Trabalha apenas sobre os pares e padrões já detectados pelo motor (podes reformular, ordenar e hierarquizar; não inventes pares novos que não tenham fundamento nos dados fornecidos). Entre 3 e ${Math.max(4, Math.min(9, ctx.drawn.length * 2))} entradas. Em "kind" usa exatamente um de: reforco, tensao, sombra, complemento, espelho, sequencia.`,
        shape: `{"kind":"combinations","items":[{"cards":["id1","id2"],"kind":"reforco|tensao|sombra|complemento|espelho|sequencia","note":string}]}`,
      }
    case 'synthesis':
      return {
        section,
        instruction: `Escreve a síntese narrativa (secção D): ${ctx.depth === 'breve' ? '2' : ctx.depth === 'normal' ? '3' : ctx.depth === 'profunda' ? '4-5' : '5-7'} parágrafos que liguem tudo numa coisa só que o consulente consiga repetir no dia seguinte. Inclui explicitamente aquilo que a tiragem NÃO responde. Um parágrafo = uma ideia, 3 a 6 frases.`,
        shape: `{"kind":"synthesis","paragraphs":[string,string,...]}`,
      }
    case 'guidance':
      return {
        section,
        instruction: `Escreve E (orientações práticas) e F (perguntas de reflexão). "practical": conselhos executáveis, datáveis, sem tom de auto-ajuda — cada item começa com um verbo. "reflection": perguntas que abrem, não que fecham; nenhuma pergunta retórica com resposta óbvia; nenhuma pergunta que envolva terceiros como objecto.`,
        shape: `{"kind":"guidance","practical":[string,...],"reflection":[string,...]}`,
      }
    case 'closing':
      return {
        section,
        instruction: `Escreve G (mensagem final): uma frase curta de fecho, sem repetir a síntese, sem "que as te acompanhem", sem moral. Em "oneLine", uma frase de no máximo 180 caracteres para o consulente copiar para o diário.`,
        shape: `{"kind":"closing","text":string,"oneLine":string}`,
      }
  }
}

export function safetyBlock(safety: SafetyFlag[]): string {
  if (!safety.length) return ''
  return `# MATÉRIA SENSÍVEL DETECTADA (vinculativo)
${safety
  .map(
    (f) =>
      `- ${f.category} [${f.severity}]: ${f.modelInstruction}\n  Mensagem que o produto mostra ao consulente (não a contradigas): ${f.userMessage}`,
  )
  .join('\n')}
Nunca amenizes estes temas com simbologia. Nunca diagnoses. Nunca digas que as cartas confirmam o risco.`
}

export function buildMessages(ctx: PromptContext, section: SectionKind): { role: 'system' | 'user'; content: string }[] {
  const req = sectionRequest(section, ctx)
  return [
    { role: 'system', content: `${systemPrompt()}\n\n${safetyBlock(ctx.safety)}`.trim() },
    {
      role: 'user',
      content: `${sharedContext(ctx)}

# SECÇÃO PEDIDA AGORA
${req.instruction}

# FORMATO DE SAÍDA (JSON estrito, uma única linha de objecto, sem markdown)
${req.shape}

Se não conseguires produzir conteúdo válido para esta secção a partir dos dados, devolve o mesmo JSON com campos vazios e um campo extra "reason": explicação curta. Não inventes.`,
    },
  ]
}

/** Prompt da conversa pós-leitura: o modelo só conhece as cartas já retiradas. */
export function buildChatMessages(params: {
  readingSummary: string
  drawn: { positionLabel: string; cardName: string; orientation: string }[]
  question: string
  history: { role: 'user' | 'assistant'; content: string }[]
  voice: VoiceKey
  safety: SafetyFlag[]
}): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const cardsList = params.drawn.map((d) => `- ${d.positionLabel}: ${d.cardName} (${d.orientation === 'upright' ? 'direita' : 'invertida'})`).join('\n')
  const system = [
    'Estás dentro de uma leitura de tarot já feita, em português europeu.',
    'Se a pergunta do consulente precisar de uma carta que não está na lista, responde explicitamente que a tiragem não cobre isso e oferece uma nova tiragem — nunca retires cartas nem simules cartas novas.',
    'Não repitas a leitura: aprofunda o ponto perguntado, com base nas posições e no texto canónico das cartas listadas.',
    VOICE_INSTRUCTION[params.voice],
    'Formato: JSON estrito {"reply":string,"focusPositions":string[],"outOfScope":boolean}.',
    safetyBlock(params.safety),
  ]
    .filter(Boolean)
    .join('\n')

  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Pergunta original: ${params.question || '(sem pergunta)'}

Cartas retiradas (únicas fonte de verdade):
${cardsList}

Resumo da leitura entregue:
${params.readingSummary}`,
    },
    ...params.history.slice(-8).map((h) => ({ role: h.role, content: h.content }) as { role: 'user' | 'assistant'; content: string }),
    {
      role: 'user',
      content: 'Nova pergunta do consulente no fim desta resposta.',
    },
  ]
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.6)
}

export function promptFingerprint(ctx: PromptContext, section: SectionKind): string {
  const byId = new Map(ctx.cards.map((c) => [c.id, c]))
  return [
    ctx.spread.id,
    ctx.question.length,
    ctx.depth,
    ctx.register,
    ctx.voice,
    section,
    ctx.drawn.map((d) => `${d.positionId}:${d.cardId}:${d.orientation}`).join(','),
    ctx.analysis.patterns.map((p) => p.kind + p.strength.toFixed(2)).join(','),
    byId.size,
  ].join('|')
}
