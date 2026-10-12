import Link from 'next/link'

import { DailyCard } from '@/components/pages/daily-card.tsx'
import { Badge, Panel } from '@/components/ui/primitives.tsx'
import { CONTENT_STATS, SPREADS } from '@/domain/content.ts'
import { ENVIRONMENT_LIST, SFX_LIST } from '@/domain/experience.ts'
import { ThemeShowcase } from '@/components/pages/theme-showcase.tsx'

export default function HomePage() {
  const majors = SPREADS.filter((spread) => spread.cardCount >= 10).slice(0, 3)
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] px-5 py-9 sm:px-9 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(85% 60% at 22% 10%, rgba(198,166,107,.18), transparent 62%), radial-gradient(70% 60% at 92% 88%, rgba(86,197,189,.14), transparent 60%)' }} />
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-gold-bright">Tarot em português · 78 cartas · {CONTENT_STATS.spreads} tiragens</p>
          <h1 className="mt-3 font-display text-3xl leading-[1.12] sm:text-5xl">
            Um baralho completo, uma mesa que se mexe, e uma leitura que sabe exactamente que cartas saíram.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)] text-pretty">
            Baralhas de verdade (seis maneiras, corte manual, escolha por clique, toque, arrasto, leque ou automático), com seed registada que reproduz a tiragem
            ano depois. A interpretação vem de um motor simbólico determinístico e, se quiseres, de um modelo de linguagem que só pode comentar as cartas que
            saíram — nunca inventá-las.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/mesa" className="rounded-md bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#12100a] shadow-gild transition-[filter] hover:brightness-110">
              Abrir a mesa
            </Link>
            <Link href="/tiragens" className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm hover:border-gold">
              Explorar as {CONTENT_STATS.spreads} tiragens
            </Link>
            <Link href="/baralho" className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm hover:border-gold">
              Ver as 78 cartas
            </Link>
            <Link href="/diagnostico" className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--text-muted)] hover:border-gold hover:text-[var(--text)]">
              Estado do sistema
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-[11px]">
            <li><Badge tone="gold">{CONTENT_STATS.fieldsPerCard} campos por carta</Badge></li>
            <li><Badge tone="neutral">{CONTENT_STATS.positions} posições desenhadas</Badge></li>
            <li><Badge tone="neutral">{ENVIRONMENT_LIST.length} ambientes sonoros</Badge></li>
            <li><Badge tone="neutral">{SFX_LIST.length} efeitos distintos</Badge></li>
            <li><Badge tone="astral">funciona sem WebGL</Badge></li>
          </ul>
        </div>
      </section>

      <DailyCard />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Como o ritual corre" className="lg:col-span-2">
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              { n: '01', t: 'Pergunta e preparação', d: 'A pergunta entra no contexto do motor. Cortes, invertidas e modo de compra ficam no registo.' },
              { n: '02', t: 'Baralhar e cortar', d: 'A animação mostra o que a lógica fez: o teu corte muda mesmo as cartas que saem.' },
              { n: '03', t: 'Escolher e revelar', d: 'Tiras do baralho carta a carta, ou deixas o motor comprar. Nenhuma se repete.' },
              { n: '04', t: 'Interpretação A–G', d: 'Abertura, carta a carta, combinações, síntese, orientações, perguntas, mensagem final.' },
              { n: '05', t: 'Conversa depois', d: 'Continuas a pergunta sobre a mesma tiragem; o modelo não pode acrescentar cartas.' },
              { n: '06', t: 'Diário e histórico', d: 'Ficas com nota, humor, favoritas, exportação e partilha opcional por link.' },
            ].map((step) => (
              <li key={step.n} className="rounded-lg border border-[var(--line)] bg-black/20 p-3">
                <span className="font-mono text-[11px] text-gold">{step.n}</span>
                <h3 className="mt-1 text-sm font-semibold">{step.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{step.d}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Sete formas de vestir o baralho" subtitle="Tema de arte por baralho — as mesmas 78 cartas, sete linguagens visuais.">
          <ThemeShowcase />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {majors.map((spread) => (
          <Panel key={spread.id} title={spread.name} subtitle={spread.summary} actions={<Badge tone="neutral">{spread.cardCount} posições</Badge>}>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] text-pretty">{spread.whenToUse}</p>
            <ul className="mt-3 space-y-1 text-xs">
              {spread.positions.slice(0, 5).map((position, index) => (
                <li key={position.id} className="flex gap-2">
                  <span className="w-4 text-right text-gold/70">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{position.label}</span>
                </li>
              ))}
              {spread.positions.length > 5 ? <li className="pl-6 text-[var(--text-muted)]">+ {spread.positions.length - 5} posições</li> : null}
            </ul>
            <Link href={`/tiragens/${spread.id}`} className="mt-3 inline-block text-xs text-gold-bright underline-offset-4 hover:underline">
              Ficha e variantes →
            </Link>
          </Panel>
        ))}
      </div>

      <Panel title="Enquadramento" subtitle="O que este software é — e o que recusa ser.">
        <div className="grid gap-3 text-sm leading-relaxed text-[var(--text-muted)] sm:grid-cols-2">
          <p>
            O tarot aqui é tratado como <span className="text-[var(--text)]">linguagem simbólica e ferramenta de reflexão</span>. Não há promessa de previsão, nem
            diagnóstico de saúde, nem conselho jurídico ou financeiro vinculativo: quando a leitura toca nessas áreas, o motor diz-no explicitamente.
          </p>
          <p>
            Tudo o que é gerado por IA passa por um esquema validado e pelo registo determinístico das cartas. Sem chave de API configurada, a plataforma não
            degrada para uma mensagem vazia: o <span className="text-[var(--text)]">motor simbólico local</span> produz a leitura completa A–G.
          </p>
        </div>
      </Panel>
    </div>
  )
}
