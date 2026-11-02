import axios from 'axios'
import { api } from '@/services/api'
import type { CreateTradeProposalRequest, TradeProposalResponse } from '@/types/TradeProposal'

export async function createTradeProposal(request: CreateTradeProposalRequest): Promise<TradeProposalResponse> {
  const response = await api.post<TradeProposalResponse>('/api/trade-proposals', request)
  return response.data
}

export type TradeSubmitFailure =
  | { kind: 'rejected'; message: string; status: number }
  | { kind: 'unknown' }

export function tradeSubmitFailure(cause: unknown): TradeSubmitFailure {
  if (axios.isAxiosError<{ message?: string }>(cause) && cause.response) {
    const status = cause.response.status
    if (status < 500) {
      return {
        kind: 'rejected',
        status,
        message: cause.response.data?.message ?? 'Não foi possível enviar esta proposta. Revise os dados e tente novamente.',
      }
    }
  }
  // Rede ou 5xx: é possível que o servidor tenha gravado a proposta.
  // Reutilizar requestKey em uma tentativa explícita do usuário.
  return { kind: 'unknown' }
}
