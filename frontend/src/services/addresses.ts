import axios from 'axios'
import { api } from '@/services/api'
import type { Address, AddressField, AddressInput } from '@/types/Address'

export type AddressFieldErrors = Partial<Record<AddressField, string>>

export type AddressFailure =
  | { kind: 'invalid'; fields: AddressFieldErrors }
  | { kind: 'rejected'; message: string | null }
  | { kind: 'unknown' }

type ApiError = {
  message?: string
  fields?: { field: string; message: string }[]
}

export function addressFailure(cause: unknown): AddressFailure {
  if (!axios.isAxiosError<ApiError>(cause) || !cause.response) {
    return { kind: 'unknown' }
  }

  const { status, data } = cause.response
  const fields = data?.fields ?? []

  if (status === 400 && fields.length > 0) {
    return {
      kind: 'invalid',
      fields: Object.fromEntries(
        fields.map((field) => [field.field, field.message]),
      ) as AddressFieldErrors,
    }
  }

  return {
    kind: 'rejected',
    message: status < 500 && status !== 400 ? (data?.message ?? null) : null,
  }
}

const ADDRESSES_URL = '/api/users/me/addresses'

export async function listAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>(ADDRESSES_URL)
  return response.data
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const response = await api.post<Address>(ADDRESSES_URL, input)
  return response.data
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<Address> {
  const response = await api.put<Address>(
    `${ADDRESSES_URL}/${encodeURIComponent(id)}`,
    input,
  )
  return response.data
}
