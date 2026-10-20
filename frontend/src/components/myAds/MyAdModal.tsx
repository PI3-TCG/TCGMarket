import axios from 'axios'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import {
  conditionLabels,
  copies,
  formatCurrency,
  formatPriceInput,
  gameLabels,
  languageLabels,
  modalityLabel,
  parsePrice,
} from '@/components/ads/adFormat'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cancelMyAd, getMyAd, updateMyAd } from '@/services/ads'
import type { AdStatus, OwnAd } from '@/types/Ad'
import { AdStatusBadge } from './AdStatusBadge'

export type MyAdModalView = 'details' | 'edit' | 'cancel'

type Props = {
  ad: OwnAd
  initialView: MyAdModalView
  onClose: () => void
  /** Avisa a listagem que o anúncio mudou no servidor. */
  onChanged: (ad: OwnAd | null) => void
}

type View =
  | { kind: 'details' }
  | { kind: 'edit'; saveFailed: boolean }
  | { kind: 'discard' }
  | { kind: 'cancel'; failure: 'none' | 'failed' | 'uncertain' }

type Notice =
  | { kind: 'saved' }
  | { kind: 'cancelled'; released: number }
  | { kind: 'statusChanged'; during: 'edit' | 'cancel'; status: AdStatus }
  | { kind: 'notFound' }
  | null

type Draft = { sale: boolean; trade: boolean; price: string }

type Busy = 'saving' | 'cancelling' | 'refreshing' | null

const AD_STATUSES: AdStatus[] = ['ACTIVE', 'PENDING', 'SOLD_OUT', 'CANCELLED']

function draftFrom(ad: OwnAd): Draft {
  return {
    sale: ad.saleEnabled,
    trade: ad.tradeEnabled,
    price: ad.unitPrice !== null ? formatPriceInput(ad.unitPrice) : '',
  }
}

