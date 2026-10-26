import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/router'
import { CartProvider } from '@/CartProvider'
import { SessionProvider } from '@/SessionProvider'

export default function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </SessionProvider>
  )
}
