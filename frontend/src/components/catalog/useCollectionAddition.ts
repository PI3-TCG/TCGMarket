import { useRef, useState } from 'react'
import { addToMyCollection } from '@/services/collection'
import { mutationResultUnknown } from '@/services/feedback'
import type { CardCondition, CardLanguage } from '@/types/Collection'

export function useCollectionAddition() {
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState<CardCondition>('NEAR_MINT')
  const [language, setLanguage] = useState<CardLanguage>('PORTUGUESE')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string>()
  const submitting = useRef(false)

  async function submit(cardId: string, onSuccess: () => void) {
    if (submitting.current) return

    const parsedQuantity = Number(quantity)
    setError(null)
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

    setQuantityError(undefined)
    submitting.current = true
    setIsSaving(true)
    try {
      await addToMyCollection({
        cardId,
        quantity: parsedQuantity,
        condition,
        language,
      })
    } catch (cause) {
      setError(
        mutationResultUnknown(cause)
          ? 'Não foi possível confirmar a adição. Confira sua coleção antes de tentar novamente.'
          : 'Não foi possível adicionar a carta. Tente novamente.',
      )
      submitting.current = false
      setIsSaving(false)
      return
    }

    onSuccess()
  }

  return {
    error,
    isSaving,
    submit,
    fields: {
      quantity,
      condition,
      language,
      disabled: isSaving,
      quantityError,
      onQuantityChange(value: string) {
        setQuantity(value)
        setQuantityError(undefined)
      },
      onConditionChange: setCondition,
      onLanguageChange: setLanguage,
    },
  }
}
