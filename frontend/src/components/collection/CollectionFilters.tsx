import { useId, useState } from 'react'
import {
  CollapsibleFilterChoices,
  FilterChips,
  FilterHeading,
  ResponsiveFilters,
  SearchableFilterSelect,
  filterApplyClass,
  filterFieldClass,
  filterLabelClass,
  type AppliedFilterChip,
} from '@/components/ui/ResponsiveFilters'
import type {
  CollectionFilterOptions,
  CollectionFilterValues,
  CollectionItem,
} from '@/types/Collection'
import { emptyCollectionFilters } from './collectionFilterDefaults'

export type { CollectionFilterValues } from '@/types/Collection'

type CollectionFiltersProps = {
  /** Compatibilidade com a coleção pública, que ainda passa appearance="card". */
  appearance?: 'decorated' | 'card'
  items?: CollectionItem[]
  options?: CollectionFilterOptions
  optionsStatus?: 'loading' | 'success' | 'error'
  onRetryOptions?: () => void
  onApply: (filters: CollectionFilterValues) => void
}

const games = [
  { value: 'POKEMON', label: 'Pokémon TCG' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh! TCG' },
  { value: 'MAGIC_THE_GATHERING', label: 'Magic: The Gathering' },
]
const conditions = [
  { value: 'NEAR_MINT', label: 'Near Mint (NM)' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played (LP)' },
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played (MP)' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played (HP)' },
  { value: 'DAMAGED', label: 'Damaged (DMG)' },
]
const languages = [
  { value: 'PORTUGUESE', label: 'Português (PT-BR)' },
  { value: 'ENGLISH', label: 'Inglês (EN)' },
  { value: 'JAPANESE', label: 'Japonês (JP)' },
]
const labelFor = (options: { value: string; label: string }[], value: string) =>
  options.find((item) => item.value === value)?.label ?? value

export function CollectionFilters({
  items = [],
  options,
  optionsStatus = 'success',
  onRetryOptions,
  onApply,
}: CollectionFiltersProps) {
  const titleId = useId()
  const [draft, setDraft] = useState<CollectionFilterValues>({ ...emptyCollectionFilters })
  const [applied, setApplied] = useState<CollectionFilterValues>({ ...emptyCollectionFilters })

  // Somente opções existentes: não inventa quantidade ou raridade de cartas.
  const editions = [...new Set([
    ...(options?.editions ?? items.map((item) => item.card.edition)),
    draft.edition,
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const rarities = [...new Set([
    ...(options?.rarities ?? items.map((item) => item.card.officialRarity)),
    draft.rarity,
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'))

  function change<K extends keyof CollectionFilterValues>(
    key: K,
    value: CollectionFilterValues[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function apply(next: CollectionFilterValues) {
    const filters = { ...next, search: next.search.trim() }
    setDraft(filters)
    setApplied(filters)
    onApply(filters)
  }

  const chips: AppliedFilterChip[] = [
    { key: 'search', label: `Pesquisa: ${applied.search}` },
    { key: 'game', label: `TCG: ${labelFor(games, applied.game)}` },
    { key: 'edition', label: `Coleção: ${applied.edition}` },
    { key: 'rarity', label: `Raridade: ${applied.rarity}` },
    { key: 'condition', label: `Condição: ${labelFor(conditions, applied.condition)}` },
    { key: 'language', label: `Idioma: ${labelFor(languages, applied.language)}` },
  ].filter(({ key }) => Boolean(applied[key as keyof CollectionFilterValues]))

  return (
    <ResponsiveFilters>
      <aside aria-labelledby={titleId} className="min-w-0">
        <FilterHeading id={titleId} onClear={() => apply({ ...emptyCollectionFilters })} />
        <FilterChips
          chips={chips}
          onRemove={(key) => apply({ ...applied, [key]: emptyCollectionFilters[key as keyof CollectionFilterValues] })}
        />

        {optionsStatus === 'loading' && (
          <p role="status" className="mb-3 text-xs text-text-secondary">Carregando coleções e raridades...</p>
        )}
        {optionsStatus === 'error' && (
          <div role="alert" className="mb-3 rounded-control border border-state-error/40 bg-surface-sand p-3 text-xs">
            Não foi possível carregar as coleções e raridades.
            {onRetryOptions && (
              <button type="button" onClick={onRetryOptions} className="mt-2 block min-h-10 font-semibold text-brand-primary underline">Tentar novamente</button>
            )}
          </div>
        )}

        <form
          className="space-y-3"
          onSubmit={(event) => { event.preventDefault(); apply(draft) }}
        >
          <label className={filterLabelClass}>
            Buscar na coleção
            <input
              type="search"
              value={draft.search}
              maxLength={120}
              onChange={(event) => change('search', event.target.value)}
              placeholder="Nome da carta"
              className={filterFieldClass}
            />
          </label>

          <CollapsibleFilterChoices
            title="TCG"
            options={games}
            value={draft.game}
            onValueChange={(value) => change('game', value)}
          />

          <SearchableFilterSelect
            label="Coleção / Set"
            value={draft.edition}
            onValueChange={(value) => change('edition', value)}
            options={editions}
            placeholder="Pesquisar coleção..."
            disabled={optionsStatus !== 'success'}
          />

          <SearchableFilterSelect
            label="Raridade"
            value={draft.rarity}
            onValueChange={(value) => change('rarity', value)}
            options={rarities}
            placeholder="Pesquisar raridade..."
            disabled={optionsStatus !== 'success'}
          />

          <CollapsibleFilterChoices
            title="Condição"
            options={conditions}
            value={draft.condition}
            onValueChange={(value) => change('condition', value)}
            defaultOpen={false}
          />

          <CollapsibleFilterChoices
            title="Idioma"
            options={languages}
            value={draft.language}
            onValueChange={(value) => change('language', value)}
            defaultOpen={false}
          />

          <button type="submit" className={filterApplyClass}>Aplicar filtros</button>
        </form>
      </aside>
    </ResponsiveFilters>
  )
}
