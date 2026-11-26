import { useEffect, useRef, useState } from 'react'
import { addToMyCollection, listMyCollections } from '@/services/collection'
import { mutationResultUnknown } from '@/services/feedback'
import {
  readActiveCollectionId,
  writeActiveCollectionId,
} from '@/services/activeCollection'
import { useSession } from '@/session'
import type { CardCollection, CardCondition, CardLanguage } from '@/types/Collection'

export function useCollectionAddition() {
  const { user } = useSession()
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState<CardCondition>('NEAR_MINT')
  const [language, setLanguage] = useState<CardLanguage>('PORTUGUESE')
  const [collections, setCollections] = useState<CardCollection[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string>()
  const submitting = useRef(false)

  useEffect(() => {
    if (!user) return
    let active = true
    listMyCollections()
      .then((next) => {
        if (!active) return
        setCollections(next)
        const stored = readActiveCollectionId(user.id)
        const selected = next.find((collection) => collection.id === stored) ?? next[0]
        setCollectionId(selected?.id ?? '')
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar suas coleções.')
      })
    return () => {
      active = false
    }
  }, [user])

  async function submit(cardId: string, onSuccess: () => void) {
    if (submitting.current) return

    const parsedQuantity = Number(quantity)
    setError(null)
    if (!collectionId) {
      setError('Crie uma coleção em Minha coleção antes de adicionar cartas.')
      return
    }
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
        collectionId,
        cardId,
        quantity: parsedQuantity,
        condition,
        language,
      })
      if (user) writeActiveCollectionId(user.id, collectionId)
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
    collections,
    collectionId,
    onCollectionChange: setCollectionId,
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
