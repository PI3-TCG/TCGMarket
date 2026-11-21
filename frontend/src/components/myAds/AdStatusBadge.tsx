import { adStatusMeta } from '@/components/ads/adFormat'
import { Icon } from '@/components/ui/Icon'
import type { AdStatus } from '@/types/Ad'

export function AdStatusBadge({
  status,
  highlighted = false,
}: {
  status: AdStatus
  highlighted?: boolean
}) {
  const meta = adStatusMeta[status]

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full text-xs font-semibold ${highlighted ? 'px-3 py-1.5 shadow-md ring-1 ring-black/10' : 'px-2 py-0.5'} ${meta.className}`}
    >
      <Icon name={meta.icon} size={16} />
      {meta.label}
    </span>
  )
}
