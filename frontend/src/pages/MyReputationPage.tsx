import { Link } from '@tanstack/react-router'
import { ProfileReputation } from '@/components/profile/ProfileReputation'
import {
  ProfileSkeleton,
  ProfileStatus,
} from '@/components/profile/ProfileView'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getOwnProfile } from '@/services/profileApi'
import { useSession } from '@/session'

export function MyReputationPage() {
  const { user } = useSession()
  const { state, retry } = useRemoteData(`me:${user?.id}`, getOwnProfile)

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-6 sm:px-6">
      <Link
        to="/perfil"
        className="text-sm font-semibold text-primary-900 hover:underline"
      >
        Voltar ao meu perfil
      </Link>
      <h1 className="font-display text-3xl font-bold text-primary-900">
        Minha reputação
      </h1>
      {state.status === 'loading' ? (
        <ProfileSkeleton />
      ) : state.status === 'ready' ? (
        <ProfileReputation
          key={state.data.username}
          username={state.data.username}
        />
      ) : (
        <ProfileStatus kind="error" onRetry={retry} />
      )}
    </main>
  )
}
