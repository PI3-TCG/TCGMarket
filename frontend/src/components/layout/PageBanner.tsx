import type { ReactNode } from 'react'
import { ModalGoldDivider } from '@/components/ui/modalTheme'
import collectionBanner from '@/assets/images/image-collection.png'

type Props = {
  title: string
  subtitle: ReactNode
  symbol?: string
  /** Permite que cada página use sua própria arte. Sem a prop, mantém o banner atual. */
  image?: string
  /** Ajuste de enquadramento sem distorcer a imagem (ex.: 'center', '60% center'). */
  imagePosition?: string
}

export function PageBanner({
  title,
  subtitle,
  symbol = '✦',
  image = collectionBanner,
  imagePosition = 'center',
}: Props) {
  return (
    <header className="relative mb-4 flex h-[160px] items-center rounded-xl border-2 border-b-0 border-[#FCD203]/70 bg-[#130b30] shadow-sm sm:h-[200px]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: imagePosition }}
        className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit] object-cover"
      />

      <div className="relative z-10 flex items-center gap-4 px-6 py-5 sm:px-8">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 text-3xl text-white shadow-sm backdrop-blur-sm"
        >
          {symbol}
        </span>

        <div>
          <h1 className="banner-text-outline font-display text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl">
            {title}
          </h1>

          <p className="mt-1 text-xs text-white/90 sm:text-sm">{subtitle}</p>
        </div>
      </div>
      <BannerGoldDivider />
    </header>
  )
}

export function BannerGoldDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 bottom-0 z-10 translate-y-1/2"
    >
      <ModalGoldDivider />
    </div>
  )
}
