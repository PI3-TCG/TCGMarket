import { AuthLayout } from '@/components/layout/AuthLayout'
import { authInputClass, authLinkClass } from '@/components/layout/authStyles'
import { Button } from '@/components/ui/Button'
import hero from '@/assets/images/imagePage-login.png'
import { Alert } from '@/components/ui/Alert'
import { login as loginRequest } from '@/services/authApi'
import { useSession } from '@/session'
import { responseStatus } from '@/services/feedback'
import { Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

const FUTURE_PASSWORD = 'A recuperação de senha será implementada no futuro.'

export function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect } = useSearch({ from: '/login' })
  const { login, loginNotice, setLoginNotice, user } = useSession()
  const stickyNotice = useRef(loginNotice)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(loginNotice)
  const sending = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (loginNotice) {
      setLoginNotice(null)
    }
  }, [loginNotice, setLoginNotice])

  useEffect(() => {
    if (!user) {
      return
    }
    if (redirect) {
      router.history.replace(redirect)
    } else {
      navigate({ to: '/' })
    }
  }, [navigate, redirect, router, user])

  useEffect(() => {
    if (!notice || notice === stickyNotice.current) {
      return
    }
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function updateEmail(value: string) {
    setEmail(value)
    setErrors((current) => ({ ...current, email: undefined }))
    setFeedback(null)
  }

  function updatePassword(value: string) {
    setPassword(value)
    setErrors((current) => ({ ...current, password: undefined }))
    setFeedback(null)
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
    if (sending.current) return
    setFeedback(null)

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = nextErrors.email ? 'email' : 'password'

      document.getElementById(firstInvalidField)?.focus()
      return
    }

    sending.current = true
    setSubmitting(true)
    try {
      const session = await loginRequest({
        email: email.trim(),
        password,
      })
      login(session)
    } catch (error) {
      setFeedback(loginErrorMessage(error))
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      image={hero}
      bannerContent={<LoginBannerContent />}
      title="Bem-vinda de volta!"
      description="Faça login para continuar sua jornada no mundo dos TCGs."
    >
      {notice ? (
        <div className="mt-5">
          <Alert variant="info" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      ) : null}

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
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha{' '}
              <span className="text-error-700" aria-hidden="true">
                *
              </span>
            </label>
            <button
              type="button"
              onClick={() => setNotice(FUTURE_PASSWORD)}
              className={`text-sm ${authLinkClass}`}
            >
              Esqueceu sua senha?
            </button>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-700">
              <LockIcon />
            </span>
            <input
              id="password"
              required
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="Sua senha"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              onChange={(event) => updatePassword(event.target.value)}
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-700 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="mt-2 text-sm text-error-700">
              {errors.password}
            </p>
          ) : null}
        </div>

        {feedback ? <Alert variant="error">{feedback}</Alert> : null}

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={submitting}
            className="w-52 max-w-full"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-700">
        Ainda não tem uma conta?{' '}
        <Link to="/cadastro" className={authLinkClass}>
          Criar conta gratuita
        </Link>
      </p>
    </AuthLayout>
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
        {label}{' '}
        <span className="text-error-700" aria-hidden="true">
          *
        </span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-700">
          {icon}
        </span>
        <input
          required
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`${authInputClass} pr-4`}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-error-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function loginErrorMessage(error: unknown) {
  const status = responseStatus(error)
  if (status === 401) return 'E-mail, nome de usuário ou senha inválidos.'
  if (status === 403) return 'O acesso a esta conta está indisponível.'
  if (status === undefined || status >= 500) {
    return 'O serviço de login está indisponível. Tente novamente em instantes.'
  }
  return 'Não foi possível entrar. Tente novamente.'
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

function LoginBannerContent() {
  return (
    <div className="text-white text-shadow-sm text-shadow-black/70">
      <p className="font-display space-y-1.5 text-2xl leading-tight font-bold xl:text-4xl">
        <span className="block">Negocie.</span>
        <span className="block">Colecione.</span>
        <span className="block">Conecte-se.</span>
      </p>
      <p className="mt-2 max-w-xs text-sm">
        Entre para organizar sua coleção e encontrar as cartas que faltam.
      </p>
    </div>
  )
}
