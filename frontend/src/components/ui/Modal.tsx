import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Button, type ButtonVariant } from './Button'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'
import {
  ModalGoldDivider,
  ModalHeaderOrnaments,
  modalBody,
  modalCloseButton,
  modalFooter,
  modalFrame,
  modalHeader,
  modalHeadingIcon,
} from './modalTheme'

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
  presentation?: 'classic' | 'refined'
  subtitle?: string
  headerIcon?: IconName
  footer?: ReactNode
  closeDisabled?: boolean
  /** Complemento opcional ao título. Utilizado pelo adaptador DetailsModal. */
  eyebrow?: string
  /** Cabeçalho mínimo para detalhes com título destacado no corpo. */
  headerLayout?: 'standard' | 'compact'
}

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function visibleFocusable(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      element.getClientRects().length > 0 &&
      !element.closest('[inert], [aria-hidden="true"]') &&
      !element.matches(':disabled') &&
      element.getAttribute('aria-disabled') !== 'true',
  )
}

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
  headerIcon = 'gem',
  footer,
  closeDisabled = false,
  eyebrow,
  headerLayout = 'standard',
}: ModalProps) {
  const titleId = useId()
  const subtitleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const onCloseRef = useRef(onClose)
  const closeDisabledRef = useRef(closeDisabled)

  useEffect(() => {
    onCloseRef.current = onClose
    closeDisabledRef.current = closeDisabled
  }, [onClose, closeDisabled])

  useEffect(() => {
    if (!open || embedded) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const dialog = dialogRef.current
    if (!dialog) return

    const initial =
      presentation === 'refined'
        ? headingRef.current
        : (visibleFocusable(dialog)[0] ?? dialog)
    initial?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return
      const currentDialog = dialogRef.current
      if (!currentDialog) return

      if (event.key === 'Escape') {
        // Select/Dropdown deve consumir Escape antes do diálogo.
        // Caso um popup esteja aberto, não fechar também o modal.
        const expandedControl = currentDialog.querySelector(
          '[role="combobox"][aria-expanded="true"], [aria-haspopup="menu"][aria-expanded="true"], [aria-haspopup="listbox"][aria-expanded="true"]',
        )
        if (expandedControl || closeDisabledRef.current || !onCloseRef.current) {
          return
        }
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const nodes = visibleFocusable(currentDialog)
      if (nodes.length === 0) {
        event.preventDefault()
        currentDialog.focus()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement

      if (
        !currentDialog.contains(active) ||
        active === currentDialog ||
        active === headingRef.current
      ) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Evita que focos programáticos escapem do diálogo ativo.
    function onFocusIn(event: FocusEvent) {
      const currentDialog = dialogRef.current
      if (!currentDialog || currentDialog.contains(event.target as Node)) return
      const target = visibleFocusable(currentDialog)[0] ?? currentDialog
      target.focus()
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)

    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocusIn)
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open, embedded, presentation])

  // Mudança de etapa/título dentro do mesmo diálogo, sem recriar a instância.
  useEffect(() => {
    if (open && presentation === 'refined' && !embedded) {
      headingRef.current?.focus()
    }
  }, [title, open, presentation, embedded])

  if (!open) return null

  const isRefined = presentation === 'refined'
  const actions =
    footer ??
    (secondaryAction || primaryAction ? (
      <>
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant ?? 'ghost'}
            onClick={secondaryAction.onClick ?? onClose}
            disabled={closeDisabled && !secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            variant={primaryAction.variant ?? 'primary'}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
      </>
    ) : null)

  const panel = (
    <div
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
      aria-modal={embedded ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      className={cn(
        'relative flex max-h-[calc(100dvh_-_1.5rem)] w-full flex-col overflow-hidden rounded-modal focus:outline-none sm:max-h-[calc(100dvh_-_2rem)] [@media(max-height:420px)]:overflow-y-auto',
        isRefined
          ? modalFrame
          : 'border border-border-default bg-surface-default shadow-lg',
        !isRefined && preview === 'hover' && 'border-brand-primary shadow-md',
        className,
      )}
    >
      <header
        className={cn(
          'relative flex shrink-0 items-start justify-between gap-3',
          isRefined
            ? cn(
                headerLayout === 'compact'
                  ? 'min-h-14 items-center px-5 py-2.5 sm:px-7'
                  : 'px-5 py-3.5 sm:px-7 sm:py-4',
                modalHeader,
              )
            : 'px-5 pt-5 sm:px-6 sm:pt-6',
        )}
      >
        {isRefined && <ModalHeaderOrnaments />}

        <div
          className={cn(
            'relative z-10 flex min-w-0 flex-1 items-start gap-3',
          )}
        >
          {isRefined && headerLayout !== 'compact' && (
            <span aria-hidden="true" className={modalHeadingIcon}>
              <Icon name={headerIcon} size={24} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-text-secondary">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              ref={headingRef}
              tabIndex={-1}
              className={cn(
                headerLayout === 'compact'
                  ? 'sr-only'
                  : 'font-title text-2xl font-bold leading-tight text-text-ink focus:outline-none sm:text-[28px]',
              )}
            >
              {title}
            </h2>
            {subtitle && headerLayout !== 'compact' && (
              <p
                id={subtitleId}
                className={cn(
                  'mt-1 text-sm leading-relaxed',
                  'text-text-secondary',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            aria-label="Fechar modal"
            disabled={closeDisabled}
            onClick={onClose}
            className={cn(
              'relative z-30 grid size-11 shrink-0 place-items-center rounded-control transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              isRefined
                ? modalCloseButton
                : 'text-text-primary hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue',
            )}
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </header>

      {isRefined && <ModalGoldDivider />}

      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-sm sm:px-7 sm:py-6 [@media(max-height:420px)]:flex-none [@media(max-height:420px)]:overflow-visible',
          modalBody,
          !isRefined && 'space-y-2 text-base',
        )}
      >
        {children}
      </div>

      {actions && (
        <footer
          className={cn(
            'flex shrink-0 flex-wrap items-center justify-end gap-3 px-5 py-4 sm:px-7',
            modalFooter,
          )}
        >
          {actions}
        </footer>
      )}
    </div>
  )

  if (embedded) return panel

  return createPortal(
    <div
      data-tcg-modal-root="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-brand-deep/75 backdrop-blur-[3px]"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !closeDisabled) {
            onClose?.()
          }
        }}
      />
      <div
        className={cn(
          'relative z-10 w-full',
          size === 'lg'
            ? isRefined
              ? 'max-w-5xl'
              : 'max-w-3xl'
            : size === 'sm'
              ? 'max-w-[440px]'
              : isRefined
                ? 'max-w-2xl'
                : 'max-w-md',
        )}
      >
        {panel}
      </div>
    </div>,
    document.body,
  )
}
