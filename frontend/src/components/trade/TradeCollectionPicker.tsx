import { useEffect, useId, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { conditionLabels, gameLabels, languageLabels } from '@/components/ads/adFormat'
import { getMyCollection } from '@/services/collection'
import type { CollectionItem, CollectionPage } from '@/types/Collection'

const GAME_OPTIONS = [
  { value: '', name: 'Todos os jogos' },
  { value: 'POKEMON', name: 'Pokémon' },
  { value: 'YUGIOH', name: 'Yu-Gi-Oh!' },
  { value: 'MAGIC_THE_GATHERING', name: 'Magic' },
]

type CollectionState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: CollectionPage }

/** Seletor próprio para TROCA: considera posse total, não reserva para anúncios. */
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
  const [settled, setSettled] = useState<({ key: string } & Exclude<CollectionState, { status: 'loading' }>) | null>(null)
  const key = `${page}|${search}|${game}|${attempt}`
  const result: CollectionState = settled?.key === key ? settled : { status: 'loading' }

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
      filters: { search, game, edition: '', rarity: '', condition: '', language: '' },
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ key: currentKey, status: 'ready', data })
      })
      .catch(() => {
        if (!controller.signal.aborted) setSettled({ key: currentKey, status: 'error' })
      })
    return () => controller.abort()
  }, [active, page, search, game, attempt])

  if (!active) return null

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="font-display text-lg font-bold text-primary-900">Minha coleção</h3>
        <p className="mt-1 text-sm">Escolha uma ou mais cartas. Cada combinação de condição e idioma é um item diferente.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div>
            <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-neutral-900">Buscar por nome</label>
            <input
              id={inputId}
              type="search"
              placeholder="Buscar carta..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-10 w-full rounded-control border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-secondary-500"
            />
          </div>
          <div>
            <label htmlFor={gameId} className="mb-1 block text-xs font-semibold text-neutral-900">TCG</label>
            <select
              id={gameId}
              value={game}
              onChange={(event) => { setGame(event.target.value); setPage(0) }}
              className="h-10 w-full rounded-control border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-secondary-500"
            >
              {GAME_OPTIONS.map(({ value, name }) => <option value={value} key={value}>{name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div aria-busy={result.status === 'loading'} aria-live="polite">
        {result.status === 'loading' ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Carregando sua coleção">
            {Array.from({ length: 4 }, (_, i) => <div key={i} aria-hidden className="h-28 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100" />)}
          </div>
        ) : result.status === 'error' ? (
          <div className="space-y-3">
            <Alert variant="error" title="Não foi possível carregar sua coleção">Verifique sua conexão e tente novamente.</Alert>
            <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>Tentar novamente</Button>
          </div>
        ) : result.data.content.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white px-5 py-8 text-center">
            <Icon name="search" size={32} className="mx-auto text-primary-900" />
            <p className="mt-3 font-semibold text-neutral-900">{search || game ? 'Nenhuma carta encontrada' : 'Sua coleção está vazia'}</p>
            <p className="mt-1 text-sm">{search || game ? 'Experimente outra busca ou limpe os filtros.' : 'Adicione cartas à coleção antes de propor uma troca.'}</p>
            {search || game ? <Button className="mt-4" variant="outline" onClick={() => { setInput(''); setSearch(''); setGame(''); setPage(0) }}>Limpar filtros</Button> : null}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.data.content.map((item) => {
                const selected = selectedIds.includes(item.id)
                return (
                  <article key={item.id} className="flex min-w-0 gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                    {item.card.imageUrl ? (
                      <img src={item.card.imageUrl} alt="" loading="lazy" className="h-24 w-16 shrink-0 rounded-control object-contain" />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-control bg-neutral-100"><Icon name="gem" size={24} /></div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 font-semibold text-neutral-900">{item.card.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-700">{gameLabels[item.card.game] ?? item.card.game} · {item.card.edition}</p>
                      <p className="mt-1 text-xs text-neutral-700">{conditionLabels[item.condition]} · {languageLabels[item.language]}</p>
                      <p className="mt-1 text-xs text-neutral-700">Na coleção: <strong>{item.quantity}</strong></p>
                      <Button className="mt-auto w-full" variant={selected ? 'outline' : 'primary'} disabled={selected || item.quantity < 1} onClick={() => onAdd(item)}>
                        {selected ? 'Selecionada' : 'Adicionar à oferta'}
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
            {result.data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={result.data.first} onClick={() => setPage((n) => Math.max(0, n - 1))}>Anterior</Button>
                <span className="text-sm">Página {result.data.number + 1} de {result.data.totalPages}</span>
                <Button variant="outline" disabled={result.data.last} onClick={() => setPage((n) => n + 1)}>Próxima</Button>
              </div>
            ) : null}
          </>
        )}
      </div>
      <Alert variant="info">Adicionar uma carta à proposta não a reserva nem a transfere. A disponibilidade para concluir a troca será verificada em outra etapa.</Alert>
    </div>
  )
}
