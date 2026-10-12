'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, Button, Field, Panel, Segmented, Select, Skeleton, Switch, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt } from '@/components/ui/art.tsx'
import { useApp, useCsrfProbe } from '@/components/providers.tsx'
import { ApiError, api, formatDateTime } from '@/lib/api.ts'
import { CARDS } from '@/domain/content.ts'
import { DEPTHS } from '@/domain/interpretation.ts'
import type { Suit } from '@/domain/types.ts'

interface DeckRow {
  id: string
  name: string
  deck_kind?: string
  deckKind?: string
  theme: string
  allow_reversed?: number | boolean
  allowReversed?: boolean
  only_majors?: number | boolean
  onlyMajors?: boolean
  card_ids?: string[] | string
  cardIds?: string[]
  created_at?: string
  createdAt?: string
}

/** Conta, baralhos próprios, dados e pedidos de eliminação — tudo no mesmo sítio. */
export function AccountPanel() {
  const { session, sessionReady, refreshSession, toast, sfx } = useApp()
  const csrf = useCsrfProbe()
  const [decks, setDecks] = useState<DeckRow[]>([])
  const [counts, setCounts] = useState<{ readings: number; days: number; starred: number } | null>(null)
  const [spreadsCount, setSpreadsCount] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [reclaimMessage, setReclaimMessage] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [deckResponse, stats, spreads] = await Promise.all([
        api<{ decks: DeckRow[]; default: { id: null; name: string; size: number } }>('/api/decks'),
        api<{ totals: { readings: number; days: number; starred: number } }>('/api/stats').catch(() => null),
        api<{ total: number; spreads: unknown[] }>('/api/spreads').catch(() => null),
      ])
      setDecks(deckResponse.decks)
      if (stats) setCounts({ readings: stats.totals.readings, days: stats.totals.days, starred: stats.totals.starred })
      if (spreads) setSpreadsCount(spreads.total ?? (spreads.spreads as unknown[]).length)
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Sem sessão para ler os dados.', 'erro')
    }
  }, [toast])

  useEffect(() => {
    void reload()
  }, [reload, session?.user?.id])

  const logout = async () => {
    setBusy(true)
    try {
      await api('/api/auth/logout', { method: 'POST' })
      await refreshSession()
      toast('Sessão terminada. As leituras deste dispositivo continuam acessíveis sem conta.', 'ok')
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao sair.', 'erro')
    } finally {
      setBusy(false)
    }
  }

  const claim = async () => {
    setClaiming(true)
    try {
      const response = await api<{ ok: boolean; claimed: number }>('/api/auth/claim', { method: 'POST' })
      setReclaimMessage(response.claimed ? `${response.claimed} leitura(s) deste dispositivo passaram para a conta.` : 'Não havia leituras soltas deste dispositivo para reclamar — o registo já tinha feito isto.')
      sfx('confirm')
      await reload()
    } catch (caught) {
      setReclaimMessage(caught instanceof ApiError ? caught.message : 'A reclamação não chegou ao servidor.')
      sfx('error')
    } finally {
      setClaiming(false)
    }
  }

  const user = session?.user

  if (!sessionReady) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title={user ? `@${user.handle}` : 'Sem conta'}
          subtitle={user ? (user.displayName ? `${user.displayName} · conta desde ${formatDateTime(user.createdAt)}` : `conta criada em ${formatDateTime(user.createdAt)}`) : 'Estás a usar a sessão anónima deste dispositivo.'}
          actions={
            <div className="flex items-center gap-2">
              {user ? (
                <Button size="sm" variant="outline" onClick={() => void logout()} loading={busy}>
                  Terminar sessão
                </Button>
              ) : (
                <>
                  <Link href="/entrar" className="rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-[#12100a] hover:bg-gold-bright">
                    Entrar
                  </Link>
                  <Link href="/registar" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          }
        >
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Identificador do dispositivo" value={session?.deviceId ?? '—'} mono />
            <Row label="Cookie CSRF presente" value={csrf.present ? `sim (${csrf.preview})` : 'não'} mono />
            <Row label="Leituras" value={counts ? `${counts.readings} em ${counts.days} dia(s)` : '—'} />
            <Row label="Favoritas" value={counts ? String(counts.starred) : '—'} />
            <Row label="Tiragens próprias" value={spreadsCount === null ? '—' : String(spreadsCount)} />
            <Row label="Baralhos próprios" value={String(decks.length)} />
            <Row label="IA" value={session?.ai.configured ? `${session.ai.provider} · ${session.ai.model}` : 'motor local'} />
            <Row label="Consumo de IA (30 d)" value={session?.usage ? `${session.usage.calls} chamadas · ${session.usage.cost.toFixed(4)} $` : '—'} />
          </dl>
          {!user ? (
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
              Sem conta nada é perdido: as leituras ficam ligadas à cookie `arcana_device`. Limpares os cookies do navegador é que as apaga — por isso exportar
              regularmente é a recomendação honesta.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => void claim()} loading={claiming}>
                Reclamar leituras deste dispositivo
              </Button>
              {reclaimMessage ? <span className="text-xs text-[var(--text-muted)]">{reclaimMessage}</span> : null}
            </div>
          )}
        </Panel>

        <DecksEditor decks={decks} onChange={reload} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Os teus dados" subtitle="Tudo o que a plataforma guarda, e onde.">
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>· <span className="font-medium">Leituras</span>: pergunta, cartas, orientação, seed, algoritmo, cortes, ambiente, duração, nota privada, token de partilha.</li>
            <li>· <span className="font-medium">Interpretações</span>: texto A–G, gerador, modelo, tokens, custo, hash do contexto.</li>
            <li>· <span className="font-medium">Conversa</span>: perguntas e respostas depois de cada leitura.</li>
            <li>· <span className="font-medium">Diário</span>: humor, energia, clareza, sono, nota — valores declarados por ti.</li>
            <li>· <span className="font-medium">Tiragens e baralhos próprios</span>, preferências, telemetria de uso (contagens, sem conteúdo).</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/api/export?format=json" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              JSON
            </Link>
            <Link href="/api/export?format=zip" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              ZIP completo
            </Link>
            <Link href="/api/export?format=csv" className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:border-gold">
              CSV
            </Link>
          </div>
        </Panel>
        <Panel title="Eliminar" subtitle="A eliminação de uma leitura é imediata no histórico; o pedido de eliminação de conta é tratado por quem mantém a instância.">
          <DeleteRequest onDone={(message) => toast(message, 'ok')} />
        </Panel>
      </div>

      <Panel title="Preferências rápidas" subtitle="Atalhos para o que mais muda. O formulário completo está em Preferências.">
        <QuickPrefs />
      </Panel>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--line)] pb-1.5 last:border-0">
      <dt className="shrink-0 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className={`min-w-0 truncate text-right ${mono ? 'font-mono text-[11px]' : ''}`} title={value}>
        {value}
      </dd>
    </div>
  )
}

