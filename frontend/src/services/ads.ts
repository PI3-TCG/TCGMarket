import { api } from '@/services/api'
import type {
  AdResponse,
  CreateAdRequest,
  OwnAd,
  OwnAdFilterValues,
  OwnAdPage,
  UpdateAdRequest,
} from '@/types/Ad'

export async function createAd(request: CreateAdRequest): Promise<AdResponse> {
  const response = await api.post<AdResponse>('/api/users/me/ads', request)
  return response.data
}

type OwnAdsQuery = {
  page?: number
  size?: number
  filters?: OwnAdFilterValues
  signal?: AbortSignal
}

export async function getMyAds({
  page = 0,
  size = 20,
  filters,
  signal,
}: OwnAdsQuery = {}): Promise<OwnAdPage> {
  const response = await api.get<OwnAdPage>('/api/users/me/ads', {
    params: {
      page,
      size,
      search: filters?.search.trim() || undefined,
      modality: filters?.modality || undefined,
      game: filters?.game || undefined,
      status: filters?.status || undefined,
    },
    signal,
  })
  return response.data
}

export async function getMyAd(adId: string): Promise<OwnAd> {
  const response = await api.get<OwnAd>(
    `/api/users/me/ads/${encodeURIComponent(adId)}`,
  )
  return response.data
}

export async function updateMyAd(
  adId: string,
  request: UpdateAdRequest,
): Promise<OwnAd> {
  const response = await api.patch<OwnAd>(
    `/api/users/me/ads/${encodeURIComponent(adId)}`,
    request,
  )
  return response.data
}

export async function cancelMyAd(adId: string): Promise<OwnAd> {
  const response = await api.post<OwnAd>(
    `/api/users/me/ads/${encodeURIComponent(adId)}/cancel`,
  )
  return response.data
}
