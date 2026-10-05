import { Link } from '@tanstack/react-router'
import { useId, useState, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Dropdown,
  Icon,
  Input,
  ListingCard,
  Logo,
  Modal,
  Navigation,
  NavigationMobile,
  Select,
  type AlertVariant,
  type IconName,
} from '@/components/ui'
import { cn } from '@/components/ui/cn'

const CATEGORIES = [
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'magic', label: 'Magic' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
]

const ACTIONS = [
  { id: 'details', label: 'Ver detalhes' },
  { id: 'collection', label: 'Adicionar à coleção' },
  { id: 'share', label: 'Compartilhar' },
  {
    id: 'delete',
    label: 'Excluir anúncio',
    icon: 'trash' as const,
    tone: 'danger' as const,
  },
]

const ALERTS: Array<{ id: string; variant: AlertVariant; message: string }> = [
  {
    id: 'success',
    variant: 'success',
    message: 'Anúncio publicado com sucesso!',
  },
  {
    id: 'warning',
    variant: 'warning',
    message: 'Este anúncio possui poucas unidades disponíveis.',
  },
  {
    id: 'error',
    variant: 'error',
    message: 'Não foi possível publicar o anúncio.',
  },
  {
    id: 'info',
    variant: 'info',
    message: 'Existem novas cartas disponíveis.',
  },
  {
    id: 'neutral',
    variant: 'neutral',
    message: 'Informação importante sobre a plataforma.',
  },
]

const UI_ICONS: IconName[] = [
  'home',
  'search',
  'user',
  'heart',
  'star',
  'cart',
  'bell',
  'settings',
]

const ICON_SIZES = [16, 20, 24, 32] as const

