import cornerTL from '@/assets/design-system/canto-se.svg'
import cornerTR from '@/assets/design-system/canto-sd.svg'
import cornerBL from '@/assets/design-system/canto-ie.svg'
import cornerBR from '@/assets/design-system/canto-id.svg'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * DS-10 — Apresentação comum: moldura, sticky sem scroll interno e colapso mobile.
 * Cada domínio mantém estado, regras, API e requisições próprias.
 * Não é um drawer: não precisa de overlay ou scroll lock.
 */
export function ResponsiveFilters({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [stickyTop, setStickyTop] = useState(16)

  // A sidebar não recebe scroll próprio. Quando é mais alta que a viewport,
  // o sticky começa com um top negativo: a página rola naturalmente até
  // permitir que os botões no fim do formulário fiquem visíveis.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    function updateStickyTop() {
      if (!panel) return
      const panelHeight = panel.getBoundingClientRect().height
      const availableHeight = window.innerHeight
      const next = Math.min(16, Math.floor(availableHeight - panelHeight - 16))
      setStickyTop((current) => (current === next ? current : next))
    }

    updateStickyTop()
    const observer = new ResizeObserver(updateStickyTop)
    observer.observe(panel)
    window.addEventListener('resize', updateStickyTop)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateStickyTop)
    }
  }, [])

  function closePanel() {
    setOpen(false)
    toggleRef.current?.focus()
  }

  return (
    <div
      ref={panelRef}
      style={{ top: stickyTop }}
      className="min-w-0 self-start lg:sticky lg:z-20"
      onKeyDown={(event) => {
        if (
          event.key === 'Escape' &&
          !event.defaultPrevented &&
          open &&
          toggleRef.current?.getClientRects().length
        ) {
          // Não fecha modais, listas customizadas ou outros popovers.
          if (
            event.currentTarget.querySelector(
              '[role="combobox"][aria-expanded="true"], [aria-haspopup="listbox"][aria-expanded="true"], [aria-haspopup="menu"][aria-expanded="true"]',
            )
          ) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
          closePanel()
        }
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? closePanel() : setOpen(true))}
        className="mb-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-control border border-accent-bronze bg-surface-default px-4 py-2.5 text-sm font-semibold text-brand-deep shadow-sm transition-colors hover:bg-surface-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <FilterGlyph />
          {open ? 'Ocultar filtros' : 'Mostrar filtros'}
        </span>
        <Icon name="chevron-down" size={20} className={open ? 'rotate-180' : undefined} />
      </button>

      <div
        id={panelId}
        className={`${open ? 'block' : 'hidden lg:block'} relative isolate min-w-0 rounded-[16px] border border-accent-gold-frame bg-surface-default shadow-[0_12px_30px_rgb(49_11_67_/_0.13)]`}
      >
        {/* A segunda borda faz parte da moldura, sem bloquear inputs. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-1 z-10 rounded-[12px] border border-accent-bronze/65" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
          {[
            [cornerTL, 'top-0 left-0'],
            [cornerTR, 'top-0 right-0'],
            [cornerBL, 'bottom-0 left-0'],
            [cornerBR, 'bottom-0 right-0'],
          ].map(([src, position]) => (
            <img
              key={position}
              src={src}
              alt=""
              className={`absolute size-9 select-none ${position}`}
            />
          ))}
        </div>

        <div
          className="relative z-0 min-w-0 rounded-[inherit] p-4 sm:p-5 lg:p-4 [&_.filter-panel]:!border-0 [&_.filter-panel]:!bg-transparent [&_.filter-panel]:!p-0 [&_.filter-panel]:!shadow-none [&_.panel-ornaments]:before:!content-none [&_.panel-ornaments]:after:!content-none [&_label]:!text-text-primary [&_.filter-button]:!flex [&_.filter-button]:!min-h-11 [&_.filter-button]:!w-full [&_.filter-button]:!items-center [&_.filter-button]:!justify-center [&_.filter-button]:!rounded-control [&_.filter-button]:!border-transparent [&_.filter-button]:!bg-brand-primary [&_.filter-button]:!bg-none [&_.filter-button]:!text-white [&_.filter-button+button]:!flex [&_.filter-button+button]:!min-h-11 [&_.filter-button+button]:!w-full [&_.filter-button+button]:!items-center [&_.filter-button+button]:!justify-center [&_.filter-button+button]:!border-0 [&_.filter-button+button]:!bg-transparent [&_.filter-button+button]:!text-brand-primary [&_.filter-button+button]:!no-underline [&_.filter-button+button]:!shadow-none [&_.filter-button+button]:hover:!text-brand-primary-hover [&_.filter-button+button]:hover:!underline"
        >
          {children}
          <button
            type="button"
            onClick={closePanel}
            className="mt-4 flex min-h-11 w-full items-center justify-center rounded-control border border-border-default bg-surface-sand px-3 py-2 text-sm font-semibold text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue lg:hidden"
          >
            Fechar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterGlyph() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v8l-4-2v-6L3 4Z" />
    </svg>
  )
}

/** Título único, com Limpar tudo posicionado conforme o mockup. */
export function FilterHeading({
  id,
  onClear,
}: {
  id: string
  onClear?: () => void
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 border-b border-border-default pb-3">
      <h2 id={id} className="flex min-w-0 items-center gap-2 font-display text-base font-bold text-brand-deep">
        <FilterGlyph />
        Filtros
      </h2>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-10 shrink-0 rounded-control px-2 text-xs font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
        >
          Limpar tudo
        </button>
      )}
    </div>
  )
}

