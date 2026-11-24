import { useId, useState } from 'react'
import {
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
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
}
const modalityNames: Record<string, string> = {
  SALE: 'Venda',
  TRADE: 'Troca',
  BOTH: 'Venda e troca',
}
const statusNames: Record<string, string> = {
  ACTIVE: 'Ativo',
  SOLD_OUT: 'Finalizado',
  CANCELLED: 'Cancelado',
}

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

        <label className={filterLabelClass}>
          Tipo de anúncio
          <select
            value={draft.modality}
            onChange={(event) => update('modality', event.target.value as OwnAdFilterValues['modality'])}
            className={filterFieldClass}
          >
            <option value="">Todos</option>
            <option value="SALE">Venda</option>
            <option value="TRADE">Troca</option>
            <option value="BOTH">Venda e troca</option>
          </select>
        </label>

        <label className={filterLabelClass}>
          TCG
          <select value={draft.game} onChange={(event) => update('game', event.target.value)} className={filterFieldClass}>
            <option value="">Todos</option>
            <option value="POKEMON">Pokémon</option>
            <option value="YUGIOH">Yu-Gi-Oh!</option>
            <option value="MAGIC_THE_GATHERING">Magic: The Gathering</option>
          </select>
        </label>

        <label className={filterLabelClass}>
          Status do anúncio
          <select
            value={draft.status}
            onChange={(event) => update('status', event.target.value as OwnAdFilterValues['status'])}
            className={filterFieldClass}
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Ativo</option>
            <option value="SOLD_OUT">Finalizado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </label>

        <div className="space-y-2 pt-2">
          <button type="submit" className={filterApplyClass}>Aplicar filtros</button>
        </div>
      </form>
    </aside>
  )
}
