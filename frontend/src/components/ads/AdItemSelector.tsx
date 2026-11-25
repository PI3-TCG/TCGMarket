import { cardConditionBadge, tradingCardGrid, tradingCardLanguage, tradingCardSurface } from '@/components/ui/tradingCardStyles'
import { checkoutPanel } from '@/components/checkout/checkoutStyles'
import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { getMyCollection } from '@/services/collection'
import type { CollectionItem, CollectionPage } from '@/types/Collection'
import {
  availableCopies,
  conditionLabels,
  gameLabels,
  languageLabels,
} from './adFormat'

const PAGE_SIZE = 20

const GAME_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'POKEMON', label: 'Pokémon' },
  { value: 'YUGIOH', label: 'Yu-Gi-Oh!' },
  { value: 'MAGIC_THE_GATHERING', label: 'Magic' },
]

type Result =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: CollectionPage }

type Props = {
  onSelect: (item: CollectionItem) => void
  /** Presente quando já existe uma carta no formulário. */
  onBackToForm?: () => void
}

export function AdItemSelector({ onSelect, onBackToForm }: Props) {
  const gameSelectId = useId()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [game, setGame] = useState('')
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<
    ({ key: string } & Exclude<Result, { status: 'loading' }>) | null
  >(null)
  const requestKey = `${page}|${search}|${game}|${attempt}`
  const result: Result =
    settled?.key === requestKey ? settled : { status: 'loading' }

  useEffect(() => {
    const next = searchInput.trim()
    if (next === search) return

    const timeout = window.setTimeout(() => {
      setSearch(next)
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput, search])

  useEffect(() => {
    const controller = new AbortController()
    const key = `${page}|${search}|${game}|${attempt}`

    getMyCollection({
      page,
      size: PAGE_SIZE,
      filters: {
        search,
        game,
        edition: '',
        rarity: '',
        condition: '',
        language: '',
      },
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setSettled({ key, status: 'success', data })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setSettled({ key, status: 'error' })
      })

    return () => controller.abort()
  }, [page, search, game, attempt])

  const hasFilters = search !== '' || game !== ''

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setGame('')
    setPage(0)
  }

  return (
    <section
      aria-labelledby="ad-selector-title"
      className={checkoutPanel}
    >
      <h2
        id="ad-selector-title"
        className="font-title text-xl font-bold text-brand-primary sm:text-2xl"
      >
        Selecione uma carta da sua coleção
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Escolha o item que deseja anunciar.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-end">
        <Input
          variant="search"
          aria-label="Buscar na minha coleção"
          placeholder="Buscar na minha coleção..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <div>
          <label
            htmlFor={gameSelectId}
            className="mb-1.5 block text-xs font-semibold text-brand-primary"
          >
            TCG
          </label>
          <select
            id={gameSelectId}
            value={game}
            onChange={(event) => {
              setGame(event.target.value)
              setPage(0)
            }}
            className="h-10 w-full rounded-control border border-border-default bg-surface-input px-3 text-sm text-text-primary outline-none hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-support-blue"
          >
            {GAME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4" aria-live="polite" aria-busy={result.status === 'loading'}>
        <SelectorBody
          result={result}
          hasFilters={hasFilters}
          search={search}
          onSelect={onSelect}
          onRetry={() => setAttempt((current) => current + 1)}
          onClearFilters={clearFilters}
          onPageChange={setPage}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-border-default pt-4">
        <Link
          to="/minha-colecao"
          className="inline-flex h-10 items-center gap-2 rounded-control border border-brand-primary px-4 text-sm font-semibold text-brand-primary hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-support-blue"
        >
          Voltar à coleção
        </Link>
        {onBackToForm && (
          <Button variant="ghost" onClick={onBackToForm}>
            Voltar ao formulário
          </Button>
        )}
      </div>
    </section>
  )
}

type BodyProps = {
  result: Result
  hasFilters: boolean
  search: string
  onSelect: (item: CollectionItem) => void
  onRetry: () => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
}

function SelectorBody({
  result,
  hasFilters,
  search,
  onSelect,
  onRetry,
  onClearFilters,
  onPageChange,
}: BodyProps) {
  if (result.status === 'loading') {
    return (
      <>
        <p className="sr-only">Carregando sua coleção...</p>
        <div
          aria-hidden="true"
          className={tradingCardGrid}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-80 rounded-xl border border-border-default bg-surface-subtle motion-safe:animate-pulse"
            />
          ))}
        </div>
      </>
    )
  }

  if (result.status === 'error') {
    return (
      <EmptyState
        title="Não foi possível carregar sua coleção."
        description="Tente novamente para selecionar uma carta."
        action={<Button onClick={onRetry}>Tentar novamente</Button>}
        tone="error"
      />
    )
  }

  const { data } = result

  if (data.totalElements === 0) {
    return hasFilters ? (
      <EmptyState
        title="Nenhuma carta encontrada"
        description={
          search
            ? 'Tente outro nome ou limpe a busca.'
            : 'Nenhum item da sua coleção corresponde a este filtro.'
        }
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Limpar busca
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="Sua coleção está vazia"
        description="Adicione cartas à coleção para anunciar."
        action={
          <Link
            to="/catalogo/$game"
            params={{ game: 'pokemon' }}
            className="inline-flex h-10 items-center rounded-control bg-primary-900 button-vignette px-4 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-support-blue"
          >
            Explorar catálogo
          </Link>
        }
      />
    )
  }

  const nothingAvailable =
    !hasFilters &&
    data.totalPages === 1 &&
    data.content.every((item) => item.availability.availableQuantity === 0)

  return (
    <>
      {nothingAvailable && (
        <Alert variant="warning" title="Nenhum item disponível" className="mb-4">
          Todos os exemplares estão em anúncios.
        </Alert>
      )}

      <p className="mb-3 text-xs font-semibold text-text-secondary">
        {data.totalElements}{' '}
        {data.totalElements === 1 ? 'item na coleção' : 'itens na coleção'}
        {hasFilters ? ' com os filtros aplicados' : ''}
      </p>

      <ul className={tradingCardGrid}>
        {data.content.map((item) => (
          <li key={item.id}>
            <SelectableItem item={item} onSelect={onSelect} />
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <PageNavigation label="Paginação da seleção" page={data.number + 1} totalPages={data.totalPages} onPageChange={(page) => onPageChange(page - 1)} className="mt-4" />
      )}
    </>
  )
}

