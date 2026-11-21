import { useCallback, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { MarketplaceAdCard } from '@/components/marketplace/MarketplaceAdCard'
import { emptyMarketplaceFilters } from '@/components/marketplace/marketplaceFilterDefaults'
import { Button } from '@/components/ui/Button'
import { useRemoteData } from '@/hooks/useRemoteData'
import { api } from '@/services/api'
import { getMarketplaceAds } from '@/services/marketplace'

type Users = { users: { name: string; username: string }[]; hasMore: boolean }

function Pagination({
  page,
  hasMore,
  change,
}: {
  page: number
  hasMore: boolean
  change: (page: number) => void
}) {
  if (page === 1 && !hasMore) return null
  return (
    <div className="mt-3 flex items-center gap-3">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => change(page - 1)}
      >
        Anterior
      </Button>
      <span>Página {page}</span>
      <Button
        variant="outline"
        disabled={!hasMore}
        onClick={() => change(page + 1)}
      >
        Próxima
      </Button>
    </div>
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
  if (state.status === 'loading') return <p role="status">Buscando usuários…</p>
  if (state.status !== 'ready')
    return (
      <p role="alert">
        Falha ao buscar usuários.{' '}
        <Button variant="ghost" onClick={retry}>
          Tentar novamente
        </Button>
      </p>
    )
  return (
    <>
      {state.data.users.length ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.users.map((user) => (
            <li key={user.username}>
              <Link
                to="/jogadores/$username"
                params={{ username: user.username }}
                className="block rounded-lg border border-primary-100 bg-white px-4 py-3 text-primary-900 hover:underline focus-visible:outline-2"
              >
                <strong>{user.name}</strong> <span>@{user.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum usuário encontrado.</p>
      )}
      <Pagination page={page} hasMore={state.data.hasMore} change={setPage} />
    </>
  )
}

function AdResults({ q }: { q: string }) {
  const [page, setPage] = useState(1)
  const fetchAds = useCallback(
    () =>
      getMarketplaceAds(page, 'recent', {
        ...emptyMarketplaceFilters,
        search: q,
      }),
    [q, page],
  )
  const { state, retry } = useRemoteData(JSON.stringify([q, page]), fetchAds)
  if (state.status === 'loading') return <p role="status">Buscando anúncios…</p>
  if (state.status !== 'ready')
    return (
      <p role="alert">
        Falha ao buscar anúncios.{' '}
        <Button variant="ghost" onClick={retry}>
          Tentar novamente
        </Button>
      </p>
    )
  return (
    <>
      {state.data.content.length ? (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))]">
          {state.data.content.map((ad) => (
            <MarketplaceAdCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        <p>Nenhum anúncio disponível para essa carta.</p>
      )}
      <Pagination
        page={page}
        hasMore={page < state.data.totalPages}
        change={setPage}
      />
    </>
  )
}

export function SearchPage() {
  const { q } = useSearch({ from: '/site-layout/busca' })
  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 text-neutral-900 sm:px-8">
      <h1 className="break-words text-2xl font-bold text-primary-900">
        {q ? `Resultados para “${q}”` : 'Busca'}
      </h1>
      {q ? (
        <>
          <section aria-labelledby="search-users">
            <h2 id="search-users" className="mb-3 text-xl font-semibold">
              Usuários
            </h2>
            <UserResults key={q} q={q} />
          </section>
          <section aria-labelledby="search-ads">
            <h2 id="search-ads" className="mb-3 text-xl font-semibold">
              Cartas anunciadas
            </h2>
            <AdResults key={q} q={q} />
          </section>
        </>
      ) : (
        <p>Digite o nome de uma carta ou de um usuário na busca.</p>
      )}
    </main>
  )
}
