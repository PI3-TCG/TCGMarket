import hero from '@/assets/homepage-hero.webp'
import mark from '@/assets/mark-3cartas-branco.svg'
import { Alert } from '@/components/ui/Alert'
import type { UserResponse } from '@/types/User'
import { type FormEvent, type ReactNode, useEffect, useState } from 'react'

const GAMES = [
  { name: 'Pokémon', from: '#f59e0b', to: '#b45309', mark: 'poke' },
  { name: 'Magic', from: '#1e3a5f', to: '#0f172a', mark: 'magic' },
  { name: 'Yu-Gi-Oh!', from: '#7c2d12', to: '#3b0764', mark: 'yugioh' },
  { name: 'One Piece', from: '#be123c', to: '#7f1d1d', mark: 'piece' },
  { name: 'Digimon', from: '#0369a1', to: '#164e63', mark: 'digimon' },
] as const

const FEATURED = [
  {
    name: 'Charizard ex',
    meta: '151 • Pokémon',
    tag: 'Ultra Rara',
    price: 'R$ 380,00',
    from: '#f97316',
    to: '#9a3412',
  },
  {
    name: 'Black Lotus',
    meta: 'Limited Edition • Magic',
    tag: 'Mítica',
    price: 'R$ 12.500,00',
    from: '#4c1d95',
    to: '#1e1b4b',
  },
  {
    name: 'Dark Magician',
    meta: 'Legend of Blue Eyes • Yu-Gi-Oh!',
    tag: 'Ultra Rara',
    price: 'R$ 420,00',
    from: '#6d28d9',
    to: '#312e81',
  },
  {
    name: 'Monkey D. Luffy (OP-05)',
    meta: 'Awakening • One Piece',
    tag: 'Super Rara',
    price: 'R$ 350,00',
    from: '#e11d48',
    to: '#881337',
  },
]

const RECENT = [
  {
    name: 'Rayquaza VMAX',
    meta: 'Evolving Skies • Pokémon',
    price: 'R$ 290,00',
  },
  { name: 'Sol Ring', meta: 'Commander • Magic', price: 'R$ 120,00' },
  {
    name: 'Blue-Eyes White Dragon',
    meta: 'LOB • Yu-Gi-Oh!',
    price: 'R$ 450,00',
  },
  { name: 'Trafalgar Law (OP-04)', meta: 'One Piece', price: 'R$ 280,00' },
  { name: 'Omnimon', meta: 'BT1 • Digimon', price: 'R$ 320,00' },
]