export type FilterChoice = { value: string; label: string }

/**
 * Grupo recolhível com seleções visuais quadradas, como na referência.
 * O contrato dos endpoints atuais aceita um valor por campo: selecionar outra
 * opção troca a anterior; clicar novamente na marcada limpa o campo.
 */
export function CollapsibleFilterChoices({
  title,
  options,
  value,
  onValueChange,
  defaultOpen = true,
  disabled = false,
}: {
  title: string
  options: readonly FilterChoice[]
  value: string
  onValueChange: (value: string) => void
  defaultOpen?: boolean
  disabled?: boolean
}) {
  const id = useId()
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <section aria-labelledby={`${id}-title`} className="border-b border-border-default/80 py-1 last:border-b-0">
      <h3 id={`${id}-title`}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-options`}
          onClick={() => setExpanded((current) => !current)}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-control text-left text-sm font-bold text-text-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
        >
          <span className="flex items-center gap-2">
            {title}
            {value && <span className="rounded-full bg-surface-sand px-1.5 text-[10px] font-bold text-brand-deep">1</span>}
          </span>
          <Icon name="chevron-down" size={16} className={expanded ? 'rotate-180' : ''} />
        </button>
      </h3>
      <div id={`${id}-options`} hidden={!expanded} className="pb-3">
        <div role="group" aria-label={`Opções de ${title}. Uma seleção por grupo.`} className="space-y-1">
          {options.map((option) => (
            <label key={option.value} className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-control px-1 py-1 text-xs leading-5 text-text-primary hover:bg-surface-sand/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-support-blue">
              <input
                type="checkbox"
                checked={value === option.value}
                disabled={disabled}
                onChange={() => onValueChange(value === option.value ? '' : option.value)}
                className="size-4 shrink-0 accent-brand-primary"
              />
              <span className="min-w-0 wrap-anywhere">{option.label}</span>
            </label>
          ))}
        </div>
        {options.length === 0 && (
          <p className="py-2 text-xs text-text-secondary">Nenhuma opção disponível.</p>
        )}
      </div>
    </section>
  )
}

/**
 * Seleção única com busca local, lista acessível, setas e Enter/Escape.
 * Não dispara requisições: pesquisa apenas as opções reais da página.
 */
export function SearchableFilterSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Digite para pesquisar...',
  disabled = false,
}: {
  label: string
  value: string
  options: readonly string[]
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const inputId = useId()
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const normalize = (term: string) => term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const search = normalize(query.trim())
  const available = options.filter((option) => normalize(option).includes(search))
  // A lista é restrita apenas para apresentação: o usuário pode digitar o nome completo.
  const shown = available.slice(0, 80)

  useEffect(() => {
    const list = listRef.current
    const item = activeIndex >= 0 ? list?.children.item(activeIndex) : null
    if (!(item instanceof HTMLElement) || !list) return
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop
    if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight
    }
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  function select(next: string) {
    onValueChange(next)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <label htmlFor={inputId} className={filterLabelClass}>{label}</label>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 && shown[activeIndex] ? `${listId}-item-${activeIndex}` : undefined}
          disabled={disabled}
          value={open ? query : value}
          placeholder={value || placeholder}
          onFocus={() => { setQuery(''); setActiveIndex(-1); setOpen(true) }}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); if (!event.target.value && value) onValueChange('') }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              event.preventDefault()
              event.stopPropagation()
              setOpen(false)
              setQuery('')
            } else if (event.key === 'ArrowDown' && shown.length) {
              event.preventDefault()
              setOpen(true)
              setActiveIndex((current) => Math.min(shown.length - 1, current + 1))
            } else if (event.key === 'ArrowUp' && shown.length) {
              event.preventDefault()
              setOpen(true)
              setActiveIndex((current) => current <= 0 ? shown.length - 1 : current - 1)
            } else if (event.key === 'Enter' && open) {
              event.preventDefault()
              if (shown[activeIndex >= 0 ? activeIndex : 0]) select(shown[activeIndex >= 0 ? activeIndex : 0])
            } else if (event.key === 'Tab') {
              setOpen(false)
              setQuery('')
            }
          }}
          className={`${filterFieldClass.replace('mt-2', 'mt-0')} pr-9`}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={value ? `Limpar ${label}` : `Mostrar opções de ${label}`}
          onClick={() => value ? select('') : (inputRef.current?.focus(), setOpen(true))}
          className="absolute inset-y-0 right-0 flex min-w-9 items-center justify-center text-text-secondary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-support-blue"
        >
          <Icon name={value ? 'close' : 'chevron-down'} size={16} />
        </button>
      </div>
      {open && !disabled && (
        <ul ref={listRef} id={listId} role="listbox" aria-label={`Opções de ${label}`} className="absolute inset-x-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-control border border-accent-bronze bg-surface-default p-1 shadow-lg">
          {shown.length ? shown.map((option, index) => (
            <li
              id={`${listId}-item-${index}`}
              role="option"
              aria-selected={value === option}
              key={option}
              className={`cursor-pointer rounded-control px-3 py-2 text-xs text-text-primary ${index === activeIndex ? 'bg-surface-sand font-semibold' : 'hover:bg-surface-subtle'}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(option)}
            >
              {option}
            </li>
          )) : (
            <li className="p-3 text-xs text-text-secondary">Nenhuma opção encontrada.</li>
          )}
          {available.length > shown.length && (
            <li className="px-3 py-2 text-xs text-text-secondary">Refine a busca para ver mais opções.</li>
          )}
        </ul>
      )}
    </div>
  )
}

