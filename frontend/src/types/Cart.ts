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
