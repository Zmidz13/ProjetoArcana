import type { Metadata } from 'next'
import Link from 'next/link'

import { Panel } from '@/components/ui/primitives.tsx'

export const metadata: Metadata = {
  title: 'Termos de uso',
  description: 'Enquadramento simbólico, limites do serviço, idade mínima, licença do conteúdo e do código.',
}

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Termos de uso" subtitle="Curtos, e com uma coisa importante no primeiro parágrafo.">
        <ol className="space-y-3 text-sm leading-relaxed text-pretty">
          <li>
            <span className="font-medium">Natureza do serviço.</span> O ARCANA é uma ferramenta de reflexão simbólica. Não é aconselhamento clínico, jurídico,
            financeiro ou espiritual vinculativo, não prevê acontecimentos e não substitui profissionais. Se um texto teu ou uma leitura sugerir risco para a tua
            vida ou para a vida de outra pessoa, a plataforma deixa de ser criativa nesse momento: corta a camada interpretativa e mostra contactos de apoio.
          </li>
          <li><span className="font-medium">Idade.</span> Uso reservado a maiores de 16 anos. A leitura fala de afeto, perda, dinheiro e trabalho; não é conteúdo para crianças.</li>
          <li><span className="font-medium">Contas.</span> Podes usar sem conta. A conta serve para sincronizar, partilhar e exportar em bloco; responde pelo uso que dela é feito nesta instância.</li>
          <li><span className="font-medium">O que é teu.</span> As tuas perguntas, notas, diário, tiragens e baralhos criados são teus. A instância que aloja o serviço pode guardá-los e processá-los conforme a sua política de privacidade; o software em si não os envia para lado nenhum.</li>
          <li><span className="font-medium">Interpretações geradas.</span> Textos produzidos pelo motor local ou por um modelo pertencem-te para uso pessoal e comercial. Não são profecias nem aconselhamento profissional: são leitura de símbolos sobre o que tu escreveste.</li>
          <li>
            <span className="font-medium">Ilustração.</span> Os SVG são gerados por código a partir do registo simbólico do projeto, portanto são material
            original e usável; não são um baralho desenhado por uma pessoa artista nem reproduzem baralhos específicos protegidos. Os nomes das cartas são
            linguagem comum do tarot.
          </li>
          <li><span className="font-medium">Código.</span> A implementação segue a licença indicada no repositório (<code className="kbd">LICENSE</code>, quando existir nesta instância). Conteúdo editorial e código têm regimes separados.</li>
          <li><span className="font-medium">Disponibilidade.</span> Esta é uma instância auto-alojada: sem SLA, sem suporte comercial, sem faturação. Orçamentos de IA por utilizador existem para proteger quem paga a chave, e quando são atingidos a plataforma degrada para o motor local em vez de recusar a leitura.</li>
          <li><span className="font-medium">Abuso.</span> Usar a plataforma para assustar, manipular ou fazer falsas promessas a outras pessoas — incluindo partilhar leituras assim — é contra estes termos; a instância pode encerrar o acesso.</li>
        </ol>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Dúvidas sobre um pedido concreto: <Link href="/conta" className="text-gold-bright underline-offset-4 hover:underline">Conta e dados</Link> (pedidos de
          eliminação) ou <Link href="/diagnostico" className="text-gold-bright underline-offset-4 hover:underline">Diagnóstico</Link> (enviar feedback).
        </p>
      </Panel>
    </div>
  )
}
