import { Icon } from './Icon'

// Camada visual dedicada aos modais. Mantém a identidade roxo/dourado
// e concentra gradientes, bordas e sombras em um só lugar.
export const modalFrame =
  'border border-[#B65AC5] bg-[#F9F7FD] shadow-[0_28px_80px_rgba(17,5,31,0.48),0_5px_20px_rgba(50,8,70,0.22)]'

export const modalHeader =
  'relative isolate bg-[radial-gradient(ellipse_at_28%_-45%,rgba(255,83,219,0.34),transparent_66%),linear-gradient(115deg,#691074_0%,#57065F_50%,#35033F_100%)] text-white'

export const modalHeadingIcon =
  'flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#F6C846]/70 bg-white/10 text-[#FFDD66]'

export const modalCloseButton =
  'text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE06C]'

export const modalBody =
  'bg-[radial-gradient(ellipse_at_top_left,rgba(238,229,254,0.85),transparent_70%),linear-gradient(135deg,#FDFBFF_0%,#F5F3FD_100%)]'

export const modalFooter =
  'border-t border-[#DED5EB] bg-[linear-gradient(180deg,#FDFBFF_0%,#F5F1FB_100%)]'

export const modalPrimaryButton =
  'rounded-xl border border-[#3187FF] bg-[linear-gradient(180deg,#238AFF_0%,#0951D9_100%)] px-5 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_5px_12px_rgba(15,76,195,0.18)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1254BD] disabled:cursor-not-allowed disabled:opacity-55'

export const modalDangerButton =
  'rounded-xl border border-[#EA4554] bg-[linear-gradient(180deg,#EF263B_0%,#BD091D_100%)] px-5 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.30),0_5px_12px_rgba(166,14,38,0.19)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A60818] disabled:cursor-not-allowed disabled:opacity-55'

export const modalSecondaryButton =
  'rounded-xl border border-[#C7C3E4] bg-[linear-gradient(180deg,#FFFFFF_0%,#EAE8F6_100%)] px-5 py-3 text-sm font-semibold text-[#21183D] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:bg-[#EBE8F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1254BD] disabled:cursor-not-allowed disabled:opacity-55'

export function ModalHeaderOrnaments() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-16 right-28 size-44 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute -right-7 -top-20 size-48 rounded-full bg-[#16001D]/25" />
      <div className="absolute right-14 top-2 text-[#FCD203]/20">
        <Icon name="sparkle" size={24} />
      </div>
      <div className="absolute right-28 bottom-3 text-[#FCD203]/20">
        <Icon name="gem" size={16} />
      </div>
    </div>
  )
}

export function ModalGoldDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 h-[2px] shrink-0 bg-[linear-gradient(90deg,#C78600_0%,#FCD84C_30%,#FFF0A8_50%,#FCD84C_70%,#C78600_100%)] shadow-[0_0_8px_rgba(252,210,3,0.25)]"
    >
      <div className="absolute left-1/2 top-1/2 flex size-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center rounded-[2px] border-2 border-[#F6C846] bg-[linear-gradient(135deg,#FFF9E0_0%,#FFE36D_100%)] shadow-[0_0_0_2px_#691074,0_0_10px_rgba(252,210,3,0.35)]">
        <span className="size-[6px] border border-[#E6A900] bg-white/80" />
      </div>
    </div>
  )
}
