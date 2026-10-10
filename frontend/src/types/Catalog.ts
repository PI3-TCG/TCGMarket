export interface CatalogCard {
  id: string
  name: string
  game: string
  edition: string
  cardNumber: string
  officialRarity: string
  imageUrl: string
}

export interface CatalogPageResponse {
  content: CatalogCard[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface CatalogCardResponse {
  externalId: string
  conceptualId: string
  name: string
  cardGame: 'POKEMON' | 'YUGIOH' | 'MAGIC_THE_GATHERING'
  setName: string | null
  setCode: string | null
  cardNumber: string | null
  rarity: string | null
  imageUrl: string | null
}