export function MyAdModal({ ad: initialAd, initialView, onClose, onChanged }: Props) {
  const [ad, setAd] = useState(initialAd)
  const [view, setView] = useState<View>(() =>
    initialAd.status !== 'ACTIVE' || initialView === 'details'
      ? { kind: 'details' }
      : initialView === 'edit'
        ? { kind: 'edit', saveFailed: false }
        : { kind: 'cancel', failure: 'none' },
  )
  const [draft, setDraft] = useState<Draft>(() => draftFrom(initialAd))
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<{
    modality?: string
    unitPrice?: string
  }>({})
  const [busy, setBusy] = useState<Busy>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const titleId = useId()
  const priceId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const saleRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)

  const active = ad.status === 'ACTIVE'
  const parsedPrice = parsePrice(draft.price)
  const modalityError =
    !draft.sale && !draft.trade ? 'Selecione uma modalidade.' : null
  const priceError = !draft.sale
    ? null
    : parsedPrice === null
      ? 'Informe o preço por unidade.'
      : Number.isNaN(parsedPrice)
        ? 'Informe um preço válido.'
        : null
  const shownModalityError = attempted
    ? (modalityError ?? serverErrors.modality)
    : undefined
  const shownPriceError = attempted
    ? (priceError ?? serverErrors.unitPrice)
    : undefined

  const dirty =
    draft.sale !== ad.saleEnabled ||
    draft.trade !== ad.tradeEnabled ||
    (draft.sale && parsedPrice !== ad.unitPrice)

  function requestClose() {
    if (busy) return
    if (view.kind === 'edit' && dirty) {
      setView({ kind: 'discard' })
      return
    }
    if (view.kind === 'discard') {
      setView({ kind: 'edit', saveFailed: false })
      return
    }
    onClose()
  }

  const requestCloseRef = useRef(requestClose)
  useEffect(() => {
    requestCloseRef.current = requestClose
  })

  useDialogBehavior(
    dialogRef,
    requestCloseRef,
    view.kind === 'cancel' ? `cancel-${view.failure}` : view.kind,
  )

  function startEdit() {
    setDraft(draftFrom(ad))
    setAttempted(false)
    setServerErrors({})
    setNotice(null)
    setView({ kind: 'edit', saveFailed: false })
  }

  function backToDetails() {
    setDraft(draftFrom(ad))
    setAttempted(false)
    setServerErrors({})
    setView({ kind: 'details' })
  }

  async function syncAfterConflict(during: 'edit' | 'cancel', fallback: AdStatus) {
    let status = fallback
    try {
      const current = await getMyAd(ad.id)
      setAd(current)
      setDraft(draftFrom(current))
      status = current.status
      onChanged(current)
    } catch {
      setAd((current) => ({ ...current, status: fallback }))
      onChanged(null)
    }
    setNotice({ kind: 'statusChanged', during, status })
    setView({ kind: 'details' })
  }

  function markNotFound() {
    setNotice({ kind: 'notFound' })
    setView({ kind: 'details' })
    onChanged(null)
  }

  async function save() {
    setAttempted(true)
    setServerErrors({})

    if (modalityError) {
      saleRef.current?.focus()
      return
    }
    if (priceError) {
      priceRef.current?.focus()
      return
    }

    setBusy('saving')
    try {
      const updated = await updateMyAd(ad.id, {
        saleEnabled: draft.sale,
        tradeEnabled: draft.trade,
        unitPrice: draft.sale ? parsedPrice : null,
      })
      setAd(updated)
      setDraft(draftFrom(updated))
      setAttempted(false)
      setNotice({ kind: 'saved' })
      setView({ kind: 'details' })
      onChanged(updated)
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined

      if (status === 409) {
        await syncAfterConflict('edit', conflictStatus(error) ?? ad.status)
      } else if (status === 404) {
        markNotFound()
      } else if (
        status === 400 &&
        axios.isAxiosError<{ fields?: { field: string; message: string }[] }>(
          error,
        )
      ) {
        const fields = error.response?.data?.fields ?? []
        setServerErrors({
          modality: fields.find((field) => field.field === 'modality')?.message,
          unitPrice: fields.find((field) => field.field === 'unitPrice')
            ?.message,
        })
        setView({ kind: 'edit', saveFailed: fields.length === 0 })
      } else {
        setView({ kind: 'edit', saveFailed: true })
      }
    } finally {
      setBusy(null)
    }
  }

  async function confirmCancel() {
    setBusy('cancelling')
    try {
      const cancelled = await cancelMyAd(ad.id)
      setAd(cancelled)
      setNotice({
        kind: 'cancelled',
        released: cancelled.releasedQuantity ?? cancelled.remainingQuantity,
      })
      setView({ kind: 'details' })
      onChanged(cancelled)
    } catch (error) {
      const response = axios.isAxiosError(error) ? error.response : undefined

      if (!response) {
        setView({ kind: 'cancel', failure: 'uncertain' })
      } else if (response.status === 409) {
        await syncAfterConflict('cancel', conflictStatus(error) ?? ad.status)
      } else if (response.status === 404) {
        markNotFound()
      } else {
        setView({ kind: 'cancel', failure: 'failed' })
      }
    } finally {
      setBusy(null)
    }
  }

  async function refreshAfterUncertainCancel() {
    setBusy('refreshing')
    try {
      const current = await getMyAd(ad.id)
      setAd(current)
      onChanged(current)
      if (current.status === 'CANCELLED') {
        setNotice({
          kind: 'cancelled',
          released: current.releasedQuantity ?? current.remainingQuantity,
        })
        setView({ kind: 'details' })
      } else if (current.status === 'ACTIVE') {
        setView({ kind: 'cancel', failure: 'none' })
      } else {
        setNotice({
          kind: 'statusChanged',
          during: 'cancel',
          status: current.status,
        })
        setView({ kind: 'details' })
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        markNotFound()
      }
    } finally {
      setBusy(null)
    }
  }

  const title =
    view.kind === 'edit'
      ? 'Editar anúncio'
      : view.kind === 'discard'
        ? 'Descartar alterações?'
        : view.kind === 'cancel'
          ? 'Cancelar anúncio?'
          : 'Detalhes do anúncio'

  const titleIcon: IconName =
    view.kind === 'cancel' ? 'close-circle' : view.kind === 'discard' ? 'alert' : 'cart'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#170b24]/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy ? true : undefined}
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 pt-5 pb-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span
              className={
                view.kind === 'cancel' ? 'text-error-700' : 'text-primary-900'
              }
            >
              <Icon name={titleIcon} size={24} />
            </span>
            <h2
              id={titleId}
              tabIndex={-1}
              className="font-display text-xl font-bold text-primary-900 outline-none sm:text-2xl"
            >
              {title}
            </h2>
            {view.kind !== 'cancel' && view.kind !== 'discard' && (
              <AdStatusBadge status={ad.status} />
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={busy !== null}
            onClick={requestClose}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-control text-neutral-700 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {view.kind === 'discard' ? (
            <div className="space-y-2 text-neutral-700">
              <p className="font-semibold text-neutral-900">
                As alterações não salvas serão perdidas.
              </p>
              <p className="text-sm">O anúncio continuará como está.</p>
            </div>
          ) : view.kind === 'cancel' ? (
            <CancelContent ad={ad} failure={view.failure} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <CardImage ad={ad} />

              <div className="min-w-0">
                <h3 className="font-display text-2xl font-bold break-words text-primary-900">
                  {ad.card.name}
                </h3>
                <p className="mt-1 text-sm text-primary-700">
                  {gameLabels[ad.card.game] ?? ad.card.game} • {ad.card.edition}
                  {ad.card.cardNumber ? ` • ${ad.card.cardNumber}` : ''}
                  {ad.card.officialRarity ? ` • ${ad.card.officialRarity}` : ''}
                </p>

                <dl className="mt-4 divide-y divide-neutral-100 text-sm">
                  <InfoRow label="Condição" value={conditionLabels[ad.condition]} />
                  <InfoRow label="Idioma" value={languageLabels[ad.language]} />
                  {ad.status === 'CANCELLED' && ad.releasedQuantity !== null ? (
                    <InfoRow
                      label="Liberados no cancelamento"
                      value={copies(ad.releasedQuantity)}
                    />
                  ) : (
                    <InfoRow
                      label="Quantidade restante"
                      value={copies(ad.remainingQuantity)}
                    />
                  )}
                </dl>

                {view.kind === 'edit' ? (
                  <EditFields
                    draft={draft}
                    onDraft={setDraft}
                    disabled={busy !== null}
                    saleRef={saleRef}
                    priceRef={priceRef}
                    priceId={priceId}
                    modalityError={shownModalityError}
                    priceError={shownPriceError}
                  />
                ) : (
                  <ModalityView ad={ad} />
                )}
              </div>
            </div>
          )}

          {view.kind !== 'discard' && view.kind !== 'cancel' && (
            <div className="mt-5 space-y-3">
              <NoticeArea notice={notice} />
              {view.kind === 'edit' && view.saveFailed && (
                <Feedback tone="error" icon="close-circle" role="alert">
                  <strong>Não foi possível salvar.</strong> Tente novamente.
                  Seus dados foram mantidos.
                </Feedback>
              )}
              {view.kind === 'details' && <StatusSummary ad={ad} />}
              {view.kind === 'edit' && (
                <Feedback tone="primary" icon="info">
                  {copies(ad.remainingQuantity)} •{' '}
                  {modalityLabel(draft.sale, draft.trade)}
                </Feedback>
              )}
            </div>
          )}

          {busy === 'saving' && (
            <p role="status" className="sr-only">
              Salvando alterações...
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 px-5 py-4 sm:px-6">
          {view.kind === 'details' &&
            (active && notice?.kind !== 'notFound' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setView({ kind: 'cancel', failure: 'none' })}
                  className="mr-auto border-error-700 text-error-700 hover:bg-error-50"
                >
                  <Icon name="close-circle" size={16} />
                  Cancelar anúncio
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button onClick={startEdit} data-autofocus>
                  <Icon name="settings" size={16} />
                  Editar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose} data-autofocus>
                Fechar
              </Button>
            ))}

          {view.kind === 'edit' && (
            <>
              <Button
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  dirty ? setView({ kind: 'discard' }) : backToDetails()
                }
              >
                Cancelar edição
              </Button>
              <Button
                onClick={() => void save()}
                disabled={busy !== null || (!dirty && !view.saveFailed)}
              >
                {busy === 'saving' ? <Spinner /> : <Icon name="check" size={16} />}
                {busy === 'saving'
                  ? 'Salvando...'
                  : view.saveFailed
                    ? 'Tentar novamente'
                    : 'Salvar alterações'}
              </Button>
            </>
          )}

          {view.kind === 'discard' && (
            <>
              <Button variant="outline" onClick={backToDetails}>
                Descartar alterações
              </Button>
              <Button
                onClick={() => setView({ kind: 'edit', saveFailed: false })}
                data-autofocus
              >
                Continuar editando
              </Button>
            </>
          )}

          {view.kind === 'cancel' && (
            <>
              <Button
                variant="outline"
                disabled={busy !== null}
                onClick={() => setView({ kind: 'details' })}
                data-autofocus
              >
                Voltar
              </Button>
              {view.failure === 'uncertain' ? (
                <Button
                  disabled={busy !== null}
                  onClick={() => void refreshAfterUncertainCancel()}
                >
                  {busy === 'refreshing' && <Spinner />}
                  {busy === 'refreshing' ? 'Atualizando...' : 'Atualizar'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  disabled={busy !== null}
                  onClick={() => void confirmCancel()}
                >
                  {busy === 'cancelling' && <Spinner />}
                  {busy === 'cancelling'
                    ? 'Cancelando...'
                    : view.failure === 'failed'
                      ? 'Tentar novamente'
                      : 'Confirmar cancelamento'}
                </Button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function conflictStatus(error: unknown): AdStatus | null {
  if (!axios.isAxiosError<{ fields?: { field: string; message: string }[] }>(error)) {
    return null
  }
  const value = error.response?.data?.fields?.find(
    (field) => field.field === 'status',
  )?.message
  return AD_STATUSES.find((status) => status === value) ?? null
}

/**
 * Foco preso no modal, Escape tratado pelo próprio modal e foco devolvido ao
 * disparador ao fechar. A cada troca de estado, o foco vai para o botão
 * marcado com data-autofocus ou, sem ele, para o título.
 */
function useDialogBehavior(
  dialogRef: RefObject<HTMLDivElement | null>,
  requestCloseRef: RefObject<() => void>,
  stateKey: string,
) {
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href]',
        ),
      ]
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [dialogRef, requestCloseRef])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const target =
      dialog.querySelector<HTMLElement>('[data-autofocus]:not([disabled])') ??
      dialog.querySelector<HTMLElement>('h2')
    target?.focus()
  }, [dialogRef, stateKey])
}

