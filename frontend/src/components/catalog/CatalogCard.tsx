import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { CatalogCard as CatalogCardData } from '@/types/Catalog'

type CatalogCardProps = {
  card: CatalogCardData
  onSelect: (card: CatalogCardData) => void
}

export function CatalogCard({ card, onSelect }: CatalogCardProps) {
  return (
    <Card interactive className="group h-full">
      <button
        type="button"
        onClick={() => onSelect(card)}
        className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary-500"
        aria-label={`Ver detalhes de ${card.name}`}
      >
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-white to-secondary-100 p-4">
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-900 shadow-sm">TCG</span>
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            loading="lazy"
            className="h-full max-w-full object-contain drop-shadow-[0_14px_14px_rgba(32,20,64,0.22)] transition-transform duration-300 group-hover:scale-[1.06]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <h3 className="line-clamp-1 font-display text-sm font-bold text-neutral-900">{card.name}</h3>
          <p className="line-clamp-1 text-xs text-neutral-500">{card.edition} · Nº {card.cardNumber}</p>
          <div className="mt-auto pt-1"><Badge variant={card.officialRarity.toLowerCase().includes('rare') ? 'rare' : 'neutral'}>{card.officialRarity}</Badge></div>
        </div>
      </button>
    </Card>
  )
}
