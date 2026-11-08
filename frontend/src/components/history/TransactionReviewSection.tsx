import { useCallback, useId, useState, type FormEvent } from 'react'
import { formatHistoryDate } from '@/components/history/historyFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
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
}: {
  transactionId: string
  counterpartyName: string
}) {
  const titleId = useId()
  const fetchReviews = useCallback(
    () => getTransactionReviews(transactionId),
    [transactionId],
  )
  const { state, retry } = useRemoteData(`reviews:${transactionId}`, fetchReviews)
  const [created, setCreated] = useState<TransactionReviews | null>(null)
  const reviews = created ?? (state.status === 'ready' ? state.data : null)

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-neutral-200 bg-white p-4"
    >
      <h2 id={titleId} className="mb-4 font-display text-xl font-bold text-primary-900">
        Avaliação da negociação
      </h2>

      {state.status === 'loading' && (
        <div role="status" aria-busy="true" className="h-32 rounded-lg bg-neutral-100 motion-safe:animate-pulse">
          <span className="sr-only">Carregando avaliações...</span>
        </div>
      )}

      {(state.status === 'error' || state.status === 'notFound') && (
        <Alert variant="error" title="Não foi possível carregar as avaliações.">
          <button
            type="button"
            onClick={retry}
            className="font-semibold underline underline-offset-2"
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
          ) : (
            <ReviewForm
              transactionId={transactionId}
              counterpartyName={counterpartyName}
              onCreated={setCreated}
              onDuplicate={retry}
            />
          )}

          <div className="border-t border-neutral-200 pt-4">
            {reviews.received ? (
              <ReviewCard
                title={`Avaliação recebida de ${counterpartyName}`}
                review={reviews.received}
              />
            ) : (
              <p className="text-sm text-neutral-700">
                {counterpartyName} ainda não avaliou esta negociação.
              </p>
            )}
          </div>
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
}: {
  transactionId: string
  counterpartyName: string
  onCreated: (reviews: TransactionReviews) => void
  onDuplicate: () => void
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
    setSubmitting(true)
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
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset aria-describedby={gradeMissing ? gradeErrorId : undefined}>
        <legend className="mb-2 text-sm font-semibold text-neutral-900">
          Como foi negociar com {counterpartyName}?
        </legend>
        <div className="flex items-center gap-1">
          {GRADES.map((value) => {
            const active = grade !== null && value <= grade
            return (
              <label
                key={value}
                className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary-500"
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
                  className={active ? 'text-rare-500' : 'text-neutral-300'}
                />
                <span className="sr-only">
                  {value} de 5 — {gradeLabels[value]}
                </span>
              </label>
            )
          })}
          {grade !== null && (
            <span className="ml-2 text-sm font-medium text-neutral-700">
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
        <label htmlFor={commentId} className="mb-1 block text-sm font-semibold text-neutral-900">
          Comentário <span className="font-normal text-neutral-500">(opcional)</span>
        </label>
        <textarea
          id={commentId}
          rows={3}
          value={comment}
          maxLength={REVIEW_COMMENT_MAX}
          aria-describedby={`${commentId}-count`}
          onChange={(event) => setComment(event.target.value)}
          className="w-full resize-y rounded-control border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-secondary-500"
          placeholder="Conte como foi a negociação."
        />
        <p id={`${commentId}-count`} className="mt-1 text-right text-xs text-neutral-500">
          {comment.length}/{REVIEW_COMMENT_MAX}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar avaliação'}
      </Button>
    </form>
  )
}

function ReviewCard({ title, review }: { title: string; review: TransactionReview }) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
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
              className={cn(value <= review.grade ? 'text-rare-500' : 'text-neutral-300')}
            />
          ))}
        </span>
        <time dateTime={review.reviewDate} className="text-xs text-neutral-500">
          {formatHistoryDate(review.reviewDate)}
        </time>
      </div>
      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{review.comment}</p>
      )}
    </div>
  )
}
