import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { CollectionFilters } from '@/components/collection/CollectionFilters'
import { emptyCollectionFilters } from '@/components/collection/collectionFilterDefaults'
import type { CollectionFilterValues } from '@/types/Collection'
import { useCallback, useState } from 'react'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  getPublicCollection,
  getPublicCollectionFilterOptions,
  listPublicCollections,
} from '@/services/profileApi'
import { Card } from '@/components/ui/Card'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import { gameLabel } from './profileFormat'
import type { CardGame } from '@/types/User'
import { ProfileStatus } from './ProfileView'
import { Link } from '@tanstack/react-router'

export function PublicCollectionCards({
  username,
  collectionId,
}: {
  username: string
  collectionId: string
}) {
  const [query, setQuery] = useState<{
    page: number
    filters: CollectionFilterValues
    attempt: number
  }>({ page: 0, filters: { ...emptyCollectionFilters }, attempt: 0 })
  const nameLoad = useCallback(() => listPublicCollections(username), [username])
  const names = useRemoteData(`public-collection-name:${username}`, nameLoad)
  const title =
    names.state.status === 'ready'
      ? (names.state.data.find((collection) => collection.id === collectionId)
          ?.name ?? 'Coleção')
      : 'Coleção'
  const optionsLoad = useCallback(
    () => getPublicCollectionFilterOptions(username, collectionId),
    [username, collectionId],
  )
  const options = useRemoteData(
    `public-options:${username}:${collectionId}`,
    optionsLoad,
  )
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-primary-900">
          {title}
        </h1>
        <Link
          to="/jogadores/$username"
          params={{ username }}
          hash="colecao"
          className="text-sm font-semibold text-brand-primary underline"
        >
          Voltar ao perfil
        </Link>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <CollectionFilters
          appearance="card"
          options={
            options.state.status === 'ready' ? options.state.data : undefined
          }
          optionsStatus={
            options.state.status === 'ready'
              ? 'success'
              : options.state.status === 'loading'
                ? 'loading'
                : 'error'
          }
          onRetryOptions={options.retry}
          onApply={(filters) =>
            setQuery((current) => ({
              page: 0,
              filters,
              attempt: current.attempt + 1,
            }))
          }
        />
        <PublicCardsResults
          username={username}
          collectionId={collectionId}
          page={query.page}
          filters={query.filters}
          attempt={query.attempt}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
        />
      </div>
    </section>
  )
}

function PublicCardsResults({
  username,
  collectionId,
  page,
  filters,
  attempt,
  onPageChange,
}: {
  username: string
  collectionId: string
  page: number
  filters: CollectionFilterValues
  attempt: number
  onPageChange: (page: number) => void
}) {
  const load = useCallback(
    () => getPublicCollection(username, collectionId, page, filters),
    [username, collectionId, page, filters],
  )
  const { state, retry } = useRemoteData(
    `public-collection:${username}:${collectionId}:${page}:${JSON.stringify(filters)}:${attempt}`,
    load,
  )
  if (state.status === 'loading')
    return (
      <p role="status" className="py-8">
        Carregando cartas...
      </p>
    )
  if (state.status === 'notFound')
    return (
      <Card className="p-8 text-center">
        Esta coleção está privada ou indisponível.
      </Card>
    )
  if (state.status !== 'ready')
    return <ProfileStatus kind="error" onRetry={retry} />
  const data = state.data
  return (
    <div className="min-w-0 space-y-5">
      {data.content.length === 0 ? (
        <Card className="p-8 text-center">
          <p role="status">Nenhuma carta encontrada para esta consulta.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-5 md:grid-cols-3 xl:grid-cols-4">
          {data.content.map((item, index) => (
            <div key={`${item.card.id}:${index}`} className="min-w-0">
              <CatalogCard
                card={item.card}
                footer={
                  <p>
                    {gameLabel(item.card.game as CardGame)} · {item.quantity}{' '}
                    {item.quantity === 1 ? 'cópia' : 'cópias'}
                  </p>
                }
              />
            </div>
          ))}
        </div>
      )}
      <p role="status" className="text-sm text-neutral-700">
        {data.totalElements}{' '}
        {data.totalElements === 1
          ? 'registro encontrado'
          : 'registros encontrados'}
      </p>
      {(!data.first || !data.last) && (
        <PageNavigation
          label="Paginação da coleção pública"
          page={data.number + 1}
          totalPages={data.totalPages}
          onPageChange={(page) => onPageChange(page - 1)}
        />
      )}
    </div>
  )
}
