import { useNavigate } from '@tanstack/react-router'

import { conditionLabels } from '@/components/ads/adFormat'
import { Icon, type IconName } from '@/components/ui/Icon'
import { focusRing } from '@/components/ui/styles'
import type { CardCondition } from '@/types/Collection'

type Step = {
  title: string
  description: string
  icon: IconName
}

type Condition = {
  value: CardCondition
  abbreviation: string
  shortDescription: string
  indicators: number
}

// Conteúdo da issue #210, com rotas existentes e estilos definidos pelos tokens DS v2.2.
const STEPS: Step[] = [
  {
    title: 'Cadastre sua coleção',
    description: 'Organize suas cartas e informe quantidade, idioma e condição de cada uma.',
    icon: 'layers',
  },
  {
    title: 'Compre ou anuncie',
    description: 'Encontre cartas à venda ou publique anúncios da sua coleção.',
    icon: 'storefront',
  },
  {
    title: 'Proponha trocas',
    description: 'Envie propostas, acompanhe as respostas e avalie cada negociação.',
    icon: 'handshake',
  },
]

const CONDITIONS: Condition[] = [
  {
    value: 'NEAR_MINT',
    abbreviation: 'NM',
    shortDescription: 'Praticamente perfeita, sem desgaste relevante visível.',
    indicators: 5,
  },
  {
    value: 'LIGHTLY_PLAYED',
    abbreviation: 'LP',
    shortDescription: 'Pequenas marcas superficiais ou nas bordas.',
    indicators: 4,
  },
  {
    value: 'MODERATELY_PLAYED',
    abbreviation: 'MP',
    shortDescription: 'Desgaste visível em superfície, bordas ou cantos.',
    indicators: 3,
  },
  {
    value: 'HEAVILY_PLAYED',
    abbreviation: 'HP',
    shortDescription: 'Marcas acentuadas de uso e conservação.',
    indicators: 2,
  },
  {
    value: 'DAMAGED',
    abbreviation: 'DMG',
    shortDescription: 'Danos como dobras, vincos, rasgos ou manchas.',
    indicators: 1,
  },
]

const NAV_ACTIONS: {
  label: string
  target: 'buy' | 'sell' | 'trade' | 'collection'
  icon: IconName
}[] = [
  { label: 'Comprar', target: 'buy', icon: 'cart' },
  { label: 'Vender', target: 'sell', icon: 'megaphone' },
  { label: 'Trocar', target: 'trade', icon: 'arrows-right-left' },
  { label: 'Minha coleção', target: 'collection', icon: 'cards' },
]

const sectionTitle =
  'font-display text-xl font-bold uppercase tracking-[0.02em] text-text-primary sm:text-2xl'

export function HomeInformationSections({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const navigate = useNavigate()

  function openFlow(target: (typeof NAV_ACTIONS)[number]['target']) {
    switch (target) {
      case 'buy':
        void navigate({ to: '/marketplace', search: { sort: 'recent' } })
        break
      case 'sell':
        void navigate({ to: isAuthenticated ? '/anuncios/novo' : '/login' })
        break
      case 'trade':
        void navigate({ to: isAuthenticated ? '/perfil/propostas' : '/login' })
        break
      case 'collection':
        void navigate({ to: isAuthenticated ? '/minha-colecao' : '/login' })
        break
    }
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[1192px] min-w-0 flex-col gap-5"
      aria-label="Informações sobre o TCG Market"
    >
      <section
        id="como-funciona"
        aria-labelledby="como-funciona-title"
        className="flex min-w-0 flex-col rounded-surface border border-border-default bg-surface-default p-4 shadow-sm sm:p-6"
      >
        <header className="mb-5 border-b border-border-default pb-4">
          <h2 id="como-funciona-title" className={sectionTitle}>
            Como funciona
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Da primeira carta à negociação, em três passos.
          </p>
        </header>

        <ol className="grid gap-3 sm:grid-cols-3 xl:gap-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-col rounded-card border border-border-default bg-surface-input p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-control border border-border-default bg-surface-brand-tint text-brand-primary"
                >
                  <Icon name={step.icon} size={20} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-accent-gold-deep">
                  Passo {index + 1}
                </span>
              </div>
              <h3 className="font-sans text-sm font-bold leading-snug text-text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
            Explore a plataforma
          </p>
          <nav
            aria-label="Acessar funcionalidades do Marketplace"
            className="flex flex-wrap gap-2"
          >
            {NAV_ACTIONS.map((action) => (
              <button
                key={action.target}
                type="button"
                onClick={() => openFlow(action.target)}
                className={`${focusRing} inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-input px-3 py-2 text-xs font-semibold text-brand-primary transition-colors hover:border-border-emphasis hover:bg-surface-brand-tint`}
              >
                <Icon name={action.icon} size={16} />
                {action.label}
              </button>
            ))}
          </nav>
          {!isAuthenticated ? (
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              Para anunciar, trocar e gerenciar sua coleção, entre na sua conta.
            </p>
          ) : null}
        </div>
      </section>

      <section
        id="guia-de-condicao"
        aria-labelledby="guia-condicao-title"
        className="min-w-0 rounded-surface border border-border-default bg-surface-default p-4 shadow-sm sm:p-6"
      >
        <header className="mb-4 flex items-start justify-between gap-4 border-b border-border-default pb-4">
          <div className="min-w-0">
            <h2 id="guia-condicao-title" className={sectionTitle}>
              Guia de condição
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Use a mesma classificação ao cadastrar e anunciar.
            </p>
          </div>
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-control border border-border-default bg-surface-brand-tint text-brand-primary"
          >
            <Icon name="shield-check" size={24} />
          </span>
        </header>

        <ul className="divide-y divide-border-default">
          {CONDITIONS.map((condition) => (
            <li key={condition.value} className="flex min-w-0 items-center gap-3 py-3 sm:gap-4">
              <span className="inline-flex min-h-8 min-w-12 shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-brand-tint px-2 text-xs font-bold text-brand-primary">
                {condition.abbreviation}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans text-sm font-bold leading-snug text-text-ink">
                  {conditionLabels[condition.value]}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-[13px]">
                  {condition.shortDescription}
                </p>
              </div>
              <span
                className="flex shrink-0 gap-1"
                role="img"
                aria-label={`Indicador ilustrativo de conservação: ${condition.indicators} de 5`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`h-3.5 w-1 rounded-full sm:h-4 ${
                      index < condition.indicators
                        ? 'bg-brand-primary'
                        : 'bg-surface-subtle'
                    }`}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>

        <details className="group mt-4 border-t border-border-default pt-4">
          <summary className={`${focusRing} flex min-h-11 cursor-pointer items-center gap-2 rounded-control py-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover`}>
            <Icon name="info" size={16} />
            O que observar antes de classificar?
            <Icon
              name="chevron-down"
              size={16}
              className="ml-auto transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <ul className="mt-3 grid list-disc gap-x-6 gap-y-2 pl-5 text-xs leading-relaxed text-text-secondary sm:grid-cols-2 sm:text-[13px]">
            <li>Desgaste nas bordas e nos cantos.</li>
            <li>Arranhões, riscos e marcas superficiais.</li>
            <li>Dobras, vincos e amassados.</li>
            <li>Manchas e alterações na coloração.</li>
            <li>Danos estruturais, como rasgos.</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            A escala acima é apenas ilustrativa: avalie a carta inteira e descreva os defeitos com clareza no anúncio.
          </p>
        </details>
      </section>
    </div>
  )
}
