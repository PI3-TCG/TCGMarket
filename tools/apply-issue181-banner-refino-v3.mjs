/**
 * TCG Market | Issue #181 | Refinamento V3 de banners
 *
 * Na raiz do repositório:
 *   node ./tools/apply-issue181-banner-refino-v3.mjs --check
 *   node ./tools/apply-issue181-banner-refino-v3.mjs
 *
 * Pré-requisito: integração 4:1 + catálogo da etapa anterior.
 * Não altera imagens, nomes de arquivos, navegação, APIs, modais ou lógica de negócio.
 */
import { readFile, writeFile, copyFile, mkdir, mkdtemp } from 'node:fs/promises'
import { resolve, join, dirname } from 'node:path'
import { tmpdir } from 'node:os'

const repo = process.cwd()
const check = process.argv.includes('--check')

function need(condition, message) {
  if (!condition) throw new Error(message)
}
function once(input, from, to, path) {
  const count = input.split(from).length - 1
  need(count === 1, `${path}: referência esperada 1 vez, encontrada ${count}: ${from.slice(0, 100)}. Nenhum arquivo foi alterado.`)
  return input.replace(from, to)
}

const paths = {
  banner: 'frontend/src/components/layout/PageBanner.tsx',
  home: 'frontend/src/pages/HomePage.tsx',
  profile: 'frontend/src/components/profile/ProfileView.tsx',
  catalog: 'frontend/src/pages/CatalogPage.tsx',
  admin: 'frontend/src/components/admin/AdminLayout.tsx',
}
async function read(path) {
  try { return await readFile(resolve(repo, path), 'utf8') }
  catch (err) { throw new Error(`${path} não encontrado (${err.code}). Rode o script na raiz do repositório TCGMarket.`) }
}

function updatePageBanner(input, path) {
  need(input.includes('md:aspect-[4/1]') && input.includes('imagePosition'), `${path}: aplique primeiro a etapa anterior dos banners 4:1.`)
  // Já aplicado; a verificação completa é feita antes de escrever qualquer coisa.
  if (input.includes('rounded-xl border-2 border-[#FCD203]/70 bg-[#130b30]') && input.includes('w-full object-contain')) return input
  let output = once(input,
    'rounded-xl border border-[#eeeafb] bg-primary-900',
    'rounded-xl border-2 border-[#FCD203]/70 bg-[#130b30]', path)
  output = once(output, 'w-full object-cover"', 'w-full object-contain"', path)
  return output
}

function updateHome(input, path) {
  // Altera somente o primeiro hero que utiliza a imagem importada como `hero`.
  const first = input.indexOf('<section className="relative min-h-[300px] overflow-hidden rounded-lg bg-neutral-900 text-white shadow-lg">')
  if (first === -1) {
    // Retornamos se o padrão V3 inteiro estiver presente, nunca por uma mudança parcial.
    need(input.includes('relative grid overflow-hidden rounded-lg border-2 border-[#FCD203]/70 bg-[#130b30]') &&
      input.includes('col-start-1 row-start-1 block h-auto w-full') &&
      input.includes('xl:row-start-1'),
      `${path}: hero antigo não encontrado e V3 incompleto. Nenhum arquivo foi alterado.`)
    return input
  }
  const end = input.indexOf('</section>', first)
  need(end > first, `${path}: fechamento do hero da Home não encontrado.`)
  let hero = input.slice(first, end + '</section>'.length)
  need(hero.includes('src={hero}') && hero.includes('Mais que cartas'), `${path}: o primeiro hero mudou de estrutura; não vou substituir outro componente.`)

  hero = once(hero,
    '<section className="relative min-h-[300px] overflow-hidden rounded-lg bg-neutral-900 text-white shadow-lg">',
    '<section className="relative grid overflow-hidden rounded-lg border-2 border-[#FCD203]/70 bg-[#130b30] text-white shadow-lg">', path)
  hero = once(hero,
    'className="absolute inset-0 h-full w-full object-cover object-center"',
    'className="pointer-events-none col-start-1 row-start-1 block h-auto w-full min-w-0 self-start"', path)
  hero = once(hero,
    'className="absolute inset-0 bg-linear-to-r from-neutral-900/75 from-0% via-neutral-900/55 via-45% to-transparent to-80%"',
    'className="pointer-events-none col-start-1 row-start-1 hidden bg-linear-to-r from-[#130b30]/85 from-0% via-[#130b30]/55 via-45% to-transparent to-80% xl:block"', path)
  hero = once(hero,
    'className="relative flex min-h-[300px] max-w-xl flex-col justify-center px-6 py-6 sm:px-8 sm:py-8"',
    'className="relative col-start-1 row-start-2 flex max-w-xl flex-col justify-center px-6 py-6 sm:px-8 sm:py-8 xl:row-start-1"', path)
  return input.slice(0, first) + hero + input.slice(end + '</section>'.length)
}

