import type { Metadata } from 'next'
import Link from 'next/link'

import { Panel } from '@/components/ui/primitives.tsx'

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Que dados o ARCANA guarda, onde ficam, quem os pode ver e como os levas embora ou apagas.',
}

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <Panel title="Privacidade" subtitle="Este documento descreve o que o código faz, não o que gostaríamos que fizesse.">
        <div className="space-y-3 text-sm leading-relaxed text-pretty">
          <p>
            O ARCANA foi escrito para correr numa máquina que controlas, com um banco de dados local ao lado da aplicação. Não há serviço de terceiros a receber
            os teus textos: nem analytics, nem publicidade, nem chamadas de fontes ou imagens remotas. As únicas ligações externas possíveis são (1) o endpoint
            de IA que o administrador configurou e (2) PostgreSQL, se o administrador o configurar.
          </p>
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="O que fica guardado">
          <ul className="space-y-1.5 text-sm leading-relaxed">
            <li>· Leituras: pergunta, nota privada, cartas, orientações, seed, algoritmo, cortes, ambiente, duração.</li>
            <li>· Interpretações (1:N por leitura): texto, gerador, modelo, tokens, custo, hash do contexto.</li>
            <li>· Conversa posterior à leitura.</li>
            <li>· Diário: humor, energia, clareza, sono, nota — declarado por ti, nunca inferido.</li>
            <li>· Tiragens e baralhos próprios, preferências.</li>
            <li>· Contagens de uso (leitura, IA, conversa, eventos) para quotas e orçamento.</li>
          </ul>
        </Panel>
        <Panel title="O que não há">
          <ul className="space-y-1.5 text-sm leading-relaxed">
            <li>· IP ou user-agent em claro: sessões guardam hash de IP e nada mais, para rate limiting por rede.</li>
            <li>· Cookies de terceiros, scripts externos, imagens remotas, fontes remotas.</li>
            <li>· Chaves de API no navegador: <code className="kbd">ARCANA_AI_API_KEY</code> só existe no processo do servidor.</li>
            <li>· Envio de dados a um modelo sem opt-in por leitura: a preferência <em>partilhar contexto</em> controla se a pergunta e as notas entram no prompt.</li>
          </ul>
        </Panel>
      </div>
      <Panel title="Levar tudo embora, ou apagar">
        <p className="text-sm leading-relaxed text-pretty">
          Exportação completa em <Link href="/api/export?format=zip" className="text-gold-bright underline-offset-4 hover:underline">ZIP</Link> (JSON legível por
          máquina + CSV + um <code className="kbd">LEIA_ME</code> a explicar o formato, e nada mais). A ZIP inclui leitura, interpretação, conversa, diário,
          tiragens, baralhos e preferências — com seed e cortes para poderes reproduzir as tiragens noutro sítio.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-pretty">
          Apagar uma leitura no <Link href="/historico" className="text-gold-bright underline-offset-4 hover:underline">histórico</Link> é imediato (a linha fica
          marcada como apagada e desaparece de todas as listagens). A eliminação física (conta incluída) é pedida em{' '}
          <Link href="/conta" className="text-gold-bright underline-offset-4 hover:underline">Conta e dados</Link> e executada por quem administra a instância.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Sem conta, os teus dados vivem na cookie <code className="kbd">arcana_device</code> e no banco local: limpar cookies do navegador desliga-te desse
          registo, por isso exporta antes.
        </p>
      </Panel>
    </div>
  )
}
