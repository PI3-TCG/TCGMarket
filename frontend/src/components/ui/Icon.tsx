import { cn } from './cn'

export type IconName =
  | 'home'
  | 'search'
  | 'user'
  | 'heart'
  | 'star'
  | 'cart'
  | 'bell'
  | 'settings'
  | 'close'
  | 'chevron-down'
  | 'check'
  | 'minus'
  | 'trash'
  | 'share'
  | 'menu'
  | 'sparkle'
  | 'plus'
  | 'grid'
  | 'gem'
  | 'check-circle'
  | 'alert'
  | 'close-circle'
  | 'info'
  | 'crest-magic'
  | 'crest-pokemon'
  | 'crest-yugioh'
  | 'crest-onepiece'
  | 'crest-digimon'

type IconProps = {
  name: IconName
  size?: 16 | 20 | 24 | 32
  filled?: boolean
  className?: string
}

export function Icon({
  name,
  size = 20,
  filled = false,
  className,
}: IconProps) {
  const fill = filled ? 'currentColor' : 'none'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      {paths(name, filled)}
    </svg>
  )
}

function paths(name: IconName, filled: boolean) {
  switch (name) {
    case 'home':
      return (
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      )
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </>
      )
    case 'user':
      return (
        <>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5 19.2c1.4-2.6 3.8-4 7-4s5.6 1.4 7 4" />
        </>
      )
    case 'heart':
      return (
        <path
          d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"
          stroke={filled ? 'none' : 'currentColor'}
        />
      )
    case 'star':
      return (
        <path
          d="m12 3.6 2.3 4.7 5.2.8-3.8 3.6.9 5.2L12 15.6 7.4 18l.9-5.2L4.5 9.1l5.2-.8z"
          stroke={filled ? 'none' : 'currentColor'}
        />
      )
    case 'cart':
      return (
        <>
          <path d="M4 6h2l1.4 8.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L19.5 8H7" />
          <circle cx="10" cy="19" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="17" cy="19" r="1.2" fill="currentColor" stroke="none" />
        </>
      )
    case 'bell':
      return (
        <>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.2 2H4.8z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </>
      )
    case 'settings':
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
        </>
      )
    case 'close':
      return <path d="M6 6l12 12M18 6 6 18" />
    case 'chevron-down':
      return <path d="m6 9 6 6 6-6" />
    case 'check':
      return <path d="m5 12 5 5 9-10" />
    case 'minus':
      return <path d="M6 12h12" />
    case 'trash':
      return (
        <>
          <path d="M5 7h14" />
          <path d="M9 7V5h6v2" />
          <path d="M8 7l.7 12h6.6L16 7" />
        </>
      )
    case 'share':
      return (
        <>
          <circle cx="6.5" cy="12" r="2" />
          <circle cx="17" cy="6.5" r="2" />
          <circle cx="17" cy="17.5" r="2" />
          <path d="m8.3 11 6.7-3.6M8.3 13l6.7 3.6" />
        </>
      )
    case 'menu':
      return <path d="M4 7h16M4 12h16M4 17h16" />
    case 'sparkle':
      return (
        <path
          d="M12 2.8 13.6 8.4 19.2 10 13.6 11.6 12 17.2 10.4 11.6 4.8 10 10.4 8.4z"
          stroke={filled ? 'none' : 'currentColor'}
        />
      )
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
    case 'grid':
      return <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
    case 'gem':
      return <path d="M7 4h10l4 6-9 10L3 10z" />
    case 'check-circle':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.4 2.4 4.6-5" />
        </>
      )
    case 'alert':
      return (
        <>
          <path d="M12 4 3.5 19h17z" />
          <path d="M12 10v4" />
          <path d="M12 16.5h.01" />
        </>
      )
    case 'close-circle':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </>
      )
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </>
      )
    case 'crest-magic':
      return <path d="M12 3.5 19 8v8l-7 4.5L5 16V8z" />
    case 'crest-pokemon':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <circle cx="12" cy="12" r="2.2" />
        </>
      )
    case 'crest-yugioh':
      return (
        <>
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
          <circle cx="12" cy="12" r="2.2" />
        </>
      )
    case 'crest-onepiece':
      return (
        <>
          <circle cx="12" cy="13" r="6.5" />
          <path d="M8 8.5c.6-2.4 2-3.6 4-3.8 2 .2 3.4 1.4 4 3.8" />
          <path d="M9.2 13.2h.1M14.7 13.2h.1M10 16c.7.6 1.4.9 2 .9s1.3-.3 2-.9" />
        </>
      )
    case 'crest-digimon':
      return <path d="M12 3.5 20 19H4z" />
    default:
      return null
  }
}
