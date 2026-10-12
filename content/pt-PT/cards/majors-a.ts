import type { CardSource } from '../../../src/domain/types.ts'

/**
 * Arcanos Maiores 0–X.
 * Convenção de numeração: RWS (A Força = VIII, A Justiça = XI). A variante
 * de Marselha (Justiça = VIII, Força = XI) está documentada em `traditionNote`
 * de cada uma das duas cartas, e o motor aceita ambas via `numberingConvention`.
 */
export const MAJORS_A: CardSource[] = [
  {
    id: 'major-00-fool',
    arcana: 'major',
    suit: null,
    number: 0,
    rank: null,
    name: { pt: 'O Louco', intl: 'The Fool' },
    archetype: 'O eterno iniciante / salto de fé',
    element: 'spirit',
    astro: 'Urano (moderna); elemento Ar em estado puro',
    gdTitle: 'O Louco — o Ar do Espírito, o Homem do Desejo',
    traditionNote:
      'Caminho hebraico de Aleph (Kether → Chokmah). Sem número ou número 0, conforme a tradição; o Tarot de Marselha não o numerava.',
    keywords: {
      upright: ['início livre', 'espontaneidade', 'confiança', 'risco calculado', 'inocuidade', 'possibilidade'],
      reversed: ['imprudência', 'dispersão', 'medo de começar', 'ingenuidade', 'fuga'],
    },
    history:
      'Nas baralhas do século XV o "matto" era a carta-brião, fora da série, usada como curinga em jogos. Só no século XVIII os ocultistas de Paris e Londres lhe atribuíram o Zero — o princípio indiferenciado antes da criação — e o colocaram à frente do Mago numa viagem iniciática. A imagem do caminhante à beira do abismo, com um cão que o adverte ou o devora, aparece tanto em gravuras alemãs como no Rider-Waite-Smith, mostrando uma linhagem iconográfica estável.',
    meanings: {
      upright:
        'O Louco abre espaço para um começo que ainda não tem plano. Não é tolice: é a disponibilidade de quem aceita caminhar sem garantia. Indica que a pergunta se resolve mais pela coragem de partir do que pela acumulação de informação, e traz uma energia de principiante capaz de contornar regras que já não fazem sentido para ti.',
      reversed:
        'Invertido, o mesmo impulso perde o chão. Ou há pressa sem atenção — um salto que ignora o abismo —, ou há medo disfarçado de prudência, a adiar indefinidamente o primeiro passo. Também descreve quem repete recomeços para nunca ter de sustentar nada até ao fim.',
    },
    psychology:
      'Representa o que Jung chamou a função inferior em estado livre: o lado da psique que ainda não foi treinado pela persona e por isso age sem estratégia. É a voz que pede novidade quando o Eu já decidiu tudo. Em terapia, aparece como a resistência a comprometer-se com um caminho que se torna definitivo demasiado depressa.',
    emotional:
      'Leveza, entusiasmo infantil, uma ansiedade fina misturada com excitação. A afetividade ainda não se fixou em objeto: está disponível para qualquer coisa.',
    love:
      'Pede relação que não se leve demasiado a si mesma: humor, imprevisibilidade, liberdade de movimento. Em singles, sugere que o próximo encontro acontece fora do roteiro. Em casal, alerta contra a fuga sempre que a conversa fica pesada.',
    career:
      'Bom presságio para projetos sem histórico — um primeiro trabalho, uma mudança de área, um portfólio iniciado do zero. Exige aceitação de remuneração menor em troca de aprendizagem, e que se defina uma data-limite para não ficar para sempre em fase experimental.',
    finances:
      'Despesa impulsiva é o risco; a oportunidade está em gastar em experiência e ferramentas, não em aparências. Evita compromissos plurianuais assinados no entusiasmo deste dia.',
    growth:
      'O exercício é distinguir coragem de fuga: perguntar se a partida de hoje resolve ou apenas adia. A carta recompensa quem começa pequeno e mantém o movimento.',
    spirituality:
      'O zero é também a perfeição não manifestada. Convida a uma prática sem objetivo — sentar sem pedir resultado, rezar sem pedir nada — e a confiar no sustento do caminho enquanto se caminha.',
    obstacles:
      'A recusa de estrutura: começar cinco coisas e fechar nenhuma, confundindo liberdade com falta de consequência.',
    opportunities:
      'Um começo ainda não contaminado por expectativas, com margem para errar barato e aprender depressa.',
    advice: [
      'Dá o primeiro passo antes de ter o mapa completo — mas define já o ponto onde pararás a avaliar.',
      'Escolhe uma única experiência nova para esta semana, em vez de anunciar uma vida diferente.',
      'Leva contigo o cão da carta: uma pessoa prática que te avise quando o chão acabar.',
    ],
    reflection: [
      'O que é que estou a adiar com o pretexto de precisar de mais preparação?',
      'Esta vontade de partir é um chamado ou uma fuga? Que prova tenho de cada leitura?',
      'Onde na minha vida a minha inexperiência é vantagem em vez de falha?',
    ],
    relations: [
      {
        card: 'major-01-magician',
        kind: 'continuidade',
        note: 'O Louco traz a intenção, o Mago traz o instrumento; juntos descrevem um começo que se materializa.',
      },
      {
        card: 'major-13-death',
        kind: 'complementa',
        note: 'Ambos encerram uma identidade; a Morte termina, o Louco reinicia.',
      },
      {
        card: 'major-07-chariot',
        kind: 'tensao',
        note: 'Direção contra deriva — a tensão entre vontade orientada e impulso livre.',
      },
    ],
    art: {
      scene: 'fool-at-cliff-edge',
      sky: 'dawn',
      terrain: 'cliff',
      glyphs: ['fool-bindle', 'cliff-edge', 'dog', 'rose', 'sun-rays'],
      palette: ['#C6A66B', '#56C5BD', '#EFE6D6'],
      motifs: ['figura de perfil', 'o sol nascente às costas', 'o abismo aberto', 'o cão saltando', 'o fardo vazio'],
      reading: [
        'A montanha não termina: o caminho interrompe-se, o que indica que a viagem não é geográfica.',
        'A figura olha para cima e anda para a frente — atenção ao céu, descuido ao solo.',
        'O fardo contém apenas o que foi aprendido até aqui, não o que ainda falta aprender.',
        'O cão aparece a meio do salto: o instinto e a memória corporal avisam, mas não mandam.',
      ],
    },
    a11y: {
      alt: 'Carta O Louco: uma figura jovem de perfil caminha para a beira de um penhasco, com um pequeno cão a saltar à sua frente e um sol baixo a nascer atrás.',
      long:
        'Ilustração em tons de dourado e turquesa. Fundo de amanhecer sobre abismo; à direita a beira de rocha cortada a prumo. Centro: figura com túnica clara, braços abertos, olhar dirigido ao alto, saco fino ao ombro. À esquerda, cão pequeno em salto. No topo esquerdo, um sol em raios curtos. Moldura dourada com numeração zero no canto superior.',
    },
    sources: ['Golden Dawn – atribuições de Tarot (Mathers)', 'Place, The Tarot – história do matto', 'Jung, A Psicologia da Transferência (arquétipo do Puer)'],
  },
  {
    id: 'major-01-magician',
    arcana: 'major',
    suit: null,
    number: 1,
    rank: null,
    name: { pt: 'O Mago', intl: 'The Magician' },
    archetype: 'Vontade canalizada / artesão do real',
    element: 'air',
    astro: 'Mercúrio',
    gdTitle: 'O Mago do Poder',
    traditionNote: 'Caminho de Beth (Kether → Binah): a primeira diferenciação, o "verbo" que organiza. Mercúrio dá-lhe o caráter de mediação e técnica.',
    keywords: {
      upright: ['vontade', 'recurso disponível', 'início deliberado', 'comunicação eficaz', 'magia prática'],
      reversed: ['manipulação', 'talento disperso', 'autoengano', 'charlatanismo', 'bloqueio criativo'],
    },
    history:
      'Também chamado Le Bateleur ("o jogador de mesa") na família de Marselha, é o primeiro na ordem dos triunfos e representa o ilusionista de banca, aquele que vive do gesto e da palavra. A releitura do século XIX fundiu o prestidigitador com o mago cerimonial: a mesa tornou-se altar e os quatro objetos na borda — espada, copo, pau, moeda — passaram a ler-se como os quatro naipes e os quatro elementos dominados pela vontade.',
    meanings: {
      upright:
        'Tens já tudo o que é preciso: a carta afirma que a pergunta não se resolve com mais informação, mas com direção. O Mago é a diferença entre querer e decidir querer. Anuncia um período favorável a executar, negociar, ensinar, escrever e transformar intenção em procedimento.',
      reversed:
        'A vontade desliga-se da palavra ou a palavra desliga-se do facto. Aparece como talento desperdiçado em demonstrações sem resultado, ou como manipulação — em ti ou sobre ti. É também o sinal clássico de alguém que promete o que o método não sustenta.',
    },
    psychology:
      'É a função racional em modo ativo: instrumento do ego que separa, nomeia e dirige. Saúdavelmente é agência e competência percebida; patologicamente torna-se controlling — a ilusão de que nomear é possuir. Em sonhos, surge como figura que ensina um truque: o inconsciente a mostrar-te uma ferramenta que ainda não integraste.',
    emotional:
      'Entusiasmo focado, prazer na destreza. Em inversão, a excitação de impressionar em lugar da satisfação de fazer.',
    love:
      'Sedução consciente e boa conversa: a relação melhora quando há iniciativa clara e palavras explícitas. Invertido, alerta para script, jogo de espelhos ou promessas fabricadas — sobretudo quando a outra pessoa impressiona mais do que sustenta.',
    career:
      'Momento forte para apresentação, pitch, contratação e arranque de projeto próprio. O sucesso depende de dominar a ferramenta certa e de não dispersar o talento em demonstrações paralelas.',
    finances:
      'Rendimento vem de habilidade aplicada, não de sorte. Boa fase para monetizar competência, renegociar honorários e limpar gastos que sustentam imagem, não resultado.',
    growth:
      'A lição é o compromisso com um só instrumento até à mestria: escolher uma disciplina e sustentar a prática diária é a magia deste arcano.',
    spirituality:
      '"Assim na Terra como no Céu": o Mago é a carta da correspondência. Recorda que ritual é técnica de atenção — o gesto repetido com intenção reorganiza o desejo.',
    obstacles:
      'Confundir domínio com posse: querer controlar pessoas e resultados em vez de conduzir o processo.',
    opportunities:
      'Um recurso que já está na tua mesa e ainda não foi usado — uma competência, contacto ou ferramenta que destrava o projeto.',
    advice: [
      'Define uma única intenção para a semana e escreve os quatro passos que a realizam.',
      'Fala com clareza antes de falar bonito: nesta fase a precisão vale mais que o efeito.',
      'Guarda uma prova verificável do teu trabalho (número, registo, feedback) para não te alimentares de autoelogio.',
    ],
    reflection: [
      'O que é que eu quero que aconteça — e o que estou disposto a fazer que ninguém verá?',
      'Este meu talento está a construir algo ou a produzir aplauso?',
      'Que promessa minha ainda não tem método?',
    ],
    relations: [
      { card: 'major-00-fool', kind: 'continuidade', note: 'A intenção do Louco recebe aqui forma e ferramenta.' },
      {
        card: 'major-07-chariot',
        kind: 'reforca',
        note: 'Vontade mais disciplina: combinação de execução rápida e direção sustentada.',
      },
      {
        card: 'major-15-devil',
        kind: 'tensao',
        note: 'Poder técnico ao serviço do desejo ilimitado — a mesma destreza pode libertar ou acorrentar.',
      },
    ],
    art: {
      scene: 'magician-at-altar',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['magician-table', 'cup-wand', 'sword-blade', 'pentacle-coin', 'infinity-top', 'rose', 'lily'],
      palette: ['#C6A66B', '#4A1F39', '#EFE6D6'],
      motifs: ['braço erguido com bastão', 'altar com quatro objetos', 'infinito sobre a cabeça', 'jardim atrás', 'manto vermelho'],
      reading: [
        'O braço levantado e o bastão apontado ao céu descrevem a intenção antes da ação.',
        'Os quatro instrumentos no altar são os quatro naipes: todos os recursos já estão presentes.',
        'O símbolo de infinito sobre a testa não é poder — é correspondência aprendida.',
        'Rosas e lírios no jardim indicam que o desejo e o discernimento têm de crescer juntos.',
      ],
    },
    a11y: {
      alt: 'Carta O Mago: figura de pé diante de um altar com quatro instrumentos, um braço levantado a segurar um bastão e um símbolo de infinito sobre a cabeça.',
      long:
        'Composição vertical com jardim ao fundo. Centro, figura em manto vermelho com túnica branca, pé esquerdo adiantado; braço direito elevado segurando um bastão curvo. À frente, mesa estreita com copo, espada, moeda e pau. Sobre a cabeça, arco de dois anéis entrelaçados. Moldura dourada com o numeral I.',
    },
    sources: ['Marseille – Le Bateleur', 'Golden Dawn – Mercúrio e o poder da palavra', 'Decker/Dummett, A History of the Occult Tarot'],
  },
  {
    id: 'major-02-high-priestess',
    arcana: 'major',
    suit: null,
    number: 2,
    rank: null,
    name: { pt: 'A Sacerdotisa', intl: 'The High Priestess' },
    archetype: 'Saber implícito / guardiã do limiar',
    element: 'water',
    astro: 'Lua',
    gdTitle: 'A Sacerdotisa da Estrela de Prata',
    traditionNote: 'Caminho de Gimel (Kether → Tiphareth), a "ponte" que atravessa o abismo. Em Itália chamava-se La Papessa, talvez ligada à lenda da papisa Joana.',
    keywords: {
      upright: ['intuição', 'silêncio ativo', 'conhecimento não dito', 'ritmo interior', 'mistério protegido'],
      reversed: ['segredo mal guardado', 'desconexão interior', 'intuição abafada', 'rigidez', 'informação oculta'],
    },
    history:
      'Nas baralhas viscontinas aparece como uma dama com livro e véu, sem nome próprio; a tradição erudita oscilou entre a sibila, a papisa e Isis velada. Foi o romantismo ocultista do século XIX que consolidou o par de pilares — Boaz e Jachin — e o véu coberto de romãs, transformando a figura na guardiã do conhecimento que só se revela a quem sabe esperar.',
    meanings: {
      upright:
        'A resposta existe, mas ainda não pode ser dita nem ouvida. A Sacerdotisa pede que confies no que já sabes sem prova imediata e que não forces o calendário das coisas. É a carta do intervalo fértil: observar, anotar, deixar assentar.',
      reversed:
        'Algo foi escondido — a ti ou por ti — e a assimetria de informação está a custar caro. Também descreve a pessoa que perdeu o contacto com o próprio ritmo e passou a decidir por ruído alheio, ou que transformou discrição em secretismo.',
    },
    psychology:
      'É o inconsciente enquanto função de percepção, não de conteúdo: o modo como se recebe material subliminar antes da formulação. Jung associaria ao lado feminino da psique em homens (anima) e à relação da mulher com o saber não validado. A inversão é típica de quem foi ensinado que sentir é pouco confiável.',
    emotional:
      'Calma profunda com uma corrente de fundo. Afetos não confessados, ternura contida, nostalgia sem objeto definido.',
    love:
      'Fala de ligações que se constroem por presença e confiança, não por declaração. Pode indicar amor não confessado ou uma relação em que se sabe mais do que se diz. Em inversão: sinais ignorados ou segredos que deviam ser conversados.',
    career:
      'Vantagem em funções de análise, investigação, arquivo, curadoria e escuta clínica. Não é momento para campanhas públicas — é altura para estudar, preparar documentos, esperar a janela de negociação.',
    finances:
      'Há informação relevante por descobrir antes de decidir; revisão de contratos e letras miúdas. Boas poupanças silenciosas, más apostas baseadas em "dicas".',
    growth:
      'Construir confiança no próprio julgamento através de registo: anotar intuições, voltar a elas em trinta dias e avaliar a taxa de acerto.',
    spirituality:
      'A prática é a escuta: meditação receptiva, leitura lenta, sonho trabalhado em diário. A Sacerdotisa não pede fé, pede paciência com o que ainda não tem palavras.',
    obstacles:
      'Exigir prova imediata para aquilo que só se confirma com tempo, ou usar a discrição como pretexto para não responder.',
    opportunities:
      'Um saber acumulado e invisível — experiência não certificada — que pode ser convertido em método.',
    advice: [
      'Reserva trinta minutos diários de silêncio sem telemóvel; é onde esta carta trabalha.',
      'Antes de decidir, escreve o que sabes e o que suspeitas, separando as duas colunas.',
      'Não reveles o que ainda está em formação: protege o projeto até ter forma.',
    ],
    reflection: [
      'Que coisa eu já sei e ainda não admiti em voz alta?',
      'O meu silêncio atual é prudência ou medo de falar?',
      'Que sinal ignorei nas últimas semanas e por quê?',
    ],
    relations: [
      {
        card: 'major-01-magician',
        kind: 'complementa',
        note: 'O Mago fala, a Sacerdotisa sabe: a leitura torna-se completa quando gesto e escuta se alinham.',
      },
      {
        card: 'major-17-star',
        kind: 'reforca',
        note: 'Duas cartas de confiança silenciosa; juntas indicam cura sem pressa.',
      },
      {
        card: 'major-18-moon',
        kind: 'sombra',
        note: 'Intuição lúcida contra intuição confundida com projeção: a fronteira é o véu.',
      },
    ],
    art: {
      scene: 'priestess-between-pillars',
      sky: 'night',
      terrain: 'interior',
      glyphs: ['highpriestess-veil', 'pillars-pair', 'pomegranate', 'crescent-moon', 'book-open', 'lily'],
      palette: ['#11172A', '#C6A66B', '#56C5BD'],
      motifs: ['dois pilares', 'véu com romãs', 'livro no regaço', 'lua aos pés', 'cruz no peito'],
      reading: [
        'Os dois pilares não barram a passagem: marcam-na. O acesso exige travessia, não demolição.',
        'O livro está meio escondido sob o manto — o saber que se recebe, não o que se exibe.',
        'A lua crescente aos pés coloca o ritmo, não o poder, como fundamento.',
        'As romãs do véu são fertilidade fechada: conteúdo pronto a abrir, ainda sem tempo.',
      ],
    },
    a11y: {
      alt: 'Carta A Sacerdotisa: figura sentada entre duas colunas, com manto azul coberto de pequenos frutos, um livro pousado no regaço e uma lua crescente aos pés.',
      long:
        'Cena de interior noturno com eixo simétrico. Duas colunas escuras ladeiam um trono baixo. A figura está sentada, mãos sobre um livro fechado, corpo parcialmente coberto por véu bordado com romãs. Aos pés, crescente lunar dourado. Atrás, água escura e quieta. Moldura com o numeral II.',
    },
    sources: ['Visconti-Sforza – La Papessa', 'Golden Dawn – Gimel e o equilíbrio', 'Jung, A Função Transcendente (função receptiva)'],
  },
  {
    id: 'major-03-empress',
    arcana: 'major',
    suit: null,
    number: 3,
    rank: null,
    name: { pt: 'A Imperatriz', intl: 'The Empress' },
    archetype: 'Germinação / nutrição abundante',
    element: 'earth',
    astro: 'Vénis',
    gdTitle: 'A Filha dos Portadores da Luz',
    traditionNote: 'Caminho de Daleth (Chokmah → Binah), a "rainha do campo". Associada a Vénis e, em leituras antigas, a Vénus-Astarte e à Grande Mãe.',
    keywords: {
      upright: ['gestação', 'abundância', 'corpo', 'criação fértil', 'prazer legítimo', 'cuidado'],
      reversed: ['dependência', 'esterilidade criativa', 'excesso de zelo', 'negligência de si', 'consumo'],
    },
    history:
      'Herdeira da "Imperatrix" das baralhas italianas, provavelmente inspirada em retratos de Lucrezia Alidosi, carrega desde cedo o ceptro, a águia heráldica e o campo trigo. Os simbolistas acrescentaram o grão, os rios e o escudo com Vénus, fixando-a como princípio de fertilidade material — o oposto complementar e necessário da Virgem velada que a precede.',
    meanings: {
      upright:
        'Algo está a crescer e precisa de condições, não de pressão. A Imperatriz favorece corpo, casa, terra, afeto e projetos com matéria: comida, roupa, jardim, bebé, livro impresso, produto terminado. É a carta do resultado agradável de um trabalho bem nutrido.',
      reversed:
        'O cuidado voltou-se todo para fora e não sobra nada para quem cuida. Descreve também criação bloqueada por perfeccionismo, excesso que engorda em vez de alimentar, e relação de dependência travestida de generosidade.',
    },
    psychology:
      'Representa a relação com a mãe interior e com a própria capacidade de se dar sustento emocional. Em equilíbrio, é autoafirmação sem agressão; em sombra, é a exigência de ser necessária como prova de valor, ou a identificação da identidade com o corpo e a fertilidade.',
    emotional:
      'Aconchego, sensualidade tranquila, alegria de partilhar mesa e cama. Em inversão, fome afetiva disfarçada de fartura.',
    love:
      'Relação com corpo, rotina doce e desejo de construir ninho; excelente para engravidar, casar ou simplesmente morar junto. Invertida, pede atenção a relações onde um dá e o outro acumula, e à sedução que se transforma em necessidade de aprovação.',
    career:
      'Produtos, serviços e equipas que já existem rendem melhor do que novos lançamentos. Favorece moda, alimentação, bem-estar, educação, imobiliário e gestão de pessoas. Há margem para crescer com calma.',
    finances:
      'Fase de acumulação por consistência: investimento em ativo real, casa, formação, ferramentas duradouras. O risco é o conforto compulsivo — gastar para se acalmar.',
    growth:
      'Aprender a receber: a Imperatriz também ensina que deixar-se cuidar é prática, não fraqueza. Cuida do corpo como pré-condição de tudo o resto.',
    spirituality:
      'Espiritualidade encarnada: ritmos de estação, oferendas simples, bênção dos alimentos, celebração. Recusa a ideia de que o espírito se serve desprezando a matéria.',
    obstacles:
      'Transformar o cuidado em controlo, ou a abundância em entorpecimento — excesso que anestesia em vez de nutrir.',
    opportunities:
      'Um projeto em gestação que está pronto a nascer se lhe deres recursos, visibilidade e tempo.',
    advice: [
      'Garante primeiro o básico (sono, comida, dinheiro) e só depois amplias o projeto.',
      'Faz uma coisa concreta pelo corpo hoje: é o canal por onde esta carta trabalha.',
      'Corta um gesto de cuidado que já só te drena — nutrir todos não é nutrir tudo.',
    ],
    reflection: [
      'O que estou a criar que ainda não me pertence a mim?',
      'Recebo com a mesma facilidade com que dou?',
      'Que excesso meu está a disfarçar uma falta?',
    ],
    relations: [
      { card: 'major-02-high-priestess', kind: 'complementa', note: 'Espírito que gesta matéria; silêncio e fartura formam o par feminino completo.' },
      {
        card: 'major-04-emperor',
        kind: 'complementa',
        note: 'Terra fértil e fronteira: o par clássico entre natureza e instituição.',
      },
      {
        card: 'major-08-strength',
        kind: 'reforca',
        note: 'Nutrir e sustentar sem violência: força suave em série.',
      },
    ],
    art: {
      scene: 'empress-in-wheat-field',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['empress-throne', 'wheat', 'heart-venus', 'star-eight', 'river-band', 'rose'],
      palette: ['#C6A66B', '#4A1F39', '#56C5BD'],
      motifs: ['coroa de doze estrelas', 'campo de trigo', 'rio ao fundo', 'escudo com símbolo de Vénis', 'trono entre árvores'],
      reading: [
        'A coroa de doze estrelas é o ciclo completo, não ostentação: a rainha governa o calendário.',
        'O trigo maduro à frente do trono marca o tempo da colheita, já iniciado.',
        'O rio que atravessa o vale mostra nutrição contínua, não chuva súbita.',
        'O escudo com o círculo e a cruz é Vénis: valor afectivo como arma de governo.',
      ],
    },
    a11y: {
      alt: 'Carta A Imperatriz: mulher coroada com doze estrelas sentada num trono baixo, com um campo de trigo maduro à frente e um rio a atravessar o vale.',
      long:
        'Paisagem luminosa de plano aberto. Centro: figura sentada de vestido comprido, ceptro na mão direita, escudo redondo com símbolo de Vénis ao lado. Primeiro plano ocupado por espigas de trigo em dourado. A meio, faixa de água clara; ao fundo, arvoredo. Moldura com o numeral III.',
    },
    sources: ['Visconti – Imperatrix', 'Golden Dawn – Daleth e Vénis', 'Baldini, La simbologia dei Tarocchi'],
  },
  {
    id: 'major-04-emperor',
    arcana: 'major',
    suit: null,
    number: 4,
    rank: null,
    name: { pt: 'O Imperador', intl: 'The Emperor' },
    archetype: 'Estrutura / lei que protege',
    element: 'fire',
    astro: 'Áries',
    gdTitle: 'O Filho dos Patriarcas',
    traditionNote: 'Caminho de Heh (Binah → Chesed), o "pai" que dá forma ao que a mãe gerou. Trono de carneiro, correlação com Áries e Marte.',
    keywords: {
      upright: ['ordem', 'autoridade legítima', 'limite', 'estratégia', 'responsabilidade', 'instituição'],
      reversed: ['rigidez', 'dominação', 'lei arbitrária', 'controle', 'ausência de estrutura'],
    },
    history:
      'Nas famílias Visconti e Sforza o Imperador surge armado, a cavalo ou em trono com orbe e ceptro, retrato tanto do Sacro Império como da função régia. A cabeça de carneiro no braço do trono aparece no século XIX, quando as atribuições astrológicas foram aplicadas às figuras do baralho, fixando-lhe o temperamento áriano.',
    meanings: {
      upright:
        'O que precisa de regras para existir. O Imperador diz que um acordo, um horário, um orçamento ou um estatuto — escritos e assinados — vão aumentar a tua liberdade, não diminuí-la. Fala de assumir autoridade sem a usar para humilhar.',
      reversed:
        'A estrutura deixou de proteger e passou a aprisionar: excesso de controlo, hierarquia que não responde, ou falta total de limites internos. Costuma apontar um conflito de autoridade mal resolvido, frequentemente com pai, chefe ou Estado.',
    },
    psychology:
      'É a função paterna interna: lei, nome, proibição e, sobretudo, capacidade de sustentar decisões incómodas. Em excesso produz tirania do superego e trabalho compulsivo; em falta, deixa o sujeito sem espinha dorsal para dizer não — inclusive a si.',
    emotional:
      'Contenção, orgulho discreto, afeto expresso através de actos de provisão, menos de palavra. Em inversão, frieza ou irritação por perda de controlo.',
    love:
      'Busca estabilidade, papel claro, projecto comum; pode ler-se como pedido de compromisso formal ou como sinal de parceiro provedor e pouco verbal. Invertido, cuidado com relações em que o poder não se discute.',
    career:
      'Carta de chefia, de empresa estruturada e de regras escritas. Boa fase para organizar equipa, estabelecer política e assumir decisão difícil; péssima para improvisar sem aprovação.',
    finances:
      'Orçamento, garantias, prazos e contratos. O Imperador favorece quem planeia e reserva, desfavorece quem confia em verbal.',
    growth:
      'Construir autoridade pessoal: não obedecer sem perguntar porquê, nem desobedecer por princípio. Aprender a sustentar o "não" dito ontem.',
    spirituality:
      'A dimensão da disciplina e da ortopraxia: regras que sustentam a prática, calendário, jejum, ritual com forma fixa. O aviso é não confundir forma com verdade.',
    obstacles:
      'Confundir controlo com segurança — quanto mais se aperta, mais se perde.',
    opportunities:
      'Um cargo, uma aliança institucional ou uma regra interna que, adoptada, destrava o crescimento.',
    advice: [
      'Escreve a regra — para ti ou para a equipa — e publica-a: o que fica implícito não pode ser questionado.',
      'Executa hoje a decisão mais difícil e já adiada.',
      'Verifica se a autoridade que obedeces tem mandato real.',
    ],
    reflection: [
      'Que estrutura a minha vida precisa para crescer, e estou a recusar por gosto de liberdade?',
      'Onde uso cuidado como disfarce para controlo?',
      'Que limite meu preciso de sustentar sem me explicar?',
    ],
    relations: [
      { card: 'major-03-empress', kind: 'complementa', note: 'Germinação e fronteira: sem a lei, a abundância dispersa-se.' },
      { card: 'major-05-hierophant', kind: 'reforca', note: 'Poder e doutrina juntos: instituição consolidada, para melhor ou pior.' },
      { card: 'major-16-tower', kind: 'tensao', note: 'A torre vem sempre questionar o trono que se fechou sobre si próprio.' },
    ],
    art: {
      scene: 'emperor-on-stone-throne',
      sky: 'dusk',
      terrain: 'mountain',
      glyphs: ['emperor-seat', 'ram-head', 'armor', 'scepter', 'globe', 'mountain-peak'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['trono de pedra', 'cabeças de carneiro nos braços', 'armadura parcial', 'montanha seca atrás', 'orbe e ceptro'],
      reading: [
        'O trono é rocha, não madeira: a legitimidade aqui vem do que resiste ao tempo.',
        'As cabeças de carneiro nos braços do trono marcam Áries — iniciativa sob disciplina.',
        'O vale seco atrás é território conquistado e ainda por habitar.',
        'O orbe na mão esquerda limita o poder: governa-se o que se tem, não tudo.',
      ],
    },
    a11y: {
      alt: 'Carta O Imperador: homem barbado com armadura sentado num trono de pedra decorado com cabeças de carneiro, segurando um ceptro e um orbe, com montanhas áridas ao fundo.',
      long:
        'Composição frontal sólida, luz de fim de tarde. Centro, figura sentada em bloco de pedra esculpida, braços do trono terminados em protomes de carneiro; braço direito com orbe esférico, esquerdo com ceptro curto. Ao fundo, montanhas sem vegetação e céu em degradê. Moldura com o numeral IV.',
    },
    sources: ['Sola-Busca e Visconti', 'Golden Dawn – Heh, Marte/Áries', 'Court de Gébelin, Monde primitif'],
  },
  {
    id: 'major-05-hierophant',
    arcana: 'major',
    suit: null,
    number: 5,
    rank: null,
    name: { pt: 'O Hierofante', intl: 'The Hierophant / The Pope' },
    archetype: 'Transmissão / doutrina e consenso',
    element: 'earth',
    astro: 'Touro',
    gdTitle: 'O Magus da Eterna Sabedoria',
    traditionNote: 'Caminho de Vav (Chesed → Geburah). Chamado "O Papa" em Marselha e em Milão; o nome "Hierofante" foi introduzido por Court de Gébelin em 1780.',
    keywords: {
      upright: ['tradição', 'ensino', 'rito', 'legitimidade', 'pertença', 'conselho de alguém experiente'],
      reversed: ['dogmatismo', 'conformidade', 'abuso de autoridade', 'ruptura com a escola', 'heresia fértil'],
    },
    history:
      'O "Pape" das baralhas italianas representava a segunda autoridade da cristandade latina ao lado do Imperador — a carta é, antes de mais, um retrato do poder de dar sentido público. A mudança de nome para Hierofante nos rituais de Elêusis veio de Court de Gébelin e foi adoptada pelos maçons e pela Golden Dawn, deslocando o sentido de instituição religiosa para iniciação.',
    meanings: {
      upright:
        'O caminho aprovado existe e encurta tempo. Esta carta favorece aprender com quem já passou pelo mesmo, formalizar (casamento, certificação, contrato), seguir protocolo e pedir conselho a uma figura experiente. Não exige fé; exige respeito por método.',
      reversed:
        'A doutrina virou prisão. Indica rutura com uma instituição, escola, família ou igreja que deixaste de respeitar, ou a descoberta de que quem ensina não pratica. Também anuncia aprendizagem fora do currículo formal.',
    },
    psychology:
      'É o superego culturalizado — as vozes internalizadas de mestre, pai espiritual e norma social. Positivamente dá sentido partilhável; em sombra produz a culpa importada, o "dever" que ninguém assinou.',
    emotional:
      'Dever, lealdade, conforto de pertença; em inversão, sufoco e solidão de quem rompeu com os seus.',
    love:
      'Compromisso reconhecido publicamente — casamento, união formal, bênção da família — e valores partilhados como base. Invertido: relação que a família não aceita, ou pressão de um modelo de vida que não é vosso.',
    career:
      'Favorece formação, certificação, instituições de ensino, organizações com hierarquia e protocolos, e mentoria. Excelente para ensinar; péssimo para improvisar procedimentos regulamentados.',
    finances:
      'Segurança vem de estrutura: reforma, seguros, contas conjuntas, aconselhamento qualificado. Cuidado com pagar por títulos que não dão acesso a nada.',
    growth:
      'Resolver a relação com a autoridade moral: honrar o que a tradição deu, escolher conscientemente o que rejeitar, sem ficar entre os dois.',
    spirituality:
      'Carta da ortodoxia — comunidade, liturgia, catequese, linhagem. Em boas condições, protege do espiritual solipsista; em más, transforma fé em pertença.',
    obstacles:
      'Confundir consenso com verdade, ou seguir a regra para não assumir a decisão.',
    opportunities:
      'Um mestre, uma escola ou um ritual que abre uma porta que sozinho não abres.',
    advice: [
      'Aprende o método antes de o criticar; só depois o adaptes.',
      'Formaliza por escrito aquilo que hoje só existe como acordo verbal.',
      'Escolhe uma pessoa com percurso comprovado e pede-lhe uma hora.',
    ],
    reflection: [
      'Que regra sigo só porque a herdei, e que decisão estou a delegar num consenso?',
      'O que é que a minha comunidade me deu e o que me custou?',
      'A quem reconheço autoridade para me ensinar e porquê?',
    ],
    relations: [
      { card: 'major-04-emperor', kind: 'reforca', note: 'Trono e altar: poder político e poder simbólico alinhados.' },
      {
        card: 'major-02-high-priestess',
        kind: 'espelho',
        note: 'Saber transmitido e saber recebido em silêncio, exterior e interior, em confronto.',
      },
      {
        card: 'major-15-devil',
        kind: 'sombra',
        note: 'Doutrina que acorrenta: o mesmo ritual pode libertar ou escravizar.',
      },
    ],
    art: {
      scene: 'hierophant-enthroned-between-pillars',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['hierophant-keys', 'triple-crown', 'pillars-pair', 'hand-two', 'book-open', 'rose-window'],
      palette: ['#EFE6D6', '#C6A66B', '#4A1F39'],
      motifs: ['tríplice coroa', 'duas chaves cruzadas', 'mãos em bênção', 'dois acólitos ajoelhados', 'janela rosácea'],
      reading: [
        'As duas chaves cruzadas à frente abrem a porta do sentido, não a do poder.',
        'A mão levantada em bênção tem os dedos dispostos em dois pares: exoterismo e esoterismo.',
        'Os dois acólitos ajoelhados mostram que a função existe porque há quem receba.',
        'A janela rosácea ao fundo marca que a doutrina é apenas uma das formas da luz.',
      ],
    },
    a11y: {
      alt: 'Carta O Hierofante: personagem de tríplice coroa sentado entre duas colunas, com duas chaves cruzadas no regaço e mão levantada em bênção, diante de dois discípulos ajoelhados.',
      long:
        'Interior de basílica, luz vinda de uma janela circular ao fundo. Centro: figura em trono entre dois pilares, vestido litúrgico vermelho e capa clara, tiara de três coroas, mão direita erguida com dois dedos levantados duas vezes, duas chaves cruzadas na esquerda. Ao primeiro plano, duas figuras de mãos postas. Moldura com numeral V.',
    },
    sources: ['Marseille – Le Pape', 'Court de Gébelin, Monde primitif (1780)', 'Golden Dawn – Vav e Touro'],
  },
  {
    id: 'major-06-lovers',
    arcana: 'major',
    suit: null,
    number: 6,
    rank: null,
    name: { pt: 'Os Enamorados', intl: 'The Lovers' },
    archetype: 'Escolha do coração / união consciente',
    element: 'air',
    astro: 'Gémeos',
    gdTitle: 'Os Filhos da Voz — Os Amantes',
    traditionNote:
      'Caminho de Zayin (Chesed → Tiphareth). Nas baralhas italianas era "Gli Amanti" — o noivo e a mãe da noiva, não o casal romântico: a carta era sobre aliança familiar e escolha.',
    keywords: {
      upright: ['aliança', 'escolha de valores', 'atração consciente', 'união de opostos', 'compromisso'],
      reversed: ['indecisão', 'desalinhamento', 'relação simbiótica', 'traição de valores', 'triângulo'],
    },
    history:
      'O tarot de Marselha mostra um homem entre duas mulheres — uma velha e uma jovem — e a leitura corrente transformou a cena em alegoria moral da escolha. Só no século XX, com o Rider-Waite-Smith, o casal passou para debaixo do anjo e a carta ganhou o sentido afectivo que hoje lhe damos, reforçado pela correlação geminiana da Golden Dawn.',
    meanings: {
      upright:
        'Uma escolha que não é entre bom e mau, mas entre dois valores legítimos. Esta carta pede alinhamento: o que queres e o que sustentas têm de convergir, porque a união verdadeira é decisão repetida. Anuncia também um vínculo que se declara e, assim, se transforma.',
      reversed:
        'Desalinhamento entre o que se escolheu e o que se deseja, ou decisão adiada que já começou a estragar-se. Aparece em triângulos, em promessas desiguais e em relações que se mantêm por conveniência partilhada, não por escolha renovada.',
    },
    psychology:
      'É o confronto entre desejo e valor, e a função que reconcilia os dois: escolha adulta, não impulsiva. Em sombra, a pessoa divide-se — uma parte compromete-se, outra mantém a porta aberta — e a leitura fica instável por dentro.',
    emotional:
      'Intensidade, vulnerabilidade desejada, euforia de ser escolhido. Em inversão, culpa, nostalgia da opção abandonada, ansiedade de perda.',
    love:
      'O arcano central da afectividade: declarações, reconciliações, decisões de viver juntos. Não garante permanência: garante que a escolha é feita com informação e vontade, e é isso que a sustenta.',
    career:
      'Associações, contratos de sócio, escolha entre duas ofertas, cliente que se torna parceiro. A regra é clara: não assustes o que ainda não discutiste; negoceia antes de prometer.',
    finances:
      'Contas partilhadas exigem transparência; decisão entre dois caminhos de investimento com valores diferentes, não com rentabilidades diferentes.',
    growth:
      'Integrar o que rejeitas em ti, porque é isso que vais continuar a atrair como conflito externo. Escolher é o verbo de aprendizagem desta carta.',
    spirituality:
      'Hierosgamos: a união dos opostos internos (razão/desejo, forma/vazio) como condição da integração, não como metáfora romântica.',
    obstacles:
      'Querer escolher sem perder nada: manter as duas vidas em paralelo até uma delas se desfazer.',
    opportunities:
      'Uma aliança que aumenta os dois lados, se os termos forem ditos antes da união.',
    advice: [
      'Escreve a escolha que estás a adiar e a perda que a acompanha: isso separa medo de prudência.',
      'Na relação, diz o que queres antes de acusar o outro de não adivinhar.',
      'Não tomes decisões afectivas em estado de carência; espera 72 horas.',
    ],
    reflection: [
      'O que estou a escolher quando escolho isto — e o que estou a renunciar?',
      'Esta união aumenta a liberdade dos dois ou só a minha?',
      'Que valor meu está a ser negociado em silêncio?',
    ],
    relations: [
      { card: 'major-02-high-priestess', kind: 'espelho', note: 'Amor escolhido e amor guardado: a mesma lealdade em duas direções.' },
      { card: 'major-10-wheel', kind: 'tensao', note: 'Escolha consciente contra acaso: o que depende de ti e o que não depende.' },
      {
        card: 'minor-cups-02',
        kind: 'reforca',
        note: 'O Dois de Copas é a versão concreta do encontro; juntos indicam vínculo declarado e sustentado.',
      },
    ],
    art: {
      scene: 'lovers-under-angel',
      sky: 'dawn',
      terrain: 'garden',
      glyphs: ['lovers-sun', 'angel-wing', 'flame-pair', 'fig-tree', 'rose', 'path-triple'],
      palette: ['#56C5BD', '#C6A66B', '#EFE6D6'],
      motifs: ['anjo com braços abertos', 'dois nus lado a lado', 'árvore com serpente', 'chama no fundo', 'jardim delimitado'],
      reading: [
        'O anjo no topo não abençoa a paixão: ilumina a decisão, com as mãos abertas.',
        'As duas figuras estão de pé, mas não se tocam — a união aqui é postura, não fusão.',
        'A árvore com a serpente atrás de uma delas recorda que a escolha traz conhecimento e custo.',
        'O jardim não é selvagem: é o espaço delimitado em que se pode escolher com segurança.',
      ],
    },
    a11y: {
      alt: 'Carta Os Enamorados: duas figuras de pé lado a lado num jardim, sob um anjo dourado de braços abertos, com uma árvore e uma serpente de um dos lados.',
      long:
        'Céu claro com figura alada no topo, braços abertos e nuvem leve. Centro-esquerda, figura em pé diante de uma árvore com serpente enrolada no tronco; centro-direita, outra figura em pé diante de uma planta baixa. Chama discreta ao fundo. Moldura com o numeral VI.',
    },
    sources: ['Marseille – Les Amoureux', 'Visconti – gli Amanti (aliança familiar)', 'Golden Dawn – Zayin, Gémeos'],
  },
  {
    id: 'major-07-chariot',
    arcana: 'major',
    suit: null,
    number: 7,
    rank: null,
    name: { pt: 'O Carro', intl: 'The Chariot' },
    archetype: 'Conquista em movimento / direção imposta',
    element: 'water',
    astro: 'Caranguejo',
    gdTitle: 'O Senhor do Triunfo da Luz',
    traditionNote: 'Caminho de Cheth (Binah → Tiphareth), a "carruagem" que atravessa o abismo. A ligação a Caranguejo é tardia mas generalizada.',
    keywords: {
      upright: ['avanço', 'vitória pelo esforço', 'contenção de opostos', 'deslocação', 'objetivo claro'],
      reversed: ['perda de controlo', 'dispersão', 'bloqueio', 'agressividade', 'corrida sem rumo'],
    },
    history:
      'Nas baralhas italianas é o "trionfo" do cortejo triunfal, sem cavalos — frequentemente sem animais visíveis, o que sugere carro cerimonial. Waite foi o primeiro a juntar os dois esfinges bicolor, preto e branco, transformando a carta num emblema de contenção dos contrários pela vontade, leitura que dominou todo o Tarot do século XX.',
    meanings: {
      upright:
        'Movimento com direção e preço. O Carro confirma que o avanço é possível se houver comando: um objetivo, um calendário e disciplina para o manter. É a carta de vitória por continuidade, de deslocação física concreta e de quem conduz tensões opostas em vez de as resolver uma a uma.',
      reversed:
        'Ou o carro anda sem condutor, ou há dois condutores com ordens diferentes. Indica atrasos, bloqueios de estrada ou de burocracia, e o desgaste de forçar uma direção que ainda não foi acordada por dentro.',
    },
    psychology:
      'É a função do ego em conquista: controlo de impulsos contraditórios através de objetivo partilhável. Em sombra vira hiperfunção — identidade reduzida a desempenho, incapacidade de parar mesmo com dor —, e por vezes agressividade defensivos.',
    emotional:
      'Orgulho, adrenalina, entusiasmo contido; em inversão irritabilidade e sensação de correr sem sair do sítio.',
    love:
      'Relação em movimento: mudar-se juntos, viagens, conquista ativa. Em inversão, corrida para dentro do conflito, ou dois ritmos incompatíveis que ninguém quer abrandar.',
    career:
      'Forte para fechar metas, assumir chefia de projeto, lançar, mudar de cidade por trabalho. Exige definição clara de rota e poder real de decidir — sem isto, a carta gasta energia em manobras.',
    finances:
      'Ganhos ligados a velocidade e logística; atenção a custos de deslocação, multas, veículos. Evita gastar para compensar frustração de progresso travado.',
    growth:
      'Aprender a travar sem desistir: o comando do carro também se mede pela capacidade de parar na próxima estação.',
    spirituality:
      'O carruagem é também veículo místico (Merabah na tradição hebraica): corpo e vontade como transporte de uma intenção que os ultrapassa.',
    obstacles:
      'Dois impulsos a puxar em direções opostas, resolvidos pela força em vez de pela hierarquia de valores.',
    opportunities:
      'Um avanço rápido e visível, sobretudo se implicar deslocação física ou mudança de cidade.',
    advice: [
      'Fixa a rota em três marcos com datas; o resto é desvio.',
      'Atribui a cada "cavalo" da tua vida uma tarefa concreta em vez de os quereres dominar ambos.',
      'Se o bloqueio for externo, muda a estrada, não o destino.',
    ],
    reflection: [
      'Para onde vou — e quem é que escolheu essa direção por mim?',
      'Que parte de mim está a travar enquanto a outra acelera?',
      'O meu progresso é resultado ou só velocidade?',
    ],
    relations: [
      { card: 'major-01-magician', kind: 'reforca', note: 'Intenção e trajecto: execução sustentada.' },
      { card: 'major-16-tower', kind: 'tensao', note: 'Quem conduz depressa nem sempre escolhe onde a estrada acaba.' },
      { card: 'major-08-strength', kind: 'complementa', note: 'Força bruta e força suave: o par que evita a violência do avanço.' },
    ],
    art: {
      scene: 'chariot-with-two-sphinxes',
      sky: 'astral',
      terrain: 'plain',
      glyphs: ['chariot-starband', 'sphinx-pair', 'star-eight', 'shield', 'crown'],
      palette: ['#11172A', '#C6A66B', '#EFE6D6'],
      motifs: ['carruagem sem arreios', 'duas figuras negras e brancas', 'estrelas no tejadilho', 'cidade ao fundo', 'escudo sobre o peito'],
      reading: [
        'A carruagem não tem cavalos nem rédeas: o comando é interno e não há tração mecânica.',
        'Os dois animais de cores opostas estão lado a lado, não amarrados: contrários tolerados, não vencidos.',
        'As estrelas no dossel colocam o objetivo acima do terreno — navegação por referência fixa.',
        'A cidade atrás significa que se parte com tudo já visto; não há regresso ao ponto de partida.',
      ],
    },
    a11y: {
      alt: 'Carta O Carro: condutor coroado de pé numa carruagem sem arreios, puxada por duas figuras de cor oposta, com estrelas sobre o dossel e uma cidade ao fundo.',
      long:
        'Composição horizontal, céu noturno salpicado. Centro, figura de pé com armadura leve e coroa, braços abertos, escudo circular no peito. Carruagem rectangular com dossel estrelado. À frente, dois animais idênticos em forma e opostos em cor, lado a lado. À esquerda ao fundo, muralha de cidade com torres. Moldura com o numeral VII.',
    },
    sources: ['Marseille – Le Chariot', 'Waite, Pictorial Key (esfinges)', 'Golden Dawn – Cheth, Caranguejo'],
  },
  {
    id: 'major-08-strength',
    arcana: 'major',
    suit: null,
    number: 8,
    rank: null,
    name: { pt: 'A Força', intl: 'Strength / Fortitude' },
    archetype: 'Coragem doméstica / poder não violento',
    element: 'fire',
    astro: 'Leão',
    gdTitle: 'A Filha do Flaming Star — A Força',
    traditionNote: 'Caminho de Teth (Chesed → Netzach). Numeração RWS: VIII. Em Marselha e na maioria das tradições italianas é XI, invertendo a ordem com A Justiça.',
    keywords: {
      upright: ['domínio sereno', 'persistência', 'coragem suave', 'autodisciplina', 'compaixão firme'],
      reversed: ['impulsos sem governo', 'autoconfiança frágil', 'repressão', 'violência contida', 'esgotamento'],
    },
    history:
      'Originalmente "La Force" nos triomfi italianos, era frequentemente uma mulher a fechar as fauces de um leão — cena da lenda de Sansão que os iconógrafos cristãs adoptaram. O debate entre VIII e XI nasce precisamente aqui: umas tradições puseram a Força antes da Justiça (virtude cardial antes do julgamento), outras depois; o Tarot de Thot de Crowley, que intitulou a carta "Art", reforçou a leitura da transmutação.',
    meanings: {
      upright:
        'A força que não precisa de se provar. Esta carta descreve a capacidade de manter posição difícil sem endurecer, de lidar com um instinto — medo, raiva, desejo — sem o negar nem obedecer. Fala de persistência afectiva, de treino paciente e de autoridade que não levanta a voz.',
      reversed:
        'Ou o animal manda, ou a mulher segura demasiado. Descreve explosões fora de carácter, repressão que gera sintomas e o cansaço de quem tenta controlar à força aquilo que devia treinar com repetição.',
    },
    psychology:
      'É a integração do lado agressivo e sexual da psique através do vínculo, não da supressão. Em análise, aponta a relação com o próprio afeto: quem confunde suavidade com fraqueja acaba dura; quem confunde aceitação com permissividade acaba dominado.',
    emotional:
      'Afeto corajoso: ternura sem submissão, calma ativa. Em inversão, vergonha dos próprios impulsos.',
    love:
      'Vínculo que resiste porque é suave e firme ao mesmo tempo; bom presságio para relações com diferença de temperamento. Invertida: cuidado com quem "doma" o parceiro, ou com a raiva guardada até explodir.',
    career:
      'Favorece liderança de equipas difíceis, negociação tensa, recuperação de reputação, trabalho de formação e treino. O progresso é lento e sólido; não há atalho.',
    finances:
      'Autocontrolo é o ativo: disciplina de poupança, pagar dívidas com regularidade, recusar o que se sabe que não se aguenta. Evita gastar para aliviar tensão acumulada.',
    growth:
      'Treinar em vez de reprimir: o desejo não desaparece por o ignorares, mas pode ser educado por repetição suave e rituais consistentes.',
    spirituality:
      'Leão deitado é o instinto pacificado: não aniquilado, não venerado. A prática associada é a coragem moral — manter a compaixão sob pressão.',
    obstacles:
      'Confundir suavidade com passividade, ou força com controlo.',
    opportunities:
      'Ganhar uma posição difícil sem a perder — o resultado mais duradouro possível nesta tiragem.',
    advice: [
      'Resolve hoje o assunto difícil em pessoa, sem mensagens e sem plateia.',
      'Reduz a intensidade e aumenta a frequência: um hábito pequeno, todos os dias.',
      'Dá nome ao impulso que queres esconder e escolhe a resposta em vez de a reprimir.',
    ],
    reflection: [
      'Onde estou a usar força porque me falta confiança?',
      'Que parte de mim precisa de treino, não de censura?',
      'Que posição difícil posso sustentar com calma?',
    ],
    relations: [
      { card: 'major-07-chariot', kind: 'complementa', note: 'Tração e contenção: velocidade sem violência.' },
      { card: 'major-11-justice', kind: 'reforca', note: 'Coragem para aplicar a regra, regra para orientar a coragem.' },
      {
        card: 'major-15-devil',
        kind: 'sombra',
        note: 'A mesma energia que a Força domestica, o Diabo alimenta.',
      },
    ],
    art: {
      scene: 'woman-closing-lion-jaws',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['strength-lion', 'infinity-top', 'wheat', 'white-rose-shield', 'lotus'],
      palette: ['#EFE6D6', '#C6A66B', '#56C5BD'],
      motifs: ['mão sobre a boca do leão', 'infinito sobre a cabeça', 'coroa de flores', 'leão sentado', 'campo verde'],
      reading: [
        'As mãos fecham a boca do animal sem apertar: gesto de ligação, não de domínio.',
        'O leão está sentado, quase dócil, o que indica treino e não triunfo.',
        'O símbolo de infinito sobre a cabeça é o mesmo do Mago: destreza interior, agora aplicada ao afeto.',
        'O campo verde sem muros sublinha que a força não precisa de fortificação.',
      ],
    },
    a11y: {
      alt: 'Carta A Força: mulher com uma coroa de flores sobre a cabeça, de pé com as mãos sobre as fauces abertas de um leão sentado, num campo verde.',
      long:
        'Cena diurna ao ar livre, campo aberto. Centro: figura feminina de vestido claro com arco de dois anéis entrelaçados sobre a cabeça, mãos pousadas leve sobre a boca de um leão sentado que a olha de lado, juba em traços largos. Fundo com vegetação baixa e céu claro. Moldura com o numeral VIII.',
    },
    sources: ['Marseille – La Force', 'Waite – Pictorial Key', 'Crowley, Thoth – Art (letra Teth)'],
  },
  {
    id: 'major-09-hermit',
    arcana: 'major',
    suit: null,
    number: 9,
    rank: null,
    name: { pt: 'O Eremita', intl: 'The Hermit' },
    archetype: 'Retiro iluminado / sabedoria adquirida no silêncio',
    element: 'earth',
    astro: 'Virgem',
    gdTitle: 'O Magus do Poder da Luz',
    traditionNote: 'Caminho de Yod (Chokmah → Tiphareth), a mão que aponta. Chamado "L\'Eremita" em Marselha e associado a Saturno em várias tradições antes de passar a Virgem.',
    keywords: {
      upright: ['retiro', 'discernimento', 'interrogação', 'ensino', 'luz própria', 'amadurecimento'],
      reversed: ['isolamento', 'recusa de ajuda', 'amargura', 'fuga do mundo', 'isolamento punitivo'],
    },
    history:
      'A figura antiga é o tempo cronómetro e a luz; Waite trocou a ampulheta pela lanterna com estrela de seis pontas e vestiu o manto do filósofo. A mudança marca o gesto definitivo da carta: não é o tempo que mede, é a luz que se leva a um palmo do chão, suficiente para o próximo passo.',
    meanings: {
      upright:
        'A resposta não está na multidão. O Eremita recomenda redução deliberada de ruído — menos pessoas, menos estímulos, mais silêncio — para distinguir o que é teu do que aprendeste por contágio. É também a carta de quem já passou pelo que estás a passar e pode ensinar em pouco tempo.',
      reversed:
        'Retiro que deixou de ser método e virou refúgio: solidão que alimenta ressentimento, recusa de pedir ajuda, ou um isolamento punição que se confunde com dignidade.',
    },
    psychology:
      'A função de introversão em estado puro: retirada libidinal necessária à reelaboração. Em sombra, torna-se a defesa intelectual que transforma dor em tese, ou a rejeição do outro por cansaço, com o risco de depressão latente.',
    emotional:
      'Paz melancólica, afecto selectivo, pouca paciência para superficialidade; em inversão, solidão ressentida.',
    love:
      'Necessidade de espaço dentro da relação, ou um período em que a prioridade é compreender-se. Pode anunciar reencontro com alguém do passado que amadureceu. Invertida: afastamento como substituição de conversa.',
    career:
      'Favorece trabalho solitário, investigação, escrita, revisão de contas, retiros estratégicos. Excelente para quem ensina ou assessora; má altura para networking compulsivo.',
    finances:
      'Sobra mais quando se gasta menos: esta carta aconselha austeridade inteligente, revisão de subscrições e a recusa de despesas sociais.',
    growth:
      'Trocar respostas por perguntas melhores. O Eremita recompensa quem passa tempo sozinho sem se consumir: reflexão com estrutura, não ruminação.',
    spirituality:
      'A escuridão onde a lâmpada basta: noite escura, jejum de palavras, peregrinação solitária. A lanterna contém estrela — a luz é pequena e é suficiente.',
    obstacles:
      'Confundir independência com auto-suficiência e ficar sem ninguém para perguntar o que não sabes.',
    opportunities:
      'Uma fonte de aconselhamento qualificada, muitas vezes fora do teu círculo: um mestre, um livro, um retiro.',
    advice: [
      'Reserva meio dia por semana sem compromissos e sem planos — só com uma pergunta escrita.',
      'Reduz o número de vozes à volta para aumentares a tua própria.',
      'Procura uma pessoa que já tenha resolvido o que estás a resolver, e pergunta-lhe os erros.',
    ],
    reflection: [
      'O que veria se retirasse por um mês tudo o que faço por obrigação social?',
      'Esta solidão escolhida ou sofrida?',
      'Que pergunta tenho evitado, por receio da resposta?',
    ],
    relations: [
      { card: 'major-02-high-priestess', kind: 'reforca', note: 'Silêncio que escuta e silêncio que vê: duas faces do retiro.' },
      { card: 'major-10-wheel', kind: 'tensao', note: 'Atravessar o acaso e recuar dele; o mundo roda, a lâmpada fica.' },
      {
        card: 'major-21-world',
        kind: 'continuidade',
        note: 'O retiro prepara a totalidade: só regressa inteiro quem sabe o que procura.',
      },
    ],
    art: {
      scene: 'hermit-on-mountain-with-lantern',
      sky: 'night',
      terrain: 'mountain',
      glyphs: ['hermit-lantern', 'staff-six', 'star-guide', 'snowdrift', 'cloak-hood'],
      palette: ['#11172A', '#EFE6D6', '#C6A66B'],
      motifs: ['homem idoso de capa', 'lanterna com estrela', 'encosta nevada', 'bastão de seis degraus', 'caminho estreito'],
      reading: [
        'A luz só alcança o próximo passo — a carta recusa a visão total.',
        'O ancião sobe sozinho, o que distingue sabedoria adquirida de conhecimento emprestado.',
        'O bastão com seis cruzetas é escada: a subida tem degraus, não saltos.',
        'A neve ao redor assinala suspensão: o mundo parou, não o caminho.',
      ],
    },
    a11y: {
      alt: 'Carta O Eremita: figura anciã encapuzada na encosta de uma montanha, segurando uma lanterna com uma estrela dentro e um bastão comprido, sobre um fundo nevado.',
      long:
        'Cena nocturna de montanha, pouca luz. Centro-esquerda, figura de capa longa e capuz, corpo inclinado para a frente, mão direita segurando lanterna hexagonal com estrela de seis pontas acesa, mão esquerda apoiada em bastão alto com seis travessas. Neve e rocha à volta, céu escuro com duas estrelas. Moldura com numeral IX.',
    },
    sources: ['Marseille – Ermita', 'Waite – troca da ampulheta pela lanterna', 'Golden Dawn – Yod e a mão'],
  },
  {
    id: 'major-10-wheel',
    arcana: 'major',
    suit: null,
    number: 10,
    rank: null,
    name: { pt: 'A Roda da Fortuna', intl: 'Wheel of Fortune' },
    archetype: 'Ciclo, acaso e timing',
    element: 'fire',
    astro: 'Júpiter',
    gdTitle: 'O Senhor das Rodas da Vida',
    traditionNote: 'Caminho de Kaph (Chokmah → Tiphareth). Antecessora cristã: a Rota Fortunae da iconografia medieval, com quatro personagens a subir, reinar e cair.',
    keywords: {
      upright: ['mudança de ciclo', 'conjuntura favorável', 'timing', 'imprevisível', 'retomada'],
      reversed: ['má sorte repetida', 'resistência à mudança', 'ciclo vicioso', 'espera excessiva'],
    },
    history:
      'A carta herda diretamente a roda da Fortuna dos manuscritos medievais, com a inscrição "regno, regnavi, sum sine regno". No Tarot de Visconti-Sforza a roda é manuseada por três figuras; Waite acrescenta os quatro símbolos fixos do zodíaco e letras hebraicas, deslocando o sentido: a fortuna deixa de ser capricho para ser estrutura cíclica observável.',
    meanings: {
      upright:
        'O contexto muda a teu favor e sem que tenhas de forçar. A Roda anuncia viragem de fase, coincidências significativas, oportunidades de calendário — janelas que duram pouco. Aconselha a entrar no movimento quando ele vem, porque a mesma roda volta a passar.',
      reversed:
        'Ou o ciclo está a repetir-se porque a lição não foi aplicada, ou a pessoa está a apostar no acaso quando precisava de método. Também descreve a sensação de jogar contra a sorte, tipicamente quando se insiste num timing errado.',
    },
    psychology:
      'É a aceitação da imprevisibilidade e a capacidade de distinguir o que depende de si do que depende das condições. Em sombra, o "locus" externo — tudo acontece por acaso — que serve de anestesia para a responsabilidade adiada.',
    emotional:
      'Excitação, otimismo instável, euforia de viragem; em inversão, irritação com o que não se controla e nostalgia do momento que passou.',
    love:
      'Encontro inesperado ou reencontro por circunstância; fase em que o vínculo muda de forma por factores externos (mudança de cidade, viagem, trabalho). Invertida: padrões afectivos repetidos com pessoas diferentes.',
    career:
      'Viragem de mercado, promoção improvável, contrato que aparece por coincidência, reestruturação. Aposta em flexibilidade e em estar disponível quando a janela abre.',
    finances:
      'Movimentos cíclicos: bons e maus trimestres, variações de renda. Aconselha aforrar na alta para não vender na baixa; evita apostas alavancadas.',
    growth:
      'Identificar um ciclo que se repete e interrompê-lo no ponto em que costumas reiniciar; é aí que a roda fica presa.',
    spirituality:
      'A roda tem centro imóvel: a prática é encontrar o eixo — o que não roda — e agir a partir dele, não do seu ritmo.',
    obstacles:
      'Esperar que a oportunidade chegue sem preparar a recepção: quando a janela abre, faltar capacidade de entrar.',
    opportunities:
      'Uma viragem favorável no período mais curto, sobretudo em questões de calendário (prazos, concursos, viagens, contratos).',
    advice: [
      'Aproveita a janela de agora: define uma ação de oportunidade esta semana.',
      'Regista as coincidências que se repetem — é nelas que a roda mostra o padrão.',
      'Antes de culpar a sorte, separa a parte de sorte da parte de método.',
    ],
    reflection: [
      'Que padrão volto a chamar de "azar"?',
      'O que mudo se a sorte não depende de mim?',
      'Estou pronto para o que a oportunidade me exigiria?',
    ],
    relations: [
      { card: 'major-09-hermit', kind: 'tensao', note: 'O imovel dentro do movimento: o observador e a roda.' },
      { card: 'major-11-justice', kind: 'complementa', note: 'Acaso e balança: o que a conjunção dá e o que a lei exige.' },
      { card: 'major-21-world', kind: 'continuidade', note: 'O ciclo fecha-se em totalidade: a roda completa o circuito.' },
    ],
    art: {
      scene: 'wheel-with-four-fixed-signs',
      sky: 'astral',
      terrain: 'sky',
      glyphs: ['wheel-eight', 'eagle', 'lion-fixed', 'bull-fixed', 'angel-fixed', 'book-open'],
      palette: ['#11172A', '#C6A66B', '#56C5BD'],
      motifs: ['roda de oito raios', 'esfinge no topo', 'serpente a descer', 'figura a cair', 'quatro símbolos nos cantos'],
      reading: [
        'A roda tem oito raios: não é círculo fechado mas ciclo com estrutura, repetível.',
        'No topo a esfinge com espada, à direita a figura que sobe, à esquerda a que cai: três posições do mesmo destino.',
        'A serpente que desce pelo lado esquerdo marca a perda como parte do desenho.',
        'Nos quatro cantos, os signos fixos seguram livros abertos: o que roda é lido, não apenas vivido.',
      ],
    },
    a11y: {
      alt: 'Carta A Roda da Fortuna: grande roda de oito raios no centro com três figuras — uma no topo, uma a subir e uma a cair — e quatro símbolos de animais nos cantos sobre um fundo estrelado.',
      long:
        'Céu escuro com constelações. Centro, roda grande com inscrições e oito raios, inclinada para o observador. No topo, figura alada com espada; à direita, figura clara a subir; à esquerda, figura escura a cair com serpente enrolada. Nos quatro cantos, um anjo, uma águia, um touro e um leão com livros abertos. Moldura com numeral X.',
    },
    sources: ['Boécio, Consolação (Rota Fortunae)', 'Visconti-Sforza – Ruota', 'Golden Dawn – Kaph e Júpiter'],
  },
]