function QuickPrefs() {
  const { prefs, patchPrefs } = useApp()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Voz da interpretação">
        <Select
          value={prefs.voice}
          onChange={(event) => patchPrefs({ voice: event.target.value as typeof prefs.voice })}
          options={['mistica', 'acolhedora', 'direta', 'sabia', 'poetica', 'analitica'].map((value) => ({ value, label: value }))}
        />
      </Field>
      <Field label="Profundidade">
        <Segmented
          label="Profundidade"
          size="sm"
          value={prefs.depth}
          onChange={(value) => patchPrefs({ depth: value })}
          options={DEPTHS.map((value) => ({ value, label: value }))}
        />
      </Field>
      <Switch label="Permitir invertidas" checked={prefs.allowReversed} onChange={(next) => patchPrefs({ allowReversed: next })} />
      <Switch label="Usar IA quando disponível" checked={prefs.ai.useLlm} onChange={(next) => patchPrefs({ ai: { ...prefs.ai, useLlm: next } })} />
      <Link href="/preferencias" className="text-sm text-gold-bright underline-offset-4 hover:underline sm:col-span-2">
        Abrir todas as preferências →
      </Link>
    </div>
  )
}

function DecksEditor({ decks, onChange }: { decks: DeckRow[]; onChange: () => void }) {
  const { toast, sfx, deckTheme, setDeckTheme } = useApp()
  const [name, setName] = useState('')
  const [kind, setKind] = useState<'riders' | 'marselha' | 'tematico' | 'proprio'>('proprio')
  const [theme, setTheme] = useState(deckTheme)
  const [allowReversed, setAllowReversed] = useState(true)
  const [onlyMajors, setOnlyMajors] = useState(false)
  const [suit, setSuit] = useState<Suit | 'todos'>('todos')
  const [busy, setBusy] = useState(false)
  const [selection, setSelection] = useState<Set<string>>(new Set())

  const candidates = useMemo(() => {
    let list = CARDS
    if (onlyMajors) list = list.filter((card) => card.arcana === 'major')
    if (suit !== 'todos') list = list.filter((card) => card.suit === suit)
    return list
  }, [onlyMajors, suit])

  const create = async () => {
    setBusy(true)
    try {
      const cardIds = selection.size > 0 ? [...selection] : candidates.map((card) => card.id)
      await api('/api/decks', { method: 'POST', body: { name: name.trim() || `${suit}-${cardIds.length}`, deckKind: kind, theme, allowReversed, onlyMajors, cardIds } })
      sfx('confirm')
      toast(`Baralho “${name.trim() || `${suit}-${cardIds.length} cartas`}” criado.`, 'ok')
      setName('')
      setSelection(new Set())
      onChange()
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao criar o baralho.', 'erro')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await api(`/api/decks?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      toast('Baralho removido.', 'ok')
      onChange()
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao remover.', 'erro')
    }
  }

  return (
    <Panel title="Baralhos próprios" subtitle="Subconjuntos do baralho canónico com tema de arte próprio. Não se desenham cartas novas aqui: recorta-se o baralho.">
      <div className="space-y-2.5">
        <Field label="Nome do baralho">
          <TextInput value={name} onChange={(event) => setName(event.target.value.slice(0, 60))} placeholder="ex.: Copas para os vínculos" />
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Tema de arte">
            <Select value={theme} onChange={(event) => setTheme(event.target.value)} options={['obsidiana', 'ouro-velho', 'linho', 'nanquim', 'vitral', 'nocturno', 'cinza'].map((value) => ({ value, label: value }))} />
          </Field>
          <Field label="Tipo">
            <Select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} options={[{ value: 'riders', label: 'riders' }, { value: 'marselha', label: 'marselha' }, { value: 'tematico', label: 'temático' }, { value: 'proprio', label: 'próprio' }]} />
          </Field>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <Switch label="Só arcanos maiores" checked={onlyMajors} onChange={setOnlyMajors} />
          <Switch label="Permitir invertidas" checked={allowReversed} onChange={setAllowReversed} />
        </div>
        <Field label="Naipe" hint="Com naipe escolhido, o baralho fica só com essas cartas (a menos que marques à mão).">
          <Segmented
            label="Naipe"
            size="sm"
            value={suit}
            onChange={setSuit}
            options={[
              { value: 'todos', label: 'todos' },
              { value: 'wands', label: 'paus' },
              { value: 'cups', label: 'copas' },
              { value: 'swords', label: 'espadas' },
              { value: 'pentacles', label: 'ouros' },
            ]}
          />
        </Field>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--line)] p-2">
          <ul className="grid grid-cols-4 gap-1 sm:grid-cols-6">
            {candidates.map((card) => {
              const picked = selection.has(card.id)
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelection((current) => {
                        const next = new Set(current)
                        if (next.has(card.id)) next.delete(card.id)
                        else next.add(card.id)
                        return next
                      })
                    }
                    aria-pressed={picked}
                    className={`block w-full rounded border p-0.5 transition-colors ${picked ? 'border-gold bg-gold/20' : 'border-transparent hover:border-gold/50'}`}
                    title={card.name.pt}
                  >
                    <span className="card-face block aspect-[300/520] w-full">
                      <CardArt cardId={card.id} theme={deckTheme} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">
          {selection.size > 0 ? `${selection.size} cartas marcadas à mão.` : `Sem marcação: usam-se as ${candidates.length} cartas do filtro.`}{' '}
          <button type="button" className="text-gold-bright underline-offset-4 hover:underline" onClick={() => setSelection(new Set(candidates.map((card) => card.id)))}>
            marcar todas
          </button>
        </p>
        <Button variant="gold" onClick={() => void create()} loading={busy} disabled={candidates.length < 3 && selection.size < 3}>
          Criar baralho
        </Button>
        {decks.length ? (
          <ul className="mt-2 space-y-1.5 border-t border-[var(--line)] pt-2 text-xs">
            {decks.map((deck) => (
              <li key={deck.id} className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{deck.name}</span>
                  <span className="text-[var(--text-muted)]">
                    {idsOf(deck).length} cartas · {deck.theme} · {truthy(deck.allowReversed ?? deck.allow_reversed) ? 'invertidas' : 'só direitas'}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => { setDeckTheme(deck.theme); sfx('toggle') }} className="rounded border border-[var(--line)] px-1.5 py-0.5 hover:border-gold" title="Usar o tema de arte deste baralho">
                    tema
                  </button>
                  <button type="button" onClick={() => void remove(deck.id)} className="rounded border border-[var(--line)] px-1.5 py-0.5 text-rose-300 hover:border-rose-400" title="Apagar baralho">
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)]">Ainda não criaste baralhos. <Badge tone="neutral">0 próprios</Badge></p>
        )}
      </div>
    </Panel>
  )
}

