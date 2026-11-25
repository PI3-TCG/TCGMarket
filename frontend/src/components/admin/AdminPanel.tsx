import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/components/ui/cn'

/**
 * Painel visual compartilhado por Usuários e Catálogo. Nunca assume dados/API.
 * Overflow visível permite que Select e diálogos não sejam recortados.
 */
export function AdminPanel({
  title,
  icon,
  description,
  action,
  children,
  className = '',
}: {
  title: string
  icon: IconName
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(
      'admin-v2-panel relative isolate min-w-0 rounded-surface border border-border-default bg-surface-default shadow-sm',
      className,
    )}>
      <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 rounded-t-surface border-b border-border-default bg-surface-subtle/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 font-display text-sm font-bold uppercase tracking-[0.015em] text-text-ink sm:text-base">
            <Icon name={icon} size={20} className="text-brand-primary" />
            {title}
          </h2>
          {description ? (
            <p className="mt-1 pl-[30px] text-xs leading-relaxed text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="min-w-0">{action}</div> : null}
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** O retry é individual; um widget com erro não impede os demais. */
export function AdminState({
  status,
  message,
  onRetry,
}: {
  status: 'loading' | 'error' | 'empty'
  message: string
  onRetry?: () => void
}) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label={message} className="space-y-3 px-5 py-7">
        <span className="sr-only">{message}</span>
        {[0, 1, 2].map((item) => (
          <div key={item} aria-hidden="true" className="h-12 animate-pulse rounded-control border border-border-default bg-surface-subtle/70 motion-reduce:animate-none" />
        ))}
      </div>
    )
  }

  return (
    <div
      role={status === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-3 px-5 py-9 text-center text-sm text-text-secondary"
    >
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-border-default bg-surface-input text-brand-primary">
        <Icon name={status === 'error' ? 'alert' : 'info'} size={24} />
      </span>
      <p className="max-w-lg leading-relaxed">{message}</p>
      {status === 'error' && onRetry ? (
        <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>
      ) : null}
    </div>
  )
}

export const adminFilterClearClass =
  'inline-flex min-h-10 items-center gap-1.5 rounded-control px-3 text-xs font-semibold text-brand-primary underline underline-offset-2 transition-colors hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'

export const adminButtonClass =
  'focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-support-blue'

export const adminTableHeaderClass =
  'border-b border-border-default bg-surface-subtle text-[11px] font-bold uppercase tracking-[0.04em] text-text-primary'

export const adminTableRowClass =
  'border-b border-border-default even:bg-surface-input/50 transition-colors hover:bg-surface-brand-tint'
