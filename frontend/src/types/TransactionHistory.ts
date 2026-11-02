import type { CardCondition, CardLanguage } from '@/types/Collection'

/** Relativo a quem consulta: a mesma venda é compra para um e venda para o outro. */
export type TransactionHistoryType = 'PURCHASE' | 'SALE'

export type TransactionHistoryStatus = 'COMPLETED'

export interface TransactionHistoryItem {
  cardId: string
  name: string
  game: string
  edition: string | null
  cardNumber: string | null
  imageUrl: string | null
  condition: CardCondition
  language: CardLanguage
  quantity: number
  unitPrice: number | null
}

export interface TransactionHistoryEntry {
  id: string
  type: TransactionHistoryType
  status: TransactionHistoryStatus
  completedAt: string
  /** Nulo quando a conta do outro participante não existe mais. */
  counterparty: { username: string | null; name: string } | null
  items: TransactionHistoryItem[]
  totalQuantity: number
  totalAmount: number
}

export interface TransactionHistoryPage {
  content: TransactionHistoryEntry[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface TransactionHistorySearch {
  type?: TransactionHistoryType
  /** Começa em 1 na URL; a API começa em 0. */
  page?: number
}
