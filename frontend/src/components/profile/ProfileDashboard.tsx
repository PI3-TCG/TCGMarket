import type { ReactNode } from 'react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getProfileDashboard } from '@/services/profileApi'
import { useSession } from '@/session'
import { ProfileStatus } from './ProfileView'

export interface ReputationData {
  average: number | null
  totalReviews: number
  reviews: {
    id: string
    author: string
    rating: number
    comment: string
    createdAt: string
  }[]
}
export function ReputationCard({
  data,
  loading = false,
}: {
  data?: ReputationData
  loading?: boolean
}) {
  return (
    <Card className="h-full p-5" aria-busy={loading}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
        <Icon name="shield-check" size={24} />
        Reputação
      </h2>
      <div role="status" className="mt-3 text-sm text-neutral-700">
        {loading ? (
          'Carregando reputação...'
        ) : data ? (
          <>
            <p className="font-display text-2xl font-bold text-primary-900">
              {data.average === null
                ? 'Sem nota'
                : `${data.average.toLocaleString('pt-BR')} / 5`}
            </p>
            <p className="mt-2">{data.totalReviews} avaliações recebidas</p>
          </>
        ) : (
          'A reputação estará disponível em breve.'
        )}
      </div>
    </Card>
  )
}
export function ReviewsCard({
  data,
  loading = false,
}: {
  data?: ReputationData
  loading?: boolean
}) {
  return (
    <Card className="h-full p-5" aria-busy={loading}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
        <Icon name="message-square" size={24} />
        Avaliações
      </h2>
      <div role="status" className="mt-3 text-sm text-neutral-700">
        {loading ? (
          'Carregando avaliações...'
        ) : !data ? (
          'O recurso de avaliações ainda não está disponível.'
        ) : data.reviews.length === 0 ? (
          'Nenhuma avaliação recebida.'
        ) : (
          <ul className="space-y-3">
            {data.reviews.map((review) => (
              <li
                key={review.id}
                className="border-b border-neutral-200 pb-3 last:border-0 last:pb-0"
              >
                <strong>{review.author}</strong> · {review.rating} / 5
                <p className="mt-1 break-words">{review.comment}</p>
                <time
                  className="mt-1 block text-xs text-neutral-500"
                  dateTime={review.createdAt}
                >
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
const shortcuts: {
  to:
    | '/minha-colecao'
    | '/meus-anuncios'
    | '/perfil/propostas'
    | '/perfil/historico'
  title: string
  description: string
  icon: IconName
}[] = [
  {
    to: '/meus-anuncios',
    title: 'Meus anúncios',
    description: 'Gerencie suas ofertas no Marketplace.',
    icon: 'storefront',
  },
  {
    to: '/perfil/propostas',
    title: 'Minhas propostas',
    description: 'Acompanhe propostas enviadas e recebidas.',
    icon: 'arrows-right-left',
  },
  {
    to: '/perfil/historico',
    title: 'Histórico de transações',
    description: 'Consulte compras e vendas concluídas.',
    icon: 'receipt',
  },
]
const statuses: Record<string, string> = {
  ACTIVE: 'Ativo',
  CANCELLED: 'Cancelado',
  SOLD_OUT: 'Esgotado',
  COMPLETED: 'Concluída',
  PENDING: 'Pendente',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  EXPIRED: 'Expirada',
}
const statusVariants: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  ACCEPTED: 'success',
  COMPLETED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  CANCELLED: 'neutral',
  SOLD_OUT: 'neutral',
  EXPIRED: 'neutral',
}
export function ProfileDashboard({
  about,
  privacy,
  collection,
}: {
  about: ReactNode
  privacy: ReactNode
  collection: ReactNode
}) {
  const { user } = useSession()
  const { state, retry } = useRemoteData(
    `dashboard:${user?.id}`,
    getProfileDashboard,
  )
  return (
    <div className="space-y-5">
      <section
        aria-label="Resumo da conta"
        aria-busy={state.status === 'loading'}
      >
        {state.status === 'loading' ? (
          <p role="status" className="p-5">
            Carregando indicadores e atividades...
          </p>
        ) : state.status !== 'ready' ? (
          <ProfileStatus kind="error" onRetry={retry} />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {[
              ['TCGs colecionados', state.data.totalGames, 'layers'],
              ['Cartas colecionadas', state.data.totalCopies, 'cards'],
              ['Anúncios ativos', state.data.activeAds, 'tag'],
              ['Anúncios publicados', state.data.publishedAds, 'megaphone'],
              [
                'Transações concluídas',
                state.data.completedTransactions,
                'handshake',
              ],
              ['Reputação', 'Em breve', 'star'],
            ].map(([label, value, icon]) => (
              <Card
                key={label}
                className="grid h-full min-h-[140px] grid-rows-[minmax(3rem,1fr)_3rem] p-4 text-center"
              >
                <p className="flex items-center justify-center gap-2 text-sm text-neutral-700">
                  <Icon name={icon as IconName} size={20} />
                  <span>{label}</span>
                </p>
                <p className="flex items-center justify-center font-display text-2xl font-bold text-primary-900">
                  {typeof value === 'number'
                    ? value.toLocaleString('pt-BR')
                    : value}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section
        aria-label="Gerenciar minha conta"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {shortcuts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-5 text-center hover:border-primary-900 focus-visible:outline-2 focus-visible:outline-secondary-500"
          >
            <Icon name={item.icon} size={24} />
            <h2 className="mt-3 font-semibold text-primary-900">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-700">{item.description}</p>
          </Link>
        ))}
        {about}
      </section>
      <section
        aria-label="Reputação e avaliações"
        className="grid items-stretch gap-5 sm:grid-cols-2"
      >
        <ReputationCard />
        <ReviewsCard />
      </section>
      {privacy}
      {collection}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
          <Icon name="clock" size={24} />
          Atividades recentes
        </h2>
        {state.status === 'ready' ? (
          state.data.activities.length === 0 ? (
            <p
              role="status"
              className="py-8 text-center text-sm text-neutral-500"
            >
              Você ainda não tem atividades para exibir.
            </p>
          ) : (
            <div className="mx-auto mt-5 w-full max-w-5xl overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[480px] table-fixed border-collapse text-center text-sm">
                <caption className="sr-only">
                  Atividades recentes da sua conta
                </caption>
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[25%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="border-b border-neutral-200 bg-primary-100/60 text-primary-900">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Tipo de atividade
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Veja mais
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {state.data.activities.map((item) => (
                    <tr
                      key={`${item.kind}:${item.id}`}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-4 py-4 align-middle">
                        <p className="font-semibold text-neutral-900">
                          {item.description}
                        </p>
                        <time
                          className="mt-1 block text-xs text-neutral-500"
                          dateTime={item.occurredAt}
                        >
                          {new Date(item.occurredAt).toLocaleString('pt-BR')}
                        </time>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <Badge
                          variant={statusVariants[item.status] ?? 'neutral'}
                        >
                          {statuses[item.status] ?? 'Atualização registrada'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {item.kind === 'TRANSACTION' ? (
                          <Link
                            to="/perfil/historico/$transactionId"
                            params={{ transactionId: item.id }}
                            className="inline-flex min-h-10 items-center justify-center rounded px-2 font-semibold text-primary-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                          >
                            Ver detalhes
                          </Link>
                        ) : (
                          <Link
                            to={
                              item.kind === 'AD'
                                ? '/meus-anuncios'
                                : '/perfil/propostas'
                            }
                            className="inline-flex min-h-10 items-center justify-center rounded px-2 font-semibold text-primary-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                          >
                            Consultar{' '}
                            {item.kind === 'AD' ? 'anúncios' : 'propostas'}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p role="status" className="mt-3 text-sm text-neutral-500">
            {state.status === 'loading'
              ? 'Carregando atividades...'
              : 'Atividades indisponíveis. Tente carregar novamente.'}
          </p>
        )}
      </Card>
    </div>
  )
}
