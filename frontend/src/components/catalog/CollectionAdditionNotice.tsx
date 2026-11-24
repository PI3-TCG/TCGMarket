import { Alert } from '@/components/ui/Alert'

export function CollectionAdditionNotice({
  cardName,
  onDismiss,
}: {
  cardName: string | null
  onDismiss: () => void
}) {
  return (
    <div
      className="fixed inset-x-4 top-24 z-30 mx-auto max-w-md sm:left-auto"
      aria-live="polite"
    >
      {cardName && (
        <Alert variant="success" onDismiss={onDismiss}>
          {cardName} foi adicionada à sua coleção.
        </Alert>
      )}
    </div>
  )
}
