import { adStatusMeta } from '@/components/ads/adFormat'
import { Icon } from '@/components/ui/Icon'
import type { AdStatus } from '@/types/Ad'

export function AdStatusBadge({ status }: { status: AdStatus }) {
  const meta = adStatusMeta[status]

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      <Icon name={meta.icon} size={16} />
      {meta.label}
    </span>
  )
}
