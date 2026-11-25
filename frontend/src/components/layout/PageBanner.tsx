import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import cornerTL from '@/assets/design-system/canto-se.svg'
import cornerTR from '@/assets/design-system/canto-sd.svg'
import cornerBL from '@/assets/design-system/canto-ie.svg'
import cornerBR from '@/assets/design-system/canto-id.svg'
import collectionBanner from '@/assets/images/image-collection.png'
import { cn } from '@/components/ui/cn'

type PageBannerProps = {
  title: string
  subtitle: ReactNode
  symbol?: string
  /** Arte existente da página; se omitida, mantém o banner padrão. */
  image?: string
  /** Define o enquadramento sem esticar nem deformar a imagem. */
  imagePosition?: string
}

type BannerFrameProps = {
  image: string
  imagePosition?: string
  variant?: 'hero' | 'page'
  /** O hero pode encostar no header e alcançar as bordas da viewport. */
  fullBleed?: boolean
  children: ReactNode
  className?: string
}

/**
 * Superfície visual compartilhada entre o hero da Home e os banners internos.
 * Não controla rotas nem interações: a composição permanece com o consumidor.
 * O frame fica no fluxo normal da página, sempre abaixo do SiteHeader.
 */
export function BannerFrame({
  image,
  imagePosition = 'center',
  variant = 'page',
  fullBleed = false,
  children,
  className,
}: BannerFrameProps) {
  return (
    <div
      className={cn(
        'relative isolate w-full overflow-hidden bg-brand-deep text-white shadow-lg',
        'before:pointer-events-none before:absolute before:inset-[4px] before:z-20 before:border before:border-accent-bronze/70',
        fullBleed
          ? 'max-w-none rounded-none border border-accent-gold-frame before:rounded-none'
          : 'mx-auto max-w-[1600px] rounded-banner border border-accent-gold-frame before:rounded-[12px]',
        className,
      )}
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ objectPosition: imagePosition }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
      {/* No mobile o texto permanece legível, sem esconder toda a ilustração. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          background:
            variant === 'hero'
              ? 'linear-gradient(90deg, rgb(49 11 67 / 0.82) 0%, rgb(49 11 67 / 0.64) 60%, rgb(49 11 67 / 0.40) 100%)'
              : 'linear-gradient(90deg, rgb(49 11 67 / 0.84), rgb(49 11 67 / 0.48))',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          background:
            variant === 'hero'
              ? 'linear-gradient(90deg, color-mix(in srgb, var(--color-brand-deep) 88%, transparent) 0%, color-mix(in srgb, var(--color-brand-deep) 75%, transparent) 28%, color-mix(in srgb, var(--color-brand-deep) 54%, transparent) 43%, color-mix(in srgb, var(--color-brand-deep) 21%, transparent) 63%, color-mix(in srgb, var(--color-brand-deep) 0%, transparent) 85%, transparent 100%)'
              : 'linear-gradient(90deg, color-mix(in srgb, var(--color-brand-deep) 88%, transparent) 0%, color-mix(in srgb, var(--color-brand-deep) 55%, transparent) 50%, color-mix(in srgb, var(--color-brand-deep) 4%, transparent) 100%)',
        }}
      />
      {children}
      <BannerGoldDivider />
      <BannerCornerDecorations />
    </div>
  )
}

/**
 * Filete inferior DS v2.2: retira o antigo recorte/losango amarelo da base
 * dos banners. Preserva moldura e ornamentos dos cantos, sem triângulos.
 */
export function BannerGoldDivider() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2">
      <span className="absolute inset-x-0 bottom-[3px] h-px bg-[linear-gradient(90deg,transparent_0%,var(--color-accent-bronze)_9%,var(--color-accent-gold-frame)_50%,var(--color-accent-bronze)_91%,transparent_100%)]" />
    </div>
  )
}

function BannerCornerDecorations() {
  const corners = [
    { src: cornerTL, position: 'left-0 top-0' },
    { src: cornerTR, position: 'right-0 top-0' },
    { src: cornerBL, position: 'bottom-0 left-0' },
    { src: cornerBR, position: 'bottom-0 right-0' },
  ] as const

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
      {corners.map(({ src, position }) => (
        <img
          key={position}
          src={src}
          alt=""
          draggable={false}
          className={cn('absolute size-8 select-none sm:size-10', position)}
        />
      ))}
    </div>
  )
}

/**
 * Todo banner interno compartilha a mesma moldura do hero, inclusive full bleed.
 * Alturas nominais: 180px mobile, 196px tablet, 212px desktop.
 * Se o texto exigir espaço adicional, a composição pode crescer.
 */
export function PageBanner({
  title,
  subtitle,
  symbol,
  image = collectionBanner,
  imagePosition = 'center',
}: PageBannerProps) {
  return (
    <header className="relative left-1/2 -mt-4 mb-4 w-screen -translate-x-1/2">
      <BannerFrame image={image} imagePosition={imagePosition} variant="page" fullBleed>
        <div
          className={cn(
            'relative z-10 mx-auto flex w-full max-w-[1600px] items-center',
            'h-[180px] min-h-max sm:h-[196px] lg:h-[212px]',
            'px-4 py-5 sm:px-6 sm:py-6 lg:px-8',
          )}
        >
          <div className="min-w-0 max-w-[760px] px-5 sm:px-9 lg:px-12">
            <nav aria-label="Navegação estrutural" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    to="/"
                    className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold-soft"
                  >
                    Início
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="min-w-0 break-words">
                  {symbol && (
                    <span aria-hidden="true" className="mr-1 text-accent-gold-soft">
                      {symbol}
                    </span>
                  )}
                  {title}
                </li>
              </ol>
            </nav>
            <h1 className="font-display text-[clamp(1.5rem,2.45vw,2.35rem)] font-bold uppercase leading-[1.2] tracking-[-0.025em] text-surface-sand [text-wrap:balance]">
              {title}
            </h1>
            <div className="mt-3 max-w-2xl text-sm leading-relaxed text-white/95 sm:text-base [&_br]:hidden">
              {subtitle}
            </div>
          </div>
        </div>
      </BannerFrame>
    </header>
  )
}
