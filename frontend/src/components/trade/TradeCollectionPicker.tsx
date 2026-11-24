import { Pagination as PageNavigation } from '@/components/ui/Pagination'
import { useEffect, useId, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Icon } from '@/components/ui/Icon'
import {
  modalPrimaryButton,
  modalSecondaryButton,
} from '@/components/ui/modalTheme'
import {
  conditionLabels,
  gameLabels,
  languageLabels,
} from '@/components/ads/adFormat'
import { getMyCollection } from '@/services/collection'
import type { CollectionItem, CollectionPage } from '@/types/Collection'

const GAME_OPTIONS = [
  { value: '', name: 'Todos os jogos' },
  { value: 'POKEMON', name: 'Pokémon' },
  { value: 'YUGIOH', name: 'Yu-Gi-Oh!' },
  { value: 'MAGIC_THE_GATHERING', name: 'Magic' },
]

const field =
  'h-11 w-full rounded-[12px] border border-border-default bg-surface-input px-3 text-sm text-text-primary outline-none transition focus:border-support-blue focus:ring-2 focus:ring-support-blue'
const surface =
  'rounded-[16px] border border-border-default bg-surface-input p-4 shadow-sm'

type CollectionState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: CollectionPage }

/** Seletor para TROCA: considera posse total, não reserva para anúncios. */
export function TradeCollectionPicker({
  active,
  selectedIds,
  onAdd,
}: {
  active: boolean
  selectedIds: string[]
  onAdd: (item: CollectionItem) => void
}) {
  const inputId = useId()
  const gameId = useId()
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [game, setGame] = useState('')
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<
    ({ key: string } & Exclude<CollectionState, { status: 'loading' }>) | null
  >(null)
  const key = `${page}|${search}|${game}|${attempt}`
  const result: CollectionState =
    settled?.key === key ? settled : { status: 'loading' }

  useEffect(() => {
    if (!active) return
    const timeout = window.setTimeout(() => {
      if (search !== input.trim()) {
        setSearch(input.trim())
        setPage(0)
      }
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [active, input, search])

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    const currentKey = `${page}|${search}|${game}|${attempt}`
    getMyCollection({
      page,
      size: 20,
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
        if (!controller.signal.aborted)
          setSettled({ key: currentKey, status: 'ready', data })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setSettled({ key: currentKey, status: 'error' })
      })
    return () => controller.abort()
  }, [active, page, search, game, attempt])

  if (!active) return null

  return (
    <div className="space-y-5">
      <div className={surface}>
        <h3 className="font-title text-lg font-bold text-text-primary">
          Minha coleção
        </h3>
        <p className="mt-1 text-sm text-text-primary">
          Escolha uma ou mais cartas. Cada combinação de condição e idioma é um
          item diferente.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div>
            <label
              htmlFor={inputId}
              className="mb-1 block text-xs font-semibold text-text-primary"
            >
              Buscar por nome
            </label>
            <input
              id={inputId}
              type="search"
              placeholder="Buscar carta..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor={gameId}
              className="mb-1 block text-xs font-semibold text-text-primary"
            >
              TCG
            </label>
            <select
              id={gameId}
              value={game}
              onChange={(event) => {
                setGame(event.target.value)
                setPage(0)
              }}
              className={field}
            >
              {GAME_OPTIONS.map(({ value, name }) => (
                <option value={value} key={value}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div aria-busy={result.status === 'loading'} aria-live="polite">
        {result.status === 'loading' ? (
          <div
            className="grid gap-3 sm:grid-cols-2"
            aria-label="Carregando sua coleção"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-28 animate-pulse rounded-surface border border-border-default bg-surface-input"
              />
            ))}
          </div>
        ) : result.status === 'error' ? (
          <div className="space-y-3">
            <Alert
              variant="error"
              title="Não foi possível carregar sua coleção"
            >
              Verifique sua conexão e tente novamente.
            </Alert>
            <button
              type="button"
              className={modalSecondaryButton}
              onClick={() => setAttempt((n) => n + 1)}
            >
              Tentar novamente
            </button>
          </div>
        ) : result.data.content.length === 0 ? (
          <div className={`${surface} px-5 py-8 text-center`}>
            <Icon name="search" size={32} className="mx-auto text-brand-deep" />
            <p className="mt-3 font-semibold text-text-primary">
              {search || game
                ? 'Nenhuma carta encontrada'
                : 'Sua coleção está vazia'}
            </p>
            <p className="mt-1 text-sm text-text-primary">
              {search || game
                ? 'Experimente outra busca ou limpe os filtros.'
                : 'Adicione cartas à coleção antes de propor uma troca.'}
            </p>
            {search || game ? (
              <button
                type="button"
                className={`${modalSecondaryButton} mt-4`}
                onClick={() => {
                  setInput('')
                  setSearch('')
                  setGame('')
                  setPage(0)
                }}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.data.content.map((item) => {
                const selected = selectedIds.includes(item.id)
                return (
                  <article
                    key={item.id}
                    className="flex min-w-0 gap-3 rounded-[16px] border border-border-default bg-surface-input p-3 shadow-sm"
                  >
                    {item.card.imageUrl ? (
                      <img
                        src={item.card.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-24 w-16 shrink-0 rounded-control object-contain shadow-sm"
                      />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-control bg-surface-input">
                        <Icon name="gem" size={24} />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 font-semibold text-text-primary">
                        {item.card.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-primary">
                        {gameLabels[item.card.game] ?? item.card.game} ·{' '}
                        {item.card.edition}
                      </p>
                      <p className="mt-1 text-xs text-text-primary">
                        {conditionLabels[item.condition]} ·{' '}
                        {languageLabels[item.language]}
                      </p>
                      <p className="mt-1 text-xs text-text-primary">
                        Na coleção: <strong>{item.quantity}</strong>
                      </p>
                      <button
                        type="button"
                        className={`${selected ? modalSecondaryButton : modalPrimaryButton} mt-auto w-fit max-w-full self-center`}
                        disabled={selected || item.quantity < 1}
                        onClick={() => onAdd(item)}
                      >
                        {selected ? 'Selecionada' : 'Adicionar à oferta'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
            {result.data.totalPages > 1 ? (
              <PageNavigation label="Paginação das cartas para troca" page={result.data.number + 1} totalPages={result.data.totalPages} onPageChange={(page) => setPage(page - 1)} className="mt-4" />
            ) : null}
          </>
        )}
      </div>
      <Alert variant="info">
        Adicionar uma carta à proposta não a reserva nem a transfere. A
        disponibilidade para concluir a troca será verificada em outra etapa.
      </Alert>
    </div>
  )
}
