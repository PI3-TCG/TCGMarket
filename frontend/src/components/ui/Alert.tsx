import { type ReactNode } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

export type AlertVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type AlertProps = {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onDismiss?: () => void
  className?: string
}

const styles: Record<AlertVariant, { box: string; icon: IconName }> = {
  success: {
    box: 'border-success-200 bg-success-50 text-success-700',
    icon: 'check-circle',
  },
  warning: {
    box: 'border-warning-200 bg-warning-50 text-warning-700',
    icon: 'alert',
  },
  error: {
    box: 'border-error-200 bg-error-50 text-error-700',
    icon: 'close-circle',
  },
  info: {
    box: 'border-info-200 bg-info-50 text-info-700',
    icon: 'info',
  },
  neutral: {
    box: 'border-neutral-200 bg-neutral-100 text-neutral-700',
    icon: 'info',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const style = styles[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-control border px-4 py-3 text-sm',
        style.box,
        className,
      )}
    >
      <Icon name={style.icon} size={20} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={title ? 'mt-0.5' : undefined}>{children}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar"
          className="cursor-pointer rounded-sm p-0.5 text-current opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <Icon name="close" size={20} />
        </button>
      ) : null}
    </div>
  )
}
