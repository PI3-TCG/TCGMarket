import axios from 'axios'
import { api } from '@/services/api'
import type { Cart, CheckoutValidation, UpdateCartItemRequest } from '@/types/Cart'
import type { CheckoutOrders } from '@/types/Order'

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

export type PlaceOrderFailure =
  | { kind: 'conflict'; validation: CheckoutValidation }
  | CartFailure

export function placeOrderFailure(cause: unknown): PlaceOrderFailure {
  if (axios.isAxiosError<CheckoutValidation>(cause) && cause.response?.status === 409) {
    return { kind: 'conflict', validation: cause.response.data }
  }
  return cartFailure(cause)
}

// Reenviar a mesma chave quando a resposta se perder: o servidor devolve os
// pedidos já criados em vez de criar outros.
export async function placeOrder(addressId: string, idempotencyKey: string): Promise<CheckoutOrders> {
  const response = await api.post<CheckoutOrders>(
    '/api/users/me/checkout',
    { addressId },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  )
  return response.data
}
