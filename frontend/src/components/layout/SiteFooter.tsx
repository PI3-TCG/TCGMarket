import logo from '@/assets/design-system/logo-dourada.svg'
import cornerTL from '@/assets/design-system/canto-se.svg'
import cornerTR from '@/assets/design-system/canto-sd.svg'
import cornerBL from '@/assets/design-system/canto-ie.svg'
import cornerBR from '@/assets/design-system/canto-id.svg'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type Props = { onSoon?: (feature: string) => void }
type Platform = 'youtube' | 'instagram' | 'tiktok' | 'discord' | 'twitch'

type SocialLink = { label: string; platform: Platform; href: string }

/**
 * Preserva as redes existentes. Conforme o DS v2.2, exibe somente links reais:
 * configure as VITE_SOCIAL_*_URL no frontend/.env, quando publicados.
 */
const socialLinks: SocialLink[] = [
  { label: 'YouTube', platform: 'youtube', href: import.meta.env.VITE_SOCIAL_YOUTUBE_URL ?? '' },
  { label: 'Instagram', platform: 'instagram', href: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL ?? '' },
  { label: 'TikTok', platform: 'tiktok', href: import.meta.env.VITE_SOCIAL_TIKTOK_URL ?? '' },
  { label: 'Discord', platform: 'discord', href: import.meta.env.VITE_SOCIAL_DISCORD_URL ?? '' },
  { label: 'Twitch', platform: 'twitch', href: import.meta.env.VITE_SOCIAL_TWITCH_URL ?? '' },
].filter(({ href }) => /^https:\/\//i.test(href))

function SocialIcon({ platform }: { platform: Platform }): ReactNode {
  switch (platform) {
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.4 7a2.7 2.7 0 0 0-1.9-1.9C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5A2.7 2.7 0 0 0 2.6 7 27 27 0 0 0 2 12a27 27 0 0 0 .6 5 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.7 2.7 0 0 0 1.9-1.9 27 27 0 0 0 .6-5 27 27 0 0 0-.6-5ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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

export function SiteFooter({ onSoon: _onSoon }: Props) {
  return (
    <footer aria-label="Rodapé do TCG Market" className="tcg-footer">
      <img src={cornerTL} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--tl" />
      <img src={cornerTR} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--tr" />
      <img src={cornerBL} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--bl" />
      <img src={cornerBR} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--br" />
      <div className="tcg-footer-inner">
        <Link to="/" className="tcg-logo-link tcg-footer-brand" aria-label="TCG Market — página inicial">
          <img src={logo} alt="" decoding="async" className="tcg-footer-logo" />
        </Link>
        <p className="tcg-footer-copyright">
          © {new Date().getFullYear()} TCGMarket. Todos os direitos reservados.
        </p>
        {socialLinks.length > 0 && (
          <nav aria-label="Redes sociais" className="tcg-social-links">
            {socialLinks.map(({ label, platform, href }) => (
              <a
                key={platform}
                href={href}
                aria-label={label}
                title={label}
                target="_blank"
                rel="noopener noreferrer"
                className="tcg-social-link"
              >
                <SocialIcon platform={platform} />
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  )
}
