import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  modalDangerButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'

type Props = {
  title: string
  description: string
  confirmLabel: string
  onContinue: () => void
  onConfirm: () => void
}

export function DiscardChangesDialog({
  title,
  description,
  confirmLabel,
  onContinue,
  onConfirm,
}: Props) {
  return (
    <Modal
      open
      presentation="refined"
      size="sm"
      role="alertdialog"
      title={title}
      subtitle={description}
      headerIcon="alert"
      onClose={onContinue}
      footer={
        <>
          <Button
            variant="outline"
            className={modalSecondaryButton}
            onClick={onContinue}
            data-autofocus
          >
            Continuar preenchendo
          </Button>
          <Button
            variant="danger"
            className={modalDangerButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="rounded-control border border-error-200 bg-error-50 p-4 font-semibold text-error-700">
        Alterações não salvas
      </p>
    </Modal>
  )
}
