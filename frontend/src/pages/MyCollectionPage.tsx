import { useEffect, useState } from 'react'
import collectionBanner from '@/assets/images/image-collection.png'
import { CollectionItemCard } from '@/components/collection/CollectionItemCard'
import { CollectionState } from '@/components/collection/CollectionState'
import { CollectionSummary } from '@/components/collection/CollectionSummary'
import {
  getMyCollection,
  getMyCollectionSummary,
  getMyCollectionFilterOptions,
} from '@/services/collection'
import { useSession } from '@/session'
import type {
  CollectionPage,
  CollectionSummaryResponse,
  CollectionFilterValues,
  CollectionFilterOptions,
  CollectionItem,
} from '@/types/Collection'
import {
  CollectionFilters,
  emptyCollectionFilters,
} from '@/components/collection/CollectionFilters'
import { CardDetailsModal } from '@/components/catalog/CardDetailsModal'
import type { CatalogCard } from '@/types/Catalog'
import { EditCollectionItemModal } from '@/components/collection/EditCollectionItemModal'
import { RemoveCollectionItemModal } from '@/components/collection/RemoveCollectionItemModal'

type CollectionResult =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: CollectionPage }

type SummaryResult =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: CollectionSummaryResponse }

export function MyCollectionPage() {
  const { user } = useSession()

  return (
    <main className="min-h-screen bg-[#FAFBFE] pb-12 text-[#171443]">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <header className="relative mb-4 flex min-h-[160px] items-center overflow-hidden rounded-xl border border-[#eeeafb] bg-primary-900 px-6 py-5 shadow-sm sm:min-h-[190px] sm:px-8">
          <img
            src={collectionBanner}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#130b30]/85 via-[#130b30]/50 to-transparent"
          />

          <div className="relative z-10 flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 text-3xl text-white shadow-sm backdrop-blur-sm"
            >
              ✦
            </span>

            <div>
              <h1 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl">
                Minha Coleção
              </h1>

              <p className="mt-1 text-xs text-white/90 sm:text-sm">
                Organize seu acervo e acompanhe sua jornada como colecionador.
              </p>
            </div>
          </div>
        </header>

        {user && <CollectionContent key={user.id} />}
      </div>
    </main>
  )
}

function CollectionContent() {
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [summaryAttempt, setSummaryAttempt] = useState(0)

  const [filters, setFilters] = useState<CollectionFilterValues>(
    emptyCollectionFilters,
  )

  const [options, setOptions] = useState<CollectionFilterOptions>({
    editions: [],
    rarities: [],
  })

  const [optionsStatus, setOptionsStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading')

  const [optionsAttempt, setOptionsAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getMyCollectionFilterOptions(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setOptions(data)
          setOptionsStatus('success')
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOptionsStatus('error')
        }
      })

    return () => controller.abort()
  }, [optionsAttempt])

  function applyFilters(nextFilters: CollectionFilterValues) {
    setFilters({ ...nextFilters })
    setPage(0)
    setAttempt((current) => current + 1)
  }

  return (
    <div className="space-y-6">
      <CollectionSummaryData key={summaryAttempt} />

      <button
        type="button"
        onClick={() => setSummaryAttempt((current) => current + 1)}
        className="cursor-pointer rounded text-xs text-primary-900 underline focus-visible:outline-2 focus-visible:outline-secondary-500"
      >
        Atualizar resumo
      </button>

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <CollectionFilters
          options={options}
          optionsStatus={optionsStatus}
          onRetryOptions={() => {
            setOptionsStatus('loading')
            setOptionsAttempt((current) => current + 1)
          }}
          onApply={applyFilters}
        />

        <CollectionPageData
          key={`${page}-${attempt}`}
          page={page}
          filters={filters}
          onPageChange={setPage}
          onRetry={() => setAttempt((current) => current + 1)}
          onCollectionUpdated={() => {
            setAttempt((current) => current + 1)
            setSummaryAttempt((current) => current + 1)
          }}
          onItemRemoved={(pageBecameEmpty) => {
            if (pageBecameEmpty) {
              setPage((current) => Math.max(0, current - 1))
            }
            setAttempt((current) => current + 1)
            setSummaryAttempt((current) => current + 1)
            setOptionsAttempt((current) => current + 1)
          }}
        />
      </div>
    </div>
  )
}

