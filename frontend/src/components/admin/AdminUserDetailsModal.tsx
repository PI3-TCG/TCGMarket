import { AdminActionList } from '@/components/admin/AdminActionList'
import { ROLE_LABEL, STATUS_LABEL } from '@/components/admin/adminUserFormat'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  modalDangerButton as dangerButton,
  modalSecondaryButton as secondaryButton,
} from '@/components/ui/modalTheme'
import { useRemoteData } from '@/hooks/useRemoteData'
import { fetchUserActions } from '@/services/adminApi'
import type { AdminUser } from '@/types/AdminUser'
import { Link } from '@tanstack/react-router'import { AdminActionList } from '@/components/admin/AdminActionList'
import {
  ROLE_LABEL,
  STATUS_LABEL,
} from '@/components/admin/adminUserFormat'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  modalDangerButton as dangerButton,
  modalSecondaryButton as secondaryButton,
} from '@/components/ui/modalTheme'
import { useRemoteData } from '@/hooks/useRemoteData'
import { fetchUserActions } from '@/services/adminApi'
import type { AdminUser } from '@/types/AdminUser'
import { Link } from '@tanstack/react-router'
import { useCallback, type ReactNode } from 'react'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

const surface =
  'rounded-2xl border border-[#DBC5EA] bg-[linear-gradient(145deg,#FFFFFF_0%,#FBF8FF_100%)] p-4 shadow-[0_4px_15px_rgba(66,18,92,0.07)] sm:p-5'

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
      presentation="refined"
      headerIcon="user"
      size="lg"
      title="Detalhes da conta"
      subtitle="Consulte os dados do usuário e as ações administrativas registradas."
      onClose={onClose}
      footer={
        <button type="button" className={secondaryButton} onClick={onClose}>
          Fechar detalhes
        </button>
      }
    >
      <div className="space-y-5 text-[#28213D]">
        <section className={surface} aria-labelledby="admin-account-title">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E7D9F0] pb-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#825394]">
                Conta do usuário
              </p>
              <h3
                id="admin-account-title"
                className="mt-1 break-words font-display text-xl font-bold text-[#590965]"
              >
                {user.name}
              </h3>
              <p className="mt-1 break-words text-sm text-[#6A617A]">
                {user.username ? `@${user.username}` : 'Sem nome de usuário'}
              </p>
            </div>
            <Badge variant={user.status === 'SUSPENDED' ? 'error' : 'success'}>
              {STATUS_LABEL[user.status]}
            </Badge>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
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
        </section>

        <section className={surface} aria-labelledby="admin-user-actions-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                id="admin-user-actions-title"
                className="font-display text-lg font-bold text-[#590965]"
              >
                Ações da conta
              </h3>
              <p className="mt-1 text-sm text-[#6A617A]">
                Consulte o perfil público ou acesse a moderação do conteúdo.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {user.username && user.status === 'ACTIVE' ? (
              <Link
                to="/jogadores/$username"
                params={{ username: user.username }}
                className={secondaryButton}
              >
                <Icon name="user" size={16} />
                Ver perfil público
              </Link>
            ) : null}
            <button
              type="button"
              className={dangerButton}
              onClick={onModerate}
            >
              <Icon name="trash" size={16} />
              Limpar conteúdo do perfil
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#716781]">
            A limpeza do conteúdo é uma ação administrativa. Revise a conta antes de prosseguir.
          </p>
        </section>

        <section className={surface} aria-labelledby="admin-user-history-title">
          <div className="border-b border-[#E7D9F0] pb-3">
            <h3
              id="admin-user-history-title"
              className="font-display text-lg font-bold text-[#590965]"
            >
              Histórico de ações administrativas
            </h3>
            <p className="mt-1 text-sm text-[#6A617A]">
              Registros de moderação associados a esta conta.
            </p>
          </div>

          <div className="pt-4">
            {state.status === 'loading' ? (
              <div role="status" className="flex items-center gap-3 text-sm text-[#6A617A]">
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border-2 border-[#B795CF] border-t-[#590965] motion-safe:animate-spin"
                />
                Carregando histórico...
              </div>
            ) : state.status !== 'ready' ? (
              <div role="alert" className="space-y-3">
                <p className="text-sm text-[#554762]">
                  Não foi possível carregar o histórico.
                </p>
                <button type="button" className={secondaryButton} onClick={retry}>
                  Tentar novamente
                </button>
              </div>
            ) : state.data.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8C4E4] bg-[#FCFAFF] px-4 py-6 text-center">
                <Icon name="info" size={24} className="mx-auto text-[#9866A8]" />
                <p className="mt-2 text-sm text-[#6A617A]">
                  Nenhuma ação administrativa registrada para esta conta.
                </p>
              </div>
            ) : (
              <AdminActionList
                label="Ações administrativas sobre a conta"
                actions={state.data}
              />
            )}
          </div>
        </section>
      </div>
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
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-[#786A89]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#28213D]">
        {children}
      </dd>
    </div>
  )
}

