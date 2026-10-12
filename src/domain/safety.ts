/**
 * Guarda ética da plataforma.
 *
 * O ARCANA não faz diagnóstico, não prevê morte/doença, não dá aconselhamento jurídico,
 * financeiro ou clínico, e não trata dependências como matéria de tiragem. Estas regras são
 * aplicadas em três sítios: na UI (aviso antes de submeter), no motor local (secção G e
 * `disclaimers`) e no pós-processamento do LLM (o texto do modelo é filtrado pelo mesmo
 * conjunto de regras e recebe os avisos por cima).
 *
 * Importante: nenhum destes avisos depende da IA — são determinísticos e testáveis.
 */

export type SafetyCategory = 'mental-crisis' | 'health' | 'legal' | 'finance' | 'addiction' | 'grief' | 'minors' | 'relationship-violence'

export interface SafetyFlag {
  category: SafetyCategory
  /** Gravidade: `critico` interrompe o fluxo de leitura com um convite a procurar ajuda. */
  severity: 'critico' | 'alto' | 'medio'
  /** Frase a mostrar ao utilizador, em PT-PT, sem tom clínico nem moralista. */
  userMessage: string
  /** Acção concreta sugerida (entra na secção E). */
  action: string
  /** Recursos em Portugal, quando existem e são públicos. */
  resources?: { label: string; value: string; kind: 'telefone' | 'site' | 'servico' }[]
  /** Instrução para o modelo (só usada no prompt; nunca mostrada ao utilizador). */
  modelInstruction: string
}

interface Rule {
  category: SafetyCategory
  severity: SafetyFlag['severity']
  patterns: RegExp[]
  userMessage: string
  action: string
  resources?: SafetyFlag['resources']
  modelInstruction: string
}