type CollectionPageDataProps = {
  page: number
  filters: CollectionFilterValues
  onPageChange: (page: number) => void
  onRetry: () => void
  onCollectionUpdated: () => void
  onItemRemoved: (pageBecameEmpty: boolean) => void
}
type CollectionModal =
  | { mode: 'details'; card: CatalogCard }
  | { mode: 'edit'; item: CollectionItem }
  | { mode: 'remove'; item: CollectionItem }
  | null

function CollectionPageData({
  page,
  filters,
  onPageChange,
  onRetry,
  onCollectionUpdated,
  onItemRemoved,
}: CollectionPageDataProps) {
  const [activeModal, setActiveModal] = useState<CollectionModal>(null)
  const [result, setResult] = useState<CollectionResult>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    getMyCollection({
      page,
      size: 20,
      filters,
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ status: 'success', data })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ status: 'error' })
        }
      })
    return () => controller.abort()
  }, [page, filters])

  function openDetails(card: CatalogCard) {
    setActiveModal({ mode: 'details', card })
  }

  function openEdit(item: CollectionItem) {
    setActiveModal({ mode: 'edit', item })
  }

  function openRemove(item: CollectionItem) {
    setActiveModal({ mode: 'remove', item })
  }

  function closeModal() {
    setActiveModal(null)
  }

  const hasFilters = Object.values(filters).some((value) => value.trim() !== '')

  const pageButtonClass =
    'min-h-10 rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 enabled:cursor-pointer enabled:hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

  return (
    <>
      <section
        aria-label="Itens da coleção"
        className="rounded-xl border border-neutral-200 bg-white p-4"
      >
        <AppliedCollectionFilters filters={filters} />

        {result.status === 'loading' ? (
          <CollectionState status="loading" />
        ) : result.status === 'error' ? (
          <CollectionState status="error" onRetry={onRetry} />
        ) : result.data.totalElements === 0 ? (
          hasFilters ? (
            <div role="status" className="px-4 py-12 text-center">
              <h2 className="text-lg font-semibold text-primary-900">
                Nenhuma carta encontrada
              </h2>

              <p className="mt-2 text-sm text-neutral-700">
                Altere os filtros ou clique em “Limpar filtros” para consultar a
                coleção completa.
              </p>
            </div>
          ) : (
            <CollectionState status="empty" />
          )
        ) : (
          <>
            <h2
              aria-live="polite"
              className="mb-4 text-sm font-semibold text-primary-900"
            >
              {result.data.totalElements}{' '}
              {hasFilters
                ? result.data.totalElements === 1
                  ? 'item encontrado'
                  : 'itens encontrados'
                : result.data.totalElements === 1
                  ? 'item na coleção'
                  : 'itens na coleção'}
            </h2>

            {result.data.content.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                {result.data.content.map((item) => (
                  <CollectionItemCard
                    key={item.id}
                    item={item}
                    onDetails={(selected) => {
                      openDetails(selected.card)
                    }}
                    onEdit={openEdit}
                    onRemove={openRemove}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-neutral-700">
                Esta página não possui itens. Volte à primeira página.
              </p>
            )}

            <nav
              aria-label="Paginação da coleção"
              className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4"
            >
              <button
                type="button"
                disabled={page === 0}
                onClick={() => onPageChange(Math.max(0, page - 1))}
                className={pageButtonClass}
              >
                Anterior
              </button>

              <span className="text-sm text-neutral-700">
                Página {result.data.number + 1} de {result.data.totalPages}
              </span>

              <button
                type="button"
                disabled={result.data.last}
                onClick={() => onPageChange(page + 1)}
                className={pageButtonClass}
              >
                Próxima
              </button>

              {result.data.content.length === 0 && (
                <button
                  type="button"
                  onClick={() => onPageChange(0)}
                  className={pageButtonClass}
                >
                  Primeira página
                </button>
              )}
            </nav>
          </>
        )}
      </section>

      {activeModal?.mode === 'details' && (
        <CardDetailsModal
          key={activeModal.card.id}
          cardId={activeModal.card.id}
          context="collection"
          onClose={closeModal}
        />
      )}
      
      {activeModal?.mode === 'edit' && (
        <EditCollectionItemModal
          key={activeModal.item.id}
          item={activeModal.item}
          onClose={closeModal}
          onSaved={() => {
            closeModal()
            onCollectionUpdated()
          }}
        />
      )}

      {activeModal?.mode === 'remove' && (
        <RemoveCollectionItemModal
          key={activeModal.item.id}
          item={activeModal.item}
          onClose={closeModal}
          onRemoved={() => {
            closeModal()
            onItemRemoved(
              page > 0 &&
                result.status === 'success' &&
                result.data.content.length === 1,
            )
          }}
        />
      )}
    </>
  )
}

function CollectionSummaryData() {
  const [result, setResult] = useState<SummaryResult>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    getMyCollectionSummary(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ status: 'success', data })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ status: 'error' })
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <CollectionSummary
      status={result.status}
      totalItems={result.status === 'success' ? result.data.totalItems : null}
      totalCopies={result.status === 'success' ? result.data.totalCopies : null}
      totalGames={result.status === 'success' ? result.data.totalGames : null}
    />
  )
}

