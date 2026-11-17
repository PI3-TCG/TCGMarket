import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'
import { Icon } from './Icon'
import {
  ModalGoldDivider,
  ModalHeaderOrnaments,
  modalBody,
  modalCloseButton,
  modalFooter,
  modalFrame,
  modalHeader,
  modalHeadingIcon,
  modalSecondaryButton,
} from './modalTheme'

type Props = {
  title: string
  eyebrow: string
  children: ReactNode
  onClose: () => void
  footerText?: string
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function DetailsModal({
  title,
  eyebrow,
  children,
  onClose,
  footerText,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      const dialog = dialogRef.current
      if (event.key !== 'Tab' || !dialog) return

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[inert]') &&
          !element.matches(':disabled'),
      )

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const current = document.activeElement
      const isInside = dialog.contains(current)

      if (!isInside || current === dialog) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13091e]/75 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'flex max-h-[calc(100dvh_-_1.5rem)] w-full max-w-[880px] flex-col overflow-hidden rounded-[22px] focus:outline-none sm:max-h-[calc(100dvh_-_2.5rem)] [@media(max-height:420px)]:overflow-y-auto',
          modalFrame,
        )}
      >
        <header
          className={cn('shrink-0 px-4 py-4 sm:px-6 sm:py-5', modalHeader)}
        >
          <ModalHeaderOrnaments />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className={modalHeadingIcon}>
                <Icon name="gem" size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F1DDF7]">
                  {eyebrow}
                </p>
                <h2
                  id={titleId}
                  className="truncate font-display text-xl font-bold leading-tight text-white sm:text-2xl"
                >
                  {title}
                </h2>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => onCloseRef.current()}
              aria-label="Fechar detalhes"
              className={cn(
                'relative z-10 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg transition',
                modalCloseButton,
              )}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <ModalGoldDivider />

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [@media(max-height:420px)]:flex-none [@media(max-height:420px)]:overflow-visible text-sm text-[#39324F] sm:p-6',
            modalBody,
          )}
        >
          {children}
        </div>

        <footer
          className={cn(
            'flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#DED5EB] px-4 py-4 sm:px-6',
            modalFooter,
          )}
        >
          {footerText && (
            <p className="mr-auto text-xs font-medium text-[#655C7B]">
              {footerText}
            </p>
          )}
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className={cn('min-w-28', modalSecondaryButton)}
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
