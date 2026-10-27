import { PageBanner } from '@/components/layout/PageBanner'
import {
  conditionLabels,
  copies,
  formatCurrency,
  languageLabels,
} from '@/components/ads/adFormat'
import { GAME_INFO } from '@/components/catalog/cardDetailsFormat'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/cart'
import { useRemoteData } from '@/hooks/useRemoteData'
import { addCartItem, cartFailure } from '@/services/cart'
import { getMarketplaceAd } from '@/services/marketplace'
import { useSession } from '@/session'
import type { MarketplaceAd } from '@/types/Marketplace'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useId, useState } from 'react'

const BUY_LOGIN_NOTICE =
  'Entre na sua conta para comprar cartas no Marketplace.'

const panelClass =
  'rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'

const backLinkClass =
  'inline-flex items-center gap-2 text-sm font-semibold text-secondary-700 underline underline-offset-2 hover:text-primary-900'

export function MarketplaceAdPage() {
  const { id } = useParams({ from: '/site-layout/marketplace/anuncios/$id' })
  return <MarketplaceAdView key={id} id={id} />
}

function MarketplaceAdView({ id }: { id: string }) {
  const { user } = useSession()
  const fetchAd = useCallback(() => getMarketplaceAd(id), [id])
  const { state, retry } = useRemoteData(
    `marketplace-ad:${id}:${user?.id ?? 'visitante'}`,
    fetchAd,
  )

  return (
    <main className="min-h-screen bg-neutral-50 pb-12 text-neutral-900">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Detalhes do anúncio"
          subtitle="Confira as informações da carta e adicione ao carrinho."
        />

        {state.status === 'loading' ? <AdSkeleton /> : null}
        {state.status === 'notFound' ? <AdStatus kind="notFound" /> : null}
        {state.status === 'error' ? (
          <AdStatus kind="error" onRetry={retry} />
        ) : null}
        {state.status === 'ready' ? <AdDetails ad={state.data} /> : null}
      </div>
    </main>
  )
}

function AdDetails({ ad }: { ad: MarketplaceAd }) {
  const game = GAME_INFO[ad.game]

  const rows = [
    {
      label: 'Condição',
      value: <Badge variant="success">{conditionLabels[ad.condition]}</Badge>,
    },
    { label: 'Idioma', value: languageLabels[ad.language] },
    {
      label: 'Vendedor',
      value: ad.sellerUsername ? (
        <Link
          to="/jogadores/$username"
          params={{ username: ad.sellerUsername }}
          className="inline-flex items-center gap-1.5 text-secondary-700 underline-offset-2 hover:text-primary-900 hover:underline"
        >
          <Icon name="user" size={16} />@{ad.sellerUsername}
        </Link>
      ) : (
        'Não informado'
      ),
    },
    { label: 'Disponíveis', value: copies(ad.remainingQuantity) },
  ]

  return (
    <div className="grid items-start gap-5 md:grid-cols-2">
      <AdImage ad={ad} />

      <section aria-labelledby="ad-card-name" className={panelClass}>
        <h2
          id="ad-card-name"
          className="font-display text-3xl leading-tight font-bold break-words text-primary-900"
        >
          {ad.cardName}
        </h2>

        <p className="mt-1 text-sm text-neutral-700">
          <Link
            to="/cartas/$id"
            params={{ id: ad.cardId }}
            className="text-secondary-700 underline underline-offset-2 hover:text-primary-900"
          >
            {game?.name ?? ad.game}
          </Link>
          {ad.edition ? ` • ${ad.edition}` : ''}
          {ad.cardNumber ? ` • Nº ${ad.cardNumber}` : ''}
        </p>

        <dl className="mt-4 divide-y divide-neutral-100 border-y border-neutral-100 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4 py-2.5"
            >
              <dt className="text-neutral-700">{row.label}</dt>
              <dd className="min-w-0 break-words text-neutral-900">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Modalidades aceitas"
        >
          {ad.saleEnabled ? (
            <Badge variant="sale" icon="cart">
              Venda
            </Badge>
          ) : null}
          {ad.tradeEnabled ? (
            <Badge variant="trade">
              <span aria-hidden="true">⇄</span> Troca
            </Badge>
          ) : null}
        </div>

        {ad.description?.trim() ? (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-primary-900">
              Descrição do anúncio
            </h3>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words text-neutral-700">
              {ad.description}
            </p>
          </div>
        ) : null}

        <div className="mt-5 border-t border-neutral-100 pt-5">
          {ad.saleEnabled ? <PurchasePanel ad={ad} /> : <TradeOnlyNotice />}
        </div>

        <Link
          to="/marketplace"
          search={{ sort: 'recent' }}
          className={`mt-5 ${backLinkClass}`}
        >
          <span aria-hidden="true">←</span>
          Voltar ao Marketplace
        </Link>
      </section>
    </div>
  )
}

