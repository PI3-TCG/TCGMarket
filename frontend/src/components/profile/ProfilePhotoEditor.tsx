import { useId, useState } from 'react'
import { Avatar } from './ProfileView'
import { useProfileSettings } from './profileSettings'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

export function ProfilePhotoEditor({
  name,
  showRemove = false,
}: {
  name: string
  showRemove?: boolean
}) {
  const { state, saving, save } = useProfileSettings()
  const id = useId()
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const image = state.status === 'ready' ? state.data.avatarUrl : null
  const disabled = reading || saving || state.status !== 'ready'
  async function upload(file?: File) {
    if (!file) return
    setError(null)
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError('Escolha uma imagem JPEG, PNG ou WebP de até 2 MB.')
      return
    }
    setReading(true)
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const success = await save({ avatarUrl: data })
      if (!success) setError('Não foi possível salvar a foto. Tente novamente.')
    } catch {
      setError('Não foi possível ler a foto. Tente novamente.')
    } finally {
      setReading(false)
    }
  }
  return (
    <div className="flex shrink-0 flex-col items-center gap-3">
      <div className="relative">
        <Avatar name={name} image={image} />
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="peer sr-only"
          onChange={(event) => {
            void upload(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <label
          htmlFor={id}
          aria-label="Alterar foto do perfil"
          title="Alterar foto do perfil"
          className={`absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full border border-[#FCD203]/70 bg-primary-900 text-white shadow-md peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary-500 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-primary-800'}`}
        >
          <Icon name="camera" size={20} />
          <span className="sr-only">Alterar foto do perfil</span>
        </label>
      </div>
      {showRemove && image && (
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => void save({ avatarUrl: null })}
        >
          Remover foto
        </Button>
      )}
      {saving && (
        <p
          role="status"
          className="rounded bg-white px-2 py-1 text-xs text-primary-900"
        >
          Salvando...
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="max-w-48 rounded bg-white p-2 text-xs text-error-700"
        >
          {error}
        </p>
      )}
    </div>
  )
}
