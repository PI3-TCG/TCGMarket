import { useCallback, useState } from 'react'
import { DetailsModal } from '@/components/ui/DetailsModal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { formatCurrency } from '@/components/ads/adFormat'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMarketplaceAd } from '@/services/marketplace'
import type { MarketplaceAd } from '@/types/Marketplace'

type Props = {
  adId: string
  onClose: () => void
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

export function MarketplaceAdDetailsModal({
  adId,
  onClose,
}: Props) {
  const fetchAd = useCallback(
    () => getMarketplaceAd(adId),
    [adId],
  )

  const { state, retry } = useRemoteData(
    `marketplace-ad:${adId}`,
    fetchAd,
  )

  const ad = state.status === 'ready' ? state.data : null

  return (
    <DetailsModal
      title={ad?.cardName ?? 'Detalhes do anúncio'}
      eyebrow="Marketplace / Detalhes"
      footerText="Explorando anúncios do marketplace"
      onClose={onClose}
    >
      {state.status === 'loading' && (
        <div
          role="status"
          aria-busy="true"
          className="grid gap-3.5 sm:grid-cols-[228px_minmax(0,1fr)]"
        >
          <div
            aria-hidden="true"
            className="h-72 rounded-2xl bg-primary-100 motion-safe:animate-pulse"
          />

          <div className="space-y-4 rounded-2xl bg-white p-5">
            <div
              aria-hidden="true"
              className="h-7 w-3/4 rounded bg-primary-100 motion-safe:animate-pulse"
            />
            <div
              aria-hidden="true"
              className="h-4 w-1/2 rounded bg-primary-100 motion-safe:animate-pulse"
            />
            <div
              aria-hidden="true"
              className="h-28 rounded-xl bg-primary-100 motion-safe:animate-pulse"
            />

            <p className="text-sm text-neutral-700">
              Carregando anúncio...
            </p>
          </div>
        </div>
      )}

      {state.status === 'notFound' && (
        <div
          role="status"
          className="rounded-2xl border border-primary-300/30 bg-white px-5 py-10 text-center"
        >
          <Icon
            name="info"
            size={32}
            className="mx-auto text-primary-900"
          />

          <h3 className="mt-3 font-display text-lg font-bold text-primary-900">
            Anúncio indisponível
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-700">
            Este anúncio não existe ou não está mais disponível.
            Ele pode ter sido cancelado ou esgotado.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-2xl border border-primary-300/30 bg-white px-5 py-10 text-center"
        >
          <Icon
            name="alert"
            size={32}
            className="mx-auto text-error-700"
          />

          <h3 className="mt-3 font-display text-lg font-bold text-primary-900">
            Não foi possível carregar o anúncio
          </h3>

          <p className="mt-2 text-sm text-neutral-700">
            Verifique sua conexão e tente novamente.
          </p>

          <Button className="mt-4" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {ad && <AdDetails key={ad.id} ad={ad} />}
    </DetailsModal>
  )
}

function AdDetails({ ad }: { ad: MarketplaceAd }) {
  const [failedImageUrl, setFailedImageUrl] =
    useState<string | null>(null)

  const hasImage = Boolean(
    ad.imageUrl && ad.imageUrl !== failedImageUrl,
  )

  const details = [
    {
      label: 'Número',
      value: ad.cardNumber || 'Não informado',
    },
    {
      label: 'Raridade',
      value: ad.rarity || 'Não informada',
    },
    {
      label: 'Condição',
      value: conditionLabels[ad.condition] ?? ad.condition,
    },
    {
      label: 'Idioma',
      value: languageLabels[ad.language] ?? ad.language,
    },
    {
      label: 'Disponibilidade',
      value: `${ad.remainingQuantity} ${
        ad.remainingQuantity === 1 ? 'unidade' : 'unidades'
      }`,
    },
    {
      label: 'Vendedor',
      value: ad.sellerUsername
        ? `@${ad.sellerUsername}`
        : 'Não informado',
    },
  ]

  return (
    <div className="space-y-3.5">
      <div className="grid items-start gap-3.5 sm:grid-cols-[228px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-primary-300/30 bg-gradient-to-br from-primary-100 via-white to-primary-300/20 p-3 shadow-sm">
          <div className="flex min-h-[255px] items-center justify-center rounded-xl bg-white/70 p-2">
            {hasImage ? (
              <img
                src={ad.imageUrl ?? undefined}
                alt={ad.cardName}
                onError={() => setFailedImageUrl(ad.imageUrl)}
                className="mx-auto max-h-[300px] w-auto max-w-full object-contain drop-shadow-[0_8px_12px_rgba(102,3,102,0.15)]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-700">
                <Icon name="grid" size={32} />
                <span className="text-xs">
                  Imagem indisponível
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] text-primary-800">
            Imagem de referência do catálogo
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-primary-300/30 bg-white p-4 shadow-sm sm:p-5">
          <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-[11px] font-semibold text-primary-900">
            {gameLabels[ad.game] ?? ad.game}
          </span>

          <h3 className="mt-3 break-words font-display text-xl font-bold leading-tight text-primary-900 sm:text-2xl">
            {ad.cardName}
          </h3>

          <p className="mt-1 break-words text-xs text-neutral-700">
            {ad.edition || 'Edição não informada'}
          </p>

          <div className="mt-4 rounded-xl border border-primary-300/20 bg-primary-100/40 p-3">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-800">
              Informações do anúncio
            </h4>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {details.map(({ label, value }) => (
                <div key={label} className="min-w-0">
                  <dt className="text-neutral-700">
                    {label}
                  </dt>
                  <dd className="mt-0.5 break-words font-semibold text-primary-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-800">
              Modalidades aceitas
            </h4>

            <div className="mt-2 flex flex-wrap gap-2">
              {ad.saleEnabled && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-primary-300/30 bg-primary-100 px-3 py-2 text-xs font-semibold text-primary-900">
                  <Icon name="cart" size={16} />
                  Venda
                </span>
              )}

              {ad.tradeEnabled && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-secondary-300/40 bg-secondary-100 px-3 py-2 text-xs font-semibold text-info-700">
                  <span aria-hidden="true" className="text-base">
                    ⇄
                  </span>
                  Troca
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section
        aria-label="Preço do anúncio"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-300/30 bg-gradient-to-r from-primary-100 to-primary-100/40 px-4 py-4 sm:px-5"
      >
        <div>
          <h4 className="text-xs font-semibold text-primary-800">
            {ad.saleEnabled ? 'Preço por unidade' : 'Modalidade'}
          </h4>

          <p className="mt-1 font-display text-xl font-bold text-primary-900 sm:text-2xl">
            {ad.saleEnabled
              ? ad.unitPrice !== null
                ? formatCurrency(ad.unitPrice)
                : 'Preço indisponível'
              : 'Somente troca'}
          </p>
        </div>

        <p className="rounded-lg border border-primary-300/30 bg-white/80 px-3 py-2 text-xs font-semibold text-primary-900">
          {ad.remainingQuantity}{' '}
          {ad.remainingQuantity === 1
            ? 'unidade disponível'
            : 'unidades disponíveis'}
        </p>
      </section>

      {ad.description?.trim() && (
        <section
          aria-label="Descrição do anúncio"
          className="overflow-hidden rounded-2xl border border-primary-300/30 bg-white shadow-sm"
        >
          <div className="border-b border-primary-300/20 bg-primary-100/60 px-4 py-3">
            <h4 className="text-xs font-bold text-primary-900">
              Descrição do anúncio
            </h4>
          </div>

          <p className="whitespace-pre-wrap break-words p-4 text-sm leading-relaxed text-neutral-700">
            {ad.description}
          </p>
        </section>
      )}
    </div>
  )
}