import { copies, formatCurrency } from '@/components/ads/adFormat'
import { adsCount, itemName, itemSubtotal, itemUnitPrice } from '@/components/cart/cartFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { CartItem } from '@/types/Cart'
import { Link, useNavigate } from '@tanstack/react-router'
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
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <h2 id={`${id}-title`} className="font-display text-2xl font-bold text-primary-900">
        Resumo da compra
      </h2>

      {items.length > 0 ? (
        <>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.adId} className="flex items-center gap-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="h-14 w-10 shrink-0 rounded bg-neutral-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold text-secondary-700">
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

          <p className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-700">
            {adsCount(items.length)} • {copies(totalCopies)}
          </p>

          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-neutral-100 pt-3">
            <span className="text-neutral-900">Subtotal dos itens</span>
            <span className="font-display text-2xl font-bold text-primary-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </>
      ) : null}

      <div className="mt-5 space-y-3">
        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado.
        </Alert>

        <Button
          className="h-12 w-full"
          disabled={blocker !== null}
          aria-describedby={blocker ? `${id}-hint` : undefined}
          onClick={() => navigate({ to: '/carrinho/revisao' })}
        >
          Continuar
        </Button>
        {blocker ? (
          <p id={`${id}-hint`} className="text-center text-xs text-neutral-700">
            {blocker}
          </p>
        ) : null}

        <div className="border-t border-neutral-100 pt-3 text-center">
          <Link
            to="/carrinho"
            className="text-sm font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900"
          >
            Voltar ao carrinho
          </Link>
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-neutral-700">
          <Icon name="info" size={16} />
          Revise a compra na próxima etapa.
        </p>
      </div>
    </aside>
  )
}
