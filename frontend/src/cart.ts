import { createContext, useContext } from 'react'
import type { Cart } from '@/types/Cart'

export type CartState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; cart: Cart }
  | { status: 'error' }

export type CartValue = {
  state: CartState
  reload: () => void
  // Aplica a resposta de uma operação já confirmada pela API.
  apply: (cart: Cart) => void
}

export const CartContext = createContext<CartValue | null>(null)

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('useCart precisa estar dentro de CartProvider.')
  }
  return cart
}
