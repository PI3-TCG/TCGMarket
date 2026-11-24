import { pageItems } from '@/utils/pagination'
import { Button } from './Button'
import { cn } from './cn'

type Props = {
  label: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Paginação visual v2.2; API e numeração das páginas preservadas. */
export function Pagination({
  label,
  page,
  totalPages,
  onPageChange,
  className,
}: Props) {
  if (totalPages <= 1) return null
  const current = Math.min(totalPages, Math.max(1, page))
  const control =
    'min-h-11 min-w-11 rounded-control border-border-default text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue'

  return (
    <nav
      aria-label={label}
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
    >
      <Button
        variant="outline"
        className={control}
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        Anterior
      </Button>
      {pageItems(current, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-text-secondary">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === current ? 'primary' : 'outline'}
            className={cn(control, 'px-2')}
            aria-label={`Página ${item}`}
            aria-current={item === current ? 'page' : undefined}
            onClick={() => item !== current && onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        className={control}
        disabled={current === totalPages}
        onClick={() => onPageChange(current + 1)}
      >
        Próxima
      </Button>
    </nav>
  )
}
