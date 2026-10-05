import { type ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Logo, Mark } from '@/components/ui/Logo'

const POINTS: Array<{ icon: IconName; title: string; text: string }> = [
  {
    icon: 'check-circle',
    title: 'Transações seguras',
    text: 'Negocie com confiança',
  },
  {
    icon: 'user',
    title: 'Comunidade ativa',
    text: 'Colecionadores como você',
  },
  {
    icon: 'sparkle',
    title: 'Diversos TCGs',
    text: 'Tudo em um só lugar',
  },
]

export function BrandShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-neutral-50 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside className="relative hidden overflow-hidden bg-primary-900 text-white lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <Mark
          tone="inverse"
          className="pointer-events-none absolute -right-6 bottom-8 h-56 w-auto opacity-25"
        />
        <Logo tone="inverse" />
        <div className="relative max-w-md">
          <p className="font-display text-5xl leading-none font-bold">
            Colecione
            <br />
            Troque
            <br />
            <span className="text-primary-300">Conecte</span>
          </p>
          <p className="mt-6 text-base leading-relaxed text-primary-100">
            Sua comunidade de TCGs em um só lugar. Compre, venda e troque cartas
            com outros fãs.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3">
                <span className="mt-0.5 text-primary-300">
                  <Icon name={point.icon} size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {point.title}
                  </span>
                  <span className="block text-sm text-primary-100">
                    {point.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm tracking-wide text-primary-300">
          Colecione · Troque · Conecte
        </p>
      </aside>

      <section className="flex min-h-svh flex-col bg-white">
        <header className="border-b border-neutral-200 px-6 py-4 lg:hidden">
          <Logo size="sm" tagline />
        </header>
        <div className="flex flex-1 items-start justify-center px-6 py-12 lg:px-16 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  )
}
