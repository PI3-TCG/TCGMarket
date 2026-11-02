import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { conditionLabels, copies, formatCurrency, gameLabels, languageLabels, parsePrice } from '@/components/ads/adFormat'
import { createTradeProposal, tradeSubmitFailure } from '@/services/tradeProposals'
import type { CollectionItem } from '@/types/Collection'
import type { MarketplaceAd } from '@/types/Marketplace'
import type { CreateTradeProposalRequest, TradeFinancialPayer, TradeProposalResponse } from '@/types/TradeProposal'
import { TradeCollectionPicker } from './TradeCollectionPicker'

type Step = 'compose' | 'picker' | 'review' | 'confirm' | 'discard' | 'success'
type OfferedItem = { item: CollectionItem; quantity: number }
type SendError = { kind: 'rejected' | 'unknown'; message: string }

const surface = 'rounded-xl border border-neutral-200 bg-white p-4 shadow-sm'
const field = 'h-10 w-full rounded-control border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-secondary-500'

function validPositiveQuantity(n: number, maximum: number): boolean {
  return Number.isSafeInteger(n) && n >= 1 && n <= maximum
}

function TradeCardArt({ src, name }: { src: string | null | undefined; name: string }) {
  const [failed, setFailed] = useState(false)
  return src && !failed ? (
    <img src={src} alt="" onError={() => setFailed(true)} className="h-28 w-20 shrink-0 rounded-control object-contain" />
  ) : (
    <div className="flex h-28 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-control bg-neutral-100 text-xs text-neutral-500" role="img" aria-label={`Imagem indisponível: ${name}`}>
      <Icon name="gem" size={24} /><span>Sem imagem</span>
    </div>
  )
}

function QuantityControl({ label, value, max, onChange }: {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
}) {
  const valid = validPositiveQuantity(value, max)
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-neutral-700">{label}</div>
      <div className="flex w-40 items-center rounded-control border border-neutral-300 bg-white">
        <button type="button" aria-label={`Diminuir quantidade de ${label}`} className="grid size-10 place-items-center text-primary-900 disabled:opacity-40" disabled={value <= 1} onClick={() => onChange(value - 1)}><Icon name="minus" size={16} /></button>
        <span className="flex-1 text-center font-semibold text-neutral-900" aria-live="polite">{value}</span>
        <button type="button" aria-label={`Aumentar quantidade de ${label}`} className="grid size-10 place-items-center text-primary-900 disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)}><Icon name="plus" size={16} /></button>
      </div>
      <p className={`mt-1 text-xs ${valid ? 'text-neutral-600' : 'text-error-700'}`}>
        {valid ? `Máximo: ${copies(max)}.` : 'Quantidade inválida. Revise o item antes de enviar.'}
      </p>
    </div>
  )
}

