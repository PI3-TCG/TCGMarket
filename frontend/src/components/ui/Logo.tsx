import { cn } from './cn'

type LogoProps = {
  tone?: 'brand' | 'inverse'
  size?: 'sm' | 'md'
  tagline?: boolean
  className?: string
}

export function Logo({
  tone = 'brand',
  size = 'md',
  tagline = false,
  className,
}: LogoProps) {
  const inverse = tone === 'inverse'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Mark
        tone={tone}
        className={size === 'sm' ? 'h-7 w-auto' : 'h-9 w-auto'}
      />
      <span className="flex flex-col">
        <span
          className={cn(
            'font-display leading-none font-bold tracking-[0.06em]',
            size === 'sm' ? 'text-sm' : 'text-lg',
            inverse ? 'text-white' : 'text-primary-900',
          )}
        >
          TCG MARKET
        </span>
        {tagline ? (
          <span
            className={cn(
              'mt-1 text-[10px] tracking-wide',
              inverse ? 'text-primary-100' : 'text-neutral-500',
            )}
          >
            Colecione · Troque · Conecte
          </span>
        ) : null}
      </span>
    </span>
  )
}

export function Mark({
  tone = 'brand',
  className,
}: {
  tone?: 'brand' | 'inverse'
  className?: string
}) {
  const brand = 'var(--color-primary-900)'
  const white = 'var(--color-neutral-0)'
  const ink = tone === 'brand' ? brand : white
  const paper = tone === 'brand' ? white : brand

  return (
    <svg viewBox="0 0 72 58" className={className} aria-hidden>
      <rect
        x="24"
        y="8"
        width="24"
        height="39"
        rx="4"
        fill={paper}
        stroke={ink}
        strokeWidth="2.4"
        transform="rotate(-18 36 56)"
      />
      <rect
        x="24"
        y="8"
        width="24"
        height="39"
        rx="4"
        fill={paper}
        stroke={ink}
        strokeWidth="2.4"
        transform="rotate(18 36 56)"
      />
      <rect
        x="24"
        y="8"
        width="24"
        height="39"
        rx="4"
        fill={ink}
        stroke={ink}
        strokeWidth="2.4"
      />
      <path
        d="M0-8 2.2-2.2 8 0 2.2 2.2 0 8-2.2 2.2-8 0-2.2-2.2z"
        fill={paper}
        transform="translate(36 27.5) scale(1.35)"
      />
    </svg>
  )
}
