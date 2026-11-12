import { AdminUserDetailsModal } from '@/components/admin/AdminUserDetailsModal'
import { apiMessage } from '@/components/admin/adminFormat'
import {
  FIELD_LABEL,
  ROLE_LABEL,
  STATUS_LABEL,
  reasonError,
} from '@/components/admin/adminUserFormat'
import { ReasonField } from '@/components/admin/ReasonField'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
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
    <div className="space-y-4">
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

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Gerenciamento de usuários
          </h2>
          <p className="text-sm text-neutral-500" aria-live="polite">
            {data
              ? `${numberFormat.format(data.totalElements)} ${data.totalElements === 1 ? 'usuário encontrado' : 'usuários encontrados'}`
              : null}
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <form
              role="search"
              onSubmit={submitSearch}
              className="sm:col-span-2"
            >
              <Input
                variant="search"
                aria-label="Pesquisar por nome, usuário ou e-mail"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Pesquisar por nome, usuário ou e-mail"
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
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setSearch({ page: 1 })
              }}
              className="text-xs font-semibold text-primary-900 underline underline-offset-2"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>

        {state.status === 'loading' ? (
          <p role="status" className="px-5 pb-6 text-sm text-neutral-500">
            Carregando usuários...
          </p>
        ) : state.status !== 'ready' ? (
          <div role="alert" className="space-y-3 px-5 pb-6 text-sm">
            <p className="text-neutral-700">
              Não foi possível carregar os usuários.
            </p>
            <Button variant="outline" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-neutral-500">
            {hasFilters
              ? 'Nenhum usuário encontrado com esses filtros.'
              : 'Nenhum usuário cadastrado.'}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
            {rows.map((item) => {
              const isSelf = item.id === current?.id
              const suspended = item.status === 'SUSPENDED'
              const nextRole: UserRole =
                item.role === 'ADMIN' ? 'USER' : 'ADMIN'
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {item.name}
                      {isSelf ? (
                        <span className="ml-2 text-xs font-normal text-neutral-500">
                          (você)
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {item.username ? `@${item.username} · ` : ''}
                      {item.email} · desde{' '}
                      {dateFormat.format(new Date(item.registrationDate))}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={item.role === 'ADMIN' ? 'primary' : 'neutral'}
                    >
                      {ROLE_LABEL[item.role]}
                    </Badge>
                    <Badge variant={suspended ? 'error' : 'success'}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                    <Button variant="ghost" onClick={() => setDetails(item)}>
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isSelf || saving}
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
            className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3"
          >
            <p className="text-xs text-neutral-500">
              Página {search.page} de {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
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
      </Card>

      {details ? (
        <AdminUserDetailsModal
          user={updated[details.id] ?? details}
          version={version}
          onClose={() => setDetails(null)}
          onModerate={() => open({ kind: 'moderate', user: details })}
        />
      ) : null}

      <Modal
        open={pending !== null}
        title={pending ? MODAL_TITLE[pending.kind] : ''}
        onClose={close}
        secondaryAction={{ label: 'Cancelar' }}
        primaryAction={{
          label: saving ? 'Salvando...' : 'Confirmar',
          variant: pending?.kind === 'suspend' ? 'danger' : undefined,
          onClick: () => void confirm(),
        }}
      >
        {pending?.kind === 'role' ? (
          <p>
            Alterar o perfil de <strong>{pending.user.name}</strong> para{' '}
            <strong>{ROLE_LABEL[pending.role].toLowerCase()}</strong>?
          </p>
        ) : null}
        {pending?.kind === 'suspend' ? (
          <p className="text-sm">
            <strong>{pending.user.name}</strong> perde o acesso à plataforma a
            partir da próxima ação, e o perfil público deixa de aparecer.
          </p>
        ) : null}
        {pending?.kind === 'reactivate' ? (
          <p className="text-sm">
            <strong>{pending.user.name}</strong> volta a acessar a plataforma,
            e o perfil público volta a aparecer.
          </p>
        ) : null}
        {pending?.kind === 'moderate' ? (
          <fieldset className="space-y-2">
            <legend className="text-sm">
              Escolha o que remover do perfil de{' '}
              <strong>{pending.user.name}</strong>. Nome e usuário só podem ser
              alterados pelo próprio jogador.
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
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select id={id} variant="filter" {...props} />
    </div>
  )
}
