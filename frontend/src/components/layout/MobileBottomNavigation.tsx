import { Icon } from '@/components/ui/Icon'
import { useSession } from '@/session'
import { useCart } from '@/cart'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { NAV_GAMES } from './navigationItems'

/** Barra inferior do Design System v2.2: Início, Explorar, Carrinho, Coleção, Perfil. */
export function MobileBottomNavigation() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { user, setLoginNotice } = useSession()
  const { state: cartState } = useCart()
  const [exploreOpen, setExploreOpen] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const cartCount =
    cartState.status === 'ready' ? cartState.cart.distinctItemCount : 0

  useEffect(() => {
    if (!exploreOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setExploreOpen(false)
        triggerRef.current?.focus()
      }
    }
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setExploreOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [exploreOpen])

  function openCart() {
    setExploreOpen(false)
    if (user) {
      void navigate({ to: '/carrinho' })
    } else {
      setLoginNotice('Entre na sua conta para ver seu carrinho.')
      void navigate({ to: '/login', search: { redirect: '/carrinho' } })
    }
  }

  function openProtected(to: '/perfil' | '/minha-colecao') {
    setExploreOpen(false)
    if (user) {
      void navigate({ to })
    } else {
      setLoginNotice('Entre na sua conta para acessar esta área.')
      void navigate({ to: '/login', search: { redirect: to } })
    }
  }

  const isCatalog =
    pathname.startsWith('/catalogo') || pathname.startsWith('/cartas/')
  const isCart = pathname.startsWith('/carrinho')
  const isCollection = pathname.startsWith('/minha-colecao')
  const isProfile =
    pathname.startsWith('/perfil') || pathname.startsWith('/meus-anuncios')

  return (
    <nav
      ref={containerRef}
      className="tcg-bottom-nav"
      aria-label="Navegação inferior"
    >
      <div className="tcg-bottom-nav-inner">
        <Link
          to="/"
          className="tcg-bottom-item"
          aria-current={pathname === '/' ? 'page' : undefined}
        >
          <Icon name="home" size={20} /> <span>Início</span>
        </Link>

        <div className="tcg-bottom-explore">
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={exploreOpen}
            aria-controls="tcg-bottom-games"
            aria-label={
              exploreOpen
                ? 'Fechar opções de jogos'
                : 'Explorar catálogos de jogos'
            }
            className="tcg-bottom-item"
            data-active={isCatalog || exploreOpen || undefined}
            onClick={() => setExploreOpen((open) => !open)}
          >
            <Icon name="search" size={20} /> <span>Explorar</span>
          </button>
          {exploreOpen && (
            <div id="tcg-bottom-games" className="tcg-bottom-popover">
              <div className="tcg-dropdown-caption">Explorar catálogos</div>
              {NAV_GAMES.map((game) => (
                <Link
                  key={game.slug}
                  to="/catalogo/$game"
                  params={{ game: game.slug }}
                  className="tcg-dropdown-link"
                  onClick={() => setExploreOpen(false)}
                >
                  <Icon name="cards" size={20} /> {game.label}
                </Link>
              ))}
              <Link
                to="/marketplace"
                search={{ sort: 'recent' }}
                className="tcg-dropdown-link"
                onClick={() => setExploreOpen(false)}
              >
                <Icon name="storefront" size={20} /> Marketplace
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={openCart}
          className="tcg-bottom-item"
          data-active={isCart || undefined}
        >
          <span className="tcg-bottom-icon-wrap">
            <Icon name="cart" size={20} />
            {cartCount > 0 && (
              <span aria-hidden="true" className="tcg-bottom-count">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          <span>Carrinho</span>
        </button>

        <button
          type="button"
          onClick={() => openProtected('/minha-colecao')}
          className="tcg-bottom-item"
          data-active={isCollection || undefined}
        >
          <Icon name="layers" size={20} /> <span>Coleção</span>
        </button>

        <button
          type="button"
          onClick={() => openProtected('/perfil')}
          className="tcg-bottom-item"
          data-active={isProfile || undefined}
        >
          <Icon name="user" size={20} /> <span>Perfil</span>
        </button>
      </div>
    </nav>
  )
}