function AppliedCollectionFilters({
  filters,
}: {
  filters: CollectionFilterValues
}) {
  const gameLabels: Record<string, string> = {
    POKEMON: 'Pokémon',
    YUGIOH: 'Yu-Gi-Oh!',
    MAGIC_THE_GATHERING: 'Magic: The Gathering',
  }

  const conditionLabels: Record<string, string> = {
    NEAR_MINT: 'Near Mint',
    LIGHTLY_PLAYED: 'Lightly Played',
    MODERATELY_PLAYED: 'Moderately Played',
    HEAVILY_PLAYED: 'Heavily Played',
    DAMAGED: 'Damaged',
  }

  const languageLabels: Record<string, string> = {
    PORTUGUESE: 'Português',
    ENGLISH: 'Inglês',
    JAPANESE: 'Japonês',
  }

  const entries = [
    {
      key: 'search',
      label: 'Pesquisa',
      value: filters.search.trim(),
    },
    {
      key: 'game',
      label: 'TCG',
      value: gameLabels[filters.game] ?? filters.game,
    },
    {
      key: 'edition',
      label: 'Edição',
      value: filters.edition,
    },
    {
      key: 'rarity',
      label: 'Raridade',
      value: filters.rarity,
    },
    {
      key: 'condition',
      label: 'Condição',
      value: conditionLabels[filters.condition] ?? filters.condition,
    },
    {
      key: 'language',
      label: 'Idioma',
      value: languageLabels[filters.language] ?? filters.language,
    },
  ].filter((entry) => entry.value.trim() !== '')

  if (entries.length === 0) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mb-4 border-b border-neutral-200 pb-4"
    >
      <p className="mb-2 text-xs font-semibold text-neutral-700">
        Filtros aplicados
      </p>

      <ul
        aria-label="Filtros aplicados"
        className="flex flex-wrap gap-2"
      >
        {entries.map((entry) => (
          <li
            key={entry.key}
            className="max-w-full break-words rounded-lg bg-primary-100 px-3 py-2 text-xs text-primary-900"
          >
            <span className="font-semibold">{entry.label}:</span>{' '}
            {entry.value}
          </li>
        ))}
      </ul>
    </div>
  )
}