import { cardSurface } from '@/components/ui/Card'
import { tradingCardDetailsButton } from '@/components/ui/tradingCardStyles'
import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'

type CollectionSummaryProps = {
    totalItems: number | null
    totalCopies: number | null
    totalGames: number | null
    status?: 'success' | 'loading' | 'error'
    onAdd?: () => void
}

export function CollectionSummary({
    totalItems,
    totalCopies,
    totalGames,
    status = 'success',
}: CollectionSummaryProps) {
    const indicators = [
        {
            label: 'Itens na coleção',
            value: totalItems,
            icon: 'grid',
        },
        {
            label: 'Exemplares no total',
            value: totalCopies,
            icon: 'gem',
        },
        {
            label: 'TCGs na coleção',
            value: totalGames,
            icon: 'sparkle',
        },
    ] as const

    return (
        <section
            aria-label="Resumo da coleção"
            aria-busy={status === 'loading'}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
        >
            {indicators.map((indicator) => (
                <div
                    key={indicator.label}
                    className={`${cardSurface} flex min-h-20 items-center gap-3 p-4`}
                >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-sand text-brand-deep">
                        <Icon name={indicator.icon} size={24} />
                    </span>

                    <div className="min-w-0">
                        <div className="flex h-6 items-center">
                            {status === 'loading' ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="h-6 w-12 rounded bg-surface-subtle motion-safe:animate-pulse"
                                    />
                                    <span className="sr-only">Carregando</span>
                                </>
                            ) : status === 'error' ? (
                                <span className="text-xs font-medium text-text-secondary">
                                    Indisponível
                                </span>
                            ) : (
                                <span className="font-title text-2xl leading-none font-bold text-text-ink">
                                    {indicator.value ?? '-'}
                                </span>
                            )}
                        </div>

                        <p className="mt-1.5 text-xs text-text-secondary">
                            {indicator.label}
                        </p>
                    </div>
                </div>
            ))}

            <div className={`${cardSurface} flex min-h-20 items-center justify-center p-3`}>
                <Link
                    to="/anuncios/novo"
                    className={`${tradingCardDetailsButton} gap-2`}
                >
                    <Icon name="plus" size={20} />
                    Criar anúncio
                </Link>
            </div>
        </section>
    )
}
