import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import {
  ModalHeaderOrnaments,
  modalBody,
  modalCloseButton,
  modalDangerButton,
  modalFooter,
  modalFrame,
  modalHeader,
  modalHeadingIcon,
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import type { CardCondition, CardLanguage } from '@/types/Collection'

const MAX_QUANTITY = 2147483647
export type CollectionModalCard = {
  name: string
  imageUrl: string | null
  edition: string
  cardNumber: string | null
  officialRarity: string
  game: string
}

type ModalMode = 'add' | 'edit' | 'remove'
type ModalBaseProps = {
  mode: ModalMode
  card: CollectionModalCard
  title: string
  subtitle: string
  primaryLabel: string
  busyLabel: string
  isSaving: boolean
  isComplete: boolean
  disablePrimary?: boolean
  error: string | null
  successMessage: string | null
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
  summaryAside?: ReactNode
}

const SUCCESS_TITLES: Record<ModalMode, string> = {
  add: 'Carta adicionada!',
  edit: 'Alterações salvas!',
  remove: 'Carta removida!',
}
const PRIMARY_ICONS = { add: 'layers', edit: 'edit', remove: 'trash' } as const

const GAME_LABELS: Record<string, string> = {
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic',
}

export function CollectionOwnershipModalBase({
  mode,
  card,
  title,
  subtitle,
  primaryLabel,
  busyLabel,
  isSaving,
  isComplete,
  disablePrimary = false,
  error,
  successMessage,
  onClose,
  onSubmit,
  children,
  summaryAside,
}: ModalBaseProps) {
  const titleId = useId()
  const descriptionId = useId()
  const collectionFormId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (!isSaving) {
          event.preventDefault()
          onClose()
        }
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const dialog = dialogRef.current
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (el) =>
          el.getClientRects().length > 0 &&
          !el.closest('[inert]') &&
          !el.matches(':disabled'),
      )
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (!dialog.contains(active) || active === dialog) {
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
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#15091F]/75 p-3 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[21px] outline-none',
          mode === 'edit'
            ? 'max-w-[670px]'
            : mode === 'remove'
              ? 'max-w-[590px]'
              : 'max-w-[575px]',
          modalFrame,
        )}
      >
        <header
          className={cn(
            'relative shrink-0 px-4 pb-6 pt-4 sm:px-6 sm:pb-7',
            modalHeader,
          )}
        >
          <ModalHeaderOrnaments />

          <div className="relative grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
            <div aria-hidden="true" className={modalHeadingIcon}>
              <Icon
                name={
                  mode === 'remove'
                    ? 'trash'
                    : mode === 'edit'
                      ? 'edit'
                      : 'layers'
                }
                size={20}
              />
            </div>
            <div className="min-w-0 text-center">
              <h2
                id={titleId}
                className="font-display text-base font-bold leading-tight text-white sm:text-[19px]"
              >
                {title}
              </h2>
              <p
                id={descriptionId}
                className="mt-0.5 text-[11px] leading-snug text-white/90 sm:text-xs"
              >
                {subtitle}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              disabled={isSaving}
              onClick={onClose}
              aria-label="Fechar modal"
              className={cn(
                'justify-self-end rounded-lg p-2 disabled:opacity-50',
                modalCloseButton,
              )}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
          >
            {/* Linha dourada refinada */}
            <div
              className="mx-4 h-[2px] sm:mx-6"
              style={{
                background:
                  'linear-gradient(90deg, rgba(215,154,0,0) 0%, #B87C00 10%, #E7B81E 24%, #FFF1A6 50%, #E7B81E 76%, #B87C00 90%, rgba(215,154,0,0) 100%)',
                boxShadow:
                  '0 0 8px rgba(252, 210, 3, 0.22), 0 1px 0 rgba(255,255,255,0.10)',
              }}
            />

            {/* Losango central */}
            <div className="absolute left-1/2 top-1/2 flex size-[16px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center rounded-[2px] border border-[#F6CD3A] bg-[linear-gradient(180deg,#FFF8D7_0%,#F0C839_100%)] shadow-[0_0_0_2px_#7A117C,0_0_8px_rgba(252,210,3,0.35)]">
              <div className="size-[5px] border border-[#F6CD3A] bg-white/75" />
            </div>
          </div>
        </header>
        {/* Divisória decorativa entre cabeçalho e conteúdo */}
        <div
          aria-hidden="true"
          className="relative z-10 h-[2px] shrink-0 bg-[linear-gradient(90deg,#C78600_0%,#FCD84C_30%,#FFF0A8_50%,#FCD84C_70%,#C78600_100%)] shadow-[0_0_8px_rgba(252,210,3,0.25)]"
        >
          <div className="absolute left-1/2 top-1/2 flex size-[16px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center border-2 border-[#FCD84C] bg-[#FFF6C8] shadow-[0_0_0_2px_#7A117C,0_0_8px_rgba(252,210,3,0.35)]">
            <span className="size-[5px] bg-[#FCD84C]" />
          </div>
        </div>
        <div
          className={cn(
            'relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain rounded-t-[20px] p-4 sm:p-5',
            modalBody,
          )}
        >
          {mode === 'add' && (
            <CollectionCardSummary card={card} variant="add" />
          )}
          {mode === 'edit' && (
            <CollectionCardSummary
              card={card}
              variant="edit"
              summaryAside={summaryAside}
            />
          )}

          <form
            id={collectionFormId}
            noValidate
            className={cn(
              'min-w-0',
              mode === 'remove' ? '' : 'mt-4 border-t border-[#DAD6E9] pt-4',
            )}
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            {mode === 'remove' && !isComplete && (
              <div className="mb-4 flex flex-col items-center gap-2 text-center">
                <div
                  aria-hidden="true"
                  className="flex size-16 items-center justify-center rounded-[20px] bg-[#FCE4E7] text-[#D41127]"
                >
                  <Icon name="trash" size={32} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1B1439]">
                  Remover item da coleção?
                </h3>
                <p className="max-w-[440px] text-sm leading-relaxed text-[#2D264C]">
                  Este item será removido da sua coleção, mas continuará
                  disponível no catálogo.
                </p>
                <p className="text-xs font-semibold text-[#6B557C]">
                  {card.name}
                </p>
              </div>
            )}
            {children}
            <div className="space-y-3" aria-live="polite">
              {error && (
                <div className="mt-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}
              {successMessage && (
                <div className="mt-4">
                  <Alert variant="success" title={SUCCESS_TITLES[mode]}>
                    {successMessage}
                  </Alert>
                </div>
              )}
            </div>
          </form>
        </div>

        <footer
          className={cn(
            'shrink-0 px-6 py-3.5',
            modalFooter,
            modalBody,
          )}
        >
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#DAD6E9] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={modalSecondaryButton}
            >
              {isComplete ? 'Fechar' : 'Cancelar'}
            </button>
            {isComplete ? (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  modalPrimaryButton,
                )}
              >
                <Icon name="check" size={20} /> Concluir
              </button>
            ) : (
              <button
                type="submit"
                form={collectionFormId}
                disabled={isSaving || disablePrimary}
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  mode === 'remove' ? modalDangerButton : modalPrimaryButton,
                )}
              >
                <Icon name={PRIMARY_ICONS[mode]} size={20} />{' '}
                {isSaving ? busyLabel : primaryLabel}
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

