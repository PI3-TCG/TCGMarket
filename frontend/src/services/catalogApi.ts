import { api } from '@/services/api'
import type { CatalogPageResponse } from '@/types/Catalog'

export async function getCatalogCards(game: string,page: number, size: number) {
  const response = await api.get<CatalogPageResponse>('/api/catalog/cards', {
    params: { game, page, size },
  })

  return response.data
}
