export type Address = {
  id: string
  label: string | null
  recipientName: string
  zipCode: string
  street: string
  number: string | null
  withoutNumber: boolean
  complement: string | null
  district: string
  city: string
  state: string
  primary: boolean
}

export type AddressInput = Omit<Address, 'id'>

export type AddressField = keyof AddressInput
