import { useEffect, useState } from 'react'
import axios from 'axios'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { getTradeProposalDetails } from '@/services/tradeProposalRead'
import type { TradeProposalCardItem, TradeProposalView } from '@/types/TradeProposalView'
import {
  conditionName,
  gameName,
  languageName,
  participantName,
  proposalDate,
  proposalMoney,
  proposalPerspective,
  statusPresentation,
} from './proposalViewFormat'

type Result =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error' }
  | { kind: 'ready'; data: TradeProposalView }

const surface = 'rounded-xl border border-neutral-200 bg-white p-4 shadow-sm'

export function TradeProposalDetailsModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<({ key: string } & Exclude<Result, { kind: 'loading' }>) | null>(null)
  const key = `${id}:${attempt}`
  const current: Result = settled?.key === key ? settled : { kind: 'loading' }

  useEffect(() => {
    const abort = new AbortController()
    getTradeProposalDetails(id, abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) setSettled({ key, kind: 'ready', data })
      })
      .catch((error: unknown) => {
        if (abort.signal.aborted) return
        setSettled({
          key,
          kind: axios.isAxiosError(error) && error.response?.status === 404 ? 'notFound' : 'error',
        })
      })
    return () => abort.abort()
  }, [id, attempt, key])

  return (
    <Modal
      open
      presentation="refined"
      size="lg"
      title="Detalhes da proposta"
      subtitle="Confira os termos registrados na negociação."
      onClose={onClose}
      footer={<Button onClick={onClose}>Fechar detalhes</Button>}
    >
      <div aria-busy={current.kind === 'loading'} aria-live="polite">
        {current.kind === 'loading' && <DetailsSkeleton />}
        {current.kind === 'notFound' && (
          <Alert variant="warning" title="Proposta não encontrada">
            Esta proposta não está disponível para sua conta.
          </Alert>
        )}
        {current.kind === 'error' && (
          <div className="space-y-4">
            <Alert variant="error" title="Não foi possível carregar a proposta">
              Verifique sua conexão e tente novamente. Nenhum dado foi alterado.
            </Alert>
            <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>
              Tentar novamente
            </Button>
          </div>
        )}
        {current.kind === 'ready' && <ProposalDetails data={current.data} />}
      </div>
    </Modal>
  )
}

