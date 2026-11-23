import { cn } from '@/components/ui/cn'
import { focusRing } from '@/components/ui/styles'

export const authLinkClass = cn(
  'rounded-sm font-semibold text-primary-900 underline-offset-4 hover:underline',
  focusRing,
)

export const authInputClass =
  'filter-field min-w-0 w-full rounded-control border border-neutral-300 bg-white py-3 pl-11 text-sm outline-none transition-colors placeholder:text-neutral-500 hover:border-primary-900 focus:border-primary-900 focus:ring-2 focus:ring-secondary-500 aria-invalid:border-error-700 aria-invalid:focus:ring-error-700 disabled:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-500'
