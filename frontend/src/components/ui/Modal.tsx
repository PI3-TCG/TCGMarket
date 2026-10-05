import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button, type ButtonVariant } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'

export type ModalAction = {
  label: string
  onClick?: () => void
  variant?: ButtonVariant
}

type ModalProps = {
  open: boolean
  title: string
  children?: ReactNode
  onClose?: () => void
  embedded?: boolean
  preview?: 'hover'
  secondaryAction?: ModalAction
  primaryAction?: ModalAction
  className?: string
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  title,
  children,
  onClose,
  embedded = false,
  preview,
  secondaryAction,
  primaryAction,
  className,
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open || embedded) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const nodes = dialog
      ? [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      : []
    nodes[0]?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab' || !dialog) return
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) return
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

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, embedded])

  if (!open) return null

  const panel = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal={embedded ? undefined : true}
      aria-labelledby={titleId}
      className={cn(
        'w-full rounded-surface border bg-white p-6 shadow-lg',
        preview === 'hover'
          ? 'border-2 border-primary-900'
          : 'border-neutral-200',
        !embedded && 'max-w-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id={titleId}
          className="font-display text-2xl leading-tight font-bold text-neutral-900"
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="grid size-8 cursor-pointer place-items-center rounded-control text-neutral-700 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="mt-4 space-y-2 text-base text-neutral-700">
        {children}
      </div>
      {secondaryAction || primaryAction ? (
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {secondaryAction ? (
            <Button
              variant={secondaryAction.variant ?? 'ghost'}
              onClick={secondaryAction.onClick ?? onClose}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button
              variant={primaryAction.variant ?? 'primary'}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (embedded) return panel

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50"
        onMouseDown={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {panel}
      </div>
    </div>,
    document.body,
  )
}
