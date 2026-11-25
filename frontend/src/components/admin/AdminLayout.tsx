import { Icon, type IconName } from '@/components/ui/Icon'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import cornerTL from '@/assets/design-system/canto-se.svg'
import cornerTR from '@/assets/design-system/canto-sd.svg'
import cornerBL from '@/assets/design-system/canto-ie.svg'
import cornerBR from '@/assets/design-system/canto-id.svg'
import './adminCommand.css'

type AdminDestination = '/admin' | '/admin/usuarios' | '/admin/catalogo'

const SECTIONS: { to: AdminDestination; label: string; icon: IconName }[] = [
  { to: '/admin', label: 'Visão geral', icon: 'grid' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'user' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'layers' },
]

const RAIL_CORNERS = [
  { src: cornerTL, position: 'top-0 left-0' },
  { src: cornerTR, position: 'top-0 right-0' },
  { src: cornerBL, position: 'bottom-0 left-0' },
  { src: cornerBR, position: 'bottom-0 right-0' },
] as const

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
    description: 'Acompanhe o catálogo, os anúncios, as vendas e a atividade da plataforma.',
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

/**
 * Composição e rotas originais preservadas. A autorização ADMIN permanece no router;
 * o layout é apenas a superfície e a navegação da área administrativa.
 */
export function AdminLayout() {
  const { pathname } = useLocation()
  const normalizedPath = pathname.replace(/\/$/, '') || '/admin'
  const header = HEADER_BY_PATH[normalizedPath as keyof typeof HEADER_BY_PATH]
    ?? HEADER_BY_PATH['/admin']

  return (
    <main className="ds17-admin mx-auto w-full max-w-[1660px] px-3 pb-12 pt-3 font-sans text-text-primary sm:px-4 lg:px-5">
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-5">
        {/* Sidebar no mesmo local e sticky apenas no desktop. */}
        <nav
          aria-label="Seções da área administrativa"
          className="ds17-admin-rail relative min-w-0 overflow-x-hidden rounded-surface border border-accent-gold-frame bg-surface-default px-3 pb-5 pt-5 text-text-primary shadow-md lg:sticky lg:top-5 lg:min-h-[min(620px,calc(100dvh-2.5rem))] lg:max-h-[calc(100dvh-2.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:px-3 lg:pb-8 lg:pt-7"
        >
          {/* Moldura dos filtros DS-10, em escala mais discreta para o admin. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
            {RAIL_CORNERS.map(({ src, position }) => (
              <img
                key={position}
                src={src}
                alt=""
                className={`absolute size-7 select-none opacity-85 ${position}`}
              />
            ))}
          </div>

          <div className="relative z-10 mb-5 border-b border-accent-bronze/50 px-2 pb-4">
            <p className="font-display text-[15px] font-bold uppercase tracking-[0.065em] text-brand-deep sm:text-base">
              Administração
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-text-secondary">
              TCG Market
            </p>
          </div>

          <ul className="relative z-10 flex min-w-0 gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <li key={section.to} className="shrink-0 lg:w-full">
                <Link
                  to={section.to}
                  activeOptions={{ exact: true, includeSearch: false }}
                  activeProps={{ 'aria-current': 'page' }}
                  className="ds17-admin-link flex min-h-11 items-center px-3 py-2.5 text-sm font-semibold text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue lg:w-full"
                >
                  <span className="ds17-admin-link-content inline-flex items-center gap-3">
                    <Icon name={section.icon} size={20} />
                    <span>{section.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <details className="ds17-admin-upcoming group relative z-10 mt-5 hidden border-t border-accent-bronze/45 pt-3 lg:block">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-control px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-support-blue [&::-webkit-details-marker]:hidden">
              <span>Em planejamento</span>
              <Icon name="chevron-down" size={16} className="ds17-admin-chevron" />
            </summary>
            <ul className="ds17-admin-upcoming-content mt-1 space-y-1">
              {UPCOMING.map((label) => (
                <li key={label} aria-disabled="true" className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-text-secondary">
                  {label}
                  <span className="text-[10px]">Em breve</span>
                </li>
              ))}
            </ul>
          </details>
        </nav>

        <div className="min-w-0">
          <header className="mb-4 border-b border-border-default bg-surface-default/80 px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
            <div className="mb-1 flex items-center gap-3">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-primary" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-primary sm:text-xs">
                {header.eyebrow}
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-border-default" />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-tight text-text-ink">
                  {header.title}
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {header.description}
                </p>
              </div>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-control border border-border-default bg-accent-gold-soft px-2.5 py-1 text-xs font-bold text-accent-gold-deep">
                <Icon name="shield-check" size={16} />
                Administrador
              </span>
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
