import { profileCollectionSection } from './profileStyles'
import { useCallback } from 'react'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getPublicSummary, listPublicCollections } from '@/services/profileApi'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { tradingCardGrid, tradingCardSurface } from '@/components/ui/tradingCardStyles'
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
          state.status === 'ready' ? (state.data.collectionGames ?? []) : []
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
        <section
          id="colecao"
          className={`${profileCollectionSection} scroll-mt-6`}
        >
          <h2 className="mb-4 font-display text-2xl font-bold wrap-anywhere text-primary-900">
            Coleções de @{profile.username}
          </h2>
          <PublicCollectionChoices username={profile.username} />
        </section>
      )}
    </>
  )
}

function PublicCollectionChoices({ username }: { username: string }) {
  const load = useCallback(() => listPublicCollections(username), [username])
  const { state, retry } = useRemoteData(`public-collections:${username}`, load)
  if (state.status === 'loading') {
    return <p role="status">Carregando coleções...</p>
  }
  if (state.status !== 'ready') {
    return <ProfileStatus kind="error" onRetry={retry} />
  }
  if (state.data.length === 0) {
    return (
      <p role="status" className="text-neutral-700">
        Nenhuma coleção pública.
      </p>
    )
  }
  return (
    <div className={tradingCardGrid}>
      {state.data.map((collection) => (
        <Link
          key={collection.id}
          to="/jogadores/$username/colecoes/$collectionId"
          params={{ username, collectionId: collection.id }}
          className={`${tradingCardSurface} no-underline`}
        >
          <div className="relative aspect-[63/88] w-full bg-surface-sand">
            {collection.coverImageUrl ? (
              <img
                src={collection.coverImageUrl}
                alt=""
                className="absolute inset-0 size-full object-contain p-2"
              />
            ) : (
              <div className="grid h-full place-items-center text-brand-deep">
                <Icon name="layers" size={32} />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <h3 className="font-title text-lg font-bold text-text-ink">{collection.name}</h3>
              <p className="text-sm text-text-secondary">{cardLabel(collection.cardCount)}</p>
              <span className="mt-1 block text-sm font-semibold text-brand-primary">
                Ver cartas
              </span>
            </div>
            <Badge variant="success" className="shrink-0">
              Pública
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}

function cardLabel(count: number) {
  return count === 1 ? '1 carta' : `${count} cartas`
}
