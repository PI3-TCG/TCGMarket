import { api } from '@/services/api'
import type { LoginRequest, LoginResponse, UserResponse } from '@/types/User'

export async function login(request: LoginRequest) {
  const response = await api.post<LoginResponse>('/api/auth/login', request)
  return response.data
}

export async function currentUser() {
  const response = await api.get<UserResponse>('/api/auth/me')
  return response.data
}
