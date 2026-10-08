import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

export type CheckboxPreview =
  'hover' | 'focus' | 'selected' | 'indeterminate' | 'disabled'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
  indeterminate?: boolean
  preview?: CheckboxPreview
}

export function Checkbox({
  label,
  error,
  indeterminate = false,
  preview,
  id,
  className,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const [internal, setInternal] = useState(Boolean(defaultChecked))
  const [focused, setFocused] = useState(false)
  const isDisabled = Boolean(disabled || preview === 'disabled')
  const isIndeterminate = Boolean(indeterminate || preview === 'indeterminate')
  const isChecked = Boolean(
    preview === 'selected' || (checked ?? internal) || isIndeterminate,
  )
  const showHover = preview === 'hover'
  const showFocus = preview === 'focus' || focused
  const locked = preview != null

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className={cn(
          'group inline-flex items-start gap-2 text-sm leading-5 text-neutral-900',
          isDisabled ? 'cursor-not-allowed text-neutral-500' : 'cursor-pointer',
        )}
      >
        <span className="relative mt-px inline-flex size-5 shrink-0">
          <input
            {...props}
            ref={inputRef}
            id={fieldId}
            type="checkbox"
            className={cn(
              'absolute inset-0 z-10 m-0 cursor-pointer opacity-0',
              (isDisabled || locked) && 'cursor-not-allowed',
            )}
            disabled={isDisabled || locked}
            checked={checked ?? (preview === 'selected' ? true : internal)}
            aria-invalid={error ? true : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(event) => {
              if (checked === undefined && preview == null) {
                setInternal(event.target.checked)
              }
              onChange?.(event)
            }}
          />
          <span
            className={cn(
              'pointer-events-none grid size-5 place-items-center rounded-sm border transition-colors',
              boxClass({
                isDisabled,
                isChecked,
                isIndeterminate,
                showHover,
                error: Boolean(error),
              }),
              showFocus &&
                'ring-2 ring-secondary-500 ring-offset-2 ring-offset-white',
            )}
          >
            {isIndeterminate ? (
              <Icon name="minus" size={16} />
            ) : isChecked ? (
              <Icon name="check" size={16} />
            ) : null}
          </span>
        </span>
        {label}
      </label>
      {error ? <p className="mt-1 text-sm text-error-700">{error}</p> : null}
    </div>
  )
}

function boxClass({
  isDisabled,
  isChecked,
  isIndeterminate,
  showHover,
  error,
}: {
  isDisabled: boolean
  isChecked: boolean
  isIndeterminate: boolean
  showHover: boolean
  error: boolean
}) {
  if (isDisabled) {
    return isChecked || isIndeterminate
      ? 'border-neutral-200 bg-neutral-200 text-neutral-500'
      : 'border-neutral-200 bg-neutral-100 text-neutral-500'
  }

  if (showHover && (isChecked || isIndeterminate)) {
    return error
      ? 'border-error-600 bg-error-600 text-white'
      : 'border-primary-800 bg-primary-800 text-white'
  }

  if (showHover) {
    return error
      ? 'border-error-600 bg-white text-error-700'
      : 'border-primary-900 bg-primary-100 text-primary-900'
  }

  if (error && (isChecked || isIndeterminate)) {
    return 'border-error-700 bg-error-700 text-white'
  }

  if (error) {
    return 'border-error-700 bg-white text-error-700 group-hover:border-error-600'
  }

  if (isChecked || isIndeterminate) {
    return 'border-primary-900 bg-primary-900 text-white group-hover:border-primary-800 group-hover:bg-primary-800'
  }

  return 'border-neutral-300 bg-white text-primary-900 group-hover:border-primary-900 group-hover:bg-primary-100'
}
