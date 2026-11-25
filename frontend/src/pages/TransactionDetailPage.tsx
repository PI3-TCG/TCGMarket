import { useCallback } from 'react'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import {
  conditionLabels,
  copies,
  formatCurrency,
  gameLabels,
  languageLabels,
} from '@/components/ads/adFormat'
import {
  adjustmentLabel,
  counterpartyName,
  formatHistoryDate,
  historyStatusMeta,
  historyTypeMeta,
} from '@/components/history/historyFormat'
import { TransactionReviewSection } from '@/components/history/TransactionReviewSection'
import { Icon } from '@/components/ui/Icon'
import { listingPanelClass } from '@/components/ui/ListingPresentation'
import { focusRing } from '@/components/ui/styles'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMyTransaction } from '@/services/transactionHistory'
import { useSession } from '@/session'
import type {
  TransactionHistoryEntry,
  TransactionHistoryItem,
  TransactionHistorySearch,
} from '@/types/TransactionHistory'

const ROUTE_ID = '/site-layout/perfil/historico/$transactionId'
const detailPanel =
  'min-w-0 rounded-surface border border-border-default bg-neutral-0 p-4 shadow-sm sm:p-5'
const primaryLink =
  'inline-flex min-h-11 items-center justify-center rounded-control bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'

export function TransactionDetailPage() {
  const { user } = useSession()
  const { transactionId } = useParams({ from: ROUTE_ID })
  const search = useSearch({ from: ROUTE_ID })

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 px-4 pb-12 pt-6 text-text-primary sm:px-6 xl:px-[38px]">
      <header className="space-y-2">
        <Link
          to="/perfil/historico"
          search={search}
          activeOptions={{ exact: true }}
          className={`${focusRing} inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-sm font-semibold text-brand-primary hover:bg-surface-sand/60`}
        >
          ← Voltar ao histórico
        </Link>
        <h1 className="font-display text-2xl font-bold text-brand-deep sm:text-3xl">
          Detalhes da transação
        </h1>
      </header>

      {user && (
        <TransactionDetail
          key={`${user.id}:${transactionId}`}
          transactionId={transactionId}
          search={search}
        />
      )}
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
        className={`${listingPanelClass} h-36 motion-safe:animate-pulse`}
      >
        <span className="sr-only">Carregando transação...</span>
        <div aria-hidden="true" className="h-5 w-1/3 rounded-control bg-surface-subtle" />
      </div>
    )
  }

  if (state.status !== 'ready') {
    const notFound = state.status === 'notFound'
    return (
      <div
        role={notFound ? 'status' : 'alert'}
        className={`${listingPanelClass} flex flex-col items-center justify-center px-4 py-10 text-center`}
      >
        <span className="mb-5 rounded-full bg-surface-brand-tint p-5 text-brand-deep">
          <Icon name={notFound ? 'search' : 'alert'} size={32} />
        </span>
        <h2 className="font-display text-xl font-bold text-brand-deep">
          {notFound
            ? 'Transação não encontrada.'
            : 'Não foi possível carregar a transação.'}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
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
              className={primaryLink}
            >
              Voltar ao histórico
            </Link>
          ) : (
            <button type="button" onClick={retry} className={primaryLink}>
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
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
      <aside
        aria-label="Resumo da transação"
        className={`${detailPanel} space-y-4 lg:col-start-2 lg:row-start-1`}
      >
        <h2 className="font-display text-xl font-bold text-brand-deep">
          Resumo da transação
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex rounded-control border border-border-default px-3 py-1.5 text-xs font-semibold ${type.className}`}>
            {type.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-control border border-border-default px-3 py-1.5 text-xs font-semibold ${status.className}`}>
            <Icon name={status.icon} size={16} />
            {status.label}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-4 break-words text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Data</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              <time dateTime={entry.completedAt}>
                {formatHistoryDate(entry.completedAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">{type.counterpartyRole}</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {entry.counterparty?.username ? (
                <Link
                  to="/jogadores/$username"
                  params={{ username: entry.counterparty.username }}
                  className={`${focusRing} rounded-control text-brand-primary hover:underline`}
                >
                  {counterpartyName(entry)}
                </Link>
              ) : (
                counterpartyName(entry)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Quantidade</dt>
            <dd className="mt-1 font-semibold text-text-primary">{copies(entry.totalQuantity)}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Identificador</dt>
            <dd className="mt-1 break-all font-mono text-xs text-text-primary">{entry.id}</dd>
          </div>
          {entry.tradeProposalId && (
            <div>
              <dt className="text-text-secondary">Proposta de troca</dt>
              <dd className="mt-1 break-all font-mono text-xs text-text-primary">
                {entry.tradeProposalId}
              </dd>
            </div>
          )}
        </dl>

        {entry.type === 'TRADE' ? (
          <div className="border-t border-border-default pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-text-secondary">Complemento financeiro</span>
              <span className="text-right text-lg font-bold text-text-price">
                {adjustmentLabel(entry)}
              </span>
            </div>
            {entry.financialAdjustment && (
              <p className="mt-2 text-xs text-text-secondary">
                Valor apenas registrado na negociação; nenhum pagamento foi processado.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4">
            <span className="text-sm text-text-secondary">Total</span>
            <span className="text-xl font-bold text-text-price sm:text-2xl">
              {entry.totalAmount == null
                ? 'Valor não informado'
                : formatCurrency(entry.totalAmount)}
            </span>
          </div>
        )}
      </aside>

      <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
        {entry.type === 'TRADE' ? (
          <>
            <ItemSection
              id="transaction-items-sent"
              title="Cartas entregues"
              items={entry.items.filter((item) => item.direction === 'SENT')}
            />
            <ItemSection
              id="transaction-items-received"
              title="Cartas recebidas"
              items={entry.items.filter((item) => item.direction === 'RECEIVED')}
            />
          </>
        ) : (
          <ItemSection
            id="transaction-items"
            title={entry.type === 'PURCHASE' ? 'Cartas compradas' : 'Cartas vendidas'}
            items={entry.items}
          />
        )}

        <TransactionReviewSection
          canReview={entry.type !== 'SALE'}
          canReceiveReview={entry.type !== 'PURCHASE'}
          transactionId={entry.id}
          counterpartyName={counterpartyName(entry)}
        />
      </div>
    </div>
  )
}

function ItemSection({
  id,
  title,
  items,
}: {
  id: string
  title: string
  items: TransactionHistoryItem[]
}) {
  return (
    <section aria-labelledby={id} className={detailPanel}>
      <h2 id={id} className="mb-4 font-display text-xl font-bold text-brand-deep">
        {title}
      </h2>

      <ul className="divide-y divide-border-default">
        {items.map((item, index) => (
          <li key={`${item.cardId}-${index}`} className="flex flex-wrap gap-3 py-3 first:pt-0 last:pb-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={`Carta ${item.name}`}
                loading="lazy"
                className="h-20 w-14 shrink-0 rounded-control bg-surface-default object-contain"
              />
            ) : (
              <div
                role="img"
                aria-label={`Imagem indisponível de ${item.name}`}
                className="grid h-20 w-14 shrink-0 place-items-center rounded-control border border-border-default bg-surface-default text-text-secondary"
              >
                <Icon name="gem" size={20} />
              </div>
            )}
            <div className="min-w-0 basis-32 grow break-words">
              <p className="font-semibold text-text-ink">{item.name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {[
                  gameLabels[item.game] ?? item.game,
                  item.edition,
                  item.cardNumber,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {conditionLabels[item.condition]} · {languageLabels[item.language]}
              </p>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="text-text-secondary">{copies(item.quantity)}</p>
              {item.unitPrice !== null && (
                <>
                  <p className="mt-1 text-text-secondary">
                    {formatCurrency(item.unitPrice)} cada
                  </p>
                  <p className="mt-1 font-bold text-text-price">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="py-4 text-sm text-text-secondary">Nenhuma carta registrada neste grupo.</p>
      )}
    </section>
  )
}
