import axios from 'axios'
import { useEffect, useState, type ReactNode } from 'react'
import { currentUser } from '@/services/authApi'
import {
  clearSession,
  readStoredUser,
  readToken,
  saveSession,
} from '@/services/authStorage'
import { SessionContext } from '@/session'
import type { LoginResponse, UserResponse } from '@/types/User'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() =>
    readToken() ? readStoredUser() : null,
  )
  const [sessionReady, setSessionReady] = useState(() => !readToken())
  const [loginNotice, setLoginNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!readToken()) {
      return
    }

    currentUser()
      .then((current) => {
        if (!active) {
          return
        }
        const token = readToken()
        if (token) {
          saveSession(token, current)
        }
        setUser(current)
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          return
        }
        clearSession()
        setUser(null)
      })
      .finally(() => {
        if (active) {
          setSessionReady(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  function login(session: LoginResponse) {
    saveSession(session.token, session.user)
    setUser(session.user)
    setSessionReady(true)
    setLoginNotice(null)
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <SessionContext.Provider
      value={{
        user,
        sessionReady,
        loginNotice,
        setLoginNotice,
        login,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
