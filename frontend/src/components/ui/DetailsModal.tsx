import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

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
        const target = event.shiftKey ? last : first
        target.focus()
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

      if (previousFocus?.isConnected) {
        previousFocus.focus()
      }
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/65 p-2.5 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[90dvh] w-full max-w-[880px] flex-col overflow-hidden rounded-[22px] bg-neutral-50 shadow-[0_24px_80px_rgba(102,3,102,0.20)]"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-primary-900 via-primary-500 to-primary-700 px-4 py-3.5 text-white sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-20 size-44 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Icon name="gem" size={24} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
                  {eyebrow}
                </p>

                <h2
                  id={titleId}
                  className="truncate font-display text-lg font-bold leading-snug sm:text-xl"
                >
                  {title}
                </h2>
              </div>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="shrink-0 cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-br from-primary-100/40 via-neutral-50 to-white p-3.5 sm:p-5">
          {children}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-primary-300/30 bg-primary-100/70 px-4 py-3 sm:px-6">
          {footerText && (
            <p className="hidden text-xs text-primary-800 sm:block">
              {footerText}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto cursor-pointer rounded-lg border border-primary-300/40 bg-white/90 px-4 py-2.5 text-xs font-semibold text-primary-900 transition hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900"
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}