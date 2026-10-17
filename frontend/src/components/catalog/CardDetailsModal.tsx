import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { fetchCatalogCard } from '@/services/catalogApi'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  commonRows,
  gameRows,
  GAME_INFO,
  highlightChips,
  setLine,
  toCatalogCard,
} from '@/components/catalog/cardDetailsFormat'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import type { CatalogCard } from '@/types/Catalog'

type Props = {
  cardId: string
  onClose: () => void
  context?: 'catalog' | 'collection'
  onAdd?: (card: CatalogCard) => void
  onCreateListing?: () => void
}

export function CardDetailsModal({
  cardId,
  onClose,
  context = 'catalog',
  onAdd,
  onCreateListing,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  const fetchCard = useCallback(() => fetchCatalogCard(cardId), [cardId])

  const { state, retry } = useRemoteData(cardId, fetchCard)

  const card = state.status === 'ready' ? state.data : null

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  function handlePrimaryAction() {
    if (!card) return

    if (context === 'collection') {
      onCreateListing?.()
      return
    }

    onAdd?.(toCatalogCard(card))
  }
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/65 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-details-title"
        className="max-h-[92dvh] w-full max-w-[1050px] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-primary-50 px-6 py-5">
          <div>
            <h2
              id="card-details-title"
              className="font-display text-2xl font-bold text-primary-900"
            >
              Detalhes da carta
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Informações e visão geral do catálogo
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="rounded-lg px-2 text-2xl text-primary-900 hover:bg-primary-100"
          >
            ×
          </button>
        </header>

        <div className="p-6">
          {state.status === 'loading' && (
            <div role="status" className="space-y-3 py-12">
              <div className="mx-auto h-48 w-32 animate-pulse rounded-xl bg-neutral-100" />
              <p className="text-center text-sm text-neutral-600">
                Carregando detalhes da carta...
              </p>
            </div>
          )}

          {state.status === 'notFound' && (
            <Alert variant="warning" title="Carta não encontrada">
              Esta carta não está disponível no catálogo.
            </Alert>
          )}

          {state.status === 'error' && (
            <div className="space-y-4">
              <Alert variant="error">
                Não foi possível carregar os detalhes.
              </Alert>
              <Button onClick={retry}>Tentar novamente</Button>
            </div>
          )}

          {card && (
            <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="mx-auto max-h-80 w-full object-contain"
                    />
                  ) : (
                    <p className="py-24 text-center text-sm text-neutral-500">
                      Imagem indisponível
                    </p>
                  )}
                </div>

                <Badge variant="primary">{GAME_INFO[card.cardGame].name}</Badge>

                <h3 className="font-display text-xl font-bold text-neutral-900">
                  {card.name}
                </h3>

                <p className="text-sm text-neutral-600">{setLine(card)}</p>

                {card.rarity && <Badge variant="rare">{card.rarity}</Badge>}
              </aside>

              <div className="min-w-0 space-y-5">
                <section className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-primary-900">
                    Visão geral
                  </h3>

                  <div className="rounded-xl border border-neutral-200 p-4">
                    <dl className="space-y-3">
                      {[...commonRows(card), ...gameRows(card)].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <dt className="text-neutral-500">{row.label}</dt>
                          <dd className="text-right font-semibold text-neutral-900">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {highlightChips(card).map((chip) => (
                        <Badge key={chip} variant="neutral">
                          {chip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-primary-900">
                    Mercado da carta
                  </h3>

                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
                    <p className="text-sm font-semibold text-neutral-700">
                      Indicadores de mercado indisponíveis
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Preços, anúncios e histórico serão exibidos quando houver
                      integração com os dados de mercado.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Voltar ao catálogo
          </Button>

          <Button
            onClick={handlePrimaryAction}
            disabled={
              !card || (context === 'collection' ? !onCreateListing : !onAdd)
            }
          >
            {context === 'collection'
              ? 'Criar anúncio'
              : 'Adicionar à minha coleção'}
          </Button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
