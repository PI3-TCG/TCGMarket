import { type HTMLAttributes, type ReactNode } from 'react'
import { Badge, type BadgeVariant } from './Badge'
import { cn } from './cn'
import { Icon } from './Icon'

export type CardPreview = 'hover' | 'focus' | 'selected' | 'disabled'

type CardProps = HTMLAttributes<HTMLElement> & {
  preview?: CardPreview
  interactive?: boolean
}

export function Card({
  preview,
  interactive = false,
  className,
  ...props
}: CardProps) {
  const emphasized = preview === 'hover' || preview === 'selected'

  return (
    <article
      tabIndex={preview === 'focus' ? 0 : undefined}
      className={cn(
        'overflow-hidden rounded-surface border bg-white shadow-sm transition-[border-color,box-shadow] duration-150',
        emphasized ? 'border-primary-900' : 'border-neutral-200',
        preview === 'hover' && 'shadow-md',
        interactive &&
          preview !== 'hover' &&
          'hover:border-primary-900 hover:shadow-md',
        preview === 'focus' &&
          'ring-2 ring-secondary-500 ring-offset-2 ring-offset-white',
        preview === 'disabled' && 'opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export type ListingTransaction = 'sale' | 'trade' | 'both'

type ListingCardProps = {
  title: string
  seller: string
  rating: string
  reviews: string
  price: string
  transaction?: ListingTransaction
  rarity?: string
  rarityVariant?: Extract<BadgeVariant, 'rare' | 'foil'>
  image?: ReactNode
  favorite?: boolean
  onFavorite?: () => void
  preview?: CardPreview
  interactive?: boolean
  className?: string
}

const transactionVariant: Record<ListingTransaction, BadgeVariant> = {
  sale: 'sale',
  trade: 'trade',
  both: 'both',
}

const transactionLabel: Record<ListingTransaction, string> = {
  sale: 'Venda',
  trade: 'Troca',
  both: 'Venda e troca',
}

export function ListingCard({
  title,
  seller,
  rating,
  reviews,
  price,
  transaction = 'sale',
  rarity,
  rarityVariant = 'rare',
  image,
  favorite = false,
  onFavorite,
  preview,
  interactive = true,
  className,
}: ListingCardProps) {
  return (
    <Card preview={preview} interactive={interactive} className={className}>
      <div className="relative">
        <div className="aspect-[5/4] bg-neutral-100">{image}</div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={
            favorite ? 'Remover dos favoritos' : 'Marcar como favorito'
          }
          onClick={onFavorite}
          className="absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-primary-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        >
          <Icon name="heart" size={16} filled={favorite} />
        </button>
        <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          <Badge variant={transactionVariant[transaction]}>
            {transactionLabel[transaction]}
          </Badge>
          {rarity ? <Badge variant={rarityVariant}>{rarity}</Badge> : null}
        </div>
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="font-display text-sm leading-tight font-semibold text-neutral-900">
          {title}
        </h3>
        <p className="text-xs text-neutral-700">{seller}</p>
        <p className="flex items-center gap-1 text-xs text-neutral-500">
          <Icon name="star" size={16} filled className="text-rare-500" />
          <span className="font-semibold text-neutral-700">{rating}</span>
          <span>({reviews})</span>
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Badge variant={transactionVariant[transaction]}>
            {transactionLabel[transaction]}
          </Badge>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-control bg-primary-900 px-2 py-1 font-display text-xs font-bold whitespace-nowrap text-white">
            {price}
            <Icon name="cart" size={16} />
          </span>
        </div>
      </div>
    </Card>
  )
}
