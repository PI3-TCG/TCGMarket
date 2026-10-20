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

export interface OwnAd {
  id: string
  collectionItemId: string
  status: AdStatus
  quantity: number
  remainingQuantity: number
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
  condition: CardCondition
  language: CardLanguage
  card: CollectionCard
  createdAt: string
  updatedAt: string
  cancelledAt: string | null
  /** Exemplares liberados no cancelamento; só existe em anúncios cancelados. */
  releasedQuantity: number | null
}

export interface OwnAdPage {
  content: OwnAd[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface OwnAdFilterValues {
  search: string
  modality: AdModality | ''
  game: string
  status: AdStatus | ''
}

export interface UpdateAdRequest {
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
}
