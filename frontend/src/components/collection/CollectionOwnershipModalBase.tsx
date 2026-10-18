import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import type { CardCondition, CardLanguage } from '@/types/Collection'

const MAX_QUANTITY = 2147483647

// Os dois contratos (CatalogCard e CollectionCard) possuem estes campos.
export type CollectionModalCard = {
  name: string
  imageUrl: string | null
  edition: string
  cardNumber: string | null
  officialRarity: string
  game: string
}

type ModalBaseProps = {
  mode: 'add' | 'edit'
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
}

const GAME_LABELS: Record<string, string> = {
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic',
}

/** Estrutura visual compartilhada pelos modais de adicionar e editar. */
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
}: ModalBaseProps) {
  const titleId = useId()
  const descriptionId = useId()
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
      previousFocus?.focus()
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

      // Evita que o Tab mova o foco para a página sob o modal.
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const isInside = dialogRef.current.contains(active)

      if (!isInside || (event.shiftKey && active === first)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#170b24]/70 p-3 backdrop-blur-[3px] sm:p-5"
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
        className="max-h-[94dvh] w-full max-w-[790px] overflow-y-auto rounded-[22px] border border-primary-100 bg-white shadow-[0_26px_85px_rgba(24,6,38,0.35)] sm:rounded-[24px]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-100 via-[#faf6ff] to-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-300/30 bg-white text-primary-900 shadow-sm">
              {mode === 'add' ? (
                <Icon name="plus" size={24} />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path d="m15 5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-lg font-bold leading-tight text-primary-900 sm:text-[22px]"
              >
                {title}
              </h2>
              <p
                id={descriptionId}
                className="mt-1 text-xs leading-relaxed text-neutral-700 sm:text-sm"
              >
                {subtitle}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar modal"
            className="shrink-0 rounded-lg p-1.5 text-primary-900 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:opacity-50"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="grid gap-5 p-4 sm:grid-cols-[235px_minmax(0,1fr)] sm:gap-6 sm:p-6">
          <aside className="min-w-0 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="overflow-hidden rounded-lg bg-neutral-50 p-2">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={`Carta ${card.name}`}
                  className="mx-auto aspect-[3/4] w-full max-w-[215px] object-contain drop-shadow-sm"
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center gap-2 text-sm text-neutral-500">
                  <Icon name="grid" size={24} />
                  Imagem indisponível
                </div>
              )}
            </div>

            {card.imageUrl && (
              <a
                href={card.imageUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-primary-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-secondary-500"
              >
                <Icon name="search" size={16} />
                Ver imagem completa
              </a>
            )}

            <h3 className="mt-3 font-display text-base font-bold text-primary-900">
              {card.name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              {card.edition || 'Coleção não informada'}
              {card.cardNumber ? ` · Nº ${card.cardNumber}` : ''}
            </p>
            <Badge variant="primary" className="mt-2">
              {card.officialRarity || 'Raridade não informada'}
            </Badge>

            <dl className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-primary-100/55 p-3 text-xs">
              <div className="min-w-0">
                <dt className="mb-1 flex items-center gap-1 font-semibold text-primary-900">
                  <Icon name="grid" size={16} /> TCG
                </dt>
                <dd className="break-words text-neutral-700">
                  {GAME_LABELS[card.game] ?? card.game}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-1 flex items-center gap-1 font-semibold text-primary-900">
                  <Icon name="grid" size={16} /> Coleção
                </dt>
                <dd className="break-words text-neutral-700">
                  {card.edition || '—'}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-1 font-semibold text-primary-900">Número</dt>
                <dd className="text-neutral-700">{card.cardNumber || '—'}</dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-1 font-semibold text-primary-900">
                  Raridade
                </dt>
                <dd className="break-words text-neutral-700">
                  {card.officialRarity || '—'}
                </dd>
              </div>
            </dl>
          </aside>

          <form
            noValidate
            className="flex min-w-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <h3 className="mb-4 border-b border-neutral-200 pb-3 font-display text-base font-bold text-primary-900">
              Informações da sua coleção
            </h3>

            {children}

            <div className="mt-5 space-y-3" aria-live="polite">
              {error && <Alert variant="error">{error}</Alert>}
              {successMessage && (
                <Alert
                  variant="success"
                  title={
                    mode === 'add' ? 'Carta adicionada!' : 'Alterações salvas!'
                  }
                >
                  {successMessage}
                </Alert>
              )}
            </div>

            <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-primary-900 px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:opacity-50"
              >
                {isComplete ? 'Fechar' : 'Cancelar'}
              </button>
              {isComplete ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-secondary-500"
                >
                  <Icon name="check" size={16} /> Concluir
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving || disablePrimary}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name={mode === 'add' ? 'plus' : 'check'} size={16} />
                  {isSaving ? busyLabel : primaryLabel}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>,
    document.body,
  )
}

type FieldsProps = {
  quantity: string
  condition: CardCondition
  language: CardLanguage
  disabled: boolean
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

/** Formulário compartilhado: só os valores e callbacks mudam entre adicionar e editar. */
export function CollectionOwnershipFields({
  quantity,
  condition,
  language,
  disabled,
  onQuantityChange,
  onConditionChange,
  onLanguageChange,
}: FieldsProps) {
  const uniqueId = useId()
  const quantityId = `${uniqueId}-quantity`
  const conditionId = `${uniqueId}-condition`
  const languageId = `${uniqueId}-language`
  const currentQuantity = /^\d+$/.test(quantity) ? Number(quantity) : 0

  const inputClasses =
    'h-10 w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-50 disabled:text-neutral-500'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 min-[440px]:grid-cols-2 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor={quantityId}
            className="mb-1.5 block text-xs font-semibold text-primary-900"
          >
            Quantidade <span className="text-error-700">*</span>
          </label>
          <div className="flex h-10 overflow-hidden rounded-lg border border-neutral-300 bg-white focus-within:border-primary-700 focus-within:ring-2 focus-within:ring-primary-100">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={disabled || currentQuantity <= 1}
              onClick={() =>
                onQuantityChange(String(Math.max(1, currentQuantity - 1)))
              }
              className="flex w-9 shrink-0 items-center justify-center border-r border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:opacity-40"
            >
              <Icon name="minus" size={16} />
            </button>
            <input
              id={quantityId}
              inputMode="numeric"
              type="text"
              pattern="[0-9]*"
              autoComplete="off"
              value={quantity}
              disabled={disabled}
              aria-label="Quantidade de exemplares"
              onChange={(event) => onQuantityChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1 text-center text-sm font-semibold text-neutral-900 outline-none disabled:text-neutral-500"
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
              className="flex w-9 shrink-0 items-center justify-center border-l border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:opacity-40"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <label
            htmlFor={conditionId}
            className="mb-1.5 block text-xs font-semibold text-primary-900"
          >
            Condição <span className="text-error-700">*</span>
          </label>
          <select
            id={conditionId}
            value={condition}
            disabled={disabled}
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
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-100/50 px-3 py-3 text-xs leading-relaxed text-primary-900">
        <Icon name="info" size={16} className="mt-0.5" />
        <span>
          A condição representa o estado de conservação da carta. Escolha o
          valor correspondente ao exemplar que você possui.
        </span>
      </div>

      <div>
        <label
          htmlFor={languageId}
          className="mb-1.5 block text-xs font-semibold text-primary-900"
        >
          Idioma <span className="text-error-700">*</span>
        </label>
        <select
          id={languageId}
          value={language}
          disabled={disabled}
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
    </div>
  )
}
