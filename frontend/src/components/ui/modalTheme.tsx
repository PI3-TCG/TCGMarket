import { Icon } from './Icon'

export const modalFrame =
  'border-2 border-[#FCD203]/80 shadow-[0_26px_80px_rgba(41,13,54,0.28)]'

export const modalHeader =
  'relative isolate overflow-hidden border-b border-[#FCD203]/70 bg-[linear-gradient(115deg,#4C195F_0%,#74317F_58%,#8C5897_100%)] text-white'

export const modalHeadingIcon =
  'flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-[#FCD203]/55 bg-white/10 text-[#FCD203]'

export const modalCloseButton =
  'text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'

export const modalBody = 'bg-[linear-gradient(158deg,#faf8fc,#fff_68%)]'

export const modalFooter = 'border-t border-[#FCD203]/55 bg-[#fcfafe]'

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
      <div className="absolute right-28 bottom-3 hidden text-[#FCD203]/30 sm:block">
        <Icon name="gem" size={16} />
      </div>
    </div>
  )
}
