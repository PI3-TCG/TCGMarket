import { api } from '@/services/api'
import type {
  TransactionHistoryEntry,
  TransactionHistoryPage,
  TransactionHistoryType,
} from '@/types/TransactionHistory'

type TransactionHistoryQuery = {
  type?: TransactionHistoryType
  page?: number
  size?: number
  signal?: AbortSignal
}

export async function getMyTransactions({
  type,
  page = 0,
  size = 10,
  signal,
}: TransactionHistoryQuery = {}): Promise<TransactionHistoryPage> {
  const response = await api.get<TransactionHistoryPage>(
    '/api/users/me/transactions',
    { params: { type, page, size }, signal },
  )
  return response.data
}

export async function getMyTransaction(
  transactionId: string,
): Promise<TransactionHistoryEntry> {
  const response = await api.get<TransactionHistoryEntry>(
    `/api/users/me/transactions/${encodeURIComponent(transactionId)}`,
  )
  return response.data
}
