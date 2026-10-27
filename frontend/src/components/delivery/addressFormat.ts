import type { AddressFieldErrors } from '@/services/addresses'
import type { Address, AddressInput } from '@/types/Address'

export const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const LIMITS = {
  label: 30,
  recipientName: 100,
  street: 120,
  number: 10,
  complement: 60,
  district: 80,
  city: 80,
} as const

/** Valores do formulário: tudo texto, com o CEP mascarado. */
export type AddressDraft = {
  label: string
  recipientName: string
  zipCode: string
  street: string
  number: string
  withoutNumber: boolean
  complement: string
  district: string
  city: string
  state: string
  primary: boolean
}

export function emptyDraft(primary: boolean): AddressDraft {
  return {
    label: '',
    recipientName: '',
    zipCode: '',
    street: '',
    number: '',
    withoutNumber: false,
    complement: '',
    district: '',
    city: '',
    state: '',
    primary,
  }
}

export function draftFrom(address: Address): AddressDraft {
  return {
    label: address.label ?? '',
    recipientName: address.recipientName,
    zipCode: maskZipCode(address.zipCode),
    street: address.street,
    number: address.number ?? '',
    withoutNumber: address.withoutNumber,
    complement: address.complement ?? '',
    district: address.district,
    city: address.city,
    state: address.state,
    primary: address.primary,
  }
}

export function sameDraft(a: AddressDraft, b: AddressDraft) {
  return (Object.keys(a) as (keyof AddressDraft)[]).every(
    (key) => a[key] === b[key],
  )
}

export function maskZipCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export function validateDraft(draft: AddressDraft): AddressFieldErrors {
  const errors: AddressFieldErrors = {}

  if (!draft.recipientName.trim()) {
    errors.recipientName = 'Informe o nome do destinatário.'
  }
  if (draft.zipCode.replace(/\D/g, '').length !== 8) {
    errors.zipCode = 'Informe um CEP com 8 dígitos.'
  }
  if (!draft.street.trim()) errors.street = 'Informe a rua ou avenida.'
  if (!draft.withoutNumber && !draft.number.trim()) {
    errors.number = 'Informe o número ou marque "Sem número".'
  }
  if (!draft.district.trim()) errors.district = 'Informe o bairro.'
  if (!draft.city.trim()) errors.city = 'Informe a cidade.'
  if (!STATES.includes(draft.state)) errors.state = 'Informe uma UF válida.'

  return errors
}

export function toInput(draft: AddressDraft): AddressInput {
  const optional = (value: string) => value.trim() || null

  return {
    label: optional(draft.label),
    recipientName: draft.recipientName.trim(),
    zipCode: draft.zipCode.replace(/\D/g, ''),
    street: draft.street.trim(),
    number: draft.withoutNumber ? null : draft.number.trim(),
    withoutNumber: draft.withoutNumber,
    complement: optional(draft.complement),
    district: draft.district.trim(),
    city: draft.city.trim(),
    state: draft.state,
    primary: draft.primary,
  }
}

export function streetLine(address: Address) {
  const number = address.withoutNumber ? 'S/N' : address.number
  const complement = address.complement ? ` • ${address.complement}` : ''
  return `${address.street}, ${number}${complement}`
}

export function cityLine(address: Address) {
  return `${address.district} • ${address.city} / ${address.state}`
}

export function addressTitle(address: Address) {
  return address.label ?? address.recipientName
}