import { useCallback, type ReactNode } from 'react'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

const surface =
  'rounded-2xl border border-[#DBC5EA] bg-[linear-gradient(145deg,#FFFFFF_0%,#FBF8FF_100%)] p-4 shadow-[0_4px_15px_rgba(66,18,92,0.07)] sm:p-5'

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
      presentation="refined"
      headerIcon="user"
      size="lg"
      title="Detalhes da conta"
      subtitle="Consulte os dados do usuário e as ações administrativas registradas."
      onClose={onClose}
      footer={
        <button type="button" className={secondaryButton} onClick={onClose}>
          Fechar detalhes
        </button>
      }
    >
      <div className="space-y-5 text-[#28213D]">
        <section className={surface} aria-labelledby="admin-account-title">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E7D9F0] pb-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#825394]">
                Conta do usuário
              </p>
              <h3
                id="admin-account-title"
                className="mt-1 break-words font-display text-xl font-bold text-[#590965]"
              >
                {user.name}
              </h3>
              <p className="mt-1 break-words text-sm text-[#6A617A]">
                {user.username ? `@${user.username}` : 'Sem nome de usuário'}
              </p>
            </div>
            <Badge variant={user.status === 'SUSPENDED' ? 'error' : 'success'}>
              {STATUS_LABEL[user.status]}
            </Badge>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
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
              <Badge
                variant={user.status === 'SUSPENDED' ? 'error' : 'success'}
              >
                {STATUS_LABEL[user.status]}
              </Badge>
            </Detail>
          </dl>
        </section>

        <section className={surface} aria-labelledby="admin-user-actions-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                id="admin-user-actions-title"
                className="font-display text-lg font-bold text-[#590965]"
              >
                Ações da conta
              </h3>
              <p className="mt-1 text-sm text-[#6A617A]">
                Consulte o perfil público ou acesse a moderação do conteúdo.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {user.username && user.status === 'ACTIVE' ? (
              <Link
                to="/jogadores/$username"
                params={{ username: user.username }}
                className={secondaryButton}
              >
                <Icon name="user" size={16} />
                Ver perfil público
              </Link>
            ) : null}
            <button type="button" className={dangerButton} onClick={onModerate}>
              <Icon name="trash" size={16} />
              Limpar conteúdo do perfil
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#716781]">
            A limpeza do conteúdo é uma ação administrativa. Revise a conta
            antes de prosseguir.
          </p>
        </section>

        <section className={surface} aria-labelledby="admin-user-history-title">
          <div className="border-b border-[#E7D9F0] pb-3">
            <h3
              id="admin-user-history-title"
              className="font-display text-lg font-bold text-[#590965]"
            >
              Histórico de ações administrativas
            </h3>
            <p className="mt-1 text-sm text-[#6A617A]">
              Registros de moderação associados a esta conta.
            </p>
          </div>

          <div className="pt-4">
            {state.status === 'loading' ? (
              <div
                role="status"
                className="flex items-center gap-3 text-sm text-[#6A617A]"
              >
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border-2 border-[#B795CF] border-t-[#590965] motion-safe:animate-spin"
                />
                Carregando histórico...
              </div>
            ) : state.status !== 'ready' ? (
              <div role="alert" className="space-y-3">
                <p className="text-sm text-[#554762]">
                  Não foi possível carregar o histórico.
                </p>
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={retry}
                >
                  Tentar novamente
                </button>
              </div>
            ) : state.data.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D8C4E4] bg-[#FCFAFF] px-4 py-6 text-center">
                <Icon
                  name="info"
                  size={24}
                  className="mx-auto text-[#9866A8]"
                />
                <p className="mt-2 text-sm text-[#6A617A]">
                  Nenhuma ação administrativa registrada para esta conta.
                </p>
              </div>
            ) : (
              <AdminActionList
                label="Ações administrativas sobre a conta"
                actions={state.data}
              />
            )}
          </div>
        </section>
      </div>
    </Modal>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-[#786A89]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#28213D]">
        {children}
      </dd>
    </div>
  )
}
