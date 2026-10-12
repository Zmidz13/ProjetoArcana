/**
 * Motor de áudio generativo do ARCANA (Web Audio API).
 *
 * Não há ficheiros de som: tudo é sintetizado. Isso resolve três requisitos ao mesmo
 * tempo — o material é 100 % original e licenciável, cada acção tem um timbre próprio
 * (nenhum SFX é reutilizado para outra acção), e o peso em rede é zero.
 *
 * Estrutura:
 *   AudioContext
 *     ├─ busMaster → compressor → destination
 *     │    ├─ busAmbience → convolver (reverberação gerada por ruído) → master
 *     │    └─ busEffects → master
 *     └─ scheduler de ambulância (pad + textura + eventos pontuais por ambiente)
 *
 * O motor nunca arranca sozinho: `resume()` tem de ser chamado a partir de um gesto do
 * utilizador (política de autoplay dos navegadores) e `enabled=false` desliga tudo sem
 * desmontar o grafo, para que alternar o som não custe reconstruir nós.
 */

import { ENVIRONMENTS_BY_KEY, SFX_BY_KEY, type EnvironmentKey, type SfxKey } from '@/domain/experience.ts'

export interface AudioOptions {
  sampleRate?: number
  onState?: (state: AudioState) => void
}

export interface AudioState {
  running: boolean
  enabled: boolean
  ambience: number
  effects: number
  environment: EnvironmentKey
  reducedMotion: boolean
  supported: boolean
  lastError?: string
  /** Nodes activos, para o ecrã de diagnóstico mostrar que nada fica pendurado. */
  voices: number
}

type AnyWindow = Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }

