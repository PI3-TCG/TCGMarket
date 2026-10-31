import { useCart } from '@/cart'
import { copies, formatCurrency } from '@/components/ads/adFormat'
import { adsCount, issueLines, itemName, itemSubtotal, itemUnitPrice } from '@/components/cart/cartFormat'
import { addressTitle, cityLine, streetLine } from '@/components/delivery/addressFormat'
import { PageBanner } from '@/components/layout/PageBanner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { listAddresses } from '@/services/addresses'
import { placeOrder, placeOrderFailure, validateCheckout } from '@/services/cart'
import { readCheckoutAddress } from '@/services/checkoutAddress'
import { useSession } from '@/session'
import type { Address } from '@/types/Address'
import type { Cart, CartItem, CheckoutValidation } from '@/types/Cart'
import type { CheckoutOrders, Order } from '@/types/Order'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'

const panelClass = 'rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'
const linkClass =
  'font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900'

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; addresses: Address[]; validation: CheckoutValidation }

type Submit =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'failed'; message: string | null }

function newIdempotencyKey() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ReviewPage() {
  const { state: cartState, reload: reloadCart } = useCart()
  const { user } = useSession()
  const userId = user?.id ?? null

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner title="Revisão" subtitle="Confira os itens e o endereço antes de confirmar." />

        {cartState.status === 'error' ? (
          <LoadError title="Não foi possível carregar seu carrinho" onRetry={reloadCart} />
        ) : null}
        {cartState.status === 'ready' && userId ? (
          <ReviewContent cart={cartState.cart} userId={userId} />
        ) : null}
        {cartState.status === 'idle' || cartState.status === 'loading' ? <ReviewSkeleton /> : null}
      </div>
    </main>
  )
}

