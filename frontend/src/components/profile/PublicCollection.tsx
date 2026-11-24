import { profileCollectionSection } from './profileStyles'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { CollectionFilters } from '@/components/collection/CollectionFilters'
import { emptyCollectionFilters } from '@/components/collection/collectionFilterDefaults'
import type { CollectionFilterValues } from '@/types/Collection'
import { useCallback, useState } from 'react'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  getPublicCollection,
  getPublicSummary,
  getPublicCollectionFilterOptions,
} from '@/services/profileApi'
import { Card } from '@/components/ui/Card'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import { gameLabel } from './profileFormat'
import type { CardGame } from '@/types/User'
import { ProfileHero, ProfileStatus, AboutCard } from './ProfileView'
import type { ProfileViewData } from './profileFormat'
import { ProfileReputation } from './ProfileReputation'

export function PublicCollector({ profile }: { profile: ProfileViewData }) {
  const load = useCallback(
    () => getPublicSummary(profile.username),
    [profile.username],
  )
  const { state, retry } = useRemoteData(
    `public-summary:${profile.username}`,
    load,
  )
  return (
    <>
      <ProfileHero
        profile={profile}
        collectionGames={
          state.status === 'ready' && state.data.collectionPublic
            ? (state.data.collectionGames ?? [])
            : []
        }
        avatarUrl={state.status === 'ready' ? state.data.avatarUrl : null}
      />
      <ProfileReputation
        key={profile.username}
        username={profile.username}
        about={<AboutCard profile={profile} />}
        completedTransactions={
          state.status === 'ready'
            ? state.data.completedTransactions
            : undefined
        }
      />
      {state.status === 'loading' ? (
        <p role="status">Carregando informações do colecionador...</p>
      ) : state.status !== 'ready' ? (
        <ProfileStatus kind="error" onRetry={retry} />
      ) : (
        <>
          <section
            id="colecao"
            className={`${profileCollectionSection} scroll-mt-6`}
          >
            <h2 className="mb-4 font-display text-2xl font-bold wrap-anywhere text-primary-900">
              Coleção de @{profile.username}
            </h2>
            {state.data.collectionPublic ? (
              <PublicCards key={profile.username} username={profile.username} />
            ) : (
              <Card className="p-8 text-center">
                <p role="status" className="text-neutral-700">
                  Esta coleção é privada. Somente o proprietário pode visualizar
                  suas cartas.
                </p>
              </Card>
            )}
          </section>
        </>
      )}
    </>
  )
}
function PublicCards({ username }: { username: string }) {
  const [query, setQuery] = useState<{
    page: number
    filters: CollectionFilterValues
    attempt: number
  }>({ page: 0, filters: { ...emptyCollectionFilters }, attempt: 0 })
  const optionsLoad = useCallback(
    () => getPublicCollectionFilterOptions(username),
    [username],
  )
  const options = useRemoteData(`public-options:${username}`, optionsLoad)
  return (
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
        page={query.page}
        filters={query.filters}
        attempt={query.attempt}
        onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
      />
    </div>
  )
}
function PublicCardsResults({
  username,
  page,
  filters,
  attempt,
  onPageChange,
}: {
  username: string
  page: number
  filters: CollectionFilterValues
  attempt: number
  onPageChange: (page: number) => void
}) {
  const load = useCallback(
    () => getPublicCollection(username, page, filters),
    [username, page, filters],
  )
  const { state, retry } = useRemoteData(
    `public-collection:${username}:${page}:${JSON.stringify(filters)}:${attempt}`,
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
