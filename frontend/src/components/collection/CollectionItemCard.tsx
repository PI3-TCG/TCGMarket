import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import type {
    CardCondition,
    CardLanguage,
    CollectionItem,
} from '@/types/Collection'

const conditionLabels: Record<CardCondition, string> = {
    NEAR_MINT: 'Near Mint',
    LIGHTLY_PLAYED: 'Lightly Played',
    MODERATELY_PLAYED: 'Moderately Played',
    HEAVILY_PLAYED: 'Heavily Played',
    DAMAGED: 'Damaged',
}

const languageLabels: Record<CardLanguage, string> = {
    PORTUGUESE: 'Português',
    ENGLISH: 'Inglês',
    JAPANESE: 'Japonês',
}

type CollectionItemCardProps = {
    item: CollectionItem
    onDetails?: (item: CollectionItem) => void
    onEdit?: (item: CollectionItem) => void
    onRemove?: (item: CollectionItem) => void
    onAdvertise?: (item: CollectionItem) => void
}

export function CollectionItemCard({
    item,
    onDetails,
    onEdit,
    onRemove,
    onAdvertise,
}: CollectionItemCardProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)

    const hasImage =
        Boolean(item.card.imageUrl) && failedImageUrl !== item.card.imageUrl

    const actions = [
        { label: 'Detalhes', icon: 'search', handler: onDetails },
        { label: 'Editar', icon: 'settings', handler: onEdit },
        { label: 'Remover', icon: 'trash', handler: onRemove },
        { label: 'Anunciar', icon: 'cart', handler: onAdvertise },
    ] as const

    return (
        <Card className="flex h-full min-w-0 flex-col">
            <div className="relative m-2 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-primary-100">
                {hasImage ? (
                    <img
                        src={item.card.imageUrl}
                        alt={item.card.name}
                        loading="lazy"
                        onError={() => setFailedImageUrl(item.card.imageUrl)}
                        className="h-full w-full object-contain p-2"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-primary-700">
                        <Icon name="grid" size={32} />
                        <span className="text-xs">Imagem indisponível</span>
                    </div>
                )}

                <span
                    aria-label={`${item.quantity} exemplares`}
                    className="absolute right-2 bottom-2 rounded-md bg-primary-900 px-2 py-1 text-xs font-bold text-white"
                >
                    ×{item.quantity}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
                <h3 className="font-display text-sm font-bold text-neutral-900">
                    {item.card.name}
                </h3>

                <p className="text-xs text-neutral-500">
                    {item.card.edition}
                    {item.card.cardNumber ? ` · Nº ${item.card.cardNumber}` : ''}
                </p>

                <span className="w-fit rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-900">
                    {item.card.officialRarity}
                </span>

                <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-neutral-100 pt-2">
                    <div>
                        <dt className="text-xs text-neutral-500">Condição</dt>
                        <dd className="text-xs font-semibold text-primary-900">
                            {conditionLabels[item.condition]}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs text-neutral-500">Idioma</dt>
                        <dd className="text-xs font-semibold text-primary-900">
                            {languageLabels[item.language]}
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="grid grid-cols-4 border-t border-neutral-200">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        disabled={!action.handler}
                        onClick={() => action.handler?.(item)}
                        aria-label={`${action.label}: ${item.card.name}`}
                        title={
                            action.handler
                                ? action.label
                                : `${action.label} — ainda não disponível nesta prévia`
                        }
                        className="flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-2 text-primary-900 transition-colors enabled:cursor-pointer enabled:hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Icon name={action.icon} size={16} />
                        <span className="text-[10px] font-medium">{action.label}</span>
                    </button>
                ))}
            </div>
        </Card>
    )
}