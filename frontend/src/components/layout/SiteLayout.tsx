import { useEffect, useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Alert } from '@/components/ui/Alert'
import { SiteHeader } from './SiteHeader'
import { GameNavigation } from './GameNavigation'
import { SiteFooter } from './SiteFooter'

export function SiteLayout() {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function soon(feature: string) {
    setNotice(`${feature} será implementado no futuro.`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-50 text-neutral-900">
      <SiteHeader onSoon={soon} />
      <GameNavigation onSoon={soon} />
      {notice && (
        <div className="fixed top-24 right-4 left-4 z-30 mx-auto max-w-md sm:left-auto">
          <Alert variant="info" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      )}
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter onSoon={soon} />
    </div>
  )
}
