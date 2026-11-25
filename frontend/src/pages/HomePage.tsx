import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

import hero from '@/assets/images/image-banner-home.png'
import pokemonBanner from '@/assets/images/image-nav-pokemon.png'
import magicBanner from '@/assets/images/image-nav-magic.png'
import yugiohBanner from '@/assets/images/image-nav-yugioh.png'
import secureIcon from '@/assets/design-system/compra-segura.svg'
import catalogIcon from '@/assets/design-system/amplo-catalogo.svg'
import communityIcon from '@/assets/design-system/comunidade-ativa.svg'
import collectionIcon from '@/assets/design-system/gestao-da-colecao.svg'
import ornamentLine from '@/assets/design-system/linha-losango.svg'

import { HomeInformationSections } from '@/components/home/HomeInformationSections'
import { BannerFrame } from '@/components/layout/PageBanner'
import { GAMES } from '@/components/layout/siteGames'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { focusRing } from '@/components/ui/styles'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAds } from '@/services/marketplace'
import { useSession } from '@/session'

const GAME_ORDER: readonly string[] = ['magic', 'pokemon', 'yugioh']

// A ordem é editorial; os destinos vêm do cadastro real de TCGs disponíveis.
const HOME_GAMES = GAMES.filter((game) => GAME_ORDER.includes(game.slug)).sort(
  (first, second) =>
    GAME_ORDER.indexOf(first.slug) - GAME_ORDER.indexOf(second.slug),
)

const GAME_ART: Record<string, string> = {
  magic: magicBanner,
  pokemon: pokemonBanner,
  yugioh: yugiohBanner,
}

const BENEFITS = [
  {
    label: 'Compra segura',
    description: 'Transações protegidas',
    icon: secureIcon,
  },
  {
    label: 'Amplo catálogo',
    description: 'Diversos jogos e edições',
    icon: catalogIcon,
  },
  {
    label: 'Comunidade ativa',
    description: 'Colecionadores como você',
    icon: communityIcon,
  },
  {
    label: 'Gestão da coleção',
    description: 'Organize e anuncie suas cartas',
    icon: collectionIcon,
  },
] as const

const HOME_AD_LIMIT = 8

// O painel acompanha a largura da grade para não criar grandes faixas brancas
// ao redor dos anúncios. O próprio card é o mesmo do Marketplace (DS-04).
const HOME_AD_PANEL =
  'mx-auto w-full max-w-[320px] min-[390px]:max-w-[600px] md:max-w-[900px] xl:max-w-[1192px]'
const HOME_AD_GRID =
  'grid w-full grid-cols-1 items-stretch gap-4 min-[390px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'

const sectionHeading =
  'font-display text-lg font-bold tracking-[0.025em] text-text-primary sm:text-xl'

