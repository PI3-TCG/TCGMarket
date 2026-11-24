import { useId, type ReactNode } from 'react'

import { Alert } from '@/components/ui/Alert'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  modalDangerButton,
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import type { CardCondition, CardLanguage } from '@/types/Collection'

/**
 * DS-05 — A base compartilhada controla portal, foco, Escape, backdrop,
 * scroll lock e moldura. Este componente cuida apenas da composição
 * e das ações específicas da coleção.
 */
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

const PRIMARY_ICONS = {
  add: 'layers',
  edit: 'edit',
  remove: 'trash',
} as const

const HEADER_ICONS = {
  add: 'layers',
  edit: 'edit',
  remove: 'trash',
} as const

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
  const collectionFormId = useId()

  return (
    <Modal
      open
      presentation="refined"
      size="lg"
      className={cn(
        'mx-auto',
        mode === 'edit'
          ? 'max-w-[680px]'
          : mode === 'remove'
            ? 'max-w-[560px]'
            : 'max-w-[610px]',
      )}
      title={title}
      subtitle={subtitle}
      headerIcon={HEADER_ICONS[mode]}
      onClose={onClose}
      closeDisabled={isSaving}
      footer={
        <div className="flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className={cn(modalSecondaryButton, 'w-full sm:w-auto')}
          >
            {isComplete ? 'Fechar' : 'Cancelar'}
          </button>

          {isComplete ? (
            <button
              type="button"
              onClick={onClose}
              className={cn(modalPrimaryButton, 'w-full sm:w-auto')}
            >
              <Icon name="check" size={20} />
              Concluir
            </button>
          ) : (
            <button
              type="submit"
              form={collectionFormId}
              disabled={isSaving || disablePrimary}
              className={cn(
                mode === 'remove' ? modalDangerButton : modalPrimaryButton,
                'w-full sm:w-auto',
              )}
            >
              <Icon name={PRIMARY_ICONS[mode]} size={20} />
              {isSaving ? busyLabel : primaryLabel}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {(mode === 'add' || mode === 'edit') && (
          <CollectionCardSummary
            card={card}
            variant={mode}
            summaryAside={summaryAside}
          />
        )}

        <form
          id={collectionFormId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          {mode === 'remove' && !isComplete && (
            <div className="mb-5 space-y-2 rounded-surface border border-error-200 bg-error-50 px-4 py-5 text-center">
              <div
                aria-hidden="true"
                className="mx-auto grid size-12 place-items-center rounded-control bg-white text-state-error"
              >
                <Icon name="trash" size={24} />
              </div>
              <h3 className="font-title text-xl font-bold text-text-ink">
                Remover item da coleção?
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Este item será removido da sua coleção, mas continuará
                disponível no catálogo.
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {card.name}
              </p>
            </div>
          )}

          {children}

          {(error || successMessage) && (
            <div className="mt-4 space-y-3" aria-live="polite">
              {error && <Alert variant="error">{error}</Alert>}
              {successMessage && (
                <Alert variant="success" title={SUCCESS_TITLES[mode]}>
                  {successMessage}
                </Alert>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
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
        'flex min-w-0 items-center gap-4 sm:gap-5',
        variant === 'edit' && 'flex-wrap sm:flex-nowrap',
      )}
    >
      <div className="w-[92px] shrink-0 sm:w-[106px]">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            className="aspect-5/7 w-full rounded-md object-contain shadow-md ring-1 ring-border-emphasis/40 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label={`Imagem indisponível: ${card.name}`}
            className="grid aspect-5/7 place-items-center rounded-control border border-border-default bg-surface-subtle text-text-secondary"
          >
            <Icon name="cards" size={32} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <span className="sr-only">{GAME_LABELS[card.game] ?? card.game}</span>
        <h3 className="font-title text-xl font-bold leading-tight text-text-ink sm:text-2xl">
          {card.name}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {card.edition || 'Coleção não informada'}
          {card.cardNumber ? ` · Nº ${card.cardNumber}` : ''}
        </p>
        <span className="inline-flex max-w-full items-center rounded-full border border-border-default bg-accent-gold-soft px-2.5 py-1 text-xs font-semibold text-accent-gold-deep">
          {card.officialRarity || 'Raridade não informada'}
        </span>
      </div>

      {variant === 'edit' && summaryAside ? (
        <div className="w-full min-w-0 text-left sm:w-auto sm:max-w-[145px] sm:shrink-0 sm:text-center">
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
    'h-11 w-full min-w-0 rounded-control border border-border-default bg-surface-input px-3 text-sm text-text-primary outline-none transition-colors focus-visible:border-support-blue focus-visible:ring-2 focus-visible:ring-support-blue disabled:cursor-not-allowed disabled:opacity-60 sm:h-10'
  const labelClass =
    'mb-1.5 block text-sm font-semibold text-text-primary'

  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-4',
        layout === 'edit' ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
      )}
    >
      <div className="min-w-0">
        <label htmlFor={quantityId} className={labelClass}>
          Quantidade <span className="text-state-error">*</span>
        </label>
        <div
          className={cn(
            'flex h-11 overflow-hidden rounded-control border bg-surface-input focus-within:ring-2 focus-within:ring-support-blue sm:h-10',
            quantityError ? 'border-state-error' : 'border-border-default',
          )}
        >
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={disabled || currentQuantity <= 1}
            onClick={() =>
              onQuantityChange(String(Math.max(1, currentQuantity - 1)))
            }
            className="grid w-11 shrink-0 place-items-center border-r border-border-default bg-surface-sand text-brand-deep transition-colors enabled:hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40 sm:w-10"
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
            className="min-w-0 flex-1 bg-transparent px-1 text-center text-sm font-semibold text-text-primary outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={disabled || currentQuantity >= MAX_QUANTITY}
            onClick={() =>
              onQuantityChange(
                String(Math.min(MAX_QUANTITY, Math.max(0, currentQuantity) + 1)),
              )
            }
            className="grid w-11 shrink-0 place-items-center border-l border-border-default bg-surface-sand text-brand-deep transition-colors enabled:hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40 sm:w-10"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>
        {quantityError && (
          <p
            id={quantityErrorId}
            className="mt-2 text-sm font-medium text-state-error"
            role="alert"
          >
            {quantityError}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <label htmlFor={conditionId} className={labelClass}>
          Condição <span className="text-state-error">*</span>
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
          Idioma <span className="text-state-error">*</span>
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
          <div className="flex items-start gap-2.5 rounded-control border border-border-default bg-surface-sand/55 px-3.5 py-3 text-sm leading-relaxed text-text-secondary">
            <Icon name="info" size={20} className="shrink-0 text-brand-deep" />
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
