import { useState } from 'react'
import axios from 'axios'

import {
  CollectionOwnershipFields,
  CollectionOwnershipModalBase,
} from '@/components/collection/CollectionOwnershipModalBase'
import { addToMyCollection } from '@/services/collection'
import type { CatalogCard } from '@/types/Catalog'
import type { CardCondition, CardLanguage } from '@/types/Collection'

type Props = {
  card: CatalogCard
  onClose: () => void
  onSuccess?: () => void
}

export function AddToCollectionModal({ card, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState<CardCondition>('NEAR_MINT')
  const [language, setLanguage] = useState<CardLanguage>('PORTUGUESE')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleAddToCollection() {
    if (isSaving || success) return

    const parsedQuantity = Number(quantity)
    if (
      !/^[1-9]\d*$/.test(quantity) ||
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity > 2147483647
    ) {
      setError('Informe uma quantidade inteira entre 1 e 2.147.483.647.')
      return
    }

    setIsSaving(true)
    setError(null)

    let didSave = false

    try {
      await addToMyCollection({
        cardId: card.id,
        quantity: parsedQuantity,
        condition,
        language,
      })

      didSave = true
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            'Não foi possível adicionar a carta. Tente novamente.',
        )
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      }
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
        onQuantityChange={setQuantity}
        onConditionChange={setCondition}
        onLanguageChange={setLanguage}
      />
    </CollectionOwnershipModalBase>
  )
}
