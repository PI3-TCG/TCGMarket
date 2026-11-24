import { ListingSort, type ListingSortOrder } from '@/components/ui/ListingSort'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { tradingCardDetailsButton, tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { pageBanners } from '@/config/pageBanners'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import { MyAdCard } from '@/components/myAds/MyAdCard'
import {
  MyAdModal,
  type MyAdModalView,
} from '@/components/myAds/MyAdModal'
import { ResponsiveFilters } from '@/components/ui/ResponsiveFilters'
import { MyAdsFilters } from '@/components/myAds/MyAdsFilters'
import { emptyOwnAdFilters } from '@/components/myAds/ownAdFilters'
import { Button } from '@/components/ui/Button'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { TradingCardSkeletonGrid } from '@/components/ui/TradingCardSkeletonGrid'
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
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.myAds}
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
  const [sort, setSort] = useState<ListingSortOrder>('RECENT')
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState<OwnAdFilterValues>(emptyOwnAdFilters)
  const [formVersion, setFormVersion] = useState(0)

  return (
    <div className="mt-10 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResponsiveFilters>
        <MyAdsFilters
          key={formVersion}
          onApply={(next) => {
            setFilters(next)
            setPage(0)
            setAttempt((current) => current + 1)
          }}
        />
      </ResponsiveFilters>

      <div className="min-w-0">
        <MyAdsResults
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
          onClearFilters={() => {
            setFilters(emptyOwnAdFilters)
            setFormVersion((current) => current + 1)
            setPage(0)
            setAttempt((current) => current + 1)
          }}
        />
      </div>
    </div>
  )
}

type ActiveModal = { ad: OwnAd; view: MyAdModalView } | null

function MyAdsResults({
  attempt,
  page,
  sort,
  onSortChange,
  filters,
  onPageChange,
  onRetry,
  onClearFilters,
}: {
  attempt: number
  page: number
  sort: ListingSortOrder
  onSortChange: (sort: ListingSortOrder) => void
  filters: OwnAdFilterValues
  onPageChange: (page: number) => void
  onRetry: () => void
  onClearFilters: () => void
}) {
  const requestKey = `${attempt}-${sort}-${page}`
  const [response, setResponse] = useState<{ requestKey: string; result: AdsResult }>()
  const result = response?.requestKey === requestKey ? response.result : { status: 'loading' as const }
  const [modal, setModal] = useState<ActiveModal>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getMyAds({ page, size: PAGE_SIZE, filters, sort, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        // Após uma mutação a página pode ficar vazia: volta à última válida.
        if (data.content.length === 0 && page > 0 && data.totalPages > 0) {
          onPageChange(data.totalPages - 1)
          return
        }
        setResponse({ requestKey, result: { status: 'success', data } })
      })
      .catch(() => {
        if (!controller.signal.aborted) setResponse({ requestKey, result: { status: 'error' } })
      })

    return () => controller.abort()
  }, [page, filters, sort, requestKey, reload, onPageChange])

  const hasFilters = Object.values(filters).some((value) => value !== '')

  return (
    <section
      aria-label="Seus anúncios"
      aria-busy={result.status === 'loading' || undefined}
      className="min-w-0 rounded-surface border border-border-default bg-surface-default p-3 shadow-sm sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border-default pb-4">
        <div className="min-w-0">
          <h2 className="font-title text-xl font-bold text-text-ink">Seus anúncios</h2>
          {result.status === 'success' && (
            <p aria-live="polite" className="mt-1 text-sm text-text-secondary">
              {result.data.totalElements.toLocaleString('pt-BR')}{' '}
              {result.data.totalElements === 1 ? 'anúncio' : 'anúncios'}
            </p>
          )}
        </div>
        <ListingSort value={sort} onChange={onSortChange} />
      </header>

      {result.status === 'loading' ? (
        <TradingCardSkeletonGrid label="Carregando seus anúncios..." />
      ) : result.status === 'error' ? (
        <FeedbackState
          role="alert"
          icon="alert"
          title="Não foi possível carregar seus anúncios."
          description="Verifique sua conexão e tente novamente."
        >
          <Button onClick={onRetry}>
            Tentar novamente
          </Button>
        </FeedbackState>
      ) : result.data.totalElements === 0 ? (
        hasFilters ? (
          <FeedbackState
            icon="search"
            title="Nenhum anúncio encontrado."
            description="Altere a busca ou os filtros."
          >
            <Button variant="outline" onClick={onClearFilters}>
              Limpar filtros
            </Button>
          </FeedbackState>
        ) : (
          <FeedbackState
            icon="cart"
            title="Você ainda não tem anúncios."
            description="Escolha uma carta da sua coleção para criar o primeiro anúncio."
          >
            <Link to="/minha-colecao" className={tradingCardDetailsButton}>
              Ir para minha coleção
            </Link>
          </FeedbackState>
        )
      ) : (
        <>
          <div className={tradingCardGrid}>
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
    <div
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4"
    >
      <span className="text-sm text-text-secondary">
        Exibindo {from}–{to} de {data.totalElements}{' '}
        {data.totalElements === 1 ? 'anúncio' : 'anúncios'}
      </span>

      <PageNavigation
        label="Paginação dos anúncios"
        page={data.number + 1}
        totalPages={data.totalPages}
        onPageChange={(page) => onPageChange(page - 1)}
      />
    </div>
  )
}
