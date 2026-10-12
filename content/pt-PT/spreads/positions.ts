import type { SpreadPosition } from '../../../src/domain/types.ts'

/**
 * Geradores de posições para tiragens com estrutura fixa conhecida
 * (casas astrológicas, sephiroth, sabás, meses, Grande Tarô).
 *
 * O conteúdo é autoritativo e partilhado: é mais fiável gerar 78 posições a partir
 * de uma matriz do que escrever à mão uma tabela com a mesma informação.
 */

let seq = 0
const nid = (prefix: string) => `${prefix}-${(++seq).toString().padStart(3, '0')}`

export interface RawPosition {
  id?: string
  label: string
  description: string
  group?: string
  links?: string[]
  x?: number
  y?: number
  rotation?: number
  scale?: number
  allowReversed?: boolean
}

/** Converte posições brutas em SpreadPosition com ids estáveis. */
export function idPositions(prefix: string, positions: RawPosition[]): SpreadPosition[] {
  const used = new Set<string>()
  return positions.map((p, i) => {
    let id = p.id ?? `${prefix}-${String(i + 1).padStart(2, '0')}`
    while (used.has(id)) id = `${id}b`
    used.add(id)
    const out: SpreadPosition = { id, label: p.label, description: p.description, x: 0, y: 0 }
    if (p.group !== undefined) out.group = p.group
    if (p.rotation !== undefined) out.rotation = p.rotation
    if (p.scale !== undefined) out.scale = p.scale
    if (p.allowReversed !== undefined) out.allowReversed = p.allowReversed
    if (p.x !== undefined) out.x = p.x
    if (p.y !== undefined) out.y = p.y
    const links = p.links ?? []
    if (links.length) out.links = links
    return out
  })
}

/** Reescreve as ligações que usam o índice (1-based) como `@n` para o id gerado. */
export function resolveLinks(positions: SpreadPosition[]): SpreadPosition[] {
  const byIndex = new Map<number, string>()
  positions.forEach((p, i) => byIndex.set(i + 1, p.id))
  return positions.map((p) => {
    if (!p.links) return p
    return {
      ...p,
      links: p.links
        .map((l) => {
          const m = /^@(\d+)$/.exec(l)
          if (!m) return l
          return byIndex.get(Number(m[1])) ?? null
        })
        .filter((l): l is string => Boolean(l) && l !== p.id),
    }
  })
}

export const zodiacPositions = (): RawPosition[] => {
  const houses: [string, string][] = [
    ['Casa I · Ascendente', 'Corpo, identidade visível e a forma como começas as situações.'],
    ['Casa II · Valores', 'Recursos próprios, talento utilizável e a relação com o dinheiro.'],
    ['Casa III · Comunicação', 'Pensamento diário, irmãos, vizinhos e aprendizagem curta.'],
    ['Casa IV · Raiz', 'Lar, família de origem, silêncio doméstico e o fim das coisas.'],
    ['Casa V · Criação', 'Prazer, filhos, jogos, expressão e risco voluntário.'],
    ['Casa VI · Ofício', 'Trabalho quotidiano, saúde, hábitos e serviço concreto.'],
    ['Casa VII · Outro', 'Relação a dois, contratos, sócios e o que se espelha em ti.'],
    ['Casa VIII · Profundidade', 'Perda, partilha de recursos, intimidade, crise e transformação.'],
    ['Casa IX · Horizonte', 'Estudo longo, viagem, sentido, fé e legislação.'],
    ['Casa X · Vocação', 'Reputação, poder público, direção de vida e reconhecimento.'],
    ['Casa XI · Rede', 'Amizades, colectivos, projectos futuros e apoio inesperado.'],
    ['Casa XII · Invisível', 'O que não se vê: retiro, sonho, dívida cármica, cuidado e fins.'],
  ]
  return houses.map(([label, description], i) => ({
    label,
    description,
    group: i < 6 ? 'hemisfério-sul' : 'hemisfério-norte',
  }))
}

