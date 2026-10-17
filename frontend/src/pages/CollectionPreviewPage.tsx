import { CollectionItemCard } from '@/components/collection/CollectionItemCard'
import { Icon } from '@/components/ui/Icon'
import { collectionMock } from '@/mocks/collectionMock'
import { Link } from '@tanstack/react-router'
import collectionBanner from '@/assets/images/image-collection.png'
import { CollectionSummary } from '@/components/collection/CollectionSummary'
import { useState } from 'react'
import {
    CollectionFilters,
    emptyCollectionFilters,
} from '@/components/collection/CollectionFilters'
import { CollectionState } from '@/components/collection/CollectionState'
import { Modal } from '@/components/ui/Modal'
import type { CollectionItem } from '@/types/Collection'


const conditionLabels = {
  NEAR_MINT: 'Near Mint',
  LIGHTLY_PLAYED: 'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED: 'Heavily Played',
  DAMAGED: 'Damaged',
}

const languageLabels = {
  PORTUGUESE: 'Português',
  ENGLISH: 'Inglês',
  JAPANESE: 'Japonês',
}

const gameLabels = {
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic: The Gathering',
}

export function CollectionPreviewPage() {

    const [selectedItem, setSelectedItem] =
        useState<CollectionItem | null>(null)

    const [previewStatus, setPreviewStatus] =
        useState<PreviewStatus>('success')

    type PreviewStatus = 'success' | 'loading' | 'empty' | 'error'

    const totalItems = collectionMock.length

    const totalCopies = collectionMock.reduce(
        (total, item) => total + item.quantity,
        0,
    )

    const totalGames = new Set(
        collectionMock.map((item) => item.card.game),
    ).size

    const [filters, setFilters] = useState(emptyCollectionFilters)

    const search = filters.search.trim().toLocaleLowerCase('pt-BR')

    const filteredItems = collectionMock.filter((item) => {
        const searchableText =
            `${item.card.name} ${item.card.cardNumber}`.toLocaleLowerCase('pt-BR')


        return (
            searchableText.includes(search) &&
            (!filters.game || item.card.game === filters.game) &&
            (!filters.edition || item.card.edition === filters.edition) &&
            (!filters.rarity || item.card.officialRarity === filters.rarity) &&
            (!filters.condition || item.condition === filters.condition) &&
            (!filters.language || item.language === filters.language)
        )
    })

    return (
        <main className="mx-auto w-full max-w-[1600px] bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Navegação estrutural">
                        <ol className="flex items-center gap-2 text-xs text-neutral-700">
                            <li>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-1.5 rounded text-primary-900 hover:underline focus-visible:outline-2 focus-visible:outline-secondary-500"
                                >
                                    <Icon name="home" size={16} />
                                    Início
                                </Link>
                            </li>

                            <li aria-hidden="true">/</li>

                            <li aria-current="page" className="font-semibold">
                                Minha Coleção
                            </li>
                        </ol>
                    </nav>

                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs text-primary-900">
                        Prévia · dados fictícios
                    </span>
                </div>

                <header className="relative isolate overflow-hidden rounded-2xl bg-primary-800 shadow-sm">
                    <img
                        src={collectionBanner}
                        alt=""
                        className="absolute inset-0 -z-20 h-full w-full object-cover object-right"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
                    />

                    <div className="flex min-h-52 items-center px-6 py-8 sm:min-h-64 sm:px-8">
                        <div className="max-w-md">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                <Icon name="sparkle" size={16} />
                                Seu universo de cartas
                            </span>

                            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                                Minha Coleção
                            </h1>

                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90">
                                Organize seu acervo e acompanhe sua jornada como colecionador.
                            </p>
                        </div>
                    </div>
                </header>

                <div
                    role="group"
                    aria-label="Simular estados da coleção"
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-primary-300 p-3"
                >
                    <span className="mr-2 text-xs font-semibold text-primary-900">
                        Simular na prévia:
                    </span>

                    {(
                        [
                            { value: 'success', label: 'Com cartas' },
                            { value: 'loading', label: 'Carregando' },
                            { value: 'empty', label: 'Vazia' },
                            { value: 'error', label: 'Erro' },
                        ] as const
                    ).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={previewStatus === option.value}
                            onClick={() => setPreviewStatus(option.value)}
                            className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 ${previewStatus === option.value
                                ? 'bg-primary-900 text-white'
                                : 'bg-primary-100 text-primary-900 hover:bg-primary-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <CollectionSummary
                    status={
                        previewStatus === 'loading' || previewStatus === 'error'
                            ? previewStatus
                            : 'success'
                    }
                    totalItems={previewStatus === 'empty' ? 0 : totalItems}
                    totalCopies={previewStatus === 'empty' ? 0 : totalCopies}
                    totalGames={previewStatus === 'empty' ? 0 : totalGames}
                />

                <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <CollectionFilters
                        items={collectionMock}
                        onApply={setFilters}
                    />

                    <section
                        aria-labelledby="collection-items-title"
                        className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4"
                    >
                        <h2
                            id="collection-items-title"
                            aria-live="polite"
                            className="mb-4 text-sm font-semibold text-primary-900"
                        >
                            {previewStatus === 'success'
                                ? `${filteredItems.length} ${filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'
                                }`
                                : 'Sua coleção'}
                        </h2>

                        {previewStatus !== 'success' ? (
                            <CollectionState
                                status={previewStatus}
                                onRetry={() => setPreviewStatus('success')}
                            />
                        ) : filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                                {filteredItems.map((item) => (
                                    <CollectionItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
                                <span className="mb-4 rounded-full bg-primary-100 p-4 text-primary-900">
                                    <Icon name="search" size={32} />
                                </span>

                                <h3 className="font-display text-xl font-bold text-primary-900">
                                    Nenhum resultado encontrado
                                </h3>

                                <p className="mt-2 max-w-sm text-sm text-neutral-700">
                                    Experimente outros termos ou use “Limpar filtros” no painel.
                                </p>

                                <Link
                                    to="/catalogo/$game"
                                    params={{ game: 'pokemon' }}
                                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-900 px-5 py-3 text-sm font-semibold text-primary-900 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                                    >
                                    <Icon name="search" size={16} />
                                    Explorar catálogo
                                </Link>

                            </div>
                        )}
                    </section>
                </div>

            </div>
        </main>
    )
}