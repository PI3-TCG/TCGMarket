import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { CatalogCard as CatalogCardData } from '@/types/Catalog'

type CatalogCardProps = {
  card: CatalogCardData
  onSelect?: (card: CatalogCardData) => void
}

export function CatalogCard({ card, onSelect }: CatalogCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const cardContent = (
    <>
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-50 p-3">
        {card.imageUrl && !imageFailed ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <span aria-hidden="true" className="text-4xl">
              🃏
            </span>
            <span className="text-xs">Imagem indisponível</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="font-display line-clamp-1 text-sm font-bold text-neutral-900">
          {card.name}
        </h3>

        <p className="line-clamp-1 text-xs text-neutral-500">
          {card.edition}
          {card.cardNumber ? ` · Nº ${card.cardNumber}` : ''}
        </p>

        <div className="mt-auto pt-1">
          <Badge
            variant={
              card.officialRarity.toLowerCase().includes('rare')
                ? 'rare'
                : 'neutral'
            }
          >
            {card.officialRarity}
          </Badge>
        </div>
      </div>
    </>
  )

  return (
    <Card interactive className="group h-full">
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
    </Card>
  )
}
