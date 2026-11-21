import frame from '@/assets/moldura-superior.webp'
import logo from '@/assets/marca-referencia.webp'
import { useCart } from '@/cart'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getProfileSettings } from '@/services/profileApi'
import { hasRole, useSession } from '@/session'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { TradeReviewNotifications } from './TradeReviewNotifications'

type Props = { onSoon: (feature: string) => void }
type ProfileItem = { label: string; icon: IconName; onClick: () => void }

const goldFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE18D]'
const profileRow =
  'group flex min-h-10 w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-[#FBF6FF] transition-colors hover:bg-[#A84AE5]/20 focus-visible:bg-[#A84AE5]/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFE18D]'

function AccountPhoto({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [url])
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        className="size-full rounded-full object-cover"
      />
    )
  }
  return <Icon name="user" size={24} />
}

export function SiteHeader({ onSoon }: Props) {
  const navigate = useNavigate()
  const { user, sessionReady, logout, setLoginNotice } = useSession()
  const { state: cartState } = useCart()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const focusFirstRef = useRef(false)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
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
  const firstName = user?.name.trim().split(/\s+/)[0] || 'Colecionador'
  const cartCount =
    cartState.status === 'ready' ? cartState.cart.distinctItemCount : 0
  const cartLabel =
    cartCount > 0
      ? `Carrinho de compras: ${cartCount} ${cartCount === 1 ? 'anúncio' : 'anúncios'}`
      : 'Carrinho de compras'

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    if (focusFirstRef.current) {
      focusFirstRef.current = false
      dropdownRef.current
        ?.querySelector<HTMLButtonElement>('[data-account-item]')
        ?.focus()
    }
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [menuOpen])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = query.trim()
    if (q) void navigate({ to: '/busca', search: { q } })
  }

  function openCart() {
    if (user) {
      void navigate({ to: '/carrinho' })
    } else {
      setLoginNotice('Entre na sua conta para ver seu carrinho.')
      void navigate({ to: '/login', search: { redirect: '/carrinho' } })
    }
  }

  function selectItem(action: () => void) {
    setMenuOpen(false)
    action()
  }

  function handleMenuKeyboard(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!menuOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      setMenuOpen(false)
      menuButtonRef.current?.focus()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const items = Array.from(
      dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-account-item]:not(:disabled)',
      ) ?? [],
    )
    if (items.length === 0) return
    event.preventDefault()
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? (index + 1) % items.length
            : index <= 0
              ? items.length - 1
              : index - 1
    items[next]?.focus()
  }

  const profileItems: ProfileItem[] = [
    {
      label: 'Meu perfil',
      icon: 'user',
      onClick: () => void navigate({ to: '/perfil' }),
    },
    {
      label: 'Catálogo',
      icon: 'cards',
      onClick: () =>
        void navigate({ to: '/catalogo/$game', params: { game: 'pokemon' } }),
    },
    {
      label: 'Minha coleção',
      icon: 'layers',
      onClick: () => void navigate({ to: '/minha-colecao' }),
    },
    {
      label: 'Marketplace',
      icon: 'storefront',
      onClick: () =>
        void navigate({ to: '/marketplace', search: { sort: 'recent' } }),
    },
    {
      label: 'Propostas',
      icon: 'handshake',
      onClick: () =>
        void navigate({
          to: '/perfil/propostas',
          search: { direction: 'RECEIVED' },
        }),
    },
    {
      label: 'Meus anúncios',
      icon: 'tag',
      onClick: () => void navigate({ to: '/meus-anuncios' }),
    },
    {
      label: 'Histórico de transações',
      icon: 'receipt',
      onClick: () => void navigate({ to: '/perfil/historico' }),
    },
  ]

  return (
    <header
      className="tcg-header"
      aria-label="Cabeçalho principal do TCG Market"
    >
      <img
        src={frame}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="tcg-frame-art"
      />
      <div className="tcg-header-inner">
        <div className="tcg-header-row">
          <button
            type="button"
            onClick={() => void navigate({ to: '/' })}
            aria-label="TCG Market — voltar ao início"
            className={`relative z-10 min-w-0 justify-self-start rounded-sm transition hover:drop-shadow-[0_0_7px_rgba(255,206,100,0.5)] ${goldFocus}`}
          >
            <img src={logo} alt="" decoding="async" className="tcg-brand" />
          </button>

          <form onSubmit={search} role="search" className="tcg-search">
            <div className="tcg-search-field flex h-10 items-center gap-2 rounded-full border border-[#FAE6FF]/90 bg-[linear-gradient(180deg,#FAF2FF_0%,#DCC4F0_75%,#CBA8E5_100%)] px-3 text-[#4B176F] shadow-[0_4px_16px_rgba(21,4,39,0.43),inset_0_2px_0_rgba(255,255,255,0.85),inset_0_-2px_7px_rgba(89,24,117,0.2)] transition focus-within:border-[#FFE29D] focus-within:ring-2 focus-within:ring-[#FBAEF6] sm:h-11">
              <label htmlFor="navbar-search" className="sr-only">
                Buscar cartas anunciadas e usuários
              </label>
              <button
                type="submit"
                aria-label="Buscar"
                className="grid min-h-8 min-w-8 shrink-0 place-items-center rounded-full focus-visible:outline-2"
              >
                <Icon name="search" size={20} />
              </button>
              <input
                id="navbar-search"
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={100}
                type="search"
                autoComplete="off"
                placeholder="Buscar cartas anunciadas e usuários…"
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#321343] outline-none placeholder:text-[#725B84] sm:text-sm"
              />
              <kbd
                aria-hidden="true"
                className="hidden shrink-0 rounded-md border border-[#C8A3DF] bg-[#EDDEF8] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B3370] sm:block"
              >
                Ctrl K
              </kbd>
            </div>
          </form>

          <div className="tcg-actions">
            <button
              type="button"
              onClick={openCart}
              title="Carrinho de compras"
              aria-label={cartLabel}
              className={`relative grid size-9 place-items-center rounded-lg text-white transition hover:bg-[#CB61E4]/20 hover:text-[#FFE396] sm:size-10 ${goldFocus}`}
            >
              <Icon name="cart" size={24} />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full border border-[#5A266D] bg-[#F6C640] px-1 text-[10px] font-extrabold text-[#2B093F] shadow-[0_2px_7px_rgba(0,0,0,0.3)]"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {sessionReady && user ? (
              <span className="[&>button]:!grid [&>button]:!size-10 [&>button]:place-items-center [&>button]:text-white [&>button:hover]:!bg-[#CB61E4]/20 [&>button:focus-visible]:!outline-[#FFE18D]">
                <TradeReviewNotifications key={user.id} />
              </span>
            ) : null}

            {sessionReady && user ? (
              <div
                ref={dropdownRef}
                onKeyDown={handleMenuKeyboard}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setMenuOpen(false)
                }}
                className="relative"
              >
                <button
                  ref={menuButtonRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-controls="tcg-account-dropdown"
                  aria-label={
                    menuOpen ? 'Fechar menu da conta' : 'Abrir menu da conta'
                  }
                  onClick={() => {
                    focusFirstRef.current = false
                    setMenuOpen((value) => !value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      focusFirstRef.current = true
                      setMenuOpen(true)
                    }
                  }}
                  className={`grid size-10 place-items-center overflow-hidden rounded-full border-[2px] border-[#FFDB72] bg-[radial-gradient(circle_at_35%_25%,#6A2690,#320B4B_80%)] text-white shadow-[inset_0_1px_0_rgba(255,245,207,0.35),0_0_0_1px_rgba(252,160,244,0.4),0_0_12px_rgba(234,83,229,0.22)] transition hover:border-[#FFF1AE] hover:shadow-[0_0_14px_rgba(241,163,73,0.35)] ${goldFocus}`}
                >
                  <AccountPhoto url={avatarUrl} />
                </button>

                {menuOpen && (
                  <div
                    id="tcg-account-dropdown"
                    style={{
                      clipPath:
                        'polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0 calc(100% - 13px), 0 13px)',
                    }}
                    aria-label="Opções da conta"
                    className="absolute right-0 top-[calc(100%+14px)] z-[100] w-[min(305px,calc(100vw-20px))] p-[2px] shadow-[0_22px_50px_rgba(25,5,41,0.54),0_0_18px_rgba(199,45,223,0.2)] bg-[linear-gradient(135deg,#FFE79C_0%,#C97C1E_18%,#FFE39A_48%,#EC4DF2_72%,#FFE69C_100%)]"
                  >
                    <div
                      className="overflow-hidden bg-[radial-gradient(ellipse_at_25%_0%,rgba(159,52,201,0.5)_0%,transparent_62%),linear-gradient(145deg,#551271_0%,#340A50_68%,#240633_100%)]"
                      style={{
                        clipPath:
                          'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)',
                      }}
                    >
                      <div className="flex items-center gap-3 border-b border-[#EAC375]/30 bg-[linear-gradient(110deg,rgba(255,255,255,0.12),rgba(255,255,255,0))] px-4 py-4">
                        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#F3C958] bg-[#2A093D] text-[#FFE49A]">
                          <AccountPhoto url={avatarUrl} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            Olá, {firstName}
                          </p>
                          <p className="truncate text-xs text-[#DFBCEB]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="py-1.5">
                        {profileItems.map((item) => (
                          <button
                            type="button"
                            key={item.label}
                            data-account-item
                            className={profileRow}
                            onClick={() => selectItem(item.onClick)}
                          >
                            <Icon
                              name={item.icon}
                              size={20}
                              className="text-[#F4C958] transition group-hover:text-[#FFE9AD]"
                            />
                            {item.label}
                          </button>
                        ))}
                        {hasRole(user, 'ADMIN') && (
                          <button
                            type="button"
                            data-account-item
                            className={profileRow}
                            onClick={() =>
                              selectItem(() => void navigate({ to: '/admin' }))
                            }
                          >
                            <Icon
                              name="shield-check"
                              size={20}
                              className="text-[#F4C958]"
                            />{' '}
                            Área administrativa
                          </button>
                        )}
                      </div>
                      <div className="border-t border-[#EAC375]/30 py-1.5">
                        <button
                          type="button"
                          data-account-item
                          className={profileRow}
                          onClick={() =>
                            selectItem(() => onSoon('As configurações'))
                          }
                        >
                          <Icon
                            name="settings"
                            size={20}
                            className="text-[#F4C958]"
                          />{' '}
                          Configurações
                        </button>
                        <button
                          type="button"
                          data-account-item
                          className={`${profileRow} text-[#FFAECA] hover:bg-[#EC4C88]/15`}
                          onClick={() => selectItem(logout)}
                        >
                          <Icon
                            name="close-circle"
                            size={20}
                            className="text-[#FF93B5]"
                          />{' '}
                          Sair
                        </button>
                      </div>
                      <div
                        aria-hidden="true"
                        className="h-0.5 bg-[linear-gradient(90deg,transparent,#FF5EF6_22%,#FFE397_50%,#FF5EF6_78%,transparent)] shadow-[0_0_9px_#F04DF2]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void navigate({ to: '/cadastro' })}
                  disabled={!sessionReady}
                  className={`hidden text-xs font-bold text-white hover:text-[#FFE396] disabled:opacity-50 lg:inline ${goldFocus}`}
                >
                  Criar conta
                </button>
                <button
                  type="button"
                  onClick={() => void navigate({ to: '/login' })}
                  disabled={!sessionReady}
                  className={`min-h-9 rounded-full border border-[#F4C958] px-3 text-xs font-bold text-[#FFE8AC] transition hover:bg-[#FFDB86]/10 disabled:opacity-50 ${goldFocus}`}
                >
                  {sessionReady ? 'Entrar' : '...'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
