/** Contrato de leitura da issue #84. Independente do DTO de criacao (#83). */
export type TradeProposalDirection = 'SENT' | 'RECEIVED'
export type TradeProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
export type TradeProposalActor = 'PROPOSER' | 'RECIPIENT'

export type TradeProposalParticipant = {
  id: string
  username: string | null
  name: string | null
}

export type TradeProposalCardItem = {
  cardId: string
  name: string
  game: string
  edition: string | null
  cardNumber: string | null
  imageUrl: string | null
  condition: string
  language: string
  quantity: number
}

export type TradeProposalEvent = {
  eventType: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  fromStatus: TradeProposalStatus | null
  toStatus: TradeProposalStatus
  actor: TradeProposalActor | null
  occurredAt: string
}

export type TradeProposalView = {
  id: string
  adId: string
  direction: TradeProposalDirection
  status: TradeProposalStatus
  createdAt: string
  updatedAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
  completedAt: string | null
  proposer: TradeProposalParticipant
  recipient: TradeProposalParticipant
  offeredItems: TradeProposalCardItem[]
  requestedItems: TradeProposalCardItem[]
  financialAdjustment: {
    amount: number
    currency: string
    payer: TradeProposalActor
  } | null
  events: TradeProposalEvent[]
}

/** Paginacao padrao org.springframework.data.domain.Page, pagina zero-based. */
export type TradeProposalsPage = {
  content: TradeProposalView[]
  number: number
  size: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export type TradeProposalsSearch = {
  direction: TradeProposalDirection
  status?: TradeProposalStatus
  /** Pagina na URL: 1-based, diferente da API. */
  page?: number
}
