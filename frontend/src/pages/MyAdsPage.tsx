import { useEffect, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import { MyAdCard } from '@/components/myAds/MyAdCard'
import {
  MyAdModal,
  type MyAdModalView,
} from '@/components/myAds/MyAdModal'
import { MyAdsFilters } from '@/components/myAds/MyAdsFilters'
import { emptyOwnAdFilters } from '@/components/myAds/ownAdFilters'
import { Icon } from '@/components/ui/Icon'
import { getMyAds } from '@/services/ads'
import { useSession } from '@/session'
import type { OwnAd, OwnAdFilterValues, OwnAdPage } from '@/types/Ad'

const PAGE_SIZE = 20

type AdsResult =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: OwnAdPage }

export function MyAdsPage() {
  const { user } = useSession()

  return (
    <main className="min-h-screen bg-[#FAFBFE] pb-12 text-[#171443]">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Meus anúncios"
          subtitle="Acompanhe e gerencie seus anúncios."
        />

        {user && <MyAdsContent key={user.id} />}
      </div>
    </main>
  )
}

function MyAdsContent() {
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState<OwnAdFilterValues>(emptyOwnAdFilters)
  const [formVersion, setFormVersion] = useState(0)

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <MyAdsFilters
        key={formVersion}
        onApply={(next) => {
          setFilters(next)
          setPage(0)
          setAttempt((current) => current + 1)
        }}
      />

      <MyAdsResults
        key={`${page}-${attempt}`}
        page={page}
        filters={filters}
        onPageChange={setPage}
        onRetry={() => setAttempt((current) => current + 1)}
        onClearFilters={() => {
          setFilters(emptyOwnAdFilters)
          setFormVersion((current) => current + 1)
          setPage(0)
          setAttempt((current) => current + 1)
        }}
      />
    </div>
  )
}

type ActiveModal = { ad: OwnAd; view: MyAdModalView } | null

function MyAdsResults({
  page,
  filters,
  onPageChange,
  onRetry,
  onClearFilters,
}: {
  page: number
  filters: OwnAdFilterValues
  onPageChange: (page: number) => void
  onRetry: () => void
  onClearFilters: () => void
}) {
  const [result, setResult] = useState<AdsResult>({ status: 'loading' })
  const [modal, setModal] = useState<ActiveModal>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getMyAds({ page, size: PAGE_SIZE, filters, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        // Após uma mutação a página pode ficar vazia: volta à última válida.
        if (data.content.length === 0 && page > 0 && data.totalPages > 0) {
          onPageChange(data.totalPages - 1)
          return
        }
        setResult({ status: 'success', data })
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ status: 'error' })
      })

    return () => controller.abort()
  }, [page, filters, reload, onPageChange])

  const hasFilters = Object.values(filters).some((value) => value !== '')

  return (
    <section
      aria-label="Seus anúncios"
      aria-busy={result.status === 'loading' || undefined}
      className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4"
    >
      {result.status === 'loading' ? (
        <ResultsSkeleton />
      ) : result.status === 'error' ? (
        <EmptyState
          role="alert"
          icon="alert"
          title="Não foi possível carregar seus anúncios."
          description="Verifique sua conexão e tente novamente."
        >
          <button type="button" onClick={onRetry} className={primaryButton}>
            Tentar novamente
          </button>
        </EmptyState>
      ) : result.data.totalElements === 0 ? (
        hasFilters ? (
          <EmptyState
            icon="search"
            title="Nenhum anúncio encontrado."
            description="Altere a busca ou os filtros."
          >
            <button
              type="button"
              onClick={onClearFilters}
              className={outlineButton}
            >
              Limpar filtros
            </button>
          </EmptyState>
        ) : (
          <EmptyState
            icon="cart"
            title="Você ainda não tem anúncios."
            description="Escolha uma carta da sua coleção para criar o primeiro anúncio."
          >
            <Link to="/minha-colecao" className={primaryButton}>
              Ir para minha coleção
            </Link>
          </EmptyState>
        )
      ) : (
        <>
          <h2
            aria-live="polite"
            className="mb-4 font-display text-2xl font-bold text-primary-900"
          >
            {result.data.totalElements}{' '}
            {result.data.totalElements === 1 ? 'anúncio' : 'anúncios'}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5">
            {result.data.content.map((ad) => (
              <MyAdCard
                key={ad.id}
                ad={ad}
                onDetails={(selected) =>
                  setModal({ ad: selected, view: 'details' })
                }
                onEdit={(selected) => setModal({ ad: selected, view: 'edit' })}
                onCancel={(selected) =>
                  setModal({ ad: selected, view: 'cancel' })
                }
              />
            ))}
          </div>

          <Pagination data={result.data} onPageChange={onPageChange} />
        </>
      )}

      {modal && (
        <MyAdModal
          key={modal.ad.id}
          ad={modal.ad}
          initialView={modal.view}
          onClose={() => setModal(null)}
          onChanged={() => setReload((current) => current + 1)}
        />
      )}
    </section>
  )
}

function Pagination({
  data,
  onPageChange,
}: {
  data: OwnAdPage
  onPageChange: (page: number) => void
}) {
  const from = data.number * data.size + 1
  const to = data.number * data.size + data.content.length

  return (
    <nav
      aria-label="Paginação dos anúncios"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4"
    >
      <span className="text-sm text-neutral-700">
        Exibindo {from}–{to} de {data.totalElements}{' '}
        {data.totalElements === 1 ? 'anúncio' : 'anúncios'}
      </span>

      {data.totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={data.first}
            onClick={() => onPageChange(data.number - 1)}
            className={pageButton}
          >
            Anterior
          </button>
          <span className="text-sm text-neutral-700">
            Página {data.number + 1} de {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.last}
            onClick={() => onPageChange(data.number + 1)}
            className={pageButton}
          >
            Próxima
          </button>
        </div>
      )}
    </nav>
  )
}

function EmptyState({
  role = 'status',
  icon,
  title,
  description,
  children,
}: {
  role?: 'status' | 'alert'
  icon: 'alert' | 'search' | 'cart'
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div
      role={role}
      className="flex min-h-80 flex-col items-center justify-center px-4 py-10 text-center"
    >
      <span className="mb-5 rounded-full bg-primary-100 p-5 text-primary-900">
        <Icon name={icon} size={32} />
      </span>
      <h2 className="font-display text-xl font-bold text-primary-900">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-700">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Carregando seus anúncios...</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-200 p-3 motion-safe:animate-pulse"
          >
            <div className="flex gap-3">
              <div className="h-28 w-20 rounded-lg bg-primary-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 rounded bg-neutral-100" />
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-full rounded bg-neutral-100" />
              </div>
            </div>
            <div className="mt-4 h-6 rounded bg-neutral-100" />
            <div className="mt-3 h-10 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

const primaryButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

const outlineButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-primary-900 px-5 py-3 text-sm font-semibold text-primary-900 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

const pageButton =
  'min-h-10 rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 enabled:cursor-pointer enabled:hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'
