import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge, Panel } from '@/components/ui/primitives.tsx'
import { CONTENT_STATS, contentMeta } from '@/domain/content.ts'
import { ENVIRONMENT_LIST, SFX_LIST } from '@/domain/experience.ts'
import { DECK_THEMES } from '@/art/render.ts'

export const metadata: Metadata = {
  title: 'Sobre o projecto',
  description: 'Como o ARCANA está construído: fontes simbólicas, motor determinístico, camada de IA, arte vectorial, dependências e limites assumidos.',
}

export default function SobrePage() {
  return (
    <div className="space-y-4">
      <Panel title="O que é isto" subtitle={`Conteúdo gerado em ${contentMeta.builtAt ? new Date(contentMeta.builtAt).toLocaleDateString('pt-PT') : 'build'} · hash ${String(contentMeta.hash).slice(0, 12)}`}>
        <div className="space-y-3 text-sm leading-relaxed text-pretty">
          <p>
            O ARCANA é uma plataforma de tarot em português: um baralho completo de {CONTENT_STATS.cards} cartas desenhadas por código, {CONTENT_STATS.spreads}{' '}
            tiragens com posições, animações e interpretações próprias, um sistema físico de baralhar (seis maneiras, corte, escolha manual ou automática, seed
            reprodutível) e uma leitura escrita por um motor simbólico determinístico que pode ser reescrita por um modelo de linguagem — nunca o contrário.
          </p>
          <p>
            Nada aqui é decorativo: as cartas que vês são as cartas que o motor calculou, e o registo (seed + algoritmo + cortes + modo de compra) permite
            reproduzir a tiragem anos depois, sem este software.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            <li><Badge tone="gold">{CONTENT_STATS.majors} maiores</Badge></li>
            <li><Badge tone="gold">{CONTENT_STATS.minors} menores</Badge></li>
            <li><Badge tone="neutral">{CONTENT_STATS.positions} posições desenhadas</Badge></li>
            <li><Badge tone="neutral">{CONTENT_STATS.shapes} formas de layout</Badge></li>
            <li><Badge tone="neutral">{DECK_THEMES.length} temas de arte</Badge></li>
            <li><Badge tone="neutral">{ENVIRONMENT_LIST.length} ambientes sonoros</Badge></li>
            <li><Badge tone="neutral">{SFX_LIST.length} efeitos distintos</Badge></li>
          </ul>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Fontes simbólicas" subtitle="Onde cada decisão de conteúdo vem de.">
          <ul className="space-y-2 text-sm leading-relaxed text-pretty">
            <li>
              <span className="font-medium">estrutura do baralho</span> — 22 arcanos maiores numerados de 0 a 21 (Louco sem número na tradição marselhesa), quatro
              naipes de catorze cartas com corte: Espadas=ar, Paus=fogo, Copas=água, Ouros=terra, pajem=terra, cavaleiro=ar, rainha=água, rei=fogo.
            </li>
            <li>
              <span className="font-medium">correspondências astrológicas e títulos rituais</span> — tabela da Golden Dawn (Livro T de Mathers, ed. benebellwen;
              consultada também em biddytarot.com e joyvernon.com): decanatos por signo e planeta regente dos menores, e signos nos maiores (Carneiro=Imperador,
              Touro=Papa, Gémeos=Amantes, Caranguejo=Carro, Leão=Força, Virgem=Eremita, Balança=Justiça, Escorpião=Morte, Sagitário=Temperança, Capricórnio=Diabo,
              Aquário=Estrela, Peixes=Lua; Mercúrio=Mago, Lua=Sacerdotisa, Vénus=Imperatriz, Júpiter=Roda, Marte=Torre, Sol=Sol, Fogo=Juízo, Saturno=Mundo,
              Ar=Louco, Água=Enforcado). Os sete planetas clássicos, porque a Golden Dawn não usava os transneptunianos.
            </li>
            <li>
              <span className="font-medium">leitura de cada carta</span> — síntese explícita de três camadas: iconografia histórica (Marselha vs. Rider-Waite-Smith,
              que é o que os desenhos de Colert mostram), significados correntes em tradição anglo-saxónica, e leitura psicológica contemporânea. Os textos são
              escritos de raiz em português europeu, não traduções literais.
            </li>
            <li>
              <span className="font-medium">sabbats e fase lunar</span> — oito datas convencionadas por calendário (Samhain 31/10 … Mabon 22/09), usadas como
              estrutura temática e sugestão de tiragem; fase lunar por efeméride média (Meeus simplificado), com margem de ±0,5 dia junto das fronteiras de data —
              por isso aparece como tradição simbólica, nunca como previsao.
            </li>
            <li id="relacoes">
              <span className="font-medium">relações entre cartas</span> — {CONTENT_STATS.relations} ligações registadas: as nomeadas vêm da tradição
              (sequências numerológicas, pares espelhados, mesma correspondência astrológica); as derivadas por regra partilhada estão marcadas como
              <code className="kbd">derivada</code> na ficha da carta.
            </li>
          </ul>
        </Panel>

        <Panel title="Como está feito" subtitle="Arquitectura e decisões técnicas, sem modismos.">
          <ul className="space-y-2 text-sm leading-relaxed text-pretty">
            <li><span className="font-medium">Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind 3</span> no front; rotas de API no mesmo processo (`src/app/api/**`) com validação Zod em todas as entradas.</li>
            <li><span className="font-medium">Persistência com migrações versionadas</span> (<code className="kbd">src/db/migrations/0001_initial.ts</code>, <code className="kbd">0002_…</code>) sobre um <code className="kbd">DatabaseClient</code> único com dois adaptadores: SQLite por omissão (via <code className="kbd">node:sqlite</code>, sem compilação nativa) e PostgreSQL quando <code className="kbd">DATABASE_URL</code> existe.</li>
            <li><span className="font-medium">Motor determinístico</span> (<code className="kbd">src/engine/*</code>): baralho, layouts, ciclos, análise simbólica, narrativa. É puramente funcional e reprodutível — a mesma função corre no cliente (para animar) e no servidor (para verificar).</li>
            <li><span className="font-medium">Camada de IA</span> (<code className="kbd">src/ai/*</code>): pedidos separados por secção (A–G), saída validada por esquema, streaming SSE, rate limiting por sessão, cache por hash de contexto, chaves só no servidor e fallback local estruturado quando o modelo falha ou o orçamento acaba.</li>
            <li><span className="font-medium">Arte vectorial</span> (<code className="kbd">src/art/*</code> → <code className="kbd">npm run art:build</code>): {DECK_THEMES.length} temas × {CONTENT_STATS.cards} cartas, gerados a partir do registo simbólico de cada carta (céu, terreno, cena, glifos, paleta) com primitivas SVG e sem <em>filters</em>, para funcionar em <code className="kbd">&lt;img&gt;</code> e em Open Graph.</li>
            <li><span className="font-medium">Som e VFX</span> (<code className="kbd">src/audio/engine.ts</code>, <code className="kbd">src/vfx/engine.ts</code>): Web Audio API para sintetizar ambulência e os {SFX_LIST.length} efeitos; canvas 2D para as partículas. Zero ficheiros, zero dependências, zero WebGL.</li>
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dependências externas e como correr" subtitle="O projeto arranca só com Node.js ≥ 20.11 e npm.">
          <pre className="overflow-x-auto rounded-lg border border-[var(--line)] bg-black/30 p-3 text-[11px] leading-relaxed">
{`npm install
npm run content:build   # conteúdo autorável -> data/content.json
npm run art:build       # 78 cartas x ${DECK_THEMES.length} temas em public/art
npm run dev             # http://localhost:3000

# opcional
cp .env.example .env    # chaves e base de dados`}
          </pre>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
            <li>· <code className="kbd">ARCANA_AI_API_KEY</code> (e <code className="kbd">ARCANA_AI_BASE_URL</code>, <code className="kbd">ARCANA_AI_MODEL</code>): qualquer endpoint compatível com <em>chat completions</em>. Sem isto, a plataforma usa o motor local e avisa na interface.</li>
            <li>· <code className="kbd">DATABASE_URL</code>: PostgreSQL. Sem isto, SQLite em <code className="kbd">var/arcana.db</code>.</li>
            <li>· <code className="kbd">ARCANA_SESSION_PEPPER</code>: assina sessões e CSRF. Em produção é obrigatório (o arranque recusa o valor de exemplo).</li>
            <li>· Não há Docker obrigatório, nem serviços de terceiros, nem analytics, nem fontes remotas.</li>
          </ul>
        </Panel>
        <Panel title="Limites assumidos" subtitle="O que este software não faz, dito por ele.">
          <ul className="space-y-2 text-sm leading-relaxed text-pretty">
            <li>· Não prevê. A leitura é linguagem simbólica sobre a situação que escreveste, não sobre o que vai acontecer.</li>
            <li>· Não diagnostica nem trata. Em saúde, justiça ou dinheiro, a resposta diz-te onde está a incerteza e manda-te para um profissional — e quando a mensagem sugere risco para a vida, o motor corta a camada criativa e dá contactos de apoio.</li>
            <li>· Não decide por ti. As perguntas em F servem exatamente para devolver a decisão a quem pergunta.</li>
            <li>· A IA não escolhe cartas: o texto de um modelo é sempre gerado a partir da distribuição registada e validado por esquema; se divergir, o pedido é rejeitado.</li>
            <li>· A arte é gerada por código, não é pintura manual: é original e licenciável, mas não substitui um baralho desenhado por uma pessoa artista — quem quiser esse nível de ilustração tem de o comissionar (o motor aceita SVG de substituicao por baralho).</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Documentação do repositório" subtitle="Nove documentos, todos atualizados com o código.">
        <ul className="grid gap-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['README.md', 'porta de entrada'],
            ['docs/ARQUITECTURA.md', 'camadas e contratos'],
            ['docs/CONTEUDO.md', 'como se autoram cartas e tiragens'],
            ['docs/IA.md', 'pipeline híbrida, esquemas e orçamentos'],
            ['docs/ARTE.md', 'motor SVG e temas de baralho'],
            ['docs/SOM-E-VFX.md', 'síntese áudio e partículas'],
            ['docs/TESTES.md', 'unitários, integração, e2e, auditoria'],
            ['docs/ACESSIBILIDADE.md', 'conformidade e mapa de teclado'],
            ['docs/PROGRESS.md', 'estado por fase, com evidência'],
          ].map(([file, note]) => (
            <li key={file} className="rounded-lg border border-[var(--line)] px-2.5 py-2">
              <code className="text-xs text-gold-bright">{file}</code>
              <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          No repositório. Em execução: <Link href="/diagnostico" className="text-gold-bright underline-offset-4 hover:underline">estado do sistema</Link>,{' '}
          <Link href="/acessibilidade" className="text-gold-bright underline-offset-4 hover:underline">declaração de acessibilidade</Link>,{' '}
          <Link href="/privacidade" className="text-gold-bright underline-offset-4 hover:underline">privacidade</Link>.
        </p>
      </Panel>
    </div>
  )
}
