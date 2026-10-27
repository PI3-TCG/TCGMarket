import type { CartItem } from '@/types/Cart'

/** Preço usado nos totais: o novo preço, enquanto o comprador não aceitá-lo, aparece como proposta. */
export function itemUnitPrice(item: CartItem) {
  return item.priceChanged && item.currentUnitPrice !== null
    ? item.currentUnitPrice
    : item.acceptedUnitPrice
}

export function itemSubtotal(item: CartItem) {
  return itemUnitPrice(item) * item.quantity
}

/** Item selecionado que impede continuar até o comprador resolver. */
export function needsReview(item: CartItem) {
  return (
    item.selected && (item.availability === 'REDUCED' || item.priceChanged)
  )
}

export function itemName(item: CartItem) {
  return item.cardName ?? 'Anúncio indisponível'
}

export function adsCount(count: number) {
  return `${count} ${count === 1 ? 'anúncio' : 'anúncios'}`
}
