import { readToken } from '@/services/authStorage'
import type { HealthResponse } from '@/types/HealthResponse'
import axios from 'axios'

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

export async function healthCheck() {
  const response = await api.get<HealthResponse>('/api/health')
  return response.data
}
