import { profilePanel, profileTextLink } from './profileStyles'
import { PageBanner } from '@/components/layout/PageBanner'
import { pageBanners } from '@/config/pageBanners'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import {
  formatLocation,
  formatMemberSince,
  initials,
  linkLabel,
  PROFILE_GAMES,
  type ProfileViewData,
} from './profileFormat'

export function ProfileShell({
  children,
  title = 'Meu perfil',
  showBanner = true,
}: {
  children: ReactNode
  title?: string
  showBanner?: boolean
}) {
  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pt-4 pb-12 sm:px-6 xl:px-[38px]">
      {showBanner && (
        <PageBanner
          image={pageBanners.profile}
          title={title}
          subtitle="Seu espaço de colecionador no TCG Market."
        />
      )}
      {children}
    </main>
  )
}

export function ProfileBreadcrumb({
  items,
}: {
  items: Array<{ label: string; to?: '/perfil' }>
}) {
  return (
    <nav aria-label="Você está em" className="text-xs text-neutral-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link
            to="/"
            aria-label="Início"
            className="inline-flex text-primary-900 hover:text-primary-800"
          >
            <Icon name="home" size={16} />
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <span aria-hidden="true">›</span>
            {item.to ? (
              <Link to={item.to} className="hover:text-primary-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Avatar({
  name,
  size = 'lg',
  image,
}: {
  name: string
  size?: 'md' | 'lg'
  image?: string | null
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'font-display flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-700 font-bold text-white ring-1 ring-border-default shadow-md',
        size === 'lg' ? 'size-24 text-3xl sm:size-28' : 'size-20 text-2xl',
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}

export function ProfileHero({
  profile,
  action,
  avatarUrl,
  avatar,
  collectionGames,
}: {
  avatar?: ReactNode
  collectionGames?: ProfileViewData['favoriteGames']
  avatarUrl?: string | null
  profile: ProfileViewData
  action?: ReactNode
}) {
  const games = PROFILE_GAMES.filter((game) =>
    (collectionGames ?? profile.favoriteGames).includes(game.value),
  )

  return (
    <header className="relative isolate mb-6 min-h-[200px] rounded-surface border border-border-default bg-brand-deep shadow-sm">
      <img
        src={pageBanners.profile}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[inherit] object-cover"
      />
      <div
        className={cn(
          'relative grid min-h-[196px] grid-cols-1 items-center justify-items-start gap-x-5 gap-y-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:px-8',
          Boolean(action) && 'lg:grid-cols-[auto_minmax(0,1fr)_auto]',
        )}
      >
        {avatar ?? <Avatar name={profile.name} image={avatarUrl} />}
        <div className="w-full min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="banner-text-outline font-display text-2xl leading-tight font-bold wrap-anywhere text-white sm:text-4xl">
              {profile.name}
            </h1>
            {profile.administrator ? (
              <Badge variant="primary">Administrador</Badge>
            ) : null}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm wrap-anywhere text-white">
            <li className="banner-text-outline min-w-0">@{profile.username}</li>
            <li className="banner-text-outline flex items-center gap-1">
              <CalendarIcon />
              {formatMemberSince(profile.registrationDate)}
            </li>
          </ul>
          {games.length > 0 ? (
            <ul
              className="flex flex-wrap gap-2"
              aria-label={collectionGames ? 'TCGs da coleção' : 'TCGs que joga'}
            >
              {games.map((game) => (
                <li key={game.value}>
                  <Badge
                    variant="neutral"
                    className="border border-primary-300 bg-white text-primary-900"
                  >
                    {collectionGames && <Icon name={game.icon} size={16} />}
                    {game.label}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {action ? (
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">{action}</div>
        ) : null}
      </div>
    </header>
  )
}

export function AboutCard({
  profile,
  email,
  emptyBioAction,
}: {
  profile: ProfileViewData
  email?: string
  emptyBioAction?: ReactNode
}) {
  const location = formatLocation(profile.city, profile.state)

  return (
    <Card className={`${profilePanel} p-4 sm:p-5`}>
      <h2 className="text-base font-semibold text-neutral-900">Sobre mim</h2>
      {profile.bio ? (
        <p className="mt-3 text-sm break-words whitespace-pre-line text-neutral-700">
          {profile.bio}
        </p>
      ) : emptyBioAction ? (
        <div className="mt-3 rounded-control bg-neutral-100 p-3 text-sm text-neutral-700">
          <p>Conte um pouco sobre você para outros jogadores.</p>
          <div className="mt-2">{emptyBioAction}</div>
        </div>
      ) : null}
      <ul className="mt-4 space-y-2 text-sm text-neutral-700">
        {location ? (
          <li className="flex items-center gap-2">
            <PinIcon />
            {location}
          </li>
        ) : null}
        <li className="flex items-center gap-2">
          <CalendarIcon />
          {formatMemberSince(profile.registrationDate)}
        </li>
        {profile.links.map((url) => (
          <li key={url} className="flex min-w-0 items-center gap-2">
            <LinkIcon />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className={`${profileTextLink} min-w-0 wrap-anywhere underline`}
            >
              {linkLabel(url)}
            </a>
          </li>
        ))}
        {email ? (
          <li className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <LockIcon />
            <span className="min-w-0 wrap-anywhere">{email}</span>
            <span className="text-xs text-text-secondary">
              (visível só para você)
            </span>
          </li>
        ) : null}
      </ul>
    </Card>
  )
}

export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5">
      <span className="sr-only">Carregando perfil...</span>
      <Card className="flex items-center gap-5 p-7">
        <span className="size-24 animate-pulse rounded-full bg-neutral-200 sm:size-28" />
        <div className="flex-1 space-y-3">
          <span className="block h-7 w-1/3 animate-pulse rounded bg-neutral-200" />
          <span className="block h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
          <span className="block h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="h-40 animate-pulse rounded-surface border border-neutral-200 bg-neutral-100" />
        <div className="h-40 animate-pulse rounded-surface border border-neutral-200 bg-neutral-100" />
      </div>
    </div>
  )
}

export function ProfileStatus({
  kind,
  onRetry,
}: {
  kind: 'notFound' | 'error'
  onRetry?: () => void
}) {
  const notFound = kind === 'notFound'
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-primary-900">
        <Icon name={notFound ? 'user' : 'alert'} size={24} />
      </span>
      <h1 className="font-display text-2xl font-bold text-primary-900">
        {notFound ? 'Perfil não encontrado' : 'Não foi possível carregar'}
      </h1>
      <p className="max-w-md text-sm text-neutral-700">
        {notFound
          ? 'Confira o nome de usuário no endereço ou volte para o início.'
          : 'Tivemos um problema ao buscar este perfil. Tente novamente em instantes.'}
      </p>
      {notFound ? (
        <Link
          to="/"
          className="mt-2 inline-flex h-10 items-center rounded-control bg-primary-900 button-vignette px-4 text-sm font-semibold text-white hover:bg-primary-800"
        >
          Voltar para o início
        </Link>
      ) : (
        <Button className="mt-2" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Card>
  )
}

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-neutral-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function CalendarIcon() {
  return (
    <SvgIcon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </SvgIcon>
  )
}

function PinIcon() {
  return (
    <SvgIcon>
      <path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </SvgIcon>
  )
}

function LinkIcon() {
  return (
    <SvgIcon>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </SvgIcon>
  )
}

function LockIcon() {
  return (
    <SvgIcon>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </SvgIcon>
  )
}

export function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  )
}
