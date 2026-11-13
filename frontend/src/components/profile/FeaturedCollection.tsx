import { Link } from '@tanstack/react-router'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMyCollection } from '@/services/collection'
import { useSession } from '@/session'

const loadFeatured = () => getMyCollection({ size: 5 })

export function FeaturedCollection() {
  const { user } = useSession()
  const { state, retry } = useRemoteData(`featured:${user?.id}`, loadFeatured)
  return (
    <Card className="p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-900">
          <Icon name="grid" size={24} />
          Minha coleção
        </h2>
        <Link
          to="/minha-colecao"
          className="text-sm font-semibold text-primary-900 underline"
        >
          Ver minha coleção completa
        </Link>
      </div>
      {state.status === 'loading' ? (
        <p role="status" className="py-8 text-center text-sm text-neutral-500">
          Carregando cartas da sua coleção...
        </p>
      ) : state.status !== 'ready' ? (
        <div role="alert" className="space-y-3 py-5 text-center">
          <p>Não foi possível carregar suas cartas.</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : state.data.content.length === 0 ? (
        <p role="status" className="py-8 text-center text-sm text-neutral-500">
          Sua coleção ainda não tem cartas. Adicione suas primeiras cartas pelo
          catálogo.
        </p>
      ) : (
        <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-5">
          {state.data.content.map((item) => (
            <div key={item.id} className="min-w-0">
              <CatalogCard
                card={item.card}
                footer={
                  <p>
                    {item.quantity} {item.quantity === 1 ? 'cópia' : 'cópias'}
                  </p>
                }
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
