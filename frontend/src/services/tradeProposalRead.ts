import { api } from '@/services/api'
import type {
  TradeProposalDirection,
  TradeProposalStatus,
  TradeProposalView,
  TradeProposalsPage,
} from '@/types/TradeProposalView'

export async function getMyTradeProposals({
  direction,
  status,
  page,
  size = 10,
  signal,
}: {
  direction: TradeProposalDirection
  status?: TradeProposalStatus
  page: number
  size?: number
  signal?: AbortSignal
}): Promise<TradeProposalsPage> {
  const response = await api.get<TradeProposalsPage>('/api/users/me/trade-proposals', {
    params: { direction: direction.toLowerCase(), status, page, size },
    signal,
  })
  return response.data
}

export async function getTradeProposalDetails(
  id: string,
  signal?: AbortSignal,
): Promise<TradeProposalView> {
  const response = await api.get<TradeProposalView>(
    `/api/trade-proposals/${encodeURIComponent(id)}`,
    { signal },
  )
  return response.data
}
