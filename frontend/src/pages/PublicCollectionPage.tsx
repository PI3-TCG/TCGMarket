import { PublicCollectionCards } from '@/components/profile/PublicCollectionCards'
import { ProfileShell } from '@/components/profile/ProfileView'
import { useParams } from '@tanstack/react-router'

export function PublicCollectionPage() {
  const { username, collectionId } = useParams({
    from: '/site-layout/jogadores/$username/colecoes/$collectionId',
  })
  return (
    <ProfileShell showBanner={false}>
      <PublicCollectionCards username={username} collectionId={collectionId} />
    </ProfileShell>
  )
}
