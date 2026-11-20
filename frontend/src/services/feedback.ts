import axios from 'axios'

export function responseStatus(cause: unknown): number | undefined {
  return axios.isAxiosError(cause) ? cause.response?.status : undefined
}

export function mutationResultUnknown(cause: unknown): boolean {
  const status = responseStatus(cause)
  return status === undefined || status === 408 || status >= 500
}

export function validationFields(cause: unknown): string[] {
  if (!axios.isAxiosError(cause)) return []
  const fields: unknown = cause.response?.data?.fields
  if (!Array.isArray(fields)) return []
  return fields.flatMap((entry) =>
    entry && typeof entry.field === 'string' ? [entry.field] : [],
  )
}
