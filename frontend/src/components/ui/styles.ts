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

/**
 * Ação clara sobre superfícies plum (Home e detalhes de anúncios).
 * Mantida como API pública compartilhada para os consumidores existentes.
 */
export const lightAction =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-accent-gold-frame bg-surface-sand px-5 py-3 text-sm font-semibold text-brand-deep shadow-sm transition-colors duration-150 hover:bg-surface-default active:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50'
