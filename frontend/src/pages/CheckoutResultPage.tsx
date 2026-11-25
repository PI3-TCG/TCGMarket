import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { checkoutContainer, checkoutPanel, checkoutLink } from '@/components/checkout/checkoutStyles'
import { TransactionReviewButton } from '@/components/history/TransactionReviewButton'
import { pageBanners } from '@/config/pageBanners'
import {
  copies,
  conditionLabels,
  formatCurrency,
  languageLabels,
} from '@/components/ads/adFormat'
import { adsCount } from '@/components/cart/cartFormat'
import { PageBanner } from '@/components/layout/PageBanner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getCheckout, isCheckoutNotFound } from '@/services/cart'
import type {
  CheckoutOrders,
  DeliveryAddress,
  Order,
  OrderItem,
  OrderStatus,
} from '@/types/Order'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'


const POLL_MS = 2500

const orderStatus: Record<OrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: 'Processando pagamento',
    className: 'text-warning-700',
  },
  PAID: { label: 'Pagamento aprovado', className: 'text-success-700' },
  COMPLETED: { label: 'Compra concluída', className: 'text-success-700' },
  PAYMENT_FAILED: { label: 'Pagamento recusado', className: 'text-error-700' },
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notFound' }
  | { status: 'ready'; result: CheckoutOrders }

function isPending(orders: Order[]) {
  return orders.some((order) => order.status === 'PENDING_PAYMENT')
}

export function CheckoutResultPage() {
  const { checkoutId } = useParams({
    from: '/site-layout/carrinho/resultado/$checkoutId',
  })
  return <CheckoutResultContent key={checkoutId} checkoutId={checkoutId} />
}

