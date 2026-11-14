import { Icon } from './Icon'

/** Tokens visuais compartilhados: o conteúdo e as regras permanecem nos fluxos. */
export const modalOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/65 p-3 backdrop-blur-[3px] sm:p-5'

export const modalSizes = {
  sm: 'max-w-[440px]',
  md: 'max-w-[720px]',
  lg: 'max-w-[960px]',
} as const

export const modalFrame =
  'rounded-[20px] border border-primary-300/45 bg-white shadow-[0_28px_90px_rgba(48,43,64,0.26)]'

export const modalHeader =
  'relative isolate overflow-hidden border-b border-primary-300/30 bg-[linear-gradient(115deg,#47104F_0%,#660366_58%,#310B43_100%)] text-white'

export const modalHeadingIcon =
  'grid size-10 shrink-0 place-items-center rounded-xl border border-[#FCD203]/35 bg-white/10 text-[#FCD203]'

export const modalCloseButton =
  'text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-300'

export const modalBody =
  'bg-[linear-gradient(155deg,#FAFBFE_0%,#FFFFFF_65%)]'

export const modalFooter =
  'border-t border-neutral-200 bg-white'

export function ModalHeaderOrnaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-16 right-10 size-44 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-16 top-1/2 -translate-y-1/2 text-[#FCD203]/25">
        <Icon name="sparkle" size={32} />
      </div>
      <div className="absolute right-36 top-4 text-[#FCD203]/20">
        <Icon name="sparkle" size={20} />
      </div>
      <div className="absolute right-28 bottom-3 hidden text-[#FCD203]/25 sm:block">
        <Icon name="gem" size={16} />
      </div>
    </div>
  )
}
