import type { ReactNode } from 'react'
import { tradingCardGrid } from './tradingCardStyles'
import { cn } from './cn'

/**
 * DS-11 — apresentação reutilizável de listagens. Sem API, roteamento,
 * ordenação, filtros ou regras de negócio.
 * O grid permanece o tradingCardGrid já aprovado na DS-04.
 */
export const listingPanelClass =
  'min-w-0 rounded-surface border border-border-default bg-neutral-0 p-4 shadow-sm sm:p-5'

export const listingLabelClass = 'text-sm font-semibold text-text-primary'
export const listingSortClass =
  'min-h-11 min-w-0 rounded-control border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-support-blue/40'

export function ListingHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold text-text-ink">{title}</h2>
        <p aria-live="polite" className="mt-1 text-sm text-text-secondary">
          {description}
        </p>
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** Skeleton com a proporção real da carta; nunca usa preços ou métricas fictícias. */
export function ListingSkeleton({
  label,
  count = 8,
  className,
}: {
  label: string
  count?: number
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn(tradingCardGrid, className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="min-w-0 overflow-hidden rounded-surface border border-border-default bg-surface-default shadow-sm motion-safe:animate-pulse"
        >
          <div className="flex justify-center bg-surface-sand/60 p-3">
            <div className="aspect-[5/7] w-[82%] rounded-control bg-surface-subtle" />
          </div>
          <div className="space-y-2.5 p-3.5">
            <div className="h-4 w-4/5 rounded bg-surface-subtle" />
            <div className="h-3 w-2/3 rounded bg-surface-subtle" />
            <div className="h-5 w-20 rounded-full bg-surface-subtle" />
            <div className="h-10 rounded-control bg-surface-subtle" />
          </div>
        </div>
      ))}
    </div>
  )
}
