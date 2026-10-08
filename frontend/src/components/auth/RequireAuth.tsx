import { useNavigate } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { hasRole, useSession } from '@/session'
import type { UserRole } from '@/types/User'

const LOGIN_REQUIRED_NOTICE = 'Entre na sua conta para continuar.'

type RequireAuthProps = {
  role?: UserRole
  children: ReactNode
}

export function RequireAuth({ role = 'USER', children }: RequireAuthProps) {
  const navigate = useNavigate()
  const { user, sessionReady, setLoginNotice } = useSession()

  useEffect(() => {
    if (sessionReady && !user) {
      setLoginNotice((current) => current ?? LOGIN_REQUIRED_NOTICE)
      navigate({ to: '/login' })
    }
  }, [navigate, sessionReady, user, setLoginNotice])

  if (!sessionReady) {
    return (
      <main className="flex min-h-svh items-center justify-center text-sm text-neutral-500">
        Carregando...
      </main>
    )
  }

  if (!user) {
    return null
  }

  if (!hasRole(user, role)) {
    return <ForbiddenPage />
  }

  return children
}
