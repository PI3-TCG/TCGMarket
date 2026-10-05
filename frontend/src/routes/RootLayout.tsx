import { Link, Outlet } from '@tanstack/react-router'

export function RootLayout() {
  return <Outlet />
}

export function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold text-primary-900">
        Página não encontrada
      </h1>
      <Link to="/" className="text-sm font-semibold text-secondary-500">
        Voltar ao início
      </Link>
    </main>
  )
}
