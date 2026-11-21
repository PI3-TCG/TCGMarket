import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import {
  ADMIN_GAMES,
  GAME_LABEL,
  SOURCE_LABEL,
  apiMessage,
} from '@/components/admin/adminFormat'
import {
  AdminPanel,
  AdminState,
  adminButtonClass,
  adminFilterClearClass,
  adminTableHeaderClass,
  adminTableRowClass,
} from '@/components/admin/AdminPanel'
import { typeLabels } from '@/components/catalog/catalogLabels'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select, type SelectOption } from '@/components/ui/Select'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  hideCatalogCard,
  searchAdminCatalog,
  unhideCatalogCard,
} from '@/services/adminApi'
import { fetchCatalogFilters } from '@/services/catalogApi'
import { useSession } from '@/session'
import type { AdminCatalogCard, AdminCatalogSearch } from '@/types/AdminCatalog'
import type { CatalogFilters } from '@/types/Catalog'
import { useNavigate, useSearch } from '@tanstack/react-router'
import axios from 'axios'
import { useCallback, useEffect, useId, useState } from 'react'

const REASON_MIN = 10
const REASON_MAX = 300
const ALL = ''

const VISIBILITY_OPTIONS: SelectOption[] = [
  { value: ALL, label: 'Visíveis e ocultas' },
  { value: 'visible', label: 'Somente visíveis' },
  { value: 'hidden', label: 'Somente ocultas' },
]

const GAME_OPTIONS: SelectOption[] = [
  { value: ALL, label: 'Todos os TCGs' },
  ...ADMIN_GAMES.map((item) => ({ value: item.slug, label: item.label })),
]

const numberFormat = new Intl.NumberFormat('pt-BR')

type Pending = { card: AdminCatalogCard; action: 'hide' | 'unhide' }

