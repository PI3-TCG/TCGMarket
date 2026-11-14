import { createContext, useContext } from 'react'
import type { RemoteData } from '@/hooks/useRemoteData'
import type { ProfileSettings } from '@/services/profileApi'

export type SettingsContext = {
  state: RemoteData<ProfileSettings>
  saving: boolean
  feedback: { error: boolean; text: string } | null
  retry: () => void
  save: (
    changes: Partial<Pick<ProfileSettings, 'avatarUrl' | 'collectionPublic'>>,
  ) => Promise<boolean>
}
export const ProfileSettingsContext = createContext<SettingsContext | null>(
  null,
)

export function useProfileSettings() {
  const context = useContext(ProfileSettingsContext)
  if (!context)
    throw new Error('As configurações do perfil precisam do provider.')
  return context
}
