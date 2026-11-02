export type TradeFinancialPayer = 'PROPOSER' | 'RECIPIENT'

export interface OfferedTradeItemRequest {
  collectionItemId: string
  quantity: number
}

export interface CreateTradeProposalRequest {
  adId: string
  requestedQuantity: number
  offeredItems: OfferedTradeItemRequest[]
  financialAdjustment: { amount: number; payer: TradeFinancialPayer } | null
  /** Chave estável em reenvios, nova quando os termos mudarem. */
  requestKey: string
}

export interface TradeProposalResponse {
  id: string
  status: 'PENDING'
  createdAt: string
  adId: string
  proposerId: string
  recipientId: string
}