function CardImage({ ad, small = false }: { ad: OwnAd; small?: boolean }) {
  const [failed, setFailed] = useState(false)
  const hasImage = Boolean(ad.card.imageUrl) && !failed

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl bg-primary-100 ${
        small ? 'h-32 w-24' : 'mx-auto h-64 w-44 sm:mx-0 sm:w-full'
      }`}
    >
      {hasImage ? (
        <img
          src={ad.card.imageUrl}
          alt={ad.card.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Icon name="grid" size={32} className="text-primary-700" />
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 py-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  )
}

function ModalityView({ ad }: { ad: OwnAd }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-neutral-900">Modalidade</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {ad.saleEnabled && (
          <span className="flex items-center justify-center gap-2 rounded-lg bg-primary-100 px-3 py-2 text-sm font-semibold text-primary-900">
            <Icon name="cart" size={16} />
            Venda
          </span>
        )}
        {ad.tradeEnabled && (
          <span className="flex items-center justify-center gap-2 rounded-lg bg-secondary-100 px-3 py-2 text-sm font-semibold text-secondary-700">
            <Icon name="share" size={16} />
            Troca
          </span>
        )}
      </div>
      {ad.saleEnabled && ad.unitPrice !== null ? (
        <>
          <p className="mt-4 text-sm text-neutral-700">Preço por unidade</p>
          <p className="font-display text-2xl font-bold text-primary-900">
            {formatCurrency(ad.unitPrice)}
          </p>
        </>
      ) : (
        <p className="mt-4 font-display text-lg font-bold text-secondary-700">
          Somente troca
        </p>
      )}
    </div>
  )
}

function EditFields({
  draft,
  onDraft,
  disabled,
  saleRef,
  priceRef,
  priceId,
  modalityError,
  priceError,
}: {
  draft: Draft
  onDraft: (update: (current: Draft) => Draft) => void
  disabled: boolean
  saleRef: RefObject<HTMLInputElement | null>
  priceRef: RefObject<HTMLInputElement | null>
  priceId: string
  modalityError?: string
  priceError?: string
}) {
  const modalityErrorId = `${priceId}-modality-error`

  return (
    <div className="mt-4 space-y-4">
      <fieldset
        aria-describedby={modalityError ? modalityErrorId : undefined}
      >
        <legend className="text-sm font-semibold text-neutral-900">
          Modalidade
        </legend>
        <p className="text-xs text-neutral-700">Selecione uma ou as duas.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ModalityToggle
            inputRef={saleRef}
            label="Venda"
            icon="cart"
            tone="sale"
            checked={draft.sale}
            disabled={disabled}
            invalid={Boolean(modalityError)}
            onChange={(sale) => onDraft((current) => ({ ...current, sale }))}
          />
          <ModalityToggle
            label="Troca"
            icon="share"
            tone="trade"
            checked={draft.trade}
            disabled={disabled}
            invalid={Boolean(modalityError)}
            onChange={(trade) => onDraft((current) => ({ ...current, trade }))}
          />
        </div>
        {modalityError && (
          <FieldError id={modalityErrorId}>{modalityError}</FieldError>
        )}
      </fieldset>

      {draft.sale && (
        <div>
          <label
            htmlFor={priceId}
            className="text-sm font-semibold text-neutral-900"
          >
            Preço por unidade (R$) <span className="text-error-700">*</span>
          </label>
          <div
            className={`mt-1.5 flex h-11 items-center gap-2 rounded-control border bg-white px-3 focus-within:ring-2 focus-within:ring-secondary-500 ${
              priceError ? 'border-error-700' : 'border-neutral-300'
            }`}
          >
            <span className="text-sm text-neutral-500">R$</span>
            <input
              ref={priceRef}
              id={priceId}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={draft.price}
              disabled={disabled}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={`${priceId}-hint`}
              onChange={(event) => {
                const price = event.target.value
                onDraft((current) => ({ ...current, price }))
              }}
              onBlur={() => {
                const value = parsePrice(draft.price)
                if (value !== null && !Number.isNaN(value)) {
                  onDraft((current) => ({
                    ...current,
                    price: formatPriceInput(value),
                  }))
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none disabled:cursor-not-allowed"
            />
          </div>
          {priceError ? (
            <FieldError id={`${priceId}-hint`}>{priceError}</FieldError>
          ) : (
            <p id={`${priceId}-hint`} className="mt-1 text-xs text-neutral-700">
              Obrigatório para venda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ModalityToggle({
  inputRef,
  label,
  icon,
  tone,
  checked,
  disabled,
  invalid,
  onChange,
}: {
  inputRef?: RefObject<HTMLInputElement | null>
  label: string
  icon: IconName
  tone: 'sale' | 'trade'
  checked: boolean
  disabled: boolean
  invalid: boolean
  onChange: (checked: boolean) => void
}) {
  const selected =
    tone === 'sale'
      ? 'border-primary-900 bg-primary-100 text-primary-900'
      : 'border-secondary-500 bg-secondary-100 text-secondary-700'

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-secondary-500 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 ${
        checked
          ? selected
          : invalid
            ? 'border-error-700 bg-white text-neutral-700'
            : 'border-neutral-200 bg-white text-neutral-700'
      }`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.checked)}
        className={`size-4 ${tone === 'sale' ? 'accent-primary-900' : 'accent-secondary-500'}`}
      />
      <Icon name={icon} size={16} />
      {label}
    </label>
  )
}

