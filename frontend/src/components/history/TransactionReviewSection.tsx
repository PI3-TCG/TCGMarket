import { useCallback, useId, useState, type FormEvent } from 'react'
import { formatHistoryDate } from '@/components/history/historyFormat'
import { Alert } from '@/components/ui/Alert'
import { modalPrimaryButton, modalSecondaryButton } from '@/components/ui/modalTheme'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  createTransactionReview,
  getTransactionReviews,
  reviewFailure,
} from '@/services/reviews'
import {
  REVIEW_COMMENT_MAX,
  type TransactionReview,
  type TransactionReviews,
} from '@/types/Review'

const GRADES = [1, 2, 3, 4, 5] as const

const gradeLabels: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Boa',
  5: 'Excelente',
}

export function TransactionReviewSection({
  transactionId,
  counterpartyName,
  onSubmittingChange,
  compact = false,
  canReview = true,
  canReceiveReview = true,
  onReviewed,
}: {
  transactionId: string
  counterpartyName: string
  onSubmittingChange?: (submitting: boolean) => void
  compact?: boolean
  canReview?: boolean
  canReceiveReview?: boolean
  onReviewed?: () => void
}) {
  const titleId = useId()
  const fetchReviews = useCallback(
    () => getTransactionReviews(transactionId),
    [transactionId],
  )
  const { state, retry } = useRemoteData(
    `reviews:${transactionId}`,
    fetchReviews,
  )
  const [created, setCreated] = useState<TransactionReviews | null>(null)
  const reviews = created ?? (state.status === 'ready' ? state.data : null)

  return (
    <section
      aria-labelledby={titleId}
      className={
        compact
          ? undefined
          : 'rounded-surface border border-border-default bg-surface-input p-4'
      }
    >
      <h2
        id={titleId}
        className={
          compact
            ? 'sr-only'
            : 'mb-4 font-title text-xl font-bold text-text-ink'
        }
      >
        Avaliação da negociação
      </h2>

      {state.status === 'loading' && (
        <div
          role="status"
          aria-busy="true"
          className="h-32 rounded-control bg-surface-subtle motion-safe:animate-pulse"
        >
          <span className="sr-only">Carregando avaliações...</span>
        </div>
      )}

      {(state.status === 'error' || state.status === 'notFound') && (
        <Alert variant="error" title="Não foi possível carregar as avaliações.">
          <button
            type="button"
            onClick={retry}
            className={modalSecondaryButton}
          >
            Tentar novamente
          </button>
        </Alert>
      )}

      {state.status === 'ready' && reviews && (
        <div className="space-y-6">
          {reviews.given ? (
            <ReviewCard
              title={`Sua avaliação de ${counterpartyName}`}
              review={reviews.given}
            />
          ) : canReview ? (
            <ReviewForm
              transactionId={transactionId}
              counterpartyName={counterpartyName}
              onCreated={(reviews) => {
                setCreated(reviews)
                if (reviews.given) onReviewed?.()
              }}
              onDuplicate={retry}
              onSubmittingChange={onSubmittingChange}
            />
          ) : null}

          {!compact && (canReceiveReview || reviews.received) && (
            <div className="border-t border-border-default pt-4">
              {reviews.received ? (
                <ReviewCard
                  title={`Avaliação recebida de ${counterpartyName}`}
                  review={reviews.received}
                />
              ) : (
                <p className="text-sm text-text-secondary">
                  {counterpartyName} ainda não avaliou esta negociação.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ReviewForm({
  transactionId,
  counterpartyName,
  onCreated,
  onDuplicate,
  onSubmittingChange,
}: {
  transactionId: string
  counterpartyName: string
  onCreated: (reviews: TransactionReviews) => void
  onDuplicate: () => void
  onSubmittingChange?: (submitting: boolean) => void
}) {
  const commentId = useId()
  const gradeErrorId = useId()
  const [grade, setGrade] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [gradeMissing, setGradeMissing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (grade === null) {
      setGradeMissing(true)
      return
    }
    if (submitting) return
    setSubmitting(true)
    onSubmittingChange?.(true)
    setError(null)
    try {
      const trimmed = comment.trim()
      onCreated(
        await createTransactionReview(transactionId, {
          grade,
          comment: trimmed === '' ? null : trimmed,
        }),
      )
    } catch (cause) {
      const failure = reviewFailure(cause)
      if (failure.kind === 'duplicate') {
        onDuplicate()
        return
      }
      setError(
        failure.kind === 'rejected' && failure.message
          ? failure.message
          : 'Não foi possível enviar a avaliação. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset aria-describedby={gradeMissing ? gradeErrorId : undefined}>
        <legend className="mb-2 text-sm font-semibold text-text-ink">
          Como foi negociar com {counterpartyName}?
        </legend>
        <div className="flex items-center gap-1">
          {GRADES.map((value) => {
            const active = grade !== null && value <= grade
            return (
              <label
                key={value}
                className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-support-blue"
              >
                <input
                  type="radio"
                  name="grade"
                  value={value}
                  checked={grade === value}
                  onChange={() => {
                    setGrade(value)
                    setGradeMissing(false)
                  }}
                  className="sr-only"
                />
                <Icon
                  name="star"
                  size={32}
                  filled={active}
                  className={active ? 'text-accent-gold-deep' : 'text-border-emphasis'}
                />
                <span className="sr-only">
                  {value} de 5 — {gradeLabels[value]}
                </span>
              </label>
            )
          })}
          {grade !== null && (
            <span className="ml-2 text-sm font-medium text-text-secondary">
              {gradeLabels[grade]}
            </span>
          )}
        </div>
        {gradeMissing && (
          <p id={gradeErrorId} className="mt-1 text-sm text-error-700">
            Selecione uma nota de 1 a 5.
          </p>
        )}
      </fieldset>

      <div>
        <label
          htmlFor={commentId}
          className="mb-1 block text-sm font-semibold text-text-ink"
        >
          Comentário{' '}
          <span className="font-normal text-text-secondary">(opcional)</span>
        </label>
        <textarea
          id={commentId}
          rows={3}
          value={comment}
          maxLength={REVIEW_COMMENT_MAX}
          aria-describedby={`${commentId}-count`}
          onChange={(event) => setComment(event.target.value)}
          className="w-full resize-y rounded-control border border-border-default bg-surface-input px-3 py-2 text-sm text-text-ink outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-support-blue"
          placeholder="Conte como foi a negociação."
        />
        <p
          id={`${commentId}-count`}
          className="mt-1 text-right text-xs text-text-secondary"
        >
          {comment.length}/{REVIEW_COMMENT_MAX}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <button type="submit" className={modalPrimaryButton} disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  )
}

function ReviewCard({
  title,
  review,
}: {
  title: string
  review: TransactionReview
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-text-ink">{title}</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          role="img"
          aria-label={`Nota ${review.grade} de 5`}
          className="flex items-center gap-0.5"
        >
          {GRADES.map((value) => (
            <Icon
              key={value}
              name="star"
              size={20}
              filled={value <= review.grade}
              className={cn(
                value <= review.grade ? 'text-accent-gold-deep' : 'text-border-emphasis',
              )}
            />
          ))}
        </span>
        <time dateTime={review.reviewDate} className="text-xs text-text-secondary">
          {formatHistoryDate(review.reviewDate)}
        </time>
      </div>
      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">
          {review.comment}
        </p>
      )}
    </div>
  )
}
