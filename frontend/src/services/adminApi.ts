import { api } from '@/services/api'
import type {
  UpdateUserRoleRequest,
  UserResponse,
  UserRole,
} from '@/types/User'

export async function listUsers() {
  const response = await api.get<UserResponse[]>('/api/admin/users')
  return response.data
}

export async function changeUserRole(id: string, role: UserRole) {
  const request: UpdateUserRoleRequest = { role }
  const response = await api.patch<UserResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/role`,
    request,
  )
  return response.data
}
