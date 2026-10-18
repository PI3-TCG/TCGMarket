import { useState } from 'react'
import axios from 'axios'

import {
  CollectionOwnershipModalBase,
  CollectionOwnershipFields,
} from '../collection/CollectionOwnershipModalBase'
import { updateMyCollectionItem } from '@/services/collection'
import type {
  CardCondition,
  CardLanguage,
  CollectionItem,
} from '@/types/Collection'

type Props = {
  item: CollectionItem
  onClose: () => void
  onSaved: () => void
}

export function EditCollectionItemModal({ item, onClose, onSaved }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [condition, setCondition] = useState<CardCondition>(item.condition)
  const [language, setLanguage] = useState<CardLanguage>(item.language)

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasChanges =
    quantity !== String(item.quantity) ||
    condition !== item.condition ||
    language !== item.language

  function handleClose() {
    if (isSaving) return
    onClose()
    if (saved) onSaved()
  }

  async function handleSave() {
    if (isSaving || saved || !hasChanges) return

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

    try {
      await updateMyCollectionItem(item.id, {
        quantity: parsedQuantity,
        condition,
        language,
      })
      setSaved(true)
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            (err.response?.status === 409
              ? 'Já existe esta carta com a condição e o idioma selecionados. Escolha outra combinação.'
              : 'Não foi possível atualizar o item. Tente novamente.'),
        )
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <CollectionOwnershipModalBase
      mode="edit"
      card={item.card}
      title="Editar item da coleção"
      subtitle="Atualize as informações desta carta no seu acervo."
      primaryLabel="Salvar alterações"
      busyLabel="Salvando..."
      isSaving={isSaving}
      isComplete={saved}
      disablePrimary={!hasChanges}
      error={error}
      successMessage={
        saved ? 'As informações da sua carta foram atualizadas.' : null
      }
      onClose={handleClose}
      onSubmit={() => void handleSave()}
    >
      <CollectionOwnershipFields
        quantity={quantity}
        condition={condition}
        language={language}
        disabled={isSaving || saved}
        onQuantityChange={setQuantity}
        onConditionChange={setCondition}
        onLanguageChange={setLanguage}
      />
    </CollectionOwnershipModalBase>
  )
}
