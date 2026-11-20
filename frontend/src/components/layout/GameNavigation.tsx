import frame from '@/assets/moldura-navegacao.webp'
import pokemon from '@/assets/pokemon.webp'
import magic from '@/assets/magic.webp'
import yugioh from '@/assets/yugioh.webp'
import { Icon } from '@/components/ui/Icon'
import { Link, useRouterState } from '@tanstack/react-router'
import { GAMES } from './siteGames'

const games = [
  { name: 'Pokémon', image: pokemon },
  { name: 'Magic', image: magic },
  { name: 'Yu-Gi-Oh!', image: yugioh },
] as const

export function GameNavigation() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav aria-label="Navegação principal" className="tcg-nav">
      <img
        src={frame}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="tcg-frame-art"
      />
      <div className="tcg-nav-scroll">
        <div className="tcg-tabs">
          <Link
            to="/minha-colecao"
            aria-current={pathname === '/minha-colecao' ? 'page' : undefined}
            className="tcg-tab"
          >
            <Icon name="layers" size={20} /> Minha Coleção
          </Link>
          <Link
            to="/marketplace"
            search={{ sort: 'recent' }}
            aria-current={pathname === '/marketplace' ? 'page' : undefined}
            className="tcg-tab"
          >
            <Icon name="storefront" size={20} /> Marketplace
          </Link>
          {games.map(({ name, image }) => {
            const slug = GAMES.find((game) => game.name === name)?.slug
            if (!slug) return null
            const path = `/catalogo/${slug}`
            const active = pathname === path || pathname.startsWith(`${path}/`)
            return (
              <Link
                key={slug}
                to="/catalogo/$game"
                params={{ game: slug }}
                aria-current={active ? 'page' : undefined}
                className="tcg-tab"
              >
                <img src={image} alt="" className="tcg-game-icon" /> {name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
