import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import logo from '@/assets/images/tcgmarket-logo-auth.png'
import { cn } from '@/components/ui/cn'
import { focusRing } from '@/components/ui/styles'

export function AuthLayout({
  image,
  bannerContent,
  title,
  description,
  children,
  wide = false,
}: {
  image: string
  bannerContent?: ReactNode
  title: string
  description: string
  children: ReactNode
  wide?: boolean
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
        className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-12"
      >
        <div className={cn('w-full', wide ? 'max-w-xl' : 'max-w-md')}>
          <div className="flex flex-col items-center text-center">
            <Link
              to="/"
              className={cn('w-[90%] max-w-[25rem] rounded-control', focusRing)}
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
              className="font-display mt-5 text-2xl font-bold sm:text-3xl"
            >
              {title}
            </h1>
            <p className="mt-2 text-sm text-neutral-700">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
