import { useId, useRef, useState } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'
import { focusRing } from './styles'
import { useDismiss } from './useDismiss'

export type DropdownItem = {
  id: string
  label: string
  icon?: IconName
  tone?: 'default' | 'danger'
  disabled?: boolean
}

type DropdownProps = {
  label?: string
  items: DropdownItem[]
  preview?: 'hover' | 'open' | 'focus'
  highlightedId?: string
  selectedId?: string
  onSelect?: (id: string) => void
  className?: string
}

export function Dropdown({
  label = 'Ações',
  items,
  preview,
  highlightedId,
  selectedId,
  onSelect,
  className,
}: DropdownProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const locked = preview != null
  const menuVisible =
    preview === 'hover' || preview === 'open' || (!locked && open)
  const inline = preview === 'hover' || preview === 'open'

  useDismiss(menuVisible && !locked, () => setOpen(false), rootRef)

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuVisible}
        aria-controls={menuId}
        onClick={() => {
          if (!locked) setOpen((current) => !current)
        }}
        className={cn(
          'inline-flex h-10 w-full min-w-36 cursor-pointer items-center justify-between gap-3 rounded-control border bg-white px-3 text-sm text-neutral-900',
          focusRing,
          preview === 'hover' || preview === 'open'
            ? 'border-primary-900'
            : 'border-neutral-300 hover:border-primary-900',
          preview === 'focus' &&
            'border-primary-900 ring-2 ring-secondary-500 ring-offset-2 ring-offset-white',
        )}
      >
        <span>{label}</span>
        <Icon name="chevron-down" size={20} className="text-neutral-500" />
      </button>
      {menuVisible ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'z-30 mt-1 w-full min-w-52 rounded-control border border-neutral-200 bg-white p-1 shadow-md',
            inline ? 'relative' : 'absolute',
          )}
        >
          {items.map((item) => {
            const highlighted = item.id === highlightedId
            const selected = item.id === selectedId
            const danger = item.tone === 'danger'

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return
                  onSelect?.(item.id)
                  if (!locked) setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500',
                  item.disabled &&
                    'cursor-not-allowed bg-neutral-100 text-neutral-500',
                  !item.disabled &&
                    !highlighted &&
                    !selected &&
                    (danger
                      ? 'text-error-700 hover:bg-error-50'
                      : 'text-neutral-900 hover:bg-primary-100 hover:text-primary-900'),
                  highlighted && !danger && 'bg-primary-100 text-primary-900',
                  highlighted && danger && 'bg-error-50 text-error-700',
                  selected &&
                    !highlighted &&
                    'bg-secondary-100 text-secondary-700',
                )}
              >
                {item.icon ? <Icon name={item.icon} size={20} /> : null}
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
