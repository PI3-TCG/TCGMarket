import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

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
  ...props
}: InputProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const messageId = `${fieldId}-message`
  const isError = Boolean(error) || invalid
  const isDisabled = Boolean(disabled || preview === 'disabled')
  const isReadOnly = Boolean(readOnly || preview === 'readonly')
  const isSearch = variant === 'search'
  const describedBy = error || hint ? messageId : undefined

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="mb-2 block text-sm font-medium text-neutral-900"
        >
          {label}
        </label>
      ) : null}
      <div className="group relative">
        {isSearch || icon ? (
          <span
            className={cn(
              'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500',
              isSearch
                ? 'group-focus-within:text-secondary-500'
                : 'group-focus-within:text-primary-900',
              preview === 'focus' &&
                (isSearch ? 'text-secondary-500' : 'text-primary-900'),
            )}
          >
            {icon ?? <Icon name="search" size={20} />}
          </span>
        ) : null}
        <input
          id={fieldId}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-control border bg-white px-3 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-500',
            'disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500',
            'read-only:border-neutral-200 read-only:bg-neutral-100 read-only:text-neutral-700',
            (isSearch || icon != null) && 'pr-3 pl-10',
            fieldChrome({ isError, isSearch, preview, isDisabled, isReadOnly }),
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={messageId} className="mt-1 text-sm text-error-700">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1 text-sm text-neutral-500">
          {hint}
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
  if (isDisabled || isReadOnly) return 'border-neutral-200'

  if (preview === 'hover') {
    if (isError) return 'border-error-600'
    return isSearch ? 'border-secondary-500' : 'border-primary-900'
  }

  if (preview === 'focus') {
    if (isError) return 'border-error-700 ring-2 ring-error-700'
    return isSearch
      ? 'border-secondary-500 ring-2 ring-secondary-500'
      : 'border-primary-900 ring-2 ring-secondary-500'
  }

  if (isError) {
    return 'border-error-700 hover:border-error-600 focus:border-error-700 focus:ring-2 focus:ring-error-700'
  }

  if (isSearch) {
    return 'border-neutral-300 hover:border-secondary-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500'
  }

  return 'border-neutral-300 hover:border-primary-900 focus:border-primary-900 focus:ring-2 focus:ring-secondary-500'
}
