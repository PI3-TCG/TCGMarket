/**
 * TCG Market issue #84 - correcao da integracao de rota e menu.
 * Uso (raiz de TCGMarket): node .\tools\apply-issue84-frontend.mjs
 * Nao substitui paginas ou componentes existentes. Reexecutavel e idempotente.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const routerFile = join(root, 'frontend', 'src', 'router.tsx')
const headerFile = join(root, 'frontend', 'src', 'components', 'layout', 'SiteHeader.tsx')
for (const path of [routerFile, headerFile]) {
  if (!existsSync(path)) throw new Error(`Nao encontrei ${path}. Execute na raiz TCGMarket.`)
}
let router = readFileSync(routerFile, 'utf8')
let header = readFileSync(headerFile, 'utf8')

function insertBeforeUnique(source, anchor, insertion, file) {
  const start = source.indexOf(anchor)
  if (start < 0 || source.indexOf(anchor, start + anchor.length) >= 0) {
    throw new Error(`Nao encontrei ancora unica em ${file}: ${anchor}`)
  }
  return source.slice(0, start) + insertion + source.slice(start)
}

const pageImport = "import { MyTradeProposalsPage } from '@/pages/MyTradeProposalsPage'"
const parserImport = "import { parseTradeProposalsSearch } from '@/components/trade/proposalViewFormat'"
const routeDeclaration = `const myTradeProposalsRoute = createRoute({
  getParentRoute: () => siteLayoutRoute,
  path: '/perfil/propostas',
  validateSearch: parseTradeProposalsSearch,
  component: () => (
    <RequireAuth>
      <MyTradeProposalsPage />
    </RequireAuth>
  ),
})

`

function ensureImport(value) {
  if (router.includes(value)) return
  const marker = 'const rootRoute = createRootRoute({'
  router = insertBeforeUnique(router, marker, value + '\n\n', 'router.tsx')
}
ensureImport(pageImport)
ensureImport(parserImport)

if (!router.includes('const myTradeProposalsRoute = createRoute({')) {
  if (router.includes("path: '/perfil/propostas'")) {
    throw new Error('A rota de propostas ja esta definida com outro nome. Revise router.tsx antes de prosseguir.')
  }
  const anchor = router.includes('const transactionHistoryRoute = createRoute({')
    ? 'const transactionHistoryRoute = createRoute({'
    : 'const routeTree = rootRoute.addChildren(['
  router = insertBeforeUnique(router, anchor, routeDeclaration, 'router.tsx')
}
if (!router.includes('    myTradeProposalsRoute,')) {
  const anchor = router.includes('    transactionHistoryRoute,')
    ? '    transactionHistoryRoute,'
    : '    myAdsRoute,'
  router = insertBeforeUnique(router, anchor, '    myTradeProposalsRoute,\n', 'router.tsx')
}

// A versao anterior exigia uma string com espacos/linhas exatamente iguais.
// Esta procura a ROTA dentro do item, sem depender da indentacao.
if (!header.includes('Minhas propostas')) {
  const navPattern = /navigate\s*\(\s*\{\s*to\s*:\s*(['"])(\/perfil\/historico|\/meus-anuncios)\1/g
  const matches = [...header.matchAll(navPattern)]
  const target = matches.find((match) => match[2] === '/perfil/historico')
    ?? matches.find((match) => match[2] === '/meus-anuncios')

  if (!target || target.index === undefined) {
    throw new Error('Nao encontrei os atalhos de Historico ou Meus anuncios no SiteHeader.tsx. Nenhum arquivo foi alterado.')
  }

  const buttonStart = header.lastIndexOf('<button', target.index)
  const buttonEnd = header.indexOf('</button>', target.index)
  if (buttonStart < 0 || buttonEnd < 0 || buttonEnd - buttonStart > 1400 || !header.slice(buttonStart, buttonEnd).includes(target[0])) {
    throw new Error('O menu usa uma estrutura diferente da esperada. Nenhum arquivo foi alterado.')
  }

  const lineStart = header.lastIndexOf('\n', buttonStart - 1) + 1
  const prefix = header.slice(lineStart, buttonStart)
  if (!/^\s*$/.test(prefix)) {
    throw new Error('Nao consegui determinar a indentacao do item no menu. Nenhum arquivo foi alterado.')
  }
  const navItem = `${prefix}<button
${prefix}  type="button"
${prefix}  onClick={() => {
${prefix}    setMenuOpen(false)
${prefix}    navigate({ to: '/perfil/propostas', search: { direction: 'RECEIVED' } })
${prefix}  }}
${prefix}  className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-primary-100"
${prefix}>
${prefix}  Minhas propostas
${prefix}</button>\n`

  if (target[2] === '/perfil/historico') {
    header = header.slice(0, lineStart) + navItem + header.slice(lineStart)
  } else {
    // Sem Historico, insere o atalho logo depois de Meus anuncios.
    const end = buttonEnd + '</button>'.length
    header = header.slice(0, end) + '\n' + navItem.trimEnd() + header.slice(end)
  }
}

// Evita meia instalacao: valida todas as mudancas antes de gravar qualquer arquivo.
const checks = [
  [router.includes(pageImport), 'Import de MyTradeProposalsPage'],
  [router.includes(parserImport), 'Import de parseTradeProposalsSearch'],
  [router.includes("path: '/perfil/propostas'"), 'Definicao da rota'],
  [router.includes('    myTradeProposalsRoute,'), 'Registro da rota'],
  [header.includes("navigate({ to: '/perfil/propostas'"), 'Atalho Minhas propostas'],
]
for (const [ok, label] of checks) if (!ok) throw new Error(`Validacao falhou: ${label}. Nenhum arquivo alterado.`)

const previousRouter = readFileSync(routerFile, 'utf8')
const previousHeader = readFileSync(headerFile, 'utf8')
if (router !== previousRouter) writeFileSync(routerFile, router, 'utf8')
if (header !== previousHeader) writeFileSync(headerFile, header, 'utf8')
console.log('Issue #84: rota e item Minhas propostas integrados com sucesso.')
console.log('Proximo passo: cd frontend; npm.cmd run build')
