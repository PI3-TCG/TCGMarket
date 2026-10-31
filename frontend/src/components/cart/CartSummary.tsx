import { copies, formatCurrency } from '@/components/ads/adFormat'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/cart'
import { validateCheckout } from '@/services/cart'
import type { CartItem, CheckoutIssueCode, CheckoutValidation } from '@/types/Cart'
import { Link, useNavigate } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { itemSubtotal, needsReview } from './cartFormat'

const issueLabels: Record<CheckoutIssueCode, string> = {
  AD_NOT_FOUND: 'anúncio removido',
  AD_CANCELLED: 'anúncio cancelado',
  AD_SOLD_OUT: 'anúncio esgotado',
  SALE_DISABLED: 'não está mais à venda',
  QUANTITY_UNAVAILABLE: 'quantidade indisponível',
  PRICE_CHANGED: 'preço alterado',
  OWN_AD: 'anúncio próprio',
  SELLER_CHANGED: 'vendedor alterado',
  CARD_NOT_FOUND: 'carta não encontrada',
}

function issueLines(validation: CheckoutValidation, items: CartItem[]) {
  return validation.items.map((issue) => {
    const name = items.find((item) => item.adId === issue.adId)?.cardName ?? 'Anúncio indisponível'
    return `${name}: ${issue.issues.map((code) => issueLabels[code]).join(', ')}`
  })
}

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

        <Button
          className="h-12 w-full"
          disabled={!canContinue || checking}
          onClick={handleContinue}
        >
          {checking ? 'Validando...' : 'Continuar'}
        </Button>

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
