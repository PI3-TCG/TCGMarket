import { useId, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { MAX_UNIT_PRICE, conditionLabels, languageLabels } from '@/components/ads/adFormat'
import type {
  MarketplaceFilters as FilterValues,
} from '@/types/Marketplace'
import { emptyMarketplaceFilters } from './marketplaceFilterDefaults'
type Props = {
  onApply: (filters: FilterValues) => void
}


const fieldClass =
  'min-h-11 w-full rounded-lg border border-primary-300/40 bg-white px-3 py-2 text-sm text-primary-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500'

export function MarketplaceFilters({ onApply }: Props) {
  const id = useId()
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<FilterValues>({
    ...emptyMarketplaceFilters,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setError('O preço mínimo não pode ser maior que o máximo.')
      return
    }
    setError('')
    const filters = {
      ...draft,
      edition: draft.edition.trim(),
      rarity: draft.rarity.trim(),
      search: draft.search.trim(),
    }

    setDraft(filters)
    onApply(filters)
  }

  function clearFilters() {
    setError('')
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

        {(['edition', 'rarity'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={`${id}-${field}`} className="mb-2 block text-sm font-semibold text-primary-900">
              {field === 'edition' ? 'Set / edição' : 'Raridade'}
            </label>
            <input id={`${id}-${field}`} value={draft[field]} maxLength={field === 'edition' ? 200 : 100}
              placeholder={field === 'edition' ? 'Nome ou parte da edição' : 'Nome exato da raridade'}
              onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
              className={fieldClass} />
          </div>
        ))}

        {(['condition', 'language'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={`${id}-${field}`} className="mb-2 block text-sm font-semibold text-primary-900">
              {field === 'condition' ? 'Condição' : 'Idioma'}
            </label>
            <select id={`${id}-${field}`} value={draft[field]}
              onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
              className={fieldClass}>
              <option value="">Todos</option>
              {Object.entries(field === 'condition' ? conditionLabels : languageLabels)
                .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        ))}

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-primary-900">Preço unitário (R$)</legend>
          <p className="text-xs text-neutral-700">Ao informar preço, somente anúncios que aceitam venda serão exibidos.</p>
          {(['minPrice', 'maxPrice'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={`${id}-${field}`} className="mb-1 block text-sm text-primary-900">
                {field === 'minPrice' ? 'Mínimo' : 'Máximo'}
              </label>
              <input id={`${id}-${field}`} type="number" min="0" max={MAX_UNIT_PRICE} step="0.01"
                value={draft[field]} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                className={fieldClass} />
            </div>
          ))}
        </fieldset>
        {error && <p role="alert" className="text-sm text-error-700">{error}</p>}

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