import { useCallback, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { PageBanner } from '@/components/layout/PageBanner'
import { pageBanners } from '@/config/pageBanners'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { emptyMarketplaceFilters } from '@/components/marketplace/marketplaceFilterDefaults'
import { Button } from '@/components/ui/Button'
import { FeedbackState } from '@/components/ui/FeedbackState'
import {
  ListingHeader,
  ListingSkeleton,
  listingPanelClass,
} from '@/components/ui/ListingPresentation'
import { tradingCardGrid } from '@/components/ui/tradingCardStyles'
import { useRemoteData } from '@/hooks/useRemoteData'
import { api } from '@/services/api'
import { getMarketplaceAds } from '@/services/marketplace'

type Users = { users: { name: string; username: string }[]; hasMore: boolean }

/** Mantém a paginação anterior da busca, cujo endpoint não informa total. */
function SearchPagination({
  page,
  hasMore,
  change,
  label,
}: {
  page: number
  hasMore: boolean
  change: (page: number) => void
  label: string
}) {
  if (page === 1 && !hasMore) return null
  return (
    <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-border-default pt-4">
      <Button variant="outline" disabled={page === 1} onClick={() => change(page - 1)}>
        Anterior
      </Button>
      <span aria-current="page" className="text-sm font-semibold text-text-primary">
        Página {page}
      </span>
      <Button variant="outline" disabled={!hasMore} onClick={() => change(page + 1)}>
        Próxima
      </Button>
    </nav>
  )
}

function UserResults({ q }: { q: string }) {
  const [page, setPage] = useState(1)
  const fetchUsers = useCallback(
    async () =>
      (await api.get<Users>('/api/users/search', { params: { q, page } })).data,
    [q, page],
  )
  const { state, retry } = useRemoteData(JSON.stringify([q, page]), fetchUsers)

  if (state.status === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-label="Buscando usuários">
        <span className="sr-only">Buscando usuários...</span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} aria-hidden="true" className="h-24 rounded-surface border border-border-default bg-surface-subtle motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (state.status !== 'ready') {
    return (
      <FeedbackState
        role="alert"
        icon="alert"
        title="Não foi possível buscar usuários"
        description="Verifique sua conexão e tente novamente."
        className="rounded-surface border border-border-default bg-surface-default"
      >
        <Button variant="outline" onClick={retry}>Tentar novamente</Button>
      </FeedbackState>
    )
  }

  return (
    <>
      {state.data.users.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.users.map((user) => (
            <li key={user.username} className="min-w-0">
              <Link
                to="/jogadores/$username"
                params={{ username: user.username }}
                className="flex min-h-24 min-w-0 flex-col justify-center rounded-surface border border-border-default bg-surface-default px-4 py-3 text-text-primary shadow-sm transition-colors hover:border-border-emphasis hover:bg-surface-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
              >
                <strong className="wrap-anywhere font-sans text-sm">{user.name}</strong>
                <span className="mt-1 wrap-anywhere text-xs text-brand-primary">@{user.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <FeedbackState
          icon="search"
          title="Nenhum usuário encontrado"
          description="Tente outro nome ou nome de usuário."
          className="rounded-surface border border-dashed border-border-emphasis bg-surface-default"
        />
      )}
      <SearchPagination
        page={page}
        hasMore={state.data.hasMore}
        change={setPage}
        label="Paginação dos usuários"
      />
    </>
  )
}

function AdResults({ q }: { q: string }) {
  const [page, setPage] = useState(1)
  const fetchAds = useCallback(
    () => getMarketplaceAds(page, 'recent', { ...emptyMarketplaceFilters, search: q }),
    [q, page],
  )
  const { state, retry } = useRemoteData(JSON.stringify([q, page]), fetchAds)

  if (state.status === 'loading') {
    return <ListingSkeleton label="Buscando anúncios" />
  }

  if (state.status !== 'ready') {
    return (
      <FeedbackState
        role="alert"
        icon="alert"
        title="Não foi possível buscar anúncios"
        description="Verifique sua conexão e tente novamente."
        className="rounded-surface border border-border-default bg-surface-default"
      >
        <Button variant="outline" onClick={retry}>Tentar novamente</Button>
      </FeedbackState>
    )
  }

  return (
    <>
      {state.data.content.length ? (
        <div className={tradingCardGrid}>
          {state.data.content.map((ad) => <MarketplaceAdCard key={ad.id} ad={ad} />)}
        </div>
      ) : (
        <FeedbackState
          icon="search"
          title={page > 1 ? 'Não há anúncios nesta página' : 'Nenhum anúncio encontrado'}
          description={page > 1
            ? 'Tente voltar à primeira página.'
            : 'Não encontramos anúncios correspondentes à sua busca.'}
          className="rounded-surface border border-dashed border-border-emphasis bg-surface-default"
        >
          {page > 1 ? (
            <Button variant="outline" onClick={() => setPage(1)}>Voltar à primeira página</Button>
          ) : null}
        </FeedbackState>
      )}
      <SearchPagination
        page={page}
        hasMore={page < state.data.totalPages}
        change={setPage}
        label="Paginação dos anúncios encontrados"
      />
    </>
  )
}

export function SearchPage() {
  const { q } = useSearch({ from: '/site-layout/busca' })
  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          image={pageBanners.marketplace}
          title="Busca"
          subtitle="Encontre cartas anunciadas e usuários do TCGMarket."
        />
        <div className="space-y-6 pt-5">
          <h2 className="wrap-anywhere font-display text-xl font-bold text-text-ink sm:text-2xl">
            {q ? `Resultados para “${q}”` : 'Encontre cartas e usuários'}
          </h2>
          {q ? (
            <>
              <section aria-label="Resultados de usuários" className={listingPanelClass}>
                <ListingHeader title="Usuários" description="Perfis encontrados na pesquisa" />
                <UserResults key={q} q={q} />
              </section>
              <section aria-label="Resultados de anúncios" className={listingPanelClass}>
                <ListingHeader title="Cartas anunciadas" description="Anúncios reais do Marketplace" />
                <AdResults key={q} q={q} />
              </section>
            </>
          ) : (
            <FeedbackState
              icon="search"
              title="Comece uma busca"
              description="Digite o nome de uma carta ou de um usuário no campo de busca do site."
              className="rounded-surface border border-border-default bg-surface-default"
            />
          )}
        </div>
      </div>
    </main>
  )
}
