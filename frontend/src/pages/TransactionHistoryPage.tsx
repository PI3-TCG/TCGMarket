import { FeedbackState } from '@/components/ui/FeedbackState'
import { TransactionReviewButton } from '@/components/history/TransactionReviewButton'
import { pageBanners } from '@/config/pageBanners'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import {
  adjustmentLabel,
  counterpartyName,
  formatHistoryDate,
  historyStatusMeta,
  historyTypeMeta,
} from '@/components/history/historyFormat'
import { copies, formatCurrency } from '@/components/ads/adFormat'
import { Icon } from '@/components/ui/Icon'
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

type HistoryResult =
  | { key: string; status: 'error' }
  | { key: string; status: 'success'; data: HistoryPage }

export function TransactionHistoryPage() {
  const { user } = useSession()
  const search = useSearch({ from: '/site-layout/perfil/historico' })

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
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

  const changeSearch = (next: TransactionHistorySearch) =>
    navigate({ to: '/perfil/historico', search: next })

  const current = result?.key === requestKey ? result : null

  return (
    <div className="mt-6 space-y-4">
      <div
        role="tablist"
        aria-label="Tipo de transação"
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const selected = tab.type === search.type
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => changeSearch({ type: tab.type })}
              className={selected ? selectedTab : idleTab}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <section
        aria-label="Transações"
        aria-busy={current === null || undefined}
        className="rounded-xl border border-neutral-200 bg-white p-4"
      >
        {current === null ? (
          <HistorySkeleton />
        ) : current.status === 'error' ? (
          <FeedbackState
            role="alert"
            icon="alert"
            title="Não foi possível carregar seu histórico."
            description="Verifique sua conexão e tente novamente."
          >
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className={primaryButton}
            >
              Tentar novamente
            </button>
          </FeedbackState>
        ) : current.data.totalElements === 0 ? (
          search.type ? (
            <FeedbackState
              icon="search"
              title={emptyTitles[search.type]}
              description="Veja todas as transações para conferir o restante do histórico."
            >
              <button
                type="button"
                onClick={() => changeSearch({})}
                className={outlineButton}
              >
                Ver todas
              </button>
            </FeedbackState>
          ) : (
            <FeedbackState
              icon="cart"
              title="Você ainda não tem transações."
              description="Suas compras, vendas e trocas concluídas aparecerão aqui."
            >
              <Link
                to="/marketplace"
                search={{ sort: 'recent' }}
                className={primaryButton}
              >
                Explorar anúncios
              </Link>
            </FeedbackState>
          )
        ) : (
          <>
            <h2
              aria-live="polite"
              className="mb-4 font-display text-2xl font-bold text-primary-900"
            >
              {current.data.totalElements}{' '}
              {current.data.totalElements === 1 ? 'transação' : 'transações'}
            </h2>

            <ul className="space-y-3">
              {current.data.content.map((entry) => (
                <li key={entry.id}>
                  <TransactionRow entry={entry} search={search} />
                </li>
              ))}
            </ul>

            <Pagination
              data={current.data}
              onPageChange={(next) =>
                changeSearch({ type: search.type, page: next + 1 })
              }
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
    <article className="grid gap-4 rounded-xl border border-neutral-200 p-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center">
      <div className="space-y-1">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${type.className}`}
        >
          {type.label}
        </span>
        <p className="text-sm text-neutral-700">
          <time dateTime={entry.completedAt}>
            {formatHistoryDate(entry.completedAt)}
          </time>
        </p>
        <p className="text-sm text-neutral-700">
          {type.counterpartyRole}:{' '}
          <span className="font-medium text-neutral-900">
            {counterpartyName(entry)}
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <ul className="space-y-1">
          {preview.map((item, index) => (
            <li key={`${item.cardId}-${index}`} className="truncate text-sm">
              {entry.type === 'TRADE' && (
                <span className="text-neutral-500">
                  {item.direction === 'SENT' ? 'Entregou' : 'Recebeu'}{' '}
                </span>
              )}
              <span className="font-semibold text-neutral-900">
                {item.quantity}×
              </span>{' '}
              <span title={item.name}>{item.name}</span>
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            +{hidden} {hidden === 1 ? 'outra carta' : 'outras cartas'}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          {copies(entry.totalQuantity)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          <Icon name={status.icon} size={16} />
          {status.label}
        </span>
        {entry.type === 'TRADE' ? (
          <span className="text-sm font-semibold text-primary-900">
            {adjustmentLabel(entry)}
          </span>
        ) : (
          <span className="font-display text-lg font-bold text-primary-900">
            {formatCurrency(entry.totalAmount ?? 0)}
          </span>
        )}
        <div className="flex flex-col gap-2 md:items-end">
          {entry.status === 'COMPLETED' && entry.type !== 'SALE' && (
            <TransactionReviewButton
              transactionId={entry.id}
              counterpartyName={counterpartyName(entry)}
              label={
                entry.type === 'TRADE'
                  ? 'Avaliar troca'
                  : 'Avaliar vendedor'
              }
            />
          )}
          <Link
            to="/perfil/historico/$transactionId"
            params={{ transactionId: entry.id }}
            search={search}
            className={outlineButton}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  )
}

function Pagination({
  data,
  onPageChange,
}: {
  data: HistoryPage
  onPageChange: (page: number) => void
}) {
  const from = data.number * data.size + 1
  const to = data.number * data.size + data.content.length

  return (
    <nav
      aria-label="Paginação do histórico"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4"
    >
      <span className="text-sm text-neutral-700">
        Exibindo {from}–{to} de {data.totalElements}{' '}
        {data.totalElements === 1 ? 'transação' : 'transações'}
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

function HistorySkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Carregando seu histórico...</span>
      <div aria-hidden="true" className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border border-neutral-200 p-4 motion-safe:animate-pulse md:grid-cols-[180px_minmax(0,1fr)_auto]"
          >
            <div className="space-y-2">
              <div className="h-6 w-20 rounded-full bg-primary-100" />
              <div className="h-4 w-28 rounded bg-neutral-100" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-100" />
            </div>
            <div className="h-10 w-32 rounded-lg bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

const tabBase =
  'min-h-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

const selectedTab = `${tabBase} bg-primary-900 text-white`

const idleTab = `${tabBase} border border-neutral-300 bg-white text-primary-900 hover:bg-primary-100`

const primaryButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

const outlineButton =
  'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

const pageButton =
  'min-h-10 rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 enabled:cursor-pointer enabled:hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'
