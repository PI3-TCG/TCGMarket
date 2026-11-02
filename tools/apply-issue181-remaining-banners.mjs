/** Issue #181 - integra as artes das paginas (nao inclui imagens). */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp } from 'node:fs/promises'

const root = process.cwd()
const check = process.argv.includes('--check')
const IMPORT = "import { pageBanners } from '@/config/pageBanners'\n"

function must(condition, message) {
  if (!condition) throw new Error(message)
}
function replaceOnce(source, oldText, newText, path) {
  const n = source.split(oldText).length - 1
  must(n === 1, `${path}: esperado um trecho único (${oldText.slice(0, 65).replaceAll('\n', ' ')}), encontrado ${n}. Nenhum arquivo foi alterado.`)
  return source.replace(oldText, newText)
}
function withImport(source, path) {
  if (source.includes(IMPORT.trim())) return source
  must(source.includes('import '), `${path}: nao foram encontrados imports TSX.`)
  return IMPORT + source
}
function bannerToPage(source, path, kind) {
  if (source.includes(`image={pageBanners.${kind}}`)) return source
  const count = source.split('<PageBanner').length - 1
  must(count === 1, `${path}: esperado exatamente 1 PageBanner (encontrado ${count}).`)
  const match = source.match(/<PageBanner(?=\s)/)
  must(match, `${path}: não foi possivel encontrar PageBanner.`)
  source = source.replace(/<PageBanner(?=\s)/, `<PageBanner image={pageBanners.${kind}}`)
  return withImport(source, path)
}

function patchAdmin(source, path) {
  if (source.includes('pageBanners.admin')) return source
  const start = source.indexOf('      <header className="flex items-center gap-4 rounded-surface')
  const end = source.indexOf('      </header>', start)
  must(start >= 0 && end > start, `${path}: cabeçalho administrativo mudou. Nada será alterado.`)
  const original = source.slice(start, end + '      </header>'.length)
  const changed = `      {pageBanners.admin ? (\n        <PageBanner\n          title="Área Administrativa"\n          subtitle="Gerencie usuários, o catálogo e o funcionamento do TCG Market."\n          image={pageBanners.admin}\n          symbol="✦"\n        />\n      ) : (\n${original}\n      )}`
  source = source.slice(0, start) + changed + source.slice(end + '      </header>'.length)
  source = withImport(source, path)
  return "import { PageBanner } from '@/components/layout/PageBanner'\n" + source
}

function patchProfile(source, path) {
  if (source.includes('pageBanners.profile')) return source

  // O ProfileView também possui AboutCard com a mesma linha de localização.
  // Modificamos SOMENTE a função ProfileHero, que contém o cabeçalho do perfil.
  const heroStart = source.indexOf('export function ProfileHero(')
  const heroEnd = source.indexOf('export function GamesCard(', heroStart)
  must(heroStart !== -1 && heroEnd > heroStart,
    `${path}: não foi possível identificar os limites do ProfileHero; nenhum arquivo foi alterado.`)
  let hero = source.slice(heroStart, heroEnd)

  hero = replaceOnce(hero,
    "  const location = formatLocation(profile.city, profile.state)",
    "  const banner = pageBanners.profile\n  const location = formatLocation(profile.city, profile.state)", path)
  hero = replaceOnce(hero,
    '<Card className="relative bg-gradient-to-r from-white via-white to-primary-100">',
    `<Card className={cn('relative overflow-hidden', banner ? 'border-primary-300 bg-primary-900' : 'bg-gradient-to-r from-white via-white to-primary-100')}>
      {banner ? (
        <>
          <img src={banner} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#130b30]/90 via-[#280f41]/70 to-[#280f41]/10" />
        </>
      ) : null}`, path)
  hero = replaceOnce(hero,
    '<div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">',
    `<div className={cn('relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7', banner && 'min-h-[220px] lg:min-h-[260px]')}>`, path)
  hero = replaceOnce(hero,
    '<h1 className="font-display text-2xl font-bold break-words text-primary-900 sm:text-3xl">',
    `<h1 className={cn('font-display text-2xl font-bold break-words sm:text-3xl', banner ? 'text-white drop-shadow-sm' : 'text-primary-900')}>`, path)
  hero = replaceOnce(hero,
    '<ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">',
    `<ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm', banner ? 'text-white/90' : 'text-neutral-700')}>`, path)
  hero = replaceOnce(hero,
    '<p className="line-clamp-2 max-w-2xl text-sm text-neutral-700">',
    `<p className={cn('line-clamp-2 max-w-2xl text-sm', banner ? 'text-white/90' : 'text-neutral-700')}>`, path)

  return withImport(source.slice(0, heroStart) + hero + source.slice(heroEnd), path)
}

