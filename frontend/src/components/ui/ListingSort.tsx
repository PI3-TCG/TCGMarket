const options = {
  RECENT: 'Mais recentes primeiro',
  OLDEST: 'Mais antigos primeiro',
  NAME_ASC: 'Nome: A–Z',
  NAME_DESC: 'Nome: Z–A',
} as const

export type ListingSortOrder = keyof typeof options

export function ListingSort({
  value,
  onChange,
}: {
  value: ListingSortOrder
  onChange: (value: ListingSortOrder) => void
}) {
  return (
    <label className="flex w-full flex-wrap items-center gap-2 text-sm text-text-primary sm:w-auto">
      <span className="shrink-0">Ordenar por:</span>
      <select
        className="min-h-11 min-w-0 flex-1 rounded-control border border-border-default bg-surface-input px-3 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-support-blue sm:w-auto"
        value={value}
        onChange={(event) => onChange(event.target.value as ListingSortOrder)}
      >
        {Object.entries(options).map(([order, label]) => (
          <option key={order} value={order}>{label}</option>
        ))}
      </select>
    </label>
  )
}
