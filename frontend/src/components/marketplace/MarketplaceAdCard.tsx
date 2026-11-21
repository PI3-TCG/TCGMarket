import { Link } from '@tanstack/react-router'
import { AdListingCard } from '@/components/ads/AdListingCard'
import { ReputationIndicator } from '@/components/profile/ReputationIndicator'
import { Icon } from '@/components/ui/Icon'
import { tradingCardDetailsButton } from '@/components/ui/tradingCardStyles'
import type { MarketplaceAd } from '@/types/Marketplace'

export function MarketplaceAdCard({ ad }: { ad: MarketplaceAd }) {
  return (
    <AdListingCard
      {...ad}
      seller={
        <div className="space-y-1 text-xs text-neutral-700">
          {ad.sellerUsername ? (
            <Link
              to="/jogadores/$username"
              params={{ username: ad.sellerUsername }}
              className="flex min-w-0 items-center gap-1 font-semibold underline"
            >
              <Icon name="user" size={16} />
              <span className="truncate">@{ad.sellerUsername}</span>
            </Link>
          ) : (
            <p>Vendedor</p>
          )}
          <ReputationIndicator summary={ad.sellerReputation} />
        </div>
      }
    >
      <Link
        to="/marketplace/anuncios/$id"
        params={{ id: ad.id }}
        aria-label={`Ver detalhes do anúncio de ${ad.cardName}`}
        className={tradingCardDetailsButton}
      >
        Ver detalhes
      </Link>
    </AdListingCard>
  )
}
