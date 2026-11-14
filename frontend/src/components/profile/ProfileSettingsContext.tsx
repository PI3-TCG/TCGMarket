import { ProfileSettingsContext, type SettingsContext } from './profileSettings'
import { useRef, useState, type ReactNode } from 'react'
import { useRemoteData, type RemoteData } from '@/hooks/useRemoteData'
import {
  getProfileSettings,
  saveProfileSettings,
  type ProfileSettings,
} from '@/services/profileApi'

export function ProfileSettingsProvider({
  username,
  children,
}: {
  username: string
  children: ReactNode
}) {
  const { state: remote, retry } = useRemoteData(
    `settings:${username}`,
    getProfileSettings,
  )
  const [saved, setSaved] = useState<ProfileSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const busy = useRef(false)
  const [feedback, setFeedback] = useState<SettingsContext['feedback']>(null)
  const state: RemoteData<ProfileSettings> = saved
    ? { status: 'ready', data: saved }
    : remote
  async function save(
    changes: Partial<Pick<ProfileSettings, 'avatarUrl' | 'collectionPublic'>>,
  ) {
    if (state.status !== 'ready' || busy.current) return false
    busy.current = true
    setSaving(true)
    setFeedback(null)
    try {
      setSaved(await saveProfileSettings({ ...state.data, ...changes }))
      setFeedback({ error: false, text: 'Configurações atualizadas.' })
      return true
    } catch {
      setFeedback({
        error: true,
        text: 'Não foi possível salvar. Tente novamente.',
      })
      return false
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <ProfileSettingsContext.Provider
      value={{ state, saving, feedback, retry, save }}
    >
      {children}
    </ProfileSettingsContext.Provider>
  )
}