export const sephirothPositions = (): RawPosition[] => {
  const list: [string, string][] = [
    ['Kether · Coroa', 'A intenção original, anterior à forma: o que queres sem justificação.'],
    ['Chokmah · Sabedoria', 'O impulso criativo puro, o gasto inicial de energia.'],
    ['Binah · Entendimento', 'A forma que limita e dá contorno: o custo real da ideia.'],
    ['Chesed · Misericórdia', 'Expansão, abundância e o excesso que ainda chamas generosidade.'],
    ['Geburah · Rigor', 'O corte necessário, disciplina, conflito e fronteira.'],
    ['Tiphareth · Beleza', 'O equilíbrio do coração: onde a coisa se torna sustentável.'],
    ['Netzach · Vitória', 'Emoção, arte, desejo e persistência afectiva.'],
    ['Hod · Esplendor', 'Método, linguagem, técnica e o detalhe racional.'],
    ['Yesod · Fundamento', 'O invisível que sustenta: hábitos, sonhos, memória, automatismos.'],
    ['Malkuth · Reino', 'O resultado material concreto, o que se pode medir hoje.'],
  ]
  return list.map(([label, description]) => ({ label, description }))
}

export const sabbatPositions = (): RawPosition[] => {
  const list: [string, string][] = [
    ['Samhain · A raiz', 'O que terminou de facto e ainda não reconheceste como fim.'],
    ['Yule · A primeira luz', 'O começo mínimo que se acende no ponto mais escuro.'],
    ['Imbolc · O primeiro rebento', 'A intenção que ainda ninguém vê mas já cresce.'],
    ['Ostara · O equilíbrio', 'O ponto em que as duas metades da tua vida pesam igual.'],
    ['Beltane · A flor', 'Desejo, encontro e fertilidade do que é começado com alegria.'],
    ['Litha · O sol pleno', 'O que está a dar fruto, visível e sem sombra.'],
    ['Lughnasadh · A primeira colheita', 'O pagamento real do trabalho feito, medido em grão e não em promessa.'],
    ['Mabon · O equilíbrio II', 'A balança final: o que fica, o que se partilha, o que se deixa.'],
    ['Samhain II · A sementeira', 'O que voltará a nascer da matéria que apodrece agora.'],
    ['Yule II · O silêncio', 'O repouso que recompõe e não adia.'],
    ['Imbolc II · A brasa', 'O que arde baixo e precisa de ar, não de lenha.'],
    ['Ostara II · O limiar', 'A próxima porta, ainda sem maçaneta visível.'],
  ]
  return list.map(([label, description]) => ({ label, description, group: 'roda' }))
}

export const monthPositions = (): RawPosition[] => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const notes = [
    'Semente: a decisão que define o ano.',
    'Clima: o ambiente em que vais operar.',
    'Primeira prova: o que testa o plano.',
    'Crescimento: o que ganha tração.',
    'Visibilidade: quem começa a ver.',
    'Ápice: o ponto de maior esforço e maior retorno.',
    'Colheita inicial: o primeiro resultado concreto.',
    'Ajuste: a correção que evita dano maior.',
    'Partilha: redes, parceria e reconhecimento.',
    'Desfolha: o que se corta para salvar a árvore.',
    'Consolidação: o que fica quando o resto seca.',
    'Fecho: a memória e o saldo do ano.',
  ]
  const out: RawPosition[] = months.map((m, i) => ({ label: m, description: notes[i] as string, group: 'meses' }))
  out.push({ label: 'Síntese do ano', description: 'A linha que atravessa os doze meses e o conselho a levar.', group: 'sintese' })
  return out
}