export function DesignSystemPage() {
  const [favorite, setFavorite] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hiddenAlerts, setHiddenAlerts] = useState<string[]>([])
  const visibleAlerts = ALERTS.filter(
    (alert) => !hiddenAlerts.includes(alert.id),
  )

  return (
    <div className="min-h-svh bg-neutral-100">
      <header className="bg-primary-900 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Logo tone="inverse" />
          </Link>
          <span className="hidden h-8 w-px bg-white/30 sm:block" />
          <h1 className="text-sm font-medium sm:text-base">
            Componentes — Estados: Default e Hover
          </h1>
          <p className="ml-auto hidden items-center gap-2 text-sm text-primary-100 md:flex">
            Colecione · Troque · Conecte
            <Icon name="sparkle" size={16} />
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] items-start gap-4 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <Panel title="Buttons">
          <Columns>
            <Row label="Primary">
              <Specimen>
                <Button>Comprar agora</Button>
              </Specimen>
              <Specimen locked>
                <Button preview="hover">Comprar agora</Button>
              </Specimen>
            </Row>
            <Row label="Secondary">
              <Specimen>
                <Button variant="secondary">Criar anúncio</Button>
              </Specimen>
              <Specimen locked>
                <Button variant="secondary" preview="hover">
                  Criar anúncio
                </Button>
              </Specimen>
            </Row>
            <Row label="Outline">
              <Specimen>
                <Button variant="outline">Ver detalhes</Button>
              </Specimen>
              <Specimen locked>
                <Button variant="outline" preview="hover">
                  Ver detalhes
                </Button>
              </Specimen>
            </Row>
            <Row label="Ghost">
              <Specimen>
                <Button variant="ghost">Cancelar</Button>
              </Specimen>
              <Specimen locked>
                <Button variant="ghost" preview="hover">
                  Cancelar
                </Button>
              </Specimen>
            </Row>
            <Row label="Danger">
              <Specimen>
                <Button variant="danger">Excluir anúncio</Button>
              </Specimen>
              <Specimen locked>
                <Button variant="danger" preview="hover">
                  Excluir anúncio
                </Button>
              </Specimen>
            </Row>
            <Row label="Foco">
              <Specimen locked>
                <Button preview="focus">Comprar agora</Button>
              </Specimen>
              <Specimen locked>
                <Button preview="disabled">Desativado</Button>
              </Specimen>
            </Row>
          </Columns>
        </Panel>

        <Panel title="Inputs">
          <Columns>
            <Row label="Texto">
              <Specimen>
                <Input placeholder="Digite aqui..." />
              </Specimen>
              <Specimen locked>
                <Input placeholder="Digite aqui..." preview="hover" />
              </Specimen>
            </Row>
            <Row label="Search">
              <Specimen>
                <Input variant="search" placeholder="Buscar carta..." />
              </Specimen>
              <Specimen locked>
                <Input
                  variant="search"
                  placeholder="Buscar carta..."
                  preview="hover"
                />
              </Specimen>
            </Row>
            <Row label="Erro">
              <Specimen>
                <Input placeholder="Digite aqui..." invalid />
              </Specimen>
              <Specimen locked>
                <Input placeholder="Digite aqui..." invalid preview="hover" />
              </Specimen>
            </Row>
            <Row label="Disabled">
              <Specimen locked>
                <Input placeholder="Digite aqui..." preview="disabled" />
              </Specimen>
              <Specimen locked>
                <Input placeholder="Digite aqui..." preview="disabled" />
              </Specimen>
            </Row>
            <Row label="Read-only">
              <Specimen locked>
                <Input value="Não editável" preview="readonly" />
              </Specimen>
              <Specimen locked>
                <Input value="Não editável" preview="readonly" />
              </Specimen>
            </Row>
          </Columns>
        </Panel>

        <Panel title="Cards">
          <StateHead />
          <div className="grid grid-cols-2 items-start gap-3">
            <ListingCard
              title="Pikachu - Base Set"
              seller="Loja do Colecionador"
              rating="5.0"
              reviews="124"
              price="R$ 120,00"
              rarity="Rara"
              favorite={favorite}
              onFavorite={() => setFavorite((current) => !current)}
              image={<SampleCardArt />}
            />
            <Specimen locked>
              <ListingCard
                title="Pikachu - Base Set"
                seller="Loja do Colecionador"
                rating="5.0"
                reviews="124"
                price="R$ 120,00"
                rarity="Rara"
                preview="hover"
                image={<SampleCardArt />}
              />
            </Specimen>
          </div>
        </Panel>

        <Panel title="Dropdown">
          <StateHead />
          <div className="grid grid-cols-2 items-start gap-3">
            <Dropdown label="Ações" items={ACTIONS} preview="open" />
            <Specimen locked>
              <Dropdown
                label="Ações"
                items={ACTIONS}
                preview="hover"
                highlightedId="details"
              />
            </Specimen>
          </div>
        </Panel>

        <Panel title="Select">
          <Columns>
            <Row label="Padrão">
              <Specimen>
                <Select
                  options={CATEGORIES}
                  placeholder="Todas as categorias"
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Todas as categorias"
                  preview="hover"
                />
              </Specimen>
            </Row>
            <Row label="Aberto" align="start">
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Selecione..."
                  preview="open"
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Selecione..."
                  preview="open"
                  highlightedValue="pokemon"
                />
              </Specimen>
            </Row>
            <Row label="Com opção">
              <Specimen>
                <Select
                  options={CATEGORIES}
                  defaultValue="pokemon"
                  placeholder="Selecione..."
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  defaultValue="pokemon"
                  preview="hover"
                />
              </Specimen>
            </Row>
            <Row label="Selecionado">
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  defaultValue="pokemon"
                  emphasized
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  defaultValue="pokemon"
                  emphasized
                  preview="hover"
                />
              </Specimen>
            </Row>
            <Row label="Erro">
              <Specimen>
                <Select
                  options={CATEGORIES}
                  placeholder="Selecione..."
                  invalid
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Selecione..."
                  invalid
                  preview="hover"
                />
              </Specimen>
            </Row>
            <Row label="Disabled">
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Todas as categorias"
                  preview="disabled"
                />
              </Specimen>
              <Specimen locked>
                <Select
                  options={CATEGORIES}
                  placeholder="Todas as categorias"
                  preview="disabled"
                />
              </Specimen>
            </Row>
          </Columns>
        </Panel>

        <Panel title="Checkbox">
          <Columns>
            <Row label="Normal">
              <Specimen>
                <Checkbox label="Opção" />
              </Specimen>
              <Specimen locked>
                <Checkbox label="Opção" preview="hover" />
              </Specimen>
            </Row>
            <Row label="Selecionado">
              <Specimen>
                <Checkbox label="Opção" defaultChecked />
              </Specimen>
              <Specimen locked>
                <Checkbox label="Opção" checked preview="hover" />
              </Specimen>
            </Row>
            <Row label="Indeterminado">
              <Specimen>
                <Checkbox label="Opção" indeterminate />
              </Specimen>
              <Specimen locked>
                <Checkbox label="Opção" indeterminate preview="hover" />
              </Specimen>
            </Row>
            <Row label="Disabled">
              <Specimen locked>
                <Checkbox label="Opção" preview="disabled" />
              </Specimen>
              <Specimen locked>
                <Checkbox label="Opção" preview="disabled" />
              </Specimen>
            </Row>
            <Row label="Com foco">
              <Specimen locked>
                <Checkbox label="Opção" preview="focus" />
              </Specimen>
              <Specimen locked>
                <Checkbox label="Opção" checked preview="focus" />
              </Specimen>
            </Row>
          </Columns>
        </Panel>

        <Panel title="Modal">
          <div className="grid items-start gap-4 md:grid-cols-2">
            <div>
              <p className="mb-3 text-center text-xs text-neutral-500">
                Default
              </p>
              <Specimen locked>
                <ConfirmModal />
              </Specimen>
            </div>
            <div>
              <p className="mb-3 text-center text-xs text-neutral-500">Hover</p>
              <Specimen locked>
                <ConfirmModal preview="hover" />
              </Specimen>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => setConfirmOpen(true)}>
              Abrir confirmação
            </Button>
          </div>
        </Panel>

        <Panel title="Navigation">
          <div className="space-y-3">
            <p className="text-center text-xs text-neutral-500">Default</p>
            <Navigation compact />
            <p className="text-center text-xs text-neutral-500">Hover</p>
            <Specimen locked>
              <Navigation compact preview="hover" activeId="pokemon" />
            </Specimen>
          </div>
        </Panel>

        <Panel title="Badges" className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="sale">Venda</Badge>
            <Badge variant="trade">Troca</Badge>
            <Badge variant="both">Venda e troca</Badge>
            <Badge variant="available">Disponível</Badge>
            <Badge variant="sold">Vendido</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="rare">Rara</Badge>
            <Badge variant="foil">Foil</Badge>
            <Badge variant="rare" tone="solid">
              Rara
            </Badge>
            <Badge variant="foil" tone="solid">
              Foil
            </Badge>
          </div>
          <h3 className="mt-6 font-display text-lg font-bold text-neutral-900">
            Ícones
          </h3>
          <div className="mt-4 flex flex-wrap gap-4 text-neutral-700">
            {UI_ICONS.map((name) => (
              <Icon key={name} name={name} size={24} />
            ))}
          </div>
          <div className="mt-4 flex items-end gap-6 text-neutral-500">
            {ICON_SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Icon name="star" size={size} className="text-neutral-700" />
                <span className="text-[10px]">{size}px</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Alert / Feedback">
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.variant}
                onDismiss={() =>
                  setHiddenAlerts((current) => [...current, alert.id])
                }
              >
                {alert.message}
              </Alert>
            ))}
            {visibleAlerts.length === 0 ? (
              <Button variant="ghost" onClick={() => setHiddenAlerts([])}>
                Mostrar alertas
              </Button>
            ) : null}
          </div>
        </Panel>

        <Panel title="Navigation Mobile">
          <NavigationMobile />
        </Panel>
      </main>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar ação"
        secondaryAction={{ label: 'Cancelar' }}
        primaryAction={{
          label: 'Excluir',
          variant: 'danger',
          onClick: () => setConfirmOpen(false),
        }}
      >
        <p>Você tem certeza que deseja excluir este anúncio?</p>
        <p className="text-sm text-neutral-500">
          Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}

