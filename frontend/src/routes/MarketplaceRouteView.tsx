
import { useSearch } from '@tanstack/react-router'
import { MarketplacePage } from '@/pages/MarketplacePage'

export function MarketplaceRouteView() {
  const { sort } = useSearch({
    from: '/site-layout/marketplace',
  })

  return <MarketplacePage sort={sort} />
}
