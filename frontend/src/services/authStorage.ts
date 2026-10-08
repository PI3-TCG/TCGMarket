import type { UserResponse } from '@/types/User'

const TOKEN_KEY = 'tcgmarket.token'
const USER_KEY = 'tcgmarket.user'

export function readToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function readStoredUser(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as UserResponse
  } catch {
    return null
  }
}

export function saveSession(token: string, user: UserResponse) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
