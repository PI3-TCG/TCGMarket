import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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
import {
  ModalHeaderOrnaments,
  ModalGoldDivider,
  modalBody,
  modalCloseButton,
  modalFooter,
  modalFrame,
  modalHeader,
  modalHeadingIcon,
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
  'inline-flex min-h-11 items-center justify-center gap-2 text-center transition disabled:cursor-not-allowed disabled:opacity-50'

export function CardDetailsModal({
  cardId,
  context = 'catalog',
  onClose,
  onAdd,
  onAddToCollection,
  onCreateListing,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const closeCallback = useRef(onClose)
  const [showPt, setShowPt] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    closeCallback.current = onClose
  }, [onClose])

  const loadCard = useCallback(() => fetchCatalogCard(cardId), [cardId])
  const { state, retry } = useRemoteData(cardId, loadCard)
  const card = state.status === 'ready' ? state.data : null
  const ptImage = card?.localizations?.pt?.imageUrl ?? null
  const imageUrl = showPt && ptImage ? ptImage : (card?.imageUrl ?? null)
  const isCollection = context === 'collection'
  const canPerformAction = isCollection
    ? Boolean(onCreateListing)
    : Boolean(onAdd || onAddToCollection)

  useEffect(() => {
    setImageFailed(false)
  }, [imageUrl])

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCallback.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement
      if (!dialogRef.current.contains(current)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16071E]/75 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCallback.current()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'flex max-h-[92dvh] w-full max-w-[820px] flex-col overflow-hidden rounded-[23px] bg-[#F9F7FD] focus:outline-none',
          modalFrame,
        )}
      >
        <header
          className={cn('relative shrink-0 px-5 py-5 sm:px-7', modalHeader)}
        >
          <ModalHeaderOrnaments />
          <div className="relative z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <span aria-hidden="true" className={modalHeadingIcon}>
              <Icon name="gem" size={24} />
            </span>
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#F7DBFF]/85">
                {isCollection ? 'Minha coleção' : 'Catálogo'} / Detalhes
              </p>
              <h2
                id={titleId}
                className="mt-0.5 truncate font-display text-xl font-bold text-white sm:text-2xl"
              >
                {card?.name ?? 'Detalhes da carta'}
              </h2>
              <p className="mt-0.5 text-xs text-white/85 sm:text-sm">
                Informações e características da carta
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes"
              className={cn(
                'grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg transition',
                modalCloseButton,
              )}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <ModalGoldDivider />

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto px-4 py-6 text-[#332847] sm:px-7 sm:py-7',
            modalBody,
          )}
        >
          {state.status === 'loading' && (
            <div
              role="status"
              className="grid gap-5 sm:grid-cols-[245px_minmax(0,1fr)]"
            >
              <span className="sr-only">Carregando detalhes da carta...</span>
              <div
                aria-hidden="true"
                className="h-80 animate-pulse rounded-2xl bg-[#ECE3F5]"
              />
              <div aria-hidden="true" className="space-y-4 pt-5">
                <div className="h-7 w-3/4 animate-pulse rounded-lg bg-[#ECE3F5]" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-[#ECE3F5]" />
                <div className="h-24 animate-pulse rounded-lg bg-[#ECE3F5]" />
              </div>
            </div>
          )}

          {(state.status === 'notFound' || state.status === 'error') && (
            <div className="mx-auto max-w-md rounded-2xl border border-[#DFCBEA] bg-white px-6 py-8 text-center shadow-sm">
              <Icon name="info" size={32} className="mx-auto text-[#750B7B]" />
              <h3 className="mt-3 font-display text-xl font-bold text-[#61046D]">
                {state.status === 'notFound'
                  ? 'Carta não encontrada'
                  : 'Não foi possível carregar a carta'}
              </h3>
              <p className="mt-2 text-sm text-[#645B73]">
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
              <div className="grid items-center gap-6 sm:grid-cols-[245px_minmax(0,1fr)] sm:gap-8">
                <aside className="flex min-w-0 flex-col items-center">
                  <div className="w-full rounded-[20px] border border-[#DCC8E9] bg-[radial-gradient(circle_at_50%_27%,#FFFFFF_0%,#F1EBFB_70%,#EAE1F7_100%)] p-3 shadow-[0_8px_24px_rgba(65,22,89,0.10)]">
                    {ptImage && (
                      <div className="mb-3 flex justify-center">
                        <ImageLanguageToggle
                          showPt={showPt}
                          onChange={setShowPt}
                        />
                      </div>
                    )}
                    <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-white/50 p-2 sm:min-h-[305px]">
                      {imageUrl && !imageFailed ? (
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Ver imagem completa de ${card.name}`}
                          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1254BD]"
                        >
                          <img
                            src={imageUrl}
                            alt={imageAlt(card)}
                            onError={() => setImageFailed(true)}
                            className="mx-auto max-h-[325px] w-auto max-w-full rounded-lg object-contain drop-shadow-[0_10px_16px_rgba(45,15,68,0.26)]"
                          />
                        </a>
                      ) : (
                        <div
                          role="img"
                          aria-label={`Imagem indisponível: ${card.name}`}
                          className="flex flex-col items-center gap-2 text-sm text-[#786C87]"
                        >
                          <Icon name="gem" size={32} />
                          Imagem indisponível
                        </div>
                      )}
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">
                      {GAME_INFO[card.cardGame].name}
                    </Badge>
                    {card.rarity && <Badge variant="rare">{card.rarity}</Badge>}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold leading-tight text-[#29123E] sm:text-[30px]">
                      {card.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#6C538D]">
                      {setLine(card)}
                    </p>
                    {translatedName && (
                      <p lang="pt-BR" className="mt-2 text-sm text-[#63576E]">
                        Nome em português:{' '}
                        <span className="font-semibold text-[#352545]">
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
                          className="rounded-full border border-[#E0C8EC] bg-[#F1E7FA] px-3 py-1 text-xs font-semibold text-[#6D2484]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="h-px bg-[#E5DAEF]" />
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="block text-xs text-[#756A83]">
                        Coleção
                      </span>
                      <span className="mt-1 block font-semibold text-[#322240]">
                        {card.setName || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#756A83]">
                        Número
                      </span>
                      <span className="mt-1 block font-semibold text-[#322240]">
                        {card.cardNumber || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#756A83]">
                        Raridade
                      </span>
                      <span className="mt-1 block font-semibold text-[#322240]">
                        {card.rarity || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#756A83]">
                        Código do set
                      </span>
                      <span className="mt-1 block font-semibold text-[#322240]">
                        {card.setCode || '—'}
                      </span>
                    </div>
                  </div>
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-[#756A83]">
                    <Icon name="info" size={16} />
                    Dados oficiais do catálogo, somente leitura.
                  </p>
                </div>
              </div>

              {/* O conteúdo específico de cada jogo fica disponível sem poluir o resumo. */}
              <div className="overflow-hidden rounded-2xl border border-[#DFD0ED] bg-white/75 shadow-[0_3px_12px_rgba(77,31,99,0.05)]">
                <button
                  type="button"
                  aria-expanded={showTechnicalDetails}
                  onClick={() => setShowTechnicalDetails((value) => !value)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[#641373] transition hover:bg-[#F6EFFB] focus-visible:outline-2 focus-visible:outline-[#1254BD]"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="info" size={16} /> Informações completas da
                    carta
                  </span>
                  <Icon
                    name="chevron-down"
                    size={20}
                    className={cn(
                      'shrink-0 transition-transform',
                      showTechnicalDetails && 'rotate-180',
                    )}
                  />
                </button>
                {showTechnicalDetails && (
                  <div className="space-y-4 border-t border-[#E6D9EF] p-4">
                    {detailRows.length > 0 && (
                      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                        {detailRows.map((row) => (
                          <div
                            key={row.label}
                            className="flex min-w-0 justify-between gap-3 border-b border-[#EEE5F4] pb-2 text-xs"
                          >
                            <dt className="text-[#71677F]">{row.label}</dt>
                            <dd className="min-w-0 break-words text-right font-semibold text-[#332240]">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {cardAttacks.length > 0 && (
                      <div className="rounded-xl border border-[#E3D5EF] bg-[#F8F4FD] p-4">
                        <h4 className="font-display text-base font-bold text-[#681474]">
                          Ataques
                        </h4>
                        <div className="mt-3 space-y-3">
                          {cardAttacks.map((attack, index) => (
                            <div
                              key={`${attack.name}-${index}`}
                              className="flex flex-wrap justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-[#342343]">
                                {attack.name}
                              </span>
                              <span className="text-[#685C76]">
                                {attackCost(attack) || 'Sem custo'} ·{' '}
                                {attack.damage || '—'} dano
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {cardRules && (
                      <p className="whitespace-pre-line rounded-xl border border-[#E3D5EF] bg-[#F8F4FD] p-4 text-xs leading-relaxed text-[#51445F]">
                        {cardRules}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer
          className={cn(
            'flex shrink-0 flex-wrap items-center justify-end gap-3 px-4 py-4 sm:px-7',
            modalFooter,
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(detailButton, modalSecondaryButton)}
          >
            Fechar
          </button>
          {card && imageUrl && !imageFailed && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(detailButton, modalSecondaryButton)}
              aria-label={`Ver imagem completa de ${card.name}`}
            >
              <Icon name="search" size={16} /> Ver imagem
            </a>
          )}
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!card || !canPerformAction}
            className={cn(detailButton, modalPrimaryButton)}
          >
            <Icon name={isCollection ? 'cart' : 'plus'} size={16} />
            {isCollection ? 'Criar anúncio' : 'Adicionar à coleção'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
