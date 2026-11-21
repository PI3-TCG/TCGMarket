import { conditionLabels } from '@/components/ads/adFormat'
import { Icon, type IconName } from '@/components/ui/Icon'
import type { CardCondition } from '@/types/Collection'
import { useNavigate } from '@tanstack/react-router'

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

/**
 * Informações institucionais da Home. As condições e seus rótulos vêm do
 * mesmo domínio usado nos formulários de coleção e anúncios.
 */
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

const NAV_ACTIONS: { label: string; target: 'buy' | 'sell' | 'trade' | 'collection'; icon: IconName }[] = [
  { label: 'Comprar', target: 'buy', icon: 'cart' },
  { label: 'Vender', target: 'sell', icon: 'megaphone' },
  { label: 'Trocar', target: 'trade', icon: 'arrows-right-left' },
  { label: 'Minha coleção', target: 'collection', icon: 'cards' },
]

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
    <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-2" aria-label="Informações sobre o TCC Market">
      {/* Coluna esquerda: mesma composição de três passos da referência. */}
      <section
        id="como-funciona"
        aria-labelledby="como-funciona-title"
        className="panel-ornaments flex min-w-0 flex-col rounded-xl border border-rare-500/75 bg-[linear-gradient(145deg,#FBF6FF_0%,#F6F0FC_53%,#F0F2FF_100%)] p-4 shadow-[0_8px_26px_rgba(67,20,85,0.09)] sm:p-6 lg:p-7"
      >
        <div className="mb-5">
          <h2 id="como-funciona-title" className="font-display text-xl font-bold tracking-[0.015em] text-[#30223F] sm:text-[25px]">
            Como funciona
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            Da primeira carta à negociação, em três passos.
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-3 xl:gap-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-col rounded-xl border border-[#E4D9EC] bg-white/95 p-4 shadow-[0_2px_6px_rgba(55,20,75,0.035)] transition-shadow duration-200 hover:shadow-[0_7px_20px_rgba(68,21,82,0.11)]"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#9B4AA7]/40 bg-[linear-gradient(145deg,#84258B,#54045A)] text-white shadow-[0_3px_8px_rgba(80,12,92,0.18)]"
                >
                  <Icon name={step.icon} size={20} />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#636579]">
                  Passo {index + 1}
                </span>
              </div>
              <h3 className="text-sm font-extrabold leading-snug text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-700">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#69457B]">
            Explore a plataforma
          </p>
          <nav aria-label="Acessar funcionalidades do marketplace" className="flex flex-wrap gap-2">
            {NAV_ACTIONS.map((action) => (
              <button
                key={action.target}
                type="button"
                onClick={() => openFlow(action.target)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D8BEDF] bg-white px-3 py-2 text-xs font-bold text-[#622174] shadow-sm transition-colors hover:border-[#A95BB0] hover:bg-[#F6EBFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E227A]"
              >
                <Icon name={action.icon} size={16} />
                {action.label}
              </button>
            ))}
          </nav>
          {!isAuthenticated ? (
            <p className="mt-2 text-xs text-neutral-700">
              Para anunciar, trocar e gerenciar sua coleção, entre na sua conta.
            </p>
          ) : null}
        </div>
      </section>

      {/* Coluna direita: as cinco condições registradas nos formulários. */}
      <section
        id="guia-de-condicao"
        aria-labelledby="guia-condicao-title"
        className="panel-ornaments min-w-0 rounded-xl border border-rare-500/75 bg-white p-4 shadow-[0_8px_26px_rgba(67,20,85,0.07)] sm:p-6 lg:p-7"
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="guia-condicao-title" className="font-display text-xl font-bold tracking-[0.015em] text-[#30223F] sm:text-[25px]">
              Guia de condição
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">
              Use a mesma classificação ao cadastrar e anunciar.
            </p>
          </div>
          <span aria-hidden="true" className="mt-1 text-[#94519B]">
            <Icon name="shield-check" size={24} />
          </span>
        </header>

        <ul className="divide-y divide-[#E6DEEB]">
          {CONDITIONS.map((condition) => (
            <li key={condition.value} className="flex min-w-0 items-center gap-3 py-3 sm:gap-4">
              <span className="inline-flex min-h-8 min-w-12 shrink-0 items-center justify-center rounded-full border border-[#EDE0F0] bg-[#FBF6FC] px-2 text-[11px] font-extrabold text-[#6E1877]">
                {condition.abbreviation}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold leading-snug text-neutral-900 sm:text-sm">
                  {conditionLabels[condition.value]}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-700 sm:text-[13px]">
                  {condition.shortDescription}
                </p>
              </div>
              <span
                className="flex shrink-0 gap-[3px]"
                role="img"
                aria-label={`Referência visual: ${condition.indicators} de 5 marcas de conservação`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`h-3.5 w-[5px] rounded-full sm:h-4 sm:w-[6px] ${
                      index < condition.indicators ? 'bg-[#7F398C]' : 'bg-[#E4E4EC]'
                    }`}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>

        <details className="group mt-4 border-t border-[#E6DEEB] pt-4">
          <summary className="flex cursor-pointer items-center gap-2 rounded-md py-1 text-xs font-bold text-[#6C287C] transition-colors hover:text-[#4D155B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3188] sm:text-sm">
            <Icon name="info" size={16} />
            O que observar antes de classificar?
            <Icon name="chevron-down" size={16} className="ml-auto transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 grid list-disc gap-x-6 gap-y-1.5 pl-5 text-xs leading-relaxed text-neutral-700 sm:grid-cols-2 sm:text-[13px]">
            <li>Desgaste nas bordas e nos cantos.</li>
            <li>Arranhões, riscos e marcas superficiais.</li>
            <li>Dobras, vincos e amassados.</li>
            <li>Manchas e alterações na coloração.</li>
            <li>Danos estruturais, como rasgos.</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-neutral-700">
            A escala acima é apenas ilustrativa: avalie a carta inteira e descreva os defeitos com clareza no anúncio.
          </p>
        </details>
      </section>
    </div>
  )
}
