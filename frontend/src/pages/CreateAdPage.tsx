import { useState } from 'react'
import { useBlocker, useNavigate, useSearch } from '@tanstack/react-router'
import { AdItemSelector } from '@/components/ads/AdItemSelector'
import { CreateAdForm } from '@/components/ads/CreateAdForm'
import { DiscardChangesDialog } from '@/components/ads/DiscardChangesDialog'
import { PageBanner } from '@/components/layout/PageBanner'
import type { CollectionItem } from '@/types/Collection'

export function CreateAdPage() {
  const { item: itemId } = useSearch({ from: '/site-layout/anuncios/novo' })
  const navigate = useNavigate()
  const [choosing, setChoosing] = useState(false)
  const [selectorOpened, setSelectorOpened] = useState(!itemId)
  const [dirty, setDirty] = useState(false)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      dirty && current.pathname !== next.pathname,
    enableBeforeUnload: () => dirty,
    withResolver: true,
  })

  const showSelector = !itemId || choosing

  function openItem(id: string) {
    setDirty(false)
    setChoosing(false)
    setPendingItemId(null)
    void navigate({
      to: '/anuncios/novo',
      search: { item: id },
      replace: true,
    })
  }

  function handleSelect(item: CollectionItem) {
    if (item.id === itemId) {
      setChoosing(false)
    } else if (dirty) {
      setPendingItemId(item.id)
    } else {
      openItem(item.id)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFBFE] pb-12 text-[#171443]">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Criar anúncio"
          subtitle="Defina como você deseja negociar esta carta da sua coleção."
        />

        {(showSelector || selectorOpened) && (
          <div hidden={!showSelector}>
            <AdItemSelector
              onSelect={handleSelect}
              onBackToForm={itemId ? () => setChoosing(false) : undefined}
            />
          </div>
        )}

        {itemId && (
          <div hidden={showSelector}>
            <CreateAdForm
              key={itemId}
              itemId={itemId}
              onChangeCard={() => {
                setChoosing(true)
                setSelectorOpened(true)
              }}
              onDirtyChange={setDirty}
            />
          </div>
        )}
      </div>

      {blocker.status === 'blocked' && (
        <DiscardChangesDialog
          title="Sair sem publicar?"
          description="Os dados preenchidos serão perdidos."
          confirmLabel="Sair sem publicar"
          onContinue={blocker.reset}
          onConfirm={blocker.proceed}
        />
      )}

      {pendingItemId && (
        <DiscardChangesDialog
          title="Trocar de carta?"
          description="Os dados preenchidos para a carta atual serão perdidos."
          confirmLabel="Trocar de carta"
          onContinue={() => setPendingItemId(null)}
          onConfirm={() => openItem(pendingItemId)}
        />
      )}
    </main>
  )
}
