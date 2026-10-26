import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CartContext, type CartState } from '@/cart'
import { getCart } from '@/services/cart'
import { useSession } from '@/session'
import type { Cart } from '@/types/Cart'

type Loaded = { userId: string; state: CartState }

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, sessionReady } = useSession()
  const userId = sessionReady ? (user?.id ?? null) : null
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!userId) return
    let active = true

    getCart()
      .then((cart) => {
        if (active) setLoaded({ userId, state: { status: 'ready', cart } })
      })
      .catch(() => {
        if (active) setLoaded({ userId, state: { status: 'error' } })
      })

    return () => {
      active = false
    }
  }, [userId, attempt])

  const reload = useCallback(() => {
    setLoaded(null)
    setAttempt((current) => current + 1)
  }, [])

  const apply = useCallback(
    (cart: Cart) => {
      if (userId) setLoaded({ userId, state: { status: 'ready', cart } })
    },
    [userId],
  )

  // Troca de usuário ou logout descarta o carrinho anterior sem esperar a API.
  let state: CartState = { status: 'idle' }
  if (userId) {
    state = loaded?.userId === userId ? loaded.state : { status: 'loading' }
  }

  return (
    <CartContext.Provider value={{ state, reload, apply }}>
      {children}
    </CartContext.Provider>
  )
}
