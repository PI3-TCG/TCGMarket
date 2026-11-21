import { useCallback, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { AdminActionList } from '@/components/admin/AdminActionList'
import { GAME_LABEL } from '@/components/admin/adminFormat'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  fetchAdminActivity,
  fetchAdminCatalogSummary,
  fetchAdminOverview,
  fetchAdminRecentAds,
  fetchAdminRecentUsers,
  fetchRecentAdminActions,
} from '@/services/adminApi'
import type { AdminCatalogSummary, CardGame } from '@/types/AdminCatalog'
import type {
  AdminDashboardActivity,
  AdminDashboardMetric,
  AdminDashboardOverview,
  AdminDashboardRecentAd,
  AdminDashboardRecentUser,
} from '@/types/AdminDashboard'
import type { AdminAction } from '@/types/AdminUser'

const numberFormat = new Intl.NumberFormat('pt-BR')
const percentFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})
const currencyFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const shortDateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
})
const MARKETPLACE_EMPTY = 'Disponível quando o marketplace estiver ativo.'
const GAMES: CardGame[] = ['POKEMON', 'MAGIC_THE_GATHERING', 'YUGIOH']
const SERIES = [
  {
    key: 'newUsers',
    label: 'Usuários novos',
    stroke: '#660366',
    dash: undefined,
    symbol: '●',
  },
  {
    key: 'createdAds',
    label: 'Anúncios criados',
    stroke: '#996699',
    dash: '8 4',
    symbol: '■',
  },
  {
    key: 'completedSales',
    label: 'Vendas realizadas',
    stroke: '#BE7D15',
    dash: '2 5',
    symbol: '▲',
  },
] as const
const GAME_COLOR: Record<CardGame, string> = {
  POKEMON: '#660366',
  MAGIC_THE_GATHERING: '#996699',
  YUGIOH: '#C8A2C8',
}

export function AdminOverviewPage() {
  return (
    <div className="space-y-4 pb-6">
      <SummaryIndicators />
      {/*
        O menu lateral reduz a largura UTIL da dashboard. Os painéis se organizam
        conforme essa largura, não pelos breakpoints da janela do navegador.
      */}
      <div
        className="grid min-w-0 items-start gap-4"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 530px), 1fr))',
        }}
      >
        <ActivityPanel />
        <div
          className="grid min-w-0 items-start gap-4"
          style={{
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 255px), 1fr))',
          }}
        >
          <DistributionPanel />
          <QuickActions />
        </div>
      </div>
      <div
        className="grid min-w-0 items-stretch gap-4"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        }}
      >
        <RecentUsers />
        <RecentAds />
        <RecentEvents />
      </div>
    </div>
  )
}

function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 sm:px-5">
        <h2 className="font-display text-base font-bold text-neutral-900">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  )
}

function BlockLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 p-5">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="h-6 w-1/2 animate-pulse rounded-lg bg-primary-100"
      />
      <div
        aria-hidden="true"
        className="h-20 w-full animate-pulse rounded-lg bg-neutral-100"
      />
      <div
        aria-hidden="true"
        className="h-6 w-3/4 animate-pulse rounded-lg bg-neutral-100"
      />
    </div>
  )
}

function BlockError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="space-y-3 p-5 text-sm">
      <p className="flex items-center gap-2 text-error-700">
        <Icon name="alert" size={20} /> Não foi possível carregar este bloco.
      </p>
      <Button variant="outline" onClick={retry}>
        Tentar novamente
      </Button>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-7 text-center text-sm text-neutral-700">
      <Icon name="info" size={24} className="mx-auto mb-2 text-primary-700" />
      {children}
    </div>
  )
}

