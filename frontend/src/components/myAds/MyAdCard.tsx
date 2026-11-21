import { AdListingCard } from '@/components/ads/AdListingCard'
import { Icon, type IconName } from '@/components/ui/Icon'
import { tradingCardDetailsButton } from '@/components/ui/tradingCardStyles'
import type { OwnAd } from '@/types/Ad'
import { AdStatusBadge } from './AdStatusBadge'

type MyAdCardProps = {
  ad: OwnAd
  onDetails: (ad: OwnAd) => void
  onEdit: (ad: OwnAd) => void
  onCancel: (ad: OwnAd) => void
}

export function MyAdCard({ ad, onDetails, onEdit, onCancel }: MyAdCardProps) {
  return (
    <AdListingCard
      {...ad}
      cardName={ad.card.name}
      imageUrl={ad.card.imageUrl}
      rarity={ad.card.officialRarity}
      status={<AdStatusBadge status={ad.status} highlighted />}
      priceBesideModality
    >
      <button
        type="button"
        className={tradingCardDetailsButton}
        aria-label={`Ver detalhes do anúncio de ${ad.card.name}`}
        onClick={() => onDetails(ad)}
      >
        Ver detalhes
      </button>
      <div className="grid min-h-12 grid-cols-2 gap-2">
        {ad.status === 'ACTIVE' && (
          <>
            <CardAction
              icon="hammer"
              label="Editar"
              cardName={ad.card.name}
              onClick={() => onEdit(ad)}
            />
            <CardAction
              icon="close-circle"
              label="Cancelar"
              cardName={ad.card.name}
              onClick={() => onCancel(ad)}
              danger
            />
          </>
        )}
      </div>
    </AdListingCard>
  )
}

function CardAction({
  icon,
  label,
  cardName,
  onClick,
  danger = false,
}: {
  icon: IconName
  label: string
  cardName: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label === 'Cancelar' ? 'Cancelar anúncio' : label}: ${cardName}`}
      className={`flex min-h-12 cursor-pointer rounded-control flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
        danger
          ? 'text-error-700 hover:bg-error-50'
          : 'text-primary-900 hover:bg-primary-100'
      }`}
    >
      <Icon name={icon} size={16} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
