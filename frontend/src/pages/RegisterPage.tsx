import { AuthLayout } from '@/components/layout/AuthLayout'
import { authInputClass, authLinkClass } from '@/components/layout/authStyles'
import { Button } from '@/components/ui/Button'
import { validationFields } from '@/services/feedback'
import hero from '@/assets/images/imagePage-cadastro.png'
import { Alert } from '@/components/ui/Alert'
import { registerUser } from '@/services/userApi'
import { useSession } from '@/session'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ApiErrorResponse } from '@/types/User'
import {
  isStrongPassword,
  MAX_PASSWORD_UTF8_BYTES,
  utf8ByteLength,
} from '@/utils/password'
import axios from 'axios'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

const FUTURE_TERMS = 'Os termos de uso serão implementados no futuro.'
const FUTURE_PRIVACY = 'A política de privacidade será implementada no futuro.'

const COUNTRIES = [
  'Brasil',
  'Argentina',
  'Bolívia',
  'Chile',
  'Colômbia',
  'Equador',
  'Paraguai',
  'Peru',
  'Uruguai',
  'Venezuela',
  'Portugal',
  'Estados Unidos',
  'Canadá',
  'México',
  'Espanha',
  'França',
  'Alemanha',
  'Itália',
  'Japão',
  'Outro',
]

const EMPTY_FORM = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  country: 'Brasil',
  acceptedTerms: false,
}

type FieldName = keyof typeof EMPTY_FORM

