/**
 * Motor de efeitos visuais do ARCANA — 2D canvas, sem WebGL.
 *
 * Optou-se por canvas 2D (e não WebGL/three) por três razões: funciona em qualquer
 * navegador sem permissão de GPU, degrada-se para nada quando o canvas está indisponível
 * (a aplicação continua inteira) e pode ser desenhado em modo `reducedMotion` com
 * partículas estáticas em vez de movimento.
 *
 * Cada acção do ritual tem um efeito próprio, com paleta ligada ao ambiente escolhido,
 * para que som e imagem narrem a mesma coisa.
 */

export type EffectKind =
  | 'poeira'
  | 'faiscas'
  | 'bruma'
  | 'corte'
  | 'queda'
  | 'revelacao'
  | 'invertida'
  | 'selo'
  | 'lua'
  | 'sabbat'
  | 'fluido'

export interface EmitterOptions {
  x: number
  y: number
  amount?: number
  spread?: number
  tint?: string
  power?: number
}

export interface VfxState {
  running: boolean
  particles: number
  reducedMotion: boolean
  supported: boolean
  intensity: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
  hue: number
  alpha: number
  shape: 'dot' | 'streak' | 'ring' | 'mote'
  spin: number
  gravity: number
  drag: number
}

const TINTS: Record<string, [number, number]> = {
  templo: [42, 18],
  noite: [212, 258],
  jardim: [96, 140],
  lareira: [24, 46],
  observatorio: [186, 216],
  cripta: [272, 312],
  estufa: [76, 120],
}

export class VfxEngine {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private raf: number | null = null
  private dpr = 1
  private lastTime = 0
  private onFrame: ((state: VfxState) => void) | null = null
  private state: VfxState = { running: false, particles: 0, reducedMotion: false, supported: true, intensity: 1 }
  private hueRange: [number, number] = TINTS.templo!

  constructor(private readonly resizeAware: boolean = true) {}

