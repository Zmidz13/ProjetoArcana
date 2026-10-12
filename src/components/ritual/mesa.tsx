'use client'

/**
 * A mesa do ritual: baralhar → cortar → escolher → gravar → revelar → interpretar.
 *
 * Interações suportadas na compra: clique, tecla (setas + Enter), arrastar a carta para a
 * posição activa e `A` para o motor comprar sozinho. Cada uma delas actua sobre o MESMO
 * estado lógico (ver `useRitual`), por isso a animação é o registo, não um enfeite.
 */

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useApp } from '@/components/providers.tsx'
import { Badge, Button, Field, KbdHint, Panel, Segmented, Select, Slider, Switch, TextArea, TextInput } from '@/components/ui/primitives.tsx'
import { CardArt, CardBack, SpreadMap } from '@/components/ui/art.tsx'
import type { UseRitual } from '@/hooks/use-ritual.ts'
import { getCard } from '@/domain/content.ts'
import { ENVIRONMENT_LIST } from '@/domain/experience.ts'
import { SHUFFLE_ALGORITHMS } from '@/domain/schema.ts'
import type { ShuffleAlgorithm, SpreadDef } from '@/domain/types.ts'
import { layoutFor } from '@/engine/layout.ts'

const ALGORITHM_INFO: Record<ShuffleAlgorithm, { label: string; note: string }> = {
  tradicional: { label: 'Tradicional', note: 'embaralhamento completo (Fisher–Yates) — o mais imprevisível' },
  riffle: { label: 'Riffle', note: 'duas metades entrelaçadas, como se faz com a mão' },
  overhand: { label: 'Overhand', note: 'montes sucessivos a passar de uma mão para a outra' },
  leque: { label: 'Leque', note: 'espalha, mistura e volta a juntar' },
  circular: { label: 'Circular', note: 'rodar o baralho na mesa e cortar' },
  mistico: { label: 'Místico', note: 'corte em três + ordem por elemento — usado na carta do dia' },
}

