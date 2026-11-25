import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { copies, formatCurrency } from '@/components/ads/adFormat'
import {
  adjustmentLabel,
  counterpartyName,
  formatHistoryDate,
  historyStatusMeta,
  historyTypeMeta,
} from '@/components/history/historyFormat'
import { TransactionReviewButton } from '@/components/history/TransactionReviewButton'
import { PageBanner } from '@/components/layout/PageBanner'
import { Button } from '@/components/ui/Button'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { Icon } from '@/components/ui/Icon'
import { listingPanelClass } from '@/components/ui/ListingPresentation'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { pageBanners } from '@/config/pageBanners'
import { getMyTransactions } from '@/services/transactionHistory'
import { useSession } from '@/session'
import type {
  TransactionHistoryEntry,
  TransactionHistoryPage as HistoryPage,
  TransactionHistorySearch,
  TransactionHistoryType,
} from '@/types/TransactionHistory'

const PAGE_SIZE = 10
const PREVIEW_LIMIT = 3

const tabs: { type?: TransactionHistoryType; label: string }[] = [
  { label: 'Todas' },
  { type: 'PURCHASE', label: 'Compras' },
  { type: 'SALE', label: 'Vendas' },
  { type: 'TRADE', label: 'Trocas' },
]

const emptyTitles: Record<TransactionHistoryType, string> = {
  PURCHASE: 'Nenhuma compra encontrada.',
  SALE: 'Nenhuma venda encontrada.',
  TRADE: 'Nenhuma troca encontrada.',
}

const tabBase =
  'inline-flex min-h-11 items-center justify-center rounded-control border px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'
const selectedTab = `${tabBase} border-brand-primary bg-brand-primary text-white shadow-sm`
const idleTab = `${tabBase} border-border-default bg-neutral-0 text-brand-deep hover:border-border-emphasis hover:bg-surface-brand-tint`
const outlineLink =
  'inline-flex min-h-11 items-center justify-center rounded-control border border-brand-primary bg-neutral-0 px-4 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'
const primaryLink =
  'inline-flex min-h-11 items-center justify-center rounded-control bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'

type HistoryResult =
  | { key: string; status: 'error' }
  | { key: string; status: 'success'; data: HistoryPage }

export function TransactionHistoryPage() {
  const { user } = useSession()
  const search = useSearch({ from: '/site-layout/perfil/historico' })

  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.profile}
          title="Histórico de transações"
          subtitle="Consulte suas compras, vendas e trocas realizadas no Marketplace."
        />
        {user && <HistoryContent key={user.id} search={search} />}
      </div>
    </main>
  )
}

