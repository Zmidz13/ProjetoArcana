import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge, Panel } from '@/components/ui/primitives.tsx'

export const metadata: Metadata = {
  title: 'Acessibilidade',
  description: 'Declaração de acessibilidade do ARCANA: teclado, movimento reduzido, contraste, leitores de ecrã e o que está testado.',
}

const KEYBOARD = [
  ['S', 'baralhar a mesa ativa'],
  ['C', 'cortar (na fase de corte)'],
  ['A', 'o motor compra por ti'],
  ['← →', 'percorrer o baralho carta a carta'],
  ['↑ ↓', 'saltar dez cartas no baralho'],
  ['Enter / Espaço', 'colocar a carta focada na posição ativa'],
  ['R', 'revelar a próxima carta'],
  ['U', 'tirar a última carta escolhida'],
  ['Esc', 'fechar diálogos e largar o foco do baralho'],
  ['Tab', 'percurso linear por secção, sempre com anel de foco visível'],
]

export default function AccessibilityPage() {
  return (
    <div className="space-y-4">
      <Panel title="Declaração de acessibilidade" subtitle="Objetivo: WCAG 2.2 AA nos fluxos principais, verificado com teclado, Lighthouse e testes automáticos.">
        <div className="grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
          <ul className="space-y-2 text-pretty">
            <li>· <span className="font-medium">Todo o fluxo é operável por teclado</span>: pergunta, baralhar, cortar, escolher, revelar, interpretar, conversar. O leque do baralho é uma <code className="kbd">listbox</code> com navegação por setas e foco declarado.</li>
            <li>· <span className="font-medium">Movimento</span>: respeita <code className="kbd">prefers-reduced-motion</code> e tem controlo próprio (forçar menos movimento, velocidade 0,4×–2×, partículas a 0%). Com movimento reduzido a viragem deixa de ser rotação 3D e passa a um simples corte — a informação não depende da animação.</li>
            <li>· <span className="font-medium">Som</span>: nunca arranca sozinho; depende de um gesto e pode ser desligado por completo sem desmontar nada. Cada efeito tem uma acção e cada acção tem legendas de estado em texto.</li>
            <li>· <span className="font-medium">Sem WebGL</span>: as partículas são canvas 2D e a arte é SVG puro. Sem GPU, sem permissões, sem tela preta.</li>
          </ul>
          <ul className="space-y-2 text-pretty">
            <li>· <span className="font-medium">Contraste</span>: os pares de cor de texto passam 4,5:1 no modo noite e no modo claro; há um modo de alto contraste que corta gradientes e usa contorno branco.</li>
            <li>· <span className="font-medium">Texto</span>: escala base, com opção de 118%; nada de tamanhos fixos em pixels dentro dos cartões.</li>
            <li>· <span className="font-medium">Alternativas</span>: cada carta tem <code className="kbd">alt</code> curto e <code className="kbd">long</code> descritivo (composição, figuras, cores), escritos no conteúdo-fonte e não gerados automaticamente. A leitura A–G é texto real, não imagem.</li>
            <li>· <span className="font-medium">Status e erros</span>: <code className="kbd">role="status"</code>/<code className="kbd">role="alert"</code> em toasts, stream e erros de formulário; as mensagens de erro dizem o que fazer a seguir.</li>
          </ul>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Mapa de teclado" subtitle="Atalhos da mesa; desligáveis em Preferências para não aparecer na UI, mas continuam ativos.">
          <ul className="divide-y divide-[var(--line)] text-sm">
            {KEYBOARD.map(([key, action]) => (
              <li key={key} className="flex items-center justify-between gap-3 py-1.5">
                <kbd className="kbd">{key}</kbd>
                <span className="text-right text-[var(--text-muted)]">{action}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="O que é verificado por teste" subtitle="Automático e reprodutível: corre em CI e na tua máquina.">
          <ul className="space-y-1.5 text-sm leading-relaxed text-pretty">
            <li>· <code className="kbd">npm run test:e2e</code>: navegação por teclado do fluxo completo (mesa → corte → escolha → gravação → interpretação → conversa) e checagens de foco/aria.</li>
            <li>· <code className="kbd">npm run a11y</code> (Lighthouse): acessibilidade ≥ 95 e best-practices ≥ 90 em 3 vistas.</li>
            <li>· <code className="kbd">npm run audit:a11y</code> (estático): todo o botão tem nome acessível; nenhuma imagem sem <code className="kbd">alt</code>; nenhuma animação fora de um bloco <code className="kbd">prefers-reduced-motion</code>.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="gold">alvo AA</Badge>
            <Link href="/preferencias" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              ajustar na minha sessão
            </Link>
            <Link href="/diagnostico" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              estado do sistema
            </Link>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            Falhas conhecidas e assumidas: o leque de 78 cartas é exaustivo por teclado mas lento para navegação longa em leitor de ecrã — para esse caso usa o
            modo linha ou a compra automática; o arrastar para a mesa não tem equivalente por toque no iOS &lt; 13, e nesse caminho usa o toque simples na carta.
          </p>
        </Panel>
      </div>
    </div>
  )
}
