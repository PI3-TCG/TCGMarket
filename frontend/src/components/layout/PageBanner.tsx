import collectionBanner from '@/assets/images/image-collection.png'

type Props = {
  title: string
  subtitle: string
  symbol?: string
}

export function PageBanner({ title, subtitle, symbol = '✦' }: Props) {
  return (
    <header className="relative mb-4 flex min-h-[160px] items-center overflow-hidden rounded-xl border border-[#eeeafb] bg-primary-900 px-6 py-5 shadow-sm sm:min-h-[190px] sm:px-8">
      <img
        src={collectionBanner}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#130b30]/85 via-[#130b30]/50 to-transparent"
      />

      <div className="relative z-10 flex items-center gap-4">
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