function SummaryIndicators() {
  const { state, retry } = useRemoteData(
    'dashboard-overview',
    fetchAdminOverview,
  )
  if (state.status === 'loading') {
    return (
      <div
        className="grid min-w-0 gap-3"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        }}
      >
        {[1, 2, 3, 4].map((n) => (
          <Card key={n}>
            <BlockLoading label="Carregando indicador" />
          </Card>
        ))}
      </div>
    )
  }
  if (state.status !== 'ready') {
    return (
      <Card>
        <BlockError retry={retry} />
      </Card>
    )
  }
  const data: AdminDashboardOverview = state.data
  return (
    <div
      className="grid min-w-0 gap-3"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
      }}
    >
      <MetricCard
        label="Usuários cadastrados"
        icon="user"
        metric={data.registeredUsers}
      />
      <MetricCard
        label="Cartas no catálogo"
        icon="cards"
        metric={data.catalogCards}
        note="Histórico mensal de importação indisponível"
      />
      <MetricCard
        label="Anúncios ativos"
        icon="storefront"
        metric={data.activeAds}
        note="Sem histórico mensal de anúncios ativos"
      />
      <MetricCard
        label="Vendas realizadas"
        icon="cart"
        metric={data.completedSales}
        emptyMessage={
          data.activeAds != null ? 'Nenhuma venda concluída ainda.' : undefined
        }
      />
    </div>
  )
}

function MetricCard({
  label,
  icon,
  metric,
  note,
  emptyMessage,
}: {
  label: string
  icon: IconName
  metric: AdminDashboardMetric | null
  note?: string
  emptyMessage?: string
}) {
  return (
    <Card className="min-w-0 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-900"
        >
          <Icon name={icon} size={24} />
        </span>
        <h2 className="min-w-0 text-xs font-semibold leading-snug text-neutral-700">
          {label}
        </h2>
      </div>
      {metric?.value == null ? (
        <p className="mt-3 text-xs leading-relaxed text-neutral-700">
          {emptyMessage ?? MARKETPLACE_EMPTY}
        </p>
      ) : (
        <div className="mt-3 min-w-0">
          <p
            className="font-display text-2xl font-bold leading-tight text-neutral-900"
            aria-label={`${numberFormat.format(metric.value)} ${label.toLowerCase()}`}
          >
            {numberFormat.format(metric.value)}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">
            {metric.monthlyChangePercent == null ? (
              <span title={note || 'Sem base comparável no mês anterior'}>
                Variação mensal: <strong>—</strong>
              </span>
            ) : (
              <span
                className={
                  metric.monthlyChangePercent >= 0
                    ? 'text-success-700'
                    : 'text-error-700'
                }
              >
                {metric.monthlyChangePercent > 0
                  ? '↑ Alta'
                  : metric.monthlyChangePercent < 0
                    ? '↓ Queda'
                    : 'Sem variação'}{' '}
                {percentFormat.format(Math.abs(metric.monthlyChangePercent))}%
                <span className="text-neutral-600"> ante o mês anterior</span>
              </span>
            )}
          </p>
          {note && metric.monthlyChangePercent == null ? (
            <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">
              {note}
            </p>
          ) : null}
        </div>
      )}
    </Card>
  )
}

function ActivityPanel() {
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const fetcher = useCallback(() => fetchAdminActivity(days), [days])
  const { state, retry } = useRemoteData(`dashboard-activity-${days}`, fetcher)
  return (
    <Panel
      title="Visão geral de atividade"
      action={
        <div
          aria-label="Período do gráfico"
          role="group"
          className="flex overflow-hidden rounded-lg border border-neutral-300"
        >
          {([7, 30, 90] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => setDays(value)}
              className={`px-3 py-2 text-xs font-semibold transition focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary-500 ${days === value ? 'bg-primary-900 button-vignette text-white' : 'bg-white text-neutral-700 hover:bg-primary-100'}`}
            >
              {value} dias
            </button>
          ))}
        </div>
      }
    >
      {state.status === 'loading' ? (
        <BlockLoading label="Carregando gráfico de atividade" />
      ) : state.status !== 'ready' ? (
        <BlockError retry={retry} />
      ) : (
        <ActivityChart data={state.data} />
      )}
    </Panel>
  )
}

