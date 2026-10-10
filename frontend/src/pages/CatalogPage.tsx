import { useEffect, useMemo, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import { AddToCollectionModal } from '@/components/catalog/AddToCollectionModal'
import type { CatalogCard as CatalogCardData } from '@/types/Catalog'
import { searchCatalogCards } from '@/services/catalogApi'

const PAGE_SIZE = 10

const gameNames: Record<string, string> = {
  pokemon: 'Pokémon',
  magic: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
  'one-piece': 'One Piece',
  digimon: 'Digimon',
}

const futureFilters = ['Tipo', 'Idioma', 'Condição', 'Preço', 'Disponibilidade']

export function CatalogPage() {
  const { game } = useParams({ from: '/site-layout/catalogo/$game' })
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState('all')
  const [edition, setEdition] = useState('all')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CatalogCardData | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchResult, setSearchResult] = useState<{
    key: string
    cards: CatalogCardData[]
    error: string | null
  } | null>(null)
  const supportedGame = ['pokemon', 'magic', 'yugioh'].includes(game)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    )
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!debouncedSearch || !supportedGame) return
    let active = true
    const key = `${game}:${debouncedSearch}`
    searchCatalogCards(game, debouncedSearch)
      .then((cards) => {
        if (active) setSearchResult({ key, cards, error: null })
      })
      .catch(() => {
        if (active)
          setSearchResult({
            key,
            cards: [],
            error:
              'Não foi possível consultar o catálogo. Verifique a conexão com a API e tente novamente.',
          })
      })
    return () => {
      active = false
    }
  }, [game, debouncedSearch, supportedGame])

  const searchKey = `${game}:${search.trim()}`
  const isSearching = Boolean(search.trim()) && supportedGame
  const isLoading =
    isSearching &&
    (search.trim() !== debouncedSearch || searchResult?.key !== searchKey)
  const searchError = isSearching && !isLoading ? searchResult?.error : null

  const cards = useMemo(() => {
    if (!isSearching) return []

    return searchResult?.key === searchKey ? searchResult.cards : []
  }, [isSearching, searchKey, searchResult])

  const editions = useMemo(
    () => [...new Set(cards.map((card) => card.edition))].sort(),
    [cards],
  )

  const rarities = useMemo(
    () => [...new Set(cards.map((card) => card.officialRarity))].sort(),
    [cards],
  )

  const filtered = useMemo(() => {
    const result = cards.filter(
      (card) =>
        (rarity === 'all' || card.officialRarity === rarity) &&
        (edition === 'all' || card.edition === edition),
    )

    result.sort((a, b) =>
      sort === 'name-desc'
        ? b.name.localeCompare(a.name, 'pt-BR')
        : a.name.localeCompare(b.name, 'pt-BR'),
    )
    return result
  }, [cards, rarity, edition, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleCards = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function clearFilters() {
    setSearch('')
    setRarity('all')
    setEdition('all')
    setPage(1)
  }

  const gameName = gameNames[game] ?? game

  return (
    <main className="min-h-screen bg-[#FAFBFE] pb-12 text-[#171443]">
      {/* Header global e footer continuam fora do escopo desta página. */}
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <header className="relative mb-4 flex min-h-[116px] items-center overflow-hidden rounded-xl border border-[#eeeafb] bg-gradient-to-r from-[#f8f7ff] via-[#f2edff] to-[#e5d6fb] px-6 py-5 sm:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-24 size-64 rounded-full border-[32px] border-white/40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[14%] top-0 size-32 rounded-full bg-primary-100/70 blur-2xl"
          />
          <div className="relative flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-[#25135c] bg-white text-3xl shadow-sm"
            >
              {game === 'pokemon' ? '◉' : '✦'}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight text-[#21154d] sm:text-4xl">
                {gameName}
              </h1>
              <p className="mt-1 text-xs text-[#292057] sm:text-sm">
                Explore todas as cartas de {gameName}.
              </p>
            </div>
          </div>
        </header>

        <div className="mb-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            className="w-full rounded-lg border border-[#dedcf3] bg-white px-4 py-3 text-left text-sm font-semibold text-primary-900"
          >
            {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[335px_minmax(0,1fr)] xl:gap-[26px]">
          <aside
            className={`${filtersOpen ? 'block' : 'hidden'} rounded-xl border border-[#e6e5f3] bg-white p-4 shadow-sm lg:block lg:min-h-[590px]`}
            aria-label="Filtros do catálogo"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Filtros</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary-900 underline underline-offset-2"
              >
                Limpar filtros
              </button>
            </div>

            <label
              htmlFor="catalog-search"
              className="mb-2 block text-xs font-semibold"
            >
              Buscar carta
            </label>
            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
                setEdition('all')
                setRarity('all')
              }}
              placeholder="Buscar carta no catálogo..."
              className="mb-4 w-full rounded-lg border border-[#e1def5] bg-white px-3 py-3 text-sm outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-100"
            />

            <details className="mb-2 rounded-lg border border-[#e5e2f4]" open>
              <summary className="cursor-pointer px-3 py-3 text-sm font-semibold">
                Coleção
              </summary>
              <div className="border-t border-[#eeeafb] px-3 pb-3 pt-2">
                <label htmlFor="catalog-edition" className="sr-only">
                  Filtrar por coleção
                </label>
                <select
                  id="catalog-edition"
                  value={edition}
                  onChange={(event) => {
                    setEdition(event.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-lg border border-[#e5e2f4] bg-white px-2 py-2 text-sm"
                >
                  <option value="all">Todas as coleções</option>
                  {editions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </details>

            <details className="mb-2 rounded-lg border border-[#e5e2f4]" open>
              <summary className="cursor-pointer px-3 py-3 text-sm font-semibold">
                Raridade
              </summary>
              <div className="border-t border-[#eeeafb] px-3 pb-3 pt-2">
                <label htmlFor="catalog-rarity" className="sr-only">
                  Filtrar por raridade
                </label>
                <select
                  id="catalog-rarity"
                  value={rarity}
                  onChange={(event) => {
                    setRarity(event.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-lg border border-[#e5e2f4] bg-white px-2 py-2 text-sm"
                >
                  <option value="all">Todas as raridades</option>
                  {rarities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </details>

            {futureFilters.map((filter) => (
              <div
                key={filter}
                className="mb-2 flex items-center justify-between rounded-lg border border-[#e5e2f4] px-3 py-3 text-sm"
                aria-label={`${filter}: em desenvolvimento`}
              >
                <span className="font-semibold">{filter}</span>
                <span className="text-[10px] text-neutral-500">Em breve</span>
              </div>
            ))}
          </aside>

          <section className="min-w-0" aria-label="Resultados do catálogo">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                <span className="underline decoration-primary-900 underline-offset-2">
                  {(isLoading || searchError
                    ? 0
                    : filtered.length
                  ).toLocaleString('pt-BR')}
                </span>{' '}
                {filtered.length === 1
                  ? 'carta encontrada'
                  : 'cartas encontradas'}
              </p>
              <label
                className="flex items-center gap-2 text-xs text-[#514b7e]"
                htmlFor="catalog-sort"
              >
                <span className="hidden sm:inline">Ordenar por:</span>
                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg border border-[#e1def5] bg-white px-3 py-2 text-xs text-[#171443] sm:text-sm"
                >
                  <option value="name-asc">Nome: A–Z</option>
                  <option value="name-desc">Nome: Z–A</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div
                role="status"
                className="rounded-xl border bg-white px-6 py-16 text-center"
              >
                Buscando cartas no catálogo...
              </div>
            ) : searchError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center text-red-700"
              >
                {searchError}
              </div>
            ) : visibleCards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#dcd8ed] bg-white px-6 py-16 text-center">
                <h3 className="font-display text-lg font-bold">
                  Nenhuma carta encontrada
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Tente alterar os filtros ou escolha outro jogo.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
                {visibleCards.map((card) => (
                  <CatalogCard
                    key={card.id}
                    card={card}
                    onSelect={setSelectedCard}
                  />
                ))}
              </div>
            )}

            {!isLoading && !searchError && totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-7 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-lg border border-[#e1def5] bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === currentPage ? 'page' : undefined}
                    onClick={() => setPage(number)}
                    className={`size-9 rounded-lg text-sm font-semibold ${number === currentPage ? 'bg-primary-900 text-white' : 'border border-[#e1def5] bg-white'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="rounded-lg border border-[#e1def5] bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>

      {selectedCard && (
        <AddToCollectionModal
          key={selectedCard.id}
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </main>
  )
}
