import { useCallback, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { AdminActionList } from '@/components/admin/AdminActionList'
import { GAME_LABEL } from '@/components/admin/adminFormat'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
  hour: '2-digit',
  minute: '2-digit',
})
const shortDateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
})
const MARKETPLACE_EMPTY = 'Disponível quando o marketplace estiver ativo.'
const GAMES: CardGame[] = ['POKEMON', 'MAGIC_THE_GATHERING', 'YUGIOH']
const GAME_COLOR: Record<CardGame, string> = {
  POKEMON: '#63008B',
  MAGIC_THE_GATHERING: '#DDA31D',
  YUGIOH: '#A865EC',
}
const SERIES = [
  {
    key: 'newUsers',
    label: 'Usuários novos',
    stroke: '#63218D',
    top: '#B66AE6',
    symbol: '●',
  },
  {
    key: 'createdAds',
    label: 'Anúncios criados',
    stroke: '#9B4CCB',
    top: '#D5A5EF',
    symbol: '■',
  },
  {
    key: 'completedSales',
    label: 'Vendas realizadas',
    stroke: '#BA8013',
    top: '#F5CE65',
    symbol: '▲',
  },
] as const

const FRAME_CUT =
  'polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0 calc(100% - 13px), 0 13px)'

// Os dados continuam vindo dos mesmos serviços e endpoints do dashboard original.
export function AdminOverviewPage() {
  return (
    <div className="space-y-4 pb-6">
      <SummaryIndicators />

      {/* Primeira linha de painéis: igual à composição da referência. */}
      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <DistributionPanel />
        <RecentAds />
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
        <ActivityPanel />
        <RecentUsers />
      </div>

      {/* Preservados abaixo da área principal: nada é descartado. */}
      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <RecentEvents />
        <QuickActions />
      </div>
    </div>
  )
}

