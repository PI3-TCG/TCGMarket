import { FilterHeading, ResponsiveFilters } from '@/components/ui/ResponsiveFilters'
import { Select } from '@/components/ui/Select'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { Button } from '@/components/ui/Button'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { PageBanner } from '@/components/layout/PageBanner'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import type {
  CatalogFilters,
  CatalogPage as CatalogPageData,
  CatalogSearch,
} from '@/types/Catalog'
import { fetchCatalogFilters, searchCatalogCards } from '@/services/catalogApi'
import { typeLabels } from '@/components/catalog/catalogLabels'
import pokemonBanner from '@/assets/images/image-pokemon.png'
import magicBanner from '@/assets/images/image-magic.png'
import yugiohBanner from '@/assets/images/image-yugioh.png'
import onePieceBanner from '@/assets/images/image-onePiece.png'
import digimonBanner from '@/assets/images/image-digimon.png'
import type { CatalogCard as CatalogCardData } from '@/types/Catalog'

const gameNames: Record<string, string> = {
  pokemon: 'Pokémon',
  magic: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
  'one-piece': 'One Piece',
  digimon: 'Digimon',
}

const gameBanners: Record<string, string> = {
  pokemon: pokemonBanner,
  magic: magicBanner,
  yugioh: yugiohBanner,
  'one-piece': onePieceBanner,
  digimon: digimonBanner,
}

const supportedGames = ['pokemon', 'magic', 'yugioh']

const emptyFilters: CatalogFilters = { sets: [], rarities: [], types: [] }

type FilterKey = 'q' | 'cardNumber' | 'set' | 'rarity' | 'type'

