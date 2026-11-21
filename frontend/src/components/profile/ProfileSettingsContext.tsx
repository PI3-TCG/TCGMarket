import { ProfileSettingsContext, type SettingsContext } from './profileSettings'
import { useRef, useState, type ReactNode } from 'react'
import { useRemoteData, type RemoteData } from '@/hooks/useRemoteData'
import {
  confirmAvatarUpload,
  createAvatarUpload,
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
  async function uploadAvatar(file: File) {
    if (state.status !== 'ready' || busy.current) return false
    busy.current = true
    setSaving(true)
    setFeedback(null)
    try {
      const ticket = await createAvatarUpload(file)
      const uploaded = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploaded.ok) throw new Error('upload')
      setSaved(await confirmAvatarUpload(ticket.key))
      setFeedback({ error: false, text: 'Configurações atualizadas.' })
      return true
    } catch {
      setFeedback({
        error: true,
        text: 'Não foi possível salvar a foto. Tente novamente.',
      })
      return false
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <ProfileSettingsContext.Provider
      value={{ state, saving, feedback, retry, save, uploadAvatar }}
    >
      {children}
    </ProfileSettingsContext.Provider>
  )
}
