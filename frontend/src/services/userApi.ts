import { api } from '@/services/api'
import type { CreateUserRequest, UserResponse } from '@/types/User'

export async function registerUser(request: CreateUserRequest) {
  const response = await api.post<UserResponse>('/api/users', request)
  return response.data
}
