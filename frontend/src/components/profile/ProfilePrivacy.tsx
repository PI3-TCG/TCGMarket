import { profileTextLink } from './profileStyles'
import { Link } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'

export function ProfilePrivacy({ username }: { username: string }) {
  return (
    <section className="mt-5 border-t border-border-default pt-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
        <Icon name="lock" size={24} />
        Privacidade das coleções
      </h3>
      <p className="mt-3 text-sm text-neutral-700">
        Cada coleção tem a própria visibilidade. Em Minhas coleções, marque como
        pública somente o que outras pessoas podem ver.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link to="/minha-colecao" className={`${profileTextLink} text-sm underline`}>
          Gerenciar coleções
        </Link>
        <Link
          to="/jogadores/$username"
          params={{ username }}
          hash="colecao"
          className={`${profileTextLink} text-sm underline`}
        >
          Ver perfil público
        </Link>
      </div>
    </section>
  )
}
