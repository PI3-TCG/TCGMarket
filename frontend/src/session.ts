import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { LoginResponse, UserResponse, UserRole } from '@/types/User'

export type SessionValue = {
  user: UserResponse | null
  sessionReady: boolean
  loginNotice: string | null
  setLoginNotice: Dispatch<SetStateAction<string | null>>
  login: (session: LoginResponse) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) {
    throw new Error('useSession precisa estar dentro de SessionProvider.')
  }
  return session
}

// Decide só o que a interface mostra. Quem autoriza de fato é a API.
export function hasRole(user: UserResponse | null, role: UserRole) {
  if (!user) {
    return false
  }
  return role === 'USER' || user.role === role
}
