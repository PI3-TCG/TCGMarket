import { useEffect, useState } from 'react'
import './siteChrome.css'
import { Outlet } from '@tanstack/react-router'
import { Alert } from '@/components/ui/Alert'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { MobileBottomNavigation } from './MobileBottomNavigation'

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
    <div className="tcg-site-layout page-vignette flex min-h-svh flex-col text-neutral-900">
      <SiteHeader onSoon={soon} />
      {notice && (
        <div className="tcg-layout-notice fixed right-4 left-4 z-[45] mx-auto max-w-md sm:left-auto">
          <Alert variant="info" onDismiss={() => setNotice(null)}>{notice}</Alert>
        </div>
      )}
      <div className="tcg-site-content min-w-0 flex-1">
        <Outlet />
      </div>
      <SiteFooter onSoon={soon} />
      <MobileBottomNavigation />
    </div>
  )
}
