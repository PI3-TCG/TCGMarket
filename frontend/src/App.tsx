import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/router'
import { SessionProvider } from '@/SessionProvider'

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
}
