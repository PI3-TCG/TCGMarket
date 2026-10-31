import type { CardGame } from './Catalog'
import type { CardCondition, CardLanguage } from './Collection'

export type CartItemAvailability = 'AVAILABLE' | 'REDUCED' | 'UNAVAILABLE'

export interface CartItem {
  adId: string
  // Nulos quando o anúncio deixou de existir.
  cardId: string | null
  cardName: string | null
  game: CardGame | null
  edition: string | null
  imageUrl: string | null
  condition: CardCondition | null
  language: CardLanguage | null
  quantity: number
  selected: boolean
  acceptedUnitPrice: number
  // Nulo quando o anúncio não pode mais ser comprado.
  currentUnitPrice: number | null
  availableQuantity: number
  availability: CartItemAvailability
  priceChanged: boolean
}

export interface Cart {
  items: CartItem[]
  distinctItemCount: number
}

export interface UpdateCartItemRequest {
  quantity?: number
  selected?: boolean
  acceptCurrentPrice?: boolean
}

export type CheckoutIssueCode =
  | 'AD_NOT_FOUND'
  | 'AD_CANCELLED'
  | 'AD_SOLD_OUT'
  | 'SALE_DISABLED'
  | 'QUANTITY_UNAVAILABLE'
  | 'PRICE_CHANGED'
  | 'OWN_AD'
  | 'SELLER_CHANGED'
  | 'CARD_NOT_FOUND'

export interface CheckoutItemIssue {
  adId: string
  issues: CheckoutIssueCode[]
  requestedQuantity: number
  availableQuantity: number
  acceptedUnitPrice: number
  currentUnitPrice: number | null
}

export interface CheckoutValidation {
  valid: boolean
  emptySelection: boolean
  items: CheckoutItemIssue[]
  sellers: { sellerId: string; adIds: string[]; subtotal: number }[]
  total: number
}
