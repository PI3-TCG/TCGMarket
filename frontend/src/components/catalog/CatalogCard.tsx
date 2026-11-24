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

/** Catálogo exibe metadados da carta, sem preço ou estoque inventado. */
export function CatalogCard({ card, onSelect, footer }: CatalogCardProps) {
  const cardContent = (
    <>
      <TradingCardImage url={card.imageUrl} name={card.name} />

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
        <h3
          className="line-clamp-2 min-h-10 wrap-anywhere font-sans text-sm leading-5 font-bold text-text-ink"
          title={card.name}
        >
          {card.name}
        </h3>
        {card.namePt && (
          <p lang="pt-BR" className="line-clamp-2 text-sm text-text-secondary">
            {card.namePt}
          </p>
        )}

        {card.officialRarity && (
          <span className={tradingCardRarity}>{card.officialRarity}</span>
        )}

        <p className="line-clamp-2 text-xs leading-4 text-text-secondary">
          {card.edition}
          {card.cardNumber ? ` · Nº ${card.cardNumber}` : ''}
        </p>

        {footer && (
          <div className="mt-auto border-t border-border-default pt-2 text-sm text-text-secondary">
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
          className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-support-blue"
        >
          {cardContent}
        </button>
      ) : (
        <Link
          to="/cartas/$id"
          params={{ id: card.id }}
          aria-label={`Ver detalhes de ${card.name}`}
          className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-support-blue"
        >
          {cardContent}
        </Link>
      )}
    </article>
  )
}
