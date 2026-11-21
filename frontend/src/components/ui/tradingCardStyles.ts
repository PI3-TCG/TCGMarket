import type { CardCondition } from '@/types/Collection'

export const tradingCardGrid =
  'grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,max(14rem,calc((100%_-_3rem)/4))),1fr))]'

export const tradingCardSurface =
  'group flex min-w-0 flex-col overflow-hidden rounded-xl border border-primary-300/70 bg-secondary-100/20 shadow-sm transition-[border-color,box-shadow] hover:border-[#FCD203] hover:shadow-md focus-within:ring-2 focus-within:ring-secondary-500'

export const tradingCardDetailsButton =
  'flex min-h-11 w-full cursor-pointer items-center justify-center rounded-control bg-primary-900 px-3 py-2.5 text-center text-sm font-semibold text-white button-vignette transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900'

const conditionColors: Record<CardCondition, string> = {
  NEAR_MINT: 'bg-success-50 text-success-700',
  LIGHTLY_PLAYED: 'bg-info-50 text-info-700',
  MODERATELY_PLAYED: 'bg-yellow-100 text-yellow-900',
  HEAVILY_PLAYED: 'bg-orange-100 text-orange-900',
  DAMAGED: 'bg-error-50 text-error-700',
}

export function cardConditionBadge(condition: CardCondition) {
  return `w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${conditionColors[condition] ?? 'bg-neutral-100 text-neutral-700'}`
}

const tradingCardBadge =
  'w-fit rounded-full px-2 py-1 text-xs font-semibold wrap-anywhere'

export const tradingCardRarity = `${tradingCardBadge} text-[#A87800]`
export const tradingCardLanguage = `${tradingCardBadge} bg-white text-neutral-700`
