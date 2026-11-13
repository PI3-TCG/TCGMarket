import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { useProfileSettings } from './profileSettings'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Icon } from '@/components/ui/Icon'
import { useState } from 'react'

export function ProfilePrivacy({ username }: { username: string }) {
  const { state, saving, save, retry, feedback } = useProfileSettings()
  const id = useId()
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
        <Icon name="lock" size={24} />
        Privacidade da coleção
      </h2>
      {state.status === 'loading' ? (
        <p role="status" className="mt-3">
          Carregando configurações...
        </p>
      ) : state.status !== 'ready' ? (
        <div role="alert" className="mt-3 space-y-3">
          <p>Não foi possível carregar as configurações.</p>
          <Button onClick={retry}>Tentar novamente</Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {feedback && (
            <Alert variant={feedback.error ? 'error' : 'success'}>
              {feedback.text}
            </Alert>
          )}
          <fieldset disabled={saving} className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Visibilidade da coleção</legend>
            {[
              {
                value: false,
                label: 'Privada',
                description: 'Somente você pode consultar suas cartas.',
              },
              {
                value: true,
                label: 'Pública',
                description:
                  'Qualquer pessoa pode consultar suas cartas e quantidades.',
              },
            ].map((option) => (
              <label
                key={String(option.value)}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-4 text-sm has-[:checked]:border-primary-900 has-[:checked]:bg-primary-100/40"
              >
                <input
                  type="radio"
                  name={id}
                  checked={state.data.collectionPublic === option.value}
                  className="mt-1 accent-primary-900"
                  onChange={() => {
                    setCopyMessage(null)
                    void save({ collectionPublic: option.value })
                  }}
                />
                <span>
                  <strong className="block text-primary-900">
                    {option.label}
                  </strong>
                  <span className="mt-1 block text-neutral-700">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          <p role="status" className="text-sm text-neutral-500">
            {saving
              ? 'Salvando...'
              : 'Seu perfil público permanece acessível independentemente da visibilidade da coleção.'}
          </p>
          {state.data.collectionPublic && (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/jogadores/$username"
                params={{ username }}
                hash="colecao"
                className="text-sm font-semibold text-primary-900 underline"
              >
                Ver coleção pública
              </Link>
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => {
                  void navigator.clipboard
                    .writeText(
                      `${window.location.origin}/jogadores/${encodeURIComponent(username)}#colecao`,
                    )
                    .then(() => setCopyMessage('Link copiado!'))
                    .catch(() =>
                      setCopyMessage(
                        'Não foi possível copiar. Abra a coleção pública e copie o endereço.',
                      ),
                    )
                }}
              >
                Copiar link
              </Button>
              {copyMessage && (
                <p role="status" className="text-sm text-neutral-700">
                  {copyMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
