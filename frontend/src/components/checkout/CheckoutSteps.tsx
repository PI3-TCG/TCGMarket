import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/components/ui/cn'
import { focusRing } from '@/components/ui/styles'

const steps = [
  { label: 'Carrinho', to: '/carrinho' },
  { label: 'Entrega', to: '/carrinho/entrega' },
  { label: 'Revisão', to: '/carrinho/revisao' },
  { label: 'Resultado', to: null },
] as const

const stepStyles = {
  active: 'border-brand-primary bg-surface-brand-tint text-brand-deep',
  done: 'border-border-default bg-surface-default text-text-ink',
  upcoming: 'border-border-default bg-surface-input text-text-secondary',
}

const markerStyles = {
  active: 'bg-brand-primary text-white',
  done: 'bg-success-50 text-state-success',
  upcoming: 'bg-surface-subtle text-text-secondary',
}

const statusLabels = {
  active: 'Etapa atual',
  done: 'Concluída',
  upcoming: 'A seguir',
}

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <nav aria-label="Progresso da compra" className="mb-5">
      <ol className="relative isolate mx-auto grid max-w-md grid-cols-4 gap-2 before:pointer-events-none before:absolute before:inset-x-[12.5%] before:top-1/2 before:-z-10 before:h-px before:bg-accent-bronze/55 sm:gap-10">
        {steps.map(({ label, to }, index) => {
          const status = index === current ? 'active' : index < current ? 'done' : 'upcoming'
          const canReturn = status === 'done' && to && (current !== 3 || index === 0)
          const style = cn(
            'flex h-full min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-center text-xs sm:min-h-16',
            stepStyles[status],
          )
          const content = (
            <>
              <span
                aria-hidden={status === 'done' ? true : undefined}
                className={cn('grid size-6 shrink-0 place-items-center rounded-full font-bold', markerStyles[status])}
              >
                {status === 'done' ? <Icon name="check" size={16} /> : index + 1}
              </span>
              <span className="min-w-0 wrap-anywhere">
                <span className="block font-bold">{label}</span>
                <span className="sr-only">{statusLabels[status]}</span>
              </span>
            </>
          )

          return (
            <li key={label} className="min-w-0" aria-current={status === 'active' ? 'step' : undefined}>
              {canReturn ? (
                <Link to={to} className={cn(style, focusRing, 'transition-colors hover:border-brand-primary hover:bg-surface-brand-tint')}>
                  {content}
                </Link>
              ) : (
                <div className={style}>{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
