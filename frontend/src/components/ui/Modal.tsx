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
  headerIcon = 'gem',
  footer,
  closeDisabled = false,
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

    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE)

    if (presentation === 'refined') {
      headingRef.current?.focus()
    } else {
      ;(first ?? dialog)?.focus()
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (closeDisabledRef.current || !onCloseRef.current) {
          return
        }

        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialog) return

      const nodes = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[inert]') &&
          !element.matches(':disabled'),
      )

      if (nodes.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      const active = document.activeElement

      if (
        !dialog.contains(active) ||
        active === dialog ||
        active === headingRef.current
      ) {
        event.preventDefault()
        ;(event.shiftKey ? lastNode : firstNode).focus()
        return
      }

      if (event.shiftKey && active === firstNode) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && active === lastNode) {
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

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [open, embedded, presentation])

  // Anuncia a mudança de etapa dentro do mesmo diálogo.
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
      tabIndex={-1}
      role="dialog"
      aria-modal={embedded ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      className={cn(
        isRefined
          ? cn(
              'flex max-h-[calc(100dvh_-_1.5rem)] w-full flex-col overflow-hidden sm:max-h-[calc(100dvh_-_2rem)] [@media(max-height:420px)]:overflow-y-auto rounded-[22px] bg-white focus:outline-none',
              modalFrame,
            )
          : 'max-h-[calc(100dvh_-_1.5rem)] w-full overflow-y-auto overscroll-contain rounded-surface border bg-white p-6 shadow-lg sm:max-h-[calc(100dvh_-_2rem)]',
        !isRefined &&
          (preview === 'hover'
            ? 'border-2 border-primary-900'
            : 'border-neutral-200'),
        className,
      )}
    >
      {/* Cabeçalho */}
      <header
        className={cn(
          'relative flex shrink-0 items-center justify-between gap-3',
          isRefined ? cn('px-4 py-4 text-white sm:px-6', modalHeader) : '',
        )}
      >
        {isRefined && <ModalHeaderOrnaments />}

        <div
          className={cn(
            'relative z-10 min-w-0',
            isRefined
              ? 'grid flex-1 grid-cols-[40px_minmax(0,1fr)] items-center gap-3'
              : 'flex items-start',
          )}
        >
          {isRefined && (
            <span aria-hidden="true" className={modalHeadingIcon}>
              <Icon name={headerIcon} size={24} />
            </span>
          )}

          <div className={cn('min-w-0', isRefined && 'sm:text-center')}>
            <h2
              ref={headingRef}
              tabIndex={-1}
              id={titleId}
              className={cn(
                'font-display leading-tight font-bold focus:outline-none',
                isRefined
                  ? 'text-lg text-white sm:text-xl'
                  : 'text-2xl text-neutral-900',
              )}
            >
              {title}
            </h2>

            {subtitle && (
              <p
                id={subtitleId}
                className={cn(
                  'mt-1 text-xs leading-relaxed sm:text-sm',
                  isRefined ? 'text-white/90' : 'text-neutral-700',
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
              'relative z-10 grid size-9 shrink-0 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              isRefined
                ? modalCloseButton
                : 'text-neutral-700 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-secondary-500',
            )}
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </header>

      {/* Linha dourada e losango central */}
      {isRefined && <ModalGoldDivider />}

      {/* Conteúdo */}
      <div
        className={cn(
          isRefined
            ? cn(
                'min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [@media(max-height:420px)]:flex-none [@media(max-height:420px)]:overflow-visible text-sm text-neutral-700 sm:p-6',
                modalBody,
              )
            : 'mt-4 space-y-2 text-base text-neutral-700',
        )}
      >
        {children}
      </div>

      {/* Rodapé */}
      {actions && (
        <footer
          className={cn(
            'flex shrink-0 flex-wrap justify-end gap-3',
            isRefined ? cn('px-4 py-3 sm:px-6', modalFooter) : 'mt-6',
          )}
        >
          {actions}
        </footer>
      )}
    </div>
  )

  if (embedded) return panel

  function requestBackdropClose() {
    if (!closeDisabled && onClose) {
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-neutral-900/55 backdrop-blur-[2px]"
        onMouseDown={requestBackdropClose}
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
        onMouseDown={(event) => event.stopPropagation()}
      >
        {panel}
      </div>
    </div>,
    document.body,
  )
}
