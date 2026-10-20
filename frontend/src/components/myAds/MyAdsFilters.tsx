import { useState } from 'react'
import type { OwnAdFilterValues } from '@/types/Ad'
import { emptyOwnAdFilters } from './ownAdFilters'

type MyAdsFiltersProps = {
  onApply: (filters: OwnAdFilterValues) => void
}

const fieldClass =
  'mt-2 h-10 w-full rounded-control border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500'

export function MyAdsFilters({ onApply }: MyAdsFiltersProps) {
  const [draft, setDraft] = useState<OwnAdFilterValues>(emptyOwnAdFilters)

  function update<K extends keyof OwnAdFilterValues>(
    field: K,
    value: OwnAdFilterValues[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function clearFilters() {
    setDraft(emptyOwnAdFilters)
    onApply(emptyOwnAdFilters)
  }

  return (
    <aside className="min-w-0 self-start rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="mb-5 text-sm font-bold text-primary-900">FILTROS</h2>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply({ ...draft, search: draft.search.trim() })
        }}
      >
        <label className="block text-sm font-semibold text-neutral-900">
          Nome da carta
          <input
            type="search"
            value={draft.search}
            maxLength={120}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Buscar nos meus anúncios..."
            className={fieldClass}
          />
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Tipo de anúncio
          <select
            value={draft.modality}
            onChange={(event) =>
              update(
                'modality',
                event.target.value as OwnAdFilterValues['modality'],
              )
            }
            className={fieldClass}
          >
            <option value="">Todos</option>
            <option value="SALE">Venda</option>
            <option value="TRADE">Troca</option>
            <option value="BOTH">Venda e troca</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          TCG
          <select
            value={draft.game}
            onChange={(event) => update('game', event.target.value)}
            className={fieldClass}
          >
            <option value="">Todos</option>
            <option value="POKEMON">Pokémon</option>
            <option value="YUGIOH">Yu-Gi-Oh!</option>
            <option value="MAGIC_THE_GATHERING">Magic: The Gathering</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-neutral-900">
          Status do anúncio
          <select
            value={draft.status}
            onChange={(event) =>
              update('status', event.target.value as OwnAdFilterValues['status'])
            }
            className={fieldClass}
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Ativo</option>
            <option value="SOLD_OUT">Finalizado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </label>

        <button
          type="submit"
          className="min-h-10 w-full cursor-pointer rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          Aplicar filtros
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="mx-auto block cursor-pointer text-xs text-primary-900 underline focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          Limpar filtros
        </button>
      </form>
    </aside>
  )
}
