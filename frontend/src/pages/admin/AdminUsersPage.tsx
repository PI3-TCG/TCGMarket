import { AdminUserDetailsModal } from '@/components/admin/AdminUserDetailsModal'
import { apiMessage } from '@/components/admin/adminFormat'
import {
  FIELD_LABEL,
  ROLE_LABEL,
  STATUS_LABEL,
  reasonError,
} from '@/components/admin/adminUserFormat'
import {
  AdminPanel,
  AdminState,
  adminButtonClass,
  adminFilterClearClass,
} from '@/components/admin/AdminPanel'
import { ReasonField } from '@/components/admin/ReasonField'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select, type SelectOption } from '@/components/ui/Select'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  changeUserRole,
  changeUserStatus,
  moderateUserProfile,
  searchUsers,
} from '@/services/adminApi'
import { useSession } from '@/session'
import type {
  AdminUser,
  AdminUserSearch,
  ModeratedProfileField,
  UserStatus,
} from '@/types/AdminUser'
import type { UserRole } from '@/types/User'
import axios from 'axios'
import { useCallback, useId, useState, type FormEvent } from 'react'

type PendingAction =
  | { kind: 'role'; user: AdminUser; role: UserRole }
  | { kind: 'suspend' | 'reactivate'; user: AdminUser }
  | { kind: 'moderate'; user: AdminUser }

const MODERATED_FIELDS: ModeratedProfileField[] = ['BIO', 'LINKS', 'LOCATION']

const ROLE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos os perfis' },
  { value: 'USER', label: 'Usuários' },
  { value: 'ADMIN', label: 'Administradores' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todas as situações' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'SUSPENDED', label: 'Suspensas' },
]

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const numberFormat = new Intl.NumberFormat('pt-BR')

