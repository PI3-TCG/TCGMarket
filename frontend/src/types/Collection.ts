import type { CardGame } from './Catalog'

export type CardCondition =
  | 'NEAR_MINT'
  | 'LIGHTLY_PLAYED'
  | 'MODERATELY_PLAYED'
  | 'HEAVILY_PLAYED'
  | 'DAMAGED'

export type CardLanguage =
  | 'PORTUGUESE'
  | 'ENGLISH'
  | 'JAPANESE'

export interface CollectionCard {
  id: string
  name: string
  game: CardGame
  edition: string
  cardNumber: string
  officialRarity: string
  imageUrl: string
}

export interface CollectionItem {
  id: string
  quantity: number
  condition: CardCondition
  language: CardLanguage
  card: CollectionCard
}

export interface CollectionPage {
  content: CollectionItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface CollectionSummaryResponse {
  totalItems: number
  totalCopies: number
  totalGames: number
}

export type CollectionFilterValues = {
  search: string
  game: string
  edition: string
  rarity: string
  condition: string
  language: string
}

export interface CollectionFilterOptions {
  editions: string[]
  rarities: string[]
}