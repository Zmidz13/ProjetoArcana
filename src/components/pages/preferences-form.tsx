'use client'

import { useEffect, useMemo, useState } from 'react'

import { Badge, Button, Field, Panel, Segmented, Select, Slider, Switch, TextArea, TextInput } from '@/components/ui/primitives.tsx'
import { useApp } from '@/components/providers.tsx'
import { api } from '@/lib/api.ts'
import { DEFAULT_PREFERENCES, ENVIRONMENT_LIST, REGISTER_DESCRIPTIONS, VOICE_DESCRIPTIONS, type Preferences } from '@/domain/experience.ts'
import { DEPTHS, REGISTERS, VOICES } from '@/domain/interpretation.ts'
import { SHUFFLE_ALGORITHMS } from '@/domain/schema.ts'

type PrefPatch = Partial<Preferences>

/**
 * Preferências. Cada controlo escreve no servidor (conta ou dispositivo) com debounce e
 * mostra o estado real do pedido — não há "guardar" simbólico: o que vês é o que o motor
 * vai usar na próxima leitura.
 */
export function PreferencesForm() {
  const { prefs, patchPrefs, prefsReady, saveError, retryPrefs, session, toast, audio, vfx, reducedMotion, deckTheme, setDeckTheme } = useApp()
  const [ai, setAi] = useState<{ configured: boolean; provider: string | null; model: string | null; keyConfigured: boolean } | null>(null)
  const [decks, setDecks] = useState<{ id: string; name: string; theme: string; allowReversed: boolean; cardCount: number }[]>([])
  const [raw, setRaw] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    void api<{ configured: boolean; provider: string | null; model: string | null; keyConfigured: boolean }>('/api/ai/status')
      .then(setAi)
      .catch(() => setAi(null))
    void api<{ decks: { id: string; name: string; theme: string; allowReversed: boolean; cardIds?: string[]; onlyMajors?: boolean }[] }>('/api/decks')
      .then((response) => setDecks(response.decks.map((deck) => ({ id: deck.id, name: deck.name, theme: deck.theme, allowReversed: deck.allowReversed, cardCount: deck.cardIds?.length ?? 78 }))))
      .catch(() => setDecks([]))
  }, [])

  const usage = session?.usage

  const summary = useMemo(
    () =>
      [
        `${prefs.voice} · ${prefs.register} · ${prefs.depth}`,
        `${prefs.algorithm}, ${prefs.cuts} corte(s), ${prefs.drawMode}`,
        prefs.allowReversed ? 'invertidas ativas' : 'só direitas',
        `ambiente ${prefs.environment}`,
        `IA ${prefs.ai.useLlm ? 'híbrida' : 'local'} · orçamento ${prefs.ai.dailyBudgetUsd} $/dia`,
      ],
    [prefs],
  )

  return (
    <div className="space-y-4">
      <Panel
        title="Preferências"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {summary.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={saveError ? 'erro' : prefsReady ? 'ok' : 'neutral'}>{saveError ? 'erro ao guardar' : prefsReady ? 'sincronizado' : 'a carregar'}</Badge>
            {saveError ? (
              <Button size="sm" variant="danger" onClick={retryPrefs}>
                Tentar outra vez
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                patchPrefs(DEFAULT_PREFERENCES as PrefPatch)
                toast('Preferências repostas no padrão.', 'ok')
              }}
            >
              Repor padrão
            </Button>
          </div>
        }
      >
        {saveError ? <p role="alert" className="mb-3 rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">{saveError}</p> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="font-display text-base text-gold-bright">Voz da interpretação</h2>
            <Field label="Voz" hint={VOICE_DESCRIPTIONS[prefs.voice]}>
              <Select value={prefs.voice} onChange={(event) => patchPrefs({ voice: event.target.value as Preferences['voice'] })} options={VOICES.map((voice) => ({ value: voice, label: voice }))} />
            </Field>
            <Field label="Registo" hint={REGISTER_DESCRIPTIONS[prefs.register]}>
              <Select value={prefs.register} onChange={(event) => patchPrefs({ register: event.target.value as Preferences['register'] })} options={REGISTERS.map((register) => ({ value: register, label: register }))} />
            </Field>
            <Field label="Profundidade" hint="curta = A/B/D/G; ritual = tudo, com pausas e perguntas por posição.">
              <Segmented
                label="Profundidade"
                value={prefs.depth}
                onChange={(value) => patchPrefs({ depth: value })}
                options={DEPTHS.map((depth) => ({ value: depth, label: depth }))}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-base text-gold-bright">Física do baralho</h2>
            <Field label="Maneira de baralhar" hint="É o padrão para novas mesas; na mesa podes mudar à vontade.">
              <Select value={prefs.algorithm} onChange={(event) => patchPrefs({ algorithm: event.target.value as Preferences['algorithm'] })} options={SHUFFLE_ALGORITHMS.map((algorithm) => ({ value: algorithm, label: algorithm }))} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`Cortes: ${prefs.cuts}`}>
                <Slider label="Cortes" min={0} max={3} step={1} value={prefs.cuts} format={(value) => String(value)} onChange={(value) => patchPrefs({ cuts: value })} />
              </Field>
              <Field label="Modo de compra">
                <Segmented
                  label="Modo de compra"
                  size="sm"
                  value={prefs.drawMode}
                  onChange={(value) => patchPrefs({ drawMode: value })}
                  options={[
                    { value: 'topo', label: 'Topo' },
                    { value: 'fundo', label: 'Fundo' },
                    { value: 'alternado', label: 'Alternado' },
                  ]}
                />
              </Field>
            </div>
            <Switch label="Permitir invertidas" hint="Não altera as cartas retiradas, só a orientação." checked={prefs.allowReversed} onChange={(next) => patchPrefs({ allowReversed: next })} />
            <Field label="Baralho preferido" hint="Um baralho próprio é um subconjunto do canónico (ex.: só maiores, ou só copas).">
              <Select
                value={prefs.deckId ?? ''}
                onChange={(event) => patchPrefs({ deckId: event.target.value || null })}
                options={[{ value: '', label: 'Baralho completo (78)' }, ...decks.map((deck) => ({ value: deck.id, label: `${deck.name} · ${deck.cardCount} cartas · ${deck.theme}` }))]}
              />
            </Field>
            <Field label="Tema de ilustração" hint="Troca o vestuário visual das 78 cartas, sem tocar no conteúdo.">
              <Select value={deckTheme} onChange={(event) => setDeckTheme(event.target.value)} options={[...new Set([deckTheme, 'obsidiana', 'ouro-velho', 'linho', 'nanquim', 'vitral', 'nocturno', 'cinza'])].map((value) => ({ value, label: value }))} />
            </Field>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-base text-gold-bright">Som e movimento</h2>
            <Field label="Ambiente" hint="Define fundo, ambulância sonora e partículas. Tudo sintetizado no navegador.">
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {ENVIRONMENT_LIST.map((environment) => {
                  const active = prefs.environment === environment.key
                  return (
                    <li key={environment.key}>
                      <button
                        type="button"
                        onClick={() => patchPrefs({ environment: environment.key })}
                        aria-pressed={active}
                        className={`w-full rounded-lg border p-2 text-left transition-colors ${active ? 'border-gold bg-gold/12' : 'border-[var(--line)] hover:border-gold/50'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: environment.palette.glow }} />
                          <span className="truncate text-xs font-medium">{environment.name}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-[var(--text-muted)]">{environment.subtitle}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Field>
            <Switch label="Som activado" hint="Se desligares, o grafo de áudio fica mudo mas intacto." checked={prefs.audio.enabled} onChange={(next) => patchPrefs({ audio: { ...prefs.audio, enabled: next } })} />
            <Switch label="Arranjar sozinho ao primeiro clique" hint="Os navegadores exigem um gesto: com isto ligado, o ambiente entra no primeiro toque do dia." checked={prefs.audio.autoplay} onChange={(next) => patchPrefs({ audio: { ...prefs.audio, autoplay: next } })} />
            <Field label="Volume da ambulância">
              <Slider label="Ambulância" value={prefs.audio.ambience} onChange={(value) => patchPrefs({ audio: { ...prefs.audio, ambience: value } })} />
            </Field>
            <Field label="Volume dos efeitos">
              <Slider label="Efeitos" value={prefs.audio.effects} onChange={(value) => patchPrefs({ audio: { ...prefs.audio, effects: value } })} />
            </Field>
            <Field label="Intensidade das partículas">
              <Slider label="Partículas" value={prefs.motion.vfx} onChange={(value) => patchPrefs({ motion: { ...prefs.motion, vfx: value } })} format={(value) => (value === 0 ? 'desligadas' : `${Math.round(value * 100)}%`)} />
            </Field>
            <Field label={`Velocidade das animações: ${prefs.motion.speed.toFixed(2)}×`}>
              <Slider label="Velocidade" min={0.4} max={2} step={0.05} value={prefs.motion.speed} onChange={(value) => patchPrefs({ motion: { ...prefs.motion, speed: value } })} format={(value) => `${value.toFixed(2)}×`} />
            </Field>
            <Switch label="Respeitar o pedido do sistema (reduced motion)" hint={reducedMotion ? 'Neste momento o modo reduzido está ativo.' : 'Neste momento o sistema não pede redução de movimento.'} checked={prefs.motion.respectSystem} onChange={(next) => patchPrefs({ motion: { ...prefs.motion, respectSystem: next } })} />
            <Switch label="Forçar menos movimento" hint="Corta rotações, partículas e varrimentos; mantém a informação." checked={prefs.motion.forceReduced} onChange={(next) => patchPrefs({ motion: { ...prefs.motion, forceReduced: next } })} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void audio.resume().then(() => audio.play('moon-chime'))}>
                Ouvir o ambiente atual
              </Button>
              <Button size="sm" variant="ghost" onClick={() => vfx.emit('sabbat', { x: window.innerWidth / 2, y: window.innerHeight / 2, width: 600 })}>
                Ver partículas
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-base text-gold-bright">Acessibilidade</h2>
            <Switch label="Alto contraste" hint="Fundo preto puro, linhas brancas, sem gradientes." checked={prefs.accessibility.highContrast} onChange={(next) => patchPrefs({ accessibility: { ...prefs.accessibility, highContrast: next } })} />
            <Switch label="Texto maior" hint="Escala 118% na raíz — tudo o que está em rem cresce." checked={prefs.accessibility.largeText} onChange={(next) => patchPrefs({ accessibility: { ...prefs.accessibility, largeText: next } })} />
            <Switch label="Legendas de estado" hint="Anuncia em texto o que soa (carta invertida, confirmada, erro)." checked={prefs.accessibility.captions} onChange={(next) => patchPrefs({ accessibility: { ...prefs.accessibility, captions: next } })} />
            <Switch label="Mostrar atalhos de teclado" hint="Os <kbd> no rodapé das acções." checked={prefs.accessibility.keyboardHints} onChange={(next) => patchPrefs({ accessibility: { ...prefs.accessibility, keyboardHints: next } })} />
            <Switch label="Reduzir flashes" hint="Limita brilhos súbitos nas revelações." checked={prefs.accessibility.reduceFlashes} onChange={(next) => patchPrefs({ accessibility: { ...prefs.accessibility, reduceFlashes: next } })} />
            <h2 className="pt-2 font-display text-base text-gold-bright">IA</h2>
            <Switch label="Usar modelo de linguagem" hint={ai?.configured ? `Ligado: ${ai.provider} · ${ai.model}` : 'Sem chave no servidor: o motor simbólico local assume tudo.'} checked={prefs.ai.useLlm} onChange={(next) => patchPrefs({ ai: { ...prefs.ai, useLlm: next } })} />
            <Switch label="Enviar pergunta e notas como contexto" hint="Se desligares, o modelo só vê as cartas e as posições." checked={prefs.ai.shareContext} onChange={(next) => patchPrefs({ ai: { ...prefs.ai, shareContext: next } })} />
            <Field label={`Orçamento diário: ${prefs.ai.dailyBudgetUsd.toFixed(2)} $`} hint={'Últimos ' + (usage?.days ?? 30) + ' dias: ' + (usage?.cost ?? 0).toFixed(4) + ' $ em ' + (usage?.calls ?? 0) + ' chamadas' + (usage?.fallbacks ? ' · ' + usage.fallbacks + ' vezes caíu no motor local' : '') + ' · ao ultrapassares o orçamento diário o servidor passa a local.'}>
              <Slider label="Orçamento" min={0} max={10} step={0.25} value={prefs.ai.dailyBudgetUsd} format={(value) => `${value.toFixed(2)} $`} onChange={(value) => patchPrefs({ ai: { ...prefs.ai, dailyBudgetUsd: value } })} />
            </Field>
            <Field label={`Limite de saída: ${prefs.ai.maxOutputTokens} tokens`} hint="Controla o comprimento e o custo de cada resposta.">
              <Slider label="Tokens" min={256} max={8192} step={256} value={prefs.ai.maxOutputTokens} format={(value) => String(value)} onChange={(value) => patchPrefs({ ai: { ...prefs.ai, maxOutputTokens: value } })} />
            </Field>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              As chaves de API vivem apenas no servidor (`ARCANA_AI_API_KEY`); nenhum pedido do navegador as vê.{' '}
              <a href="/sobre#ia" className="text-gold-bright underline-offset-4 hover:underline">
                como configurar
              </a>
              .
            </p>
          </section>
        </div>

        <section className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
          <h2 className="font-display text-base text-gold-bright">Carta do dia e importação</h2>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Field label="Salt pessoal" hint="Muda a tua sequência diária sem alterar a de mais ninguém.">
              <TextInput value={prefs.dailySalt} onChange={(event) => patchPrefs({ dailySalt: event.target.value.slice(0, 40) })} placeholder="ex.: um nome, uma cidade" />
            </Field>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => setRaw(JSON.stringify(prefs, null, 2))}>
                Ver JSON
              </Button>
            </div>
          </div>
          {raw ? (
            <div className="space-y-2">
              <TextArea rows={10} value={raw} onChange={(event) => setRaw(event.target.value)} aria-label="JSON das preferências" className="font-mono text-[11px]" />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="gold"
                  loading={importing}
                  onClick={async () => {
                    setImporting(true)
                    try {
                      const parsed = JSON.parse(raw) as PrefPatch
                      patchPrefs(parsed)
                      toast('Preferências importadas.', 'ok')
                    } catch (caught) {
                      toast(caught instanceof Error ? `JSON inválido: ${caught.message.slice(0, 90)}` : 'JSON inválido.', 'erro')
                    } finally {
                      setImporting(false)
                    }
                  }}
                >
                  Aplicar este JSON
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void navigator.clipboard?.writeText(raw).then(() => toast('Copiado.', 'ok')).catch(() => toast('Não foi possível copiar.', 'erro'))}>
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRaw('')}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : null}
          {prefs.deckId === null && decks.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)]">Ainda não criaste baralhos próprios — crias em Conta e dados.</p>
          ) : null}
        </section>
      </Panel>
    </div>
  )
}
