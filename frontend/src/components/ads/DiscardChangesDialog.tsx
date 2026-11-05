import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import {
  ModalHeaderOrnaments,
  modalCloseButton,
  modalFooter,
  modalFrame,
  modalHeader,
  modalHeadingIcon,
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
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onContinueRef = useRef(onContinue)

  useEffect(() => {
    onContinueRef.current = onContinue
  }, [onContinue])

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current
      ?.querySelector<HTMLElement>('[data-autofocus]')
      ?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onContinueRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#170b24]/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onContinue()
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn('w-full max-w-md overflow-hidden rounded-[21px] bg-white', modalFrame)}
      >
        <div className={cn('flex items-start justify-between gap-4 px-5 py-[18px]', modalHeader)}>
          <ModalHeaderOrnaments />
          <div className="flex items-start gap-3">
            <span className={modalHeadingIcon}>
              <Icon name="alert" size={24} />
            </span>
            <div>
              <h2
                id={titleId}
                className="font-display text-xl font-bold text-white"
              >
                {title}
              </h2>
              <p id={descriptionId} className="mt-1 text-sm text-white/90">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onContinue}
            className={cn('grid size-8 shrink-0 cursor-pointer place-items-center rounded-control', modalCloseButton)}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={cn('flex flex-wrap justify-end gap-2 px-5 py-[15px]', modalFooter)}>
          <Button data-autofocus variant="primary" onClick={onContinue}>
            Continuar preenchendo
          </Button>
          <Button variant="outline" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
