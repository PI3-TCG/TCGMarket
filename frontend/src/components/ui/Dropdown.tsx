import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'
import {
  controlHeight,
  controlSurface,
  focusRing,
  menuSurface,
} from './styles'
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

/**
 * Menu de AÇÕES (role=menu/menuitem), não um Select de formulário.
 * Abre com Enter/Espaço/setas, permite navegar e retorna foco ao botão no Escape.
 */
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const locked = preview != null
  const menuVisible = preview === 'hover' || preview === 'open' || (!locked && open)
  const inline = preview === 'hover' || preview === 'open'

  useDismiss(menuVisible && !locked, () => setOpen(false), rootRef)

  useEffect(() => {
    if (!open || locked || focusedIndex < 0) return
    itemRefs.current[focusedIndex]?.focus()
  }, [open, focusedIndex, locked])

  function firstEnabledIndex() {
    return items.findIndex((item) => !item.disabled)
  }

  function lastEnabledIndex() {
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (!items[index].disabled) return index
    }
    return -1
  }

  function openMenu(fromEnd = false) {
    setFocusedIndex(fromEnd ? lastEnabledIndex() : firstEnabledIndex())
    setOpen(true)
  }

  function closeMenu(returnFocus = false) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (locked) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openMenu(event.key === 'ArrowUp')
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (locked) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu(true)
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setFocusedIndex(event.key === 'Home' ? firstEnabledIndex() : lastEnabledIndex())
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setFocusedIndex((current) => {
        let next = current
        for (let step = 0; step < items.length; step += 1) {
          next += direction
          if (next < 0 || next >= items.length) return current
          if (!items[next].disabled) return next
        }
        return current
      })
    }
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuVisible}
        aria-controls={menuVisible ? menuId : undefined}
        onClick={() => {
          if (locked) return
          if (open) closeMenu()
          else openMenu()
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'inline-flex w-full min-w-36 items-center justify-between gap-3 px-3 text-sm',
          controlHeight,
          controlSurface,
          focusRing,
          'cursor-pointer border-border-default hover:border-brand-primary active:bg-surface-subtle',
          (preview === 'hover' || preview === 'open') && 'border-brand-primary',
          preview === 'focus' &&
            'border-support-blue ring-2 ring-support-blue ring-offset-2 ring-offset-surface-default',
        )}
      >
        <span>{label}</span>
        <Icon name="chevron-down" size={20} className="text-text-secondary" />
      </button>
      {menuVisible ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'z-30 mt-1 w-full min-w-52',
            menuSurface,
            inline ? 'relative' : 'absolute',
          )}
        >
          {items.map((item, index) => {
            const highlighted = item.id === highlightedId
            const selected = item.id === selectedId
            const danger = item.tone === 'danger'

            return (
              <button
                key={item.id}
                ref={(node) => { itemRefs.current[index] = node }}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                tabIndex={locked || item.disabled ? -1 : index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                onClick={() => {
                  if (item.disabled || locked) return
                  onSelect?.(item.id)
                  closeMenu(true)
                }}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-support-blue',
                  item.disabled && 'cursor-not-allowed bg-surface-subtle text-text-secondary opacity-60',
                  !item.disabled && 'cursor-pointer active:bg-surface-subtle',
                  !item.disabled && !highlighted && !selected &&
                    (danger
                      ? 'text-state-error hover:bg-error-50'
                      : 'text-text-primary hover:bg-surface-brand-tint hover:text-brand-primary'),
                  highlighted && !danger && 'bg-surface-brand-tint text-brand-primary',
                  highlighted && danger && 'bg-error-50 text-state-error',
                  selected && !highlighted && 'bg-surface-lavender font-semibold text-brand-deep',
                )}
              >
                {item.icon ? (
                  <Icon name={item.icon} size={20} />
                ) : danger ? (
                  <Icon name="alert" size={20} />
                ) : null}
                <span className="min-w-0 flex-1 text-left">{item.label}</span>
                {selected && <Icon name="check" size={16} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
