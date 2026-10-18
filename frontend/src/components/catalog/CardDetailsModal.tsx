import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { fetchCatalogCard } from '@/services/catalogApi'
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
import { Icon } from '@/components/ui/Icon'
import type { CatalogCard, CatalogCardDetails } from '@/types/Catalog'

type Props = {
  cardId: string
  context?: 'catalog' | 'collection'
  onClose: () => void
  /** Callback utilizado atualmente pelo CatalogPage. */
  onAdd?: (card: CatalogCard) => void
  /** Compatibilidade com uma possível chamada criada no protótipo. */
  onAddToCollection?: (card: CatalogCardDetails) => void
  /** Ainda pode não estar implementado; neste caso o botão fica desabilitado. */
  onCreateListing?: (card: CatalogCardDetails) => void
}

type ActiveTab = 'details' | 'dashboard'

export function CardDetailsModal({
  cardId,
  context = 'catalog',
  onClose,
  onAdd,
  onAddToCollection,
  onCreateListing,
}: Props) {
  const titleId = useId()
  const [activeTab, setActiveTab] = useState<ActiveTab>('details')
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)

  const loadCard = useCallback(() => fetchCatalogCard(cardId), [cardId])
  const { state, retry } = useRemoteData(cardId, loadCard)
  const card = state.status === 'ready' ? state.data : null
  const isCollection = context === 'collection'
  const canPerformAction = isCollection
    ? Boolean(onCreateListing)
    : Boolean(onAdd || onAddToCollection)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement
      const isInside = dialogRef.current.contains(current)

      if (!isInside || (event.shiftKey && current === first)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  function handlePrimaryAction() {
    if (!card) return

    if (isCollection) {
      onCreateListing?.(card)
      return
    }

    if (onAdd) onAdd(toCatalogCard(card))
    else onAddToCollection?.(card)
  }

  const detailRows = card ? [...commonRows(card), ...gameRows(card)] : []
  const cardAttacks = card ? attacks(card) : []
  const cardRules = card ? rulesText(card) : null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13091e]/75 p-2.5 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90dvh] w-full max-w-[880px] flex-col overflow-hidden rounded-[22px] border border-primary-300/40 bg-[#f7f3fd] shadow-[0_28px_90px_rgba(16,3,31,0.48)]"
      >
        {/* Cabeçalho com a identidade roxa do TCGMarket. */}
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-primary-900 via-[#4e176f] to-[#64228a] px-4 py-3.5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-20 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Icon name="gem" size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-100/80">
                  {isCollection ? 'Minha coleção' : 'Catálogo'} / Detalhes
                </p>
                <h2
                  id={titleId}
                  className="truncate font-display text-lg font-bold leading-snug sm:text-xl"
                >
                  {card?.name ?? 'Detalhes da carta'}
                </h2>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="rounded-lg p-2 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5">
          {state.status === 'loading' && (
            <div
              role="status"
              className="grid gap-4 sm:grid-cols-[225px_minmax(0,1fr)]"
            >
              <div className="h-72 animate-pulse rounded-2xl bg-primary-100" />
              <div className="space-y-3 rounded-2xl bg-white/70 p-5">
                <div className="h-7 w-2/3 animate-pulse rounded bg-primary-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-primary-100" />
                <div className="mt-6 h-24 animate-pulse rounded bg-primary-100" />
                <p className="text-sm text-neutral-600">
                  Carregando detalhes...
                </p>
              </div>
            </div>
          )}

          {state.status === 'notFound' && (
            <StatusPanel
              title="Carta não encontrada"
              description="Esta carta não está disponível no catálogo."
              onRetry={retry}
            />
          )}
          {state.status === 'error' && (
            <StatusPanel
              title="Não foi possível carregar a carta"
              description="Confira a conexão e tente novamente."
              onRetry={retry}
            />
          )}

          {card && (
            <div className="space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-[228px_minmax(0,1fr)]">
                {/* Somente a imagem principal: sem miniaturas ou outras impressões. */}
                <aside className="rounded-2xl border border-primary-200/70 bg-gradient-to-b from-[#ebe0fa] via-[#f3ecfd] to-[#e9e1f6] p-3 shadow-sm">
                  <div className="flex min-h-[230px] items-center justify-center rounded-xl bg-white/60 p-2 sm:min-h-[255px]">
                    {card.imageUrl ? (
                      <a
                        href={card.imageUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Ver imagem completa de ${card.name}`}
                        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900"
                      >
                        <img
                          src={card.imageUrl}
                          alt={imageAlt(card)}
                          className="mx-auto max-h-[275px] w-auto max-w-full object-contain drop-shadow-[0_10px_13px_rgba(49,17,72,0.22)]"
                        />
                      </a>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-sm text-neutral-500">
                        <Icon name="grid" size={32} />
                        Imagem indisponível
                      </div>
                    )}
                  </div>
                  {card.imageUrl && (
                    <a
                      href={card.imageUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-primary-300/60 bg-white/75 py-2 text-xs font-semibold text-primary-900 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-primary-900"
                    >
                      <Icon name="search" size={16} />
                      Ver imagem
                    </a>
                  )}
                </aside>

                <div className="min-w-0 rounded-2xl border border-primary-200/60 bg-white/80 p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">
                      {GAME_INFO[card.cardGame].name}
                    </Badge>
                    {card.rarity && <Badge variant="rare">{card.rarity}</Badge>}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold leading-tight text-primary-900 sm:text-2xl">
                    {card.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    {setLine(card)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {highlightChips(card).map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-900"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-primary-100 bg-[#f5effc] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-800">
                      Identificação da carta
                    </p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                      <div className="min-w-0">
                        <dt className="text-neutral-500">Coleção</dt>
                        <dd className="mt-0.5 break-words font-semibold text-primary-900">
                          {card.setName || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Número</dt>
                        <dd className="mt-0.5 font-semibold text-primary-900">
                          {card.cardNumber || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Código do set</dt>
                        <dd className="mt-0.5 font-semibold text-primary-900">
                          {card.setCode || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Raridade</dt>
                        <dd className="mt-0.5 break-words font-semibold text-primary-900">
                          {card.rarity || '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-primary-800">
                    <Icon name="info" size={16} />
                    Dados oficiais do catálogo, somente leitura.
                  </p>
                </div>
              </div>

              {/* Abas mantêm o modal compacto e deixam o dashboard preparado. */}
              <section className="overflow-hidden rounded-2xl border border-primary-200/70 bg-white/75 shadow-sm">
                <div className="flex items-center gap-1 border-b border-primary-100 bg-[#efe7f8] px-3 pt-2">
                  <TabButton
                    selected={activeTab === 'details'}
                    onClick={() => setActiveTab('details')}
                  >
                    Informações da carta
                  </TabButton>
                  <TabButton
                    selected={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard{' '}
                    <span className="ml-1 text-[10px] font-normal opacity-70">
                      · Em breve
                    </span>
                  </TabButton>
                </div>

                {activeTab === 'details' ? (
                  <div className="space-y-3 p-3.5 sm:p-4">
                    <dl className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                      {detailRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex min-w-0 justify-between gap-3 border-b border-primary-100 pb-1.5 text-xs"
                        >
                          <dt className="shrink-0 text-neutral-600">
                            {row.label}
                          </dt>
                          <dd className="min-w-0 break-words text-right font-semibold text-primary-900">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {cardAttacks.length > 0 && (
                      <div className="rounded-lg bg-[#f5effc] p-3">
                        <p className="mb-2 text-xs font-bold text-primary-900">
                          Ataques
                        </p>
                        <div className="space-y-2">
                          {cardAttacks.map((attack, index) => (
                            <div
                              key={`${attack.name}-${index}`}
                              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"
                            >
                              <span className="font-semibold text-primary-900">
                                {attack.name}
                              </span>
                              <span className="text-neutral-600">
                                {attackCost(attack) || 'Sem custo'} ·{' '}
                                {attack.damage || '—'} dano
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {cardRules && (
                      <p className="whitespace-pre-line rounded-lg bg-[#f5effc] p-3 text-xs leading-relaxed text-neutral-700">
                        {cardRules}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <div className="rounded-xl bg-gradient-to-r from-primary-900 via-[#5c2379] to-[#72389c] p-4 text-white sm:p-5">
                      <div className="flex items-center gap-2">
                        <Icon name="sparkle" size={20} />
                        <h4 className="font-display text-base font-bold">
                          Dashboard da carta
                        </h4>
                      </div>
                      <p className="mt-2 max-w-xl text-xs leading-relaxed text-purple-100 sm:text-sm">
                        Estamos preparando indicadores de mercado para esta
                        carta. Preço médio, histórico de valores e atividade de
                        anúncios estarão disponíveis futuramente.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Preço médio', 'Histórico', 'Anúncios'].map(
                          (metric) => (
                            <span
                              key={metric}
                              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] text-white/90"
                            >
                              {metric} · Em breve
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-primary-200/70 bg-[#eee6f8] px-4 py-3 sm:px-6">
          <p className="hidden text-xs text-primary-800 sm:block">
            {isCollection
              ? 'Visualizando sua coleção'
              : 'Explorando o catálogo'}
          </p>
          <div className="flex w-full justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-primary-300/80 bg-white/75 px-4 py-2.5 text-xs font-semibold text-primary-900 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-primary-900"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={!card || !canPerformAction}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name={isCollection ? 'cart' : 'plus'} size={16} />
              {isCollection ? 'Criar anúncio' : 'Adicionar à coleção'}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

type TabButtonProps = {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ selected, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-primary-900 ${
        selected
          ? 'border-primary-900 text-primary-900'
          : 'border-transparent text-primary-700 hover:text-primary-900'
      }`}
    >
      {children}
    </button>
  )
}

function StatusPanel({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-xl border border-primary-200 bg-white/80 p-6 text-center">
      <Icon name="info" size={32} className="mx-auto text-primary-800" />
      <h3 className="mt-2 font-display text-lg font-bold text-primary-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary-800"
      >
        Tentar novamente
      </button>
    </div>
  )
}
