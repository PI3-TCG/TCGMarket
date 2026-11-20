import frame from '@/assets/moldura-rodape.webp'
import logo from '@/assets/marca-referencia.webp'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type Props = { onSoon: (feature: string) => void }

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'discord' | 'twitch'

const socials: { label: string; platform: Platform }[] = [
  { label: 'YouTube', platform: 'youtube' },
  { label: 'Instagram', platform: 'instagram' },
  { label: 'TikTok', platform: 'tiktok' },
  { label: 'Discord', platform: 'discord' },
  { label: 'Twitch', platform: 'twitch' },
]

function SocialAction({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md border border-transparent text-[#FBF5FF] transition duration-200 hover:-translate-y-0.5 hover:border-[#F3D078]/50 hover:bg-[#CF65EB]/20 hover:text-[#FFE59C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE18D] [&>svg]:size-[21px]"
    >
      {children}
    </button>
  )
}

function SocialIcon({ platform }: { platform: Platform }) {
  switch (platform) {
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.4 7a2.7 2.7 0 0 0-1.9-1.9C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5A2.7 2.7 0 0 0 2.6 7 27 27 0 0 0 2 12a27 27 0 0 0 .6 5 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.7 2.7 0 0 0 1.9-1.9 27 27 0 0 0 .6-5 27 27 0 0 0-.6-5ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.5 2h-3.3v13.2a3.2 3.2 0 1 1-3.1-3.2V8.7a6.5 6.5 0 1 0 6.5 6.5V8.5a8.1 8.1 0 0 0 4.5 1.3V6.5A4.8 4.8 0 0 1 16.5 2Z" />
        </svg>
      )
    case 'discord':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.7 5.2a19 19 0 0 0-4.6-1.4l-.5 1.1a17 17 0 0 0-5.2 0l-.5-1.1a19 19 0 0 0-4.6 1.4C1.4 9.4.6 13.6 1 17.7a19 19 0 0 0 5.6 2.8l1.2-2a12 12 0 0 1-1.9-.9l.5-.4a12.7 12.7 0 0 0 11.2 0l.5.4c-.6.4-1.2.7-1.9.9l1.2 2a19 19 0 0 0 5.6-2.8c.5-4.8-.8-8.9-3.3-12.5ZM8.6 15.3c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Zm6.8 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Z" />
        </svg>
      )
    case 'twitch':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 2 2 7v13h5v2h3l2.2-2H16l6-6V2H4Zm16 11-3.5 3.5H11L8 19v-2.5H4V4h16v9ZM16 7h-2v5h2V7Zm-5 0H9v5h2V7Z" />
        </svg>
      )
  }
}

export function SiteFooter({ onSoon }: Props) {
  const navigate = useNavigate()

  return (
    <footer aria-label="Rodapé do TCG Market" className="tcg-footer">
      <div className="tcg-footer-frame">
        <img
          src={frame}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="tcg-frame-art"
        />
        <div className="tcg-footer-row">
          <button
            type="button"
            onClick={() => void navigate({ to: '/' })}
            aria-label="TCG Market — página inicial"
            className="min-w-0 justify-self-start rounded-sm transition hover:drop-shadow-[0_0_7px_rgba(255,208,119,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE18D] max-[430px]:justify-self-center"
          >
            <img src={logo} alt="" decoding="async" className="tcg-brand" />
          </button>

          <p className="tcg-copyright">
            © {new Date().getFullYear()} TCGMarket. Todos os direitos
            reservados.
          </p>

          <div role="group" aria-label="Redes sociais" className="tcg-socials">
            {socials.map(({ label, platform }) => (
              <SocialAction
                key={platform}
                label={label}
                onClick={() => onSoon(label)}
              >
                <SocialIcon platform={platform} />
              </SocialAction>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
