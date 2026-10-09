import { clearSession, readToken } from '@/services/authStorage'
import type { HealthResponse } from '@/types/HealthResponse'
import axios from 'axios'

export const SESSION_EXPIRED_EVENT = 'tcgmarket:session-expired'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Só derruba a sessão quando o 401 responde a uma requisição que levou token.
api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers?.Authorization
  ) {
    clearSession()
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
  return Promise.reject(error)
})

export async function healthCheck() {
  const response = await api.get<HealthResponse>('/api/health')
  return response.data
}
