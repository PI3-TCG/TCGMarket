import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import type { Address } from '@/types/Address'
import { addressTitle, cityLine, maskZipCode, streetLine } from './addressFormat'

type AddressCardProps = {
  address: Address
  selected: boolean
  onSelect: () => void
  onEdit: () => void
}

export function AddressCard({ address, selected, onSelect, onEdit }: AddressCardProps) {
  const title = addressTitle(address)

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-colors sm:p-5',
        selected
          ? 'border-secondary-500 ring-1 ring-secondary-500'
          : 'border-neutral-200 hover:border-secondary-500',
      )}
    >
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-4">
        <input
          type="radio"
          name="delivery-address"
          value={address.id}
          checked={selected}
          onChange={onSelect}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-500 peer-focus-visible:ring-offset-2',
            selected ? 'border-secondary-500' : 'border-neutral-300',
          )}
        >
          {selected ? <span className="size-2.5 rounded-full bg-secondary-500" /> : null}
        </span>
        <span className="hidden size-12 shrink-0 place-items-center rounded-lg bg-secondary-100 text-secondary-700 sm:grid">
          <Icon name={address.label?.toLowerCase() === 'casa' ? 'home' : 'map-pin'} size={24} />
        </span>
        <span className="min-w-0 text-sm text-neutral-700">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-bold text-secondary-700">
              {title}
            </span>
            {address.primary ? <Badge variant="success">Principal</Badge> : null}
          </span>
          {address.label ? (
            <span className="block text-neutral-900">{address.recipientName}</span>
          ) : null}
          <span className="block">{streetLine(address)}</span>
          <span className="block">{cityLine(address)}</span>
          <span className="block">CEP {maskZipCode(address.zipCode)}</span>
        </span>
      </label>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar endereço ${title}`}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-control px-2 py-1 text-sm font-semibold text-secondary-700 hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
      >
        <Icon name="edit" size={16} />
        Editar
      </button>
    </li>
  )
}
