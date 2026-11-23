import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { hasRole, useSession } from '@/session'
import type { UserRole } from '@/types/User'
import { isInternalPath } from '@/utils/redirect'

const LOGIN_REQUIRED_NOTICE = 'Entre na sua conta para continuar.'

type RequireAuthProps = {
  role?: UserRole
  returnAfterLogin?: boolean
  children: ReactNode
}

export function RequireAuth({
  role = 'USER',
  returnAfterLogin = false,
  children,
}: RequireAuthProps) {
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })
  const { user, sessionReady, setLoginNotice } = useSession()

  useEffect(() => {
    if (sessionReady && !user && href.split(/[?#]/, 1)[0] !== '/login') {
      setLoginNotice((current) => current ?? LOGIN_REQUIRED_NOTICE)
      const redirect =
        returnAfterLogin && isInternalPath(href) ? href : undefined
      void navigate({
        to: '/login',
        search: { redirect },
        replace: returnAfterLogin,
      })
    }
  }, [href, navigate, returnAfterLogin, sessionReady, user, setLoginNotice])

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
