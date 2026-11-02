/**
 * TCG Market — Issue #181 — Banners padronizados 4:1.
 * Uso (na raiz): node tools/apply-issue181-banner-4x1.mjs --check
 *                 node tools/apply-issue181-banner-4x1.mjs
 *
 * Nao altera: Home, regras de negocio, modais ou componentes de carrinho.
 * Nao exige que as imagens ja estejam na pasta assets/images.
 */
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp } from 'node:fs/promises'

const root = process.cwd()
const dryRun = process.argv.includes('--check')

function assert(test, msg) {
  if (!test) throw new Error(msg)
}

function replaceUnique(source, before, after, path) {
  const matches = source.split(before).length - 1
  assert(matches === 1, `${path}: esperava um unico trecho de referencia; encontrei ${matches}. Nada foi alterado.`)
  return source.replace(before, after)
}

// Estas imagens sao escolhidas automaticamente pelo Vite se existirem.
// Imagens antigas continuam funcionando enquanto a pessoa substitui as artes.
const bannerConfig = `/** Issue #181: associacao entre paginas e imagens. Sem imports estaticos. */
const images = import.meta.glob<string>(
  '../assets/images/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' },
)

function findBanner(...names: string[]): string | undefined {
  for (const name of names) {
    for (const extension of ['png', 'webp', 'jpg', 'jpeg']) {
      const match = images[\`../assets/images/\${name}.\${extension}\`]
      if (match) return match
    }
  }
  return undefined
}

/** Home e Minha Colecao usam imagens aprovadas diretamente; nao sao alteradas aqui. */
export const pageBanners = {
  marketplace: findBanner('image-ads', 'banner-marketplace'),
  myAds: findBanner('image-myAds', 'banner-meus-anuncios'),
  createAd: findBanner('image-createAds', 'banner-criar-anuncio'),
  profile: findBanner('image-profile', 'banner-perfil'),
  admin: findBanner('image-management', 'banner-administracao'),
  checkout: findBanner('image-checkout', 'banner-checkout'),
} as const
`

function updatePageBanner(source, path) {
  assert(source.includes('image?: string'), `${path}: propriedade image ausente. Mantenha a versao aprovada que ja aceita imagens por pagina.`)
  const headerMatch = source.match(/<header className="([^"]*)">/)
  assert(headerMatch?.[1]?.includes('relative mb-4 flex'), `${path}: nao encontrei o cabecalho padrao; evitando alterar um elemento indevido.`)
  const old = headerMatch[0]
  let classes = headerMatch[1]
  if (classes.includes('md:aspect-[4/1]')) return source
  // Remove apenas as alturas previamente definidas para este componente.
  classes = classes
    .split(/\s+/)
    .filter((part) => !/^(?:sm:|md:|lg:)?min-h-\[\d+px\]$/.test(part))
    .join(' ')
  classes = classes.replace('relative mb-4 flex ', 'relative mb-4 flex min-h-[180px] md:aspect-[4/1] md:min-h-0 ')
  assert(classes.includes('md:aspect-[4/1]'), `${path}: nao consegui aplicar aspect-ratio.`)
  return replaceUnique(source, old, `<header className="${classes}">`, path)
}

function updateCatalog(source, path) {
  if (source.includes('<PageBanner') && source.includes('image={gameBanners[game]}')) return source
  // O catalogo tem um header proprio com imagem e os dados do TCG.
  const header = /<header className="[^\"]*relative mb-4 flex min-h-\[\d+px\][^\"]*">/
  const matches = [...source.matchAll(new RegExp(header.source, 'g'))]
  assert(matches.length === 1, `${path}: cabecalho do catalogo nao encontrado de forma unica (${matches.length}). Nada sera substituido.`)
  const start = matches[0].index
  const end = source.indexOf('</header>', start)
  assert(end > start, `${path}: fechamento de header nao encontrado.`)
  const old = source.slice(start, end + '</header>'.length)
  assert(old.includes('gameBanners[game]') && old.includes('gameName'), `${path}: cabeçalho encontrado nao pertence aos banners do catalogo.`)
  const replacement = `<PageBanner
          title={gameName}
          subtitle={\`Explore todas as cartas de \${gameName}.\`}
          image={gameBanners[game]}
          symbol={game === 'pokemon' ? '◉' : '✦'}
        />`
  let after = source.slice(0, start) + replacement + source.slice(end + '</header>'.length)
  if (!after.includes("import { PageBanner } from '@/components/layout/PageBanner'")) {
    after = "import { PageBanner } from '@/components/layout/PageBanner'\n" + after
  }
  return after
}

