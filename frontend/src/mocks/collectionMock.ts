import type { CollectionItem } from '@/types/Collection'

// Dados fictícios usados apenas para desenvolver a interface.
const mockItems: Omit<CollectionItem, 'availability'>[] = [
  {
    id: 'posse-demo-1',
    quantity: 3,
    condition: 'NEAR_MINT',
    language: 'PORTUGUESE',
    card: {
      id: 'carta-demo-1',
      name: 'Pikachu',
      game: 'POKEMON',
      edition: 'Edição demonstrativa Pokémon',
      cardNumber: '025',
      officialRarity: 'Common',
      imageUrl: '',
    },
  },
  {
    id: 'posse-demo-2',
    quantity: 1,
    condition: 'LIGHTLY_PLAYED',
    language: 'ENGLISH',
    card: {
      id: 'carta-demo-1',
      name: 'Pikachu',
      game: 'POKEMON',
      edition: 'Edição demonstrativa Pokémon',
      cardNumber: '025',
      officialRarity: 'Common',
      imageUrl: '',
    },
  },
  {
    id: 'posse-demo-3',
    quantity: 2,
    condition: 'MODERATELY_PLAYED',
    language: 'JAPANESE',
    card: {
      id: 'carta-demo-2',
      name: 'Dark Magician',
      game: 'YUGIOH',
      edition: 'Edição demonstrativa Yu-Gi-Oh!',
      cardNumber: '001',
      officialRarity: 'Ultra Rare',
      imageUrl: '',
    },
  },
]

export const collectionMock: CollectionItem[] = mockItems.map((item) => ({
  ...item,
  availability: {
    totalQuantity: item.quantity,
    committedQuantity: 0,
    availableQuantity: item.quantity,
  },
}))