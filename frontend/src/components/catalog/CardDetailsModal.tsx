import { useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { CatalogCard } from '@/types/Catalog'

type Props = { card: CatalogCard | null; onClose: () => void }

export function CardDetailsModal({ card, onClose }: Props) {
  useEffect(() => {
    if (!card) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [card, onClose])

  if (!card) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="card-details-title" className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[0.85fr_1fr]">
        <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="absolute right-4 top-4 z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200">✕</button>
        <div className="flex items-center justify-center bg-gradient-to-br from-primary-100 via-white to-secondary-100 p-8">
          <img src={card.imageUrl} alt={`Carta ${card.name}`} className="max-h-[440px] w-full object-contain drop-shadow-2xl" />
        </div>
        <div className="flex flex-col justify-center gap-5 p-7 md:p-10">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-900">Detalhes da carta</p><h2 id="card-details-title" className="font-display text-3xl font-bold text-neutral-900">{card.name}</h2></div>
          <Badge variant="rare">{card.officialRarity}</Badge>
          <dl className="divide-y divide-neutral-100 text-sm">
            <div className="flex justify-between gap-3 py-3"><dt className="text-neutral-500">Jogo</dt><dd className="font-semibold capitalize text-neutral-900">{card.game}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-neutral-500">Edição</dt><dd className="text-right font-semibold text-neutral-900">{card.edition}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-neutral-500">Número</dt><dd className="font-semibold text-neutral-900">{card.cardNumber}</dd></div>
          </dl>
          <p className="text-xs text-neutral-500">Prévia visual com dados simulados. Informações detalhadas serão conectadas à API interna.</p>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-control bg-primary-900 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">Voltar ao catálogo</button>
        </div>
      </section>
    </div>
  )
}
