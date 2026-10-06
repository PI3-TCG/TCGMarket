import { useEffect, useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { currentUser } from '@/services/authApi'
import {
  clearSession,
  readStoredUser,
  readToken,
  saveSession,
} from '@/services/authStorage'
import type { LoginResponse, UserResponse } from '@/types/User'

type Page = 'home' | 'register' | 'login'

function App() {
  const [page, setPage] = useState<Page>('home')
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
      .catch(() => {
        if (!active) {
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

  function handleLogin(session: LoginResponse) {
    saveSession(session.token, session.user)
    setUser(session.user)
    setSessionReady(true)
    setPage('home')
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setPage('home')
  }

  if (page === 'login' && !user) {
    return (
      <LoginPage
        initialNotice={loginNotice}
        onBack={() => {
          setLoginNotice(null)
          setPage('home')
        }}
        onRegister={() => {
          setLoginNotice(null)
          setPage('register')
        }}
        onSuccess={handleLogin}
      />
    )
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onBack={() => setPage('home')}
        onLogin={() => {
          setLoginNotice(null)
          setPage(user ? 'home' : 'login')
        }}
        onCreated={() => {
          setLoginNotice('Conta criada. Entre para continuar sua jornada.')
          setPage('login')
        }}
      />
    )
  }

  return (
    <HomePage
      user={user}
      sessionReady={sessionReady}
      onRegister={() => setPage('register')}
      onLogin={() => setPage('login')}
      onLogout={handleLogout}
    />
  )
}

export default App