export function Mesa({ spread, ritual }: { spread: SpreadDef | undefined; ritual: UseRitual }) {
  const { prefs, deckTheme, sfx, vfx, reducedMotion } = useApp()
  const [deckView, setDeckView] = useState<'leque' | 'linha'>('leque')
  const [focusIndex, setFocusIndex] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const { phase, drawn, positions, picks, pendingPosition, order, config, patchConfig, cutSizes } = ritual
  const chosen = useMemo(() => new Set(picks.map((pick) => pick.deckIndex)), [picks])

  const points = useMemo(() => {
    const withCoords = positions.filter((position) => typeof position.x === 'number' && typeof position.y === 'number')
    if (withCoords.length === positions.length && positions.length > 0) return positions
    const computed = layoutFor(spread?.shape ?? 'row', { count: positions.length })
    return positions.map((position, index) => ({ ...position, x: computed[index]?.x ?? 0.5, y: computed[index]?.y ?? 0.5 }))
  }, [positions, spread?.shape])

  const revealCardAt = useCallback(
    (positionId: string) => {
      const index = drawn.findIndex((card) => card.positionId === positionId)
      if (index === -1 || index < ritual.revealedCount) return
      for (let step = ritual.revealedCount; step <= index; step += 1) ritual.revealNext()
    },
    [drawn, ritual],
  )

  /* Teclado global da mesa. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target?.isContentEditable) return
      const key = event.key.toLowerCase()
      if (key === 's' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        void ritual.shuffle()
      } else if (key === 'c' && phase === 'cutting') {
        event.preventDefault()
        ritual.cut(null)
      } else if (key === 'a' && (phase === 'picking' || phase === 'config')) {
        event.preventDefault()
        ritual.autoDraw()
      } else if (key === 'r' && (phase === 'ready' || phase === 'revealed')) {
        event.preventDefault()
        ritual.revealNext()
      } else if (key === 'u') {
        event.preventDefault()
        ritual.undoPick()
      } else if (key === 'escape') {
        setFocusIndex(0)
      } else if (phase === 'picking' && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault()
        const step = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1
        const jump = event.key === 'ArrowUp' || event.key === 'ArrowDown' ? 10 : 1
        setFocusIndex((current) => Math.max(0, Math.min(order.length - 1, current + step * jump)))
      } else if (phase === 'picking' && (key === 'enter' || key === ' ') && pendingPosition) {
        event.preventDefault()
        ritual.pick(focusIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusIndex, order.length, pendingPosition, phase, ritual])

  /* Arrastar para a posição activa. */
  const onCardPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, deckIndex: number) => {
      const stage = stageRef.current
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom * 0.72
      if (inside) {
        ritual.pick(deckIndex)
        vfx.emit('queda', { x: event.clientX, y: event.clientY })
      }
    },
    [ritual, vfx],
  )

  const busy = phase === 'saving' || phase === 'shuffling'
  const done = phase === 'revealed' || phase === 'interpreting' || phase === 'complete'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {phaseLabel(phase)} · {positions.length} posições · ~{spread?.estimatedMinutes ?? 10} min
            </p>
            <h1 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{spread?.name ?? 'Tiragem'}</h1>
            {config.question ? <p className="mt-1 max-w-prose text-sm italic text-[var(--text-muted)]">“{config.question}”</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="gold" title="Seed que reproduz exactamente esta tiragem">
              seed {config.seed}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => ritual.reset()}>
              Recomeçar
            </Button>
          </div>
        </header>

        <div
          ref={stageRef}
          data-phase={phase}
          className="relative aspect-[4/3.15] w-full overflow-hidden rounded-2xl border border-[var(--line)]"
          style={{
            background: `radial-gradient(115% 85% at 50% 8%, ${stageTint(prefs.environment).top}, ${stageTint(prefs.environment).bottom} 70%)`,
            boxShadow: 'inset 0 0 120px 30px rgba(0,0,0,.55)',
          }}
        >
          <FeltTexture />
          <div className="absolute inset-0" aria-hidden style={{ boxShadow: 'inset 0 0 0 1px rgba(198,166,107,.14)' }} />
          <div className={`absolute inset-0 ${startledClass(phase, ritual.startled, reducedMotion)}`}>
            {points.map((position, index) => {
              const card = drawn.find((item) => item.positionId === position.id)
              const revealed = !!card && index < ritual.revealedCount
              const isPending = !card && pendingPosition?.id === position.id
              return (
                <div
                  key={position.id}
                  className="card-slot"
                  data-empty={String(!revealed)}
                  style={
                    {
                      left: `${position.x * 100}%`,
                      top: `${position.y * 100}%`,
                      width: slotWidth(points.length),
                      ['--slot-rot' as string]: `${position.rotation ?? 0}deg`,
                      ['--slot-scale' as string]: String(position.scale ?? 1),
                    } as React.CSSProperties
                  }
                >
                  {revealed && card ? (
                    <button
                      type="button"
                      onClick={() => {
                        sfx('select', { gain: 0.4 })
                        if (index + 1 < drawn.length) ritual.revealNext()
                      }}
                      className="block w-full text-left animate-card-fly"
                      aria-label={`Posição ${index + 1}, ${position.label}: ${getCard(card.cardId)?.name.pt}, ${card.orientation === 'reversed' ? 'invertida' : 'direita'}. Activar para revelar a seguinte.`}
                    >
                      <CardArt cardId={card.cardId} theme={deckTheme} orientation={card.orientation} eager />
                      <span className="mt-1 block truncate text-[11px] font-medium text-gold-bright">{getCard(card.cardId)?.name.pt}</span>
                      <span className="block truncate text-[10px] text-[var(--text-muted)]">{position.label}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!card || busy}
                      onClick={() => card && revealCardAt(position.id)}
                      aria-label={card ? `Virar a carta da posição ${index + 1} (${position.label})` : `Posição livre: ${position.label}`}
                      data-pending={String(isPending)}
                      className={`block w-full ${card ? 'cursor-pointer' : 'cursor-default'} ${isPending ? 'animate-breathe' : ''}`}
                    >
                      <div className="card-face h-auto w-full opacity-90">
                        <CardBack theme={deckTheme} mini={!isPending} />
                      </div>
                      <span className={`mt-1 block truncate text-[10px] ${isPending ? 'text-gold-bright' : 'text-[var(--text-muted)]'}`}>
                        {index + 1}. {position.label}
                      </span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {phase === 'cutting' ? <CutOverlay ritual={ritual} /> : null}

          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--line)] bg-black/45 px-3 py-1 text-[11px] text-[var(--text-muted)] backdrop-blur">
            <SpreadMap points={points.map((point) => ({ x: point.x, y: point.y }))} active={drawn.length} size={54} showNumbers={false} />
            <span aria-hidden>·</span>
            <span>{drawn.length}/{positions.length} cartas</span>
            {cutSizes.length ? <span aria-hidden>·</span> : null}
            {cutSizes.length ? <span>cortes {cutSizes.join(' + ')}</span> : null}
          </div>
        </div>

        <DeckArea ritual={ritual} deckView={deckView} setDeckView={setDeckView} focusIndex={focusIndex} setFocusIndex={setFocusIndex} chosen={chosen} onCardPointerUp={onCardPointerUp} />

        {phase === 'ready' || done ? (
          <Panel
            title="Fechar o ritual"
            subtitle={done ? 'A leitura está gravada. Revela carta a carta e pede a interpretação.' : 'As cartas estão escolhidas. A gravação recomputa a distribuição no servidor e recusa qualquer divergência.'}
            actions={<Badge tone={picks.length === positions.length ? 'ok' : 'warn'}>{picks.length === positions.length ? 'compra manual completa' : `${drawn.length}/${positions.length} posições`}</Badge>}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button data-testid="gravar" variant="gold" onClick={() => void ritual.submit()} loading={ritual.phase === 'saving'}>
                {done ? 'Gravada ✓' : 'Gravar leitura'}
              </Button>
              {ritual.readingId ? (
                <>
                  <Button data-testid="revelar" variant="outline" onClick={() => ritual.revealNext()} disabled={ritual.revealedCount >= drawn.length}>
                    Revelar próxima <KbdHint>R</KbdHint>
                  </Button>
                  <Button variant="ghost" onClick={() => ritual.revealAll()}>
                    Revelar todas
                  </Button>
                  <Button data-testid="interpretar" variant={ritual.streaming ? 'danger' : 'primary'} onClick={() => (ritual.streaming ? ritual.abortInterpretation() : void ritual.interpret())}>
                    {ritual.streaming ? 'Interromper' : ritual.interpretation ? 'Reinterpretar' : 'Interpretar'}
                  </Button>
                  <Button data-testid="interpretar-local" variant="ghost" onClick={() => void ritual.interpret({ forceLocal: true })}>
                    Só motor simbólico
                  </Button>
                  <Link href={`/leitura/${ritual.readingId}`} className="rounded-md border border-[var(--line)] px-3 py-2 text-sm hover:border-gold">
                    Abrir leitura completa →
                  </Link>
                </>
              ) : null}
              <Button variant="ghost" onClick={() => ritual.undoPick()} disabled={picks.length === 0}>
                Tirar a última <KbdHint>U</KbdHint>
              </Button>
            </div>
            {ritual.error ? (
              <p role="alert" className="mt-3 rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">
                {ritual.error}
              </p>
            ) : null}
            {ritual.streamError ? <p className="mt-2 text-xs text-amber-200">{ritual.streamError}</p> : null}
            {ritual.interpretation ? <InterpretationLive ritual={ritual} /> : null}
            {done && !ritual.interpretation && !ritual.streaming ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Pedido de interpretação enviado ao motor híbrido. Podes abrir a leitura completa a qualquer momento — o resultado fica guardado.
              </p>
            ) : null}
          </Panel>
        ) : null}
      </div>

      <aside className="space-y-4">
        <Panel title="Preparação" subtitle="Tudo o que altera a distribuição — e só isto.">
          <div className="space-y-3">
            <Field label="Pergunta" hint="Uma pergunta concreta muda a leitura; o texto não é enviado a ninguém sem o teu consentimento.">
              <TextArea data-testid="pergunta" value={config.question} onChange={(event) => patchConfig({ question: event.target.value.slice(0, 600) })} placeholder="Que passo preciso de ver hoje?" rows={3} disabled={done} />
            </Field>
            <Field label="Nota pessoal" hint="Guardada só na tua conta/dispositivo; entra como contexto opcional.">
              <TextArea value={config.querentNote} onChange={(event) => patchConfig({ querentNote: event.target.value.slice(0, 2000) })} rows={2} disabled={done} />
            </Field>
            <Field label="Maneira de baralhar" hint={ALGORITHM_INFO[config.algorithm].note}>
              <Select
                value={config.algorithm}
                disabled={busy || done}
                onChange={(event) => patchConfig({ algorithm: event.target.value as ShuffleAlgorithm })}
                options={SHUFFLE_ALGORITHMS.map((value) => ({ value, label: ALGORITHM_INFO[value].label }))}
              />
            </Field>
            <Field label={`Cortes: ${config.cuts}`} hint={config.cutSize ? `Corte manual no índice ${config.cutSize}.` : 'Com 0 cortes o baralho vai direto à escolha.'}>
              <Slider min={0} max={3} step={1} value={config.cuts} label="Número de cortes" format={(value) => String(value)} onChange={(value) => patchConfig({ cuts: value, cutSize: undefined })} disabled={done} />
            </Field>
            <Field label="Modo de compra" hint="Como o motor retira as cartas quando não escolhes tu.">
              <Segmented
                label="Modo de compra"
                size="sm"
                value={config.drawMode}
                onChange={(value) => patchConfig({ drawMode: value })}
                options={[
                  { value: 'topo', label: 'Topo' },
                  { value: 'fundo', label: 'Fundo' },
                  { value: 'alternado', label: 'Alternado' },
                ]}
              />
            </Field>
            <Switch label="Permitir invertidas" hint="Não altera as cartas retiradas, só a orientação — podes verificar no histórico." checked={config.allowReversed} onChange={(next) => patchConfig({ allowReversed: next })} disabled={done} />
            <Switch label="Só arcanos maiores" hint="Baralho reduzido a 22 cartas." checked={config.majorsOnly} onChange={(next) => patchConfig({ majorsOnly: next })} disabled={done} />
            <Field label="Seed" hint="Repeditiva: a mesma seed + algoritmo + cortes = a mesma tiragem.">
              <div className="flex gap-2">
                <TextInput inputMode="numeric" value={String(config.seed)} onChange={(event) => patchConfig({ seed: Number(event.target.value.replace(/\D/g, '')) || 0 })} disabled={done} />
                <Button variant="outline" onClick={() => patchConfig({ seed: Math.floor(Math.random() * 4294967295) })} title="Nova seed aleatória">
                  ⟳
                </Button>
              </div>
            </Field>
            <Field label="Ambiente" hint="Muda o fundo da mesa, o som e as partículas ao mesmo tempo.">
              <Select value={config.environment} onChange={(event) => patchConfig({ environment: event.target.value as typeof config.environment })} options={ENVIRONMENT_LIST.map((item) => ({ value: item.key, label: item.name }))} />
            </Field>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button data-testid="baralhar" variant="gold" onClick={() => void ritual.shuffle()} disabled={busy || done} loading={phase === 'shuffling'}>
                Baralhar <KbdHint>S</KbdHint>
              </Button>
              <Button data-testid="comprar" variant="outline" onClick={() => ritual.autoDraw()} disabled={busy || done}>
                Comprar por mim <KbdHint>A</KbdHint>
              </Button>
            </div>
          </div>
        </Panel>

        {ritual.interpretation ? null : (
          <Panel title="Escolha manual" subtitle={phase === 'picking' ? `Posição activa: ${pendingPosition?.label ?? '—'}` : 'Baralha primeiro para poderes escolher do baralho.'}>
            <ol className="space-y-1 text-sm">
              {positions.map((position, index) => {
                const card = drawn.find((item) => item.positionId === position.id)
                const active = pendingPosition?.id === position.id
                return (
                  <li key={position.id} className={`flex items-start gap-2 rounded-md px-2 py-1.5 ${active ? 'bg-gold/12 ring-1 ring-gold/40' : ''}`}>
                    <span className="mt-0.5 w-4 text-right text-[11px] text-[var(--text-muted)]">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{position.label}</span>
                      <span className="block truncate text-xs">{card ? getCard(card.cardId)?.name.pt : position.description}</span>
                    </span>
                    {card ? <Badge tone={card.orientation === 'reversed' ? 'wine' : 'neutral'}>{card.orientation === 'reversed' ? 'inv.' : 'dir.'}</Badge> : null}
                  </li>
                )
              })}
            </ol>
          </Panel>
        )}

        <Panel title="Sobre esta tiragem" subtitle={spread?.summary}>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Info label="Forma" value={spread?.shape ?? '—'} />
            <Info label="Categoria" value={spread?.category ?? '—'} />
            <Info label="Dificuldade" value={spread?.difficulty ?? '—'} />
            <Info label="Cinematografia" value={spread?.cinematic ?? '—'} />
            <Info label="Autoria" value={spread?.author ?? '—'} />
            <Info label="Uso" value={spread?.whenToUse?.slice(0, 42) ?? '—'} />
          </dl>
          {spread?.structure?.blocks?.length ? (
            <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-muted)]">
              {spread.structure.blocks.map((block) => (
                <li key={block.id}>
                  <span className="font-medium text-[var(--text)]">{block.label}</span> — {block.note ?? `${block.positions.length} posições`}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href={`/tiragens/${spread?.id}`} className="mt-3 inline-block text-xs text-gold-bright underline-offset-4 hover:underline">
            Ficha completa da tiragem
          </Link>
        </Panel>
      </aside>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--line)] px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</dt>
      <dd className="truncate text-xs" title={value}>
        {value}
      </dd>
    </div>
  )
}

function DeckArea({
  ritual,
  deckView,
  setDeckView,
  focusIndex,
  setFocusIndex,
  chosen,
  onCardPointerUp,
}: {
  ritual: UseRitual
  deckView: 'leque' | 'linha'
  setDeckView: (next: 'leque' | 'linha') => void
  focusIndex: number
  setFocusIndex: (next: number | ((current: number) => number)) => void
  chosen: Set<number>
  onCardPointerUp: (event: React.PointerEvent<HTMLDivElement>, index: number) => void
}) {
  const { deckTheme, sfx } = useApp()
  const { order, phase, pendingPosition, picks } = ritual
  const canPick = phase === 'picking' && !!pendingPosition
  const total = order.length
  const step = 300 / Math.max(1, total - 1)

  if (phase === 'config' || phase === 'shuffling') {
    return (
      <div className="flex items-center justify-center gap-1 rounded-xl border border-[var(--line)] bg-black/25 py-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="block h-16 w-11 rounded-[4px] border border-[var(--line)] bg-[#0d0f1a]"
            style={{ transform: `translateY(${Math.sin((index / 12) * Math.PI * 2) * (phase === 'shuffling' ? 8 : 0)}px)`, transition: 'transform 220ms ease-in-out' }}
          />
        ))}
        <p className="ml-4 text-sm text-[var(--text-muted)]">{phase === 'shuffling' ? 'a baralhar — o estado lógico está a ser reconstruído' : 'prepara a pergunta e baralha'}</p>
      </div>
    )
  }

  return (
    <Panel
      title={canPick ? `Escolhe ${picks.length + 1}ª carta — posição “${pendingPosition?.label}”` : 'Baralho'}
      subtitle={canPick ? 'Clique, arrasta para a mesa ou usa as setas e Enter. As cartas já escolhidas ficam marcadas.' : 'O baralho está na mesa: cada índice é uma carta única.'}
      actions={
        <Segmented
          label="Vista do baralho"
          size="sm"
          value={deckView}
          onChange={(value) => {
            sfx('fan-open')
            setDeckView(value)
          }}
          options={[
            { value: 'leque', label: 'Leque' },
            { value: 'linha', label: 'Linha' },
          ]}
        />
      }
    >
      <div
        data-testid="baralho"
        role={canPick ? 'listbox' : undefined}
        aria-label={canPick ? 'Baralho para escolha' : undefined}
        aria-activedescendant={canPick ? `deck-${focusIndex}` : undefined}
        tabIndex={canPick ? 0 : -1}
        onKeyDown={(event) => {
          if (!canPick) return
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            setFocusIndex((current) => Math.min(total - 1, current + 1))
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setFocusIndex((current) => Math.max(0, current - 1))
          }
        }}
        className={deckView === 'linha' ? 'flex gap-1 overflow-x-auto pb-2' : 'relative mx-auto h-[190px] w-full max-w-[860px]'}
        style={deckView === 'leque' ? { perspective: '900px' } : undefined}
      >
        {order.map((cardId, index) => {
          const taken = chosen.has(index)
          const isFocused = index === focusIndex
          const selectedPick = picks.find((pick) => pick.deckIndex === index)
          const arc = deckView === 'leque' ? -1 + (index / Math.max(1, total - 1)) * 2 : 0
          const rotate = deckView === 'leque' ? arc * 34 : 0
          const lift = deckView === 'leque' ? Math.abs(arc) * 26 : 0
          return (
            <div
              key={`${cardId}-${index}`}
              id={`deck-${index}`}
              role={canPick ? 'option' : undefined}
              aria-selected={canPick ? isFocused : undefined}
              aria-disabled={taken || undefined}
              data-taken={String(taken)}
              title={taken ? 'carta já escolhida' : `índice ${index}`}
              onPointerUp={canPick && !taken ? (event) => onCardPointerUp(event, index) : undefined}
              onPointerDown={canPick ? () => sfx('drag-start', { gain: 0.4 }) : undefined}
              onClick={canPick && !taken ? () => { ritual.pick(index); setFocusIndex(Math.min(total - 1, index + 1)) } : undefined}
              onMouseEnter={canPick && !taken ? () => setFocusIndex(index) : undefined}
              className={`deck-card ${canPick && !taken ? 'cursor-pointer' : 'cursor-not-allowed'} ${deckView === 'linha' ? 'shrink-0' : 'absolute'} ${taken ? 'opacity-30 grayscale' : ''} ${isFocused ? 'z-10' : ''}`}
              style={
                deckView === 'leque'
                  ? {
                      left: `calc(50% + ${arc * (index % 2 === 0 ? 1 : 1) * (step * 0.62)}px - 26px)`,
                      bottom: `${lift}px`,
                      transform: `rotate(${rotate}deg) translateY(${isFocused ? -14 : 0}px)`,
                      width: '52px',
                      zIndex: isFocused ? 20 : 10 + Math.round((1 - Math.abs(arc)) * 5),
                      transition: 'transform 220ms var(--ease-ritual), bottom 220ms var(--ease-ritual), filter 200ms',
                    }
                  : { width: '46px', transform: `translateY(${isFocused ? -10 : 0}px)`, transition: 'transform 180ms ease-out' }
              }
            >
              <div className="card-face h-[74px] w-full sm:h-[92px]" style={deckView === 'linha' ? { height: '80px' } : { height: '112px' }}>
                {taken && selectedPick ? <CardArt cardId={cardId} theme={deckTheme} /> : <CardBack theme={deckTheme} mini />}
              </div>
              {isFocused && canPick ? <span className="sr-only">Carta no índice {index}. Prima Enter para colocar na posição {pendingPosition?.label}.</span> : null}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
        <span>
          {total} cartas · {chosen.size} já retiradas · nenhuma repetição possível
        </span>
        <span className="flex items-center gap-2">
          <KbdHint>←</KbdHint>
          <KbdHint>→</KbdHint>
          <KbdHint>Enter</KbdHint>
          <span>escolher</span>
          <KbdHint>U</KbdHint>
          <span>desfazer</span>
        </span>
      </div>
    </Panel>
  )
}

function CutOverlay({ ritual }: { ritual: UseRitual }) {
  const [size, setSize] = useState(Math.round(ritual.order.length / 2))
  const [dragging, setDragging] = useState(false)
  const total = ritual.order.length
  const percent = (size / total) * 100
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/55 p-6 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="font-display text-xl">Corte o baralho</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Arraste a linha ou usa as setas. O corte entra no registo e muda as cartas efectivamente.</p>
      </div>
      <div
        className="relative h-40 w-full max-w-md cursor-ew-resize touch-none select-none rounded-xl border border-[var(--line)] bg-black/40"
        onPointerDown={(event) => {
          setDragging(true)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!dragging) return
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = Math.max(0.04, Math.min(0.96, (event.clientX - rect.left) / rect.width))
          setSize(Math.round(ratio * total))
        }}
        onPointerUp={(event) => {
          setDragging(false)
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        <div className="absolute inset-y-3 left-3 rounded-l-lg bg-[#0d1020]" style={{ width: `calc(${percent}% - 6px)` }}>
          <Backs count={7} />
        </div>
        <div className="absolute inset-y-3 right-3 rounded-r-lg bg-[#0d1020]" style={{ width: `calc(${100 - percent}% - 6px)` }}>
          <Backs count={7} />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-gold" style={{ left: `${percent}%` }} role="separator" aria-label={`Corte no índice ${size} de ${total}`} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button data-testid="cortar-aqui" variant="gold" onClick={() => ritual.cut(size)}>
          Cortar aqui ({size}/{total})
        </Button>
        <Button variant="outline" onClick={() => ritual.cut(null)}>
          Corte sorteado
        </Button>
        <Button data-testid="nao-cortar" variant="ghost" onClick={() => ritual.cut(0)}>
          Não cortar
        </Button>
      </div>
    </div>
  )
}

function Backs({ count }: { count: number }) {
  return (
    <div className="flex h-full items-center justify-center gap-0.5 overflow-hidden p-1">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="h-full w-2 rounded-[2px] border border-[var(--line)] bg-[#131a2c]" />
      ))}
    </div>
  )
}