export function AdminCatalogPage() {
  const search = useSearch({ from: '/site-layout/admin/catalogo' })
  const navigate = useNavigate({ from: '/admin/catalogo' })
  const { refreshUser } = useSession()
  const { game, q, set, rarity, type, visibility, page } = search
  const currentPage = page ?? 1

  const [searchInput, setSearchInput] = useState(q ?? '')
  const [syncedQuery, setSyncedQuery] = useState(q)
  const [filters, setFilters] = useState<{
    game: string
    data: CatalogFilters
  } | null>(null)
  const [updated, setUpdated] = useState<Record<string, AdminCatalogCard>>({})
  const [pending, setPending] = useState<Pending | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (q !== syncedQuery) {
    setSyncedQuery(q)
    setSearchInput(q ?? '')
  }

  // Mantém a busca por URL, debounce e regras de visibilidade do arquivo original.
  const fetchPage = useCallback(
    () => searchAdminCatalog({ game, q, set, rarity, type, visibility, page }),
    [game, q, set, rarity, type, visibility, page],
  )
  const { state, retry } = useRemoteData(
    JSON.stringify([game, q, set, rarity, type, visibility, page]),
    fetchPage,
  )

  useEffect(() => {
    const next = searchInput.trim() ? searchInput : undefined
    if (next === q) return
    const timer = window.setTimeout(
      () =>
        navigate({
          search: (prev) => ({ ...prev, q: next, page: undefined }),
          replace: true,
        }),
      350,
    )
    return () => window.clearTimeout(timer)
  }, [searchInput, q, navigate])

  useEffect(() => {
    if (!game) return
    let active = true
    fetchCatalogFilters(game)
      .then((data) => {
        if (active) setFilters({ game, data })
      })
      .catch(() => {
        if (active)
          setFilters({ game, data: { sets: [], rarities: [], types: [] } })
      })
    return () => {
      active = false
    }
  }, [game])

  function updateSearch(patch: Partial<AdminCatalogSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) })
  }

  function goToPage(number: number) {
    navigate({
      search: (prev) => ({ ...prev, page: number > 1 ? number : undefined }),
    })
  }

  function open(card: AdminCatalogCard, action: Pending['action']) {
    setPending({ card, action })
    setReason('')
    setReasonError(null)
  }

  function close() {
    if (!saving) setPending(null)
  }

  async function confirm() {
    if (!pending || saving) return
    const trimmed = reason.trim()
    if (
      pending.action === 'hide' &&
      (trimmed.length < REASON_MIN || trimmed.length > REASON_MAX)
    ) {
      setReasonError(
        `O motivo deve ter entre ${REASON_MIN} e ${REASON_MAX} caracteres.`,
      )
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const card =
        pending.action === 'hide'
          ? await hideCatalogCard(pending.card.id, trimmed)
          : await unhideCatalogCard(pending.card.id)
      setUpdated((current) => ({ ...current, [card.id]: card }))
      setSuccess(
        card.hidden
          ? `${card.name} foi ocultada do catálogo público.`
          : `${card.name} voltou ao catálogo público.`,
      )
      setPending(null)
    } catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 403) {
        void refreshUser()
      }
      const message =
        apiMessage(cause) ??
        (pending.action === 'hide'
          ? 'Não foi possível ocultar a carta.'
          : 'Não foi possível reexibir a carta.')
      if (pending.action === 'hide') {
        setReasonError(message)
      } else {
        setError(message)
        setPending(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const options = filters && filters.game === game ? filters.data : null
  const data = state.status === 'ready' ? state.data : null
  const rows = data?.content.map((card) => updated[card.id] ?? card) ?? []
  const outOfRange = Boolean(
    data && data.totalElements > 0 && !data.content.length,
  )
  const hasFilters = Boolean(q || game || set || rarity || type || visibility)

  return (
    <AdminPanel
      title="Gerenciamento do catálogo"
      icon="layers"
      description="Pesquise cartas importadas e controle quais aparecem no catálogo público."
      action={
        <p className="text-xs font-semibold text-[#604473]" aria-live="polite">
          {data
            ? `${numberFormat.format(data.totalElements)} ${data.totalElements === 1 ? 'carta encontrada' : 'cartas encontradas'}`
            : null}
        </p>
      }
    >
      <div className="space-y-4 border-b border-[#E4D2EC] bg-[linear-gradient(95deg,#FCF7FF,#F8EEFC)] p-4 sm:p-5">
        <Alert variant="info">
          As cartas vêm das APIs oficiais (Pokémon TCG API, YGOPRODeck e
          Scryfall) e não são editadas aqui. Você pode ocultar uma carta com
          dado ou imagem problemáticos.
        </Alert>

        {error ? (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert variant="success" onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        ) : null}

        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#673087]">
          <Icon name="search" size={16} /> Filtros do catálogo
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="min-w-0 sm:col-span-2 xl:col-span-2">
            <label
              htmlFor="admin-catalog-search"
              className="mb-1.5 block text-xs font-bold text-[#4A2B59]"
            >
              Nome da carta
            </label>
            <Input
              id="admin-catalog-search"
              variant="search"
              type="search"
              className="w-full !border-[#D5B8E1] !bg-white focus-visible:!outline-[#8841A0]"
              aria-label="Pesquisar pelo nome da carta"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Pesquisar pelo nome da carta"
            />
          </div>
          <FilterSelect
            label="TCG"
            options={GAME_OPTIONS}
            value={game ?? ALL}
            onValueChange={(value) =>
              updateSearch({
                game: value || undefined,
                set: undefined,
                rarity: undefined,
                type: undefined,
              })
            }
          />
          <FilterSelect
            label="Coleção"
            disabled={!game}
            options={withAll(
              'Todas as coleções',
              options?.sets.map((item) => ({ value: item, label: item })),
              set,
            )}
            value={set ?? ALL}
            onValueChange={(value) => updateSearch({ set: value || undefined })}
          />
          <FilterSelect
            label="Raridade"
            disabled={!game}
            options={withAll(
              'Todas as raridades',
              options?.rarities.map((item) => ({ value: item, label: item })),
              rarity,
            )}
            value={rarity ?? ALL}
            onValueChange={(value) =>
              updateSearch({ rarity: value || undefined })
            }
          />
          <FilterSelect
            label="Catálogo público"
            options={VISIBILITY_OPTIONS}
            value={visibility ?? ALL}
            onValueChange={(value) =>
              updateSearch({
                visibility:
                  value === 'visible' || value === 'hidden' ? value : undefined,
              })
            }
          />
          {game ? (
            <FilterSelect
              label="Tipo"
              className="sm:col-span-2 xl:col-span-2"
              options={withAll(
                'Todos os tipos',
                options?.types.map((item) => ({
                  value: item,
                  label: typeLabels[item] ?? item,
                })),
                type,
              )}
              value={type ?? ALL}
              onValueChange={(value) =>
                updateSearch({ type: value || undefined })
              }
            />
          ) : null}
        </div>

        {hasFilters ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[#715B7B]">
              Filtros ativos na listagem.
            </span>
            <button
              type="button"
              onClick={() => navigate({ search: {} })}
              className={adminFilterClearClass}
            >
              <Icon name="close" size={16} /> Limpar filtros
            </button>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 p-4 sm:p-5">
        {state.status === 'loading' ? (
          <AdminState status="loading" message="Carregando cartas" />
        ) : state.status !== 'ready' ? (
          <AdminState
            status="error"
            message="Não foi possível carregar o catálogo."
            onRetry={retry}
          />
        ) : outOfRange ? (
          <div className="space-y-3 rounded-lg border border-[#E3D1EC] bg-[#FCF8FE] px-4 py-8 text-center text-sm">
            <p className="text-[#665274]">
              Essa página não existe para a busca atual.
            </p>
            <Button
              variant="outline"
              onClick={() => goToPage(1)}
              className={adminButtonClass}
            >
              Ir para a primeira página
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <AdminState
            status="empty"
            message="Nenhuma carta encontrada para a busca ou os filtros selecionados."
          />
        ) : (
          <div className="min-w-0 overflow-x-auto rounded-md border border-[#E1CAEB] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">
                Cartas do catálogo administrativo e opções de visibilidade
              </caption>
              <thead className={adminTableHeaderClass}>
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Carta
                  </th>
                  <th scope="col" className="px-3 py-3">
                    TCG
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Raridade
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Origem
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Catálogo público
                  </th>
                  <th scope="col" className="px-3 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((card) => (
                  <tr key={card.id} className={adminTableRowClass}>
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CardThumb card={card} />
                        <div className="min-w-0">
                          <p
                            className="max-w-[260px] truncate font-bold text-[#331541]"
                            title={card.name}
                          >
                            {card.name}
                          </p>
                          <p
                            className="max-w-[260px] truncate text-xs text-[#735F80]"
                            title={card.setName ?? undefined}
                          >
                            {card.setName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[#4B3559]">
                      {GAME_LABEL[card.cardGame]}
                    </td>
                    <td className="px-3 py-3 text-[#4B3559]">
                      {card.rarity ?? 'Não informada'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge variant="secondary">
                          {SOURCE_LABEL[card.source]}
                        </Badge>
                        <code
                          title={card.externalId}
                          className="max-w-40 truncate rounded bg-[#F2E8F7] px-1.5 py-0.5 text-xs text-[#624B70]"
                        >
                          {card.externalId}
                        </code>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {card.hidden ? (
                        <span title={card.hiddenReason ?? undefined}>
                          <Badge variant="warning">Oculta</Badge>
                        </span>
                      ) : (
                        <Badge variant="success">Visível</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {card.hidden ? (
                        <Button
                          variant="outline"
                          className={`${adminButtonClass} !border-[#9553AA] !text-[#632381] hover:!bg-[#F2E5F8]`}
                          onClick={() => open(card, 'unhide')}
                          aria-label={`Reexibir ${cardLabel(card)}`}
                        >
                          Reexibir
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`${adminButtonClass} !text-[#632381] hover:!bg-[#F1E0F7]`}
                          onClick={() => open(card, 'hide')}
                          aria-label={`Ocultar ${cardLabel(card)}`}
                        >
                          Ocultar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !outOfRange && data.totalElements > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7D6ED] pt-4">
            <p className="text-xs text-[#6F5879]">
              {`Exibindo ${numberFormat.format(data.page * data.size + 1)}–${numberFormat.format(data.page * data.size + rows.length)} de ${numberFormat.format(data.totalElements)} cartas`}
            </p>
            {data.totalPages > 1 ? (
              <nav
                aria-label="Paginação do catálogo administrativo"
                className="flex flex-wrap items-center gap-1.5"
              >
                <PageButton
                  label="Página anterior"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  ‹
                </PageButton>
                {pageItems(currentPage, data.totalPages).map((item, index) =>
                  item === 'gap' ? (
                    <span
                      key={`gap-${index}`}
                      aria-hidden="true"
                      className="px-1 text-sm text-[#745C81]"
                    >
                      …
                    </span>
                  ) : (
                    <PageButton
                      key={item}
                      label={`Página ${item}`}
                      current={item === currentPage}
                      onClick={() => goToPage(item)}
                    >
                      {item}
                    </PageButton>
                  ),
                )}
                <PageButton
                  label="Próxima página"
                  disabled={currentPage >= data.totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  ›
                </PageButton>
              </nav>
            ) : null}
          </div>
        ) : null}
      </div>

      <Modal
        open={pending?.action === 'hide'}
        title="Ocultar carta do catálogo"
        onClose={close}
        closeDisabled={saving}
        presentation="refined"
        headerIcon="cards"
        secondaryAction={{ label: 'Cancelar' }}
        primaryAction={{
          label: saving ? 'Ocultando...' : 'Ocultar carta',
          onClick: () => void confirm(),
        }}
      >
        {pending ? (
          <div className="space-y-3 text-[#35223F]">
            <p className="text-sm leading-relaxed">
              A carta some do catálogo público, mas continua válida para
              coleções e anúncios existentes.
            </p>
            <div className="flex items-center gap-3 rounded-lg border border-[#DFCBEB] bg-[#FBF6FE] p-3">
              <CardThumb card={pending.card} />
              <div className="min-w-0 text-sm">
                <p className="break-words font-bold text-[#32183F]">
                  {pending.card.name}
                </p>
                <p className="mt-1 break-words text-xs text-[#715F7C]">
                  {pending.card.setName} · {SOURCE_LABEL[pending.card.source]} ·{' '}
                  <code>{pending.card.externalId}</code>
                </p>
              </div>
            </div>
            <p className="flex gap-2 rounded-lg border border-[#D7C0E2] bg-[#F5EAFB] p-3 text-xs leading-relaxed text-[#572477]">
              <Icon name="info" size={16} />
              Os dados importados não são alterados. A ocultação continua
              valendo mesmo se a carta for importada de novo.
            </p>
            <label
              htmlFor="hide-reason"
              className="block pt-2 text-sm font-bold text-[#341740]"
            >
              Motivo <span className="text-error-700">*</span>
            </label>
            <textarea
              id="hide-reason"
              value={reason}
              maxLength={REASON_MAX}
              rows={3}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError(null)
              }}
              aria-invalid={reasonError ? true : undefined}
              aria-describedby="hide-reason-hint"
              placeholder="Ex.: imagem da carta está trocada na API."
              className="w-full rounded-lg border border-[#CAACDA] bg-white px-3 py-2 text-sm text-[#301A3E] outline-none placeholder:text-[#806C8A] hover:border-[#9C57B3] focus:border-[#7B3B9B] focus:ring-2 focus:ring-[#DDB5EA] aria-invalid:border-error-700"
            />
            <div
              id="hide-reason-hint"
              className="flex justify-between gap-3 text-xs"
            >
              <span
                className={reasonError ? 'text-error-700' : 'text-[#75647F]'}
              >
                {reasonError ??
                  `Entre ${REASON_MIN} e ${REASON_MAX} caracteres.`}
              </span>
              <span className="text-[#75647F]">
                {reason.trim().length}/{REASON_MAX}
              </span>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={pending?.action === 'unhide'}
        title="Reexibir carta"
        onClose={close}
        closeDisabled={saving}
        presentation="refined"
        headerIcon="cards"
        secondaryAction={{ label: 'Cancelar' }}
        primaryAction={{
          label: saving ? 'Reexibindo...' : 'Reexibir',
          onClick: () => void confirm(),
        }}
      >
        {pending ? (
          <div className="space-y-3 rounded-lg border border-[#DFCBEB] bg-[#FBF6FE] p-4 text-sm leading-relaxed text-[#35223F]">
            <p>
              <strong>{pending.card.name}</strong> volta a aparecer no catálogo
              público.
            </p>
            {pending.card.hiddenReason ? (
              <p className="text-xs text-[#725D80]">
                Motivo da ocultação: {pending.card.hiddenReason}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </AdminPanel>
  )
}

function cardLabel(card: AdminCatalogCard) {
  return card.setName ? `${card.name} (${card.setName})` : card.name
}

function CardThumb({ card }: { card: AdminCatalogCard }) {
  return card.imageUrl ? (
    <img
      src={card.imageUrl}
      alt=""
      loading="lazy"
      className="h-12 w-9 shrink-0 rounded object-cover ring-1 ring-[#DAC1E8]"
    />
  ) : (
    <span
      aria-hidden="true"
      className="font-display flex h-12 w-9 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary-300 to-primary-700 text-xs font-bold text-white"
    >
      {card.name.charAt(0)}
    </span>
  )
}

function PageButton({
  label,
  current = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  current?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-md border text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B49A9] disabled:cursor-not-allowed disabled:opacity-40 ${current ? 'border-[#5D2180] bg-[#6C248E] text-white' : 'border-[#DABDE8] bg-white text-[#632381] hover:border-[#9861B0] hover:bg-[#F3E8FA]'}`}
    >
      {children}
    </button>
  )
}

function FilterSelect({
  label,
  className,
  ...props
}: {
  label: string
  className?: string
  options: SelectOption[]
  value: string
  disabled?: boolean
  onValueChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className={`min-w-0 ${className ?? ''}`}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-bold text-[#4A2B59]"
      >
        {label}
      </label>
      <Select id={id} variant="filter" {...props} className="w-full" />
    </div>
  )
}

function withAll(
  allLabel: string,
  items: SelectOption[] | undefined,
  selected: string | undefined,
): SelectOption[] {
  const list = items ?? []
  const extra =
    selected && !list.some((item) => item.value === selected)
      ? [{ value: selected, label: selected }]
      : []
  return [{ value: ALL, label: allLabel }, ...extra, ...list]
}
