import { vi } from 'vitest'

/**
 * Setup comum aos testes.
 *
 * Fornece os polyfills mínimos de ambiente que o motor e a camada de servidor assumem
 * (randomUUID, matchMedia para os hooks de UI, WebGL ausente de propósito para provar
 * que os caminhos de fallback são exercitados nos testes de componente).
 */

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-4000-8000-' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0'),
      getRandomValues: <T extends Uint8Array>(arr: T) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
        return arr
      },
    },
  })
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
