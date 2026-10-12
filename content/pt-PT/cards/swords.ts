import type { CardSource } from '../../../src/domain/types.ts'

/**
 * Naipe de Espadas — elemento Ar, função de pensamento, distinção e conflito.
 * É o naipe com maior divergência entre leitura tradicional (prova, corte, verdade)
 * e leitura popular (azar). O motor usa sempre a leitura técnica documentada aqui.
 */
export const SWORDS: CardSource[] = [
  {
    id: 'minor-swords-01',
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    rank: 'ace',
    name: { pt: 'Ás de Espadas', intl: 'Ace of Swords' },
    archetype: 'Verdade cortante / clareza que decide',
    element: 'air',
    astro: 'Raiz dos Poderes do Ar',
    gdTitle: '—',
    traditionNote: 'A coroa sobre a lâmina vem do Tarot de Marselha e das cartas latinas: o poder da palavra que se torna lei.',
    keywords: {
      upright: ['clareza mental', 'verdade dita', 'decisão definitiva', 'compreensão súbita', 'justiça rigorosa'],
      reversed: ['pensamento confuso', 'palavra que fere', 'análise enviesada', 'verdade mal administrada', 'bloqueio mental'],
    },
    history:
      'O ás das cartas italianas é uma espada simples com coroa, por vezes com palma; Waite acrescentou ramos de oliveira e palma nos lados, condensando vitória e paz. É uma das poucas cartas de espadas lida sem ambiguidade: corte que liberta.',
    meanings: {
      upright:
        'A peça de informação que faltava chegou. Esta carta traz clarificação, diagnóstico, decisão racional, corte com o que já não se sustenta, e a coragem de nomear um facto. Favorece escrita, revisão, contestação bem fundamentada.',
      reversed:
        'A lâmina corta ao contrário: verdade usada como arma, análise fria sem consideração pelo efeito, ou incapacidade de pensar com nitidez por medo da conclusão.',
    },
    psychology:
      'É a função de pensamento em sua forma mais afiada: separação, nomeação, distinção. Em sombra, o pensamento defensivo — a racionalização que protege do sentimento, não da ilusão.',
    emotional: 'Alívio da clareza, frieza útil, tensão antes da conversa difícil.',
    love: 'Pôr os pontos nos iis: conversa honesta que reorganiza a relação; pode ser fim, pode ser começo. Em inversão: crueldade travestida de sinceridade.',
    career: 'Decisão executiva, auditoria, contrato, recurso, edição, cirurgia administrativa. Excelente para escrever o documento que resolve.',
    finances: 'Corte de despesa sem sentimentalismo, contestação de cobrança, revisão de juros. Favorece decisão tomada com números.',
    growth: 'Aprender a pensar antes de sentir ou a sentir antes de pensar, conforme o que falta — a lâmina serve para separar, não para anestesiar.',
    spirituality: 'A espada do discernimento: cortar a ilusão sem cortar a compaixão.',
    obstacles: 'Confundir ser direto com ser exato.',
    opportunities: 'Uma decisão que, tomada hoje, elimina seis problemas recorrentes.',
    advice: [
      'Escreve a decisão numa frase e lê-a em voz alta.',
      'Diálogo difícil hoje, com facto e sem adjetivo.',
      'Revê os números antes de assinar ou contestar.',
    ],
    reflection: [
      'Que verdade eu adio por ser desconfortável?',
      'Estou a analisar para compreender ou para ter razão?',
      'O que é que preciso de cortar para pensar melhor?',
    ],
    relations: [
      { card: 'major-11-justice', kind: 'reforca', note: 'Verdade e balança: decisão com consequência justa.' },
      { card: 'minor-swords-03', kind: 'sombra', note: 'A mesma lâmina que clarifica pode ferir se cair em cima de alguém.' },
    ],
    art: {
      scene: 'crowned-sword-raised-from-cloud',
      sky: 'day',
      terrain: 'mountain',
      glyphs: ['sword-blade', 'crown', 'olive-branch', 'palm-frond', 'hand-offering'],
      palette: ['#EFE6D6', '#C6A66B', '#11172A'],
      motifs: ['mão que segura espada vertical', 'coroa na ponta', 'dois ramos laterais', 'montanha ao fundo'],
      reading: [
        'A coroa está no topo da lâmina, não na mão: o poder está na verdade, não em quem a diz.',
        'Os dois ramos são vitória e paz: o corte tem propósito.',
        'A espada sobe do vale: a clareza vem de cima, não da discussão.',
      ],
    },
    a11y: {
      alt: 'Carta Ás de Espadas: mão que sai de uma nuvem segurando uma espada vertical coroada, com um ramo de oliveira de um lado e uma palma do outro.',
      long:
        'Céu claro sobre montanhas. Centro: mão a emergir de nuvem, segurando espada comprida com ponta para cima e coroa dourada na lâmina; ramos de folhas à esquerda e palmeira à direita. Moldura com o rótulo de ás de Espadas.',
    },
    sources: ['Marseille – as d\'épée (couronne)', 'Waite – ramos de oliveira e palma'],
  },
  {
    id: 'minor-swords-02',
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    rank: '2',
    name: { pt: 'Dois de Espadas', intl: 'Two of Swords' },
    archetype: 'Impasse / o equilíbrio que evita',
    element: 'air',
    astro: 'Lua em Balança',
    gdTitle: 'Equilíbrio Interior',
    traditionNote: 'Chokmah em suspensão: "demoníaca" na Golden Dawn, pela recusa de ver. A venda nos olhos é invenção de Waite.',
    keywords: {
      upright: ['impassibilidade', 'bloqueio de decisão', 'negociação suspensa', 'defesa emocional', 'equilíbrio tenso'],
      reversed: ['decisão forçada', 'fim do impasse', 'informação revelada', 'ansiedade que cede', 'abrir os olhos'],
    },
    history:
      'A figura vendada com duas espadas cruzadas sentada junto a um mar de pedras vem de Waite e não tem paralelo antigo nas cartas italianas, onde a carta mostrava apenas duas lâminas. A venda tornou-se o ícone do não querer ver, e a coroa de ouro na parede de fundo, do que está em disputa.',
    meanings: {
      upright:
        'Estás em equilíbrio porque não escolhes. Esta carta descreve o impasse defensivo: duas posições a sustentar ao mesmo tempo, informação recusada, sentimento contido. Funciona para negociar, não para viver.',
      reversed:
        'A venda cai. Descreve o fim do impasse — por decisão tua, por revelação de terceiros ou por colapso do equilíbrio — e a dificuldade de suportar o que se passa a ver.',
    },
    psychology:
      'É a defesa de isolamento: recusar o dado para manter a coerência interna. Costuma aparecer em conflitos de lealdade e em situações em que escolher implica perder.',
    emotional: 'Frieza controlada, tensão contida, cansaço de sustentar duas posições.',
    love: 'Recusa de conversa, relação em suspenso, escolha entre duas pessoas ou duas vidas. Em inversão: verdade que se impõe e exige resposta.',
    career: 'Negociação emperrada, duas propostas que se anulam, decisão adiada por falta de critério. Pede informação e prazo.',
    finances: 'Empate entre gastar e poupar; congelar decisão é custoso nesta fase. Escolhe um critério numérico.',
    growth: 'Permitir-se ver: o desconforto da escolha é menor do que o custo da suspensão.',
    spirituality: 'A balança que ainda não se movimenta: silêncio útil apenas até ao prazo.',
    obstacles: 'Transformar prudência em cegueira escolhida.',
    opportunities: 'Um dado novo que desbloqueia o impasse, se pedido em vez de esperado.',
    advice: [
      'Tira a venda: lista os factos que não estás a olhar.',
      'Fixa data e critério para a decisão, e anuncia-os.',
      'Pedir uma opinião externa que não te seja favorável.',
    ],
    reflection: [
      'O que eu ganho em não decidir?',
      'Que parte da informação eu recusaria se a visse?',
      'Qual das duas lâminas eu quero realmente baixar?',
    ],
    relations: [
      { card: 'major-12-hanged-man', kind: 'reforca', note: 'Suspensão e impasse: o tempo parado por escolha.' },
      { card: 'major-11-justice', kind: 'tensao', note: 'A balança quer pesar; a venda não deixa.' },
    ],
    art: {
      scene: 'blindfolded-figure-with-crossed-swords',
      sky: 'overcast',
      terrain: 'water',
      glyphs: ['sword-blade', 'blindfold', 'crown', 'rock-shore', 'still-water'],
      palette: ['#11172A', '#EFE6D6', '#C6A66B'],
      motifs: ['venda nos olhos', 'duas espadas cruzadas', 'coroa sobre parede', 'mar calmo', 'rochas na margem'],
      reading: [
        'As lâminas cruzadas formam um X: a postura é de defesa, não de ataque.',
        'A coroa está atrás, fora do alcance: o prémio existe mas não é reivindicado.',
        'A água parada diz que o impasse é estável — e por isso se sustenta.',
      ],
    },
    a11y: {
      alt: 'Carta Dois de Espadas: figura vendada sentada numa margem rochosa, com duas espadas cruzadas à frente, sobre um mar calmo e com uma coroa ao fundo.',
      long:
        'Margem de pedras com água parada. Centro: figura sentada de manto azul, olhos vendados com pano claro, braços cruzados à frente segurando duas espadas que se cruzam em X. Ao fundo, parede de pedra com coroa pousada. Moldura com o numeral II de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua em Leão, "Released"'],
  },
  {
    id: 'minor-swords-03',
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    rank: '3',
    name: { pt: 'Três de Espadas', intl: 'Three of Swords' },
    archetype: 'Mágoa explícita / a dor que se nomeia',
    element: 'air',
    astro: 'Saturno em Balança',
    gdTitle: 'Dor',
    traditionNote: 'Binah em corte: "dor de pensamento". Uma das cartas mais constantes de todo o baralho — três lâminas num coração, desde Marselha.',
    keywords: {
      upright: ['mágoa', 'traição', 'palavra que fere', 'luto por facto', 'separação consciente'],
      reversed: ['recuperação', 'rancor que se dissolve', 'dor repetida', 'negação do ferimento', 'reconciliação difícil'],
    },
    history:
      'O coração atravessado por três espadas aparece já no Tarot de Bolonha e em Marselha, sem figura humana. Waite acrescentou chuva, nuvens e o formato anatómico do coração, transformando um símbolo de dor numa cena de luto — o que suavizou sem alterar o núcleo.',
    meanings: {
      upright:
        'Um facto fere e precisa de ser encarado. Esta carta nomeia mágoa, deceção amorosa, traição de confiança, crítica justa que dói, separação. Não agrava nem minimiza: descreve a dor como etapa necessária.',
      reversed:
        'A remoção das lâminas. Descreve fim de mágoa, perdão possível ou a escolha de continuar ferido por conveniência. Aparece também quando se prolonga o que já foi dito.',
    },
    psychology:
      'É o ponto em que a dor psíquica se torna articulável — o oposto da somatização muda. Trabalhar esta carta é transformar queixa em narrativa: nomear o ferimento, a autoria e o que se pede.',
    emotional: 'Tristeza aguda, humilhação, solidão, alívio de ter reconhecido.',
    love: 'Mágoa por palavra ou ato concreto; não indica necessariamente fim, mas exige reparação. Em inversão: reconciliação com conversa honesta.',
    career: 'Crítica pública, reprovação, avaliação negativa, corte de orçamento. A resposta mais eficaz é factual e em prazo.',
    finances: 'Perda pontual que exige registo e revisão; multas e penalidades por incumprimento.',
    growth: 'Aprender a diferenciar dor de injustiça: uma cura com tempo, outra com ação.',
    spirituality: 'A compaixão nasce do ferimento reconhecido: as três lâminas também abrem o que estava fechado.',
    obstacles: 'Repetir a ferida em vez de a retirar.',
    opportunities: 'Uma conversa de reparação que, feita, altera o vínculo.',
    advice: [
      'Nomeia a ofensa numa frase concreta e diz o que precisas.',
      'Não tomes decisão relacional nas próximas 72 horas.',
      'Escreve a versão da outra parte: pode haver informação que não tens.',
    ],
    reflection: [
      'Que facto eu ainda não admito que me doeu?',
      'Prefiro ter razão sobre a ferida ou curá-la?',
      'Esta dor pede tempo ou pede uma conversa?',
    ],
    relations: [
      { card: 'minor-swords-10', kind: 'continuidade', note: 'Da ferida declarada ao fundo do ciclo: a dor que se prolonga sem reparação.' },
      { card: 'minor-cups-05', kind: 'reforca', note: 'Mágoa e luto: combinação de perdas emocionais a elaborar.' },
    ],
    art: {
      scene: 'heart-pierced-by-three-swords-in-rain',
      sky: 'storm',
      terrain: 'plain',
      glyphs: ['sword-blade', 'heart-open', 'rain-lines', 'cloud-band', 'bare-branch'],
      palette: ['#4A1F39', '#11172A', '#EFE6D6'],
      motifs: ['coração atravessado por três espadas', 'chuva oblíqua', 'nuvens baixas', 'galho seco'],
      reading: [
        'As três lâminas entram em ângulos diferentes: três causas, não uma.',
        'A chuva é regular e fina: dor declarada, não tempestade súbita.',
        'O coração está inteiro no desenho: o órgão não está destruído, está atingido.',
      ],
    },
    a11y: {
      alt: 'Carta Três de Espadas: coração humano atravessado por três espadas, com chuva e nuvens ao fundo.',
      long:
        'Céu carregado com chuva em linhas oblíquas. Centro: coração vermelho suspenso, atravessado por três espadas com cabos dourados, em ângulos diferentes; galho seco à esquerda. Moldura com o numeral III de Espadas.',
    },
    sources: ['Tarocchino di Bologna', 'Marseille – trois d\'épée', 'Waite – chuva e nuvens'],
  },
  {
    id: 'minor-swords-04',
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    rank: '4',
    name: { pt: 'Quatro de Espadas', intl: 'Four of Swords' },
    archetype: 'Pausa terapêutica / repouso consciente',
    element: 'air',
    astro: 'Júpiter em Balança',
    gdTitle: 'Repouso após a Luta',
    traditionNote: 'Chesed em suspensão: "repouso". Waite copiou a figura de um cavaleiro funerário de uma catedral, o que explica o tom de retrato de túmulo.',
    keywords: {
      upright: ['repouso', 'recuperação', 'isolamento curto', 'trégua', 'retirada estratégica'],
      reversed: ['descanso interrompido', 'agitação involuntária', 'convalescença mal gerida', 'impaciência', 'burnout'],
    },
    history:
      'A imagem do cavaleiro deitado num monumento funerário, com três espadas na parede e uma abaixo, vem de um túmulo de catedral inglesa; é a razão pela qual a carta não é morte mas suspensão: um repouso com honras, não um fim.',
    meanings: {
      upright:
        'Para de remar e deixa a corrente fazer trabalho. Esta carta recomenda pausa deliberada, redução de estímulos, convalescença, fim de semana sem agenda, e silêncio estratégico numa negociação. Não é derrota: é gestão de energia.',
      reversed:
        'Ou não se consegue parar, ou o repouso foi interrompido por obrigação. Indica cansaço persistente, retorno antecipado e a sensação de não merecer a pausa.',
    },
    psychology:
      'É a função de inibição a favor da integração: o psiquismo precisa de interrupção para consolidar. Em sombra, a incapacidade de repouso por ansiedade de desempenho.',
    emotional: 'Cansaço quieto, indiferença temporária, alívio contido.',
    love: 'Necessidade de espaço, pausa na relação ou conversas adiadas de propósito. Em inversão: ansiedade de quem não aguenta a distância.',
    career: 'Baixar carga, recusar projeto novo, tirar férias reais, pausa entre contratos. Aconselhável comunicação escrita do intervalo.',
    finances: 'Congelar despesa e decisões; não vender nem comprar em exaustão.',
    growth: 'Treinar repouso sem culpa: é competência, não recompensa.',
    spirituality: 'O sábado como instituição: parar é ato de confiança.',
    obstacles: 'Transformar pausa em evitamento prolongado.',
    opportunities: 'Uma janela de silêncio que clarifica o que a pressa não mostrou.',
    advice: [
      'Bloqueia dois dias sem agenda e sem telemóvel.',
      'Delega uma responsabilidade por escrito durante a pausa.',
      'Termina o descanso com uma decisão pequena, não com dez.',
    ],
    reflection: [
      'Do que eu fujo quando digo que preciso de descanso?',
      'O que acontece se eu parar uma semana?',
      'Que parte de mim não acredita que merece esta pausa?',
    ],
    relations: [
      { card: 'major-12-hanged-man', kind: 'complementa', note: 'A suspensão fértil: pausa com intenção terapêutica.' },
      { card: 'minor-wands-09', kind: 'sombra', note: 'Resistir demais sem repouso leva à exaustão.' },
    ],
    art: {
      scene: 'knight-effigy-lying-in-chapel',
      sky: 'overcast',
      terrain: 'interior',
      glyphs: ['sword-blade', 'kneeler', 'arch-temple', 'stained-window', 'figure-standing'],
      palette: ['#11172A', '#EFE6D6', '#C6A66B'],
      motifs: ['figura deitada em túmulo', 'três espadas na parede', 'uma espada por baixo', 'arco de capela', 'vitral pequeno'],
      reading: [
        'A figura está deitada em pose funerária mas não morta: suspensão, não fim.',
        'As três espadas na parede estão fora de alcance: o conflito foi suspenso, não vencido.',
        'A quarta espada sob o corpo indica que o repouso tem suporte, não abandono.',
      ],
    },
    a11y: {
      alt: 'Carta Quatro de Espadas: figura de cavaleiro deitada sobre um monumento com as mãos juntas, com três espadas penduradas na parede atrás e uma quarta sob o corpo, numa capela.',
      long:
        'Interior de capela com arco ogival e vitral. Centro: estátua jacente de cavaleiro sobre base de pedra, mãos juntas em oração, pés apoiados num animal pequeno; na parede, três espadas paralelas e, sob o corpo, uma quarta horizontal. Moldura com o numeral IV de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Júpiter em Virgem, "Rest"'],
  },
  {
    id: 'minor-swords-05',
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    rank: '5',
    name: { pt: 'Cinco de Espadas', intl: 'Five of Swords' },
    archetype: 'Vitória que custa / conflito sem honra',
    element: 'air',
    astro: 'Vénus em Aquário',
    gdTitle: 'Derrota',
    traditionNote: 'Geburah do ar: "derrota". Waite pintou um vencedor a olhar por cima do ombro enquanto dois derrotados se afastam, e o céu em travessia — leitura de custo.',
    keywords: {
      upright: ['conflito vencido mal', 'humilhação', 'vingança', 'aliança quebrada', 'ganhar perdendo'],
      reversed: ['reconciliação', 'rendição honesta', 'arrepentimento', 'sair da disputa', 'reparação'],
    },
    history:
      'Na série francesa esta carta tinha apenas cinco espadas, sem cena; Waite inventou a figura masculina com três espadas recolhidas e os dois adversários de costas, criando a carta mais explicitamente moral do naipe — a que pergunta quanto custa ganhar.',
    meanings: {
      upright:
        'Ganhaste o ponto e perdeste a relação. Esta carta descreve conflitos com truque, humilhação, traição de acordo, ou vitória obtida com método que não se admite em público. Também pode indicar que és tu a sair do campo com essa vitória.',
      reversed:
        'A espada baixada. Descreve fim da disputa, pedido de desculpas, recusa de continuar, ou aceitação de perder para preservar algo maior.',
    },
    psychology:
      'É a agressividade competitiva e o seu custo relacional. Em leitura clínica, aponta a repetição de situações em que se precisa de vencer para não se sentir pequeno.',
    emotional: 'Ressentimento, satisfação amarga, desconfiança, vergonha fria.',
    love: 'Discussões para ganhar, não para resolver; palavras ditas com intenção de ferir. Em inversão: acordo ou término limpo.',
    career: 'Competição desleal, crédito apropriado, negociação sem ética, corte de acordo. Documenta tudo por escrito.',
    finances: 'Litígio, penalidade, cobrança dura; evita apostas em que o ganho dependa de perda alheia.',
    growth: 'Perguntar o preço da vitória antes de a procurar, e decidir se vale a pena pagá-lo.',
    spirituality: 'A renúncia ao direito de ferir: força que não se exerce também é força.',
    obstacles: 'Precisar de humilhar para se sentir seguro.',
    opportunities: 'Sair da disputa cedo, antes que o dano se torne irreversível.',
    advice: [
      'Pergunta-te o que queres ganhar e o que estás disposto a perder para isso.',
      'Retira uma frase que só serve para magoar.',
      'Propõe mediação por escrito, sem plateia.',
    ],
    reflection: [
      'Já ganhei alguma discussão desta forma e ter-me custado tudo?',
      'O que eu preciso de provar neste conflito?',
      'Quem paga a minha vitória?',
    ],
    relations: [
      { card: 'minor-wands-05', kind: 'espelho', note: 'Atrito sem dano (paus) e atrito com dano (espadas).' },
      { card: 'minor-swords-02', kind: 'continuidade', note: 'O impasse que rebenta em disputa.' },
    ],
    art: {
      scene: 'victor-with-gathered-swords-and-retreating-figures',
      sky: 'storm',
      terrain: 'plain',
      glyphs: ['sword-blade', 'five-crossed-staves', 'retreating-figures', 'crow', 'wind-lines'],
      palette: ['#4A1F39', '#11172A', '#C6A66B'],
      motifs: ['figura com três espadas recolhidas', 'dois homens de costas a afastar-se', 'céu em vento', 'corvo ao fundo'],
      reading: [
        'O vencedor olha por cima do ombro, para o observador: sabe que o preço é real.',
        'Os dois derrotados afastam-se sem feridas visíveis: o dano é de vínculo.',
        'O vento no céu indica que a situação continua em movimento, não fechada.',
      ],
    },
    a11y: {
      alt: 'Carta Cinco de Espadas: figura a segurar três espadas recolhidas do chão, virada para dois homens que se afastam de costas, sob um céu de vento.',
      long:
        'Campo aberto com céu nublado em riscas de vento. Centro-direita: figura com manto escuro e sorriso contido, três espadas na mão e ao ombro; esquerda, duas figuras de costas a afastar-se. Corvo em pedra ao fundo. Moldura com o numeral V de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Vénus em Ar, "Defeat"'],
  },
  {
    id: 'minor-swords-06',
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    rank: '6',
    name: { pt: 'Seis de Espadas', intl: 'Six of Swords' },
    archetype: 'Travessia / sair do difícil com o essencial',
    element: 'air',
    astro: 'Mercúrio em Aquário',
    gdTitle: 'Sucesso Ganho',
    traditionNote: 'Tiphareth em movimento: "ciência". O barqueiro e as seis espadas fincadas no casco definem a leitura: parte-se com o peso já arrumado.',
    keywords: {
      upright: ['transição', 'partida com plano', 'alívio gradual', 'distanciamento necessário', 'mudança de margem'],
      reversed: ['partida travada', 'culpa de quem sai', 'regresso antecipado', 'transição mal preparada', 'estagnação'],
    },
    history:
      'A barca com figura de manto e capuz, um passageiro pequeno e seis espadas fincadas no casco, é das imagens mais estáveis do Tarot moderno; em Marselha eram apenas seis lâminas sobre um rio. A carta sempre significou passagem, não perda.',
    meanings: {
      upright:
        'Sair do que fez mal e levar o necessário. Esta carta favorece mudança de cidade, de equipa, de relação, de terapeuta — sempre com planeamento. A dor não desaparece no trajeto, mas fica administrável.',
      reversed:
        'O barco não larga a margem: saída travada por culpa, por dinheiro, por medo; ou viagem feita sem preparo que obriga a voltar.',
    },
    psychology:
      'É a função de deslocamento do investimento psíquico: conseguir retirar afeto de um lugar e colocá-lo noutro. Em sombra, a lealdade patológica ao sofrimento.',
    emotional: 'Melancolia serena, esperança discreta, saudade antecipada.',
    love: 'Mudar-se juntos, afastamento temporário acordado, fim de relação sem rutura violenta. Em inversão: não conseguir sair.',
    career: 'Transição de emprego com período de sobreposição, mudança de projeto, saída negociada. Boa fase para planear, má para queimar navios.',
    finances: 'Recurso para a viagem existe: orçamento de transição, mudança de banco, portabilidade de dívida.',
    growth: 'Aceitar que partir não é trair quem ficou: lealdade não obriga a ficar onde se deixou de caber.',
    spirituality: 'A travessia como rito: deixar uma margem com respeito, chegar à outra com intenção.',
    obstacles: 'Sentir-se culpado por se afastar.',
    opportunities: 'Uma mudança concreta que reduz o sofrimento sem grande perda.',
    advice: [
      'Escreve o plano de saída com datas e uma reserva mínima.',
      'Leva só o que serve no destino: desfaz-te do resto com carinho.',
      'Despeça-te das pessoas que importam; a viagem corre melhor.',
    ],
    reflection: [
      'O que me prende a esta margem, e a quem serve?',
      'Que coisa levo comigo só por hábito?',
      'A quem preciso de dizer adeus antes de partir?',
    ],
    relations: [
      { card: 'minor-cups-08', kind: 'reforca', note: 'As duas cartas de partida: a emocional e a prática, em conjunto resolvem.' },
      { card: 'major-07-chariot', kind: 'continuidade', note: 'Movimento com direção: travessia com comando.' },
    ],
    art: {
      scene: 'small-boat-crossing-calm-water',
      sky: 'dawn',
      terrain: 'water',
      glyphs: ['boat-small', 'sword-blade', 'cloak-hood', 'child-naked', 'reeds', 'six-standing-blades'],
      palette: ['#56C5BD', '#EFE6D6', '#11172A'],
      motifs: ['barco com passageiro pequeno', 'seis espadas fincadas no casco', 'água calma com ondulação', 'juncos na margem deixada'],
      reading: [
        'As espadas vão no barco: o conflito é levado como ferramenta, não deixado como ferida.',
        'A água atrás é agitada e à frente calma: a travessia já melhorou.',
        'O barqueiro de costas indica que se parte sem espetáculo.',
      ],
    },
    a11y: {
      alt: 'Carta Seis de Espadas: barco pequeno conduzido por uma figura encapuzada com um passageiro, levando seis espadas fincadas no casco, a atravessar água calma.',
      long:
        'Rio largo com margem de juncos à esquerda. Centro: barco de madeira com figura alta de manto e capuz a empurrar com vara comprida; à frente, figura mais baixa com manto e capuz. Seis espadas fincadas verticalmente no casco. Água com ondulações paralelas. Moldura com o numeral VI de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Mercúrio em Gémeos, "Science"'],
  },
  {
    id: 'minor-swords-07',
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    rank: '7',
    name: { pt: 'Sete de Espadas', intl: 'Seven of Swords' },
    archetype: 'Estratégia oculta / o que se leva sem pedir',
    element: 'air',
    astro: 'Lua em Aquário',
    gdTitle: 'Força Encurtada',
    traditionNote: 'Netzach em sombra: "vaidade/furto". A carta italiana era apenas sete espadas; Waite criou o personagem que se afasta com cinco.',
    keywords: {
      upright: ['estratégia indirecta', 'omissão', 'astúcia', 'informação retida', 'autoengano', 'jogo de bastidores'],
      reversed: ['revelação', 'confissão', 'consciência que cobra', 'plano descoberto', 'volta para assumir'],
    },
    history:
      'O ladrão de espadas que se afasta do acampamento a olhar por cima do ombro é invenção de Waite, e a partir dela a carta deixou de ser neutra. Nas baralhas latinas mantinha-se o valor de "vitória por astúcia" sem condenação moral.',
    meanings: {
      upright:
        'Algo não está a ser dito — por ti ou para ti. Esta carta favorece discrição estratégica e leitura de intenções; desfavorece confiança plena. Em contexto neutro, descreve quem resolve sozinho, sem autorização, porque o processo oficial não funciona.',
      reversed:
        'O que foi escondido aparece: confissão, auditoria, descoberta, ou consciência que começa a cobrar juros. Também pode indicar decisão de devolver e assumir.',
    },
    psychology:
      'É a função do eu que prefere preservar a imagem a sustentar a verdade: omissão, racionalização, autocensura informativa. Frequentemente aponta autoengano mais do que engano alheio.',
    emotional: 'Culpa baixa, vigilância, satisfação de quem não foi apanhado, ansiedade de descoberta.',
    love: 'Segredos, omissões, conversas paralelas, aquilo que se esconde para não magoar. Em inversão: revelação ou confissão.',
    career: 'Informação retida, crédito não partilhado, negociação com dados assimétricos, planear saída em silêncio. Cautela com contratos.',
    finances: 'Verificar movimentos, letras pequenas, despesas ocultas, empréstimos não declarados. Auditoria é a resposta correta a esta carta.',
    growth: 'Reconhecer onde estás a negociar contigo próprio em vez de com os outros.',
    spirituality: 'A honestidade interior como disciplina: não há atalho espiritual por omissão.',
    obstacles: 'Achar que ninguém repara, e confundir astúcia com competência.',
    opportunities: 'Uma jogada discreta necessária — sair, negociar, proteger informação — feita sem trair confiança.',
    advice: [
      'Diz hoje aquilo que omitiste, antes que alguém o descubra.',
      'Verifica duas fontes antes de decidir com informação parcial.',
      'Se a discrição é necessária, documenta o motivo, para ti.',
    ],
    reflection: [
      'O que estou a esconder e porquê?',
      'Que parte desta história não me foi contada?',
      'Que versão eu sustentaria em público?',
    ],
    relations: [
      { card: 'minor-cups-queen', kind: 'tensao', note: 'Escuta profunda contra omissão: a rainha percebe o que o sete esconde.' },
      { card: 'major-15-devil', kind: 'reforca', note: 'Pacto não dito e vantagem escondida: reforçam-se.' },
    ],
    art: {
      scene: 'figure-sneaking-away-with-five-swords',
      sky: 'night',
      terrain: 'camp',
      glyphs: ['sword-blade', 'cloak-hood', 'five-crossed-staves', 'camp-tents', 'moon-pool', 'path-crossroads'],
      palette: ['#11172A', '#4A1F39', '#C6A66B'],
      motifs: ['figura com cinco espadas ao ombro', 'acampamento adormecido', 'duas figuras sentadas de costas', 'caminho duplo', 'lua baixa'],
      reading: [
        'Leva cinco das sete: não é roubo total, é selecção — o que servirá.',
        'Duas espadas ficam para trás, fincadas: há consequência visível.',
        'O passo é rápido mas o corpo está voltado: consciência do que se faz.',
      ],
    },
    a11y: {
      alt: 'Carta Sete de Espadas: figura encapuzada a afastar-se de um acampamento levando cinco espadas ao ombro, enquanto duas figuras sentadas parecem adormecidas.',
      long:
        'Acampamento noturno com tendas baixas e lua no céu. Centro: figura com manto escuro de costas meio virada, a carregar cinco espadas; ao fundo, duas figuras sentadas junto a fogueira apagada, de costas. Duas espadas fincadas no chão. Moldura com o numeral VII de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Lua em Ar, "Debauch/Vanity"'],
  },
  {
    id: 'minor-swords-08',
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    rank: '8',
    name: { pt: 'Oito de Espadas', intl: 'Eight of Swords' },
    archetype: 'Armadura autoimposta / a prisão sem grades',
    element: 'air',
    astro: 'Júpiter em Gémeos',
    gdTitle: 'Cativeiro',
    traditionNote: 'Hod: "interrupção/escravidão". O detalhe decisivo do desenho de Waite é que as ataduras não prendem os pés: a saída está aberta.',
    keywords: {
      upright: ['sensação de aprisionamento', 'autocensura', 'limites percepcionados', 'ansiedade paralisante', 'vitimização'],
      reversed: ['libertação', 'fim da paralisia', 'perspectiva recuperada', 'coragem de sair', 'reconhecimento da autoimposição'],
    },
    history:
      'Waite inventou a cena — figura vendada e atada, rodeada de oito espadas, sobre terreno alagado com fortaleza atrás — mantendo-a deliberadamente ambígua: as amarras são frouxas. Esta nota de Waite ("a carta não indica prisão real") define a leitura técnica contemporânea.',
    meanings: {
      upright:
        'Sentes-te sem saída e parte disso é construção tua. Esta carta descreve o quadro de ansiedade que reduz opções, autocensura em ambiente rígido, ou circunstância real que ainda assim tem mais folga do que parece.',
      reversed:
        'As ataduras caem: recusa do papel de vítima, procura de ajuda, decisão de sair de contexto que se naturalizou. Também indica que a clarificação chega por fora.',
    },
    psychology:
      'É o mecanismo de indefensão aprendida: a psique que deixa de testar saídas porque aprendeu que não há. O tratamento passa por micro-experimentos de agência — escolher uma coisa pequena por dia.',
    emotional: 'Claustrofobia psíquica, medo, humilhação, raiva contida.',
    love: 'Sentir-se preso em relação por obrigação, filho, dinheiro ou reputação. Em inversão: pedido de ajuda e saída planeada.',
    career: 'Função com pouca margem, hierarquia rígida, contrato que não se pode quebrar; também autolimitação por medo de errar em público.',
    finances: 'Compromissos que parecem inamovíveis — muitas vezes renegociáveis com apoio técnico. Não assinar nada sem revisão.',
    growth: 'Testar uma grade por dia: descobrir que parte do encarceramento é hábito.',
    spirituality: 'A noite em que não se vê saída é também a noite em que a fé se separa do conforto.',
    obstacles: 'Confirmar a própria impotência para não arriscar.',
    opportunities: 'Uma autorização, apoio jurídico ou aliado que abre a cerca.',
    advice: [
      'Testa uma restrição que assumiste sem confirmar.',
      'Pede ajuda externa específica esta semana: não se sai sozinho do que se não vê.',
      'Reduz o quadro: uma decisão pequena e reversível.',
    ],
    reflection: [
      'Isto é uma grade ou uma ideia de grade?',
      'De quem é a voz que me diz que não posso?',
      'O que aconteceria se eu desse um passo hoje?',
    ],
    relations: [
      { card: 'major-15-devil', kind: 'reforca', note: 'Corrente frouxa em ambos: o vínculo que se aceita sem testar.' },
      { card: 'minor-swords-02', kind: 'continuidade', note: 'A venda e as ataduras: recusar ver gera não poder mover-se.' },
    ],
    art: {
      scene: 'blindfolded-bound-figure-among-eight-swords',
      sky: 'overcast',
      terrain: 'plain',
      glyphs: ['sword-blade', 'blindfold', 'cord-bind', 'fortress', 'still-water'],
      palette: ['#11172A', '#EFE6D6', '#56C5BD'],
      motifs: ['figura vendada com braços atados', 'oito espadas em semicírculo', 'terreno alagado', 'fortaleza ao fundo', 'pés livres'],
      reading: [
        'Os pés não estão presos: a restrição é de visão e de braços, não de caminho.',
        'As espadas formam semicírculo, não círculo: há lado aberto.',
        'A água parada ao fundo mostra cenário estável, não catástrofe.',
      ],
    },
    a11y: {
      alt: 'Carta Oito de Espadas: figura vendada com braços atados por uma capa, rodeada por oito espadas fincadas no chão, com um lago parado e uma fortaleza ao fundo.',
      long:
        'Campo cinzento com lago e colina. Centro: figura de pé, capa a envolver os braços, venda clara nos olhos, pés descalços livres; oito espadas fincadas em arco à sua volta. Ao fundo, fortaleza com torres. Moldura com o numeral VIII de Espadas.',
    },
    sources: ['Waite – Pictorial Key (nota sobre as ataduras)', 'Golden Dawn – Júpiter em Air, "Interruption"'],
  },
  {
    id: 'minor-swords-09',
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    rank: '9',
    name: { pt: 'Nove de Espadas', intl: 'Nine of Swords' },
    archetype: 'Insónia / o peso do pensamento nocturno',
    element: 'air',
    astro: 'Marte em Gémeos',
    gdTitle: 'Desespero e Crueldade',
    traditionNote: 'Yesod perturbado: "crueldade/despótico". Nas cartas latinas a carta mostrava apenas nove espadas; a mulher acordada é criação de Waite.',
    keywords: {
      upright: ['angústia nocturna', 'ruminação', 'culpa', 'medo antecipatório', 'insónia', 'pesar não dito'],
      reversed: ['abertura', 'ajuda pedida', 'alívio', 'pior já passou', 'revelação do que preocupa'],
    },
    history:
      'A imagem da figura sentada na cama, rosto nas mãos, com nove espadas na parede sobre um cobertor com gárgulas, é das mais fortes do baralho. Historicamente ligada a provérbios sobre o sono como mau conselheiro, a carta descreve sofrimento mental sem perda externa: o dano é de pensamento.',
    meanings: {
      upright:
        'O problema é real; a ampliação é das três da manhã. Esta carta descreve ruminação, angústia antecipatória, culpa, e a certeza pessimista produzida por exaustão. Recomenda partilhar, não ruminar; agir de manhã, não decidir à noite.',
      reversed:
        'O peso começa a levantar-se: fala-se do que se calava, aceita-se ajuda, descobre-se que o pior não aconteceu. Aparece também quando a ansiedade se converte em sintoma físico.',
    },
    psychology:
      'É o superego em modo punitivo com privação de sono: autocrítica noturna, catastrofização, memória seletiva do erro. Intervenção útil: sono, escrita estruturada, conversa com pessoa de confiança, apoio profissional se persistir.',
    emotional: 'Angústia, vergonha, solidão, irritabilidade matinal.',
    love: 'Medo de perda, ciúme ruminado, conversa ensaiada que não acontece. Em inversão: dizer o que se teme.',
    career: 'Ansiedade de desempenho, medo de reunião, exaustão por responsabilidade não delegada. Não aceitar mais carga esta fase.',
    finances: 'Despesa por ansiedade, preocupação desproporcionada com número pequeno. Pede contabilidade factual, não mental.',
    growth: 'Tratar o pensamento como evento, não como ordem: escrever, datar, rever.',
    spirituality: 'A noite escura da alma distingue-se da insónia por excesso de cafeína: ambas precisam de regra, não de heróismo.',
    obstacles: 'Suportar sozinho para não parecer frágil.',
    opportunities: 'Uma conversa que reduz o problema a um terço do tamanho.',
    advice: [
      'Liga a alguém antes das 22h de hoje; não escrevas decisões à noite.',
      'Escreve três factos, três medos e três ações possíveis — só age nos factos.',
      'Se a insónia e a angústia se repetem, marca consulta: isto não é fraqueza, é sintoma.',
    ],
    reflection: [
      'Que prova real tenho do pior cenário?',
      'A quem eu nunca contei isto?',
      'Do que eu preciso — de clareza ou de descanso?',
    ],
    relations: [
      { card: 'minor-swords-08', kind: 'reforca', note: 'Paralisia e ruminação: o mesmo nó em duas horas do dia.' },
      { card: 'major-18-moon', kind: 'continuidade', note: 'A noite e as imagens que ela produz.' },
    ],
    art: {
      scene: 'awake-figure-on-bed-with-nine-swords',
      sky: 'night',
      terrain: 'interior',
      glyphs: ['sword-blade', 'bed-frame', 'gargoyle-blanket', 'candle-low', 'curtain'],
      palette: ['#11172A', '#4A1F39', '#EFE6D6'],
      motifs: ['figura sentada na cama com mãos no rosto', 'nove espadas na parede', 'cobertor com rostos pequenos', 'vela apagada', 'janela escura'],
      reading: [
        'As nove espadas estão alinhadas mas nenhuma está em movimento: o perigo é imaginado.',
        'As mãos tapam os olhos: a figura recusa o que já sabe.',
        'A vela apagada indica que se tentou trabalhar a noite e se falhou.',
      ],
    },
    a11y: {
      alt: 'Carta Nove de Espadas: pessoa sentada na cama com as mãos no rosto, com nove espadas penduradas na parede atrás, um cobertor com pequenos rostos e uma vela apagada.',
      long:
        'Quarto escuro com janela a mostrar noite. Centro: figura sentada na beira da cama, cotovelos nos joelhos, mãos no rosto; cobertor com gárgulas bordadas. Na parede, nove espadas em duas filas. Mesa com vela apagada. Moldura com o numeral IX de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Marte em Air, "Cruelty"'],
  },
  {
    id: 'minor-swords-10',
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    rank: '10',
    name: { pt: 'Dez de Espadas', intl: 'Ten of Swords' },
    archetype: 'Fundo de ciclo / o fim que já não tem mais',
    element: 'air',
    astro: 'Sol em Gémeos',
    gdTitle: 'Ruína',
    traditionNote: 'Malkuth do ar: "ruína". O amanhecer vermelho no horizonte é o pormenor que muda a leitura: a carta tem sol.',
    keywords: {
      upright: ['fim absoluto', 'perda consumada', 'traição final', 'alívio pelo fim', 'não há mais a perder'],
      reversed: ['reconstrução', 'sobrevivência', 'recusa de aceitar o fim', 'reparação tardia', 'recuperação lenta'],
    },
    history:
      'Em Marselha esta carta tinha dez espadas sem cena — uma das mais duras do baralho apenas pela quantidade. Waite acrescentou o corpo deitado, as dez lâminas nas costas e o horizonte claro, criando a leitura de fim inevitável mas encerrado.',
    meanings: {
      upright:
        'Chegou ao fundo e, por isso, pode parar. Esta carta descreve perda que se consumou: fim de contrato, de relação, de projeto, de saúde financeira, de reputação. É brutal e é também o ponto a partir do qual não há mais queda.',
      reversed:
        'Ou a recuperação começou, ou a pessoa continua deitada com as lâminas sem as retirar: manter-se numa situação que já terminou e só prolonga a dor.',
    },
    psychology:
      'É o confronto com a perda total e a capacidade de a encerrar — condição para qualquer reconstrução. Em sombra, a identificação com o papel de destruído e a repetição do mesmo desfecho.',
    emotional: 'Dor extrema e, depois, calma estranha; alívio tardio.',
    love: 'Ruptura definitiva ou fim de ciclo de sofrimento. Em inversão: não conseguir fechar a porta.',
    career: 'Encerramento de atividade, corte, falência de projeto, saída de empresa. Aconselha fechar com acordo escrito e não com silêncio.',
    finances: 'Perda final de um compromisso; melhor encerrar já do que sustentar. Pedir apoio especializado em reestruturação.',
    growth: 'Aprender a terminar: não reabrir o cadáver do assunto.',
    spirituality: 'A morte do velho eu como facto consumado; o amanhecer da carta é a sua única promessa, e é suficiente.',
    obstacles: 'Adiar o luto para não perder a identidade de quem resistiu.',
    opportunities: 'A libertação de um peso que ocupava toda a energia desde há muito.',
    advice: [
      'Encerra formalmente: por escrito, com data, sem reabrir discussão.',
      'Retira as lâminas uma a uma: três coisas a parar esta semana.',
      'Pede apoio — financeiro ou emocional — antes de decidir sozinho.',
    ],
    reflection: [
      'O que já acabou e continuo a tratar como se estivesse em curso?',
      'Que parte de mim precisa desta derrota para mudar de direção?',
      'Como eu quero que este capítulo termine, já que não posso escolher que termine?',
    ],
    relations: [
      { card: 'major-13-death', kind: 'reforca', note: 'Dois fechos sem retorno: um simbólico, um factual.' },
      { card: 'major-19-sun', kind: 'continuidade', note: 'O sol que nasce atrás do corpo: a mesma luz que abre o ciclo seguinte.' },
    ],
    art: {
      scene: 'figure-prone-with-ten-swords-at-dawn',
      sky: 'dawn',
      terrain: 'water',
      glyphs: ['sword-blade', 'figure-falling', 'sun-half', 'still-water', 'ruins-low'],
      palette: ['#11172A', '#4A1F39', '#C6A66B'],
      motifs: ['corpo deitado com dez espadas nas costas', 'amanhecer vermelho no horizonte', 'ruínas baixas ao fundo', 'água quieta'],
      reading: [
        'Todas as lâminas estão cravadas: não há mais uma a receber — o ciclo fechou.',
        'A roupa está intacta na frente: o dano veio de cima e por trás.',
        'O horizonte ilumina-se: a carta pinta fim e manhã no mesmo quadro.',
      ],
    },
    a11y: {
      alt: 'Carta Dez de Espadas: figura deitada de bruços com dez espadas nas costas, num campo junto a água parada, com um amanhecer vermelho ao fundo.',
      long:
        'Campo baixo com água parada e ruínas ao fundo. Centro: corpo de bruços, manto e túnica, cabeça voltada para o chão; dez espadas com cabos dourados atravessadas diagonalmente nas costas. O horizonte clareia com nuvens vermelhas. Moldura com o numeral X de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Vénus em Air, "Ruin"'],
  },
  {
    id: 'minor-swords-page',
    arcana: 'minor',
    suit: 'swords',
    number: 11,
    rank: 'page',
    name: { pt: 'Pajem de Espadas', intl: 'Page of Swords' },
    archetype: 'Vigilância jovem / a pergunta incómoda',
    element: 'air',
    astro: 'Terra do Ar',
    gdTitle: 'Príncipe da Comunidade do Espírito do Ar',
    traditionNote: 'O "fante" de espadas olha por cima do ombro: atenção alerta, pronta a reportar.',
    keywords: {
      upright: ['curiosidade analítica', 'aviso', 'informação nova', 'pergunta directa', 'verificação'],
      reversed: ['fofoca', 'indiscrição', 'suspeita sem prova', 'critica gratuita', 'imaturidade argumentativa'],
    },
    history:
      'Waite mostra um jovem com espada erguida num campo com vento, árvores inclinadas e nuvens rápidas — leitura clássica de mensageiro que traz notícia que corta. A carta é também a da aprendizagem do pensamento crítico.',
    meanings: {
      upright:
        'Chega informação que obriga a rever a posição. Esta carta favorece investigar, perguntar, ler as condições, pedir prova, aprender técnica nova e observar com atenção o que outros desvalorizam.',
      reversed:
        'A espada vira-se para o espetáculo: comentário sem substância, suspeita gratuita, fofoca, uso do vocabulário para vencer discussões em vez de compreender.',
    },
    psychology:
      'É a função de pensamento em estado interrogativo: saudável como curiosidade, defensiva como vigilância permanente. Em sombra, o hábito de testar os outros antes de confiar.',
    emotional: 'Alerta, desconfiança fina, entusiasmo intelectual.',
    love: 'Perguntas diretas, investigação em redes sociais, conversa sobre factos. Em inversão: ciúme argumentativo, testes constantes.',
    career: 'Revisão, auditoria, formação, análise de dados, primeiro relatório sólido. Ótimo estagiário, mau conselheiro de estratégia.',
    finances: 'Verificar contratos e taxas; aprender sobre produtos financeiros antes de decidir.',
    growth: 'Transformar suspeita em método: pedir prova em vez de acumular hipóteses.',
    spirituality: 'A espada da discernimento pequeno: notar o que não bate certo sem condenar.',
    obstacles: 'Confundir dúvida com insight: perguntar por perguntar não é analisar.',
    opportunities: 'Uma peça de informação que muda a decisão principal.',
    advice: [
      'Faz a pergunta que todos evitam, numa reunião, em tom neutro.',
      'Escreve o que verificaste e o que estás a assumir.',
      'Corta um comentário irónico que não acrescenta nada.',
    ],
    reflection: [
      'O que estou a ouvir pela primeira vez e não quero aceitar?',
      'Dúvida minha tem prova ou tem só hábito?',
      'Que informação me falta para decidir?',
    ],
    relations: [
      { card: 'minor-swords-01', kind: 'continuidade', note: 'A pergunta jovem que se torna decisão clara.' },
      { card: 'major-02-high-priestess', kind: 'espelho', note: 'Observação silenciosa e observação interrogativa.' },
    ],
    art: {
      scene: 'page-standing-in-wind-with-sword',
      sky: 'overcast',
      terrain: 'plain',
      glyphs: ['sword-blade', 'wind-lines', 'tunic-leaf', 'birds-flock', 'bare-tree'],
      palette: ['#EFE6D6', '#11172A', '#C6A66B'],
      motifs: ['jovem com espada erguida', 'cabelo e roupa ao vento', 'árvores inclinadas', 'bandos de pássaros'],
      reading: [
        'O vento que inclina as árvores é o contexto: o pajem está firme no que é instável.',
        'Os pássaros ao fundo são boatos: muitos, pequenos, na mesma direção.',
        'A espada é leve e está erguida a meio: aviso, não ataque.',
      ],
    },
    a11y: {
      alt: 'Carta Pajem de Espadas: jovem num campo ventoso com uma espada erguida, com árvores inclinadas e pássaros ao fundo.',
      long:
        'Campo aberto com céu nublado e nuvens em risco. Centro: figura jovem de perfil, túnica com folhas, sapatos apontados, espada vertical na mão direita, mão esquerda atrás; cabelo puxado pelo vento. Fundo: árvores inclinadas e um bando de pássaros. Moldura com o rótulo de pajem de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Terra do Ar'],
  },
  {
    id: 'minor-swords-knight',
    arcana: 'minor',
    suit: 'swords',
    number: 12,
    rank: 'knight',
    name: { pt: 'Cavaleiro de Espadas', intl: 'Knight of Swords' },
    archetype: 'Carga intelectual / a argumentação como investida',
    element: 'air',
    astro: 'Ar do Ar',
    gdTitle: 'Senhor dos Ventos e das Brisas',
    traditionNote: 'O cavaleiro mais rápido do baralho: cavalo ao galope, capa ao vento, lâmina apontada à frente.',
    keywords: {
      upright: ['avanço decidido', 'defesa frontal', 'velocidade mental', 'assertividade', 'execução sem rodeios'],
      reversed: ['agressividade', 'brusquidão', 'precipitação', 'ataque pessoal', 'energia sem direcção'],
    },
    history:
      'Waite desenhou-o ao galope num campo nevado, com a espada para a frente e nuvens a correr atrás: a cena é uma das poucas que comunica velocidade no baralho inteiro. O cavalo branco sobre neve reforça a frieza instrumental.',
    meanings: {
      upright:
        'Avanço direto e rápido sobre um problema concreto. Esta carta favorece tomada de posição, discussão técnica, resolução de pendência, e a coragem de dizer em uma frase o que se andou a contornar em dez reuniões.',
      reversed:
        'A carga passa por cima de pessoas: argumentação ofensiva, decisões unilaterais, pressa que cria erro e conflito. Também indica necessidade de ter razão a qualquer preço.',
    },
    psychology:
      'É a função de pensamento em modo combativo: grande capacidade de distinção, pouca paciência para ambiguidade. Em sombra, o uso do intelecto como defesa contra o contacto afectivo.',
    emotional: 'Impaciência, excitação competitiva, irritabilidade fria.',
    love: 'Conversa frontal que pode ser libertadora ou cruel. Em inversão: discussões de argumentação em vez de intimidade.',
    career: 'Negociação dura, prazos apertados, resolução imediata, reestruturação rápida. Excelente para executar, péssimo para consenso.',
    finances: 'Corte rápido e decisão sem comissão; atenção a penalizações por pressa.',
    growth: 'Aprender a desacelerar a conclusão antes de a anunciar.',
    spirituality: 'A lâmina que corta sem ódio: disciplina mental ao serviço da verdade.',
    obstacles: 'Confundir clareza com agressividade.',
    opportunities: 'Um avanço rápido que resolve uma pendência antiga.',
    advice: [
      'Escreve a posição antes da reunião; não a improvises.',
      'Pergunta uma vez "como é que isto vos afeta?" antes de avançar.',
      'Retarda 24 horas qualquer decisão que já esteja tomada na tua cabeça.',
    ],
    reflection: [
      'Quero resolver ou quero ganhar?',
      'Que efeito tem a minha velocidade em quem vai a pé?',
      'Esta certeza tem base ou só tem urgência?',
    ],
    relations: [
      { card: 'major-07-chariot', kind: 'reforca', note: 'Movimento e comando: avanço veloz com direção.' },
      { card: 'major-16-tower', kind: 'sombra', note: 'A carga sem travão cria o estrago que se podia evitar.' },
    ],
    art: {
      scene: 'knight-charging-with-raised-sword',
      sky: 'storm',
      terrain: 'plain',
      glyphs: ['sword-blade', 'horse', 'wind-lines', 'snowdrift', 'cloak-hood'],
      palette: ['#11172A', '#EFE6D6', '#C6A66B'],
      motifs: ['cavalo ao galope', 'espada apontada à frente', 'capa ao vento', 'nevão no chão', 'nuvens em movimento'],
      reading: [
        'A lâmina está alinhada com a direção do cavalo: foco total num só ponto.',
        'A neve sob os cascos é o terreno hostil — o avanço não ignora o frio.',
        'Nenhuma figura responde: é carga solitária, sem escolta.',
      ],
    },
    a11y: {
      alt: 'Carta Cavaleiro de Espadas: cavaleiro ao galope num campo nevado, com uma espada apontada para a frente e a capa levantada pelo vento.',
      long:
        'Campo nevado sob céu de tempestade com nuvens estiradas. Centro: cavalo branco em galope, patas levantadas; cavaleiro de manto escuro com espada comprida erguida e apontada à frente, braços abertos. Sem outras figuras. Moldura com o rótulo de cavaleiro de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Ar do Ar'],
  },
  {
    id: 'minor-swords-queen',
    arcana: 'minor',
    suit: 'swords',
    number: 13,
    rank: 'queen',
    name: { pt: 'Rainha de Espadas', intl: 'Queen of Swords' },
    archetype: 'Juízo independente / a verdade sem agrado',
    element: 'air',
    astro: 'Água do Ar',
    gdTitle: 'Rainha dos Tronos do Ar',
    traditionNote: 'O trono com borboletas e cabeças cortadas — herança de imagens antigas — indica uma rainha que sobreviveu ao que corta.',
    keywords: {
      upright: ['independência', 'critério', 'clareza sem doçura', 'experiência que endureceu', 'fronteira firme'],
      reversed: ['frieza punitiva', 'cinismo', 'crítica permanente', 'isolamento defensivo', 'amargor'],
    },
    history:
      'Waite mantém a figura de perfil com espada vertical e coroa baixa, com borboletas no braço do trono — símbolos de transformação — e um campo cultivado atrás. A tradição inglesa lê-a como a mulher que perdeu e aprendeu: capaz de julgar porque já foi julgada.',
    meanings: {
      upright:
        'A pessoa (ou a postura) que diz o que é, sem suavizar para agradar. Esta carta favorece limites, análise fria, decisão baseada em critério, revisão imparcial e a capacidade de ficar sozinha sem se sentir rejeitada.',
      reversed:
        'O corte sem cuidado: ironia como hábito, crítica permanente, distância afectiva como método. Também descreve a solidão de quem já não deixa ninguém chegar.',
    },
    psychology:
      'É a função de pensamento com experiência emocional incorporada: discernimento que não precisa de aprovação. Em sombra, a defesa intelectual que elimina vulnerabilidade a partir da raiz.',
    emotional: 'Contenção, afeto seletivo, orgulho discreto, sensibilidade escondida.',
    love: 'Vínculo com autonomia e sem drama; exige verdade e não aceita gestão emocional alheia. Em inversão: frio como castigo.',
    career: 'Perícia, auditoria, revisão, direito, edição, clínica, consultoria. Excelente para decidir com justiça; péssima para marketing afectivo.',
    finances: 'Gestão independente, contas próprias, separação de finanças em casal; decisões sem apelo sentimental.',
    growth: 'Integrar ternura com critério: a espada não tem de ser a única linguagem.',
    spirituality: 'A sabedoria que vem da perda; discernimento sem condenação.',
    obstacles: 'Precisão usada como distância.',
    opportunities: 'Um papel onde a tua imparcialidade é a competência procurada.',
    advice: [
      'Diz a verdade numa frase e uma única vez: insistir é outra coisa.',
      'Aplica a ti o critério que aplicas aos outros.',
      'Deixa entrar uma pessoa que te contradiz com carinho.',
    ],
    reflection: [
      'Estou a proteger-me ou a punir?',
      'Que parte de mim foi julgada e não foi ainda absolvida?',
      'Que afeto eu recuso por considerar fraco?',
    ],
    relations: [
      { card: 'minor-cups-queen', kind: 'complementa', note: 'Escuta e critério: duas metades de uma autoridade saudável.' },
      { card: 'major-11-justice', kind: 'reforca', note: 'Balança interiorizada: imparcialidade como caráter.' },
    ],
    art: {
      scene: 'queen-in-profile-with-upright-sword',
      sky: 'overcast',
      terrain: 'field',
      glyphs: ['sword-throne', 'butterfly', 'sword-blade', 'wheat-sheaf', 'crown'],
      palette: ['#EFE6D6', '#11172A', '#C6A66B'],
      motifs: ['figura de perfil com espada vertical', 'coroa baixa', 'borboletas no trono', 'campo cultivado atrás'],
      reading: [
        'O perfil e não a frente: a rainha não se oferece ao público.',
        'As borboletas nos braços do trono são transformação concluída.',
        'A lâmina vertical à frente funciona como barreira e como ferramenta.',
      ],
    },
    a11y: {
      alt: 'Carta Rainha de Espadas: figura coroada sentada de perfil com uma espada levantada à frente, com borboletas decorativas no trono e um campo ao fundo.',
      long:
        'Campo cultivado com céu claro. Centro: figura sentada de perfil em trono com pequenos ornamentos em forma de borboleta, coroa baixa e drapeado escuro; mão direita a segurar espada na vertical, esquerda apoiada no braço do trono. Moldura com o rótulo de rainha de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Água do Ar'],
  },
  {
    id: 'minor-swords-king',
    arcana: 'minor',
    suit: 'swords',
    number: 14,
    rank: 'king',
    name: { pt: 'Rei de Espadas', intl: 'King of Swords' },
    archetype: 'Autoridade racional / a lei aplicada sem exceção',
    element: 'air',
    astro: 'Fogo do Ar',
    gdTitle: 'Rei dos Espíritos do Ar',
    traditionNote: 'O trono com águia e borboleta, cabeça virada de frente: juiz, não guerreiro. Waite herda a figura do magistrado imperial.',
    keywords: {
      upright: ['autoridade legal', 'imparcialidade', 'critério rigoroso', 'governança por regra', 'decisão fundamentada'],
      reversed: ['autoritarismo racional', 'frieza institucional', 'manipulação por norma', 'juiz parcial', 'abuso de competência'],
    },
    history:
      'O "Re di Spade" nas cartas latinas é um soberano com espada e cetro, sem cena; o detalhe da águia no encosto do trono, acrescentado por Waite, veio do simbolismo imperial e reforçou a leitura de jurisdição e Estado.',
    meanings: {
      upright:
        'Alguém com competência e mandato para decidir, ou a necessidade de o seres. Esta carta favorece processos formais, arbitragem, contratos, avaliação técnica, e qualquer situação em que a regra se deve aplicar sem favor.',
      reversed:
        'A regra usada como instrumento: legalismo frio, poder de quem sabe falar melhor, julgamento parcial. Indica também decisões tomadas sem informação humana relevante.',
    },
    psychology:
      'É a função de pensamento em sua forma mais governante: ordem lógica que permite julgar sem se perder. Em sombra, o tirano interno — exigência e autocrítica como sistema de governo pessoal.',
    emotional: 'Distância controlada, afecto expresso por princípios, pouca tolerância a drama.',
    love: 'Relação baseada em respeito, clareza e acordos; menos calor, mais previsibilidade. Em inversão: poder e frieza como forma de controlo.',
    career: 'Direção, chefia técnica, judicial, compliance, consultoria de alto nível. Favorável a decisões estruturantes e a arbitragem.',
    finances: 'Gestão rigorosa, planeamento fiscal, defesa de crédito; exige contrato e não aceita favor.',
    growth: 'Governa a própria vida com critério e sem tirania: a lei serve o sujeito, não o contrário.',
    spirituality: 'A lei como sustentáculo da verdade: severidade sem ódio.',
    obstacles: 'Confundir ser objetivo com ser justo.',
    opportunities: 'Uma decisão de autoridade competente que resolve o que estava preso.',
    advice: [
      'Fundamenta a decisão em regra e facto, não em humor.',
      'Pede a opinião de quem é avaliado antes de decidir.',
      'Aplica a norma a ti primeiro: é isso que a torna legítima.',
    ],
    reflection: [
      'Decido por critério ou por controle?',
      'Que exceção estou a exigir aos outros e a negar a mim?',
      'Onde falta humanidade na minha justiça?',
    ],
    relations: [
      { card: 'major-11-justice', kind: 'reforca', note: 'Regra e trono: autoridade institucional reforçada.' },
      { card: 'minor-cups-king', kind: 'tensao', note: 'Rigor e compaixão no mesmo comando: tensão necessária.' },
    ],
    art: {
      scene: 'king-on-throne-with-eagle-back',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['sword-throne', 'eagle', 'butterfly', 'sword-blade', 'scepter', 'greek-cross'],
      palette: ['#EFE6D6', '#C6A66B', '#11172A'],
      motifs: ['trono com águia no encosto', 'espada vertical na mão', 'cetro na outra', 'coroa com pequenas borboletas', 'figura de frente'],
      reading: [
        'A figura está voltada ao observador: o julgamento não se esconde.',
        'A águia no encosto é o símbolo do poder que vê de cima.',
        'A espada está erguida mas não em movimento: autoridade, não agressão.',
      ],
    },
    a11y: {
      alt: 'Carta Rei de Espadas: figura coroada sentada de frente num trono decorado com uma águia, segurando uma espada vertical e um cetro, com campo cultivado ao fundo.',
      long:
        'Interior aberto com campo atrás. Centro: figura de barba com coroa, túnica clara e manto, sentada em trono com águia de asas abertas no encosto e borboletas pequenas nos braços; espada na mão direita apontada para cima, cetro na esquerda. Moldura com o rótulo de rei de Espadas.',
    },
    sources: ['Waite – Pictorial Key', 'Golden Dawn – Fogo do Ar'],
  },
]
