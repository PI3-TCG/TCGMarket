import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import axios from 'axios'
import { Alert } from '@/components/ui/Alert'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/components/ui/cn'
import { Modal } from '@/components/ui/Modal'
import {
  modalDangerButton,
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import { getTradeProposalDetails } from '@/services/tradeProposalRead'
import type {
  TradeProposalCardItem,
  TradeProposalView,
} from '@/types/TradeProposalView'
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
import {
  decideTradeProposal,
  tradeDecisionFailure,
  type TradeProposalAction,
} from '@/services/tradeProposalDecision'

type Result =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error' }
  | { kind: 'ready'; data: TradeProposalView }

const surface =
  'rounded-[18px] border border-[#DBC7E4] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBF7FD_100%)] p-4 shadow-[0_3px_12px_rgba(60,17,87,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-5'

type TradeActionButtonProps = {
  tone?: 'primary' | 'danger' | 'secondary'
  children: ReactNode
  disabled?: boolean
  onClick: () => void
  className?: string
}

function TradeActionButton({
  tone = 'secondary',
  children,
  disabled,
  onClick,
  className,
}: TradeActionButtonProps) {
  const style =
    tone === 'primary'
      ? modalPrimaryButton
      : tone === 'danger'
        ? modalDangerButton
        : modalSecondaryButton

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 whitespace-normal text-center',
        style,
        className,
      )}
    >
      {children}
    </button>
  )
}

const decisionContent: Record<
  TradeProposalAction,
  {
    title: string
    message: string
    confirmLabel: string
    successMessage: string
  }
> = {
  accept: {
    title: 'Confirmar aceite',
    message:
      'Você concorda com os termos desta proposta. A disponibilidade das cartas será verificada novamente e, em seguida, as cartas serão transferidas entre as coleções.',
    confirmLabel: 'Confirmar aceite',
    successMessage:
      'Troca concluída! As cartas já foram transferidas entre as coleções.',
  },
  reject: {
    title: 'Confirmar recusa',
    message:
      'Ao recusar, esta proposta será encerrada e não poderá ser aceita posteriormente.',
    confirmLabel: 'Recusar proposta',
    successMessage: 'Proposta recusada com sucesso.',
  },
  cancel: {
    title: 'Confirmar cancelamento',
    message:
      'Ao cancelar, esta proposta será encerrada. O destinatário não poderá mais aceitá-la.',
    confirmLabel: 'Cancelar proposta',
    successMessage: 'Proposta cancelada com sucesso.',
  },
}

