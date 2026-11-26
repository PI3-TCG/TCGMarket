import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { tradingCardSurface } from '@/components/ui/tradingCardStyles'
import { createMyCollection, listMyCollections } from '@/services/collection'
import { writeActiveCollectionId } from '@/services/activeCollection'
import type { ApiErrorResponse } from '@/types/User'
import type { CardCollection } from '@/types/Collection'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'

export function CollectionGallery({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const [collections, setCollections] = useState<CardCollection[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function load() {
    setStatus('loading')
    listMyCollections()
      .then((next) => {
        setCollections(next)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    let cancelled = false
    listMyCollections()
      .then((next) => {
        if (cancelled) return
        setCollections(next)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const created = await createMyCollection(name)
      writeActiveCollectionId(userId, created.id)
      void navigate({
        to: '/minha-colecao/$collectionId',
        params: { collectionId: created.id },
      })
    } catch (cause) {
      setError(messageOf(cause, 'Não foi possível criar a coleção.'))
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-text-secondary">Carregando coleções...</p>
  }

  if (status === 'error') {
    return (
      <Alert variant="error" title="Não foi possível carregar as coleções">
        <Button onClick={load}>Tentar novamente</Button>
      </Alert>
    )
  }

  return (
    <section aria-label="Suas coleções" className="mt-10">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,17rem))] justify-start gap-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to="/minha-colecao/$collectionId"
            params={{ collectionId: collection.id }}
            onClick={() => writeActiveCollectionId(userId, collection.id)}
            className={`${tradingCardSurface} no-underline`}
          >
            <div className="relative aspect-[63/88] w-full bg-surface-sand">
              {collection.coverImageUrl ? (
                <img
                  src={collection.coverImageUrl}
                  alt=""
                  className="absolute inset-0 size-full object-contain p-2"
                />
              ) : (
                <div className="grid h-full place-items-center text-brand-deep">
                  <Icon name="layers" size={32} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <h2 className="font-title text-lg font-bold text-text-ink">{collection.name}</h2>
                <p className="text-sm text-text-secondary">{cardLabel(collection.cardCount)}</p>
                <span className="mt-1 block text-sm font-semibold text-brand-primary">
                  Abrir coleção
                </span>
              </div>
              <Badge
                variant={collection.visible ? 'success' : 'neutral'}
                className="shrink-0"
              >
                {collection.visible ? 'Pública' : 'Privada'}
              </Badge>
            </div>
          </Link>
        ))}

        <button
          type="button"
          onClick={() => {
            setName('')
            setError(null)
            setCreating(true)
          }}
          className={`${tradingCardSurface} min-h-56 items-center justify-center gap-3 border-dashed p-6 text-center`}
        >
          <Icon name="plus" size={32} />
          <span className="font-title text-lg font-bold text-text-ink">Nova coleção</span>
          <span className="text-sm text-text-secondary">Crie outra coleção para organizar as cartas.</span>
        </button>
      </div>

      <Modal
        open={creating}
        title="Nova coleção"
        subtitle="Depois de criar, você entra nela para adicionar cartas."
        headerIcon="layers"
        onClose={() => setCreating(false)}
        secondaryAction={{ label: 'Cancelar', onClick: () => setCreating(false), disabled: busy }}
        primaryAction={{
          label: busy ? 'Criando...' : 'Criar',
          onClick: () => void create(),
          disabled: busy || name.trim() === '',
        }}
      >
        <Input
          label="Nome"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
          invalid={error != null}
        />
      </Modal>
    </section>
  )
}

function messageOf(cause: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(cause)) {
    return cause.response?.data.message || fallback
  }
  return fallback
}

function cardLabel(count: number) {
  return count === 1 ? '1 carta' : `${count} cartas`
}
