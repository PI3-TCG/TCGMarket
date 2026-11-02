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
  size?: 'sm' | 'md' | 'lg'
  /** O estilo antigo permanece por padrão para não alterar os outros fluxos. */
  presentation?: 'classic' | 'refined'
  subtitle?: string
  footer?: ReactNode
  closeDisabled?: boolean
}

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

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
  size = 'md',
  presentation = 'classic',
  subtitle,
  footer,
  closeDisabled = false,
}: ModalProps) {
  const titleId = useId()
  const subtitleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open || embedded) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE)
    if (presentation === 'refined') headingRef.current?.focus()
    else (first ?? dialog)?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const nodes = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (nodes.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (event.shiftKey && (document.activeElement === firstNode || document.activeElement === dialog || document.activeElement === headingRef.current)) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open, embedded, presentation])

  // Nos fluxos por etapas, anunciar o novo título sem criar outro diálogo.
  useEffect(() => {
    if (open && presentation === 'refined' && !embedded) headingRef.current?.focus()
  }, [title, open, presentation, embedded])

  if (!open) return null

  const isRefined = presentation === 'refined'
  const actions = footer ?? (secondaryAction || primaryAction ? (
    <>
      {secondaryAction ? (
        <Button variant={secondaryAction.variant ?? 'ghost'} onClick={secondaryAction.onClick ?? onClose}>
          {secondaryAction.label}
        </Button>
      ) : null}
      {primaryAction ? (
        <Button variant={primaryAction.variant ?? 'primary'} onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
      ) : null}
    </>
  ) : null)

  const panel = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal={embedded ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      className={cn(
        isRefined
          ? 'flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[20px] border border-neutral-200 bg-white shadow-lg focus:outline-none'
          : 'w-full rounded-surface border bg-white p-6 shadow-lg',
        preview === 'hover' ? 'border-2 border-primary-900' : 'border-neutral-200',
        className,
      )}
    >
      <div className={cn(
        'flex shrink-0 items-start justify-between gap-4',
        isRefined ? 'relative isolate overflow-hidden bg-[linear-gradient(115deg,#4C195F_0%,#74317F_58%,#8C5897_100%)] px-5 py-5 text-white sm:px-6' : '',
      )}>
        {isRefined ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 right-10 size-44 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-16 top-1/2 -translate-y-1/2 text-white/20">
              <Icon name="sparkle" size={32} />
            </div>
            <div className="absolute right-36 top-4 text-white/10">
              <Icon name="sparkle" size={20} />
            </div>
          </div>
        ) : null}
        <div className="relative z-10 min-w-0">
          <h2
            ref={headingRef}
            tabIndex={-1}
            id={titleId}
            className={cn('font-display text-2xl leading-tight font-bold focus:outline-none', isRefined ? 'text-white' : 'text-neutral-900')}
          >
            {title}
          </h2>
          {subtitle ? <p id={subtitleId} className={cn('mt-1 text-sm', isRefined ? 'text-white/90' : 'text-neutral-700')}>{subtitle}</p> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            aria-label="Fechar"
            disabled={closeDisabled}
            onClick={onClose}
            className={cn('relative z-10 grid size-8 shrink-0 cursor-pointer place-items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-40', isRefined ? 'text-white hover:bg-white/20' : 'text-neutral-700 hover:bg-primary-100 hover:text-primary-900')}
          >
            <Icon name="close" size={20} />
          </button>
        ) : null}
      </div>
      <div className={cn(isRefined ? 'min-h-0 flex-1 overflow-y-auto bg-neutral-50 p-4 text-sm text-neutral-700 sm:p-6' : 'mt-4 space-y-2 text-base text-neutral-700')}>
        {children}
      </div>
      {actions ? (
        <div className={cn('flex shrink-0 flex-wrap justify-end gap-3', isRefined ? 'border-t border-neutral-200 bg-white px-4 py-4 sm:px-6' : 'mt-6')}>
          {actions}
        </div>
      ) : null}
    </div>
  )

  if (embedded) return panel

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/50" onMouseDown={onClose} />
      <div
        className={cn('relative z-10 w-full', size === 'lg' ? (isRefined ? 'max-w-5xl' : 'max-w-3xl') : size === 'sm' ? 'max-w-[440px]' : (isRefined ? 'max-w-2xl' : 'max-w-md'))}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {panel}
      </div>
    </div>,
    document.body,
  )
}
