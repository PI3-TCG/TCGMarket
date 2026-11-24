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
      size="sm"
      role="alertdialog"
      title={title}
      subtitle={description}
      headerIcon="alert"
      onClose={onContinue}
      footer={
        <>
          <button
            type="button"
            className={modalSecondaryButton}
            onClick={onContinue}
            data-autofocus
          >
            Continuar preenchendo
          </button>
          <button
            type="button"
            className={modalDangerButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="rounded-control border border-error-200 bg-error-50 p-4 font-semibold text-error-700">
        Alterações não salvas
      </p>
    </Modal>
  )
}
