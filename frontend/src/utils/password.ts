const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/

export function isStrongPassword(password: string) {
  return password.length >= 6 && password.length <= 72 && PASSWORD_PATTERN.test(password)
}