export function RegisterPage() {
  const navigate = useNavigate()
  const { setLoginNotice } = useSession()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const sending = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!notice) {
      return
    }
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function updateField(field: FieldName, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate() {
    const nextErrors: Partial<Record<FieldName, string>> = {}
    const name = form.name.trim()
    const username = form.username.trim()
    const email = form.email.trim()

    if (!name) {
      nextErrors.name = 'O nome é obrigatório.'
    } else if (name.length > 120) {
      nextErrors.name = 'O nome deve ter no máximo 120 caracteres.'
    }

    if (!username) {
      nextErrors.username = 'O nome de usuário é obrigatório.'
    } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(username)) {
      nextErrors.username =
        'Use de 3 a 30 caracteres: letras, números, ponto ou _.'
    }

    if (!email) {
      nextErrors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }

    if (!form.password) {
      nextErrors.password = 'A senha é obrigatória.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'A senha deve ter no mínimo 6 caracteres.'
    } else if (utf8ByteLength(form.password) > MAX_PASSWORD_UTF8_BYTES) {
      nextErrors.password = 'A senha deve ter no máximo 72 bytes em UTF-8.'
    } else if (!isStrongPassword(form.password)) {
      nextErrors.password =
        'A senha deve conter letra maiúscula, número e caractere especial.'
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'A confirmação precisa ser igual à senha.'
    }

    if (!form.birthDate) {
      nextErrors.birthDate = 'A data de nascimento é obrigatória.'
    } else if (!isAtLeast13(form.birthDate)) {
      nextErrors.birthDate =
        'Você precisa ter pelo menos 13 anos para criar uma conta.'
    }

    if (!form.country) {
      nextErrors.country = 'O país é obrigatório.'
    }

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms =
        'É necessário aceitar os termos de uso e a política de privacidade.'
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
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    sending.current = true
    setSubmitting(true)
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setLoginNotice('Conta criada. Entre para continuar sua jornada.')
      navigate({ to: '/login' })
    } catch (error) {
      applyApiError(error, setErrors, setFeedback)
    } finally {
      sending.current = false
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      image={hero}
      title="Crie sua conta"
      description="Faça parte da nossa comunidade de colecionadores e comece sua jornada no mundo dos TCGs."
      wide
    >
      {notice ? (
        <div className="mt-5">
          <Alert variant="info" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <TextField
          id="name"
          label="Nome completo"
          required
          value={form.name}
          placeholder="Seu nome completo"
          autoComplete="name"
          error={errors.name}
          icon={<UserIcon />}
          onChange={(value) => updateField('name', value)}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <TextField
            id="username"
            label="Nome de usuário"
            required
            value={form.username}
            placeholder="Ex.: alineguilhoto"
            autoComplete="username"
            error={errors.username}
            icon={<AtIcon />}
            onChange={(value) => updateField('username', value)}
          />
          <TextField
            id="email"
            label="E-mail"
            required
            type="email"
            value={form.email}
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email}
            icon={<MailIcon />}
            onChange={(value) => updateField('email', value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <PasswordField
            id="password"
            label="Senha"
            value={form.password}
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            visible={showPassword}
            error={errors.password}
            onToggle={() => setShowPassword((current) => !current)}
            onChange={(value) => updateField('password', value)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirmar senha"
            value={form.confirmPassword}
            placeholder="Repita sua senha"
            autoComplete="new-password"
            visible={showConfirmPassword}
            error={errors.confirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
            onChange={(value) => updateField('confirmPassword', value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <TextField
            id="birthDate"
            label="Data de nascimento"
            required
            type="date"
            value={form.birthDate}
            placeholder=""
            autoComplete="bday"
            error={errors.birthDate}
            icon={<CalendarIcon />}
            onChange={(value) => updateField('birthDate', value)}
          />
          <div>
            <FieldLabel htmlFor="country" required>
              País
            </FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">
                <GlobeIcon />
              </span>
              <select
                id="country"
                name="country"
                required
                aria-describedby={errors.country ? 'country-error' : undefined}
                value={form.country}
                aria-invalid={errors.country ? true : undefined}
                onChange={(event) => updateField('country', event.target.value)}
                className={`${authInputClass} appearance-none pr-10`}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            {errors.country ? (
              <FieldError id="country-error" message={errors.country} />
            ) : null}
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-info-50 px-3 py-3 text-sm text-info-700">
          <InfoIcon />
          <span>
            Você precisa ter pelo menos 13 anos para criar uma conta no TCG
            Market.
          </span>
        </p>

        <div>
          <label className="flex items-start gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              id="acceptedTerms"
              required
              aria-invalid={errors.acceptedTerms ? true : undefined}
              aria-describedby={
                errors.acceptedTerms ? 'acceptedTerms-error' : undefined
              }
              checked={form.acceptedTerms}
              onChange={(event) =>
                updateField('acceptedTerms', event.target.checked)
              }
              className="mt-0.5 size-4 shrink-0 rounded border-neutral-300 accent-primary-900 focus-visible:ring-2 focus-visible:ring-secondary-500"
            />
            <span>
              Li e concordo com os{' '}
              <TextButton onClick={() => setNotice(FUTURE_TERMS)}>
                Termos de uso
              </TextButton>{' '}
              e a{' '}
              <TextButton onClick={() => setNotice(FUTURE_PRIVACY)}>
                Política de privacidade
              </TextButton>
              .
              <RequiredMark />
            </span>
          </label>
          {errors.acceptedTerms ? (
            <FieldError
              id="acceptedTerms-error"
              message={errors.acceptedTerms}
            />
          ) : null}
        </div>

        {feedback ? (
          <Alert variant="error" onDismiss={() => setFeedback(null)}>
            {feedback}
          </Alert>
        ) : null}

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={submitting}
            className="w-52 max-w-full"
          >
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-700">
        Já tem uma conta?{' '}
        <Link to="/login" className={authLinkClass}>
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

function TextField({
  id,
  label,
  value,
  error,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  icon,
  required = false,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  type?: string
  placeholder: string
  autoComplete: string
  icon: ReactNode
  required?: boolean
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          required={required}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={authInputClass}
        />
      </div>
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  error,
  onChange,
  placeholder,
  autoComplete,
  visible,
  onToggle,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  visible: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required>
        {label}
      </FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">
          <LockIcon />
        </span>
        <input
          id={id}
          name={id}
          required
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`${authInputClass} pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-700 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
    </div>
  )
}

function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  )
}

function RequiredMark() {
  return (
    <span className="text-error-700" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-2 text-sm text-error-700">
      {message}
    </p>
  )
}

function TextButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={authLinkClass}>
      {children}
    </button>
  )
}

function isAtLeast13(value: string) {
  const birth = new Date(`${value}T00:00:00`)
  if (Number.isNaN(birth.getTime())) {
    return false
  }
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const month = today.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age >= 13 && age < 120
}

function applyApiError(
  error: unknown,
  setErrors: (errors: Partial<Record<FieldName, string>>) => void,
  setFeedback: (message: string) => void,
) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const fields = validationFields(error)
    if (fields.length) {
      const nextErrors: Partial<Record<FieldName, string>> = {}
      for (const field of fields) {
        if (isPersistedField(field)) {
          nextErrors[field] =
            field === 'email' && error.response?.status === 409
              ? 'Já existe uma conta com este e-mail.'
              : 'Revise o valor deste campo.'
        }
      }
      setErrors(nextErrors)
    }
    setFeedback(
      'Não foi possível concluir o cadastro. Revise os dados e tente novamente.',
    )
    return
  }

  setFeedback('Não foi possível concluir o cadastro. Tente novamente.')
}

function isPersistedField(
  field: string,
): field is 'name' | 'email' | 'password' {
  return field === 'name' || field === 'email' || field === 'password'
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  )
}

function UserIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.2-3 3.4-4.5 7-4.5S17.8 16 19 19" />
    </Icon>
  )
}

function AtIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M16 12v1.5a2.2 2.2 0 0 0 4.4 0V12a8.4 8.4 0 1 0-3.2 6.6" />
    </Icon>
  )
}

function MailIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  )
}

function LockIcon() {
  return (
    <Icon>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  )
}

function CalendarIcon() {
  return (
    <Icon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Icon>
  )
}

function GlobeIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.2 2.4 2.2 13.6 0 16M12 4c-2.2 2.4-2.2 13.6 0 16" />
    </Icon>
  )
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 size-5 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10 9v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <Icon>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

function EyeOffIcon() {
  return (
    <Icon>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.1 4.8" />
      <path d="M6.1 6.1C3.7 7.8 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8" />
    </Icon>
  )
}
