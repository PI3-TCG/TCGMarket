import type { CardCondition } from '@/types/Collection'
import { cardSurface } from './Card'

/**
 * 320px: 1 coluna; 390px: 2; tablet: 2-3; desktop: até 4.
 * Mesma grade para Catálogo, Marketplace, Coleção e Meus Anúncios.
 */
export const tradingCardGrid =
  'grid grid-cols-1 items-stretch gap-4 min-[390px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'

/** Somente estrutura e superfície; os dados/ações ficam em cada domínio. */
export const tradingCardSurface =
  `${cardSurface} group flex min-w-0 flex-col focus-within:ring-2 focus-within:ring-support-blue focus-within:ring-offset-2 focus-within:ring-offset-surface-canvas hover:border-border-emphasis hover:shadow-md`

export const tradingCardDetailsButton =
  'inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-control bg-brand-primary px-3 py-2.5 text-center font-sans text-sm font-semibold text-text-inverse transition-colors duration-150 hover:bg-brand-primary-hover active:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue motion-reduce:transition-none'

const conditionColors: Record<CardCondition, string> = {
  NEAR_MINT: 'border-success-200 bg-success-50 text-state-success-text',
  LIGHTLY_PLAYED: 'border-info-200 bg-info-50 text-info-700',
  MODERATELY_PLAYED: 'border-warning-200 bg-warning-50 text-state-warning-text',
  HEAVILY_PLAYED: 'border-orange-200 bg-orange-100 text-orange-900',
  DAMAGED: 'border-error-200 bg-error-50 text-error-700',
}

const badgeBase =
  'inline-flex w-fit max-w-full items-center rounded-full border px-2 py-1 text-xs leading-4 font-semibold wrap-anywhere'

export function cardConditionBadge(condition: CardCondition) {
  return `${badgeBase} ${conditionColors[condition] ?? 'border-border-default bg-surface-subtle text-text-primary'}`
}

export const tradingCardRarity =
  `${badgeBase} border-border-default bg-accent-gold-soft text-accent-gold-deep`

export const tradingCardLanguage =
  `${badgeBase} border-border-default bg-surface-input text-text-secondary`
