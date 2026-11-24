import {
  profileOutlineLink,
  profileTextLink,
} from '@/components/profile/profileStyles'
import { ProfileReputation } from '@/components/profile/ProfileReputation'
import { ProfileSettingsProvider } from '@/components/profile/ProfileSettingsContext'
import { ProfilePhotoEditor } from '@/components/profile/ProfilePhotoEditor'
import { FeaturedCollection } from '@/components/profile/FeaturedCollection'
import {
  AboutCard,
  PencilIcon,
  ProfileHero,
  ProfileShell,
  ProfileSkeleton,
  ProfileStatus,
} from '@/components/profile/ProfileView'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { ProfilePrivacy } from '@/components/profile/ProfilePrivacy'
import { toViewData } from '@/components/profile/profileFormat'
import { Alert } from '@/components/ui/Alert'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getOwnProfile } from '@/services/profileApi'
import { useSession } from '@/session'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useSession()
  const saved = useRouterState({
    select: (state) => state.location.state.profileSaved === true,
  })
  const { state, retry } = useRemoteData(`me:${user?.id}`, getOwnProfile)

  function dismissSaved() {
    void navigate({ to: '/perfil', replace: true, state: {} })
  }

  return (
    <ProfileShell showBanner={false}>
      {saved ? (
        <Alert variant="success" onDismiss={dismissSaved}>
          Perfil atualizado com sucesso.
        </Alert>
      ) : null}

      {state.status === 'loading' ? <ProfileSkeleton /> : null}
      {state.status === 'notFound' || state.status === 'error' ? (
        <ProfileStatus kind="error" onRetry={retry} />
      ) : null}
      {state.status === 'ready' ? (
        <ProfileSettingsProvider
          key={state.data.username}
          username={state.data.username}
        >
          <ProfileHero
            avatar={<ProfilePhotoEditor name={state.data.name} />}
            profile={toViewData(state.data)}
            action={
              <div className="flex flex-wrap gap-3">
                <EditProfileLink label="Editar perfil" />
                <Link
                  to="/jogadores/$username"
                  params={{ username: state.data.username }}
                  className={profileOutlineLink}
                >
                  Ver perfil público
                </Link>
              </div>
            }
          />
          <ProfileDashboard
            username={state.data.username}
            overview={
              <ProfileReputation
                key={state.data.username}
                username={state.data.username}
                about={
                  <AboutCard
                    profile={toViewData(state.data)}
                    email={state.data.email}
                    emptyBioAction={
                      <EditProfileLink label="Escrever bio" compact />
                    }
                  />
                }
              />
            }
            collection={
              <FeaturedCollection
                privacy={<ProfilePrivacy username={state.data.username} />}
              />
            }
          />
        </ProfileSettingsProvider>
      ) : null}
    </ProfileShell>
  )
}

function EditProfileLink({
  label,
  compact = false,
}: {
  label: string
  compact?: boolean
}) {
  return (
    <Link
      to="/perfil/editar"
      className={
        compact
          ? `${profileTextLink} inline-flex min-h-11 items-center gap-1`
          : profileOutlineLink
      }
    >
      <PencilIcon />
      {label}
    </Link>
  )
}
