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
        variant="outline"
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
        <Button variant="outline" className="mt-3 min-h-11 w-full lg:hidden" onClick={close}>
          Fechar filtros
        </Button>
      </div>
    </div>
  )
}
