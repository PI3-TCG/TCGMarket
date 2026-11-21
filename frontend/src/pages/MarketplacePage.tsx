import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { pageBanners } from '@/config/pageBanners'
import { useCallback, useState } from 'react'
import { conditionLabels, languageLabels } from '@/components/ads/adFormat'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageBanner } from '@/components/layout/PageBanner'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { ResponsiveFilters } from '@/components/ui/ResponsiveFilters'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { emptyMarketplaceFilters } from '@/components/marketplace/marketplaceFilterDefaults'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAds } from '@/services/marketplace'
import type {
  MarketplaceFilters as FilterValues,
  MarketplaceSort,
} from '@/types/Marketplace'

type Props = {
  sort?: MarketplaceSort
}

type Query = {
  page: number
  filters: FilterValues
}

const sortOptions: {
  value: MarketplaceSort
  label: string
}[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'priceDesc', label: 'Destaques' },
]

const gameLabels: Record<string, string> = {
  POKEMON: 'Pokémon',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
  YUGIOH: 'Yu-Gi-Oh!',
}

const modalityLabels: Record<string, string> = {
  SALE: 'Aceita venda',
  TRADE: 'Aceita troca',
  BOTH: 'Venda e troca',
}

export function MarketplacePage({ sort = 'recent' }: Props) {
  const [filters, setFilters] = useState<FilterValues>({
    ...emptyMarketplaceFilters,
  })
  const [filterVersion, setFilterVersion] = useState(0)

  function applyFilters(next: FilterValues) {
    setFilters({ ...next })
    setFilterVersion((current) => current + 1)
  }

  return (
    <main className="min-h-screen pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.marketplace}
          title="Marketplace"
          subtitle={
            <>
              Encontre cartas para comprar ou trocar.
              <br />
              Complete sua coleção!
            </>
          }
        />

        <div className="grid items-start gap-6 pt-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ResponsiveFilters>
            <MarketplaceFilters onApply={applyFilters} />
          </ResponsiveFilters>

          <MarketplaceResults
            key={`${sort}:${filterVersion}`}
            sort={sort}
            initialFilters={filters}
          />
        </div>
      </div>
    </main>
  )
}

