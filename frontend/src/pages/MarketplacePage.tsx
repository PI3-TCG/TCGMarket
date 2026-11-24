import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { FeedbackState } from '@/components/ui/FeedbackState'
import {
  FilterChips,
  type AppliedFilterChip,
  ResponsiveFilters,
} from '@/components/ui/ResponsiveFilters'
import { ListingHeader, ListingSkeleton, listingPanelClass, listingLabelClass, listingSortClass } from '@/components/ui/ListingPresentation'
import { pageBanners } from '@/config/pageBanners'
import { useCallback, useState } from 'react'
import { conditionLabels, languageLabels } from '@/components/ads/adFormat'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/Button'
import { PageBanner } from '@/components/layout/PageBanner'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { emptyMarketplaceFilters } from '@/components/marketplace/marketplaceFilterDefaults'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAds } from '@/services/marketplace'
import type {
  MarketplaceFilters as FilterValues,
  MarketplaceSort,
} from '@/types/Marketplace'

type Props = { sort?: MarketplaceSort }
type Query = { page: number; filters: FilterValues }

const sortOptions: { value: MarketplaceSort; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'priceAsc', label: 'Menor preço' },
  { value: 'priceDesc', label: 'Maior preço' },
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
  const [filters, setFilters] = useState<FilterValues>({ ...emptyMarketplaceFilters })
  const [filterVersion, setFilterVersion] = useState(0)

  function applyFilters(next: FilterValues) {
    setFilters({ ...next })
    setFilterVersion((current) => current + 1)
  }

  function removeFilter(key: keyof FilterValues) {
    applyFilters({ ...filters, [key]: emptyMarketplaceFilters[key] })
  }

  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.marketplace}
          title="Marketplace"
          subtitle="Encontre cartas para comprar ou trocar. Complete sua coleção!"
        />

        <div className="grid items-start gap-6 pt-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ResponsiveFilters>
            <MarketplaceFilters
              key={JSON.stringify(filters)}
              onApply={applyFilters}
              initialFilters={filters}
            />
          </ResponsiveFilters>

          <MarketplaceResults
            key={`${sort}:${filterVersion}`}
            sort={sort}
            initialFilters={filters}
            onRemoveFilter={removeFilter}
            onClearFilters={() => applyFilters({ ...emptyMarketplaceFilters })}
          />
        </div>
      </div>
    </main>
  )
}

function MarketplaceResults({
  sort,
  initialFilters,
  onRemoveFilter,
  onClearFilters,
}: {
  sort: MarketplaceSort
  initialFilters: FilterValues
  onRemoveFilter: (key: keyof FilterValues) => void
  onClearFilters: () => void
}) {
  const navigate = useNavigate({ from: '/marketplace' })
  const [query, setQuery] = useState<Query>({ page: 1, filters: initialFilters })
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
  const hasFilters = Object.values(filters).some(Boolean)
  const chips: AppliedFilterChip[] = [
    { key: 'search', label: `Nome: ${filters.search}` },
    { key: 'edition', label: `Edição: ${filters.edition}` },
    { key: 'rarity', label: `Raridade: ${filters.rarity}` },
    { key: 'condition', label: `Condição: ${filters.condition ? conditionLabels[filters.condition] : ''}` },
    { key: 'language', label: `Idioma: ${filters.language ? languageLabels[filters.language] : ''}` },
    { key: 'minPrice', label: `Preço mínimo: R$ ${filters.minPrice}` },
    { key: 'maxPrice', label: `Preço máximo: R$ ${filters.maxPrice}` },
    { key: 'game', label: `TCG: ${gameLabels[filters.game] ?? filters.game}` },
    { key: 'modality', label: `Tipo: ${modalityLabels[filters.modality] ?? filters.modality}` },
  ].filter((item) => Boolean(filters[item.key as keyof FilterValues]))

  function changePage(nextPage: number) {
    setQuery((current) => ({ ...current, page: nextPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section aria-label="Anúncios disponíveis" className={listingPanelClass}>
      <ListingHeader
        title="Explore os anúncios"
        description={
          state.status === 'loading'
            ? 'Carregando anúncios...'
            : data
              ? `${data.totalElements.toLocaleString('pt-BR')} ${data.totalElements === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}`
              : 'Consulta indisponível no momento'
        }
        actions={
          <label htmlFor="marketplace-sort" className={`flex min-w-0 flex-wrap items-center gap-2 ${listingLabelClass}`}>
            <span>Ordenar por:</span>
            <select
              id="marketplace-sort"
              value={sort}
              onChange={(event) => {
                const selected = sortOptions.find((option) => option.value === event.target.value)
                if (selected && selected.value !== sort) {
                  void navigate({ to: '/marketplace', search: { sort: selected.value } })
                }
              }}
              className={listingSortClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        }
      />

      <FilterChips
        chips={chips}
        onRemove={(key) => onRemoveFilter(key as keyof FilterValues)}
      />
      {hasFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mb-4 min-h-10 text-sm font-semibold text-brand-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-support-blue"
        >
          Limpar todos os filtros
        </button>
      ) : null}

      {state.status === 'loading' ? (
        <ListingSkeleton label="Carregando anúncios do marketplace" />
      ) : !data ? (
        <FeedbackState
          role="alert"
          icon="alert"
          title="Não foi possível carregar os anúncios"
          description="Verifique sua conexão e tente novamente."
          className="rounded-surface border border-border-default bg-surface-default"
        >
          <Button onClick={retry}>Tentar novamente</Button>
        </FeedbackState>
      ) : data.content.length === 0 ? (
        <FeedbackState
          icon={hasFilters ? 'search' : 'gem'}
          title={
            page > 1
              ? 'Não há anúncios nesta página'
              : hasFilters
                ? 'Nenhum anúncio encontrado'
                : 'Ainda não há anúncios no marketplace'
          }
          description={
            page > 1
              ? 'A disponibilidade dos anúncios pode ter mudado.'
              : hasFilters
                ? 'Altere ou limpe os filtros para ampliar sua busca.'
                : 'Quando houver anúncios disponíveis, eles aparecerão aqui.'
          }
          className="rounded-surface border border-dashed border-border-emphasis bg-surface-default"
        >
          {page > 1 ? (
            <Button onClick={() => changePage(1)}>Voltar à primeira página</Button>
          ) : hasFilters ? (
            <Button variant="outline" onClick={onClearFilters}>Limpar filtros</Button>
          ) : null}
        </FeedbackState>
      ) : (
        <>
          <div className={tradingCardGrid}>
            {data.content.map((ad) => <MarketplaceAdCard key={ad.id} ad={ad} />)}
          </div>
          <div className="mt-6 border-t border-border-default pt-4">
            <p className="text-sm text-text-secondary">
              Exibindo {(data.page - 1) * data.size + 1}–
              {(data.page - 1) * data.size + data.content.length} de{' '}
              {data.totalElements.toLocaleString('pt-BR')} anúncios
            </p>
            <PageNavigation
              label="Paginação do marketplace"
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={changePage}
              className="mt-4"
            />
          </div>
        </>
      )}
    </section>
  )
}
