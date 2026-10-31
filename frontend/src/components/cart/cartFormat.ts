import type { CartItem, CheckoutIssueCode, CheckoutValidation } from '@/types/Cart'

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

const issueLabels: Record<CheckoutIssueCode, string> = {
  AD_NOT_FOUND: 'anúncio removido',
  AD_CANCELLED: 'anúncio cancelado',
  AD_SOLD_OUT: 'anúncio esgotado',
  SALE_DISABLED: 'não está mais à venda',
  QUANTITY_UNAVAILABLE: 'quantidade indisponível',
  PRICE_CHANGED: 'preço alterado',
  OWN_AD: 'anúncio próprio',
  SELLER_CHANGED: 'vendedor alterado',
  CARD_NOT_FOUND: 'carta não encontrada',
}

export function issueLines(validation: CheckoutValidation, items: CartItem[]) {
  return validation.items.map((issue) => {
    const name = items.find((item) => item.adId === issue.adId)?.cardName ?? 'Anúncio indisponível'
    return `${name}: ${issue.issues.map((code) => issueLabels[code]).join(', ')}`
  })
}
