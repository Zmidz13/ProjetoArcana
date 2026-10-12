import type { CardSource } from '../../../src/domain/types.ts'

/** Arcanos Maiores XI–XXI. */
export const MAJORS_B: CardSource[] = [
  {
    id: 'major-11-justice',
    arcana: 'major',
    suit: null,
    number: 11,
    rank: null,
    name: { pt: 'A Justiça', intl: 'Justice / Adjustment' },
    archetype: 'Equilíbrio que decide / consequência justa',
    element: 'air',
    astro: 'Balança',
    gdTitle: 'A Filha dos Senhores da Verdade — A Justiça',
    traditionNote: 'Caminho de Lamed (Geburah → Tiphareth). Numeração RWS: XI; em Marselha é VIII, trocada com A Força. Crowley chamou-lhe "Adjustment".',
    keywords: {
      upright: ['imparcialidade', 'causa e efeito', 'responsabilidade', 'contrato', 'correção', 'verdade provada'],
      reversed: ['desequilíbrio', 'sentença injusta', 'autoengano', 'impunidade', 'culpa desproporcionada'],
    },
    history:
      'Uma das virtudes cardiais da corte de Visconti, com espada e balança iguais às da iconografia jurídica do século XV, não do iluminismo. A espada é dupla: corta e protege. O véu fino ou ausente que cobre a figura nas versões posteriores sublinha que o julgamento não deveria depender de quem é julgado.',
    meanings: {
      upright:
        'As contas cobram-se e é bom. Esta carta favorece processos, perícias, auditorias, regularização, acordos e tudo o que se resolve com prova e regra bem aplicada. Indica que a decisão justa coincide com a tua maturidade: assume o que fizeste e exige o que te devem.',
      reversed:
        'Há desproporção entre o que se fez e o que se paga, ou entre o que se exige aos outros e o que se permite a si. Anuncia sentenças, avaliações ou cobrança em que a regra foi aplicada com viés — teu ou deles.',
    },
    psychology:
      'É a função de julgamento interno, o tribunal da psique que decide quanto de realidade se aceita. Em excesso produz autocrítica punitiva e perfeccionismo moral; em falta, incapacidade de reconhecer as próprias responsabilidades.',
    emotional:
      'Serenidade de quem não deve nada, ou rigidez fria. Em inversão, mágoa de injustiça antiga e raiva contida por culpa.',
    love:
      'Relações equilibradas em deveres e afetos, acordos claros, partilha justa de trabalho doméstico e emocional. Invertida: balança pendurada, quem dá e recebe em volumes incompatíveis, ou litígio.',
    career:
      'Excelente para concursos, recursos, contratos, compliance, revisão de processos e resolução de conflitos. Traz visibilidade a quem cumpre; penaliza atalhos.',
    finances:
      'Impostos, dívidas, heranças, partilhas e regularizações. Favorece quem organiza documentação e procura aconselhamento técnico; o resultado é proporcional ao rigor.',
    growth:
      'Aprender a pesar sem condenar, começando por si: aplicar aos próprios erros o mesmo critério justo que se aplica aos alheios.',
    spirituality:
      'A balança de Maat: pesagem do coração contra a pena. A dimensão é de verdade sem encenação, o que exige confessar a motivação real, não só o ato.',
    obstacles:
      'Exigir justiça para todos os lados menos para o próprio caso.',
    opportunities:
      'Reconhecimento formal e reparação — um direito que se consegue com papel bem feito.',
    advice: [
      'Reúne prova escrita antes de discutir: nesta fase o argumento sem registo perde.',
      'Aplica a ti o critério que propuseste ao outro.',
      'Se o processo está a correr mal, pede revisão ou mediação em vez de escalar.',
    ],
    reflection: [
      'Onde tenho sido injusto comigo mesmo para ser justo com os outros?',
      'Que consequência estou a recusar reconhecer?',
      'Prefiro ter razão ou resolver?',
    ],
    relations: [
      { card: 'major-08-strength', kind: 'complementa', note: 'Coragem e critério: uma sustenta a decisão, a outra não a deixa virar violência.' },
      { card: 'major-10-wheel', kind: 'reforca', note: 'Ciclo e balança: a sorte muda, o acerto chega.' },
      { card: 'major-15-devil', kind: 'tensao', note: 'Contrato e corrente: aquilo que se assina prende.' },
    ],
    art: {
      scene: 'justice-seated-with-scales',
      sky: 'day',
      terrain: 'interior',
      glyphs: ['scales-libra', 'sword-raised', 'greek-cross', 'curtain-arch', 'crown'],
      palette: ['#EFE6D6', '#C6A66B', '#11172A'],
      motifs: ['balança equilibrada', 'espada vertical', 'trono entre cortinados', 'cruz no peito', 'véu fino'],
      reading: [
        'A espada está na vertical, não em movimento: a pena está preparada, não aplicada.',
        'Os dois pratos da balança estão ao mesmo nível: não há vantagem estrutural.',
        'O cortinado atrás indica que o julgamento é público, não privado.',
        'A cruz pequena sobre o coração liga a regra à consciência.',
      ],
    },
    a11y: {
      alt: 'Carta A Justiça: figura sentada entre cortinados, segurando uma balança equilibrada numa mão e uma espada levantada na outra.',
      long:
        'Interior simétrico com dois panos de cortinado e um trono elevado ao centro. A figura tem manto claro e um pequeno símbolo de cruz no peito. Na mão direita, balança de dois pratos alinhados; na esquerda, espada erguida com ponta para cima. Luz uniforme, sem sombra de dramatismo. Moldura com o numeral XI.',
    },
    sources: ['Visconti – Virtù della Giustizia', 'Golden Dawn – Lamed e Balança', 'Crowley, Thoth – Adjustment'],
  },
  {
    id: 'major-12-hanged-man',
    arcana: 'major',
    suit: null,
    number: 12,
    rank: null,
    name: { pt: 'O Enforcado', intl: 'The Hanged Man' },
    archetype: 'Suspensão voluntária / inversão de perspectiva',
    element: 'water',
    astro: 'Neptuno (moderna); Água em suspensão',
    gdTitle: 'O Espírito das Águas Poderosas',
    traditionNote: 'Caminho de Mem (Binah → Tiphareth), as "águas superiores". O suplício do "pendo" era um suplício nórdico real, e a lenda de Odin na árvore está na origem da aura que Waite lhe desenhou.',
    keywords: {
      upright: ['pausa', 'sacrifício consentido', 'deslocação do ponto de vista', 'rendição', 'gestação invisível'],
      reversed: ['estagnação', 'sacrifício inútil', 'resistência', 'vitimização', 'paralisia'],
    },
    history:
      'Nas baralhas lombardas chamava-se "Il Prigioniero" ou "Pendo", e o desenho não era simbólico: representava um traidor enforcado, punição corrente em Milão. A inversão de sentido para sacrifício iniciático é obra do ocultismo romântico, que lhe acrescentou a expressão serena e o pé livre.',
    meanings: {
      upright:
        'O progresso pára de propósito. A carta descreve uma suspensão que não é castigo: ao parar, vês o que a pressa escondia. Favorável para esperar sem sofrer, para trocar de ângulo sobre um conflito e para o sacrifício que comprará algo maior mais tarde.',
      reversed:
        'Suspensão que se prolonga sem sentido, ou sacrifício oferecido a quem não o pediu. Indica também quem se queixa da espera enquanto recusa a única coisa que a tornaria útil.',
    },
    psychology:
      'É a capacidade de inibir a ação — função de espera — e de tolerar ambiguidade sem resolver prematuramente. Em sombra, torna-se a passividade moral: "não posso fazer nada" como defesa contra culpa, ou o gozo inconsciente da posição de vítima.',
    emotional:
      'Calma forçada, tristeza clara, alívio de ter largado. Em inversão, impaciência ressentida e ansiedade sem objeto.',
    love:
      'Relação em pausa ou em redefinição; pode indicar um amor que se sustenta à distância ou sem estatuto. O conselho é parar de tentar forçar o desfecho e observar o que se sente sem resposta.',
    career:
      'Projeto suspenso, obra travada por factores externos, formação interrompida. Use a espera para mudar de função, rever método ou negociar sem pressa.',
    finances:
      'Congelamento de investimento, dinheiro retido, obras paradas. Não vale a pena forçar desbloqueio; sim, rever o contrato e reduzir despesa durante a pausa.',
    growth:
      'Aceitar que há aprendizados só acessíveis a partir de uma posição desconfortável e voluntária, como ficar parado quando a reação pede movimento.',
    spirituality:
      'A inversão de pernas é a chave: o mundo visto de cabeça para baixo é o mesmo mundo, com outro centro. Prática de jejum de resultados.',
    obstacles:
      'Transformar pausa em pena, e sacrificar por hábito em vez de por escolha.',
    opportunities:
      'Uma inversão de ângulo que resolve o problema sem resolver nada: o conflito deixa de existir na forma antiga.',
    advice: [
      'Suspende uma decisão por dez dias e regista o que ela provoca na tua rotina.',
      'Descreve o problema do ponto de vista de quem discorda de ti, por escrito.',
      'Não renuncies a nada enquanto estiveres a fazê-lo para obter aplauso.',
    ],
    reflection: [
      'O que estou a tentar resolver com pressa que talvez só precise de espera?',
      'Este sacrifício foi escolhido ou herdado?',
      'A quem aproveita a minha imobilidade?',
    ],
    relations: [
      { card: 'major-13-death', kind: 'continuidade', note: 'Suspensão e corte: um prepara a morte simbólica, o outro executa-a.' },
      { card: 'major-17-star', kind: 'reforca', note: 'Pausa fértil seguida de cura: a espera que regenera.' },
      { card: 'major-07-chariot', kind: 'tensao', note: 'Parar e avançar em simultâneo: a contradição que a carta pede para sustentar.' },
    ],
    art: {
      scene: 'hanged-man-from-tree',
      sky: 'dusk',
      terrain: 'forest',
      glyphs: ['hanged-man', 'tree-living', 'aura-circle', 'legs-crossed', 'rope-knot'],
      palette: ['#11172A', '#56C5BD', '#EFE6D6'],
      motifs: ['figura suspensa por um tornozelo', 'braços atrás das costas', 'roda de luz na cabeça', 'rosto sereno', 'cruz de pernas'],
      reading: [
        'O tornozelo preso é o único ponto de contacto: o resto do corpo está livre.',
        'As mãos atrás das costas eliminam a ação — não há luta, há aceitação.',
        'A roda luminosa à cabeça não é glória, é lucidez adquirida.',
        'A roupa justaposta em duas cores mostra que as funções continuam separadas, sem confusão.',
      ],
    },
    a11y: {
      alt: 'Carta O Enforcado: figura suspensa de cabeça para baixo, presa por um tornozelo a uma trave de madeira, com as mãos atrás das costas e um círculo de luz em redor da cabeça.',
      long:
        'Cena crepuscular com árvore de tronco em T. Do braço horizontal pende uma corda presa ao tornozelo direito; a figura está invertida, pernas cruzadas, braços atrás, rosto calmo com halo dourado. Fundo de água escura parada. Moldura com o numeral XII.',
    },
    sources: ['Marseille – Le Pendu', 'Odin, Hávamál (sacrifício na árvore)', 'Golden Dawn – Mem, águas superiores'],
  },
  {
    id: 'major-13-death',
    arcana: 'major',
    suit: null,
    number: 13,
    rank: null,
    name: { pt: 'A Morte', intl: 'Death' },
    archetype: 'Transformação por subtração / fim estruturante',
    element: 'water',
    astro: 'Escorpião',
    gdTitle: 'A Filha da Grande Transmutação',
    traditionNote: 'Caminho de Nun (Malkuth → Tiphareth), "peixe": o que emerge das águas. Em Marselha é "La Mort" sem nome próprio, e na Sola-Busca aparece sem foice.',
    keywords: {
      upright: ['fim', 'desapego', 'transformação profunda', 'morte de uma identidade', 'irreversibilidade'],
      reversed: ['resistência ao fim', 'luto travado', 'agonia prolongada', 'negação', 'renascimento incompleto'],
    },
    history:
      'A "Morte" das baralhos viscontinos, sem foice, apenas um esqueleto com fouce: é a figura da peste e do "Triomphi" petrarquistas que vencem tudo. A leitura simbólica moderna separa-se do agouro em finais de Oitocentos, quando o occultismo de Papus transformou o arcano em passagem iniciática — morte do velho homem.',
    meanings: {
      upright:
        'Um capítulo termina e não voltará. A carta favorece cortes necessários (relação, função, cidade, hábito) e o luto útil por aquilo que era confortável. Não anuncia morte física: descreve perda que permite reorganizar a vida.',
      reversed:
        'A morte não cumpre-se porque resistes. Descreve separações prolongadas em pequenas mortes simbólicas, luto não feito, e apego a uma forma que já só existe por inércia. É o "já acabou" ainda não aceite.',
    },
    psychology:
      'É o confronto com o fim e com a própria continuidade: a função psíquica da metabolização da perda. Em sombra, a recusa da mudança gera o sintoma depressivo; por vezes, a repetição de finais incompletos nas mesmas condições.',
    emotional:
      'Dor com dignidade, alívio tardio, nostalgia anticipada; em inversão, torpor e ressentimento do que se foi.',
    love:
      'Fim de ciclo afectivo com clareza — ou transformação radical do vínculo em outra forma. Em inversão: separações interrompidas, retorno por saudade, não por decisão.',
    career:
      'Fim de contrato, de função, de empresa ou de profissão; excelente para fechar projeto e encerrar pendências, péssima para reanudar o que falhou.',
    finances:
      'Reestruturação de dívida, encerramento de despesa estrutural, venda de ativo improdutivo. Em inversão, sangria pequena prolongada.',
    growth:
      'Praticar a subtração: retirar em vez de acrescentar, e aprender a perder sem deixar de ser.',
    spirituality:
      'Mistério da morte iniciática: morrer para o nome antigo. A passagem é estreita porque não leva bagagem, não porque seja cruel.',
    obstacles:
      'Querer atravessar o portal sem deixar para trás a forma antiga — o atrito é a origem do sofrimento.',
    opportunities:
      'Libertação rápida de uma estrutura morta que consome energia de manutenção.',
    advice: [
      'Fecha uma pendência de verdade: cancelamento, rescisão, encerramento, não "depois vejo".',
      'Nomeia por escrito o que perdes com isto, para que o luto tenha objeto.',
      'Resiste ao impulso de reabrir o capítulo no primeiro dia de saudade.',
    ],
    reflection: [
      'O que já morreu na minha vida e continuo a alimentar?',
      'Que identidade estou a defender que já me não serve?',
      'Como eu quero ser lembrado desta fase?',
    ],
    relations: [
      { card: 'major-12-hanged-man', kind: 'continuidade', note: 'Suspensão e corte: a pausa torna o fim discernível.' },
      { card: 'major-21-world', kind: 'continuidade', note: 'O fim que fecha o ciclo permite o mundo novo: Morte e Mundo são as duas pontas da travessia.' },
      { card: 'major-15-devil', kind: 'reforca', note: 'A Morte desfaz as correntes que o Diabo prende.' },
    ],
    art: {
      scene: 'death-skeleton-with-banner',
      sky: 'underworld',
      terrain: 'path',
      glyphs: ['death-skeleton', 'scythe-blade', 'white-rose-shield', 'sun-half', 'bishop-kneeling', 'path-straight'],
      palette: ['#11172A', '#EFE6D6', '#C6A66B'],
      motifs: ['esqueleto com estandarte de rosa', 'dois altares com figuras ajoelhadas', 'nascer do sol entre duas torres', 'caminho direto', 'armadura caída'],
      reading: [
        'O estandarte tem uma rosa branca: o fim que se anuncia com flor, não com caveira.',
        'As figuras ajoelhadas — rei e sacerdote — mostram que a Morte não distingue estado.',
        'O sol nasce entre duas torres no fim do caminho: a passagem existe.',
        'A armadura abandonada no chão indica que o poder antigo não passou.',
      ],
    },
    a11y: {
      alt: 'Carta A Morte: esqueleto montado a cavalo que leva um estandarte com uma rosa branca, passando por figuras ajoelhadas, com um sol a nascer entre duas torres ao fundo.',
      long:
        'Cena escura com horizonte claro ao fundo. Centro: figura esquelética com armadura parcial, montada em cavalo branco, segurando um pendão com rosa de cinco pétalas. Primeiro plano, uma coroa caída e uma figura de capa ajoelhada. Ao fundo, o sol nascente entre duas torres baixas e um caminho recto. Moldura com o numeral XIII.',
    },
    sources: ['Petrarca, Trionfi', 'Marseille – La Mort', 'Golden Dawn – Nun e Escorpião'],
  },
  {
    id: 'major-14-temperance',
    arcana: 'major',
    suit: null,
    number: 14,
    rank: null,
    name: { pt: 'A Temperança', intl: 'Temperance / Art' },
    archetype: 'Alquimia da medida / mistura que cura',
    element: 'fire',
    astro: 'Sagitário',
    gdTitle: 'A Filha dos Reconciliadores — a Arte',
    traditionNote: 'Caminho de Samekh (Tiphareth → Netzach), o "arco" que une. Crowley associou-a a Artemis de Éfeso e ao fogo que tempera.',
    keywords: {
      upright: ['moderação', 'cura progressiva', 'dose certa', 'conciliação', 'paciência ativa'],
      reversed: ['excesso', 'descompasso', 'pressa', 'mistura errada', 'recuperação interrompida'],
    },
    history:
      'Nas baralhas italianas, "Temperanza" é uma das virtudes cardeais teologais, derramando água entre dois vasos desde cedo — gesto de partilha e mistura que a moral cristã herdou da farmacologia árabe. A estrela de cinco pontas na testa e o pé na água foram acrescentados por Waite, sublinhando a dimensão alquímica e o equilíbrio entre margens.',
    meanings: {
      upright:
        'A solução é a dose, não o gesto. Esta carta favorece recuperação, reconciliação, tratamento gradual e todo o processo em que a mistura de dois elementos produz terceiro. Anuncia alívio, desde que se mantenha o ritmo.',
      reversed:
        'Descompasso de dosagem: excesso de empenho, excesso de confiança, ou interrupção de tratamento a meio. Também descreve a incapacidade de conciliar duas coisas que na verdade exigem alternância, não simultaneidade.',
    },
    psychology:
      'É a função de regulação: o eu que dosifica afetos em vez de os suprimir. Jung via na temperança a coniunctio — o terceiro que surge da relação entre opostos. Em sombra, é anestesia confundida com equilíbrio.',
    emotional:
      'Serenidade ativa, afecto sem urgência, perdão gradual; em inversão, oscilação entre frieza e excesso.',
    love:
      'Reconciliação possível, relação que melhora com ritmo e partilha de tarefas, amor que se ajusta em vez de arder. Em inversão: descompasso de necessidades ou promessas desmedidas.',
    career:
      'Trabalho de articulação: gestão de conflitos, coordenação entre departamentos, tratamento de processos longos, diplomacia. O progresso é lento e consistente; a pressa é o único risco sério.',
    finances:
      'Fase de regularização gradual: plano de amortização, orçamento moderado, alívio de dívida. Não funciona aqui o golpe de asa.',
    growth:
      'Aprender a dose: o treino que cura é o que se pode manter. Temperança é a virtude da sustentabilidade pessoal.',
    spirituality:
      'O anjo com um pé em cada margem é a via média: nem fuga do mundo nem imersão nele. Alquimia interior pela mistura de contrário com medida.',
    obstacles:
      'Querer resultados imediatos de um processo lento, e desistir no meio do ciclo em que já havia progresso.',
    opportunities:
      'Um acordo ou tratamento que reconcilia duas partes, duas necessidades ou dois projetos em conflito.',
    advice: [
      'Reduce a intensidade 20% e aumenta a frequência: é assim que este arcano trabalha.',
      'Num conflito, propõe o que junta os dois lados, não o que resolve o teu.',
      'Retoma o que interrompeste, mas com ritmo realista.',
    ],
    reflection: [
      'Onde tenho excesso que chamo de dedicação?',
      'Que mistura estou a tentar evitar na minha vida?',
      'Se continuar neste ritmo, onde estarei em três meses?',
    ],
    relations: [
      { card: 'major-11-justice', kind: 'reforca', note: 'Medida e balança: a cura que respeita proporção.' },
      { card: 'major-17-star', kind: 'continuidade', note: 'Depois de temperar, regenerar: dois ciclos de água em série.' },
      { card: 'major-16-tower', kind: 'tensao', note: 'A temperança desfaz o que a torre parte — e vice-versa.' },
    ],
    art: {
      scene: 'angel-pouring-between-two-vessels',
      sky: 'dawn',
      terrain: 'water',
      glyphs: ['water-jar', 'urn', 'star-five', 'path-straight', 'sun-rays', 'lotus'],
      palette: ['#56C5BD', '#EFE6D6', '#C6A66B'],
      motifs: ['anjo com dois vasos', 'fio de água em arco', 'um pé na água e outro na terra', 'estrela na testa', 'caminho até montanha'],
      reading: [
        'A água passa de um vaso ao outro sem cair: transmissão, não desperdício.',
        'Um pé na terra, outro no rio: duas margens ocupadas ao mesmo tempo.',
        'A estrela de cinco pontas na testa indica a quinta essência, o produto da mistura.',
        'O caminho que sobe à montanha mostra que a temperança é etapa, não repouso final.',
      ],
    },
    a11y: {
      alt: 'Carta A Temperança: anjo com um pé na água e outro na terra, a verter um fio de líquido entre dois jarros, com uma estrela na testa e uma montanha ao fundo.',
      long:
        'Paisagem de amanhecer com rio pouco profundo e montanha ao fundo com pequeno sendero. Centro: figura alada de túnica clara com um peito estrelado, corpo inclinado, dois jarros — um acima, um abaixo — unidos por um fio de água em arco. Primeiro plano, juncos. Moldura com o numeral XIV.',
    },
    sources: ['Marseille – Temperance', 'Golden Dawn – Samekh, Sagitário', 'Jung, Mysterium Coniunctionis'],
  },
  {
    id: 'major-15-devil',
    arcana: 'major',
    suit: null,
    number: 15,
    rank: null,
    name: { pt: 'O Diabo', intl: 'The Devil' },
    archetype: 'Amarração e sombra / o que se aceita sem ver',
    element: 'earth',
    astro: 'Capricórnio',
    gdTitle: 'O Diabo do Portal dos Mistérios da Lua',
    traditionNote: 'Caminho de Ayin (Malkuth → Yesod, o "olho" vazio). Waite desenhou a corrente frouxa de propósito: as duas figuras podem tirá-la quando quiserem.',
    keywords: {
      upright: ['vinculo que aprisiona', 'dependência', 'tentação', 'contrato lesivo', 'sombra projectada', 'ganho por submissão'],
      reversed: ['ruptura de dependência', 'reconhecimento da armadilha', 'libertação', 'negação do apetite'],
    },
    history:
      'Nas baralhas italianas é um demónio alado e bestial que arrasta dois pequenos diabinhos numa corrente — ilustração moral do inferno, sem ambiguidade. A inversão moderna vem do século XIX: Eliphas Lévi leu no bode o signo do sabá e da energia vital mal empregue, leitura que Waite adoptou mas suavizou com correntes soltas.',
    meanings: {
      upright:
        'Há um vínculo que funciona contra ti e mesmo assim é recusado libertá-lo. A carta nomeia dependências, dívidas que prendem, acordos vantajosos mas caros, e pactos com a própria sombra — o que se faz sabendo que não se devia. Mostra também a parte de prazer no vínculo.',
      reversed:
        'A corrente começa a ceder: toma-se consciência do acordo lesivo e inicia-se a saída. Pode indicar recaída — quando a libertação é anunciada mas não executada — ou a descoberta de que a culpa foi atribuída a uma entidade externa.',
    },
    psychology:
      'É a sombra em modo contratual: o que se reprime volta como compulsão. Jung descreveria o Diabo como complexo autónomo com o qual o ego fez pacto — prazer e dor partilhados. O trabalho é retirar a projeção e nomear o apetite.',
    emotional:
      'Fixação, ciúme, intensidade com culpa; em inversão, vergonha de desejar e alívio ao nomear.',
    love:
      'Relação de dependência, sexo como substituto de conversa, vínculo intenso com componente de controlo. Em inversão: saída de relação asfixiante, ou confronto com o que se aceita por medo de estar só.',
    career:
      'Cuidado com o emprego que paga bem e cobra caro (horas, reputação, lealdade cega). Também indica negociação em que se aceita cláusula desfavorável por pressa ou apetite.',
    finances:
      'Juros, créditos revolving, apostas, consumo compulsivo e despesas que financiam dependência. A carta raramente indica falta de dinheiro; indica falta de liberdade sobre ele.',
    growth:
      'Olhar para o pacto: o que é que troco por segurança, e que nome dou a isso quando ninguém pergunta?',
    spirituality:
      'O materialismo não como pecado, mas como esquecimento: o Diabo prende pela negação do corpo, não pela sua celebração.',
    obstacles:
      'Não ver a corrente — ou vê-la e continuar, porque o vínculo também dá gozo.',
    opportunities:
      'Um reconhecimento: descobrir que a amarração é frouxa e depende apenas da tua recusa em sair.',
    advice: [
      'Identifica o vínculo e escreve o que ganhas com ele — sem essa resposta, não se sai.',
      'Reescreve a cláusula que aceitas há tempo demais.',
      'Se é dependência de substância ou comportamento, pede avaliação profissional: esta carta não se resolve sozinho.',
    ],
    reflection: [
      'Que corrente tenho nas mãos e finjo não ver?',
      'O que recebo deste vínculo que não quero admitir?',
      'Onde o meu apetite virou contrato?',
    ],
    relations: [
      { card: 'major-16-tower', kind: 'continuidade', note: 'A torre é a rutura deste pacto: a libertação quando ela não vem por decisão.' },
      { card: 'major-08-strength', kind: 'complementa', note: 'A Força domestica o animal; o Diabo deixa-o governar.' },
      { card: 'major-01-magician', kind: 'tensao', note: 'O mesmo poder de vincular, em intenção clara ou em ocultação.' },
    ],
    art: {
      scene: 'devil-throne-with-two-bound-figures',
      sky: 'underworld',
      terrain: 'cave',
      glyphs: ['devil-horned', 'chain-broken', 'twin-faces', 'torch-low', 'cage-frame'],
      palette: ['#4A1F39', '#C6A66B', '#11172A'],
      motifs: ['figura cornuda alada', 'dois pequenos acorrentados', 'correntes frouxas', 'archote invertido', 'trono de pedra'],
      reading: [
        'As correntes não estão fechadas: as duas figuras podem retirá-las sem licença.',
        'O archote invertido do ser alado indica fogo que não aquece, apenas queima.',
        'Os dois acorrentados têm asas que ainda não usaram.',
        'O tronco do ser no trono é de pedra escura: poder que se tornou peso.',
      ],
    },
    a11y: {
      alt: 'Carta O Diabo: figura alada com chifres e cauda, de pé sobre um trono de pedra, com dois seres acorrentados por correntes frouxas aos seus pés.',
      long:
        'Caverna escura com fundo de pedra. Centro: figura com corpo humanoide, chifres curvos, asas de morcego, cauda e um archote invertido na mão levantada; sobre um pedestal rectangular. Ao primeiro plano, dois pequenos corpos alados nus, unidos por uma corrente ao pescoço, solta na base. Moldura com o numeral XV.',
    },
    sources: ['Marseille – Le Diable', 'Lévi, Dogme et Rituel', 'Waite – corrente frouxa'],
  },
  {
    id: 'major-16-tower',
    arcana: 'major',
    suit: null,
    number: 16,
    rank: null,
    name: { pt: 'A Torre', intl: 'The Tower / The House of God' },
    archetype: 'Rutura inevitável / verdade que demole',
    element: 'fire',
    astro: 'Marte',
    gdTitle: 'A Torre do Estrela do Mestre do Trovão',
    traditionNote: 'Caminho de Peh (Yesod → Malkuth), a "boca" que fala. Em Marselha é "La Maison Dieu": a casa de Deus, não a torre do capricho.',
    keywords: {
      upright: ['rutura', 'revelação súbita', 'fim do que estava mal assente', 'crise', 'libertação violenta'],
      reversed: ['crise adiada', 'resistência ao inevitável', 'catástrofe evitada', 'trauma não elaborado', 'reconstrução sem fundamento'],
    },
    history:
      'A carta italiana era a torre flamejante atingida por um raio, com dois homens a cair, provavelmente uma evocação do episódio da Torre Comunal de Bolonha. A designação francesa "La Maison Dieu" sugere leitura bíblica (Babel, o templo rasgado). Papus transformou-a no símbolo do colapso necessário do edifício conceitual.',
    meanings: {
      upright:
        'Aquilo em que estavas a apoiar-se já não sustenta, e a queda é melhor que a ruína prolongada. A carta descreve rutura súbita — demissão, diagnóstico, fim, revelação — que destrói uma estrutura falsa e abre espaço para algo com fundação. Não é castigo: é demolição controlada do insustentável.',
      reversed:
        'Ou a torre treme e ninguém sai, ou já caiu e ainda não se reconstruiu. Indica crise que se prolonga por recusa de ver, dano a ser reparado ao contrário, e a repetição do mesmo erro por quem preferiu a reconstrução à demolição.',
    },
    psychology:
      'O momento em que a construção do ego se revela frágil: trauma, desorganização, e — bem trabalhado — a reestruturação com base mais realista. Em sombra, a negação: reforçar o andaime em vez de refazer o alicerce.',
    emotional:
      'Choque, medo, desorientação e — depois — alívio. Em inversão, pânico contido e irritação.',
    love:
      'Rutura inesperada ou revelação que reorganiza o vínculo; quando as duas pessoas aceitam a demolição, pode nascer relação mais honesta. Em inversão: viver com o que já se partiu.',
    career:
      'Encerramento de empresa, reestruturação, demissão, perda de projeto, mudança forçada. É das melhores cartas para quem estava preso numa estrutura podre e péssima para quem construiu com cuidado.',
    finances:
      'Choque orçamental, prejuízo súbito, imprevisto grande. Favorável a cortar despesa estrutural e a rever garantias antes de comprar seguro depois do incêndio.',
    growth:
      'Reconhecer as crenças que sustentam a vida por hábito e deixar que a experiência as demula; a reconstrução vem depois, e é mais leve.',
    spirituality:
      'A linguagem religiosa da ruptura: o véu do templo rasga-se de cima para baixo. A carta representa a experiência que desmonta as categorias.',
    obstacles:
      'Aguardar que o colapso seja evitável para mudar alguma coisa.',
    opportunities:
      'Fim de um risco acumulado, com libertação de recursos presos e clareza imediata sobre o que é estrutural.',
    advice: [
      'Retira as pessoas e o essencial da estrutura antes que ela decida por ti.',
      'Depois do choque, espera: não reedifiques em cima dos escombros na mesma semana.',
      'Escreve o que é realmente inegociável para ti nesta rutura, para não perderes o resto.',
    ],
    reflection: [
      'Que construção minha já está a ser demolida por dentro enquanto a mantenho por fora?',
      'Do que é que tenho medo de perder se deixar cair isto?',
      'O que é que esta ruína me permite finalmente fazer?',
    ],
    relations: [
      { card: 'major-15-devil', kind: 'continuidade', note: 'A corrente quebra-se onde a torre cai.' },
      { card: 'major-13-death', kind: 'reforca', note: 'Rutura e fim: dupla de transformação sem retorno.' },
      { card: 'major-04-emperor', kind: 'tensao', note: 'O trono resiste, a torre demole: a queda do poder que recusou mudar.' },
    ],
    art: {
      scene: 'tower-struck-by-lightning',
      sky: 'storm',
      terrain: 'mountain',
      glyphs: ['tower-broken', 'lightning-bolt', 'crown-falling', 'figure-falling', 'flame-three'],
      palette: ['#4A1F39', '#C6A66B', '#11172A'],
      motifs: ['torre isolada no rochedo', 'raio no topo', 'coroa a cair', 'duas figuras em queda', 'portão aberto'],
      reading: [
        'A torre é estreita e alta demais: construída para ser vista, não para durar.',
        'O raio não incendeia o whole edifício: remove apenas a coroa e o topo.',
        'As figuras caem sem gritar — o corpo aceita o que a mente ainda contesta.',
        'As chamas de fundo não consomem o vale: o dano é localizado.',
      ],
    },
    a11y: {
      alt: 'Carta A Torre: torre alta no topo de um rochedo, partida por um raio no topo, com duas figuras a cair e uma coroa a desprender-se.',
      long:
        'Céu escuro de tempestade com fogo baixo. Centro-direita, torre isolada sobre rocha; no topo, uma coroa circular levantada por um raio em ziguezague, a porta da torre aberta. Da torre caem duas figuras de braços abertos, uma de cabeça para baixo. Moldura com o numeral XVI.',
    },
    sources: ['Marseille – La Maison Dieu', 'Papus, Le Tarot des Bohémiens', 'Golden Dawn – Peh, Marte'],
  },
  {
    id: 'major-17-star',
    arcana: 'major',
    suit: null,
    number: 17,
    rank: null,
    name: { pt: 'A Estrela', intl: 'The Star' },
    archetype: 'Reparação / esperança com método',
    element: 'air',
    astro: 'Aquário',
    gdTitle: 'A Filha da Chama Estelar',
    traditionNote: 'Caminho de Tzaddi (Hod → Yesod), o "pescador". Depois da Torre, a carta é tradicionalmente lida como cura e orientação, sem euforia.',
    keywords: {
      upright: ['esperança lúcida', 'cura', 'inspiração', 'generosidade', 'reconexão', 'guia'],
      reversed: ['desânimo', 'fé ingenua', 'isolamento afetivo', 'recusa de ajuda', 'inspiração bloqueada'],
    },
    history:
      'No Tarot de Marselha, a "Etoile" é uma mulher nua junto a um tanque, a verter água, com oito estrelas acima. Waite acrescentou a ave sobre a árvore e a pedra nojosa, reforçando a leitura de exposição sem vergonha — a nudez como ausência de máscara, não como sensualidade.',
    meanings: {
      upright:
        'Depois do estrago, o reparo. A Estrela é a carta de convalescença e de orientação por referência fixa: o que queres volta a ser visível. Favorece partilha generosa do que sabes, trabalho artístico, e pedidos de ajuda específicos. A esperança aqui é prática: um gesto pequeno por dia na direção certa.',
      reversed:
        'A esperança virou substituto da ação, ou o desânimo fechou a torneira. Indica falta de confiança no próprio valor, dificuldade em receber apoio, e inspiração seca por excesso de exigência.',
    },
    psychology:
      'É a função de esperança realista — a capacidade de manter uma representação do futuro desejável enquanto o presente é difícil. Em boa leitura, reorganiza a motivação depois do choque; em sombra, torna-se a defesa otimista que impede de ver o que dói, adiando o confronto com os factos.',
    emotional:
      'Tranquilidade, ternura, gratidão. Em inversão, desalento suave, solidão sem luto e dificuldade em deixar entrar afeto.',
    love:
      'Reencontro pacificado, reconciliação sem drama, atração serena; é das melhores cartas para curar vínculo depois de rutura. Em inversão: idealização do outro, ou distância emocional.',
    career:
      'Reconhecimento silencioso, projeto com sentido, boa fase para criar e para mostrar trabalho. Favorece colaboração e mentoria; pede que partilhes método, não só resultado.',
    finances:
      'Alívio e regularização com horizonte: plano de recuperação, mesada equilibrada, donativos. Não é carta de riqueza súbita, mas de suficiente.',
    growth:
      'Prática da exposição honesta: mostrar-se sem armadura, pedir o que se precisa e aceitar que a água vertida volta.',
    spirituality:
      'A estrela como guia — não como promessa. A nudez é verdade sem performance; os dois jarros são equilíbrio entre dar e receber.',
    obstacles:
      'Esperar que a cura seja um estado e não uma rotina.',
    opportunities:
      'Um apoio inesperado e concreto (recomendação, bolsa, pessoa, ideia) que reabre o que estava seco.',
    advice: [
      'Escolhe um gesto pequeno e repetível por dia em favor do teu objetivo.',
      'Pede ajuda concreta a uma pessoa concreta — hoje.',
      'Mostra uma parte do teu trabalho antes de estar perfeito.',
    ],
    reflection: [
      'O que eu quero que volte a ser visível?',
      'Consigo receber o que me oferecem?',
      'Que esperança estou a usar para não agir?',
    ],
    relations: [
      { card: 'major-16-tower', kind: 'continuidade', note: 'A demolição abre o espaço onde a estrela se vê.' },
      { card: 'major-02-high-priestess', kind: 'reforca', note: 'Duas cartas de confiança silenciosa: intcrição e esperança.' },
      { card: 'major-18-moon', kind: 'complementa', note: 'Estrela e lua: orientação e maré, a visão fixa e o ritmo mutável.' },
    ],
    art: {
      scene: 'nude-woman-pouring-to-pool-under-star',
      sky: 'night',
      terrain: 'water',
      glyphs: ['star-eight', 'water-jar', 'ibis-moon', 'heron-on-tree', 'pool-reflection'],
      palette: ['#11172A', '#56C5BD', '#EFE6D6'],
      motifs: ['oito estrelas', 'mulher ajoelhada', 'dois jarros', 'tanque com reflexo', 'ave na árvore'],
      reading: [
        'A água entra e sai do mesmo tanque: a cura é circuito fechado que ainda assim transborda.',
        'Um pé na erva, outro na água: consciente e inconsciente ocupados simultaneamente.',
        'A grande estrela de oito pontas é a única fixa: as outras sete são secundárias.',
        'A nudez sem pose indica exposição sem performance.',
      ],
    },
    a11y: {
      alt: 'Carta A Estrela: mulher ajoelhada junto a um tanque, a verter água de dois jarros, sob uma grande estrela de oito pontas rodeada de outras estrelas.',
      long:
        'Céu noturno azul-escuro com estrela central de oito pontas e sete menores. Centro: figura ajoelhada, um joelho na relva e um pé dentro de água, dois jarros inclinados — um despeja sobre o tanque, outro sobre a terra. Ao fundo, árvore alta com uma ave no topo; reflexo das estrelas na água. Moldura com o numeral XVII.',
    },
    sources: ['Marseille – Etoile', 'Waite – Pictorial Key', 'Golden Dawn – Tzaddi e Aquário'],
  },
  {
    id: 'major-18-moon',
    arcana: 'major',
    suit: null,
    number: 18,
    rank: null,
    name: { pt: 'A Lua', intl: 'The Moon' },
    archetype: 'Travessia do ambíguo / imaginação e medo',
    element: 'water',
    astro: 'Peixes',
    gdTitle: 'O Regente dos Portais da Visão',
    traditionNote: 'Caminho de Qoph (Netzach → Malkuth), a "nuca": o ponto onde a luz se vê por trás. Carta das águas e do limiar noturno.',
    keywords: {
      upright: ['ambiguidade', 'medo sem nome', 'sonho', 'intuição perturbada', 'ilusão', 'travessia noturna'],
      reversed: ['clareamento', 'medo ultrapassado', 'fim da ilusão', 'repressão de afetos', 'confusão mental'],
    },
    history:
      'O "Luna" das baralhas italianas já traz os dois cães, o gajo e a torre; a iconografia vem de ciclos medievais sobre o poder lunar sobre os animais e os viajantes nocturnos. Waite acrescentou o escorpião e a lagosta que saem do tanque, inventando a imagem clássica do que sobe do inconsciente.',
    meanings: {
      upright:
        'Estás a andar no escuro e é preciso atravessar. A Lua descreve o período em que a informação é insuficiente, os sinais são ambíguos e o medo enche o intervalo. Pode anunciar engano, omissão ou simples projeção tua. Não é carta de verdade oculta; é carta de visibilidade limitada.',
      reversed:
        'A névoa levanta: descobre-se o que estava a ser escondido ou inventado. Indica clareamento, mas também o risco de reprimir o que a lua mostrou, e de tratar como imaginação aquilo que era aviso legítimo.',
    },
    psychology:
      'É o encontro com o material inconsciente que não está integrado: medo difuso, fantasia, sonhos recorrentes. Em boa leitura, a imaginação como função de conhecimento; em sombra, a dissociação e a confusão entre intuição e ansiedade.',
    emotional:
      'Inquietação, nostalgia, sensibilidade à flor da pele, afectos ambivalentes. Em inversão, vergonha do que se sentiu.',
    love:
      'Relação com idealização, ciúme, dúvidas e silêncio — não necessariamente traição. Em inversão: confissão, fim da suspeita ou clareamento de um segredo.',
    career:
      'Informação incompleta, burocracia nebulosa, promessas vagas. Não assine nem decida à noite; exige por escrito e espera que a maré baixe.',
    finances:
      'Cuidado com letras pequenas, empréstimos confusos, gastos nocturnos, e dinheiro emprestado que não volta. Aposta em liquidez durante esta fase.',
    growth:
      'Distinguir medo de intuição: escrever o que receia, escrever o que observa, e confrontar as duas listas de manhã.',
    spirituality:
      'A travessia noturna é prova obrigatória: nenhuma iniciação dispensa a zona sem mapa. Os trabalhos oníricos são prática recomendada.',
    obstacles:
      'Decidir com base no que a imaginação acrescentou ao facto.',
    opportunities:
      'Um sonho, um acaso ou uma conversa que traz o dado em falta — desde que se escreva de manhã.',
    advice: [
      'Não concluas nada esta noite: anota e dorme em cima.',
      'Pede um facto verificável sobre aquilo que te preocupa.',
      'Regista os sonhos por uma semana; o padrão vai dar-te a peça que falta.',
    ],
    reflection: [
      'Isto é o que sei, ou é o que a minha imaginação montou?',
      'De que é que tenho medo exactamente?',
      'O que é que ando a evitar olhar porque é mais fácil não perceber?',
    ],
    relations: [
      { card: 'major-17-star', kind: 'complementa', note: 'Estrela e Lua: referência fixa e maré; uma orienta, a outra engana e revela.' },
      { card: 'major-02-high-priestess', kind: 'sombra', note: 'A mesma água: intuição lúcida ou projectada.' },
      { card: 'major-09-hermit', kind: 'reforca', note: 'Travessia nocturna com pouca luz: retiro e lua formam o par do retiro interior.' },
    ],
    art: {
      scene: 'moon-over-pool-with-dog-and-wolf',
      sky: 'night',
      terrain: 'water',
      glyphs: ['moon-pool', 'dog-howl', 'crayfish', 'tower-intact', 'path-winding', 'water-lily'],
      palette: ['#11172A', '#EFE6D6', '#56C5BD'],
      motifs: ['lua com rosto', 'cão e lobo a uivar', 'escada do tanque', 'lagosta a sair', 'dois torres baixas'],
      reading: [
        'A lua não ilumina o caminho inteiro: ilumina a beira da água.',
        'Cão e lobo uivam à mesma lua: instinto doméstico e instinto selvagem, o mesmo sinal.',
        'Do tanque sai um crustáceo, não um monstro: o medo é pequeno, apenas antigo.',
        'A estrada entre as duas torres vai para dentro, não para o alto.',
      ],
    },
    a11y: {
      alt: 'Carta A Lua: lua crescente com rosto humano sobre um tanque de onde emerge um crustáceo, com um cão e um lobo a uivar, e duas torres ladeando um caminho que se afasta.',
      long:
        'Céu noturno com lua cheia-face voltada ao observador. Centro: tanque de água escura com escada de pedra na margem esquerda, lagosta a emergir. De cada lado, um cão e um lobo em uivo. Ao fundo, duas torres baixas e um caminho sinuoso entre elas. Lírios de água na margem. Moldura com o numeral XVIII.',
    },
    sources: ['Marseille – La Lune', 'Waite – lagosta e escorpião', 'Golden Dawn – Qoph, Peixes'],
  },
  {
    id: 'major-19-sun',
    arcana: 'major',
    suit: null,
    number: 19,
    rank: null,
    name: { pt: 'O Sol', intl: 'The Sun' },
    archetype: 'Claridade / alegria sem culpa',
    element: 'fire',
    astro: 'Sol',
    gdTitle: 'Horus do Oriente — o Sol',
    traditionNote: 'Caminho de Resh (Tiphareth → Hod), a "cabeça". O Sol é a única carta do Tarot cujo significado é consensualmente positivo desde as fontes italianas.',
    keywords: {
      upright: ['clareza', 'sucesso simples', 'vitalidade', 'revelação favorável', 'criança interior', 'generosidade'],
      reversed: ['excesso de exposição', 'otimismo ingenuo', 'fadiga', 'alegria contida', 'demora do reconhecimento'],
    },
    history:
      'No Tarot Visconti, o Sol aparece como disco radiante com duas figuras sob um manto, talvez uma alegoria do amor iluminado. Marselha fixou a criança sobre cavalo branco com dois girassóis, e Waite simplificou o muro de tijolo — leitura de infância, sucesso e verdade pública que se manteve até hoje.',
    meanings: {
      upright:
        'As coisas ficam visíveis, e a teu favor. O Sol traz clarificação, resultado reconhecido, energia disponível e alegria sem subterfúgio. Favorece o que precisa de ser visto: apresentação, publicação, anúncio, reconciliação à luz do dia.',
      reversed:
        'O sol não se apaga: fica atrás de uma nuvem. Indica reconhecimento adiado, excesso de exposição, entusiasmo que não se sustenta, e cansaço de quem está sempre em palco.',
    },
    psychology:
      'É a função solar do Self: integração, transparência, aceitação do que se é à luz. Em sombra, a exigência de estar bem sempre, que esconde a fadiga sob desempenho positivo.',
    emotional:
      'Alegria expandida, gratidão, afecto sem defesa; em inversão, irritação com a própria felicidade, ou cansaço.',
    love:
      'Relação sem sombras: sinceridade, projectos, festa, crianças. Em inversão: exposição mediática da relação, ou alegria prometida que se adia.',
    career:
      'Reconhecimento, sucesso de apresentação, contrato fechado, publicação, promoção. Boa fase para assumir visibilidade e para liderar com transparência.',
    finances:
      'Melhoria real, rendimentos a crescer, condição favorável para negociação e investimento de longo prazo. Evita gastar em celebração o que já estava reservado.',
    growth:
      'Autorizar-se a usufruir: o Sol exige que o resultado seja saboreado, não imediatamente reinvestido em nova meta.',
    spirituality:
      'Tiphareth, o Sol do Tarot: o centro harmonizador. Prática de gratidão e de bênção quotidiana, sem culpa pelo prazer.',
    obstacles:
      'Transformar bem-estar em exigência: a obrigação de estar sempre contente.',
    opportunities:
      'Um reconhecimento público que resolve por exposição aquilo que a insistência não resolveu.',
    advice: [
      'Mostra o resultado hoje, em claro, sem esperar por condições perfeitas.',
      'Reserva uma parte do ganho antes de a reinvestir ou celebrar.',
      'Pratica receber elogio sem desviar o assunto.',
    ],
    reflection: [
      'O que estou pronto a mostrar e continuo a guardar?',
      'Permito-me alegria ou só a admito quando produtividade vem com ela?',
      'Que sombra o meu brilho está a esconder?',
    ],
    relations: [
      { card: 'major-18-moon', kind: 'complementa', note: 'Sol e Lua, clareamento e ambiguidade, na mesma série de águas e luz.' },
      { card: 'major-17-star', kind: 'reforca', note: 'Cura que se torna visível: estrela e sol em sequência favorável.' },
      { card: 'major-00-fool', kind: 'espelho', note: 'A criança do Sol e o Louco: mesma espontaneidade, com resultado.' },
    ],
    art: {
      scene: 'child-on-white-horse-before-sunflowers',
      sky: 'day',
      terrain: 'garden',
      glyphs: ['sun-disc', 'sunflower', 'child-naked', 'wall-brick', 'white-horse', 'banner-red'],
      palette: ['#C6A66B', '#EFE6D6', '#4A1F39'],
      motifs: ['disco solar radiante', 'criança em cavalo branco', 'dois girassóis', 'muro de tijolo baixo', 'estandarte vermelho'],
      reading: [
        'A criança cavalga sozinha mas é pequena demais para as rédeas: confiança, não controlo.',
        'O muro baixo delimita sem fechar — há segurança sem prisão.',
        'Os dois girassóis viram-se ao sol: vida orientada por fonte de luz clara.',
        'O estandarte vermelho é afirmação sem agressão: alegria que se declara.',
      ],
    },
    a11y: {
      alt: 'Carta O Sol: criança nua de braços abertos montada num cavalo branco diante de um muro de tijolo, com dois girassóis junto ao muro e um grande sol radiante no topo.',
      long:
        'Composição luminosa. No topo, disco solar com rosto e raios alternados. Centro: figura infantil sobre cavalo branco de frente, braços abertos, sem vestuário, com estandarte pequeno. Primeiro plano, muro baixo de tijolo e dois girassóis grandes à esquerda. Fundo de campo aberto. Moldura com o numeral XIX.',
    },
    sources: ['Visconti – Sole', 'Marseille – Le Soleil', 'Golden Dawn – Resh, Tiphareth'],
  },
  {
    id: 'major-20-judgement',
    arcana: 'major',
    suit: null,
    number: 20,
    rank: null,
    name: { pt: 'O Julgamento', intl: 'Judgement / The Aeon' },
    archetype: 'Chamado / renascimento por avaliação',
    element: 'fire',
    astro: 'Plutão (moderna); fogo de Escorpião em algumas tradições',
    gdTitle: 'O Grande Eon',
    traditionNote: 'Caminho de Shin (Yesod → Malkuth e Netzach → Hod, variantes). Crowley rebaptizou-a "O Eon", a passagem de um aeon a outro.',
    keywords: {
      upright: ['convocação', 'absolvição', 'reavaliação', 'vocação', 'renascimento', 'fim de ciclo com clareza'],
      reversed: ['autocritica punitiva', 'recusa do chamado', 'decisão adiada', 'culpa não resolvida', 'repetição de sentença'],
    },
    history:
      'O "Iudicium" das baralhas cristãs representa a trombeta do arcanjo sobre túmulos abertos, com figuras nuas a emergir — iconografia do Juízo Final pintada em capelas alpinas do século XV, como na de Saint-Bernard de Menthon. A leitura psicológica moderna transformou o juízo divino em autoavaliação.',
    meanings: {
      upright:
        'É hora de fazer contas e responder ao chamado. Esta carta traz avaliação de percurso, perdão — recebido e concedido —, retoma de projecto abandonado e a passagem para uma fase com critérios novos. Indica que o passado é recurso, não sentença.',
      reversed:
        'O julgamento fica por dentro: culpa repetida sem absolvição, adiamento de decisão que a pessoa já sabe, ou avaliação externa feita com critério injusto. Também pode ser o chamado reconhecido e recusado.',
    },
    psychology:
      'A função de reavaliação de valores: a psique a convocar o que foi enterrado para ser integrado. Em sombra, o superego acusador que prolonga o julgamento sem conceder a absolvição — mecanismo típico de ruminação moral.',
    emotional:
      'Comoção, alívio profundo, culpa que se dissolve; em inversão, peso e vergonha recorrente.',
    love:
      'Reatar com clareza, reconciliação com perdão efectivo, ou a decisão de sair definitivamente. Em inversão: voltar por culpa, não por escolha.',
    career:
      'Avaliação de desempenho, concurso, vestibular, defesa, promoção por mérito acumulado. Excelente para retomar projecto antigo com critério novo e para responder a um convite.',
    finances:
      'Revisão de contas, regularização, heranças e reavaliação de prioridades de consumo. Fase de fechar contas com o passado para parar de pagar juros sobre ele.',
    growth:
      'Praticar absolvição: reconhecer o erro, pagar o que há a pagar, e parar de repetir o julgamento para além do que resolve.',
    spirituality:
      'A trombeta que desperta o que dorme: vocação como chamado e não como carreira. O ritual associado é o da revisão de vida.',
    obstacles:
      'Confundir culpa com responsabilidade e adiar a decisão que já está tomada.',
    opportunities:
      'Um convite ou resultado de avaliação que reabre uma porta considerada encerrada.',
    advice: [
      'Faz hoje a revisão de vida: o que terminou, o que perdoas, o que retomarias.',
      'Responde por escrito ao chamado que recebeste — o silêncio está a contar como recusa.',
      'Fecha uma dívida pequena, real ou simbólica, para mudar de fase.',
    ],
    reflection: [
      'Que julgamento meu já cumpriu pena e continua a ser aplicado?',
      'O que é que estou a ser chamado a fazer e tenho adiado?',
      'A quem preciso de pedir perdão e a quem preciso de o dar?',
    ],
    relations: [
      { card: 'major-11-justice', kind: 'reforca', note: 'Balança e trombeta: avaliação e anúncio do resultado.' },
      { card: 'major-21-world', kind: 'continuidade', note: 'O julgamento abre o mundo: ciclo que se fecha completo.' },
      { card: 'major-13-death', kind: 'espelho', note: 'Morte e Renascimento: o fim e a chamada que o segue.' },
    ],
    art: {
      scene: 'angel-trumpet-over-rising-figures',
      sky: 'dawn',
      terrain: 'ruins',
      glyphs: ['judgement-trumpet', 'rising-figures', 'angel-wing', 'open-tomb', 'cross-flag', 'cloud-band'],
      palette: ['#4A1F39', '#EFE6D6', '#C6A66B'],
      motifs: ['anjo na nuvem', 'trombeta comprida', 'três figuras nuas', 'sepulcros abertos', 'bandeira com cruz'],
      reading: [
        'A trombeta é comprida e recta: o chamado atravessa distância, não é sussurro.',
        'As figuras de pé nos túmulos têm os braços abertos, não erguidos em defesa.',
        'O anjo está acima da linha do horizonte, mas dentro de uma faixa de nuvem: o chamado vem do próprio contexto.',
        'A bandeira com a cruz é sinal de vitória sobre a inércia, não de dogma.',
      ],
    },
    a11y: {
      alt: 'Carta O Julgamento: anjo dentro de uma nuvem a soprar uma trombeta comprida, com três figuras de pé sobre sarcófagos abertos e uma bandeira com cruz.',
      long:
        'Céu de aurora com faixa de nuvem. Centro superior: figura alada com mãos juntas segurando trombeta longa, virada para baixo, com cruz no remate. Primeiro plano: três figuras nuas de pé, braços abertos, sobre caixas abertas; duas de joelhos em oração a lados opostos. Fundo de água e montanhas baixas. Moldura com o numeral XX.',
    },
    sources: ['Menthon, afresco do Juízo Final', 'Marseille – Le Jugement', 'Crowley, Thoth – The Aeon'],
  },
  {
    id: 'major-21-world',
    arcana: 'major',
    suit: null,
    number: 21,
    rank: null,
    name: { pt: 'O Mundo', intl: 'The World / The Universe' },
    archetype: 'Totalidade / ciclo cumprido',
    element: 'earth',
    astro: 'Saturno (tradição) / Terra (leitura moderna)',
    gdTitle: 'O Universo — a Rainha da Terra',
    traditionNote: 'Caminho de Tav (Malkuth — o reino). É a carta de fecho: o fim do percurso e a integração das quatro funções, não um prémio estático.',
    keywords: {
      upright: ['conclusão', 'plenitude', 'reconhecimento', 'integração', 'circuito fechado', 'mundialidade'],
      reversed: ['conclusão incompleta', 'falta de fecho', 'perfeccionismo', 'estagnação no sucesso', 'último passo adiado'],
    },
    history:
      'Nas baralhas de Marselha a "Monde" é uma ou duas figuras dançando dentro de uma mandorla, sem os quatro animais; a versão inglesa de Waite fixou a coreografia completa — quatro símbolos, mandorla de serpentes duplas, dança nua. O fecho da série é também, estruturalmente, o início: a carta que permite voltar ao Louco.',
    meanings: {
      upright:
        'O ciclo fecha-se e reconhece-se. É a carta de conclusão real: o que foi trabalhado é entregue, o que foi aprendido é integrado. Traz visibilidade ampla, viagem, publicação, casamento, fim de formação. E uma obrigação: fechar mesmo.',
      reversed:
        'Falta o último metro. Descreve obra não entregue, ciclo não fechado, sucesso que não se reconhece e a incapacidade de celebrar por já estar a pensar no seguinte. Também indica migração interrompida.',
    },
    psychology:
      'É a integração: função do Self que reúne os quatro modos de orientar-se no mundo (pensar, sentir, intuir, sensar). Em sombra, a totalidade vira ideal de auto-suficiência, e o sujeito isola-se para não voltar a precisar de nada.',
    emotional:
      'Gratidão, completude, paz de quem já não tem de provar nada; em inversão, vazio do "é só isto?".',
    love:
      'Relação estável e reconhecida, casamento, coabitação, projecto conjunto com fruto. Em inversão: compromisso por hábito, ou fechamento adiado por medo de perder liberdade.',
    career:
      'Conclusão de curso, entrega final, reconhecimento internacional, mudança de país ou de mercado, publicação. Boa fase para consolidar e assinar; péssima para começar coisa nova sem fechar a anterior.',
    finances:
      'Realização, herança, bónus de conclusão, investimento maduro. O aviso é não gastar para compensar um vazio já sem motivo.',
    growth:
      'Fechar, agradecer, celebrar. A totalidade prática: não deixar nada por dizer na última linha do que se terminou.',
    spirituality:
      'Malkuth, o reino: o espiritual encarnado e concluído. A dançarina dentro da mandorla é a alma em movimento, não em repouso.',
    obstacles:
      'Adiar o fecho por perfeccionismo: a obra fica eterna e nunca chega.',
    opportunities:
      'Um reconhecimento ou conclusão que abre um novo ciclo em plano superior.',
    advice: [
      'Entrega hoje a última peça do que está por fechar — mesmo sem brilho.',
      'Marca um momento de celebração: sem fecho ritual, o ciclo fica aberto.',
      'Anota o que aprendeste no ciclo, para o poderes transferir para o próximo.',
    ],
    reflection: [
      'O que ainda falta para esta fase estar realmente concluída?',
      'Consigo reconhecer o que alcancei sem já estar a pensar no próximo?',
      'Que ciclo se repete porque nunca fechei o anterior?',
    ],
    relations: [
      { card: 'major-00-fool', kind: 'continuidade', note: 'O Mundo fecha e o Louco reinicia: a série é circular, não linear.' },
      { card: 'major-20-judgement', kind: 'continuidade', note: 'Avaliação e totalidade: o fecho que a chamada preparou.' },
      { card: 'major-10-wheel', kind: 'complementa', note: 'Roda e mundo: o ciclo cumprido e o ciclo que recomeça.' },
    ],
    art: {
      scene: 'dancer-in-mandorla-with-four-symbols',
      sky: 'astral',
      terrain: 'sky',
      glyphs: ['world-wreath', 'dancer-four', 'eagle', 'lion-fixed', 'bull-fixed', 'angel-fixed', 'serpent-double'],
      palette: ['#56C5BD', '#C6A66B', '#EFE6D6'],
      motifs: ['mandorla de duas serpentes', 'figura dançando com dois bastões', 'quatro símbolos nos cantos', 'estrelas pequenas', 'ciclo fechado'],
      reading: [
        'A figura leva dois bastões: a totalidade não significa mãos vazias.',
        'A mandorla formada por duas serpentes é o circuito fechado com energia ainda ativa.',
        'Os quatro símbolos nos cantos ocupam as quatro funções — nada ficou fora.',
        'A dança tem um pé levantado: o fim é momento de movimento, não de repouso.',
      ],
    },
    a11y: {
      alt: 'Carta O Mundo: figura a dançar dentro de uma mandorla formada por duas serpentes, segurando dois bastões, com um anjo, uma águia, um touro e um leão nos quatro cantos.',
      long:
        'Fundo astral com pequenas estrelas. Centro: figura alada em dança, envolta em oval formado por duas serpentes entrelaçadas, com um bastão em cada mão. Nos quatro cantos, quatro símbolos: um anjo, uma águia, um touro e um leão, cada um dentro de nuvem pequena. Moldura com o numeral XXI.',
    },
    sources: ['Marseille – Le Monde', 'Waite – mandorla e quatro signos fixos', 'Golden Dawn – Tav, Malkuth'],
  },
]
