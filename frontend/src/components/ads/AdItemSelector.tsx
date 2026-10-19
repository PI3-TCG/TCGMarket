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
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2
        id="ad-selector-title"
        className="font-display text-xl font-bold text-primary-900 sm:text-2xl"
      >
        Selecione uma carta da sua coleção
      </h2>
      <p className="mt-1 text-sm text-primary-700">
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
            className="mb-1.5 block text-xs font-semibold text-primary-900"
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
            className="h-10 w-full rounded-control border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none hover:border-primary-900 focus:border-primary-900 focus:ring-2 focus:ring-secondary-500"
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

      <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
        <Link
          to="/minha-colecao"
          className="inline-flex h-10 items-center gap-2 rounded-control border border-primary-900 px-4 text-sm font-semibold text-primary-900 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-500"
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
          className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-80 rounded-xl border border-neutral-200 bg-primary-100/50 motion-safe:animate-pulse"
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
            className="inline-flex h-10 items-center rounded-control bg-primary-900 px-4 text-sm font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-secondary-500"
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

      <p className="mb-3 text-xs font-semibold text-primary-700">
        {data.totalElements}{' '}
        {data.totalElements === 1 ? 'item na coleção' : 'itens na coleção'}
        {hasFilters ? ' com os filtros aplicados' : ''}
      </p>

      <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {data.content.map((item) => (
          <li key={item.id}>
            <SelectableItem item={item} onSelect={onSelect} />
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <nav
          aria-label="Paginação da seleção"
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          <Button
            variant="outline"
            disabled={data.first}
            onClick={() => onPageChange(data.number - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-neutral-700">
            Página {data.number + 1} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={data.last}
            onClick={() => onPageChange(data.number + 1)}
          >
            Próxima
          </Button>
        </nav>
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
    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg bg-primary-100/60">
        {hasImage ? (
          <img
            src={card.imageUrl}
            alt={`Carta ${card.name}`}
            loading="lazy"
            onError={() => setFailedImageUrl(card.imageUrl)}
            className={`h-full w-full object-contain p-1 ${available === 0 ? 'opacity-60' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-xs text-primary-700">
            <Icon name="grid" size={32} />
            Imagem indisponível
          </div>
        )}
      </div>

      <h3 className="mt-2 font-display text-sm font-bold text-neutral-900">
        {card.name}
      </h3>
      <p className="text-xs text-primary-700">
        {gameLabels[card.game] ?? card.game}
        {card.edition ? ` • ${card.edition}` : ''}
      </p>

      <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
        <li className="rounded-full bg-success-50 px-2 py-0.5 text-success-700">
          {conditionLabels[item.condition]}
        </li>
        <li className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-900">
          {languageLabels[item.language]}
        </li>
      </ul>

      <div className="mt-auto pt-2 text-center">
        {available > 0 ? (
          <p className="text-xs font-semibold text-primary-900">
            {availableCopies(available)}
          </p>
        ) : (
          <>
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700">
              <Icon name="close-circle" size={16} />
              Sem disponibilidade
            </p>
            <p className="text-[11px] text-neutral-500">
              Todos os exemplares em anúncios
            </p>
          </>
        )}

        <Button
          className="mt-2 w-full"
          disabled={available === 0}
          onClick={() => onSelect(item)}
          aria-label={`Selecionar ${card.name}, ${conditionLabels[item.condition]}, ${languageLabels[item.language]}`}
        >
          Selecionar
        </Button>
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
        className={tone === 'error' ? 'text-error-700' : 'text-primary-700'}
      />
      <h3 className="mt-3 font-display text-lg font-bold text-primary-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-700">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
