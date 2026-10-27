import { useCart } from '@/cart'
import { copies } from '@/components/ads/adFormat'
import { CartItemRow, type RowError } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { adsCount, itemName } from '@/components/cart/cartFormat'
import { PageBanner } from '@/components/layout/PageBanner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icon'
import {
  addCartItem,
  cartFailure,
  removeCartItem,
  updateCartItem,
  updateCartSelection,
} from '@/services/cart'
import type { Cart, CartItem } from '@/types/Cart'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const panelClass =
  'rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'

const UNKNOWN_RESULT =
  'Não foi possível confirmar a alteração. Mostramos o estado atual do seu carrinho.'

type Removed = { item: CartItem }

export function CartPage() {
  const { state, reload } = useCart()

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Meu carrinho"
          subtitle="Revise os itens antes de continuar."
        />

        {state.status === 'idle' || state.status === 'loading' ? (
          <CartSkeleton />
        ) : null}
        {state.status === 'error' ? <CartLoadError onRetry={reload} /> : null}
        {state.status === 'ready' ? <CartContent cart={state.cart} /> : null}
      </div>
    </main>
  )
}

function CartContent({ cart }: { cart: Cart }) {
  const { apply, reload } = useCart()
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set())
  const [selectingAll, setSelectingAll] = useState(false)
  const [errors, setErrors] = useState<Record<string, RowError>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [removed, setRemoved] = useState<Removed | null>(null)

  useEffect(() => {
    if (!removed) return
    const timeout = window.setTimeout(() => setRemoved(null), 8000)
    return () => window.clearTimeout(timeout)
  }, [removed])

  if (cart.items.length === 0 && !removed) {
    return <EmptyCart />
  }

  const eligible = cart.items.filter((item) => item.availability !== 'UNAVAILABLE')
  const selectedCount = eligible.filter((item) => item.selected).length
  const allSelected = eligible.length > 0 && selectedCount === eligible.length
  const unavailable = cart.items.length - eligible.length
  const totalCopies = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  function markBusy(adId: string, value: boolean) {
    setBusy((current) => {
      const next = new Set(current)
      if (value) next.add(adId)
      else next.delete(adId)
      return next
    })
  }

  function setRowError(adId: string, error: RowError | null) {
    setErrors((current) => {
      const next = { ...current }
      if (error) next[adId] = error
      else delete next[adId]
      return next
    })
  }

  async function run(
    item: CartItem,
    operation: () => Promise<Cart>,
    failed: (message: string | null) => RowError,
  ) {
    markBusy(item.adId, true)
    setRowError(item.adId, null)
    setNotice(null)

    try {
      apply(await operation())
      return true
    } catch (cause) {
      const failure = cartFailure(cause)
      if (failure.kind === 'unknown') {
        setNotice(UNKNOWN_RESULT)
        reload()
      } else {
        setRowError(item.adId, failed(failure.message))
      }
      return false
    } finally {
      markBusy(item.adId, false)
    }
  }

  function changeQuantity(item: CartItem, quantity: number) {
    run(
      item,
      () => updateCartItem(item.adId, { quantity }),
      (message) => ({
        kind: 'quantity',
        message: `${message ? `${message} ` : ''}Mantivemos ${copies(item.quantity)}.`,
      }),
    )
  }

  function select(item: CartItem, selected: boolean) {
    run(
      item,
      () => updateCartItem(item.adId, { selected }),
      (message) => ({
        kind: 'other',
        message: message ?? 'Tente novamente.',
      }),
    )
  }

  function acceptPrice(item: CartItem) {
    run(
      item,
      () => updateCartItem(item.adId, { acceptCurrentPrice: true }),
      (message) => ({
        kind: 'other',
        message: message ?? 'Tente novamente.',
      }),
    )
  }

  async function remove(item: CartItem) {
    const done = await run(
      item,
      () => removeCartItem(item.adId),
      () => ({
        kind: 'remove',
        message: `${itemName(item)} continua no carrinho.`,
      }),
    )
    if (done) setRemoved({ item })
  }

  async function undoRemove({ item }: Removed) {
    setRemoved(null)
    setNotice(null)

    try {
      let restored = await addCartItem(item.adId, item.quantity)
      if (!item.selected) {
        restored = await updateCartItem(item.adId, { selected: false })
      }
      apply(restored)
    } catch (cause) {
      const failure = cartFailure(cause)
      if (failure.kind === 'unknown') {
        setNotice(UNKNOWN_RESULT)
        reload()
      } else {
        setNotice(
          `Não foi possível restaurar ${itemName(item)}. ${
            failure.message ?? 'Tente adicionar novamente pela página do anúncio.'
          }`,
        )
      }
    }
  }

  async function toggleAll() {
    setSelectingAll(true)
    setNotice(null)
    try {
      apply(await updateCartSelection(!allSelected))
    } catch (cause) {
      const failure = cartFailure(cause)
      setNotice(
        failure.kind === 'unknown'
          ? UNKNOWN_RESULT
          : 'Não foi possível atualizar a seleção. Tente novamente.',
      )
      if (failure.kind === 'unknown') reload()
    } finally {
      setSelectingAll(false)
    }
  }

  return (
    <>
      {removed ? (
        <div className="fixed top-24 right-4 left-4 z-30 mx-auto max-w-md sm:left-auto">
          <Alert variant="success" onDismiss={() => setRemoved(null)}>
            {itemName(removed.item)} removido do carrinho.{' '}
            <button
              type="button"
              onClick={() => undoRemove(removed)}
              className="cursor-pointer font-semibold text-secondary-700 underline underline-offset-2"
            >
              Desfazer
            </button>
          </Alert>
        </div>
      ) : null}

      {cart.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section aria-labelledby="cart-title" className="min-w-0 space-y-3">
            <h2
              id="cart-title"
              className="font-display text-2xl font-bold text-primary-900"
            >
              {adsCount(cart.items.length)} • {copies(totalCopies)}
            </h2>

            {notice ? (
              <Alert variant="warning" onDismiss={() => setNotice(null)}>
                {notice}
              </Alert>
            ) : null}

            {unavailable > 0 ? (
              <Alert variant="warning">
                {unavailable === 1
                  ? 'Um item ficou indisponível e não pode ser selecionado.'
                  : `${unavailable} itens ficaram indisponíveis e não podem ser selecionados.`}
              </Alert>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <Checkbox
                label="Selecionar todos"
                checked={allSelected}
                indeterminate={selectedCount > 0 && !allSelected}
                disabled={eligible.length === 0 || selectingAll}
                onChange={toggleAll}
              />
              <span className="text-sm text-neutral-700">
                {selectedCount} de {eligible.length}{' '}
                {eligible.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            </div>

            <ul className="space-y-3">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.adId}
                  item={item}
                  busy={busy.has(item.adId) || selectingAll}
                  error={errors[item.adId] ?? null}
                  onQuantity={(quantity) => changeQuantity(item, quantity)}
                  onSelect={(selected) => select(item, selected)}
                  onAcceptPrice={() => acceptPrice(item)}
                  onRemove={() => remove(item)}
                />
              ))}
            </ul>
          </section>

          <CartSummary items={cart.items} />
        </div>
      )}
    </>
  )
}

