import { cardSurface } from '@/components/ui/Card'
import { copies, formatCurrency } from '@/components/ads/adFormat'
import {
  adsCount,
  itemName,
  itemSubtotal,
  itemUnitPrice,
} from '@/components/cart/cartFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { CartItem } from '@/types/Cart'
import { useNavigate } from '@tanstack/react-router'
import { useId } from 'react'

type DeliverySummaryProps = {
  items: CartItem[]
  /** Motivo que impede continuar; ausente quando a compra pode seguir. */
  blocker: string | null
}

export function DeliverySummary({ items, blocker }: DeliverySummaryProps) {
  const id = useId()
  const navigate = useNavigate()
  const totalCopies = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + itemSubtotal(item), 0)

  return (
    <aside
      aria-labelledby={`${id}-title`}
      className={`${cardSurface} min-w-0 space-y-3 p-4 sm:p-5`}
    >
      <h2
        id={`${id}-title`}
        className="font-display text-xl font-bold text-primary-900"
      >
        Resumo da compra
      </h2>

      {items.length > 0 ? (
        <>
          <ul className="divide-y divide-border-default">
            {items.map((item) => (
              <li
                key={item.adId}
                className="flex flex-wrap items-center gap-2 py-2"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded object-contain"
                  />
                ) : (
                  <span className="h-14 w-10 shrink-0 rounded bg-neutral-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="wrap-anywhere font-display font-bold text-secondary-700">
                    {itemName(item)}
                  </p>
                  <p className="text-xs text-neutral-700">
                    {item.quantity} × {formatCurrency(itemUnitPrice(item))}
                  </p>
                </div>
                <p className="font-display font-bold text-primary-900">
                  {formatCurrency(itemSubtotal(item))}
                </p>
              </li>
            ))}
          </ul>

          <p className="border-t border-border-default pt-2 text-sm text-neutral-700">
            {adsCount(items.length)} • {copies(totalCopies)}
          </p>

          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 wrap-anywhere">
            <span className="text-neutral-900">Subtotal dos itens</span>
            <span className="font-display text-xl font-bold text-primary-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-border-default pt-2 text-sm">
        <span className="font-semibold">Frete</span>
        <span className="text-text-secondary">
          Não incluído nesta simulação
        </span>
      </div>

      <div className="space-y-2">
        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado.
        </Alert>

        <div className="flex justify-center">
          <Button
            className="w-52 max-w-full whitespace-normal"
            disabled={blocker !== null}
            aria-describedby={blocker ? `${id}-hint` : undefined}
            onClick={() => navigate({ to: '/carrinho/revisao' })}
          >
            Continuar para revisão
          </Button>
        </div>
        {blocker ? (
          <p id={`${id}-hint`} className="text-center text-xs text-neutral-700">
            {blocker}
          </p>
        ) : null}
      </div>
    </aside>
  )
}