// As classes são partilhadas pelos filtros dos quatro domínios.
export const filterLabelClass = 'block text-sm font-semibold text-text-primary'
export const filterFieldClass =
  'mt-2 min-h-11 w-full min-w-0 rounded-control border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-support-blue/40 disabled:cursor-not-allowed disabled:opacity-55'
/** Ações visuais unificadas: mesmo width, mas Limpar permanece um botão textual. */
export const filterApplyClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-transparent bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-hover active:bg-brand-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-55'
export const filterClearClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-brand-primary shadow-none transition-colors hover:text-brand-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue disabled:cursor-not-allowed disabled:opacity-55'

export type AppliedFilterChip = { key: string; label: string }

/** Chips reais aplicados, removíveis por tecla Enter/Espaço e por toque. */
export function FilterChips({
  chips,
  onRemove,
}: {
  chips: AppliedFilterChip[]
  onRemove: (key: string) => void
}) {
  if (chips.length === 0) return null

  return (
    <div className="mb-4 border-b border-border-default pb-4">
      <p className="mb-2 text-xs font-semibold text-text-secondary">
        Filtros aplicados ({chips.length})
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Filtros aplicados">
        {chips.map((chip) => (
          <li key={chip.key} className="min-w-0 max-w-full">
            <button
              type="button"
              onClick={() => onRemove(chip.key)}
              aria-label={`Remover filtro ${chip.label}`}
              className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-control border border-accent-bronze bg-surface-sand px-3 py-1.5 text-left text-xs font-semibold text-brand-deep transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue"
            >
              <span className="min-w-0 wrap-anywhere">{chip.label}</span>
              <Icon name="close" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
