import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
  deleteMyCollection,
  listMyCollections,
  renameMyCollection,
  setMyCollectionVisibility,
} from '@/services/collection'
import { writeActiveCollectionId } from '@/services/activeCollection'
import type { ApiErrorResponse } from '@/types/User'
import type { CardCollection } from '@/types/Collection'
import axios from 'axios'
import { useEffect, useState } from 'react'

type Props = {
  userId: string
  collectionId: string
  onDeleted: () => void
}

type Dialog = 'rename' | 'delete' | null

export function CollectionManager({ userId, collectionId, onDeleted }: Props) {
  const [collection, setCollection] = useState<CardCollection | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    listMyCollections()
      .then((next) => {
        if (cancelled) return
        const found = next.find((item) => item.id === collectionId) ?? null
        setCollection(found)
        setStatus(found ? 'ready' : 'missing')
        if (found) writeActiveCollectionId(userId, found.id)
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [collectionId, userId])

  function openRename() {
    setName(collection?.name ?? '')
    setError(null)
    setDialog('rename')
  }

  async function saveName() {
    if (!collection) return
    setBusy(true)
    setError(null)
    try {
      const renamed = await renameMyCollection(collection.id, name)
      setCollection(renamed)
      setDialog(null)
    } catch (cause) {
      setError(messageOf(cause, 'Não foi possível salvar a coleção.'))
    } finally {
      setBusy(false)
    }
  }

  async function toggleVisibility() {
    if (!collection) return
    setBusy(true)
    setError(null)
    try {
      const updated = await setMyCollectionVisibility(collection.id, !collection.visible)
      setCollection(updated)
    } catch (cause) {
      setError(messageOf(cause, 'Não foi possível alterar a visibilidade.'))
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!collection) return
    setBusy(true)
    setError(null)
    try {
      await deleteMyCollection(collection.id)
      onDeleted()
    } catch (cause) {
      setError(messageOf(cause, 'Não foi possível excluir a coleção.'))
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-text-secondary">Carregando coleção...</p>
  }

  if (status === 'error') {
    return (
      <Alert variant="error" title="Não foi possível carregar a coleção">
        Atualize a página para tentar de novo.
      </Alert>
    )
  }

  if (status === 'missing' || !collection) {
    return (
      <Alert variant="error" title="Coleção não encontrada">
        Ela pode ter sido excluída.
      </Alert>
    )
  }

  return (
    <section aria-label="Coleção selecionada">
      <div className="flex flex-col gap-3 rounded-control border border-border-default bg-surface-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-title text-lg font-bold text-text-ink">{collection.name}</p>
          <p className="text-sm text-text-secondary">
            {collection.visible
              ? 'Pública no seu perfil. Outras pessoas podem ver estas cartas.'
              : 'Privada. Somente você vê estas cartas.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={openRename} disabled={busy}>
            Renomear
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => void toggleVisibility()}>
            {collection.visible ? 'Tornar privada' : 'Tornar pública'}
          </Button>
          <Button type="button" variant="danger" onClick={() => { setError(null); setDialog('delete') }} disabled={busy}>
            Excluir
          </Button>
        </div>
      </div>
      {error && !dialog ? (
        <div className="mt-3">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Modal
        open={dialog === 'rename'}
        title="Renomear coleção"
        subtitle="O nome aparece no card e no seu perfil público, se a coleção for pública."
        headerIcon="layers"
        onClose={() => setDialog(null)}
        secondaryAction={{ label: 'Cancelar', onClick: () => setDialog(null), disabled: busy }}
        primaryAction={{
          label: busy ? 'Salvando...' : 'Salvar',
          onClick: () => void saveName(),
          disabled: busy || name.trim() === '',
        }}
      >
        <Input
          label="Nome"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          error={dialog === 'rename' ? error ?? undefined : undefined}
          invalid={dialog === 'rename' && error != null}
        />
      </Modal>

      <Modal
        open={dialog === 'delete'}
        title="Excluir coleção"
        subtitle="Ao excluir a coleção, todas as cartas dela também são excluídas. O catálogo não muda."
        headerIcon="trash"
        onClose={() => setDialog(null)}
        secondaryAction={{ label: 'Cancelar', onClick: () => setDialog(null), disabled: busy }}
        primaryAction={{
          label: busy ? 'Excluindo...' : 'Excluir coleção e cartas',
          variant: 'danger',
          onClick: () => void confirmDelete(),
          disabled: busy,
        }}
      >
        <p>
          Excluir <strong>{collection.name}</strong> também apaga todas as cartas que estão nela. Essa ação não pode ser desfeita.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Se alguma carta estiver anunciada, a exclusão é recusada.
        </p>
        {error ? (
          <div className="mt-3">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}
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
