import {
  conditionLabels,
  copies,
  formatCurrency,
  gameLabels,
  languageLabels,
} from '@/components/ads/adFormat'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icon'
import type { CartItem } from '@/types/Cart'
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { itemName, itemSubtotal } from './cartFormat'

export type RowError =
  | { kind: 'quantity'; message: string }
  | { kind: 'remove'; message: string }
  | { kind: 'other'; message: string }

type Props = {
  item: CartItem
  busy: boolean
  error: RowError | null
  onQuantity: (quantity: number) => void
  onSelect: (selected: boolean) => void
  onAcceptPrice: () => void
  onRemove: () => void
}

const linkClass =
  'font-display text-lg leading-tight font-bold break-words text-secondary-700 hover:text-primary-900 hover:underline'

export function CartItemRow({
  item,
  busy,
  error,
  onQuantity,
  onSelect,
  onAcceptPrice,
  onRemove,
}: Props) {
  const unavailable = item.availability === 'UNAVAILABLE'
  const reduced = item.availability === 'REDUCED'
  const name = itemName(item)
  const details = [
    item.game ? (gameLabels[item.game] ?? item.game) : null,
    item.edition,
  ].filter(Boolean)
  const traits = [
    item.condition ? conditionLabels[item.condition] : null,
    item.language ? languageLabels[item.language] : null,
  ].filter(Boolean)

  return (
    <li
      aria-busy={busy || undefined}
      className={`rounded-xl border bg-white p-4 shadow-sm transition sm:p-5 ${
        reduced && item.selected
          ? 'border-warning-200 bg-warning-50/40'
          : 'border-neutral-200'
      }`}
    >
      <div className="flex gap-3 sm:gap-4">
        <Checkbox
          className="pt-1"
          checked={item.selected}
          disabled={unavailable || busy}
          onChange={(event) => onSelect(event.target.checked)}
          aria-label={`Selecionar ${name}`}
        />

        <ItemImage item={item} name={name} />

        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_auto_auto_auto] md:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {item.cardName ? (
                <Link
                  to="/marketplace/anuncios/$id"
                  params={{ id: item.adId }}
                  className={linkClass}
                >
                  {name}
                </Link>
              ) : (
                <span className="font-display text-lg font-bold text-neutral-700">
                  {name}
                </span>
              )}
              {unavailable ? (
                <Badge variant="error">
                  Indisponível
                </Badge>
              ) : null}
            </div>
            {details.length > 0 ? (
              <p className="mt-1 text-sm text-neutral-700">
                {details.join(' • ')}
              </p>
            ) : null}
            {traits.length > 0 ? (
              <p className="text-sm text-neutral-700">{traits.join(' • ')}</p>
            ) : null}
            {unavailable ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-error-700">
                <Icon name="close-circle" size={16} />
                Este anúncio não está mais disponível.
              </p>
            ) : null}
          </div>

          <PriceColumn item={item} unavailable={unavailable} />

          <QuantityStepper
            item={item}
            disabled={unavailable || busy}
            onChange={onQuantity}
          />

          <div className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-end">
            <div className="md:text-right">
              <p className="text-xs text-neutral-700">Subtotal</p>
              <p
                className={`font-display text-lg font-bold ${
                  unavailable ? 'text-neutral-500' : 'text-primary-900'
                }`}
              >
                {formatCurrency(itemSubtotal(item))}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-1 rounded-control px-1 py-1 text-sm font-medium text-error-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remover ${name} do carrinho`}
            >
              <Icon name="trash" size={16} />
              Remover
            </button>
          </div>
        </div>
      </div>

      {reduced ? (
        <ReviewNotice
          message={`A disponibilidade mudou: ${
            item.availableQuantity === 1
              ? 'resta 1 exemplar'
              : `restam ${item.availableQuantity} exemplares`
          }.`}
          action={`Ajustar para ${item.availableQuantity}`}
          busy={busy}
          selected={item.selected}
          onAction={() => onQuantity(item.availableQuantity)}
          onDeselect={() => onSelect(false)}
        />
      ) : null}

      {item.priceChanged && item.currentUnitPrice !== null ? (
        <ReviewNotice
          message={`O preço mudou de ${formatCurrency(
            item.acceptedUnitPrice,
          )} para ${formatCurrency(item.currentUnitPrice)} por unidade.`}
          action="Aceitar novo preço"
          busy={busy}
          selected={item.selected}
          onAction={onAcceptPrice}
          onDeselect={() => onSelect(false)}
        />
      ) : null}

      {error ? (
        <Alert
          variant="error"
          className="mt-3"
          title={
            error.kind === 'quantity'
              ? 'Não foi possível atualizar a quantidade.'
              : error.kind === 'remove'
                ? 'Não foi possível remover o item.'
                : 'Não foi possível atualizar o item.'
          }
        >
          {error.message}
          {error.kind === 'remove' ? (
            <>
              {' '}
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className="cursor-pointer font-semibold underline underline-offset-2"
              >
                Tentar remover novamente
              </button>
            </>
          ) : null}
        </Alert>
      ) : null}
    </li>
  )
}

function ItemImage({ item, name }: { item: CartItem; name: string }) {
  const [failed, setFailed] = useState(false)
  const image =
    item.imageUrl && !failed ? (
      <img
        src={item.imageUrl}
        alt=""
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    ) : (
      <span className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-500">
        <Icon name="gem" size={20} />
      </span>
    )

  const frame = `block h-24 w-[68px] shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-20 ${
    item.availability === 'UNAVAILABLE' ? 'opacity-60 grayscale' : ''
  }`

  return item.cardName ? (
    <Link
      to="/marketplace/anuncios/$id"
      params={{ id: item.adId }}
      className={frame}
      aria-label={`Ver anúncio de ${name}`}
    >
      {image}
    </Link>
  ) : (
    <span className={frame}>{image}</span>
  )
}

function PriceColumn({
  item,
  unavailable,
}: {
  item: CartItem
  unavailable: boolean
}) {
  return (
    <div>
      <p className="text-xs text-neutral-700">Preço unitário</p>
      {item.priceChanged && item.currentUnitPrice !== null ? (
        <>
          <p className="text-sm text-neutral-500 line-through">
            {formatCurrency(item.acceptedUnitPrice)}
          </p>
          <p className="font-display text-lg font-bold text-primary-900">
            {formatCurrency(item.currentUnitPrice)}
          </p>
        </>
      ) : (
        <p
          className={`font-display text-lg font-bold ${
            unavailable ? 'text-neutral-500' : 'text-primary-900'
          }`}
        >
          {formatCurrency(item.acceptedUnitPrice)}
        </p>
      )}
    </div>
  )
}

function QuantityStepper({
  item,
  disabled,
  onChange,
}: {
  item: CartItem
  disabled: boolean
  onChange: (quantity: number) => void
}) {
  const inputId = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const value = draft ?? String(item.quantity)
  const max = item.availableQuantity

  function commit() {
    if (draft === null) return
    setDraft(null)
    const next = /^\d+$/.test(draft) ? Number(draft) : NaN
    if (!Number.isSafeInteger(next) || next === item.quantity) return
    onChange(Math.min(Math.max(next, 1), Math.max(max, 1)))
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-xs text-neutral-700">
        Quantidade
      </label>
      <div className="mt-1 flex h-9 w-28 overflow-hidden rounded-control border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-secondary-500">
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={disabled || item.quantity <= 1}
          onClick={() => onChange(Math.min(item.quantity - 1, Math.max(max, 1)))}
          className="flex w-9 shrink-0 cursor-pointer items-center justify-center border-r border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="minus" size={16} />
        </button>
        <input
          id={inputId}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value.trim())}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
          }}
          className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-neutral-900 outline-none disabled:text-neutral-500"
        />
        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={disabled || item.quantity >= max}
          onClick={() => onChange(item.quantity + 1)}
          className="flex w-9 shrink-0 cursor-pointer items-center justify-center border-l border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
      {!disabled && max > 0 && item.availability === 'AVAILABLE' ? (
        <p className="mt-1 text-xs text-neutral-500">Até {copies(max)}</p>
      ) : null}
    </div>
  )
}

function ReviewNotice({
  message,
  action,
  busy,
  selected,
  onAction,
  onDeselect,
}: {
  message: string
  action: string
  busy: boolean
  selected: boolean
  onAction: () => void
  onDeselect: () => void
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-control border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
      <Icon name="alert" size={20} />
      <p className="min-w-0 flex-1 font-medium">{message}</p>
      <Button
        variant="secondary"
        className="h-9 px-3 text-sm"
        disabled={busy}
        onClick={onAction}
      >
        {action}
      </Button>
      {selected ? (
        <button
          type="button"
          onClick={onDeselect}
          disabled={busy}
          className="cursor-pointer font-semibold text-secondary-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Desmarcar
        </button>
      ) : null}
    </div>
  )
}
