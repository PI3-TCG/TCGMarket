import { Icon, type IconName } from '@/components/ui/Icon'
import { Link, Outlet, useLocation } from '@tanstack/react-router'

const SECTIONS: {
  to: '/admin' | '/admin/usuarios' | '/admin/catalogo'
  label: string
  icon: IconName
}[] = [
  { to: '/admin', label: 'Visão geral', icon: 'grid' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'user' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'layers' },
]

const UPCOMING = [
  'Solicitações de carta',
  'Anúncios',
  'Denúncias',
  'Transações',
  'Relatórios',
]

const HEADER_BY_PATH = {
  '/admin': {
    eyebrow: 'Central de comando',
    title: 'Monitor do Marketplace',
    description:
      'Acompanhe o catálogo, os anúncios, as vendas e a atividade da plataforma.',
  },
  '/admin/usuarios': {
    eyebrow: 'Gestão de usuários',
    title: 'Usuários da plataforma',
    description: 'Gerencie contas, permissões e ações de moderação.',
  },
  '/admin/catalogo': {
    eyebrow: 'Gestão de catálogo',
    title: 'Catálogo administrativo',
    description: 'Consulte as cartas e administre a visibilidade do catálogo.',
  },
} as const

export function AdminLayout() {
  const { pathname } = useLocation()
  const normalizedPath = pathname.replace(/\/$/, '') || '/admin'
  const header =
    HEADER_BY_PATH[normalizedPath as keyof typeof HEADER_BY_PATH] ??
    HEADER_BY_PATH['/admin']

  return (
    <main className="mx-auto w-full max-w-[1660px] px-3 pb-12 pt-3 text-[#291437] sm:px-4 lg:px-5">
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-5">
        {/* Continua acompanhando a rolagem, como na versão que você aprovou. */}
        <nav
          aria-label="Seções da área administrativa"
          className="relative min-w-0 overflow-hidden border border-[#5D2679] bg-[radial-gradient(ellipse_at_5%_2%,#68257F_0%,transparent_52%),linear-gradient(165deg,#410A5E_5%,#2D063F_68%,#4B0C63_100%)] px-3 pb-5 pt-5 text-white shadow-[0_14px_30px_rgba(42,7,59,0.17)] lg:sticky lg:top-5 lg:min-h-[min(620px,calc(100dvh-2.5rem))] lg:max-h-[calc(100dvh-2.5rem)] lg:overflow-y-auto lg:px-3 lg:pb-8 lg:pt-7"
          style={{
            clipPath:
              'polygon(0 0,100% 0,100% calc(100% - 17px),calc(100% - 17px) 100%,0 100%)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-20 size-56 rounded-full bg-[#A440B8]/20 blur-3xl"
          />
          <div className="relative mb-5 border-b border-[#A45CC1]/55 px-2 pb-4">
            <p className="font-display text-[15px] font-extrabold uppercase tracking-[0.065em] text-white sm:text-base">
              Administração
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5C9F0]">
              TCC Market
            </p>
            <span
              aria-hidden="true"
              className="absolute bottom-[-1px] left-2 h-[2px] w-14 bg-[linear-gradient(90deg,#FFE589,#D5A72C)] shadow-[0_0_12px_rgba(248,201,78,0.5)]"
            />
          </div>

          <ul className="relative flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <li key={section.to} className="shrink-0 lg:w-full">
                <Link
                  to={section.to}
                  activeOptions={{ exact: true, includeSearch: false }}
                  className="flex min-h-12 items-center gap-3 border-l-[3px] border-l-transparent px-3 py-2.5 text-sm font-semibold text-[#F2E7FA] transition-all duration-150 hover:border-l-[#E0B957] hover:bg-[#802E9B]/55 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFE18A] lg:w-full"
                  activeProps={{
                    className:
                      'border-l-[#FFE17E] bg-[linear-gradient(95deg,#8733AC_0%,#6C238D_90%)] text-white shadow-[0_0_18px_rgba(184,68,222,0.32),inset_0_1px_0_rgba(255,255,255,0.09)]',
                    'aria-current': 'page',
                  }}
                >
                  <Icon name={section.icon} size={24} />
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>

          <details className="relative mt-5 hidden border-t border-[#A45CC1]/35 pt-3 lg:block">
            <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D6B7E4] hover:text-white focus-visible:outline-2 focus-visible:outline-[#FFE18A]">
              Em planejamento
            </summary>
            <ul className="mt-1 space-y-1">
              {UPCOMING.map((label) => (
                <li
                  key={label}
                  aria-disabled="true"
                  className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-[#BFA1CF]"
                >
                  {label}
                  <span className="text-[10px] text-[#DAC3E3]">Em breve</span>
                </li>
              ))}
            </ul>
          </details>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-px w-24 bg-[linear-gradient(90deg,#E3B42B,transparent)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 bg-[linear-gradient(135deg,#FFE080,#C99019)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
          />
        </nav>

        <div className="min-w-0">
          <header className="relative mb-4 overflow-hidden border-b border-[#CFA9DB] bg-[radial-gradient(ellipse_at_92%_0%,rgba(185,126,217,0.22),transparent_47%),linear-gradient(90deg,#FBF8FF_0%,#F9F3FF_100%)] px-1 pb-4 pt-3 sm:pb-5">
            <div className="mb-1 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-[#6D168F]"
              />
              <p className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.26em] text-[#651B8A] sm:text-xs">
                {header.eyebrow}
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-[#CBA1E0]" />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-[#2E1045] sm:text-[34px]">
                  {header.title}
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-[#5E4974] sm:text-sm">
                  {header.description}
                </p>
              </div>
              <div className="flex items-center gap-2 pb-1 text-[#5A3670]">
                <span className="inline-flex min-h-8 items-center gap-1.5 border border-[#C19B3C] bg-[linear-gradient(180deg,#FFF9E8,#F8E4A9)] px-2.5 text-[10px] font-extrabold uppercase tracking-[0.045em] text-[#4B2E25] shadow-[0_2px_6px_rgba(134,92,15,0.12)]">
                  <Icon name="shield-check" size={16} />
                  Administrador
                </span>
                <span
                  aria-hidden="true"
                  className="hidden text-xs font-bold tracking-widest text-[#6D3F89] sm:inline"
                >
                  ///
                </span>
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.1em] text-[#6D3F89] sm:inline">
                  TCC Market
                </span>
              </div>
            </div>
          </header>
          <section aria-label="Conteúdo administrativo" className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  )
}
