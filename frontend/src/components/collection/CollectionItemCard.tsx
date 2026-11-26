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
  onSetCover?: (item: CollectionItem) => void
  isCover?: boolean
}

/** Sem preço artificial; ações continuam delegadas à página de coleção. */
export function CollectionItemCard({
  item,
  onDetails,
  onEdit,
  onRemove,
  onAdvertise,
  onSetCover,
  isCover = false,
}: CollectionItemCardProps) {
  const actions = [
    { label: 'Detalhes', icon: 'search', handler: onDetails },
    { label: 'Editar', icon: 'hammer', handler: onEdit },
    { label: 'Remover', icon: 'trash', handler: onRemove },
    { label: 'Criar anúncio', icon: 'megaphone', handler: onAdvertise },
  ] as const

  return (
    <article className={tradingCardSurface}>
      <TradingCardImage url={item.card.imageUrl} name={item.card.name}>
        {isCover ? (
          <span className="absolute top-2 left-2 rounded-full bg-brand-primary px-2 py-1 text-xs font-semibold text-white">
            Capa
          </span>
        ) : null}
        <span
          aria-label={`${item.quantity} exemplares`}
          className="absolute right-2 bottom-2 rounded-control border border-border-default bg-surface-default px-2 py-1 text-xs font-bold text-text-ink shadow-sm"
        >
          ×{item.quantity}
        </span>
      </TradingCardImage>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
        <h3
          className="line-clamp-2 min-h-10 wrap-anywhere font-sans text-sm leading-5 font-bold text-text-ink"
          title={item.card.name}
        >
          {item.card.name}
        </h3>

        <p className="line-clamp-2 text-xs leading-4 text-text-secondary">
          {item.card.edition}
          {item.card.cardNumber ? ` · Nº ${item.card.cardNumber}` : ''}
        </p>

        {item.card.officialRarity && (
          <span className={tradingCardRarity}>
            {item.card.officialRarity}
          </span>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className={cardConditionBadge(item.condition)}>
            {conditionLabels[item.condition] ?? item.condition}
          </span>
          <span className={tradingCardLanguage}>
            {languageLabels[item.language] ?? item.language}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 border-t border-border-default p-2 xl:grid-cols-4">
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
            className="grid min-h-11 min-w-0 place-items-center rounded-control px-1 py-2 text-brand-primary transition-colors duration-150 enabled:cursor-pointer enabled:hover:bg-surface-brand-tint enabled:active:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            <Icon name={action.icon} size={20} />
          </button>
        ))}
      </div>
      {onSetCover ? (
        <button
          type="button"
          disabled={isCover}
          onClick={() => onSetCover(item)}
          className="min-h-11 border-t border-border-default px-3 text-sm font-semibold text-brand-primary enabled:cursor-pointer enabled:hover:bg-surface-brand-tint disabled:cursor-default disabled:text-text-secondary"
        >
          {isCover ? 'Capa da coleção' : 'Usar como capa'}
        </button>
      ) : null}
    </article>
  )
}
