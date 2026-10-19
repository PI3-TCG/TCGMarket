import { useState } from 'react'
import axios from 'axios'

import { CollectionOwnershipModalBase } from '../collection/CollectionOwnershipModalBase'
import { Icon } from '@/components/ui/Icon'
import { removeMyCollectionItem } from '@/services/collection'
import type {
  CardCondition,
  CardLanguage,
  CollectionItem,
} from '@/types/Collection'

type Props = {
  item: CollectionItem
  onClose: () => void
  onRemoved: () => void
}

const conditionLabels: Record<CardCondition, string> = {
  NEAR_MINT: 'Near Mint (NM)',
  LIGHTLY_PLAYED: 'Lightly Played (LP)',
  MODERATELY_PLAYED: 'Moderately Played (MP)',
  HEAVILY_PLAYED: 'Heavily Played (HP)',
  DAMAGED: 'Damaged (DMG)',
}

const languageLabels: Record<CardLanguage, string> = {
  PORTUGUESE: 'Português (PT-BR)',
  ENGLISH: 'Inglês (EN)',
  JAPANESE: 'Japonês (JP)',
}

export function RemoveCollectionItemModal({ item, onClose, onRemoved }: Props) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (isRemoving) return
    onClose()
    if (removed) onRemoved()
  }

  async function handleRemove() {
    if (isRemoving || removed) return

    setIsRemoving(true)
    setError(null)

    try {
      await removeMyCollectionItem(item.id)
      setRemoved(true)
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        const status = err.response?.status
        setError(
          err.response?.data?.message ||
            (status === 404
              ? 'Este item não está mais na sua coleção. Atualize a página.'
              : status === 409
                ? 'Esta carta está em um anúncio ativo. Encerre o anúncio antes de removê-la da coleção.'
                : 'Não foi possível remover o item. Tente novamente.'),
        )
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      }
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <CollectionOwnershipModalBase
      mode="remove"
      card={item.card}
      title="Remover item da coleção"
      subtitle="Confirme a remoção desta carta do seu acervo."
      primaryLabel="Remover da coleção"
      busyLabel="Removendo..."
      isSaving={isRemoving}
      isComplete={removed}
      error={error}
      successMessage={
        removed ? 'A carta foi removida da sua coleção.' : null
      }
      onClose={handleClose}
      onSubmit={() => void handleRemove()}
    >
      <dl className="grid gap-3 rounded-lg border border-neutral-200 p-3 text-sm min-[440px]:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs font-semibold text-primary-900">Quantidade</dt>
          <dd className="mt-1 text-neutral-700">
            {item.quantity} {item.quantity === 1 ? 'exemplar' : 'exemplares'}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold text-primary-900">Condição</dt>
          <dd className="mt-1 break-words text-neutral-700">
            {conditionLabels[item.condition]}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold text-primary-900">Idioma</dt>
          <dd className="mt-1 break-words text-neutral-700">
            {languageLabels[item.language]}
          </dd>
        </div>
      </dl>

      {!removed && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-3 py-3 text-xs leading-relaxed text-error-700">
          <Icon name="info" size={16} className="mt-0.5" />
          <span>
            Todos os {item.quantity}{' '}
            {item.quantity === 1 ? 'exemplar' : 'exemplares'} com esta condição
            e idioma serão removidos da sua coleção. A carta continua disponível
            no catálogo. Esta ação não pode ser desfeita.
          </span>
        </div>
      )}
    </CollectionOwnershipModalBase>
  )
}
