import type { IconName } from '@/components/ui/Icon'
import type { AdStatus } from '@/types/Ad'
import type { CardCondition, CardLanguage } from '@/types/Collection'

export const MAX_UNIT_PRICE = 999999.99

export const gameLabels: Record<string, string> = {
  POKEMON: 'Pokémon',
  YUGIOH: 'Yu-Gi-Oh!',
  MAGIC_THE_GATHERING: 'Magic',
}

export const conditionLabels: Record<CardCondition, string> = {
  NEAR_MINT: 'Near Mint',
  LIGHTLY_PLAYED: 'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED: 'Heavily Played',
  DAMAGED: 'Damaged',
}

export const languageLabels: Record<CardLanguage, string> = {
  PORTUGUESE: 'Português',
  ENGLISH: 'Inglês',
  JAPANESE: 'Japonês',
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const plainDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number) {
  return currency.format(value)
}

/** Valor do campo de preço já normalizado, sem o prefixo R$. */
export function formatPriceInput(value: number) {
  return plainDecimal.format(value)
}

/**
 * Lê um preço digitado no formato brasileiro ("45", "45,5", "1.234,56").
 * Devolve `null` para campo vazio e `NaN` para valor inválido.
 */
export function parsePrice(text: string): number | null {
  const cleaned = text.replace(/R\$/g, '').replace(/\s/g, '')
  if (cleaned === '') return null

  if (!/^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/.test(cleaned)) return NaN

  const value = Number(cleaned.replace(/\./g, '').replace(',', '.'))
  return value > 0 && value <= MAX_UNIT_PRICE ? value : NaN
}

export function copies(quantity: number) {
  return `${quantity} ${quantity === 1 ? 'exemplar' : 'exemplares'}`
}

export function availableCopies(quantity: number) {
  return quantity === 1 ? '1 disponível' : `${quantity} disponíveis`
}

/** Cor e ícone juntos: a cor nunca é a única forma de identificar o status. */
export const adStatusMeta: Record<
  AdStatus,
  { label: string; icon: IconName; className: string }
> = {
  ACTIVE: {
    label: 'Ativo',
    icon: 'check-circle',
    className: 'bg-success-50 text-success-700',
  },
  PENDING: {
    label: 'Pendente',
    icon: 'alert',
    className: 'bg-warning-50 text-warning-700',
  },
  SOLD_OUT: {
    label: 'Finalizado',
    icon: 'check-circle',
    className: 'bg-info-50 text-info-700',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: 'close-circle',
    className: 'bg-neutral-100 text-neutral-700',
  },
}

export function modalityLabel(sale: boolean, trade: boolean) {
  if (sale && trade) return 'Venda e troca'
  if (sale) return 'Somente venda'
  if (trade) return 'Somente troca'
  return 'Nenhuma modalidade'
}
