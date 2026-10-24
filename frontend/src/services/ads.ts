import { api } from '@/services/api'
import type { AdResponse, CreateAdRequest } from '@/types/Ad'

export async function createAd(request: CreateAdRequest): Promise<AdResponse> {
  const response = await api.post<AdResponse>('/api/users/me/ads', request)
  return response.data
}