function CancelContent({
  ad,
  failure,
}: {
  ad: OwnAd
  failure: 'none' | 'failed' | 'uncertain'
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <CardImage ad={ad} small />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold break-words text-primary-900">
              {ad.card.name}
            </h3>
            <AdStatusBadge status={ad.status} />
          </div>
          <p className="text-sm text-primary-700">
            {gameLabels[ad.card.game] ?? ad.card.game} • {ad.card.edition}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-700">
              {conditionLabels[ad.condition]}
            </span>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-900">
              {languageLabels[ad.language]}
            </span>
          </div>
          <p className="text-sm text-primary-700">
            {copies(ad.remainingQuantity)} •{' '}
            {modalityLabel(ad.saleEnabled, ad.tradeEnabled)}
          </p>
          {ad.saleEnabled && ad.unitPrice !== null && (
            <p className="font-display text-lg font-bold text-primary-900">
              {formatCurrency(ad.unitPrice)}{' '}
              <span className="font-sans text-sm font-normal">por unidade</span>
            </p>
          )}
        </div>
      </div>

      {failure === 'failed' ? (
        <Feedback tone="error" icon="close-circle" role="alert">
          <strong>Não foi possível cancelar.</strong> Tente novamente. O anúncio
          continua ativo.
        </Feedback>
      ) : failure === 'uncertain' ? (
        <Feedback tone="warning" icon="alert" role="alert">
          Não foi possível confirmar o cancelamento. Atualize para verificar.
        </Feedback>
      ) : (
        <Feedback tone="warning" icon="alert">
          <span className="block">O anúncio sairá do marketplace.</span>
          <span className="block">
            {ad.remainingQuantity === 1
              ? 'O exemplar restante será liberado para novos anúncios.'
              : `Os ${ad.remainingQuantity} exemplares restantes serão liberados para novos anúncios.`}
          </span>
          <span className="block">O histórico será mantido.</span>
        </Feedback>
      )}
    </div>
  )
}

