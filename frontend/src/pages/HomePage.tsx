import { BrandShell } from '@/components/layout/BrandShell'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { healthCheck } from '@/services/api'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function HomePage() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL
  const [testing, setTesting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function testApi() {
    setTesting(true)
    setFeedback(null)
    try {
      const healthStatus = await healthCheck()
      setFeedback({
        type: 'success',
        message: `API respondeu: ${healthStatus.status}. ${healthStatus.message}`,
      })
    } catch (error) {
      console.error('Erro ao verificar a saúde da API:', error)
      setFeedback({
        type: 'error',
        message:
          'Não foi possível falar com a API. Confira se o servidor está no ar.',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <BrandShell>
      <p className="text-sm font-semibold tracking-wide text-primary-700">
        Ambiente de desenvolvimento
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight font-bold text-neutral-900">
        O front está pronto
      </h1>
      <p className="mt-4 leading-relaxed text-neutral-700">
        React, TypeScript, Vite e Tailwind estão no ar. Esta tela confirma a
        base do TCG Market antes das páginas do marketplace.
      </p>

      <div className="mt-8">
        <Input
          label="API"
          value={apiUrl || 'VITE_API_URL não definida'}
          readOnly
        />
      </div>

      {feedback ? (
        <Alert
          className="mt-4"
          variant={feedback.type}
          onDismiss={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => navigate({ to: '/cadastro' })}>
          Criar conta
        </Button>
        <Button variant="outline" disabled={testing} onClick={testApi}>
          {testing ? 'Testando...' : 'Testar API'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/design-system' })}
        >
          Ver componentes
        </Button>
      </div>
    </BrandShell>
  )
}
