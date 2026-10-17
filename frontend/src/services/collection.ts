import { api } from '@/services/api'
import type {
  AddToCollectionRequest,
  CollectionFilterOptions,
  CollectionFilterValues,
  CollectionPage,
  CollectionSummaryResponse,
} from '@/types/Collection'

type CollectionQuery = {
  page?: number
  size?: number
  filters?: CollectionFilterValues
  signal?: AbortSignal
}
export async function addToMyCollection(
  request: AddToCollectionRequest,
): Promise<void> {
  await api.post('/api/users/me/collection', request)
}

export async function getMyCollection({
  page = 0,
  size = 20,
  filters,
  signal,
}: CollectionQuery = {}): Promise<CollectionPage> {
  const response = await api.get<CollectionPage>(
    '/api/users/me/collection',
    {
      params: {
        page,
        size,
        search: filters?.search.trim() || undefined,
        game: filters?.game || undefined,
        edition: filters?.edition || undefined,
        rarity: filters?.rarity || undefined,
        condition: filters?.condition || undefined,
        language: filters?.language || undefined,
      },
      signal,
    },
  )

  return response.data
}

export async function getMyCollectionSummary(
  signal?: AbortSignal,
): Promise<CollectionSummaryResponse> {
  const response = await api.get<CollectionSummaryResponse>(
    '/api/users/me/collection/summary',
    { signal },
  )

  return response.data
}

export async function getMyCollectionFilterOptions(
  signal?: AbortSignal,
): Promise<CollectionFilterOptions> {
  const response = await api.get<CollectionFilterOptions>(
    '/api/users/me/collection/filter-options',
    { signal },
  )

  return response.data
}
