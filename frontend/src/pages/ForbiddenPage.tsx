import { Link } from '@tanstack/react-router'

export function ForbiddenPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-5xl font-bold text-primary-300">403</p>
      <h1 className="font-display text-3xl font-bold text-primary-900">
        Acesso negado
      </h1>
      <p className="max-w-md text-sm text-neutral-700">
        Sua conta não tem permissão para acessar esta área.
      </p>
      <Link to="/" className="text-sm font-semibold text-secondary-500">
        Voltar ao início
      </Link>
    </main>
  )
}
