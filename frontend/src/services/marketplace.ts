import { api } from '@/services/api'
import type {
  MarketplaceAd,
  MarketplaceFilters,
  MarketplacePageResponse,
  MarketplaceSort,
} from '@/types/Marketplace'

export async function getMarketplaceAds(
  page = 1,
  sort: MarketplaceSort = 'recent',
  filters?: MarketplaceFilters,
): Promise<MarketplacePageResponse> {
  const response = await api.get<MarketplacePageResponse>(
    '/api/marketplace/ads',
    {
      params: {
        page,
        sort,
        search: filters?.search.trim() || undefined,
        game: filters?.game || undefined,
        modality: filters?.modality || undefined,
        edition: filters?.edition.trim() || undefined,
        rarity: filters?.rarity.trim() || undefined,
        condition: filters?.condition || undefined,
        language: filters?.language || undefined,
        minPrice: filters?.minPrice || undefined,
        maxPrice: filters?.maxPrice || undefined,
      },
    },
  )

  return response.data
}

export async function getMarketplaceAd(
  id: string,
): Promise<MarketplaceAd> {
  const response = await api.get<MarketplaceAd>(
    `/api/marketplace/ads/${encodeURIComponent(id)}`,
  )

  return response.data
}