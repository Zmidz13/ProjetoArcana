import type { SpreadDraft } from './types.ts'

/** Tiragens 1–10: rápidas, de uma carta. */
export const RAPID_SPREADS: SpreadDraft[] = [
  {
    id: 'card-of-the-day',
    name: 'Carta do Dia',
    category: 'rapida',
    shape: 'row',
    layout: { cy: 0.46 },
    summary: 'Uma carta para orientar as próximas horas: tom, atenção e um gesto concreto.',
    purpose:
      'Define a qualidade simbólica do dia e o ponto cego mais provável. É a tiragem de manutenção: curta, repetível e comparável ao longo do tempo, o que permite observar padrões que tiragens longas escondem.',
    whenToUse: 'De manhã, antes de abrir o calendário; também quando o dia já correu mal e queres reler o que passou.',
    positions: [
      {
        label: 'O dia em uma palavra',
        description:
          'O clima simbólico e o foco de atenção recomendado; inclui o que tende a passar-se despercebido.',
      },
    ],
    tags: ['diária', 'curta', 'rotina'],
    estimatedMinutes: 3,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    author: 'arcana',
    themes: [
      { theme: 'orientação', weight: 0.9 },
      { theme: 'rotina', weight: 0.6 },
    ],
  },
  {
    id: 'card-of-the-night',
    name: 'Carta da Noite',
    category: 'rapida',
    shape: 'row',
    layout: { cy: 0.5 },
    summary: 'Uma carta para fechar o dia: o que ficou por resolver e o que soltar antes de dormir.',
    purpose:
      'Serve para metabolizar o dia, em vez de o acumular. Trabalha a última hora antes do sono e alimenta o registo de sonho, que é onde esta tiragem costuma trazer confirmação.',
    whenToUse: 'À noite, de preferência com o diário de Tarot aberto.',
    positions: [
      {
        label: 'O que o dia deixou',
        description: 'O resto emocional real, separado do ruído e do cansaço.',
      },
    ],
    tags: ['diária', 'sono', 'revisão'],
    estimatedMinutes: 3,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    themes: [
      { theme: 'emoções', weight: 0.85 },
      { theme: 'descanso', weight: 0.6 },
    ],
  },
  {
    id: 'immediate-advice',
    name: 'Conselho Imediato',
    category: 'rapida',
    shape: 'row',
    summary: 'Resposta operacional para uma decisão pequena que não pode esperar.',
    purpose:
      'Quando a pergunta é "o que faço agora", uma carta longa é ruído. Esta tiragem força a abstracção a descer até uma acção executável nas próximas horas.',
    whenToUse: 'Antes de responder a uma mensagem, entrar numa reunião ou decidir um sim/não simples.',
    positions: [
      {
        label: 'O próximo gesto',
        description: 'A acção mais pequena e mais eficaz disponível nas próximas horas.',
      },
    ],
    tags: ['prática', 'decisão'],
    estimatedMinutes: 2,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    themes: [
      { theme: 'acção', weight: 0.9 },
      { theme: 'decisão', weight: 0.7 },
    ],
  },
  {
    id: 'current-energy',
    name: 'Energia Atual',
    category: 'rapida',
    shape: 'row',
    summary: 'Diagnóstico do estado presente, incluindo o que está a gastar energia sem retorno.',
    purpose:
      'Mede o teu estado, não os factos. Útil para escolher o que adiar: a carta mostra a qualidade da energia disponível e onde ela está a evaporar-se.',
    whenToUse: 'Quando não sabes se é dia de avançar ou de recuar para respirar.',
    positions: [
      {
        label: 'Corrente principal',
        description: 'O que te move hoje, com ou sem consentimento.',
      },
    ],
    tags: ['diagnóstico', 'energia'],
    estimatedMinutes: 3,
    cinematic: 'medio',
    difficulty: 'iniciante',
    themes: [{ theme: 'autoconsciência', weight: 0.8 }],
  },
  {
    id: 'yes-no',
    name: 'Sim ou Não Interpretativo',
    category: 'rapida',
    shape: 'row',
    summary: 'Uma orientação binária lida como tendência, com as condições que a sustentam.',
    purpose:
      'Para perguntas fechadas. A carta não é um oráculo: o motor lê força, orientação e elemento, e devolve uma tendência com grau de confiança e as condições que a alteram.',
    whenToUse: 'Decisões pequenas e reversíveis. Nunca para substituir aconselhamento profissional.',
    positions: [
      {
        label: 'Tendência',
        description:
          'Sentido provável (sim / não / ainda não), acompanhado do que o sustenta e do que o pode inverter.',
      },
    ],
    tags: ['binária', 'rapida'],
    estimatedMinutes: 2,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    themes: [{ theme: 'decisão', weight: 0.95 }],
  },
  {
    id: 'message-of-the-universe',
    name: 'Mensagem do Universo',
    category: 'rapida',
    shape: 'row',
    summary: 'A imagem simbólica que melhor resume o momento — formulada como metáfora, não como instrução.',
    purpose:
      'Serve para reler o contexto quando há demasiados detalhes. A interpretação trata a carta como metáfora acionável, com indicação explícita de que o sentido é construído por ti.',
    whenToUse: 'Quando sentes que há um padrão e não o consegues nomear.',
    positions: [
      {
        label: 'A imagem',
        description: 'O símbolo dominante do período e a forma mais honesta de o ler.',
      },
    ],
    tags: ['simbólica', 'aberta'],
    estimatedMinutes: 4,
    cinematic: 'alto',
    difficulty: 'iniciante',
    themes: [{ theme: 'sentido', weight: 0.75 }],
  },
  {
    id: 'what-i-need-to-know',
    name: 'O Que Preciso de Saber',
    category: 'rapida',
    shape: 'row',
    summary: 'O ângulo cego: aquilo que está a acontecer e ainda não entrou na tua descrição da situação.',
    purpose:
      'Não descreve o que sabes: descreve o que evitas. A carta é lida contra a pergunta formulada, de modo a destacar o que a formulação deixou de fora.',
    whenToUse: 'Depois de uma conversa que correu estranhamente, ou quando "não há problema" é resposta.',
    positions: [
      {
        label: 'O que está fora do quadro',
        description: 'O dado relevante que a tua leitura actual da situação não inclui.',
      },
    ],
    tags: ['sombra', 'insight'],
    estimatedMinutes: 4,
    cinematic: 'alto',
    difficulty: 'iniciante',
    themes: [
      { theme: 'autoconhecimento', weight: 0.9 },
      { theme: 'conflito', weight: 0.5 },
    ],
  },
  {
    id: 'obstacle-of-the-moment',
    name: 'Obstáculo do Momento',
    category: 'rapida',
    shape: 'row',
    summary: 'Identifica o atrito principal — e distingue o que é externo do que és tu a criar.',
    purpose:
      'Um obstáculo nomeado deixa de ser clima. A carta é lida em duas camadas: a resistência real do contexto e a parte que depende de ti, com um contra-gesto possível.',
    whenToUse: 'Quando um projeto está parado sem razão aparente.',
    positions: [
      {
        label: 'O atrito',
        description: 'A força que trava e o seu ponto de aplicação.',
      },
    ],
    tags: ['obstáculo', 'desbloqueio'],
    estimatedMinutes: 3,
    cinematic: 'medio',
    difficulty: 'iniciante',
    themes: [{ theme: 'bloqueio', weight: 0.9 }],
  },
  {
    id: 'next-step',
    name: 'Próximo Passo',
    category: 'rapida',
    shape: 'row',
    summary: 'Uma instrução prática, curta e testável, sobre o que fazer a seguir.',
    purpose:
      'Converte leitura em agenda. O motor extrai da carta o conselho prático da base de dados e acrescenta a condição de falha — o que teria de acontecer para este passo deixar de ser o correcto.',
    whenToUse: 'Entre duas tarefas, dois emails ou dois caminhos.',
    positions: [
      {
        label: 'O passo seguinte',
        description: 'A acção recomendada, o prazo razoável e o sinal de que está a resultar.',
      },
    ],
    tags: ['acção', 'produtividade'],
    estimatedMinutes: 2,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    themes: [{ theme: 'acção', weight: 0.95 }],
  },
  {
    id: 'spiritual-guidance',
    name: 'Orientação Espiritual',
    category: 'rapida',
    shape: 'row',
    summary: 'Que prática interior sustenta este período — e o que a torna possível.',
    purpose:
      'Não responde a "o que vai acontecer": responde a "com que disposição devo estar". Lê a carta como indicação de prática (silêncio, serviço, estudo, desapego) e do obstáculo específico a essa prática.',
    whenToUse: 'Em retiros, períodos de luto, transições ou quando a pergunta é de sentido.',
    positions: [
      {
        label: 'A prática',
        description: 'A postura interior recomendada e o que a costuma interromper.',
      },
    ],
    tags: ['espiritualidade', 'prática'],
    estimatedMinutes: 4,
    cinematic: 'ritual',
    difficulty: 'iniciante',
    themes: [
      { theme: 'espiritualidade', weight: 0.95 },
      { theme: 'sentido', weight: 0.6 },
    ],
  },
]

