import type { CardSource } from '../../../src/domain/types.ts'

/**
 * Naipe de Ouros — elemento Terra, função de corpo, trabalho, recurso e valor.
 * Correspondências: pips seguem o padrão "planeta no elemento" (Terra) da Golden Dawn;
 * figuras da corte usam o padrão de sub-elementos (Terra/Are/Água/Fogo do elemento).
 */
export const PENTACLES: CardSource[] = [
  {
    id: 'minor-pentacles-01',
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    rank: 'ace',
    name: { pt: 'Ás de Ouros', intl: 'Ace of Pentacles' },
    archetype: 'Semente concreta / oportunidade material',
    element: 'earth',
    astro: 'Raiz dos Poderes da Terra',
    gdTitle: '—',
    traditionNote: 'O "denaro" de Marselha é uma moeda simples; Waite enquadrou-a num jardim com caminho e portão, leitura de recurso que se planta.',
    keywords: {
      upright: ['oportunidade real', 'recurso disponível', 'início rentável', 'materialização', 'presente útil'],
      reversed: ['oportunidade perdida', 'ganho bloqueado', 'promessa não paga', 'avareza', 'descuido com o concreto'],
    },
    history:
      'Nas cartas latinas o ás de ouros era simplesmente o ouro — moeda, dinheiro, e o valor que sustenta a festa dos outros naipes. O jardim de Waite acrescenta a leitura de investimento e de paciência agrícola, que é a leitura técnica corrente.',
    meanings: {
      upright:
        'Está nas tuas mãos uma coisa concreta com futuro: dinheiro, emprego, terreno, ferramenta, cliente, proposta. O Ás de Ouros é a carta do valor inicial — pequeno e verificável — e recomenda plantar com critério em vez de esperar por mais.',
      reversed:
        'A moeda escapa: atraso de pagamento, proposta que não se concretiza, oportunidade ignorada por falta de preparo, ou uso do recurso para consumo imediato.',
    },
    psychology:
      'É a função de sensação aplicada ao real: capacidade de lidar com factos, corpo e matéria. Em sombra, ou a desorganização prática, ou a transformação de tudo em transação.',
    emotional: 'Segurança, apetite de construir, gratidão pelo que é tangível.',
    love: 'Gesto prático de afeto (tempo, casa, cuidado, dinheiro partilhado); pode anunciar projeto de vida comum. Em inversão: afeto medido em troca.',
    career: 'Contrato, primeiro pagamento, investimento inicial, cliente novo, oferta de emprego. Excelente para começar o que se sustenta.',
    finances: 'A melhor carta do baralho para dinheiro novo: entrada, bónus, aumento, primeira poupança. Regra: guardar uma parte no próprio dia.',
    growth: 'Cuidar do corpo e das condições concretas como prática espiritual, não como pré-requisito adiado.',
    spirituality: 'O grão na terra: encarnação como valor, não como obstáculo.',
    obstacles: 'Esperar por uma oportunidade maior para começar a cuidar da que existe.',
    opportunities: 'Um recurso disponível agora, com retorno previsível a médio prazo.',
    advice: [
      'Pega na oferta e define o primeiro passo com prazo de sete dias.',
      'Guarda imediatamente 10% do que entrou, antes de decidir o resto.',
      'Materializa: escreve números, orçamentos, datas.',
    ],
    reflection: [
      'O que tenho nas mãos que ainda não usei?',
      'Como uso o concreto — para construir ou para me tranquilizar?',
      'Que semente pequena daria mais que a próxima grande ideia?',
    ],
    relations: [
      { card: 'major-04-emperor', kind: 'reforca', note: 'Recurso e estrutura: oportunidade que se converte em ordem durável.' },
      { card: 'minor-pentacles-10', kind: 'continuidade', note: 'Do grão à herança: todo o ciclo material em duas cartas.' },
    ],
    art: {
      scene: 'hand-offering-coin-over-garden-path',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['coin-single', 'hand-offering', 'garden-walled', 'path-straight', 'gate', 'rose'],
      palette: ['#C6A66B', '#EFE6D6', '#56C5BD'],
      motifs: ['mão com moeda grande', 'jardim murado', 'caminho aberto', 'rosas nos muros'],
      reading: [
        'A moeda é maior do que a mão: o recurso é desproporcionado ao esforço pedido.',
        'O caminho entre no jardim: o valor serve a vida, não o contrário.',
        'O muro baixo protege sem esconder.',
      ],
    },
    a11y: {
      alt: 'Carta Ás de Ouros: mão que sai de uma nuvem segurando uma grande moeda dourada, sobre um jardim murado com caminho e portão aberto.',
      long:
        'Jardim com muros baixos cobertos de rosas e um caminho recto até um portão. Centro superior: nuvem clara com mão a segurar um disco dourado com estrela de cinco pontas gravada. Fundo de campo arborizado sob luz de dia. Moldura com o rótulo de ás de Ouros.',
    },
    sources: ['Marseille – as de denier', 'Waite – jardim e caminho'],
  },
  {
    id: 'minor-pentacles-02',
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    rank: '2',
    name: { pt: 'Dois de Ouros', intl: 'Two of Pentacles' },
    archetype: 'Malabarismo / equilíbrio em movimento',
    element: 'earth',
    astro: 'Júpiter em Capricórnio',
    gdTitle: 'Mudança Harmoniosa',
    traditionNote: 'Título da Golden Dawn: "harmony"— a mudança como técnica, não como ameaça.',
    keywords: {
      upright: ['gestão simultânea', 'adaptabilidade', 'equilíbrio de fluxo de caixa', 'prioridades móveis', 'leveza prática'],
      reversed: ['desequilíbrio', 'contas apertadas', 'excesso de compromissos', 'desorganização', 'escolha forçada'],
    },
    history:
      'A figura de Waite dança com dois discos ligados por um oito, com dois barcos ao fundo num mar agitado. Nas cartas populares italianas eram apenas dois pentáculos cruzados; a cena do malabarista fixou a leitura de fluxo e ritmo.',
    meanings: {
      upright:
        'Consegues manter duas coisas a funcionar ao mesmo tempo, mas não as duas ao mesmo nível. Esta carta favorece gestão flexível, trocas, negociação de prazos, trabalho com múltiplas fontes de rendimento e a arte de não deixar nada cair.',
      reversed:
        'O peso passa a capacidade: atrasos, contas a descoberto, compromissos a mais. Indica necessidade de cortar uma das mãos em vez de correr atrás de ambas.',
    },
    psychology:
      'É a função adaptativa: tolerar mudança sem perder eixo. Em excesso, evita decisões definitivas porque o equilíbrio é mais confortável que o compromisso.',
    emotional: 'Leveza com preocupação de fundo, humor pragmático.',
    love: 'Gerir afeto e trabalho, ou duas ligações a competir pelo mesmo tempo. Em inversão: exigência de escolha clara.',
    career: 'Dois projetos, dois clientes, freelance com fluxo variável, gestão de caixa semanal. Favorável a rotinas flexíveis.',
    finances: 'Boa fase para equilibrar receitas e despesas com contas semanais; péssima para assumir novo compromisso fixo.',
    growth: 'Aceitar que equilíbrio não é simetria: algumas semanas o prato da direita fica mais cheio.',
    spirituality: 'O oito deitado — ritmo, não estagnação; a corrente que se renova.',
    obstacles: 'Adiar a escolha para não perder nenhuma opção.',
    opportunities: 'Um ajuste simples de horário ou prioridade que resolve o aperto.',
    advice: [
      'Escreve as duas contas e escolhe qual tem prazo maior: a outra recebe o mínimo.',
      'Corta um compromisso esta semana e avisa com antecedência.',
      'Reserva uma margem de 10% de tempo para imprevistos.',
    ],
    reflection: [
      'O que eu equilibro que já devia ter sido decidido?',
      'Que custo estou a pagar pela flexibilidade?',
      'Como ficaria a minha semana com um prato a menos?',
    ],
    relations: [
      { card: 'minor-pentacles-05', kind: 'sombra', note: 'Do equilíbrio apertado à privação, quando o malabarismo falha.' },
      { card: 'major-10-wheel', kind: 'reforca', note: 'Ritmo e acaso: adaptar-se ao ciclo em vez de o combater.' },
    ],
    art: {
      scene: 'dancing-figure-with-two-coins-and-infinity',
      sky: 'overcast',
      terrain: 'sea',
      glyphs: ['coin-single', 'infinity-top', 'ship', 'wave-line', 'ribbon'],
      palette: ['#C6A66B', '#11172A', '#EFE6D6'],
      motifs: ['figura em movimento', 'dois discos ligados por oito', 'barcos ao fundo', 'mar agitado'],
      reading: [
        'O oito que liga os discos é um laço, não uma corrente: une sem prender.',
        'Os barcos ao fundo mostram que há risco maior fora do equilíbrio pessoal.',
        'Os pés estão em troca constante: o equilíbrio aqui é feito de movimento.',
      ],
    },
    a11y: {
      alt: 'Carta Dois de Ouros: figura em movimento a segurar duas moedas grandes ligadas por um símbolo de oito, com barcos e mar agitado ao fundo.',
      long:
        'Margem com mar revolto e dois barcos com velas. Centro: figura jovem com túnica curta e chapéu de pontas, corpo inclinado em dança, duas moedas douradas ligadas por um laço em forma de oito. Moldura com o numeral II de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua na Terra, "Harmony"'],
  },
  {
    id: 'minor-pentacles-03',
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    rank: '3',
    name: { pt: 'Três de Ouros', intl: 'Three of Pentacles' },
    archetype: 'Ofício e equipa / trabalho reconhecido',
    element: 'earth',
    astro: 'Marte em Capricórnio',
    gdTitle: 'Obra Material',
    traditionNote: 'Título da Golden Dawn: "trabalho". A cena de catedral vem das imagens de construtores medievais e das guildas.',
    keywords: {
      upright: ['competência reconhecida', 'trabalho em equipa', 'qualidade técnica', 'aprendizagem com mestre', 'projeto bem executado'],
      reversed: ['trabalho mal feito', 'falta de coordenação', 'reconhecimento negado', 'amadorismo', 'crítica ignorada'],
    },
    history:
      'Waite desenhou um escultor a trabalhar num pilares enquanto um frade e uma pessoa nobre examinam o desenho e a carta — é a única carta do baralho que mostra explicitamente a relação entre quem faz, quem financia e quem valida. Este detalhe define a leitura de colaboração qualificada.',
    meanings: {
      upright:
        'O trabalho é visto, medido e aprovado. Esta carta favorece projetos com equipa especializada, revisão de pares, formação prática, certificação e construção de portfólio. Qualidade acima de velocidade.',
      reversed:
        'Falha de coordenação: tarefas sobrepostas, critério de quem não faz a impor-se a quem faz, ou trabalho apressado que terá de ser refeito.',
    },
    psychology:
      'É a função de competência e do orgulho profissional: fazer bem feito mesmo quando ninguém vê. Em sombra, o perfeccionismo que bloqueia entrega, ou a dependência de validação externa.',
    emotional: 'Satisfação técnica, respeito mútuo, paciência com processo.',
    love: 'Relação construída a três mãos — com trabalho, paciência e critérios partilhados; menos faísca, mais obra. Em inversão: falta de coordenação de papéis.',
    career: 'Uma das melhores cartas do baralho para trabalho: equipa qualificada, revisão técnica, formação, contrato com especialista, obra a decorrer.',
    finances: 'Investir em qualidade e em mão-de-obra competente sai mais barato do que o atalho; orçamento realista é decisivo.',
    growth: 'Aprender com quem faz melhor, aceitando crítica concreta.',
    spirituality: 'A catedral como obra coletiva: talento é responsabilidade com os que vêm depois.',
    obstacles: 'Confundir autonomia com recusa de revisão.',
    opportunities: 'Uma colaboração que valoriza o teu trabalho visivelmente.',
    advice: [
      'Pede revisão de pares antes de apresentar.',
      'Documenta o método: é o que transforma trabalho em reputação.',
      'Define papéis escritos numa colaboração confusa.',
    ],
    reflection: [
      'O que estou a fazer sozinho que deveria ser revisto?',
      'Que padrão de qualidade exijo de mim e não negoço?',
      'Como eu quero que este trabalho seja lembrado?',
    ],
    relations: [
      { card: 'major-01-magician', kind: 'reforca', note: 'Intenção e ofício: talento com método e prova.' },
      { card: 'minor-pentacles-08', kind: 'continuidade', note: 'Da equipa à mestria repetida: o mesmo trabalho, mais refinado.' },
    ],
    art: {
      scene: 'sculptor-in-cathedral-with-monk-and-noble',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['chisel-tools', 'column', 'coin-single', 'scroll', 'arch-temple', 'rose-window'],
      palette: ['#EFE6D6', '#C6A66B', '#4A1F39'],
      motifs: ['artesão a talhar coluna', 'dois visitantes com desenho', 'nave com arcos', 'três pentáculos no chão e na parede'],
      reading: [
        'O desenho aberto é o critério partilhado: a obra é negociada em público.',
        'O artesão está a trabalhar e não a posar: a carta honra o processo.',
        'Os três pentáculos — dois no chão, um na coluna — marcam material, forma e resultado.',
      ],
    },
    a11y: {
      alt: 'Carta Três de Ouros: escultor a talhar o capitel de uma coluna dentro de uma catedral, enquanto um frade e uma figura nobre seguram um desenho e observam.',
      long:
        'Interior de catedral com arcos e vitral. Centro: figura de avental junto a coluna, cinzel e martelo na mão, dois pentáculos esculpidos na base. À direita, duas figuras em pé — uma de hábito, outra com manto — a segurar um pergaminho aberto. Moldura com o numeral III de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mercúrio na Terra, "Work"'],
  },
  {
    id: 'minor-pentacles-04',
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    rank: '4',
    name: { pt: 'Quatro de Ouros', intl: 'Four of Pentacles' },
    archetype: 'Apego e contenção / o que se guarda e não se usa',
    element: 'earth',
    astro: 'Sol em Capricórnio',
    gdTitle: 'Poder Material',
    traditionNote: 'Título da Golden Dawn: "sucesso"/"lucro" — lido ironicamente, pois a figura está presa ao que acumula.',
    keywords: {
      upright: ['poupança', 'controlo do recurso', 'segurança', 'avareza', 'resistência a gastar'],
      reversed: ['libertação do apego', 'gasto necessário', 'perda de controlo', 'partilha', 'fim do cerco'],
    },
    history:
      'A figura sentada com uma moeda na cabeça, duas debaixo dos pés e uma no regaço, num city de fundo, é exclusiva de Waite e tornou-se o ícone universal da atitude de retenção. Nas cartas latinas, apenas quatro discos sem personagem.',
    meanings: {
      upright:
        'Estás a proteger o que tens — e parte do que proteges já não te serve. A carta descreve contenção saudável, reserva prudente e também o medo que fecha a mão: não gastar no necessário, não partilhar, não investir em si.',
      reversed:
        'A mão abre: gasto necessário, investimento, doação, ou perda que obriga a soltar. Também pode indicar libertação do hábito de acumular.',
    },
    psychology:
      'É a relação com o objeto e com a segurança: o fixação anal da leitura psicanalítica clássica, lido hoje como necessidade de controlo quando falta confiança no fluxo. Em sombra, identidade colada ao património.',
    emotional: 'Desconfiança, conforto na posse, ansiedade de perda.',
    love: 'Ciúme possessivo, controlo de finanças em casal, afeto como território. Em inversão: partilha e confiança.',
    career: 'Recusar investir em ferramentas, segurar informação para manter posição, orçamento fechados a sete chaves. O custo é a estagnação.',
    finances: 'Excelente para poupar, péssimo para investir em saúde ou formação. Revisa a lista de coisas que possuis e não usas.',
    growth: 'Exercício de dar algo pequeno sem calcular retorno.',
    spirituality: 'A posse como ilusão de permanência; o desapego como técnica, não como discurso.',
    obstacles: 'Confundir segurança com acumulação.',
    opportunities: 'Uma libertação de recursos parados para o que produz.',
    advice: [
      'Gasta hoje uma quantia pequena em saúde, formação ou tempo — não em coisa.',
      'Abre a mão em partilha concreta: uma hora, um recurso, um contacto.',
      'Define um teto de segurança e o que acontece acima dele.',
    ],
    reflection: [
      'O que eu guardo me protege ou prende?',
      'Qual é o meu número de segurança e porque ainda não foi atingido?',
      'Quem paga o preço da minha contenção?',
    ],
    relations: [
      { card: 'minor-pentacles-06', kind: 'complementa', note: 'Guardar e dar: o equilíbrio entre reserva e circulação.' },
      { card: 'major-15-devil', kind: 'sombra', note: 'A mesma corrente que agora é voluntária.' },
    ],
    art: {
      scene: 'seated-figure-clutching-four-coins',
      sky: 'overcast',
      terrain: 'city',
      glyphs: ['coin-single', 'crown', 'shield', 'city-houses', 'four-coin-guard'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['figura sentada com moeda na cabeça', 'duas moedas sob os pés', 'uma moeda no regaço', 'cidade ao fundo'],
      reading: [
        'Uma moeda na cabeça: a ideia de segurança ocupa o pensamento.',
        'As duas debaixo dos pés: nem o chão é livre para andar.',
        'A cidade ao fundo está viva — e não é habitada por quem está parado.',
      ],
    },
    a11y: {
      alt: 'Carta Quatro de Ouros: figura sentada de coroa, com uma moeda sobre a cabeça, duas debaixo dos pés e uma abraçada ao peito, com uma cidade ao fundo.',
      long:
        'Cidade murada ao fundo com casas e torres. Centro: figura sentada de corpo tenso, túnica com as mãos a esconder um disco no colo, coroa dourada com um disco em cima da cabeça, dois discos sob os pés. Moldura com o numeral IV de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Sol na Terra, "Profit"'],
  },
  {
    id: 'minor-pentacles-05',
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    rank: '5',
    name: { pt: 'Cinco de Ouros', intl: 'Five of Pentacles' },
    archetype: 'Privação e exclusão / a vitrine acesa que não se vê',
    element: 'earth',
    astro: 'Mercúrio em Touro',
    gdTitle: 'Perturbação Material',
    traditionNote: 'Título da Golden Dawn: "dificuldade material". A vidraça com cinco pentáculos é o pormenor que Waite pediu e que quase todos leem ao contrário.',
    keywords: {
      upright: ['dificuldade material', 'isolamento', 'sensação de exclusão', 'saúde fragilizada', 'não pedir ajuda'],
      reversed: ['socorro recebido', 'fim da privação', 'reconhecimento de apoio disponível', 'recuperação', 'ajuda pedida a tempo'],
    },
    history:
      'Waite inspirou-se num vitral da igreja de Saint-Jean-de-Montmartre, em Paris — o vitral dos mendigos —, e a legenda tradicional da carta vem da procissão de Ano Novo em que os pobres eram convidados a ver a luz. O erro de leitura mais comum é esquecer as figuras junto à janela iluminada.',
    meanings: {
      upright:
        'Estás a passar aperto e a achar que ninguém sabe. A carta descreve dificuldade material, exclusão, doença ou insegurança agravada por não pedir ajuda: os dois homens passam diante de uma janela acesa e não olham para cima.',
      reversed:
        'A assistência chega: apoio de família, resposta de instituição, dinheiro recuperado, fim de um período de privação. Indica também o momento de bater à porta certa.',
    },
    psychology:
      'É a experiência de exclusão e a sua manutenção: a vergonha que impede de pedir, e a percepção de que o recurso existe mas não é para ti. Trabalho útil: nomear uma pessoa ou uma instituição concreta.',
    emotional: 'Frio, solidão, vergonha, queixa moral, ressentimento.',
    love: 'Sensação de estar a mais, ou relação vivida em escassez afetiva. Em inversão: aproximação e consolo.',
    career: 'Momento difícil: cortes, desemprego, trabalho precário. A carta recomenda pedir informação, apoio social e recomendações ativamente.',
    finances: 'Aperto real: despesas básicas sob pressão, saúde a custar caro. Prioriza o essencial e procura apoio formal — bancos alimentares, seguro social, crédito estruturado.',
    growth: 'Aceitar ajuda não é perder dignidade: é converter recurso disponível em resultado.',
    spirituality: 'A porta aberta onde se entra, a cegueira de quem passa junto ao luz.',
    obstacles: 'A vergonha que transforma apoio disponível em recurso inexistente.',
    opportunities: 'Uma ajuda concreta que existe e depende apenas de um pedido.',
    advice: [
      'Pede ajuda a uma pessoa ou instituição específica esta semana.',
      'Lista o que é essencial para 30 dias e corta o resto sem culpa.',
      'Sai de casa: a carta descreve isolamento como agravante.',
    ],
    reflection: [
      'Que apoio existe à minha porta e não estou a ver?',
      'Do que tenho vergonha de pedir?',
      'Que parte da minha escassez é partilhada com alguém?',
    ],
    relations: [
      { card: 'minor-pentacles-06', kind: 'complementa', note: 'A mão que dá responde ao cinco: ajuda existe, é pedir.' },
      { card: 'minor-wands-10', kind: 'reforca', note: 'Peso e privação: excesso que leva ao esvaziamento.' },
    ],
    art: {
      scene: 'two-beggars-passing-lit-church-window',
      sky: 'night',
      terrain: 'city',
      glyphs: ['coin-single', 'stained-glass', 'snowdrift', 'crutch', 'lantern-dark', 'two-shrouded-figures'],
      palette: ['#11172A', '#4A1F39', '#C6A66B'],
      motifs: ['duas figuras encapuzadas na neve', 'janela de vitral com cinco moedas', 'neve no chão', 'muleta'],
      reading: [
        'O vitral está iluminado e cheio de pentáculos: o recurso está visível, a dois metros.',
        'As duas figuras vão juntas: a privação partilhada reduz o frio, não o resolve.',
        'A neve no ombro indica que já se está ali há tempo.',
      ],
    },
    a11y: {
      alt: 'Carta Cinco de Ouros: duas figuras com mantos na neve passando diante de uma janela de vitral iluminada com cinco moedas, uma delas apoiada numa muleta.',
      long:
        'Rua de neve à noite, junto a muro de pedra. Centro: duas figuras encapuzadas, uma com muleta, a caminhar para a esquerda. À direita, janela alta de vitral com cinco discos dourados, luz quente a sair. Moldura com o numeral V de Ouros.',
    },
    sources: ['Waite – vitral de Saint-Jean-de-Montmartre', 'Golden Dawn – Vénus na Terra, "Difficulty"'],
  },
  {
    id: 'minor-pentacles-06',
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    rank: '6',
    name: { pt: 'Seis de Ouros', intl: 'Six of Pentacles' },
    archetype: 'Circulação justa / dar e receber com regras',
    element: 'earth',
    astro: 'Lua em Touro',
    gdTitle: 'Sucesso Material',
    traditionNote: 'Título da Golden Dawn: "ganho". A balança atrás do dador é o símbolo central: generosidade com critério.',
    keywords: {
      upright: ['partilha', 'generosidade equilibrada', 'patrocínio', 'subsídio', 'justa retribuição', 'mecenato'],
      reversed: ['caridade com controlo', 'dívida de gratidão', 'troca desigual', 'favorecimento', 'exploração da generosidade'],
    },
    history:
      'O "Sei di Denari" das cartas latinas mostrava já uma figura com bolsa a dar moedas a pobres ajoelhados, com a balança de Mercúrio/Vénus ao lado: era o retrato da virtude da liberalidade, muito usada como aviso contra usura e avareza. Waite acrescentou o chapéu vermelho, sinal de decisão assumida.',
    meanings: {
      upright:
        'O recurso circula e há quem o faça bem. Esta carta favorece bolsa, financiamento, bónus, ajuda recebida ou oferecida, aumento justo, trabalho bem pago. Indica que a tua relação com dar e receber está saudável — ou pode ficar.',
      reversed:
        'A moeda é dada com cordão: favores que criam dívida, paternalismo, caridade como instrumento de controlo, ou quem recebe sem nunca retribuir em nenhuma forma.',
    },
    psychology:
      'É a função de troca e o sentimento de merecimento: quanto se aceita receber sem culpa e quanto se dá sem faturar. Aparece muitas vezes em padrões de dívida emocional.',
    emotional: 'Gratidão, dignidade, generosidade serena; em inversão, humilhação de quem precisa.',
    love: 'Troca equilibrada de cuidado e tempo; bom sinal quando os dois dão e recebem. Em inversão: relação de patrono e dependente.',
    career: 'Financiamento aprovado, bolsa, bónus, aumento, mentor que abre porta. Também: contratar, dar formação, partilhar crédito.',
    finances: 'Excelente para receber e para reorganizar: dívida renegociada, apoio familiar, prestação solidária. Define o valor e o prazo.',
    growth: 'Treinar pedir proporcional ao dar: dívidas de gratidão são desequilíbrio, não virtude.',
    spirituality: 'A esmola como justiça, não como favor: dar é redistribuir o que nunca foi só nosso.',
    obstacles: 'Aceitar ou oferecer ajuda sem termos claros.',
    opportunities: 'Um financiamento, apadrinhamento ou bónus que destrava o que está parado.',
    advice: [
      'Pede o que te é devido, com valor e prazo escritos.',
      'Ao dar, não cobres gratidão; ao receber, não cobres culpa.',
      'Distribui um recurso — tempo, dinheiro, contacto — hoje.',
    ],
    reflection: [
      'Como me sinto quando recebo sem poder retribuir?',
      'Que favor meu espera em segredo um regresso?',
      'Qual é a minha balança entre dar e receber?',
    ],
    relations: [
      { card: 'major-11-justice', kind: 'reforca', note: 'Proporção e partilha: generosidade com critério.' },
      { card: 'minor-pentacles-04', kind: 'complementa', note: 'Guardar e circular: a mesma moeda em duas atitudes.' },
    ],
    art: {
      scene: 'merchant-giving-coins-to-two-kneeling-figures',
      sky: 'day',
      terrain: 'city',
      glyphs: ['coin-single', 'scales-libra', 'purse', 'kneeling-figures', 'six-coin-circle'],
      palette: ['#C6A66B', '#EFE6D6', '#4A1F39'],
      motifs: ['figura de bolsa na mão', 'moedas entregues a dois ajoelhados', 'balança atrás', 'seis discos em círculo no chão'],
      reading: [
        'A balança está atrás do dador: medir faz parte de dar.',
        'Os dois ajoelhados têm postura diferente: um recebe, outro espera.',
        'Seis discos em círculo no chão: a circulação é o tema, não a quantidade.',
      ],
    },
    a11y: {
      alt: 'Carta Seis de Ouros: figura de chapéu vermelho a entregar moedas de uma bolsa a duas pessoas ajoelhadas, com uma balança atrás e seis discos no chão.',
      long:
        'Praça de cidade em plano aberto. Centro: figura em pé com manto e bolsa na mão esquerda, a distribuir moedas com a direita; aos pés, duas figuras ajoelhadas com mãos levantadas. Atrás, balança de dois pratos suspensa. Moldura com o numeral VI de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mercúrio na Terra, "Gain"'],
  },
  {
    id: 'minor-pentacles-07',
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    rank: '7',
    name: { pt: 'Sete de Ouros', intl: 'Seven of Pentacles' },
    archetype: 'Paciência produtiva / avaliar antes de colher',
    element: 'earth',
    astro: 'Saturno em Touro',
    gdTitle: 'Sucesso Inacabado',
    traditionNote: 'Título da Golden Dawn: "sucesso falhado/vaidade" — a carta é sobre esperar e avaliar, e Saturno dá-lhe o peso do tempo.',
    keywords: {
      upright: ['avaliação de progresso', 'espera com trabalho feito', 'colheita adiada', 'paciência estratégica', 'revisão de investimento'],
      reversed: ['impaciência', 'colheita prematura', 'desânimo pelo tempo', 'investimento que não rende', 'abandono precoce'],
    },
    history:
      'Waite mostra um jovem encostado à foice a olhar para sete moedas num arbusto, com um sol poente e pássaros ao fundo: uma das poucas cartas do baralho dedicada exclusivamente ao intervalo entre semear e colher. Nas cartas italianas não havia figura, apenas discos.',
    meanings: {
      upright:
        'O trabalho está feito e ainda não se vê. Esta carta é o intervalo Saturnino: avaliar sem desistir, continuar sem forçar, e perguntar se a sementeira foi a certa. Excelente para projetos de maturação longa.',
      reversed:
        'Colher cedo demais, ou desistir no ponto em que o retorno estava próximo. Indica também o oposto: esperar por resultado que nunca vai chegar porque o método foi mal escolhido.',
    },
    psychology:
      'É a tolerância ao adiamento e a capacidade de avaliar progresso real — função que a cultura da gratificação imediata atrofia. Em sombra, o cinismo do "nada vale a pena" que cobre a impaciência.',
    emotional: 'Calma com dúvida, cansaço sem drama, esperança prudente.',
    love: 'Relação que cresce devagar e precisa de tempo, não de pressão; também avaliação de se vale continuar. Em inversão: ansiedade de definição.',
    career: 'Fase de revisão de projeto, meio de obra, plantação ainda sem fruto. Não trocar de estratégia antes do marco acordado.',
    finances: 'Investimento de longo prazo: não mexer. Rever taxas e prazos com dados, não com ansiedade.',
    growth: 'Aprender a medir o progresso com marcos internos, não só com resultados visíveis.',
    spirituality: 'O tempo do agricultor: esperar com trabalho, não com expectativa mágica.',
    obstacles: 'Confundir demora com fracasso.',
    opportunities: 'Uma avaliação honesta que evita abandonar algo que está a 80%.',
    advice: [
      'Conta o que já fizeste em vez do que falta: é o critério certo nesta fase.',
      'Fixa a data de avaliação e não mudes de plano antes dela.',
      'Melhora um detalhe do método — não o método todo.',
    ],
    reflection: [
      'Estou a avaliar resultados ou a avaliar-me?',
      'Este é um tempo de espera ou um tempo de erro?',
      'Se soubesse que o retorno vem daqui a um ano, manteria o plano?',
    ],
    relations: [
      { card: 'minor-pentacles-10', kind: 'continuidade', note: 'Da espera à colheita completa: o mesmo projeto, terminado.' },
      { card: 'major-09-hermit', kind: 'reforca', note: 'Paciência com método: não adianta forçar.' },
    ],
    art: {
      scene: 'farmer-leaning-on-scythe-watching-coin-bush',
      sky: 'dusk',
      terrain: 'field',
      glyphs: ['coin-single', 'scythe-blade', 'vine', 'birds-flock', 'sun-half'],
      palette: ['#C6A66B', '#56C5BD', '#EFE6D6'],
      motifs: ['figura encostada a uma foice', 'arbusto com sete moedas', 'pássaros ao fundo', 'sol baixo'],
      reading: [
        'A foice está pousada, não em punho: ainda não é hora de cortar.',
        'As moedas estão penduradas como frutos, em diferentes graus de maturação.',
        'O sol que baixa indica ciclo em curso, não fim.',
      ],
    },
    a11y: {
      alt: 'Carta Sete de Ouros: figura apoiada numa foice, de pé diante de um arbusto com sete moedas penduradas, com um sol baixo e pássaros ao fundo.',
      long:
        'Campo ao entardecer com sebes e três pássaros ao fundo. Centro: figura com boné e túnica, braços cruzados sobre o cabo de uma foice, corpo inclinado, a olhar para um arbusto com sete discos dourados pendentes. Moldura com o numeral VII de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Saturno na Terra, "Failure"'],
  },
  {
    id: 'minor-pentacles-08',
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    rank: '8',
    name: { pt: 'Oito de Ouros', intl: 'Eight of Pentacles' },
    archetype: 'Ofício deliberado / a repetição que aperfeiçoa',
    element: 'earth',
    astro: 'Sol em Virgem',
    gdTitle: 'Prudência Material',
    traditionNote: 'Título da Golden Dawn: "prudência/artesão". É a carta do treino deliberado, muitas vezes lida como tédio — erro de leitura.',
    keywords: {
      upright: ['treino deliberado', 'atenção ao detalhe', 'qualidade', 'perícia', 'rotina produtiva', 'aprender fazendo'],
      reversed: ['perfeccionismo', 'trabalho sem critério', 'rotina que anestesia', 'negligência técnica', 'gratificação adiada demais'],
    },
    history:
      'O "Fabbro" de Marselha (ferreiro) foi substituído por Waite pelo artesão que grava pentáculos numa parede, com um oitavo pendurado e uma rua ao fundo — leitura de mestria por repetição, com o mundo visível mas não frequentado. É uma das cartas mais literais de todo o baralho.',
    meanings: {
      upright:
        'Melhorar 1% por dia, sem plateia. Esta carta favorece prática, revisão, aperfeiçoamento técnico, edição, treino, acabamento. É a carta de quem fica até ao detalhe e por isso fica boa.',
      reversed:
        'Ou o trabalho virou mecânico sem critério, ou o perfeccionismo impede a entrega. Descreve também a confusão entre estar ocupado e estar a aprender.',
    },
    psychology:
      'É a função de concentração sustentada — a capacidade de tolerar a repetição sem perder sentido. Em sombra, o trabalho como fuga à avaliação e à exposição.',
    emotional: 'Foco sereno, satisfação discreta, pouca urgência relacional.',
    love: 'Cuidar da relação como se cuida de obra: rotina, detalhe, manutenção. Em inversão: negligência por excesso de trabalho.',
    career: 'Fase forte de produção, revisão, especialização, acabamento de projeto. Não é o momento de pivotar — é de apertar a qualidade.',
    finances: 'Ganho por competência repetida; pagar por qualidade e não por novidade. Ótimo para orçamento com metas pequenas.',
    growth: 'Escolher uma habilidade e treinar 30 dias seguidos: a persistência ensina mais do que o talento.',
    spirituality: 'O trabalho como ritual: a mão que repete aprende a estar presente.',
    obstacles: 'Confundir volume com refinamento.',
    opportunities: 'Uma especialização que valoriza o teu trabalho a médio prazo.',
    advice: [
      'Define um critério de qualidade verificável e revê o trabalho com ele.',
      'Trabalha 90 minutos diários sem interrupção: é a prática desta carta.',
      'Entrega a versão atual em vez de a ideal; melhora-a com feedback.',
    ],
    reflection: [
      'O que eu repito e já não me ensina nada?',
      'Onde a minha exigência está a servir a entrega — e onde a impede?',
      'Que detalhe eu sei que falta e adio?',
    ],
    relations: [
      { card: 'major-08-strength', kind: 'reforca', note: 'Força suave e repetição: mestria sem pressa.' },
      { card: 'minor-swords-04', kind: 'complementa', note: 'Trabalho e descanso: a peça que falta ao artesão.' },
    ],
    art: {
      scene: 'artisan-hammering-pentacles-on-wall',
      sky: 'day',
      terrain: 'city',
      glyphs: ['coin-single', 'hammer', 'chisel-tools', 'eight-coin-wall', 'workbench', 'street-view'],
      palette: ['#EFE6D6', '#C6A66B', '#11172A'],
      motifs: ['artesão com martelo', 'fileira de pentáculos na parede', 'oitavo em curso', 'rua ao fundo com figueira'],
      reading: [
        'Os pentáculos já feitos são quase iguais; o que está a ser feito é melhor.',
        'A rua ao fundo está vazia: a mestria exige ausência temporária.',
        'A ferramenta é simples e usada corretamente: método, não força.',
      ],
    },
    a11y: {
      alt: 'Carta Oito de Ouros: artesão concentrado a gravar um pentáculo numa parede onde já há outros sete, com uma bancada de ferramentas e uma rua ao fundo.',
      long:
        'Interior de oficina com janela aberta para rua com figueira. Centro: figura de avental, de joelhos, com martelo e cinzel sobre um disco de metal; atrás, sete discos idênticos pendurados na parede, em linha dupla. Moldura com o numeral VIII de Ouros.',
    },
    sources: ['Marseille – huit de denier', 'Golden Dawn – Vénus na Terra, "Prudence"'],
  },
  {
    id: 'minor-pentacles-09',
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    rank: '9',
    name: { pt: 'Nove de Ouros', intl: 'Nine of Pentacles' },
    archetype: 'Abundância auto-suficiente / colher o que se construiu',
    element: 'earth',
    astro: 'Vénus em Virgem',
    gdTitle: 'Ganho Material',
    traditionNote: 'Título da Golden Dawn: "ganho da terra". A figura com falcão e uvas é leitura de autonomia e fruição — não de ostentação.',
    keywords: {
      upright: ['independência material', 'prazer cultivado', 'segurança própria', 'elegância sem esforço', 'recolha pessoal'],
      reversed: ['dependência de aparências', 'isolamento confortável', 'riqueza sem raiz', 'insegurança financeira', 'gasto por estatuto'],
    },
    history:
      'Waite desenhou uma mulher num jardim murado, com um falcão no pulso e um cesto de uvas, nove pentáculos espalhados — cena inspirada nas imagens de "Amor Divino" e nos jardins de prazer medievais. Nas cartas latinas a carta era apenas um conjunto de discos, sem personagem.',
    meanings: {
      upright:
        'Colhes o que plantaste sozinha e gostas do que vês. Esta carta descreve autonomia financeira, conforto merecido, prazer cultivado (mesa, casa, vinho, roupa, viagens) e a paz de não depender de ninguém para estar bem.',
      reversed:
        'Ou a abundância é de fachada, ou a independência virou isolamento. Descreve também conforto que não se sustenta, e gastar para ser vista como próspera.',
    },
    psychology:
      'É o narcisismo saudável: reconhecer o próprio valor com provas concretas. Em sombra, a auto-suficiência como defesa contra intimidade.',
    emotional: 'Serenidade, prazer privado, afeto seletivo e sem pressa.',
    love: 'Pessoa completa que escolhe, não que precisa; boa para quem quer relação sem dependência. Em inversão: solidão confortável como substituto.',
    career: 'Independência: freelance consolidado, rendimento próprio, projeto terminado e bem pago, promoções com autonomia. Favorece quem trabalha sozinho com excelência.',
    finances: 'Fase confortável, com capacidade de poupar e investir em qualidade; cuidado com gasto em estatuto.',
    growth: 'Permitir-se gozar sem produzir. A colheita também se come.',
    spirituality: 'A gratidão encarnada: o jardim como criação que se cuida e se partilha.',
    obstacles: 'Confundir independência com recusa de vínculo.',
    opportunities: 'Um conforto que se tornou estável e pode finalmente ser disfrutado.',
    advice: [
      'Compra ou faz uma coisa bonita só para ti, hoje.',
      'Convida alguém para dentro do muro: a carta cresce quando partilhada.',
      'Documenta as tuas fontes de rendimento — a segurança precisa de mapa.',
    ],
    reflection: [
      'O que é que tenho é meu ou é para os outros verem?',
      'Consigo gostar do que consegui?',
      'A minha independência protege-me ou isola-me?',
    ],
    relations: [
      { card: 'major-03-empress', kind: 'reforca', note: 'Abundância e fruição: fertilidade que chega a fruto.' },
      { card: 'minor-cups-king', kind: 'complementa', note: 'Independência com ternura: o antídoto da auto-suficiência fria.' },
    ],
    art: {
      scene: 'woman-in-walled-garden-with-falcon',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['falcon', 'grape-cluster', 'nine-coin-vines', 'walled-garden', 'hat-veil', 'vine'],
      palette: ['#56C5BD', '#C6A66B', '#EFE6D6'],
      motifs: ['figura com capuz e vestido longo', 'falcão no pulso', 'videira com uvas', 'nove pentáculos no chão', 'muro de jardim'],
      reading: [
        'O falcão está domado e não preso: a independência tem treino, não só direito.',
        'As uvas e os discos no chão mostram colheita já feita.',
        'O muro delimita e não fecha: há portão visível.',
      ],
    },
    a11y: {
      alt: 'Carta Nove de Ouros: mulher num jardim murado com um falcão no pulso e um cesto de uvas, com nove moedas espalhadas aos pés.',
      long:
        'Jardim murado com vinha e roseiras. Centro: figura de vestido comprido e capéu de véu, de pé junto a um portal baixo, com um falcão pousado na mão esquerda e a direita pousada sobre uma vara; ao chão, nove discos dourados e cachos de uva. Moldura com o numeral IX de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua na Terra, "Gain"'],
  },
  {
    id: 'minor-pentacles-10',
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    rank: '10',
    name: { pt: 'Dez de Ouros', intl: 'Ten of Pentacles' },
    archetype: 'Herança e continuidade / o que fica',
    element: 'earth',
    astro: 'Mercúrio em Virgem',
    gdTitle: 'Riqueza',
    traditionNote: 'Título da Golden Dawn: "descanso do mundo" — o fecho do ciclo material, com três gerações e um portão.',
    keywords: {
      upright: ['herança', 'estabilidade durável', 'família e linhagem', 'instituição', 'longo prazo', 'património'],
      reversed: ['conflito de herança', 'dívida familiar', 'tradição que pesa', 'perda de património', 'responsabilidade não partilhada'],
    },
    history:
      'A cena de Waite com três gerações, dois cães, um portão com dez pentáculos e uma figura idosa a acenar é uma das mais literalmente positivas do baralho. Nas cartas latinas, o dez de ouros não tinha figura, apenas discos em círculo.',
    meanings: {
      upright:
        'O que se constrói dura e passa. Esta carta favorece património, herança, contrato de longo prazo, reforma, família, empresa familiar e todo o projeto pensado para durar mais do que uma vida útil individual.',
      reversed:
        'O que se deixou por organizar: partilhas, testamentos, conflitos de família sobre dinheiro, tradições que limitam, ou património que pesa mais do que serve.',
    },
    psychology:
      'É a função de continuidade: a capacidade de se ver como elo de uma cadeia. Em sombra, o peso da lealdade familiar e a confusão entre herdar e merecer.',
    emotional: 'Alegria doméstica, segurança, pertença, afeto intergeracional.',
    love: 'Compromisso estável com família alargada, casamento com projecto, filhos, casa própria. Em inversão: conflitos de família ou de dinheiro.',
    career: 'Empresa consolidada, instituição, promoção com estabilidade, sucessão, negócio familiar. Favorável a pensar em décadas.',
    finances: 'O melhor ouros do baralho para longo prazo: imóveis, reforma, seguros, testamento, investimento passivo.',
    growth: 'Construir o que sobrevive à motivação: sistemas, não picos.',
    spirituality: 'A bênção que passa de mão em mão: memória e responsabilidade.',
    obstacles: 'Adiar o que precisa de estar escrito.',
    opportunities: 'Um suporte familiar ou institucional que garante o próximo passo.',
    advice: [
      'Regulariza por escrito: testamento, contrato, contas partilhadas.',
      'Fala de dinheiro com a família hoje, com calma e com números.',
      'Escolhe uma coisa para construir a dez anos.',
    ],
    reflection: [
      'O que quero que continue depois de mim?',
      'Que dívida de família estou a pagar sem saber?',
      'Que parte da tradição me serve e qual me limita?',
    ],
    relations: [
      { card: 'major-21-world', kind: 'reforca', note: 'Ciclo cumprido no plano material: totalidade com herança.' },
      { card: 'minor-pentacles-01', kind: 'continuidade', note: 'A moeda que começa e a moeda que fica.' },
    ],
    art: {
      scene: 'three-generations-under-gate-with-ten-coins',
      sky: 'day',
      terrain: 'city',
      glyphs: ['ten-coin-gate', 'children-pair', 'dog-two', 'old-figure', 'house-small', 'path-straight'],
      palette: ['#C6A66B', '#EFE6D6', '#4A1F39'],
      motifs: ['portão com dez pentáculos', 'criança a brincar', 'casal jovem', 'idoso com capa', 'dois cães'],
      reading: [
        'O portão com dez discos é o marco: a segurança tem entrada definida.',
        'As três gerações não estão em pose: estão ocupadas, cada uma com a sua tarefa.',
        'Os dois cães representam guarda, não festa: o que se tem, protege-se.',
      ],
    },
    a11y: {
      alt: 'Carta Dez de Ouros: três gerações de uma família com duas crianças, dois cães e uma figura idosa, diante de um portão decorado com dez moedas, com casas ao fundo.',
      long:
        'Pátio com portão alto decorado com dez discos e casas ao fundo. Centro: figura adulta e outra idosa de capa, uma criança a correr entre duas figuras jovens, dois cães junto ao portão. Moldura com o numeral X de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Marte na Terra, "Rest"'],
  },
  {
    id: 'minor-pentacles-page',
    arcana: 'minor',
    suit: 'pentacles',
    number: 11,
    rank: 'page',
    name: { pt: 'Pajem de Ouros', intl: 'Page of Pentacles' },
    archetype: 'Aprendiz paciente / a semente que se estuda',
    element: 'earth',
    astro: 'Terra da Terra',
    gdTitle: 'Princesa das Colinas Sonoras',
    traditionNote: 'O pajem de ouros examina o disco com cuidado, com campo lavrado ao fundo: leitura de estudo aplicado e de oportunidade pequena e real.',
    keywords: {
      upright: ['aprendizagem prática', 'estudo paciente', 'bolsa ou formação', 'disciplina', 'perspectiva concreta'],
      reversed: ['estagnação por medo', 'oportunidade subestimada', 'preguiça prática', 'falta de método', 'ganho adiado'],
    },
    history:
      'Waite desenhou-o de pé, a olhar um pentáculo como quem o estuda, com um campo verde arado atrás e um pequeno touro ao fundo. É a carta do aprendiz metódico e herda a função do "fante" de ouros italiano: mensageiro de assunto concreto.',
    meanings: {
      upright:
        'Uma oportunidade pequena com potencial de rendimento ou de formação. Esta carta favorece estudar, fazer o curso, aceitar o estágio, plantar a primeira linha, aprender um ofício devagar e com método.',
      reversed:
        'Adiar por falta de confiança, ou aceitar sem método. Indica também oportunidade subavaliada e o hábito de começar sem terminar.',
    },
    psychology:
      'É a função de atenção sustentada no real: tolerar o princípio lento. Em sombra, a inércia justificada por perfeccionismo.',
    emotional: 'Calma, persistência, afeto discreto e constante.',
    love: 'Cortejo lento e concreto (tempo, gestos, planos); relação que cresce devagar. Em inversão: passividade e medo de assumir.',
    career: 'Formação, estágio, primeiro emprego, projeto de baixa escala e alto aprendizado, bolsa. Recomendável aceitar o que paga pouco e ensina muito.',
    finances: 'Poupança paciente, rendimento pequeno e regular, juros compostos. A chave é começar e não interromper.',
    growth: 'Fazer o básico bem durante muito tempo: é a via do crescimento sem heroísmo.',
    spirituality: 'A paciência do agricultor: o estudo também é prática.',
    obstacles: 'Subestimar o que é pequeno: recusar o primeiro degrau por ser visivelmente insuficiente.',
    opportunities: 'Uma formação ou proposta concreta que abre caminho a médio prazo.',
    advice: [
      'Escolhe uma formação com prova final datada.',
      'Começa o que adiaste com a primeira versão mais simples.',
      'Regista o progresso semanalmente: é o combustível desta carta.',
    ],
    reflection: [
      'Que semente pequena posso plantar esta semana?',
      'O que eu evito por parecer demasiado lento?',
      'Como eu sustento a disciplina quando ninguém aplaude?',
    ],
    relations: [
      { card: 'minor-pentacles-08', kind: 'continuidade', note: 'Do aprendiz ao artesão: a mesma via, mais longe.' },
      { card: 'minor-pentacles-01', kind: 'reforca', note: 'Semente e mão paciente: combinação ideal para começar.' },
    ],
    art: {
      scene: 'page-examining-coin-in-field',
      sky: 'day',
      terrain: 'field',
      glyphs: ['coin-single', 'bull-fixed', 'plough', 'tunic-leaf', 'vine-leaf'],
      palette: ['#56C5BD', '#C6A66B', '#EFE6D6'],
      motifs: ['figura a examinar um disco', 'campo arado ao fundo', 'touro pequeno ao longe', 'túnica com folhas de videira'],
      reading: [
        'O disco está ao nível dos olhos: o estudo do concreto é a função.',
        'O campo arado atrás indica que a aprendizagem é para aplicar.',
        'O touro ao fundo é a estação: Taurus rege este naipe.',
      ],
    },
    a11y: {
      alt: 'Carta Pajem de Ouros: figura jovem de túnica com folhas de videira segurando um disco dourado à altura dos olhos, com campo arado e um touro ao fundo.',
      long:
        'Campo verde arado com um touro pequeno ao fundo e colinas. Centro: figura jovem de pé, com chapéu de pontas e túnica decorada com folhas, as duas mãos a segurar um disco dourado à frente do peito, cabeça inclinada a examinar. Moldura com o rótulo de pajem de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Terra da Terra'],
  },
  {
    id: 'minor-pentacles-knight',
    arcana: 'minor',
    suit: 'pentacles',
    number: 12,
    rank: 'knight',
    name: { pt: 'Cavaleiro de Ouros', intl: 'Knight of Pentacles' },
    archetype: 'Constância / a entrega que não falha',
    element: 'earth',
    astro: 'Ar da Terra',
    gdTitle: 'Príncipe da Carruagem da Terra',
    traditionNote: 'O cavaleiro mais lento do baralho: cavalo parado, olhando o disco. Waite usa a imobilidade como força.',
    keywords: {
      upright: ['fiabilidade', 'rotina sustentada', 'trabalho metódico', 'pontualidade', 'compromisso cumprido'],
      reversed: ['estagnação', 'rigidez', 'tédio', 'falta de urgência', 'obstinação improdutiva'],
    },
    history:
      'Ao contrário dos outros três cavaleiros, o de Ouros está quieto, com o cavalo parado e o olhar fixo no pentáculo. Esta diferença introduzida por Waite é a chave de leitura: a carta não promete velocidade, promete conclusão.',
    meanings: {
      upright:
        'Chega o que foi prometido, a horas, com qualidade. Esta carta favorece processos lentos e seguros, contratos de execução, obras, tratamentos, aprendizagem contínua, e pessoas em quem se pode confiar por histórico.',
      reversed:
        'A rotina virou jaula: lentidão excessiva, recusa de mudar de método, trabalho repetido sem resultado novo. Também indica promessa cumprida tarde demais.',
    },
    psychology:
      'É a função de continuidade do eu: a capacidade de sustentar a intenção ao longo do tempo. Em sombra, a rigidez defensiva que confunde estabilidade com segurança.',
    emotional: 'Afecto estável, pouca variação, lealdade sem espetáculo.',
    love: 'Compromisso sólido, pouco romântico e muito presente; ideal para construir. Em inversão: monotonia e recusa de conversar.',
    career: 'Execução, gestão de operações, obra, logística, função técnica. Excelente cumpridor, má pessoa para decidir mudanças rápidas.',
    finances: 'Poupança sistemática, pagamento atempado, amortização constante. Não é carta de sorte, é carta de plano.',
    growth: 'Sustentar o que funciona em vez de procurar novidade para aliviar tédio.',
    spirituality: 'A fé como constância: estar presente todos os dias, sem plateia, é a prática desta via.',
    obstacles: 'Confundir ritmo com falta de direção.',
    opportunities: 'Um trabalho ou pessoa que garante execução e libera o teu foco.',
    advice: [
      'Faz o plano com calendário realista e cumpre o primeiro bloco.',
      'Introduz uma mudança de método esta semana para não enferrujar.',
      'Diz a data de entrega — e entrega-a nessa data.',
    ],
    reflection: [
      'Onde a minha estabilidade se tornou rigidez?',
      'Que promessa minha precisa de data, não de intenção?',
      'O que estou a sustentar que já devia ter mudado?',
    ],
    relations: [
      { card: 'major-08-strength', kind: 'reforca', note: 'Persistência suave: o mesmo esforço, todos os dias.' },
      { card: 'minor-swords-knight', kind: 'tensao', note: 'Dois ritmos incompatíveis: a velocidade e a constância.' },
    ],
    art: {
      scene: 'knight-on-standing-horse-holding-coin',
      sky: 'overcast',
      terrain: 'field',
      glyphs: ['coin-single', 'horse', 'armor', 'wheat-sheaf', 'plough'],
      palette: ['#C6A66B', '#11172A', '#EFE6D6'],
      motifs: ['cavalo parado', 'cavaleiro com disco na mão', 'armadura pesada', 'campo com trigo cortado'],
      reading: [
        'O cavalo não avança: está a avaliar o terreno, o que é uma decisão.',
        'O disco ocupa as duas mãos: o recurso é mais importante que o movimento.',
        'O campo trabalhado atrás indica resultado por método.',
      ],
    },
    a11y: {
      alt: 'Carta Cavaleiro de Ouros: cavaleiro de armadura parado num cavalo escuro, segurando um disco dourado com as duas mãos, num campo com trigo cortado.',
      long:
        'Campo arado com feixes de trigo e céu nublado. Centro: cavalo parado de perfil, cavaleiro com armadura e manto curto, cotovelos dobrados segurando um disco dourado. Sem movimento: nenhuma pata levantada. Moldura com o rótulo de cavaleiro de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Ar da Terra'],
  },
  {
    id: 'minor-pentacles-queen',
    arcana: 'minor',
    suit: 'pentacles',
    number: 13,
    rank: 'queen',
    name: { pt: 'Rainha de Ouros', intl: 'Queen of Pentacles' },
    archetype: 'Cuidado prático / a que faz render e alimentar',
    element: 'earth',
    astro: 'Água da Terra',
    gdTitle: 'Rainha do Trono da Terra',
    traditionNote: 'O trono com touros e coelhos, e o lebre/raposa aos pés, indicam abundância doméstica e gestão, não ostentação.',
    keywords: {
      upright: ['gestão prática', 'cuidado com recursos', 'hospitalidade', 'eficiência serena', 'bem-estar concreto'],
      reversed: ['esgotamento doméstico', 'desorganização material', 'negligência do corpo', 'controlo pelo gasto', 'abundância sem estrutura'],
    },
    history:
      'Waite coloca a rainha num trono decorado com cabeças de touro, com um coelho pequeno aos pés e um disco sustentado nas mãos, em campo com trigo maduro e castelo ao fundo: a carta mais claramente ligada à administração do concreto em todo o baralho.',
    meanings: {
      upright:
        'Tornar a vida sustentável. Esta carta favorece gestão doméstica e financeira eficiente, alimentação, saúde, manutenção, organização de equipa e toda a função que faz os recursos renderem sem esgotar as pessoas.',
      reversed:
        'O cuidado virou carga invisível: despesa mal gerida, tarefas domésticas e emocionais sem divisão, negligência do corpo, excesso de controlo sobre o consumo dos outros.',
    },
    psychology:
      'É a função de sensação em sua forma madura e relacional: percepção do necessário, do suficiente e do que sustenta. Em sombra, o ressentimento de quem sustenta todos e não é sustentado.',
    emotional: 'Afeto prático, paciência, ternura expressa em actos.',
    love: 'Cuidado concreto, casa arrumada, mesa farta, corpo incluído. Em inversão: amor sentido como obrigação doméstica.',
    career: 'Administração, operações, logística, RH, saúde, alimentação, hotelaria, gestão do lar como função real. Forte capacidade de orçamento.',
    finances: 'Excelente gestão; fase para rever seguros, planos, compras de qualidade e despesas recorrentes.',
    growth: 'Reivindicar divisão do trabalho invisível, em vez de acumular e ressentir.',
    spirituality: 'O sagrado doméstico: o pão, a limpeza, a bênção do que sustenta o corpo.',
    obstacles: 'Fazer tudo porque ninguém o faz como tu.',
    opportunities: 'Um sistema doméstico ou financeiro que liberta tempo e dinheiro.',
    advice: [
      'Distribui as tarefas invisíveis por escrito esta semana.',
      'Revisa despesa recorrente: o corte pequeno e permanente vale mais que o grande e único.',
      'Cuida do corpo primeiro: é a base do que sustentas.',
    ],
    reflection: [
      'Quanto do meu valor meço em utilidade?',
      'Que parte da minha vida prática está a ser governada pelo medo?',
      'O que acontece se eu deixar de fazer uma coisa?',
    ],
    relations: [
      { card: 'major-03-empress', kind: 'espelho', note: 'A rainha do concreto: fartura com gestão, não com excesso.' },
      { card: 'minor-cups-queen', kind: 'complementa', note: 'Cuidado material e escuta emocional: o par que sustenta uma casa.' },
    ],
    art: {
      scene: 'queen-on-bull-throne-with-coin-and-hare',
      sky: 'day',
      terrain: 'field',
      glyphs: ['pentacle-throne', 'coin-single', 'bull-fixed', 'rabbit', 'wheat-sheaf', 'castle-small'],
      palette: ['#C6A66B', '#56C5BD', '#EFE6D6'],
      motifs: ['trono com cabeças de touro', 'disco nas mãos', 'coelho aos pés', 'campo de trigo e castelo ao fundo'],
      reading: [
        'Os touros no trono ligam a rainha a Taurus: estabilidade como método.',
        'O coelho aos pés é reprodução e recurso — a vida prática multiplica-se.',
        'O castelo ao fundo indica que há estrutura, não só manutenção.',
      ],
    },
    a11y: {
      alt: 'Carta Rainha de Ouros: figura coroada sentada num trono decorado com touros, segurando um disco dourado com as duas mãos, com um coelho aos pés e um campo de trigo ao fundo.',
      long:
        'Campo de trigo maduro com castelo ao fundo. Centro: figura sentada com coroa, túnica comprida e manto, mãos a segurar um disco; trono com protomes de touro nos braços; coelho pequeno na base. Moldura com o rótulo de rainha de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Água da Terra'],
  },
  {
    id: 'minor-pentacles-king',
    arcana: 'minor',
    suit: 'pentacles',
    number: 14,
    rank: 'king',
    name: { pt: 'Rei de Ouros', intl: 'King of Pentacles' },
    archetype: 'Construtor durável / poder com prudência',
    element: 'earth',
    astro: 'Fogo da Terra',
    gdTitle: 'Rei dos Espíritos da Terra',
    traditionNote: 'Trono com leões e águia, uvas no braço: abundância régia com governança; a figura está sentada com o disco apoiado, não exibido.',
    keywords: {
      upright: ['prosperidade estável', 'liderança prática', 'governança', 'visão de longo prazo', 'patrocínio', 'palavra cumprida'],
      reversed: ['avareza institucional', 'materialismo', 'poder que se fecha', 'exploração', 'decadência confortável'],
    },
    history:
      'O "Re di Denari" dos tarôs latinos é retrato de soberano com moeda e cetro, e Waite acrescenta a uva e o leão, símbolos de colheita e de autoridade, sentando-o sobre uma tapeçaria com águia. A carta tornou-se, no século XX, o arquétipo do empresário conservador.',
    meanings: {
      upright:
        'Poder que constrói e sustenta. Esta carta favorece quem governa com critério, cria emprego, mantém promessa, pensa em décadas e trata o dinheiro como responsabilidade. Indica também um aliado com recursos e palavra.',
      reversed:
        'O conforto virou fechado: avareza, controlo pelo dinheiro, exploração de dependentes, ou decrépito de riqueza mal gerida. Indica também chefe que só vê o resultado trimestral.',
    },
    psychology:
      'É a integração de corpo, recurso e poder: a maturidade de quem pode e sustenta. Em sombra, a identificação do eu com o património.',
    emotional: 'Afecto estável e pouco verbal, exigência de lealdade, tolerância baixa à incompetência.',
    love: 'Segurança material e projecto comum; ciúmes se a lealdade se abala. Em inversão: controlo económico como forma de poder.',
    career: 'Direção geral, conselho, obra pública, banca, investimento, propriedade. Excelente para negociar e para cumprir contratos.',
    finances: 'Fase forte de património, rendimento passivo, crédito aprovado, investimento conservador de longo prazo.',
    growth: 'Usar o que tens para aumentar o que não é teu — no sentido mais amplo da palavra.',
    spirituality: 'A mordomia: a riqueza como incumbência, não como propriedade.',
    obstacles: 'Confundir prudência com medo de investir em pessoas.',
    opportunities: 'Um aliado ou instituição com recursos para financiar o que é durável.',
    advice: [
      'Firma o acordo com termos e garantias, não com confiança apenas.',
      'Aloca uma parte do recurso a algo que dure mais do que o atual ciclo.',
      'Contrata e mantém quem é bom; não troques por preço.',
    ],
    reflection: [
      'O que eu construí que sobreviverá a mim?',
      'Uso o recurso para controlar ou para sustentar?',
      'Que promessa minha ainda está por cumprir?',
    ],
    relations: [
      { card: 'major-04-emperor', kind: 'espelho', note: 'O trono e a terra: autoridade com património.' },
      { card: 'major-10-wheel', kind: 'tensao', note: 'O construtor de longo prazo desconfia do acaso — e precisa dele.' },
    ],
    art: {
      scene: 'king-on-throne-with-grapes-and-lions',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['pentacle-throne', 'coin-single', 'lion-fixed', 'grape-cluster', 'eagle', 'scepter'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['trono com leões e uvas', 'disco apoiado na mão', 'águia no encosto', 'vinha no braço do trono'],
      reading: [
        'O disco está pousado na mão, não erguido: o recurso não é espetáculo.',
        'As uvas e os leões ligam abundância e força — a mesma mão que colhe governa.',
        'A águia no encosto é visão de longo prazo: o rei vê o campo, não só o caixa.',
      ],
    },
    a11y: {
      alt: 'Carta Rei de Ouros: figura coroada sentada num trono decorado com leões e cachos de uva, com um disco na mão direita e um cetro na esquerda, diante de um campo maduro.',
      long:
        'Interior com cortinado e campo visível atrás. Centro: figura de barba com coroa e manto, sentada em trono com cabeças de leão nos braços e cachos de uva esculpidos, disco dourado na mão direita, cetro na esquerda, tapeçaria com águia no encosto. Moldura com o rótulo de rei de Ouros.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Fogo da Terra'],
  },
]