function updateProfile(input, path) {
  const first = input.indexOf('export function ProfileHero(')
  const last = input.indexOf('export function GamesCard(', first)
  need(first !== -1 && last > first, `${path}: função ProfileHero não localizada; nenhum arquivo foi alterado.`)
  let hero = input.slice(first, last)
  need(hero.includes('pageBanners.profile') && hero.includes("md:aspect-[4/1]"), `${path}: integração do banner de perfil 4:1 não encontrada.`)
  if (hero.includes("borderColor: banner ? 'rgba(252, 210, 3, 0.7)'") && hero.includes('object-contain object-center')) return input
  hero = once(hero,
    `<Card className={cn('relative overflow-hidden', banner ? 'md:aspect-[4/1] border-primary-300 bg-primary-900' : 'bg-gradient-to-r from-white via-white to-primary-100')}>`,
    `<Card
      className={cn('relative overflow-hidden', banner ? 'md:aspect-[4/1] border-2 bg-[#130b30]' : 'bg-gradient-to-r from-white via-white to-primary-100')}
      style={{ borderColor: banner ? 'rgba(252, 210, 3, 0.7)' : undefined }}
    >`, path)
  hero = once(hero, 'w-full object-cover object-center"', 'w-full object-contain object-center"', path)
  return input.slice(0, first) + hero + input.slice(last)
}

// Validações de compatibilidade com as etapas anteriores (somente leitura).
const [catalog, admin] = await Promise.all([read(paths.catalog), read(paths.admin)])
need(catalog.includes('<PageBanner') && catalog.includes('gameBanners[game]'),
  'CatalogPage.tsx: catálogo ainda não utiliza PageBanner. Primeiro aplique o pacote de banners 4:1 e catálogo.')
need(admin.includes('<PageBanner') && admin.includes('pageBanners.admin'),
  'AdminLayout.tsx: integração do banner administrativo não encontrada. Primeiro aplique o pacote de banners restantes.')

const transforms = [
  [paths.banner, updatePageBanner],
  [paths.home, updateHome],
  [paths.profile, updateProfile],
]
const changes = []
for (const [path, transform] of transforms) {
  const before = await read(path)
  const after = transform(before, path)
  if (before !== after) changes.push({ path, before, after })
}
console.log(`Issue #181 | Refinamento V3: ${changes.length} arquivo(s) ${check ? 'seriam atualizados' : 'a atualizar'}.`)
for (const item of changes) console.log(' - ' + item.path)
if (check) { console.log('CHECK OK — nenhum arquivo foi alterado.'); process.exit(0) }
if (!changes.length) { console.log('Refinamento V3 já aplicado; nenhuma alteração necessária.'); process.exit(0) }

const backup = await mkdtemp(join(tmpdir(), 'tcgmarket-issue181-banner-refino-v3-'))
for (const item of changes) {
  const copyPath = resolve(backup, item.path)
  await mkdir(dirname(copyPath), { recursive: true })
  await copyFile(resolve(repo, item.path), copyPath)
}
console.log('Backups criados em: ' + backup)
for (const item of changes) await writeFile(resolve(repo, item.path), item.after, 'utf8')
console.log('Refinamento V3 concluído! Execute npm.cmd run build em frontend.')
