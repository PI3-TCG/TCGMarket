import { useRemoteData } from '@/hooks/useRemoteData'
import { getTransactionReviews } from '@/services/reviews'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TransactionReviewSection } from './TransactionReviewSection'

export function TransactionReviewButton({
  transactionId,
  counterpartyName,
  label,
}: {
  transactionId: string
  counterpartyName: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fetchReviews = useCallback(
    () => getTransactionReviews(transactionId),
    [transactionId],
  )
  const { state } = useRemoteData(
    `review-button:${transactionId}`,
    fetchReviews,
  )
  const [sent, setSent] = useState(false)
  const reviewed =
    sent || (state.status === 'ready' && Boolean(state.data.given))
  const close = () => {
    if (!submitting) setOpen(false)
  }

  return (
    <>
      <Button
        variant="secondary"
        aria-haspopup="dialog"
        disabled={reviewed || state.status === 'loading'}
        onClick={() => setOpen(true)}
      >
        {reviewed ? 'Avaliado' : label}
      </Button>
      {open && (
        <Modal
          open
          title={label}
          subtitle="Escolha de 1 a 5 estrelas. O comentário é opcional."
          headerIcon="star"
          size="md"
          onClose={close}
          closeDisabled={submitting}
          busy={submitting}
          secondaryAction={{ label: 'Fechar' }}
        >
          <TransactionReviewSection
            transactionId={transactionId}
            counterpartyName={counterpartyName}
            onReviewed={() => setSent(true)}
            onSubmittingChange={setSubmitting}
            compact
          />
        </Modal>
      )}
    </>
  )
}
