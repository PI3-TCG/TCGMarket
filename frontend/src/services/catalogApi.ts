import { api } from '@/services/api'
import type {
  CardLocalizations,
  CatalogCard,
  CatalogCardDetails,
  CatalogCardResponse,
  CatalogFilters,
  CatalogPage,
  CatalogPageResponse,
  CatalogSearch,
} from '@/types/Catalog'

export const CATALOG_PAGE_SIZE = 20

export async function searchCatalogCards(
  game: string,
  search: CatalogSearch,
): Promise<CatalogPage> {
  const response = await api.get<CatalogPageResponse>(
    `/api/catalog/${encodeURIComponent(game)}/cards`,
    {
      params: {
        q: search.q,
        set: search.set,
        rarity: search.rarity,
        type: search.type,
        sort: search.sort,
        page: (search.page ?? 1) - 1,
        size: CATALOG_PAGE_SIZE,
      },
    },
  )
  return {
    ...response.data,
    content: response.data.content.map((card) => toCatalogCard(card, game)),
  }
}

export async function fetchCatalogFilters(
  game: string,
): Promise<CatalogFilters> {
  const response = await api.get<CatalogFilters>(
    `/api/catalog/${encodeURIComponent(game)}/filters`,
  )
  return response.data
}

export async function fetchCatalogCard(
  id: string,
): Promise<CatalogCardDetails> {
  const response = await api.get<CatalogCardDetails>(
    `/api/catalog/cards/${encodeURIComponent(id)}`,
  )
  return response.data
}

function toCatalogCard(card: CatalogCardResponse, game: string): CatalogCard {
  return {
    id: card.id,
    name: card.name,
    namePt: localizedName(card.name, card.localizations),
    game: game,
    edition: card.setName ?? '',
    cardNumber: card.cardNumber ?? '',
    officialRarity: card.rarity || 'Não informada',
    imageUrl: card.imageUrl || '',
  }
}

/** Nome em português para exibir junto do inglês; null quando não há tradução ou é igual. */
export function localizedName(
  name: string,
  localizations: CardLocalizations | null | undefined,
): string | null {
  const pt = localizations?.pt?.name?.trim()
  return pt && pt.toLowerCase() !== name.trim().toLowerCase() ? pt : null
}
