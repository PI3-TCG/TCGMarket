import { useId, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import type {
  MarketplaceFilters as FilterValues,
} from '@/types/Marketplace'

type Props = {
  onApply: (filters: FilterValues) => void
}

export const emptyMarketplaceFilters: FilterValues = {
  search: '',
  game: '',
  modality: '',
}

const fieldClass =
  'min-h-11 w-full rounded-lg border border-primary-300/40 bg-white px-3 py-2 text-sm text-primary-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

export function MarketplaceFilters({ onApply }: Props) {
  const id = useId()
  const [draft, setDraft] = useState<FilterValues>({
    ...emptyMarketplaceFilters,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const filters = {
      ...draft,
      search: draft.search.trim(),
    }

    setDraft(filters)
    onApply(filters)
  }

  function clearFilters() {
    const filters = { ...emptyMarketplaceFilters }

    setDraft(filters)
    onApply(filters)
  }

  return (
    <aside
      aria-labelledby={`${id}-title`}
      className="rounded-xl border border-primary-300/30 bg-white p-4"
    >
      <h2
        id={`${id}-title`}
        className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-primary-900"
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 4h18l-7 8v8l-4-2v-6L3 4Z" />
        </svg>
        Filtros
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor={`${id}-search`}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900"
          >
            <Icon name="search" size={20} />
            Nome da carta
          </label>

          <input
            id={`${id}-search`}
            type="search"
            maxLength={100}
            placeholder="Buscar carta..."
            value={draft.search}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            className={`${fieldClass} placeholder:text-neutral-500`}
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-modality`}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900"
          >
            <Icon name="cart" size={20} />
            Tipo de anúncio
          </label>

          <select
            id={`${id}-modality`}
            value={draft.modality}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                modality: event.target.value as FilterValues['modality'],
              }))
            }
            className={fieldClass}
          >
            <option value="">Todos</option>
            <option value="SALE">Aceita venda</option>
            <option value="TRADE">Aceita troca</option>
            <option value="BOTH">Venda e troca</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-game`}
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900"
          >
            <Icon name="gem" size={20} />
            TCG
          </label>

          <select
            id={`${id}-game`}
            value={draft.game}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                game: event.target.value as FilterValues['game'],
              }))
            }
            className={fieldClass}
          >
            <option value="">Todos</option>
            <option value="POKEMON">Pokémon</option>
            <option value="MAGIC_THE_GATHERING">
              Magic: The Gathering
            </option>
            <option value="YUGIOH">Yu-Gi-Oh!</option>
          </select>
        </div>

        <div className="space-y-3 pt-1">
          <button
            type="submit"
            className="min-h-11 w-full cursor-pointer rounded-lg bg-gradient-to-r from-primary-900 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="min-h-10 w-full cursor-pointer rounded-lg text-sm font-semibold text-primary-900 underline underline-offset-4 hover:bg-primary-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            Limpar filtros
          </button>
        </div>
      </form>
    </aside>
  )
}