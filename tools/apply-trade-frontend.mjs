/** Integra o botão de proposta à página existente sem substituir outros fluxos. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = resolve(process.cwd(), 'frontend/src/pages/MarketplaceAdPage.tsx')
let source = readFileSync(file, 'utf8')

if (source.includes("import { TradeProposalFlow } from '@/components/trade/TradeProposalFlow'")) {
  console.log('Integração já aplicada; nenhum arquivo alterado.')
  process.exit(0)
}

function replaceOnce(before, after, title) {
  if (!source.includes(before)) {
    throw new Error(`Trecho não encontrado (${title}). Sua branch pode ter diferenças. Nenhum arquivo foi salvo.`)
  }
  source = source.replace(before, after)
}

replaceOnce(
  "import { getMarketplaceAd } from '@/services/marketplace'",
  "import { getMarketplaceAd } from '@/services/marketplace'\nimport { TradeProposalFlow } from '@/components/trade/TradeProposalFlow'",
  'import',
)
replaceOnce(
  'subtitle="Confira as informações da carta e adicione ao carrinho."',
  'subtitle="Confira as informações da carta e escolha como negociar."',
  'legenda',
)
replaceOnce(
  '          {ad.saleEnabled ? <PurchasePanel ad={ad} /> : <TradeOnlyNotice />}',
  '          {ad.saleEnabled ? <PurchasePanel ad={ad} /> : null}\n          {ad.tradeEnabled ? <TradeEntry ad={ad} /> : null}',
  'entrada de troca',
)

const begin = source.indexOf('function TradeOnlyNotice() {')
const end = source.indexOf('\nfunction AdSkeleton() {', begin)
if (begin === -1 || end === -1) {
  throw new Error('Função de aviso provisório não encontrada. Nenhum arquivo foi salvo.')
}

const component = `function TradeEntry({ ad }: { ad: MarketplaceAd }) {
  const { user, setLoginNotice } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (ad.ownAd) {
    return ad.saleEnabled ? null : (
      <Alert variant="neutral" title="Este anúncio é seu.">
        Você não pode propor uma troca consigo mesmo.
      </Alert>
    )
  }

  function openTrade() {
    if (!user) {
      setLoginNotice('Entre na sua conta para propor uma troca.')
      navigate({
        to: '/login',
        search: { redirect: '/marketplace/anuncios/' + encodeURIComponent(ad.id) },
      })
      return
    }
    setOpen(true)
  }

  return (
    <div className="mt-4 space-y-3">
      <Button
        className="h-12 w-full"
        icon={<Icon name="share" size={20} />}
        onClick={openTrade}
      >
        {user ? 'Propor troca' : 'Entrar para propor troca'}
      </Button>
      <TradeProposalFlow ad={ad} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
`

source = source.slice(0, begin) + component + source.slice(end)
writeFileSync(file, source, 'utf8')
console.log('MarketplaceAdPage.tsx integrada: CTA de troca e modal de proposta adicionados.')
