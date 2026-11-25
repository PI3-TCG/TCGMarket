import { cardSurface } from '@/components/ui/Card'
import { listingPanelClass, listingSortClass } from '@/components/ui/ListingPresentation'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { pageBanners } from '@/config/pageBanners'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import { TradeProposalDetailsModal } from '@/components/trade/TradeProposalDetailsModal'
import {
  TRADE_STATUSES,
  directionLabel,
  participantName,
  proposalDate,
  proposalMoney,
  proposalPerspective,
  statusPresentation,
} from '@/components/trade/proposalViewFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getMyTradeProposals } from '@/services/tradeProposalRead'
import { useSession } from '@/session'
import type {
  TradeProposalCardItem,
  TradeProposalDirection,
  TradeProposalView,
  TradeProposalsPage,
  TradeProposalsSearch,
} from '@/types/TradeProposalView'

const PAGE_SIZE = 10

type Settled =
  | { key: string; kind: 'error' }
  | { key: string; kind: 'ready'; data: TradeProposalsPage }

export function MyTradeProposalsPage() {
  const { user } = useSession()
  const search = useSearch({ from: '/site-layout/perfil/propostas' })

  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.profile}
          title="Minhas propostas"
          subtitle={
            <>
              Acompanhe as propostas de troca que você
              <br />
              enviou ou recebeu.
            </>
          }
          symbol="⇄"
        />
        {user && <ProposalsContent key={user.id} search={search} />}
      </div>
    </main>
  )
}

