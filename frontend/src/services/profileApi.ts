import { api } from '@/services/api'
import type {
  ProfileResponse,
  PublicProfileResponse,
  UpdateProfileRequest,
} from '@/types/User'

export async function getOwnProfile() {
  const response = await api.get<ProfileResponse>('/api/users/me/profile')
  return response.data
}

export async function updateOwnProfile(request: UpdateProfileRequest) {
  const response = await api.put<ProfileResponse>(
    '/api/users/me/profile',
    request,
  )
  return response.data
}

export async function getPublicProfile(username: string) {
  const response = await api.get<PublicProfileResponse>(
    `/api/users/${encodeURIComponent(username)}/profile`,
  )
  return response.data
}

export interface ProfileSettings {
  collectionPublic: boolean
  avatarUrl: string | null
  bannerUrl: string | null
}
export interface PublicSummary extends ProfileSettings {
  completedTransactions: number
}
export interface ProfileActivity {
  id: string
  kind: 'AD' | 'TRANSACTION' | 'PROPOSAL'
  description: string
  occurredAt: string
  status: string
}
export interface ProfileDashboard {
  totalGames: number
  totalCopies: number
  activeAds: number
  publishedAds: number
  completedTransactions: number
  activities: ProfileActivity[]
}
export const getProfileDashboard = async () =>
  (await api.get<ProfileDashboard>('/api/users/me/profile/dashboard')).data
export const getProfileSettings = async () =>
  (await api.get<ProfileSettings>('/api/users/me/profile/settings')).data
export const saveProfileSettings = async (value: ProfileSettings) =>
  (await api.put<ProfileSettings>('/api/users/me/profile/settings', value)).data
export const getPublicSummary = async (username: string) =>
  (
    await api.get<PublicSummary>(
      `/api/users/${encodeURIComponent(username)}/profile/summary`,
    )
  ).data
export interface PublicCollectionPage {
  content: { card: import('@/types/Catalog').CatalogCard; quantity: number }[]
  number: number
  first: boolean
  last: boolean
  totalElements: number
}
export const getPublicCollection = async (
  username: string,
  page: number,
  filters?: import('@/types/Collection').CollectionFilterValues,
) =>
  (
    await api.get<PublicCollectionPage>(
      `/api/users/${encodeURIComponent(username)}/profile/collection`,
      {
        params: {
          page,
          size: 20,
          search: filters?.search.trim() || undefined,
          game: filters?.game || undefined,
          edition: filters?.edition || undefined,
          rarity: filters?.rarity || undefined,
          condition: filters?.condition || undefined,
          language: filters?.language || undefined,
        },
      },
    )
  ).data

export const getPublicCollectionFilterOptions = async (username: string) =>
  (
    await api.get<import('@/types/Collection').CollectionFilterOptions>(
      `/api/users/${encodeURIComponent(username)}/profile/collection/filter-options`,
    )
  ).data
