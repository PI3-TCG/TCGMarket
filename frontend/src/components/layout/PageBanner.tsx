import collectionBanner from '@/assets/images/image-collection.png'

type Props = {
  title: string
  subtitle: string
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
    <header className="relative mb-4 grid overflow-hidden rounded-xl border-2 border-[#FCD203]/70 bg-[#130b30] shadow-sm">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: imagePosition }}
        className="pointer-events-none col-start-1 row-start-1 block h-auto w-full min-w-0"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#130b30]/85 via-[#280f41]/50 to-transparent"
      />

      <div className="relative z-10 col-start-1 row-start-2 flex items-center gap-4 px-6 py-5 sm:row-start-1 sm:px-8">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 text-3xl text-white shadow-sm backdrop-blur-sm"
        >
          {symbol}
        </span>

        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl">
            {title}
          </h1>

          <p className="mt-1 text-xs text-white/90 sm:text-sm">{subtitle}</p>
        </div>
      </div>
    </header>
  )
}
