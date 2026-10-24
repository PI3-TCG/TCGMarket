import { useState } from 'react'
import type {
  CollectionFilterOptions,
  CollectionFilterValues,
  CollectionItem,
} from '@/types/Collection'
import { emptyCollectionFilters } from './collectionFilterDefaults'

export type { CollectionFilterValues } from '@/types/Collection'


type CollectionFiltersProps = {
  items?: CollectionItem[]
  options?: CollectionFilterOptions
  optionsStatus?: 'loading' | 'success' | 'error'
  onRetryOptions?: () => void
  onApply: (filters: CollectionFilterValues) => void
}

export function CollectionFilters({
  items = [],
  options,
  optionsStatus = 'success',
  onRetryOptions,
  onApply,
}: CollectionFiltersProps) {
  const [draft, setDraft] = useState<CollectionFilterValues>(
    emptyCollectionFilters,
  )

  const editions =
    options?.editions ??
    [...new Set(items.map((item) => item.card.edition))].filter(Boolean)

  const rarities =
    options?.rarities ??
    [...new Set(items.map((item) => item.card.officialRarity))].filter(Boolean)

  function updateFilter(
    field: keyof CollectionFilterValues,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function clearFilters() {
    setDraft({ ...emptyCollectionFilters })
    onApply({ ...emptyCollectionFilters })
  }

  const fieldClass =
    'mt-2 h-10 w-full rounded-control border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <aside className="min-w-0 self-start rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-primary-900">
          FILTROS
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer text-xs text-primary-900 underline"
        >
          Limpar filtros
        </button>
      </div>

      {optionsStatus === 'loading' && (
        <p role="status" className="mb-4 text-xs text-neutral-700">
          Carregando edições e raridades…
        </p>
      )}

      {optionsStatus === 'error' && (
        <div role="alert" className="mb-4 text-xs text-neutral-700">
          <p>Não foi possível carregar as edições e raridades.</p>

          {onRetryOptions && (
            <button
              type="button"
              onClick={onRetryOptions}
              className="mt-2 cursor-pointer text-primary-900 underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply({ ...draft, search: draft.search.trim() })
        }}
      >
        <label className="block text-sm font-semibold text-neutral-900">
          Buscar na coleção
          <input
            type="search"
            value={draft.search}
            maxLength={120}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Nome da carta"
            className={fieldClass}
          />
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          TCG
          <select
            value={draft.game}
            onChange={(event) => updateFilter('game', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todos os TCGs</option>
            <option value="POKEMON">Pokémon</option>
            <option value="YUGIOH">Yu-Gi-Oh!</option>
            <option value="MAGIC_THE_GATHERING">
              Magic: The Gathering
            </option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Coleção / Set
          <select
            value={draft.edition}
            disabled={optionsStatus !== 'success'}
            onChange={(event) => updateFilter('edition', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todas as coleções</option>
            {editions.map((edition) => (
              <option key={edition} value={edition}>
                {edition}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Raridade
          <select
            value={draft.rarity}
            disabled={optionsStatus !== 'success'}
            onChange={(event) => updateFilter('rarity', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todas as raridades</option>
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Condição
          <select
            value={draft.condition}
            onChange={(event) => updateFilter('condition', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todas as condições</option>
            <option value="NEAR_MINT">Near Mint</option>
            <option value="LIGHTLY_PLAYED">Lightly Played</option>
            <option value="MODERATELY_PLAYED">Moderately Played</option>
            <option value="HEAVILY_PLAYED">Heavily Played</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Idioma
          <select
            value={draft.language}
            onChange={(event) => updateFilter('language', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todos os idiomas</option>
            <option value="PORTUGUESE">Português</option>
            <option value="ENGLISH">Inglês</option>
            <option value="JAPANESE">Japonês</option>
          </select>
        </label>

        <button
          type="submit"
          className="min-h-10 w-full cursor-pointer rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          Aplicar filtros
        </button>
      </form>
    </aside>
  )
}