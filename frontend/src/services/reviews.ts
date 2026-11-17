import axios from 'axios'
import { api } from '@/services/api'
import type { ReviewInput, TransactionReviews } from '@/types/Review'

export type ReviewFailure =
  | { kind: 'duplicate' }
  | { kind: 'rejected'; message: string | null }
  | { kind: 'unknown' }

type ApiError = { message?: string }

export function reviewFailure(cause: unknown): ReviewFailure {
  if (!axios.isAxiosError<ApiError>(cause) || !cause.response) {
    return { kind: 'unknown' }
  }
  const { status } = cause.response
  if (status === 409) return { kind: 'duplicate' }
  return {
    kind: 'rejected',
    message: status === 403 ? 'Você não tem permissão para avaliar esta transação.' : null,
  }
}

function reviewUrl(transactionId: string) {
  return `/api/users/me/transactions/${encodeURIComponent(transactionId)}/review`
}

export async function getTransactionReviews(
  transactionId: string,
): Promise<TransactionReviews> {
  const response = await api.get<TransactionReviews>(reviewUrl(transactionId))
  return response.data
}

export async function createTransactionReview(
  transactionId: string,
  input: ReviewInput,
): Promise<TransactionReviews> {
  const response = await api.post<TransactionReviews>(reviewUrl(transactionId), input)
  return response.data
}
