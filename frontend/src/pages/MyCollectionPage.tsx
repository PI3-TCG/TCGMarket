import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
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
} from '@/types/Collection'
import {
  CollectionFilters,
  emptyCollectionFilters,
} from '@/components/collection/CollectionFilters'

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
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <nav aria-label="Navegação estrutural">
          <ol className="flex items-center gap-2 text-xs text-neutral-700">
            <li>
              <Link to="/" className="text-primary-900 hover:underline">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Minha Coleção</li>
          </ol>
        </nav>

        <header className="relative isolate overflow-hidden rounded-2xl bg-primary-800 shadow-sm">
          <img
            src={collectionBanner}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-right"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
          />

          <div className="flex min-h-52 items-center px-6 py-8 sm:min-h-64 sm:px-8">
            <div className="max-w-md">
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Minha Coleção
              </h1>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90">
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
}

function CollectionPageData({
  page,
  filters,
  onPageChange,
  onRetry,
}: CollectionPageDataProps) {
  const navigate = useNavigate()
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

  const hasFilters = Object.values(filters).some(
    (value) => value.trim() !== '',
  )

  const pageButtonClass =
    'min-h-10 rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 enabled:cursor-pointer enabled:hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

  return (
    <section
      aria-label="Itens da coleção"
      className="rounded-xl border border-neutral-200 bg-white p-4"
    >
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
              Altere os filtros ou clique em “Limpar filtros” para consultar
              a coleção completa.
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
                    navigate({
                      to: '/cartas/$id',
                      params: { id: selected.card.id },
                    })
                  }}
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
      totalItems={
        result.status === 'success' ? result.data.totalItems : null
      }
      totalCopies={
        result.status === 'success' ? result.data.totalCopies : null
      }
      totalGames={
        result.status === 'success' ? result.data.totalGames : null
      }
    />
  )
}