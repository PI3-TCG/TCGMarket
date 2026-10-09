import axios from 'axios'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SESSION_EXPIRED_EVENT } from '@/services/api'
import { currentUser } from '@/services/authApi'
import {
  clearSession,
  readStoredUser,
  readToken,
  saveSession,
} from '@/services/authStorage'
import { SessionContext } from '@/session'
import type { LoginResponse, UserResponse } from '@/types/User'

const SESSION_EXPIRED_NOTICE = 'Sua sessão expirou. Entre novamente.'

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

  useEffect(() => {
    function expire() {
      setUser(null)
      setLoginNotice(SESSION_EXPIRED_NOTICE)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, expire)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = readToken()
    if (!token) {
      return
    }
    try {
      const current = await currentUser()
      saveSession(token, current)
      setUser(current)
    } catch {
      // Um 401 já encerra a sessão pelo interceptor; outras falhas mantêm o usuário atual.
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
        refreshUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