export function HomePage({
  user,
  sessionReady,
  onRegister,
  onLogin,
  onLogout,
}: {
  user: UserResponse | null
  sessionReady: boolean
  onRegister: () => void
  onLogin: () => void
  onLogout: () => void
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!notice) {
      return
    }
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function soon(feature: string) {
    setNotice(`${feature} será implementado no futuro.`)
    setMenuOpen(false)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    soon('A busca')
  }

  const firstName = user?.name.split(' ')[0]

  return (
    <div className="min-h-svh bg-[#f6f3fb] text-[#24182f]">
      <header className="sticky top-0 z-20 bg-[#660366] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex shrink-0 items-center gap-2"
          >
            <img src={mark} alt="" className="h-9 w-auto" />
            <span className="font-display hidden text-sm tracking-wide sm:inline">
              TCG MARKET
            </span>
          </button>

          <form onSubmit={search} className="min-w-0 flex-1">
            <label className="relative block">
              <span className="sr-only">Buscar carta, anúncio ou usuário</span>
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar carta, anúncio ou usuário..."
                className="w-full rounded-full bg-white/15 py-2.5 pr-4 pl-10 text-sm text-white outline-none placeholder:text-white/70 focus:ring-2 focus:ring-[#1688F8]"
              />
            </label>
          </form>

          <button
            type="button"
            onClick={() => (user ? soon('Criar anúncio') : onLogin())}
            className="hidden rounded-full border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:inline-flex"
          >
            Criar anúncio
          </button>
          <button
            type="button"
            onClick={() => soon('As notificações')}
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Notificações"
          >
            <BellIcon />
          </button>

          {sessionReady && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-white/10"
                aria-expanded={menuOpen}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#660366]">
                  {firstName?.[0] ?? 'U'}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
                  {firstName}
                </span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-3 text-[#24182f] shadow-xl">
                  <p className="px-2 text-sm font-semibold">{user.name}</p>
                  <p className="px-2 pb-2 text-xs text-[#6d647c]">
                    {user.email}
                  </p>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-[#660366] hover:bg-[#f3eaf3]"
                  >
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRegister}
                disabled={!sessionReady}
                className="hidden px-2 text-sm font-semibold hover:text-white/80 disabled:opacity-60 sm:inline"
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={onLogin}
                disabled={!sessionReady}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#660366] hover:bg-[#f3eaf3] disabled:opacity-60"
              >
                {sessionReady ? 'Entrar' : '...'}
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="border-b border-[#eadff3] bg-white">
        <div className="mx-auto flex max-w-6xl justify-start gap-1 overflow-x-auto px-2 sm:justify-center">
          <NavChip
            current
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HomeIcon />
            Início
          </NavChip>
          {GAMES.map((game) => (
            <NavChip
              key={game.name}
              onClick={() => soon(`O catálogo de ${game.name}`)}
            >
              <GameGlyph kind={game.mark} />
              {game.name}
            </NavChip>
          ))}
        </div>
      </nav>

      {notice ? (
        <div className="fixed top-24 right-4 left-4 z-30 mx-auto max-w-md sm:left-auto">
          <Alert tone="info" message={notice} onClose={() => setNotice(null)} />
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {sessionReady && user ? (
          <p role="status" className="sr-only">
            Você entrou como {user.name}.
          </p>
        ) : null}

        <section className="relative min-h-[22rem] overflow-hidden rounded-3xl bg-[#2a1248] text-white shadow-lg">
          <img
            src={hero}
            alt=""
            className="absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_center] sm:w-[72%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1248] from-20% via-[#2a1248]/92 via-45% to-transparent to-70%" />
          <div className="relative flex min-h-[22rem] max-w-xl flex-col justify-center px-6 py-10 sm:px-10">
            <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
              Mais que cartas,{' '}
              <span className="text-[#e9d5ff]">uma comunidade.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Compre, venda, troque e expanda sua coleção de TCGs com outros fãs
              como você.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => soon('O catálogo')}
                className="rounded-xl bg-[#660366] px-5 py-3 text-sm font-semibold hover:bg-[#4F024F]"
              >
                Explorar catálogo
              </button>
              <button
                type="button"
                onClick={() => (user ? soon('Criar anúncio') : onLogin())}
                className="rounded-xl border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20"
              >
                Criar anúncio
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <ShieldIcon /> Compra segura
              </li>
              <li className="flex items-center gap-2">
                <PeopleIcon /> Comunidade ativa
              </li>
              <li className="flex items-center gap-2">
                <CardsIcon /> Diversos TCGs
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Explore por TCG</h2>
            <button
              type="button"
              onClick={() => soon('O catálogo')}
              className="text-sm font-semibold text-[#660366]"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {GAMES.map((game) => (
              <button
                key={game.name}
                type="button"
                onClick={() => soon(`O catálogo de ${game.name}`)}
                className="group relative h-36 overflow-hidden rounded-2xl text-left text-white shadow-sm"
                style={{
                  background: `linear-gradient(145deg, ${game.from}, ${game.to})`,
                }}
              >
                <GameMark kind={game.mark} />
                <span className="absolute bottom-3 left-3 text-lg font-bold">
                  {game.name}
                </span>
                <span className="absolute right-3 bottom-3 text-xs opacity-80 transition group-hover:translate-x-0.5">
                  Ver cartas
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-bold">Anúncios em destaque</h2>
              <button
                type="button"
                onClick={() => soon('Os anúncios')}
                className="text-sm font-semibold text-[#660366]"
              >
                Ver todos os anúncios
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURED.map((card) => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => soon('Os anúncios')}
                  className="overflow-hidden rounded-2xl border border-[#eadff3] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className="block h-36"
                    style={{
                      background: `linear-gradient(160deg, ${card.from}, ${card.to})`,
                    }}
                  />
                  <span className="block p-3">
                    <span className="block text-sm font-semibold">
                      {card.name}
                    </span>
                    <span className="mt-1 block text-xs text-[#6d647c]">
                      {card.meta}
                    </span>
                    <span className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#f3eaf3] px-2 py-0.5 text-[11px] font-medium text-[#660366]">
                        {card.tag}
                      </span>
                      <span className="text-sm font-bold">{card.price}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#eadff3] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Últimos anúncios</h2>
                <button
                  type="button"
                  onClick={() => soon('Os anúncios')}
                  className="text-xs font-semibold text-[#660366]"
                >
                  Ver todos
                </button>
              </div>
              <ul className="divide-y divide-[#f1eaf4]">
                {RECENT.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => soon('Os anúncios')}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="block text-xs text-[#6d647c]">
                          {item.meta}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold">
                        {item.price}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-2xl bg-gradient-to-br from-[#f3eaf8] to-[#efe7fb] p-5">
              <h2 className="text-lg font-bold">
                {user ? `Olá, ${firstName}` : 'Faça parte da nossa comunidade'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4b445c]">
                {user
                  ? 'Sua conta já está pronta. Em breve você anuncia cartas, monta a coleção e troca com outros fãs.'
                  : 'Siga outros colecionadores, participe de trocas e fique por dentro das novidades.'}
              </p>
              {user ? (
                <button
                  type="button"
                  onClick={() => soon('Criar anúncio')}
                  className="mt-4 w-full rounded-xl bg-[#660366] py-3 text-sm font-semibold text-white hover:bg-[#4F024F]"
                >
                  Criar anúncio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRegister}
                  className="mt-4 w-full rounded-xl bg-[#660366] py-3 text-sm font-semibold text-white hover:bg-[#4F024F]"
                >
                  Criar uma conta gratuita
                </button>
              )}
              <ul className="mt-4 space-y-2 text-sm text-[#4b445c]">
                <li>Anuncie suas cartas</li>
                <li>Monte sua coleção</li>
                <li>Conecte-se com outros fãs</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>

      <footer className="bg-[#4F024F] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2">
              <img src={mark} alt="" className="h-8 w-auto" />
              <span className="font-display text-sm tracking-wide">
                TCG MARKET
              </span>
            </div>
            <p className="mt-3 text-sm text-white/75">
              Colecione • Troque • Conecte
            </p>
          </div>
          <FooterColumn
            title="Sobre"
            links={['Quem somos', 'Como funciona', 'Blog']}
            onClick={(label) => soon(label)}
          />
          <FooterColumn
            title="Ajuda"
            links={[
              'Central de ajuda',
              'Termos de uso',
              'Política de privacidade',
              'Fale conosco',
            ]}
            onClick={(label) => soon(label)}
          />
          <FooterColumn
            title="Categorias"
            links={GAMES.map((game) => game.name)}
            onClick={(label) => soon(`O catálogo de ${label}`)}
          />
          <div>
            <p className="text-sm font-semibold">Acompanhe</p>
            <p className="mt-3 text-sm text-white/75">
              © {new Date().getFullYear()} TCG Market. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavChip({
  children,
  onClick,
  current = false,
}: {
  children: ReactNode
  onClick: () => void
  current?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${
        current
          ? 'border-[#660366] font-semibold text-[#660366]'
          : 'border-transparent text-[#5c516b] hover:text-[#660366]'
      }`}
    >
      {children}
    </button>
  )
}

function GameGlyph({ kind }: { kind: (typeof GAMES)[number]['mark'] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {kind === 'poke' ? <circle cx="12" cy="12" r="7" /> : null}
      {kind === 'magic' ? <path d="m12 3 7 9-7 9-7-9Z" /> : null}
      {kind === 'yugioh' ? <path d="M12 3 20 8v8l-8 5-8-5V8Z" /> : null}
      {kind === 'piece' ? (
        <path d="M6 16c2-7 10-7 12 0M8 9a4 4 0 0 1 8 0" />
      ) : null}
      {kind === 'digimon' ? (
        <rect x="6" y="4" width="12" height="16" rx="3" />
      ) : null}
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1Z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M12 3 19 6v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6Z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 14.2a4.5 4.5 0 0 1 4.5 4.3" />
    </svg>
  )
}

function CardsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="7" y="3" width="12" height="16" rx="2" />
      <path d="M5 7v12a2 2 0 0 0 2 2h10" />
    </svg>
  )
}

function FooterColumn({
  title,
  links,
  onClick,
}: {
  title: string
  links: string[]
  onClick: (label: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}>
            <button
              type="button"
              onClick={() => onClick(link)}
              className="text-sm text-white/75 hover:text-white"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GameMark({ kind }: { kind: (typeof GAMES)[number]['mark'] }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="absolute -top-2 right-1 size-24 opacity-80"
      aria-hidden="true"
    >
      {kind === 'poke' ? (
        <path
          d="M32 8 37 24h16l-13 9 5 16-13-9-13 9 5-16-13-9h16Z"
          fill="white"
        />
      ) : null}
      {kind === 'magic' ? (
        <path
          d="M32 6 54 28 32 58 10 28Z"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
      ) : null}
      {kind === 'yugioh' ? (
        <path
          d="M32 8 50 20v24L32 56 14 44V20Z"
          fill="none"
          stroke="#fde68a"
          strokeWidth="3"
        />
      ) : null}
      {kind === 'piece' ? (
        <>
          <circle
            cx="32"
            cy="28"
            r="16"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
          <path
            d="M20 24c6-10 18-10 24 0"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
        </>
      ) : null}
      {kind === 'digimon' ? (
        <rect
          x="16"
          y="14"
          width="32"
          height="36"
          rx="8"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
      ) : null}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}
