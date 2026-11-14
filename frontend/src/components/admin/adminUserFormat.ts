import type {
  AdminAction,
  ModeratedProfileField,
  UserStatus,
} from '@/types/AdminUser'
import type { UserRole } from '@/types/User'

export const REASON_MIN = 10
export const REASON_MAX = 300

export const ROLE_LABEL: Record<UserRole, string> = {
  USER: 'Usuário',
  ADMIN: 'Administrador',
}

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Ativa',
  SUSPENDED: 'Suspensa',
}

export const FIELD_LABEL: Record<ModeratedProfileField, string> = {
  BIO: 'Bio',
  LINKS: 'Links',
  LOCATION: 'Cidade/UF',
}

export function reasonError(reason: string) {
  const length = reason.trim().length
  return length < REASON_MIN || length > REASON_MAX
    ? `O motivo deve ter entre ${REASON_MIN} e ${REASON_MAX} caracteres.`
    : null
}

export function describeAction(action: AdminAction) {
  switch (action.type) {
    case 'ROLE_CHANGED':
      return action.role
        ? `Perfil alterado para ${ROLE_LABEL[action.role].toLowerCase()}`
        : 'Perfil alterado'
    case 'ACCOUNT_SUSPENDED':
      return 'Conta suspensa'
    case 'ACCOUNT_REACTIVATED':
      return 'Conta reativada'
    case 'PROFILE_MODERATED':
      return `Conteúdo do perfil removido: ${action.fields.map((field) => FIELD_LABEL[field].toLowerCase()).join(', ')}`
  }
}

export function participantName(participant: AdminAction['actor']) {
  return participant.name ?? 'Conta removida'
}
