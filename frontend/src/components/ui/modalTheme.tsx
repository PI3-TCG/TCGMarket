import cornerTopLeft from '@/assets/design-system/canto-se.svg'
import cornerTopRight from '@/assets/design-system/canto-sd.svg'
import cornerBottomLeft from '@/assets/design-system/canto-ie.svg'
import cornerBottomRight from '@/assets/design-system/canto-id.svg'

/**
 * DS-05 — apresentação dos diálogos, sem regras de negócio.
 * As cores, fontes e dimensões vêm do @theme de src/index.css (DS-02).
 * A moldura ornamentada é usada somente por diálogos de apresentação refinada.
 */
export const modalFrame =
  'relative isolate border border-accent-gold-frame bg-surface-default shadow-[0_24px_72px_rgba(20,7,29,0.48),0_5px_18px_rgba(49,11,67,0.22)] before:pointer-events-none before:absolute before:inset-1 before:z-20 before:rounded-[12px] before:border before:border-accent-bronze/80 before:content-[""]'

export const modalHeader =
  'relative isolate bg-surface-default text-text-primary [&_h2]:text-text-ink [&_p]:text-text-secondary [&_h2]:font-title'

export const modalHeadingIcon =
  'flex size-10 shrink-0 items-center justify-center rounded-control border border-accent-bronze/70 bg-surface-sand/50 text-brand-deep'

export const modalCloseButton =
  'text-text-secondary hover:bg-surface-subtle hover:text-text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'

/** Fundo claro e neutro. O hover da imagem pertence ao componente de detalhes. */
export const modalBody = 'bg-surface-default text-text-primary'

export const modalFooter =
  'border-t border-border-default bg-surface-default'

export const modalPrimaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-accent-gold-frame bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-primary-hover active:bg-brand-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-55'

export const modalDangerButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-state-error bg-state-error px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-error-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-55'

export const modalSecondaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-accent-bronze bg-surface-sand px-5 py-2.5 text-sm font-semibold text-brand-deep shadow-sm transition-colors duration-150 hover:bg-surface-default active:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-55'

/** Cantos de 36px derivados dos SVGs oficiais da DS-00. */
export function ModalFrameOrnaments() {
  const cornerStyle =
    'pointer-events-none absolute z-20 size-9 select-none sm:size-10'

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
      <img src={cornerTopLeft} alt="" className={`${cornerStyle} top-0 left-0`} />
      <img src={cornerTopRight} alt="" className={`${cornerStyle} top-0 right-0`} />
      <img src={cornerBottomLeft} alt="" className={`${cornerStyle} bottom-0 left-0`} />
      <img src={cornerBottomRight} alt="" className={`${cornerStyle} bottom-0 right-0`} />
    </div>
  )
}

/** Ornamento sutil no canto do cabeçalho; sem faixa plum ou brilhos fortes. */
export function ModalHeaderOrnaments() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-bronze/45 to-transparent"
    />
  )
}

/** Filete tênue; mantém os quatro cantos SVG sem adicionar um losango central. */
export function ModalGoldDivider() {
  return (
    <>
      <ModalFrameOrnaments />
      <div
        aria-hidden="true"
        className="relative z-10 h-px shrink-0 bg-gradient-to-r from-transparent via-accent-bronze/50 to-transparent"
      />
    </>
  )
}