export function TradeProposalDetailsModal({
  id,
  onClose,
  onDecision,
}: {
  id: string
  onClose: () => void
  onDecision?: () => void
}) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<
    ({ key: string } & Exclude<Result, { kind: 'loading' }>) | null
  >(null)
  const [confirming, setConfirming] = useState<TradeProposalAction | null>(null)
  const pendingDecision = useRef(false)
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [requiresRefresh, setRequiresRefresh] = useState(false)

  const key = `${id}:${attempt}`
  const current: Result = settled?.key === key ? settled : { kind: 'loading' }

  useEffect(() => {
    const abort = new AbortController()
    getTradeProposalDetails(id, abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) {
          setSettled({ key, kind: 'ready', data })
          setRequiresRefresh(false)
        }
      })
      .catch((error: unknown) => {
        if (abort.signal.aborted) return
        setSettled({
          key,
          kind:
            axios.isAxiosError(error) && error.response?.status === 404
              ? 'notFound'
              : 'error',
        })
      })
    return () => abort.abort()
  }, [id, attempt, key])

  function refreshDetails() {
    setConfirming(null)
    setRequiresRefresh(true)
    setAttempt((value) => value + 1)
    onDecision?.()
  }

  async function confirmDecision() {
    if (!confirming || pendingDecision.current || requiresRefresh || current.kind !== 'ready') return
    pendingDecision.current = true
    const action = confirming
    setProcessing(true)
    setFeedback(null)
    try {
      const { status } = await decideTradeProposal(id, action)
      setFeedback({
        kind: 'success',
        message:
          action === 'accept' && status === 'ACCEPTED'
            ? 'Proposta aceita. A transferência das cartas está sendo concluída e pode levar alguns minutos.'
            : decisionContent[action].successMessage,
      })
      refreshDetails()
    } catch (error: unknown) {
      const failure = tradeDecisionFailure(error)
      setFeedback({ kind: 'error', message: failure.message })
      // Não repetir a decisão automaticamente: o estado pode ter mudado.
      refreshDetails()
    } finally {
      pendingDecision.current = false
      setProcessing(false)
    }
  }

  const data = current.kind === 'ready' ? current.data : null
  const canDecide =
    data?.status === 'PENDING' && !processing && !requiresRefresh
  const availableActions: TradeProposalAction[] = !canDecide
    ? []
    : data.direction === 'RECEIVED'
      ? ['accept', 'reject']
      : ['cancel']
  const confirmation = confirming ? decisionContent[confirming] : null

  return (
    <Modal
      open
      presentation="refined"
      headerIcon={
        confirmation
          ? confirming === 'accept'
            ? 'check-circle'
            : 'alert'
          : 'arrows-right-left'
      }
      size="lg"
      className="max-w-[920px]"
      title={confirmation ? confirmation.title : 'Detalhes da proposta'}
      subtitle={
        confirmation
          ? 'Confira sua decisão antes de continuar.'
          : 'Confira os termos registrados na negociação.'
      }
      onClose={processing ? undefined : onClose}
      closeDisabled={processing}
      footer={
        confirmation ? (
          <>
            <TradeActionButton
              disabled={processing}
              onClick={() => setConfirming(null)}
            >
              Voltar aos detalhes
            </TradeActionButton>
            <TradeActionButton
              tone={confirming === 'accept' ? 'primary' : 'danger'}
              disabled={processing}
              onClick={confirmDecision}
            >
              <Icon
                name={confirming === 'accept' ? 'check' : 'alert'}
                size={16}
              />
              {processing ? 'Processando...' : confirmation.confirmLabel}
            </TradeActionButton>
          </>
        ) : (
          <>
            <TradeActionButton disabled={processing} onClick={onClose}>
              Fechar detalhes
            </TradeActionButton>

            {data?.status === 'COMPLETED' && data.transactionId && (
              <Link
                to="/perfil/historico/$transactionId"
                params={{ transactionId: data.transactionId }}
                search={{ type: 'TRADE' }}
                onClick={onClose}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 text-center',
                  modalPrimaryButton,
                )}
              >
                <Icon name="star" size={16} />
                Avaliar troca
              </Link>
            )}

            {availableActions.map((action) => (
              <TradeActionButton
                key={action}
                tone={action === 'accept' ? 'primary' : 'danger'}
                disabled={processing}
                onClick={() => {
                  setFeedback(null)
                  setConfirming(action)
                }}
              >
                <Icon
                  name={action === 'accept' ? 'check' : 'close-circle'}
                  size={16}
                />
                {action === 'accept'
                  ? 'Aceitar'
                  : action === 'reject'
                    ? 'Recusar'
                    : 'Cancelar'}
              </TradeActionButton>
            ))}
          </>
        )
      }
    >
      <div
        aria-busy={processing || current.kind === 'loading'}
        aria-live="polite"
        className="space-y-4"
      >
        {feedback && (
          <Alert
            variant={feedback.kind === 'success' ? 'success' : 'error'}
            title={
              feedback.kind === 'success'
                ? 'Operação concluída'
                : 'Não foi possível confirmar a decisão'
            }
          >
            {feedback.message}
          </Alert>
        )}
        {current.kind === 'loading' && <DetailsSkeleton />}
        {current.kind === 'notFound' && (
          <Alert variant="warning" title="Proposta não encontrada">
            Esta proposta não está disponível para sua conta.
          </Alert>
        )}
        {current.kind === 'error' && (
          <div className="space-y-4">
            <Alert
              variant="error"
              title="Não foi possível atualizar a proposta"
            >
              Verifique sua conexão antes de realizar outra ação.
            </Alert>
            <TradeActionButton onClick={() => setAttempt((value) => value + 1)}>
              Tentar novamente
            </TradeActionButton>
          </div>
        )}
        {data && confirmation && (
          <section className="space-y-4">
            <div
              className={
                confirming === 'accept'
                  ? 'flex items-start gap-3 rounded-[16px] border border-[#C7DAF9] bg-[linear-gradient(135deg,#F0F7FF_0%,#E7F0FF_100%)] p-4 text-[#164C89]'
                  : 'flex items-start gap-3 rounded-[16px] border border-[#F2C7CC] bg-[linear-gradient(135deg,#FFF7F7_0%,#FFF0F2_100%)] p-4 text-[#8A2030]'
              }
            >
              <Icon
                name={confirming === 'accept' ? 'info' : 'alert'}
                size={24}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold">{confirmation.title}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {confirmation.message}
                </p>
              </div>
            </div>
            <ProposalDetails data={data} />
            {processing && (
              <p role="status" className="text-sm font-semibold text-[#660366]">
                Processando sua decisão. Não feche esta janela.
              </p>
            )}
          </section>
        )}
        {data && !confirmation && <ProposalDetails data={data} />}
      </div>
    </Modal>
  )
}

