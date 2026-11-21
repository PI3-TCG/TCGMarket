import { type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { TradingCardImage } from '@/components/ui/TradingCard'
import {
  tradingCardRarity,
  tradingCardSurface,
} from '@/components/ui/tradingCardStyles'
import type { CatalogCard as CatalogCardData } from '@/types/Catalog'

type CatalogCardProps = {
  card: CatalogCardData
  footer?: ReactNode
  onSelect?: (card: CatalogCardData) => void
}

export function CatalogCard({ card, onSelect, footer }: CatalogCardProps) {
  const cardContent = (
    <>
      <TradingCardImage url={card.imageUrl} name={card.name} />

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="font-display line-clamp-1 text-sm font-bold text-neutral-900">
          {card.name}
        </h3>
        {card.namePt && (
          <p
            lang="pt-BR"
            className="-mt-1.5 line-clamp-1 text-xs text-neutral-600"
          >
            {card.namePt}
          </p>
        )}

        {card.officialRarity && (
          <span className={tradingCardRarity}>{card.officialRarity}</span>
        )}

        <p className="line-clamp-1 text-xs text-neutral-500">
          {card.edition}
          {card.cardNumber ? ` · Nº ${card.cardNumber}` : ''}
        </p>

        {footer && (
          <div className="border-t border-neutral-100 pt-2 text-xs text-neutral-700">
            {footer}
          </div>
        )}
      </div>
    </>
  )

  return (
    <article className={tradingCardSurface}>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(card)}
          aria-label={`Ver detalhes de ${card.name}`}
          className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary-500"
        >
          {cardContent}
        </button>
      ) : (
        <Link
          to="/cartas/$id"
          params={{ id: card.id }}
          className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary-500"
        >
          {cardContent}
        </Link>
      )}
    </article>
  )
}
