import { checkoutPanel } from '@/components/checkout/checkoutStyles'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { Link } from '@tanstack/react-router'
import axios from 'axios'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { createAd } from '@/services/ads'
import { getMyCollectionItem } from '@/services/collection'
import type { AdResponse } from '@/types/Ad'
import type {
  CollectionItem,
  CollectionItemAvailability,
} from '@/types/Collection'
import { SelectedCardPanel } from './SelectedCardPanel'
import {
  copies,
  formatCurrency,
  formatPriceInput,
  modalityLabel,
  parsePrice,
} from './adFormat'

type Props = {
  itemId: string
  onChangeCard: () => void
  onDirtyChange: (dirty: boolean) => void
}

export function CreateAdForm({ itemId, onChangeCard, onDirtyChange }: Props) {
  const fetchItem = useCallback(() => getMyCollectionItem(itemId), [itemId])
  const { state, retry } = useRemoteData(`collection-item:${itemId}`, fetchItem)

  if (state.status === 'loading') {
    return <FormSkeleton />
  }

  if (state.status === 'notFound') {
    return (
      <StatePanel
        title="Item indisponível"
        description="Este item não está disponível para anúncio. Ele pode ter sido removido da sua coleção."
      >
        <Button variant="outline" onClick={onChangeCard}>
          Escolher outra carta
        </Button>
        <BackToCollectionLink />
      </StatePanel>
    )
  }

  if (state.status === 'error') {
    return (
      <StatePanel
        title="Não foi possível carregar os dados."
        description="Tente novamente para criar seu anúncio."
        tone="error"
      >
        <Button onClick={retry}>Tentar novamente</Button>
        <BackToCollectionLink />
      </StatePanel>
    )
  }

  return (
    <AdForm
      item={state.data}
      onChangeCard={onChangeCard}
      onDirtyChange={onDirtyChange}
      onItemRemoved={retry}
    />
  )
}

type AdFormProps = {
  item: CollectionItem
  onChangeCard: () => void
  onDirtyChange: (dirty: boolean) => void
  onItemRemoved: () => void
}

