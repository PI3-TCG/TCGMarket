import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
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
  const labelId = `${fieldId}-label`
  const errorId = `${fieldId}-error`
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

  // Mantém a opção ativa visível durante a navegação por teclado.
  useEffect(() => {
    if (!isOpen || locked || cursor < 0) return

    const option = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    )[cursor]

    if (!option) return

    const listbox = option.closest<HTMLElement>('[role="listbox"]')
    if (!listbox) return

    const optionTop = option.getBoundingClientRect().top - listbox.getBoundingClientRect().top + listbox.scrollTop
    const optionBottom = optionTop + option.offsetHeight

    if (optionTop < listbox.scrollTop) {
      listbox.scrollTop = optionTop
    } else if (optionBottom > listbox.scrollTop + listbox.clientHeight) {
      listbox.scrollTop = optionBottom - listbox.clientHeight
    }
  }, [cursor, isOpen, locked])

  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
    if (!locked) setOpen(false)
  }

  function placeCursor() {
    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue,
    )
    setCursor(
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : firstEnabledIndex(options),
    )
  }

  function openList() {
    placeCursor()
    setOpen(true)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (locked || isDisabled) return
    if (event.key === 'Tab' && open) {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setCursor((current) => moveEnabledIndex(options, current, direction))
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      const option = options[cursor]
      if (option && !option.disabled) commit(option.value)
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      {label ? (
        <label
          id={labelId}
          htmlFor={fieldId}
          className="mb-2 block text-sm font-medium text-neutral-900"
        >
          {label}
        </label>
      ) : null}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={selectedValue}
          disabled={isDisabled}
        />
      ) : null}
      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-labelledby={label ? labelId : undefined}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && options[cursor] && !options[cursor].disabled
            ? `${listboxId}-option-${cursor}`
            : undefined
        }
        aria-invalid={isError || undefined}
        aria-describedby={error ? errorId : undefined}
        disabled={isDisabled}
        onClick={() => {
          if (locked || isDisabled) return
          if (open) {
            setOpen(false)
            return
          }
          openList()
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex h-10 w-full items-center justify-between gap-2 rounded-control border bg-white px-3 text-left text-sm transition-colors',
          variant === 'filter' && 'filter-field button-vignette',
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
            'z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-control border border-neutral-200 bg-white p-1 shadow-md',
            preview === 'open' ? 'relative' : 'absolute',
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue
            const isActive = index === cursor
            const isHighlighted = option.value === highlightedValue

            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() => {
                  if (!option.disabled) {
                    setCursor(index)
                  }
                }}
                onClick={() => {
                  if (!option.disabled && !locked) {
                    commit(option.value)
                  }
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                  option.disabled
                    ? 'cursor-not-allowed text-neutral-500'
                    : 'cursor-pointer text-neutral-900',
                  !option.disabled &&
                    isActive &&
                    'bg-primary-100 text-primary-900',
                  !option.disabled &&
                    isHighlighted &&
                    !isSelected &&
                    'bg-primary-100 text-primary-900',
                  isSelected &&
                    'bg-secondary-100 font-medium text-secondary-700',
                )}
              >
                <span>{option.label}</span>
                {isSelected ? <Icon name="check" size={16} /> : null}
              </li>
            )
          })}
        </ul>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-error-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function firstEnabledIndex(options: SelectOption[]) {
  return options.findIndex((option) => !option.disabled)
}

function moveEnabledIndex(
  options: SelectOption[],
  from: number,
  direction: 1 | -1,
) {
  let index = from
  for (let step = 0; step < options.length; step += 1) {
    index += direction
    if (index < 0 || index >= options.length) return from
    if (!options[index]?.disabled) return index
  }
  return from
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
