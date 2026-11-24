/**
 * DS-03: classes de aparência e estados compartilhadas.
 * A fonte única dos valores segue sendo frontend/src/index.css (@theme, DS-02).
 * Não duplicar cores nem criar tokens.ts.
 */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default'

/** 44 px no mobile (toque), 40 px a partir de sm (controle compacto). */
export const controlHeight = 'h-11 sm:h-10'

export const controlText =
  'text-sm text-text-primary placeholder:text-text-secondary'

export const controlLabel = 'mb-2 block text-sm font-medium text-text-primary'
export const controlHint = 'mt-1 text-sm text-text-secondary'
export const controlError = 'mt-1 text-sm font-medium text-state-error'

export const controlSurface =
  'rounded-control border bg-surface-input font-sans text-text-primary transition-colors duration-150'

export const controlDisabled =
  'disabled:cursor-not-allowed disabled:border-border-default disabled:bg-surface-subtle disabled:text-text-secondary'

export const controlInvalid =
  'border-state-error hover:border-state-error focus-visible:border-state-error focus-visible:ring-2 focus-visible:ring-state-error'

export const menuSurface =
  'rounded-control border border-border-default bg-surface-default p-1 shadow-md'
