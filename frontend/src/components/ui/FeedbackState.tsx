import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { cn } from './cn'

export function FeedbackState({
  role = 'status',
  icon,
  title,
  description,
  children,
  className,
}: {
  role?: 'status' | 'alert'
  icon: IconName
  title: string
  description: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      role={role}
      className={cn('flex min-h-56 flex-col items-center justify-center px-4 py-10 text-center', className)}
    >
      <span
        className={cn(
          'mb-4 rounded-full p-4',
          role === 'alert' ? 'bg-error-50 text-error-700' : 'bg-primary-100 text-primary-900',
        )}
      >
        <Icon name={icon} size={32} />
      </span>
      <h2 className="font-display text-xl font-bold text-primary-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-neutral-700">{description}</p>
      {children ? (
        <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>
      ) : null}
    </div>
  )
}
