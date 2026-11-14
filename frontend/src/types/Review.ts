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
