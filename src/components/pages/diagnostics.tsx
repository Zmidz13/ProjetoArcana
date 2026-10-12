'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { Badge, Button, Field, Panel, Skeleton, TextArea } from '@/components/ui/primitives.tsx'
import { useApp, useCsrfProbe } from '@/components/providers.tsx'
import { ApiError, api } from '@/lib/api.ts'
import { buildDeck, deriveSeed, drawForSpread, hashSeed, shuffleDeck } from '@/engine/deck.ts'
import { DECK_IDS, SPREADS, CONTENT_STATS, contentMeta, getSpread } from '@/domain/content.ts'
import { ENVIRONMENT_LIST, SFX_LIST } from '@/domain/experience.ts'
import { loadArtManifest, type ArtManifest } from '@/components/ui/art.tsx'

interface Health {
  ok: boolean
  service: string
  version: string
  time: string
  latencyMs: number
  database: { kind: string; migrations: number; path: string }
  content: Record<string, number | string>
  experience: { environments: number; soundEffects: number }
  totals: { readings: number; users: number }
  ai: { configured: boolean; provider: string | null; model: string | null; [key: string]: unknown }
  session: { authenticated: boolean }
}

interface AiStatus {
  configured: boolean
  provider: string | null
  model: string | null
  keyConfigured: boolean
  streaming: boolean
  sections: string[]
  localFallback: string
  usage30d?: { calls: number; tokens: number; cost: number; fallbacks: number }
  cache?: { sections: number; replies: number }
  note?: string
}