/** Tiragens 11–20: três cartas. */
export const THREE_SPREADS: SpreadDraft[] = [
  {
    id: 'past-present-future',
    name: 'Passado, Presente e Futuro',
    category: 'tres',
    shape: 'row',
    separate: true,
    summary: 'A sequência clássica: a raiz do assunto, o estado actual e a trajectória se nada mudar.',
    purpose:
      'Serve para entender continuidade. A leitura correcta compara as três posições: o que se transporta do passado, o que é novo no presente e o que é simples projecção no futuro.',
    whenToUse: 'Qualquer assunto com história — trabalho, relação, decisão em curso.',
    positions: [
      {
        label: 'Passado',
        description: 'O que originou a situação e ainda está ativo por baixo dela.',
        group: 'tempo',
      },
      {
        label: 'Presente',
        description: 'O facto de hoje, nu: o que está a acontecer mesmo.',
        group: 'tempo',
      },
      {
        label: 'Futuro provável',
        description: 'A trajectória mais provável se mantiveres o comportamento actual.',
        group: 'tempo',
      },
    ],
    structure: {
      kind: 'temporal',
      blocks: [
        { id: 'antes', label: 'Antes', positions: [0] },
        { id: 'agora', label: 'Agora', positions: [1] },
        { id: 'depois', label: 'Depois', positions: [2] },
      ],
    },
    tags: ['clássica', 'temporal'],
    estimatedMinutes: 8,
    cinematic: 'medio',
    difficulty: 'iniciante',
    author: 'tradicional',
    themes: [
      { theme: 'decisão', weight: 0.6 },
      { theme: 'trabalho', weight: 0.5 },
      { theme: 'amor', weight: 0.5 },
    ],
  },
  {
    id: 'mind-body-spirit',
    name: 'Mente, Corpo e Espírito',
    category: 'tres',
    shape: 'column',
    layout: { cx: 0.5, cy: 0.5, gap: 0.19 },
    summary: 'Três instâncias do mesmo conflito: o que pensas, o que o corpo já sabe, o que queres.',
    purpose:
      'Localiza a discordância interna. A leitura útil desta tiragem é a comparação: se as três cartas forem incompatíveis, o problema é de coerência, não de circunstância.',
    whenToUse: 'Stress, exaustão, decisões em que "a cabeça diz uma coisa".',
    positions: [
      { label: 'Mente', description: 'A narrativa racional e os argumentos que usas para sustentar a posição.', group: 'instância' },
      { label: 'Corpo', description: 'O que a energia, o sono e a saúde já revelaram antes de tu admitires.', group: 'instância' },
      { label: 'Espírito', description: 'O que consideras valioso o suficiente para pagar o preço.', group: 'instância' },
    ],
    structure: {
      kind: 'elemental',
      blocks: [
        { id: 'mente', label: 'Pensamento', positions: [0] },
        { id: 'corpo', label: 'Corpo', positions: [1] },
        { id: 'espirito', label: 'Espírito', positions: [2] },
      ],
    },
    tags: ['bem-estar', 'coerência'],
    estimatedMinutes: 8,
    cinematic: 'medio',
    difficulty: 'iniciante',
    themes: [
      { theme: 'saúde', weight: 0.6 },
      { theme: 'autoconhecimento', weight: 0.8 },
    ],
  },
  {
    id: 'situation-obstacle-advice',
    name: 'Situação, Obstáculo e Conselho',
    category: 'tres',
    shape: 'row',
    separate: true,
    summary: 'A tiragem mais útil para problemas concretos: o facto, o travão e o que fazer com ambos.',
    purpose:
      'Separa realidade de resistência. A terceira posição é a única acionável: o motor lê o conselho em função do obstáculo descrito pela segunda carta, não em abstrato.',
    whenToUse: 'Projeto parado, negociação difícil, conflito específico.',
    positions: [
      { label: 'Situação', description: 'O estado real do assunto, sem avaliação.', group: 'análise' },
      { label: 'Obstáculo', description: 'O que impede o avanço — e se é externo ou teu.', group: 'análise' },
      { label: 'Conselho', description: 'A resposta proporcional ao obstáculo identificado.', group: 'análise' },
    ],
    structure: {
      kind: 'linear',
      blocks: [
        { id: 'facto', label: 'O facto', positions: [0] },
        { id: 'atrito', label: 'O atrito', positions: [1] },
        { id: 'resposta', label: 'A resposta', positions: [2] },
      ],
    },
    tags: ['prática', 'resolução'],
    estimatedMinutes: 9,
    cinematic: 'medio',
    difficulty: 'iniciante',
    themes: [
      { theme: 'trabalho', weight: 0.7 },
      { theme: 'decisão', weight: 0.7 },
    ],
  },
  {
    id: 'thought-emotion-action',
    name: 'Pensamento, Emoção e Ação',
    category: 'tres',
    shape: 'row',
    summary: 'O circuito interno completo: o que pensas, o que sentes e o que fazes com isso.',
    purpose:
      'Mostra onde o circuito quebra. Pensamento e emoção desalinhados produzem ação errática; a leitura desta tiragem procura exactamente o ponto de rutura.',
    whenToUse: 'Comportamentos repetitivos, reacções desproporcionadas, auto-sabotagem.',
    positions: [
      { label: 'Pensamento', description: 'A tese que sustentas sobre a situação.', group: 'circuito' },
      { label: 'Emoção', description: 'O afecto real, muitas vezes diferente do declarado.', group: 'circuito' },
      { label: 'Ação', description: 'O que fazes de facto com os dois anteriores.', group: 'circuito' },
    ],
    structure: {
      kind: 'linear',
      blocks: [
        { id: 'pensar', label: 'Pensar', positions: [0] },
        { id: 'sentir', label: 'Sentir', positions: [1] },
        { id: 'fazer', label: 'Fazer', positions: [2] },
      ],
    },
    tags: ['psicologia', 'padrões'],
    estimatedMinutes: 8,
    cinematic: 'medio',
    difficulty: 'intermedio',
    themes: [
      { theme: 'autoconhecimento', weight: 0.9 },
      { theme: 'emoções', weight: 0.7 },
    ],
  },
  {
    id: 'problem-cause-solution',
    name: 'Problema, Causa e Solução',
    category: 'tres',
    shape: 'row',
    summary: 'Distingue o sintoma da raiz e aponta a alavanca com melhor retorno.',
    purpose:
      'A primeira carta é o que doí; a segunda é o que o produz; a terceira é o ponto em que uma mudança pequena move tudo. É a tiragem técnica por excelência.',
    whenToUse: 'Problemas recorrentes, conflitos que voltam com pessoas diferentes.',
    positions: [
      { label: 'Problema (sintoma)', description: 'A forma como o assunto aparece à superfície.', group: 'diagnóstico' },
      { label: 'Causa', description: 'A origem mantida por ti, pelo sistema ou pelo contexto.', group: 'diagnóstico' },
      { label: 'Solução', description: 'A alavanca desproporcionadamente eficaz.', group: 'diagnóstico' },
    ],
    tags: ['análise', 'resolução'],
    estimatedMinutes: 9,
    cinematic: 'medio',
    difficulty: 'intermedio',
    themes: [{ theme: 'resolução', weight: 0.9 }],
  },
  {
    id: 'me-other-relationship',
    name: 'Eu, Outro e Relação',
    category: 'tres',
    shape: 'mirror',
    layout: { cx: 0.5, cy: 0.5, gap: 0.18, rowGap: 0.3 },
    summary: 'As duas posições individuais e o campo que nasce entre elas.',
    purpose:
      'Evita a leitura moralista de "quem tem razão". A terceira carta pertence ao sistema: descreve o que a relação produz que nenhum dos dois produz sozinho.',
    whenToUse: 'Conflito com pessoa específica: parceiro, sócio, familiar, chefe.',
    positions: [
      { label: 'Eu', description: 'A tua posição real no assunto, incluíndo o que não dizes.', group: 'eu' },
      { label: 'O outro', description: 'O que a outra pessoa sustenta, teme ou deseja nisto.', group: 'outro' },
      { label: 'O entre-nós', description: 'O campo criado pelos dois: aliança, rutura ou negociação.', group: 'campo' },
    ],
    structure: {
      kind: 'paired',
      blocks: [
        { id: 'posicoes', label: 'Posições individuais', positions: [0, 1] },
        { id: 'campo', label: 'O campo', positions: [2] },
      ],
    },
    tags: ['relação', 'conflito'],
    estimatedMinutes: 10,
    cinematic: 'alto',
    difficulty: 'intermedio',
    themes: [
      { theme: 'amor', weight: 0.7 },
      { theme: 'relações', weight: 0.9 },
    ],
  },
  {
    id: 'release-accept-grow',
    name: 'O Que Deixar, Aceitar e Desenvolver',
    category: 'tres',
    shape: 'row',
    summary: 'Tiragem de triagem: três decisões sobre o mesmo território de vida.',
    purpose:
      'Reduz ambiguidade prática: o que já não deve ser carregado, o que deve ser acolhido sem gasto de energia, e o que merece investimento imediato.',
    whenToUse: 'Transições de fase, fim de ano, mudança de casa, reorganização de prioridades.',
    positions: [
      { label: 'Deixar', description: 'O que já não tem função e consome manutenção.', group: 'triagem' },
      { label: 'Aceitar', description: 'O dado imutável cujo custo é maior fingir que não existe.', group: 'triagem' },
      { label: 'Desenvolver', description: 'O germe que rende desproporcionadamente com atenção.', group: 'triagem' },
    ],
    tags: ['transição', 'prioridades'],
    estimatedMinutes: 8,
    cinematic: 'medio',
    difficulty: 'iniciante',
    themes: [{ theme: 'mudança', weight: 0.85 }],
  },
  {
    id: 'opportunity-risk-path',
    name: 'Oportunidade, Risco e Caminho',
    category: 'tres',
    shape: 'triangle',
    layout: { rows: 2, cy: 0.5 },
    summary: 'Pesagem honesta de uma decisão: o que ganha, o que arrisca, como avançar em segurança.',
    purpose:
      'Pensada para não ser enviesada para o optimismo: a posição do risco é lida com o mesmo detalhe que a oportunidade, e a terceira carta é operacional (termos, prazos, salvaguardas).',
    whenToUse: 'Oferta de emprego, investimento, mudança de cidade, abrir negócio.',
    positions: [
      { label: 'Oportunidade', description: 'O ganho realista e a sua janela temporal.', group: 'pesagem' },
      { label: 'Risco', description: 'O que pode correr mal, com probabilidade e consequência.', group: 'pesagem' },
      { label: 'Caminho', description: 'A sequência de passos que reduz o risco sem anular a oportunidade.', group: 'pesagem' },
    ],
    structure: {
      kind: 'paired',
      blocks: [
        { id: 'pesagem', label: 'Pesagem', positions: [0, 1] },
        { id: 'caminho', label: 'Caminho', positions: [2] },
      ],
    },
    tags: ['decisão', 'risco'],
    estimatedMinutes: 10,
    cinematic: 'alto',
    difficulty: 'intermedio',
    themes: [
      { theme: 'decisão', weight: 0.95 },
      { theme: 'finanças', weight: 0.5 },
    ],
  },
  {
    id: 'yesterday-today-tomorrow',
    name: 'Ontem, Hoje e Amanhã',
    category: 'tres',
    shape: 'row',
    separate: true,
    summary: 'Versão de 24 horas da tiragem temporal, para assuntos em velocidade.',
    purpose:
      'Focada na reacção imediata: o que aconteceu, o que ainda é negociável hoje e o que se torna consequência amanhã. Útil quando o assunto tem prazo.',
    whenToUse: 'Depois de uma conversa difícil, antes de uma reunião, durante um conflito activo.',
    positions: [
      { label: 'Ontem', description: 'O que já está fixado e não se reescreve.', group: 'curto-prazo' },
      { label: 'Hoje', description: 'O que ainda podes mudar nas próximas horas.', group: 'curto-prazo' },
      { label: 'Amanhã', description: 'O efeito mais provável da escolha de hoje.', group: 'curto-prazo' },
    ],
    tags: ['curto prazo', 'urgência'],
    estimatedMinutes: 6,
    cinematic: 'baixo',
    difficulty: 'iniciante',
    themes: [{ theme: 'decisão', weight: 0.7 }],
  },
  {
    id: 'desire-fear-reality',
    name: 'Desejo, Medo e Realidade',
    category: 'tres',
    shape: 'triangle',
    layout: { rows: 2 },
    summary: 'As três forças que decidem sobre isto — e a distância entre elas.',
    purpose:
      'A tiragem preferida do motor para leituras psicológicas: mede a divergência entre o que queres, o que te assusta e o que os factos sustentam. Combinações entre a 1.ª e a 2.ª carta costumam ser as mais informativas.',
    whenToUse: 'Quando há atração e receio em relação à mesma coisa.',
    positions: [
      { label: 'Desejo', description: 'O que queres, formulado sem justificação.', group: 'forças' },
      { label: 'Medo', description: 'O cenário que evitas e o que ele protege.', group: 'forças' },
      { label: 'Realidade', description: 'O que é verificável, independentemente dos dois anteriores.', group: 'forças' },
    ],
    structure: {
      kind: 'paired',
      blocks: [
        { id: 'internos', label: 'Forças internas', positions: [0, 1] },
        { id: 'factos', label: 'Factos', positions: [2] },
      ],
    },
    tags: ['psicologia', 'conflito interno'],
    estimatedMinutes: 10,
    cinematic: 'alto',
    difficulty: 'intermedio',
    themes: [
      { theme: 'autoconhecimento', weight: 0.9 },
      { theme: 'medo', weight: 0.7 },
    ],
  },
]
