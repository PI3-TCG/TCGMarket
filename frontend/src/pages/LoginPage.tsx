import mark from '@/assets/mark-3cartas-roxo.svg'
import hero from '@/assets/login-hero.webp'
import { Alert } from '@/components/ui/Alert'
import { login } from '@/services/authApi'
import type { ApiErrorResponse, LoginResponse } from '@/types/User'
import axios from 'axios'
import { type FormEvent, type ReactNode, useEffect, useState } from 'react'

const FUTURE_GOOGLE = 'Entrar com o Google será implementado no futuro.'
const FUTURE_PASSWORD = 'A recuperação de senha será implementada no futuro.'

export function LoginPage({
  onBack,
  onRegister,
  onSuccess,
  initialNotice = null,
}: {
  onBack: () => void
  onRegister: () => void
  onSuccess: (session: LoginResponse) => void
  initialNotice?: string | null
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(initialNotice)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!notice || notice === initialNotice) {
      return
    }
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice, initialNotice])

  function updateEmail(value: string) {
    setEmail(value)
    setErrors((current) => ({ ...current, email: undefined }))
  }

  function updatePassword(value: string) {
    setPassword(value)
    setErrors((current) => ({ ...current, password: undefined }))
  }

  function validate() {
    const nextErrors: { email?: string; password?: string } = {}
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      nextErrors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }
    if (!password) {
      nextErrors.password = 'A senha é obrigatória.'
    }
    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const session = await login({
        email: email.trim(),
        password,
      })
      onSuccess(session)
    } catch (error) {
      setFeedback(loginErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-svh bg-[#f7f4fb] text-[#24182f] lg:grid lg:grid-cols-2">
      <section className="relative lg:sticky lg:top-0 lg:h-svh">
        <img
          src={hero}
          alt="Eevee dormindo sobre uma mesa de cartas. Colecione, troque e conecte no TCG Market."
          className="h-80 w-full object-cover object-[center_72%] sm:h-[28rem] lg:absolute lg:inset-0 lg:h-full"
        />
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        <Sparkles />
        {notice ? (
          <div className="absolute top-4 right-4 left-4 z-10 mx-auto max-w-md sm:left-auto">
            <Alert
              tone="info"
              message={notice}
              onClose={() => setNotice(null)}
            />
          </div>
        ) : null}

        <div className="relative w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <button type="button" onClick={onBack} className="rounded-lg">
              <img
                src={mark}
                alt="Voltar para o início"
                className="h-16 w-auto"
              />
            </button>
            <p className="font-display mt-4 text-2xl tracking-wide text-[#2a1840]">
              TCG MARKET
            </p>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Bem-vinda de volta!
            </h1>
            <p className="mt-2 text-sm text-[#6d647c]">
              Faça login para continuar sua jornada no mundo dos TCGs.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Field
              id="email"
              label="E-mail"
              type="email"
              value={email}
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email}
              icon={<MailIcon />}
              onChange={updateEmail}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setNotice(FUTURE_PASSWORD)}
                  className="text-sm font-medium text-[#660366] hover:text-[#4F024F]"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9a90ab]">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  onChange={(event) => updatePassword(event.target.value)}
                  className="w-full rounded-xl border border-[#e4dceb] bg-white py-3 pr-12 pl-11 text-sm outline-none placeholder:text-[#b3abbf] focus:border-[#660366] focus:ring-2 focus:ring-[#1688F8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#9a90ab] hover:text-[#660366]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-sm text-[#B91C1C]">{errors.password}</p>
              ) : null}
            </div>

            {feedback ? <Alert tone="error" message={feedback} /> : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#660366] text-sm font-semibold text-white transition hover:bg-[#4F024F] focus-visible:ring-2 focus-visible:ring-[#1688F8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoginIcon />
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-sm text-[#9a90ab]">
            <span className="h-px flex-1 bg-[#e4dceb]" />
            ou
            <span className="h-px flex-1 bg-[#e4dceb]" />
          </div>

          <button
            type="button"
            onClick={() => setNotice(FUTURE_GOOGLE)}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e4dceb] bg-white text-sm font-semibold text-[#24182f] transition hover:bg-[#f3eaf3] focus-visible:ring-2 focus-visible:ring-[#1688F8] focus-visible:ring-offset-2"
          >
            <GoogleIcon />
            Entrar com o Google
          </button>

          <p className="mt-8 text-center text-sm text-[#6d647c]">
            Ainda não tem uma conta?{' '}
            <button
              type="button"
              onClick={onRegister}
              className="font-semibold text-[#660366] hover:text-[#4F024F]"
            >
              Criar conta gratuita
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type,
  placeholder,
  autoComplete,
  icon,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  type: string
  placeholder: string
  autoComplete: string
  icon: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9a90ab]">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[#e4dceb] bg-white py-3 pr-4 pl-11 text-sm outline-none placeholder:text-[#b3abbf] focus:border-[#660366] focus:ring-2 focus:ring-[#1688F8]"
        />
      </div>
      {error ? <p className="mt-2 text-sm text-[#B91C1C]">{error}</p> : null}
    </div>
  )
}

function loginErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      'Não foi possível entrar. Tente novamente.'
    )
  }
  return 'Não foi possível entrar. Tente novamente.'
}

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="absolute top-16 right-10 text-3xl text-[#d8c4ef]">
        ✦
      </span>
      <span className="absolute top-40 left-8 text-xl text-[#eadff6]">✦</span>
      <span className="absolute right-16 bottom-24 text-2xl text-[#e7d8f5]">
        ✦
      </span>
      <span className="absolute bottom-10 left-16 text-lg text-[#f0e6f8]">
        ✦
      </span>
    </div>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.1 4.8" />
      <path d="M6.1 6.1C3.7 7.8 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
      <path d="M15 12H3m0 0 3-3m-3 3 3 3" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.8-1 7.7-2.8l-3.7-2.9c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.6v3c2 4 6 6.4 10.4 6.4Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.6A7.2 7.2 0 0 1 5 12c0-.9.1-1.8.4-2.6V6.4H1.6A12 12 0 0 0 0 12c0 1.9.4 3.8 1.6 5.6l3.8-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.8 1.2 15.2 0 12 0 7.6 0 3.6 2.4 1.6 6.4l3.8 3C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  )
}
