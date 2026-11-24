import { type HTMLAttributes, type ReactNode } from 'react'
import { Badge, type BadgeVariant } from './Badge'
import { cn } from './cn'
import { Icon } from './Icon'

export type CardPreview = 'hover' | 'focus' | 'selected' | 'disabled'

type CardProps = HTMLAttributes<HTMLElement> & {
  preview?: CardPreview
  interactive?: boolean
}

/**
 * DS-04: somente a superfície visual. Navegação e ações pertencem aos
 * componentes especializados, não ao <article>.
 */
export const cardSurface =
  'overflow-hidden rounded-card border border-border-default bg-surface-default shadow-sm transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none'

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
        cardSurface,
        emphasized && 'border-border-emphasis',
        preview === 'hover' && 'shadow-md',
        interactive &&
          preview !== 'hover' &&
          'hover:border-border-emphasis hover:shadow-md',
        preview === 'focus' &&
          'ring-2 ring-support-blue ring-offset-2 ring-offset-surface-canvas',
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

/**
 * Componente ilustrativo usado na DesignSystemPage; recebe dados do consumidor.
 * O favorito só aparece quando existe uma ação onFavorite real disponível.
 * A listagem de produção usa MarketplaceAdCard/AdListingCard.
 */
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
      <div className="relative border-b border-border-default bg-surface-input">
        <div className="mx-auto aspect-[5/7] w-full overflow-hidden p-3 [&>img]:h-full [&>img]:w-full [&>img]:object-contain">
          {image}
        </div>
        {onFavorite ? (
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={
              favorite ? 'Remover dos favoritos' : 'Marcar como favorito'
            }
            onClick={onFavorite}
            className="absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full border border-border-default bg-surface-default text-brand-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
          >
            <Icon name="heart" size={20} filled={favorite} />
          </button>
        ) : null}
        <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          <Badge variant={transactionVariant[transaction]}>
            {transactionLabel[transaction]}
          </Badge>
          {rarity ? <Badge variant={rarityVariant}>{rarity}</Badge> : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 p-3.5">
        <h3
          className="line-clamp-2 min-h-10 wrap-anywhere font-sans text-sm leading-5 font-bold text-text-ink"
          title={title}
        >
          {title}
        </h3>
        <p className="truncate text-sm text-text-secondary" title={seller}>
          {seller}
        </p>
        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <Icon name="star" size={16} filled className="text-accent-gold-deep" />
          <span className="font-semibold text-text-primary">{rating}</span>
          <span>({reviews})</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-default pt-2">
          <Badge variant={transactionVariant[transaction]}>
            {transactionLabel[transaction]}
          </Badge>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-control bg-brand-primary px-2 py-1.5 font-sans text-sm font-bold text-white">
            {price}
            <Icon name="cart" size={16} />
          </span>
        </div>
      </div>
    </Card>
  )
}
