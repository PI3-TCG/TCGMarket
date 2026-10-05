type AlertTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

const tones: Record<AlertTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function Alert({
  tone,
  message,
  onClose,
}: {
  tone: AlertTone
  message: string
  onClose?: () => void
}) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <p className="flex-1 leading-relaxed">{message}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-current opacity-70 transition hover:opacity-100"
          aria-label="Fechar aviso"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
