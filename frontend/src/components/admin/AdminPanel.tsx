import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

/** Somente para telas administrativas. Não altera Card, Button ou estilos globais. */
const FRAME_CUT =
  'polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0 calc(100% - 13px), 0 13px)'

export function AdminPanel({
  title,
  icon,
  description,
  action,
  children,
  className = '',
}: {
  title: string
  icon: IconName
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    // Sem clipPath no elemento que contém os filtros: evita cortar os dropdowns Select.
    <section className={`relative isolate min-w-0 shadow-[0_6px_18px_rgba(67,19,89,0.10)] ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#663080_0%,#B688C9_48%,#693280_100%)]"
        style={{ clipPath: FRAME_CUT }}
      />
      <div className="relative m-px min-w-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(132deg,#FFFDFF_15%,#F8F1FF_100%)]"
          style={{ clipPath: FRAME_CUT }}
        />
        <div className="relative z-0 min-w-0">
          <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-b border-[#D8B9E6] bg-[linear-gradient(90deg,#F8EFFD_0%,#F7ECFE_65%,#F6EAFE_100%)] px-4 py-2.5 sm:px-5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2.5 font-display text-[14px] font-extrabold uppercase tracking-[0.015em] text-[#2E123D] sm:text-[16px]">
                <Icon name={icon} size={24} className="text-[#55217D]" />
                {title}
              </h2>
              {description ? (
                <p className="mt-1 pl-[34px] text-xs leading-relaxed text-[#665477]">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="min-w-0">{action}</div> : null}
          </div>
          <div className="min-w-0">{children}</div>
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[17px] w-6 bg-[linear-gradient(130deg,#FFF2B4_0%,#F6BD28_45%,#A66A02_65%,#FFE891_100%)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        />
      </div>
    </section>
  )
}

/** Estados iguais para usuários e catálogo; cada bloco mantém seu próprio retry. */
export function AdminState({
  status,
  message,
  onRetry,
}: {
  status: 'loading' | 'error' | 'empty'
  message: string
  onRetry?: () => void
}) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label={message} className="space-y-3 px-5 py-7">
        <span className="sr-only">{message}</span>
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            aria-hidden="true"
            className="h-12 animate-pulse rounded-md border border-[#F0E7F3] bg-[#F7F0FA]"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      role={status === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-3 px-5 py-9 text-center text-sm text-[#6A5974]"
    >
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-[#E5D3EA] bg-white text-[#76518C]">
        <Icon name={status === 'error' ? 'alert' : 'info'} size={24} />
      </span>
      <p className="max-w-lg leading-relaxed">{message}</p>
      {status === 'error' && onRetry ? (
        <Button variant="outline" onClick={onRetry} className="!border-[#8E4CA6] !text-[#632381] hover:!bg-[#F5EAF9]">
          Tentar novamente
        </Button>
      ) : null}
    </div>
  )
}

/** Compartilhado somente pelos controles administrativos desta refatoração. */
export const adminFilterClearClass =
  'inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-bold text-[#5F2382] underline underline-offset-2 transition hover:bg-[#F1E3F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D4DA4]'

export const adminButtonClass =
  'focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#A46AC3]'

export const adminTableHeaderClass =
  'border-b border-[#CBA3DB] bg-[#F6EAFD] text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#37174C]'

export const adminTableRowClass =
  'border-b border-[#E8D9F0] even:bg-[#F9F3FD] transition-colors hover:bg-[#F3E5FB]'
