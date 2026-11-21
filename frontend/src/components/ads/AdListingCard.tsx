import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { TradingCardImage } from '@/components/ui/TradingCard'
import {
  cardConditionBadge,
  tradingCardLanguage,
  tradingCardRarity,
  tradingCardSurface,
} from '@/components/ui/tradingCardStyles'
import type { MarketplaceAd } from '@/types/Marketplace'
import { conditionLabels, formatCurrency, languageLabels } from './adFormat'

type Props = Pick<
  MarketplaceAd,
  | 'cardName'
  | 'imageUrl'
  | 'condition'
  | 'language'
  | 'saleEnabled'
  | 'tradeEnabled'
  | 'unitPrice'
> & {
  rarity?: string | null
  status?: ReactNode
  priceBesideModality?: boolean
  seller?: ReactNode
  children: ReactNode
}

export function AdListingCard({
  cardName,
  imageUrl,
  condition,
  language,
  saleEnabled,
  tradeEnabled,
  unitPrice,
  rarity,
  status,
  priceBesideModality = false,
  seller,
  children,
}: Props) {
  const price =
    saleEnabled && unitPrice !== null ? (
      <p className="wrap-anywhere font-display text-lg font-bold text-primary-900">
        {formatCurrency(unitPrice)}
        <span className="ml-1 font-sans text-xs font-normal text-neutral-700">
          / un.
        </span>
      </p>
    ) : saleEnabled ? (
      <p className="text-sm text-neutral-700">Preço indisponível</p>
    ) : (
      <p className="text-sm font-semibold text-info-700">
        Disponível para troca
      </p>
    )

  return (
    <article className={tradingCardSurface}>
      <TradingCardImage url={imageUrl} name={cardName}>
        {status && <div className="absolute top-2 right-2">{status}</div>}
      </TradingCardImage>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3
          className="line-clamp-2 wrap-anywhere text-sm font-bold text-neutral-900"
          title={cardName}
        >
          {cardName}
        </h3>
        {rarity && <span className={tradingCardRarity}>{rarity}</span>}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cardConditionBadge(condition)}>
            {conditionLabels[condition] ?? condition}
          </span>
          <span className={tradingCardLanguage}>
            {languageLabels[language] ?? language}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {saleEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-900">
              <Icon name="cart" size={16} />
              Venda
            </span>
          )}
          {tradeEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-1 text-xs font-semibold text-info-700">
              <Icon name="arrows-right-left" size={16} />
              Troca
            </span>
          )}
          {priceBesideModality && saleEnabled && price}
        </div>

        {seller}

        <div className="mt-auto space-y-2 pt-1">
          {!priceBesideModality && price}
          {children}
        </div>
      </div>
    </article>
  )
}
