import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import {
  ModalHeaderOrnaments,
  ModalGoldDivider,
  modalSecondaryButton as secondaryButton,
  modalDangerButton as dangerButton,
  modalCloseButton,
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
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

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
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#170B24]/65 p-4 backdrop-blur-[3px]"
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
        className={cn(
          'max-h-[calc(100dvh_-_2rem)] w-full max-w-[470px] overflow-y-auto overscroll-contain rounded-[21px] bg-[#FBF9FE]',
          modalFrame,
        )}
      >
        <div
          className={cn(
            'flex items-start justify-between gap-4 px-5 py-5 sm:px-6',
            modalHeader,
          )}
        >
          <ModalHeaderOrnaments />
          <div className="relative z-10 flex min-w-0 items-start gap-3">
            <span aria-hidden="true" className={modalHeadingIcon}>
              <Icon name="alert" size={24} />
            </span>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-xl font-bold leading-tight text-white"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-white/85">
                Confirme como deseja continuar.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar e continuar preenchendo"
            onClick={onContinue}
            className={cn(
              'relative z-10 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg',
              modalCloseButton,
            )}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <ModalGoldDivider />

        <div className="bg-[radial-gradient(ellipse_at_top_left,rgba(238,229,254,0.8),transparent_75%),linear-gradient(135deg,#FDFBFF,#F5F3FD)] px-5 pb-5 pt-7 sm:px-6">
          <div className="flex items-start gap-3 rounded-xl border border-[#E9CCD1] bg-[linear-gradient(135deg,#FFF9FA,#FFF1F3)] p-4 shadow-[0_2px_8px_rgba(115,30,59,0.04)]">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#F3CBD1] bg-white text-[#B91C36]"
            >
              <Icon name="alert" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#651D36]">
                Alterações não salvas
              </p>
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-relaxed text-[#594557]"
              >
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#DED5EB] bg-[linear-gradient(180deg,#FDFBFF,#F7F4FC)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            data-autofocus
            type="button"
            onClick={onContinue}
            className={secondaryButton}
          >
            Continuar preenchendo
          </button>
          <button type="button" onClick={onConfirm} className={dangerButton}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
