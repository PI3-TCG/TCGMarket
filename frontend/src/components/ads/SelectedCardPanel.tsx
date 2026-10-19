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
      className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="selected-card-title"
          className="flex items-center gap-2 font-display text-lg font-bold text-primary-900 sm:text-xl"
        >
          <Icon name="grid" size={24} />
          Carta selecionada
        </h2>
        <span className="shrink-0 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-900">
          Da sua coleção
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-[240px] items-center justify-center overflow-hidden rounded-lg bg-primary-100/60 p-2">
        {hasImage ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            onError={() => setFailedImageUrl(card.imageUrl)}
            className="aspect-[5/7] w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="flex aspect-[5/7] w-full flex-col items-center justify-center gap-2 text-sm text-primary-700">
            <Icon name="grid" size={32} />
            Imagem indisponível
          </div>
        )}
      </div>

      <div className="mt-3 text-center">
        <h3 className="font-display text-lg font-bold text-primary-900">
          {card.name}
        </h3>
        <p className="mt-1 text-xs text-primary-700">
          {gameLabels[card.game] ?? card.game}
          {card.edition ? ` • ${card.edition}` : ''}
        </p>
        {details.length > 0 && (
          <p className="text-xs text-primary-700">{details.join(' • ')}</p>
        )}

        <ul
          aria-label="Dados da sua posse"
          className="mt-3 flex flex-wrap justify-center gap-2"
        >
          <li className="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700">
            <Icon name="check-circle" size={16} />
            {conditionLabels[item.condition]}
          </li>
          <li className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-900">
            <Icon name="info" size={16} />
            {languageLabels[item.language]}
          </li>
        </ul>

        {onChangeCard && (
          <button
            type="button"
            onClick={onChangeCard}
            disabled={disabled}
            className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-primary-900 underline underline-offset-2 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Alterar carta
          </button>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-primary-100/60 p-3">
        <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-primary-900">
          <Icon name="gem" size={20} />
          Disponibilidade
        </h3>
        <dl className="text-sm">
          <div className="flex justify-between gap-3 border-b border-primary-100 px-2 py-1.5">
            <dt className="text-primary-900">Na sua coleção</dt>
            <dd className="font-semibold text-primary-900">
              {availability.totalQuantity}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-primary-100 px-2 py-1.5">
            <dt className="text-primary-900">
              {published ? 'Em anúncios' : 'Em outros anúncios'}
            </dt>
            <dd className="font-semibold text-primary-900">
              {availability.committedQuantity}
            </dd>
          </div>
          <div className="mt-1 flex justify-between gap-3 rounded-md bg-primary-100 px-2 py-1.5 font-semibold text-primary-900">
            <dt>Disponíveis para anunciar</dt>
            <dd>{availability.availableQuantity}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
