import { api } from '@/services/api'
import type { CatalogCard, CatalogCardResponse } from '@/types/Catalog'


export async function searchCatalogCards(
  game: string,
  query: string,
): Promise<CatalogCard[]> {
  const q = query.trim()
  if (!q) return []
  const response = await api.get<CatalogCardResponse[]>(
    `/api/catalog/${encodeURIComponent(game)}/cards`,
    {
      params: { q },
    },
  )
  return response.data.map((card) => ({
    id: `${card.cardGame}:${card.externalId}`,
    name: card.name,
    game: game,
    edition: card.setName ?? '',
    cardNumber: card.cardNumber ?? '',
    officialRarity: card.rarity || 'Não informada',
    imageUrl: card.imageUrl || '',
  }))
}
