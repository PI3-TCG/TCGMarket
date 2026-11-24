import { useCallback, useState } from 'react'

import { fetchCatalogCard, localizedName } from '@/services/catalogApi'
import { ImageLanguageToggle } from '@/components/catalog/ImageLanguageToggle'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  GAME_INFO,
  attackCost,
  attacks,
  commonRows,
  gameRows,
  highlightChips,
  imageAlt,
  rulesText,
  setLine,
  toCatalogCard,
} from './cardDetailsFormat'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import type { CatalogCard, CatalogCardDetails } from '@/types/Catalog'

type Props = {
  cardId: string
  context?: 'catalog' | 'collection'
  onClose: () => void
  onAdd?: (card: CatalogCard) => void
  onAddToCollection?: (card: CatalogCardDetails) => void
  onCreateListing?: (card: CatalogCardDetails) => void
}

const detailButton =
  'inline-flex min-h-11 items-center justify-center gap-2 text-center disabled:cursor-not-allowed disabled:opacity-50'

export function CardDetailsModal({
  cardId,
  context = 'catalog',
  onClose,
  onAdd,
  onAddToCollection,
  onCreateListing,
}: Props) {
  const [showPt, setShowPt] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)

  const loadCard = useCallback(() => fetchCatalogCard(cardId), [cardId])
  const { state, retry } = useRemoteData(cardId, loadCard)
  const card = state.status === 'ready' ? state.data : null
  const ptImage = card?.localizations?.pt?.imageUrl ?? null
  const imageUrl = showPt && ptImage ? ptImage : (card?.imageUrl ?? null)
  const isCollection = context === 'collection'
  const canPerformAction = isCollection
    ? Boolean(onCreateListing)
    : Boolean(onAdd || onAddToCollection)

  function handlePrimaryAction() {
    if (!card) return
    if (isCollection) {
      onCreateListing?.(card)
    } else if (onAdd) {
      onAdd(toCatalogCard(card))
    } else {
      onAddToCollection?.(card)
    }
  }

  const detailRows = card ? [...commonRows(card), ...gameRows(card)] : []
  const cardAttacks = card ? attacks(card) : []
  const cardRules = card ? rulesText(card) : null
  const translatedName = card
    ? localizedName(card.name, card.localizations)
    : null
  const imageAvailable = Boolean(card && imageUrl && imageUrl !== failedImageUrl)

  return (
    <Modal
      open
      presentation="refined"
      headerLayout="compact"
      size="lg"
      className="mx-auto max-w-[900px]"
      title={card?.name ?? 'Detalhes da carta'}
      eyebrow={`${isCollection ? 'Minha coleção' : 'Catálogo'} / Detalhes`}
      onClose={onClose}
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={cn(detailButton, modalSecondaryButton)}
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!card || !canPerformAction}
            className={cn(detailButton, modalPrimaryButton)}
          >
            <Icon name={isCollection ? 'cart' : 'plus'} size={16} />
            {isCollection ? 'Criar anúncio' : 'Adicionar à coleção'}
          </button>
        </div>
      }
    >
      {state.status === 'loading' && (
        <div
          role="status"
          aria-label="Carregando detalhes da carta"
          className="grid gap-5 motion-safe:animate-pulse sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]"
        >
          <div aria-hidden="true" className="aspect-5/7 rounded-surface bg-surface-subtle" />
          <div aria-hidden="true" className="space-y-4 pt-4">
            <div className="h-8 w-3/4 rounded-control bg-surface-subtle" />
            <div className="h-4 w-1/2 rounded-control bg-surface-subtle" />
            <div className="h-24 rounded-control bg-surface-subtle" />
          </div>
          <span className="sr-only">Carregando detalhes da carta...</span>
        </div>
      )}

      {(state.status === 'notFound' || state.status === 'error') && (
        <div className="mx-auto max-w-md rounded-surface border border-border-default bg-surface-input px-6 py-8 text-center shadow-sm">
          <Icon name="info" size={32} className="mx-auto text-brand-primary" />
          <h3 className="mt-3 font-title text-2xl font-bold text-text-ink">
            {state.status === 'notFound'
              ? 'Carta não encontrada'
              : 'Não foi possível carregar a carta'}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {state.status === 'notFound'
              ? 'Esta carta não está disponível no catálogo.'
              : 'Confira sua conexão e tente novamente.'}
          </p>
          <button
            type="button"
            onClick={retry}
            className={cn(detailButton, modalSecondaryButton, 'mt-5')}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {card && (
        <div className="space-y-5">
          <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,255px)_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[minmax(0,285px)_minmax(0,1fr)]">
            <aside className="mx-auto w-full max-w-[310px] sm:max-w-none">
              <div className="rounded-surface border border-border-default bg-surface-input p-3 shadow-sm">
                {ptImage && (
                  <div className="mb-3 flex justify-center">
                    <ImageLanguageToggle showPt={showPt} onChange={setShowPt} />
                  </div>
                )}
                <div className="flex aspect-5/7 items-center justify-center overflow-hidden rounded-control bg-surface-default p-2">
                  {imageAvailable ? (
                    <a
                      href={imageUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir imagem original de ${card.name} em uma nova aba`}
                      className="group/card-image flex h-full w-full cursor-zoom-in items-center justify-center rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
                    >
                      <img
                        src={imageUrl ?? undefined}
                        alt={imageAlt(card)}
                        onError={() => setFailedImageUrl(imageUrl)}
                        className="max-h-full max-w-full rounded-md object-contain drop-shadow-[0_6px_12px_rgba(49,11,67,0.14)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/card-image:scale-[1.07] motion-safe:group-focus-visible/card-image:scale-[1.07]"
                      />
                    </a>
                  ) : (
                    <div
                      role="img"
                      aria-label={`Imagem indisponível: ${card.name}`}
                      className="flex flex-col items-center gap-2 text-center text-sm text-text-secondary"
                    >
                      <Icon name="gem" size={32} />
                      Imagem indisponível
                    </div>
                  )}
                </div>
              </div>
              {imageAvailable && (
                <p className="mt-2 text-center text-xs text-text-secondary">
                  Clique na carta para ver a imagem original
                </p>
              )}
            </aside>

            <div className="min-w-0 space-y-4 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{GAME_INFO[card.cardGame].name}</Badge>
                {card.rarity && <Badge variant="rare">{card.rarity}</Badge>}
              </div>

              <div>
                <h3 className="font-title text-[28px] leading-[1.15] font-bold wrap-anywhere text-text-ink sm:text-[32px]">
                  {card.name}
                </h3>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {setLine(card)}
                </p>
                {translatedName && (
                  <p lang="pt-BR" className="mt-2 text-sm text-text-secondary">
                    Nome em português:{' '}
                    <span className="font-semibold text-text-primary">
                      {translatedName}
                    </span>
                  </p>
                )}
              </div>

              {highlightChips(card).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlightChips(card).map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border-emphasis/60 bg-surface-brand-tint px-3 py-1 text-xs font-semibold text-brand-deep"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border-default pt-4 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-text-secondary">Coleção</dt>
                  <dd className="mt-1 font-semibold wrap-anywhere text-text-primary">
                    {card.setName || '—'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-text-secondary">Número</dt>
                  <dd className="mt-1 font-semibold text-text-primary">
                    {card.cardNumber || '—'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-text-secondary">Raridade</dt>
                  <dd className="mt-1 font-semibold wrap-anywhere text-text-primary">
                    {card.rarity || '—'}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-text-secondary">Código do set</dt>
                  <dd className="mt-1 font-semibold text-text-primary">
                    {card.setCode || '—'}
                  </dd>
                </div>
              </dl>

              <p className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                <Icon name="info" size={16} />
                Dados oficiais do catálogo, somente leitura.
              </p>
            </div>
          </div>

          <section className="overflow-hidden rounded-surface border border-border-default bg-surface-input shadow-sm">
            <button
              type="button"
              aria-expanded={showTechnicalDetails}
              onClick={() => setShowTechnicalDetails((current) => !current)}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-brand-deep transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-support-blue"
            >
              <span className="flex items-center gap-2">
                <Icon name="info" size={16} />
                Informações completas da carta
              </span>
              <Icon
                name="chevron-down"
                size={20}
                className={cn(
                  'shrink-0 motion-safe:transition-transform',
                  showTechnicalDetails && 'rotate-180',
                )}
              />
            </button>
            {showTechnicalDetails && (
              <div className="space-y-4 border-t border-border-default p-4">
                {detailRows.length > 0 && (
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {detailRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex min-w-0 justify-between gap-3 border-b border-border-default pb-2 text-xs"
                      >
                        <dt className="text-text-secondary">{row.label}</dt>
                        <dd className="min-w-0 break-words text-right font-semibold text-text-primary">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {cardAttacks.length > 0 && (
                  <div className="rounded-control border border-border-default bg-surface-default p-4">
                    <h4 className="font-title text-lg font-bold text-text-ink">
                      Ataques
                    </h4>
                    <div className="mt-3 space-y-3">
                      {cardAttacks.map((attack, index) => (
                        <div
                          key={`${attack.name}-${index}`}
                          className="flex flex-wrap justify-between gap-2 text-xs"
                        >
                          <span className="font-semibold text-text-primary">
                            {attack.name}
                          </span>
                          <span className="text-text-secondary">
                            {attackCost(attack) || 'Sem custo'} ·{' '}
                            {attack.damage || '—'} dano
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cardRules && (
                  <p className="whitespace-pre-line rounded-control border border-border-default bg-surface-default p-4 text-xs leading-relaxed text-text-primary">
                    {cardRules}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  )
}
