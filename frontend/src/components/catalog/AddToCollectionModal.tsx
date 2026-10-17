import { useEffect, useState } from 'react'
import type { CatalogCard } from '@/types/Catalog'

import type { CardCondition, CardLanguage } from '@/types/Collection'
type Props = {
  card: CatalogCard
  onClose: () => void
  onSuccess?: () => void
}
import { addToMyCollection } from '@/services/collection'
import { Alert } from '@/components/ui/Alert'
import axios from 'axios'

const CONDITIONS: {
  value: CardCondition
  label: string
}[] = [
  { value: 'NEAR_MINT', label: 'Near Mint (NM)' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played (LP)' },
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played (MP)' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played (HP)' },
  { value: 'DAMAGED', label: 'Damaged (DMG)' },
]

export function AddToCollectionModal({ card, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [condition, setCondition] = useState<CardCondition>('NEAR_MINT')

  const [language, setLanguage] = useState<CardLanguage>('PORTUGUESE')
  const [favorite, setFavorite] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleAddToCollection() {
    if (isSaving || success) return

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      setError('Informe uma quantidade válida.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await addToMyCollection({
        cardId: card.id,
        quantity,
        condition,
        language,
      })

      setSuccess(true)
      onSuccess?.()
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ??
            'Não foi possível adicionar a carta. Tente novamente.',
        )
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/65 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
        className="max-h-[92dvh] w-full max-w-[744px] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-neutral-200 bg-primary-50 px-6 py-5">
          <div>
            <h2
              id="collection-modal-title"
              className="font-display text-2xl font-bold text-primary-900 sm:text-3xl"
            >
              Adicionar carta à coleção
            </h2>
            <p className="mt-1 text-sm text-neutral-700">
              Registre esta carta no seu acervo pessoal.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg px-2 text-2xl text-primary-900 hover:bg-primary-100"
          >
            ×
          </button>
        </header>

        <div className="grid gap-6 p-5 md:grid-cols-[276px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-neutral-200 p-3">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="mx-auto aspect-[3/4] w-full rounded-lg object-contain"
            />

            <h3 className="mt-4 text-lg font-bold text-neutral-900">
              {card.name}
            </h3>

            <p className="text-sm text-neutral-600">
              {card.edition} · Nº {card.cardNumber}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-900">
              {card.officialRarity}
            </span>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3 text-xs">
              <div>
                <strong className="block">TCG</strong>
                <span>{card.game}</span>
              </div>
              <div>
                <strong className="block">Coleção</strong>
                <span>{card.edition}</span>
              </div>
              <div>
                <strong className="block">Número</strong>
                <span>{card.cardNumber}</span>
              </div>
              <div>
                <strong className="block">Raridade</strong>
                <span>{card.officialRarity}</span>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <h3 className="border-b border-neutral-200 pb-3 font-display text-lg font-bold text-primary-900">
              Informações da sua coleção
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Quantidade *
                </label>
                <div className="flex h-11 overflow-hidden rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 border-r border-neutral-200 text-primary-900"
                  >
                    −
                  </button>
                  <output className="flex flex-1 items-center justify-center">
                    {quantity}
                  </output>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 border-l border-neutral-200 text-primary-900"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="collection-condition"
                  className="mb-2 block text-sm font-semibold"
                >
                  Condição *
                </label>
                <select
                  id="collection-condition"
                  value={condition}
                  onChange={(event) =>
                    setCondition(event.target.value as CardCondition)
                  }
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
                >
                  {CONDITIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-primary-50 p-3 text-xs text-primary-900">
              A condição indica o estado de conservação da carta. Consulte o
              guia de condições da plataforma.
            </div>

            <div>
              <label
                htmlFor="collection-language"
                className="mb-2 block text-sm font-semibold"
              >
                Idioma *
              </label>
              <select
                id="collection-language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as CardLanguage)
                }
                className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="PORTUGUESE">Português (PT-BR)</option>
                <option value="ENGLISH">Inglês (EN)</option>
                <option value="JAPANESE">Japonês (JA)</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-4">
              <span>
                <strong className="block text-sm">Marcar como favorito</strong>
                <span className="text-xs text-neutral-500">
                  Destaque esta carta na sua coleção.
                </span>
              </span>
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="size-5 accent-purple-800"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              {error && (
                <Alert variant="error" onDismiss={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" title="Carta adicionada!">
                  Sua coleção foi atualizada com sucesso.
                </Alert>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-primary-900 px-5 py-3 text-sm font-semibold text-primary-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddToCollection}
                disabled={isSaving || success}
                className="rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? 'Adicionando...'
                  : success
                    ? 'Carta adicionada'
                    : 'Adicionar à minha coleção'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
