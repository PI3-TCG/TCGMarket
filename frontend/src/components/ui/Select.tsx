import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import {
  controlDisabled,
  controlError,
  controlHeight,
  controlHint,
  controlInvalid,
  controlLabel,
  controlSurface,
  focusRing,
  menuSurface,
} from './styles'
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
  /** Texto auxiliar opcional, sem quebrar as props já existentes. */
  hint?: string
  invalid?: boolean
  disabled?: boolean
  variant?: 'default' | 'filter'
  preview?: SelectPreview
  emphasized?: boolean
  highlightedValue?: string
  className?: string
}

/**
 * Select de escolha única. Não é um menu de ações e não é um campo editável.
 * O foco permanece no botão combobox; as opções são percorridas via
 * aria-activedescendant, sem rolagem indevida da página.
 */
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
  hint,
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
  const valueId = `${fieldId}-value`
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(defaultValue)
  const [cursor, setCursor] = useState(-1)
  const locked = preview != null
  const isDisabled = disabled || preview === 'disabled'
  const isOpen = !isDisabled && (preview === 'open' || (!locked && open))
  const isError = Boolean(error) || invalid
  const selectedValue = value ?? internal
  const selected = options.find((option) => option.value === selectedValue)
  const describedBy = [hint ? hintId : undefined, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ') || undefined

  useDismiss(isOpen && !locked, () => setOpen(false), rootRef)

  // Rolagem EXCLUSIVAMENTE da listbox; nunca usar scrollIntoView na página.
  useEffect(() => {
    if (!isOpen || locked || cursor < 0) return

    const option = rootRef.current?.querySelector<HTMLElement>(
      `[id="${listboxId}-option-${cursor}"]`,
    )
    if (!option) return

    const listbox = option.closest<HTMLElement>('[role="listbox"]')
    if (!listbox) return

    const optionTop =
      option.getBoundingClientRect().top -
      listbox.getBoundingClientRect().top +
      listbox.scrollTop
    const optionBottom = optionTop + option.offsetHeight

    if (optionTop < listbox.scrollTop) {
      listbox.scrollTop = optionTop
    } else if (optionBottom > listbox.scrollTop + listbox.clientHeight) {
      listbox.scrollTop = optionBottom - listbox.clientHeight
    }
  }, [cursor, isOpen, listboxId, locked])

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
      return
    }

    if (event.key === 'Home' && open) {
      event.preventDefault()
      setCursor(firstEnabledIndex(options))
      return
    }

    if (event.key === 'End' && open) {
      event.preventDefault()
      setCursor(lastEnabledIndex(options))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      const option = options[cursor]
      if (option && !option.disabled) commit(option.value)
      return
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
        <label id={labelId} htmlFor={fieldId} className={controlLabel}>
          {label}
        </label>
      ) : null}
      {name ? (
        <input type="hidden" name={name} value={selectedValue} disabled={isDisabled} />
      ) : null}
      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && options[cursor] && !options[cursor].disabled
            ? `${listboxId}-option-${cursor}`
            : undefined
        }
        aria-invalid={isError || undefined}
        aria-describedby={describedBy}
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
          'inline-flex w-full items-center justify-between gap-2 px-3 text-left text-sm',
          controlHeight,
          controlSurface,
          controlDisabled,
          variant === 'filter' && 'filter-field',
          'cursor-pointer active:border-brand-primary',
          focusRing,
          triggerChrome({ isDisabled, isError, preview, variant }),
        )}
      >
        <span
          id={valueId}
          className={cn(
            'truncate',
            !selected && 'text-text-secondary',
            selected && !emphasized && 'text-text-primary',
            emphasized && selected && 'font-medium text-brand-primary',
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        {isError ? (
          <Icon name="alert" size={16} className="shrink-0 text-state-error" />
        ) : null}
        <Icon name="chevron-down" size={20} className="shrink-0 text-text-secondary" />
      </button>
      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          className={cn(
            'z-30 mt-1 max-h-60 w-full overflow-y-auto overscroll-contain',
            menuSurface,
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
                  if (!option.disabled) setCursor(index)
                }}
                onClick={() => {
                  if (!option.disabled && !locked) commit(option.value)
                }}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm',
                  option.disabled
                    ? 'cursor-not-allowed text-text-secondary opacity-60'
                    : 'cursor-pointer text-text-primary active:bg-surface-subtle',
                  !option.disabled && isActive && 'bg-surface-brand-tint text-brand-primary',
                  !option.disabled && isHighlighted && !isSelected &&
                    'bg-surface-brand-tint text-brand-primary',
                  isSelected && 'bg-surface-lavender font-semibold text-brand-deep',
                )}
              >
                <span>{option.label}</span>
                {isSelected ? <Icon name="check" size={16} className="shrink-0" /> : null}
              </li>
            )
          })}
        </ul>
      ) : null}
      {hint ? (
        <p id={hintId} className={controlHint}>{hint}</p>
      ) : null}
      {error ? (
        <p id={errorId} className={controlError}>
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function firstEnabledIndex(options: SelectOption[]) {
  return options.findIndex((option) => !option.disabled)
}

function lastEnabledIndex(options: SelectOption[]) {
  for (let i = options.length - 1; i >= 0; i -= 1) {
    if (!options[i].disabled) return i
  }
  return -1
}

function moveEnabledIndex(
  options: SelectOption[],
  from: number,
  direction: 1 | -1,
) {
  if (from < 0) return direction === 1 ? firstEnabledIndex(options) : lastEnabledIndex(options)

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
  if (isDisabled) return 'border-border-default text-text-secondary'
  if (preview === 'hover' || preview === 'open') {
    return isError
      ? 'border-state-error text-text-primary'
      : 'border-brand-primary text-text-primary'
  }
  if (preview === 'focus') {
    return isError
      ? 'border-state-error text-text-primary ring-2 ring-state-error'
      : 'border-support-blue text-text-primary ring-2 ring-support-blue'
  }
  if (isError) return cn(controlInvalid, 'text-text-primary')
  return cn(
    'border-border-default text-text-primary hover:border-brand-primary',
    variant === 'filter' && 'hover:border-support-blue',
  )
}