  attach(canvas: HTMLCanvasElement | null, onFrame?: (state: VfxState) => void): void {
    this.onFrame = onFrame ?? null
    if (!canvas) {
      this.detach()
      return
    }
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) {
      this.state = { ...this.state, supported: false }
      return
    }
    this.canvas = canvas
    this.ctx = context
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.resize()
    this.start()
  }

  detach(): void {
    this.stop()
    this.canvas = null
    this.ctx = null
    this.particles = []
  }

  resize(): void {
    const canvas = this.canvas
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width * this.dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * this.dpr))
    if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  setReducedMotion(reduced: boolean): void {
    this.state = { ...this.state, reducedMotion: reduced }
    if (reduced) this.particles.forEach((p) => (p.ttl = Math.min(p.ttl, p.life + 0.55)))
  }

  setIntensity(value: number): void {
    this.state = { ...this.state, intensity: Math.max(0, Math.min(1.6, value)) }
    if (value === 0) this.particles = []
  }

  setEnvironment(key: string): void {
    this.hueRange = TINTS[key] ?? TINTS.templo!
  }

  get snapshot(): VfxState {
    return { ...this.state, particles: this.particles.length }
  }

  start(): void {
    if (this.state.running || !this.ctx) return
    this.state = { ...this.state, running: true }
    this.lastTime = performance.now()
    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - this.lastTime) / 1000)
      this.lastTime = time
      this.step(dt)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    this.raf = null
    this.state = { ...this.state, running: false }
  }

  clear(): void {
    this.particles = []
    this.ctx?.clearRect(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0)
  }

  /** Ponto de entrada único para as acções do ritual. */
  emit(kind: EffectKind, at: { x: number; y: number; width?: number; height?: number } = { x: 0, y: 0 }): void {
    if (!this.ctx || this.state.intensity === 0) return
    const width = at.width ?? 0
    const height = at.height ?? 0
    const scale = this.state.intensity * (this.state.reducedMotion ? 0.45 : 1)
    const options: EmitterOptions = { x: at.x, y: at.y }
    switch (kind) {
      case 'poeira':
      case 'fluido':
        this.dust({ ...options, amount: Math.round(34 * scale), spread: width || 320, power: kind === 'fluido' ? 0.5 : 1 })
        break
      case 'faiscas':
        this.sparks({ ...options, amount: Math.round(26 * scale), spread: 40 })
        break
      case 'bruma':
        this.mist({ ...options, amount: Math.round(16 * scale), spread: width || 420 })
        break
      case 'corte':
        this.slice({ x: at.x, y: at.y + height / 2, width })
        break
      case 'queda':
        this.deal({ x: at.x, y: at.y, amount: Math.round(18 * scale) })
        break
      case 'revelacao':
        this.reveal({ x: at.x, y: at.y, radius: Math.max(width, height) * 0.7 })
        break
      case 'invertida':
        this.reveal({ x: at.x, y: at.y, radius: Math.max(width, height) * 0.6 })
        this.sparks({ ...options, amount: Math.round(14 * scale), spread: 60, power: -1 })
        break
      case 'selo':
        this.sigil({ ...options, amount: Math.round(30 * scale) })
        break
      case 'lua':
        this.moon({ ...options, amount: Math.round(22 * scale), spread: width || 300 })
        break
      case 'sabbat':
        this.sabbat({ ...options, amount: Math.round(46 * scale), spread: width || 480 })
        break
      default:
        break
    }
  }

  private spawn(particle: Particle): void {
    // tecto duro: 900 partículas; a mesa nunca deve conseguir fazer cair frames
    if (this.particles.length > 900) this.particles.shift()
    this.particles.push(particle)
  }

  private hue(): number {
    const [from, to] = this.hueRange
    return from + Math.random() * (to - from)
  }

  private dust(options: EmitterOptions): void {
    const amount = options.amount ?? 30
    for (let index = 0; index < amount; index += 1) {
      this.spawn({
        x: options.x + (Math.random() - 0.5) * (options.spread ?? 200),
        y: options.y + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 12,
        vy: -6 - Math.random() * 14 * (options.power ?? 1),
        life: 0,
        ttl: 3 + Math.random() * 4,
        size: 0.6 + Math.random() * 1.8,
        hue: this.hue(),
        alpha: 0.5 + Math.random() * 0.4,
        shape: 'mote',
        spin: 0,
        gravity: -1.5,
        drag: 0.6,
      })
    }
  }

  private sparks(options: EmitterOptions): void {
    const amount = options.amount ?? 24
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2
      const speed = 60 + Math.random() * 190 * (options.power ?? 1)
      this.spawn({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7,
        life: 0,
        ttl: 0.4 + Math.random() * 0.7,
        size: 1 + Math.random() * 2,
        hue: this.hue(),
        alpha: 0.9,
        shape: 'streak',
        spin: 0,
        gravity: 130,
        drag: 1.4,
      })
    }
  }

  private mist(options: EmitterOptions): void {
    const amount = options.amount ?? 14
    for (let index = 0; index < amount; index += 1) {
      this.spawn({
        x: options.x + (Math.random() - 0.5) * (options.spread ?? 320),
        y: options.y + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 6,
        life: 0,
        ttl: 4 + Math.random() * 3,
        size: 24 + Math.random() * 54,
        hue: this.hue(),
        alpha: 0.1 + Math.random() * 0.08,
        shape: 'ring',
        spin: 0,
        gravity: -0.5,
        drag: 0.2,
      })
    }
  }

  private slice(input: { x: number; y: number; width: number }): void {
    for (let index = 0; index < 40; index += 1) {
      const along = (index / 40) * input.width - input.width / 2
      this.spawn({
        x: input.x + along,
        y: input.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 30,
        vy: (index % 2 === 0 ? -1 : 1) * (40 + Math.random() * 90),
        life: 0,
        ttl: 0.5 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 1.6,
        hue: this.hue(),
        alpha: 0.85,
        shape: 'streak',
        spin: 0,
        gravity: 60,
        drag: 1.1,
      })
    }
  }

  private deal(input: { x: number; y: number; amount: number }): void {
    for (let index = 0; index < input.amount; index += 1) {
      this.spawn({
        x: input.x + index * 8,
        y: input.y - 40 - Math.random() * 30,
        vx: 30 + Math.random() * 60,
        vy: 90 + Math.random() * 60,
        life: 0,
        ttl: 0.45 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        hue: this.hue(),
        alpha: 0.7,
        shape: 'dot',
        spin: Math.random() * 6,
        gravity: 320,
        drag: 0.4,
      })
    }
  }

  private reveal(input: { x: number; y: number; radius: number }): void {
    const count = this.state.reducedMotion ? 12 : 44
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2
      const radius = input.radius * (0.4 + Math.random() * 0.6)
      this.spawn({
        x: input.x + Math.cos(angle) * radius * 0.2,
        y: input.y + Math.sin(angle) * radius * 0.14,
        vx: Math.cos(angle) * radius * 1.4,
        vy: Math.sin(angle) * radius * 0.5,
        life: 0,
        ttl: 0.55 + Math.random() * 0.5,
        size: 1 + Math.random() * 2.4,
        hue: this.hue(),
        alpha: 0.95,
        shape: 'dot',
        spin: 0,
        gravity: 0,
        drag: 2.6,
      })
    }
  }

  private sigil(options: EmitterOptions): void {
    const amount = options.amount ?? 30
    for (let index = 0; index < amount; index += 1) {
      const angle = (index / amount) * Math.PI * 2
      const radius = 34 + Math.random() * 26
      this.spawn({
        x: options.x + Math.cos(angle) * radius,
        y: options.y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6 - 8,
        life: 0,
        ttl: 1.2 + Math.random() * 0.6,
        size: 1.4 + Math.random() * 1.4,
        hue: this.hue(),
        alpha: 0.8,
        shape: 'dot',
        spin: 0,
        gravity: -4,
        drag: 0.8,
      })
    }
  }

  private moon(options: EmitterOptions): void {
    const amount = options.amount ?? 20
    for (let index = 0; index < amount; index += 1) {
      this.spawn({
        x: options.x + (Math.random() - 0.5) * (options.spread ?? 260),
        y: options.y + Math.random() * 80,
        vx: (Math.random() - 0.5) * 4,
        vy: -10 - Math.random() * 12,
        life: 0,
        ttl: 4 + Math.random() * 3,
        size: 0.8 + Math.random() * 1.4,
        hue: 210 + Math.random() * 30,
        alpha: 0.85,
        shape: 'mote',
        spin: 0,
        gravity: -2,
        drag: 0.3,
      })
    }
  }

  private sabbat(options: EmitterOptions): void {
    const amount = options.amount ?? 40
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2
      const speed = 40 + Math.random() * 160
      this.spawn({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0,
        ttl: 1 + Math.random() * 1.4,
        size: 1.6 + Math.random() * 3,
        hue: this.hue(),
        alpha: 0.9,
        shape: 'streak',
        spin: Math.random() * 4,
        gravity: 90,
        drag: 0.9,
      })
    }
  }

  private step(dt: number): void {
    const ctx = this.ctx
    const canvas = this.canvas
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr)
    ctx.globalCompositeOperation = 'lighter'
    const alive: Particle[] = []
    for (const particle of this.particles) {
      particle.life += dt
      if (particle.life >= particle.ttl) continue
      const damping = Math.exp(-particle.drag * dt)
      particle.vx *= damping
      particle.vy = particle.vy * damping + particle.gravity * dt
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      const fade = 1 - particle.life / particle.ttl
      const alpha = particle.alpha * fade * this.state.intensity
      const color = `hsla(${particle.hue.toFixed(0)}, 78%, ${(58 + fade * 18).toFixed(0)}%, ${alpha.toFixed(3)})`
      if (particle.shape === 'ring') {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.arc(particle.x, particle.y, particle.size * (1 + particle.life * 0.6), 0, Math.PI * 2)
        ctx.stroke()
      } else if (particle.shape === 'streak') {
        ctx.strokeStyle = color
        ctx.lineWidth = particle.size * 0.9
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(particle.x - particle.vx * 0.02, particle.y - particle.vy * 0.02)
        ctx.stroke()
      } else if (particle.shape === 'mote') {
        ctx.fillStyle = color
        ctx.globalAlpha = alpha * 0.6
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 1.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }
      alive.push(particle)
    }
    this.particles = alive
    ctx.globalCompositeOperation = 'source-over'
    if (this.onFrame) this.onFrame(this.snapshot)
  }
}

let vfxSingleton: VfxEngine | null = null

export function getVfx(): VfxEngine {
  if (!vfxSingleton) vfxSingleton = new VfxEngine()
  return vfxSingleton
}