function updateProfile(source, path) {
  // O instalador anterior adicionou o banner em ProfileHero.
  // AboutCard tambem possui `const location` — nao procurar essa linha em todo o arquivo.
  const start = source.indexOf('export function ProfileHero(')
  const end = source.indexOf('export function GamesCard(', start)
  assert(start >= 0 && end > start, `${path}: limites de ProfileHero nao identificados.`)
  let hero = source.slice(start, end)
  assert(hero.includes('pageBanners.profile'), `${path}: a integracao do perfil anterior nao foi encontrada; nao vou sobrescrever esse componente.`)
  const currentCard = "banner ? 'border-primary-300 bg-primary-900'"
  const updatedCard = "banner ? 'md:aspect-[4/1] border-primary-300 bg-primary-900'"
  if (!hero.includes(updatedCard)) {
    hero = replaceUnique(hero, currentCard, updatedCard, path)
  }
  const currentBody = "banner && 'min-h-[220px] lg:min-h-[260px]'"
  const updatedBody = "banner && 'min-h-[220px] md:min-h-0 md:h-full'"
  if (!hero.includes(updatedBody)) {
    hero = replaceUnique(hero, currentBody, updatedBody, path)
  }
  return source.slice(0, start) + hero + source.slice(end)
}

const tasks = [
  ['frontend/src/components/layout/PageBanner.tsx', updatePageBanner],
  ['frontend/src/pages/CatalogPage.tsx', updateCatalog],
  ['frontend/src/components/profile/ProfileView.tsx', updateProfile],
  ['frontend/src/config/pageBanners.ts', (_source) => bannerConfig],
]

const changes = []
for (const [path, transformer] of tasks) {
  const abs = resolve(root, path)
  let before
  try { before = await readFile(abs, 'utf8') }
  catch (error) { throw new Error(`${path}: arquivo nao encontrado (${error.code}). Abra a raiz do projeto TCGMarket.`) }
  const after = transformer(before, path)
  if (before !== after) changes.push({ path, abs, after })
}

// Checagens de seguranca: evita transformar um repositorio diferente.
const catalogResult = (await readFile(resolve(root, 'frontend/src/pages/CatalogPage.tsx'), 'utf8'))
assert(catalogResult.includes('gameBanners'), 'Nao encontrei os banners individuais dos TCGs.')

console.log(`Issue #181 | Banners 4:1: ${changes.length} arquivo(s) ${dryRun ? 'seriam atualizados' : 'a atualizar'}.`)
for (const change of changes) console.log(' - ' + change.path)
if (dryRun) {
  console.log('CHECK OK — nenhum arquivo foi modificado.')
  process.exit(0)
}
if (!changes.length) {
  console.log('Tudo ja esta padronizado. Nao houve alteracoes.')
  process.exit(0)
}

const backupRoot = await mkdtemp(join(tmpdir(), 'tcgmarket-issue181-banner-4x1-'))
for (const { path, abs } of changes) {
  const destination = resolve(backupRoot, path)
  await mkdir(dirname(destination), { recursive: true })
  await copyFile(abs, destination)
}
console.log('Backup dos arquivos alterados: ' + backupRoot)
for (const { abs, after } of changes) await writeFile(abs, after, 'utf8')
console.log('Integracao concluida! Rode `npm.cmd run build` na pasta frontend e revise as paginas no navegador.')
