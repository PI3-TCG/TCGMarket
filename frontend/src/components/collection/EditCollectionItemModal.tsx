import { useState } from 'react'
import axios from 'axios'
import {
  CollectionOwnershipFields,
  CollectionOwnershipModalBase,
} from './CollectionOwnershipModalBase'
import { Icon } from '@/components/ui/Icon'
import { updateMyCollectionItem } from '@/services/collection'
import type {
  CardCondition,
  CardLanguage,
  CollectionItem,
} from '@/types/Collection'

type Props = { item: CollectionItem; onClose: () => void; onSaved: () => void }
export function EditCollectionItemModal({ item, onClose, onSaved }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [condition, setCondition] = useState<CardCondition>(item.condition)
  const [language, setLanguage] = useState<CardLanguage>(item.language)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)
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
      setQuantityError(
        'Informe uma quantidade inteira entre 1 e 2.147.483.647.',
      )
      return
    }
    setQuantityError(null)
    setError(null)
    setIsSaving(true)
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
      } else setError('Ocorreu um erro inesperado. Tente novamente.')
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
      summaryAside={
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-[#2C234D]">
            Na sua coleção
          </span>
          <span className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#EEE7FE,#E9D9FF)] px-3 py-2 text-[#5512BA]">
            <Icon name="layers" size={20} />
            <strong className="text-xl leading-none">{item.quantity}</strong>
          </span>
        </div>
      }
    >
      <CollectionOwnershipFields
        layout="edit"
        quantity={quantity}
        condition={condition}
        language={language}
        disabled={isSaving || saved}
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