const RULES: Rule[] = [
  {
    category: 'mental-crisis',
    severity: 'critico',
    patterns: [/\b(su[ií]cid|matar-me|matar a mim|quero morrer|n[aã]o quero viver|acabar com tudo|autol[eé]s[aã]o|me faço mal|cortar-me|les[aã]o me)\b/i],
    userMessage:
      'O que escreveste pesa mais do que qualquer tiragem, e não é matéria de cartas. Isto que estás a sentir tem ajuda concreta e imediata: fala com uma pessoa agora. Se estiveres em perigo imediato, liga 112.',
    action:
      'Pede ajuda humana antes de qualquer decisão: SNS 24 (808 24 24 24) ou o Telefone da Esperança (213 544 545 / 232 440 664), que atendem todos os dias. Se há risco imediato, 112.',
    resources: [
      { label: 'Emergência', value: '112', kind: 'telefone' },
      { label: 'SNS 24 (saúde mental, 24h)', value: '808 24 24 24', kind: 'telefone' },
      { label: 'Telefone da Esperança (apoio emocional)', value: '213 544 545', kind: 'telefone' },
      { label: 'SOS Voz do Coração', value: '222 437 173', kind: 'telefone' },
    ],
    modelInstruction:
      'O utilizador descreveu ideação suicida ou autolesão. NÃO interpretes as cartas como validação, diagnóstico ou previsão. Recusa qualquer aconselhamento clínico. Devolve no máximo 3 frases: reconhecimento do sofrimento, indicação explícita de que há ajuda imediata (112, SNS 24, Telefone da Esperança) e convite a contactar já uma pessoa de confiança ou um profissional. Não uses linguagem mística para minimizar.',
  },
  {
    category: 'health',
    severity: 'alto',
    patterns: [/\b(tumor|c[aá]ncer|bi[oó]psia|doen[çc]a grave|diagn[oó]stico|reson[aã]ncia|quimioterapia|cirurgia|sintoma|exame m[eé]dico|ansiedad|depress|p[aâ]nic|ins[oó]nio cr[oó]nic)\b/i],
    userMessage: 'Saúde não se lê em cartas: o que estiver aqui dito é linguagem simbólica sobre como estás a atravessar, nunca sobre o teu corpo ou sobre um diagnóstico.',
    action: 'Se ainda não o fizeste, confirma esta matéria com o teu médico de família ou SNS 24. A tiragem serve para o lado humano da espera, não para a decisão clínica.',
    resources: [
      { label: 'SNS 24', value: '808 24 24 24', kind: 'telefone' },
      { label: 'Saúde 24 (Serviço Nacional de Saúde)', value: 'https://wwwSNS.pt', kind: 'site' },
    ],
    modelInstruction:
      'Tema de saúde. É proibido sugerir diagnóstico, prognóstico, evolução de doença, decisão sobre tratamentos ou interrupção de medicação. Podes apenas descrever o custo emocional e simbólico da situação e reforçar explicitamente a necessidade de acompanhamento médico. Usa o condicional e nomeia o limite.',
  },
  {
    category: 'legal',
    severity: 'alto',
    patterns: [/\b(julgada?o?|tribunal|advogad|demanda|lit[ií]gio|queixa|den[uú]ncia|pol[ií]cia|contrato|renda|despedimento|licen[çc]a|multa|penal|arbitragem)\b/i],
    userMessage: 'Assuntos legais têm consequências com prazo e forma: nenhuma carta substitui aconselhamento jurídico. Se há um prazo a correr, trata do prazo primeiro.',
    action: 'Marca consulta com um advogado (ou recorre ao apoio judiciário da Segurança Social: 217 217 227) antes de decidir com base nesta leitura.',
    resources: [{ label: 'Acesso ao direito / apoio judiciário ( Segurança Social)', value: 'https://www.gov.pt/entidades/seguranca-social', kind: 'site' }],
    modelInstruction:
      'Tema jurídico. Não prever resultados de tribunal, não aconselhar estratégia processual, não avaliar culpa. Limita-te ao que é simbólico (medo, exposição, autoridade) e indica consulta jurídica.',
  },
  {
    category: 'finance',
    severity: 'medio',
    patterns: [/\b(d[ií]vida|cr[eé]dito|impag[aá]vel|penhora|falar com o banco|fal[eê]ncia|investir|bolsa|cripto|juros|or[çc]amento apertado|ficar sem dinheiro)\b/i],
    userMessage: 'Dinheiro é aritmética e prazo, não pressentimento. Esta leitura pode ajudar-te a ver a relação que tens com o risco; não decide por ti.',
    action: 'Antes de qualquer decisão de crédito ou investimento, escreve os números e confirma com um técnico oficial de contas ou com o Apoio ao Cliente do banco; em situação de endividamento, a Linha do Endividamento (800 234 234) é gratuita.',
    resources: [{ label: 'Linha do Endividamento', value: '800 234 234', kind: 'telefone' }],
    modelInstruction:
      'Tema financeiro. Proibido recomendar aplicações, timings de mercado, montantes ou operações de crédito. Enquadra como comportamento de risco e literacia, e remete para apoio profissional.',
  },
  {
    category: 'addiction',
    severity: 'alto',
    patterns: [/\b(v[íi]cio|beb| [=]alco[oó]l|droga[s]|coca[ií]na|jogo compulsivo|apostas|pornografia|n[aã]o consigo parar)\b/i],
    userMessage: 'Dependência é doença tratável, não falha moral nem sinal de carta. O que as cartas podem mostrar é o que está por baixo do comportamento.',
    action: 'Fala com o teu médico de família ou com a Linha Vida Sem Drogas (1414); para álcool e jogo existem grupos de apoio locais em quase todas as regiões.',
    resources: [
      { label: 'Linha Vida Sem Drogas (SICAD)', value: '1414', kind: 'telefone' },
      { label: 'SOS Jogo', value: '213 957 110', kind: 'telefone' },
    ],
    modelInstruction:
      'Tema de dependência. Nunca Interpretes a carta como justificação para o comportamento nem como "sinal de que deve parar". Descreve gatilhos emocionais, reforça tratamento profissional, não moralizes.',
  },
  {
    category: 'relationship-violence',
    severity: 'critico',
    patterns: [/\b(bate|bateu|agress|viol[eê]ncia|amea[çc]a|controla tudo|n[aã]o me deixa ver|isolad|stalking|persegue-me)\b/i],
    userMessage:
      'Se há violência ou controlo numa relação, isso não é um ciclo cármico nem uma lição: é risco, e há ajuda específica. A tua segurança vem antes de qualquer leitura.',
    action: 'Contacta a Linha Nacional de Emergência Social (112 em emergência; 144 para apoio social) ou a APAV (116 006), que acompanham de forma confidencial e gratuita.',
    resources: [
      { label: 'Emergência', value: '112', kind: 'telefone' },
      { label: 'APAV (vítimas de crime)', value: '116 006', kind: 'telefone' },
      { label: 'Linha Nacional de Emergência Social', value: '144', kind: 'telefone' },
    ],
    modelInstruction:
      'Possível situação de violência. Não sugerir "trabalhar a relação", "dar tempo" ou leituras de karma/espelhos. Nomear o risco, validar, remeter para APAV/112 e para uma rede de apoio concreta. Não escrever nada que possa ser usado contra a pessoa.',
  },
  {
    category: 'grief',
    severity: 'medio',
    patterns: [/\b(morreu|faleciment|luto|perda de um filh|enterrar|columb[aá]rio|vel[oó]rio)\b/i],
    userMessage: 'Luto não se prevê, acompanha-se. Se aparecer aqui alguma imagem de quem partiu, lê-la como memória e linguagem tua, não como mensagem do outro lado.',
    action: 'Dá-te prazo sem avaliação (o primeiro ano é o primeiro ano) e, se o peso não estiver a aliviar, pede apoio psicológico — é tratável e comum.',
    modelInstruction:
      'Tema de luto. Proibido afirmar comunicação com pessoas falecidas, prever "sinais", ou sugerir que a morte teve sentido/lição. Escrever com sobriedade e sem consolação forçada.',
  },
  {
    category: 'minors',
    severity: 'alto',
    patterns: [/\b(meu filh|minha filh|crian[çc]a|menor de idade|beb[eé]|gravid|vou ter um beb|guarda partilhada|escola domeu filho)\b/i],
    userMessage: 'Não se leem cartas sobre crianças nem sobre decisões que as afetam: elas não podem consentir nem decidir. O que pode ser lido é a tua posição como adulto.',
    action: 'Para saúde, escola ou responsabilidades parentais, fala com pediatra, médico de família ou escola; em caso de risco para a criança, Comissão de Proteção de Crianças e Jovens (CPCJ) da tua área ou 112.',
    resources: [
      { label: 'SNS 24 (saúde infantil)', value: '808 24 24 24', kind: 'telefone' },
      { label: '112 (risco imediato)', value: '112', kind: 'telefone' },
    ],
    modelInstruction:
      'Envolving menores. Não interpretar em nome da criança, não prever futuro, saúde ou comportamento de menores. Reenquadrar para a responsabilidade e o comportamento do adulto que pergunta.',
  },
]

