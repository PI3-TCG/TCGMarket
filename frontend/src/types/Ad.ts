import type { CollectionItemAvailability } from './Collection'

export type AdStatus = 'ACTIVE' | 'CANCELLED' | 'SOLD_OUT'

export interface CreateAdRequest {
  collectionItemId: string
  quantity: number
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
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
  createdAt: string
  availability: CollectionItemAvailability
}
