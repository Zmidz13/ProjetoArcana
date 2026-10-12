'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { type AmbienceEngine, getAmbience, type AudioState } from '@/audio/engine.ts'
import { type VfxEngine, getVfx } from '@/vfx/engine.ts'
import { ApiError, api, readCookie } from '@/lib/api.ts'
import { DEFAULT_PREFERENCES, mergePreferences, type EnvironmentKey, type Preferences } from '@/domain/experience.ts'
import type { SfxKey } from '@/domain/experience.ts'
import type { EnvironmentDef } from '@/domain/experience.ts'
import { ENVIRONMENT_LIST } from '@/domain/experience.ts'

/** Estado de sessão devolvido por `GET /api/auth/session`. */
export interface SessionInfo {
  user: { id: string; handle: string; displayName: string; email: string | null; createdAt: string; preferences: unknown } | null
  deviceId: string
  csrfToken: string
  ai: { configured: boolean; provider: string | null; model: string | null; keyConfigured?: boolean; streaming?: boolean; [key: string]: unknown }
  usage: { calls: number; tokens: number; cost: number; fallbacks: number; days: number } | null
}

export interface Toast {
  id: number
  text: string
  kind: 'info' | 'ok' | 'erro'
  action?: { label: string; onClick: () => void }
}

interface AppValue {
  prefs: Preferences
  /** Atualização optimista: local de imediato, servidor em segundo plano. */
  patchPrefs: (patch: Partial<Preferences>) => void
  prefsReady: boolean
  saveError: string | null
  retryPrefs: () => void
  session: SessionInfo | null
  sessionReady: boolean
  refreshSession: () => Promise<void>
  reducedMotion: boolean
  motionSpeed: number
  audio: AmbienceEngine
  audioState: AudioState
  sfx: (key: SfxKey, options?: { variation?: number; gain?: number }) => void
  vfx: VfxEngine
  attachVfx: (canvas: HTMLCanvasElement | null) => void
  environment: EnvironmentDef
  toasts: Toast[]
  toast: (text: string, kind?: Toast['kind'], action?: Toast['action']) => void
  dismissToast: (id: number) => void
  deckTheme: string
  setDeckTheme: (theme: string) => void
}

const AppContext = createContext<AppValue | null>(null)
const STORAGE_KEY = 'arcana:preferences'
const DECK_THEME_KEY = 'arcana:deck-theme'

export function useApp(): AppValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp fora de <AppProviders>')
  return value
}

export function usePrefs(): Pick<AppValue, 'prefs' | 'patchPrefs' | 'reducedMotion' | 'environment'> {
  return useApp()
}

