import { useId, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

export function ResponsiveFilters({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggle = useRef<HTMLButtonElement>(null)

  function close() {
    setOpen(false)
    toggle.current?.focus()
  }

  return (
    <div
      className="min-w-0"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && toggle.current?.getClientRects().length) {
          event.preventDefault()
          close()
        }
      }}
    >
      <Button
        ref={toggle}
        variant="primary"
        className="min-h-11 w-full justify-between lg:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? 'Ocultar filtros' : 'Mostrar filtros'}
        <Icon name="chevron-down" className={open ? 'rotate-180' : undefined} size={16} />
      </Button>

      <div id={panelId} className={open ? 'mt-3 lg:mt-0' : 'hidden lg:block'}>
        {children}
        <Button variant="primary" className="mt-3 min-h-11 w-full lg:hidden" onClick={close}>
          Fechar filtros
        </Button>
      </div>
    </div>
  )
}

export function FilterHeading({ id }: { id: string }) {
  return (
    <h2
      id={id}
      className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-primary-900"
    >
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 4h18l-7 8v8l-4-2v-6L3 4Z" />
      </svg>
      Filtros
    </h2>
  )
}
