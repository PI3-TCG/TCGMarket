import type {
  CardCondition,
  CardLanguage,
  CollectionCard,
  CollectionItemAvailability,
} from './Collection'

/**
 * PENDING (aguardando pagamento) ainda não é produzido pelo backend; ele chega
 * com o fluxo de compra. A interface já sabe exibi-lo.
 */
export type AdStatus = 'ACTIVE' | 'PENDING' | 'SOLD_OUT' | 'CANCELLED'

export type AdModality = 'SALE' | 'TRADE' | 'BOTH'

export interface CreateAdRequest {
  collectionItemId: string
  quantity: number
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
  description?: string | null
}

export interface AdResponse {
  id: string
  collectionItemId: string
  status: AdStatus
  quantity: number
  remainingQuantity: number
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
  description: string | null
  createdAt: string
  availability: CollectionItemAvailability
}