export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [prefsReady, setPrefsReady] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deckTheme, setDeckThemeState] = useState('obsidiana')
  const [audioState, setAudioState] = useState<AudioState>({
    running: false,
    enabled: true,
    ambience: 0.5,
    effects: 0.75,
    environment: 'templo',
    reducedMotion: false,
    supported: true,
    voices: 0,
  })
  const systemReduced = useSystemReducedMotion()
  const pendingPatch = useRef<Partial<Preferences>>({})
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastId = useRef(1)

  const audio = useMemo(() => getAmbience({ onState: setAudioState }), [])
  const vfx = useMemo(() => getVfx(), [])

  const toast = useCallback((text: string, kind: Toast['kind'] = 'info', action?: Toast['action']) => {
    const id = toastId.current++
    setToasts((current) => [...current.slice(-3), { id, text, kind, action }])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), kind === 'erro' ? 9000 : 5200)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((current) => current.filter((item) => item.id !== id)), [])

  /* ── hidratação de preferências: local primeiro, servidor depois ───────── */
  useEffect(() => {
    let cancelled = false
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPrefs(mergePreferences(JSON.parse(stored)))
      } catch {
        setPrefs(DEFAULT_PREFERENCES)
      }
    }
    const theme = window.localStorage.getItem(DECK_THEME_KEY)
    if (theme) setDeckThemeState(theme)
    void (async () => {
      try {
        const next = await api<{ preferences: Preferences }>('/api/preferences')
        if (!cancelled) setPrefs(mergePreferences(next.preferences))
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          /* sem servidor (render estático) — fica o que está em localStorage */
        }
      }
      if (!cancelled) setPrefsReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs, prefsReady])

  const sendPrefs = useCallback(async () => {
    const patch = pendingPatch.current
    pendingPatch.current = {}
    if (Object.keys(patch).length === 0) return
    try {
      const next = await api<{ preferences: Preferences }>('/api/preferences', { method: 'PUT', body: patch })
      setPrefs(mergePreferences(next.preferences))
      setSaveError(null)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível guardar as preferências.'
      setSaveError(message)
    }
  }, [])

  const patchPrefs = useCallback(
    (patch: Partial<Preferences>) => {
      setPrefs((current) => ({ ...current, ...patch }))
      pendingPatch.current = { ...pendingPatch.current, ...patch }
      if (flushTimer.current) clearTimeout(flushTimer.current)
      flushTimer.current = setTimeout(() => void sendPrefs(), 600)
    },
    [sendPrefs],
  )

  /* ── sessão ──────────────────────────────────────────────────────────── */
  const refreshSession = useCallback(async () => {
    try {
      const next = await api<SessionInfo>('/api/auth/session')
      setSession(next)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setSession(null)
    } finally {
      setSessionReady(true)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  /* ── ligação preferências → motores sensoriais ───────────────────────── */
  const reducedMotion = prefs.motion.respectSystem ? systemReduced || prefs.motion.forceReduced : prefs.motion.forceReduced

  useEffect(() => {
    audio.setEnvironment(prefs.environment as EnvironmentKey)
    audio.setAmbienceVolume(prefs.audio.ambience)
    audio.setEffectsVolume(prefs.audio.effects)
    audio.setEnabled(prefs.audio.enabled)
    audio.setReducedMotion(reducedMotion)
    vfx.setEnvironment(prefs.environment)
    vfx.setIntensity(prefs.motion.vfx)
    vfx.setReducedMotion(reducedMotion)
  }, [audio, vfx, prefs.environment, prefs.audio, prefs.motion.vfx, reducedMotion])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = prefs.theme
    root.dataset.reducedMotion = String(reducedMotion)
    root.dataset.highContrast = String(prefs.accessibility.highContrast)
    root.dataset.largeText = String(prefs.accessibility.largeText)
    root.style.setProperty('--motion-speed', String(prefs.motion.speed))
  }, [prefs.theme, prefs.accessibility, reducedMotion, prefs.motion.speed])

  /* Arranque do áudio ao primeiro gesto (política de autoplay), se o utilizador o permitir. */
  useEffect(() => {
    if (!prefs.audio.enabled || !prefs.audio.autoplay) return
    const start = () => {
      void audio.resume()
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [audio, prefs.audio.enabled, prefs.audio.autoplay])

  const resizeHandler = useRef<(() => void) | null>(null)
  const attachVfx = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      vfx.attach(canvas)
      if (resizeHandler.current) {
        window.removeEventListener('resize', resizeHandler.current)
        resizeHandler.current = null
      }
      if (!canvas) return
      const onResize = () => vfx.resize()
      resizeHandler.current = onResize
      window.addEventListener('resize', onResize)
    },
    [vfx],
  )

  const sfx = useCallback(
    (key: SfxKey, options?: { variation?: number; gain?: number }) => {
      audio.play(key, options)
    },
    [audio],
  )

  const setDeckTheme = useCallback(
    (theme: string) => {
      setDeckThemeState(theme)
      window.localStorage.setItem(DECK_THEME_KEY, theme)
    },
    [],
  )

  const environment = useMemo(
    () => ENVIRONMENT_LIST.find((item) => item.key === prefs.environment) ?? ENVIRONMENT_LIST[0]!,
    [prefs.environment],
  )

  const value = useMemo<AppValue>(
    () => ({
      prefs,
      patchPrefs,
      prefsReady,
      saveError,
      retryPrefs: () => void sendPrefs(),
      session,
      sessionReady,
      refreshSession,
      reducedMotion,
      motionSpeed: prefs.motion.speed,
      audio,
      audioState,
      sfx,
      vfx,
      attachVfx,
      environment,
      toasts,
      toast,
      dismissToast,
      deckTheme,
      setDeckTheme,
    }),
    [
      prefs, patchPrefs, prefsReady, saveError, sendPrefs, session, sessionReady, refreshSession, reducedMotion,
      audio, audioState, sfx, vfx, attachVfx, environment, toasts, toast, dismissToast, deckTheme, setDeckTheme,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/** Lê a cookie de CSRF para mostrar no diagnóstico (não é segredo: é espelhado de uma cookie não-HttpOnly). */
export function useCsrfProbe(): { present: boolean; preview: string } {
  const token = readCookie('arcana_csrf')
  return { present: !!token, preview: token ? `${token.slice(0, 6)}…${token.slice(-4)}` : '—' }
}
