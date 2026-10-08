import { type ReactNode } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

export type BadgeVariant =
  | 'sale'
  | 'trade'
  | 'both'
  | 'available'
  | 'sold'
  | 'rare'
  | 'foil'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'

type BadgeProps = {
  variant?: BadgeVariant
  tone?: 'soft' | 'solid'
  icon?: IconName
  children: ReactNode
  className?: string
}

const soft: Record<BadgeVariant, string> = {
  sale: 'bg-primary-900 text-white',
  trade: 'bg-secondary-500 text-white',
  both: 'bg-primary-100 text-primary-900',
  available: 'bg-success-50 text-success-700',
  sold: 'bg-neutral-100 text-neutral-500',
  rare: 'bg-rare-100 text-rare-700',
  foil: 'bg-rare-100 text-rare-700',
  primary: 'bg-primary-100 text-primary-900',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  neutral: 'bg-neutral-100 text-neutral-700',
}

const solidOverride: Partial<Record<BadgeVariant, string>> = {
  rare: 'bg-rare-500 text-white',
  foil: 'bg-rare-500 text-white',
}

const defaultIcon: Partial<Record<BadgeVariant, IconName>> = {
  rare: 'gem',
  foil: 'sparkle',
}

export function Badge({
  variant = 'neutral',
  tone = 'soft',
  icon,
  children,
  className,
}: BadgeProps) {
  const glyph = icon ?? defaultIcon[variant]

  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold',
        soft[variant],
        tone === 'solid' && solidOverride[variant],
        className,
      )}
    >
      {glyph ? <Icon name={glyph} size={16} /> : null}
      {children}
    </span>
  )
}
