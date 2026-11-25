import { cardSurface } from '@/components/ui/Card'
import { focusRing } from '@/components/ui/styles'

export const checkoutContainer =
  'mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]'

export const checkoutColumns =
  'grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'

export const checkoutPanel = `${cardSurface} min-w-0 p-4 sm:p-5`

export const checkoutSummary = `${checkoutPanel} self-start lg:sticky lg:top-24`

export const checkoutLink =
  `${focusRing} rounded-sm font-semibold text-brand-primary underline underline-offset-2 hover:text-brand-primary-hover`
