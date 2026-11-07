
import axios from 'axios'
import { api } from '@/services/api'
import type { TradeProposalStatus } from '@/types/TradeProposalView'

export type TradeProposalAction = 'accept' | 'reject' | 'cancel'

type DecisionResponse = {
  status: TradeProposalStatus
}

export async function decideTradeProposal(
  id: string,
  action: TradeProposalAction,
): Promise<DecisionResponse> {
  const response = await api.patch<DecisionResponse>(
    `/api/trade-proposals/${encodeURIComponent(id)}/${action}`,
  )

  return response.data
}

export type TradeDecisionFailure =
  | { kind: 'conflict'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'notFound'; message: string }
  | { kind: 'unknown'; message: string }

export function tradeDecisionFailure(
  error: unknown,
): TradeDecisionFailure {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 409) {
      return {
        kind: 'conflict',
        message: message ?? 'A proposta mudou ou as cartas não estão mais disponíveis.',
      }
    }

    if (status === 403) {
      return {
        kind: 'forbidden',
        message: message ?? 'Você não tem permissão para realizar esta ação.',
      }
    }

    if (status === 404) {
      return {
        kind: 'notFound',
        message: 'A proposta não foi encontrada ou não está mais acessível.',
      }
    }
  }

  return {
    kind: 'unknown',
    message: 'Não foi possível confirmar o resultado. Verifique o status atualizado antes de tentar novamente.',
  }
}
