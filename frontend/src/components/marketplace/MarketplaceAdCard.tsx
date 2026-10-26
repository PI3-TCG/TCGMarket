import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'
import { formatCurrency } from '@/components/ads/adFormat'
import type { MarketplaceAd } from '@/types/Marketplace'

type Props = {
  ad: MarketplaceAd
}

const gameLabels: Record<string, string> = {
  POKEMON: 'Pokémon',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
  YUGIOH: 'Yu-Gi-Oh!',
}

const conditionLabels: Record<string, string> = {
  NEAR_MINT: 'Near Mint',
  LIGHTLY_PLAYED: 'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED: 'Heavily Played',
  DAMAGED: 'Danificada',
}

const languageLabels: Record<string, string> = {
  PORTUGUESE: 'Português',
  ENGLISH: 'Inglês',
  JAPANESE: 'Japonês',
}

export function MarketplaceAdCard({ ad }: Props) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)

  const hasImage = Boolean(
    ad.imageUrl && ad.imageUrl !== failedImageUrl,
  )

  const cardInfo = [ad.cardNumber, ad.rarity]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex aspect-[4/5] items-center justify-center bg-neutral-100 p-3">
        {hasImage ? (
          <img
            src={ad.imageUrl ?? undefined}
            alt={ad.cardName}
            loading="lazy"
            onError={() => setFailedImageUrl(ad.imageUrl)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-primary-900">
            <Icon name="gem" size={32} />
            <span className="text-xs">Imagem indisponível</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs font-semibold text-primary-900">
          {gameLabels[ad.game] ?? ad.game}
        </p>

        <p
          className="truncate text-xs text-neutral-700"
          title={ad.edition}
        >
          {ad.edition}
        </p>

        <h2
          className="line-clamp-2 min-h-10 text-sm font-bold text-neutral-900"
          title={ad.cardName}
        >
          {ad.cardName}
        </h2>

        {cardInfo && (
          <p
            className="truncate text-xs text-neutral-700"
            title={cardInfo}
          >
            {cardInfo}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {ad.saleEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-900">
              <Icon name="cart" size={16} />
              Venda
            </span>
          )}

          {ad.tradeEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-1 text-xs font-semibold text-info-700">
              <span aria-hidden="true">⇄</span>
              Troca
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-700">
          {conditionLabels[ad.condition] ?? ad.condition}
          {' · '}
          {languageLabels[ad.language] ?? ad.language}
        </p>

        <p className="text-xs font-semibold text-neutral-900">
          {ad.remainingQuantity}{' '}
          {ad.remainingQuantity === 1
            ? 'unidade disponível'
            : 'unidades disponíveis'}
        </p>

        <p className="flex min-w-0 items-center gap-1 text-xs text-neutral-700">
          <Icon name="user" size={16} />
          <span className="truncate">
            {ad.sellerUsername
              ? `@${ad.sellerUsername}`
              : 'Vendedor'}
          </span>
        </p>

        <div className="mt-auto pt-3">
          {ad.saleEnabled ? (
            ad.unitPrice !== null ? (
              <p className="font-display text-lg font-bold text-primary-900">
                {formatCurrency(ad.unitPrice)}
                <span className="ml-1 font-sans text-xs font-normal text-neutral-700">
                  / un.
                </span>
              </p>
            ) : (
              <p className="text-sm text-neutral-700">
                Preço indisponível
              </p>
            )
          ) : (
            <p className="text-sm font-semibold text-info-700">
              Disponível para troca
            </p>
          )}
        </div>

        <Link
          to="/marketplace/anuncios/$id"
          params={{ id: ad.id }}
          aria-label={`Ver detalhes do anúncio de ${ad.cardName}`}
          className="mt-1 w-full rounded-control bg-primary-900 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}