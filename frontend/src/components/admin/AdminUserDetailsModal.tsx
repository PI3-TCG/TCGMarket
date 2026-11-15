import { AdminActionList } from '@/components/admin/AdminActionList'
import {
  ROLE_LABEL,
  STATUS_LABEL,
} from '@/components/admin/adminUserFormat'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useRemoteData } from '@/hooks/useRemoteData'
import { fetchUserActions } from '@/services/adminApi'
import type { AdminUser } from '@/types/AdminUser'
import { Link } from '@tanstack/react-router'
import { useCallback, type ReactNode } from 'react'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

type AdminUserDetailsModalProps = {
  user: AdminUser
  version: number
  onClose: () => void
  onModerate: () => void
}

export function AdminUserDetailsModal({
  user,
  version,
  onClose,
  onModerate,
}: AdminUserDetailsModalProps) {
  const fetcher = useCallback(() => fetchUserActions(user.id), [user.id])
  const { state, retry } = useRemoteData(
    `admin-user-actions:${user.id}:${version}`,
    fetcher,
  )

  return (
    <Modal
      open
      size="lg"
      title="Detalhes da conta"
      onClose={onClose}
      secondaryAction={{ label: 'Fechar' }}
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Nome">{user.name}</Detail>
        <Detail label="Usuário">
          {user.username ? `@${user.username}` : '—'}
        </Detail>
        <Detail label="E-mail">{user.email}</Detail>
        <Detail label="Cadastro">
          {dateFormat.format(new Date(user.registrationDate))}
        </Detail>
        <Detail label="Perfil">{ROLE_LABEL[user.role]}</Detail>
        <Detail label="Situação">
          <Badge variant={user.status === 'SUSPENDED' ? 'error' : 'success'}>
            {STATUS_LABEL[user.status]}
          </Badge>
        </Detail>
      </dl>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {user.username && user.status === 'ACTIVE' ? (
          <Link
            to="/jogadores/$username"
            params={{ username: user.username }}
            className="text-sm font-semibold text-primary-900 underline underline-offset-2"
          >
            Ver perfil público
          </Link>
        ) : null}
        <Button variant="outline" onClick={onModerate}>
          Limpar conteúdo do perfil
        </Button>
      </div>

      <section aria-labelledby="admin-user-actions" className="pt-4">
        <h3
          id="admin-user-actions"
          className="text-sm font-semibold text-neutral-900"
        >
          Histórico de ações administrativas
        </h3>
        {state.status === 'loading' ? (
          <p role="status" className="py-3 text-sm text-neutral-500">
            Carregando histórico...
          </p>
        ) : state.status !== 'ready' ? (
          <div role="alert" className="space-y-2 py-3 text-sm">
            <p className="text-neutral-700">
              Não foi possível carregar o histórico.
            </p>
            <Button variant="outline" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        ) : state.data.length === 0 ? (
          <p className="py-3 text-sm text-neutral-500">
            Nenhuma ação administrativa registrada para esta conta.
          </p>
        ) : (
          <AdminActionList
            label="Ações administrativas sobre a conta"
            actions={state.data}
          />
        )}
      </section>
    </Modal>
  )
}

function Detail({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 break-words text-neutral-900">{children}</dd>
    </div>
  )
}
