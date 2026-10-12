import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'

/**
 * ESLint 9 (flat config). As regras do `eslint-config-next` entram via FlatCompat porque o
 * pacote ainda publica os presets no formato clássico; por cima delas ficam regras próprias
 * do projeto, todas com justificação, e nada de `off` silencioso.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname, recommendedConfig: js.configs.recommended })

const configs = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'public/**',
      'var/**',
      'src/domain/data/**',
      'next-env.d.ts',
    ],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      // o conteúdo simbólico e as frases de erro são strings longas por desenho
      'max-len': 'off',
      'react/no-unescaped-entities': ['error', { forbid: ['>', '<'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      // imports com `.ts` explícito são o contrato deste projeto (Node + TS sem transpile)
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'object-shorthand': ['error', 'always'],
      'react-hooks/exhaustive-deps': 'warn',
    },
  }),
  {
    files: ['scripts/**/*.{mjs,ts}', 'tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]

export default configs

