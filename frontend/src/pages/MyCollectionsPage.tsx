import { CollectionGallery } from '@/components/collection/CollectionGallery'
import { PageBanner } from '@/components/layout/PageBanner'
import { useSession } from '@/session'

export function MyCollectionsPage() {
  const { user } = useSession()

  return (
    <main className="min-h-screen pb-12 text-text-primary">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 xl:px-[38px]">
        <PageBanner
          title="Minhas Coleções"
          subtitle="Escolha uma coleção para ver e organizar as cartas."
        />
        {user ? <CollectionGallery key={user.id} userId={user.id} /> : null}
      </div>
    </main>
  )
}
