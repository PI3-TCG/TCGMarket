import { useState } from 'react'
import {
  CollectionOwnershipFields,
  CollectionOwnershipModalBase,
} from '@/components/collection/CollectionOwnershipModalBase'
import { addToMyCollection } from '@/services/collection'
import type { CatalogCard } from '@/types/Catalog'
import type { CardCondition, CardLanguage } from '@/types/Collection'

type Props = { card: CatalogCard; onClose: () => void; onSuccess?: () => void }
export function AddToCollectionModal({ card, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState<CardCondition>('NEAR_MINT')
  const [language, setLanguage] = useState<CardLanguage>('PORTUGUESE')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleAddToCollection() {
    if (isSaving || success) return
    const parsedQuantity = Number(quantity)
    if (
      !/^[1-9]\d*$/.test(quantity) ||
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity > 2147483647
    ) {
      setQuantityError(
        'Informe uma quantidade inteira entre 1 e 2.147.483.647.',
      )
      return
    }
    setQuantityError(null)
    setError(null)
    setIsSaving(true)
    let didSave = false
    try {
      await addToMyCollection({
        cardId: card.id,
        quantity: parsedQuantity,
        condition,
        language,
      })
      didSave = true
    } catch {
      setError('Não foi possível adicionar a carta. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
    if (didSave) {
      setSuccess(true)
      onSuccess?.()
    }
  }

  return (
    <CollectionOwnershipModalBase
      mode="add"
      card={card}
      title="Adicionar carta à coleção"
      subtitle="Registre esta carta no seu acervo pessoal."
      primaryLabel="Adicionar à minha coleção"
      busyLabel="Adicionando..."
      isSaving={isSaving}
      isComplete={success}
      error={error}
      successMessage={
        success ? 'A carta foi adicionada à sua coleção com sucesso.' : null
      }
      onClose={onClose}
      onSubmit={() => void handleAddToCollection()}
    >
      <CollectionOwnershipFields
        quantity={quantity}
        condition={condition}
        language={language}
        disabled={isSaving || success}
        quantityError={quantityError ?? undefined}
        onQuantityChange={(value) => {
          setQuantity(value)
          setQuantityError(null)
        }}
        onConditionChange={setCondition}
        onLanguageChange={setLanguage}
      />
    </CollectionOwnershipModalBase>
  )
}