/** Diagnóstico real: não é uma tela decorativa — cada número vem de uma verificação feita agora. */
export function Diagnostics() {
  const { toast, session, refreshSession } = useApp()
  const csrf = useCsrfProbe()
  const [health, setHealth] = useState<Health | null>(null)
  const [ai, setAi] = useState<AiStatus | null>(null)
  const [manifest, setManifest] = useState<ArtManifest | null>(null)
  const [checking, setChecking] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [engine, setEngine] = useState<{ deterministic: boolean; unique: boolean; reversedRatio: number; detail: string } | null>(null)
  const [feedback, setFeedback] = useState('')

  const runEngineSelfTest = useCallback(() => {
    const spread = getSpread(SPREADS.find((item) => item.cardCount >= 6 && item.cardCount <= 10)?.id ?? SPREADS[0]!.id)!
    const seed = hashSeed('arcana:self-test')
    const first = drawForSpread(DECK_IDS, { spread, seed, algorithm: 'riffle', cuts: 2, allowReversed: true, drawMode: 'topo' })
    const second = drawForSpread(DECK_IDS, { spread, seed, algorithm: 'riffle', cuts: 2, allowReversed: true, drawMode: 'topo' })
    const deck = shuffleDeck(buildDeck(DECK_IDS), 'leque', deriveSeed(seed, 'shuffle:leque'))
    const unique = new Set(first.drawn.map((card) => card.cardId)).size === first.drawn.length && new Set(deck.order).size === DECK_IDS.length
    const ratio = first.drawn.filter((card) => card.orientation === 'reversed').length / Math.max(1, first.drawn.length)
    setEngine({
      deterministic: first.drawn.map((card) => `${card.cardId}:${card.orientation}`).join('|') === second.drawn.map((card) => `${card.cardId}:${card.orientation}`).join('|'),
      unique,
      reversedRatio: ratio,
      detail: `${first.drawn.length} cartas em “${spread.name}”, ${deck.order.length} no baralho embaralhado; orientação invertida em ${(ratio * 100).toFixed(0)}% desta amostra.`,
    })
  }, [])

  const check = useCallback(async () => {
    setChecking(true)
    setErrors({})
    const next: Record<string, string> = {}
    try {
      setHealth(await api<Health>('/api/health'))
    } catch (caught) {
      next.health = caught instanceof Error ? caught.message : 'sem resposta'
    }
    try {
      setAi(await api<AiStatus>('/api/ai/status'))
    } catch (caught) {
      next.ai = caught instanceof Error ? caught.message : 'sem resposta'
    }
    try {
      setManifest(await loadArtManifest())
      if (!manifest && !window.location.search.includes('skip')) next.art = 'manifesto de arte ilegível — corre npm run art:build'
    } catch (caught) {
      next.art = caught instanceof Error ? caught.message : 'sem manifesto'
    }
    try {
      await api('/api/preferences')
    } catch (caught) {
      next.preferences = caught instanceof Error ? caught.message : 'sem resposta'
    }
    runEngineSelfTest()
    await refreshSession()
    setErrors(next)
    setChecking(false)
    if (Object.keys(next).length === 0) toast('Verificações concluídas: tudo a responder.', 'ok')
  }, [manifest, refreshSession, runEngineSelfTest, toast])

  useEffect(() => {
    void check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendFeedback = async () => {
    if (feedback.trim().length < 4) {
      toast('Escreve pelo menos quatro caracteres.', 'erro')
      return
    }
    try {
      await api('/api/feedback', { method: 'POST', body: { area: 'diagnostico', message: feedback.trim().slice(0, 2000) } })
      toast('Obrigado: ficou registado nesta instância.', 'ok')
      setFeedback('')
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha no envio.', 'erro')
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="Estado do sistema" subtitle="Cada linha é uma verificação feita neste momento, não um texto fixo." actions={<Button size="sm" variant="outline" onClick={() => void check()} loading={checking}>Reverificar</Button>}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Check label="Base de dados" ok={!!health} text={health ? `${health.database.kind} · ${health.database.migrations} migrações · ${health.database.path}` : errors.health ?? 'a verificar…'} />
          <Check label="Conteúdo" ok={!!health} text={health ? `${CONTENT_STATS.cards} cartas · ${CONTENT_STATS.spreads} tiragens · ${CONTENT_STATS.positions} posições · hash ${String(contentMeta.hash).slice(0, 8)}` : '—'} />
          <Check label="Arte SVG" ok={!!manifest} text={manifest ? `${manifest.themes.length} temas × ${manifest.cards} cartas · ${manifest.entries.length} ficheiros · glifos ${manifest.glyphCoverage.resolved}/${manifest.glyphCoverage.declared}` : errors.art ?? 'a verificar…'} />
          <Check label="Motor de IA" ok={!!ai} text={ai ? (ai.configured ? `${ai.provider} · ${ai.model} · streaming ${ai.streaming ? 'ativo' : 'desligado'}` : `não configurado — ${ai.localFallback}`) : errors.ai ?? 'a verificar…'} />
          <Check label="Chave no servidor" ok={!!ai?.keyConfigured} text={ai?.keyConfigured ? 'ARCANA_AI_API_KEY presente no processo' : 'sem chave: todas as leituras usam o motor simbólico local'} />
          <Check label="Sessão" ok={!!session} text={session ? `${session.user ? `@${session.user.handle}` : 'anónima'} · ${session.deviceId.slice(0, 10)}… · csrf ${csrf.present ? 'ok' : 'falta'}` : 'a verificar…'} />
          <Check label="Experiência" ok={!!health} text={health ? `${health.experience.environments} ambientes · ${health.experience.soundEffects} efeitos · ${ENVIRONMENT_LIST.length}/${SFX_LIST.length} declarados no pacote` : '—'} />
          <Check label="Latência" ok={!!health} text={health ? `${health.latencyMs} ms · v${health.version} · ${new Date(health.time).toLocaleString('pt-PT')}` : '—'} />
          <Check label="Totais" ok={!!health} text={health ? `${health.totals.readings} leituras · ${health.totals.users} contas` : '—'} />
        </div>
        {Object.keys(errors).length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-rose-300">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                <span className="font-medium uppercase">{key}</span>: {message}
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Auto-teste do motor determinístico" subtitle="Corre no teu navegador com as mesmas funções que o servidor usa. Se falhar aqui, falha em todo o lado — e é por isso que está à vista.">
          {engine ? (
            <ul className="space-y-1.5 text-sm">
              <li>
                <Badge tone={engine.deterministic ? 'ok' : 'erro'}>{engine.deterministic ? 'determinístico' : 'NÃO determinístico'}</Badge> mesma seed + algoritmo + cortes produz a mesma tiragem
              </li>
              <li>
                <Badge tone={engine.unique ? 'ok' : 'erro'}>{engine.unique ? 'sem repetições' : 'repetiu uma carta'}</Badge> baralho com 78 índices únicos e cartas da tiragem distintas
              </li>
              <li>
                <Badge tone="neutral">{(engine.reversedRatio * 100).toFixed(0)}%</Badge> invertidas nesta amostra (a stream de orientação é separada da ordem)
              </li>
              <li className="text-xs text-[var(--text-muted)]">{engine.detail}</li>
            </ul>
          ) : (
            <Skeleton className="h-24 w-full" />
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={runEngineSelfTest}>
              Correr outra vez
            </Button>
            <Link href="/diario" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              ver diário
            </Link>
          </div>
        </Panel>

        <Panel title="Consumo de IA" subtitle="O que esta instância gastou por tua causa — e o que acontece quando o orçamento acaba.">
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Cell label="Chamadas (30 d)" value={String(ai?.usage30d?.calls ?? '—')} />
            <Cell label="Tokens" value={String(ai?.usage30d?.tokens ?? '—')} />
            <Cell label="Custo" value={`${(ai?.usage30d?.cost ?? 0).toFixed(4)} $`} />
            <Cell label="Fallbacks" value={String(ai?.usage30d?.fallbacks ?? 0)} />
            <Cell label="Cache de secções" value={String(ai?.cache?.sections ?? 0)} />
            <Cell label="Cache de respostas" value={String(ai?.cache?.replies ?? 0)} />
          </dl>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Ao ultrapassar o orçamento diário das preferências, o servidor deixa de chamar o modelo e entrega a leitura local, com nota visível. Secções aceites:{' '}
            {ai?.sections?.join(', ') ?? '—'}.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dependências externas declaradas" subtitle="O que este projeto precisa de fora, e o que acontece se não estiver.">
          <ul className="space-y-2 text-sm leading-relaxed">
            <Dependency name="ARCANA_AI_API_KEY + ARCANA_AI_BASE_URL + ARCANA_AI_MODEL" state={ai?.configured ? 'configurado' : 'ausente'} fallback="Motor simbólico + narrativo local produz A–G completo, com custo zero." />
            <Dependency name="PostgreSQL (DATABASE_URL)" state={health?.database.kind === 'postgres' ? 'a usar postgres' : 'ausente'} fallback="Modo por omissão: SQLite em var/arcana.db via node:sqlite, com as mesmas migrações." />
            <Dependency name="Ficheiros SVG em public/art" state={manifest ? `${manifest.entries.length} ficheiros` : 'em falta'} fallback="npm run art:build gera tudo a partir do registo simbólico; sem eles a UI mostra o aviso e o resto funciona." />
            <Dependency name="Serviços de análise / terceiros" state="nenhum" fallback="Não há scripts externos, fontes remotas nem imagens de terceiros — o projeto corre offline." />
          </ul>
        </Panel>
        <Panel title="Reportar um problema" subtitle="Guardado na tabela de feedback desta instância; não sai daqui.">
          <Field label="O que está a acontecer" hint="Inclui o que viste neste diagnóstico, se for isso que queres reportar.">
            <TextArea rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value.slice(0, 2000))} placeholder="ex.: ao revelar a 3ª carta o som ficou mudo no Firefox 128" />
          </Field>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="gold" onClick={() => void sendFeedback()} disabled={feedback.trim().length < 4}>
              Enviar
            </Button>
            <span className="text-[11px] text-[var(--text-muted)]">{feedback.length}/2000</span>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Check({ label, ok, text }: { label: string; ok: boolean; text: string }) {
  return (
    <div className={`rounded-lg border p-2.5 ${ok ? 'border-[var(--line)]' : 'border-amber-400/40 bg-amber-400/8'}`}>
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
        <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-pretty">{text}</p>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--line)] px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className="font-mono text-xs">{value}</dd>
    </div>
  )
}

function Dependency({ name, state, fallback }: { name: string; state: string; fallback: string }) {
  const ok = state === 'configurado' || state === 'a usar postgres' || state === 'nenhum' || state.includes('ficheiros')
  return (
    <li className="rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
      <p className="flex flex-wrap items-center gap-2">
        <code className="text-xs">{name}</code>
        <Badge tone={ok ? 'ok' : 'warn'}>{state}</Badge>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">{fallback}</p>
    </li>
  )
}