function Panel({
  title,
  icon,
  action,
  children,
  className = '',
}: {
  title: string
  icon: IconName
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative min-w-0 overflow-hidden bg-[linear-gradient(135deg,#663080_0%,#B688C9_48%,#693280_100%)] p-px shadow-[0_6px_18px_rgba(67,19,89,0.10)] ${className}`}
      style={{ clipPath: FRAME_CUT }}
    >
      <div
        className="relative flex h-full min-w-0 flex-col bg-[linear-gradient(132deg,#FFFDFF_15%,#F8F1FF_100%)]"
        style={{ clipPath: FRAME_CUT }}
      >
        <div className="flex min-h-[47px] flex-wrap items-center justify-between gap-2 border-b border-[#D8B9E6] bg-[linear-gradient(90deg,#F8EFFD_0%,#F7ECFE_65%,#F6EAFE_100%)] px-4 py-2 sm:px-5">
          <h2 className="flex min-w-0 items-center gap-2.5 font-display text-[13px] font-extrabold uppercase tracking-[0.015em] text-[#2E123D] sm:text-[15px]">
            <Icon name={icon} size={24} className="text-[#55217D]" />
            {title}
          </h2>
          {action}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[17px] w-6 bg-[linear-gradient(130deg,#FFF2B4_0%,#F6BD28_45%,#A66A02_65%,#FFE891_100%)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        />
      </div>
    </section>
  )
}

function BlockLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 p-5">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="h-6 w-1/2 animate-pulse rounded-md bg-[#F0E8F3]"
      />
      <div
        aria-hidden="true"
        className="h-20 w-full animate-pulse rounded-md bg-neutral-100"
      />
      <div
        aria-hidden="true"
        className="h-6 w-3/4 animate-pulse rounded-md bg-neutral-100"
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
    <div className="px-5 py-8 text-center text-sm text-neutral-700">
      <Icon name="info" size={24} className="mx-auto mb-2 text-[#825390]" />
      {children}
    </div>
  )
}

function SummaryIndicators() {
  const { state, retry } = useRemoteData(
    'dashboard-overview',
    fetchAdminOverview,
  )
  const gridClass =
    'grid min-w-0 gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]'

  if (state.status === 'loading') {
    return (
      <div className={gridClass}>
        {[1, 2, 3, 4].map((key) => (
          <div
            key={key}
            className="border border-[#B58ACC] bg-[#FFFCFF] shadow-[0_5px_15px_rgba(65,20,85,0.07)]"
            style={{ clipPath: FRAME_CUT }}
          >
            <BlockLoading label="Carregando indicador" />
          </div>
        ))}
      </div>
    )
  }

  if (state.status !== 'ready') {
    return (
      <div
        className="min-w-0 border border-[#A77AC1] bg-[#FFFBFF] shadow-[0_5px_15px_rgba(65,20,85,0.07)]"
        style={{ clipPath: FRAME_CUT }}
      >
        <BlockError retry={retry} />
      </div>
    )
  }

  const data: AdminDashboardOverview = state.data
  return (
    <div className={gridClass}>
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
        icon="tag"
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
    <article
      className="relative min-w-0 bg-[linear-gradient(135deg,#6C308E,#B887CD_62%,#744194)] p-px shadow-[0_5px_16px_rgba(65,20,85,0.07)]"
      style={{ clipPath: FRAME_CUT }}
    >
      <div
        className="relative flex h-full min-h-[114px] items-center gap-3 bg-[linear-gradient(125deg,#FFFCFF_12%,#F7F0FF_100%)] px-4 py-3"
        style={{ clipPath: FRAME_CUT }}
      >
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center text-[#63228C]"
        >
          <Icon name={icon} size={32} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[10px] font-extrabold uppercase leading-snug tracking-[0.025em] text-[#271232] sm:text-[11px]">
            {label}
          </h2>
          {metric?.value == null ? (
            <p className="mt-2 text-xs leading-relaxed text-[#706278]">
              {emptyMessage ?? MARKETPLACE_EMPTY}
            </p>
          ) : (
            <>
              <p
                className="mt-1 font-display text-[27px] font-extrabold leading-none tracking-tight text-[#291036] sm:text-[30px]"
                aria-label={`${numberFormat.format(metric.value)} ${label.toLowerCase()}`}
              >
                {numberFormat.format(metric.value)}
              </p>
              <p className="mt-2 text-[10px] leading-tight text-[#73647A]">
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
                    <strong>
                      {metric.monthlyChangePercent > 0
                        ? '▲ +'
                        : metric.monthlyChangePercent < 0
                          ? '▼ −'
                          : '● '}
                      {percentFormat.format(
                        Math.abs(metric.monthlyChangePercent),
                      )}
                      %
                    </strong>
                    <span className="ml-1 text-[#695875]">
                      vs. mês anterior
                    </span>
                  </span>
                )}
              </p>
              {note && metric.monthlyChangePercent == null ? (
                <p className="mt-1 text-[10px] leading-snug text-[#8C7991]">
                  {note}
                </p>
              ) : null}
            </>
          )}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[14px] w-5 bg-[linear-gradient(120deg,#FFF4BA,#EAB220_60%,#A77705)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        />
      </div>
    </article>
  )
}

function ActivityPanel() {
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const fetcher = useCallback(() => fetchAdminActivity(days), [days])
  const { state, retry } = useRemoteData(`dashboard-activity-${days}`, fetcher)

  return (
    <Panel
      title="Atividade diária no Marketplace"
      icon="layers"
      action={
        <div
          role="group"
          aria-label="Período do gráfico"
          className="flex overflow-hidden border border-[#A267C0] bg-[#FCF6FF]"
        >
          {([7, 30, 90] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => setDays(value)}
              className={`px-3 py-2 text-xs font-semibold transition focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary-500 ${days === value ? 'bg-[#7024A0] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]' : 'bg-[#F8EAFF] text-[#4D2864] hover:bg-[#EAD0FB]'}`}
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
    (series) =>
      series.key === 'newUsers' ||
      (series.key === 'createdAds' ? data.hasAdSeries : data.hasSaleSeries),
  )

  if (!daily.length)
    return <Empty>Não há atividade registrada neste período.</Empty>

  const maxValue = Math.max(
    1,
    ...daily.flatMap((day) => visible.map((series) => day[series.key] ?? 0)),
  )
  // A série de 90 dias pode rolar horizontalmente; as barras não ficam ilegíveis.
  const width = Math.max(
    740,
    daily.length * (visible.length >= 3 ? 19 : 16) + 80,
  )
  const height = 260
  const top = 20
  const bottom = 38
  const left = 42
  const right = 14
  const plotHeight = height - top - bottom
  const plotWidth = width - left - right
  const slotWidth = plotWidth / daily.length
  const groupWidth = Math.min(slotWidth * 0.78, 32)
  const barWidth = Math.max(2, groupWidth / visible.length - 1.5)
  const xCenter = (index: number) => left + slotWidth * (index + 0.5)
  const y = (value: number) => top + (1 - value / maxValue) * plotHeight
  const labelDate = (value: string) =>
    shortDateFormat.format(new Date(`${value}T12:00:00`))
  const indices = daily
    .map((_, index) => index)
    .filter(
      (index) =>
        index === 0 ||
        index === daily.length - 1 ||
        index % Math.max(1, Math.ceil(daily.length / 7)) === 0,
    )

  return (
    <div className="px-3 pb-4 pt-3 sm:px-5">
      <ul
        className="mb-3 flex flex-wrap gap-x-5 gap-y-2"
        aria-label="Séries do gráfico"
      >
        {visible.map((series) => (
          <li
            key={series.key}
            className="flex items-center gap-2 text-xs font-semibold text-[#5B466D]"
          >
            <span
              aria-hidden="true"
              className="font-extrabold"
              style={{ color: series.stroke }}
            >
              {series.symbol}
            </span>
            {series.label}
          </li>
        ))}
      </ul>
      <div className="max-w-full overflow-x-auto">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${width} ${height}`}
          style={{ minWidth: width > 740 ? `${width}px` : undefined }}
          className="h-auto w-full"
          focusable="false"
        >
          <defs>
            {visible.map((series) => (
              <linearGradient
                key={series.key}
                id={`admin-bar-${series.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={series.top} />
                <stop offset="100%" stopColor={series.stroke} />
              </linearGradient>
            ))}
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y(fraction * maxValue)}
                y2={y(fraction * maxValue)}
                stroke="#D9C5E8"
                strokeDasharray="4 3"
              />
              <text
                x={left - 9}
                y={y(fraction * maxValue) + 4}
                textAnchor="end"
                fill="#654B75"
                fontSize="11"
              >
                {Math.round(fraction * maxValue)}
              </text>
            </g>
          ))}
          {daily.map((day, dayIndex) =>
            visible.map((series, seriesIndex) => {
              const value = day[series.key] ?? 0
              const barHeight = value > 0 ? height - bottom - y(value) : 0
              const barX =
                xCenter(dayIndex) -
                groupWidth / 2 +
                seriesIndex * (barWidth + 1.5)
              return (
                <rect
                  key={`${day.date}-${series.key}`}
                  x={barX}
                  y={y(value)}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#admin-bar-${series.key})`}
                >
                  <title>{`${labelDate(day.date)} · ${series.label}: ${numberFormat.format(value)}`}</title>
                </rect>
              )
            }),
          )}
          {indices.map((index) => (
            <text
              key={index}
              x={xCenter(index)}
              y={height - 13}
              textAnchor="middle"
              fill="#594167"
              fontSize="11"
            >
              {labelDate(daily[index].date)}
            </text>
          ))}
        </svg>
      </div>
      <p className="mt-1 text-xs text-[#776784]">
        Quantidade por dia · horário de Brasília. Séries diferenciadas por cor e
        símbolo.
      </p>
      <details className="mt-3 border border-[#DAC9E7] bg-white/55 px-3 py-2 text-sm">
        <summary className="cursor-pointer font-semibold text-[#60277C] focus-visible:outline-2 focus-visible:outline-[#BC8ED5]">
          Consultar dados em tabela
        </summary>
        <div className="mt-3 max-h-60 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[340px] border-collapse text-left text-xs">
            <caption className="sr-only">
              Atividade diária dos últimos {data.days} dias
            </caption>
            <thead>
              <tr className="border-b border-[#DCCBE7]">
                <th scope="col" className="p-2">
                  Data
                </th>
                {visible.map((series) => (
                  <th key={series.key} scope="col" className="p-2 text-right">
                    {series.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date} className="border-b border-[#EAE0EF]">
                  <th scope="row" className="p-2 font-medium">
                    {labelDate(day.date)}
                  </th>
                  {visible.map((series) => (
                    <td
                      key={series.key}
                      className="p-2 text-right tabular-nums"
                    >
                      {numberFormat.format(day[series.key] ?? 0)}
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
  // Requisição independente: uma falha aqui não afeta os demais painéis.
  const { state, retry } = useRemoteData(
    'dashboard-catalog-distribution',
    fetchAdminCatalogSummary,
  )
  return (
    <Panel
      title="Distribuição do catálogo"
      icon="layers"
      action={
        <Link
          to="/admin/catalogo"
          className="text-xs font-semibold text-[#64168D] underline underline-offset-2 hover:text-[#8C35B5] focus-visible:outline-2 focus-visible:outline-[#D09B38]"
        >
          Gerenciar catálogo ›
        </Link>
      }
    >
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
  const total = games.reduce((sum, item) => sum + item.amount, 0)
  if (!total) return <Empty>Nenhuma carta importada ainda.</Empty>

  let cumulativeCards = 0
  const stops: string[] = []
  const labels = []

  // Segmentos pequenos mantêm a proporção e aparecem na tabela.
  for (const item of games) {
    const begin = cumulativeCards / total
    const fraction = item.amount / total
    cumulativeCards += item.amount
    const end = cumulativeCards / total
    const radians = (begin + fraction / 2) * 2 * Math.PI

    stops.push(`${GAME_COLOR[item.game]} ${begin * 100}% ${end * 100}%`)
    labels.push({
      ...item,
      fraction,
      x: 50 + 34 * Math.sin(radians),
      y: 50 - 34 * Math.cos(radians),
    })
  }

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-6 px-4 py-5 sm:px-6 2xl:flex-row 2xl:gap-7">
      <div className="relative grid size-52 shrink-0 place-items-center sm:size-56">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full shadow-[0_3px_8px_rgba(61,18,90,0.1)]"
          style={{ background: `conic-gradient(${stops.join(', ')})` }}
        />
        <div className="relative z-10 grid size-28 place-content-center rounded-full bg-[radial-gradient(circle_at_50%_45%,#FFF_20%,#F9F2FF_100%)] text-center shadow-[0_0_0_1px_rgba(96,44,124,0.1)] sm:size-32">
          <strong className="font-display text-[27px] font-extrabold leading-none text-[#281132]">
            {numberFormat.format(total)}
          </strong>
          <span className="mt-1 text-sm text-[#321B40]">cartas</span>
        </div>
        {labels
          .filter((item) => item.fraction >= 0.08)
          .map((item) => (
            <span
              key={item.game}
              aria-hidden="true"
              className="pointer-events-none absolute z-10 text-sm font-extrabold text-white drop-shadow-[0_1px_2px_rgba(33,8,47,0.55)]"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {percentFormat.format(item.fraction * 100)}%
            </span>
          ))}
      </div>
      <ul className="w-full min-w-0 divide-y divide-[#DCC4EA] 2xl:border-l 2xl:border-[#C9A9D6] 2xl:pl-6">
        {games.map((item) => (
          <li key={item.game} className="flex items-center gap-4 py-3">
            <span
              aria-hidden="true"
              className="size-5 shrink-0 rounded-[4px]"
              style={{ backgroundColor: GAME_COLOR[item.game] }}
            />
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold text-[#26132F]">
                {GAME_LABEL[item.game]}
              </p>
              <p className="mt-0.5 text-sm text-[#42304C] tabular-nums">
                {numberFormat.format(item.amount)} cartas (
                {percentFormat.format((100 * item.amount) / total)}%)
              </p>
            </div>
          </li>
        ))}
      </ul>
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
    <Panel title="Ações rápidas" icon="sparkle">
      <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-[68px] items-center gap-3 border border-[#C7A6D7] bg-white/75 px-3 text-left text-xs font-bold text-[#4C1A6C] transition-colors hover:border-[#904CB4] hover:bg-[#F0DDF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D09B38]"
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
            className="flex min-h-[68px] items-center gap-2 border border-[#E3D6E8] bg-[#FAF6FC] px-3 text-left text-xs text-[#87758E]"
          >
            <Icon name={item.icon} size={20} />
            <span className="flex flex-col items-start gap-1">
              {item.label}
              <Badge variant="neutral">Em breve</Badge>
            </span>
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
      title="Usuários recentes"
      icon="user"
      action={
        <Link
          to="/admin/usuarios"
          className="text-xs font-bold text-[#65178E] underline underline-offset-2 hover:text-[#9743B8] focus-visible:outline-2 focus-visible:outline-[#D09B38]"
        >
          Gerenciar usuários ›
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
    <div className="overflow-x-auto px-3 py-3 sm:px-4">
      <table className="w-full min-w-[315px] text-left text-xs">
        <caption className="sr-only">Cinco cadastros mais recentes</caption>
        <thead>
          <tr className="border-b border-[#D7B8E6] text-[10px] uppercase text-[#3C1A53]">
            <th scope="col" className="px-2 py-2 font-bold">
              Usuário
            </th>
            <th scope="col" className="px-2 py-2 font-bold">
              Cadastro
            </th>
            <th scope="col" className="px-2 py-2 text-center font-bold">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[#E8D8F0] even:bg-[#EFE1F8]/60 hover:bg-[#ECD5F9]"
            >
              <td className="px-2 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#B660DE,#7130A2)] text-white"
                  >
                    <Icon name="user" size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-[#281432]">
                      {user.name}
                    </span>
                    <span className="block truncate text-[10px] text-[#6F5B78]">
                      {user.username ? `@${user.username}` : 'Sem usuário'}
                    </span>
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 text-[#3F2F46]">
                {user.registrationDate
                  ? dateFormat.format(new Date(user.registrationDate))
                  : '—'}
              </td>
              <td className="px-2 py-2.5 text-center">
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
      title="Anúncios recentes"
      icon="storefront"
      action={
        <Link
          to="/marketplace"
          search={{ sort: 'recent' }}
          className="text-xs font-bold text-[#65178E] underline underline-offset-2 hover:text-[#9743B8] focus-visible:outline-2 focus-visible:outline-[#D09B38]"
        >
          Ver marketplace ›
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
    <div className="overflow-x-auto px-3 py-3 sm:px-4">
      <table className="w-full min-w-[510px] text-left text-xs">
        <caption className="sr-only">Cinco anúncios mais recentes</caption>
        <thead>
          <tr className="border-b border-[#D7B8E6] text-[10px] uppercase text-[#3C1A53]">
            <th scope="col" className="px-2 py-2 font-bold">
              Carta
            </th>
            <th scope="col" className="px-2 py-2 font-bold">
              Jogo
            </th>
            <th scope="col" className="px-2 py-2 font-bold">
              Modalidade
            </th>
            <th scope="col" className="px-2 py-2 font-bold">
              Preço
            </th>
            <th scope="col" className="px-2 py-2 font-bold">
              Publicação
            </th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => {
            const modality = ad.tradeOnly
              ? ad.unitPrice == null
                ? 'Troca'
                : 'Venda / troca'
              : ad.unitPrice == null
                ? 'Não informado'
                : 'Venda'
            return (
              <tr
                key={ad.id}
                className="border-b border-[#E8D8F0] even:bg-[#EFE1F8]/60 hover:bg-[#ECD5F9]"
              >
                <td className="px-2 py-2.5">
                  <span className="block font-bold text-[#281432]">
                    {ad.cardName}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#685373]">
                    {ad.status === 'ACTIVE'
                      ? 'Ativo'
                      : ad.status === 'CANCELLED'
                        ? 'Cancelado'
                        : 'Esgotado'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-[#41234F]">
                  {ad.game ? GAME_LABEL[ad.game] : '—'}
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold ${modality === 'Troca' ? 'bg-[#F9E7B9] text-[#744D0E]' : 'bg-[#E4C7F5] text-[#5C1E7A]'}`}
                  >
                    {modality}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-[#41234F] tabular-nums">
                  {ad.unitPrice == null
                    ? '—'
                    : currencyFormat.format(ad.unitPrice)}
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-[#41234F]">
                  {ad.createdAt
                    ? dateFormat.format(new Date(ad.createdAt))
                    : '—'}
                </td>
              </tr>
            )
          })}
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
      icon="clock"
      action={
        <Link
          to="/admin/usuarios"
          className="text-xs font-bold text-[#65178E] underline underline-offset-2 hover:text-[#9743B8] focus-visible:outline-2 focus-visible:outline-[#D09B38]"
        >
          Ver usuários ›
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
    <div className="px-4 py-1">
      <AdminActionList
        label="Últimas atividades administrativas"
        actions={events}
        showTarget
      />
    </div>
  )
}
