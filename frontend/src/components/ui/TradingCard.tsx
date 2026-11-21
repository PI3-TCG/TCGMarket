import { useState, type ReactNode } from 'react'
import { Icon } from './Icon'

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
    <div className="relative grid aspect-square place-items-center overflow-hidden bg-primary-100 p-2">
      {hasImage ? (
        <img
          src={url ?? undefined}
          alt={name}
          loading="lazy"
          onError={() => setFailedUrl(url ?? null)}
          className="absolute inset-2 h-[calc(100%_-_1rem)] w-[calc(100%_-_1rem)] object-contain motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-center text-primary-900">
          <Icon name="gem" size={32} />
          <span className="text-xs">Imagem indisponível</span>
        </div>
      )}
      {children}
    </div>
  )
}
