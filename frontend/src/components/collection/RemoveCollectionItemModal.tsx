import { responseStatus } from '@/services/feedback'
import { useState } from 'react'
import { CollectionOwnershipModalBase } from './CollectionOwnershipModalBase'
import { Icon } from '@/components/ui/Icon'
import { modalHeadingIcon } from '@/components/ui/modalTheme'
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
      const status = responseStatus(err)
      setError(
        status === 404
          ? 'Este item não está mais na sua coleção. Atualize a página.'
          : status === 409
            ? 'A disponibilidade desta carta mudou. Atualize a coleção e confira os anúncios ativos.'
            : 'Não foi possível remover o item. Tente novamente.',
      )
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
            className="flex min-w-0 items-center gap-2 rounded-control border border-border-default bg-surface-input p-2.5"
          >
            <span className={modalHeadingIcon}>
              <Icon name={field.icon} size={20} />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-text-secondary">
                {field.label}
              </dt>
              <dd className="wrap-break-word text-xs font-semibold text-text-primary">
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
