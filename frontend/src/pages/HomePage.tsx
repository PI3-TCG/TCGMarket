import { focusRing, lightAction } from '@/components/ui/styles'
import { BannerGoldDivider } from '@/components/layout/PageBanner'
import { GAMES } from '@/components/layout/siteGames'
import { useSession } from '@/session'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import hero from '@/assets/images/image-banner-home.png'
import pokemonBanner from '@/assets/images/image-nav-pokemon.png'
import magicBanner from '@/assets/images/image-nav-magic.png'
import yugiohBanner from '@/assets/images/image-nav-yugioh.png'
import { Button } from '@/components/ui/Button'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { HomeInformationSections } from '@/components/home/HomeInformationSections'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAds } from '@/services/marketplace'

const exploreImages: Record<string, string> = {
  poke: pokemonBanner,
  magic: magicBanner,
  yugioh: yugiohBanner,
}

// A Homepage apresenta somente os três TCGs disponíveis no catálogo.
const HOME_GAMES = GAMES.filter(
  (game): game is Extract<(typeof GAMES)[number], { readonly slug: string }> =>
    game.slug !== null,
)

// Limita somente a vitrine da Homepage (a API do marketplace mantém a paginação original).
const HOME_AD_LIMIT = 8
const HOME_AD_GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'

export function HomePage() {
  const navigate = useNavigate()
  const { user, sessionReady } = useSession()
  return (
    <div className="min-h-svh text-neutral-900">
      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 lg:px-8">
        {sessionReady && user ? (
          <p role="status" className="sr-only">
            Você entrou como {user.name}.
          </p>
        ) : null}

        <section className="relative grid rounded-lg border-2 border-b-0 border-[#FCD203]/70 bg-[#130b30] text-white shadow-lg">
          <img
            src={hero}
            alt=""
            className="pointer-events-none col-start-1 row-start-1 block h-auto w-full min-w-0 self-start rounded-t-[inherit] xl:rounded-b-[inherit]"
          />

          <div className="relative col-start-1 row-start-2 flex max-w-xl flex-col justify-center px-6 py-6 sm:px-8 sm:py-8 xl:row-start-1">
            <h1 className="banner-text-outline text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Mais que cartas,{' '}
              <span className="text-primary-100">uma comunidade.</span>
            </h1>

            <p className="banner-text-outline mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Compre, venda, troque e expanda sua coleção!
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"

                onClick={() =>
                  navigate({
                    to: '/marketplace',
                    search: { sort: 'recent' },
                  })
                }

                className="rounded-md border border-[#280B3A] bg-primary-900 px-5 py-3 text-sm font-semibold hover:bg-primary-800"
              >
                Explorar anúncios
              </button>

              <button
                type="button"

                onClick={() =>
                  navigate({ to: user ? '/anuncios/novo' : '/login' })
                }

                className={`${lightAction} ${focusRing} cursor-pointer`}
              >
                Criar anúncio
              </button>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <ShieldIcon /> Compra segura
              </li>

              <li className="flex items-center gap-2">
                <PeopleIcon /> Comunidade ativa
              </li>

              <li className="flex items-center gap-2">
                <CardsIcon /> Diversos TCGs
              </li>
            </ul>
          </div>
          <BannerGoldDivider />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Explore por TCG</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {HOME_GAMES.map((game) => (
              <button
                key={game.name}

                type="button"

                onClick={() =>
                  navigate({
                    to: '/catalogo/$game',
                    params: { game: game.slug },
                  })
                }

                className="group relative h-30 overflow-hidden rounded-lg text-left text-white shadow-sm"

                style={{
                  background: `linear-gradient(145deg, ${game.from}, ${game.to})`,
                }}
              >
                {exploreImages[game.mark] ? (
                  <img
                    src={exploreImages[game.mark]}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <GameMark kind={game.mark} />
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
                />

                <span className="absolute bottom-3 left-3 text-lg font-bold">
                  {game.name}
                </span>

                <span className="absolute right-3 bottom-3 text-xs opacity-80 transition group-hover:translate-x-0.5">
                  Ver cartas
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-ornaments rounded-xl border border-rare-500 bg-white p-4">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Anúncios em destaque</h2>

            <button
              type="button"

              onClick={() =>
                navigate({
                  to: '/marketplace',
                  search: { sort: 'priceDesc' },
                })
              }

              className="text-sm font-semibold text-primary-900"
            >
              Ver todos os anúncios
            </button>
          </div>

          <HomeAds />
        </section>

        <HomeInformationSections isAuthenticated={Boolean(user)} />
      </main>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"

      className="size-4"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      aria-hidden="true"
    >
      <path d="M12 3 19 6v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6Z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"

      className="size-4"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />

      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />

      <circle cx="17" cy="9" r="2.2" />

      <path d="M16 14.2a4.5 4.5 0 0 1 4.5 4.3" />
    </svg>
  )
}

function CardsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"

      className="size-4"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      aria-hidden="true"
    >
      <rect x="7" y="3" width="12" height="16" rx="2" />

      <path d="M5 7v12a2 2 0 0 0 2 2h10" />
    </svg>
  )
}

function GameMark({ kind }: { kind: (typeof GAMES)[number]['mark'] }) {
  return (
    <svg
      viewBox="0 0 64 64"

      className="absolute -top-2 right-1 size-24 opacity-80"

      aria-hidden="true"
    >
      {kind === 'poke' ? (
        <path
          d="M32 8 37 24h16l-13 9 5 16-13-9-13 9 5-16-13-9h16Z"

          fill="white"
        />
      ) : null}

      {kind === 'magic' ? (
        <path
          d="M32 6 54 28 32 58 10 28Z"

          fill="none"

          stroke="white"

          strokeWidth="3"
        />
      ) : null}

      {kind === 'yugioh' ? (
        <path
          d="M32 8 50 20v24L32 56 14 44V20Z"

          fill="none"

          stroke="#fde68a"

          strokeWidth="3"
        />
      ) : null}
    </svg>
  )
}

function HomeAds() {
  const fetchAds = useCallback(() => getMarketplaceAds(1, 'priceDesc'), [])
  const { state, retry } = useRemoteData('home-ads:priceDesc', fetchAds)

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Carregando anúncios em destaque"
      >
        <span className="sr-only">Carregando anúncios...</span>

        <div aria-hidden="true" className={HOME_AD_GRID}>
          {Array.from({ length: HOME_AD_LIMIT }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white motion-safe:animate-pulse"
            >
              <div className="aspect-square bg-primary-100" />
              <div className="space-y-3 p-3">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
                <div className="h-8 rounded bg-primary-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (state.status !== 'ready') {
    return (
      <div
        role="alert"
        className="rounded-xl border border-primary-300/30 bg-white p-5 text-center"
      >
        <p className="text-sm text-neutral-700">
          Não foi possível carregar os anúncios.
        </p>

        <Button variant="outline" className="mt-3" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const ads = state.data.content.slice(0, HOME_AD_LIMIT)

  if (ads.length === 0) {
    return (
      <div
        role="status"
        className="rounded-xl border border-dashed border-primary-300/40 bg-white p-5 text-center"
      >
        <p className="text-sm font-semibold text-primary-900">
          Ainda não há anúncios disponíveis.
        </p>

        <p className="mt-2 text-xs text-neutral-700">
          Novos anúncios aparecerão aqui quando forem publicados.
        </p>
      </div>
    )
  }

  return (
    <div className={HOME_AD_GRID}>
      {ads.map((ad) => (
        <MarketplaceAdCard key={ad.id} ad={ad} />
      ))}
    </div>
  )
}