function CollectionCardSummary({
  card,
  variant,
  summaryAside,
}: {
  card: CollectionModalCard
  variant: 'add' | 'edit'
  summaryAside?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3',
        variant === 'edit' ? 'pb-1' : 'border-b border-[#DAD6E9] pb-4',
      )}
    >
      <div className="w-[76px] shrink-0 sm:w-[88px]">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            className="aspect-[3/4] w-full rounded-md object-contain shadow-[0_3px_11px_rgba(33,12,55,0.30)] ring-1 ring-[#C9AC74]"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-[#EAE6F4] text-[#4D366F]">
            <Icon name="cards" size={32} />
            <span className="sr-only">Imagem indisponível</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold leading-tight text-[#20143E] sm:text-xl">
          {card.name}
        </h3>
        <p className="mt-1 text-sm text-[#514475]">
          {card.edition || 'Coleção não informada'}
          {card.cardNumber ? ` · #${card.cardNumber}` : ''}
        </p>
        <span className="mt-2 inline-block rounded-full bg-[#E8C9FA] px-3 py-1 text-xs font-bold text-[#5F1498]">
          {card.officialRarity || 'Raridade não informada'}
        </span>
        {variant === 'add' && (
          <span className="sr-only">{GAME_LABELS[card.game] ?? card.game}</span>
        )}
      </div>
      {variant === 'edit' && summaryAside ? (
        <div className="min-w-[105px] max-w-[145px] shrink-0 border-l border-[#DAD6E9] pl-3 text-center sm:min-w-[135px] sm:pl-4">
          {summaryAside}
        </div>
      ) : null}
    </div>
  )
}

