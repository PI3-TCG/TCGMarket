import type { CardGame } from './Catalog'
import type { CardCondition, CardLanguage } from './Collection'

export interface MarketplaceAd {
  id: string
  cardId: string
  cardName: string
  game: CardGame
  edition: string
  cardNumber: string | null
  rarity: string | null
  imageUrl: string | null
  condition: CardCondition
  language: CardLanguage
  remainingQuantity: number
  saleEnabled: boolean
  tradeEnabled: boolean
  unitPrice: number | null
  sellerUsername: string | null
  description: string | null
}

export interface MarketplacePageResponse {
  content: MarketplaceAd[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type MarketplaceSort = 'recent' | 'priceDesc'

export type MarketplaceModality = '' | 'SALE' | 'TRADE' | 'BOTH'

export interface MarketplaceFilters {
  search: string
  game: '' | MarketplaceAd['game']
  modality: MarketplaceModality
}