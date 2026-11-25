import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { checkoutContainer, checkoutPanel, checkoutColumns, checkoutLink, checkoutSummary } from '@/components/checkout/checkoutStyles'
import { pageBanners } from '@/config/pageBanners'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'


type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; addresses: Address[]; validation: CheckoutValidation }

type Submit =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'failed'; message: string }
  | { status: 'unknown' }

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
    <main className="min-h-screen pb-12 text-text-primary">
      <div className={checkoutContainer}>
        <PageBanner
          image={pageBanners.checkout}
          title="Revisão"
          subtitle="Confira os itens e o endereço antes de confirmar."
        />

        <div className="mt-10">
          <CheckoutSteps current={2} />
          {cartState.status === 'error' ? (
            <LoadError title="Não foi possível carregar seu carrinho" onRetry={reloadCart} />
          ) : null}
          {cartState.status === 'ready' && userId ? (
            <ReviewContent cart={cartState.cart} userId={userId} />
          ) : null}
          {cartState.status === 'idle' || cartState.status === 'loading' ? <ReviewSkeleton /> : null}
        </div>
      </div>
    </main>
  )
}

function ReviewContent({ cart, userId }: { cart: Cart; userId: string }) {
  const navigate = useNavigate()
  const { reload: reloadCart } = useCart()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [submit, setSubmit] = useState<Submit>({ status: 'idle' })
  const sending = useRef(false)
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
    if (!address || sending.current || submit.status === 'unknown') return
    sending.current = true
    idempotencyKey.current ??= newIdempotencyKey()
    setSubmit({ status: 'submitting' })
    try {
      const result = await placeOrder(address.id, idempotencyKey.current)
      idempotencyKey.current = null
      void reloadCart()
      await navigate({
        to: '/carrinho/resultado/$checkoutId',
        params: { checkoutId: result.checkoutId },
      })
    } catch (cause) {
      const failure = placeOrderFailure(cause)
      if (failure.kind === 'conflict') {
        idempotencyKey.current = null
        setSubmit({ status: 'idle' })
        retryLoad()
      } else if (failure.kind === 'rejected') {
        idempotencyKey.current = null
        setSubmit({
          status: 'failed',
          message: failure.message ?? 'Não foi possível confirmar a compra. Tente novamente.',
        })
      } else {
        setSubmit({ status: 'unknown' })
      }
    } finally {
      sending.current = false
    }
  }

  return (
    <div className={checkoutColumns}>
      <section aria-labelledby="review-title" className="min-w-0 space-y-4">
        <h2 id="review-title" className="font-title text-2xl font-bold text-text-ink">
          Revisão do pedido
        </h2>
        {items.length === 0 ? (
          <Alert variant="warning" title="Nenhum anúncio selecionado">
            Volte ao{' '}
            <Link to="/carrinho" className={checkoutLink}>
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
          <p className="flex items-center gap-2 border-t border-border-default pt-4 text-sm text-text-secondary">
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
      <Link to="/carrinho" className={checkoutLink}>
        carrinho
      </Link>{' '}
      antes de continuar.
    </Alert>
  )
}

function AddressPanel({ address }: { address: Address | null }) {
  return (
    <div className={checkoutPanel}>
      <div className="flex flex-wrap items-start justify-between gap-3 wrap-anywhere">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-secondary-700">
            <Icon name="map-pin" size={24} />
          </span>
          {address ? (
            <div>
              <p className="font-title text-lg font-bold text-brand-primary">{addressTitle(address)}</p>
              <p className="text-sm text-text-secondary">{address.recipientName}</p>
              <p className="text-sm text-text-secondary">{streetLine(address)}</p>
              <p className="text-sm text-text-secondary">{cityLine(address)}</p>
            </div>
          ) : (
            <p className="text-text-secondary">Nenhum endereço selecionado.</p>
          )}
        </div>
        <Link to="/carrinho/entrega" className={`${checkoutLink} shrink-0 text-sm`}>
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
    <div className={checkoutPanel}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 wrap-anywhere">
        <div>
          <h3 className="font-title text-xl font-bold text-text-ink">
            {sellerUsername ? `Vendedor @${sellerUsername}` : 'Vendedor'}
          </h3>
          {count > 1 ? (
            <p className="text-sm text-text-secondary">
              Pedido {index + 1} de {count}
            </p>
          ) : null}
        </div>
        <span className="wrap-anywhere font-semibold text-text-price">{formatCurrency(subtotal)}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.adId} className="flex min-w-0 flex-wrap items-center gap-3">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
            ) : (
              <span className="h-16 w-12 shrink-0 rounded bg-surface-subtle" />
            )}
            <div className="min-w-0 flex-1">
              <p className="wrap-anywhere font-semibold text-text-ink">{itemName(item)}</p>
              <p className="text-xs text-text-secondary">
                {item.quantity} × {formatCurrency(itemUnitPrice(item))}
              </p>
            </div>
            <p className="wrap-anywhere font-semibold text-text-price">
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
      className={checkoutSummary}
    >
      <h2 id={`${id}-title`} className="font-title text-2xl font-bold text-text-ink">
        Resumo
      </h2>

      <dl className="mt-4 divide-y divide-border-default text-sm">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="text-text-secondary">Anúncios</dt>
          <dd className="font-semibold">{adsCount(items.length)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="text-text-secondary">Exemplares</dt>
          <dd className="font-semibold">{copies(totalCopies)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="text-text-secondary">Pedidos</dt>
          <dd className="font-semibold">{orderCount}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 wrap-anywhere border-t border-border-default pt-3">
        <span className="text-text-primary">Total</span>
        <span className="font-title text-2xl font-bold text-text-ink">{formatCurrency(total)}</span>
      </div>

      <div className="mt-5 space-y-3">
        {submit.status === 'failed' ? (
          <Alert variant="error">{submit.message}</Alert>
        ) : null}
        {submit.status === 'unknown' ? (
          <Alert variant="warning" title="Resultado do pagamento não confirmado">
            A compra pode ter sido registrada. Consulte as compras concluídas no{' '}
            <Link to="/perfil/historico" search={{ type: 'PURCHASE' }} className={checkoutLink}>
              histórico de transações
            </Link>. Pagamentos pendentes ou recusados podem não aparecer lá.
          </Alert>
        ) : null}

        {submitting ? (
          <Alert variant="info">Processando pagamento simulado...</Alert>
        ) : null}

        <Alert variant="info" title="Pagamento simulado">
          Nenhum valor será cobrado. Os exemplares ficam reservados enquanto o pagamento é processado.
        </Alert>

        <div className="flex justify-center">
          <Button
            className="h-auto min-h-11 w-52 max-w-full whitespace-normal py-2"
            disabled={blocked || submitting || submit.status === 'unknown'}
            onClick={onConfirm}
          >
            {submitting ? 'Processando...' : 'Simular pagamento'}
          </Button>
        </div>

        <div className="border-t border-border-default pt-3 text-center">
          <Link to="/carrinho/entrega" className={`${checkoutLink} text-sm`}>
            Voltar à entrega
          </Link>
        </div>
      </div>
    </aside>
  )
}

function LoadError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div role="alert" className={`${checkoutPanel} flex flex-col items-center gap-4 py-10 text-center`}>
      <span className="flex size-16 items-center justify-center rounded-full bg-error-50 text-error-700">
        <Icon name="alert" size={32} />
      </span>
      <h3 className="font-title text-2xl font-bold text-text-ink">{title}</h3>
      <p className="text-text-secondary">Tente novamente em instantes.</p>
      <Button onClick={onRetry}>
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
      className={checkoutColumns}
    >
      <span className="sr-only">Carregando revisão...</span>
      <div className="space-y-4">
        <span className="block h-9 w-72 max-w-full animate-pulse rounded bg-surface-subtle" />
        <span className={`${checkoutPanel} block h-28 animate-pulse`} />
        <span className={`${checkoutPanel} block h-40 animate-pulse`} />
      </div>
      <div className={`${checkoutPanel} space-y-3`}>
        <span className="block h-7 w-1/2 animate-pulse rounded bg-surface-subtle" />
        <span className="block h-24 animate-pulse rounded bg-surface-subtle" />
        <span className="block h-12 animate-pulse rounded bg-surface-subtle" />
      </div>
    </div>
  )
}
