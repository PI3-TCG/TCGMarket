import { BrandShell } from '@/components/layout/BrandShell'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { registerUser } from '@/services/userApi'
import { useNavigate } from '@tanstack/react-router'
import type { ApiErrorResponse } from '@/types/User'
import {
  isStrongPassword,
  MAX_PASSWORD_UTF8_BYTES,
  utf8ByteLength,
} from '@/utils/password'
import axios from 'axios'
import { type FormEvent, useState } from 'react'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

type FieldName =
  'name' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(
    field: keyof typeof EMPTY_FORM,
    value: string | boolean,
  ) {
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

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms =
        'É necessário aceitar o termo de uso dos dados pessoais.'
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
    <BrandShell>
      <h1 className="font-display text-4xl leading-tight font-bold text-neutral-900">
        Crie sua conta
      </h1>
      <p className="mt-3 leading-relaxed text-neutral-700">
        Cadastre-se para anunciar, buscar e trocar cartas. A conta criada é de
        usuário comum.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          id="name"
          name="name"
          label="Nome"
          placeholder="Seu nome completo"
          autoComplete="name"
          value={form.name}
          error={errors.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
        <Input
          id="email"
          name="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
        <Input
          id="password"
          name="password"
          label="Senha"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          hint={
            errors.password
              ? undefined
              : 'Use letra maiúscula, número e caractere especial.'
          }
          onChange={(event) => updateField('password', event.target.value)}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar senha"
          type="password"
          placeholder="Repita sua senha"
          autoComplete="new-password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) =>
            updateField('confirmPassword', event.target.value)
          }
        />

        <Checkbox
          name="acceptedTerms"
          checked={form.acceptedTerms}
          error={errors.acceptedTerms}
          onChange={(event) =>
            updateField('acceptedTerms', event.target.checked)
          }
          label="Li e aceito a coleta e o uso dos meus dados pessoais para criar e operar esta conta, conforme a LGPD."
        />

        {feedback ? (
          <Alert variant={feedback.type} onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={submitting} className="min-w-40">
            {submitting ? 'Cadastrando...' : 'Criar conta'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
          >
            Voltar
          </Button>
        </div>
      </form>
    </BrandShell>
  )
}

function applyApiError(
  error: unknown,
  setErrors: (errors: Partial<Record<FieldName, string>>) => void,
  setFeedback: (feedback: {
    type: 'success' | 'error'
    message: string
  }) => void,
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
      message:
        data?.message ??
        'Não foi possível concluir o cadastro. Tente novamente.',
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
