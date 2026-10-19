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
                    className="flex min-h-20 items-center gap-3 rounded-xl border border-primary-100 bg-white px-4 py-4 shadow-sm"
                >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-900">
                        <Icon name={indicator.icon} size={24} />
                    </span>

                    <div className="min-w-0">
                        <div className="flex h-6 items-center">
                            {status === 'loading' ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="h-6 w-12 rounded bg-primary-100 motion-safe:animate-pulse"
                                    />
                                    <span className="sr-only">Carregando</span>
                                </>
                            ) : status === 'error' ? (
                                <span className="text-xs font-medium text-neutral-500">
                                    Indisponível
                                </span>
                            ) : (
                                <span className="font-display text-2xl leading-none font-bold text-primary-900">
                                    {indicator.value ?? '-'}
                                </span>
                            )}
                        </div>

                        <p className="mt-1.5 text-xs text-neutral-700">
                            {indicator.label}
                        </p>
                    </div>
                </div>
            ))}

            <div className="flex min-h-20 items-center rounded-xl border border-primary-100 bg-white p-3 shadow-sm">
                <Link
                    to="/anuncios/novo"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                >
                    <Icon name="plus" size={20} />
                    Criar anúncio
                </Link>
            </div>
        </section>
    )
}