import { Icon } from '@/components/ui/Icon'
import { Link, useRouterState } from '@tanstack/react-router'
import { NAV_GAMES } from './navigationItems'

/**
 * Navegação contextual de jogos, quando a página precisar dela.
 * Não é renderizada no SiteLayout: o Header e a tab bar já cuidam da navegação global.
 */
export function GameNavigation() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav aria-label="Catálogos de jogos" className="tcg-game-navigation">
      <div className="tcg-game-navigation-list">
        {NAV_GAMES.map((game) => {
          const active = pathname.startsWith(`/catalogo/${game.slug}`)
          return (
            <Link
              key={game.slug}
              to="/catalogo/$game"
              params={{ game: game.slug }}
              aria-current={active ? 'page' : undefined}
              className="tcg-game-navigation-link"
            >
              <Icon name="cards" size={20} />
              <span>{game.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
