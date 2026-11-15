import { useState } from 'react'
import axios from 'axios'
import { CollectionOwnershipModalBase } from './CollectionOwnershipModalBase'
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
      } else setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsRemoving(false)
    }
  }

  const summary = [
    {
      key: 'quantity',
      icon: 'layers',
      label: 'Quantidade',
      value: String(item.quantity),
    },
    {
      key: 'condition',
      icon: 'shield-check',
      label: 'Condição',
      value: conditionLabels[item.condition],
    },
    {
      key: 'language',
      icon: 'grid',
      label: 'Idioma',
      value: languageLabels[item.language],
    },
  ] as const

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
      successMessage={removed ? 'A carta foi removida da sua coleção.' : null}
      onClose={handleClose}
      onSubmit={() => void handleRemove()}
    >
      <dl className="grid gap-2 sm:grid-cols-3">
        {summary.map((field) => (
          <div
            key={field.key}
            className="flex min-w-0 items-center gap-2 rounded-xl border border-[#D4CFE9] bg-[linear-gradient(160deg,#F9F8FE,#ECEAF8)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            <Icon name={field.icon} size={24} className="text-[#6512BA]" />
            <div className="min-w-0">
              <dt className="text-[11px] font-medium text-[#40365B]">
                {field.label}
              </dt>
              <dd className="break-words text-xs font-bold text-[#1C1436]">
                {field.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      {!removed && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#F5CFD4] bg-[#FFF3F4] px-3 py-2.5 text-xs leading-relaxed text-[#9D1425]">
          <Icon name="info" size={20} />
          <span>
            Todos os {item.quantity}{' '}
            {item.quantity === 1 ? 'exemplar' : 'exemplares'} com esta condição
            e idioma serão removidos. Esta ação não pode ser desfeita. Se houver
            anúncio ativo vinculado, a remoção será bloqueada.
          </span>
        </div>
      )}
    </CollectionOwnershipModalBase>
  )
}
