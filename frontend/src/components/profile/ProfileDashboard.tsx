import { focusRing } from '@/components/ui/styles'
import { profilePanel, profileTextLink } from './profileStyles'
import { useCallback } from 'react'
import { api } from '@/services/api'
import type { ProfileReputation as ReputationDataResponse } from '@/types/Review'
import type { ReactNode } from 'react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getProfileDashboard } from '@/services/profileApi'
import { useSession } from '@/session'
import { ProfileStatus } from './ProfileView'

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
  username,
  overview,
  collection,
}: {
  username: string
  overview: ReactNode
  collection: ReactNode
}) {
  const { user } = useSession()
  const { state, retry } = useRemoteData(
    `dashboard:${user?.id}`,
    getProfileDashboard,
  )
  const getReputation = useCallback(async () => {
    const response = await api.get<ReputationDataResponse>(
      `/api/users/${encodeURIComponent(username)}/reputation`,
    )
    return response.data.summary
  }, [username])
  const { state: reputationState } = useRemoteData(
    `reputation-summary:${username}`,
    getReputation,
  )
  const summary =
    reputationState.status === 'ready' ? reputationState.data : null
  const reputationLabel = summary
    ? summary.average === null
      ? 'Ainda sem avaliações'
      : `${summary.average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`
    : reputationState.status === 'loading'
      ? 'Carregando…'
      : 'Indisponível'
  return (
    <div className="space-y-6">
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
          <Card className={`${profilePanel} p-4 sm:p-5`}>
            <h2 className="text-lg font-semibold text-brand-primary">
              Resumo da conta
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-x-3 sm:gap-x-6">
              {(
                [
                  [
                    ['TCGs colecionados', state.data.totalGames, 'layers'],
                    ['Cartas colecionadas', state.data.totalCopies, 'cards'],
                    ['Reputação', reputationLabel, 'star'],
                  ],
                  [
                    ['Anúncios ativos', state.data.activeAds, 'tag'],
                    [
                      'Anúncios publicados',
                      state.data.publishedAds,
                      'megaphone',
                    ],
                    [
                      'Transações concluídas',
                      state.data.completedTransactions,
                      'handshake',
                    ],
                  ],
                ] as const
              ).map((group) => (
                <dl
                  key={group[0][0]}
                  className="grid min-w-0 grid-rows-3 divide-y divide-border-default"
                >
                  {group.map(([label, value, icon]) => (
                    <div
                      key={label}
                      className="flex min-w-0 flex-col justify-center gap-1 py-3 md:flex-row md:items-center md:justify-between md:gap-3"
                    >
                      <dt className="flex min-w-0 items-center gap-2 text-sm wrap-anywhere text-text-secondary">
                        <Icon
                          name={icon}
                          size={16}
                          className="shrink-0 text-brand-primary"
                        />
                        {label === 'Reputação' ? (
                          <Link
                            to="/perfil/reputacao"
                            className={`${profileTextLink} underline`}
                          >
                            {label}
                          </Link>
                        ) : (
                          label
                        )}
                      </dt>
                      <dd className="font-semibold wrap-anywhere text-brand-primary">
                        {typeof value === 'number'
                          ? value.toLocaleString('pt-BR')
                          : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ))}
            </div>
          </Card>
        )}
      </section>
      {overview}
      {collection}
      <Card className={`${profilePanel} p-4 sm:p-5`}>
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
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabela de atividades recentes"
              className={`${focusRing} mx-auto mt-4 w-full max-w-5xl overflow-x-auto rounded-surface border border-border-default`}
            >
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
                      <td className="px-3 py-3 align-middle">
                        <p className="font-semibold wrap-anywhere text-neutral-900">
                          {item.description}
                        </p>
                        <time
                          className="mt-1 block text-xs text-neutral-500"
                          dateTime={item.occurredAt}
                        >
                          {new Date(item.occurredAt).toLocaleString('pt-BR')}
                        </time>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <Badge
                          variant={statusVariants[item.status] ?? 'neutral'}
                        >
                          {statuses[item.status] ?? 'Atualização registrada'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 align-middle">
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