type FieldsProps = {
  quantity: string
  condition: CardCondition
  language: CardLanguage
  disabled: boolean
  quantityError?: string
  layout?: 'default' | 'edit'
  onQuantityChange: (value: string) => void
  onConditionChange: (value: CardCondition) => void
  onLanguageChange: (value: CardLanguage) => void
}
const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: 'NEAR_MINT', label: 'Near Mint (NM)' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played (LP)' },
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played (MP)' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played (HP)' },
  { value: 'DAMAGED', label: 'Damaged (DMG)' },
]

export function CollectionOwnershipFields({
  quantity,
  condition,
  language,
  disabled,
  quantityError,
  layout = 'default',
  onQuantityChange,
  onConditionChange,
  onLanguageChange,
}: FieldsProps) {
  const uniqueId = useId()
  const quantityId = `${uniqueId}-quantity`
  const quantityErrorId = `${quantityId}-error`
  const conditionId = `${uniqueId}-condition`
  const languageId = `${uniqueId}-language`
  const currentQuantity = /^\d+$/.test(quantity) ? Number(quantity) : 0
  const inputClasses =
    'h-9 w-full min-w-0 rounded-lg border border-[#C8C5E2] bg-white/40 px-3 text-sm text-[#21183D] outline-none transition focus-visible:border-[#1254BD] focus-visible:ring-2 focus-visible:ring-[#A3BAFF] disabled:opacity-60'
  const labelClass = 'mb-1.5 block text-xs font-bold text-[#21183D]'

  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-3',
        layout === 'edit' ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
      )}
    >
      <div className="min-w-0">
        <label htmlFor={quantityId} className={labelClass}>
          Quantidade <span className="text-[#BD0923]">*</span>
        </label>
        <div className="flex h-9 overflow-hidden rounded-lg border border-[#C8C5E2] bg-white/50 focus-within:border-[#1254BD] focus-within:ring-2 focus-within:ring-[#A3BAFF]">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={disabled || currentQuantity <= 1}
            onClick={() =>
              onQuantityChange(String(Math.max(1, currentQuantity - 1)))
            }
            className="flex w-10 shrink-0 items-center justify-center border-r border-[#C8C5E2] bg-[#EEECF9] text-[#074CE1] hover:bg-[#DCE4FF] disabled:opacity-40"
          >
            <Icon name="minus" size={20} />
          </button>
          <input
            id={quantityId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={quantity}
            disabled={disabled}
            required
            aria-invalid={Boolean(quantityError)}
            aria-describedby={quantityError ? quantityErrorId : undefined}
            onChange={(event) => onQuantityChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-1 text-center text-sm font-semibold text-[#21183D] outline-none"
          />
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={disabled || currentQuantity >= MAX_QUANTITY}
            onClick={() =>
              onQuantityChange(
                String(
                  Math.min(MAX_QUANTITY, Math.max(0, currentQuantity) + 1),
                ),
              )
            }
            className="flex w-10 shrink-0 items-center justify-center border-l border-[#C8C5E2] bg-[#EEECF9] text-[#074CE1] hover:bg-[#DCE4FF] disabled:opacity-40"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>
        {quantityError && (
          <p
            id={quantityErrorId}
            className="mt-2 text-sm font-medium text-error-700"
          >
            {quantityError}
          </p>
        )}
      </div>
      <div className="min-w-0">
        <label htmlFor={conditionId} className={labelClass}>
          Condição <span className="text-[#BD0923]">*</span>
        </label>
        <select
          id={conditionId}
          value={condition}
          disabled={disabled}
          required
          onChange={(event) =>
            onConditionChange(event.target.value as CardCondition)
          }
          className={inputClasses}
        >
          {CONDITIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={cn('min-w-0', layout !== 'edit' && 'sm:col-span-2')}>
        <label htmlFor={languageId} className={labelClass}>
          Idioma <span className="text-[#BD0923]">*</span>
        </label>
        <select
          id={languageId}
          value={language}
          disabled={disabled}
          required
          onChange={(event) =>
            onLanguageChange(event.target.value as CardLanguage)
          }
          className={inputClasses}
        >
          <option value="PORTUGUESE">Português (PT-BR)</option>
          <option value="ENGLISH">Inglês (EN)</option>
          <option value="JAPANESE">Japonês (JP)</option>
        </select>
      </div>
      {layout !== 'edit' && (
        <div className="sm:col-span-2">
          <div className="flex items-start gap-2 rounded-lg border border-[#BFD2FD] bg-[#E8F0FF] px-3 py-3 text-xs leading-relaxed text-[#103D98]">
            <Icon name="info" size={20} />
            <span>
              A carta será adicionada à sua coleção com a quantidade, condição e
              idioma informados.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