export function HomePage() {
  const navigate = useNavigate()
  const { user, sessionReady } = useSession()

  return (
    <div className="min-h-svh text-text-primary">
      <main className="w-full">
        {sessionReady && user ? (
          <p role="status" className="sr-only">
            Você entrou como {user.name}.
          </p>
        ) : null}

        {/* 1. Hero: arte aprovada, gradiente e moldura DS v2.2. */}
        <section aria-label="Apresentação do TCG Market">
          <BannerFrame
            image={hero}
            imagePosition="right center"
            variant="hero"
            fullBleed
          >
            <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center px-4 py-10 sm:px-6 sm:py-12 lg:min-h-[340px] lg:px-8">
              <div className="w-full max-w-[540px] py-4 sm:pl-6 lg:pl-10">
                <h1 className="max-w-[500px] font-display text-[clamp(1.65rem,3vw,2.6rem)] leading-[1.2] font-bold tracking-[0.012em] text-surface-sand uppercase [text-wrap:balance]">
                  O Marketplace dos Colecionadores
                </h1>

                <p className="mt-3 max-w-[420px] text-sm leading-relaxed text-white sm:text-base">
                  Compre, venda e gerencie suas cartas em um ambiente inspirado no universo dos RPGs.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void navigate({ to: '/marketplace', search: { sort: 'recent' } })
                    }}
                    className={`${focusRing} inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-accent-gold-frame bg-brand-primary-light px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-primary-hover active:bg-brand-primary-deep`}
                  >
                    Explorar Marketplace
                    <span aria-hidden="true">→</span>
                  </button>
                  <a
                    href="#jogos-em-destaque"
                    className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-control border border-accent-gold-frame bg-surface-sand px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-accent-gold-soft`}
                  >
                    Conhecer Catálogo
                  </a>
                </div>
              </div>
            </div>
          </BannerFrame>
        </section>

        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 pt-5 pb-12 sm:space-y-10 sm:px-6 lg:px-8">
          {/* Faixa institucional do mockup: textos descritivos, sem contadores fictícios. */}
          <section aria-label="Diferenciais da plataforma">
            <ul className="grid grid-cols-2 gap-3 border-b border-accent-bronze/45 pb-6 lg:grid-cols-4 lg:gap-5">
              {BENEFITS.map((benefit) => (
                <li key={benefit.label} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <img
                    src={benefit.icon}
                    alt=""
                    aria-hidden="true"
                    className="size-9 shrink-0 object-contain sm:size-11"
                  />
                  <div className="min-w-0">
                    <p className="text-xs leading-5 font-bold text-text-ink sm:text-sm">
                      {benefit.label}
                    </p>
                    <p className="text-[11px] leading-4 text-text-secondary sm:text-xs">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Três jogos disponíveis: título editorial, sem falso destaque. */}
          <section id="jogos-em-destaque" aria-labelledby="home-games-title">
            <div className="mb-5 text-center">
              <div className="flex items-center justify-center gap-2.5 sm:gap-4">
                <img
                  src={ornamentLine}
                  alt=""
                  aria-hidden="true"
                  className="h-auto w-11 shrink-0 sm:w-28 lg:w-44"
                />
                <h2
                  id="home-games-title"
                  className="shrink-0 font-display text-base font-bold uppercase tracking-[0.02em] text-text-primary min-[390px]:text-lg sm:text-xl lg:text-2xl"
                >
                  Explore os TCGs
                </h2>
                <img
                  src={ornamentLine}
                  alt=""
                  aria-hidden="true"
                  className="h-auto w-11 shrink-0 -scale-x-100 sm:w-28 lg:w-44"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                Escolha um universo e conheça suas cartas.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {HOME_GAMES.map((game) => (
                <button
                  key={game.slug}
                  type="button"
                  onClick={() => {
                    void navigate({
                      to: '/catalogo/$game',
                      params: { game: game.slug },
                    })
                  }}
                  aria-label={`Explorar o catálogo de ${game.name}`}
                  className={`${focusRing} group relative isolate h-[128px] min-w-0 cursor-pointer overflow-hidden rounded-banner border border-accent-bronze/80 bg-brand-deep text-left text-white shadow-sm transition-[box-shadow,border-color] hover:border-accent-gold-frame hover:shadow-md sm:h-[132px] lg:h-[154px]`}
                >
                  <img
                    src={GAME_ART[game.slug]}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-200 motion-safe:group-hover:scale-[1.035] motion-reduce:transition-none"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-brand-deep/85 via-brand-deep/35 to-transparent"
                  />
                  <span className="absolute inset-[4px] rounded-[12px] border border-accent-bronze/65" aria-hidden="true" />
                  <span className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-3.5 lg:p-5">
                    <span className="font-display text-base font-bold text-white drop-shadow-md lg:text-lg">
                      {game.name}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-surface-sand">
                      Ver cartas <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 3. Vitrine real: ordenação por recentes, sem falso destaque. */}
          <section
            aria-labelledby="home-ads-title"
            className={`${HOME_AD_PANEL} rounded-surface border border-border-default bg-white p-4 shadow-sm sm:p-5 lg:p-6`}
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="home-ads-title" className={sectionHeading}>
                  Anúncios recentes
                </h2>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  Cartas anunciadas por colecionadores da comunidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void navigate({ to: '/marketplace', search: { sort: 'recent' } })
                }}
                className={`${focusRing} inline-flex min-h-11 items-center gap-1 rounded-control px-2 text-sm font-semibold text-brand-primary hover:underline`}
              >
                Ver todos os anúncios
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <HomeAds />
          </section>

          {/* 4 e 5. Ordem preservada: Como funciona → Guia de condição. */}
          <HomeInformationSections isAuthenticated={Boolean(user)} />
        </div>
      </main>
    </div>
  )
}

function HomeAds() {
  const fetchAds = useCallback(() => getMarketplaceAds(1, 'recent'), [])
  const { state, retry } = useRemoteData('home-ads:recent', fetchAds)

  if (state.status === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-label="Carregando anúncios recentes">
        <span className="sr-only">Carregando anúncios...</span>
        <div aria-hidden="true" className={HOME_AD_GRID}>
          {Array.from({ length: HOME_AD_LIMIT }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-card border border-border-default bg-surface-default motion-safe:animate-pulse"
            >
              <div className="aspect-[5/7] w-full bg-surface-subtle" />
              <div className="space-y-3 p-3.5">
                <div className="h-4 w-3/4 rounded bg-surface-subtle" />
                <div className="h-4 w-1/2 rounded bg-surface-subtle" />
                <div className="h-9 rounded bg-surface-subtle" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (state.status !== 'ready') {
    return (
      <div role="alert" className="rounded-surface border border-border-default bg-surface-default p-5 text-center">
        <p className="text-sm text-text-secondary">Não foi possível carregar os anúncios.</p>
        <Button variant="outline" className="mt-3" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const ads = state.data.content.slice(0, HOME_AD_LIMIT)

  if (ads.length === 0) {
    return (
      <div role="status" className="rounded-surface border border-dashed border-border-default bg-surface-default p-5 text-center">
        <Icon name="cards" size={24} className="mx-auto mb-2 text-brand-primary" />
        <p className="text-sm font-semibold text-text-primary">Ainda não há anúncios disponíveis.</p>
        <p className="mt-2 text-xs text-text-secondary">Os anúncios serão exibidos assim que forem publicados.</p>
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
