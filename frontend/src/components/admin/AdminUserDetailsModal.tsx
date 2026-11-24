import { useCallback, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

import { AdminActionList } from '@/components/admin/AdminActionList'
import { ROLE_LABEL, STATUS_LABEL } from '@/components/admin/adminUserFormat'
import { Badge } from '@/components/ui/Badge'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import {
  modalPrimaryButton,
  modalDangerButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import { useRemoteData } from '@/hooks/useRemoteData'
import { fetchUserActions } from '@/services/adminApi'
import type { AdminUser, UserStatus } from '@/types/AdminUser'
import type { UserRole } from '@/types/User'

/**
 * Dados adicionais ainda não disponíveis em AdminUser.
 * A página poderá preenchê-los quando os módulos de avaliações,
 * coleção e pedidos disponibilizarem seus endpoints.
 */
export type AdminUserProfileSummary = {
  avatarUrl?: string | null
  verifiedSeller?: boolean | null
  country?: string | null
  birthDate?: string | null
  rating?: number | null
  reviewCount?: number | null
  positiveReviewsPercent?: number | null
  cardCount?: number | null
  collectionCount?: number | null
  listCount?: number | null
  lastActivityAt?: string | null
  orderCount?: number | null
}

type Props = {
  user: AdminUser
  version: number
  onClose: () => void
  onModerate: () => void
  onChangeRole?: (role: UserRole) => void
  onChangeStatus?: (status: UserStatus) => void
  isSelf?: boolean
  profile?: AdminUserProfileSummary | null
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })
const numberFormat = new Intl.NumberFormat('pt-BR')
const ratingFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const sectionHeading =
  'flex items-center gap-2 text-sm font-bold text-text-primary'
const sectionIcon = 'text-brand-deep'
const metaText = 'text-xs leading-relaxed text-text-secondary'

function displayCount(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? numberFormat.format(value)
    : '—'
}

function displayDate(value: string | null | undefined, fallback = '—'): string {
  if (!value) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : dateFormat.format(parsed)
}

function displayDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : dateTimeFormat.format(parsed)
}

