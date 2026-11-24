import {
  CollectionOwnershipFields,
  CollectionOwnershipModalBase,
} from '@/components/collection/CollectionOwnershipModalBase'
import type { CatalogCard } from '@/types/Catalog'
import { useCollectionAddition } from './useCollectionAddition'

type Props = { card: CatalogCard; onClose: () => void; onSuccess: () => void }

export function AddToCollectionModal({ card, onClose, onSuccess }: Props) {
  const { error, isSaving, fields, submit } = useCollectionAddition()

  return (
    <CollectionOwnershipModalBase
      mode="add"
      card={card}
      title="Adicionar carta à coleção"
      subtitle="Registre esta carta no seu acervo pessoal."
      primaryLabel="Adicionar à minha coleção"
      busyLabel="Adicionando..."
      isSaving={isSaving}
      isComplete={false}
      error={error}
      successMessage={null}
      onClose={onClose}
      onSubmit={() => void submit(card.id, onSuccess)}
    >
      <CollectionOwnershipFields {...fields} />
    </CollectionOwnershipModalBase>
  )
}
