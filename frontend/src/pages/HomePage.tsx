import hero from '@/assets/homepage-hero.webp'
import { Alert } from '@/components/ui/Alert'
import { GAMES } from '@/components/layout/siteGames'
import { useSession } from '@/session'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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

export function HomePage() {
  const navigate = useNavigate()
  const { user, sessionReady } = useSession()
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [notice])
  function soon(feature: string) {
    setNotice(`${feature} será implementado no futuro.`)
  }
  const firstName = user?.name.split(' ')[0]
  return (
    <div className="min-h-svh bg-neutral-50 text-neutral-900">
      {notice ? (
        <div className="fixed top-24 right-4 left-4 z-30 mx-auto max-w-md sm:left-auto">
          <Alert variant="info" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 lg:px-8">
        {sessionReady && user ? (
          <p role="status" className="sr-only">
            Você entrou como {user.name}.
          </p>
        ) : null}

        <section className="relative min-h-[300px] overflow-hidden rounded-lg bg-neutral-900 text-white shadow-lg">
          <img
            src={hero}

            alt=""

            className="absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_center] sm:w-[72%]"
          />

          <div className="absolute inset-0 bg-linear-to-r from-neutral-900 from-20% via-neutral-900/92 via-45% to-transparent to-70%" />

          <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Mais que cartas,{' '}
              <span className="text-primary-100">uma comunidade.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Compre, venda, troque e expanda sua coleção de TCGs com outros fãs
              como você.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"

                onClick={() =>
                  navigate({
                    to: '/catalogo/$game',
                    params: { game: 'pokemon' },
                  })
                }

                className="rounded-md bg-primary-900 px-5 py-3 text-sm font-semibold hover:bg-primary-800"
              >
                Explorar catálogo
              </button>

              <button
                type="button"

                onClick={() =>
                  user ? soon('Criar anúncio') : navigate({ to: '/login' })
                }

                className="rounded-md border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20"
              >
                Criar anúncio
              </button>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
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

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {GAMES.map((game) => (
              <button
                key={game.name}

                type="button"

                onClick={() =>
                  game.slug
                    ? navigate({
                        to: '/catalogo/$game',
                        params: { game: game.slug },
                      })
                    : soon(`O catálogo de ${game.name}`)
                }

                className="group relative h-30 overflow-hidden rounded-lg text-left text-white shadow-sm"

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

                className="text-sm font-semibold text-primary-900"
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

                  className="overflow-hidden rounded-lg border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className="block h-32"

                    style={{
                      background: `linear-gradient(160deg, ${card.from}, ${card.to})`,
                    }}
                  />

                  <span className="block p-3">
                    <span className="block text-sm font-semibold">
                      {card.name}
                    </span>

                    <span className="mt-1 block text-xs text-neutral-500">
                      {card.meta}
                    </span>

                    <span className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-900">
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
            <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Últimos anúncios</h2>

                <button
                  type="button"

                  onClick={() => soon('Os anúncios')}

                  className="text-xs font-semibold text-primary-900"
                >
                  Ver todos
                </button>
              </div>

              <ul className="divide-y divide-neutral-200">
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

                        <span className="block text-xs text-neutral-500">
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

            <aside className="rounded-lg bg-linear-to-br from-primary-100 to-neutral-100 p-5">
              <h2 className="text-lg font-bold">
                {user ? `Olá, ${firstName}` : 'Faça parte da nossa comunidade'}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {user
                  ? 'Sua conta já está pronta. Em breve você anuncia cartas, monta a coleção e troca com outros fãs.'
                  : 'Siga outros colecionadores, participe de trocas e fique por dentro das novidades.'}
              </p>

              {user ? (
                <button
                  type="button"

                  onClick={() => soon('Criar anúncio')}

                  className="mt-4 w-full rounded-md bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  Criar anúncio
                </button>
              ) : (
                <button
                  type="button"

                  onClick={() => navigate({ to: '/cadastro' })}

                  className="mt-4 w-full rounded-md bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  Criar uma conta gratuita
                </button>
              )}

              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>Anuncie suas cartas</li>

                <li>Monte sua coleção</li>

                <li>Conecte-se com outros fãs</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </div>
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