function SelectableItem({
  item,
  onSelect,
}: {
  item: CollectionItem
  onSelect: (item: CollectionItem) => void
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const { card } = item
  const hasImage = Boolean(card.imageUrl) && failedImageUrl !== card.imageUrl
  const available = item.availability.availableQuantity

  return (
    <article className={`${tradingCardSurface} h-full p-3`}>
      <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg bg-surface-sand/50">
        {hasImage ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            loading="lazy"
            onError={() => setFailedImageUrl(card.imageUrl)}
            className={`h-full w-full object-contain p-1 ${available === 0 ? 'opacity-60' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-xs text-text-secondary">
            <Icon name="grid" size={32} />
            Imagem indisponível
          </div>
        )}
      </div>

      <h3 className="mt-2 wrap-anywhere font-title text-sm font-bold text-text-primary">
        {card.name}
      </h3>
      <p className="wrap-anywhere text-xs text-text-secondary">
        {gameLabels[card.game] ?? card.game}
        {card.edition ? ` • ${card.edition}` : ''}
      </p>

      <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
        <li className={cardConditionBadge(item.condition)}>
          {conditionLabels[item.condition]}
        </li>
        <li className={tradingCardLanguage}>
          {languageLabels[item.language]}
        </li>
      </ul>

      <div className="mt-auto pt-2 text-center">
        {available > 0 ? (
          <p className="text-xs font-semibold text-brand-primary">
            {availableCopies(available)}
          </p>
        ) : (
          <>
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
              <Icon name="close-circle" size={16} />
              Sem disponibilidade
            </p>
            <p className="text-[11px] text-text-secondary">
              Todos os exemplares em anúncios
            </p>
          </>
        )}

        <div className="flex justify-center">
          <Button
            className="mt-2"
            disabled={available === 0}
            onClick={() => onSelect(item)}
            aria-label={`Selecionar ${card.name}, ${conditionLabels[item.condition]}, ${languageLabels[item.language]}`}
          >
            Selecionar
          </Button>
        </div>
      </div>
    </article>
  )
}

function EmptyState({
  title,
  description,
  action,
  tone = 'neutral',
}: {
  title: string
  description: string
  action: ReactNode
  tone?: 'neutral' | 'error'
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center px-4 py-12 text-center"
    >
      <Icon
        name={tone === 'error' ? 'alert' : 'search'}
        size={32}
        className={tone === 'error' ? 'text-error-700' : 'text-text-secondary'}
      />
      <h3 className="mt-3 font-title text-lg font-bold text-brand-primary">
        {title}
      </h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
