import { createContext, useContext } from 'react'
import type { LoginResponse, UserResponse } from '@/types/User'

export type SessionValue = {
  user: UserResponse | null
  sessionReady: boolean
  loginNotice: string | null
  setLoginNotice: (notice: string | null) => void
  login: (session: LoginResponse) => void
  logout: () => void
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) {
    throw new Error('useSession precisa estar dentro de SessionProvider.')
  }
  return session
}