function AdForm({
  item,
  onChangeCard,
  onDirtyChange,
  onItemRemoved,
}: AdFormProps) {
  const quantityId = useId()
  const priceId = useId()
  const descriptionId = useId()
  const quantityRef = useRef<HTMLInputElement>(null)
  const saleRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)

  const [availability, setAvailability] = useState<CollectionItemAvailability>(
    item.availability,
  )
  const [quantity, setQuantity] = useState('1')
  const [sale, setSale] = useState(false)
  const [trade, setTrade] = useState(false)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [availabilityChanged, setAvailabilityChanged] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishFailed, setPublishFailed] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [published, setPublished] = useState<AdResponse | null>(null)

  const available = availability.availableQuantity
  const parsedQuantity = /^\d+$/.test(quantity) ? Number(quantity) : NaN
  const parsedPrice = parsePrice(price)

  const quantityError =
    !Number.isSafeInteger(parsedQuantity) || parsedQuantity < 1
      ? 'Informe uma quantidade inteira maior que zero.'
      : parsedQuantity > available
        ? `Máximo de ${copies(available)}.`
        : null
  const modalityError = !sale && !trade ? 'Selecione uma modalidade.' : null
  const priceError = !sale
    ? null
    : parsedPrice === null
      ? 'Informe o preço por unidade.'
      : Number.isNaN(parsedPrice)
        ? 'Informe um preço válido.'
        : null

  const errors = [quantityError, modalityError, priceError].filter(Boolean)
  const showErrors = submitAttempted
  const dirty =
    !published &&
    (
      quantity !== '1' ||
      sale ||
      trade ||
      price !== '' ||
      description !== ''
    )

  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])

  function focusFirstError() {
    if (quantityError) quantityRef.current?.focus()
    else if (modalityError) saleRef.current?.focus()
    else if (priceError) priceRef.current?.focus()
  }

  async function handleSubmit() {
    if (publishing || published) return

    setSubmitAttempted(true)
    setServerError(null)

    if (errors.length > 0) {
      focusFirstError()
      return
    }

    setPublishing(true)
    setPublishFailed(false)

    try {
      const ad = await createAd({
        collectionItemId: item.id,
        quantity: parsedQuantity,
        saleEnabled: sale,
        tradeEnabled: trade,
        unitPrice: sale ? parsedPrice : null,
        description: description.trim() || null,
      })
      setAvailability(ad.availability)
      setPublished(ad)
    } catch (error: unknown) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined

      if (status === 409) {
        try {
          const fresh = await getMyCollectionItem(item.id)
          setAvailability(fresh.availability)
          setAvailabilityChanged(true)
        } catch {
          setPublishFailed(true)
        }
      } else if (status === 404) {
        onItemRemoved()
      } else if (status === 400) {
        setServerError('Revise os dados do anúncio.')
      } else {
        setPublishFailed(true)
      }
    } finally {
      setPublishing(false)
    }
  }

  function changeQuantity(next: number) {
    setQuantity(String(Math.min(Math.max(1, next), Math.max(1, available))))
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6">
      <SelectedCardPanel
        item={item}
        availability={availability}
        published={published !== null}
        onChangeCard={published ? undefined : onChangeCard}
        disabled={publishing}
      />

      {published ? (
        <PublishedPanel ad={published} />
      ) : (
        <section
          aria-labelledby="ad-config-title"
          className={checkoutPanel}
        >
          <h2
            id="ad-config-title"
            className="flex items-center gap-2 font-title text-lg font-bold text-brand-primary sm:text-xl"
          >
            <Icon name="settings" size={24} />
            Configurar anúncio
          </h2>

          {available === 0 ? (
            <div className="mt-4 space-y-4">
              <Alert variant="warning" title="Sem quantidade disponível">
                Todos os exemplares estão em outros anúncios.
              </Alert>
              <div className="flex flex-wrap gap-2">
                <BackToCollectionLink />
                <MyAdsButton />
              </div>
            </div>
          ) : (
            <form
              noValidate
              className="mt-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit()
              }}
            >
              <fieldset disabled={publishing} className="space-y-5">
                {availabilityChanged && (
                  <Alert
                    variant="warning"
                    title="A disponibilidade mudou. Revise a quantidade."
                    onDismiss={() => setAvailabilityChanged(false)}
                  >
                    Agora há apenas {copies(available)}{' '}
                    {available === 1 ? 'disponível' : 'disponíveis'}.
                  </Alert>
                )}

                <div>
                  <label
                    htmlFor={quantityId}
                    className="mb-1.5 block text-sm font-semibold text-brand-primary"
                  >
                    Quantidade
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`flex h-10 w-40 overflow-hidden rounded-control border bg-surface-input focus-within:ring-2 focus-within:ring-support-blue ${showErrors && quantityError
                        ? 'border-error-700'
                        : 'border-border-default'
                        }`}
                    >
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        disabled={!(parsedQuantity > 1)}
                        onClick={() => changeQuantity(parsedQuantity - 1)}
                        className="flex w-10 shrink-0 cursor-pointer items-center justify-center border-r border-border-default text-brand-primary hover:bg-surface-brand-tint disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Icon name="minus" size={16} />
                      </button>
                      <input
                        ref={quantityRef}
                        id={quantityId}
                        inputMode="numeric"
                        autoComplete="off"
                        value={quantity}
                        aria-invalid={showErrors && quantityError ? true : undefined}
                        aria-describedby={`${quantityId}-hint`}
                        onChange={(event) => setQuantity(event.target.value.trim())}
                        className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold text-text-primary outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        disabled={
                          Number.isSafeInteger(parsedQuantity) &&
                          parsedQuantity >= available
                        }
                        onClick={() =>
                          changeQuantity(
                            Number.isSafeInteger(parsedQuantity)
                              ? parsedQuantity + 1
                              : 1,
                          )
                        }
                        className="flex w-10 shrink-0 cursor-pointer items-center justify-center border-l border-border-default text-brand-primary hover:bg-surface-brand-tint disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Icon name="plus" size={16} />
                      </button>
                    </div>
                    <p
                      id={`${quantityId}-hint`}
                      className="text-xs text-text-secondary"
                    >
                      Até {copies(available)}{' '}
                      {available === 1 ? 'disponível' : 'disponíveis'}.
                    </p>
                  </div>
                  {showErrors && quantityError && (
                    <FieldError>{quantityError}</FieldError>
                  )}
                </div>

                <fieldset className="border-t border-border-default pt-5">
                  <legend className="text-sm font-semibold text-brand-primary">
                    Modalidade
                  </legend>
                  <p className="text-xs text-text-secondary">
                    Selecione uma ou as duas.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ModalityOption
                      inputRef={saleRef}
                      tone="sale"
                      checked={sale}
                      onChange={setSale}
                      icon="cart"
                      title="Venda"
                      description="Venda por um preço definido."
                      invalid={Boolean(showErrors && modalityError)}
                    />
                    <ModalityOption
                      tone="trade"
                      checked={trade}
                      onChange={setTrade}
                      icon="share"
                      title="Troca"
                      description="Receba propostas de troca."
                      invalid={Boolean(showErrors && modalityError)}
                    />
                  </div>
                  {sale && trade && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
                      <Icon name="info" size={16} />
                      Venda e troca usam a mesma quantidade.
                    </p>
                  )}
                  {showErrors && modalityError && (
                    <FieldError>{modalityError}</FieldError>
                  )}
                </fieldset>

                {sale && (
                  <div>
                    <label
                      htmlFor={priceId}
                      className="mb-1.5 block text-sm font-semibold text-brand-primary"
                    >
                      Preço por unidade (R$){' '}
                      <span className="text-error-700">*</span>
                    </label>
                    <div
                      className={`flex h-10 items-center rounded-control border bg-surface-input px-3 focus-within:ring-2 focus-within:ring-support-blue ${showErrors && priceError
                        ? 'border-error-700'
                        : 'border-border-default'
                        }`}
                    >
                      <span className="mr-2 text-sm text-text-secondary">R$</span>
                      <input
                        ref={priceRef}
                        id={priceId}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0,00"
                        value={price}
                        aria-invalid={showErrors && priceError ? true : undefined}
                        aria-describedby={`${priceId}-hint`}
                        onChange={(event) => setPrice(event.target.value)}
                        onBlur={() => {
                          const value = parsePrice(price)
                          if (value !== null && !Number.isNaN(value)) {
                            setPrice(formatPriceInput(value))
                          }
                        }}
                        className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none"
                      />
                    </div>
                    <p
                      id={`${priceId}-hint`}
                      className="mt-1 text-xs text-text-secondary"
                    >
                      Obrigatório para venda.
                    </p>
                    {showErrors && priceError && (
                      <FieldError>{priceError}</FieldError>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor={descriptionId}
                    className="mb-1.5 block text-sm font-semibold text-brand-primary"
                  >
                    Descrição (opcional)
                  </label>

                  <textarea
                    id={descriptionId}
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    aria-describedby={`${descriptionId}-hint`}
                    placeholder="Conte mais sobre a carta ou suas preferências de troca..."
                    className="w-full resize-y rounded-control border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-blue disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p
                    id={`${descriptionId}-hint`}
                    className="mt-1 text-xs text-text-secondary"
                  >
                    Acrescente informações que ajudem outros colecionadores a entender seu anúncio.
                  </p>
                </div>

                <AdSummary
                  valid={errors.length === 0}
                  quantity={parsedQuantity}
                  sale={sale}
                  trade={trade}
                  price={parsedPrice}
                />

                <div aria-live="polite" className="space-y-3">
                  {showErrors && errors.length > 0 && (
                    <Alert variant="error">
                      {errors.length === 1
                        ? 'Revise o campo destacado.'
                        : 'Revise os campos destacados.'}
                    </Alert>
                  )}
                  {serverError && <Alert variant="error">{serverError}</Alert>}
                  {publishFailed && (
                    <Alert
                      variant="error"
                      title="Não foi possível publicar. Tente novamente."
                    >
                      Seus dados foram mantidos.
                    </Alert>
                  )}
                </div>
              </fieldset>

              <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-border-default pt-4">
                {publishing ? (
                  <Button variant="outline" disabled>
                    Voltar à coleção
                  </Button>
                ) : (
                  <BackToCollectionLink />
                )}
                <Button type="submit" className="h-auto min-h-11 max-w-full whitespace-normal py-2" disabled={publishing}>
                  {publishing ? (
                    <span
                      aria-hidden="true"
                      className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
                    />
                  ) : (
                    <Icon name="sparkle" size={16} />
                  )}
                  {publishing
                    ? 'Publicando...'
                    : publishFailed
                      ? 'Tentar publicar novamente'
                      : 'Publicar anúncio'}
                </Button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  )
}

function ModalityOption({
  inputRef,
  tone,
  checked,
  onChange,
  icon,
  title,
  description,
  invalid,
}: {
  inputRef?: Ref<HTMLInputElement>
  tone: 'sale' | 'trade'
  checked: boolean
  onChange: (checked: boolean) => void
  icon: 'cart' | 'share'
  title: string
  description: string
  invalid: boolean
}) {
  const colors =
    tone === 'sale'
      ? {
        selected: 'border-brand-primary bg-surface-sand',
        text: 'text-brand-primary',
        accent: 'accent-primary-900',
      }
      : {
        selected: 'border-secondary-500 bg-secondary-100',
        text: 'text-secondary-700',
        accent: 'accent-secondary-500',
      }

  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-support-blue has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 ${checked
        ? colors.selected
        : invalid
          ? 'border-error-700 bg-surface-input'
          : 'border-border-default bg-surface-input hover:border-primary-300'
        }`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.checked)}
        className={`absolute top-3 right-3 size-5 cursor-pointer ${colors.accent}`}
      />
      <span className={colors.text}>
        <Icon name={icon} size={32} />
      </span>
      <span className={`font-title text-lg font-bold ${colors.text}`}>
        {title}
      </span>
      <span className="text-xs text-text-secondary">{description}</span>
    </label>
  )
}

function AdSummary({
  valid,
  quantity,
  sale,
  trade,
  price,
}: {
  valid: boolean
  quantity: number
  sale: boolean
  trade: boolean
  price: number | null
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-sand/50 p-4">
      <span className="text-brand-primary">
        <Icon name="info" size={32} />
      </span>
      <div>
        <p className="font-title text-base font-bold text-brand-primary">
          Resumo do anúncio
        </p>
        {valid ? (
          <>
            <p className="text-sm text-text-secondary">
              {copies(quantity)} • {modalityLabel(sale, trade)}
            </p>
            <p className="mt-1 font-title text-xl font-bold text-brand-primary">
              {sale && price !== null
                ? `${formatCurrency(price)} por unidade`
                : 'Disponível para troca'}
            </p>
          </>
        ) : (
          <p className="text-sm text-text-secondary">
            Preencha quantidade, modalidade e preço para ver o resumo.
          </p>
        )}
      </div>
    </div>
  )
}

function PublishedPanel({ ad }: { ad: AdResponse }) {
  return (
    <section
      role="status"
      aria-labelledby="ad-published-title"
      className={`${checkoutPanel} flex flex-col items-center py-8 text-center sm:py-10`}
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-success-50 text-success-700">
        <Icon name="check" size={32} />
      </span>
      <h2
        id="ad-published-title"
        className="mt-4 font-title text-2xl font-bold text-brand-primary sm:text-3xl"
      >
        Anúncio publicado!
      </h2>
      <p className="mt-1 text-text-secondary">
        Sua carta já está disponível no marketplace.
      </p>

      <div className="mt-6 w-full max-w-md rounded-xl bg-surface-sand/50 p-4 text-left">
        <p className="text-sm text-text-secondary">
          {copies(ad.quantity)} • {modalityLabel(ad.saleEnabled, ad.tradeEnabled)}
        </p>
        <p className="mt-1 font-title text-xl font-bold text-brand-primary">
          {ad.saleEnabled && ad.unitPrice !== null
            ? `${formatCurrency(ad.unitPrice)} por unidade`
            : 'Disponível para troca'}
        </p>
      </div>

      <div className="mt-6 grid w-full max-w-md justify-items-center gap-3 sm:grid-cols-2">
        <MyAdsButton />
        <Button
          disabled
          title="A página do anúncio ainda não está disponível"
        >
          Ver anúncio
        </Button>
      </div>
      <Link
        to="/minha-colecao"
        className="mt-4 text-sm font-semibold text-brand-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-support-blue"
      >
        Voltar à coleção
      </Link>
    </section>
  )
}

function MyAdsButton() {
  return (
    <Link
      to="/meus-anuncios"
      className="inline-flex min-h-11 w-fit max-w-full items-center justify-center gap-2 rounded-control border border-brand-primary px-4 text-sm font-semibold text-brand-primary hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-support-blue"
    >
      Meus anúncios
    </Link>
  )
}

function BackToCollectionLink() {
  return (
    <Link
      to="/minha-colecao"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-control border border-brand-primary px-4 text-sm font-semibold text-brand-primary hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-support-blue"
    >
      Voltar à coleção
    </Link>
  )
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-sm text-error-700">
      <Icon name="close-circle" size={16} />
      {children}
    </p>
  )
}

function StatePanel({
  title,
  description,
  tone = 'neutral',
  children,
}: {
  title: string
  description: string
  tone?: 'neutral' | 'error'
  children: ReactNode
}) {
  return (
    <section
      role={tone === 'error' ? 'alert' : 'status'}
      className={`${checkoutPanel} flex flex-col items-center py-12 text-center`}
    >
      <Icon
        name="alert"
        size={32}
        className={tone === 'error' ? 'text-error-700' : 'text-warning-700'}
      />
      <h2 className="mt-3 font-title text-xl font-bold text-brand-primary">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm text-text-secondary">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>
    </section>
  )
}

function FormSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="mb-3 text-sm text-text-secondary">
        Carregando dados do anúncio...
      </p>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6"
      >
        <div className="h-[560px] rounded-xl border border-border-default bg-surface-subtle motion-safe:animate-pulse" />
        <div className="h-[560px] rounded-xl border border-border-default bg-surface-subtle motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
