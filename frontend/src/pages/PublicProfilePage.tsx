import {
  ProfileShell,
  ProfileSkeleton,
  ProfileStatus,
} from '@/components/profile/ProfileView'
import { PublicCollector } from '@/components/profile/PublicCollection'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getPublicProfile } from '@/services/profileApi'
import { useParams } from '@tanstack/react-router'
import { useCallback } from 'react'

export function PublicProfilePage() {
  const { username } = useParams({ from: '/site-layout/jogadores/$username' })
  const fetchProfile = useCallback(() => getPublicProfile(username), [username])
  const { state, retry } = useRemoteData(username, fetchProfile)

  return (
    <ProfileShell title="Perfil do colecionador" showBanner={false}>
      {state.status === 'loading' ? <ProfileSkeleton /> : null}
      {state.status === 'notFound' ? <ProfileStatus kind="notFound" /> : null}
      {state.status === 'error' ? (
        <ProfileStatus kind="error" onRetry={retry} />
      ) : null}
      {state.status === 'ready' ? (
        <>
          <PublicCollector key={username} profile={state.data} />
        </>
      ) : null}
    </ProfileShell>
  )
}
