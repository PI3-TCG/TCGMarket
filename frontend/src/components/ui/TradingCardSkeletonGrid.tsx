import { cardSurface } from './Card'
import { tradingCardGrid } from './tradingCardStyles'

export function TradingCardSkeletonGrid({ label }: { label: string }) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className={tradingCardGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`${cardSurface} motion-safe:animate-pulse`}>
            <div className="aspect-5/7 border-b border-border-default bg-surface-subtle" />
            <div className="space-y-3 p-3.5">
              <div className="h-4 w-3/4 rounded bg-surface-subtle" />
              <div className="h-3 w-1/2 rounded bg-surface-subtle" />
              <div className="h-6 w-2/3 rounded-full bg-surface-subtle" />
            </div>
            <div className="border-t border-border-default p-3">
              <div className="h-10 rounded-control bg-surface-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
