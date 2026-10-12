import type { CardSource } from '../../../src/domain/types.ts'

/**
 * Naipe de Copas — elemento Água, função afectiva, relação e intuição.
 * Raiz numérica idêntica aos outros naipes (1=semente … 10=resultado), colorida
 * pela água: ligação, memória, troca emocional.
 */
export const CUPS: CardSource[] = [
  {
    id: 'minor-cups-01',
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    rank: 'ace',
    name: { pt: 'Ás de Copas', intl: 'Ace of Cups' },
    archetype: 'O cálice aberto / afeto disponível',
    element: 'water',
    astro: 'Raiz dos Poderes da Água',
    gdTitle: '—',
    traditionNote: 'Waite desenhou cinco gotas a cair do cálice — leitura clássica de dádiva que se multiplica ao ser dada.',
    keywords: {
      upright: ['abertura afetiva', 'gratidão', 'início de vínculo', 'criatividade emocional', 'oferta sincera'],
      reversed: ['afeto entornado', 'seca emocional', 'generosidade condicional', 'vazio', 'rejeição do cuidado'],
    },
    history:
      'O Ás de copas nas baralhas latinas é um Graal simplificado, por vezes com hóstia no interior; Waite acrescentou as cinco gotas, as lírios e a serpente discreta do fundo, fixando-lhe a leitura de fonte que dá sem esvaziar.',
    meanings: {
      upright:
        'Algo volta a fluir. Esta carta abre um período de sensibilidade boa: reconciliação, novo afeto, ideia que emociona, perdão recebido ou concedido. É oferta: aceita e devolve em espécie.',
      reversed:
        'O copo está ao contrário e a água perde-se. Descreve cansaço afetivo, dar a quem não devolve, sentimento reprimido até ao torpor, e a perda de acesso à própria emoção por excesso de exigência.',
    },
    psychology:
      'É a função de sentimento em estado puro, ainda não formatada por defesas: capacidade de ser tocado. Em sombra, a inundação — sentimento sem continente — ou a inversão, que é a secura escolhida.',
    emotional: 'Doçura, abertura, ternura fácil, vontade de cuidar.',
    love: 'Declaração correspondida, reencontro, gravidez, início de relação com qualidade afectiva real. Em inversão: afeto que só existe numa ponta.',
    career: 'Projeto com sentido, cliente grato, equipa coesa, vocação recuperada. Favorável ao que se faz por gosto e não só por ganho.',
    finances: 'Ganho pequeno e simbólico, restituição, oferta; cuidado com pagar afectos e com despesas emocionais.',
    growth: 'Praticar receber: a abertura do copo serve também para o que entra.',
    spirituality: 'A taça como coração: devoção sem esforço, compaixão que não se esgota.',
    obstacles: 'Confundir intensidade com intimidade.',
    opportunities: 'Um gesto de aproximação que resolve mais do que qualquer argumento.',
    advice: [
      'Diz hoje o que sentes a quem importa, sem esperar a ocasião.',
      'Aceita um cuidado oferecido, em vez de o retribuir imediatamente.',
      'Retira-te de uma troca em que só um lado dá.',
    ],
    reflection: [
      'O que me faz sentir vivo e estou a recusar por parecer pouco produtivo?',
      'Como reajo quando alguém me dá sem eu pedir?',
      'Que afeto estou a entornar em quem não o recebe?',
    ],
    relations: [
      { card: 'major-03-empress', kind: 'reforca', note: 'Nutrição e afeto disponível: fase fértil no plano emocional.' },
      { card: 'minor-cups-05', kind: 'sombra', note: 'A mesma água que pode ser perdida se a atenção estiver só no que derramou.' },
    ],
    art: {
      scene: 'cup-in-cloud-with-five-drops',
      sky: 'dawn',
      terrain: 'water',
      glyphs: ['chalice', 'dove', 'lily', 'water-jar', 'hand-offering'],
      palette: ['#56C5BD', '#EFE6D6', '#C6A66B'],
      motifs: ['cálice com cinco gotas', 'nuvem que segura a taça', 'lírios em volta', 'superfície de água calma', 'espírito em forma de ave'],
      reading: [
        'As cinco gotas caem para fora da taça: o afeto existe para transbordar.',
        'A mão que sai da nuvem indica dádiva recebida, não conquistada.',
        'Os lírios à volta marcam pureza de intenção, não inocência ingenua.',
      ],
    },
    a11y: {
      alt: 'Carta Ás de Copas: mão que sai de uma nuvem segurando um cálice do qual caem cinco gotas, rodeado de lírios sobre um lago calmo.',
      long:
        'Composição vertical com mar ou lago em baixo, nuvem clara no centro e mão a segurar uma taça dourada alta de que pendem cinco gotas. Lírios brancos à volta e uma ave pequena no topo. Moldura com o rótulo de ás de copas.',
    },
    sources: ['Waite – Pictorial Key', 'Sola-Busca – vaso con ostia'],
  },
  {
    id: 'minor-cups-02',
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    rank: '2',
    name: { pt: 'Dois de Copas', intl: 'Two of Cups' },
    archetype: 'Encontro recíproco / pacto de igual para igual',
    element: 'water',
    astro: 'Vénus em Caranguejo',
    gdTitle: 'Amor',
    traditionNote: 'Chokmah em relação: na Golden Dawn é "amor", e a caduceus sob os dois significa troca equilibrada, não fusão.',
    keywords: {
      upright: ['reciprocidade', 'aliança afetiva', 'entendimento claro', 'atração mútua', 'parceria com regras'],
      reversed: ['desequilíbrio na troca', 'ruptura recente', 'mal-entendido', 'relação por conveniência', 'reconciliação falhada'],
    },
    history:
      'Waite pintou um homem e uma mulher de copos erguidos, com um caduceu e uma coroa de folhas em cima: um símbolo conjugal que herda o retrato de noivado das baralhas italianas. Marselha não tem cena, apenas duas taças — o que torna a leitura de "acordo" mais antiga do que a de "romance".',
    meanings: {
      upright:
        'Dois copos à mesma altura. Esta carta confirma vínculo escolhido e correspondido: namoro estável, sociedade com confiança, reconciliação com termos claros, encontro em que ambos reconhecem o valor do outro.',
      reversed:
        'A troca fica inclinada: um dá mais, um recebe mais, e o desequilíbrio é tolerado. Indica também rutura de acordo, ou um vínculo mantido por medo de perder a reciprocidade, não por vontade de a sustentar.',
    },
    psychology:
      'É a função de relação: a capacidade de manter diferença sem anular o outro. Em análise aparece como o modelo interno de vínculo, aquilo que se reproduz automaticamente na primeira conversa.',
    emotional: 'Segurança afectiva, interesse, curiosidade recíproca.',
    love: 'Uma das melhores cartas para amar: encontro, pedido, confirmação, casamento. O seu conselho é o mesmo para começar e para durar: termos ditos cedo.',
    career: 'Sociedade, contrato de parceria, cliente ideal, negociação ganha-ganha. Favorável a fechar acordos com regras e prazos.',
    finances: 'Contas conjuntas justas, partilha de despesa, investimento a dois; exige contrato mesmo com quem se ama.',
    growth: 'Aprender a pedir o que preciso e a dar sem faturar.',
    spirituality: 'Hierosgamos em escala humana: dois copos que se respeitam, sem se derramarem um no outro.',
    obstacles: 'Idealizar a reciprocidade em vez de a negociar.',
    opportunities: 'Um acordo que aumenta os dois lados e cria estrutura durável.',
    advice: [
      'Escreve o acordo antes da festa: o que cada um dá, o que cada um espera.',
      'Diz o que sentes com factos, não com insinuações.',
      'Se deste a mais, pede em vez de acumular ressentimento.',
    ],
    reflection: [
      'Esta relação está à mesma altura nos dois lados?',
      'O que eu dou é o que o outro precisa, ou o que eu sei dar?',
      'Que termo meu ficou por dizer para não incomodar?',
    ],
    relations: [
      { card: 'major-06-lovers', kind: 'reforca', note: 'O arcano dá a escolha, a carta dá o encontro: vínculo declarado e concreto.' },
      { card: 'minor-cups-06', kind: 'continuidade', note: 'Do acordo à memória partilhada: relação que ganha história.' },
    ],
    art: {
      scene: 'two-figures-exchanging-cups-under-caduceus',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['chalice', 'caduceus', 'winged-lion', 'heart-open', 'laurel-wreath'],
      palette: ['#EFE6D6', '#4A1F39', '#C6A66B'],
      motifs: ['duas taças a tocar-se', 'caduceu entre as cabeças', 'leão alado pequeno', 'coroa de folhas'],
      reading: [
        'As taças inclinam-se uma para a outra, mas nenhuma se despeja: troca sem anulação.',
        'O caduceu com duas serpentes é equilíbrio dinâmico, não simetria morta.',
        'O pequeno leão alado indica que há força afectiva contida num acordo sereno.',
      ],
    },
    a11y: {
      alt: 'Carta Dois de Copas: duas figuras de pé a inclinar os copos uma na direção da outra, sob um caduceu alado e uma coroa de folhas.',
      long:
        'Jardim de dia. Centro-esquerda e centro-direita: duas figuras com copos de prata, braços estendidos, taças próximas sem se tocarem. Entre as cabeças, caduceu com duas serpentes e asas; acima, coroa circular de folhas verdes. Moldura com o numeral II de Copas.',
    },
    sources: ['Marseille – deux de coupe', 'Golden Dawn – Vénus em Peixes, "Love\'s Homage"'],
  },
  {
    id: 'minor-cups-03',
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    rank: '3',
    name: { pt: 'Três de Copas', intl: 'Three of Cups' },
    archetype: 'Amizade e colheita / alegria a três',
    element: 'water',
    astro: 'Mercúrio em Caranguejo',
    gdTitle: 'Prazer Misto',
    traditionNote: 'Binah multiplicada: na Golden Dawn é "abundância" — a alegria partilhada que a torna maior.',
    keywords: {
      upright: ['celebração colectiva', 'amizade', 'gratidão em grupo', 'colheita partilhada', 'apoio mútuo'],
      reversed: ['excesso social', 'triângulo afectivo', 'convites que esgotam', 'festa para esquecer', 'clique fechado'],
    },
    history:
      'Três mulheres a dançar em círculo com taças levantadas, à volta de uma mesa carregada de frutas: cena de colheita que vem das gravuras renascentistas e mantém sentido quase intacto. O número três é aqui o primeiro número da relação plural — nem par, nem multidão.',
    meanings: {
      upright:
        'A alegria aumenta quando é compartilhada e há quem queira compartilha-la. A carta favorece reencontros, celebrações, trabalho em equipa bem-sucedido e apoio prático de amigos. É também tradicionalmente lida como novidade para anunciar em grupo.',
      reversed:
        'A mesa enche-se por outro motivo: fuga, obrigação social, ou um vínculo de três em que os termos não foram ditos. Pode indicar agenda social que drena mais do que alimenta.',
    },
    psychology:
      'É a função do prazer compartilhado e da pertença, com sua sombra: o medo de ficar de fora que leva a aceitar convites que não se querem.',
    emotional: 'Euforia leve, ternura social, gratidão.',
    love: 'Festa com quem se gosta, anúncio público, relação acolhida pelo grupo. Em inversão: triângulo, ciúme de amigos, ou relação celebrada antes de estar sustentada.',
    career: 'Parceria de três, projeto de equipa, evento, apresentação bem recebida. Favorável a networking informal.',
    finances: 'Gasto social com retorno afectivo — desde que o orçamento o permita; boas colaborações com divisão justa de despesa.',
    growth: 'Permitir-se alegria sem produzir: nem toda a reunião precisa de ata.',
    spirituality: 'A bênção da mesa: o sagrado acontece no comer compartilhado.',
    obstacles: 'Confundir companhia com intimidade.',
    opportunities: 'Um grupo que te sustenta material e emocionalmente.',
    advice: [
      'Marca a celebração do que já correu bem — com data e pessoas concretas.',
      'Num vínculo de três, diga-se logo o que cada um espera.',
      'Recusa um convite que aceitas por obrigação, esta semana.',
    ],
    reflection: [
      'Com quem eu celebro, e porque raramente celebro?',
      'Que relação de grupo me custa manter?',
      'Estou a fugir para a festa ou a partilhar?',
    ],
    relations: [
      { card: 'minor-wands-04', kind: 'reforca', note: 'Duas cartas de celebração: marco atingido com pessoas certas.' },
      { card: 'minor-cups-07', kind: 'sombra', note: 'Da alegria concreta à fantasia de possibilidades.' },
    ],
    art: {
      scene: 'three-women-dancing-with-cups',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['chalice', 'cluster-grapes', 'wheat', 'vine', 'dancer-four'],
      palette: ['#EFE6D6', '#C6A66B', '#56C5BD'],
      motifs: ['três mulheres em roda', 'taças erguidas', 'cestos de fruta na mesa', 'vinha atrás'],
      reading: [
        'As três taças formam um triângulo: a festa tem estrutura, não só movimento.',
        'A mesa com fruta mostra que a colheita precedeu a dança.',
        'Nenhuma das figuras está virada para o observador: é círculo aberto, não espetáculo.',
      ],
    },
    a11y: {
      alt: 'Carta Três de Copas: três figuras a dançar de mãos dadas em roda, cada uma com uma taça, à frente de uma mesa com fruta e de uma vinha.',
      long:
        'Jardim com fileira de videiras ao fundo. Centro: três figuras em círculo, saias compridas, braços ligados por cima das cabeças, cada uma com uma taça erguida. Primeiro plano, mesa baixa com cachos de uva, figos e pão. Moldura com o numeral III de Copas.',
    },
    sources: ['Marseille – trois de coupe', 'Golden Dawn – Mercúrio em Aquário, "Abundance"'],
  },
  {
    id: 'minor-cups-04',
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    rank: '4',
    name: { pt: 'Quatro de Copas', intl: 'Four of Cups' },
    archetype: 'Apatia / a oferta não aceite',
    element: 'water',
    astro: 'Lua em Caranguejo',
    gdTitle: 'Prazer Decepcionado',
    traditionNote: 'Chesed interrompido: "estagnação". A mão que oferece a taça vem de uma nuvem, o que sugere oferta que não podia ser prevista.',
    keywords: {
      upright: ['desinteresse', 'recusa do que é oferecido', 'tédio afetivo', 'revisão de prioridades', 'ressaca de conquista'],
      reversed: ['nova oportunidade aceite', 'saída do torpor', 'abertura repentina', 'reconsideração'],
    },
    history:
      'A figura sentada sob uma árvore, com três taças à frente e uma oferecida por uma mão que sai da nuvem, é uma das composições mais limpas de Waite. Nasce de uma leitura moral do desígnio desperdiçado: a taça oferecida que o retrato ignora.',
    meanings: {
      upright:
        'Há algo a ser oferecido e não está a ser visto. Esta carta descreve o estado de quem está satisfeito a mais para querer e aborrecido a mais para aproveitar: tédio, desânimo leve, recusa por princípio. Também pede uma pausa para reavaliar o que se quer mesmo.',
      reversed:
        'A taça é aceite. Descreve o momento em que se retoma interesse, se diz sim a um convite inesperado, ou se reconhece a oportunidade que tinha sido recusada.',
    },
    psychology:
      'É o mecanismo da anedonia suave e da defesa pelo aborrecimento: não querer para não correr o risco de precisar. Na análise, frequentemente esconde uma frustração antiga.',
    emotional: 'Entorpecimento, irritação passiva, nostalgia do que ainda não aconteceu.',
    love: 'Desinteresse momentâneo, ou recusa de uma aproximação genuína. Em inversão: reaparecimento de vontade, convite aceite, mudança de humor.',
    career: 'Proposta recebida sem entusiasmo, projeto que desiludiu depois da conquista, período de desmotivação. Reveja critérios antes de recusar.',
    finances: 'Baixo apetite de risco; atenção a ofertas recusadas automaticamente e a compras por tédio.',
    growth: 'Distinguir tédio de sabedoria: nem toda a recusa é discernimento.',
    spirituality: 'A noite Serena do desejo: o vazio que precede a escolha consciente.',
    obstacles: 'Recusar por hábito: dizer não antes de saber o que está a ser oferecido.',
    opportunities: 'A quarta taça: aquilo que chega quando se está distraído e que só se vê ao levantar os olhos.',
    advice: [
      'Antes de recusar, espera 48 horas e pergunta o que ganharias.',
      'Levanta a cabeça: olha duas vezes as ofertas que rejeitaste esta semana.',
      'Introduz uma novidade pequena na rotina para sair do torpor.',
    ],
    reflection: [
      'O que é que eu tenho recusado só por estar cansado?',
      'Que falta se esconde atrás deste desinteresse?',
      'Se nada mudar na próxima semana, do que vou arrepender-me?',
    ],
    relations: [
      { card: 'minor-cups-02', kind: 'tensao', note: 'A oferta recusada no momento em que o vínculo se podia firmar.' },
      { card: 'major-09-hermit', kind: 'reforca', note: 'Retiro produtivo quando a pausa é escolha, não apatia.' },
    ],
    art: {
      scene: 'seated-figure-ignoring-offered-cup',
      sky: 'overcast',
      terrain: 'garden',
      glyphs: ['chalice', 'hand-offering', 'tree-living', 'cloud-band', 'four-cups-row'],
      palette: ['#11172A', '#56C5BD', '#EFE6D6'],
      motifs: ['três taças no chão', 'quarta taça oferecida por uma mão', 'figura sentada de braços cruzados', 'árvore sobre a cabeça'],
      reading: [
        'As três taças estão à frente mas fora do alcance: foram ganhas e não usadas.',
        'A mão que oferece não vem de uma pessoa, mas de uma nuvem: a oportunidade é imprevisível.',
        'Os braços cruzados indicam recusa ativa, não distração.',
      ],
    },
    a11y: {
      alt: 'Carta Quatro de Copas: pessoa sentada sob uma árvore com braços cruzados diante de três taças, enquanto uma mão sai de uma nuvem oferecendo uma quarta taça.',
      long:
        'Cena de jardim sob céu encoberto. Centro: figura sentada num tronco baixo, braços cruzados, cabeça ligeiramente baixa; à frente, três copos em linha. Acima, nuvem clara com mão a estender um copo. Uma árvore frondosa cobre a composição. Moldura com o numeral IV de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua em Peixes, "Stagnation"'],
  },
  {
    id: 'minor-cups-05',
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    rank: '5',
    name: { pt: 'Cinco de Copas', intl: 'Five of Cups' },
    archetype: 'Perda e luto / as duas taças cheias',
    element: 'water',
    astro: 'Marte em Escorpião',
    gdTitle: 'Perda de Prazer',
    traditionNote: 'Geburah da água: "decepção". Na iconografia italiana eram cinco copos apenas; Waite inventou o personagem de capa com três derramados.',
    keywords: {
      upright: ['desapontamento', 'luto', 'foco na perda', 'arrependimento', 'deceção afetiva'],
      reversed: ['aceitação', 'recuperação', 'virar a página', 'reconciliar com o que falhou', 'consolo que chega'],
    },
    history:
      'É a carta mais citada do Tarot como retrato do luto: três taças caídas com o conteúdo a correr para o rio, duas cheias atrás, uma ponte ao fundo. Waite acrescentou o manto com gárgulas, a indicar o peso que se leva, e uma margem atravessável — a leitura não é de fim, é de atenção mal colocada.',
    meanings: {
      upright:
        'Perdeste algo e estás a olhar para isso; faz parte. A carta reconhece a dor da deceção sem a romanticizar e lembra que nem tudo se derramou: há recursos que ficaram e uma saída visível. É luto com prazo, não estado permanente.',
      reversed:
        'As taças cheias voltam a entrar no campo de visão. Indica aceitação, pedido de desculpas, fim de rancor, recuperação de vínculo e a capacidade de contar a perda sem se afogar nela.',
    },
    psychology:
      'É a elaboração do luto: a diferença entre chorar uma perda e viver dentro dela. Em sombra, o viés de atenção que torna invisível o que resta, mecanismo típico de estados depressivos.',
    emotional: 'Tristeza densa, culpa, nostalgia, solidão com vergonha.',
    love: 'Mágoa por relação que falhou ou por deceção recente; tendência a comparar com o que foi. Em inversão: reconciliação, perdão, reconstrução.',
    career: 'Projeto que não correu como prometido, promessa incumprida de cliente, resultado parcial. Aprecia o que ficou e planeia a margem de travessia.',
    finances: 'Perda parcial, investimento que rendeu menos, despesa inevitável. Não compense o desgosto com consumo.',
    growth: 'Contar a perda com precisão: quanto foi, o que resta, o que se aprendeu, o que se faz amanhã.',
    spirituality: 'O luto como prática: chorar com limite e continuar a andar em direção à ponte.',
    obstacles: 'Confundir o que ficou com o que se perdeu.',
    opportunities: 'Duas taças ainda cheias: um recurso ou relação que sobreviveu e pode ser retomado.',
    advice: [
      'Escreve em três linhas a perda e noutras três o que ficou.',
      'Faz uma reparação concreta: um pedido de desculpas, uma devolução, uma conversa.',
      'Define um prazo para lamentar e outro para agir.',
    ],
    reflection: [
      'Quanto do que perco é real e quanto é expectativa que criei sozinho?',
      'O que ainda tenho e estou a ignorar?',
      'A quem eu ainda não disse que me magoou?',
    ],
    relations: [
      { card: 'major-05-hierophant', kind: 'tensao', note: 'Deceção de quem ensinou a esperar.' },
      { card: 'major-17-star', kind: 'complementa', note: 'Depois das taças derramadas, a cura da estrela: sequência de luto e reparo.' },
    ],
    art: {
      scene: 'cloaked-figure-before-three-spilled-cups',
      sky: 'overcast',
      terrain: 'water',
      glyphs: ['chalice-spill', 'bridge-stone', 'cloak-hood', 'river-band', 'castle-small'],
      palette: ['#4A1F39', '#11172A', '#EFE6D6'],
      motifs: ['três taças deitadas', 'duas taças cheias atrás', 'figura de capa com gárgulas', 'ponte e castelo ao fundo', 'rio a receber o líquido'],
      reading: [
        'O líquido escorre para o rio: a perda não desaparece, apenas muda de estado.',
        'As duas taças de trás estão cheias e intactas.',
        'A ponte ao fundo não é decorativa: indica travessia com caminho feito.',
        'A capa com rostos pequenos é o peso que se arrasta, muitas vezes por escolha.',
      ],
    },
    a11y: {
      alt: 'Carta Cinco de Copas: pessoa de capa inclinada diante de três taças derramadas, com duas taças cheias atrás, um caminho de terra e uma ponte ao fundo.',
      long:
        'Margem de rio com vegetação seca. Centro: figura de costas meio virada, capuz e capa com pequenos rostos bordados, mãos juntas à frente; três copos tombados à frente com líquido no chão. Atrás, dois copos de pé. Ao fundo, ponte de pedra e castelo pequeno. Moldura com o numeral V de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Marte em Peixes, "Disappointment"'],
  },
  {
    id: 'minor-cups-06',
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    rank: '6',
    name: { pt: 'Seis de Copas', intl: 'Six of Cups' },
    archetype: 'Memória doce / o que regressa curado',
    element: 'water',
    astro: 'Sol em Escorpião',
    gdTitle: 'Prazer',
    traditionNote: 'Tiphareth: "prazer". Uma das raras cartas do naipe de copas que Waite pintou com luz frontal e sem ambiguidade.',
    keywords: {
      upright: ['nostalgia saudável', 'reencontro', 'reconciliação com a infância', 'generosidade simples', 'retorno'],
      reversed: ['nostalgia tóxica', 'idealização do passado', 'não crescer', 'culpa da infância', 'reencontro desiludido'],
    },
    history:
      'Duas crianças com jarras de flores, um adulto ao fundo e um carro carregado de copos: a imagem vem de gravuras de jogos infantis do século XVII. Waite manteve a cena quase intacta, e a partir daí a carta tornou-se sinónimo de regresso afectivo.',
    meanings: {
      upright:
        'Algo bom volta — pessoa, lugar, hábito, sensação. Esta carta favorece reencontros, reconciliação com a própria história, brinquedo, casa de família, partilha sem custo. Também indica que o que se dá agora será lembrado muito tempo.',
      reversed:
        'O passado deixa de ser recurso e passa a ser refúgio. Descreve idealização de quem já foi, relação mantida por memória e dificuldade em aceitar que as coisas mudaram de forma.',
    },
    psychology:
      'É a função de memória afetiva: o psiquismo precisa de arquivo de ternura para suportar o presente. Em sombra, a fixação na idade anterior ao dano — o "antes" como lugar habitável.',
    emotional: 'Ternura, saudade clara, vontade de cuidar de quem foi pequeno em ti.',
    love: 'Reencontro com alguém de antes, amor que se renova, relação com cheiro de casa. Em inversão: comparar o presente com um passado que já não existe.',
    career: 'Retomar projeto antigo, voltar a empresa que te formou, cliente de sempre, mentoria. O que volta, volta com vantagem de confiança.',
    finances: 'Pequena receita inesperada, herança afetiva, reutilização de recurso existente em vez de compra.',
    growth: 'Reconciliar com a própria infância: não para a idealizar, mas para lhe agradecer o que resistiu.',
    spirituality: 'A gratidão como memória partilhada; o copo que se oferece à criança que se foi.',
    obstacles: 'Viver de recordação em vez de presente.',
    opportunities: 'Um reencontro que resolve um assunto antigo e abre o presente.',
    advice: [
      'Contacta hoje essa pessoa que não vês há tempo demais.',
      'Retoma o hábito antigo que te fazia bem, na versão de adulto.',
      'Dá sem esperar retribuição — é assim que esta carta funciona.',
    ],
    reflection: [
      'Que parte da minha infância ainda espera alguma coisa de mim?',
      'Estou a voltar ao que era melhor ou a fugir do que é?',
      'O que eu celebraria se ninguém estivesse a ver?',
    ],
    relations: [
      { card: 'minor-cups-02', kind: 'continuidade', note: 'Do vínculo atual à sua história: memória que sustenta reciprocidade.' },
      { card: 'major-18-moon', kind: 'sombra', note: 'A memória pode iluminar ou enganar sobre o passado.' },
    ],
    art: {
      scene: 'children-offering-cups-of-flowers',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['chalice', 'flower-jar', 'dove', 'cart-wheel', 'child-naked'],
      palette: ['#EFE6D6', '#56C5BD', '#C6A66B'],
      motifs: ['duas crianças com jarras de flores', 'carro com copos', 'figura adulta ao fundo', 'portão de jardim'],
      reading: [
        'As jarras estão cheias de flores, não de bebida: dar o que é útil, não o que é necessário.',
        'O carro atrás leva copos a mais: há abundância para todos.',
        'O adulto ao fundo não impede a troca: é testemunha, não tutor.',
      ],
    },
    a11y: {
      alt: 'Carta Seis de Copas: duas crianças num jardim a oferecer uma à outra jarras com flores, com um carro carregado de copos e uma figura adulta ao fundo.',
      long:
        'Jardim de aldeia com portão de madeira. Centro: duas figuras infantis frente a frente, cada uma com um jarro de flores; atrás, um carro de madeira com quatro copos e, mais longe, uma figura alta de pé. Luz quente, vegetação baixa. Moldura com o numeral VI de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Sol em Peixes, "Pleasure"'],
  },
  {
    id: 'minor-cups-07',
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    rank: '7',
    name: { pt: 'Sete de Copas', intl: 'Seven of Cups' },
    archetype: 'Fantasia sem escolha / o buffet da psique',
    element: 'water',
    astro: 'Vénus em Escorpião',
    gdTitle: 'Sucesso Ilusório',
    traditionNote: 'Netzach: "intoxicação". A nuvem e as figuras dentro das taças são invenção de Waite — nas cartas italianas havia apenas sete copos.',
    keywords: {
      upright: ['possibilidades múltiplas', 'imaginação fértil', 'ilusão', 'escolha prematura', 'desejos sem critério'],
      reversed: ['escolha feita', 'regresso ao real', 'desilução clarificadora', 'fim da névoa', 'prioridade assumida'],
    },
    history:
      'Sete taças emergem de uma nuvem com conteúdos diferentes — joias, coroa, dragão, véu com figura, torre, flores, cabeça. Waite compôs a carta como aviso sobre desejo projetado; o detalhe decisivo é que nenhuma das taças toca o chão, nenhuma é alcançável sem cortar.',
    meanings: {
      upright:
        'Há demasiadas opções e nenhuma está ainda no chão. Esta carta descreve desejo multiplicado, planos paralelos, idealização de possibilidades. Não condena a fantasia: pede critério e um teste de realidade.',
      reversed:
        'A névoa levanta e escolhe-se. Indica fim da dispersão — ou a desilusão de descobrir que a taça estava vazia. Em qualquer caso, o contato com o real está a acontecer.',
    },
    psychology:
      'É a função imaginativa sem função de realidade: mecanismo de satisfação alucinatória que alivia e bloqueia. Comum em períodos de indecisão afetiva e profissional.',
    emotional: 'Excitação de possibilidade, ansiedade de escolha, leve tontura.',
    love: 'Vários interesses, idealização de alguém que ainda não se conhece, fantasia sobre relação que não aconteceu. Em inversão: decisão e conversa real.',
    career: 'Demasiadas ideias abertas, propostas vagas, promessas de projeto sem escopo. Fecha uma antes de aceitar a segunda.',
    finances: 'Gasto por fantasia, compras por idealização, investimento em "oportunidade" sem números. Exige planilha antes de entusiasmo.',
    growth: 'Praticar escolha com perda explícita: escrever o que se abandona ao escolher.',
    spirituality: 'Discernimento dos espíritos: nem tudo o que aparece na nuvem deve ser seguido.',
    obstacles: 'Alimentar-se de possibilidade em vez de realizar.',
    opportunities: 'Uma das taças contém realmente o que procuras — distingue-se com um teste pequeno.',
    advice: [
      'Corta duas opções hoje e avalia-as com um número concreto.',
      'Não assines nada depois de uma conversa entusiasmada: espera um dia.',
      'Escreve o que é preciso para transformar a fantasia em primeiro passo.',
    ],
    reflection: [
      'Qual destas possibilidades eu quero mesmo e qual só quero querer?',
      'Que escolha eu evito porque implica renunciar a outra?',
      'O que é real nisto que estou a imaginar?',
    ],
    relations: [
      { card: 'major-18-moon', kind: 'reforca', note: 'Ilusão e projeção: a carta da névoa em escala mental.' },
      { card: 'major-01-magician', kind: 'complementa', note: 'A escolha exige critério; o mago dá o método para cortar as taças.' },
    ],
    art: {
      scene: 'seven-cups-on-cloud-with-symbols',
      sky: 'night',
      terrain: 'sky',
      glyphs: ['chalice', 'crown', 'dragon-shape', 'veil-figure', 'jewel-cluster', 'tower-intact', 'laurel-wreath'],
      palette: ['#11172A', '#C6A66B', '#4A1F39'],
      motifs: ['sete taças sobre uma nuvem', 'conteúdos diferentes em cada uma', 'uma figura coberta por véu', 'nenhuma taça no solo'],
      reading: [
        'As taças flutuam: nenhuma tem apoio no chão.',
        'Cada uma tem um símbolo diferente — poder, riqueza, perigo, segredo — e só uma é alcançável.',
        'A névoa sobe do vale: a confusão é produzida pelo próprio lugar.',
      ],
    },
    a11y: {
      alt: 'Carta Sete de Copas: sete taças suspensas numa nuvem, cada uma com uma figura diferente — joias, uma coroa, um dragão, um véu, uma torre, flores e uma cabeça.',
      long:
        'Encosta de montanha ao anoitecer com grande nuvem branca no centro. Sobre a nuvem, sete copos em arco, cada um com um conteúdo simbólico distinto. Duas figuras pequenas de pé no caminho olham para cima. Moldura com o numeral VII de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Vénus em Aquário, "Debauch"'],
  },
  {
    id: 'minor-cups-08',
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    rank: '8',
    name: { pt: 'Oito de Copas', intl: 'Eight of Cups' },
    archetype: 'Partir quando ainda há / renúncia consciente',
    element: 'water',
    astro: 'Saturno em Peixes',
    gdTitle: 'Sucesso Abandonado',
    traditionNote: 'Hod: "indolência" na Golden Dawn, mas a leitura moderna de saída voluntária é quase unânime desde Waite.',
    keywords: {
      upright: ['renúncia', 'partida deliberada', 'insatisfação sem drama', 'viagem interior', 'largar o que já não preenche'],
      reversed: ['retorno', 'medo de partir', 'recomeço na mesma situação', 'estagnação', 'insight não seguido'],
    },
    history:
      'Um homem de manto e botas, com um bastão, afasta-se de oito taças alinhadas num plano de água; por cima, três luas ou um sol escuro, e montanhas. A carta foi criada por Waite quase do zero: a imagem de partir sem briga, deixando o que estava bom.',
    meanings: {
      upright:
        'Nada está a arder e ainda assim não chega. Esta carta descreve a saída escolhida por falta de sentido, não por ruína: mudança de emprego, de cidade, de relação ou de self que continua a ser mal compreendida por quem fica.',
      reversed:
        'Ou regressa-se por medo, ou parte-se e volta-se a ficar. Indica também a decisão adiada — continuar a olhar para as taças enquanto se tem o bastão na mão.',
    },
    psychology:
      'É a função de desinvestimento: retirar libido de um objeto que já não recompõe o todo. Em sombra, confundir partida com fuga e transformar a saída em padrão de abandono.',
    emotional: 'Melancolia clara, alívio com peso, ternura pelo que se deixa.',
    love: 'Sair de relação que não está má mas não é isto; ou, em inversão, regressar por saudade sem que nada tenha mudado.',
    career: 'Pedir saída, mudar de função, recusar promoção vazia, deixar projeto por falta de sentido. Aconselha transição com planeamento financeiro.',
    finances: 'Redução de rendimentos ao sair do seguro: faça reserva de seis meses antes de partir.',
    growth: 'Distinguir o que se deixa por medo do que se deixa por verdade.',
    spirituality: 'A noite escura como travessia: o caminante que não volta porque está a atravessar, não a fugir.',
    obstacles: 'Esperar que a vida esteja pior para se autorizar a sair.',
    opportunities: 'Um caminho que não promete conforto mas promete sentido.',
    advice: [
      'Define o que levas e o que deixas, por escrito, antes de comunicar.',
      'Garante o mínimo de sustentação: três meses de despesa, no caso de partida.',
      'Diz adeus às pessoas certas, não apenas desapareças.',
    ],
    reflection: [
      'O que me falta aqui não pode ser obtido aqui?',
      'Estou a partir ou a fugir?',
      'Que vantagem tenho em continuar insatisfeito?',
    ],
    relations: [
      { card: 'major-13-death', kind: 'continuidade', note: 'Renúncia e fim: a partida que completa a transformação.' },
      { card: 'major-09-hermit', kind: 'reforca', note: 'A lanterna e o bastão: solidão escolhida com intenção.' },
    ],
    art: {
      scene: 'figure-walking-away-from-eight-cups',
      sky: 'night',
      terrain: 'water',
      glyphs: ['chalice', 'staff-six', 'cloak-hood', 'moon-pool', 'mountain-peak'],
      palette: ['#11172A', '#56C5BD', '#C6A66B'],
      motifs: ['oito taças em fila', 'figura a afastar-se', 'montanhas à frente', 'lua nova', 'bastão de viagem'],
      reading: [
        'As taças estão cheias e alinhadas: não houve desastre, houve insuficiência.',
        'O caminante leva só um bastão: a saída foi planeada, não improvisada.',
        'As montanhas à frente indicam que o caminho sobe.',
      ],
    },
    a11y: {
      alt: 'Carta Oito de Copas: figura de manto e bastão a afastar-se de oito taças alinhadas à beira de um plano de água, com montanhas escuras e uma lua no céu.',
      long:
        'Céu noturno com lua nova. Primeiro plano, margem de rio com oito copos em duas filas. Centro: figura de costas, manto vermelho-escuro, botas e bastão ao ombro, a subir um caminho de pedra entre colinas. Moldura com o numeral VIII de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mercúrio em Sagitário, "Indolence"'],
  },
  {
    id: 'minor-cups-09',
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    rank: '9',
    name: { pt: 'Nove de Copas', intl: 'Nine of Cups' },
    archetype: 'Desejo satisfeito / o copo cheio sem plateia',
    element: 'water',
    astro: 'Júpiter em Peixes',
    gdTitle: 'Felicidade Material',
    traditionNote: 'Yesod: "sorte/adotado". Chamada "the wish card" na tradição inglesa; a figura roliça vem do "Bacchus" das cartas populares.',
    keywords: {
      upright: ['satisfação', 'desfeito', 'prazer legítimo', 'colheita afetiva', 'bem-estar merecido'],
      reversed: ['plenitude aparente', 'excesso', 'vazio depois do desejo', 'autoindulgência', 'reconhecimento só de fachada'],
    },
    history:
      'O "Nove di Coppe" das cartas latinas era frequentemente uma figura sentada à mesa, com copos atrás, e foi associada ao banquete e à satisfação física. Waite manteve a pose de braços cruzados e nove copos na prateleira, reforçando a ideia de desejo realizado e contemplado.',
    meanings: {
      upright:
        'O que se pediu chegou, e pode ser gozado sem culpa. Esta carta é a melhor do naipe para contentamento real: mesa farta, boa saúde, prazer simples, reconhecimento de esforço. Pede que se usufrua de facto.',
      reversed:
        'Ou o desejo se confundiu com excesso, ou a satisfação é anunciada mas não sentida. Descreve também o hábito de só querer o que já se conhece e a insatisfação de quem alcançou e não celebrou.',
    },
    psychology:
      'É a capacidade de gozo: a função que permite parar de querer e habitar o que se tem. Em sombra, o consumo como regulador emocional.',
    emotional: 'Gratidão, calma satisfeita, humor afável.',
    love: 'Relação prazerosa e estável, desejo correspondido, boa vida a dois. Em inversão: conforto que substituiu intimidade.',
    career: 'Recompensa, prémio, folga justificada, projeto concluído e gozado. Não lançar novo projeto esta semana.',
    finances: 'Margem confortável; bom momento para pagar algo a alguém e para investir em qualidade de vida durável.',
    growth: 'Autorizar o prazer sem produzir justificação: gozar o que já foi conquistado é também trabalho.',
    spirituality: 'A gratidão como presença: o copo cheio que não precisa de mais nada.',
    obstacles: 'Não reconhecer a fartura enquanto se persegue a próxima.',
    opportunities: 'Um desejo antigo que pode ser concretizado já.',
    advice: [
      'Goza hoje sem contrapartida: nada de novos objetivos esta semana.',
      'Diz obrigada a quem tornou isto possível.',
      'Guarda uma parte da fartura — para a próxima vontade, não para a próxima ansiedade.',
    ],
    reflection: [
      'O que eu ainda quero tem nome ou só tem quantidade?',
      'Consigo usufruir sem ter de justificar?',
      'Quem esteve presente no meu desejo e foi esquecido na realização?',
    ],
    relations: [
      { card: 'major-19-sun', kind: 'reforca', note: 'Satisfação e luz: gozo partilhado sem culpa.' },
      { card: 'major-15-devil', kind: 'sombra', note: 'O copo a mais: quando a fartura vira compulsão.' },
    ],
    art: {
      scene: 'contented-figure-before-nine-cups',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['chalice', 'nine-cups-shelf', 'ring', 'cushion', 'laurel-wreath'],
      palette: ['#4A1F39', '#C6A66B', '#EFE6D6'],
      motifs: ['figura de braços cruzados', 'nove copos na prateleira', 'anel no dedo', 'tapete e almofada'],
      reading: [
        'Os nove copos estão arrumados e cheios: a satisfação é doméstica, não pública.',
        'Os braços cruzados indicam posse tranquila, não defesa.',
        'O anel no dedo é compromisso cumprido.',
      ],
    },
    a11y: {
      alt: 'Carta Nove de Copas: figura satisfeita sentada com braços cruzados diante de uma prateleira com nove copos iguais, num interior acolhedor.',
      long:
        'Interior com tapete e prateleira de madeira. Centro: figura sentada de braços cruzados, vestuário vermelho com folhas douradas; atrás, nove copos dourados alinhados em duas filas. Moldura com o numeral IX de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua em Aquário, "Fortune"'],
  },
  {
    id: 'minor-cups-10',
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    rank: '10',
    name: { pt: 'Dez de Copas', intl: 'Ten of Cups' },
    archetype: 'Felicidade doméstica / ciclo afetivo cumprido',
    element: 'water',
    astro: 'Marte em Peixes',
    gdTitle: 'Saciedade',
    traditionNote: 'Malkuth da água: "saciedade". É a carta de fecho do naipe e, na tradição popular, a mais favorável para família.',
    keywords: {
      upright: ['harmonia familiar', 'felicidade partilhada', 'pertencimento', 'legado afetivo', 'conclusão feliz'],
      reversed: ['aparência de harmonia', 'conflito familiar', 'valores incompatíveis', 'promessa de família não cumprida'],
    },
    history:
      'Duas figuras adultas de braços dados, duas crianças, dois cães e um arco de dez copos sobre uma casa: a cena é puramente Waite, construída como retrato ideal da família vitoriana. A sua força simbólica vem precisamente da simplicidade — o céu que dá os copos, não a mão.',
    meanings: {
      upright:
        'O vínculo está fechado e é bom. Esta carta traz reconciliação familiar, casamento, nascimento, casa cheia, herança de afetos, conclusão feliz de um ciclo emocional. É raramente uma carta de conquista individual: é de partilha durável.',
      reversed:
        'Há casa sem lareira. Descreve harmonia de fachada, conflitos familiares não tratados, diferenças de valores que impedem a proximidade, e a dor de não pertencer a quem devia.',
    },
    psychology:
      'É a função de pertença realizada — o arquivo interno de segurança. Em inversão, o conflito entre o desejo de família e a memória de que a família não protegeu.',
    emotional: 'Plenitude afetiva, ternura, gratidão com raízes.',
    love: 'Casamento, coabitação, filhos, projeto familiar longo. Em inversão: discussão sobre família, sogros, filhos ou valores de vida.',
    career: 'Estabilidade com sentido, empresa familiar, trabalho remoto com tempo de qualidade, equipa que funciona como rede.',
    finances: 'Recursos de família, herança, poupança comum, apoio intergeracional. Favorável a património partilhado com contrato.',
    growth: 'Construir o círculo que sustenta: felicidade privada também é obra.',
    spirituality: 'A bênção doméstica: dez copos no céu indicam que o sagrado também se serve em mesa.',
    obstacles: 'Manter aparência para não encarar o que está por curar.',
    opportunities: 'Uma reconciliação familiar que libera energia para o resto.',
    advice: [
      'Resolve o assunto doméstico pendente esta semana, com conversa direta.',
      'Regista a memória: foto, carta, gravação, receita.',
      'Define com clareza o que a tua família é, para além do que esperam que seja.',
    ],
    reflection: [
      'O que eu quero de quem convivo todos os dias?',
      'Que aparência familiar estou a proteger?',
      'Que legado afetivo quero deixar e já comecei?',
    ],
    relations: [
      { card: 'major-21-world', kind: 'reforca', note: 'Ciclo cumprido no plano afetivo: totalidade em casa.' },
      { card: 'major-03-empress', kind: 'continuidade', note: 'Nutrição que chega a geração seguinte.' },
    ],
    art: {
      scene: 'family-under-arc-of-ten-cups',
      sky: 'dawn',
      terrain: 'garden',
      glyphs: ['chalice', 'rainbow-arc', 'house-small', 'children-pair', 'dog-two', 'gate'],
      palette: ['#56C5BD', '#EFE6D6', '#C6A66B'],
      motifs: ['arco de dez copos', 'casal de braços dados', 'duas crianças', 'dois cães', 'casa com portão aberto'],
      reading: [
        'Os copos vêm do céu em arco: a felicidade é dada, não conquistada.',
        'As gerações estão todas na mesma cena, sem hierarquia de tamanho.',
        'O portão está aberto: a harmonia é inclusiva, não fechada.',
      ],
    },
    a11y: {
      alt: 'Carta Dez de Copas: casal de braços dados com duas crianças e dois cães num jardim, sob um arco formado por dez copos dourados, com uma casa ao fundo.',
      long:
        'Paisagem aberta com casa pequena e portão. Centro: duas figuras adultas de braços dados, frente a duas crianças que se abraçam; dois cães junto ao casal. No céu, arco de dez copos dourados em curva. Moldura com o numeral X de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Vénus em Capricórnio, "Satiety"'],
  },
  {
    id: 'minor-cups-page',
    arcana: 'minor',
    suit: 'cups',
    number: 11,
    rank: 'page',
    name: { pt: 'Pajem de Copas', intl: 'Page of Cups' },
    archetype: 'O mensageiro do afeto / sensibilidade criativa',
    element: 'water',
    astro: 'Terra da Água',
    gdTitle: 'Príncipe da Carruagem das Ondas',
    traditionNote: 'O "fante" de copas traz um peixe que salta do copo: notícia emocional inesperada, com componente de imaginação.',
    keywords: {
      upright: ['mensagem afetiva', 'sensibilidade criativa', 'convite gentil', 'intuição em formação', 'abertura romântica'],
      reversed: ['sensibilidade imatura', 'drama evitável', 'timidez afetiva', 'notícia adiada', 'maturidade emocional atrasada'],
    },
    history:
      'Waite coloca o pajem à beira-mar com um copo de onde emerge um peixe vivo, símbolo de conteúdo inconsciente que se apresenta. A figura, na iconografia italiana, era simplesmente um jovem com taça: o peixe é acréscimo inglês.',
    meanings: {
      upright:
        'Chega um convite ou mensagem com carga emocional, muitas vezes de alguém mais novo ou mais vulnerável. A carta favorece gestos ternos, propostas criativas, o início de trabalho artístico e a coragem de dizer um sentimento pequeno em voz alta.',
      reversed:
        'O copo inclina-se e a mensagem perde-se: sensibilidade que se torna drama, imaturidade afetiva, ou recusa de ouvir o que exige resposta adulta.',
    },
    psychology:
      'É a função de sentimento em estado jovem: percepções finas, pouca estrutura. Em sessão, aparece como a parte que sente muito e regula pouco — e que precisa de continente, não de censura.',
    emotional: 'Doçura, timidez, humor variável, empatia fácil.',
    love: 'Declaração tímida, pedido de namoro, mensagem carinhosa, reconciliação pequena. Em inversão: ciúme infantil ou jogo de silêncios.',
    career: 'Ideia criativa em fase inicial, convite para colaborar, formação em área expressiva. Favorável a mostrar trabalho em bruto.',
    finances: 'Rendimento simbólico, mesada, reembolso emocional; gastas o que ganhas em coisas bonitas.',
    growth: 'Dar forma à sensibilidade: escrever, desenhar, dizer — sem transformar tudo em espetáculo.',
    spirituality: 'O peixe que salta do copo: símbolo antigo do que emerge da água inconsciente para ser reconhecido.',
    obstacles: 'Esperar a ocasião perfeita para dizer o que se sente.',
    opportunities: 'Um contacto gentil que abre uma porta criativa.',
    advice: [
      'Envia a mensagem hoje, curta e sem ensaio.',
      'Reserva 20 minutos diários para o trabalho criativo sem objetivo.',
      'Regista o que sentes antes de decidir o que fazer com isso.',
    ],
    reflection: [
      'Que afeto pequeno estou a deixar sem resposta?',
      'A minha sensibilidade é recurso ou peso?',
      'O que eu mostraria se ninguém avaliasse?',
    ],
    relations: [
      { card: 'minor-cups-01', kind: 'continuidade', note: 'O copo transborda para o peixe: afeto que se faz imagem.' },
      { card: 'major-18-moon', kind: 'reforca', note: 'Imaginário e intuição: boa carta para sonhos e arte, má para factos.' },
    ],
    art: {
      scene: 'page-by-sea-with-fish-in-cup',
      sky: 'day',
      terrain: 'sea',
      glyphs: ['chalice', 'fish-two', 'tunic-scallop', 'wave-line', 'gull'],
      palette: ['#56C5BD', '#EFE6D6', '#C6A66B'],
      motifs: ['jovem de túnica com peixes bordados', 'copo com peixe a saltar', 'mar em linha', 'pássaros ao fundo'],
      reading: [
        'O peixe está vivo e no copo: a mensagem é inesperada, mas chegou.',
        'Os pés do pajem tocam a água: está na fronteira entre emoção e terra.',
        'A túnica com peixes bordados indica que esta sensibilidade já é identidade.',
      ],
    },
    a11y: {
      alt: 'Carta Pajem de Copas: jovem de pé na margem segurando um copo de onde salta um peixe, com o mar e aves ao fundo.',
      long:
        'Beira-mar com céu claro. Centro: figura jovem de perfil, túnica larga com peixes bordados, sapatos de ponta, copo na mão à frente com um peixe a sair dele; ao fundo, mar em linha e três aves. Moldura com o rótulo de pajem de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Terra da Água'],
  },
  {
    id: 'minor-cups-knight',
    arcana: 'minor',
    suit: 'cups',
    number: 12,
    rank: 'knight',
    name: { pt: 'Cavaleiro de Copas', intl: 'Knight of Cups' },
    archetype: 'O romântico / a proposta que vem a cavalo',
    element: 'water',
    astro: 'Ar da Água',
    gdTitle: 'Senhor das Ondas e das Águas',
    traditionNote: 'O cavaleiro de copas leva o cálice erguido sem olhar para ele: oferta feita mais por impulso do afeto do que por cálculo.',
    keywords: {
      upright: ['proposta romântica', 'cortesia', 'convite', 'idealização afetiva', 'gentileza com agenda'],
      reversed: ['promessa vazia', 'sedução', 'humor instável', 'afeto performático', 'retirada'],
    },
    history:
      'O cavaleiro de Waite avança devagar, copo na mão, com um manto de folhas e um rio atrás: é o único cavaleiro do baralho cujo cavalo quase anda. A diferença é o sentido — a proposta chega, mas chega a passo de sonho.',
    meanings: {
      upright:
        'Chega um convite afectivo, um pedido ou uma reconciliação. Esta carta favorece gestos românticos, mediação suave, arte e diplomacia. Também indica alguém sensível, persuasivo e pouco interessado em conflito.',
      reversed:
        'O cavalo vira-se e leva a proposta: palavras ternas sem continuidade, sedução, chantagem afectiva, ou humor instável usado como argumento.',
    },
    psychology:
      'É a função de sentimento em movimento: a disposição de se aproximar de quem se ama. Em sombra, o padrão de idealizar e desiludir-se, repetindo a subida e a retirada.',
    emotional: 'Entusiasmo afectivo, ternura teatral, sensibilidade à rejeição.',
    love: 'Pedido, reencontro, declaração, gesto bonito. Em inversão: promessa de fim de semana que nunca chega a segunda-feira.',
    career: 'Proposta de colaboração, cliente simpático, negociação suave, atividade ligada a cuidado, arte, cultura. Não esperar decisões duras.',
    finances: 'Gasto em experiência e presente; atenção a ofertas simpáticas com condições obscuras.',
    growth: 'Aprender a distinguir gesto bonito de vínculo sustentável.',
    spirituality: 'A devoção como cavalgada: o caminho do coração, com risco de se perder em paisagem.',
    obstacles: 'Confundir emoção com evidência.',
    opportunities: 'Uma proposta afectiva ou criativa que reabre o desejo.',
    advice: [
      'Aceita o convite, mas confirma os termos em concreto.',
      'Faz o gesto romântico que andas a adiar — a carta recompensa quem envia.',
      'Não confies apenas no tom da conversa; olha para o histórico.',
    ],
    reflection: [
      'Que proposta estou a recusar por desconfiança automática?',
      'O que eu quero ser para os outros quando estou apaixonado?',
      'Que promessa minha precisa de calendário?',
    ],
    relations: [
      { card: 'minor-cups-02', kind: 'reforca', note: 'A proposta e o acordo: cortejo que se torna vínculo.' },
      { card: 'minor-swords-07', kind: 'sombra', note: 'Gentileza usada como cortina para estratégia.' },
    ],
    art: {
      scene: 'knight-offering-cup-on-slow-horse',
      sky: 'dusk',
      terrain: 'water',
      glyphs: ['chalice', 'horse', 'tunic-leaf', 'wave-line', 'moon-pool'],
      palette: ['#4A1F39', '#EFE6D6', '#56C5BD'],
      motifs: ['cavalo que caminha', 'copo erguido', 'manto com folhas', 'rio à direita', 'nuvens baixas'],
      reading: [
        'O cavalo não corre: a proposta chega devagar.',
        'O cavaleiro segura o copo alto mas olha outro lado: oferta com distração romântica.',
        'A água atrás indica que o afeto é o terreno de onde se vem.',
      ],
    },
    a11y: {
      alt: 'Carta Cavaleiro de Copas: cavaleiro a caminhar sobre um cavalo branco segurando um copo erguido, com manto de folhas, rio e céu nublado ao fundo.',
      long:
        'Margem de rio com céu de fim de tarde. Centro: cavalo branco a andar, cavaleiro com manto decorado com folhas grandes e elmo com plumas, copo dourado erguido na mão direita. Ao fundo, árvores e nuvens baixas. Moldura com o rótulo de cavaleiro de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Ar da Água'],
  },
  {
    id: 'minor-cups-queen',
    arcana: 'minor',
    suit: 'cups',
    number: 13,
    rank: 'queen',
    name: { pt: 'Rainha de Copas', intl: 'Queen of Cups' },
    archetype: 'Escuta profunda / a que contém',
    element: 'water',
    astro: 'Água da Água',
    gdTitle: 'Rainha do Trono das Águas',
    traditionNote: 'O trono sem decoração figurativa e o copo sem ornamento indicam que a função desta rainha é receber, não impressionar.',
    keywords: {
      upright: ['empatia madura', 'escuta', 'intuição aplicada', 'acolhimento com limite', 'maturidade emocional'],
      reversed: ['superproteção', 'vazio próprio', 'sensibilidade sem fronteira', 'manipulação afetiva', 'fadiga de cuidar'],
    },
    history:
      'Waite mostrou uma rainha sentada à beira-mar, com um copo liso nas mãos e o mar agitado atrás, numa das composições mais contidas do baralho. A leitura consolidada — acolhimento sem invasão — deriva diretamente deste contraste entre a calma da figura e a inquietação do fundo.',
    meanings: {
      upright:
        'Escutar é a ação principal. Esta carta favorece trabalho de cuidado, terapia, mediação, educação e toda a função que exige conter emoção alheia sem a tomar para si. Indica alguém que acalma e alguém capaz de se acalmar a si próprio.',
      reversed:
        'A fronteira entre cuidar e absorver desapareceu: fadiga por excesso de empatia, cuidado que anula o outro, ou afeto usado para controlar. Em leitura de eventos, também indica período de grande instabilidade interior.',
    },
    psychology:
      'É a função de sentimento desenvolvida com estrutura: capacidade de sentir sem ser governada pelo sentimento. Jung considerava esta a posição mais difícil do tipo sentimento em mulheres da sua época; hoje lê-se como integração de sensibilidade e critério.',
    emotional: 'Profundidade serena, humor calmo, afecto que não exige prova.',
    love: 'Vínculo com escuta e segurança afetiva; excelente para reconciliação e para apoio em período difícil. Invertida: codependência.',
    career: 'Saúde, ensino, trabalho social, UX, mediação, gestão de pessoas, curadoria. Forte intuição estratégica em decisões de equipa.',
    finances: 'Gestão prudente com gasto emocional em cuidados aos outros. Estabelece limite mensal para "despesas de afeto".',
    growth: 'Cuidar de si com o mesmo rigor com que cuida dos outros.',
    spirituality: 'A água como matriz: escuta contemplativa, direção espiritual, intercessão.',
    obstacles: 'Confundir ser necessária com ser amada.',
    opportunities: 'Um papel de confiança onde a tua escuta é competência e não simpatia.',
    advice: [
      'Define o que não vais resolver esta semana, mesmo que doas.',
      'Escuta uma conversa antes de decidir, e uma depois de decidir.',
      'Recebe cuidado: pede uma coisa pequena a alguém concreto.',
    ],
    reflection: [
      'Que emoção que estou a levar para casa não é minha?',
      'O que sinto quando ninguém precisa de mim?',
      'O meu silêncio protege ou esconde?',
    ],
    relations: [
      { card: 'minor-cups-king', kind: 'complementa', note: 'Sentido e governo do sentimento: par de maturidade afetiva.' },
      { card: 'major-02-high-priestess', kind: 'espelho', note: 'Duas guardiãs do invisível, uma no silêncio, outra na relação.' },
    ],
    art: {
      scene: 'queen-seated-at-shore-with-empty-cup',
      sky: 'dusk',
      terrain: 'sea',
      glyphs: ['throne-cup', 'chalice', 'wave-line', 'shell', 'winged-figure'],
      palette: ['#11172A', '#56C5BD', '#EFE6D6'],
      motifs: ['trono à beira-mar', 'copo liso sem ornamento', 'mar agitado atrás', 'conchas no chão', 'figura alada pequena ao fundo'],
      reading: [
        'O copo não tem decoração: não serve para mostrar, serve para receber.',
        'O mar atrás está agitado e a figura não: a calma é trabalho, não ausência.',
        'Os pés do trono tocam a areia: a função é instável por natureza.',
      ],
    },
    a11y: {
      alt: 'Carta Rainha de Copas: mulher coroada sentada num trono à beira-mar, segurando um copo liso, com o mar agitado atrás.',
      long:
        'Litoral ao entardecer com ondas. Centro: figura sentada de coroa e vestido azul, manto por cima, mãos a segurar um copo cilíndrico sem ornamento. Trono com base na areia, conchas ao pé; ao fundo, uma figura alada pequena sobre o mar. Moldura com o rótulo de rainha de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Água da Água'],
  },
  {
    id: 'minor-cups-king',
    arcana: 'minor',
    suit: 'cups',
    number: 14,
    rank: 'king',
    name: { pt: 'Rei de Copas', intl: 'King of Cups' },
    archetype: 'Emoção sob governo / autoridade benevolente',
    element: 'water',
    astro: 'Fogo da Água',
    gdTitle: 'Rei das Águas',
    traditionNote: 'O trono de rei de copas está sobre o mar revolto e tem golfinhos e um navio ao fundo: domínio exercido em contexto instável.',
    keywords: {
      upright: ['equilíbrio emocional', 'diplomacia', 'conselheiro justo', 'maturidade afetiva', 'autoridade que acalma'],
      reversed: ['manipulação emocional', 'cholera fria', 'tirania do humor', ' chantagem', 'afeto condicional'],
    },
    history:
      'O "Re di Coppe" dos tarôs italianos é frequentemente uma figura com taça e cetro, sentada diante de água; Waite acrescentou o navio ao fundo — símbolo de travessia guiada — e os dois animais marinhos que sustentam o trono.',
    meanings: {
      upright:
        'Sentir bem e decidir bem. Esta carta representa a autoridade que não precisa de gritar, o conselheiro experiente, o médico, o juiz justo, o pai presente. Favorece decisões que exigem compreender pessoas, e a capacidade de não reagir.',
      reversed:
        'O afeto governa em vez de ser governado: manipulação com ar sereno, chantagem emocional, humor como instrumento de controlo, ou a retirada afectiva de quem tem responsabilidade sobre outros.',
    },
    psychology:
      'É o Self em função reguladora: a instância que permite sentir e pensar ao mesmo tempo. Em sombra, a racionalização do afeto — a diplomacia que evita conflito em vez de o resolver.',
    emotional: 'Serenidade com profundidade, afecto constante, pouca reactividade.',
    love: 'Parceiro emocionalmente adulto; relação segura com capacidade de reparar. Em inversão: afeto seletivo, frieza calculada.',
    career: 'Liderança de equipas em tensão, negociação delicada, gestão clínica e judicial. Excelente mentor; pode demorar a decidir sob pressão.',
    finances: 'Boa gestão de longo prazo e de recursos partilhados; risco de financiar por compaixão em vez de por critério.',
    growth: 'Usar a maturidade emocional como responsabilidade, não como vantagem competitiva.',
    spirituality: 'O rei-sacerdote da água: bênção consciente, cuidado com poder que se faz passar por bondade.',
    obstacles: 'Querer acalmar a todos custe o que custar.',
    opportunities: 'Um aliado experiente com capacidade de mediar o conflito principal.',
    advice: [
      'Diz o que decide e porque decide: benevolência sem clareza confunde.',
      'Escolhe a conversa difícil de que és capaz esta semana.',
      'Não uses a calma para não tomar partido.',
    ],
    reflection: [
      'Que emoção eu controlo melhor do que reconheço?',
      'A minha serenidade é força ou evitamento?',
      'A quem falta a minha autoridade benevolente?',
    ],
    relations: [
      { card: 'minor-cups-queen', kind: 'complementa', note: 'Par de continência afetiva: escuta e governo.' },
      { card: 'minor-swords-king', kind: 'tensao', note: 'Coração e razão no mesmo trono: difícil, necessário.' },
    ],
    art: {
      scene: 'king-on-throne-over-turbulent-sea',
      sky: 'storm',
      terrain: 'sea',
      glyphs: ['throne-cup', 'chalice', 'dolphin-pair', 'ship', 'crown'],
      palette: ['#11172A', '#C6A66B', '#56C5BD'],
      motifs: ['trono sobre o mar', 'dois golfinhos na base', 'navio ao fundo', 'copo e cetro', 'manto azul sobre túnica clara'],
      reading: [
        'O mar está revolto e o rei está imóvel: domínio, não ausência de agitação.',
        'Os dois golfinhos à base do trono sustentam-no: a emoção é o apoio, não o inimigo.',
        'O navio ao fundo lembra que há quem atravesse por causa desta função.',
      ],
    },
    a11y: {
      alt: 'Carta Rei de Copas: figura coroada sentada num trono sobre o mar agitado, segurando um copo e um cetro, com dois golfinhos na base e um navio ao fundo.',
      long:
        'Mar escuro com ondas altas. Centro: figura de barba sentada em trono de pedra, túnica clara e manto azul, copo dourado na mão direita, cetro na esquerda; dois golfinhos na base do trono. Ao fundo, navio com velas. Moldura com o rótulo de rei de Copas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Fogo da Água'],
  },
]
