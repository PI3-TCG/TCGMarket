import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { focusRing } from './styles'

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

export type ButtonPreview = 'hover' | 'focus' | 'disabled'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  preview?: ButtonPreview
  icon?: ReactNode
}

const rest: Record<ButtonVariant, string> = {
  primary: 'bg-primary-900 text-white',
  secondary: 'bg-secondary-500 text-white',
  outline: 'border border-primary-900 bg-transparent text-primary-900',
  ghost: 'bg-transparent text-primary-900',
  danger: 'bg-error-700 text-white',
}

const hover: Record<ButtonVariant, string> = {
  primary: 'hover:bg-primary-800 active:bg-primary-800',
  secondary: 'hover:bg-secondary-700 active:bg-secondary-700',
  outline: 'hover:bg-primary-100 active:bg-primary-100',
  ghost: 'hover:bg-primary-100 active:bg-primary-100',
  danger: 'hover:bg-error-600 active:bg-error-600',
}

const hovered: Record<ButtonVariant, string> = {
  primary: 'bg-primary-800 text-white',
  secondary: 'bg-secondary-700 text-white',
  outline: 'border border-primary-900 bg-primary-100 text-primary-900',
  ghost: 'bg-primary-100 text-primary-900',
  danger: 'bg-error-600 text-white',
}

export function Button({
  variant = 'primary',
  preview,
  icon,
  className,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || preview === 'disabled')
  const showHover = preview === 'hover'

  return (
    <button
      type={type ?? 'button'}
      disabled={isDisabled}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-45',
        focusRing,
        showHover ? hovered[variant] : rest[variant],
        !isDisabled && !showHover && hover[variant],
        preview === 'focus' &&
          'ring-2 ring-secondary-500 ring-offset-2 ring-offset-white',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
