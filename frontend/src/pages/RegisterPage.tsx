import { registerUser } from '@/services/userApi'
import type { ApiErrorResponse } from '@/types/User'
import { isStrongPassword } from '@/utils/password'
import axios from 'axios'
import { type FormEvent, useState } from 'react'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms'

export function RegisterPage({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: keyof typeof EMPTY_FORM, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate() {
    const nextErrors: Partial<Record<FieldName, string>> = {}
    const name = form.name.trim()
    const email = form.email.trim()

    if (!name) {
      nextErrors.name = 'O nome é obrigatório.'
    } else if (name.length > 120) {
      nextErrors.name = 'O nome deve ter no máximo 120 caracteres.'
    }

    if (!email) {
      nextErrors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }

    if (!form.password) {
      nextErrors.password = 'A senha é obrigatória.'
    } else if (form.password.length < 6 || form.password.length > 72) {
      nextErrors.password = 'A senha deve ter entre 6 e 72 caracteres.'
    } else if (!isStrongPassword(form.password)) {
      nextErrors.password = 'A senha deve conter letra maiúscula, número e caractere especial.'
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'A confirmação precisa ser igual à senha.'
    }

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms = 'É necessário aceitar o termo de uso dos dados pessoais.'
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
      const user = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setForm(EMPTY_FORM)
      setFeedback({
        type: 'success',
        message: `Conta criada para ${user.name}. O e-mail ${user.email} foi cadastrado.`,
      })
    } catch (error) {
      applyApiError(error, setErrors, setFeedback)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-medium tracking-wide text-amber-400">TCC</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Criar conta</h1>
        <p className="mt-4 leading-relaxed text-slate-300">
          Cadastre-se para anunciar, buscar e trocar cartas. A conta criada é de usuário comum.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <Field
            id="name"
            label="Nome"
            value={form.name}
            error={errors.name}
            autoComplete="name"
            onChange={(value) => updateField('name', value)}
          />
          <Field
            id="email"
            label="E-mail"
            type="email"
            value={form.email}
            error={errors.email}
            autoComplete="email"
            onChange={(value) => updateField('email', value)}
          />
          <Field
            id="password"
            label="Senha"
            type="password"
            value={form.password}
            error={errors.password}
            autoComplete="new-password"
            onChange={(value) => updateField('password', value)}
          />
          <Field
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            autoComplete="new-password"
            onChange={(value) => updateField('confirmPassword', value)}
          />

          <div>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(event) => updateField('acceptedTerms', event.target.checked)}
                className="mt-1 size-4 rounded border-slate-600 bg-slate-950 text-amber-400"
              />
              <span>
                Li e aceito a coleta e o uso dos meus dados pessoais para criar e operar esta
                conta, conforme a LGPD.
              </span>
            </label>
            {errors.acceptedTerms ? (
              <p className="mt-2 text-sm text-rose-300">{errors.acceptedTerms}</p>
            ) : null}
          </div>

          {feedback ? (
            <p
              role="status"
              className={
                feedback.type === 'success'
                  ? 'rounded-lg bg-emerald-950 px-4 py-3 text-sm text-emerald-200'
                  : 'rounded-lg bg-rose-950 px-4 py-3 text-sm text-rose-200'
              }
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-block rounded bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-200"
            >
              Voltar
            </button>
          </div>
        </form>
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
  type = 'text',
  autoComplete,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-amber-400 placeholder:text-slate-500 focus:ring-2"
      />
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}

function applyApiError(
  error: unknown,
  setErrors: (errors: Partial<Record<FieldName, string>>) => void,
  setFeedback: (feedback: { type: 'success' | 'error'; message: string }) => void,
) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data
    if (data?.fields?.length) {
      const nextErrors: Partial<Record<FieldName, string>> = {}
      for (const fieldError of data.fields) {
        if (isFieldName(fieldError.field)) {
          nextErrors[fieldError.field] = fieldError.message
        }
      }
      setErrors(nextErrors)
    }
    setFeedback({
      type: 'error',
      message: data?.message ?? 'Não foi possível concluir o cadastro. Tente novamente.',
    })
    return
  }

  setFeedback({
    type: 'error',
    message: 'Não foi possível concluir o cadastro. Tente novamente.',
  })
}

function isFieldName(field: string): field is FieldName {
  return (
    field === 'name' ||
    field === 'email' ||
    field === 'password' ||
    field === 'confirmPassword' ||
    field === 'acceptedTerms'
  )
}
