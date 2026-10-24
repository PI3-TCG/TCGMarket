import { Alert } from '@/components/ui/Alert'
import { GAMES } from '@/components/layout/siteGames'
import { useSession } from '@/session'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import hero from '@/assets/images/image-banner-home.png'
import pokemonBanner from '@/assets/images/image-nav-pokemon.png'
import magicBanner from '@/assets/images/image-nav-magic.png'
import yugiohBanner from '@/assets/images/image-nav-yugioh.png'
import onePieceBanner from '@/assets/images/image-nav-onePiece.png'
import digimonBanner from '@/assets/images/image-nav-digimon.png'
import { Button } from '@/components/ui/Button'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { MarketplaceAdDetailsModal } from '@/components/marketplace/MarketplaceAdDetailsModal'
import { formatCurrency } from '@/components/ads/adFormat'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAds } from '@/services/marketplace'
import type { MarketplaceSort } from '@/types/Marketplace'



const exploreImages: Record<string, string> = {
  poke: pokemonBanner,
  magic: magicBanner,
  yugioh: yugiohBanner,
  piece: onePieceBanner,
  digimon: digimonBanner,
}

export function HomePage() {
  const [selectedAdId, setSelectedAdId] = useState<string | null>(
    null,
  )
  const navigate = useNavigate()
  const { user, sessionReady } = useSession()
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])
  function soon(feature: string) {
    setNotice(`${feature} será implementado no futuro.`)
  }
  const firstName = user?.name.split(' ')[0]
  return (
    <div className="min-h-svh bg-neutral-50 text-neutral-900">
      {notice ? (
        <div className="fixed top-24 right-4 left-4 z-30 mx-auto max-w-md sm:left-auto">
          <Alert variant="info" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 lg:px-8">
        {sessionReady && user ? (
          <p role="status" className="sr-only">
            Você entrou como {user.name}.
          </p>
        ) : null}

        <section className="relative min-h-[300px] overflow-hidden rounded-lg bg-neutral-900 text-white shadow-lg">
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-neutral-900/75 from-0% via-neutral-900/55 via-45% to-transparent to-80%"
          />

          <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Mais que cartas,{' '}
              <span className="text-primary-100">uma comunidade.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Compre, venda, troque e expanda sua coleção de TCGs com outros fãs
              como você.
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

                className="rounded-md bg-primary-900 px-5 py-3 text-sm font-semibold hover:bg-primary-800"
              >
                Explorar anúncios
              </button>

              <button
                type="button"

                onClick={() =>
                  navigate({ to: user ? '/anuncios/novo' : '/login' })
                }

                className="rounded-md border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20"
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
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Explore por TCG</h2>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {GAMES.map((game) => (
              <button
                key={game.name}

                type="button"

                onClick={() =>
                  game.slug
                    ? navigate({
                      to: '/catalogo/$game',
                      params: { game: game.slug },
                    })
                    : soon(`O catálogo de ${game.name}`)
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

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
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

            <HomeAds
              sort="priceDesc"
              variant="cards"
              onViewDetails={setSelectedAdId}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Últimos anúncios</h2>

                <button
                  type="button"

                  onClick={() =>
                    navigate({
                      to: '/marketplace',
                      search: { sort: 'recent' },
                    })
                  }

                  className="text-xs font-semibold text-primary-900"
                >
                  Ver todos
                </button>
              </div>

              <HomeAds
                sort="recent"
                variant="list"
                onViewDetails={setSelectedAdId}
              />
            </div>

            <aside className="rounded-lg bg-linear-to-br from-primary-100 to-neutral-100 p-5">
              <h2 className="text-lg font-bold">
                {user ? `Olá, ${firstName}` : 'Faça parte da nossa comunidade'}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {user
                  ? 'Organize sua coleção, publique seus anúncios e encontre cartas para comprar ou trocar.'
                  : 'Siga outros colecionadores, participe de trocas e fique por dentro das novidades.'}
              </p>

              {user ? (
                <button
                  type="button"

                  onClick={() => navigate({ to: '/anuncios/novo' })}

                  className="mt-4 w-full rounded-md bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  Criar anúncio
                </button>
              ) : (
                <button
                  type="button"

                  onClick={() => navigate({ to: '/cadastro' })}

                  className="mt-4 w-full rounded-md bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  Criar uma conta gratuita
                </button>
              )}

              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>Anuncie suas cartas</li>

                <li>Monte sua coleção</li>

                <li>Conecte-se com outros fãs</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>

      {selectedAdId !== null && (
        <MarketplaceAdDetailsModal
          key={selectedAdId}
          adId={selectedAdId}
          onClose={() => setSelectedAdId(null)}
        />
      )}

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

      {kind === 'piece' ? (
        <>
          <circle
            cx="32"

            cy="28"

            r="16"

            fill="none"

            stroke="white"

            strokeWidth="3"
          />

          <path
            d="M20 24c6-10 18-10 24 0"

            fill="none"

            stroke="white"

            strokeWidth="3"
          />
        </>
      ) : null}

      {kind === 'digimon' ? (
        <rect
          x="16"

          y="14"

          width="32"

          height="36"

          rx="8"

          fill="none"

          stroke="white"

          strokeWidth="3"
        />
      ) : null}
    </svg>
  )
}

type HomeAdsProps = {
  sort: MarketplaceSort
  variant: 'cards' | 'list'
  onViewDetails: (adId: string) => void
}

const homeAdsGrid =
  'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'

const homeGameLabels: Record<string, string> = {
  POKEMON: 'Pokémon',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
  YUGIOH: 'Yu-Gi-Oh!',
}

function HomeAds({
  sort,
  variant,
  onViewDetails,
}: HomeAdsProps) {
  const fetchAds = useCallback(
    () => getMarketplaceAds(1, sort),
    [sort],
  )

  const { state, retry } = useRemoteData(
    `home-ads:${sort}`,
    fetchAds,
  )

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={
          variant === 'cards'
            ? 'Carregando anúncios em destaque'
            : 'Carregando últimos anúncios'
        }
      >
        <span className="sr-only">Carregando anúncios...</span>

        <div
          aria-hidden="true"
          className={variant === 'cards' ? homeAdsGrid : 'space-y-3'}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className={
                variant === 'cards'
                  ? 'overflow-hidden rounded-xl border border-neutral-200 bg-white motion-safe:animate-pulse'
                  : 'h-16 rounded-lg bg-primary-100/60 motion-safe:animate-pulse'
              }
            >
              {variant === 'cards' && (
                <>
                  <div className="aspect-[4/5] bg-primary-100/70" />

                  <div className="space-y-3 p-3">
                    <div className="h-4 w-3/4 rounded bg-neutral-200" />
                    <div className="h-3 w-1/2 rounded bg-neutral-200" />
                    <div className="h-8 rounded bg-primary-100" />
                  </div>
                </>
              )}
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

        <Button
          variant="outline"
          className="mt-3"
          onClick={retry}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  // A Home apresenta uma prévia dos cinco primeiros resultados.
  // A ordenação já foi aplicada pelo backend.
  const ads = state.data.content.slice(0, 5)

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

  if (variant === 'cards') {
    return (
      <div className={homeAdsGrid}>
        {ads.map((ad) => (
          <MarketplaceAdCard
            key={ad.id}
            ad={ad}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    )
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {ads.map((ad) => (
        <li key={ad.id}>
          <button
            type="button"
            onClick={() => onViewDetails(ad.id)}
            aria-label={`Ver anúncio de ${ad.cardName}`}
            className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 text-left transition hover:bg-primary-100/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-semibold text-primary-900">
                {ad.cardName}
              </span>

              <span className="mt-1 block break-words text-xs text-neutral-700">
                {homeGameLabels[ad.game] ?? ad.game}
                {ad.edition ? ` • ${ad.edition}` : ''}
              </span>

              <span className="mt-1 block text-xs text-neutral-700">
                {ad.remainingQuantity}{' '}
                {ad.remainingQuantity === 1
                  ? 'unidade disponível'
                  : 'unidades disponíveis'}
                {' • '}
                {ad.saleEnabled && ad.tradeEnabled
                  ? 'Venda e troca'
                  : ad.saleEnabled
                    ? 'Venda'
                    : 'Troca'}
              </span>
            </span>

            <span className="text-right text-sm font-semibold text-primary-900">
              {ad.saleEnabled
                ? ad.unitPrice !== null
                  ? formatCurrency(ad.unitPrice)
                  : 'Preço indisponível'
                : 'Somente troca'}

              {ad.saleEnabled && ad.unitPrice !== null && (
                <span className="block text-[10px] font-normal text-neutral-700">
                  por unidade
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}