export const chakraPositions = (): RawPosition[] => {
  const list: [string, string][] = [
    ['Raiz (Muladhara)', 'Segurança, corpo, casa e pertença: o que te sustenta em pé.'],
    ['Sacro (Svadhisthana)', 'Desejo, prazer, criação e a forma como deixas sentir.'],
    ['Plexo Solar (Manipura)', 'Vontade, poder pessoal, dinheiro e autoestima em ação.'],
    ['Coração (Anahata)', 'Afeição, perdão, limites e a troca entre dar e receber.'],
    ['Garganta (Vishuddha)', 'Palavra verdadeira: o que dizes, calas ou ainda não disseste.'],
    ['Terceiro Olho (Ajna)', 'Percepção, critério e imaginação disciplinada.'],
    ['Coroa (Sahasrara)', 'Sentido: o que está acima do teu controlo e a que te entregas.'],
  ]
  return list.map(([label, description]) => ({ label, description, group: 'coluna' }))
}

/** Grande Tarô: 78 posições em 6 faixas temáticas × 13 passos. */
export const grandTablePositions = (rows = 6, cols = 13): RawPosition[] => {
  const bands: [string, string][] = [
    ['Corpo · faixa 1', 'Saúde, energia e condições materiais reais'],
    ['Coração · faixa 2', 'Afectos, família e vínculos'],
    ['Obra · faixa 3', 'Trabalho, projeto e competência'],
    ['Mundo · faixa 4', 'Recursos, dinheiro e estatuto'],
    ['Mente · faixa 5', 'Pensamento, estudo e decisão'],
    ['Espírito · faixa 6', 'Sentido, ética e o que permanece'],
  ]
  const out: RawPosition[] = []
  for (let r = 0; r < rows; r++) {
    const band = bands[r % bands.length] as [string, string]
    for (let c = 0; c < cols; c++) {
      const stage =
        c === 0
          ? 'ponto de partida'
          : c === cols - 1
            ? 'resultado provável'
            : c < cols / 3
              ? 'condição actual'
              : c < (2 * cols) / 3
                ? 'movimento em curso'
                : 'consequência'
      out.push({
        label: `${band[0].split(' · ')[0]} · ${c + 1}`,
        description: `${band[1]} — ${stage}.`,
        group: `faixa-${r + 1}`,
      })
    }
  }
  return out
}

/** Posições de linha temporal: passado → futuro com ramificações. */
export const timelinePositions = (count: number): RawPosition[] => {
  const stages: [string, string][] = [
    ['Raiz do assunto', 'O que deu origem à situação, antes de ela ter nome.'],
    ['Primeira viragem', 'O momento em que as coisas deixaram de poder ficar iguais.'],
    ['Hábito instalado', 'O padrão que se automatizou e hoje passa despercebido.'],
    ['Custo silencioso', 'O que tens pago sem apresentar fatura a ninguém.'],
    ['Presente', 'O estado actual dos factos, sem narração.'],
    ['Recurso disponível', 'O que já existe e ainda não foi usado.'],
    ['Pressão externa', 'O que o contexto exige e não pode ser negociado.'],
    ['Decisão em suspensão', 'A escolha que ainda não foi feita e já está a ser vivida.'],
    ['Primeiro efeito', 'O que muda nos trinta dias seguintes.'],
    ['Trajectória', 'Para onde isto vai se nada for alterado.'],
    ['Cruzamento', 'O ponto onde dois caminhos se separam de vez.'],
    ['Resultado provável', 'O desfecho mais comum desta sequência.'],
  ]
  const out: RawPosition[] = []
  for (let i = 0; i < count; i++) {
    const st = stages[i % stages.length] as [string, string]
    const suffix = i >= stages.length ? ` (aprofundamento ${Math.floor(i / stages.length) + 1})` : ''
    out.push({
      label: `${st[0]}${suffix}`,
      description: st[1],
      group: i < count / 3 ? 'ontem' : i < (2 * count) / 3 ? 'hoje' : 'amanha',
    })
  }
  return out
}

export { nid }