function InterpretationLive({ ritual }: { ritual: UseRitual }) {
  const interpretation = ritual.interpretation
  const sections = useMemo(() => {
    if (!interpretation) return []
    return [
      { key: 'opening', label: 'Abertura', text: interpretation.opening },
      { key: 'per-card', label: 'Carta a carta', list: interpretation.perCard.map((item) => `${item.cardName} · ${item.positionLabel}: ${item.core}`) },
      { key: 'combinations', label: 'Combinações', list: interpretation.combinations.map((item) => `${item.cards.join(' + ')} (${item.kind}): ${item.note}`) },
      { key: 'synthesis', label: 'Síntese', list: interpretation.synthesis },
      { key: 'guidance', label: 'Orientações', list: interpretation.practical },
      { key: 'reflection', label: 'Perguntas', list: interpretation.reflection },
      { key: 'closing', label: 'Mensagem final', text: interpretation.closing },
    ]
  }, [interpretation])
  const live = ritual.liveSections
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone={interpretation?.meta.generator === 'llm' ? 'astral' : 'gold'}>{interpretation?.meta.generator === 'llm' ? `IA · ${interpretation.meta.model ?? 'modelo'}` : 'motor simbólico local'}</Badge>
        <span className="text-[var(--text-muted)]">
          {interpretation?.meta.voice} · {interpretation?.meta.register} · {interpretation?.meta.depth}
        </span>
        {interpretation ? <span className="text-[var(--text-muted)]">hash {interpretation.meta.contextHash.slice(0, 10)}</span> : null}
      </div>
      {sections.map((section) => {
        const streamed = live[section.key]
        return (
          <article key={section.key} className="rounded-lg border border-[var(--line)] bg-black/25 p-3">
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-gold-bright">{section.label}</h3>
            {'text' in section && section.text ? <p className="mt-1.5 text-sm leading-relaxed text-pretty">{section.text}</p> : null}
            {streamed && !('list' in section) ? <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{streamed}</p> : null}
            {'list' in section && section.list ? (
              <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed">
                {section.list.map((line, index) => (
                  <li key={`${section.key}-${index}`} className="text-pretty">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        )
      })}
      {ritual.streaming ? <p className="text-xs text-[var(--text-muted)]">a escrever…</p> : null}
    </div>
  )
}

function FeltTexture() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" preserveAspectRatio="none">
      <filter id="felt">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#felt)" />
    </svg>
  )
}

function stageTint(environment: string): { top: string; bottom: string } {
  const found = ENVIRONMENT_LIST.find((item) => item.key === environment)
  if (!found) return { top: 'rgba(60,50,90,.55)', bottom: '#0b0a12' }
  return { top: hexToRgba(found.palette.glow, 0.16), bottom: found.palette.base }
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value
  const num = Number.parseInt(full, 16)
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
}

function startledClass(phase: string, startled: boolean, reduced: boolean): string {
  if (reduced || phase !== 'shuffling' || !startled) return ''
  return 'animate-[shake_380ms_ease-in-out_infinite]'
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    config: 'preparação',
    shuffling: 'a baralhar',
    cutting: 'a cortar',
    picking: 'a escolher',
    ready: 'escolha concluída',
    saving: 'a gravar no registo',
    revealed: 'a revelar',
    interpreting: 'a interpretar',
    complete: 'leitura completa',
    error: 'interrupção',
  }
  return labels[phase] ?? phase
}

function slotWidth(count: number): string {
  if (count <= 1) return 'clamp(150px, 26vw, 230px)'
  if (count <= 3) return 'clamp(96px, 17vw, 150px)'
  if (count <= 6) return 'clamp(74px, 12.5vw, 112px)'
  if (count <= 10) return 'clamp(60px, 9.6vw, 88px)'
  return 'clamp(44px, 6.4vw, 64px)'
}
