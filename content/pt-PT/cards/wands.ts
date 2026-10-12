import type { CardSource } from '../../../src/domain/types.ts'

/**
 * Naipe de Paus — elemento Fogo, sephirah Chokmah como raiz, função de vontade e empresa.
 * Cada carta é numerologicamente modulada (Ás=semente … 10=resultado) e lida a partir da
 * iconografia do Rider-Waite-Smith, com referência às variantes de Marselha.
 */
export const WANDS: CardSource[] = [
  {
    id: 'minor-wands-01',
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    rank: 'ace',
    name: { pt: 'Ás de Paus', intl: 'Ace of Wands' },
    archetype: 'A faísca / ideia com energia',
    element: 'fire',
    astro: 'Raiz dos Poderes do Fogo',
    gdTitle: '—',
    traditionNote: 'Nas baralhas latinhas o Ás é uma vara simples; Waite acrescentou-lhe cinco rebentos, leitura de multiplicação a partir do gesto.',
    keywords: {
      upright: ['início de energia', 'inspiração prática', 'coragem de começar', 'desejo de construir', 'convite'],
      reversed: ['ignição falhada', 'energia bloqueada', 'entusiasmo sem direção', 'atraso no arranque'],
    },
    history:
      'O Ás de paus é, na série italiana, o pau de comando reduzido ao mínimo: uma vara com raiz. Waite transformou-o em ramo com cinco rebentos, recebido de uma mão que sai de nuvem, com montanha e casa ao fundo — condensando a ideia de um princípio que já contém o crescimento.',
    meanings: {
      upright:
        'Chegou-te uma ideia com vida própria. O Ás de Paus anuncia o ponto em que a vontade encontra meio de se exercer: convite, projecto, ferramenta ou pessoas disponíveis. Não é ainda resultado — é potência com prazo.',
      reversed:
        'A faísca falha por falta de combustível ou por excesso de ideias simultâneas. Descreve arranque adiado, projecto aprovado mas sem meios, e entusiasmo que se gasta em discussão em vez de execução.',
    },
    psychology:
      'É o impulso libidinal no sentido amplo: energia psíquica disponível antes de ser orientada. Em boa condição gera curiosidade e iniciativa; em sombra produz dispersão e a sensação de estar sempre a começar.',
    emotional: 'Animacao, desejo, impaciência criativa; em inversão, irritação por travão externo.',
    love: 'Atração imediata e vontade de avançar; bom presságio para declarar interesse. Invertido, desejo sem investimento ou conquista que se apaga em dias.',
    career: 'Projecto novo, promoção com mais autonomia, start, ideia aprovada para protótipo. Pede definição de escopo já, sob pena de a energia se diluir.',
    finances: 'Recurso súbito disponível (extra, reembolso, bónus). Não é fase de gastar em impulso: é fase de capitalizar.',
    growth: 'Agir antes da confiança completa: a motivação costuma vir depois dos primeiros cinco minutos.',
    spirituality: 'O fogo criador — vontade alinhada com intenção. A prática é aconsagração do trabalho ao que se quer que cresça.',
    obstacles: 'Vontades paralelas a competir pelo mesmo tempo.',
    opportunities: 'Um convite concreto que abre a porta ao projecto principal.',
    advice: [
      'Escolhe a única ideia a que este Ás corresponde e descarta as outras por escrito.',
      'Reserva quatro horas esta semana só para a primeira versão.',
      'Pede já os recursos: energia sem meios perde-se.',
    ],
    reflection: [
      'Que ideia me tira o sono — e porque ainda não comecei?',
      'Estou a recusar um convite por prudência ou por cansaço?',
      'O que precisa este projecto para ter combustível?',
    ],
    relations: [
      { card: 'major-01-magician', kind: 'reforca', note: 'Ferramenta e faísca: combinação de arranque com resultado.' },
      { card: 'minor-wands-05', kind: 'sombra', note: 'O conflito que testará se a intenção é suficientemente forte.' },
    ],
    art: {
      scene: 'hand-offering-budded-wand',
      sky: 'dawn',
      terrain: 'mountain',
      glyphs: ['hand-offering', 'wand-bud', 'mountain-peak', 'gate', 'path-crossroads'],
      palette: ['#C6A66B', '#4A1F39', '#EFE6D6'],
      motifs: ['mão que sai de nuvem', 'ramo com cinco rebentos', 'montanha ao fundo', 'casa pequena no sopé'],
      reading: [
        'A vara tem raiz: é o que pode ser plantado, não apenas usado.',
        'Os cinco rebentos indicam que a ideia já vem com multiplicação embutida.',
        'A casa ao fundo mostra destino concreto: a energia vai para casa, não para o vento.',
      ],
    },
    a11y: {
      alt: 'Carta Ás de Paus: mão que sai de uma nuvem oferecendo um ramo verde com cinco rebentos, com montanha e casa ao fundo.',
      long:
        'Composição vertical com nuvem no centro e mão a segurar um ramo fino com cinco gomos de folha. Fundo de montanha azulada e pequena construção ao sopé. Moldura dourada com o título e o numeral de ás.',
    },
    sources: ['Waite – Pictorial Key', 'Tarocchino di Bologna (pao con radice)'],
  },
  {
    id: 'minor-wands-02',
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    rank: '2',
    name: { pt: 'Dois de Paus', intl: 'Two of Wands' },
    archetype: 'O planador / o mundo à vista',
    element: 'fire',
    astro: 'Marte em Carneiro',
    gdTitle: 'Dominion',
    traditionNote: 'Chokmah em formação, "domínio" na Golden Dawn: planear a partir da posição conquistada.',
    keywords: {
      upright: ['plano estratégico', 'escolha de horizonte', 'preparação de partida', 'poder deliberado'],
      reversed: ['indecisão sobre o futuro', 'medo de sair', 'controlo excessivo', 'plano sem execução'],
    },
    history:
      'Waite mostra um homem de castelo amuralhado que segura um globo e olha para o mar, com um segundo pau encostado à parede: a imagem clássica de quem tem território e escolhe entre ficar e ir. Marselha reduz a carta a duas varas cruzadas sem cena, o que sugere leitura de oposição simples.',
    meanings: {
      upright:
        'Tens posição e ainda assim queres mais. O Dois de Paus descreve o momento em que se mede o alcance a partir do que já se conquistou e se escolhe um horizonte, não todas as possibilidades. Favorável a planear viagem, expansão ou mudança com data.',
      reversed:
        'O globo fica na mão e ninguém parte. Indica planeamento perpetuado, medo de perder o que já se tem, ou imposição de plano a quem não foi consultado.',
    },
    psychology:
      'É a função de projecto: capacidade de representar o futuro e suportar a perda do presente actual. Em sombra, torna-se defesa — sonhar o futuro para não viver o presente.',
    emotional: 'Ambição calma, curiosidade contida, ligeira saudade antecipada.',
    love: 'Decidir o tipo de relação que se quer, discutir mudança de cidade ou projecto comum. Invertido: um dos dois já decidiu e o outro ainda não sabe.',
    career: 'Fase de plano de expansão, orçamento de projecto, escolha entre duas propostas ou mercados. Não é altura de executar tudo: é de escolher um.',
    finances: 'Boa fase para simular cenários a três anos e fixar metas; evita investir em duas direções em simultâneo.',
    growth: 'Aprender a escolher renunciando: qualquer plano é uma lista de renúncias assumidas.',
    spirituality: 'O globo nas mãos lembra que o mundo é recurso de passagem, não posse.',
    obstacles: 'Confundir possibilidade com decisão.',
    opportunities: 'Uma parceria ou autorização que torna o plano executável.',
    advice: [
      'Escreve os dois únicos cenários possíveis e escolhe um prazo de decisão.',
      'Visita o lugar — físico ou simbólico — antes de decidir: ver substitui imaginar.',
      'Consulta quem ficará a cuidar do que hoje está construído.',
    ],
    reflection: [
      'Que futuro estou a adiar por medo de largar o presente?',
      'Se tivesse de escolher só um horizonte, qual seria?',
      'Estou a planear para avançar ou para não decidir?',
    ],
    relations: [
      { card: 'major-00-fool', kind: 'continuidade', note: 'O planador é quem vai saltar com mapa na mão.' },
      { card: 'minor-wands-06', kind: 'reforca', note: 'Plano e avanço público: expansão com resultado visível.' },
    ],
    art: {
      scene: 'figure-with-globe-on-battlement',
      sky: 'dusk',
      terrain: 'cliff',
      glyphs: ['globe', 'wand-bud', 'wall-stone', 'ship', 'tower-intact'],
      palette: ['#4A1F39', '#C6A66B', '#56C5BD'],
      motifs: ['homem com globo', 'muralha ameada', 'dois paus, um encostado', 'barcos ao fundo', 'mar aberto'],
      reading: [
        'Um pau está seguro, outro encostado: a escolha ainda está na parede.',
        'O globo é pequeno o suficiente para a mão: o mundo cabe no plano.',
        'O mar com barcos indica que o fora já está em movimento sem ti.',
      ],
    },
    a11y: {
      alt: 'Carta Dois de Paus: figura num terraço amuralhado segurando um globo pequeno, com um pau na mão e outro encostado ao muro, olhando para o mar onde navegam barcos.',
      long:
        'Terraço de pedra com ameias. Centro: figura de pé, manto escuro, globo com continentes visíveis na mão direita, pau de madeira no ombro esquerdo; outro pau apoiado na muralha. Fundo de costa, mar e dois barcos com velas. Moldura com o numeral II de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mars em Capricórnio, "Dominion"'],
  },
  {
    id: 'minor-wands-03',
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    rank: '3',
    name: { pt: 'Três de Paus', intl: 'Three of Wands' },
    archetype: 'Expansão com retorno / primeiro fruto',
    element: 'fire',
    astro: 'Sol em Carneiro',
    gdTitle: 'Virtue',
    traditionNote: 'Binah em expansão; na Golden Dawn chama-se "virtude" — o trabalho que já regressa com lucro simbólico.',
    keywords: {
      upright: ['expansão', 'primeiros resultados', 'parceria de alcance', 'espera ativa', 'visibilidade'],
      reversed: ['atraso no retorno', 'fronteira fechada', 'sobre-confiança', 'projecto bloqueado à saída'],
    },
    history:
      'A carta de Waite é quase literal: três paus fincados, um homem de costas à beira-mar a ver os navios regressar com carga. É uma das cartas mais estáveis de toda a iconografia ocidental do Tarot — "a virtude do comerciante que investiu e espera".',
    meanings: {
      upright:
        'O que foi lançado está a voltar. Esta carta mede a distância entre o investimento e o primeiro retorno: bom momento para ampliar, contratar, assinar com terceiros e tornar visível o trabalho. A espera é ativa e tem prova — já há carga no mar.',
      reversed:
        'A mercadoria não chega: atrasos de fornecedor, autorização retida, parceria que não cumpre. Também descreve expansão decidida sem verificação de capacidade real.',
    },
    psychology:
      'Função de antecipação satisfeita: a psique a tolerar o intervalo porque tem evidência. Em inversão, a frustração do "esforço sem resposta", que corrói a motivação de projectos longos.',
    emotional: 'Satisfação prudente, orgulho discreto, confiança em processo. Em inversão, irritação com a lentidão alheia.',
    love: 'Relação que se abre ao mundo: conhecer amigos, viagem a dois, projecto conjunto. Invertido: promessas de futuro com calendário vago.',
    career: 'Fechamento de negócio com terceiros, exportação, primeiro cliente, equipa a crescer. Excelente para mostrar protótipo a mercado.',
    finances: 'Retorno escalonado de investimento; bom momento para renegociar prazos, não para antecipar despesa.',
    growth: 'Sustentar o esforço na fase em que o resultado já existe mas ainda não chegou.',
    spirituality: 'A colheita como consequência de sementeira feita com critério, não como recompensa moral.',
    obstacles: 'Dependência de terceiros no ponto crítico do processo.',
    opportunities: 'Uma parceria ou canal que multiplica o alcance sem multiplicar o esforço.',
    advice: [
      'Define com clareza o que é esperado de quem e até quando, por escrito.',
      'Amplia só a parte do projecto que já produziu uma vez.',
      'Comunica o progresso a quem pode abrir a próxima porta.',
    ],
    reflection: [
      'Onde estou a depender de terceiros para que o meu trabalho apareça?',
      'Que resultado já tenho e ainda não reconheci?',
      'Ampliar agora é oportunidade ou pressa?',
    ],
    relations: [
      { card: 'minor-wands-02', kind: 'continuidade', note: 'Plano que se torna movimento com retorno visível.' },
      { card: 'major-03-empress', kind: 'reforca', note: 'Germinação e primeiro fruto: fase fértil comprovada.' },
    ],
    art: {
      scene: 'figure-watching-ships-return',
      sky: 'dawn',
      terrain: 'sea',
      glyphs: ['ship', 'wand-bud', 'cluster-grapes', 'harvest-basket', 'sun-rays'],
      palette: ['#56C5BD', '#C6A66B', '#EFE6D6'],
      motifs: ['três paus fincados', 'homem de costas', 'navios a entrar na barra', 'mercadoria no cais'],
      reading: [
        'A figura está de costas para nós: a carta não mostra ansiedade, mostra espera com lugar marcado.',
        'Os três paus estão fincados no chão e não na mão: o plano já tem estrutura.',
        'Os navios trazem carga: o retorno é material, não simbólico.',
      ],
    },
    a11y: {
      alt: 'Carta Três de Paus: figura de pé num promontório a ver navios chegar, com três paus fincados no chão a seu lado.',
      long:
        'Composição horizontal de costa. Esquerda: três varas verticais com rebentos no topo, fincadas em solo arenoso. Centro: figura de costas, manto comprido, virada ao mar. Direita: dois barcos com velas quadradas e carga, mar calmo. Céu claro de manhã. Moldura com o numeral III de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Júpiter em Leão, "Virtue"'],
  },
  {
    id: 'minor-wands-04',
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    rank: '4',
    name: { pt: 'Quatro de Paus', intl: 'Four of Wands' },
    archetype: 'Celebração com fundamento / casa que acolhe',
    element: 'fire',
    astro: 'Júpiter em Carneiro',
    gdTitle: 'Completion',
    traditionNote: 'Chesed em ação: "completude" na Golden Dawn — estrutura que permite festa.',
    keywords: {
      upright: ['celebração', 'marco atingido', 'harmonia doméstica', 'pertencimento', 'boas-vindas'],
      reversed: ['instabilidade doméstica', 'festa sem razão', 'mudança adiada', 'perfeccionismo que estraga o momento'],
    },
    history:
      'Nas cartas populares italianas, esta cena de arcos floridos com duas figuras a levantar Ramos é a de uma festa de colheita ou casamento. Waite precisou o sentido: quatro paus firmes com coroa de flores e uma mansão ao fundo — repouso merecido dentro de estrutura estável.',
    meanings: {
      upright:
        'Um marco foi atingido e merece ser assinalado. A carta favorece casa, mudança, festa de família, conclusão de obra, casamento e todo o ritual que transforma conquista em memória. É também a carta de receber bem.',
      reversed:
        'A base não é firme, a festa torna-se obrigação, ou a celebração é adiada porque "falta ainda qualquer coisa". Aparece em conflitos domésticos e em transições concluídas só na burocracia.',
    },
    psychology:
      'É a função de pertença e a importância do marco partilhado: o psiquismo precisa de rituais de conclusão para consolidar identidade. Em inversão, a incapacidade de usufruir sem culpa.',
    emotional: 'Alegria social, ternura pelo lugar, sensação de chegar a casa.',
    love: 'Casa em comum, noivado, recepção pela família, convivência estável. Invertido: divergências sobre o lar ou o ritmo doméstico.',
    career: 'Conclusão de projecto com equipa, inauguração, celebração pública, ambiente saudável. Sinal de equipa coesa.',
    finances: 'Fase de estabilidade com alguma sobra para gastar com qualidade, sobretudo em casa e comunidade.',
    growth: 'Reconhecer o que já está construído antes de adicionar a meta seguinte.',
    spirituality: 'O arco floral como limiar sagrado: celebrar é uma forma de gratidão colectiva.',
    obstacles: 'Adiar o descanso até que tudo esteja perfeito.',
    opportunities: 'Um evento colectivo que consolida relações de que vais precisar.',
    advice: [
      'Marca hoje a celebração do marco: data, pessoas e um brinde curto.',
      'Arruma um detalhe da casa que tens adiado — o conforto sustenta o resto.',
      'Recebe alguém que ainda não conhece o teu trabalho.',
    ],
    reflection: [
      'Que conquista estou a tratar como normal?',
      'O meu espaço actual sustenta quem quero ser?',
      'Prefiro a festa ou a perfeição?',
    ],
    relations: [
      { card: 'major-03-empress', kind: 'reforca', note: 'Nutrição e celebração: abundância que se partilha.' },
      { card: 'minor-wands-09', kind: 'complementa', note: 'Depois da festa, a vigilância: o que exige manutenção.' },
    ],
    art: {
      scene: 'four-wands-with-garland-and-house',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['arch-temple', 'wand-bud', 'towers-trio', 'dove', 'rose'],
      palette: ['#EFE6D6', '#C6A66B', '#4A1F39'],
      motifs: ['quatro paus com arco de flores', 'duas figuras a levantar ramos', 'mansão ao fundo', 'estrada de acesso'],
      reading: [
        'Os quatro paus estão no chão, em linha, formando pórtico: é o limiar, não o obstáculo.',
        'As figuras levantam ramos, não se abraçam: a celebração é pública.',
        'A mansão ao fundo indica que a festa tem casa onde voltar.',
      ],
    },
    a11y: {
      alt: 'Carta Quatro de Paus: quatro paus levantados com um arco de flores, duas pessoas a levantar ramos por baixo e uma casa com torres ao fundo.',
      long:
        'Cena exterior de dia, jardim aberto. Quatro varas verticais em linha com coroa de flores e folhagem entre os topos. Sob o arco, duas figuras de braços erguidos segurando ramos curtos. Ao fundo, casa grande com três torres e estrada recta. Moldura com o numeral IV de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Sol em Áries, "Completion"'],
  },
  {
    id: 'minor-wands-05',
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    rank: '5',
    name: { pt: 'Cinco de Paus', intl: 'Five of Wands' },
    archetype: 'Competição / atrito produtivo',
    element: 'fire',
    astro: 'Saturno em Leão',
    gdTitle: 'Strife',
    traditionNote: 'Geburah: "disputa" na Golden Dawn — o choque que testa a força de uma intenção.',
    keywords: {
      upright: ['conflito aberto', 'competição', 'debate', 'desgaste por dispersão', 'rivalidade'],
      reversed: ['conflito cessado', 'evitação', 'acordo de compromisso', 'guerra de bastidores'],
    },
    history:
      'Cinco figuras com paus a golpear-se sem contacto e sem armadura, num campo aberto. A cena não representa combate mortal: é riña, treino, torneio sem público — e é essa ambiguidade que faz da carta um sinal de atrito sem vencedor declarado.',
    meanings: {
      upright:
        'Vários interesses a disputar o mesmo espaço. A carta descreve confusão, competições e discussões em que cada um golpeia o ar; raramente indica inimizade real, mas sim excesso de vontades sem coordenação. O risco não é perder: é cansar-se.',
      reversed:
        'Ou o conflito se apaga por acordo, ou passa para o plano subterrâneo. Indica fim de disputa por desgaste, evitação de confronto necessário, ou rivalidade que já não se declara à mesa.',
    },
    psychology:
      'É a luta de impulsos e de vozes internas, frequentemente projetada: o sujeito vive conflitos de outros porque não consegue nomear o seu. Em análise, a carta pede diferenciação — quem quer o quê neste conflito?',
    emotional: 'Irritação, competitividade, adrenalina gasta. Em inversão, alívio ou ressaca.',
    love: 'Discussões por temas pequenos, ciúme entre amigos, pressão de familiares; quando há vontade de ceder, a inversão é favorável.',
    career: 'Disputa de orçamento, concorrência por contrato, equipas em conflito de território. Recomendável mediação e definição de papéis.',
    finances: 'Despesas simultâneas e negociações duras; não vale a pena gastar energia a discutir valores sem dados.',
    growth: 'Usar o atrito como informação: o conflito diz-te que há recursos ou valores em disputa mal alocados.',
    spirituality: 'A lição do adversário: a resistência ensina forma — mas só se não for confundida com inimigo.',
    obstacles: 'Transformar colega em rival e debate em identidade.',
    opportunities: 'Um confronto que, feito cedo e com regras, poupa meses de desgaste.',
    advice: [
      'Reduz a disputa a uma única questão concreta e datada.',
      'Não entres em três discussões na mesma semana: escolhe a que importa.',
      'Propõe regras de jogo por escrito antes de voltar a discutir.',
    ],
    reflection: [
      'Que parte do conflito é realmente sobre o tema?',
      'O que ganho ao discutir isto?',
      'Como seria este problema se fosse cooperação?',
    ],
    relations: [
      { card: 'minor-swords-03', kind: 'sombra', note: 'Do atrito à ferida: quando a discussão deixa de ser técnica.' },
      { card: 'major-08-strength', kind: 'complementa', note: 'Força serena no meio do barulho.' },
    ],
    art: {
      scene: 'five-figures-clashing-staves',
      sky: 'day',
      terrain: 'plain',
      glyphs: ['wand-bud', 'salamancaite', 'dust-cloud', 'five-crossed-staves', 'sun-rays'],
      palette: ['#C6A66B', '#4A1F39', '#EFE6D6'],
      motifs: ['cinco varas a cruzar-se', 'figuras com roupas de cores diferentes', 'nenhum contacto', 'poeira levantada'],
      reading: [
        'As varas cruzam-se no ar, sem toque: o conflito é de direções, não de golpes recebidos.',
        'Nenhuma das cinco figuras está em vantagem: ninguém liderou a disputa.',
        'A poeira indica que o desgaste já aconteceu, independentemente do resultado.',
      ],
    },
    a11y: {
      alt: 'Carta Cinco de Paus: cinco figuras em campo aberto a levantar paus que se cruzam no ar, sem se tocarem, com poeira levantada.',
      long:
        'Campo aberto com luz directa. Cinco figuras espalhadas em arco, cada uma com um pau levantado que se cruza com outros formando uma teia de varas acima das cabeças. Expressões sérias, nenhuma figura caída. Chão de terra clara com poeira. Moldura com o numeral V de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mercúrio em Escorpião, "Dispute"'],
  },
  {
    id: 'minor-wands-06',
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    rank: '6',
    name: { pt: 'Seis de Paus', intl: 'Six of Wands' },
    archetype: 'Reconhecimento público / entrada triunfal',
    element: 'fire',
    astro: 'Júpiter em Leão',
    gdTitle: 'Victory',
    traditionNote: 'Tiphareth: "vitória" na Golden Dawn. A carta mais literalmente celebratória do naipe.',
    keywords: {
      upright: ['reconhecimento', 'vitória partilhada', 'autoridade confirmada', 'boa reputação', 'sucesso visível'],
      reversed: ['sucesso frágil', 'vaidade', 'reconhecimento adiado', 'arrogância', 'queda de imagem'],
    },
    history:
      'A procissão com o vencedor a cavalo, coroa de louros e multidão com paus erguidos vem do "trionfo" romano do imperator. O detalhe importante do desenho de Waite é a bandeira com folhas que se vê atrás do cavaleiro: o cortejo é escoltado, o que sugere que a vitória tem contrapartidas e testemunhas.',
    meanings: {
      upright:
        'O que fizeste é visto e elogiado. Esta carta traz promoção pública, prémio, nota máxima, contrato anunciado, feedback positivo de clientes. Traz também a exigência de representar: quem sobe passa a ser observado.',
      reversed:
        'Reconhecimento que não chega, ou chega e não se sustenta. Descreve também o esforço de manter imagem, a festa que consome o resultado e a vitória obtida por pressão, não por mérito.',
    },
    psychology:
      'É a necessidade de reconhecimento e a sua função social: saudável quando confirma competência, problemática quando se torna fonte exclusiva de autoestima.',
    emotional: 'Orgulho, alívio, euforia partilhada. Em inversão, vazio de "já passou".',
    love: 'Relação assumida em público, apresentação oficial, elogio mútuo social. Invertido: aparência de casal sem substance.',
    career: 'Fase de maior visibilidade do naipe: promoção, prémio, publicação, convite para falar. Bom momento para negociar com argumento de prova.',
    finances: 'Aumento associado a resultado reconhecido; cuidado com gastar ao nível da imagem nova.',
    growth: 'Aprender a receber aplauso sem inflar nem desvalorizar: a vitrine não é o produto.',
    spirituality: 'A glória como serviço público: o que se recebe é para ser usado, não para ser exposto.',
    obstacles: 'Passar de fazer para parecer: gerir a imagem em vez de gerir o trabalho.',
    opportunities: 'Um reconhecimento que abre a próxima porta — se for convertido em alianças, não só em orgulho.',
    advice: [
      'Agradece publicamente a quem tornou o resultado possível: sustenta a vitória.',
      'Negocia agora, com a nota de reconhecimento na mão.',
      'Define o que fazes a seguir enquanto ainda és visto.',
    ],
    reflection: [
      'Preciso deste reconhecimento ou preciso de o continuar a precisar?',
      'Que parte do meu trabalho ninguém vê?',
      'Como mantenho o nível quando a atenção se retirar?',
    ],
    relations: [
      { card: 'major-19-sun', kind: 'reforca', note: 'Vitória e luz pública: sucesso consolidado.' },
      { card: 'major-16-tower', kind: 'sombra', note: 'A imagem que depende da multidão pode cair com ela.' },
    ],
    art: {
      scene: 'rider-crowned-with-laurel-in-procession',
      sky: 'day',
      terrain: 'city',
      glyphs: ['horse', 'crown', 'wand-bud', 'laurel-wreath', 'banner-red', 'crowd-figures'],
      palette: ['#EFE6D6', '#C6A66B', '#4A1F39'],
      motifs: ['cavaleiro de coroa de louros', 'multidão com paus', 'bandeira com folhas', 'cidade atrás'],
      reading: [
        'O cavaleiro leva a testa baixa: o reconhecimento aqui exige discrição.',
        'Os paus da multidão são os mesmos do centro: o sucesso veio das mãos de muitos.',
        'A bandeira atrás é folha, não chama: a vitória não precisa de agressividade.',
      ],
    },
    a11y: {
      alt: 'Carta Seis de Paus: pessoa a cavalo com coroa de folhas na cabeça, a passar por um grupo de pessoas que erguem paus, com uma bandeira e edifícios ao fundo.',
      long:
        'Rua de cidade com edifícios claros. Centro: figura a cavalo, branco, com túnica e coroa de louros, segurando um pau decorado com folhas. À frente e aos lados, seis pessoas de pé com paus erguidos; atrás, uma bandeira com folhas. Moldura com o numeral VI de Paus.',
    },
    sources: ['Marseille – Six de Bâton', 'Golden Dawn – Lua em Sagitário, "Victory"'],
  },
  {
    id: 'minor-wands-07',
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    rank: '7',
    name: { pt: 'Sete de Paus', intl: 'Seven of Wands' },
    archetype: 'Defender posição / vantagem do terreno',
    element: 'fire',
    astro: 'Marte em Leão',
    gdTitle: 'Valour',
    traditionNote: 'Netzach em prova: "fortitude" — manter o que já se conquistou contra investidas.',
    keywords: {
      upright: ['defesa', 'persistência sob pressão', 'vantagem de posição', 'recusar recuo', 'assumir impopularidade'],
      reversed: ['esgotamento', 'ceder por cansaço', 'paranoia defensiva', 'batalha perdida à partida'],
    },
    history:
      'Waite herda de Marselha a figura no alto de um penedo com um pau erguido em guarda, seis outros a tentar subir. A carta quase nunca foi alterada na sua leitura: é a carta da resistência em posição favorecida, e o detalhe "olha para baixo, está acima" faz toda a diferença.',
    meanings: {
      upright:
        'Estás em posição vantajosa e os outros ainda não o perceberam. A carta favorece manter a posição, dizer não a pressões, defender orçamento, prazo ou fronteira. Não pede agressividade: pede altura.',
      reversed:
        'Ou a defesa cede por exaustão, ou transforma-se em trincheira permanente contra inimigos imaginários. Indica perda de terreno por não ter sustentado a decisão a tempo.',
    },
    psychology:
      'É a função de assertividade: a capacidade de sustentar uma posição sem se tornar hostil. Em sombra, a postura defensiva crónica, em que toda a proposta externa é ameaça.',
    emotional: 'Alerta, resistência, solidão de quem está acima; em inversão, exaustão e ressentimento.',
    love: 'Fronteiras necessárias (com sogros, ex-parceiros, amigos), defesa do relação contra pressões externas. Invertido: cansaço de estar sempre a justificar a relação.',
    career: 'Concorrência por recurso ou território, defesa de orçamento, gestão de pressões de cima. A vantagem está no terreno, não no volume de fogo.',
    finances: 'Recusar condições piores do que as actuais, defender preço e prazos. Não é momento para baixar exigências.',
    growth: 'Treinar o "não" sem justificação longa: explicar de mais é convidar a negociação.',
    spirituality: 'A prova de perseverança: manter o que se decidiu quando a decisão se torna cara.',
    obstacles: 'Confundir defesa com isolamento.',
    opportunities: 'Uma vantagem posicional — conhecimento, histórico, relação — que garante a disputa.',
    advice: [
      'Escolhe um único ponto a defender e ignora os outros.',
      'Ganha terreno antes de discutir: apresenta provas, não opiniões.',
      'Descansa em turnos: posição mantida com exaustão perde-se na última semana.',
    ],
    reflection: [
      'O que estou a defender por princípio e o que defendo por hábito?',
      'Quem está a tentar subir a minha montanha, e porque?',
      'Vale a pena gastar o que ganho a defender isto?',
    ],
    relations: [
      { card: 'major-08-strength', kind: 'reforca', note: 'Resistência com disciplina: a posição que não cede pela força, mas pela persistência.' },
      { card: 'minor-wands-05', kind: 'continuidade', note: 'Do conflito generalizado à defesa do ponto específico.' },
    ],
    art: {
      scene: 'figure-on-height-defending-six-staves',
      sky: 'dusk',
      terrain: 'mountain',
      glyphs: ['wand-bud', 'mountain-peak', 'shield', 'figure-standing', 'dust-cloud'],
      palette: ['#4A1F39', '#EFE6D6', '#C6A66B'],
      motifs: ['figura no alto', 'seis varas a subir', 'perna dianteira à frente', 'olhar para baixo', 'penedo inclinado'],
      reading: [
        'A figura está no alto com um pé à frente: ocupa terreno, não se prepara para fugir.',
        'As seis varas sobem em ângulos diferentes: não estão coordenadas.',
        'Nenhuma vara toca a do centro: a vantagem ainda não foi testada seriamente.',
      ],
    },
    a11y: {
      alt: 'Carta Sete de Paus: figura no topo de um penedo com um pau erguido em guarda, enquanto seis varas sobem na sua direção a partir de baixo.',
      long:
        'Encosta rochosa inclinada. Centro-alto: figura de pé em posição de guarda, joelho dianteiro dobrado, pau levantado sobre a cabeça. Em baixo, seis varas apontadas para cima, vistas apenas até meio, sem figuras visíveis. Moldura com o numeral VII de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Saturno em Leão, "Fortitude"'],
  },
  {
    id: 'minor-wands-08',
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    rank: '8',
    name: { pt: 'Oito de Paus', intl: 'Eight of Wands' },
    archetype: 'Velocidade / o que chega sem aviso',
    element: 'fire',
    astro: 'Mercúrio em Sagitário',
    gdTitle: 'Swiftness',
    traditionNote: 'Hod em movimento: "rapidez". Nas baralhas italianas, paus a voar sobre paisagem sem figuras.',
    keywords: {
      upright: ['aceleração', 'mensagem que chega', 'desfecho rápido', 'fluxo favorável', 'movimento livre'],
      reversed: ['atraso', 'informação retida', 'pressa que estraga', 'projecto travado', 'ruído de comunicação'],
    },
    history:
      'A carta italiana não tinha figura humana, só oito varas a cruzar o céu sobre árvores e rio, o que faz dela uma das mais abstractas da série. Waite manteve o voo e acrescentou um sol baixo e pássaros, reforçando a leitura de mensageiros e acontecimentos em trajectória directa.',
    meanings: {
      upright:
        'As coisas desbloqueiam e acontecem rápido: resposta a email, confirmação, viagem, entrega, notícia, decisão tomada sem drama. É das poucas cartas que recomenda actuar na velocidade do acontecimento.',
      reversed:
        'Atrasos, objectos extraviados, mensagens que não chegam, ou aceleração sem direção. Descreve também a frustração de esperar por alguém que demora a responder.',
    },
    psychology:
      'Associa-se à função de fluxo: quando pensamento e ação estão quase simultâneos, o ego perde o hábito de antecipar risco. Em inversão, a ansiedade de espera — o tempo alheio vivido como ameaça.',
    emotional: 'Ansiedade boa, excitação, urgência afectiva.',
    love: 'Confissão, pedido, resposta, convite de última hora, viagem repentina. Em inversão: silêncio prolongado e mensagens mal interpretadas.',
    career: 'Projecto em execução, prazos apertados, decisões rápidas, transferência, deslocação. Aproveita o embalo; não o interrompas para discutir estética.',
    finances: 'Movimento de dinheiro rápido: liquidação, reembolso, oportunidade momentânea. Exige decisão no próprio dia.',
    growth: 'Executar sem ruminação: há matérias em que velocidade é qualidade.',
    spirituality: 'O mensageiro alado: estar disponível para o que chega depressa e não espera preparação perfeita.',
    obstacles: 'Querer controlar o tempo do outro.',
    opportunities: 'Uma janela de 24 a 72 horas que resolve o que estava parado há meses.',
    advice: [
      'Responde hoje ao que está pendente: nesta fase o silêncio é lido como recusa.',
      'Retira uma aprovação que só atrasa — executa primeiro, documenta depois.',
      'Confirma o prazo por escrito, porque a velocidade aumenta o risco de erro.',
    ],
    reflection: [
      'O que ganho se responder já?',
      'Estou a travar algo por medo do resultado rápido?',
      'Onde a minha pressa está a criar retrabalho?',
    ],
    relations: [
      { card: 'major-07-chariot', kind: 'reforca', note: 'Movimento em série: avanço rápido com direção.' },
      { card: 'major-18-moon', kind: 'tensao', note: 'Velocidade e ambiguidade: decidir depressa com informação nebulosa é risco.' },
    ],
    art: {
      scene: 'eight-staves-flying-over-landscape',
      sky: 'dusk',
      terrain: 'plain',
      glyphs: ['eight-blades-flight', 'bird-pair', 'river-band', 'sun-half', 'wand-bud'],
      palette: ['#C6A66B', '#56C5BD', '#EFE6D6'],
      motifs: ['oito paus paralelos no ar', 'dois pássaros a fugir', 'rio e floresta em baixo', 'sol baixo'],
      reading: [
        'Os oito paus são paralelos e não se cruzam: o movimento tem ordem, não é caos.',
        'Não há figura humana: o que chega não depende do teu esforço.',
        'Os pássaros voam na mesma direção dos paus: a natureza confirma o fluxo.',
      ],
    },
    a11y: {
      alt: 'Carta Oito de Paus: oito varas a atravessar o céu em paralelo sobre uma paisagem com rio, árvores e um sol baixo, com dois pássaros a voar.',
      long:
        'Paisagem de fim de tarde vista de cima: rio curvo, floresta e campo. No céu, oito varas compridas inclinadas na mesma direção, sem tocar o solo. Dois pássaros pequenos voam por baixo das varas, um sol laranja baixo à esquerda. Moldura com o numeral VIII de Paus.',
    },
    sources: ['Tarocchino – otto bastoni in aria', 'Golden Dawn – Júpiter em Virgem, "Swiftness"'],
  },
  {
    id: 'minor-wands-09',
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    rank: '9',
    name: { pt: 'Nove de Paus', intl: 'Nine of Wands' },
    archetype: 'Última resistência / ferido mas de pé',
    element: 'fire',
    astro: 'Lua em Sagitário',
    gdTitle: 'Strength',
    traditionNote: 'Yesod: "força" na Golden Dawn, muitas vezes lida como resistência depois do choque. Waite copiou a postura do personagem de Marselha.',
    keywords: {
      upright: ['resiliência', 'vigilância', 'experiência acumulada', 'cautela', 'chegar ao fim'],
      reversed: ['desgaste', 'desconfiança crónica', 'paranoia', 'recusa de ajuda', 'batalha já ganha'],
    },
    history:
      'A figura vendada e com ombros caídos vem directamente de Marselha, onde o nove de paus mostrava apenas as nove varas. Waite acrescentou a ligadura na cabeça — herança de imagens de veteranos — e transformou a carta num retrato de resistência depois do dano.',
    meanings: {
      upright:
        'Falta pouco e já doeu. Esta carta descreve quem está na última fase de um esforço e por isso fica defensivo: há vantagem real, mas também há fadiga que distorce a leitura do perigo. Recomenda manter a posição, com apoio e sem heróismo.',
      reversed:
        'Ou a guarda não baixa quando devia, ou cai antes da meta. Indica exaustão, desconfiança generalizada, tendência para lutar todas as batalhas, e o erro clássico de não reconhecer que a prova já foi feita.',
    },
    psychology:
      'É o mecanismo de hipervigilância pós-trauma: a psique que mantém o alerta depois do perigo ter passado. O trabalho é distinguir o sinal real da memória do dano.',
    emotional: 'Cansário, teimosia, solidão orgulhosa; em inversão, irritabilidade e medo difuso.',
    love: 'Desconfiança trazida de relações anteriores, defesa do território afectivo. Quando é preciso: proteger a relação. Quando é demais: testar quem chega.',
    career: 'Última entrega, recta final de processo, defesa de tese, auditoria. Aconselha delegar uma tarefa para não cair na última curva.',
    finances: 'Reserva de segurança é obrigatória nesta fase; não gastes o colchão em conflito de princípio.',
    growth: 'Aprender a baixar a guarda em sítios seguros: confiança também é habilidade.',
    spirituality: 'A perseverança do sobrevivente: terminar sem endurecer.',
    obstacles: 'Confundir vigilância com sabedoria.',
    opportunities: 'Fechar em vez de reabrir: a prova que te falta já existe.',
    advice: [
      'Pede uma revisão externa do que estás a defender sozinho.',
      'Reduz a 80% o esforço: a meta está próxima e a energia tem de chegar.',
      'Escreve o que já provaste, para não recomeçares do zero por cansaço.',
    ],
    reflection: [
      'Este perigo é actual ou é memória?',
      'Que guarda posso baixar hoje sem risco?',
      'Quem poderia carregar parte nisto?',
    ],
    relations: [
      { card: 'major-08-strength', kind: 'complementa', note: 'Força suave depois da força teimosa.' },
      { card: 'minor-wands-07', kind: 'continuidade', note: 'Defesa que se torna desgaste: a mesma posição, mais tarde.' },
    ],
    art: {
      scene: 'wounded-figure-leaning-on-staff',
      sky: 'dusk',
      terrain: 'path',
      glyphs: ['wand-bud', 'bandage-head', 'shield', 'wall-stone', 'eight-standing-wands'],
      palette: ['#4A1F39', '#EFE6D6', '#C6A66B'],
      motifs: ['figura com ligadura na cabeça', 'paus atrás como sentinela', 'ombros levantados', 'olhar para trás'],
      reading: [
        'As oito varas estão de pé atrás dele: a linha defensiva já está montada.',
        'A ligadura mostra dano recebido, não dano em curso.',
        'O corpo está virado de lado: vigilância, não prontidão para ataque.',
      ],
    },
    a11y: {
      alt: 'Carta Nove de Paus: figura com ligadura na cabeça apoiada num pau, de lado, com oito paus fincados atrás como uma sebe.',
      long:
        'Fim de tarde, caminho de terra com muro baixo. Centro: figura de pé com manto e ligadura à volta da cabeça, apoiada num pau vertical com ambas as mãos. Atrás, oito varas paralelas fincadas no chão, em linha. Moldura com o numeral IX de Paus.',
    },
    sources: ['Marseille – neuf de baston', 'Golden Dawn – Marte em Balança, "Strength"'],
  },
  {
    id: 'minor-wands-10',
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    rank: '10',
    name: { pt: 'Dez de Paus', intl: 'Ten of Wands' },
    archetype: 'Sobrecarga / o peso que se aceita carregar',
    element: 'fire',
    astro: 'Saturno em Sagitário',
    gdTitle: 'Oppression',
    traditionNote: 'Malkuth: "aflição". O fecho do naipe mostra a energia convertida em peso, e a casa visível no fim do caminho.',
    keywords: {
      upright: ['sobrecarga', 'responsabilidade acumulada', 'fardo escolhido', 'fim de ciclo com desgaste', 'delegar'],
      reversed: ['libertação de peso', 'recusa de responsabilidade', 'colapso por excesso', 'aprendizado de limites'],
    },
    history:
      'A imagem do homem com dez paus ao ombros, a olhar para a casa que já avista, é quase idêntica em Marselha e no Rider-Waite-Smith. É, historicamente, a carta do camponês que leva a lenha para casa, e a leitura moral de fardo nunca esteve longe.',
    meanings: {
      upright:
        'Carregas mais do que o combinado e a meta já se vê. A carta descreve o ponto em que responsabilidade deixa de ser mérito e passa a ser risco: o excesso compromete a qualidade e a saúde. O fecho está próximo — e pode ser mais leve.',
      reversed:
        'Largam-se paus. Descreve a decisão de delegar, recusar um projecto ou renegociar termos; também pode anunciar colapso por não ter feito nenhuma dessas coisas a tempo.',
    },
    psychology:
      'A relação com o dever: quanto do peso é realmente teu e quanto é papel que aprendeste a aceitar para seres necessário. Em sombra, o ganho identitário da sobrecarga.',
    emotional: 'Cansaço com estoicismo, irritação baixa, sensação de dívida constante.',
    love: 'Um dos dois leva a relação às costas, ou há tarefas domésticas e emocionais desiguais. Inversão: redistribuir ou romper.',
    career: 'Excesso de trabalho sem excesso de recursos; fase de priorização agressiva e de pedido formal de apoio. A entrega final está perto.',
    finances: 'Compromissos acumulados a exigir reescalonamento. Não assumas mais nada até renegociar o actual.',
    growth: 'Aprender que largar um pau não é fraqueza — é técnica de sobrevivência.',
    spirituality: 'O discernimento do peso: nem tudo o que se carrega é cruz, algumas são apenas hábito.',
    obstacles: 'Recusar ajuda para não perder a imagem de competente.',
    opportunities: 'Uma renegociação que reduz 30% da carga sem reduzir o resultado.',
    advice: [
      'Lista tudo o que carregas e risca o que ninguém te pediu.',
      'Delegar um pau hoje: escolhe o de menor risco e maior frequência.',
      'Fala com quem distribui a carga, antes de falares com quem te cobra.',
    ],
    reflection: [
      'De quem é este peso, verdadeiramente?',
      'O que acontece se eu o pousar dez minutos?',
      'Que responsabilidade aceito só porque alguém não quis dizer não?',
    ],
    relations: [
      { card: 'major-12-hanged-man', kind: 'reforca', note: 'Parar e largar: duas respostas ao mesmo excesso.' },
      { card: 'minor-pentacles-05', kind: 'sombra', note: 'A sobrecarga que termina em privação.' },
    ],
    art: {
      scene: 'figure-carrying-ten-staves-to-house',
      sky: 'dusk',
      terrain: 'path',
      glyphs: ['wand-bud', 'gate', 'house-small', 'figure-reaching', 'burden-frame'],
      palette: ['#11172A', '#C6A66B', '#EFE6D6'],
      motifs: ['feixe de dez paus', 'figura curvada', 'casa no horizonte', 'caminho recto', 'olhar para o destino'],
      reading: [
        'O feixe tapa parte do caminho: a carga limita visão, não só força.',
        'A casa já se vê: o esforço não é infinito, é mal distribuído.',
        'Os paus são todos diferentes: não há um só culpado para o excesso.',
      ],
    },
    a11y: {
      alt: 'Carta Dez de Paus: figura curvada a carregar dez varas aos ombros, a caminhar por um caminho com uma casa visível ao fundo.',
      long:
        'Céu de crepúsculo sobre campo aberto. Centro: figura com corpo inclinado para a frente, feixe de dez varas que se projecta para trás em duas asas; olhar dirigido ao horizonte. Fundo: caminho recto e casa pequena com telhado. Moldura com o numeral X de Paus.',
    },
    sources: ['Marseille – dix de baston', 'Golden Dawn – Sol em Capricórnio, "Sorrows"'],
  },
  {
    id: 'minor-wands-page',
    arcana: 'minor',
    suit: 'wands',
    number: 11,
    rank: 'page',
    name: { pt: 'Pajem de Paus', intl: 'Page of Wands' },
    archetype: 'O aprendiz entusiasta / notícia com promessa',
    element: 'fire',
    astro: 'Terra do Fogo',
    gdTitle: 'Príncipe da Carruagem de Fogo',
    traditionNote: 'Nos tarôs italianos o "fante" de paus é o filho/soldado: camada prática e juvenil do elemento.',
    keywords: {
      upright: ['aprendizagem entusiástica', 'notícia favorável', 'proposta ousada', 'experimentação', 'início de formação'],
      reversed: ['imaturidade', 'promessa sem substância', 'entusiasmo de duas semanas', 'indiscrição'],
    },
    history:
      'Waite vestiu os pajens com túnicas de salamandra e colocou-os em paisagens áridas ou verdes consoante o naipe, fixando a leitura funcional: o pajem não é a força, é a mensagem e a formação. Nos tarôs do século XVI era simplesmente "o filho".',
    meanings: {
      upright:
        'Chega uma proposta, convite ou notícia que abre uma aprendizagem. Esta carta favorece quem está a começar sem fingir experiência, pede curiosidade disciplinada e recompensa quem diz "não sei ainda, mas aprendo depressa".',
      reversed:
        'Fala-se mais do que se faz. Descreve o principiante que abandona, o projecto anunciado e não executado, e a mensagem entusiástica que não tem apoio concreto.',
    },
    psychology:
      'É a função de curiosidade: energia psíquica que ainda não tem forma, mas já temdireção. Em sombra, a identidade de eterno aprendiz — confortável porque dispensa avaliação.',
    emotional: 'Entusiasmo, admiração fácil, afecto com pouca constância.',
    love: 'Paixão juvenil, conquista por mensagem, convite inesperado; pode indicar pessoa mais nova ou relação em fase de descoberta. Invertido: promessa de relação sem facto.',
    career: 'Estágio, formação, primeiro projecto, ideia apresentada sem pretensão. Favorável a aprender uma ferramenta nova.',
    finances: 'Mesada, bolsa, rendimento pequeno mas em formação. Cuidado com gastos de principiante em equipamento.',
    growth: 'Manter disponibilidade de iniciante sem ficar dependente do elogio à potencialidade.',
    spirituality: 'O aprendiz no limiar: a salamandra que entra no fogo, símbolo de fé posta à prova.',
    obstacles: 'Confundir fascínio com vocação.',
    opportunities: 'Uma formação ou contacto que muda de direção com baixo custo.',
    advice: [
      'Escolhe uma aprendizagem e compromete-te por 90 dias, com avaliação escrita.',
      'Não anuncies o projecto: entrega primeiro uma versão.',
      'Pede a uma pessoa experiente três críticas ao teu entusiasmo.',
    ],
    reflection: [
      'O que me atrai nisto — a substância ou a novidade?',
      'Que mensagem estou a mandar que ainda não sustento?',
      'O que é que me falta aprender para isto ser sério?',
    ],
    relations: [
      { card: 'minor-wands-01', kind: 'reforca', note: 'A faísca com aprendiz: início com formação a sério.' },
      { card: 'major-00-fool', kind: 'espelho', note: 'Ambos começam sem saber; o pajem aceita ser ensinado.' },
    ],
    art: {
      scene: 'page-in-salamander-tunic',
      sky: 'day',
      terrain: 'desert',
      glyphs: ['wand-bud', 'salamancaite', 'tunic-leaf', 'sun-rays', 'scroll'],
      palette: ['#C6A66B', '#EFE6D6', '#4A1F39'],
      motifs: ['jovem com túnica de salamandras', 'pau erguido à frente', 'deserto ao fundo', 'saudação com a outra mão'],
      reading: [
        'A salamandra na túnica é o símbolo tradicional do fogo que não se queima.',
        'O pau está fincado no chão, não erguido: a energia ainda não foi usada.',
        'A mão levantada em saudação indica que a função desta carta é mensagem.',
      ],
    },
    a11y: {
      alt: 'Carta Pajem de Paus: jovem de túnica decorada com salamandras, de pé no deserto a segurar um pau vertical com a mão direita e a levantar a esquerda em cumprimento.',
      long:
        'Deserto claro com céu limpo. Centro: figura jovem de perfil, túnica larga com pequenos lagartos bordados, sapatos apontados, pau na vertical apoiado no chão, braço esquerdo elevado com palma aberta. Moldura com o rótulo de pajem e o símbolo de paus.',
    },
    sources: ['Waite – Pictorial Key', 'Tarot de Cignaroli – fante di bastoni'],
  },
  {
    id: 'minor-wands-knight',
    arcana: 'minor',
    suit: 'wands',
    number: 12,
    rank: 'knight',
    name: { pt: 'Cavaleiro de Paus', intl: 'Knight of Wands' },
    archetype: 'Investida / a ação ardente e breve',
    element: 'fire',
    astro: 'Ar do Fogo',
    gdTitle: 'Senhor das Chamas e dos Relâmpagos de Fogo',
    traditionNote: 'O cavaleiro é, nos tarôs renascentistas, o "filho/guerreiro" a cavalo: a camada de movimento do elemento.',
    keywords: {
      upright: ['investida', 'iniciativa rápida', 'aventura', 'carisma em ação', 'viagem súbita'],
      reversed: ['impulsividade', 'promessa que se evapor', 'agressividade', 'abandono a meio', 'colisão de planos'],
    },
    history:
      'Waite desenhou o cavaleiro de Paus com o cavalo a erguer-se, Salamandras na túnica e o deserto atrás, num dos raros momentos de movimento puro de todo o baralho. A figura herda a imagem do cavaleiro mourisco dos cortejos festivos italianos.',
    meanings: {
      upright:
        'Avanço rápido, decidido, sem comité. Esta carta favorece deslocação, conquista, arranque ousado, e pessoas que fazem acontecer hoje. Traz velocidade e calor — e a necessidade de confirmar que a direção foi escolhida.',
      reversed:
        'Investida sem reserva: entusiasmo que queima o que toca, abandono quando aparece dificuldade, promessas de cavaleiro. Indica também conflito provocado por pressa.',
    },
    psychology:
      'É a função de ação em sua forma mais identificada com o desejo: coragem de querer. A sombra é o medo do tédio, que leva a interromper ciclos para sentir outra vez a partida.',
    emotional: 'Paixão intensa e curta, fascínio, impaciência afectiva.',
    love: 'Conquista directa, viagem, desejo sem rodeios; excelente para reacender. Invertido: ausência, aventura que não se compromete, velocidade sem intimidade.',
    career: 'Negócio que se fecha em dias, deslocação, tomada de iniciativa pública, arranque que não admite adiamento. Precisa de plano B escrito.',
    finances: 'Gasto rápido e investimento impulsivo são o risco; oportunidade de ganho por decisão imediata é a vantagem.',
    growth: 'Transformar impulso em hábito: é a única coisa que este cavaleiro não faz naturalmente.',
    spirituality: 'O fogo como chamado: agir sem esperar permissão, mas com direção escolhida.',
    obstacles: 'Confundir velocidade com progresso.',
    opportunities: 'Uma deslocação ou decisão que resolve em dias o que estava parado há meses.',
    advice: [
      'Fixa o objectivo e o ponto de paragem antes de montar.',
      'Escreve a promessa que queres fazer — e lê-a com calma antes de enviar.',
      'Deixa uma versão anterior documentada: a pressa apaga rasto.',
    ],
    reflection: [
      'Estou a avançar ou a fugir de estar parado?',
      'Que rastro deixo quando saio de repente?',
      'O que é que eu quero deste fogo?',
    ],
    relations: [
      { card: 'major-07-chariot', kind: 'reforca', note: 'Investida e direção: velocidade sustentada.' },
      { card: 'major-16-tower', kind: 'sombra', note: 'O avanço sem travão produz a queda que não era necessária.' },
    ],
    art: {
      scene: 'knight-on-rearing-horse-with-salamanders',
      sky: 'day',
      terrain: 'desert',
      glyphs: ['horse', 'salamander', 'wand-bud', 'armor', 'dust-cloud'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['cavalo em pé', 'túnica com salamandras', 'pau levantado', 'areia e fogo baixo'],
      reading: [
        'O cavalo levanta-se sem ordem visível: o movimento já começou antes da decisão consciente.',
        'O pau está levantado mas não apontado: energia disponível, direção por definir.',
        'O deserto atrás indica ausência de recurso hídrico — isto queima depressa.',
      ],
    },
    a11y: {
      alt: 'Carta Cavaleiro de Paus: cavaleiro com túnica de salamandras montado num cavalo que se ergue sobre as patas traseiras, segurando um pau, num deserto.',
      long:
        'Composição diagonal de movimento. Centro: cavalo empinado com arreios decorados; cavaleiro inclinado para a frente, túnica com lagartos, braço direito a segurar um pau curto erguido. Fundo de deserto com fogo baixo no horizonte. Moldura com o rótulo de cavaleiro de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Ar do Fogo'],
  },
  {
    id: 'minor-wands-queen',
    arcana: 'minor',
    suit: 'wands',
    number: 13,
    rank: 'queen',
    name: { pt: 'Rainha de Paus', intl: 'Queen of Wands' },
    archetype: 'Liderança calorosa / presença que organiza',
    element: 'fire',
    astro: 'Água do Fogo',
    gdTitle: 'Rainha do Trono de Fogo',
    traditionNote: 'Nos tarôs de Visconti as rainhas são retratos de duquesas: a camada de governo afectivo e de domínio do elemento.',
    keywords: {
      upright: ['carisma natural', 'autonomia', 'hospitalidade ativa', 'coragem social', 'gestão pelo exemplo'],
      reversed: ['dominação', 'celos', 'exaustão de dar luz', 'tirania suave', 'competição com outras mulheres'],
    },
    history:
      'Waite colocou-lhe girassol, gato preto e borboleta — símbolos de sol, independência e transformação — e uma salamandra aos pés. A carta herda da "regina" italiana a leitura de mulher com poder próprio, não derivado.',
    meanings: {
      upright:
        'Presença que se faz seguir sem exigir. Esta carta descreve quem combina calor e exigência, quem convida e decide, e quem torna atraente o trabalho dos outros. Favorece liderar, vender, ensinar, organizar.',
      reversed:
        'O carisma transforma-se em instrumento: chantagem afectiva, competitividade, necessidade de ser centro. Indica também liderança esgotada por não delegar e por querer agradar a plateia.',
    },
    psychology:
      'É a integração de desejo e poder: a função que permite querer abertamente sem destruir o vínculo. Em sombra, a identificação da autoestima com a atenção alheia.',
    emotional: 'Afeto generoso e exigente, ciúme quando contrariado.',
    love: 'Relação com dois centros: atração forte, autonomia preservada. Invertida: disputa de protagonismo afectivo, ou chantagem emocional.',
    career: 'Liderança de equipas criativas, gestão de marca pessoal, vendas, eventos, direção de projeto. Excelente para quem precisa de mobilizar pessoas.',
    finances: 'Boa gestão de recursos próprios; tende ao gasto em hospitalidade e imagem. Renda vem de presença e reputação.',
    growth: 'Exercer poder sem pedir desculpa — e sem o usar para se fazer necessária.',
    spirituality: 'O fogo domesticado que aquece: liderança como serviço de claridade.',
    obstacles: 'Precisar de público para acreditar no próprio valor.',
    opportunities: 'Um papel de representação que amplia a tua voz.',
    advice: [
      'Convida e decide na mesma conversa: clareza calorosa é a tua vantagem.',
      'Delega a tarefa que só fazes porque te dá visibilidade.',
      'Define uma regra de acesso a ti: presença sem limites consome.',
    ],
    reflection: [
      'Que parte do meu brilho uso para ser aceite?',
      'Como reajo quando alguém brilha ao meu lado?',
      'O que faria se não precisasse de ser vista?',
    ],
    relations: [
      { card: 'minor-cups-queen', kind: 'complementa', note: 'Calor e profundidade: presença afectiva completa.' },
      { card: 'minor-swords-queen', kind: 'tensao', note: 'Dois estilos de autoridade que disputam o mesmo terreno.' },
    ],
    art: {
      scene: 'queen-throne-with-sunflower-and-black-cat',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['throne-cup', 'sunflower', 'black-cat', 'butterfly', 'wand-bud', 'salamander'],
      palette: ['#C6A66B', '#EFE6D6', '#56C5BD'],
      motifs: ['trono com girassóis', 'gato preto aos pés', 'borboleta no ombro', 'pau na mão', 'salamandra no chão'],
      reading: [
        'O girassol do trono coloca a luz como símbolo de governo.',
        'O gato preto é autonomia: a rainha não precisa de obedecer para ser soberana.',
        'A borboleta no ombro é transformação serena, não conquista.',
      ],
    },
    a11y: {
      alt: 'Carta Rainha de Paus: mulher coroada sentada num trono decorado com girassóis, segurando um pau, com um gato preto aos pés e uma borboleta no ombro.',
      long:
        'Jardim de dia. Centro: figura sentada de vestido claro com coroa, girassóis grandes nos braços do trono, pau liso na mão direita; à frente, um gato negro sentado; no ombro esquerdo, borboleta pequena. Ao chão, uma salamandra. Moldura com o rótulo de rainha de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Água do Fogo'],
  },
  {
    id: 'minor-wands-king',
    arcana: 'minor',
    suit: 'wands',
    number: 14,
    rank: 'king',
    name: { pt: 'Rei de Paus', intl: 'King of Wands' },
    archetype: 'Empresário nato / autoridade visionária',
    element: 'fire',
    astro: 'Fogo do Fogo',
    gdTitle: 'Rei dos Espíritos e das Chamas de Fogo',
    traditionNote: 'O "rex" de paus tem salamandras e o sol nascente nos braços do trono: a função de governo pela iniciativa.',
    keywords: {
      upright: ['visão executada', 'liderança decisiva', 'empresas próprias', 'generosidade estratégica', 'autoridade natural'],
      reversed: ['autoritarismo', 'tirania do impulso', 'gasto de pessoas', 'megalomania', 'imprevisibilidade do chefe'],
    },
    history:
      'Waite mostra o rei de Paus com salamandra no ombro, sol nascente atrás do trono e um pau de cabeça de salamandra — combinação tardia de símbolos solares e ígneos que fixa a leitura de fundador, não de administrador.',
    meanings: {
      upright:
        'Alguém que vê longe e manda hoje. A carta favorece fundar, assumir comando, negociar de igual para igual, e seguir um líder com experiência de risco. Traz também a capacidade de dar autonomia sem perder controlo.',
      reversed:
        'Poder sem critério: decisões unilaterais, megalomania de projecto, chefia imprevisível e gente queimada no processo. Indica também o fundador que não consegue deixar de escalar.',
    },
    psychology:
      'É a função de governo interno: autoridade integrada, capaz de decidir e responder. Em sombra, o tirano interno que transforma ambição em dívida permanente de resultados.',
    emotional: 'Afeto com protecção, ciúme possessivo contido, pouca tolerância à lentidão.',
    love: 'Parceiro decisivo, protector e com agenda própria; bom para quem quer projecto de vida. Invertido: controlo e imposição de ritmo.',
    career: 'Fundação, reestruturação, comando de crise, negociação de alto nível, investimento de risco calculado. Excelentes conselhos deste arquétipo, péssimos micro-management.',
    finances: 'Gestão de grande escala, investimento em expansão, capacidade de criar valor; risco de sobreposição entre património pessoal e projecto.',
    growth: 'Aceitar que autoridade se prova pelo que se deixa decidir aos outros.',
    spirituality: 'O fogo que se torna sol: poder que dá luz sem pedir licença.',
    obstacles: 'Confundir iniciativa com o direito de decidir pelos outros.',
    opportunities: 'Um aliado com recursos e vontade que destrava o projecto.',
    advice: [
      'Define a visão em uma página e partilha-a antes de mandar executar.',
      'Protege as pessoas do teu próprio impulso de escalar.',
      'Escolhe um contrapeso — alguém com poder de te dizer que não.',
    ],
    reflection: [
      'Decido por análise ou por apetite?',
      'O que aconteceria se eu confiasse a execução a quem contratou?',
      'Que parte do meu poder uso para não parecer vulnerável?',
    ],
    relations: [
      { card: 'major-04-emperor', kind: 'reforca', note: 'Estrutura e iniciativa: governo com visão e com lei.' },
      { card: 'minor-swords-king', kind: 'tensao', note: 'Impulso contra cálculo: dois modos de comando difíceis de conciliar.' },
    ],
    art: {
      scene: 'king-throne-with-sunrise-and-salamanders',
      sky: 'dawn',
      terrain: 'interior',
      glyphs: ['wand-throne', 'sun-rays', 'salamander', 'scepter', 'globe'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['trono com salamandras', 'sol nascente na cortina', 'pau de cabeça de lagarto', 'figura sentada com mantos de duas cores'],
      reading: [
        'O sol nascente atrás do trono indica que o governo se mede pelo que se começa, não pelo que se guarda.',
        'O pau bifurcado na mão mostra comando com ramificação: delegação estruturada.',
        'As salamandras nos braços do trono são o fogo que não o consome.',
      ],
    },
    a11y: {
      alt: 'Carta Rei de Paus: figura coroada sentada num trono decorado com salamandras, com um sol nascente ao fundo, segurando um pau com extremidade bifurcada.',
      long:
        'Interior com cortinado e disco solar baixo ao centro do fundo. Centro: figura de barba com coroa, vestido com túnica amarela e manto vermelho, trono com duas salamandras nos braços, pau de cabeça de lagarto na mão direita, mão esquerda em gesto aberto. Moldura com o rótulo de rei de Paus.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Fogo do Fogo'],
  },
]
