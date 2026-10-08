import { type ReactNode } from 'react'
import { CATALOGS, MOBILE_TABS } from './catalogs'
import { cn } from './cn'
import { Icon } from './Icon'
import { Input } from './Input'
import { Logo } from './Logo'
import { focusRing } from './styles'

type NavigationProps = {
  activeId?: string
  preview?: 'hover'
  compact?: boolean
  search?: ReactNode
  onNavigate?: (id: string) => void
  onSearch?: () => void
  className?: string
}

export function Navigation({
  activeId,
  preview,
  compact = false,
  search,
  onNavigate,
  onSearch,
  className,
}: NavigationProps) {
  const current = preview === 'hover' ? (activeId ?? 'pokemon') : activeId

  return (
    <nav
      aria-label="Principal"
      className={cn(
        'rounded-surface border border-neutral-200 bg-white p-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Logo size="sm" />
        {search ?? (
          <button
            type="button"
            aria-label="Buscar"
            onClick={onSearch}
            className={cn(
              'grid size-10 cursor-pointer place-items-center rounded-control border text-neutral-700',
              focusRing,
              preview === 'hover'
                ? 'border-primary-900 text-primary-900'
                : 'border-transparent hover:border-primary-900 hover:text-primary-900',
            )}
          >
            <Icon name="search" size={20} />
          </button>
        )}
      </div>
      <div
        className={cn(
          'mt-3 flex flex-wrap items-center',
          compact ? 'gap-x-2 gap-y-1' : 'gap-4',
        )}
      >
        {CATALOGS.map((item) => {
          const active = item.id === current
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate?.(item.id)}
              className={cn(
                'cursor-pointer rounded-sm px-0.5 py-1',
                compact ? 'text-[11px]' : 'text-sm',
                focusRing,
                active
                  ? 'font-semibold text-primary-900 underline decoration-primary-900 decoration-2 underline-offset-4'
                  : 'text-neutral-700 hover:text-primary-900',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

type NavigationMobileProps = {
  activeId?: string
  onNavigate?: (id: string) => void
  className?: string
}

export function NavigationMobile({
  activeId = 'inicio',
  onNavigate,
  className,
}: NavigationMobileProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-surface border border-neutral-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <button
          type="button"
          aria-label="Abrir menu"
          className={cn(
            'grid size-8 cursor-pointer place-items-center text-neutral-900',
            focusRing,
          )}
        >
          <Icon name="menu" size={20} />
        </button>
        <Logo size="sm" />
        <button
          type="button"
          aria-label="Perfil"
          onClick={() => onNavigate?.('perfil')}
          className={cn(
            'grid size-8 cursor-pointer place-items-center text-neutral-900',
            focusRing,
          )}
        >
          <Icon name="user" size={20} />
        </button>
      </div>
      <div className="px-3">
        <Input variant="search" placeholder="Buscar carta, jogador, loja..." />
      </div>
      <div className="flex items-center justify-between px-3 py-3 text-neutral-500">
        {CATALOGS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            onClick={() => onNavigate?.(item.id)}
            className={cn(
              'grid size-9 cursor-pointer place-items-center rounded-control hover:bg-primary-100 hover:text-primary-900',
              focusRing,
            )}
          >
            <Icon name={item.icon} size={20} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 border-t border-neutral-200">
        {MOBILE_TABS.map((tab) => {
          const active = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate?.(tab.id)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 px-1 py-2 text-[10px]',
                focusRing,
                active
                  ? 'font-semibold text-primary-900'
                  : 'text-neutral-500 hover:text-primary-900',
              )}
            >
              <Icon name={tab.icon} size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
