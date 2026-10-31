import type { CardGame } from './Catalog'
import type { CardCondition, CardLanguage } from './Collection'

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'PAYMENT_FAILED'

export interface OrderItem {
  adId: string
  cardId: string
  cardName: string
  game: CardGame
  edition: string | null
  cardNumber: string | null
  imageUrl: string | null
  condition: CardCondition
  language: CardLanguage
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface DeliveryAddress {
  recipientName: string
  zipCode: string
  street: string
  number: string | null
  withoutNumber: boolean
  complement: string | null
  district: string
  city: string
  state: string
}

export interface Order {
  id: string
  sellerId: string
  // Nulo se o vendedor ainda não escolheu um nome de usuário.
  sellerUsername: string | null
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: DeliveryAddress
  createdAt: string
}

export interface CheckoutOrders {
  checkoutId: string
  orders: Order[]
  total: number
}
