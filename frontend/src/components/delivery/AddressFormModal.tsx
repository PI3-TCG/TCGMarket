import { useId, useRef, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import {
  modalDangerButton,
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import {
  addressFailure,
  createAddress,
  updateAddress,
  type AddressFieldErrors,
} from '@/services/addresses'
import type { Address, AddressField } from '@/types/Address'
import {
  LIMITS,
  STATES,
  draftFrom,
  emptyDraft,
  maskZipCode,
  sameDraft,
  toInput,
  validateDraft,
  type AddressDraft,
} from './addressFormat'

type AddressFormModalProps = {
  /** Endereço em edição; ausente para cadastrar um novo. */
  address: Address | null
  /** Primeiro endereço do usuário: o servidor sempre o marca como principal. */
  firstAddress: boolean
  onSaved: (address: Address) => void
  /** Resposta perdida: o endereço pode ter sido gravado. */
  onUnknownResult: () => void
  onClose: () => void
}

const STATE_OPTIONS = STATES.map((state) => ({ value: state, label: state }))
const sectionStyle =
  'rounded-[18px] border border-border-default bg-surface-input p-4 shadow-sm sm:p-5'
const sectionTitle =
  'mb-4 flex items-center gap-2 border-b border-border-default pb-3 font-title text-sm font-bold uppercase tracking-[0.035em] text-text-primary'

export function AddressFormModal({
  address,
  firstAddress,
  onSaved,
  onUnknownResult,
  onClose,
}: AddressFormModalProps) {
  const editing = address !== null
  const [initial] = useState(() =>
    address ? draftFrom(address) : emptyDraft(firstAddress),
  )
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<AddressFieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  function change<K extends keyof AddressDraft>(
    key: K,
    value: AddressDraft[K],
  ) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    if (submitted) setErrors(validateDraft(next))
  }

  function requestClose() {
    if (saving) return
    if (confirmingDiscard) {
      setConfirmingDiscard(false)
      return
    }
    if (sameDraft(draft, initial)) {
      onClose()
      return
    }
    setConfirmingDiscard(true)
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus()
    })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving || confirmingDiscard) return

    setSubmitted(true)
    setFailure(null)
    const found = validateDraft(draft)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      focusFirstError()
      return
    }

    setSaving(true)
    try {
      const input = toInput(draft)
      const saved = address
        ? await updateAddress(address.id, input)
        : await createAddress(input)
      onSaved(saved)
    } catch (cause) {
      const result = addressFailure(cause)
      if (result.kind === 'invalid') {
        setErrors(result.fields)
        focusFirstError()
      } else if (result.kind === 'unknown') {
        setFailure(
          'Não foi possível confirmar se o endereço foi salvo. Atualizamos sua lista; confira antes de tentar novamente.',
        )
        onUnknownResult()
      } else {
        setFailure(
          result.message ?? 'Tente novamente. Seus dados foram mantidos.',
        )
      }
      setSaving(false)
    }
  }

  function fieldError(field: AddressField) {
    return errors[field]
  }

  const title = editing ? 'Editar endereço' : 'Adicionar endereço'

  return (
    <Modal
      headerIcon={confirmingDiscard ? 'alert' : 'map-pin'}
      role={confirmingDiscard ? 'alertdialog' : 'dialog'}
      focusKey={confirmingDiscard ? 'discard' : 'form'}
      open
      title={confirmingDiscard ? 'Descartar as alterações?' : title}
      subtitle={
        confirmingDiscard
          ? 'Os dados preenchidos neste endereço serão perdidos.'
          : editing
            ? 'Atualize as informações do seu endereço de entrega.'
            : 'Cadastre um novo endereço para suas entregas.'
      }
      onClose={requestClose}
      closeDisabled={saving}
      busy={saving}
      size={confirmingDiscard ? 'sm' : 'lg'}
      className="mx-auto max-w-[780px]"
      footer={
        confirmingDiscard ? (
          <>
            <button
              type="button"
              className={modalSecondaryButton}
              onClick={requestClose}
              data-autofocus
            >
              Continuar editando
            </button>
            <button
              type="button"
              className={modalDangerButton}
              onClick={onClose}
            >
              <Icon name="trash" size={16} /> Descartar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={modalSecondaryButton}
              disabled={saving}
              onClick={requestClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={formId}
              className={modalPrimaryButton}
              disabled={saving}
            >
              {saving ? (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
                />
              ) : (
                <Icon name="check" size={16} />
              )}
              {saving
                ? 'Salvando...'
                : editing
                  ? 'Salvar alterações'
                  : 'Salvar endereço'}
            </button>
          </>
        )
      }
    >
      {confirmingDiscard && (
        <Alert variant="warning">Alterações não salvas</Alert>
      )}
      <div hidden={confirmingDiscard} className="space-y-4 text-text-primary">
        <div className="flex items-start gap-3 rounded-surface border border-info-200 bg-surface-input px-4 py-3 text-sm text-state-info">
          <Icon name="info" size={20} className="mt-0.5" />
          <p>
            Preencha os dados de entrega.{' '}
            <span className="font-semibold">* Campos obrigatórios.</span>
          </p>
        </div>

        <form id={formId} ref={formRef} noValidate onSubmit={submit} className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            <legend className="sr-only">{title}</legend>

            <section
              aria-labelledby="address-recipient-title"
              className={sectionStyle}
            >
              <h3 id="address-recipient-title" className={sectionTitle}>
                <Icon name="user" size={20} /> Dados do destinatário
              </h3>
              <div className="grid gap-4 sm:grid-cols-6">
                <Input
                  className="sm:col-span-6"
                  label="Nome do destinatário *"
                  placeholder="Nome completo"
                  autoComplete="name"
                  maxLength={LIMITS.recipientName}
                  aria-required
                  value={draft.recipientName}
                  error={fieldError('recipientName')}
                  onChange={(event) =>
                    change('recipientName', event.target.value)
                  }
                />
                <Input
                  className="sm:col-span-4"
                  label="Identificação (opcional)"
                  placeholder="Ex.: Casa, Trabalho"
                  maxLength={LIMITS.label}
                  value={draft.label}
                  error={fieldError('label')}
                  onChange={(event) => change('label', event.target.value)}
                />
                <Input
                  className="sm:col-span-2"
                  label="CEP *"
                  placeholder="00000-000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-required
                  value={draft.zipCode}
                  error={fieldError('zipCode')}
                  onChange={(event) =>
                    change('zipCode', maskZipCode(event.target.value))
                  }
                />
              </div>
            </section>

            <section
              aria-labelledby="address-location-title"
              className={sectionStyle}
            >
              <h3 id="address-location-title" className={sectionTitle}>
                <Icon name="map-pin" size={20} /> Localização e complemento
              </h3>
              <div className="grid gap-4 sm:grid-cols-6">
                <Input
                  className="sm:col-span-4"
                  label="Rua / Avenida *"
                  placeholder="Nome da rua"
                  autoComplete="address-line1"
                  maxLength={LIMITS.street}
                  aria-required
                  value={draft.street}
                  error={fieldError('street')}
                  onChange={(event) => change('street', event.target.value)}
                />
                <div className="space-y-2 sm:col-span-2">
                  <Input
                    label={draft.withoutNumber ? 'Número' : 'Número *'}
                    placeholder="Ex.: 120"
                    maxLength={LIMITS.number}
                    aria-required={!draft.withoutNumber}
                    disabled={draft.withoutNumber}
                    value={draft.withoutNumber ? '' : draft.number}
                    error={
                      draft.withoutNumber ? undefined : fieldError('number')
                    }
                    onChange={(event) => change('number', event.target.value)}
                  />
                  <Checkbox
                    label="Sem número"
                    checked={draft.withoutNumber}
                    onChange={(event) =>
                      change('withoutNumber', event.target.checked)
                    }
                  />
                </div>
                <Input
                  className="sm:col-span-6"
                  label="Complemento (opcional)"
                  placeholder="Apartamento, bloco, sala"
                  autoComplete="address-line2"
                  maxLength={LIMITS.complement}
                  value={draft.complement}
                  error={fieldError('complement')}
                  onChange={(event) => change('complement', event.target.value)}
                />
                <Input
                  className="sm:col-span-2"
                  label="Bairro *"
                  placeholder="Bairro"
                  maxLength={LIMITS.district}
                  aria-required
                  value={draft.district}
                  error={fieldError('district')}
                  onChange={(event) => change('district', event.target.value)}
                />
                <Input
                  className="sm:col-span-2"
                  label="Cidade *"
                  placeholder="Cidade"
                  autoComplete="address-level2"
                  maxLength={LIMITS.city}
                  aria-required
                  value={draft.city}
                  error={fieldError('city')}
                  onChange={(event) => change('city', event.target.value)}
                />
                <Select
                  className="sm:col-span-2"
                  label="UF *"
                  placeholder="UF"
                  options={STATE_OPTIONS}
                  value={draft.state}
                  error={fieldError('state')}
                  disabled={saving}
                  onValueChange={(value) => change('state', value)}
                />
              </div>
            </section>

            <section
              aria-labelledby="address-preferences-title"
              className={sectionStyle}
            >
              <h3 id="address-preferences-title" className={sectionTitle}>
                <Icon name="check-circle" size={20} /> Preferências de entrega
              </h3>
              <div className="rounded-surface border border-border-default bg-surface-input px-4 py-3">
                <Checkbox
                  label="Definir como endereço principal"
                  checked={draft.primary || firstAddress}
                  disabled={firstAddress}
                  onChange={(event) => change('primary', event.target.checked)}
                />
                {firstAddress && (
                  <p className="mt-2 text-xs text-text-primary">
                    Seu primeiro endereço será o principal.
                  </p>
                )}
              </div>
            </section>
          </fieldset>

          {failure && (
            <Alert
              variant="error"
              title="Não foi possível salvar o endereço."
              className="mt-4"
            >
              {failure}
            </Alert>
          )}
        </form>
      </div>
    </Modal>
  )
}
