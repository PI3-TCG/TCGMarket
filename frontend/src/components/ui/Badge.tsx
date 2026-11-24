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

// Conservar a API pública e manter rótulo/ícone como evidência de estado,
// sem depender apenas de diferenças cromáticas.
const soft: Record<BadgeVariant, string> = {
  sale: 'bg-brand-primary text-white',
  trade: 'bg-support-blue-text text-white',
  both: 'bg-surface-brand-tint text-brand-primary',
  available: 'bg-success-50 text-state-success-text',
  sold: 'bg-surface-subtle text-text-secondary',
  rare: 'bg-accent-gold-soft text-accent-gold-deep',
  foil: 'bg-accent-gold-soft text-accent-gold-deep',
  primary: 'bg-surface-brand-tint text-brand-primary',
  secondary: 'bg-info-50 text-support-blue-text',
  success: 'bg-success-50 text-state-success-text',
  warning: 'bg-warning-50 text-state-warning-text',
  error: 'bg-error-50 text-state-error',
  neutral: 'bg-surface-subtle text-text-primary',
}

const solidOverride: Partial<Record<BadgeVariant, string>> = {
  rare: 'bg-chip-rare-bg text-chip-rare-text',
  foil: 'bg-accent-gold-deep text-white',
}

const defaultIcon: Partial<Record<BadgeVariant, IconName>> = {
  rare: 'gem',
  foil: 'sparkle',
  available: 'check-circle',
  sold: 'close-circle',
  success: 'check-circle',
  warning: 'alert',
  error: 'close-circle',
}

export function Badge({
  variant = 'neutral',
  tone = 'soft',
  icon,
  children,
  className,
}: BadgeProps) {
  const glyph = icon ?? defaultIcon[variant]
  const appearance =
    tone === 'solid' && solidOverride[variant]
      ? solidOverride[variant]
      : soft[variant]

  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1 rounded-full px-2 py-0.5 font-sans text-xs font-semibold leading-4',
        appearance,
        className,
      )}
    >
      {glyph ? <Icon name={glyph} size={16} /> : null}
      {children}
    </span>
  )
}