export function AdminUsersPage() {
  const { user: current, refreshUser } = useSession()
  const [search, setSearch] = useState<AdminUserSearch>({ page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [version, setVersion] = useState(0)
  const [updated, setUpdated] = useState<Record<string, AdminUser>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [details, setDetails] = useState<AdminUser | null>(null)
  const [reason, setReason] = useState('')
  const [fields, setFields] = useState<ModeratedProfileField[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Mesmas consultas, permissões e operações da página original.
  const fetcher = useCallback(() => searchUsers(search), [search])
  const { state, retry } = useRemoteData(
    `admin-users:${JSON.stringify(search)}:${version}`,
    fetcher,
  )

  const failureMessage = useCallback(
    (cause: unknown, fallback: string) => {
      if (axios.isAxiosError(cause) && cause.response?.status === 403) {
        void refreshUser()
      }
      return apiMessage(cause) ?? fallback
    },
    [refreshUser],
  )

  function updateSearch(changes: Partial<AdminUserSearch>) {
    setSearch((previous) => ({ ...previous, ...changes, page: 1 }))
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    updateSearch({ q: searchInput.trim() || undefined })
  }

  function open(action: PendingAction) {
    setPending(action)
    setReason('')
    setFields([])
    setFormError(null)
    if (action.kind === 'moderate') setDetails(null)
  }

  function close() {
    if (!saving) setPending(null)
  }

  async function confirm() {
    if (!pending || saving) return
    const needsReason = pending.kind !== 'role'
    if (pending.kind === 'moderate' && fields.length === 0) {
      setFormError('Selecione ao menos um campo.')
      return
    }
    const invalidReason = needsReason ? reasonError(reason) : null
    if (invalidReason) {
      setFormError(invalidReason)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const trimmed = reason.trim()
      const user = await run(pending, trimmed, fields)
      setUpdated((map) => ({ ...map, [user.id]: user }))
      setSuccess(successMessage(pending, user))
      setVersion((value) => value + 1)
      setPending(null)
    } catch (cause) {
      const message = failureMessage(cause, 'Não foi possível concluir a ação.')
      if (needsReason) {
        setFormError(message)
      } else {
        setError(message)
        setPending(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const data = state.status === 'ready' ? state.data : null
  const rows = data?.content.map((item) => updated[item.id] ?? item) ?? []
  const hasFilters = Boolean(search.q || search.role || search.status)

  return (
    <div className="min-w-0 space-y-4 pb-6">
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

      <AdminPanel
        title="Gerenciamento de usuários"
        icon="user"
        description="Consulte contas, revise permissões e registre ações de moderação."
        action={
          <p
            className="text-xs font-semibold text-[#604473]"
            aria-live="polite"
          >
            {data
              ? `${numberFormat.format(data.totalElements)} ${data.totalElements === 1 ? 'usuário encontrado' : 'usuários encontrados'}`
              : null}
          </p>
        }
      >
        <div className="border-b border-[#E4D2EC] bg-[linear-gradient(95deg,#FCF7FF,#F8EEFC)] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#673087]">
            <Icon name="search" size={16} /> Buscar e filtrar
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <form
              role="search"
              onSubmit={submitSearch}
              className="min-w-0 sm:col-span-2 xl:col-span-1"
            >
              <label
                htmlFor="admin-user-search-label"
                className="mb-1.5 block text-xs font-bold text-[#4A2B59]"
              >
                Nome, usuário ou e-mail
              </label>
              <Input
                id="admin-user-search-label"
                variant="search"
                aria-label="Pesquisar por nome, usuário ou e-mail"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Pesquisar usuários"
                className="w-full !border-[#D5B8E1] !bg-white focus-visible:!outline-[#8841A0]"
              />
            </form>
            <FilterSelect
              label="Perfil"
              options={ROLE_OPTIONS}
              value={search.role ?? ''}
              onValueChange={(value) =>
                updateSearch({ role: (value || undefined) as UserRole })
              }
            />
            <FilterSelect
              label="Situação"
              options={STATUS_OPTIONS}
              value={search.status ?? ''}
              onValueChange={(value) =>
                updateSearch({ status: (value || undefined) as UserStatus })
              }
            />
          </div>

          {hasFilters ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#715B7B]">
                Filtros ativos na listagem.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch({ page: 1 })
                }}
                className={adminFilterClearClass}
              >
                <Icon name="close" size={16} /> Limpar filtros
              </button>
            </div>
          ) : null}
        </div>

        {state.status === 'loading' ? (
          <AdminState status="loading" message="Carregando usuários..." />
        ) : state.status !== 'ready' ? (
          <AdminState
            status="error"
            message="Não foi possível carregar os usuários."
            onRetry={retry}
          />
        ) : rows.length === 0 ? (
          <AdminState
            status="empty"
            message={
              hasFilters
                ? 'Nenhum usuário encontrado com esses filtros.'
                : 'Nenhum usuário cadastrado.'
            }
          />
        ) : (
          <ul
            className="divide-y divide-[#E5D3ED]"
            aria-label="Usuários encontrados"
          >
            {rows.map((item, index) => {
              const isSelf = item.id === current?.id
              const suspended = item.status === 'SUSPENDED'
              const nextRole: UserRole =
                item.role === 'ADMIN' ? 'USER' : 'ADMIN'
              const initial =
                item.name.trim().charAt(0).toLocaleUpperCase('pt-BR') || '?'
              return (
                <li
                  key={item.id}
                  className={`grid min-w-0 gap-3 px-4 py-4 transition-colors hover:bg-[#F4E8FC] sm:px-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center ${index % 2 ? 'bg-[#FAF5FD]' : 'bg-white'}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[#D4A7E6] bg-[linear-gradient(145deg,#8D40B4,#4A176D)] font-display text-base font-bold text-white shadow-[0_2px_7px_rgba(69,19,94,0.18)]"
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-[#2E153C]">
                        <span className="break-words">{item.name}</span>
                        {isSelf ? (
                          <span className="text-xs font-normal text-[#725984]">
                            (você)
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 break-all text-xs leading-relaxed text-[#705E7C]">
                        {item.username ? `@${item.username} · ` : ''}
                        {item.email} · desde{' '}
                        {dateFormat.format(new Date(item.registrationDate))}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
                    <Badge
                      variant={item.role === 'ADMIN' ? 'primary' : 'neutral'}
                    >
                      {ROLE_LABEL[item.role]}
                    </Badge>
                    <Badge variant={suspended ? 'error' : 'success'}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                    <Button
                      variant="ghost"
                      onClick={() => setDetails(item)}
                      className={`${adminButtonClass} !text-[#572079] hover:!bg-[#EDDCF6]`}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isSelf || saving}
                      className={`${adminButtonClass} !border-[#9651AC] !text-[#632381] hover:!bg-[#F1E2F8]`}
                      title={
                        isSelf
                          ? 'Você não pode alterar o próprio perfil.'
                          : undefined
                      }
                      onClick={() =>
                        open({ kind: 'role', user: item, role: nextRole })
                      }
                    >
                      {nextRole === 'ADMIN'
                        ? 'Tornar administrador'
                        : 'Tornar usuário'}
                    </Button>
                    <Button
                      variant={suspended ? 'outline' : 'danger'}
                      disabled={isSelf || saving}
                      className={adminButtonClass}
                      title={
                        isSelf
                          ? 'Você não pode suspender a própria conta.'
                          : undefined
                      }
                      onClick={() =>
                        open({
                          kind: suspended ? 'reactivate' : 'suspend',
                          user: item,
                        })
                      }
                    >
                      {suspended ? 'Reativar' : 'Suspender'}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {data && data.totalPages > 1 ? (
          <nav
            aria-label="Paginação de usuários"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E0C9E9] bg-[#FCF9FE] px-4 py-3 sm:px-5"
          >
            <p className="text-xs font-semibold text-[#6A507C]">
              Página {search.page} de {data.totalPages}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className={`${adminButtonClass} !border-[#9C6FB0] !text-[#632381]`}
                disabled={search.page <= 1}
                onClick={() =>
                  setSearch((previous) => ({
                    ...previous,
                    page: previous.page - 1,
                  }))
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                className={`${adminButtonClass} !border-[#9C6FB0] !text-[#632381]`}
                disabled={search.page >= data.totalPages}
                onClick={() =>
                  setSearch((previous) => ({
                    ...previous,
                    page: previous.page + 1,
                  }))
                }
              >
                Próxima
              </Button>
            </div>
          </nav>
        ) : null}
      </AdminPanel>

      {details ? (
        <AdminUserDetailsModal
          user={updated[details.id] ?? details}
          version={version}
          isSelf={details.id === current?.id}
          onClose={() => setDetails(null)}
          onModerate={() =>
            open({ kind: 'moderate', user: updated[details.id] ?? details })
          }
          onChangeRole={(role) => {
            const selected = updated[details.id] ?? details
            setDetails(null)
            open({ kind: 'role', user: selected, role })
          }}
          onChangeStatus={(status) => {
            const selected = updated[details.id] ?? details
            setDetails(null)
            open({
              kind: status === 'SUSPENDED' ? 'suspend' : 'reactivate',
              user: selected,
            })
          }}
        />
      ) : null}

      <Modal
        open={pending !== null}
        title={pending ? MODAL_TITLE[pending.kind] : ''}
        onClose={close}
        closeDisabled={saving}
        busy={saving}
        headerIcon="shield-check"
        secondaryAction={{ label: 'Cancelar' }}
        primaryAction={{
          label: saving ? 'Salvando...' : 'Confirmar',
          variant: pending?.kind === 'suspend' ? 'danger' : undefined,
          onClick: () => void confirm(),
        }}
      >
        <div className="space-y-4 text-text-primary">
          {pending?.kind === 'role' ? (
            <p className="rounded-control border border-border-default bg-surface-input p-3 text-sm leading-relaxed">
              Alterar o perfil de <strong>{pending.user.name}</strong> para{' '}
              <strong>{ROLE_LABEL[pending.role].toLowerCase()}</strong>?
            </p>
          ) : null}
          {pending?.kind === 'suspend' ? (
            <p className="rounded-control border border-error-200 bg-surface-input p-3 text-sm leading-relaxed">
              <strong>{pending.user.name}</strong> perde o acesso à plataforma a
              partir da próxima ação, e o perfil público deixa de aparecer.
            </p>
          ) : null}
          {pending?.kind === 'reactivate' ? (
            <p className="rounded-control border border-border-default bg-surface-input p-3 text-sm leading-relaxed">
              <strong>{pending.user.name}</strong> volta a acessar a plataforma,
              e o perfil público volta a aparecer.
            </p>
          ) : null}
          {pending?.kind === 'moderate' ? (
            <fieldset className="space-y-3 rounded-control border border-border-default bg-surface-input p-4">
              <legend className="px-1 text-sm font-semibold leading-relaxed text-text-primary">
                Escolha o que remover do perfil de{' '}
                <strong>{pending.user.name}</strong>. Nome e usuário só podem
                ser alterados pelo próprio jogador.
              </legend>
              {MODERATED_FIELDS.map((field) => (
                <Checkbox
                  key={field}
                  label={FIELD_LABEL[field]}
                  checked={fields.includes(field)}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setFields((list) =>
                      checked
                        ? [...list, field]
                        : list.filter((item) => item !== field),
                    )
                    setFormError(null)
                  }}
                />
              ))}
            </fieldset>
          ) : null}
          {pending && pending.kind !== 'role' ? (
            <ReasonField
              value={reason}
              error={formError}
              placeholder={REASON_PLACEHOLDER[pending.kind]}
              onChange={(value) => {
                setReason(value)
                setFormError(null)
              }}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  )
}

const MODAL_TITLE: Record<PendingAction['kind'], string> = {
  role: 'Alterar perfil',
  suspend: 'Suspender conta',
  reactivate: 'Reativar conta',
  moderate: 'Limpar conteúdo do perfil',
}

const REASON_PLACEHOLDER: Record<
  Exclude<PendingAction['kind'], 'role'>,
  string
> = {
  suspend: 'Ex.: nome de usuário ofensivo.',
  reactivate: 'Ex.: recurso analisado e aceito pela equipe.',
  moderate: 'Ex.: bio com conteúdo impróprio.',
}

function run(
  action: PendingAction,
  reason: string,
  fields: ModeratedProfileField[],
) {
  switch (action.kind) {
    case 'role':
      return changeUserRole(action.user.id, action.role)
    case 'suspend':
      return changeUserStatus(action.user.id, 'SUSPENDED', reason)
    case 'reactivate':
      return changeUserStatus(action.user.id, 'ACTIVE', reason)
    case 'moderate':
      return moderateUserProfile(action.user.id, fields, reason)
  }
}

function successMessage(action: PendingAction, user: AdminUser) {
  switch (action.kind) {
    case 'role':
      return `${user.name} agora é ${ROLE_LABEL[user.role].toLowerCase()}.`
    case 'suspend':
      return `A conta de ${user.name} foi suspensa.`
    case 'reactivate':
      return `A conta de ${user.name} foi reativada.`
    case 'moderate':
      return `O conteúdo do perfil de ${user.name} foi removido.`
  }
}

function FilterSelect({
  label,
  ...props
}: {
  label: string
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0">
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
