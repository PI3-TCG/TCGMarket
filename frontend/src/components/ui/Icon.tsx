import { cn } from './cn'

export type IconName =
  | 'home'
  | 'layers'
  | 'cards'
  | 'tag'
  | 'megaphone'
  | 'handshake'
  | 'storefront'
  | 'arrows-right-left'
  | 'receipt'
  | 'shield-check'
  | 'message-square'
  | 'lock'
  | 'clock'
  | 'camera'
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
  | 'map-pin'
  | 'edit'
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
    case 'layers':
      return (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </>
      )
    case 'cards':
      return (
        <>
          <rect x="7" y="3" width="13" height="17" rx="2" />
          <path d="M4 6 2 7l4 14 3-1M11 7h5M11 11h5" />
        </>
      )
    case 'tag':
      return (
        <>
          <path d="M3 3h8l10 10-8 8L3 11V3Z" />
          <circle cx="7.5" cy="7.5" r="1" />
        </>
      )
    case 'megaphone':
      return (
        <>
          <path d="m4 9 16-5v16L4 15V9ZM4 9H2v6h2M7 16l2 5h4l-2-4M20 9l2-1M20 15l2 1" />
        </>
      )
    case 'handshake':
      return (
        <>
          <path d="m2 9 4-5 5 2 2-1 4 1 5 4-4 7-3 3-3-1-3 1-5-5-2-6Z" />
          <path d="m11 6-4 5 2 2 4-3 5 5M8 15l4 4M11 13l5 5" />
        </>
      )
    case 'storefront':
      return (
        <>
          <path d="M4 10v11h16V10M3 3h18l1 7a3 3 0 0 1-5 2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-2l1-7Z" />
          <path d="M9 21v-6h6v6" />
        </>
      )
    case 'arrows-right-left':
      return (
        <>
          <path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4" />
        </>
      )
    case 'receipt':
      return (
        <>
          <path d="m5 3 2 1 2-1 3 1 3-1 2 1 2-1v18l-2-1-2 1-3-1-3 1-2-1-2 1V3Z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </>
      )
    case 'shield-check':
      return (
        <>
          <path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      )
    case 'message-square':
      return (
        <>
          <path d="M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10Z" />
          <path d="M7 7h10M7 11h7" />
        </>
      )
    case 'lock':
      return (
        <>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" />
        </>
      )
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )
    case 'camera':
      return (
        <>
          <path d="M3 6h4l2-3h6l2 3h4v15H3V6Z" />
          <circle cx="12" cy="13" r="4" />
        </>
      )
    case 'home':
      return (
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      )
    case 'map-pin':
      return (
        <>
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
          <circle cx="12" cy="10" r="2.4" />
        </>
      )
    case 'edit':
      return (
        <>
          <path d="M4 20h4L18.6 9.4a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16z" />
          <path d="m13.5 6.5 4 4" />
        </>
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
