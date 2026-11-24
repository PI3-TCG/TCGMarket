import { type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from './cn'
import { controlHeight, focusRing } from './styles'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type ButtonPreview = 'hover' | 'focus' | 'disabled'

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant
  preview?: ButtonPreview
  icon?: ReactNode
  /** Estado de carregamento: bloqueia ativações duplicadas. */
  loading?: boolean
}

const rest: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-white',
  secondary: 'bg-support-blue-text text-white',
  outline: 'border border-brand-primary bg-transparent text-brand-primary',
  ghost: 'bg-transparent text-brand-primary',
  danger: 'bg-state-error text-white',
}

const hover: Record<ButtonVariant, string> = {
  primary: 'hover:bg-brand-primary-hover active:bg-brand-primary-hover',
  secondary: 'hover:bg-secondary-700 active:bg-secondary-700',
  outline: 'hover:bg-surface-brand-tint active:bg-surface-brand-tint',
  ghost: 'hover:bg-surface-brand-tint active:bg-surface-brand-tint',
  danger: 'hover:bg-error-600 active:bg-error-600',
}

const hovered: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary-hover text-white',
  secondary: 'bg-secondary-700 text-white',
  outline: 'border border-brand-primary bg-surface-brand-tint text-brand-primary',
  ghost: 'bg-surface-brand-tint text-brand-primary',
  danger: 'bg-error-600 text-white',
}

export function Button({
  variant = 'primary',
  preview,
  icon,
  loading = false,
  className,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading || preview === 'disabled')
  const showHover = preview === 'hover'

  return (
    <button
      {...props}
      type={type ?? 'button'}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-w-0 items-center justify-center gap-2 rounded-control px-4 font-sans text-sm font-semibold whitespace-nowrap transition-colors duration-150',
        controlHeight,
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
        focusRing,
        showHover ? hovered[variant] : rest[variant],
        !isDisabled && !showHover && hover[variant],
        preview === 'focus' &&
          'ring-2 ring-support-blue ring-offset-2 ring-offset-surface-default',
        className,
      )}
    >
      {loading ? (
        <svg
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="3"
          />
          <path
            d="M12 3a9 9 0 0 1 9 9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {loading && <span className="sr-only">(carregando)</span>}
    </button>
  )
}
