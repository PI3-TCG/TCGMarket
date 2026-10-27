import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import {
  addressFailure,
  createAddress,
  updateAddress,
  type AddressFieldErrors,
} from '@/services/addresses'
import type { Address, AddressField } from '@/types/Address'
import { useRef, useState, type FormEvent } from 'react'
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
  const formRef = useRef<HTMLFormElement>(null)

  function change<K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    setConfirmingDiscard(false)
    if (submitted) setErrors(validateDraft(next))
  }

  function requestClose() {
    if (saving) return
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
    if (saving) return

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
        setFailure(result.message ?? 'Tente novamente. Seus dados foram mantidos.')
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
      open
      title={title}
      onClose={requestClose}
      size="lg"
      className="mx-auto max-h-[calc(100vh-2rem)] max-w-xl overflow-y-auto"
    >
      <p className="text-sm text-neutral-700">
        Preencha os dados de entrega.{' '}
        <span className="text-neutral-500">* Campos obrigatórios</span>
      </p>

      <form ref={formRef} noValidate onSubmit={submit} className="mt-4">
        <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-6">
          <legend className="sr-only">{title}</legend>

          <Input
            className="sm:col-span-6"
            label="Nome do destinatário *"
            placeholder="Nome completo"
            autoComplete="name"
            maxLength={LIMITS.recipientName}
            aria-required
            value={draft.recipientName}
            error={fieldError('recipientName')}
            onChange={(event) => change('recipientName', event.target.value)}
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
            onChange={(event) => change('zipCode', maskZipCode(event.target.value))}
          />

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
              error={draft.withoutNumber ? undefined : fieldError('number')}
              onChange={(event) => change('number', event.target.value)}
            />
            <Checkbox
              label="Sem número"
              checked={draft.withoutNumber}
              onChange={(event) => change('withoutNumber', event.target.checked)}
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

          <div className="sm:col-span-6">
            <Checkbox
              label="Definir como endereço principal"
              checked={draft.primary || firstAddress}
              disabled={firstAddress}
              onChange={(event) => change('primary', event.target.checked)}
            />
            {firstAddress ? (
              <p className="mt-1 text-xs text-neutral-500">
                Seu primeiro endereço será o principal.
              </p>
            ) : null}
          </div>
        </fieldset>

        {failure ? (
          <Alert variant="error" title="Não foi possível salvar o endereço." className="mt-5">
            {failure}
          </Alert>
        ) : null}

        {confirmingDiscard ? (
          <div className="mt-5">
            <Alert variant="warning" title="Descartar as alterações?">
              Os dados preenchidos neste endereço serão perdidos.
            </Alert>
            <div className="mt-3 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmingDiscard(false)}
              >
                Continuar editando
              </Button>
              <Button type="button" variant="danger" onClick={onClose}>
                Descartar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-neutral-200 pt-5">
            <Button
              type="button"
              variant="outline"
              className="min-w-32"
              disabled={saving}
              onClick={requestClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-w-40"
              disabled={saving}
              icon={
                saving ? (
                  <span
                    aria-hidden
                    className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
                  />
                ) : undefined
              }
            >
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar endereço'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  )
}
