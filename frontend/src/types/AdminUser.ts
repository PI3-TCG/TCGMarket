import type { UserRole } from '@/types/User'

export type UserStatus = 'ACTIVE' | 'SUSPENDED'

export type ModeratedProfileField = 'BIO' | 'LINKS' | 'LOCATION'

export type AdminActionType =
  | 'ROLE_CHANGED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REACTIVATED'
  | 'PROFILE_MODERATED'

export interface AdminUser {
  id: string
  name: string
  username: string | null
  email: string
  role: UserRole
  status: UserStatus
  registrationDate: string
}

export interface AdminUserPage {
  content: AdminUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdminUserSearch {
  q?: string
  role?: UserRole
  status?: UserStatus
  page: number
}

export interface AdminActionParticipant {
  id: string
  name: string | null
  username: string | null
}

export interface AdminAction {
  id: string
  type: AdminActionType
  reason: string | null
  role: UserRole | null
  fields: ModeratedProfileField[]
  createdAt: string
  actor: AdminActionParticipant
  target: AdminActionParticipant
}
