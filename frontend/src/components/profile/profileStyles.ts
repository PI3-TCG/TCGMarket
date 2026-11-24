import { cardSurface } from '@/components/ui/Card'
import { focusRing } from '@/components/ui/styles'

export const profilePanel =
  'min-w-0'

export const profileCollectionPanel =
  `${profilePanel} p-4 sm:p-5`

export const profileCollectionSection = `${cardSurface} ${profileCollectionPanel}`

export const profileTextLink =
  `${focusRing} rounded-sm font-semibold text-brand-primary underline-offset-4 hover:underline`

export const profileOutlineLink =
  `${focusRing} inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-control border border-brand-primary bg-white px-4 py-2 text-center text-sm font-semibold text-brand-primary transition-colors hover:bg-surface-brand-tint active:bg-surface-brand-tint`