export class AmbienceEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private effectsBus: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private scheduler: number | null = null
  private active: Set<AudioScheduledSourceNode> = new Set()
  private padVoices: { osc: OscillatorNode; gain: GainNode }[] = []
  private textureSource: AudioBufferSourceNode | null = null
  private state: AudioState = {
    running: false,
    enabled: true,
    ambience: 0.5,
    effects: 0.75,
    environment: 'templo',
    reducedMotion: false,
    supported: true,
    voices: 0,
  }
  private readonly onState?: (state: AudioState) => void

  constructor(options: AudioOptions = {}) {
    this.onState = options.onState
    if (typeof window === 'undefined' || (window as AnyWindow).AudioContext === undefined && (window as AnyWindow).webkitAudioContext === undefined) {
      this.state = { ...this.state, supported: false, lastError: 'Web Audio indisponível neste ambiente' }
    }
  }

  get snapshot(): AudioState {
    return { ...this.state, voices: this.active.size }
  }

  private emit(patch: Partial<AudioState> = {}): void {
    this.state = { ...this.state, ...patch, voices: this.active.size }
    this.onState?.(this.snapshot)
  }

  /** Chamado a partir de um gesto real do utilizador. */
  async resume(): Promise<void> {
    if (!this.state.supported) return
    try {
      const context = this.ensureContext()
      if (context.state === 'suspended') await context.resume()
      this.emit({ running: true })
      if (this.state.enabled) this.startAmbience()
    } catch (error) {
      this.emit({ supported: false, lastError: error instanceof Error ? error.message : String(error) })
    }
  }

  suspend(): void {
    this.stopAmbience()
    this.ctx?.suspend().catch(() => {})
    this.emit({ running: false })
  }

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx
    const Ctor = (window as AnyWindow).AudioContext ?? (window as AnyWindow).webkitAudioContext!
    const ctx = new Ctor({ latencyHint: 'interactive' })
    const master = ctx.createGain()
    master.gain.value = 0.9
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.knee.value = 24
    compressor.ratio.value = 3.5
    master.connect(compressor)
    compressor.connect(ctx.destination)

    const ambienceBus = ctx.createGain()
    ambienceBus.gain.value = this.state.ambience
    const effectsBus = ctx.createGain()
    effectsBus.gain.value = this.state.effects

    const reverb = ctx.createConvolver()
    reverb.buffer = this.makeImpulse(ctx, ENVIRONMENTS_BY_KEY[this.state.environment].reverbSeconds)

    ambienceBus.connect(master)
    ambienceBus.connect(reverb)
    reverb.connect(master)
    effectsBus.connect(master)

    this.ctx = ctx
    this.master = master
    this.ambienceBus = ambienceBus
    this.effectsBus = effectsBus
    this.reverb = reverb
    this.noiseBuffer = this.makeNoise(ctx, 4)
    return ctx
  }

  private makeImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds))
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel)
      for (let index = 0; index < length; index += 1) {
        const t = index / length
        // cauda exponencial com rugosidade: uma sala de pedra, não um plate metálico
        data[index] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (0.6 + 0.4 * Math.sin(t * 90))
      }
    }
    return buffer
  }

  private makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1
      last = (last + 0.08 * white) / 1.08
      data[index] = last * 3.2
    }
    return buffer
  }

  setEnabled(enabled: boolean): void {
    this.emit({ enabled })
    if (!this.ctx) return
    if (enabled) void this.resume()
    else {
      this.stopAmbience()
      this.masterGain(0)
    }
  }

  private masterGain(value: number): void {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.12)
  }

  setAmbienceVolume(value: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
    this.emit({ ambience: clamped })
    if (this.ambienceBus && this.ctx) this.ambienceBus.gain.setTargetAtTime(clamped * 0.55, this.ctx.currentTime, 0.2)
  }

  setEffectsVolume(value: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
    this.emit({ effects: clamped })
    if (this.effectsBus && this.ctx) this.effectsBus.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05)
  }

  setReducedMotion(reduced: boolean): void {
    this.emit({ reducedMotion: reduced })
  }

  setEnvironment(key: EnvironmentKey): void {
    const changed = this.state.environment !== key
    this.emit({ environment: key })
    if (!this.ctx) return
    if (this.reverb) this.reverb.buffer = this.makeImpulse(this.ctx, ENVIRONMENTS_BY_KEY[key].reverbSeconds)
    if (changed && this.state.running) {
      this.stopAmbience()
      this.startAmbience()
    }
  }

  /** Constrói o tapete sonoro do ambiente: drone por oitava + textura filtrada + eventos. */
  startAmbience(): void {
    if (!this.state.supported || !this.state.enabled) return
    const ctx = this.ensureContext()
    if (!this.ambienceBus) return
    const def = ENVIRONMENTS_BY_KEY[this.state.environment]
    const scale = def.ambience.scale
    const voices = this.state.reducedMotion ? 2 : 3
    for (let index = 0; index < voices; index += 1) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = def.ambience.pad === 'cordas' ? 'sawtooth' : def.ambience.pad === 'harpa' ? 'triangle' : def.ambience.pad === 'sino' ? 'sine' : 'sine'
      const semitones = scale[index % scale.length]! + (index >= scale.length ? 12 : 0)
      osc.frequency.value = def.ambience.root * Math.pow(2, semitones / 12) * (index === 0 ? 0.5 : 1)
      filter.type = 'lowpass'
      filter.frequency.value = 320 + def.ambience.brightness * 2200 + index * 240
      filter.Q.value = 0.8
      gain.gain.value = 0
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ambienceBus)
      osc.start()
      gain.gain.setTargetAtTime(0.075 / (index + 1), ctx.currentTime, 2.5)
      // lenta respiração do drone: é isto que evita o "hum" estático
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.028 + index * 0.011
      lfoGain.gain.value = 0.03 / (index + 1)
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      lfo.start()
      this.padVoices.push({ osc, gain })
      this.active.add(osc)
      this.active.add(lfo)
    }
    this.startTexture(def.ambience.texture)
    this.scheduler = window.setInterval(() => this.ambientalEvent(), 2600)
    this.emit({ running: true })
  }

  private startTexture(kind: (typeof ENVIRONMENTS_BY_KEY)[EnvironmentKey]['ambience']['texture']): void {
    const ctx = this.ctx
    if (!ctx || !this.ambienceBus || !this.noiseBuffer) return
    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    const shaping: Record<typeof kind, { type: BiquadFilterType; frequency: number; q: number; level: number }> = {
      vento: { type: 'bandpass', frequency: 520, q: 0.7, level: 0.1 },
      agua: { type: 'lowpass', frequency: 900, q: 0.5, level: 0.14 },
      fogo: { type: 'highpass', frequency: 240, q: 0.4, level: 0.1 },
      grilos: { type: 'bandpass', frequency: 5200, q: 6, level: 0.05 },
      relogio: { type: 'bandpass', frequency: 1800, q: 4, level: 0.035 },
      'sino-ao-longe': { type: 'bandpass', frequency: 900, q: 2.2, level: 0.04 },
      'sala-oca': { type: 'lowpass', frequency: 420, q: 0.4, level: 0.05 },
    }
    const preset = shaping[kind]
    filter.type = preset.type
    filter.frequency.value = preset.frequency
    filter.Q.value = preset.q
    gain.gain.value = preset.level
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.ambienceBus)
    source.start()
    this.textureSource = source
    this.active.add(source)
  }

  /** Eventos pontuais do ambiente (pingos, farpas, badaladas) — variam por ambiente. */
  private ambientalEvent(): void {
    const ctx = this.ctx
    if (!ctx || !this.ambienceBus || !this.state.enabled) return
    const def = ENVIRONMENTS_BY_KEY[this.state.environment]
    const roll = Math.random()
    if (roll > 0.62) return
    const voice = ctx.createOscillator()
    const gain = ctx.createGain()
    const tone = def.ambience.scale[Math.floor(Math.random() * def.ambience.scale.length)]!
    voice.type = def.ambience.pad === 'sino' ? 'sine' : 'triangle'
    voice.frequency.value = def.ambience.root * 4 * Math.pow(2, tone / 12)
    const now = ctx.currentTime
    const duration = def.ambience.texture === 'sino-ao-longe' ? 3.4 : 0.9
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.05, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    voice.connect(gain)
    gain.connect(this.ambienceBus)
    voice.start(now)
    voice.stop(now + duration + 0.1)
    this.track(voice)
  }

  stopAmbience(): void {
    if (this.scheduler !== null) {
      window.clearInterval(this.scheduler)
      this.scheduler = null
    }
    for (const { osc, gain } of this.padVoices) {
      try {
        gain.gain.setTargetAtTime(0, this.ctx!.currentTime, 0.4)
        osc.stop(this.ctx!.currentTime + 1.2)
      } catch {
        /* já parado */
      }
    }
    this.padVoices = []
    try {
      this.textureSource?.stop()
    } catch {
      /* noop */
    }
    this.textureSource = null
  }

  private track(node: AudioScheduledSourceNode): void {
    this.active.add(node)
    node.onended = () => {
      this.active.delete(node)
      this.emit()
    }
    this.emit()
  }

  /**
   * Um efeito sonoro por acção. Cada receita é diferente: as cartas de papel são ruído
   * filtrado, os sinos são osciladores com batimento, os impactos têm envelope próprio.
   */
  play(effect: SfxKey, options: { variation?: number; gain?: number } = {}): void {
    if (!this.state.supported || !this.state.enabled) return
    const ctx = this.ensureContext()
    if (!this.effectsBus) return
    const def = SFX_BY_KEY[effect]
    const variation = options.variation ?? Math.random()
    const now = ctx.currentTime + 0.001
    const bus = this.effectsBus
    const level = (options.gain ?? 1) * 0.55

    switch (effect) {
      case 'shuffle-start':
      case 'shuffle-loop':
      case 'overhand': {
        const bursts = effect === 'shuffle-loop' ? 8 : effect === 'shuffle-start' ? 3 : 5
        for (let index = 0; index < bursts; index += 1) {
          this.burst(now + index * (0.045 + variation * 0.02) + Math.random() * 0.012, 0.03 + Math.random() * 0.03, 1800 + Math.random() * 2600, level * (1 - index / (bursts * 1.6)), bus)
        }
        break
      }
      case 'riffle': {
        const teeth = 14
        for (let index = 0; index < teeth; index += 1) {
          const t = now + index * 0.045 * (1 + variation * 0.12)
          this.burst(t, 0.012, 3200 + index * 90, level * 0.5, bus)
          this.tone(t, 210 + index * 6, 0.05, 'square', level * 0.08, bus)
        }
        break
      }
      case 'fan-open': {
        const sweep = ctx.createBufferSource()
        if (this.noiseBuffer) sweep.buffer = this.noiseBuffer
        sweep.loop = true
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.Q.value = 1.4
        filter.frequency.setValueAtTime(420, now)
        filter.frequency.exponentialRampToValueAtTime(3600, now + 0.5)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(level * 0.5, now + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
        sweep.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        sweep.start(now)
        sweep.stop(now + 0.62)
        this.track(sweep)
        break
      }
      case 'cut': {
        this.burst(now, 0.05, 900, level * 0.9, bus)
        this.tone(now, 132, 0.16, 'sine', level * 0.4, bus)
        break
      }
      case 'deal': {
        this.burst(now, 0.07, 1500 + variation * 900, level * 0.55, bus)
        this.tone(now + 0.03, 190 + variation * 40, 0.07, 'triangle', level * 0.25, bus)
        break
      }
      case 'pick': {
        this.tone(now, 392, 0.16, 'triangle', level * 0.5, bus)
        this.tone(now + 0.05, 588, 0.5, 'sine', level * 0.3, bus)
        this.burst(now, 0.02, 2600, level * 0.3, bus)
        break
      }
      case 'flip':
      case 'flip-reversed': {
        const base = effect === 'flip' ? 660 : 440
        this.burst(now, 0.05, effect === 'flip' ? 2400 : 1500, level * 0.5, bus)
        this.tone(now + 0.02, base, effect === 'flip' ? 0.14 : 0.3, 'sine', level * 0.22, bus)
        if (effect === 'flip-reversed') this.tone(now + 0.05, base * 0.75, 0.26, 'sine', level * 0.16, bus)
        break
      }
      case 'hover': {
        this.burst(now, 0.006, 5200, level * 0.12, bus)
        break
      }
      case 'select': {
        this.tone(now, 523, 0.05, 'square', level * 0.18, bus)
        this.tone(now + 0.06, 784, 0.07, 'square', level * 0.16, bus)
        break
      }
      case 'drag-start': {
        const source = this.noiseBuffer ? ctx.createBufferSource() : null
        if (source) {
          source.buffer = this.noiseBuffer
          const filter = ctx.createBiquadFilter()
          filter.type = 'bandpass'
          filter.Q.value = 3
          filter.frequency.setValueAtTime(700, now)
          filter.frequency.linearRampToValueAtTime(2100, now + 0.16)
          const gain = ctx.createGain()
          gain.gain.setValueAtTime(level * 0.16, now)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
          source.connect(filter)
          filter.connect(gain)
          gain.connect(bus)
          source.start(now)
          source.stop(now + 0.21)
          this.track(source)
        }
        break
      }
      case 'drop': {
        this.tone(now, 174, 0.22, 'sine', level * 0.4, bus)
        this.burst(now + 0.01, 0.05, 620, level * 0.4, bus)
        break
      }
      case 'confirm': {
        // taça tibetana: dois modos próximos, batimento lento
        this.tone(now, 196, 2.2, 'sine', level * 0.34, bus)
        this.tone(now, 196 * 1.007, 2.2, 'sine', level * 0.3, bus)
        this.tone(now + 0.01, 196 * 2.01, 1.5, 'sine', level * 0.12, bus)
        break
      }
      case 'reveal': {
        for (let index = 0; index < 4; index += 1) {
          this.tone(now + index * 0.08, 261.63 * Math.pow(2, [0, 4, 7, 12][index]! / 12), 1.2, 'triangle', level * 0.2, bus)
        }
        this.tone(now + 0.4, 65.4, 1.6, 'sine', level * 0.4, bus)
        break
      }
      case 'moon-chime': {
        const pitches = [0, 3, 7, 10, 12]
        for (let index = 0; index < 3; index += 1) {
          const semitone = pitches[(index + Math.floor(variation * pitches.length)) % pitches.length]!
          this.tone(now + index * 0.13, 523.25 * Math.pow(2, semitone / 12), 1.3, 'sine', level * 0.22, bus)
        }
        break
      }
      case 'sabbat-bell': {
        this.tone(now, 174.6, 2.6, 'sine', level * 0.4, bus)
        this.tone(now + 0.02, 174.6 * 1.5, 2.2, 'sine', level * 0.16, bus)
        this.tone(now + 0.9, 174.6 * 0.5, 2.6, 'sine', level * 0.3, bus)
        break
      }
      case 'error': {
        this.tone(now, 220, 0.16, 'square', level * 0.2, bus)
        this.tone(now + 0.07, 207.65, 0.2, 'square', level * 0.18, bus)
        break
      }
      case 'stream-tick': {
        this.burst(now, 0.004, 3000 + variation * 3000, level * 0.07, bus)
        break
      }
      case 'toggle': {
        this.burst(now, 0.01, 3600, level * 0.3, bus)
        this.tone(now, 1200, 0.03, 'square', level * 0.1, bus)
        break
      }
      default: {
        this.burst(now, 0.03, 1200, level * 0.3, bus)
        this.tone(now, def.durationMs > 600 ? 220 : 440, 0.1, 'sine', level * 0.2, bus)
      }
    }
  }

  private burst(at: number, duration: number, frequency: number, level: number, bus: AudioNode): void {
    const ctx = this.ctx
    if (!ctx || !this.noiseBuffer) return
    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer
    source.playbackRate.value = 0.8 + Math.random() * 0.6
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 1.1
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), at + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.02, duration))
    source.connect(filter)
    filter.connect(gain)
    gain.connect(bus)
    source.start(at)
    source.stop(at + Math.max(0.05, duration) + 0.05)
    this.track(source)
  }

  private tone(at: number, frequency: number, duration: number, type: OscillatorType, level: number, bus: AudioNode): void {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.05, duration))
    osc.connect(gain)
    gain.connect(bus)
    osc.start(at)
    osc.stop(at + Math.max(0.06, duration) + 0.05)
    this.track(osc)
  }

  dispose(): void {
    this.stopAmbience()
    this.active.forEach((node) => {
      try {
        node.stop()
      } catch {
        /* noop */
      }
    })
    this.active.clear()
    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}

/** Instância única por tab: o header, a mesa e as páginas partilham o mesmo grafo. */
let singleton: AmbienceEngine | null = null

export function getAmbience(options?: AudioOptions): AmbienceEngine {
  if (!singleton) singleton = new AmbienceEngine(options)
  return singleton
}

export function resetAmbience(): void {
  singleton?.dispose()
  singleton = null
}
