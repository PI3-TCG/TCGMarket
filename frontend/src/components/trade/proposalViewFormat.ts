import type { TradeProposalDirection, TradeProposalStatus, TradeProposalView, TradeProposalParticipant, TradeProposalsSearch } from '@/types/TradeProposalView'

export const TRADE_STATUSES: { value: TradeProposalStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'ACCEPTED', label: 'Aceita' },
  { value: 'REJECTED', label: 'Recusada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'COMPLETED', label: 'Concluída' },
]

export const statusPresentation: Record<TradeProposalStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'border-warning-200 bg-warning-50 text-warning-700' },
  ACCEPTED: { label: 'Aceita', className: 'border-success-200 bg-success-50 text-success-700' },
  REJECTED: { label: 'Recusada', className: 'border-error-200 bg-error-50 text-error-700' },
  CANCELLED: { label: 'Cancelada', className: 'border-neutral-200 bg-neutral-100 text-neutral-700' },
  COMPLETED: { label: 'Concluída', className: 'border-success-200 bg-success-50 text-success-700' },
}

const gameNames: Record<string, string> = {
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
}
const conditions: Record<string, string> = {
  NEAR_MINT: 'Near Mint',
  LIGHTLY_PLAYED: 'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED: 'Heavily Played',
  DAMAGED: 'Damaged',
}
const languages: Record<string, string> = {
  PORTUGUESE: 'Português', ENGLISH: 'Inglês', JAPANESE: 'Japonês',
}

export function gameName(code: string) { return gameNames[code] ?? code }
export function conditionName(code: string) { return conditions[code] ?? code }
export function languageName(code: string) { return languages[code] ?? code }

export function participantName(participant: TradeProposalParticipant) {
  return participant.name?.trim() || (participant.username ? `@${participant.username}` : 'Usuário indisponível')
}

export function proposalPerspective(proposal: TradeProposalView) {
  const received = proposal.direction === 'RECEIVED'
  return {
    receive: received ? proposal.offeredItems : proposal.requestedItems,
    deliver: received ? proposal.requestedItems : proposal.offeredItems,
    counterparty: received ? proposal.proposer : proposal.recipient,
    counterpartyRole: received ? 'Proponente' : 'Destinatário',
  }
}

const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
export function proposalDate(iso: string | null | undefined): string {
  if (!iso) return 'Não informado'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : formatter.format(date)
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export function proposalMoney(amount: number, currency: string) {
  return currency === 'BRL' ? money.format(amount) : `${amount.toLocaleString('pt-BR')} ${currency}`
}

const allowedStatus = new Set<TradeProposalStatus>(TRADE_STATUSES.map((entry) => entry.value))
export function parseTradeProposalsSearch(search: Record<string, unknown>): TradeProposalsSearch {
  const rawStatus = search.status
  const status = typeof rawStatus === 'string' && allowedStatus.has(rawStatus as TradeProposalStatus)
    ? rawStatus as TradeProposalStatus
    : undefined
  const rawPage = Number(search.page)
  return {
    direction: search.direction === 'sent' || search.direction === 'SENT' ? 'SENT' : 'RECEIVED',
    status,
    page: Number.isSafeInteger(rawPage) && rawPage > 1 ? rawPage : undefined,
  }
}

export function directionLabel(direction: TradeProposalDirection) {
  return direction === 'RECEIVED' ? 'Recebidas' : 'Enviadas'
}