function HistoryContent({ search }: { search: TransactionHistorySearch }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<HistoryResult | null>(null)
  const page = (search.page ?? 1) - 1
  const requestKey = `${search.type ?? 'ALL'}:${page}:${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    getMyTransactions({
      type: search.type,
      page,
      size: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, status: 'success', data })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, status: 'error' })
        }
      })
    return () => controller.abort()
  }, [search.type, page, requestKey])

  const current = result?.key === requestKey ? result : null
  const changeSearch = (next: TransactionHistorySearch) =>
    navigate({ to: '/perfil/historico', search: next })

  return (
    <div className="mt-8 space-y-4 sm:mt-10">
      <div className="rounded-surface border border-accent-gold-frame bg-surface-default p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-sm font-semibold text-text-primary">Tipo de transação</p>
        <div role="group" aria-label="Filtrar por tipo de transação" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const selected = tab.type === search.type
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={selected}
                onClick={() => changeSearch({ type: tab.type })}
                className={selected ? selectedTab : idleTab}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <section
        aria-label="Transações"
        aria-busy={current === null}
        className={listingPanelClass}
      >
        {current === null ? (
          <HistorySkeleton />
        ) : current.status === 'error' ? (
          <FeedbackState
            role="alert"
            icon="alert"
            title="Não foi possível carregar seu histórico."
            description="Verifique sua conexão e tente novamente. O filtro foi preservado."
          >
            <Button onClick={() => setAttempt((value) => value + 1)}>
              Tentar novamente
            </Button>
          </FeedbackState>
        ) : current.data.totalElements === 0 ? (
          search.type ? (
            <FeedbackState
              icon="search"
              title={emptyTitles[search.type]}
              description="Veja todas as transações para conferir o restante do histórico."
            >
              <Button variant="outline" onClick={() => changeSearch({})}>
                Ver todas
              </Button>
            </FeedbackState>
          ) : (
            <FeedbackState
              icon="cart"
              title="Você ainda não tem transações."
              description="Suas compras, vendas e trocas concluídas aparecerão aqui."
            >
              <Link to="/marketplace" search={{ sort: 'recent' }} className={primaryLink}>
                Explorar anúncios
              </Link>
            </FeedbackState>
          )
        ) : current.data.content.length === 0 ? (
          <FeedbackState
            icon="search"
            title="Não há transações nesta página."
            description="Volte à primeira página para continuar consultando seu histórico."
          >
            <Button variant="outline" onClick={() => changeSearch({ type: search.type })}>
              Voltar à primeira página
            </Button>
          </FeedbackState>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-4">
              <h2 className="font-display text-xl font-bold text-brand-deep sm:text-2xl">
                {search.type ? tabs.find((tab) => tab.type === search.type)?.label : 'Todas as transações'}
              </h2>
              <p aria-live="polite" className="text-sm font-medium text-text-secondary">
                {current.data.totalElements}{' '}
                {current.data.totalElements === 1 ? 'transação encontrada' : 'transações encontradas'}
              </p>
            </div>

            <ul className="space-y-4">
              {current.data.content.map((entry) => (
                <li key={entry.id}>
                  <TransactionRow entry={entry} search={search} />
                </li>
              ))}
            </ul>
            <HistoryPager
              data={current.data}
              onPageChange={(next) => changeSearch({ type: search.type, page: next + 1 })}
            />
          </>
        )}
      </section>
    </div>
  )
}

function TransactionRow({
  entry,
  search,
}: {
  entry: TransactionHistoryEntry
  search: TransactionHistorySearch
}) {
  const type = historyTypeMeta[entry.type]
  const status = historyStatusMeta[entry.status]
  const preview = entry.items.slice(0, PREVIEW_LIMIT)
  const hidden = entry.items.length - preview.length

  return (
    <article className="grid min-w-0 grid-cols-1 gap-4 rounded-surface border border-border-default bg-surface-default p-4 shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-border-emphasis hover:shadow-md lg:grid-cols-[175px_minmax(0,1fr)_minmax(175px,220px)] lg:items-center sm:p-5">
      <div className="min-w-0 space-y-2">
        <span className={`inline-flex items-center rounded-control border border-border-default px-3 py-1.5 text-xs font-semibold ${type.className}`}>
          {type.label}
        </span>
        <p className="text-sm text-text-secondary">
          <time dateTime={entry.completedAt}>{formatHistoryDate(entry.completedAt)}</time>
        </p>
        <p className="break-words text-sm text-text-secondary">
          {type.counterpartyRole}:{' '}
          <span className="font-semibold text-text-primary">{counterpartyName(entry)}</span>
        </p>
      </div>

      <div className="min-w-0 lg:border-l lg:border-border-default lg:pl-4">
        <ul className="space-y-2">
          {preview.map((item, index) => (
            <li key={`${item.cardId}-${index}`} className="min-w-0 text-sm text-text-primary">
              {entry.type === 'TRADE' && (
                <span className="text-text-secondary">
                  {item.direction === 'SENT' ? 'Entregou' : 'Recebeu'}{' '}
                </span>
              )}
              <span className="font-semibold text-brand-deep">{item.quantity}×</span>{' '}
              <span className="break-words" title={item.name}>{item.name}</span>
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <p className="mt-2 text-xs text-text-secondary">
            +{hidden} {hidden === 1 ? 'outra carta' : 'outras cartas'}
          </p>
        )}
        <p className="mt-2 text-xs text-text-secondary">{copies(entry.totalQuantity)}</p>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-3 border-t border-border-default pt-4 lg:items-end lg:border-t-0 lg:pt-0">
        <span className={`inline-flex items-center gap-1.5 rounded-control border border-border-default px-3 py-1.5 text-xs font-semibold ${status.className}`}>
          <Icon name={status.icon} size={16} />
          {status.label}
        </span>
        {entry.type === 'TRADE' ? (
          <span className="text-sm font-semibold text-text-price">{adjustmentLabel(entry)}</span>
        ) : entry.totalAmount != null ? (
          <span className="text-lg font-bold text-text-price">
            {formatCurrency(entry.totalAmount)}
          </span>
        ) : (
          <span className="text-xs text-text-secondary">Valor não informado</span>
        )}
        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:flex-col lg:items-stretch">
          {entry.status === 'COMPLETED' && entry.type !== 'SALE' && (
            <TransactionReviewButton
              transactionId={entry.id}
              counterpartyName={counterpartyName(entry)}
              label={entry.type === 'TRADE' ? 'Avaliar troca' : 'Avaliar vendedor'}
            />
          )}
          <Link
            to="/perfil/historico/$transactionId"
            params={{ transactionId: entry.id }}
            search={search}
            className={outlineLink}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  )
}

function HistoryPager({
  data,
  onPageChange,
}: {
  data: HistoryPage
  onPageChange: (page: number) => void
}) {
  const from = data.number * data.size + 1
  const to = data.number * data.size + data.content.length

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-4">
      <span className="text-sm text-text-secondary">
        Exibindo {from}–{to} de {data.totalElements}{' '}
        {data.totalElements === 1 ? 'transação' : 'transações'}
      </span>
      <PageNavigation
        label="Paginação do histórico"
        page={data.number + 1}
        totalPages={data.totalPages}
        onPageChange={(page) => onPageChange(page - 1)}
      />
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Carregando seu histórico...</span>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid min-w-0 grid-cols-1 gap-4 rounded-surface border border-border-default bg-surface-default p-4 lg:grid-cols-[175px_minmax(0,1fr)_minmax(175px,220px)]"
          >
            <div className="space-y-2">
              <div className="h-6 w-20 rounded-control bg-surface-lavender" />
              <div className="h-4 w-28 rounded-control bg-surface-subtle" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded-control bg-surface-subtle" />
              <div className="h-4 w-1/2 rounded-control bg-surface-sand" />
            </div>
            <div className="h-10 w-32 rounded-control bg-surface-subtle" />
          </div>
        ))}
      </div>
    </div>
  )
}
