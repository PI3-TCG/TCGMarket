import { modalPrimaryButton } from '@/components/ui/modalTheme'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/services/api'

interface TradeReviewNotification {
  transactionId: string
  completedAt: string | null
}

interface TradeNotifications {
  proposals: { proposalId: string; createdAt: string | null }[]
  reviews: TradeReviewNotification[]
}

export function TradeReviewNotifications() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<TradeNotifications | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let fetching = false
    async function refresh() {
      if (fetching || controller.signal.aborted) return
      fetching = true
      try {
        const { data } = await api.get<TradeNotifications>(
          '/api/users/me/notifications/trades',
          { signal: controller.signal },
        )
        if (!controller.signal.aborted) {
          setItems(data)
          setFailed(false)
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      } finally {
        fetching = false
      }
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), 30_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [open])

  const hasNotifications = Boolean(items?.proposals.length || items?.reviews.length)

  return (
    <>
      <button
        type="button"
        className="relative rounded-full p-2 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-secondary-500"
        aria-label={
          hasNotifications
            ? 'Notificações com ações pendentes'
            : 'Notificações'
        }
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="bell" size={24} />
        {hasNotifications && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 size-2.5 rounded-full bg-error-600"
          />
        )}
      </button>
      {open && (
        <Modal
          open
          title="Notificações"
          headerIcon="bell"
          secondaryAction={{ label: 'Fechar' }}
          onClose={() => setOpen(false)}
        >
          {failed && (
            <p role="alert">Não foi possível atualizar as notificações.</p>
          )}
          {!failed && items === null && (
            <p role="status">Carregando notificações...</p>
          )}
          {!failed && items && !hasNotifications && (
            <p>Você não tem notificações pendentes.</p>
          )}
          {hasNotifications && (
            <ul className="divide-y divide-border-default">
              {items?.proposals.map(({ proposalId, createdAt }) => (
                <li key={`proposal:${proposalId}`} className="space-y-2 py-3">
                  <p>Você recebeu uma proposta de troca.</p>
                  {createdAt && (
                    <time dateTime={createdAt} className="block text-xs text-text-secondary">
                      {new Date(createdAt).toLocaleString('pt-BR')}
                    </time>
                  )}
                  <Link
                    to="/perfil/propostas"
                    search={{ direction: 'RECEIVED', status: 'PENDING', proposalId }}
                    onClick={() => setOpen(false)}
                    className={modalPrimaryButton}
                  >
                    Ver proposta
                  </Link>
                </li>
              ))}
              {items?.reviews.map(({ transactionId, completedAt }) => (
                <li key={transactionId} className="space-y-2 py-3">
                  <p>Sua proposta de troca foi concluída.</p>
                  {completedAt && (
                    <time
                      dateTime={completedAt}
                      className="block text-xs text-text-secondary"
                    >
                      {new Date(completedAt).toLocaleString('pt-BR')}
                    </time>
                  )}
                  <Link
                    to="/perfil/historico/$transactionId"
                    params={{ transactionId }}
                    search={{ type: 'TRADE' }}
                    onClick={() => setOpen(false)}
                    className={modalPrimaryButton}
                  >
                    Avaliar troca
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  )
}
