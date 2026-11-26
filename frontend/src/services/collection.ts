import type { ListingSortOrder } from '@/components/ui/ListingSort'
import { api } from '@/services/api'
import type {
  AddToCollectionRequest,
  CardCollection,
  CollectionFilterOptions,
  CollectionFilterValues,
  CollectionItem,
  CollectionPage,
  CollectionSummaryResponse,
  UpdateCollectionItemRequest,
} from '@/types/Collection'

type CollectionQuery = {
  page?: number
  size?: number
  filters?: CollectionFilterValues
  sort?: ListingSortOrder
  collectionId?: string
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
  sort,
  collectionId,
  signal,
}: CollectionQuery = {}): Promise<CollectionPage> {
  const response = await api.get<CollectionPage>(
    '/api/users/me/collection',
    {
      params: {
        page,
        size,
        sort,
        collectionId,
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

export async function getMyCollectionItem(
  itemId: string,
): Promise<CollectionItem> {
  const response = await api.get<CollectionItem>(
    `/api/users/me/collection/${encodeURIComponent(itemId)}`,
  )

  return response.data
}

export async function getMyCollectionSummary(
  collectionId?: string,
  signal?: AbortSignal,
): Promise<CollectionSummaryResponse> {
  const response = await api.get<CollectionSummaryResponse>(
    '/api/users/me/collection/summary',
    { params: { collectionId }, signal },
  )

  return response.data
}

export async function getMyCollectionFilterOptions(
  collectionId?: string,
  signal?: AbortSignal,
): Promise<CollectionFilterOptions> {
  const response = await api.get<CollectionFilterOptions>(
    '/api/users/me/collection/filter-options',
    { params: { collectionId }, signal },
  )

  return response.data
}
export async function updateMyCollectionItem(
  itemId: string,
  request: UpdateCollectionItemRequest,
): Promise<void> {
  await api.patch(
    `/api/users/me/collection/${encodeURIComponent(itemId)}`,
    request,
  )
}

export async function removeMyCollectionItem(itemId: string): Promise<void> {
  await api.delete(`/api/users/me/collection/${encodeURIComponent(itemId)}`)
}

export async function listMyCollections(): Promise<CardCollection[]> {
  const response = await api.get<CardCollection[]>('/api/users/me/collections')
  return response.data
}

export async function createMyCollection(name: string): Promise<CardCollection> {
  const response = await api.post<CardCollection>('/api/users/me/collections', {
    name,
  })
  return response.data
}

export async function renameMyCollection(
  collectionId: string,
  name: string,
): Promise<CardCollection> {
  const response = await api.patch<CardCollection>(
    `/api/users/me/collections/${encodeURIComponent(collectionId)}`,
    { name },
  )
  return response.data
}

export async function deleteMyCollection(collectionId: string): Promise<void> {
  await api.delete(
    `/api/users/me/collections/${encodeURIComponent(collectionId)}`,
  )
}

export async function setMyCollectionCover(
  collectionId: string,
  itemId: string,
): Promise<CardCollection> {
  const response = await api.patch<CardCollection>(
    `/api/users/me/collections/${encodeURIComponent(collectionId)}/cover`,
    { itemId },
  )
  return response.data
}

export async function setMyCollectionVisibility(
  collectionId: string,
  visible: boolean,
): Promise<CardCollection> {
  const response = await api.patch<CardCollection>(
    `/api/users/me/collections/${encodeURIComponent(collectionId)}/visibility`,
    { visible },
  )
  return response.data
}