function CheckoutResultContent({ checkoutId }: { checkoutId: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  function refresh() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  useEffect(() => {
    let active = true
    getCheckout(checkoutId)
      .then((result) => {
        if (active) setState({ status: 'ready', result })
      })
      .catch((cause) => {
        if (active)
          setState({ status: isCheckoutNotFound(cause) ? 'notFound' : 'error' })
      })
    return () => {
      active = false
    }
  }, [checkoutId, attempt])

  const pending =
    state.status === 'ready' &&
    state.result.orders.some(
      (order) => order.status === 'PENDING_PAYMENT' || order.status === 'PAID',
    )

  useEffect(() => {
    if (!pending) return

    let active = true
    let inFlight = false
    const timer = window.setInterval(() => {
      if (inFlight) return
      inFlight = true
      getCheckout(checkoutId)
        .then((result) => {
          if (active) setState({ status: 'ready', result })
        })
        .catch(() => {
          /* Mantém o último resultado conhecido; o usuário pode verificar de novo. */
        })
        .finally(() => {
          inFlight = false
        })
    }, POLL_MS)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [checkoutId, pending, attempt])

  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className={checkoutContainer}>
        <PageBanner
          image={pageBanners.checkout}
          title="Resultado da compra"
          subtitle="Acompanhe o status do pagamento simulado."
        />

        <div className="mt-10">
          <CheckoutSteps current={3} />
          {state.status === 'loading' ? <ResultSkeleton /> : null}
          {state.status === 'notFound' ? <NotFound /> : null}
          {state.status === 'error' ? (
            <LoadError
              title="Não foi possível carregar o resultado"
              onRetry={refresh}
            />
          ) : null}
          {state.status === 'ready' ? (
            <CheckoutResult result={state.result} onRefresh={refresh} />
          ) : null}
        </div>
      </div>
    </main>
  )
}

function resultHeadline(orders: Order[]) {
  const approved = orders.filter(
    (order) => order.status === 'PAID' || order.status === 'COMPLETED',
  )
  const failed = orders.filter((order) => order.status === 'PAYMENT_FAILED')
  const pending = orders.filter((order) => order.status === 'PENDING_PAYMENT')

  if (pending.length > 0 && approved.length === 0 && failed.length === 0) {
    return {
      title: 'Processando pagamento simulado...',
      text: 'Os exemplares estão reservados para você enquanto o pagamento é confirmado.',
      icon: 'info' as const,
      tone: 'bg-warning-50 text-warning-700',
      processing: true,
    }
  }
  if (pending.length > 0) {
    return {
      title: 'Processando pedidos restantes',
      text: 'Alguns pedidos já têm resultado. Aguarde a confirmação dos demais.',
      icon: 'info' as const,
      tone: 'bg-warning-50 text-warning-700',
      processing: true,
    }
  }
  if (approved.length === orders.length) {
    return {
      title: 'Compra simulada concluída!',
      text: 'Nenhuma cobrança foi realizada.',
      icon: 'check-circle' as const,
      tone: 'bg-success-50 text-success-700',
      processing: false,
    }
  }
  if (failed.length === orders.length) {
    return {
      title: 'Pagamento simulado recusado',
      text: 'Nenhuma carta foi transferida. Os itens continuam no seu carrinho para tentar de novo.',
      icon: 'close-circle' as const,
      tone: 'bg-error-50 text-error-700',
      processing: false,
    }
  }
  return {
    title: 'Resultado parcial',
    text: 'Alguns pedidos foram aprovados e outros recusados. Os itens recusados continuam no carrinho.',
    icon: 'alert' as const,
    tone: 'bg-warning-50 text-warning-700',
    processing: false,
  }
}

function CheckoutResult({
  result,
  onRefresh,
}: {
  result: CheckoutOrders
  onRefresh: () => void
}) {
  const navigate = useNavigate()
  const headline = resultHeadline(result.orders)
  const anyFailed = result.orders.some(
    (order) => order.status === 'PAYMENT_FAILED',
  )
  const pending = isPending(result.orders)

  return (
    <section
      aria-labelledby="result-title"
      className="mx-auto max-w-3xl space-y-4"
      aria-live="polite"
    >
      <div
        className={`${checkoutPanel} flex flex-col items-center gap-3 py-10 text-center`}
      >
        <span
          className={`flex size-16 items-center justify-center rounded-full ${headline.tone}`}
        >
          {headline.processing ? (
            <span
              aria-hidden
              className="size-8 rounded-full border-2 border-warning-700 border-t-transparent motion-safe:animate-spin"
            />
          ) : (
            <Icon name={headline.icon} size={32} />
          )}
        </span>
        <h2
          id="result-title"
          className="font-title text-3xl font-bold text-text-ink"
        >
          {headline.title}
        </h2>
        <p className="text-text-secondary">{headline.text}</p>
        <p className="text-sm text-text-secondary">
          Operação{' '}
          <span className="font-semibold text-text-primary">
            {result.checkoutId}
          </span>
        </p>
      </div>

      {result.orders.map((order, index) => (
        <CreatedOrder
          key={order.id}
          order={order}
          index={index}
          count={result.orders.length}
        />
      ))}

      <div className={`${checkoutPanel} space-y-2`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 wrap-anywhere">
          <span className="text-text-primary">Total da tentativa</span>
          <span className="font-title text-2xl font-bold text-text-ink">
            {formatCurrency(result.total)}
          </span>
        </div>
        <p className="text-sm text-text-secondary">
          Frete não incluído nesta simulação.
        </p>
      </div>

      <div
        className={`${checkoutPanel} flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center`}
      >
        {pending ? (
          <Button variant="outline" onClick={onRefresh}>
            Verificar resultado
          </Button>
        ) : null}
        {anyFailed ? (
          <Button
            onClick={() => void navigate({ to: '/carrinho' })}
          >
            Tentar novamente
          </Button>
        ) : null}
        {!pending || !anyFailed ? (
          <Button
            variant={anyFailed ? 'outline' : 'primary'}
            onClick={() =>
              void navigate({ to: '/marketplace', search: { sort: 'recent' } })
            }
          >
            Continuar comprando
          </Button>
        ) : null}
        {anyFailed ? (
          <Link to="/carrinho" className={`${checkoutLink} self-center text-sm`}>
            Voltar ao carrinho
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function CreatedOrder({
  order,
  index,
  count,
}: {
  order: Order
  index: number
  count: number
}) {
  const totalCopies = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const status = orderStatus[order.status]

  return (
    <article className={checkoutPanel}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-title text-xl font-bold text-text-ink">
            {order.sellerUsername
              ? `Vendedor @${order.sellerUsername}`
              : 'Pedido'}
          </h3>
          <p className="text-sm text-text-secondary">
            {count > 1 ? `Pedido ${index + 1} de ${count} • ` : null}
            {adsCount(order.items.length)} • {copies(totalCopies)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Pedido{' '}
            <span className="font-semibold text-text-primary">{order.id}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-title text-lg font-bold text-brand-primary">
            {formatCurrency(order.totalAmount)}
          </p>
          <p className={`text-sm font-semibold ${status.className}`}>
            {status.label}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3 border-t border-border-default pt-4">
        {order.items.map((item) => (
          <OrderItemRow key={`${order.id}-${item.adId}`} item={item} />
        ))}
      </ul>

      <DeliverySummary address={order.deliveryAddress} />

      {order.status === 'COMPLETED' && (
        <div className="mt-4">
          {order.transactionId ? (
            <TransactionReviewButton
              transactionId={order.transactionId}
              counterpartyName={
                order.sellerUsername ? `@${order.sellerUsername}` : 'vendedor'
              }
              label="Avaliar vendedor"
            />
          ) : (
            <Link
              to="/perfil/historico"
              search={{ type: 'PURCHASE' }}
              className={checkoutLink}
            >
              Avaliar pelo histórico
            </Link>
          )}
        </div>
      )}
      {order.status === 'PAID' && (
        <p role="status" className="mt-4 text-sm text-text-secondary">
          A avaliação fica disponível após a conclusão do pedido.
        </p>
      )}
    </article>
  )
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const meta = [
    item.edition,
    item.cardNumber ? `#${item.cardNumber}` : null,
    conditionLabels[item.condition],
    languageLabels[item.language],
  ].filter(Boolean)

  return (
    <li className="flex min-w-0 flex-wrap items-center gap-3">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-16 w-12 shrink-0 rounded object-cover"
        />
      ) : (
        <span className="h-16 w-12 shrink-0 rounded bg-surface-subtle" />
      )}
      <div className="min-w-0 flex-1">
        <p className="wrap-anywhere font-semibold text-text-ink">
          {item.cardName}
        </p>
        {meta.length > 0 ? (
          <p className="text-xs text-text-secondary">{meta.join(' · ')}</p>
        ) : null}
        <p className="text-xs text-text-secondary">
          {item.quantity} × {formatCurrency(item.unitPrice)}
        </p>
      </div>
      <p className="wrap-anywhere font-semibold text-text-price">
        {formatCurrency(item.subtotal)}
      </p>
    </li>
  )
}

function DeliverySummary({ address }: { address: DeliveryAddress }) {
  const number = address.withoutNumber ? 'S/N' : address.number
  const complement = address.complement ? ` • ${address.complement}` : ''

  return (
    <div className="mt-4 border-t border-border-default pt-4 text-sm text-text-secondary">
      <p className="font-semibold text-text-primary">Entrega</p>
      <p>{address.recipientName}</p>
      <p>
        {address.street}, {number}
        {complement}
      </p>
      <p>
        {address.district} • {address.city} / {address.state} • CEP{' '}
        {address.zipCode}
      </p>
    </div>
  )
}

function LoadError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className={`${checkoutPanel} mx-auto flex max-w-3xl flex-col items-center gap-4 py-10 text-center`}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-error-50 text-error-700">
        <Icon name="alert" size={32} />
      </span>
      <h3 className="font-title text-2xl font-bold text-text-ink">
        {title}
      </h3>
      <p className="text-text-secondary">
        Não foi possível confirmar o resultado. Verifique sem criar uma nova
        compra.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={onRetry}>
          Verificar resultado
        </Button>
        <Link to="/carrinho" className={checkoutLink}>
          Voltar ao carrinho
        </Link>
      </div>
      <Alert variant="warning" title="Resultado desconhecido">
        Recarregar esta página não inicia outro pagamento.
      </Alert>
    </div>
  )
}

function NotFound() {
  return (
    <div
      className={`${checkoutPanel} mx-auto flex max-w-3xl flex-col items-center gap-4 py-10 text-center`}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-subtle text-text-secondary">
        <Icon name="search" size={32} />
      </span>
      <h3 className="font-title text-2xl font-bold text-text-ink">
        Compra não encontrada
      </h3>
      <p className="text-text-secondary">
        Não encontramos uma compra com esse identificador na sua conta.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link to="/carrinho" className={checkoutLink}>
          Voltar ao carrinho
        </Link>
        <Link
          to="/marketplace"
          search={{ sort: 'recent' }}
          className={checkoutLink}
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  )
}

function ResultSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-3xl space-y-4"
    >
      <span className="sr-only">Carregando resultado da compra...</span>
      <span className={`${checkoutPanel} block h-40 animate-pulse`} />
      <span className={`${checkoutPanel} block h-48 animate-pulse`} />
      <span className={`${checkoutPanel} block h-20 animate-pulse`} />
    </div>
  )
}