const targets = [
  ['frontend/src/pages/MarketplacePage.tsx', 'marketplace'],
  ['frontend/src/pages/MarketplaceAdPage.tsx', 'marketplace'],
  ['frontend/src/pages/MyAdsPage.tsx', 'myAds'],
  ['frontend/src/pages/CreateAdPage.tsx', 'createAd'],
  ['frontend/src/pages/CartPage.tsx', 'checkout'],
  ['frontend/src/pages/DeliveryPage.tsx', 'checkout'],
  ['frontend/src/pages/ReviewPage.tsx', 'checkout'],
  ['frontend/src/pages/CheckoutResultPage.tsx', 'checkout'],
  ['frontend/src/pages/TransactionHistoryPage.tsx', 'profile'],
  ['frontend/src/pages/TransactionDetailPage.tsx', 'profile'],
  ['frontend/src/pages/MyTradeProposalsPage.tsx', 'profile'],
  ['frontend/src/components/admin/AdminLayout.tsx', 'admin'],
  ['frontend/src/components/profile/ProfileView.tsx', 'profile'],
]

const changes = []
for (const [path, kind] of targets) {
  const abs = resolve(root, path)
  let before
  try { before = await readFile(abs, 'utf8') }
  catch (e) { throw new Error(`${path}: arquivo não encontrado. Extraia o ZIP na raiz do TCGMarket e rode este comando nessa raiz. (${e.code})`) }
  const after = kind === 'admin' ? patchAdmin(before, path) :
    path.includes('ProfileView.tsx') ? patchProfile(before, path) : bannerToPage(before, path, kind)
  if (after !== before) changes.push({ path, abs, before, after })
}

const bannerPath = resolve(root, 'frontend/src/components/layout/PageBanner.tsx')
const pageBanner = await readFile(bannerPath, 'utf8')
must(pageBanner.includes('image?: string'), 'PageBanner.tsx não tem a prop image; reaplique o ajuste aprovado da Opção B antes desta etapa.')
const configPath = resolve(root, 'frontend/src/config/pageBanners.ts')
let conf = ''
try { conf = await readFile(configPath, 'utf8') } catch { /* arquivo novo: depois de extrair o ZIP deve existir */ }
must(conf.includes('import.meta.glob') && conf.includes('pageBanners'), 'Arquivo frontend/src/config/pageBanners.ts ausente. Extraia TODO o ZIP na raiz do projeto.')

console.log(`Issue #181 | banners restantes: ${changes.length} arquivo(s) ${check ? 'seriam alterados' : 'serão alterados'}.`)
changes.forEach(({ path }) => console.log(' - ' + path))
if (check) {
  console.log('CHECK OK: nenhum arquivo foi modificado. Você pode aplicar sem --check.')
  process.exit(0)
}
if (changes.length === 0) {
  console.log('Tudo integrado! Coloque as artes na pasta frontend/src/assets/images/.')
  process.exit(0)
}
const backupDir = await mkdtemp(join(tmpdir(), 'tcgmarket-181-banners-'))
for (const change of changes) {
  const backup = resolve(backupDir, change.path)
  await mkdir(dirname(backup), { recursive: true })
  await copyFile(change.abs, backup)
}
console.log('Cópias de segurança em: ' + backupDir)
for (const change of changes) await writeFile(change.abs, change.after, 'utf8')
console.log('Integração concluída. Adicione as imagens e execute npm.cmd run build em frontend.')
