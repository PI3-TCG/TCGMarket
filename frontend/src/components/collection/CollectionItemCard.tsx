import { conditionLabels, languageLabels } from '@/components/ads/adFormat'
import { Icon } from '@/components/ui/Icon'
import { TradingCardImage } from '@/components/ui/TradingCard'
import {
  cardConditionBadge,
  tradingCardLanguage,
  tradingCardRarity,
  tradingCardSurface,
} from '@/components/ui/tradingCardStyles'
import type { CollectionItem } from '@/types/Collection'

type CollectionItemCardProps = {
  item: CollectionItem
  onDetails?: (item: CollectionItem) => void
  onEdit?: (item: CollectionItem) => void
  onRemove?: (item: CollectionItem) => void
  onAdvertise?: (item: CollectionItem) => void
}

export function CollectionItemCard({
  item,
  onDetails,
  onEdit,
  onRemove,
  onAdvertise,
}: CollectionItemCardProps) {
  const actions = [
    { label: 'Detalhes', icon: 'search', handler: onDetails },
    { label: 'Editar', icon: 'hammer', handler: onEdit },
    { label: 'Remover', icon: 'trash', handler: onRemove },
    { label: 'Anunciar', icon: 'megaphone', handler: onAdvertise },
  ] as const

  return (
    <article className={tradingCardSurface}>
      <TradingCardImage url={item.card.imageUrl} name={item.card.name}>
        <span
          aria-label={`${item.quantity} exemplares`}
          className="absolute right-2 bottom-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-neutral-900"
        >
          ×{item.quantity}
        </span>
      </TradingCardImage>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-display text-sm font-bold wrap-anywhere text-neutral-900">
          {item.card.name}
        </h3>

        <p className="text-xs text-neutral-500">
          {item.card.edition}
          {item.card.cardNumber ? ` · Nº ${item.card.cardNumber}` : ''}
        </p>

        <span className={tradingCardRarity}>{item.card.officialRarity}</span>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className={cardConditionBadge(item.condition)}>
            {conditionLabels[item.condition] ?? item.condition}
          </span>
          <span className={tradingCardLanguage}>
            {languageLabels[item.language] ?? item.language}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-1 border-t border-neutral-200 p-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={!action.handler}
            onClick={() => action.handler?.(item)}
            aria-label={`${action.label}: ${item.card.name}`}
            title={
              action.handler
                ? action.label
                : `${action.label} — ainda não disponível nesta prévia`
            }
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-primary-900 transition-colors enabled:cursor-pointer enabled:hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name={action.icon} size={16} />
            <span className="text-[10px] font-medium text-neutral-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </article>
  )
}
