'use client'

import { useEffect, useMemo, useRef } from 'react'

import { Badge, Button, Field, Panel, Slider, Switch } from '@/components/ui/primitives.tsx'
import { useApp } from '@/components/providers.tsx'
import { ENVIRONMENT_LIST, SFX_LIST } from '@/domain/experience.ts'
import { previousFullMoons, upcomingSabbat } from '@/engine/cycle.ts'

/**
 * Banco de som e de partículas: ouvir cada ambiente e cada efeito individualmente.
 * Não há ficheiros de áudio — tudo o que aqui toca é sintetizado em `src/audio/engine.ts`,
 * por isso cada acção tem um timbre próprio e nada é reutilizado de outra acção.
 */
export function SoundPanel() {
  const { prefs, patchPrefs, audio, audioState, vfx, reducedMotion, toast } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const moon = useMemo(() => previousFullMoons(1, new Date())[0] ?? null, [])
  const sabbat = useMemo(() => {
    const next = upcomingSabbat(new Date())
    return next ? { ...next.sabbat, daysUntil: next.daysUntil } : null
  }, [])

  /* Pré-visualização de partículas isolada, sem depender da mesa. */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    let raf = 0
    let stop = false
    const tick = () => {
      if (stop) return
      const kinds = ['poeira', 'faiscas', 'bruma', 'lua', 'selo'] as const
      vfx.emit(kinds[Math.floor(Math.random() * kinds.length)]!, { x: rect.width / 2, y: rect.height * 0.7, width: rect.width })
      raf = window.setTimeout(tick, 900) as unknown as number
    }
    tick()
    return () => {
      stop = true
      window.clearTimeout(raf)
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [vfx])

  return (
    <div className="space-y-4">
      <Panel
        title="Ambiente sonoro"
        subtitle="Setes espaços, cada um com escala, drone, textura e reverberação próprias. Escolher aqui troca também o fundo da mesa e opreset de partículas."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={audioState.supported ? (audioState.running ? 'ok' : 'warn') : 'erro'}>
              {audioState.supported ? (audioState.running ? 'a correr' : 'à espera de um gesto') : 'Web Audio indisponível'}
            </Badge>
            <Badge tone="neutral">{audioState.voices} vozes ativas</Badge>
          </div>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ENVIRONMENT_LIST.map((item) => {
            const active = prefs.environment === item.key
            return (
              <li key={item.key}>
                <div className={`h-full rounded-xl border p-3 transition-colors ${active ? 'border-gold bg-gold/10' : 'border-[var(--line)] hover:border-gold/50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{item.subtitle}</p>
                    </div>
                    <span aria-hidden className="h-6 w-6 shrink-0 rounded-full border border-white/20" style={{ background: `linear-gradient(140deg, ${item.palette.glow}, ${item.palette.base})` }} />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)] text-pretty">{item.description}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-[var(--text-muted)]">
                    <div>
                      <dt className="uppercase">pad</dt>
                      <dd>{item.ambience.pad}</dd>
                    </div>
                    <div>
                      <dt className="uppercase">textura</dt>
                      <dd>{item.ambience.texture}</dd>
                    </div>
                    <div>
                      <dt className="uppercase">reverberação</dt>
                      <dd>{item.reverbSeconds}s</dd>
                    </div>
                    <div>
                      <dt className="uppercase">partículas</dt>
                      <dd>{item.vfx.particles}</dd>
                    </div>
                  </dl>
                  <div className="mt-2.5 flex gap-2">
                    <Button
                      size="sm"
                      variant={active ? 'gold' : 'outline'}
                      onClick={async () => {
                        patchPrefs({ environment: item.key })
                        await audio.resume()
                        audio.play('sabbat-bell')
                      }}
                    >
                      {active ? 'Reouvir sino' : 'Escolher e ouvir'}
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Switch label="Som activado" checked={prefs.audio.enabled} onChange={(next) => patchPrefs({ audio: { ...prefs.audio, enabled: next } })} hint={`Estado real: ${audioState.enabled ? 'on' : 'off'}`} />
          <Switch label="Entrar sozinho no primeiro gesto" checked={prefs.audio.autoplay} onChange={(next) => patchPrefs({ audio: { ...prefs.audio, autoplay: next } })} hint="Política de autoplay: sem gesto, nenhum navegador deixa soar." />
          <div>
            <Field label="Master">
              <Slider label="Volume geral" value={Math.max(prefs.audio.ambience, prefs.audio.effects)} onChange={(value) => patchPrefs({ audio: { ...prefs.audio, ambience: value, effects: value } })} />
            </Field>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="gold" onClick={() => void audio.resume().then(() => toast('Áudio retomado.', 'ok'))}>
            Retomar áudio (gesto)
          </Button>
          <Button variant="outline" onClick={() => { audio.suspend(); toast('Suspendido: as vozes param, o grafo fica pronto a retomar.', 'info') }}>
            Suspender
          </Button>
          <Button variant="ghost" onClick={() => audio.play('moon-chime', { variation: moon ? Number(moon.slice(8, 10)) / 31 : 0.5 })}>
            Sinos pela Lua cheia anterior
          </Button>
          {sabbat ? (
            <Button variant="ghost" onClick={() => audio.play('sabbat-bell')}>
              Sino de {sabbat.name} (em {sabbat.daysUntil} dias)
            </Button>
          ) : null}
        </div>
        {audioState.lastError ? <p className="mt-2 text-xs text-amber-200">{audioState.lastError}</p> : null}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title={`Banco de efeitos — ${SFX_LIST.length}`} subtitle="Um por acção. Ouve-os fora de contexto para perceberes a diferença de timbre entre eles.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {SFX_LIST.map((effect) => (
              <li key={effect.key} className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  sound="none"
                  onClick={() => {
                    void audio.resume()
                    audio.play(effect.key)
                  }}
                  aria-label={`Ouvir ${effect.name}`}
                >
                  ▶
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {effect.name} <span className="font-mono text-[10px] font-normal text-[var(--text-muted)]">{effect.key}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)] text-pretty">{effect.recipe}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]/80">{effect.durationMs} ms</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Partículas" subtitle="Canvas 2D — nenhuma dependência de WebGL; sem canvas, a aplicação funciona igual.">
            <canvas ref={canvasRef} aria-hidden className="h-40 w-full rounded-lg border border-[var(--line)] bg-black/40" />
            <Field label={`Intensidade: ${prefs.motion.vfx === 0 ? 'desligada' : `${Math.round(prefs.motion.vfx * 100)}%`}`}>
              <Slider label="Intensidade" value={prefs.motion.vfx} onChange={(value) => patchPrefs({ motion: { ...prefs.motion, vfx: value } })} />
            </Field>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
              Com {reducedMotion ? 'movimento reduzido ativo' : 'movimento completo'} a contagem de partículas cai{' '}
              {reducedMotion ? 'para cerca de metade e as trajectórias são mais curtas' : '— nada: vê-se o máximo'}.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['poeira', 'faiscas', 'bruma', 'lua', 'sabbat', 'revelacao', 'corte', 'queda', 'selo'] as const).map((kind) => (
                <Button key={kind} size="sm" variant="ghost" onClick={() => vfx.emit(kind, { x: window.innerWidth / 2, y: window.innerHeight * 0.5, width: 480, height: 300 })}>
                  {kind}
                </Button>
              ))}
            </div>
          </Panel>
          <Panel title="O que é original aqui" subtitle="Requisito do projecto: nada de terceiros.">
            <ul className="space-y-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
              <li>· Música e SFX: síntese aditiva + ruído filtrado em Web Audio, sem samples nem bibliotecas de som.</li>
              <li>· Reverberação: resposta ao impulso gerada por ruído com cauda exponencial, por ambiente.</li>
              <li>· Partículas: integrador próprio em canvas 2D, com teto de 900 partículas.</li>
              <li>· Ilustração: vector gerado a partir do registo simbólico de cada carta (npm run art:build).</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
