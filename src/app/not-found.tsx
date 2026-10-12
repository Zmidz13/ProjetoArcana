import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
      <svg width="72" height="124" viewBox="0 0 300 520" role="img" aria-label="Uma carta em branco">
        <rect x="6" y="6" width="288" height="508" rx="22" fill="#101018" stroke="rgba(198,166,107,.45)" strokeWidth="3" />
        <circle cx="150" cy="250" r="72" fill="none" stroke="rgba(198,166,107,.35)" strokeWidth="2" />
        <path d="M150 150l18 82 82 18-82 18-18 82-18-82-82-18 82-18z" fill="rgba(232,206,150,.25)" />
        <text x="150" y="452" textAnchor="middle" fill="rgba(239,230,214,.7)" fontSize="30" fontFamily="Georgia, serif" letterSpacing="6">
          VAZIO
        </text>
      </svg>
      <h1 className="font-display text-2xl">Esta página não existe</h1>
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        O endereço não corresponde a nada do catálogo. Se ias buscar uma leitura, ela continua no histórico; se ias desenhar uma tiragem, o criador está a duas
        linhas daqui.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#12100a]">
          início
        </Link>
        <Link href="/historico" className="rounded-md border border-[var(--line)] px-4 py-2 text-sm hover:border-gold">
          histórico
        </Link>
        <Link href="/mesa" className="rounded-md border border-[var(--line)] px-4 py-2 text-sm hover:border-gold">
          abrir mesa
        </Link>
      </div>
    </div>
  )
}
