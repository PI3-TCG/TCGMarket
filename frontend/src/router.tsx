import { AdminLayout } from '@/components/admin/AdminLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { AdminCatalogPage } from '@/pages/admin/AdminCatalogPage'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { SearchPage } from '@/pages/SearchPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { CardDetailsPage } from '@/pages/CardDetailsPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MyReputationPage } from '@/pages/MyReputationPage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'
import { NotFound, RootLayout } from '@/routes/RootLayout'
import { parseAdminCatalogSearch } from '@/utils/adminCatalogSearch'
import { parseCatalogSearch } from '@/utils/catalogSearch'
import { isInternalPath } from '@/utils/redirect'
import {
  createRootRoute,
  createRoute,
  createRouter,
  defaultParseSearch,
  defaultStringifySearch,
  redirect,
} from '@tanstack/react-router'
import { MyCollectionPage } from '@/pages/MyCollectionPage'
import { CreateAdPage } from '@/pages/CreateAdPage'
import { MyAdsPage } from '@/pages/MyAdsPage'
import { MarketplaceAdPage } from '@/pages/MarketplaceAdPage'
import { CartPage } from '@/pages/CartPage'
import { DeliveryPage } from '@/pages/DeliveryPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { CheckoutResultPage } from '@/pages/CheckoutResultPage'
import { MarketplaceRouteView } from '@/routes/MarketplaceRouteView'
import { TransactionHistoryPage } from '@/pages/TransactionHistoryPage'
import { TransactionDetailPage } from '@/pages/TransactionDetailPage'
import { parseHistorySearch } from '@/components/history/historyFormat'
import type { MarketplaceSort } from '@/types/Marketplace'

import { MyTradeProposalsPage } from '@/pages/MyTradeProposalsPage'

import { parseTradeProposalsSearch } from '@/components/trade/proposalViewFormat'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

const siteLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'site-layout',
  component: SiteLayout,
})

const searchRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/busca',
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q.trim().slice(0, 100) : '',
  }),
  component: SearchPage,
})

const indexRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/',
  component: HomePage,
})

const catalogRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/catalogo/$game',
  validateSearch: parseCatalogSearch,
  component: CatalogPage,
})

const cardDetailsRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/cartas/$id',
  validateSearch: (search: Record<string, unknown>): { adicionar?: true } =>
    search.adicionar === 1 ||
    search.adicionar === '1' ||
    search.adicionar === true
      ? { adicionar: true }
      : {},
  component: CardDetailsPage,
})

const profileRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil',
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
})

const profileEditRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/editar',
  component: () => (
    <RequireAuth>
      <ProfileEditPage />
    </RequireAuth>
  ),
})

const publicProfileRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/jogadores/$username',
  component: PublicProfilePage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: RegisterPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' && isInternalPath(search.redirect)
      ? { redirect: search.redirect }
      : {},
  component: LoginPage,
})

const adminRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/admin',
  component: () => (
    <RequireAuth role="ADMIN">
      <AdminLayout />
    </RequireAuth>
  ),
})

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminOverviewPage,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'usuarios',
  component: AdminUsersPage,
})

const adminCatalogRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'catalogo',
  validateSearch: parseAdminCatalogSearch,
  component: AdminCatalogPage,
})

const designSystemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design-system',
  component: DesignSystemPage,
})

const myCollectionRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/minha-colecao',
  component: () => (
    <RequireAuth>
      <MyCollectionPage />
    </RequireAuth>
  ),
})

const createAdRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/anuncios/novo',
  validateSearch: (search: Record<string, unknown>): { item?: string } =>
    typeof search.item === 'string' && search.item.trim() !== ''
      ? { item: search.item }
      : {},
  component: () => (
    <RequireAuth>
      <CreateAdPage />
    </RequireAuth>
  ),
})

const myAdsRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/meus-anuncios',
  component: () => (
    <RequireAuth>
      <MyAdsPage />
    </RequireAuth>
  ),
})

const myTradeProposalsRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/propostas',
  validateSearch: parseTradeProposalsSearch,
  component: () => (
    <RequireAuth returnAfterLogin>
      <MyTradeProposalsPage />
    </RequireAuth>
  ),
})

const legacyTradesRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/trades',
  validateSearch: parseTradeProposalsSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/perfil/propostas', search, replace: true })
  },
})

const myReputationRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/reputacao',
  component: () => (
    <RequireAuth returnAfterLogin>
      <MyReputationPage />
    </RequireAuth>
  ),
})

const transactionHistoryRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/historico',
  validateSearch: parseHistorySearch,
  component: () => (
    <RequireAuth>
      <TransactionHistoryPage />
    </RequireAuth>
  ),
})

const transactionDetailRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/historico/$transactionId',
  validateSearch: parseHistorySearch,
  component: () => (
    <RequireAuth>
      <TransactionDetailPage />
    </RequireAuth>
  ),
})

const marketplaceRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/marketplace',

  validateSearch: (
    search: Record<string, unknown>,
  ): { sort: MarketplaceSort } => ({
    sort:
      search.sort === 'priceDesc' ||
      search.sort === 'priceAsc' ||
      search.sort === 'oldest'
        ? search.sort
        : 'recent',
  }),

  component: MarketplaceRouteView,
})

const marketplaceAdRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/marketplace/anuncios/$id',
  component: MarketplaceAdPage,
})

const cartRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/carrinho',
  component: () => (
    <RequireAuth>
      <CartPage />
    </RequireAuth>
  ),
})

const deliveryRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/carrinho/entrega',
  component: () => (
    <RequireAuth>
      <DeliveryPage />
    </RequireAuth>
  ),
})

const reviewRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/carrinho/revisao',
  component: () => (
    <RequireAuth>
      <ReviewPage />
    </RequireAuth>
  ),
})

const checkoutResultRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/carrinho/resultado/$checkoutId',
  component: () => (
    <RequireAuth>
      <CheckoutResultPage />
    </RequireAuth>
  ),
})

const routeTree = rootRoute.addChildren([
  siteLayoutRoute.addChildren([
    indexRoute,
    searchRoute,
    marketplaceRoute,
    marketplaceAdRoute,
    cartRoute,
    deliveryRoute,
    reviewRoute,
    checkoutResultRoute,
    catalogRoute,
    cardDetailsRoute,
    profileRoute,
    profileEditRoute,
    publicProfileRoute,
    adminRoute.addChildren([
      adminOverviewRoute,
      adminUsersRoute,
      adminCatalogRoute,
    ]),
    myCollectionRoute,
    createAdRoute,
    myAdsRoute,
    myTradeProposalsRoute,
    legacyTradesRoute,
    myReputationRoute,
    transactionHistoryRoute,
    transactionDetailRoute,
  ]),
  registerRoute,
  loginRoute,
  designSystemRoute,
])

export const router = createRouter({
  routeTree,
  // Termos da busca, como "123" e "true", precisam continuar sendo texto.
  parseSearch: (search) => {
    const parsed = defaultParseSearch(search)
    const query = new URLSearchParams(search).get('q')
    return query === null ? parsed : { ...parsed, q: query }
  },
  stringifySearch: ({ q, ...search }) => {
    if (typeof q !== 'string') return defaultStringifySearch({ ...search, q })
    const encoded = defaultStringifySearch(search)
    return `${encoded || '?'}${encoded ? '&' : ''}q=${encodeURIComponent(q)}`
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

declare module '@tanstack/history' {
  interface HistoryState {
    profileSaved?: boolean
  }
}
