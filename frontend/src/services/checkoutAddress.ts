// Endereço escolhido para a compra atual. Fica na aba para sobreviver ao
// vaivém entre carrinho, entrega e revisão sem virar preferência do cadastro.
const KEY_PREFIX = 'tcgmarket.checkout.address.'

export function readCheckoutAddress(userId: string): string | null {
  try {
    return sessionStorage.getItem(KEY_PREFIX + userId)
  } catch {
    return null
  }
}

export function writeCheckoutAddress(userId: string, addressId: string) {
  try {
    sessionStorage.setItem(KEY_PREFIX + userId, addressId)
  } catch {
    // Sem storage a seleção vale só enquanto a página estiver aberta.
  }
}
