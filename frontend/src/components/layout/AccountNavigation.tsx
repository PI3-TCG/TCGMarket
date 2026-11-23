import { Icon } from '@/components/ui/Icon'
import { hasRole, useSession } from '@/session'
import { Link } from '@tanstack/react-router'

type Props = {
  onSelect: () => void
  showIdentity?: boolean
}

/** Compartilhado entre o menu de conta do desktop e o menu mobile. */
export function AccountNavigation({ onSelect, showIdentity = true }: Props) {
  const { user, logout } = useSession()

  if (!user) {
    return (
      <div className="tcg-account-list">
        <Link to="/login" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="user" size={20} /> Entrar
        </Link>
        <Link to="/cadastro" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="plus" size={20} /> Criar conta
        </Link>
      </div>
    )
  }

  return (
    <>
      {showIdentity && (
        <div className="tcg-account-identity">
          <strong className="tcg-account-name">{user.name}</strong>
          <span className="tcg-account-email">{user.email}</span>
        </div>
      )}
      <div className="tcg-account-list">
        <Link to="/perfil" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="user" size={20} /> Meu perfil
        </Link>
        <Link
          to="/perfil/propostas"
          search={{ direction: 'RECEIVED' }}
          onClick={onSelect}
          className="tcg-dropdown-link"
        >
          <Icon name="handshake" size={20} /> Propostas
        </Link>
        <Link to="/minha-colecao" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="layers" size={20} /> Minha coleção
        </Link>
        <Link to="/meus-anuncios" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="tag" size={20} /> Meus anúncios
        </Link>
        <Link to="/perfil/historico" onClick={onSelect} className="tcg-dropdown-link">
          <Icon name="receipt" size={20} /> Histórico de transações
        </Link>
        {hasRole(user, 'ADMIN') && (
          <Link to="/admin" onClick={onSelect} className="tcg-dropdown-link">
            <Icon name="shield-check" size={20} /> Área administrativa
          </Link>
        )}
      </div>
      <div className="tcg-account-exit">
        <button
          type="button"
          className="tcg-dropdown-link tcg-dropdown-link--danger"
          onClick={() => {
            onSelect()
            logout()
          }}
        >
          <Icon name="close-circle" size={20} /> Sair
        </button>
      </div>
    </>
  )
}
