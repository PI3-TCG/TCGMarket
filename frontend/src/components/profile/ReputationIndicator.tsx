import type { ReputationSummary } from '@/types/Review'

export function ReputationIndicator({
  summary,
}: {
  summary?: ReputationSummary | null
}) {
  if (!summary) return <span>Reputação indisponível</span>
  if (summary.average === null)
    return <span>Ainda sem avaliações · 0 avaliações</span>
  return (
    <span>
      <span aria-hidden="true" className="text-rare-700">
        ★{' '}
      </span>
      {summary.average.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}{' '}
      de 5 · {summary.totalReviews}{' '}
      {summary.totalReviews === 1 ? 'avaliação' : 'avaliações'}
    </span>
  )
}