function EmptyCart() {
  const navigate = useNavigate()

  return (
    <section
      className={`${panelClass} flex flex-col items-center gap-4 py-14 text-center`}
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-primary-100 text-primary-900">
        <Icon name="cart" size={32} />
      </span>
      <h2 className="font-display text-3xl font-bold text-primary-900">
        Seu carrinho está vazio
      </h2>
      <p className="text-neutral-700">
        Explore os anúncios e encontre sua próxima carta.
      </p>
      <Button
        className="h-12 px-8"
        icon={<Icon name="search" size={20} />}
        onClick={() => navigate({ to: '/marketplace', search: { sort: 'recent' } })}
      >
        Explorar anúncios
      </Button>
      <SimulatedPaymentNote />
    </section>
  )
}

function CartLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      role="alert"
      className={`${panelClass} mx-auto flex max-w-2xl flex-col items-center gap-4 py-12 text-center`}
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-error-50 text-error-700">
        <Icon name="alert" size={32} />
      </span>
      <h2 className="font-display text-3xl font-bold text-primary-900">
        Não foi possível carregar seu carrinho
      </h2>
      <p className="text-neutral-700">Tente novamente para visualizar seus itens.</p>
      <Button className="h-12 px-8" onClick={onRetry}>
        Tentar novamente
      </Button>
      <Link
        to="/marketplace"
        search={{ sort: 'recent' }}
        className="text-sm font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900"
      >
        Voltar ao Marketplace
      </Link>
      <SimulatedPaymentNote />
    </section>
  )
}

function SimulatedPaymentNote() {
  return (
    <p className="flex items-center gap-2 text-sm text-info-700">
      <Icon name="info" size={16} />
      Pagamento simulado. Nenhum valor será cobrado.
    </p>
  )
}

function CartSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
    >
      <span className="sr-only">Carregando carrinho...</span>
      <div className="space-y-3">
        <span className="block h-8 w-64 animate-pulse rounded bg-neutral-200" />
        <span className="block h-12 animate-pulse rounded-xl bg-white" />
        {[0, 1, 2].map((key) => (
          <div key={key} className={`${panelClass} flex gap-4`}>
            <span className="h-24 w-[68px] animate-pulse rounded-md bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <span className="block h-5 w-1/2 animate-pulse rounded bg-neutral-200" />
              <span className="block h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
              <span className="block h-4 w-1/4 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
      <div className={`${panelClass} space-y-3`}>
        <span className="block h-7 w-1/2 animate-pulse rounded bg-neutral-200" />
        <span className="block h-24 animate-pulse rounded bg-neutral-100" />
        <span className="block h-12 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}