export function TradeProposalFlow({ ad, open, onClose }: {
  ad: MarketplaceAd
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('compose')
  const [beforeDiscard, setBeforeDiscard] = useState<Step>('compose')
  const [offered, setOffered] = useState<OfferedItem[]>([])
  const [requestedQuantity, setRequestedQuantity] = useState(1)
  const [hasAdjustment, setHasAdjustment] = useState(false)
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState<TradeFinancialPayer>('PROPOSER')
  const [busy, setBusy] = useState(false)
  const [sendError, setSendError] = useState<SendError | null>(null)
  const [created, setCreated] = useState<TradeProposalResponse | null>(null)
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID())
  const sending = useRef(false)

  const parsedAmount = hasAdjustment ? parsePrice(amount) : null
  const moneyValid = !hasAdjustment || (parsedAmount !== null && Number.isFinite(parsedAmount) && parsedAmount > 0)
  const offeredValid = offered.length >= 1 && offered.length <= 30 && offered.every(({ item, quantity }) => validPositiveQuantity(quantity, item.quantity))
  const requestedValid = validPositiveQuantity(requestedQuantity, ad.remainingQuantity)
  const canReview = offeredValid && requestedValid && moneyValid
  const distinct = offered.length
  const offeredCopies = offered.reduce((total, selection) => total + selection.quantity, 0)
  const dirty = offered.length > 0 || requestedQuantity !== 1 || hasAdjustment

  function invalidateAttempt() {
    setSendError(null)
    setRequestKey(crypto.randomUUID())
  }

  function resetAndClose() {
    setStep('compose')
    setOffered([])
    setRequestedQuantity(1)
    setHasAdjustment(false)
    setAmount('')
    setPayer('PROPOSER')
    setBusy(false)
    setCreated(null)
    setSendError(null)
    setRequestKey(crypto.randomUUID())
    onClose()
  }

  function requestClose() {
    if (sending.current || busy) return
    if (step === 'success' || !dirty) {
      resetAndClose()
      return
    }
    if (step === 'discard') return
    setBeforeDiscard(step === 'picker' ? 'compose' : step)
    setStep('discard')
  }

  function add(item: CollectionItem) {
    if (offered.some((entry) => entry.item.id === item.id) || offered.length >= 30) return
    setOffered((current) => [...current, { item, quantity: 1 }])
    invalidateAttempt()
  }

  function setOfferedQuantity(id: string, quantity: number) {
    setOffered((current) => current.map((entry) => entry.item.id === id ? { ...entry, quantity } : entry))
    invalidateAttempt()
  }

  function removeOffered(id: string) {
    setOffered((current) => current.filter((entry) => entry.item.id !== id))
    invalidateAttempt()
  }

  function changeRequested(value: number) {
    setRequestedQuantity(value)
    invalidateAttempt()
  }

  function changeAdjustment(enabled: boolean) {
    setHasAdjustment(enabled)
    invalidateAttempt()
  }

  function buildRequest(): CreateTradeProposalRequest {
    return {
      adId: ad.id,
      requestedQuantity,
      offeredItems: offered.map(({ item, quantity }) => ({ collectionItemId: item.id, quantity })),
      financialAdjustment: hasAdjustment && parsedAmount !== null && Number.isFinite(parsedAmount)
        ? { amount: parsedAmount, payer }
        : null,
      requestKey,
    }
  }

  async function submit() {
    if (!canReview || sending.current || busy) return
    sending.current = true
    setBusy(true)
    setSendError(null)
    try {
      const response = await createTradeProposal(buildRequest())
      setCreated(response)
      setStep('success')
    } catch (cause) {
      const failure = tradeSubmitFailure(cause)
      if (failure.kind === 'unknown') {
        setSendError({ kind: 'unknown', message: 'Não foi possível confirmar se a proposta foi registrada. Você pode tentar novamente com a mesma chave de envio, sem duplicar a proposta.' })
      } else {
        setSendError({ kind: 'rejected', message: failure.message })
      }
    } finally {
      sending.current = false
      setBusy(false)
    }
  }

  const titles: Record<Step, string> = {
    compose: 'Montar proposta de troca',
    picker: 'Escolher cartas da coleção',
    review: 'Revisar proposta',
    confirm: 'Confirmar envio da proposta',
    discard: 'Descartar proposta?',
    success: 'Proposta enviada!',
  }

  const subtitles: Record<Step, string> = {
    compose: 'Escolha as cartas que vai oferecer e ajuste as quantidades.',
    picker: 'Selecione quantas cartas diferentes quiser oferecer.',
    review: 'Confira todos os itens antes de confirmar.',
    confirm: 'O envio cria uma proposta pendente; nenhuma carta será transferida.',
    discard: 'As alterações não enviadas serão perdidas.',
    success: 'Sua proposta está aguardando a resposta da outra pessoa.',
  }

  const footer = (
    <>
      {step === 'compose' ? (
        <><Button variant="outline" onClick={requestClose}>Fechar</Button><Button disabled={!canReview} onClick={() => setStep('review')}>Revisar proposta</Button></>
      ) : null}
      {step === 'picker' ? (
        <Button onClick={() => setStep('compose')}>Voltar à proposta ({distinct})</Button>
      ) : null}
      {step === 'review' ? (
        <><Button variant="outline" onClick={() => setStep('compose')}>Editar proposta</Button><Button onClick={() => setStep('confirm')} disabled={!canReview}>Continuar</Button></>
      ) : null}
      {step === 'confirm' ? (
        <><Button variant="outline" onClick={() => setStep('review')} disabled={busy}>Voltar</Button><Button onClick={submit} disabled={busy || !canReview}>{busy ? 'Enviando...' : sendError?.kind === 'unknown' ? 'Tentar novamente com a mesma chave' : 'Confirmar e enviar'}</Button></>
      ) : null}
      {step === 'discard' ? (
        <><Button variant="outline" onClick={() => setStep(beforeDiscard)}>Manter proposta</Button><Button variant="danger" onClick={resetAndClose}>Descartar rascunho</Button></>
      ) : null}
      {step === 'success' ? <Button onClick={() => { resetAndClose(); navigate({ to: '/marketplace', search: { sort: 'recent' } }) }}>Voltar ao Marketplace</Button> : null}
    </>
  )

  return (
    <Modal
      open={open}
      presentation="refined"
      size={step === 'discard' ? 'sm' : step === 'confirm' || step === 'success' ? 'md' : 'lg'}
      title={titles[step]}
      subtitle={subtitles[step]}
      onClose={requestClose}
      closeDisabled={busy}
      footer={footer}
    >
      <div className="space-y-5">
        {step === 'compose' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <section className={surface} aria-labelledby="trade-offer-title">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 id="trade-offer-title" className="font-display text-lg font-bold text-primary-900">Cartas que você oferece</h3>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-900">{distinct} itens · {offeredCopies} exemplares</span>
                </div>
                {offered.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm">
                    <Icon name="gem" size={32} className="mx-auto text-primary-700" />
                    <p className="mt-2 font-semibold text-neutral-900">Nenhuma carta selecionada</p>
                    <p className="mt-1">Adicione cartas da sua coleção para montar a oferta.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {offered.map(({ item, quantity }) => (
                      <li key={item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex gap-3">
                          <TradeCardArt src={item.card.imageUrl} name={item.card.name} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-neutral-900">{item.card.name}</p>
                            <p className="text-xs">{gameLabels[item.card.game] ?? item.card.game} · {item.card.edition}</p>
                            <p className="mt-1 text-xs">{conditionLabels[item.condition]} · {languageLabels[item.language]}</p>
                            <p className="mt-1 text-xs">Na coleção: {copies(item.quantity)}</p>
                          </div>
                          <button type="button" aria-label={`Remover ${item.card.name} da proposta`} className="h-9 rounded-control px-2 text-error-700 hover:bg-error-50 focus-visible:outline-2" onClick={() => removeOffered(item.id)}><Icon name="trash" size={20} /></button>
                        </div>
                        <div className="mt-3"><QuantityControl label={item.card.name} value={quantity} max={item.quantity} onChange={(q) => setOfferedQuantity(item.id, q)} /></div>
                      </li>
                    ))}
                  </ul>
                )}
                <Button className="mt-4 w-full" variant="outline" onClick={() => setStep('picker')} disabled={offered.length >= 30} icon={<Icon name="plus" size={16} />}>Escolher cartas da minha coleção</Button>
                {offered.length >= 30 ? <p className="mt-2 text-xs text-warning-700">Limite de 30 itens por proposta.</p> : null}
              </section>

              <section className={surface} aria-labelledby="trade-request-title">
                <h3 id="trade-request-title" className="font-display mb-3 text-lg font-bold text-primary-900">Cartas que você solicita</h3>
                <div className="flex gap-3 rounded-xl border border-secondary-200 bg-secondary-100/40 p-3">
                  <TradeCardArt src={ad.imageUrl} name={ad.cardName} />
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900">{ad.cardName}</p>
                    <p className="text-xs">{gameLabels[ad.game] ?? ad.game} · {ad.edition}</p>
                    <p className="mt-1 text-xs">{conditionLabels[ad.condition]} · {languageLabels[ad.language]}</p>
                    <p className="mt-1 text-xs">De @{ad.sellerUsername ?? 'vendedor'} · {copies(ad.remainingQuantity)} no anúncio</p>
                  </div>
                </div>
                <div className="mt-4"><QuantityControl label={ad.cardName} value={requestedQuantity} max={ad.remainingQuantity} onChange={changeRequested} /></div>
              </section>
            </div>
            <section className={surface}>
              <label className="flex cursor-pointer items-center gap-3 font-semibold text-neutral-900">
                <input type="checkbox" checked={hasAdjustment} onChange={(event) => changeAdjustment(event.target.checked)} className="size-4 accent-primary-900" />
                Incluir complemento financeiro (opcional)
              </label>
              {hasAdjustment ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="trade-adjustment-amount" className="mb-1 block text-xs font-semibold text-neutral-900">Valor em reais</label>
                    <input id="trade-adjustment-amount" className={field} value={amount} placeholder="Ex.: 25,50" inputMode="decimal" aria-invalid={!moneyValid} aria-describedby="trade-adjustment-hint" onChange={(event) => { setAmount(event.target.value); invalidateAttempt() }} />
                    <p id="trade-adjustment-hint" className={`mt-1 text-xs ${moneyValid ? 'text-neutral-700' : 'text-error-700'}`}>{moneyValid ? 'Até R$ 999.999,99; máximo de duas casas decimais.' : 'Informe um valor positivo válido, com até duas casas decimais.'}</p>
                  </div>
                  <div>
                    <label htmlFor="trade-adjustment-payer" className="mb-1 block text-xs font-semibold text-neutral-900">Quem pagaria?</label>
                    <select id="trade-adjustment-payer" className={field} value={payer} onChange={(event) => { setPayer(event.target.value as TradeFinancialPayer); invalidateAttempt() }}>
                      <option value="PROPOSER">Você (proponente)</option>
                      <option value="RECIPIENT">A outra pessoa (destinatário)</option>
                    </select>
                  </div>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-neutral-700">O valor será apenas registrado nos termos da proposta. Nenhum pagamento é feito neste envio.</p>
            </section>
            {!canReview ? <p className="text-sm text-neutral-700" role="status">Para revisar, selecione ao menos uma carta e informe quantidades válidas.</p> : null}
          </>
        ) : null}

        {step === 'picker' ? <TradeCollectionPicker active={open && step === 'picker'} selectedIds={offered.map(({ item }) => item.id)} onAdd={add} /> : null}

        {step === 'review' || step === 'confirm' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <section className={surface}>
                <h3 className="font-display text-lg font-bold text-primary-900">Você oferece</h3>
                <ul className="mt-3 space-y-3">
                  {offered.map(({ item, quantity }) => <li key={item.id} className="border-b border-neutral-200 pb-3 text-sm"><strong className="text-neutral-900">{item.card.name}</strong><span className="block text-xs">{gameLabels[item.card.game] ?? item.card.game} · {item.card.edition}</span><span className="block text-xs">{conditionLabels[item.condition]} · {languageLabels[item.language]}</span><span className="mt-1 block font-semibold">{copies(quantity)}</span></li>)}
                </ul>
                <p className="mt-3 text-sm font-semibold">{distinct} itens diferentes · {offeredCopies} exemplares</p>
              </section>
              <section className={surface}>
                <h3 className="font-display text-lg font-bold text-primary-900">Você solicita</h3>
                <div className="mt-3 text-sm"><strong className="text-neutral-900">{ad.cardName}</strong><p className="text-xs">{gameLabels[ad.game] ?? ad.game} · {ad.edition}</p><p className="text-xs">{conditionLabels[ad.condition]} · {languageLabels[ad.language]}</p><p className="mt-1 font-semibold">{copies(requestedQuantity)}</p></div>
              </section>
            </div>
            {hasAdjustment && parsedAmount !== null && Number.isFinite(parsedAmount) ? (
              <Alert variant="info" title="Complemento financeiro registrado">{formatCurrency(parsedAmount)} — {payer === 'PROPOSER' ? 'você pagaria' : 'a outra pessoa pagaria'}. Nenhum pagamento será processado agora.</Alert>
            ) : <Alert variant="neutral">Proposta apenas com troca de cartas, sem complemento financeiro.</Alert>}
            {step === 'confirm' ? (
              <Alert variant="warning" title="Envio de proposta, não conclusão de troca">A outra pessoa ainda precisará avaliar sua oferta. Nenhuma carta será transferida, reservada ou bloqueada ao enviar.</Alert>
            ) : null}
            {sendError && step === 'confirm' ? <Alert variant={sendError.kind === 'unknown' ? 'warning' : 'error'} title={sendError.kind === 'unknown' ? 'Resultado do envio não confirmado' : 'Não foi possível enviar a proposta'}>{sendError.message} {sendError.kind === 'rejected' ? 'Seu rascunho foi mantido.' : ''}</Alert> : null}
            {busy ? <div role="status" aria-busy="true" className="flex items-center gap-3 text-sm font-semibold text-primary-900"><span className="size-5 animate-spin rounded-full border-2 border-primary-900 border-t-transparent" />Enviando sua proposta...</div> : null}
          </>
        ) : null}

        {step === 'discard' ? <Alert variant="warning" title="Você ainda não enviou esta proposta">Se descartar, suas cartas e quantidades selecionadas serão removidas deste rascunho.</Alert> : null}

        {step === 'success' && created ? (
          <div className="space-y-4 text-center">
            <Icon name="check-circle" size={32} className="mx-auto text-success-700" />
            <Alert variant="success" title="Proposta enviada com sucesso!">Ela foi registrada e está aguardando a resposta do vendedor.</Alert>
            <div className={`${surface} text-left`}>
              <p className="text-xs font-semibold text-neutral-700">Identificador da proposta</p>
              <p className="mt-1 break-all font-mono text-sm text-neutral-900">{created.id}</p>
              <p className="mt-3 text-sm">Situação: <strong className="text-warning-700">Aguardando resposta (PENDING)</strong></p>
            </div>
            <p className="text-sm">Nenhuma carta foi transferida e nenhum valor foi cobrado.</p>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
