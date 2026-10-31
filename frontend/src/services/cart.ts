import axios from 'axios'
import { api } from '@/services/api'
import type { Cart, CheckoutValidation, UpdateCartItemRequest } from '@/types/Cart'

// "unknown": a resposta se perdeu e a operação pode ter sido gravada.
export type CartFailure =
  | { kind: 'rejected'; message: string | null }
  | { kind: 'unknown' }

export function cartFailure(cause: unknown): CartFailure {
  if (axios.isAxiosError<{ message?: string }>(cause) && cause.response) {
    const status = cause.response.status
    return {
      kind: 'rejected',
      message: status < 500 ? (cause.response.data?.message ?? null) : null,
    }
  }
  return { kind: 'unknown' }
}

const CART_URL = '/api/users/me/cart'

function itemUrl(adId: string) {
  return `${CART_URL}/items/${encodeURIComponent(adId)}`
}

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>(CART_URL)
  return response.data
}

export async function addCartItem(adId: string, quantity: number): Promise<Cart> {
  const response = await api.post<Cart>(`${CART_URL}/items`, { adId, quantity })
  return response.data
}

export async function updateCartItem(
  adId: string,
  request: UpdateCartItemRequest,
): Promise<Cart> {
  const response = await api.patch<Cart>(itemUrl(adId), request)
  return response.data
}

export async function removeCartItem(adId: string): Promise<Cart> {
  const response = await api.delete<Cart>(itemUrl(adId))
  return response.data
}

export async function updateCartSelection(selected: boolean): Promise<Cart> {
  const response = await api.put<Cart>(`${CART_URL}/selection`, { selected })
  return response.data
}

export async function validateCheckout(): Promise<CheckoutValidation> {
  const response = await api.post<CheckoutValidation>('/api/users/me/checkout/validate')
  return response.data
}
