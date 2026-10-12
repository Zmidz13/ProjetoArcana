/**
 * ARCANA — Design tokens expostos ao Tailwind.
 * A paleta canónica vive em `src/styles/tokens.css`; este ficheiro espelha
 * apenas os valores usados por utilitários. Qualquer alteração tem de ser
 * replicada nos dois sítios (o script `scripts/audit-tokens.mjs` verifica).
 */
const config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#08080D',
        midnight: '#11172A',
        gold: {
          DEFAULT: '#C6A66B',
          dim: '#8C7343',
          bright: '#E8CE96',
        },
        ivory: '#EFE6D6',
        wine: '#4A1F39',
        astral: '#56C5BD',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        ritual: ['var(--font-ritual)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 24px 60px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(198,166,107,.18)',
        raised: '0 40px 90px -30px rgba(0,0,0,.9), 0 0 40px -10px rgba(86,197,189,.25)',
        gild: 'inset 0 1px 0 rgba(232,206,150,.35), 0 0 24px -6px rgba(198,166,107,.45)',
      },
      transitionTimingFunction: {
        ritual: 'cubic-bezier(.16,.84,.24,1)',
        swift: 'cubic-bezier(.22,1,.36,1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'veil-in': {
          from: { opacity: '0', filter: 'blur(12px)' },
          to: { opacity: '1', filter: 'blur(0)' },
        },
        'candle-flicker': {
          '0%,100%': { opacity: '.92', transform: 'scaleY(1)' },
          '35%': { opacity: '1', transform: 'scaleY(1.06)' },
          '70%': { opacity: '.86', transform: 'scaleY(.97)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.16,.84,.24,1) both',
        'veil-in': 'veil-in .7s cubic-bezier(.16,.84,.24,1) both',
        flicker: 'candle-flicker 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config