export function CatalogPage() {
  const { game } = useParams({ from: '/site-layout/catalogo/$game' })
  return <CatalogView key={game} game={game} />
}
function CatalogView({ game }: { game: string }) {
  const search = useSearch({ from: '/site-layout/catalogo/$game' })
  const navigate = useNavigate({ from: '/catalogo/$game' })
  const supportedGame = supportedGames.includes(game)
  const { q, cardNumber, set, rarity, type, sort, page } = search
  const currentPage = page ?? 1

  const [filters, setFilters] = useState<CatalogFilters | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    key: string
    data: CatalogPageData | null
  } | null>(null)

  function updateSearch(patch: Partial<CatalogSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) })
  }

  useEffect(() => {
    if (!supportedGame) return
    let active = true
    fetchCatalogFilters(game)
      .then((data) => {
        if (active) setFilters(data)
      })
      .catch(() => {
        if (active) setFilters(emptyFilters)
      })
    return () => {
      active = false
    }
  }, [game, supportedGame])

  const requestKey = JSON.stringify([q, cardNumber, set, rarity, type, sort, page, attempt])

  useEffect(() => {
    if (!supportedGame) return
    let active = true
    searchCatalogCards(game, { q, cardNumber, set, rarity, type, sort, page })
      .then((data) => {
        if (active) setResult({ key: requestKey, data })
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, data: null })
      })
    return () => {
      active = false
    }
  }, [game, supportedGame, requestKey, q, cardNumber, set, rarity, type, sort, page])

  const isLoading = supportedGame && result?.key !== requestKey
  const data = isLoading ? null : result?.data
  const loadError = supportedGame && !isLoading && !data
  const totalPages = data?.totalPages ?? 0
  const outOfRange = Boolean(
    data && data.totalElements > 0 && !data.content.length,
  )

  const options = filters ?? emptyFilters
  const setOptions = withSelected(
    options.sets.map((item) => ({ value: item, label: item })),
    set,
  )
  const rarityOptions = withSelected(
    options.rarities.map((item) => ({ value: item, label: item })),
    rarity,
  )
  const typeOptions = withSelected(
    options.types.map((item) => ({
      value: item,
      label: typeLabels[item] ?? item,
    })),
    type,
  )

  const activeFilters: { key: FilterKey; label: string }[] = []
  if (q) activeFilters.push({ key: 'q', label: `Busca: “${q.trim()}”` })
  if (cardNumber) activeFilters.push({ key: 'cardNumber', label: `Código: ${cardNumber}` })
  if (set) activeFilters.push({ key: 'set', label: `Coleção: ${set}` })
  if (rarity)
    activeFilters.push({ key: 'rarity', label: `Raridade: ${rarity}` })
  if (type)
    activeFilters.push({
      key: 'type',
      label: `TGC: ${typeLabels[type] ?? type}`,
    })
  const hasFilters = activeFilters.length > 0

  function clearFilters() {
    navigate({ search: (prev) => ({ sort: prev.sort }) })
  }

  function goToPage(number: number) {
    navigate({
      search: (prev) => ({ ...prev, page: number > 1 ? number : undefined }),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const gameName = gameNames[game] ?? game
  const total = data?.totalElements ?? 0

  function openCardDetails(card: CatalogCardData) {
    void navigate({ to: '/cartas/$id', params: { id: card.id } })
  }

  return (
    <main className="min-h-screen pb-12 text-[#171443]">
      {/* Header global e footer continuam fora do escopo desta página. */}
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title={gameName}
          subtitle={`Explore todas as cartas de ${gameName}.`}
          image={gameBanners[game]}
          symbol={game === 'pokemon' ? '◉' : '✦'}
        />

        <div className="grid items-start gap-6 pt-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ResponsiveFilters>
            <CatalogFiltersForm
              key={JSON.stringify([q, cardNumber, set, rarity, type])}
              applied={{ q, cardNumber, set, rarity, type }}
              setOptions={setOptions}
              rarityOptions={rarityOptions}
              typeOptions={typeOptions}
              onApply={updateSearch}
              onClear={clearFilters}
            />
          </ResponsiveFilters>

          <section className="panel-ornaments min-w-0 rounded-xl border border-rare-500 bg-white p-4" aria-label="Resultados do catálogo">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold" aria-live="polite">
                {isLoading ? (
                  'Buscando cartas...'
                ) : data ? (
                  <>
                    <span className="underline decoration-primary-900 underline-offset-2">
                      {total.toLocaleString('pt-BR')}
                    </span>{' '}
                    {total === 1 ? 'carta encontrada' : 'cartas encontradas'}
                  </>
                ) : null}
              </p>
              <label
                className="flex items-center gap-2 text-xs text-[#514b7e]"
                htmlFor="catalog-sort"
              >
                <span className="hidden sm:inline">Ordenar por:</span>
                <select
                  id="catalog-sort"
                  value={sort ?? 'name-asc'}
                  onChange={(event) =>
                    updateSearch({
                      sort:
                        event.target.value === 'name-desc'
                          ? 'name-desc'
                          : undefined,
                    })
                  }
                  className="rounded-lg border border-[#e1def5] bg-white px-3 py-2 text-xs text-[#171443] sm:text-sm"
                >
                  <option value="name-asc">Nome: A–Z</option>
                  <option value="name-desc">Nome: Z–A</option>
                </select>
              </label>
            </div>

            {hasFilters && (
              <ul
                aria-label="Filtros ativos"
                className="mb-3 flex flex-wrap items-center gap-2"
              >
                {activeFilters.map((filter) => (
                  <li key={filter.key}>
                    <button
                      type="button"
                      onClick={() => updateSearch({ [filter.key]: undefined })}
                      aria-label={`Remover filtro ${filter.label}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-900 hover:bg-primary-100/70"
                    >
                      {filter.label}
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-primary-900 underline underline-offset-2"
                  >
                    Limpar filtros
                  </button>
                </li>
              </ul>
            )}

            {!supportedGame ? (
              <EmptyState
                icon="info"
                title="Catálogo em breve"
                message={`O catálogo de ${gameName} ainda não está disponível.`}
              />
            ) : isLoading ? (
              <div
                role="status"
                aria-label="Carregando cartas"
                className={tradingCardGrid}
              >
                {Array.from({ length: 10 }, (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-xl border border-[#eeeafb] bg-white"
                  >
                    <div className="aspect-square bg-primary-100" />
                    <div className="space-y-2 p-3.5">
                      <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
                      <div className="h-3 w-1/2 rounded bg-neutral-100" />
                      <div className="h-5 w-16 rounded-full bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <FeedbackState
                role="alert"
                icon="alert"
                title="Não foi possível carregar as cartas"
                description="Verifique sua conexão e tente novamente."
                className="rounded-xl border border-neutral-200 bg-white"
              >
                <Button onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button>
              </FeedbackState>
            ) : outOfRange ? (
              <EmptyState
                title="Página não encontrada"
                message="Essa página não existe para a busca atual."
                action={{
                  label: 'Ir para a primeira página',
                  onClick: () => goToPage(1),
                }}
              />
            ) : !data?.content.length ? (
              <EmptyState
                title={hasFilters ? "Nenhuma carta encontrada" : "Catálogo sem cartas"}
                message={hasFilters ? "Altere a busca ou limpe os filtros para ver mais cartas." : "Ainda não há cartas cadastradas para este jogo."}
                action={
                  hasFilters
                    ? { label: 'Limpar filtros', onClick: clearFilters }
                    : undefined
                }
              />
            ) : (
              <div className={tradingCardGrid}>
                {data.content.map((card) => (
                  <CatalogCard
                    key={card.id}
                    card={card}
                    onSelect={openCardDetails}
                  />
                ))}
              </div>
            )}

            {data && !outOfRange && totalPages > 1 && (
              <PageNavigation label="Paginação do catálogo" page={currentPage} totalPages={totalPages} onPageChange={goToPage} className="mt-7" />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

type Option = { value: string; label: string }

type CatalogFilterValues = Pick<CatalogSearch, FilterKey>

function CatalogFiltersForm({
  applied,
  setOptions,
  rarityOptions,
  typeOptions,
  onApply,
  onClear,
}: {
  applied: CatalogFilterValues
  setOptions: Option[]
  rarityOptions: Option[]
  typeOptions: Option[]
  onApply: (filters: CatalogFilterValues) => void
  onClear: () => void
}) {
  const [draft, setDraft] = useState(applied)
  const fields = [
    { key: 'type', label: 'TGC', allLabel: 'Todos os tipos', options: typeOptions },
    { key: 'set', label: 'Coleção', allLabel: 'Todas as coleções', options: setOptions },
    { key: 'rarity', label: 'Raridade', allLabel: 'Todas as raridades', options: rarityOptions },
  ] as const

  return (
    <aside className="filter-panel panel-ornaments min-w-0 bg-none! [&_[role=combobox]]:bg-none!" aria-labelledby="catalog-filters-title">
      <FilterHeading id="catalog-filters-title" />
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          onApply({ ...draft, q: draft.q?.trim() || undefined, cardNumber: draft.cardNumber?.trim() || undefined })
        }}
      >
        {fields.map(({ key, label, allLabel, options }) => (
          <Select
            key={key}
            label={label}
            variant="filter"
            value={draft[key] ?? ''}
            onValueChange={(next) => setDraft((prev) => ({ ...prev, [key]: next || undefined }))}
            disabled={!options.length && !draft[key]}
            options={[{ value: '', label: allLabel }, ...options]}
          />
        ))}

        <label className="block text-sm font-semibold text-primary-900">
          Buscar carta
          <input
            type="search"
            value={draft.q ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, q: event.target.value }))}
            placeholder="Buscar carta no catálogo..."
            className="filter-field mt-2 min-h-11 w-full rounded-lg border border-primary-300/40 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-secondary-500"
          />
        </label>

        <label className="block text-sm font-semibold text-primary-900">
          Código da carta
          <input
            type="text"
            maxLength={80}
            value={draft.cardNumber ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, cardNumber: event.target.value }))}
            placeholder="Ex.: 025 ou LOB-001"
            className="filter-field mt-2 min-h-11 w-full rounded-lg border border-primary-300/40 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-secondary-500"
          />
        </label>

        <div className="flex flex-col items-center gap-2">
          <button type="submit" className="filter-button min-h-11 w-fit max-w-full">
            Aplicar filtros
          </button>
          <button
            type="button"
            className="min-h-11 w-fit max-w-full rounded-lg px-3 text-sm font-semibold text-primary-900 underline underline-offset-4 hover:bg-primary-100/50 focus-visible:outline-2 focus-visible:outline-secondary-500"
            onClick={() => {
              setDraft({})
              onClear()
            }}
          >
            Limpar filtros
          </button>
        </div>
      </form>
    </aside>
  )
}

function EmptyState({
  icon = 'search',
  title,
  message,
  action,
}: {
  icon?: 'info' | 'search'
  title: string
  message: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <FeedbackState icon={icon} title={title} description={message} className="rounded-xl border border-dashed border-primary-300/40 bg-white">
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-primary-900 button-vignette px-5 py-2.5 text-sm font-semibold text-white"
        >
          {action.label}
        </button>
      )}
    </FeedbackState>
  )
}

function withSelected(options: Option[], selected: string | undefined) {
  if (!selected || options.some((item) => item.value === selected))
    return options
  return [{ value: selected, label: selected }, ...options]
}
