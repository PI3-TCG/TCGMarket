import './siteChrome.css'
import { Outlet } from '@tanstack/react-router'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { MobileBottomNavigation } from './MobileBottomNavigation'

/** Layout global. O header não é sticky; a tab bar mobile compensa a área inferior. */
export function SiteLayout() {
  return (
    <div className="tcg-site-layout page-vignette flex min-h-svh flex-col text-neutral-900">
      <SiteHeader />
      <div className="tcg-site-content min-w-0 flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <MobileBottomNavigation />
    </div>
  )
}