function ConfirmModal({ preview }: { preview?: 'hover' }) {
  return (
    <Modal
      open
      embedded
      preview={preview}
      title="Confirmar ação"
      secondaryAction={{ label: 'Cancelar' }}
      primaryAction={{ label: 'Excluir', variant: 'danger' }}
    >
      <p>Você tem certeza que deseja excluir este anúncio?</p>
      <p className="text-sm text-neutral-500">
        Esta ação não pode ser desfeita.
      </p>
    </Modal>
  )
}

function SampleCardArt() {
  const id = useId().replace(/:/g, '')
  const sky = `${id}-sky`
  const ground = `${id}-ground`

  return (
    <svg viewBox="0 0 240 192" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EC5FF" />
          <stop offset="1" stopColor="#F7E7A8" />
        </linearGradient>
        <linearGradient id={ground} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7BC67E" />
          <stop offset="1" stopColor="#3E8F55" />
        </linearGradient>
      </defs>
      <rect width="240" height="192" fill={`url(#${sky})`} />
      <ellipse cx="120" cy="168" rx="120" ry="42" fill={`url(#${ground})`} />
      <circle cx="78" cy="58" r="16" fill="#FFE38A" opacity="0.9" />
      <ellipse cx="118" cy="112" rx="36" ry="30" fill="#F6C445" />
      <ellipse
        cx="92"
        cy="78"
        rx="10"
        ry="16"
        fill="#F6C445"
        transform="rotate(-28 92 78)"
      />
      <ellipse
        cx="146"
        cy="78"
        rx="10"
        ry="16"
        fill="#F6C445"
        transform="rotate(28 146 78)"
      />
      <circle cx="106" cy="108" r="3" fill="#302B40" />
      <circle cx="132" cy="108" r="3" fill="#302B40" />
      <ellipse cx="100" cy="118" rx="5" ry="3" fill="#E07A7A" />
      <ellipse cx="138" cy="118" rx="5" ry="3" fill="#E07A7A" />
      <path
        d="M112 120h16"
        stroke="#302B40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Panel({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-surface border border-neutral-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <h2 className="font-display text-lg font-bold text-neutral-900">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Columns({ children }: { children: ReactNode }) {
  return (
    <div>
      <StateHead />
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function StateHead() {
  return (
    <div className="mb-3 hidden grid-cols-[5.5rem_minmax(13rem,1fr)_minmax(13rem,1fr)] gap-3 text-center text-xs text-neutral-500 sm:grid">
      <span />
      <span>Default</span>
      <span>Hover</span>
    </div>
  )
}

function Row({
  label,
  children,
  align = 'center',
}: {
  label: string
  children: ReactNode
  align?: 'center' | 'start'
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 sm:grid-cols-[5.5rem_minmax(13rem,1fr)_minmax(13rem,1fr)] sm:gap-3',
        align === 'start' ? 'sm:items-start' : 'sm:items-center',
      )}
    >
      <span className="text-xs text-neutral-500">{label}</span>
      {children}
    </div>
  )
}

function Specimen({
  locked = false,
  children,
}: {
  locked?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn('min-w-0', locked && 'pointer-events-none')}
      aria-hidden={locked || undefined}
    >
      {children}
    </div>
  )
}