function MarketplaceResults({
  sort,
  initialFilters,
}: {
  sort: MarketplaceSort
  initialFilters: FilterValues
}) {
  const [query, setQuery] = useState<Query>({
    page: 1,
    filters: initialFilters,
  })

  const { page, filters } = query

  const fetchAds = useCallback(
    () => getMarketplaceAds(page, sort, filters),
    [page, sort, filters],
  )

  const { state, retry } = useRemoteData(
    JSON.stringify(['marketplace', sort, page, filters]),
    fetchAds,
  )

  const data = state.status === 'ready' ? state.data : null

  const hasFilters = Boolean(
    Object.values(filters).some(Boolean),
  )

  const appliedFilters = [
    filters.search ? `Nome: ${filters.search}` : null,
    filters.edition ? `Edição: ${filters.edition}` : null,
    filters.rarity ? `Raridade: ${filters.rarity}` : null,
    filters.condition ? `Condição: ${conditionLabels[filters.condition]}` : null,
    filters.language ? `Idioma: ${languageLabels[filters.language]}` : null,
    filters.minPrice ? `Preço mínimo: R$ ${filters.minPrice}` : null,
    filters.maxPrice ? `Preço máximo: R$ ${filters.maxPrice}` : null,
    filters.game
      ? `TCG: ${gameLabels[filters.game] ?? filters.game}`
      : null,
    filters.modality
      ? `Tipo: ${modalityLabels[filters.modality]}`
      : null,
  ].filter((value): value is string => value !== null)

  function changePage(nextPage: number) {
    setQuery((current) => ({
      ...current,
      page: nextPage,
    }))

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section
      aria-label="Anúncios disponíveis"
      className="min-w-0 panel-ornaments rounded-xl border border-rare-500 bg-white p-4"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-primary-300/20 pb-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary-900">
            <Icon name="grid" size={20} />
            Explore os anúncios
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs text-neutral-700"
          >
            {state.status === 'loading'
              ? 'Carregando anúncios...'
              : data
                ? `${data.totalElements} ${
                    data.totalElements === 1
                      ? 'anúncio encontrado'
                      : 'anúncios encontrados'
                  }`
                : 'Consulta indisponível no momento'}
          </p>
        </div>

        <nav
          aria-label="Ordenação dos anúncios"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-xs text-neutral-700">
            Ordenar por:
          </span>

          {sortOptions.map((option) => (
            <Link
              key={option.value}
              to="/marketplace"
              search={{ sort: option.value }}
              aria-current={
                sort === option.value ? 'true' : undefined
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 ${
                sort === option.value
                  ? 'border-transparent bg-primary-900 button-vignette text-white'
                  : 'border-primary-300/40 bg-white text-primary-900 hover:bg-primary-100'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>

      {appliedFilters.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-neutral-700">
            Filtros aplicados
          </p>

          <ul
            aria-label="Filtros aplicados"
            className="flex flex-wrap gap-2"
          >
            {appliedFilters.map((label) => (
              <li
                key={label}
                className="max-w-full wrap-anywhere rounded-lg bg-primary-100 px-3 py-2 text-xs font-semibold text-primary-900"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'loading' ? (
        <div
          role="status"
          aria-label="Carregando anúncios"
          aria-busy="true"
          className={tradingCardGrid}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white motion-safe:animate-pulse"
            >
              <div className="aspect-square bg-primary-100" />

              <div className="space-y-3 p-3">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
                <div className="h-6 w-24 rounded bg-primary-100" />
                <div className="h-10 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      ) : !data ? (
        <FeedbackState
          role="alert"
          icon="alert"
          title="Não foi possível carregar os anúncios"
          description="Verifique sua conexão e tente novamente."
          className="rounded-xl bg-neutral-50"
        >
          <Button onClick={retry}>Tentar novamente</Button>
        </FeedbackState>
      ) : data.content.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-dashed border-primary-300/40 bg-neutral-50 px-6 py-12 text-center"
        >
          <Icon
            name={hasFilters ? 'search' : 'gem'}
            size={32}
            className="mx-auto text-primary-900"
          />

          <h3 className="mt-4 font-display text-xl font-bold text-primary-900">
            {page > 1
              ? 'Não há anúncios nesta página'
              : hasFilters
                ? 'Nenhum anúncio encontrado'
                : 'Ainda não há anúncios no marketplace'}
          </h3>

          <p className="mt-2 text-sm text-neutral-700">
            {page > 1
              ? 'A disponibilidade dos anúncios pode ter mudado.'
              : hasFilters
                ? 'Altere os filtros ou clique em “Limpar filtros” para consultar todos os anúncios.'
                : 'Quando houver anúncios disponíveis, eles aparecerão aqui.'}
          </p>

          {page > 1 && (
            <Button
              className="mt-5"
              onClick={() => changePage(1)}
            >
              Voltar à primeira página
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={tradingCardGrid}>
            {data.content.map((ad) => (
              <MarketplaceAdCard key={ad.id} ad={ad} />
            ))}
          </div>

          <div className="mt-6 border-t border-primary-300/20 pt-4">
            <p className="text-xs text-neutral-700">
              Exibindo {(data.page - 1) * data.size + 1}–
              {(data.page - 1) * data.size + data.content.length}
              {' de '}
              {data.totalElements} anúncios
            </p>

            {data.totalPages > 1 && (
              <PageNavigation label="Paginação do marketplace" page={data.page} totalPages={data.totalPages} onPageChange={changePage} className="mt-4" />
            )}
          </div>
        </>
      )}
    </section>
  )
}