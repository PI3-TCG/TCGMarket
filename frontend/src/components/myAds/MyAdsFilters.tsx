import { useId, useState } from 'react'
import {
  CollapsibleFilterChoices,
  FilterChips,
  FilterHeading,
  filterApplyClass,
  filterFieldClass,
  filterLabelClass,
  type AppliedFilterChip,
} from '@/components/ui/ResponsiveFilters'
import type { OwnAdFilterValues } from '@/types/Ad'
import { emptyOwnAdFilters } from './ownAdFilters'

type MyAdsFiltersProps = {
  onApply: (filters: OwnAdFilterValues) => void
}

const gameNames: Record<string, string> = {
  POKEMON: 'Pokémon TCG',
  YUGIOH: 'Yu-Gi-Oh! TCG',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
}
const gameOptions = Object.entries(gameNames).map(([value, label]) => ({ value, label }))
const modalityNames: Record<string, string> = {
  SALE: 'Venda',
  TRADE: 'Troca',
  BOTH: 'Venda e troca',
}
const modalityOptions = Object.entries(modalityNames).map(([value, label]) => ({ value, label }))
const statusNames: Record<string, string> = {
  ACTIVE: 'Ativo',
  SOLD_OUT: 'Finalizado',
  CANCELLED: 'Cancelado',
}
const statusOptions = Object.entries(statusNames).map(([value, label]) => ({ value, label }))

export function MyAdsFilters({ onApply }: MyAdsFiltersProps) {
  const titleId = useId()
  const [draft, setDraft] = useState<OwnAdFilterValues>({ ...emptyOwnAdFilters })
  const [applied, setApplied] = useState<OwnAdFilterValues>({ ...emptyOwnAdFilters })

  function update<K extends keyof OwnAdFilterValues>(field: K, value: OwnAdFilterValues[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function apply(filters: OwnAdFilterValues) {
    setDraft(filters)
    setApplied(filters)
    onApply(filters)
  }

  function removeChip(key: string) {
    const field = key as keyof OwnAdFilterValues
    apply({ ...applied, [field]: emptyOwnAdFilters[field] })
  }

  const chips: AppliedFilterChip[] = [
    { key: 'search', label: `Nome: ${applied.search}` },
    { key: 'modality', label: `Tipo: ${modalityNames[applied.modality] ?? applied.modality}` },
    { key: 'game', label: `TCG: ${gameNames[applied.game] ?? applied.game}` },
    { key: 'status', label: `Status: ${statusNames[applied.status] ?? applied.status}` },
  ].filter(({ key }) => Boolean(applied[key as keyof OwnAdFilterValues]))

  return (
    <aside aria-labelledby={titleId} className="min-w-0">
      <FilterHeading id={titleId} onClear={() => apply({ ...emptyOwnAdFilters })} />
      <FilterChips chips={chips} onRemove={removeChip} />
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          apply({ ...draft, search: draft.search.trim() })
        }}
      >
        <label className={filterLabelClass}>
          Nome da carta
          <input
            type="search"
            value={draft.search}
            maxLength={120}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Buscar nos meus anúncios..."
            className={filterFieldClass}
          />
        </label>

        <div>
          <CollapsibleFilterChoices
            title="TCG"
            options={gameOptions}
            value={draft.game}
            onValueChange={(value) => update('game', value)}
            defaultOpen={false}
          />
          <CollapsibleFilterChoices
            title="Tipo de anúncio"
            options={modalityOptions}
            value={draft.modality}
            onValueChange={(value) => update('modality', value as OwnAdFilterValues['modality'])}
            defaultOpen={false}
          />
          <CollapsibleFilterChoices
            title="Status do anúncio"
            options={statusOptions}
            value={draft.status}
            onValueChange={(value) => update('status', value as OwnAdFilterValues['status'])}
            defaultOpen={false}
          />
        </div>

        <div className="space-y-2 pt-2">
          <button type="submit" className={filterApplyClass}>Aplicar filtros</button>
        </div>
      </form>
    </aside>
  )
}
