import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import logo from '@/assets/images/tcgmarket-logo-auth.png'
import { cn } from '@/components/ui/cn'
import { Icon } from '@/components/ui/Icon'
import { focusRing } from '@/components/ui/styles'

export function AuthLayout({
  image,
  bannerContent,
  title,
  description,
  children,
  wide = false,
  compactLogo = false,
}: {
  image: string
  bannerContent?: ReactNode
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
  compactLogo?: boolean
}) {
  return (
    <main className="min-h-svh bg-white text-neutral-900 md:grid md:grid-cols-2">
      <div className="relative isolate grid min-h-60 w-full items-center sm:min-h-80 md:sticky md:top-0 md:h-svh md:self-start">
        <img
          src={image}
          alt=""
          width={1086}
          height={1448}
          className="absolute inset-0 -z-10 size-full object-cover object-center"
        />
        {bannerContent ? (
          <div className="flex h-full items-center bg-linear-to-r from-neutral-900/70 via-neutral-900/30 to-transparent px-6 py-8 sm:px-8 xl:px-14">
            {bannerContent}
          </div>
        ) : null}
      </div>

      <section
        aria-labelledby="auth-title"
        className={cn(
          'flex min-w-0 items-center justify-center px-4 sm:px-8',
          compactLogo ? 'py-4 sm:py-6' : 'py-8 sm:py-12',
        )}
      >
        <div className={cn('w-full', wide ? 'max-w-xl' : 'max-w-md')}>
          <Link
            to="/"
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-control text-sm font-semibold text-primary-900',
              focusRing,
            )}
          >
            <Icon name="chevron-down" size={16} className="rotate-90" />
            Voltar
          </Link>
          <div className="flex flex-col items-center text-center">
            <Link
              to="/"
              className={cn(
                'rounded-control',
                compactLogo ? 'w-1/2 max-w-48' : 'w-[90%] max-w-[25rem]',
                focusRing,
              )}
            >
              <img
                src={logo}
                alt="TCGMarket — página inicial"
                width={1774}
                height={887}
                className="h-auto w-full"
              />
            </Link>
            <h1
              id="auth-title"
              className={cn(
                'font-display font-bold',
                compactLogo ? 'mt-3 text-2xl' : 'mt-5 text-2xl sm:text-3xl',
              )}
            >
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm text-neutral-700">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
