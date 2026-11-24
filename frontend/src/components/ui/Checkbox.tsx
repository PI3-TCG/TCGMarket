import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { controlError, controlHint } from './styles'

export type CheckboxPreview =
  | 'hover'
  | 'focus'
  | 'selected'
  | 'indeterminate'
  | 'disabled'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  hint?: string
  error?: string
  indeterminate?: boolean
  preview?: CheckboxPreview
}

export function Checkbox({
  label,
  hint,
  error,
  indeterminate = false,
  preview,
  id,
  className,
  checked,
  defaultChecked,
  disabled,
  onChange,
  'aria-describedby': externalDescription,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const [internal, setInternal] = useState(Boolean(defaultChecked))
  const isDisabled = Boolean(disabled || preview === 'disabled')
  const isIndeterminate = Boolean(indeterminate || preview === 'indeterminate')
  const isChecked = Boolean(
    preview === 'selected' || (checked ?? internal) || isIndeterminate,
  )
  const locked = preview != null
  const describedBy = [
    externalDescription,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className={cn(
          'group inline-flex min-h-11 items-center gap-1 font-sans text-sm leading-5 text-text-primary',
          isDisabled ? 'cursor-not-allowed text-text-secondary' : 'cursor-pointer',
        )}
      >
        <span className="relative inline-flex size-11 shrink-0 items-center justify-center">
          <input
            {...props}
            ref={inputRef}
            id={fieldId}
            type="checkbox"
            className={cn(
              'peer absolute inset-0 z-10 m-0 size-11 cursor-pointer opacity-0',
              (isDisabled || locked) && 'cursor-not-allowed',
            )}
            disabled={isDisabled || locked}
            checked={checked ?? (preview === 'selected' ? true : internal)}
            aria-checked={isIndeterminate ? 'mixed' : undefined}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              if (checked === undefined && preview == null) setInternal(event.target.checked)
              onChange?.(event)
            }}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none grid size-5 place-items-center rounded-sm border transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-support-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-default',
              preview === 'focus' &&
                'ring-2 ring-support-blue ring-offset-2 ring-offset-surface-default',
              boxClass({
                isDisabled,
                isChecked,
                isIndeterminate,
                showHover: preview === 'hover',
                error: Boolean(error),
              }),
            )}
          >
            {isIndeterminate ? (
              <Icon name="minus" size={16} />
            ) : isChecked ? (
              <Icon name="check" size={16} />
            ) : null}
          </span>
        </span>
        {label ? <span>{label}</span> : null}
      </label>
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
      ? 'border-border-default bg-surface-subtle text-text-secondary'
      : 'border-border-default bg-surface-default text-text-secondary'
  }

  if (showHover && (isChecked || isIndeterminate)) {
    return error
      ? 'border-state-error bg-state-error text-white'
      : 'border-brand-primary-hover bg-brand-primary-hover text-white'
  }

  if (showHover) {
    return error
      ? 'border-state-error bg-surface-input text-state-error'
      : 'border-brand-primary bg-surface-brand-tint text-brand-primary'
  }

  if (error && (isChecked || isIndeterminate)) {
    return 'border-state-error bg-state-error text-white'
  }

  if (error) {
    return 'border-state-error bg-surface-input text-state-error group-hover:border-state-error'
  }

  if (isChecked || isIndeterminate) {
    return 'border-brand-primary bg-brand-primary text-white group-hover:border-brand-primary-hover group-hover:bg-brand-primary-hover'
  }

  return 'border-border-default bg-surface-input text-brand-primary group-hover:border-brand-primary group-hover:bg-surface-brand-tint'
}
