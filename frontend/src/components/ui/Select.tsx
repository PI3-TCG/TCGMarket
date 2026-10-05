import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { focusRing } from './styles'
import { useDismiss } from './useDismiss'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectPreview = 'hover' | 'focus' | 'open' | 'disabled'

type SelectProps = {
  id?: string
  name?: string
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  error?: string
  invalid?: boolean
  disabled?: boolean
  variant?: 'default' | 'filter'
  preview?: SelectPreview
  emphasized?: boolean
  highlightedValue?: string
  className?: string
}

export function Select({
  id,
  name,
  label,
  placeholder = 'Selecione...',
  options,
  value,
  defaultValue = '',
  onValueChange,
  error,
  invalid = false,
  disabled = false,
  variant = 'default',
  preview,
  emphasized = false,
  highlightedValue,
  className,
}: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const listboxId = `${fieldId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(defaultValue)
  const [cursor, setCursor] = useState(0)
  const locked = preview != null
  const isDisabled = disabled || preview === 'disabled'
  const isOpen = !isDisabled && (preview === 'open' || (!locked && open))
  const isError = Boolean(error) || invalid
  const selectedValue = value ?? internal
  const selected = options.find((option) => option.value === selectedValue)

  useDismiss(isOpen && !locked, () => setOpen(false), rootRef)

  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
    if (!locked) setOpen(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (locked || isDisabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setCursor((current) => Math.min(options.length - 1, current + 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setCursor((current) => Math.max(0, current - 1))
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      const option = options[cursor]
      if (option && !option.disabled) commit(option.value)
    }

    if (event.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="mb-2 block text-sm font-medium text-neutral-900"
        >
          {label}
        </label>
      ) : null}
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-invalid={isError || undefined}
        disabled={isDisabled}
        onClick={() => {
          if (!locked && !isDisabled) setOpen((current) => !current)
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex h-10 w-full items-center justify-between gap-2 rounded-control border bg-white px-3 text-left text-sm transition-colors',
          'cursor-pointer disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500',
          focusRing,
          triggerChrome({
            isDisabled,
            isError,
            preview,
            variant,
          }),
        )}
      >
        <span
          className={cn(
            'truncate',
            !selected && 'text-neutral-500',
            selected && !emphasized && 'text-neutral-900',
            emphasized && selected && 'font-medium text-secondary-700',
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <Icon name="chevron-down" size={20} className="text-neutral-500" />
      </button>
      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className={cn(
            'z-30 mt-1 w-full rounded-control border border-neutral-200 bg-white p-1 shadow-md',
            preview === 'open' ? 'relative' : 'absolute',
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue
            const isHighlighted = option.value === highlightedValue
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onMouseEnter={() => {
                    const index = options.findIndex(
                      (item) => item.value === option.value,
                    )
                    setCursor(index)
                  }}
                  onClick={() => {
                    if (!option.disabled) commit(option.value)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500',
                    option.disabled && 'cursor-not-allowed text-neutral-500',
                    !option.disabled &&
                      !isSelected &&
                      !isHighlighted &&
                      'text-neutral-900 hover:bg-primary-100 hover:text-primary-900',
                    isHighlighted &&
                      !isSelected &&
                      'bg-primary-100 text-primary-900',
                    isSelected &&
                      'bg-secondary-100 font-medium text-secondary-700',
                  )}
                >
                  {option.label}
                  {isSelected ? <Icon name="check" size={16} /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {error ? <p className="mt-1 text-sm text-error-700">{error}</p> : null}
    </div>
  )
}

function triggerChrome({
  isDisabled,
  isError,
  preview,
  variant,
}: {
  isDisabled: boolean
  isError: boolean
  preview?: SelectPreview
  variant: 'default' | 'filter'
}) {
  if (isDisabled) return 'border-neutral-200 text-neutral-500'

  if (preview === 'hover') {
    return isError
      ? 'border-error-600 text-neutral-900'
      : 'border-primary-900 text-neutral-900'
  }

  if (preview === 'open') {
    return isError
      ? 'border-error-700 text-neutral-900'
      : 'border-primary-900 text-neutral-900'
  }

  if (preview === 'focus') {
    if (isError)
      return 'border-error-700 text-neutral-900 ring-2 ring-error-700'
    return variant === 'filter'
      ? 'border-secondary-500 text-neutral-900 ring-2 ring-secondary-500'
      : 'border-primary-900 text-neutral-900 ring-2 ring-secondary-500'
  }

  if (isError) {
    return 'border-error-700 text-neutral-900 hover:border-error-600 focus-visible:border-error-700 focus-visible:ring-2 focus-visible:ring-error-700'
  }

  if (variant === 'filter') {
    return 'border-neutral-300 text-neutral-900 hover:border-secondary-500'
  }

  return 'border-neutral-300 text-neutral-900 hover:border-primary-900'
}
