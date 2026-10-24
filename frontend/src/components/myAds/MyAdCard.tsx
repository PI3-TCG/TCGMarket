import { useState } from 'react'
import {
  conditionLabels,
  formatCurrency,
  gameLabels,
  languageLabels,
} from '@/components/ads/adFormat'
import { Card } from '@/components/ui/Card'
import { Icon, type IconName } from '@/components/ui/Icon'
import type { OwnAd } from '@/types/Ad'
import { AdStatusBadge } from './AdStatusBadge'

type MyAdCardProps = {
  ad: OwnAd
  onDetails: (ad: OwnAd) => void
  onEdit: (ad: OwnAd) => void
  onCancel: (ad: OwnAd) => void
}

export function MyAdCard({ ad, onDetails, onEdit, onCancel }: MyAdCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const hasImage =
    Boolean(ad.card.imageUrl) && failedImageUrl !== ad.card.imageUrl
  const active = ad.status === 'ACTIVE'

  return (
    <Card className="flex h-full min-w-0 flex-col">
      <div className="flex gap-3 p-3">
        <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-100">
          {hasImage ? (
            <img
              src={ad.card.imageUrl}
              alt={ad.card.name}
              loading="lazy"
              onError={() => setFailedImageUrl(ad.card.imageUrl)}
              className="h-full w-full object-contain"
            />
          ) : (
            <Icon name="grid" size={24} className="text-primary-700" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <AdStatusBadge status={ad.status} />
          <h3 className="font-display text-sm font-bold break-words text-neutral-900">
            {ad.card.name}
          </h3>
          <p className="text-xs break-words text-neutral-500">
            {gameLabels[ad.card.game] ?? ad.card.game} • {ad.card.edition}
            {ad.card.cardNumber ? ` · ${ad.card.cardNumber}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-700">
            {conditionLabels[ad.condition]}
          </span>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-900">
            {languageLabels[ad.language]}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {ad.saleEnabled && (
            <span className="rounded-md bg-primary-900 px-3 py-1 text-xs font-semibold text-white">
              Venda
            </span>
          )}
          {ad.tradeEnabled && (
            <span className="rounded-md border border-secondary-300 bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
              Troca
            </span>
          )}
        </div>

        <div className="mt-auto text-center">
          <p
            className={`font-display text-base font-bold ${
              ad.saleEnabled ? 'text-primary-900' : 'text-secondary-700'
            }`}
          >
            {ad.saleEnabled && ad.unitPrice !== null
              ? `${formatCurrency(ad.unitPrice)} por un.`
              : 'Somente troca'}
          </p>
          <p
            className={`text-xs ${
              ad.status === 'PENDING' ? 'text-warning-700' : 'text-neutral-700'
            }`}
          >
            {ad.status === 'PENDING'
              ? 'Aguardando pagamento'
              : ad.status === 'CANCELLED'
                ? 'Cancelado'
                : `Restantes: ${ad.remainingQuantity}`}
          </p>
        </div>
      </div>

      <div
        className={`grid border-t border-neutral-200 ${active ? 'grid-cols-3' : 'grid-cols-1'}`}
      >
        <CardAction
          icon="search"
          label="Detalhes"
          cardName={ad.card.name}
          onClick={() => onDetails(ad)}
        />
        {active && (
          <>
            <CardAction
              icon="settings"
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
    </Card>
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
      className={`flex min-h-12 cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
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
