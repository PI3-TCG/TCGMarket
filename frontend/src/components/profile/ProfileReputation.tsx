import { profilePanel } from './profileStyles'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { useCallback, useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRemoteData } from '@/hooks/useRemoteData'
import { api } from '@/services/api'
import type { ProfileReputation as ReputationData } from '@/types/Review'
import { ReputationIndicator } from './ReputationIndicator'

// Tamanho da página retornada por ReputationService.
const REVIEWS_PER_PAGE = 10

export function ProfileReputation({
  username,
  about,
  completedTransactions,
}: {
  username: string
  about?: ReactNode
  completedTransactions?: number
}) {
  const [page, setPage] = useState(1)
  const fetchPage = useCallback(async () => {
    const response = await api.get<ReputationData>(
      `/api/users/${encodeURIComponent(username)}/reputation`,
      { params: { page } },
    )
    return response.data
  }, [username, page])
  const { state, retry } = useRemoteData(
    `reputation:${username}:${page}`,
    fetchPage,
  )

  const statusSpan = about ? 'lg:col-span-2' : 'md:col-span-2'

  return (
    <section
      aria-label="Reputação e avaliações"
      className={
        about
          ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]'
          : 'grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'
      }
      aria-busy={state.status === 'loading'}
    >
      {about}
      {state.status === 'loading' ? (
        <p role="status" className={`p-5 ${statusSpan}`}>
          Carregando avaliações...
        </p>
      ) : state.status !== 'ready' ? (
        <Card className={`space-y-3 p-5 ${statusSpan}`}>
          <p role="alert">Não foi possível consultar a reputação.</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </Card>
      ) : (
        <>
          <Card className={`${profilePanel} p-4 sm:p-5`}>
            <h2 className="text-lg font-semibold text-primary-900">
              Reputação
            </h2>
            <p className="mt-3 font-semibold">
              <ReputationIndicator summary={state.data.summary} />
            </p>
            {state.data.summary.totalReviews > 0 && (
              <ul
                aria-label="Distribuição das notas"
                className="mt-4 space-y-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((grade) => (
                  <li key={grade} className="flex items-center gap-3">
                    <span>{grade} ★</span>
                    <progress
                      aria-label={`Avaliações com nota ${grade}`}
                      className="min-w-0 flex-1 accent-primary-900"
                      max={state.data.summary.totalReviews}
                      value={state.data.summary.countsByRating[grade]}
                    />
                    <span>{state.data.summary.countsByRating[grade]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className={`${profilePanel} p-4 sm:p-5`}>
            <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <h2 className="text-lg font-semibold text-primary-900">
                Avaliações recebidas
              </h2>
              {completedTransactions !== undefined && (
                <p className="ml-auto rounded-control bg-surface-brand-tint px-2 py-1 text-right text-xs text-brand-primary">
                  <strong>
                    {completedTransactions.toLocaleString('pt-BR')}
                  </strong>{' '}
                  transações concluídas
                </p>
              )}
            </header>
            {state.data.reviews.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-700">
                {page === 1
                  ? 'Ainda sem avaliações.'
                  : 'Nenhuma avaliação nesta página.'}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-neutral-200">
                {state.data.reviews.map((review) => (
                  <li key={review.id} className="space-y-1 py-3 text-sm">
                    <p className="wrap-anywhere font-semibold">
                      {review.author} · {review.rating} de 5
                    </p>
                    <time
                      dateTime={review.createdAt}
                      className="text-neutral-500"
                    >
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </time>
                    {review.transactionType && (
                      <span className="text-neutral-500">
                        {' · '}
                        {review.transactionType === 'TRADE'
                          ? 'Troca'
                          : 'Compra e venda'}
                      </span>
                    )}
                    {review.comment && (
                      <p className="wrap-anywhere whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {(page > 1 || state.data.hasNext) && (
              <PageNavigation
                label="Páginas de avaliações"
                page={page}
                totalPages={Math.ceil(
                  state.data.summary.totalReviews / REVIEWS_PER_PAGE,
                )}
                onPageChange={setPage}
                className="mt-4"
              />
            )}
          </Card>
        </>
      )}
    </section>
  )
}