export function AdminUserDetailsModal({
  user,
  version,
  onClose,
  onModerate,
  onChangeRole,
  onChangeStatus,
  isSelf = false,
  profile,
}: Props) {
  const fetcher = useCallback(() => fetchUserActions(user.id), [user.id])
  const { state, retry } = useRemoteData(
    `admin-user-actions:${user.id}:${version}`,
    fetcher,
  )
  const [avatarFailed, setAvatarFailed] = useState(false)

  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.slice(0, 1).toLocaleUpperCase('pt-BR'))
      .join('') || '?'
  const nextRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  const nextStatus: UserStatus =
    user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  const rating = profile?.rating
  const hasRating = typeof rating === 'number' && Number.isFinite(rating)
  const percent = profile?.positiveReviewsPercent
  const hasPercent = typeof percent === 'number' && Number.isFinite(percent)

  return (
    <Modal
      open
      headerIcon="user"
      size="lg"
      className="mx-auto max-w-[790px]"
      title="Detalhes do usuário"
      onClose={onClose}
      footer={
        <div className="flex w-full flex-wrap justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            disabled={isSelf || !onChangeRole}
            title={
              !onChangeRole
                ? 'Ação indisponível nesta tela'
                : isSelf
                  ? 'Não é possível alterar o próprio perfil'
                  : undefined
            }
            onClick={() => onChangeRole?.(nextRole)}
            className={modalPrimaryButton}
          >
            <Icon name={user.role === 'ADMIN' ? 'minus' : 'star'} size={20} />
            {user.role === 'ADMIN' ? 'Remover admin' : 'Promover'}
          </button>
          <button
            type="button"
            disabled={isSelf || !onChangeStatus}
            title={
              !onChangeStatus
                ? 'Ação indisponível nesta tela'
                : isSelf
                  ? 'Não é possível alterar o status da própria conta'
                  : undefined
            }
            onClick={() => onChangeStatus?.(nextStatus)}
            className={nextStatus === 'SUSPENDED' ? modalDangerButton : modalPrimaryButton}
          >
            <Icon
              name={user.status === 'ACTIVE' ? 'alert' : 'check-circle'}
              size={20}
            />
            {user.status === 'ACTIVE' ? 'Suspender' : 'Reativar'}
          </button>
          <button
            type="button"
            disabled={isSelf}
            onClick={onModerate}
            className={modalSecondaryButton}
          >
            <Icon name="edit" size={20} /> Limpar perfil
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-text-primary">
        {/* Resumo da conta: mesmo arranjo horizontal da referência. */}
        <section
          aria-label="Resumo do usuário"
          className="rounded-control border border-border-default bg-surface-input p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-4 border-b border-border-default pb-4 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 items-center gap-4">
              <div
                aria-hidden="true"
                className="grid size-[90px] shrink-0 place-items-center overflow-hidden rounded-full border border-accent-bronze bg-surface-input text-3xl font-bold text-brand-deep shadow-sm"
              >
                {profile?.avatarUrl && !avatarFailed ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setAvatarFailed(true)}
                    className="size-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-title text-xl font-bold text-text-ink sm:text-2xl">
                    {user.username || user.name}
                  </h3>
                  {user.role === 'ADMIN' && (
                    <Icon
                      name="shield-check"
                      size={20}
                      className="text-state-info"
                    />
                  )}
                </div>
                <p className={`${metaText} mt-1 break-words`}>
                  ID: {user.id} <span aria-hidden="true">·</span> Membro desde{' '}
                  {displayDate(user.registrationDate)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {profile?.verifiedSeller === true ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-input px-3 py-1 text-xs font-semibold text-text-primary">
                      <Icon name="shield-check" size={16} /> Vendedor verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-input px-3 py-1 text-xs font-semibold text-text-primary">
                      <Icon name="shield-check" size={16} />{' '}
                      {ROLE_LABEL[user.role]}
                    </span>
                  )}
                  {user.username && user.status === 'ACTIVE' && (
                    <Link
                      to="/jogadores/$username"
                      params={{ username: user.username }}
                      className="text-xs font-semibold text-text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
                    >
                      Ver perfil
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0 border-t border-border-default pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-1">
              <h4 className={sectionHeading}>
                Reputação{' '}
                <Icon name="info" size={16} className="text-brand-deep" />
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Icon name="star" filled size={24} className="text-accent-gold-deep" />
                <strong className="text-xl font-extrabold text-text-primary">
                  {hasRating ? ratingFormat.format(rating) : '—'}
                </strong>
                <span className={metaText}>
                  {profile?.reviewCount != null
                    ? `(${displayCount(profile.reviewCount)} avaliações)`
                    : 'Avaliações em breve'}
                </span>
              </div>
              {hasPercent ? (
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-state-success">
                  <Icon name="check-circle" size={16} />{' '}
                  {numberFormat.format(percent)}% positivas
                </span>
              ) : (
                <p className={`${metaText} mt-2`}>
                  Indicadores de avaliação em desenvolvimento.
                </p>
              )}
            </div>
          </div>

          {/* Dados de perfil e coleção alinhados em duas colunas. */}
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <section aria-labelledby="admin-profile-data">
              <h4 id="admin-profile-data" className={sectionHeading}>
                <Icon name="user" size={20} className={sectionIcon} /> Dados do
                perfil
              </h4>
              <dl className="mt-3 space-y-2.5">
                <ProfileRow icon="user" label="Nome" value={user.name} />
                <ProfileRow
                  icon="message-square"
                  label="E-mail"
                  value={user.email}
                />
                <ProfileRow
                  icon="map-pin"
                  label="País"
                  value={profile?.country || '—'}
                />
                <ProfileRow
                  icon="clock"
                  label="Data de nasc."
                  value={displayDate(profile?.birthDate)}
                />
              </dl>
            </section>
            <section
              aria-labelledby="admin-collection-metrics"
              className="border-t border-border-default pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0"
            >
              <h4 id="admin-collection-metrics" className={sectionHeading}>
                <Icon name="layers" size={20} className={sectionIcon} /> Coleção
              </h4>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MetricTile
                  icon="cards"
                  value={profile?.cardCount}
                  label="Cards"
                />
                <MetricTile
                  icon="star"
                  value={profile?.collectionCount}
                  label="Coleções"
                />
                <MetricTile
                  icon="layers"
                  value={profile?.listCount}
                  label="Listas"
                />
              </div>
            </section>
          </div>

          {/* Faixa inferior: status real e indicadores futuros. */}
          <div className="grid gap-3 rounded-surface border border-border-default bg-surface-input px-4 py-3 sm:grid-cols-3 sm:gap-0">
            <div className="min-w-0 sm:pr-3">
              <h4 className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Icon name="shield-check" size={20} className={sectionIcon} />{' '}
                Status da conta
              </h4>
              <div className="mt-1 pl-7">
                <Badge
                  variant={user.status === 'SUSPENDED' ? 'error' : 'success'}
                >
                  {STATUS_LABEL[user.status]}
                </Badge>
                <p className={`${metaText} mt-1`}>
                  {user.status === 'ACTIVE'
                    ? 'Conta ativa na plataforma.'
                    : 'Conta suspensa.'}
                </p>
              </div>
            </div>
            <div className="min-w-0 border-t border-border-default pt-3 sm:border-l sm:border-t-0 sm:px-3 sm:pt-0">
              <h4 className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Icon name="clock" size={20} className={sectionIcon} /> Última
                atividade
              </h4>
              <p className={`${metaText} mt-2 pl-7`}>
                {displayDateTime(profile?.lastActivityAt)}
              </p>
            </div>
            <div className="min-w-0 border-t border-border-default pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <h4 className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Icon name="cart" size={20} className={sectionIcon} /> Total de
                pedidos
              </h4>
              <p className="mt-2 pl-7 text-sm font-bold text-text-primary">
                {displayCount(profile?.orderCount)}
              </p>
            </div>
          </div>
        </section>

        {/* Preserva a funcionalidade existente sem alterar o layout-resumo. */}
        <details className="rounded-surface border border-border-default bg-surface-input px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue">
            Histórico de ações administrativas
          </summary>
          <div className="pt-3">
            {state.status === 'loading' ? (
              <p role="status" className={metaText}>
                Carregando histórico...
              </p>
            ) : state.status !== 'ready' ? (
              <div role="alert" className="space-y-3">
                <p className={metaText}>
                  Não foi possível carregar o histórico.
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className={modalSecondaryButton}
                >
                  Tentar novamente
                </button>
              </div>
            ) : state.data.length === 0 ? (
              <p className={metaText}>
                Nenhuma ação administrativa registrada para esta conta.
              </p>
            ) : (
              <AdminActionList
                label="Ações administrativas sobre a conta"
                actions={state.data}
              />
            )}
          </div>
        </details>
      </div>
    </Modal>
  )
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: IconName
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid min-w-0 grid-cols-[18px_100px_minmax(0,1fr)] items-start gap-2 text-xs sm:grid-cols-[18px_100px_minmax(0,1fr)]">
      <Icon name={icon} size={16} className="text-brand-deep" />
      <dt className="font-semibold text-text-primary">{label}</dt>
      <dd className="min-w-0 break-words text-text-primary">{value}</dd>
    </div>
  )
}

function MetricTile({
  icon,
  value,
  label,
}: {
  icon: IconName
  value?: number | null
  label: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-surface border border-border-default bg-surface-input px-2 py-3 text-center shadow-sm">
      <Icon name={icon} size={24} className="text-brand-deep" />
      <strong className="mt-1 text-base font-extrabold text-text-primary">
        {displayCount(value)}
      </strong>
      <span className="text-[11px] text-text-primary">{label}</span>
    </div>
  )
}
