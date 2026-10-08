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
