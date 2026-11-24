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

/** Mantém as operações existentes condicionadas ao status do anúncio. */
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
      <div className="grid min-h-11 w-full grid-cols-2 gap-2">
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
      className={`flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-control px-1 py-2 font-sans text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue motion-reduce:transition-none ${
        danger
          ? 'text-state-error hover:bg-error-50 active:bg-error-50'
          : 'text-brand-primary hover:bg-surface-brand-tint active:bg-surface-subtle'
      }`}
    >
      <Icon name={icon} size={20} />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  )
}