function ProposalDetails({ data }: { data: TradeProposalView }) {
  const { receive, deliver } = proposalPerspective(data)
  const status = statusPresentation[data.status]
  const ownRole = data.direction === 'RECEIVED' ? 'destinatário' : 'proponente'
  const payer =
    data.financialAdjustment?.payer === 'PROPOSER'
      ? data.proposer
      : data.recipient

  return (
    <div className="space-y-4 sm:space-y-5 text-[#484B5A]">
      <section
        className={`${surface} space-y-4`}
        aria-label="Identificação e status da proposta"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm font-bold uppercase tracking-[0.08em] text-[#7A2E8F]">
              Proposta de troca
            </p>
            <p className="mt-1 break-all font-mono text-xs text-[#676276]">
              {data.id}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${status.className}`}
          >
            <span aria-hidden="true">●</span>
            {status.label}
          </span>
        </div>
        <div className="grid gap-x-6 gap-y-4 border-t border-[#E8DAED] pt-4 sm:grid-cols-2">
          <DetailValue
            label="Proponente"
            value={participantName(data.proposer)}
            username={data.proposer.username}
          />
          <DetailValue
            label="Destinatário"
            value={participantName(data.recipient)}
            username={data.recipient.username}
          />
          <DetailValue
            label="Enviada em"
            value={proposalDate(data.createdAt)}
          />
          <DetailValue
            label="Atualizada em"
            value={proposalDate(data.updatedAt)}
          />
        </div>
        <p className="rounded-lg bg-[#F4ECF8] px-3 py-2 text-xs font-medium text-[#702D80]">
          Você está visualizando esta proposta como {ownRole}.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProposalItemsPanel
          title="Você recebe"
          tone="receive"
          items={receive}
        />
        <ProposalItemsPanel
          title="Você entrega"
          tone="deliver"
          items={deliver}
        />
      </div>

      {data.financialAdjustment && (
        <section className={surface} aria-label="Complemento financeiro">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[17px] font-bold text-[#702D80]">
                Complemento financeiro
              </h3>
              <p className="mt-2 text-sm text-[#484B5A]">
                Pagador:{' '}
                <span className="font-semibold text-[#302B40]">
                  {participantName(payer)}
                </span>
              </p>
            </div>
            <p className="rounded-xl border border-[#E0CEE8] bg-[#F5EBF9] px-4 py-2 font-display text-xl font-bold text-[#660366]">
              {proposalMoney(
                data.financialAdjustment.amount,
                data.financialAdjustment.currency,
              )}
            </p>
          </div>
          <p className="mt-3 text-xs text-[#676276]">
            Valor registrado na proposta. Nenhum pagamento é processado nesta
            etapa.
          </p>
        </section>
      )}

      <section className={surface} aria-label="Datas e histórico de status">
        <div className="flex items-center gap-2">
          <Icon name="clock" size={20} className="text-[#7A2E8F]" />
          <h3 className="font-display text-[17px] font-bold text-[#702D80]">
            Histórico da proposta
          </h3>
        </div>
        {data.events.length > 0 ? (
          <ol className="mt-4 space-y-4 border-l-2 border-[#D3AFE1] pl-4">
            {data.events.map((event, index) => (
              <li
                key={`${event.eventType}-${event.occurredAt}-${index}`}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[22px] top-1 size-2.5 rounded-full border-2 border-white bg-[#A65CB4] shadow-[0_0_0_1px_#BD8FCE]"
                />
                <p className="text-sm font-semibold text-[#302B40]">
                  {event.eventType === 'CREATED'
                    ? 'Proposta enviada'
                    : statusPresentation[event.toStatus].label}
                </p>
                <p className="mt-0.5 text-xs text-[#676276]">
                  {proposalDate(event.occurredAt)} ·{' '}
                  {event.actor === 'PROPOSER'
                    ? 'Proponente'
                    : event.actor === 'RECIPIENT'
                      ? 'Destinatário'
                      : 'Sistema'}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[#676276]">
            Nenhum evento registrado.
          </p>
        )}
        <div className="mt-4 grid gap-2 border-t border-[#E8DAED] pt-3 text-xs text-[#484B5A] sm:grid-cols-2">
          {data.acceptedAt && <p>Aceita em: {proposalDate(data.acceptedAt)}</p>}
          {data.rejectedAt && (
            <p>Recusada em: {proposalDate(data.rejectedAt)}</p>
          )}
          {data.cancelledAt && (
            <p>Cancelada em: {proposalDate(data.cancelledAt)}</p>
          )}
          {data.completedAt && (
            <p>Concluída em: {proposalDate(data.completedAt)}</p>
          )}
        </div>
      </section>
    </div>
  )
}

function DetailValue({
  label,
  value,
  username,
}: {
  label: string
  value: string
  username?: string | null
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#72547E]">{label}</p>
      <p className="mt-0.5 break-words text-sm font-bold text-[#302B40]">
        {value}
      </p>
      {username && !value.includes(`@${username}`) && (
        <p className="text-xs text-[#676276]">@{username}</p>
      )}
    </div>
  )
}

function SnapshotArt({ item }: { item: TradeProposalCardItem }) {
  const [failed, setFailed] = useState(false)
  if (item.imageUrl && !failed) {
    return (
      <img
        src={item.imageUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-24 w-[70px] shrink-0 rounded-[9px] border border-[#E3D5E9] bg-[#F9F5FC] object-contain shadow-[0_3px_10px_rgba(35,9,48,0.13)]"
      />
    )
  }
  return (
    <span
      aria-label={`Imagem indisponível de ${item.name}`}
      role="img"
      className="flex h-24 w-[70px] shrink-0 items-center justify-center rounded-[9px] border border-[#E3D5E9] bg-[#F6F0F9] text-[#72547E]"
    >
      <Icon name="gem" size={24} />
    </span>
  )
}

function ProposalItemsPanel({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'receive' | 'deliver'
  items: TradeProposalCardItem[]
}) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <section className={`${surface} min-w-0`} aria-label={title}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E9DCEC] pb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={
              tone === 'receive'
                ? 'flex size-8 items-center justify-center rounded-lg border border-[#BFD8FA] bg-[#E7F2FF] text-[#1465B7]'
                : 'flex size-8 items-center justify-center rounded-lg border border-[#E0C8E8] bg-[#F2E7F8] text-[#702D80]'
            }
          >
            <Icon
              name={tone === 'receive' ? 'check-circle' : 'arrows-right-left'}
              size={20}
            />
          </span>
          <h3 className="font-display text-[17px] font-bold text-[#702D80]">
            {title}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${tone === 'receive' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-[#660366]'}`}
        >
          {count} {count === 1 ? 'exemplar' : 'exemplares'}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item.cardId}-${index}`}
            className="flex min-w-0 gap-3 rounded-[13px] border border-[#E6D8EC] bg-[linear-gradient(145deg,#FFFFFF_0%,#F8F3FB_100%)] p-3 shadow-[0_2px_9px_rgba(70,25,88,0.04)]"
          >
            <SnapshotArt item={item} />
            <div className="min-w-0 flex-1">
              <p className="font-display break-words text-[15px] font-bold text-[#660366]">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-[#484B5A]">
                {gameName(item.game)}
                {item.edition ? ` · ${item.edition}` : ''}
              </p>
              <p className="mt-1 text-xs text-[#484B5A]">
                {conditionName(item.condition)} · {languageName(item.language)}
              </p>
              {item.cardNumber && (
                <p className="mt-1 text-xs text-[#676276]">
                  Nº {item.cardNumber}
                </p>
              )}
              <p className="mt-2 inline-flex rounded-full bg-[#EFE0F5] px-2.5 py-1 text-xs font-bold text-[#702D80]">
                {item.quantity}{' '}
                {item.quantity === 1 ? 'exemplar' : 'exemplares'}
              </p>
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
        <div className="h-32 rounded-[18px] bg-[#EDE3F2]" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-60 rounded-[18px] bg-[#EDE3F2]" />
          <div className="h-60 rounded-[18px] bg-[#EDE3F2]" />
        </div>
        <div className="h-28 rounded-[18px] bg-[#EDE3F2]" />
      </div>
    </div>
  )
}