const statusChangedText: Record<
  Exclude<AdStatus, 'ACTIVE'>,
  { edit: string; cancel: string }
> = {
  PENDING: {
    edit: 'Agora está aguardando pagamento. As alterações não foram salvas.',
    cancel: 'O anúncio está aguardando pagamento e não pode ser cancelado.',
  },
  SOLD_OUT: {
    edit: 'O anúncio foi finalizado. As alterações não foram salvas.',
    cancel: 'O anúncio foi finalizado e não pode ser cancelado.',
  },
  CANCELLED: {
    edit: 'O anúncio foi cancelado. As alterações não foram salvas.',
    cancel: 'O anúncio já foi cancelado.',
  },
}

function NoticeArea({ notice }: { notice: Notice }) {
  if (!notice) return null

  if (notice.kind === 'saved') {
    return (
      <Feedback tone="success" icon="check-circle" role="status">
        <strong>Alterações salvas!</strong>
      </Feedback>
    )
  }

  if (notice.kind === 'cancelled') {
    return (
      <Feedback tone="success" icon="check-circle" role="status">
        <strong className="block">Anúncio cancelado.</strong>
        <span className="block">
          {notice.released === 1
            ? '1 exemplar liberado para novos anúncios.'
            : `${notice.released} exemplares liberados para novos anúncios.`}
        </span>
        <span className="block">Histórico preservado.</span>
      </Feedback>
    )
  }

  if (notice.kind === 'notFound') {
    return (
      <Feedback tone="error" icon="close-circle" role="alert">
        <strong className="block">Anúncio indisponível.</strong>
        Ele não foi encontrado na sua conta. A listagem foi atualizada.
      </Feedback>
    )
  }

  const text =
    notice.status === 'ACTIVE'
      ? null
      : statusChangedText[notice.status][notice.during]

  return (
    <Feedback tone="warning" icon="alert" role="alert">
      <strong className="block">O status do anúncio mudou.</strong>
      {text && <span className="block">{text}</span>}
      <span className="block">Edição e cancelamento indisponíveis.</span>
    </Feedback>
  )
}

