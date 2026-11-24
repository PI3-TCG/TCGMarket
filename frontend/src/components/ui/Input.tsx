import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
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
  controlText,
} from './styles'

export type InputVariant = 'default' | 'search'
export type InputPreview = 'hover' | 'focus' | 'disabled' | 'readonly'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  variant?: InputVariant
  preview?: InputPreview
  icon?: ReactNode
}

export function Input({
  label,
  hint,
  error,
  invalid = false,
  variant = 'default',
  preview,
  icon,
  id,
  className,
  disabled,
  readOnly,
  'aria-describedby': externalDescription,
  'aria-label': ariaLabel,
  ...props
}: InputProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const isError = Boolean(error) || invalid
  const isDisabled = Boolean(disabled || preview === 'disabled')
  const isReadOnly = Boolean(readOnly || preview === 'readonly')
  const hasLeadingIcon = variant === 'search' || icon != null
  const describedBy = [
    externalDescription,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <label htmlFor={fieldId} className={controlLabel}>
          {label}
        </label>
      ) : null}
      <div className="group relative">
        {hasLeadingIcon ? (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary',
              'group-focus-within:text-support-blue-text',
            )}
          >
            {icon ?? <Icon name="search" size={20} />}
          </span>
        ) : null}
        <input
          {...props}
          id={fieldId}
          aria-label={ariaLabel ?? (label ? undefined : props.placeholder)}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          disabled={isDisabled}
          readOnly={isReadOnly}
          className={cn(
            'w-full px-3 outline-none focus-visible:ring-2 focus-visible:ring-support-blue',
            controlHeight,
            controlText,
            controlSurface,
            controlDisabled,
            'read-only:border-border-default read-only:bg-surface-subtle',
            hasLeadingIcon && 'pr-3 pl-10',
            fieldChrome({
              isError,
              isSearch: variant === 'search',
              preview,
              isDisabled,
              isReadOnly,
            }),
          )}
        />
      </div>
      {hint ? (
        <p id={hintId} className={controlHint}>
          {hint}
        </p>
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

function fieldChrome({
  isError,
  isSearch,
  preview,
  isDisabled,
  isReadOnly,
}: {
  isError: boolean
  isSearch: boolean
  preview?: InputPreview
  isDisabled: boolean
  isReadOnly: boolean
}) {
  if (isDisabled || isReadOnly) return 'border-border-default'

  if (preview === 'hover') {
    return isError ? 'border-state-error' : 'border-brand-primary'
  }
  if (preview === 'focus') {
    return isError
      ? 'border-state-error ring-2 ring-state-error'
      : 'border-support-blue ring-2 ring-support-blue'
  }
  if (isError) return controlInvalid

  return cn(
    'border-border-default hover:border-brand-primary focus-visible:border-support-blue',
    isSearch && 'hover:border-support-blue',
  )
}