function idsOf(deck: DeckRow): string[] {
  const raw = deck.cardIds ?? deck.card_ids
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  }
  return []
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === '1'
}

function DeleteRequest({ onDone }: { onDone: (message: string) => void }) {
  const { session, toast } = useApp()
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="space-y-2.5">
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        Apagar uma leitura do <Link href="/historico" className="text-gold-bright underline-offset-4 hover:underline">histórico</Link> é imediato (soft delete).
        Para apagar a conta e o registo todo, deixa o pedido: quem mantém a instância executa a eliminação definitiva e confirma-te.
      </p>
      <Field label="Pedido de eliminação" hint="O texto vai para a fila de feedback desta instância.">
        <TextInput value={reason} onChange={(event) => setReason(event.target.value.slice(0, 400))} placeholder="ex.: apagar tudo o que tenho nesta instância" />
      </Field>
      <Switch label="Confirmo que quero apagar a minha conta e dados" checked={confirm} onChange={setConfirm} />
      <Button
        variant="danger"
        loading={busy}
        disabled={!confirm || !session?.user}
        onClick={async () => {
          setBusy(true)
          try {
            await api('/api/feedback', { method: 'POST', body: { area: 'eliminacao-de-dados', message: `Pedido de eliminação de conta de @${session?.user?.handle}. ${reason}`.trim(), contact: session?.user?.email ?? '' } })
            onDone('Pedido registado nesta instância. A eliminação definitiva é feita por quem a administra.')
            setConfirm(false)
            setReason('')
          } catch (caught) {
            toast(caught instanceof ApiError ? caught.message : 'Falha no pedido.', 'erro')
          } finally {
            setBusy(false)
          }
        }}
      >
        {session?.user ? 'Enviar pedido' : 'só para contas'}
      </Button>
    </div>
  )
}
