import { checkoutLink, checkoutSummary } from '@/components/checkout/checkoutStyles'
import { copies, formatCurrency } from '@/components/ads/adFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/cart'
import { validateCheckout } from '@/services/cart'
import type { CartItem } from '@/types/Cart'
import { Link, useNavigate } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { issueLines, itemSubtotal, needsReview } from './cartFormat'

export function CartSummary({ items }: { items: CartItem[] }) {
  const hintId = useId()
  const selected = items.filter((item) => item.selected)
  const copiesSelected = selected.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = selected.reduce((sum, item) => sum + itemSubtotal(item), 0)
  const review = selected.some(needsReview)
  const canContinue = selected.length > 0 && !review
  const navigate = useNavigate()
  const { reload } = useCart()
  const [checking, setChecking] = useState(false)
  const [blocked, setBlocked] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)

  async function handleContinue() {
    setChecking(true)
    setFailed(false)
    try {
      const validation = await validateCheckout()
      if (validation.valid) {
        setBlocked(null)
        navigate({ to: '/carrinho/entrega' })
        return
      }
      setBlocked(validation.emptySelection ? [] : issueLines(validation, items))
      reload()
    } catch {
      setFailed(true)
    } finally {
      setChecking(false)
    }
  }

  const rows = [
    { label: 'Anúncios selecionados', value: `${selected.length} de ${items.length}` },
    { label: 'Exemplares selecionados', value: copies(copiesSelected) },
  ]

  return (
    <aside
      aria-labelledby={`${hintId}-title`}
      className={checkoutSummary}
    >
      <h2
        id={`${hintId}-title`}
        className="font-title text-2xl font-bold text-text-ink"
      >
        Resumo da compra
      </h2>

      <dl className="mt-4 divide-y divide-border-default text-sm" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="font-semibold text-text-primary">{row.value}</dd>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-4">
          <dt className="font-semibold text-text-primary">
            {review ? 'Subtotal a revisar' : 'Subtotal selecionado'}
          </dt>
          <dd className="font-title text-2xl font-bold text-brand-primary">
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

        {blocked ? (
          <Alert variant="warning" title="Alguns itens mudaram">
            {blocked.length === 0 ? (
              'Selecione um anúncio para continuar.'
            ) : (
              <>
                Revise os itens abaixo antes de continuar:
                <ul className="mt-1 list-disc pl-5">
                  {blocked.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            )}
          </Alert>
        ) : null}
        {failed ? (
          <Alert variant="error">
            Não foi possível validar o carrinho. Tente novamente.
          </Alert>
        ) : null}

        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado.
        </Alert>

        <div className="flex justify-center">
          <Button
            className="h-auto min-h-11 w-52 max-w-full whitespace-normal py-2"
            disabled={!canContinue || checking}
            onClick={handleContinue}
          >
            {checking ? 'Validando...' : 'Continuar'}
          </Button>
        </div>

        <div className="text-center">
          <Link
            to="/marketplace"
            search={{ sort: 'recent' }}
            className={`${checkoutLink} text-sm`}
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </aside>
  )
}
