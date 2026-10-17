import mark from '@/assets/mark-3cartas-branco.svg'
import type { ReactNode } from 'react'

type Props = { onSoon: (feature: string) => void }

const navigation = [
  'Meios de Pagamento',
  'Quem Somos',
  'Comunidade',
  'Ajuda',
] as const

export function SiteFooter({ onSoon }: Props) {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-gradient-to-r from-[#2c0738] via-[#21062c] to-[#32083e] text-white">
      {/* Brilho sutil para acompanhar o visual do protótipo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(151,35,176,0.14),transparent_32%),radial-gradient(ellipse_at_100%_50%,rgba(151,35,176,0.14),transparent_32%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 py-6 sm:px-8 lg:min-h-[110px] lg:flex-row lg:items-center lg:justify-between lg:gap-7 lg:px-12 lg:py-4">
        {/* Marca */}
        <div className="flex shrink-0 items-center gap-3 lg:min-w-[285px]">
          <img src={mark} alt="" className="h-11 w-auto shrink-0 sm:h-12" />
          <div className="min-w-0">
            <span className="block whitespace-nowrap font-display text-xl leading-tight tracking-wide sm:text-2xl">
              <span className="font-semibold text-[#d9a4ff]">TCG</span>Market
            </span>
            <p className="mt-0.5 text-[11px] leading-snug text-white/55">
              Sua coleção, suas trocas, novos mundos.
            </p>
          </div>
        </div>

        {/* Navegação: linha única no desktop, quebra naturalmente em telas menores. */}
        <nav
          aria-label="Links institucionais"
          className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-x-7 gap-y-3 sm:gap-x-9 lg:justify-evenly lg:gap-x-4"
        >
          {navigation.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onSoon(label)}
              className="whitespace-nowrap rounded-sm text-[13px] font-medium text-white/90 transition hover:text-[#d9a4ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b96cf4]"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Redes sociais */}
        <div className="flex shrink-0 items-center gap-4 border-t border-white/20 pt-4 sm:gap-5 lg:min-h-12 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-9">
          <SocialButton label="Discord" onClick={() => onSoon('Discord')}>
            <DiscordIcon />
          </SocialButton>
          <SocialButton label="Instagram" onClick={() => onSoon('Instagram')}>
            <InstagramIcon />
          </SocialButton>
          <SocialButton label="YouTube" onClick={() => onSoon('YouTube')}>
            <YoutubeIcon />
          </SocialButton>
          <SocialButton label="X" onClick={() => onSoon('X')}>
            <XIcon />
          </SocialButton>
        </div>
      </div>

      <p className="relative px-4 pb-3 text-center text-[10px] text-white/45">
        © {new Date().getFullYear()} TCG Market. Todos os direitos reservados.
      </p>
    </footer>
  )
}

function SocialButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md text-white transition hover:-translate-y-0.5 hover:text-[#d9a4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b96cf4]"
    >
      {children}
    </button>
  )
}

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-7"
      aria-hidden="true"
    >
      <path d="M19.73 5.13a18.6 18.6 0 0 0-4.6-1.43l-.55 1.13a17 17 0 0 0-5.16 0l-.55-1.13a18.7 18.7 0 0 0-4.6 1.43C1.35 9.43.55 13.6.96 17.71a18.8 18.8 0 0 0 5.64 2.85l1.22-2.01a12 12 0 0 1-1.93-.93l.47-.37c3.72 1.74 7.53 1.74 11.2 0l.47.37c-.62.37-1.27.68-1.94.93l1.22 2.01a18.8 18.8 0 0 0 5.65-2.85c.5-4.77-.86-8.9-3.23-12.58ZM8.56 15.29c-1.1 0-1.99-1-1.99-2.22s.87-2.22 1.99-2.22c1.13 0 2 1 1.99 2.22 0 1.22-.87 2.22-1.99 2.22Zm6.88 0c-1.11 0-1.99-1-1.99-2.22s.88-2.22 1.99-2.22c1.12 0 1.99 1 1.99 2.22s-.87 2.22-1.99 2.22Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-7"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.7" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-7"
      aria-hidden="true"
    >
      <path d="M22.1 7.2a2.8 2.8 0 0 0-1.96-1.98C18.4 4.75 12 4.75 12 4.75s-6.4 0-8.14.47A2.8 2.8 0 0 0 1.9 7.2 29 29 0 0 0 1.45 12c0 1.6.16 3.2.45 4.8a2.8 2.8 0 0 0 1.96 1.98c1.74.47 8.14.47 8.14.47s6.4 0 8.14-.47a2.8 2.8 0 0 0 1.96-1.98c.3-1.6.45-3.2.45-4.8s-.15-3.2-.45-4.8ZM9.8 15.5v-7l6.08 3.5-6.08 3.5Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-7"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-7.43L5.55 22H2.4l7.24-8.28L1.8 2h6.4l4.43 6.76L18.9 2Zm-1.1 18h1.73L7.28 3.9H5.42L17.8 20Z" />
    </svg>
  )
}
