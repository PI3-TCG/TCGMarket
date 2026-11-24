import { useState, type ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Imagem vertical 5/7, sem corte ou distorção, com fallback acessível.
 * Os children continuam posicionados sobre a imagem (quantidade/status).
 */
export function TradingCardImage({
  url,
  name,
  children,
}: {
  url?: string | null
  name: string
  children?: ReactNode
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const hasImage = Boolean(url && url !== failedUrl)

  return (
    <div className="relative grid aspect-[5/7] w-full place-items-center overflow-hidden border-b border-border-default bg-surface-input p-3">
      {hasImage ? (
        <img
          src={url ?? undefined}
          alt={name}
          loading="lazy"
          onError={() => setFailedUrl(url ?? null)}
          className="block h-full max-h-full w-full object-contain motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 px-2 text-center text-text-secondary">
          <Icon name="gem" size={32} />
          <span className="text-xs font-medium">Imagem indisponível</span>
        </div>
      )}
      {children}
    </div>
  )
}