/** Deteta temas sensíveis a partir de texto livre (pergunta, contexto, notas). */
export function safetyFor(text: string): SafetyFlag[] {
  if (!text?.trim()) return []
  const haystack = text.replace(/\s+/g, ' ')
  const flags: SafetyFlag[] = []
  for (const rule of RULES) {
    const matched = rule.patterns.some((re) => re.test(haystack))
    if (!matched) continue
    flags.push({
      category: rule.category,
      severity: rule.severity,
      userMessage: rule.userMessage,
      action: rule.action,
      resources: rule.resources,
      modelInstruction: rule.modelInstruction,
    })
  }
  const order = { critico: 0, alto: 1, medio: 2 } as const
  return flags.sort((a, b) => order[a.severity] - order[b.severity])
}

export function isBlocking(flags: SafetyFlag[]): boolean {
  return flags.some((f) => f.severity === 'critico')
}

/** Instruções a injetar no prompt do modelo, sem duplicar regras. */
export function modelDirectives(flags: SafetyFlag[]): string[] {
  return flags.map((f) => f.modelInstruction)
}

/** Texto de rodapé para as páginas de leitura (sem alarmismo, sem juridiquês). */
export const STANDING_NOTICE =
  'O ARCANA é uma ferramenta de reflexão simbólica. Não fornece diagnóstico médico, psicológico, jurídico ou financeiro, nem prevê acontecimentos. As leituras descrevem configurações de sentido, não factos sobre pessoas concretas.'