function AdImage({ ad }: { ad: MarketplaceAd }) {
  const [failed, setFailed] = useState(false)
  const available = Boolean(ad.imageUrl) && !failed

  return (
    <div className={`${panelClass} flex justify-center`}>
      <div className="aspect-[63/88] w-full max-w-[340px] overflow-hidden rounded-surface">
        {available ? (
          <img
            src={ad.imageUrl ?? undefined}
            alt={ad.cardName}
            onError={() => setFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            role="img"
            aria-label={`${ad.cardName}: imagem indisponível`}
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-500"
          >
            <Icon name="gem" size={32} />
            <span className="text-sm">Imagem indisponível</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PurchasePanel({ ad }: { ad: MarketplaceAd }) {
  const { user } = useSession()

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-neutral-700">Preço unitário</p>
        <p className="font-display text-3xl font-bold text-primary-900">
          {ad.unitPrice !== null
            ? formatCurrency(ad.unitPrice)
            : 'Preço indisponível'}
        </p>
      </div>

      {ad.ownAd ? (
        <Alert variant="neutral" title="Este anúncio é seu.">
          Você não pode comprar o próprio anúncio.{' '}
          <Link
            to="/meus-anuncios"
            className="font-semibold underline underline-offset-2"
          >
            Gerenciar em Meus anúncios
          </Link>
        </Alert>
      ) : ad.unitPrice !== null ? (
        <QuantitySelector
          ad={ad}
          unitPrice={ad.unitPrice}
          loggedIn={Boolean(user)}
        />
      ) : null}
    </div>
  )
}

type AddResult =
  | { kind: 'added'; quantity: number }
  | { kind: 'failed'; message: string }
  | { kind: 'unknown' }

function QuantitySelector({
  ad,
  unitPrice,
  loggedIn,
}: {
  ad: MarketplaceAd
  unitPrice: number
  loggedIn: boolean
}) {
  const quantityId = useId()
  const navigate = useNavigate()
  const { setLoginNotice } = useSession()
  const { state: cartState, apply, reload } = useCart()
  const [quantity, setQuantity] = useState('1')
  const [adding, setAdding] = useState(false)
  const [result, setResult] = useState<AddResult | null>(null)

  const inCart =
    cartState.status === 'ready'
      ? (cartState.cart.items.find((item) => item.adId === ad.id)?.quantity ??
        0)
      : 0
  const available = Math.max(ad.remainingQuantity - (loggedIn ? inCart : 0), 0)
  const parsed = /^\d+$/.test(quantity) ? Number(quantity) : NaN
  const valid =
    Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= available

  async function addToCart() {
    if (!valid || adding) return
    setAdding(true)
    setResult(null)

    try {
      apply(await addCartItem(ad.id, parsed))
      setResult({ kind: 'added', quantity: parsed })
      setQuantity('1')
    } catch (cause) {
      const failure = cartFailure(cause)
      if (failure.kind === 'unknown') {
        reload()
        setResult({ kind: 'unknown' })
      } else {
        setResult({
          kind: 'failed',
          message:
            failure.message ??
            'Tente novamente. A quantidade escolhida foi mantida.',
        })
      }
    } finally {
      setAdding(false)
    }
  }

  if (loggedIn && available === 0 && inCart > 0) {
    return (
      <div className="space-y-4">
        {result?.kind === 'added' ? <AddedNotice result={result} /> : null}
        <InCartChip quantity={inCart} />
        <Alert variant="info">
          Todos os exemplares disponíveis já estão no seu carrinho.
        </Alert>
        <CartActions />
        <PurchaseNotices />
      </div>
    )
  }

  function changeQuantity(next: number) {
    setQuantity(String(Math.min(Math.max(next, 1), available)))
  }

  function goToLogin() {
    setLoginNotice(BUY_LOGIN_NOTICE)
    navigate({
      to: '/login',
      search: {
        redirect: `/marketplace/anuncios/${encodeURIComponent(ad.id)}`,
      },
    })
  }

  return (
    <div className="space-y-4">
      {result?.kind === 'added' ? <AddedNotice result={result} /> : null}
      {result?.kind === 'failed' ? (
        <Alert variant="error" title="Não foi possível adicionar ao carrinho.">
          {result.message}
        </Alert>
      ) : null}
      {result?.kind === 'unknown' ? (
        <Alert variant="warning" title="Não foi possível confirmar a adição.">
          Confira seu carrinho antes de tentar de novo.
        </Alert>
      ) : null}

      {loggedIn && inCart > 0 ? <InCartChip quantity={inCart} /> : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label
            htmlFor={quantityId}
            className="mb-1.5 block text-sm font-semibold text-primary-900"
          >
            Quantidade
          </label>
          <div
            className={`flex h-10 w-40 overflow-hidden rounded-control border bg-white focus-within:ring-2 focus-within:ring-secondary-500 ${
              valid ? 'border-neutral-300' : 'border-error-700'
            }`}
          >
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={!(parsed > 1)}
              onClick={() => changeQuantity(parsed - 1)}
              className="flex w-10 shrink-0 cursor-pointer items-center justify-center border-r border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="minus" size={16} />
            </button>
            <input
              id={quantityId}
              inputMode="numeric"
              autoComplete="off"
              value={quantity}
              aria-invalid={valid ? undefined : true}
              aria-describedby={`${quantityId}-hint`}
              onChange={(event) => setQuantity(event.target.value.trim())}
              className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-neutral-900 outline-none"
            />
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={Number.isSafeInteger(parsed) && parsed >= available}
              onClick={() =>
                changeQuantity(Number.isSafeInteger(parsed) ? parsed + 1 : 1)
              }
              className="flex w-10 shrink-0 cursor-pointer items-center justify-center border-l border-neutral-200 text-primary-900 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
          <p
            id={`${quantityId}-hint`}
            className={`mt-1.5 text-xs ${valid ? 'text-neutral-700' : 'text-error-700'}`}
          >
            {valid
              ? `Até ${copies(available)}.`
              : `Informe uma quantidade entre 1 e ${available}.`}
          </p>
        </div>

        <div className="text-right" aria-live="polite">
          <p className="text-sm font-semibold text-neutral-700">Subtotal</p>
          <p className="font-display text-2xl font-bold text-primary-900">
            {valid ? formatCurrency(unitPrice * parsed) : '—'}
          </p>
        </div>
      </div>

      {loggedIn ? (
        <Button
          className="h-12 w-full"
          icon={<Icon name="cart" size={20} />}
          disabled={!valid || adding}
          onClick={addToCart}
        >
          {adding ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </Button>
      ) : (
        <Button
          className="h-12 w-full"
          icon={<Icon name="user" size={20} />}
          onClick={goToLogin}
        >
          Entrar para comprar
        </Button>
      )}

      <PurchaseNotices />
    </div>
  )
}

function AddedNotice({ result }: { result: { quantity: number } }) {
  return (
    <div className="space-y-3">
      <Alert variant="success">
        {result.quantity === 1
          ? '1 exemplar adicionado ao carrinho.'
          : `${result.quantity} exemplares adicionados ao carrinho.`}
      </Alert>
      <CartActions />
    </div>
  )
}

function CartActions() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <Button
        className="h-11 flex-1"
        icon={<Icon name="cart" size={20} />}
        onClick={() => navigate({ to: '/carrinho' })}
      >
        Ver carrinho
      </Button>
      <Link
        to="/marketplace"
        search={{ sort: 'recent' }}
        className={backLinkClass}
      >
        <span aria-hidden="true">←</span>
        Continuar comprando
      </Link>
    </div>
  )
}

function InCartChip({ quantity }: { quantity: number }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-control border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
      Neste carrinho:
      <span className="font-semibold text-primary-900">{copies(quantity)}</span>
    </p>
  )
}

function PurchaseNotices() {
  return (
    <>
      <Alert variant="info" title="Pagamento simulado">
        Nenhum valor será cobrado.
      </Alert>

      <Alert variant="warning">
        Adicionar ao carrinho não reserva os exemplares.
      </Alert>
    </>
  )
}

function TradeOnlyNotice() {
  return (
    <Alert variant="info" title="Somente troca">
      Este anúncio não aceita venda. A proposta de troca estará disponível em
      breve.
    </Alert>
  )
}

function AdSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-5 md:grid-cols-2"
    >
      <span className="sr-only">Carregando anúncio...</span>
      <div className={`${panelClass} flex justify-center`}>
        <div className="aspect-[63/88] w-full max-w-[340px] animate-pulse rounded-surface bg-neutral-200" />
      </div>
      <div className={`${panelClass} space-y-4`}>
        <span className="block h-9 w-2/3 animate-pulse rounded bg-neutral-200" />
        <span className="block h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
        <span className="block h-36 animate-pulse rounded bg-neutral-100" />
        <span className="block h-10 w-1/2 animate-pulse rounded bg-neutral-200" />
        <span className="block h-12 animate-pulse rounded bg-primary-100" />
      </div>
    </div>
  )
}

function AdStatus({
  kind,
  onRetry,
}: {
  kind: 'notFound' | 'error'
  onRetry?: () => void
}) {
  const notFound = kind === 'notFound'

  return (
    <div className="mx-auto max-w-xl space-y-4 py-10">
      <Alert
        variant={notFound ? 'neutral' : 'error'}
        title={
          notFound
            ? 'Anúncio indisponível'
            : 'Não foi possível carregar o anúncio'
        }
      >
        {notFound
          ? 'Este anúncio não existe ou não está mais disponível. Ele pode ter sido cancelado ou esgotado.'
          : 'Verifique sua conexão e tente novamente.'}
      </Alert>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {notFound ? null : <Button onClick={onRetry}>Tentar novamente</Button>}
        <Link
          to="/marketplace"
          search={{ sort: 'recent' }}
          className={backLinkClass}
        >
          <span aria-hidden="true">←</span>
          Voltar ao Marketplace
        </Link>
      </div>
    </div>
  )
}
