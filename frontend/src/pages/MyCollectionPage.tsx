import { ListingHeader, listingPanelClass } from '@/components/ui/ListingPresentation'
import { ListingSort, type ListingSortOrder } from '@/components/ui/ListingSort'
import { Button } from '@/components/ui/Button'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
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
import { CollectionFilters } from '@/components/collection/CollectionFilters'
import { emptyCollectionFilters } from '@/components/collection/collectionFilterDefaults'
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
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Minha Coleção"
          subtitle={
            <>
              Organize seu acervo e acompanhe sua jornada
              <br />
              como colecionador.
            </>
          }
        />

        {user && <CollectionContent key={user.id} />}
      </div>
    </main>
  )
}

function CollectionContent() {
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<ListingSortOrder>('RECENT')
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
    <div className="mt-10 space-y-6">
      <CollectionSummaryData key={summaryAttempt} />

      <Button
        variant="ghost"
        onClick={() => setSummaryAttempt((current) => current + 1)}
      >
        Atualizar resumo
      </Button>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <CollectionFilters
          options={options}
          optionsStatus={optionsStatus}
          onRetryOptions={() => {
            setOptionsStatus('loading')
            setOptionsAttempt((current) => current + 1)
          }}
          onApply={applyFilters}
        />

        <div className="min-w-0">
          <CollectionPageData
            attempt={attempt}
            page={page}
            filters={filters}
            sort={sort}
            onSortChange={(value) => {
              setSort(value)
              setPage(0)
            }}
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
    </div>
  )
}

type CollectionPageDataProps = {
  attempt: number
  page: number
  sort: ListingSortOrder
  onSortChange: (sort: ListingSortOrder) => void
  filters: CollectionFilterValues
  onPageChange: (page: number) => void
  onRetry: () => void
  onCollectionUpdated: () => void
  onItemRemoved: (pageBecameEmpty: boolean) => void
}
type CollectionModal =
  | { mode: 'details'; card: CatalogCard; itemId: string }
  | { mode: 'edit'; item: CollectionItem }
  | { mode: 'remove'; item: CollectionItem }
  | null

function CollectionPageData({
  attempt,
  page,
  sort,
  onSortChange,
  filters,
  onPageChange,
  onRetry,
  onCollectionUpdated,
  onItemRemoved,
}: CollectionPageDataProps) {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<CollectionModal>(null)
  const requestKey = `${attempt}-${sort}-${page}`
  const [response, setResponse] = useState<{ requestKey: string; result: CollectionResult }>()
  const result = response?.requestKey === requestKey ? response.result : { status: 'loading' as const }

  useEffect(() => {
    const controller = new AbortController()

    getMyCollection({
      page,
      size: 20,
      filters,
      sort,
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResponse({ requestKey, result: { status: 'success', data } })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({ requestKey, result: { status: 'error' } })
        }
      })
    return () => controller.abort()
  }, [page, filters, sort, requestKey])

  function openDetails(item: CollectionItem) {
    setActiveModal({ mode: 'details', card: item.card, itemId: item.id })
  }

  function openCreateAd(itemId: string) {
    void navigate({ to: '/anuncios/novo', search: { item: itemId } })
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

  return (
    <>
      <section
        aria-label="Itens da coleção"
        className={listingPanelClass}
      >
        <ListingHeader
          title="ITENS DA COLEÇÃO"
          description={
            result.status === 'success'
              ? `${result.data.totalElements.toLocaleString('pt-BR')} ${result.data.totalElements === 1 ? 'item na coleção' : 'itens na coleção'}`
              : null
          }
          actions={<ListingSort value={sort} onChange={onSortChange} />}
        />

        <AppliedCollectionFilters filters={filters} />

        {result.status === 'loading' ? (
          <CollectionState status="loading" />
        ) : result.status === 'error' ? (
          <CollectionState status="error" onRetry={onRetry} />
        ) : result.data.totalElements === 0 ? (
          hasFilters ? (
            <FeedbackState
              icon="search"
              title="Nenhuma carta encontrada"
              description="Altere os filtros ou clique em “Limpar filtros” para consultar a coleção completa."
            />
          ) : (
            <CollectionState status="empty" />
          )
        ) : (
          <>
            {result.data.content.length > 0 ? (
              <div className={tradingCardGrid}>
                {result.data.content.map((item) => (
                  <CollectionItemCard
                    key={item.id}
                    item={item}
                    onDetails={openDetails}
                    onEdit={openEdit}
                    onRemove={openRemove}
                    onAdvertise={(selected) => openCreateAd(selected.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">
                Esta página não possui itens. Volte à primeira página.
              </p>
            )}

            {(result.data.totalPages > 1 || result.data.content.length === 0) && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-border-default pt-4">
                <PageNavigation
                  label="Paginação da coleção"
                  page={result.data.number + 1}
                  totalPages={result.data.totalPages}
                  onPageChange={(page) => onPageChange(page - 1)}
                />
                {result.data.content.length === 0 && (
                  <Button variant="outline" onClick={() => onPageChange(0)}>
                    Primeira página
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {activeModal?.mode === 'details' && (
        <CardDetailsModal
          key={activeModal.card.id}
          cardId={activeModal.card.id}
          context="collection"
          onClose={closeModal}
          onCreateListing={() => openCreateAd(activeModal.itemId)}
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
