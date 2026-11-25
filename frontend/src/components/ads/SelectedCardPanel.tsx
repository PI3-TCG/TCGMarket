import { cardConditionBadge, tradingCardLanguage } from '@/components/ui/tradingCardStyles'
import { checkoutPanel } from '@/components/checkout/checkoutStyles'
import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type {
  CollectionItem,
  CollectionItemAvailability,
} from '@/types/Collection'
import { conditionLabels, gameLabels, languageLabels } from './adFormat'

type Props = {
  item: CollectionItem
  availability: CollectionItemAvailability
  /** Depois de publicar, o comprometido inclui o anúncio recém-criado. */
  published?: boolean
  onChangeCard?: () => void
  disabled?: boolean
}

export function SelectedCardPanel({
  item,
  availability,
  published = false,
  onChangeCard,
  disabled = false,
}: Props) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const { card } = item
  const hasImage = Boolean(card.imageUrl) && failedImageUrl !== card.imageUrl
  const details = [card.cardNumber, card.officialRarity].filter(Boolean)

  return (
    <section
      aria-labelledby="selected-card-title"
      className={`${checkoutPanel} flex flex-col`}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="selected-card-title"
          className="flex items-center gap-2 font-title text-lg font-bold text-brand-primary sm:text-xl"
        >
          <Icon name="grid" size={24} />
          Carta selecionada
        </h2>
        <span className="max-w-full wrap-anywhere rounded-full bg-surface-sand px-3 py-1 text-xs font-semibold text-brand-primary">
          Da sua coleção
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-[240px] items-center justify-center overflow-hidden rounded-lg bg-surface-sand/50 p-2">
        {hasImage ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            onError={() => setFailedImageUrl(card.imageUrl)}
            className="aspect-[5/7] w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="flex aspect-[5/7] w-full flex-col items-center justify-center gap-2 text-sm text-text-secondary">
            <Icon name="grid" size={32} />
            Imagem indisponível
          </div>
        )}
      </div>

      <div className="mt-3 wrap-anywhere text-center">
        <h3 className="font-title text-lg font-bold text-brand-primary">
          {card.name}
        </h3>
        <p className="mt-1 text-xs text-text-secondary">
          {gameLabels[card.game] ?? card.game}
          {card.edition ? ` • ${card.edition}` : ''}
        </p>
        {details.length > 0 && (
          <p className="text-xs text-text-secondary">{details.join(' • ')}</p>
        )}

        <ul
          aria-label="Dados da sua posse"
          className="mt-3 flex flex-wrap justify-center gap-2"
        >
          <li className={`${cardConditionBadge(item.condition)} gap-1`}>
            <Icon name="check-circle" size={16} />
            {conditionLabels[item.condition]}
          </li>
          <li className={`${tradingCardLanguage} gap-1`}>
            <Icon name="info" size={16} />
            {languageLabels[item.language]}
          </li>
        </ul>

        {onChangeCard && (
          <button
            type="button"
            onClick={onChangeCard}
            disabled={disabled}
            className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-brand-primary underline underline-offset-2 hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            Alterar carta
          </button>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-surface-sand/50 p-3">
        <h3 className="mb-2 flex items-center gap-2 font-title text-base font-bold text-brand-primary">
          <Icon name="gem" size={20} />
          Disponibilidade
        </h3>
        <dl className="text-sm">
          <div className="flex justify-between gap-3 border-b border-border-default px-2 py-1.5">
            <dt className="text-brand-primary">Na sua coleção</dt>
            <dd className="font-semibold text-brand-primary">
              {availability.totalQuantity}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-border-default px-2 py-1.5">
            <dt className="text-brand-primary">
              {published ? 'Em anúncios' : 'Em outros anúncios'}
            </dt>
            <dd className="font-semibold text-brand-primary">
              {availability.committedQuantity}
            </dd>
          </div>
          <div className="mt-1 flex justify-between gap-3 rounded-md bg-surface-sand px-2 py-1.5 font-semibold text-brand-primary">
            <dt>Disponíveis para anunciar</dt>
            <dd>{availability.availableQuantity}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
