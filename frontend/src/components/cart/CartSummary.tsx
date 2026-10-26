import { copies, formatCurrency } from '@/components/ads/adFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { CartItem } from '@/types/Cart'
import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { itemSubtotal, needsReview } from './cartFormat'

export function CartSummary({ items }: { items: CartItem[] }) {
  const hintId = useId()
  const selected = items.filter((item) => item.selected)
  const copiesSelected = selected.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = selected.reduce((sum, item) => sum + itemSubtotal(item), 0)
  const review = selected.some(needsReview)

  const rows = [
    { label: 'Anúncios selecionados', value: `${selected.length} de ${items.length}` },
    { label: 'Exemplares selecionados', value: copies(copiesSelected) },
  ]

  return (
    <aside
      aria-labelledby={`${hintId}-title`}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <h2
        id={`${hintId}-title`}
        className="font-display text-2xl font-bold text-primary-900"
      >
        Resumo da compra
      </h2>

      <dl className="mt-4 divide-y divide-neutral-100 text-sm" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-neutral-700">{row.label}</dt>
            <dd className="font-semibold text-neutral-900">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 pt-4">
          <dt className="font-semibold text-neutral-900">
            {review ? 'Subtotal a revisar' : 'Subtotal selecionado'}
          </dt>
          <dd className="font-display text-2xl font-bold text-primary-900">
            {formatCurrency(subtotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3">
        {selected.length === 0 ? (
          <Alert variant="info">Selecione um anúncio para continuar.</Alert>
        ) : null}
        {review ? (
          <Alert variant="warning">
            Revise a quantidade ou o preço dos itens destacados para continuar.
          </Alert>
        ) : null}

        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado.
        </Alert>

        <Button className="h-12 w-full" disabled aria-describedby={hintId}>
          Continuar
        </Button>
        <p id={hintId} className="text-center text-xs text-neutral-700">
          A finalização da compra estará disponível em breve.
        </p>

        <div className="text-center">
          <Link
            to="/marketplace"
            search={{ sort: 'recent' }}
            className="text-sm font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </aside>
  )
}
