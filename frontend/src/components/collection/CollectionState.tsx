import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/Button'
import { FeedbackState } from '@/components/ui/FeedbackState'
import { Icon } from '@/components/ui/Icon'
import { TradingCardSkeletonGrid } from '@/components/ui/TradingCardSkeletonGrid'
import { tradingCardDetailsButton } from '@/components/ui/tradingCardStyles'

type CollectionStateProps = {
  status: 'loading' | 'empty' | 'error'
  onRetry?: () => void
}

export function CollectionState({ status, onRetry }: CollectionStateProps) {
  if (status === 'loading') {
    return <TradingCardSkeletonGrid label="Carregando sua coleção..." />
  }

  if (status === 'error') {
    return (
      <FeedbackState
        role="alert"
        icon="alert"
        title="Não foi possível carregar sua coleção"
        description="Tente novamente para consultar suas cartas."
      >
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-control border border-brand-primary px-4 text-sm font-semibold text-brand-primary hover:bg-surface-brand-tint focus-visible:outline-2 focus-visible:outline-support-blue">
          <Icon name="home" size={16} />
          Voltar para o início
        </Link>
      </FeedbackState>
    )
  }

  return (
    <FeedbackState
      icon="grid"
      title="Sua coleção está vazia"
      description="Suas cartas aparecerão aqui quando você adicionar o primeiro item à coleção."
    >
      <Link
        to="/catalogo/$game"
        params={{ game: 'pokemon' }}
        className={`${tradingCardDetailsButton} gap-2`}
      >
        <Icon name="search" size={16} />
        Explorar catálogo
      </Link>
    </FeedbackState>
  )
}
