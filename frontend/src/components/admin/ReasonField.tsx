import { REASON_MAX, REASON_MIN } from '@/components/admin/adminUserFormat'
import { useId } from 'react'

type ReasonFieldProps = {
  value: string
  error: string | null
  placeholder?: string
  onChange: (value: string) => void
}

export function ReasonField({
  value,
  error,
  placeholder,
  onChange,
}: ReasonFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="space-y-1 pt-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-neutral-900"
      >
        Motivo <span className="text-error-700">*</span>
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={REASON_MAX}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hintId}
        placeholder={placeholder}
        className="w-full rounded-control border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 hover:border-primary-900 focus:border-primary-900 focus:ring-2 focus:ring-secondary-500 aria-invalid:border-error-700"
      />
      <div id={hintId} className="flex justify-between gap-3 text-xs">
        <span className={error ? 'text-error-700' : 'text-neutral-500'}>
          {error ?? `Entre ${REASON_MIN} e ${REASON_MAX} caracteres.`}
        </span>
        <span className="text-neutral-500">
          {value.trim().length}/{REASON_MAX}
        </span>
      </div>
    </div>
  )
}
