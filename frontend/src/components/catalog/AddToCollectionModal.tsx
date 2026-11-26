import {
  CollectionOwnershipFields,
  CollectionOwnershipModalBase,
} from '@/components/collection/CollectionOwnershipModalBase'
import {
  controlHeight,
  controlLabel,
  controlSurface,
  controlText,
  focusRing,
} from '@/components/ui/styles'
import type { CatalogCard } from '@/types/Catalog'
import { useId } from 'react'
import { useCollectionAddition } from './useCollectionAddition'

type Props = { card: CatalogCard; onClose: () => void; onSuccess: () => void }

export function AddToCollectionModal({ card, onClose, onSuccess }: Props) {
  const selectId = useId()
  const addition = useCollectionAddition()
  const { error, isSaving, fields, submit, collections, collectionId, onCollectionChange } =
    addition

  return (
    <CollectionOwnershipModalBase
      mode="add"
      card={card}
      title="Adicionar carta à coleção"
      subtitle="Escolha a coleção de destino e registre a carta."
      primaryLabel="Adicionar à minha coleção"
      busyLabel="Adicionando..."
      isSaving={isSaving}
      isComplete={false}
      error={error}
      successMessage={null}
      onClose={onClose}
      onSubmit={() => void submit(card.id, onSuccess)}
    >
      <div className="mb-4">
        <label htmlFor={selectId} className={controlLabel}>
          Coleção
        </label>
        <select
          id={selectId}
          className={`${controlSurface} ${controlHeight} ${controlText} ${focusRing} w-full border-border-default px-3`}
          value={collectionId}
          disabled={isSaving || collections.length === 0}
          onChange={(event) => onCollectionChange(event.target.value)}
        >
          {collections.length === 0 ? (
            <option value="">Nenhuma coleção</option>
          ) : (
            collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))
          )}
        </select>
      </div>
      <CollectionOwnershipFields {...fields} />
    </CollectionOwnershipModalBase>
  )
}
