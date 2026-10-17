import { Icon } from '@/components/ui/Icon'
import { Link } from '@tanstack/react-router'

type CollectionStateProps = {
    status: 'loading' | 'empty' | 'error'
    onRetry?: () => void
}

export function CollectionState({
    status,
    onRetry,
}: CollectionStateProps) {
    if (status === 'loading') {
        return (
            <div role="status" aria-live="polite">
                <span className="sr-only">Carregando sua coleção...</span>

                <div
                    aria-hidden="true"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
                >
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            className="motion-safe:animate-pulse rounded-xl border border-neutral-200 p-3"
                        >
                            <div className="h-36 rounded-lg bg-primary-100" />
                            <div className="mt-4 h-4 w-3/4 rounded bg-neutral-200" />
                            <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
                            <div className="mt-3 h-3 w-1/2 rounded bg-neutral-100" />
                            <div className="mt-5 h-10 rounded bg-neutral-100" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const isError = status === 'error'

    return (
        <div
            role={isError ? 'alert' : 'status'}
            className="flex min-h-80 flex-col items-center justify-center px-4 py-10 text-center"
        >
            <span className="mb-5 rounded-full bg-primary-100 p-5 text-primary-900">
                <Icon name={isError ? 'alert' : 'grid'} size={32} />
            </span>

            <h3 className="font-display text-xl font-bold text-primary-900">
                {isError
                    ? 'Não foi possível carregar sua coleção'
                    : 'Sua coleção está vazia'}
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-700">
                {isError
                    ? 'Tente novamente para consultar suas cartas.'
                    : 'Suas cartas aparecerão aqui quando você adicionar o primeiro item à coleção.'}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
                {isError ? (
                    <>
                        {onRetry && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                            >
                                Tentar novamente
                            </button>
                        )}

                        <Link
                            to="/"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-900 px-5 py-3 text-sm font-semibold text-primary-900 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                        >
                            <Icon name="home" size={16} />
                            Voltar para o início
                        </Link>
                    </>
                ) : (
                    <Link
                        to="/catalogo/$game"
                        params={{ game: 'pokemon' }}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-900 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                    >
                        <Icon name="search" size={16} />
                        Explorar catálogo
                    </Link>
                )}
            </div>
        </div>
    )
}