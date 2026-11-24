import { useId, useState, type FormEvent } from 'react'
import { MAX_UNIT_PRICE, conditionLabels, languageLabels } from '@/components/ads/adFormat'
import {
  CollapsibleFilterChoices,
  FilterChips,
  FilterHeading,
  filterApplyClass,
  filterFieldClass,
  filterLabelClass,
  type AppliedFilterChip,
} from '@/components/ui/ResponsiveFilters'
import type { MarketplaceFilters as FilterValues } from '@/types/Marketplace'
import { emptyMarketplaceFilters } from './marketplaceFilterDefaults'

type Props = { onApply: (filters: FilterValues) => void }

const games = [
  { value: 'POKEMON', label: 'Pokémon TCG' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh! TCG' },
  { value: 'MAGIC_THE_GATHERING', label: 'Magic: The Gathering' },
]
const modalities = [
  { value: 'SALE', label: 'Aceita venda' },
  { value: 'TRADE', label: 'Aceita troca' },
  { value: 'BOTH', label: 'Venda e troca' },
]
const conditionOptions = Object.entries(conditionLabels).map(([value, label]) => ({ value, label }))
const languageOptions = Object.entries(languageLabels).map(([value, label]) => ({ value, label }))
const labelFor = (options: { value: string; label: string }[], value: string) =>
  options.find((item) => item.value === value)?.label ?? value

export function MarketplaceFilters({ onApply }: Props) {
  const titleId = useId()
  const errorId = useId()
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<FilterValues>({ ...emptyMarketplaceFilters })
  const [applied, setApplied] = useState<FilterValues>({ ...emptyMarketplaceFilters })

  function apply(filters: FilterValues) {
    setError('')
    setDraft(filters)
    setApplied(filters)
    onApply(filters)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      draft.minPrice &&
      draft.maxPrice &&
      Number(draft.minPrice) > Number(draft.maxPrice)
    ) {
      setError('O preço mínimo não pode ser maior que o máximo.')
      return
    }
    apply({
      ...draft,
      search: draft.search.trim(),
      edition: draft.edition.trim(),
      rarity: draft.rarity.trim(),
    })
  }

  const chips: AppliedFilterChip[] = [
    { key: 'search', label: `Nome: ${applied.search}` },
    { key: 'modality', label: `Tipo: ${labelFor(modalities, applied.modality)}` },
    { key: 'game', label: `TCG: ${labelFor(games, applied.game)}` },
    { key: 'edition', label: `Edição: ${applied.edition}` },
    { key: 'rarity', label: `Raridade: ${applied.rarity}` },
    { key: 'condition', label: `Condição: ${conditionLabels[applied.condition] ?? applied.condition}` },
    { key: 'language', label: `Idioma: ${languageLabels[applied.language] ?? applied.language}` },
    { key: 'minPrice', label: `Mínimo: R$ ${applied.minPrice}` },
    { key: 'maxPrice', label: `Máximo: R$ ${applied.maxPrice}` },
  ].filter(({ key }) => Boolean(applied[key as keyof FilterValues]))

  return (
    <aside aria-labelledby={titleId} className="min-w-0">
      <FilterHeading id={titleId} onClear={() => apply({ ...emptyMarketplaceFilters })} />
      <FilterChips
        chips={chips}
        onRemove={(key) => apply({ ...applied, [key]: emptyMarketplaceFilters[key as keyof FilterValues] })}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className={filterLabelClass}>
          Nome da carta
          <input
            type="search"
            maxLength={100}
            placeholder="Buscar carta..."
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            className={filterFieldClass}
          />
        </label>

        <CollapsibleFilterChoices
          title="Tipo de anúncio"
          options={modalities}
          value={draft.modality}
          onValueChange={(value) => setDraft((current) => ({ ...current, modality: value as FilterValues['modality'] }))}
        />
        <CollapsibleFilterChoices
          title="TCG"
          options={games}
          value={draft.game}
          onValueChange={(value) => setDraft((current) => ({ ...current, game: value as FilterValues['game'] }))}
        />

        {(['edition', 'rarity'] as const).map((field) => (
          <label key={field} className={filterLabelClass}>
            {field === 'edition' ? 'Set / Edição' : 'Raridade'}
            <input
              value={draft[field]}
              maxLength={field === 'edition' ? 200 : 100}
              placeholder={field === 'edition' ? 'Nome ou parte da edição' : 'Nome exato da raridade'}
              onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
              className={filterFieldClass}
            />
          </label>
        ))}

        <CollapsibleFilterChoices
          title="Condição"
          options={conditionOptions}
          value={draft.condition}
          onValueChange={(value) => setDraft((current) => ({ ...current, condition: value as FilterValues['condition'] }))}
          defaultOpen={false}
        />
        <CollapsibleFilterChoices
          title="Idioma"
          options={languageOptions}
          value={draft.language}
          onValueChange={(value) => setDraft((current) => ({ ...current, language: value as FilterValues['language'] }))}
          defaultOpen={false}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-text-primary">Preço unitário (R$)</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
            <label className="min-w-0 text-xs font-semibold text-text-primary">
              Mínimo
              <input
                type="number"
                min="0"
                max={MAX_UNIT_PRICE}
                step="0.01"
                inputMode="decimal"
                value={draft.minPrice}
                aria-describedby={error ? errorId : undefined}
                aria-invalid={Boolean(error)}
                onChange={(event) => setDraft((current) => ({ ...current, minPrice: event.target.value }))}
                className={filterFieldClass}
                placeholder="0,00"
              />
            </label>
            <span aria-hidden="true" className="pb-3 text-text-secondary">—</span>
            <label className="min-w-0 text-xs font-semibold text-text-primary">
              Máximo
              <input
                type="number"
                min="0"
                max={MAX_UNIT_PRICE}
                step="0.01"
                inputMode="decimal"
                value={draft.maxPrice}
                aria-describedby={error ? errorId : undefined}
                aria-invalid={Boolean(error)}
                onChange={(event) => setDraft((current) => ({ ...current, maxPrice: event.target.value }))}
                className={filterFieldClass}
                placeholder="0,00"
              />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">Informar preço mostra somente anúncios que aceitam venda.</p>
        </fieldset>

        {error && <p id={errorId} role="alert" className="text-xs font-semibold text-state-error">{error}</p>}
        <button type="submit" className={filterApplyClass}>Aplicar filtros</button>
      </form>
    </aside>
  )
}
