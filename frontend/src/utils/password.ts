const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/

export const MAX_PASSWORD_UTF8_BYTES = 72

export function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).length
}

export function isStrongPassword(password: string) {
  return PASSWORD_PATTERN.test(password)
}
