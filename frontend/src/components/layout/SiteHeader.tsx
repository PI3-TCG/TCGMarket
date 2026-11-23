import logo from '@/assets/design-system/logo-dourada.svg'
import cornerTL from '@/assets/design-system/canto-se.svg'
import cornerTR from '@/assets/design-system/canto-sd.svg'
import cornerBL from '@/assets/design-system/canto-ie.svg'
import cornerBR from '@/assets/design-system/canto-id.svg'
import { useCart } from '@/cart'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getProfileSettings } from '@/services/profileApi'
import { useSession } from '@/session'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { AccountNavigation } from './AccountNavigation'
import { NAV_GAMES } from './navigationItems'
import { TradeReviewNotifications } from './TradeReviewNotifications'

type Props = { onSoon: (feature: string) => void }
type OpenPanel = 'games' | 'account' | 'mobile' | null

function AccountPhoto({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        className="tcg-account-photo"
        onError={() => setFailed(true)}
      />
    )
  }
  return <Icon name="user" size={24} />
}

export function SiteHeader({ onSoon: _onSoon }: Props) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { user, sessionReady, setLoginNotice } = useSession()
  const { state: cartState } = useCart()
  const [query, setQuery] = useState('')
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const headerRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const gamesTriggerRef = useRef<HTMLButtonElement>(null)
  const accountTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

  const userId = user?.id ?? null
  const loadAvatar = useCallback(async () => {
    if (!userId) return null
    return (await getProfileSettings()).avatarUrl
  }, [userId])

  const { state: avatarState } = useRemoteData(
    userId ? `header-avatar:${userId}:${pathname}` : 'header-avatar:guest',
    loadAvatar,
  )
  const avatarUrl = avatarState.status === 'ready' ? avatarState.data : null
  const cartCount = cartState.status === 'ready' ? cartState.cart.distinctItemCount : 0

  // Mantém o atalho já existente no projeto; apenas a dica visual é omitida.
  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [])

  useEffect(() => {
    if (!openPanel) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      const trigger =
        openPanel === 'games' ? gamesTriggerRef.current :
        openPanel === 'account' ? accountTriggerRef.current : mobileTriggerRef.current
      setOpenPanel(null)
      trigger?.focus()
    }
    function handleOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpenPanel(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [openPanel])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    if (q) void navigate({ to: '/busca', search: { q } })
    else searchRef.current?.focus()
  }

  function openCart() {
    setOpenPanel(null)
    if (user) {
      void navigate({ to: '/carrinho' })
    } else {
      setLoginNotice('Entre na sua conta para ver seu carrinho.')
      void navigate({ to: '/login', search: { redirect: '/carrinho' } })
    }
  }

  const isCatalog = pathname.startsWith('/catalogo/') || pathname.startsWith('/cartas/')
  const isMarketplace = pathname.startsWith('/marketplace')
  const isCollection = pathname.startsWith('/minha-colecao')

  return (
    <header ref={headerRef} className="tcg-header" aria-label="Cabeçalho principal do TCG Market">
      <img src={cornerTL} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--tl" />
      <img src={cornerTR} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--tr" />
      <img src={cornerBL} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--bl" />
      <img src={cornerBR} alt="" aria-hidden="true" className="tcg-chrome-corner tcg-chrome-corner--br" />

      <div className="tcg-header-inner">
        <Link to="/" onClick={() => setOpenPanel(null)} className="tcg-logo-link" aria-label="TCG Market — página inicial">
          <img src={logo} alt="" decoding="async" className="tcg-header-logo" />
        </Link>

        <nav className="tcg-primary-nav" aria-label="Navegação principal">
          <div className="tcg-menu-anchor">
            <button
              ref={gamesTriggerRef}
              type="button"
              aria-expanded={openPanel === 'games'}
              aria-controls="tcg-games-menu"
              className="tcg-nav-link"
              data-active={isCatalog || openPanel === 'games' || undefined}
              onClick={() => setOpenPanel(openPanel === 'games' ? null : 'games')}
            >
              Explorar <Icon name="chevron-down" size={16} />
            </button>
            {openPanel === 'games' && (
              <nav id="tcg-games-menu" className="tcg-dropdown tcg-games-menu" aria-label="Catálogos por jogo">
                <div className="tcg-dropdown-caption">Catálogos de cartas</div>
                {NAV_GAMES.map((game) => (
                  <Link
                    key={game.slug}
                    to="/catalogo/$game"
                    params={{ game: game.slug }}
                    className="tcg-dropdown-link"
                    onClick={() => setOpenPanel(null)}
                  >
                    <Icon name="cards" size={20} /> {game.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <Link to="/marketplace" search={{ sort: 'recent' }} onClick={() => setOpenPanel(null)} className="tcg-nav-link" data-active={isMarketplace || undefined} aria-current={isMarketplace ? 'page' : undefined}>
            Marketplace
          </Link>
          <Link to="/minha-colecao" onClick={() => setOpenPanel(null)} className="tcg-nav-link" data-active={isCollection || undefined} aria-current={isCollection ? 'page' : undefined}>
            Minha Coleção
          </Link>
        </nav>

        <form role="search" className="tcg-search-form" onSubmit={search}>
          <label htmlFor="tcg-header-search" className="sr-only">Buscar cartas anunciadas ou usuários</label>
          <input
            id="tcg-header-search"
            ref={searchRef}
            type="search"
            autoComplete="off"
            maxLength={100}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cartas ou usuários..."
            className="tcg-search-input"
          />
          <button type="submit" aria-label="Buscar" className="tcg-search-submit">
            <Icon name="search" size={20} />
          </button>
        </form>

        <div className="tcg-header-actions">
          <button type="button" className="tcg-header-icon" title="Carrinho de compras" aria-label={cartCount ? `Carrinho: ${cartCount} anúncios` : 'Carrinho de compras'} onClick={openCart}>
            <Icon name="cart" size={24} />
            {cartCount > 0 && <span aria-hidden="true" className="tcg-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>
          {sessionReady && user && (
            <div className="tcg-notification-wrap">
              <TradeReviewNotifications key={user.id} />
            </div>
          )}

          <div className="tcg-desktop-account tcg-menu-anchor">
            {sessionReady && user ? (
              <>
                <button
                  type="button"
                  ref={accountTriggerRef}
                  className="tcg-account-trigger"
                  aria-label="Abrir menu do usuário"
                  aria-expanded={openPanel === 'account'}
                  aria-controls="tcg-desktop-account-menu"
                  onClick={() => setOpenPanel(openPanel === 'account' ? null : 'account')}
                >
                  <AccountPhoto key={avatarUrl} url={avatarUrl} />
                </button>
                {openPanel === 'account' && (
                  <div id="tcg-desktop-account-menu" className="tcg-dropdown tcg-account-panel">
                    <AccountNavigation onSelect={() => setOpenPanel(null)} />
                  </div>
                )}
              </>
            ) : sessionReady ? (
              <div className="tcg-guest-actions">
                <Link to="/cadastro" className="tcg-guest-register">Cadastrar</Link>
                <Link to="/login" className="tcg-guest-login">Entrar</Link>
              </div>
            ) : null}
          </div>

          <div className="tcg-mobile-menu-anchor tcg-menu-anchor">
            <button
              ref={mobileTriggerRef}
              type="button"
              className="tcg-header-icon tcg-mobile-menu-trigger"
              aria-label={openPanel === 'mobile' ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={openPanel === 'mobile'}
              aria-controls="tcg-mobile-menu"
              onClick={() => setOpenPanel(openPanel === 'mobile' ? null : 'mobile')}
            >
              <Icon name={openPanel === 'mobile' ? 'close' : 'menu'} size={24} />
            </button>
            {openPanel === 'mobile' && (
              <nav id="tcg-mobile-menu" aria-label="Menu mobile" className="tcg-dropdown tcg-mobile-panel">
                <div className="tcg-dropdown-caption">Navegação</div>
                <Link to="/marketplace" search={{ sort: 'recent' }} onClick={() => setOpenPanel(null)} className="tcg-dropdown-link"><Icon name="storefront" size={20} /> Marketplace</Link>
                <div className="tcg-dropdown-caption">Explorar catálogos</div>
                {NAV_GAMES.map((game) => (
                  <Link key={game.slug} to="/catalogo/$game" params={{ game: game.slug }} onClick={() => setOpenPanel(null)} className="tcg-dropdown-link"><Icon name="cards" size={20} /> {game.label}</Link>
                ))}
                <div className="tcg-dropdown-caption">Conta</div>
                <AccountNavigation onSelect={() => setOpenPanel(null)} />
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
