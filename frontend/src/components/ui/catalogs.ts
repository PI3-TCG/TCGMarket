import type { IconName } from './Icon'

export const CATALOGS = [
  { id: 'magic', label: 'Magic', icon: 'crest-magic' },
  { id: 'pokemon', label: 'Pokémon', icon: 'crest-pokemon' },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: 'crest-yugioh' },
  { id: 'one-piece', label: 'One Piece', icon: 'crest-onepiece' },
  { id: 'digimon', label: 'Digimon', icon: 'crest-digimon' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  icon: IconName
}>

export const MOBILE_TABS = [
  { id: 'inicio', label: 'Início', icon: 'home' },
  { id: 'catalogo', label: 'Catálogo', icon: 'grid' },
  { id: 'favoritos', label: 'Favoritos', icon: 'heart' },
  { id: 'perfil', label: 'Perfil', icon: 'user' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  icon: IconName
}>
