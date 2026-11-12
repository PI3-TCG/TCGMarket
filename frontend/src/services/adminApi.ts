import { api } from '@/services/api'
import type {
  AdminCatalogCard,
  AdminCatalogPage,
  AdminCatalogSearch,
  AdminCatalogSummary,
  HideCardRequest,
} from '@/types/AdminCatalog'
import type {
  AdminAction,
  AdminUser,
  AdminUserPage,
  AdminUserSearch,
  ModeratedProfileField,
  UserStatus,
} from '@/types/AdminUser'
import type { UpdateUserRoleRequest, UserRole } from '@/types/User'

export const ADMIN_CATALOG_PAGE_SIZE = 20
export const ADMIN_USERS_PAGE_SIZE = 20

function userPath(id: string) {
  return `/api/admin/users/${encodeURIComponent(id)}`
}

export async function searchUsers(search: AdminUserSearch) {
  const response = await api.get<AdminUserPage>('/api/admin/users', {
    params: {
      q: search.q || undefined,
      role: search.role,
      status: search.status,
      page: search.page - 1,
      size: ADMIN_USERS_PAGE_SIZE,
    },
  })
  return response.data
}

export async function changeUserRole(id: string, role: UserRole) {
  const request: UpdateUserRoleRequest = { role }
  const response = await api.patch<AdminUser>(`${userPath(id)}/role`, request)
  return response.data
}

export async function changeUserStatus(
  id: string,
  status: UserStatus,
  reason: string,
) {
  const response = await api.patch<AdminUser>(`${userPath(id)}/status`, {
    status,
    reason,
  })
  return response.data
}

export async function moderateUserProfile(
  id: string,
  fields: ModeratedProfileField[],
  reason: string,
) {
  const response = await api.post<AdminUser>(
    `${userPath(id)}/profile/moderation`,
    { fields, reason },
  )
  return response.data
}

export async function fetchUserActions(id: string) {
  const response = await api.get<AdminAction[]>(`${userPath(id)}/actions`)
  return response.data
}

export async function fetchRecentAdminActions(limit = 6) {
  const response = await api.get<AdminAction[]>('/api/admin/events', {
    params: { limit },
  })
  return response.data
}

export async function searchAdminCatalog(search: AdminCatalogSearch) {
  const response = await api.get<AdminCatalogPage>('/api/admin/catalog/cards', {
    params: {
      game: search.game,
      q: search.q,
      set: search.set,
      rarity: search.rarity,
      type: search.type,
      visibility: search.visibility,
      page: (search.page ?? 1) - 1,
      size: ADMIN_CATALOG_PAGE_SIZE,
    },
  })
  return response.data
}

export async function fetchAdminCatalogSummary() {
  const response = await api.get<AdminCatalogSummary>(
    '/api/admin/catalog/summary',
  )
  return response.data
}

export async function hideCatalogCard(id: string, reason: string) {
  const request: HideCardRequest = { reason }
  const response = await api.put<AdminCatalogCard>(
    `/api/admin/catalog/cards/${encodeURIComponent(id)}/hidden`,
    request,
  )
  return response.data
}

export async function unhideCatalogCard(id: string) {
  const response = await api.delete<AdminCatalogCard>(
    `/api/admin/catalog/cards/${encodeURIComponent(id)}/hidden`,
  )
  return response.data
}