function ReviewContent({ cart, userId }: { cart: Cart; userId: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [submit, setSubmit] = useState<Submit>({ status: 'idle' })
  const [created, setCreated] = useState<CheckoutOrders | null>(null)
  const idempotencyKey = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([listAddresses(), validateCheckout()])
      .then(([addresses, validation]) => {
        if (active) setState({ status: 'ready', addresses, validation })
      })
      .catch(() => {
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [attempt])

  function retryLoad() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  if (created) {
    return <OrdersCreated result={created} />
  }

  if (state.status === 'loading') {
    return <ReviewSkeleton />
  }

  if (state.status === 'error') {
    return <LoadError title="Não foi possível preparar a revisão" onRetry={retryLoad} />
  }

  const items = cart.items.filter((item) => item.selected)
  const chosenId = readCheckoutAddress(userId)
  const address =
    state.addresses.find((candidate) => candidate.id === chosenId) ??
    state.addresses.find((candidate) => candidate.primary) ??
    null
  const { validation } = state
  const groups = validation.sellers
    .map((seller) => ({
      sellerUsername: seller.sellerUsername,
      items: items.filter((item) => seller.adIds.includes(item.adId)),
    }))
    .filter((group) => group.items.length > 0)

  const reviewLines = validation.valid ? [] : issueLines(validation, items)
  const blocked = items.length === 0 || !address || !validation.valid

  async function confirm() {
    if (!address) return
    idempotencyKey.current ??= newIdempotencyKey()
    setSubmit({ status: 'submitting' })
    try {
      const result = await placeOrder(address.id, idempotencyKey.current)
      idempotencyKey.current = null
      setCreated(result)
    } catch (cause) {
      const failure = placeOrderFailure(cause)
      if (failure.kind === 'conflict') {
        idempotencyKey.current = null
        setSubmit({ status: 'idle' })
        retryLoad()
      } else if (failure.kind === 'rejected') {
        idempotencyKey.current = null
        setSubmit({ status: 'failed', message: failure.message })
      } else {
        setSubmit({ status: 'failed', message: null })
      }
    }
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <section aria-labelledby="review-title" className="min-w-0 space-y-4">
        <h2 id="review-title" className="font-display text-3xl font-bold text-primary-900">
          Revisão do pedido
        </h2>

        {items.length === 0 ? (
          <Alert variant="warning" title="Nenhum anúncio selecionado">
            Volte ao{' '}
            <Link to="/carrinho" className={linkClass}>
              carrinho
            </Link>{' '}
            e selecione os anúncios que deseja comprar.
          </Alert>
        ) : null}

        {reviewLines.length > 0 ? <ReviewIssues lines={reviewLines} /> : null}

        <AddressPanel address={address} />

        {groups.map((group, index) => (
          <SellerGroup
            key={group.items[0].adId}
            items={group.items}
            sellerUsername={group.sellerUsername}
            index={index}
            count={groups.length}
          />
        ))}

        {groups.length > 1 ? (
          <p className="flex items-center gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
            <Icon name="info" size={20} />
            Anúncios de vendedores diferentes geram um pedido para cada vendedor.
          </p>
        ) : null}
      </section>

      <ReviewSummary
        items={items}
        orderCount={groups.length}
        blocked={blocked}
        submit={submit}
        onConfirm={confirm}
      />
    </div>
  )
}

function ReviewIssues({ lines }: { lines: string[] }) {
  return (
    <Alert variant="warning" title="Alguns itens mudaram">
      <ul className="list-disc pl-5">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      Revise-os no{' '}
      <Link to="/carrinho" className={linkClass}>
        carrinho
      </Link>{' '}
      antes de continuar.
    </Alert>
  )
}

function AddressPanel({ address }: { address: Address | null }) {
  return (
    <div className={panelClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-secondary-700">
            <Icon name="map-pin" size={24} />
          </span>
          {address ? (
            <div>
              <p className="font-display text-lg font-bold text-primary-900">{addressTitle(address)}</p>
              <p className="text-sm text-neutral-700">{address.recipientName}</p>
              <p className="text-sm text-neutral-700">{streetLine(address)}</p>
              <p className="text-sm text-neutral-700">{cityLine(address)}</p>
            </div>
          ) : (
            <p className="text-neutral-700">Nenhum endereço selecionado.</p>
          )}
        </div>
        <Link to="/carrinho/entrega" className={`${linkClass} shrink-0 text-sm`}>
          {address ? 'Alterar' : 'Selecionar'}
        </Link>
      </div>
    </div>
  )
}

type SellerGroupProps = {
  items: CartItem[]
  sellerUsername: string | null
  index: number
  count: number
}

function SellerGroup({ items, sellerUsername, index, count }: SellerGroupProps) {
  const subtotal = items.reduce((sum, item) => sum + itemSubtotal(item), 0)

  return (
    <div className={panelClass}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-primary-900">
            {sellerUsername ? `Vendedor @${sellerUsername}` : 'Vendedor'}
          </h3>
          {count > 1 ? (
            <p className="text-sm text-neutral-700">
              Pedido {index + 1} de {count}
            </p>
          ) : null}
        </div>
        <span className="font-display font-bold text-primary-900">{formatCurrency(subtotal)}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.adId} className="flex items-center gap-3">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
            ) : (
              <span className="h-16 w-12 shrink-0 rounded bg-neutral-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold text-secondary-700">{itemName(item)}</p>
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
    </div>
  )
}

type ReviewSummaryProps = {
  items: CartItem[]
  orderCount: number
  blocked: boolean
  submit: Submit
  onConfirm: () => void
}

function ReviewSummary({ items, orderCount, blocked, submit, onConfirm }: ReviewSummaryProps) {
  const id = useId()
  const totalCopies = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + itemSubtotal(item), 0)
  const submitting = submit.status === 'submitting'

  return (
    <aside
      aria-labelledby={`${id}-title`}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <h2 id={`${id}-title`} className="font-display text-2xl font-bold text-primary-900">
        Resumo
      </h2>

      <dl className="mt-4 divide-y divide-neutral-100 text-sm">
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-700">Anúncios</dt>
          <dd className="font-semibold">{adsCount(items.length)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-700">Exemplares</dt>
          <dd className="font-semibold">{copies(totalCopies)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-neutral-700">Pedidos</dt>
          <dd className="font-semibold">{orderCount}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-neutral-100 pt-3">
        <span className="text-neutral-900">Total</span>
        <span className="font-display text-2xl font-bold text-primary-900">{formatCurrency(total)}</span>
      </div>

      <div className="mt-5 space-y-3">
        {submit.status === 'failed' ? (
          <Alert variant="error">
            {submit.message ?? 'Não foi possível confirmar o pedido. Tente novamente.'}
          </Alert>
        ) : null}

        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado. Os exemplares ficam reservados enquanto o pagamento é processado.
        </Alert>

        <Button
          className="h-12 w-full"
          disabled={blocked || submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Confirmando...' : 'Confirmar pedido'}
        </Button>

        <div className="border-t border-neutral-100 pt-3 text-center">
          <Link to="/carrinho/entrega" className={`${linkClass} text-sm`}>
            Voltar à entrega
          </Link>
        </div>
      </div>
    </aside>
  )
}

function OrdersCreated({ result }: { result: CheckoutOrders }) {
  return (
    <section aria-labelledby="created-title" className="mx-auto max-w-3xl space-y-4">
      <div className={`${panelClass} flex flex-col items-center gap-3 py-10 text-center`}>
        <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-700">
          <Icon name="check-circle" size={32} />
        </span>
        <h2 id="created-title" className="font-display text-3xl font-bold text-primary-900">
          {result.orders.length > 1 ? 'Pedidos criados' : 'Pedido criado'}
        </h2>
        <p className="text-neutral-700">
          Os exemplares estão reservados para você enquanto o pagamento é processado.
        </p>
      </div>

      {result.orders.map((order) => (
        <CreatedOrder key={order.id} order={order} />
      ))}

      <div className={`${panelClass} flex items-baseline justify-between gap-4`}>
        <span className="text-neutral-900">Total</span>
        <span className="font-display text-2xl font-bold text-primary-900">
          {formatCurrency(result.total)}
        </span>
      </div>

      <div className="text-center">
        <Link to="/marketplace" search={{ sort: 'recent' }} className={linkClass}>
          Voltar ao marketplace
        </Link>
      </div>
    </section>
  )
}

function CreatedOrder({ order }: { order: Order }) {
  const totalCopies = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-primary-900">
            {order.sellerUsername ? `Vendedor @${order.sellerUsername}` : 'Pedido'}
          </h3>
          <p className="text-sm text-neutral-700">
            {adsCount(order.items.length)} • {copies(totalCopies)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-primary-900">
            {formatCurrency(order.totalAmount)}
          </p>
          <p className="text-sm font-semibold text-warning-700">Aguardando pagamento</p>
        </div>
      </div>
    </div>
  )
}

function LoadError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div role="alert" className={`${panelClass} flex flex-col items-center gap-4 py-10 text-center`}>
      <span className="flex size-16 items-center justify-center rounded-full bg-error-50 text-error-700">
        <Icon name="alert" size={32} />
      </span>
      <h3 className="font-display text-2xl font-bold text-primary-900">{title}</h3>
      <p className="text-neutral-700">Tente novamente em instantes.</p>
      <Button className="h-12 px-8" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
    >
      <span className="sr-only">Carregando revisão...</span>
      <div className="space-y-4">
        <span className="block h-9 w-72 animate-pulse rounded bg-neutral-200" />
        <span className={`${panelClass} block h-28 animate-pulse`} />
        <span className={`${panelClass} block h-40 animate-pulse`} />
      </div>
      <div className={`${panelClass} space-y-3`}>
        <span className="block h-7 w-1/2 animate-pulse rounded bg-neutral-200" />
        <span className="block h-24 animate-pulse rounded bg-neutral-100" />
        <span className="block h-12 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}
