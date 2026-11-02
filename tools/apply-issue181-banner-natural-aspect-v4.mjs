/**
 * TCG Market | Issue #181 | Hotfix V4 — sem faixas laterais.
 *
 * Executar na raiz do repositorio, APOS o refinamento V3:
 *   node ./tools/apply-issue181-banner-natural-aspect-v4.mjs --check
 *   node ./tools/apply-issue181-banner-natural-aspect-v4.mjs
 *
 * A arte define a altura (proporcao intrinseca), sem recorte nem barras.
 * No mobile, o texto fica abaixo da imagem dentro do mesmo banner.
 * Home nao e alterada. Tambem nao toca em CatalogPage, AdminLayout,
 * imagens, regras de negocio, estado das paginas ou modais.
 */
import { readFile, writeFile, mkdir, copyFile, mkdtemp } from 'node:fs/promises'
import { resolve, join, dirname } from 'node:path'
import { tmpdir } from 'node:os'

const root = process.cwd()
const dryRun = process.argv.includes('--check')
const files = {
  banner: 'frontend/src/components/layout/PageBanner.tsx',
  profile: 'frontend/src/components/profile/ProfileView.tsx',
}

function requireCondition(ok, message) {
  if (!ok) throw new Error(message + ' Nenhum arquivo foi alterado.')
}
function replaceExactlyOnce(text, from, to, file) {
  const count = text.split(from).length - 1
  requireCondition(count === 1,
    `${file}: trecho esperado uma vez, encontrado ${count}: ${from.slice(0, 105)}`)
  return text.replace(from, to)
}
async function readRelative(file) {
  try { return await readFile(resolve(root, file), 'utf8') }
  catch (error) {
    throw new Error(`${file} nao encontrado (${error.code}). Execute na raiz do repositorio TCGMarket.`)
  }
}

function transformBanner(source, file) {
  const oldHeader = 'relative mb-4 flex min-h-[180px] md:aspect-[4/1] md:min-h-0 items-center overflow-hidden rounded-xl border-2 border-[#FCD203]/70 bg-[#130b30] px-6 py-5 shadow-sm sm:px-8'
  const newHeader = 'relative mb-4 grid overflow-hidden rounded-xl border-2 border-[#FCD203]/70 bg-[#130b30] shadow-sm'
  const oldImage = 'pointer-events-none absolute inset-0 h-full w-full object-contain'
  const newImage = 'pointer-events-none col-start-1 row-start-1 block h-auto w-full min-w-0'
  const oldBody = 'relative z-10 flex items-center gap-4'
  const newBody = 'relative z-10 col-start-1 row-start-2 flex items-center gap-4 px-6 py-5 sm:row-start-1 sm:px-8'

  // Idempotencia apenas quando os tres componentes do novo layout existem.
  if (source.includes(`className="${newHeader}"`) &&
      source.includes(`className="${newImage}"`) &&
      source.includes(`className="${newBody}"`)) return source

  requireCondition(source.includes('imagePosition') && source.includes('border-[#FCD203]/70'),
    `${file}: esta nao parece ser a versao de PageBanner da etapa V3.`)
  let result = replaceExactlyOnce(source, `className="${oldHeader}"`, `className="${newHeader}"`, file)
  result = replaceExactlyOnce(result, `className="${oldImage}"`, `className="${newImage}"`, file)
  result = replaceExactlyOnce(result, `className="${oldBody}"`, `className="${newBody}"`, file)
  return result
}

function transformProfile(source, file) {
  const start = source.indexOf('export function ProfileHero(')
  const end = source.indexOf('export function GamesCard(', start)
  requireCondition(start >= 0 && end > start, `${file}: nao foi possivel delimitar ProfileHero.`)
  let section = source.slice(start, end)

  const oldCard = "banner ? 'md:aspect-[4/1] border-2 bg-[#130b30]'"
  const newCard = "banner ? 'grid border-2 bg-[#130b30]'"
  const oldImage = 'pointer-events-none absolute inset-0 h-full w-full object-contain object-center'
  const newImage = 'pointer-events-none col-start-1 row-start-1 block h-auto w-full min-w-0'
  const oldBody = "banner && 'min-h-[220px] md:min-h-0 md:h-full'"
  const newBody = "banner && 'col-start-1 row-start-2 md:row-start-1'"

  if (section.includes(newCard) && section.includes(newImage) && section.includes(newBody)) return source
  requireCondition(section.includes('pageBanners.profile') && section.includes('borderColor: banner'),
    `${file}: ProfileHero nao esta na versao V3 esperada.`)
  section = replaceExactlyOnce(section, oldCard, newCard, file)
  section = replaceExactlyOnce(section, oldImage, newImage, file)
  section = replaceExactlyOnce(section, oldBody, newBody, file)
  return source.slice(0, start) + section + source.slice(end)
}

const transforms = [
  [files.banner, transformBanner],
  [files.profile, transformProfile],
]
const changes = []
// Primeiro validamos todos os arquivos; so depois fazemos gravacoes.
for (const [file, transform] of transforms) {
  const before = await readRelative(file)
  const after = transform(before, file)
  if (before !== after) changes.push({ file, before, after })
}
console.log(`Issue #181 | Hotfix de banners V4: ${changes.length} arquivo(s) ${dryRun ? 'seriam atualizados' : 'a atualizar'}.`)
changes.forEach(({file}) => console.log(' - ' + file))
if (dryRun) {
  console.log('CHECK OK — nenhum arquivo foi alterado.')
  process.exit(0)
}
if (!changes.length) {
  console.log('Hotfix V4 ja aplicado; nenhuma alteracao necessaria.')
  process.exit(0)
}
const backupRoot = await mkdtemp(join(tmpdir(), 'tcgmarket-issue181-banner-hotfix-v4-'))
for (const {file} of changes) {
  const copyPath = resolve(backupRoot, file)
  await mkdir(dirname(copyPath), { recursive: true })
  await copyFile(resolve(root, file), copyPath)
}
console.log('Backups em: ' + backupRoot)
for (const {file, after} of changes) {
  await writeFile(resolve(root, file), after, 'utf8')
}
console.log('Hotfix V4 concluido: arte inteira sem barras laterais. Home preservada.')
