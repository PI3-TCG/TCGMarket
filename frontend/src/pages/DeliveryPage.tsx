import { useCart } from '@/cart'
import { needsReview } from '@/components/cart/cartFormat'
import { AddressCard } from '@/components/delivery/AddressCard'
import { AddressFormModal } from '@/components/delivery/AddressFormModal'
import { DeliverySummary } from '@/components/delivery/DeliverySummary'
import { PageBanner } from '@/components/layout/PageBanner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { listAddresses } from '@/services/addresses'
import { readCheckoutAddress, writeCheckoutAddress } from '@/services/checkoutAddress'
import { useSession } from '@/session'
import type { Address } from '@/types/Address'
import type { Cart } from '@/types/Cart'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const panelClass = 'rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'

type AddressesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; addresses: Address[] }

type Editor = { address: Address | null }

export function DeliveryPage() {
  const { state: cartState, reload: reloadCart } = useCart()
  const { user } = useSession()
  const userId = user?.id ?? null

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner title="Entrega" subtitle="Escolha onde receber suas cartas." />

        {cartState.status === 'error' ? (
          <LoadError
            title="Não foi possível carregar seu carrinho"
            onRetry={reloadCart}
          />
        ) : null}
        {cartState.status === 'ready' && userId ? (
          <DeliveryContent cart={cartState.cart} userId={userId} />
        ) : null}
        {cartState.status === 'idle' || cartState.status === 'loading' ? (
          <DeliverySkeleton />
        ) : null}
      </div>
    </main>
  )
}

function DeliveryContent({ cart, userId }: { cart: Cart; userId: string }) {
  const [state, setState] = useState<AddressesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [chosenId, setChosenId] = useState(() => readCheckoutAddress(userId))
  const [editor, setEditor] = useState<Editor | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true

    listAddresses()
      .then((addresses) => {
        if (active) setState({ status: 'ready', addresses })
      })
      .catch(() => {
        if (active) setState({ status: 'error' })
      })

    return () => {
      active = false
    }
  }, [attempt])

  function reloadAddresses() {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  function choose(addressId: string) {
    setChosenId(addressId)
    writeCheckoutAddress(userId, addressId)
  }

  function onSaved(address: Address) {
    setState((current) => {
      if (current.status !== 'ready') return current
      const merged = current.addresses.some((item) => item.id === address.id)
        ? current.addresses.map((item) => (item.id === address.id ? address : item))
        : [...current.addresses, address]
      const addresses = address.primary
        ? merged.map((item) =>
            item.id === address.id ? item : { ...item, primary: false },
          )
        : merged
      return { status: 'ready', addresses }
    })
    choose(address.id)
    setEditor(null)
    setSaved(true)
  }

  const items = cart.items.filter((item) => item.selected)
  const addresses = state.status === 'ready' ? state.addresses : []
  const selected =
    addresses.find((address) => address.id === chosenId) ??
    addresses.find((address) => address.primary) ??
    null

  let blocker: string | null = null
  if (items.length === 0) {
    blocker = 'Selecione ao menos um anúncio no carrinho.'
  } else if (items.some(needsReview)) {
    blocker = 'Revise os itens destacados no carrinho.'
  } else if (state.status !== 'ready') {
    blocker = 'Carregando seus endereços...'
  } else if (!selected) {
    blocker = 'Cadastre e selecione um endereço.'
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <section aria-labelledby="delivery-title" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="delivery-title"
              className="font-display text-3xl font-bold text-primary-900"
            >
              Endereço de entrega
            </h2>
            <p className="text-sm text-neutral-700">
              Selecione um endereço para esta compra.
            </p>
          </div>
          {addresses.length > 0 ? (
            <Button
              variant="outline"
              icon={<Icon name="plus" size={20} />}
              onClick={() => setEditor({ address: null })}
            >
              Adicionar endereço
            </Button>
          ) : null}
        </div>

        {saved ? (
          <Alert variant="success" onDismiss={() => setSaved(false)}>
            Endereço salvo e selecionado.
          </Alert>
        ) : null}

        {items.length === 0 ? (
          <Alert variant="warning" title="Nenhum anúncio selecionado">
            Volte ao{' '}
            <Link to="/carrinho" className="font-semibold underline underline-offset-2">
              carrinho
            </Link>{' '}
            e selecione os anúncios que deseja comprar.
          </Alert>
        ) : null}

        {state.status === 'loading' ? <AddressesSkeleton /> : null}

        {state.status === 'error' ? (
          <LoadError
            title="Não foi possível carregar seus endereços"
            onRetry={reloadAddresses}
          />
        ) : null}

        {state.status === 'ready' && addresses.length === 0 ? (
          <NoAddresses onAdd={() => setEditor({ address: null })} />
        ) : null}

        {addresses.length > 0 ? (
          <fieldset>
            <legend className="sr-only">Endereços cadastrados</legend>
            <ul className="space-y-3">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={selected?.id === address.id}
                  onSelect={() => choose(address.id)}
                  onEdit={() => setEditor({ address })}
                />
              ))}
            </ul>
          </fieldset>
        ) : null}

        <p className="flex items-center gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
          <Icon name="info" size={20} />
          O endereço será usado para todos os itens selecionados.
        </p>
      </section>

      <DeliverySummary items={items} blocker={blocker} />

      {editor ? (
        <AddressFormModal
          address={editor.address}
          firstAddress={editor.address === null && addresses.length === 0}
          onSaved={onSaved}
          onUnknownResult={reloadAddresses}
          onClose={() => setEditor(null)}
        />
      ) : null}
    </div>
  )
}

function NoAddresses({ onAdd }: { onAdd: () => void }) {
  return (
    <div className={`${panelClass} flex flex-col items-center gap-4 py-12 text-center`}>
      <span className="flex size-20 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
        <Icon name="map-pin" size={32} />
      </span>
      <h3 className="font-display text-2xl font-bold text-primary-900">
        Você ainda não tem endereço cadastrado
      </h3>
      <p className="text-neutral-700">Adicione um endereço para continuar.</p>
      <Button className="h-12 px-8" icon={<Icon name="plus" size={20} />} onClick={onAdd}>
        Adicionar endereço
      </Button>
    </div>
  )
}

function LoadError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className={`${panelClass} flex flex-col items-center gap-4 py-10 text-center`}
    >
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

function AddressesSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      <span className="sr-only">Carregando endereços...</span>
      {[0, 1].map((key) => (
        <div key={key} className={`${panelClass} flex gap-4`}>
          <span className="size-5 animate-pulse rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <span className="block h-5 w-1/3 animate-pulse rounded bg-neutral-200" />
            <span className="block h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
            <span className="block h-4 w-2/5 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DeliverySkeleton() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <div className="space-y-4">
        <span className="block h-9 w-72 animate-pulse rounded bg-neutral-200" />
        <AddressesSkeleton />
      </div>
      <div className={`${panelClass} space-y-3`}>
        <span className="block h-7 w-1/2 animate-pulse rounded bg-neutral-200" />
        <span className="block h-24 animate-pulse rounded bg-neutral-100" />
        <span className="block h-12 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}