function ActivityChart({ data }: { data: AdminDashboardActivity }) {
  const daily = data.daily
  const visible = SERIES.filter(
    (s) =>
      s.key === 'newUsers' ||
      (s.key === 'createdAds' ? data.hasAdSeries : data.hasSaleSeries),
  )
  const maxValue = Math.max(
    1,
    ...daily.flatMap((day) => visible.map((s) => day[s.key] ?? 0)),
  )
  const width = 640,
    height = 250,
    top = 18,
    bottom = 34,
    left = 37,
    right = 12
  const plotHeight = height - top - bottom,
    plotWidth = width - left - right
  const x = (i: number) =>
    left + (daily.length <= 1 ? 0 : (i * plotWidth) / (daily.length - 1))
  const y = (value: number) => top + (1 - value / maxValue) * plotHeight
  const points = (key: (typeof SERIES)[number]['key']) =>
    daily
      .map((day, i) => `${x(i).toFixed(1)},${y(day[key] ?? 0).toFixed(1)}`)
      .join(' ')
  const indices = daily
    .map((_, i) => i)
    .filter(
      (i) =>
        i === 0 ||
        i === daily.length - 1 ||
        i % Math.max(1, Math.ceil(daily.length / 5)) === 0,
    )
  const labelDate = (value: string) =>
    shortDateFormat.format(new Date(`${value}T12:00:00`))
  return (
    <div className="p-4 sm:p-5">
      <ul
        className="mb-3 flex flex-wrap gap-x-4 gap-y-2"
        aria-label="Séries do gráfico"
      >
        {visible.map((s) => (
          <li
            key={s.key}
            className="flex items-center gap-2 text-xs text-neutral-700"
          >
            <span aria-hidden style={{ color: s.stroke }} className="font-bold">
              {s.symbol}
            </span>
            {s.label}
          </li>
        ))}
      </ul>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        focusable="false"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const value = Math.round(fraction * maxValue)
          return (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y(fraction * maxValue)}
                y2={y(fraction * maxValue)}
                stroke="#E8E1EC"
              />
              <text
                x={left - 7}
                y={y(fraction * maxValue) + 4}
                textAnchor="end"
                fill="#62586D"
                fontSize="11"
              >
                {value}
              </text>
            </g>
          )
        })}
        {visible.map((s) => (
          <polyline
            key={s.key}
            points={points(s.key)}
            fill="none"
            stroke={s.stroke}
            strokeWidth="2.5"
            strokeDasharray={s.dash}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {indices.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 10}
            textAnchor="middle"
            fill="#62586D"
            fontSize="11"
          >
            {labelDate(daily[i].date)}
          </text>
        ))}
      </svg>
      <p className="mt-1 text-xs text-neutral-600">
        Valores por dia · fuso horário de Brasília. Linhas diferenciadas por cor
        e traçado.
      </p>
      <details className="mt-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
        <summary className="cursor-pointer font-semibold text-primary-900 focus-visible:outline-2 focus-visible:outline-secondary-500">
          Consultar dados em tabela
        </summary>
        <div className="mt-3 max-h-60 overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse text-left text-xs">
            <caption className="sr-only">
              Atividade diária dos últimos {data.days} dias
            </caption>
            <thead>
              <tr className="border-b border-neutral-200">
                <th scope="col" className="p-2">
                  Data
                </th>
                {visible.map((s) => (
                  <th key={s.key} scope="col" className="p-2 text-right">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date} className="border-b border-neutral-100">
                  <th scope="row" className="p-2 font-medium">
                    {labelDate(day.date)}
                  </th>
                  {visible.map((s) => (
                    <td key={s.key} className="p-2 text-right tabular-nums">
                      {numberFormat.format(day[s.key] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

function DistributionPanel() {
  // Requisição própria: erro no resumo geral não derruba este gráfico.
  const { state, retry } = useRemoteData(
    'dashboard-catalog-distribution',
    fetchAdminCatalogSummary,
  )
  return (
    <Panel title="Distribuição de TCGs">
      {state.status === 'loading' ? (
        <BlockLoading label="Carregando distribuição" />
      ) : state.status !== 'ready' ? (
        <BlockError retry={retry} />
      ) : (
        <Distribution data={state.data} />
      )}
    </Panel>
  )
}

function Distribution({ data }: { data: AdminCatalogSummary }) {
  const games = GAMES.map((game) => ({
    game,
    amount: data.games.find((item) => item.game === game)?.totalCards ?? 0,
  }))
  const total = games.reduce((count, item) => count + item.amount, 0)
  if (!total) return <Empty>Nenhuma carta importada ainda.</Empty>
  const stops: string[] = []
  let offset = 0
  for (const item of games) {
    const end = offset + (item.amount / total) * 100
    stops.push(`${GAME_COLOR[item.game]} ${offset}% ${end}%`)
    offset = end
  }
  return (
    <div className="flex min-w-0 flex-col items-center gap-5 p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="grid size-36 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="grid size-22 place-content-center rounded-full bg-white text-center shadow-sm">
          <strong className="font-display text-xl text-neutral-900">
            {numberFormat.format(total)}
          </strong>
          <span className="text-xs text-neutral-600">cartas</span>
        </div>
      </div>
      <table className="w-full table-fixed text-left text-xs">
        <caption className="sr-only">
          Distribuição de cartas do catálogo por TCG, incluindo totais e
          porcentagens
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Jogo</th>
            <th scope="col">Cartas</th>
            <th scope="col">Percentual</th>
          </tr>
        </thead>
        <tbody>
          {games.map((item) => (
            <tr key={item.game}>
              <th
                scope="row"
                className="w-[44%] py-2 pr-1 font-semibold text-neutral-900"
              >
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block size-3 rounded-sm"
                  style={{ backgroundColor: GAME_COLOR[item.game] }}
                />
                {GAME_LABEL[item.game]}
              </th>
              <td className="w-[30%] px-1 py-2 text-right text-neutral-700 tabular-nums">
                {numberFormat.format(item.amount)}
              </td>
              <td className="w-[26%] py-2 text-right font-semibold text-primary-900 tabular-nums">
                {percentFormat.format((100 * item.amount) / total)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuickActions() {
  const links: {
    to: '/admin/usuarios' | '/admin/catalogo'
    label: string
    icon: IconName
  }[] = [
    { to: '/admin/usuarios', label: 'Gerenciar usuários', icon: 'user' },
    { to: '/admin/catalogo', label: 'Consultar catálogo', icon: 'cards' },
  ]
  return (
    <Panel title="Ações rápidas" className="min-w-0">
      <div className="grid grid-cols-2 gap-2 p-4">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-26 flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-center text-xs font-semibold text-primary-900 transition hover:border-primary-700 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            <Icon name={item.icon} size={24} />
            {item.label}
          </Link>
        ))}
        {[
          { label: 'Gerenciar anúncios', icon: 'storefront' as IconName },
          { label: 'Ver relatórios', icon: 'receipt' as IconName },
        ].map((item) => (
          <div
            key={item.label}
            aria-disabled="true"
            className="flex min-h-26 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center text-xs text-neutral-500"
          >
            <Icon name={item.icon} size={24} />
            {item.label}
            <Badge variant="neutral">Em breve</Badge>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function RecentUsers() {
  const { state, retry } = useRemoteData(
    'dashboard-recent-users',
    fetchAdminRecentUsers,
  )
  return (
    <Panel
      title="Últimos usuários cadastrados"
      action={
        <Link
          to="/admin/usuarios"
          className="text-xs font-semibold text-primary-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          Ver todos
        </Link>
      }
    >
      {state.status === 'loading' ? (
        <BlockLoading label="Carregando últimos usuários" />
      ) : state.status !== 'ready' ? (
        <BlockError retry={retry} />
      ) : (
        <RecentUsersTable users={state.data} />
      )}
    </Panel>
  )
}

function RecentUsersTable({ users }: { users: AdminDashboardRecentUser[] }) {
  if (!users.length) return <Empty>Nenhum usuário cadastrado ainda.</Empty>
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full min-w-[330px] text-left text-xs">
        <caption className="sr-only">Cinco cadastros mais recentes</caption>
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-600">
            <th scope="col" className="px-2 py-2 font-semibold">
              Usuário
            </th>
            <th scope="col" className="px-2 py-2">
              Cadastro
            </th>
            <th scope="col" className="px-2 py-2">
              Situação
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-neutral-100">
              <td className="px-2 py-3">
                <span className="block font-semibold text-neutral-900">
                  {user.name}
                </span>
                <span className="text-neutral-600">
                  {user.username ? `@${user.username}` : 'Sem usuário'}
                </span>
              </td>
              <td className="px-2 py-3">
                {user.registrationDate
                  ? dateFormat.format(new Date(user.registrationDate))
                  : '—'}
              </td>
              <td className="px-2 py-3">
                <Badge
                  variant={user.status === 'SUSPENDED' ? 'error' : 'success'}
                >
                  {user.status === 'SUSPENDED' ? 'Suspensa' : 'Ativa'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentAds() {
  const { state, retry } = useRemoteData(
    'dashboard-recent-ads',
    fetchAdminRecentAds,
  )
  return (
    <Panel
      title="Anúncios mais recentes"
      action={
        <Link
          to="/marketplace"
          search={{ sort: 'recent' }}
          className="text-xs font-semibold text-primary-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          Ver marketplace
        </Link>
      }
    >
      {state.status === 'loading' ? (
        <BlockLoading label="Carregando anúncios recentes" />
      ) : state.status !== 'ready' ? (
        <BlockError retry={retry} />
      ) : (
        <RecentAdsTable ads={state.data} />
      )}
    </Panel>
  )
}

function RecentAdsTable({ ads }: { ads: AdminDashboardRecentAd[] }) {
  if (!ads.length) return <Empty>{MARKETPLACE_EMPTY}</Empty>
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full min-w-[310px] text-left text-xs">
        <caption className="sr-only">Cinco anúncios mais recentes</caption>
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-600">
            <th scope="col" className="px-2 py-2">
              Carta
            </th>
            <th scope="col" className="px-2 py-2">
              Preço
            </th>
            <th scope="col" className="px-2 py-2">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id} className="border-b border-neutral-100">
              <td className="px-2 py-3">
                <span className="block font-semibold text-neutral-900">
                  {ad.cardName}
                </span>
                <span className="text-neutral-600">
                  {ad.game ? GAME_LABEL[ad.game] : 'TCG não disponível'}
                </span>
              </td>
              <td className="px-2 py-3 whitespace-nowrap">
                {ad.unitPrice == null
                  ? ad.tradeOnly
                    ? 'Somente troca'
                    : '—'
                  : currencyFormat.format(ad.unitPrice)}
              </td>
              <td className="px-2 py-3">
                <Badge variant={ad.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {ad.status === 'ACTIVE'
                    ? 'Ativo'
                    : ad.status === 'CANCELLED'
                      ? 'Cancelado'
                      : 'Esgotado'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentEvents() {
  const { state, retry } = useRemoteData(
    'dashboard-recent-events',
    fetchRecentAdminActions,
  )
  return (
    <Panel
      title="Últimas atividades"
      action={
        <Link
          to="/admin/usuarios"
          className="text-xs font-semibold text-primary-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          Ver usuários
        </Link>
      }
    >
      {state.status === 'loading' ? (
        <BlockLoading label="Carregando últimas atividades" />
      ) : state.status !== 'ready' ? (
        <BlockError retry={retry} />
      ) : (
        <EventsList events={state.data} />
      )}
    </Panel>
  )
}

function EventsList({ events }: { events: AdminAction[] }) {
  if (!events.length)
    return <Empty>Nenhuma ação administrativa registrada ainda.</Empty>
  return (
    <div className="px-4">
      <AdminActionList
        label="Últimas atividades administrativas"
        actions={events}
        showTarget
      />
    </div>
  )
}