function ProposalsContent({ search }: { search: TradeProposalsSearch }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled | null>(null)
  const detailsId = search.proposalId
  const page = (search.page ?? 1) - 1
  const requestKey = `${search.direction}:${search.status ?? 'ALL'}:${page}:${attempt}`

  useEffect(() => {
    const abort = new AbortController()
    getMyTradeProposals({
      direction: search.direction,
      status: search.status,
      page,
      size: PAGE_SIZE,
      signal: abort.signal,
    })
      .then((data) => {
        if (!abort.signal.aborted)
          setSettled({ key: requestKey, kind: 'ready', data })
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setSettled({ key: requestKey, kind: 'error' })
      })
    return () => abort.abort()
  }, [search.direction, search.status, page, requestKey])

  const current = settled?.key === requestKey ? settled : null

  function updateSearch(next: TradeProposalsSearch) {
    navigate({ to: '/perfil/propostas', search: next })
  }

  function changeDirection(direction: TradeProposalDirection) {
    updateSearch({ direction, status: search.status })
  }

  return (
    <div className="mt-10 space-y-4">
      <div className={`${cardSurface} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div
          role="tablist"
          aria-label="Propostas por direção"
          className="flex flex-wrap gap-2"
        >
          {(['RECEIVED', 'SENT'] as const).map((direction) => {
            const selected = search.direction === direction
            return (
              <button
                key={direction}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => changeDirection(direction)}
                className={`min-h-11 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue ${
                  selected
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'border border-border-default bg-surface-input text-brand-primary hover:bg-surface-brand-tint'
                }`}
              >
                {directionLabel(direction)}
              </button>
            )
          })}
        </div>
        <label className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:min-w-56 text-sm font-semibold text-text-secondary">
          Status
          <select
            value={search.status ?? ''}
            onChange={(event) => {
              const selected = TRADE_STATUSES.find(
                (status) => status.value === event.target.value,
              )
              updateSearch({
                direction: search.direction,
                status: selected?.value,
              })
            }}
            className={`${listingSortClass} flex-1`}
          >
            <option value="">Todos</option>
            {TRADE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section
        aria-label={`Propostas ${directionLabel(search.direction).toLowerCase()}`}
        aria-busy={current === null}
        className={listingPanelClass}
      >
        {current === null ? (
          <ProposalsSkeleton />
        ) : current.kind === 'error' ? (
          <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
            <Alert
              variant="error"
              title="Não foi possível carregar suas propostas"
            >
              Verifique sua conexão e tente novamente. Os filtros foram
              preservados.
            </Alert>
            <Button onClick={() => setAttempt((value) => value + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : current.data.totalElements === 0 ? (
          <ProposalsEmpty
            search={search}
            onClear={() => updateSearch({ direction: search.direction })}
          />
        ) : current.data.content.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-sm text-text-secondary">
              Não há propostas nesta página.
            </p>
            <Button
              variant="outline"
              onClick={() =>
                updateSearch({
                  direction: search.direction,
                  status: search.status,
                })
              }
            >
              Voltar à primeira página
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-text-ink sm:text-2xl">
                {directionLabel(search.direction)}
              </h2>
              <span
                aria-live="polite"
                className="text-sm font-medium text-text-secondary"
              >
                {current.data.totalElements}{' '}
                {current.data.totalElements === 1
                  ? 'proposta encontrada'
                  : 'propostas encontradas'}
              </span>
            </div>
            <ul className="space-y-4">
              {current.data.content.map((proposal) => (
                <li key={proposal.id}>
                  <ProposalRow
                    proposal={proposal}
                    onView={() => updateSearch({ ...search, proposalId: proposal.id })}
                  />
                </li>
              ))}
            </ul>
            <ProposalPager
              data={current.data}
              onPage={(next) => updateSearch({ ...search, page: next + 1 })}
            />
          </>
        )}
      </section>

      {detailsId && (
        <TradeProposalDetailsModal
          id={detailsId}
          onClose={() => updateSearch({ ...search, proposalId: undefined })}
          onDecision={() => setAttempt((value) => value + 1)}
        />
      )}
    </div>
  )
}

function ProposalRow({
  proposal,
  onView,
}: {
  proposal: TradeProposalView
  onView: () => void
}) {
  const { receive, deliver, counterparty, counterpartyRole } =
    proposalPerspective(proposal)
  const status = statusPresentation[proposal.status]
  return (
    <article className={`${cardSurface} p-4 hover:shadow-md sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Proposta de troca
          </p>
          <p className="break-all font-mono text-xs text-text-secondary">
            {proposal.id}
          </p>
          <p className="text-sm text-text-secondary">
            {counterpartyRole}:{' '}
            <span className="wrap-anywhere font-semibold text-text-primary">
              {participantName(counterparty)}
            </span>
          </p>
          <time
            className="block text-xs text-text-secondary"
            dateTime={proposal.createdAt}
          >
            Enviada em {proposalDate(proposal.createdAt)}
          </time>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
        >
          <span aria-hidden="true">●</span>
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SidePreview title="Você recebe" items={receive} accent="blue" />
        <SidePreview title="Você entrega" items={deliver} accent="purple" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4">
        <div className="text-xs text-text-secondary">
          {proposal.financialAdjustment ? (
            <span>
              Complemento:{' '}
              <strong className="text-brand-primary">
                {proposalMoney(
                  proposal.financialAdjustment.amount,
                  proposal.financialAdjustment.currency,
                )}
              </strong>
              {' · '}
              {proposal.financialAdjustment.payer === 'PROPOSER'
                ? 'proponente paga'
                : 'destinatário paga'}
            </span>
          ) : (
            <span>Troca sem complemento financeiro</span>
          )}
        </div>
        <Button
          variant="outline"
          onClick={onView}
          icon={<Icon name="search" size={16} />}
        >
          Ver detalhes
        </Button>
      </div>
    </article>
  )
}

function SidePreview({
  title,
  items,
  accent,
}: {
  title: string
  items: TradeProposalCardItem[]
  accent: 'blue' | 'purple'
}) {
  const total = items.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <section
      className={`min-w-0 rounded-xl border p-3 ${accent === 'blue' ? 'border-secondary-100 bg-secondary-100/30' : 'border-primary-100 bg-primary-100/30'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-brand-primary">{title}</h3>
        <span className="text-xs text-text-secondary">
          {total} {total === 1 ? 'exemplar' : 'exemplares'}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {items.slice(0, 2).map((item, index) => (
          <li
            key={`${item.cardId}-${index}`}
            className="flex min-w-0 items-center gap-2 text-xs text-text-primary"
          >
            <MiniCardArt item={item} />
            <span className="shrink-0 font-semibold text-brand-primary">
              {item.quantity}×
            </span>
            <span className="min-w-0 truncate" title={item.name}>
              {item.name}
            </span>
          </li>
        ))}
      </ul>
      {items.length > 2 && (
        <p className="mt-1 text-xs text-text-secondary">
          +{items.length - 2}{' '}
          {items.length - 2 === 1 ? 'outra carta' : 'outras cartas'}
        </p>
      )}
    </section>
  )
}

function MiniCardArt({ item }: { item: TradeProposalCardItem }) {
  const [failed, setFailed] = useState(false)
  if (item.imageUrl && !failed) {
    return (
      <img
        src={item.imageUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-11 w-8 shrink-0 rounded-sm object-contain"
      />
    )
  }
  return (
    <span
      role="img"
      aria-label={`Imagem indisponível de ${item.name}`}
      className="grid h-11 w-8 shrink-0 place-items-center rounded-sm bg-surface-input text-text-secondary"
    >
      <Icon name="gem" size={16} />
    </span>
  )
}

function ProposalsEmpty({
  search,
  onClear,
}: {
  search: TradeProposalsSearch
  onClear: () => void
}) {
  return (
    <div
      role="status"
      className="flex min-h-72 flex-col items-center justify-center px-4 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className="mb-4 rounded-full bg-primary-100 p-5 text-brand-primary"
      >
        <Icon name="sparkle" size={32} />
      </span>
      <h2 className="font-display text-lg font-bold text-text-ink">
        {search.status
          ? 'Nenhuma proposta com este status'
          : search.direction === 'RECEIVED'
            ? 'Você ainda não recebeu propostas'
            : 'Você ainda não enviou propostas'}
      </h2>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {search.status
          ? 'Experimente mostrar todos os status para consultar suas negociações.'
          : search.direction === 'RECEIVED'
            ? 'Quando alguém oferecer cartas em troca das suas, as propostas aparecerão aqui.'
            : 'Encontre um anúncio que aceite troca e envie sua primeira proposta.'}
      </p>
      <div className="mt-5">
        {search.status ? (
          <Button variant="outline" onClick={onClear}>
            Limpar filtro
          </Button>
        ) : (
          <Link
            to="/marketplace"
            search={{ sort: 'recent' }}
            className="inline-flex min-h-11 items-center rounded-control bg-brand-primary button-vignette px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
          >
            Explorar anúncios
          </Link>
        )}
      </div>
    </div>
  )
}

function ProposalPager({
  data,
  onPage,
}: {
  data: TradeProposalsPage
  onPage: (page: number) => void
}) {
  const first = data.number * data.size + 1
  const last = first + data.content.length - 1
  return (
    <div
      className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-4"
    >
      <p className="text-sm text-text-secondary">
        Exibindo {first}–{last} de {data.totalElements}
      </p>
      <PageNavigation label="Paginação de propostas" page={data.number + 1} totalPages={data.totalPages} onPageChange={(page) => onPage(page - 1)} />
    </div>
  )
}

function ProposalsSkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Carregando suas propostas...</span>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-border-default p-4"
          >
            <div className="h-5 w-32 rounded bg-primary-100" />
            <div className="h-4 w-64 max-w-full rounded bg-neutral-200" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-20 rounded-lg bg-neutral-100" />
              <div className="h-20 rounded-lg bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
