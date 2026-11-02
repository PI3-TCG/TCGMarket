import { pageBanners } from '@/config/pageBanners'
import { useCallback } from 'react'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import {
  conditionLabels,
  copies,
  formatCurrency,
  gameLabels,
  languageLabels,
} from '@/components/ads/adFormat'
import {
  counterpartyName,
  formatHistoryDate,
  historyStatusMeta,
  historyTypeMeta,
} from '@/components/history/historyFormat'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMyTransaction } from '@/services/transactionHistory'
import { useSession } from '@/session'
import type {
  TransactionHistoryEntry,
  TransactionHistorySearch,
} from '@/types/TransactionHistory'

const ROUTE_ID = '/site-layout/perfil/historico/$transactionId'

export function TransactionDetailPage() {
  const { user } = useSession()
  const { transactionId } = useParams({ from: ROUTE_ID })
  const search = useSearch({ from: ROUTE_ID })

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner image={pageBanners.profile}
          title="Detalhes da transação"
          subtitle="Informações registradas no momento da negociação."
        />

        <Link
          to="/perfil/historico"
          search={search}
          activeOptions={{ exact: true }}
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          ← Voltar ao histórico
        </Link>

        {user && (
          <TransactionDetail
            key={`${user.id}:${transactionId}`}
            transactionId={transactionId}
            search={search}
          />
        )}
      </div>
    </main>
  )
}

function TransactionDetail({
  transactionId,
  search,
}: {
  transactionId: string
  search: TransactionHistorySearch
}) {
  const fetchTransaction = useCallback(
    () => getMyTransaction(transactionId),
    [transactionId],
  )
  const { state, retry } = useRemoteData(
    `transaction:${transactionId}`,
    fetchTransaction,
  )

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        aria-busy="true"
        className="mt-4 h-96 rounded-xl border border-neutral-200 bg-white motion-safe:animate-pulse"
      >
        <span className="sr-only">Carregando transação...</span>
      </div>
    )
  }

  if (state.status !== 'ready') {
    const notFound = state.status === 'notFound'
    return (
      <div
        role={notFound ? 'status' : 'alert'}
        className="mt-4 flex min-h-80 flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-10 text-center"
      >
        <span className="mb-5 rounded-full bg-primary-100 p-5 text-primary-900">
          <Icon name={notFound ? 'search' : 'alert'} size={32} />
        </span>
        <h2 className="font-display text-xl font-bold text-primary-900">
          {notFound
            ? 'Transação não encontrada.'
            : 'Não foi possível carregar a transação.'}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-700">
          {notFound
            ? 'Ela não existe ou não pertence à sua conta.'
            : 'Verifique sua conexão e tente novamente.'}
        </p>
        <div className="mt-5">
          {notFound ? (
            <Link
              to="/perfil/historico"
              search={search}
              activeOptions={{ exact: true }}
              className={button}
            >
              Voltar ao histórico
            </Link>
          ) : (
            <button type="button" onClick={retry} className={button}>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  return <TransactionSummary entry={state.data} />
}

function TransactionSummary({ entry }: { entry: TransactionHistoryEntry }) {
  const type = historyTypeMeta[entry.type]
  const status = historyStatusMeta[entry.status]

  return (
    <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section
        aria-labelledby="transaction-items"
        className="rounded-xl border border-neutral-200 bg-white p-4"
      >
        <h2
          id="transaction-items"
          className="mb-4 font-display text-xl font-bold text-primary-900"
        >
          {entry.type === 'PURCHASE' ? 'Cartas compradas' : 'Cartas vendidas'}
        </h2>

        <ul className="divide-y divide-neutral-200">
          {entry.items.map((item, index) => (
            <li
              key={`${item.cardId}-${index}`}
              className="flex gap-4 py-3 first:pt-0 last:pb-0"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={`Carta ${item.name}`}
                  className="h-28 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`Imagem indisponível de ${item.name}`}
                  className="h-28 w-20 shrink-0 rounded-lg bg-primary-100"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{item.name}</p>
                <p className="text-sm text-neutral-700">
                  {[gameLabels[item.game] ?? item.game, item.edition, item.cardNumber]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="text-sm text-neutral-700">
                  {conditionLabels[item.condition]} ·{' '}
                  {languageLabels[item.language]}
                </p>
              </div>

              <div className="shrink-0 text-right text-sm">
                <p className="text-neutral-700">{copies(item.quantity)}</p>
                {item.unitPrice !== null && (
                  <>
                    <p className="text-neutral-700">
                      {formatCurrency(item.unitPrice)} cada
                    </p>
                    <p className="font-semibold text-neutral-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside
        aria-label="Resumo da transação"
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${type.className}`}
          >
            {type.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            <Icon name={status.icon} size={16} />
            {status.label}
          </span>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-neutral-500">Data</dt>
            <dd className="font-medium">
              <time dateTime={entry.completedAt}>
                {formatHistoryDate(entry.completedAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">{type.counterpartyRole}</dt>
            <dd className="font-medium">
              {entry.counterparty?.username ? (
                <Link
                  to="/jogadores/$username"
                  params={{ username: entry.counterparty.username }}
                  className="text-primary-900 hover:underline"
                >
                  {counterpartyName(entry)}
                </Link>
              ) : (
                counterpartyName(entry)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Quantidade</dt>
            <dd className="font-medium">{copies(entry.totalQuantity)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Identificador</dt>
            <dd className="break-all font-mono text-xs">{entry.id}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <span className="text-sm text-neutral-700">Total</span>
          <span className="font-display text-2xl font-bold text-primary-900">
            {formatCurrency(entry.totalAmount)}
          </span>
        </div>
      </aside>
    </div>
  )
}

const button =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'
