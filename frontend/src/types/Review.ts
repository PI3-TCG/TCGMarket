export const REVIEW_COMMENT_MAX = 500

export type TransactionReview = {
  id: string
  grade: number
  comment: string | null
  reviewDate: string
}

export type TransactionReviews = {
  given: TransactionReview | null
  received: TransactionReview | null
}

export type ReviewInput = {
  grade: number
  comment: string | null
}

export interface ReputationSummary {
  average: number | null
  totalReviews: number
  countsByRating: Record<number, number>
}

export interface ProfileReputation {
  summary: ReputationSummary
  reviews: {
    id: string
    author: string
    rating: number
    comment: string | null
    createdAt: string
    transactionType: 'SALE' | 'TRADE' | null
  }[]
  hasNext: boolean
}