function ProposalDetails({ data }: { data: TradeProposalView }) {
  const { receive, deliver } = proposalPerspective(data)
  const status = statusPresentation[data.status]
  const ownRole = data.direction === 'RECEIVED' ? 'destinatário' : 'proponente'
  const payer = data.financialAdjustment?.payer === 'PROPOSER' ? data.proposer : data.recipient

  return (
    <div className="space-y-5">
      <section className={`${surface} space-y-3`} aria-label="Identificação e status da proposta">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Proposta de troca</p>
            <p className="mt-1 break-all font-mono text-xs text-neutral-700 sm:text-sm">{data.id}</p>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
            <span aria-hidden="true">●</span>{status.label}
          </span>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-neutral-200 pt-3 sm:grid-cols-2">
          <DetailValue label="Proponente" value={participantName(data.proposer)} username={data.proposer.username} />
          <DetailValue label="Destinatário" value={participantName(data.recipient)} username={data.recipient.username} />
          <DetailValue label="Enviada em" value={proposalDate(data.createdAt)} />
          <DetailValue label="Atualizada em" value={proposalDate(data.updatedAt)} />
        </div>
        <p className="text-xs text-neutral-500">Você está visualizando esta proposta como {ownRole}.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProposalItemsPanel title="Você recebe" tone="receive" items={receive} />
        <ProposalItemsPanel title="Você entrega" tone="deliver" items={deliver} />
      </div>

      {data.financialAdjustment && (
        <section className={surface} aria-label="Complemento financeiro">
          <h3 className="font-display text-lg font-bold text-primary-900">Complemento financeiro</h3>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-700">Pagador: <span className="font-semibold text-neutral-900">{participantName(payer)}</span></p>
            <p className="font-display text-xl font-bold text-primary-900">
              {proposalMoney(data.financialAdjustment.amount, data.financialAdjustment.currency)}
            </p>
          </div>
          <p className="mt-2 text-xs text-neutral-500">Valor registrado na proposta. Nenhum pagamento é processado nesta etapa.</p>
        </section>
      )}

      <section className={surface} aria-label="Datas e histórico de status">
        <h3 className="font-display text-lg font-bold text-primary-900">Histórico da proposta</h3>
        {data.events.length > 0 ? (
          <ol className="mt-3 space-y-3 border-l-2 border-primary-100 pl-4">
            {data.events.map((event, index) => (
              <li key={`${event.eventType}-${event.occurredAt}-${index}`} className="relative">
                <span aria-hidden="true" className="absolute -left-[22px] top-1 size-2.5 rounded-full bg-primary-700" />
                <p className="text-sm font-semibold text-neutral-900">
                  {event.eventType === 'CREATED' ? 'Proposta enviada' : statusPresentation[event.toStatus].label}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {proposalDate(event.occurredAt)} · {event.actor === 'PROPOSER' ? 'Proponente' : event.actor === 'RECIPIENT' ? 'Destinatário' : 'Sistema'}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Nenhum evento registrado.</p>
        )}
        <div className="mt-4 grid gap-2 border-t border-neutral-200 pt-3 text-xs text-neutral-700 sm:grid-cols-2">
          {data.acceptedAt && <p>Aceita em: {proposalDate(data.acceptedAt)}</p>}
          {data.rejectedAt && <p>Recusada em: {proposalDate(data.rejectedAt)}</p>}
          {data.cancelledAt && <p>Cancelada em: {proposalDate(data.cancelledAt)}</p>}
          {data.completedAt && <p>Concluída em: {proposalDate(data.completedAt)}</p>}
        </div>
      </section>
    </div>
  )
}

function DetailValue({ label, value, username }: { label: string; value: string; username?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-neutral-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-neutral-900">{value}</p>
      {username && !value.includes(`@${username}`) && <p className="text-xs text-neutral-500">@{username}</p>}
    </div>
  )
}

function SnapshotArt({ item }: { item: TradeProposalCardItem }) {
  const [failed, setFailed] = useState(false)
  if (item.imageUrl && !failed) {
    return <img src={item.imageUrl} alt="" loading="lazy" onError={() => setFailed(true)} className="h-24 w-[70px] shrink-0 rounded-control object-contain" />
  }
  return (
    <span aria-label={`Imagem indisponível de ${item.name}`} role="img" className="flex h-24 w-[70px] shrink-0 items-center justify-center rounded-control bg-neutral-100 text-neutral-500">
      <Icon name="gem" size={24} />
    </span>
  )
}

function ProposalItemsPanel({ title, tone, items }: { title: string; tone: 'receive' | 'deliver'; items: TradeProposalCardItem[] }) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <section className={surface} aria-label={title}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-primary-900">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone === 'receive' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-primary-900'}`}>
          {count} {count === 1 ? 'exemplar' : 'exemplares'}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.cardId}-${index}`} className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <SnapshotArt item={item} />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-bold text-neutral-900">{item.name}</p>
              <p className="mt-0.5 text-xs text-neutral-700">{gameName(item.game)}{item.edition ? ` · ${item.edition}` : ''}</p>
              <p className="mt-1 text-xs text-neutral-700">{conditionName(item.condition)} · {languageName(item.language)}</p>
              {item.cardNumber && <p className="mt-1 text-xs text-neutral-500">Nº {item.cardNumber}</p>}
              <p className="mt-2 text-sm font-bold text-primary-900">{item.quantity} {item.quantity === 1 ? 'exemplar' : 'exemplares'}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DetailsSkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Carregando detalhes da proposta...</span>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-32 rounded-xl bg-neutral-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-60 rounded-xl bg-neutral-200" />
          <div className="h-60 rounded-xl bg-neutral-200" />
        </div>
        <div className="h-28 rounded-xl bg-neutral-200" />
      </div>
    </div>
  )
}
