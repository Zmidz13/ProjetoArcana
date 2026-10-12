import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('./src'),
      '#content': r('./content'),
      '#generated': r('./generated'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.spec.ts', 'tests/integration/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    setupFiles: [r('./tests/setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: r('./coverage'),
      include: ['src/engine/**', 'src/domain/**', 'src/ai/**', 'src/server/**', 'scripts/**'],
      exclude: ['**/*.d.ts', 'src/art/**', 'src/app/**', 'src/components/**'],
      thresholds: { lines: 70, functions: 70, branches: 68, statements: 70 },
    },
  },
})
