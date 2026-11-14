import { formatCurrency } from '@/components/ads/adFormat'
import type { IconName } from '@/components/ui/Icon'
import type {
  TransactionHistoryEntry,
  TransactionHistorySearch,
  TransactionHistoryStatus,
  TransactionHistoryType,
} from '@/types/TransactionHistory'

export const historyTypeMeta: Record<
  TransactionHistoryType,
  { label: string; counterpartyRole: string; className: string }
> = {
  PURCHASE: {
    label: 'Compra',
    counterpartyRole: 'Vendedor',
    className: 'bg-rare-100 text-rare-700',
  },
  SALE: {
    label: 'Venda',
    counterpartyRole: 'Comprador',
    className: 'bg-primary-100 text-primary-900',
  },
  TRADE: {
    label: 'Troca',
    counterpartyRole: 'Parceiro de troca',
    className: 'bg-secondary-100 text-secondary-700',
  },
}

/** Cor e ícone juntos: a cor nunca é a única forma de identificar o status. */
export const historyStatusMeta: Record<
  TransactionHistoryStatus,
  { label: string; icon: IconName; className: string }
> = {
  COMPLETED: {
    label: 'Concluída',
    icon: 'check-circle',
    className: 'bg-success-50 text-success-700',
  },
}

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatHistoryDate(iso: string) {
  return dateTime.format(new Date(iso))
}

export function counterpartyName(entry: TransactionHistoryEntry) {
  return entry.counterparty?.name ?? 'Usuário indisponível'
}

export function adjustmentLabel(entry: TransactionHistoryEntry) {
  const adjustment = entry.financialAdjustment
  if (!adjustment) {
    return 'Sem complemento'
  }
  return `${adjustment.direction === 'SENT' ? 'Você pagou' : 'Você recebeu'} ${formatCurrency(adjustment.amount)}`
}

export function parseHistorySearch(
  search: Record<string, unknown>,
): TransactionHistorySearch {
  const type =
    search.type === 'PURCHASE' || search.type === 'SALE' || search.type === 'TRADE'
      ? search.type
      : undefined
  const page = Number(search.page)

  return {
    type,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  }
}
