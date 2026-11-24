import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { modalSecondaryButton } from './modalTheme'

/**
 * Adaptador de detalhes sobre a base Modal.
 * Não replica portal, trap de foco, Escape, backdrop ou scroll lock.
 */
type Props = {
  title: string
  eyebrow: string
  children: ReactNode
  onClose: () => void
  footerText?: string
}

export function DetailsModal({
  title,
  eyebrow,
  children,
  onClose,
  footerText,
}: Props) {
  return (
    <Modal
      open
      title={title}
      eyebrow={eyebrow}
      onClose={onClose}
      size="lg"
      className="max-w-[880px]"
      footer={
        <>
          {footerText && (
            <p className="mr-auto self-center text-xs font-medium text-text-secondary">
              {footerText}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className={modalSecondaryButton}
          >
            Fechar
          </button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
