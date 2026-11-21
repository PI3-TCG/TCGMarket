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
    <div className="space-y-1.5 pt-2">
      <label htmlFor={id} className="block text-sm font-bold text-[#342044]">
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
        className="w-full rounded-lg border border-[#C9ADDA] bg-white px-3 py-2 text-sm text-[#2F1C3A] outline-none placeholder:text-[#85778A] transition-colors hover:border-[#9F64B5] focus:border-[#773C95] focus:ring-2 focus:ring-[#DCB3EC] aria-invalid:border-error-700"
      />
      <div id={hintId} className="flex justify-between gap-3 text-xs">
        <span className={error ? 'text-error-700' : 'text-[#796681]'}>
          {error ?? `Entre ${REASON_MIN} e ${REASON_MAX} caracteres.`}
        </span>
        <span className="shrink-0 text-[#796681]">
          {value.trim().length}/{REASON_MAX}
        </span>
      </div>
    </div>
  )
}
