import { useNavigate, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { GAMES } from './siteGames'

type Props = { onSoon: (feature: string) => void }

export function GameNavigation({ onSoon }: Props) {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  function openGame(name: string) {
    const game = GAMES.find((item) => item.name === name)
    if (!game) return
    if (game.slug)
      navigate({ to: '/catalogo/$game', params: { game: game.slug } })
    else onSoon(`O catálogo de ${name}`)
  }
  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] justify-start gap-1 overflow-x-auto px-2 sm:justify-center">
        <NavChip
          current={pathname === '/'}

          onClick={() => navigate({ to: '/' })}
        >
          <HomeIcon />
          Início
        </NavChip>

        {GAMES.map((game) => (
          <NavChip
            key={game.name}
            current={pathname === `/catalogo/${game.slug}`}

            onClick={() => openGame(game.name)}
          >
            <GameGlyph kind={game.mark} />

            {game.name}
          </NavChip>
        ))}
      </div>
    </nav>
  )
}

function NavChip({
  children,

  onClick,

  current = false,
}: {
  children: ReactNode

  onClick: () => void

  current?: boolean
}) {
  return (
    <button
      type="button"

      onClick={onClick}

      className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${
        current
          ? 'border-primary-900 font-semibold text-primary-900'
          : 'border-transparent text-neutral-700 hover:text-primary-900'
      }`}
    >
      {children}
    </button>
  )
}

function GameGlyph({ kind }: { kind: (typeof GAMES)[number]['mark'] }) {
  return (
    <svg
      viewBox="0 0 24 24"

      className="size-4"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      aria-hidden="true"
    >
      {kind === 'poke' ? <circle cx="12" cy="12" r="7" /> : null}

      {kind === 'magic' ? <path d="m12 3 7 9-7 9-7-9Z" /> : null}

      {kind === 'yugioh' ? <path d="M12 3 20 8v8l-8 5-8-5V8Z" /> : null}

      {kind === 'piece' ? (
        <path d="M6 16c2-7 10-7 12 0M8 9a4 4 0 0 1 8 0" />
      ) : null}

      {kind === 'digimon' ? (
        <rect x="6" y="4" width="12" height="16" rx="3" />
      ) : null}
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"

      className="size-4"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      aria-hidden="true"
    >
      <path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1Z" />
    </svg>
  )
}