function StatusSummary({ ad }: { ad: OwnAd }) {
  if (ad.status === 'ACTIVE') {
    return (
      <Feedback tone="primary" icon="info">
        {copies(ad.remainingQuantity)} •{' '}
        {modalityLabel(ad.saleEnabled, ad.tradeEnabled)}
      </Feedback>
    )
  }

  const text =
    ad.status === 'PENDING'
      ? 'Aguardando pagamento. Este anúncio não pode ser editado ou cancelado.'
      : ad.status === 'SOLD_OUT'
        ? 'Anúncio finalizado. Histórico preservado.'
        : 'Anúncio cancelado. Histórico preservado.'

  return (
    <Feedback tone="neutral" icon="info">
      {text}
    </Feedback>
  )
}

const feedbackTones = {
  primary: 'bg-primary-100 text-primary-900',
  success: 'bg-success-50 text-success-700',
  warning: 'border border-warning-200 bg-warning-50 text-warning-700',
  error: 'border border-error-200 bg-error-50 text-error-700',
  neutral: 'bg-neutral-100 text-neutral-700',
}

function Feedback({
  tone,
  icon,
  role,
  children,
}: {
  tone: keyof typeof feedbackTones
  icon: IconName
  role?: 'status' | 'alert'
  children: ReactNode
}) {
  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${feedbackTones[tone]}`}
    >
      <Icon name={icon} size={20} className="mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-sm text-error-700">
      <Icon name="close-circle" size={16} />
      {children}
    </p>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 rounded-full border-2 border-current/40 border-t-current motion-safe:animate-spin"
    />
  )
}
