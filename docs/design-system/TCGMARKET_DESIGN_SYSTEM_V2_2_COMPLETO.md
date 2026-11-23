# TCG Market — Design System v2.2 (documentação completa, alinhada ao mockup)

> Versão consolidada de três documentos, para leitura e distribuição em um arquivo só.

> **Revisão 2.2 — o que mudou:** o mockup de referência (`1795384778007_image.png`) é a **especificação visual normativa** (fundo pergaminho, molduras douradas com ornamentos de canto, divisores com losango, ícones dourados). Nesta revisão: (1) **todos os valores de cor foram medidos nos pixels do mockup ou derivados com contraste calculado**, sem pendências; (2) a **fonte dos títulos está decidida**: Crimson Text 700; (3) os **assets foram gerados** e estão em `tcg-assets/` (SVGs, textura, `tokens.css`, `preview.html`); (4) **favoritos, avaliações e contagem de vendas serão implementados** (seção 8A). Legenda: **M** = medido no mockup; **D** = derivado, com contraste calculado.

> Base: GitHub `PI3-TCG/TCGMarket`, branch `main`, consulta de 22/11/2026.


---

<!-- Início: DESIGN_SYSTEM_V2.md -->

# TCG Market — Design System v2

> **Status:** proposta técnica para implementação · **Referência:** mockups da refatoração fantasy commerce · **Base examinada:** `PI3-TCG/TCGMarket`, branch `main`, árvore `e1c7d0f581496fd3b1ecbed0ac91f51c1986605c` (22/11/2026).
>
> **Escopo:** frontend React + TypeScript + Vite + Tailwind CSS v4. Não altera autenticação, serviços, contratos HTTP, rotas nem regras de negócio. O mockup de referência é a **especificação visual normativa**: cores, molduras, tipografia e ornamentos devem corresponder a ele. Ele **não** é evidência de funcionalidades implementadas (ver 1.1, itens 3 e 6).

## 1. Objetivo e diretriz

Unificar a identidade do marketplace, catálogo, coleção, anúncios, compra, perfil, autenticação e administração em um sistema coerente de componentes reutilizáveis.

**Princípio central:** *a fantasia medieval cria a atmosfera; a interface moderna garante a usabilidade.*

- **Prioridade 0 — fidelidade ao mockup:** a tela final deve ser indistinguível do mockup em cores, molduras, tipografia e ornamentos, no mesmo viewport. Acessibilidade ajusta valores (por exemplo, contraste), mas não remove elementos do desenho.
- **Prioridade 1 — clareza:** preços, ações, filtros, estados e conteúdo devem ser compreendidos antes de qualquer detalhe ornamental.
- **Prioridade 2 — consistência:** páginas e componentes compartilham cores semânticas, tipografia, espaçamento, estados e comportamentos.
- **Prioridade 3 — acessibilidade:** contraste verificável, navegação por teclado, rótulos, foco visível e estados comunicados por texto/ícones.
- **Prioridade 4 — manutenção:** preservar APIs atuais quando possível, alterar um componente compartilhado uma vez e reutilizá-lo.
- **Prioridade 5 — atmosfera RPG (fidelidade ao mockup):** pergaminho, molduras douradas com ornamentos de canto, divisores com losango e ícones de linha dourados são parte obrigatória da identidade e entram nos pontos do mapa de ornamentos (seção 2.5). Não decorar controles individuais (botões, inputs, badges).

### 1.1 Decisões de produto que antecedem a refatoração

1. **Marca:** alinhar oficialmente o nome apresentado ao usuário (`TCG Market` ou `TCC Market`); o repositório contém ocorrências de ambas as denominações e `<title>TCC — Trading Card Change</title>`. Este documento usa **TCG Market** como nome provisório.
2. **Jogos disponíveis:** preservar somente Pokémon, Yu-Gi-Oh! e Magic em rotas e vitrines que realmente funcionam. Não introduzir One Piece ou Digimon por causa dos mockups.
3. **Funcionalidades simuladas:** não criar importação de coleção, saldo, estatísticas ou botões funcionais sem suporte real. Preferir ocultar, desabilitar com explicação, ou criar issue separada.
4. **Anúncios em destaque:** a vitrine atual usa ordenação por maior preço; escolher entre renomeá-la de forma honesta ou criar critério verdadeiro de destaque em tarefa funcional separada.
5. **Navbar sticky:** definir se ficará fixa/sticky e validar offset de âncoras, banners e overlays; não assumir que já é fixa.
6. **Favorito, avaliações e vendas (decidido: serão implementados):** coração, estrela com nota e contagem de vendas fazem parte do desenho e viram funcionalidades reais (seção 8A, issues FN-01 a FN-03). Enquanto o backend de cada uma não existir, a UI **não renderiza** o elemento (nada inerte, nada inventado).

## 2. Tokens de design

### 2.1 Paleta oficial proposta

Os tokens abaixo consolidam cores atualmente presentes no projeto. **Não substituir automaticamente cores de raridade, condição ou status** por cor da marca; elas transmitem significados próprios.

| Token semântico | Valor | Uso | Observações |
|---|---|---|---|
| `brand.primary` | `#660366` | CTA principal, links e seleção | Já usado no projeto |
| `brand.primaryHover` | `#4F024F` | Hover e ativo do CTA | Já usado no projeto |
| `brand.deep` | `#310B43` | Navbar, footer, hero, áreas de destaque | Contrasta com branco |
| `surface.canvas` | `#F7E9E0` | Fundo geral (pergaminho) | **M.** Textura de papel sutil por cima; sem halo roxo |
| `surface.default` | `#FAF1E7` | Cards, painéis, formulários, modais | **M.** Creme mais claro que o fundo |
| `surface.input` | `#F9F8F9` | Campos de formulário e selects | **M.** Quase branco sobre painel creme |
| `surface.subtle` | `#ECE1D9` | Chip de condição, hover suave, seleção secundária | **M** |
| `surface.sand` | `#F6E4CC` | Botão secundário sobre o hero | **M** |
| `surface.lavender` | `#E1D0E3` | Chip de filtro ativo | **M** |
| `surface.brandTint` | `#F0E3F0` | Chips e estados selecionados | Manter textos escuros |
| `text.primary` | `#302B40` | Conteúdo principal | Cor já adotada |
| `text.secondary` | `#5F565B` | Subtítulos, metadados | **D.** O mockup usa `#766E72` (4,43:1, reprova AA); este dá 6,33:1 sobre `#FAF1E7` |
| `text.inverse` | `#FFFFFF` | Texto sobre plum escuro | Uso somente com fundo adequado |
| `border.default` | `#E7DDD3` | Borda de cards, itens e formulários | **M.** Bege quente, não cinza |
| `border.emphasis` | `#B98FB9` | Campo ativo e card selecionado | Não substituir foco |
| `accent.gold` | `#E0A100` | Ícones, losangos, estrelas | Swatch do mockup. Contraste 2,03:1 sobre creme: **somente gráfico decorativo**, nunca texto |
| `accent.goldFrame` | `#E9A150` | Filete externo da moldura | **M** (hero e modal) |
| `accent.bronze` | `#B08252` | Filete interno e linhas finas sobre creme | **M** (painel de filtros); 3,05:1 |
| `accent.goldDeep` | `#8A5A12` | Texto ou linha dourada que exija contraste | **D.** 5,29:1 sobre `#FAF1E7` e 4,98:1 sobre `#F7E9E0` |
| `brand.primaryLight` | `#721E78` | Topo do gradiente do botão primário | **M** |
| `brand.primaryDeep` | `#47114F` | Base do gradiente do botão primário | **M** |
| `text.ink` | `#1A1216` | Títulos e nomes de carta | **M.** 15,5:1 sobre o canvas |
| `text.price` | `#3A0A38` | Preços | **M** (aprox.). 14,7:1 |
| `accent.goldSoft` | `#FFF4CC` | Fundo de badge de raridade | Texto deve ser escuro |
| `support.blue` | `#0969D7` | Links de apoio, chips informativos (ex.: raridade Rara) e foco | **Não** é a cor do botão secundário. Evitar `#1688F8` com texto branco pequeno |
| `state.success` | `#15803D` | Confirmação | Usar com ícone/texto |
| `state.warning` | `#B45309` | Alerta | Usar com texto |
| `state.error` | `#B91C1C` | Erro, ação destrutiva | Usar com texto |

> **Contraste:** as combinações finais devem ser medidas segundo WCAG 2.2 AA: **4,5:1** para texto comum; **3:1** para texto grande e elementos gráficos essenciais. Na auditoria do código, `#1688F8` sobre branco apresentou aproximadamente **3,55:1**; `#74788A` sobre branco, **4,38:1**. Ambos merecem correção se usados como texto comum. O contraste deve ser testado no fundo efetivo, incluindo gradientes.
>
> **Fundo pergaminho:** com `surface.canvas` e `surface.default` creme, todos os pares de texto devem ser medidos contra `#F7E9E0` e `#FAF1E7`, não contra branco. Dourado é para linhas e ícones decorativos; texto dourado só com `accent.goldDeep` e contraste medido.

### 2.2 Tipografia

| Papel | Fonte | Peso | Tamanhos de referência (desktop / mobile) | Uso |
|---|---|---|---|---|
| Hero H1 | Cinzel | 700 | `40/48` · `30/38` px | Abertura temática |
| Título de página H1 | Cinzel | 600–700 | `32/40` · `26/34` px | Banners e páginas |
| Seção H2 | Cinzel, maiúsculo | 600–700 | `24/32` · `21/28` px | Separadores editoriais ("Jogos em destaque") com linhas e losango dourados |
| Título de página/item | **Crimson Text**, 700 | 700 | `28/36` · `24/32` px | "Seu carrinho", "Charizard ex" no modal. **Decidido** por medição: proporção largura/altura de "Seu carrinho" = 8,02 contra 8,06 no mockup (Lora 7,88; Liberation Serif 7,76; Gelasio 8,47; Cardo 7,04). Google Fonts, pesos 600 e 700. O Cinzel não tem minúsculas e não reproduz esses títulos |
| Subtítulo H3 | Plus Jakarta Sans | 700 | `20/28` · `18/26` px | Blocos e cards |
| Corpo | Plus Jakarta Sans | 400–500 | `16/24` px | Conteúdo e descrições |
| Controles | Plus Jakarta Sans | 500–700 | `14–16/20–24` px | Botões, filtros, navegação |
| Apoio | Plus Jakarta Sans | 400–600 | `14/20` px | Metadados legíveis |
| Legenda | Plus Jakarta Sans | 500 | `12/16` px | Informações não essenciais |
| Preço | Plus Jakarta Sans, 700; Cinzel pontual | 700 | `20–24/28–32` px | O preço deve priorizar leitura |

**Regras:**

- Cinzel serve a títulos, ornamentação e alguns números grandes, **não a textos longos, filtros ou todos os títulos de cartas**.
- `uppercase` só nos títulos em Cinzel (hero, banners, separadores de seção). Nomes de cartas, descrições e navegação ficam em caixa normal.
- Preços em Plus Jakarta Sans, negrito, cor `brand.primary`, como no mockup.
- Cards usam limite de 2 linhas no título quando couber, sem ocultar informação crítica; nomes completos disponíveis na página de detalhe.
- Não usar Arial em navbar/footer: `frontend/src/components/layout/siteChrome.css` deve herdar `var(--font-sans)`.
- Respeitar zoom de 200% e fonte ampliada sem corte de conteúdo.

### 2.3 Espaçamento e dimensões

**Escala:** `4, 8, 12, 16, 24, 32, 48, 64` px. Usar as classes Tailwind correspondentes sempre que possível.

| Item | Valor de referência |
|---|---|
| Botões e controles | `40px` no desktop; área acionável de no mínimo `44×44px` em ações de toque |
| Intervalo entre campos | `12–16px` |
| Espaço entre cards | `16–24px` |
| Distância entre seções | `32–48px` mobile, `48–64px` desktop |
| Padding interno de card | `16px` (densos: `12px`) |
| Padding de painel | `16–24px` |
| Gutter da página | `16px` mobile, `24px` tablet, `32–38px` desktop |
| Largura ampla | `1600px` para Home, Catálogo, Marketplace, Coleção e Anúncios |
| Largura de leitura/transação | `1400px` para detalhes, carrinho, checkout e perfil, se fizer sentido |
| Largura admin | `1600px` como referência, sem forçar painel a espremê-lo |
| Coluna de filtros desktop | `240–264px` com conteúdo restante fluido |

**Responsividade-alvo:** verificar **320, 390, 768, 1024, 1440 e 1600px**; não criar breakpoint só para uma captura de tela. Utilizar media queries apenas onde o conteúdo realmente exige mudança.

### 2.4 Bordas, raios, sombras e movimento

| Token | Valor | Uso |
|---|---|---|
| `radius.control` | `8px` | Inputs, selects, botões |
| `radius.card` | `12px` | Cards e painéis |
| `radius.banner` | `16px` | Hero e arte em destaque |
| `radius.modal` | `16px` | Diálogos (mais discreto que modais excessivamente arredondados) |
| `border.default` | `1px solid` | Cards, input e painel |
| `shadow.sm` | `0 1px 3px rgb(48 43 64 / .08)` | Superfície estática |
| `shadow.md` | `0 4px 12px rgb(48 43 64 / .10)` | Hover de card e popover |
| `shadow.lg` | `0 12px 32px rgb(48 43 64 / .16)` | Modal e menu flutuante |
| `motion.fast` | `150ms` | Hover e foco |
| `motion.normal` | `200ms` | Abrir/fechar painéis |

- Preferir `transition-colors`, `transition-shadow` e `transform` somente quando necessários.
- `prefers-reduced-motion: reduce` deve retirar animações e transformações dispensáveis.
- Evitar `hover:-translate-y-*` em todo elemento clicável. Efeito de elevação é melhor nos cards.
- Moldura dourada com ornamentos de canto **somente nos pontos do mapa de ornamentos (2.5)**. Cards de produto, itens de carrinho e formulários usam borda bege `border.default`, raio de 12px e sombra suave, como no mockup.

### 2.5 Molduras, ornamentos e fundo

O visual do mockup é **concentrado**: poucos elementos recebem ornamento rico e o resto é limpo. Isso mantém o clima de loja de RPG sem pesar.

**Níveis de intensidade**

- **Nível 0 — funcional:** botões, inputs, selects, badges, chips, tabelas e listas. Sem ornamento próprio.
- **Nível 1 — superfície temática:** cards de produto, itens de carrinho, formulários. Fundo creme, borda bege fina, sem dourado.
- **Nível 2 — moldura:** `GoldFrame`, com filete dourado, segundo filete interno e **ornamentos de canto**. Só nos pontos do mapa abaixo.
- **Divisores:** `SectionTitle` e `OrnamentDivider`, com linhas e losango dourados.

**Mapa de ornamentos**

| Elemento | Tratamento | Origem |
|---|---|---|
| Header | Fundo `brand.deep`, filete dourado fino na base, logo dourada, busca creme arredondada | Mockup |
| Hero da Home | Ilustração com gradiente plum à esquerda, moldura dourada fina arredondada, título Cinzel maiúsculo | Mockup |
| Banner interno | Ilustração com overlay, breadcrumb acima do H1, H1 Cinzel maiúsculo branco | Mockup |
| Faixa de valores (Home) | 4 itens com ícone de linha dourado, rótulo em negrito e subtítulo | Mockup |
| Título de seção | Cinzel maiúsculo com linha e losango dourados nos dois lados | Mockup |
| Painel de filtros | `GoldFrame` com cantos | Mockup |
| Card de produto | Borda bege, sem dourado | Mockup |
| Modal de detalhe | Overlay plum escuro e `GoldFrame` duplo com cantos | Mockup |
| Painel de resumo do pedido | Moldura dourada simples (*confirmar na arte*) | Mockup |
| Carrinho e formulário de entrega | Borda bege | Mockup |
| Stepper de checkout | Círculos numerados; concluído com check, atual em plum cheio, futuros só contorno | Mockup |
| Tab bar mobile | Fundo plum, ícone ativo dourado | Mockup |

**Fundo e texturas**

- Fundo geral `surface.canvas` (pergaminho) com textura de papel sutil. Sem halo roxo e sem `page-vignette` de bordas escuras.
- Imagens de banner usam overlay para preservar legibilidade, `object-fit: cover`, `object-position` configurável e altura adaptativa ao texto. Sem `-webkit-text-stroke`.

**Receitas.** O código está em `tcg-assets/tokens.css` (`.frame-gold`, `.ornament-line`, `.btn-primary`, fundo do `body`). Resumo do `.frame-gold`: borda 1px `accent.goldFrame`, segundo filete interno 1px `accent.bronze` a 4px, raio 12px, sombra `0 6px 18px rgb(49 11 67 / .10)` e quatro cantos de 36px aplicados em `::after`.

```tsx
// components/ui/GoldFrame.tsx
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/components/ui/cn'

export function GoldFrame({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={cn('frame-gold', className)} />
}

// components/ui/SectionTitle.tsx
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden className="ornament-line" />
      <h2 className="font-display text-2xl uppercase tracking-wide text-brand-primary">{children}</h2>
      <span aria-hidden className="ornament-line is-right" />
    </div>
  )
}
```

**Assets (entregues em `tcg-assets/`; conferir no `preview.html`)**

| Asset | Status | Arquivo |
|---|---|---|
| Textura de pergaminho | **Entregue** (tileável, ~1 KB) | `textures/parchment.webp` |
| Cantos da moldura (4) | **Entregue** | `ornaments/corner-{tl,tr,bl,br}.svg` |
| Divisor com losango, linhas de título, losango | **Entregue** | `ornaments/divider.svg`, `ornament-line-{left,right}.svg`, `diamond.svg` |
| Ícones de traço (26 + versões preenchidas de coração e estrela) | **Entregue** | `icons/line/` (currentColor) e `icons/gold/` |
| Ícones da faixa de valores (4, com anel duplo) | **Entregue** | `icons/value/` |
| Logo dourada | **Reutilizar** a do repositório | — |
| Ilustrações de hero e banners | **Pendente**: arte raster; prompts em `ILLUSTRATION_PROMPTS.md` | — |
| Artes dos cards de jogos (Magic, Pokémon, Yu-Gi-Oh!) | **Pendente**: usar artes licenciadas | — |

Os ícones `line` usam `currentColor`: importar como componente (SVGR) ou aplicar via `mask-image`; em `<img>` eles ficam pretos.

### 2.6 Tokens no Tailwind CSS v4

A **fonte única dos valores** é `tcg-assets/tokens.css`: copiar o bloco `@theme` para `frontend/src/index.css`, estendendo o que já existe, e manter os nomes atuais (`primary-*`, `secondary-*`, `neutral-*`) como aliases durante a migração. Não duplicar os valores neste documento nem em um `tokens.ts`.

| Grupo | Tokens (todos definidos em `tokens.css`) |
|---|---|
| Fontes | `--font-sans` (Plus Jakarta Sans), `--font-display` (Cinzel), `--font-title` (Crimson Text) |
| Marca | `brand-primary`, `brand-primary-light`, `brand-primary-deep`, `brand-deep` |
| Superfícies | `surface-canvas`, `surface-default`, `surface-input`, `surface-subtle`, `surface-sand`, `surface-lavender` |
| Texto e borda | `text-ink`, `text-secondary`, `text-price`, `border-default` |
| Ouro | `accent-gold`, `accent-gold-frame`, `accent-bronze`, `accent-gold-deep` |
| Status e chips | `support-blue`, `chip-rare-bg/text`, `chip-mythic-bg`, `danger`, `danger-soft-bg/text` |
| Forma | `radius-card` (12px), `radius-banner` (16px), `radius-modal` (16px) |

**Chips ajustados para AA:** o mockup mostra a Mítica em `#A35DDD` com texto claro (4,06:1). Foi usado `#9348D1` com branco (5,14:1). A Rara usa `#74AFEF` com texto `#0B2F5E` (5,72:1), em vez do azul-escuro medido (4,40:1).

## 3. Layout e grade

### 3.1 Estruturas oficiais

| Layout | Aplicação | Estrutura |
|---|---|---|
| `site` | Home e páginas públicas | Header, conteúdo, footer |
| `listing` | Marketplace, Catálogo, Coleção, Meus Anúncios | Banner → filtros + resultados → paginação |
| `transaction` | Carrinho, entrega, revisão e detalhes | Conteúdo principal + resumo/ações |
| `admin` | Dashboard e gestão | Sidebar, título, indicadores e painéis |
| `auth` | Login e cadastro | Ilustração opcional + formulário legível |

**Containers:** usar um `PageContainer` reutilizável, com variante `wide | reading | admin`, sem alterar rotas. Criar `PageSection` somente se resolver repetição real de cabeçalho/spacing entre páginas (ver roteiro).

### 3.2 Header e footer

- Header em plum escuro (`brand.deep`) com filete dourado fino na base: logo dourada à esquerda, navegação (item ativo com sublinhado dourado), busca creme arredondada com lupa, e à direita carrinho com contador dourado, sino e avatar com anel dourado.
- A navegação mobile não deve consumir `~210px` de altura como ocorre na configuração atual de largura pequena; compactar menu, busca e ações.
- Mobile, como no mockup: header compacto (marca, carrinho, menu), busca em linha própria e **tab bar inferior** em plum com Início, Explorar, Carrinho, Coleção e Perfil, ícone ativo dourado.
- Usar `position: sticky` **somente se aprovado** e com compensação de `scroll-margin-top` e teste de overlays.
- Foco de navegação deve ser contrastante sobre plum, evitando outline roxo escuro no escuro.
- Footer possui conteúdo institucional mínimo; redes sociais devem ser `<a>` com URL real, ou ficar ocultas até sua publicação.
- Não trocar a identidade atual por múltiplos logos diferentes entre navbar, rodapé e login.

### 3.3 Home

Ordem pretendida: `Header` → hero → categorias dos três TCGs disponíveis → anúncios (máximo **8**, grade desktop **4×2**) → **Como funciona** → **Guia de condição** → footer. A ordem informativa permanece conforme a decisão de produto vigente.

**Estrutura visual conforme o mockup:** o hero tem moldura dourada, ilustração e gradiente plum à esquerda, título em Cinzel maiúsculo, subtítulo em sans e dois botões (primário plum com borda dourada e secundário creme). Logo abaixo vem a **faixa de valores** com quatro itens estáticos (Compra segura, Amplo catálogo, Comunidade ativa, Gestão da coleção), sem números ou métricas. Em seguida, `SectionTitle` "Jogos em destaque", link "Ver todos os jogos →" à direita e três cards de jogo com arte e moldura escura.

O nome “Anúncios em destaque” só deve permanecer se a seleção realmente tiver critério de destaque; ordenar por preço decrescente não é a mesma coisa. Não adicionar métricas sem fonte de dados.

### 3.4 Listagens e cards

- **Visual do card (mockup):** fundo `surface.default`, borda `border.default`, raio 12px; imagem da carta com moldura clara e coração no canto superior direito (renderizado só com FN-01 ativo; ver 8A); nome em negrito; "jogo • edição" em texto secundário; linha de chips com raridade à esquerda e condição à direita; divisor fino; preço em plum negrito à esquerda e botão quadrado plum com ícone de carrinho à direita.
- Priorizar **cartas verticais**, com recipiente visual próximo de `aspect-ratio: 5/7`, imagem `object-fit: contain`, sem distorcer arte.
- Card genérico: imagem, nome, jogo/edição, badges, preço **quando aplicável**, ação principal e ações secundárias.
- Diferenças reais de negócio ficam em componentes especializados (`CatalogCard`, `MarketplaceAdCard`, `CollectionItemCard`), que compartilham apenas **estilo/estrutura**, não uma única interface gigantesca.
- Catálogo não deve fingir preço/anúncio quando ainda não houver oferta; coleção não deve exibir valor inventado.
- Desktop: até quatro colunas quando houver espaço; tablet: duas ou três; mobile: uma ou duas conforme legibilidade.
- Ações secundárias cabem em menus acessíveis, sem `...` sem nome acessível.

### 3.5 Filtros e busca

- Reutilizar `components/ui/ResponsiveFilters.tsx`, hoje empregado em Catálogo/Marketplace; aplicá-lo também na Coleção quando a estrutura comportar.
- Chips devem representar filtros aplicados, permitir remoção individual e mostrar ação “Limpar todos” somente quando houver filtros.
- O padrão visual deve ser o mesmo; o **estado e a lógica de filtros ficam sob responsabilidade de cada página/módulo**.
- No mobile, o filtro pode começar como painel recolhível e evoluir para drawer **somente se o componente base centralizar acessibilidade e foco**.
- Campo com label, hint e erro; não usar somente placeholder como identificação.
- **Visual (mockup):** painel em `GoldFrame`; cabeçalho com ícone de funil, "Filtros" e "Limpar tudo" sublinhado; seções colapsáveis (Jogo, Edição, Raridade, Condição) com chevron e contagem à direita; botão plum de largura total "Aplicar filtros" no rodapé do painel.
- **Cabeçalho dos resultados:** "N anúncios encontrados", select "Ordenar por" e alternância grade/lista (ativo em plum). Abaixo, chips lavanda com × e "Limpar filtros".

### 3.6 Modais

- `components/ui/Modal.tsx` é a base de comportamento (portal, foco, Escape, rolagem). Não copiar essa lógica em cada modal especializado.
- Padronizar overlay, título, corpo, ações, rolagem e tamanhos.
- **Visual do modal de detalhe (mockup):** overlay plum escuro, `GoldFrame` duplo com ornamentos de canto, corpo `surface.default`, botão fechar (×) no canto superior direito, título em serifa, chips de raridade e condição, bloco de preço com quantidade e botão plum largo.
- **Manter `presentation="classic" | "refined"` durante a migração**, em vez de quebrar consumidores. Renomear API só em migração posterior, se necessária.
- Não implementar modal sobre modal; detalhes do catálogo seguem página, detalhes da coleção podem seguir modal.
- Modal destrutivo precisa de mensagem objetiva e ação claramente identificada.

### 3.7 Administração

- O mockup não cobre o admin: usar a mesma paleta, tipografia e superfícies creme, **sem** molduras douradas nem ornamentos nos painéis de dados. Sidebar plum sem excesso de brilho.
- Dashboard com cards KPI, atividade por período, distribuição por TCG e listas/tabelas, **somente com dados reais**.
- Falha de um widget não bloqueia os outros; estados de loading/vazio/erro independentes.
- Sidebar ativa, tabelas e filtros precisam compartilhar estados de foco/hover com o resto do site.
- Evitar centenas de hexadecimais locais em `../../../../Downloads/AdminOverviewPage.tsx`; centralizar cores e recipes reutilizadas.

## 4. Componentes e responsabilidades

| Componente | Responsabilidade | Não deve fazer |
|---|---|---|
| `Button` | Variantes, tamanhos, loading, foco e estados | Consultar API ou navegar sozinho |
| `Input`, `Select`, `Dropdown` | Entrada e acessibilidade | Transformar filtros em requisições HTTP |
| `Badge` | Exibir significado semântico | Definir regras de raridade/condição |
| `Card` | Superfície e estilo compartilhado | Impor layout de todos os tipos de anúncio |
| `PageBanner` | Cabeçalho editorial e arte | Escolher regras de negócio da página |
| `PageContainer` (novo) | Larguras e gutters consistentes | Conhecer rotas ou usuários |
| `ResponsiveFilters` | Comportamento de exibição em breakpoints | Guardar estado de filtro de cada domínio |
| `Modal` | Acessibilidade e estrutura de diálogo | Implementar regras de coleção/checkout |
| `AdminPanel` | Estrutura de painel administrativo | Fazer requisições ou cálculos do dashboard |

## 5. Acessibilidade e conteúdo

1. **WCAG 2.2 AA:** texto, componentes e foco. Contraste medido em contexto real.
2. **Navegação por teclado:** ordem lógica de Tab, Enter/Espaço, Escape; setas nos componentes de lista quando aplicável.
3. **Formulários:** `label` associado, `aria-invalid`, `aria-describedby` para erro/dica e feedback no momento adequado.
4. **Modal:** foco inicial adequado, foco contido durante abertura, Escape salvo bloqueio justificado, devolução de foco ao fechar.
5. **Feedback:** loading, vazio, erro e sucesso devem ter mensagem textual; cor nunca é o único canal.
6. **Ícones:** decorativos com `aria-hidden`, ações com nome acessível descritivo.
7. **Toque:** área-alvo operacional de no mínimo `44×44px` sempre que viável.
8. **Movimento:** honrar `prefers-reduced-motion` e evitar animações que causem distração.
9. **Zoom/overflow:** revisar 200% de zoom, 320px, teclado virtual e alturas curtas.
10. **Arte:** usar `alt=""` em imagem decorativa; texto alternativo significativo onde a imagem comunica informação.

## 6. Estados visuais obrigatórios

Cada componente relevante precisa prever: **default, hover, focus-visible, active/selected, disabled, loading, error, empty** (quando aplicável). O foco visível não pode depender apenas de `:focus` se a interação exigir `:focus-visible`.

## 7. Estratégia de migração

- **Sem reescrita total:** preservar `Button`, `Card`, `Modal`, `Select`, `Badge`, `ResponsiveFilters`, `AdminPanel` e adaptar as classes/tokens.
- **Sem troca prematura de API:** usar compatibilidade temporária; só remover aliases após busca de consumidores.
- **Sem novo arquivo CSS por componente:** `index.css` concentra tokens/utilitários globais; `siteChrome.css` permanece para o chrome complexo até eventual simplificação planejada.
- **Sem regras de negócio no design system:** frontend de apresentação consome dados/props dos módulos existentes.
- **Sem misturar escopo:** favoritos, avaliações e vendas são issues próprias (FN-01 a FN-03, seção 8A) e não entram nas tarefas de refatoração visual; featured real e importação continuam fora.

## 8A. Favoritos, avaliações e contagem de vendas (novas funcionalidades)

O mockup mostra três elementos que ainda não existem no produto: coração de favorito, nota em estrelas do vendedor e contagem de vendas. Decisão: **serão implementados**. Cada um é uma issue funcional independente da refatoração visual e deve seguir as regras abaixo. Os contratos de API são sugestões para validar com o time de backend.

**Regra geral:** a UI de cada elemento só é renderizada quando o dado real existe. Nada de estrela com 0, nada de "0 vendas" como se fosse reputação, nada de coração que não grava.

| Issue | Funcionalidade | Backend (sugestão) | Onde aparece |
|---|---|---|---|
| **FN-01** | Favoritos | Favoritar **anúncio** por usuário: `POST /favorites/{adId}`, `DELETE /favorites/{adId}`, `GET /favorites`; campo `isFavorite` nas listagens. *Decisão pendente: favoritar anúncio (como no mockup) ou carta do catálogo.* | Coração no card de marketplace; botão "Favoritar" no modal e na página de detalhe; página "Meus favoritos" |
| **FN-02** | Avaliações do vendedor | Avaliação (1 a 5) criada pelo comprador **após pedido concluído**, uma por pedido; agregados `ratingAverage` (1 casa decimal) e `ratingCount` por vendedor | Linha "★ 4,9" junto do nome do vendedor no detalhe do anúncio e no perfil do vendedor |
| **FN-03** | Contagem de vendas | `completedSalesCount` por vendedor, calculado no servidor a partir de pedidos concluídos | "(243 vendas)" ao lado da nota; perfil do vendedor |

**Regras de UI**

- **Favorito:** botão com `aria-pressed`, `aria-label` "Favoritar {nome}" / "Remover {nome} dos favoritos", ícone `heart` (inativo) e `heart-filled` (ativo), alvo de 44×44px. Atualização otimista com reversão em caso de erro. Sem login, abre o fluxo de login em vez de falhar em silêncio. O botão **não** fica dentro de um `<a>`: posicionar sobre o card como elemento irmão do link.
- **Nota e vendas:** formato pt-BR (`4,9`), estrela `star-filled` dourada com o número em texto ao lado (o número carrega a informação, a cor não). Rótulo acessível único no conjunto: `aria-label="Nota 4,9 de 5, 243 vendas"`, com a estrela `aria-hidden`.
- **Sem dados:** vendedor sem avaliações mostra "Sem avaliações ainda", sem estrela. Vendedor sem vendas concluídas não exibe a contagem.
- **Carregamento e erro:** skeleton do tamanho da linha; em erro, omitir a linha em vez de mostrar valor falso.
- **Cache e consistência:** a nota e a contagem vêm do servidor; o front não calcula médias.

**Ordem de entrega por issue:** contrato de API e testes de backend → componente de UI atrás de feature flag → integração nos cards e no detalhe → remover a flag.

**Aceite:** fluxo completo testado com e sem login; estados vazio, carregando e erro cobertos; leitor de tela anuncia o estado do favorito e a nota; nenhum valor fixo no código.

## 8. Critérios para aprovação da v2

- [ ] Cores e tipografia partem de tokens compartilhados; nenhum novo hex arbitrário sem justificativa.
- [ ] Header, footer e banners consistentes no desktop/mobile; navegação por teclado funciona.
- [ ] Cards de catálogo, anúncio e coleção parecem da mesma família sem perder ações próprias.
- [ ] Filtros em Catálogo, Marketplace, Coleção e Meus Anúncios seguem a mesma estrutura visual.
- [ ] Todos os modais relevantes compartilham base comportamental, foco e overlay.
- [ ] Páginas transacionais e administrativas usam containers e superfícies coerentes.
- [ ] Vitrines e dados exibidos não prometem funcionalidades não implementadas.
- [ ] Fluxos existentes e permissões continuam funcionando; build e testes passam.
- [ ] Acessibilidade e responsividade validadas nos seis tamanhos-alvo.
- [ ] **Fidelidade:** capturas lado a lado com o mockup (mesmo viewport) para Home, Marketplace, Detalhe, Carrinho, Entrega e Mobile, aprovadas por quem criou a arte.
- [ ] Fundo pergaminho, molduras com cantos, divisores e ícones dourados presentes nos pontos do mapa 2.5, e **ausentes** nos demais.

---

**Leitura complementar:** [`../../../../Downloads/COMPONENT_PATTERNS_V2.md`](../../../../Downloads/COMPONENT_PATTERNS_V2.md) detalha estados e contratos; [`../../../../Downloads/IMPLEMENTATION_ROADMAP_V2.md`](../../../../Downloads/IMPLEMENTATION_ROADMAP_V2.md) contém alterações por arquivo e a ordem de execução.


<!-- Fim: DESIGN_SYSTEM_V2.md -->


---

<!-- Início: COMPONENT_PATTERNS_V2.md -->

# TCG Market — Padrões de componentes e interação v2

> **Complementa:** [Design System v2](../../../../Downloads/DESIGN_SYSTEM_V2.md). Este arquivo contém contratos de UI e critérios verificáveis de implementação. Não substitui as regras de negócio ou contratos dos componentes existentes.

## 1. Matriz de aplicação por componente

| Componente existente | Padronizar | Preservar | Aceite visual/funcional |
|---|---|---|---|
| `components/layout/SiteHeader.tsx` | Proporções, busca, ícones, foco, marca | Login, menu, notificações, carrinho, atalhos | Header cabe em 320px, sem sobrepor busca/ações |
| `components/layout/GameNavigation.tsx` | Ativo/hover/touch e responsividade | Rotas existentes | Sem jogos não disponíveis |
| `components/layout/SiteFooter.tsx` | Tipografia, spacing, links, alvos | Copyright e marca | Sem botões sociais com ação fictícia |
| `components/layout/PageBanner.tsx` | Altura flexível, overlay, estilo de H1 | Imagem customizada e `imagePosition` | Título longo não recorta; contraste válido |
| `components/ui/Button.tsx` | Contraste, alturas, variantes e loading opcional | Props `variant`, `preview`, `icon`, `className` e atributos HTML | Tab, Enter/Espaço, disabled e loading consistentes |
| `components/ui/Input.tsx` | Label, hint, erro, borda, focus ring | Contrato atual e compatibilidade | Campo identificado e erro anunciado |
| `components/ui/Select.tsx` | Altura, legibilidade, estado e seleção | `value`, `onValueChange`, `variant`, `error`, `invalid`, teclado atual | Setas/Enter/Escape sem rolar página indevidamente |
| `components/ui/Dropdown.tsx` | Trigger, menu, seleção, largura e teclado | API atual | Menu acessível e sem corte |
| `components/ui/Card.tsx` | Superfície, raio, elevação e hover | `Card` genérico + `ListingCard` de demonstração | Sem falsa interatividade em `<article>` |
| `components/ui/Badge.tsx` | Cores semânticas e contraste | Variantes `sale`, `trade`, `rare`, `success` etc. | Cor não é único indicador de status |
| `components/ui/ResponsiveFilters.tsx` | Área mobile, foco e affordance | Props `children` e estado atual | Filtros ocultos em mobile sem perda de dados |
| `components/ui/Modal.tsx` | Overlay, raio, foco, ações e largura | `presentation`, `size`, `embedded`, `footer`, ações | Escape/foco/scroll testados |
| `components/ui/modalTheme.tsx` | Substituir hex locais por tokens | Ornamentos, divider e tema refinado | Mesmo aspecto nos modais migrados |
| `components/ui/tradingCardStyles.ts` | Grid, card vertical, mídia/hover | API/exports consumidos por páginas | Proporção da carta não distorce |
| `components/admin/AdminPanel.tsx` | Superfície e borda | Controles de dashboard | Dados e carregamentos separados |
| `components/ui/GoldFrame.tsx` **[novo]** | Moldura dourada com cantos | Sem lógica de negócio | Mesma moldura em hero, filtros, modal e resumo |
| `components/ui/SectionTitle.tsx` **[novo]** | Título com linhas e losango | Semântica de heading | Visual idêntico ao "Jogos em destaque" do mockup |

## 2. Navegação e chrome

### Desktop

- Logo/marca consistente à esquerda, navegação principal, busca de largura flexível e ações à direita.
- Barra roxa (`brand.deep`) com filete dourado inferior; ornamentos apenas em extremidades/divisores; sem decoração sobre o campo de busca (creme, arredondado, lupa).
- Item ativo reconhecível por fundo **e** forma/contorno, não somente por cor.
- Painel de conta fecha por Escape, clique externo e escolha de item; devolve foco ao trigger quando pertinente.
- Não misturar Arial com Plus Jakarta Sans.

### Mobile

- Primeira linha compacta com marca e ações essenciais; segunda linha de busca somente se houver espaço real.
- Navegação dos destinos pode ser menu acessível ou abas horizontais em uma linha; **não** empilhar uma barra muito alta só para mostrar cinco itens.
- O mockup mostra tab bar inferior (Início, Explorar, Carrinho, Coleção, Perfil): **implementar** como componente real, em plum, ícone ativo dourado, sem cobrir conteúdo e formulários.
- Touch targets de `44×44px` quando viável, espaços seguros com `env(safe-area-inset-bottom)` se usar bottom nav.

### Contratos

- `aria-label` em botões apenas com ícone.
- `aria-current="page"` para destino ativo; `aria-expanded` e `aria-controls` em elementos recolhíveis.
- Links para navegação, botões para ações. Não usar botão para simular redes sociais externas.
- `PageBanner` não precisa ser sticky; apenas o header pode ter esse comportamento se aprovado.

## 3. Banners e cabeçalhos

**Estrutura:** imagem decorativa com `alt=""`, overlay suave, heading sem contorno excessivo e subtítulo como texto normal de leitura. No hero da Home: moldura dourada fina arredondada e gradiente plum à esquerda. No banner interno: breadcrumb acima do H1 e H1 em Cinzel maiúsculo branco. Divisor dourado com losango entre o banner e o conteúdo, quando o mockup o mostra.

**Comportamento:** permitir altura de conteúdo (`min-height` ou padding) e remover `<br />` manuais que forçam quebra ruim em mobile. Suportar `imagePosition` já existente e `image` específico.

**Tamanhos sugeridos:** hero da Home 240–380px conforme layout; banner interno 150–220px conforme conteúdo. Esses valores são **referências**, não travas de CSS.

**Não fazer:** título claro sobre área igualmente clara da ilustração; imagem `object-fit: fill`; fontes com contorno forte em corpo de texto.

## 4. Botões

| Variante existente | Uso | Fundo e texto | Regra |
|---|---|---|---|
| `primary` | Ação principal | Gradiente `#721E78 → #47114F` / branco (9,7:1 a 14,4:1) | Um CTA predominante por bloco; no hero, borda dourada fina |
| `secondary` | Ação alternativa | Creme `surface.default` / plum, contorno bege ou dourado | Como no mockup. Azul `#0969D7` fica para links e chips informativos |
| `outline` | Alternativa neutra | Creme / plum e borda bege | Clara e identificável |
| `ghost` | Ação pouco enfatizada | Transparente / plum | Dar feedback hover e foco |
| `danger` | Excluir/remover | Fundo `#F4E5D7` com borda e texto `#963033` (**M**, 6,16:1); em confirmação destrutiva de modal, `#B91C1C` sólido / branco | Mensagem clara antes de destrutivo |

**Estados:** default, hover, focus-visible, active, disabled; loading se a implementação já recebe estado assíncrono. Evitar adicionar `loading` que dispare operação sozinho.

**Exemplo com API existente:**

```tsx
<Button variant="primary" onClick={handleSubmit} disabled={submitting}>
  {submitting ? 'Salvando…' : 'Salvar alterações'}
</Button>
```

Evitar passar gradientes e `bg-[#...]` no `className` de cada página, pois isso torna `Button` decorativo e não uma fonte de padrão visual.

## 5. Inputs, selects, dropdowns

- Altura de referência: 40px desktop e alvo de toque adequado no mobile.
- Label visível acima; placeholder só como exemplo, nunca como único nome.
- Erro em texto após o campo, com ID ligado por `aria-describedby` e `aria-invalid="true"`.
- Focus ring visível em fundo claro e escuro (azul de apoio ou par de cores com contraste medido).
- `Select.tsx` já possui lógica personalizada de teclado/role listbox: **não refazer sem teste de regressão**, nem acrescentar library externa só por aparência.
- `Dropdown.tsx` não deve virar componente universal para toda seleção: selecionar valor simples, menu de ações e combobox são interações diferentes.
- Não mudar tipos TypeScript de filtros para acomodar a apresentação.

### Exemplo de feedback

```tsx
<label htmlFor="price">Preço (R$)</label>
<input
  id="price"
  inputMode="decimal"
  aria-invalid={Boolean(error) || undefined}
  aria-describedby={error ? 'price-error' : undefined}
/>
{error && <p id="price-error" role="alert">{error}</p>}
```

*Exemplo ilustrativo; usar `Input` compartilhado na implementação real.*

## 6. Cards e listagens

### Componentização correta

- `Card.tsx` mantém **a superfície**.
- `tradingCardStyles.ts` mantém estilo comum para grids e mídia.
- `CatalogCard.tsx` exibe informações de catálogo; não presume preço nem estoque.
- `MarketplaceAdCard.tsx` exibe informações de anúncio, vendedor/preço/ação.
- `CollectionItemCard.tsx` exibe quantidade, condição, idioma e ações da coleção.
- `MyAdCard` / `AdListingCard` mantêm regras de anúncio em seus próprios componentes.

Não criar um `SuperTCGCard` com dezenas de flags (`showSeller`, `hasPrice`, `isAdmin`, `showQuantity`, etc.). Isso fere SRP/ISP e aumenta a chance de regressão. Compartilhar **padrões visuais e pequenas peças**, mantendo decisões de domínio locais.

### Regras de composição

1. Área de imagem vertical e consistente, preferencialmente `5/7`, com `object-contain`.
2. Nome do item em até 2 linhas, com expansão/tooltip apenas quando necessário.
3. Metadados em texto de 14px quando possíveis; 12px só para informações secundárias.
4. Badge não compete com preço ou CTA.
5. Ação principal explícita: catálogo “Ver detalhes” ou “Ver ofertas”; marketplace “Ver anúncio” ou “Comprar” se a compra for diretamente válida; coleção “Criar anúncio” quando cabível.
6. Favorito é representado somente se houver funcionalidade implementada. Não adicionar coração visual inerte: o coração entra junto com FN-01 (seção 8A).
7. Cards não viram todos clicáveis se têm controles interativos internos sem tratamento adequado de eventos.
8. **Visual conforme o mockup:** ver 3.4 do Design System. Superfície creme, borda bege, sem moldura dourada.

### Grid responsivo

- `xl` ou telas amplas: quatro colunas, se largura por card e metadados permitirem.
- Tablet: duas ou três colunas.
- Mobile: uma coluna para card horizontal muito detalhado; duas colunas para card compacto, com fonte/CTA legíveis.
- Não impor 4 colunas no mobile.

## 7. Badges, chips e feedback

| Elemento | Regra |
|---|---|
| Raridade | Fundo e cor adequados a semântica; dourado para raridade/destaque, nunca texto comum pequeno |
| Condição | Mostrar abreviação **e** nome ao menos em local acessível; status nunca só cor |
| Venda/troca | Etiquetas com nomes claros e semântica |
| Filtro ativo | Chip com texto e botão para remover, nome acessível como “Remover filtro Raridade: Rara” |
| Limpar filtros | Botão visível apenas quando há filtros |
| Sucesso | Mensagem positiva, ícone/status e foco/`aria-live` apropriado |
| Aviso/erro | Frase objetiva com caminho para correção |
| Loading | Skeleton ou indicador com contexto; não trocar layout de tamanho repetidamente |
| Vazio | Explicação e ação útil, sem inventar dados |

**Chips do mockup:** raridade em pílula colorida (Rara em azul claro, Mítica em roxo), condição em creme com borda fina, filtro ativo em lavanda com ×. Texto sempre legível sobre o fundo efetivo; a cor não é o único indicador.

## 8. Filtros

### Estrutura padrão

```text
[ Título + ação limpar ]
[ Busca ]
[ Jogo ]
[ Edição ]
[ Raridade ]
[ Condição ]
[ Faixa de preço — somente onde aplicável ]
[ Aplicar filtros ]
```

O conjunto de campos muda conforme catálogo/coleção/marketplace. Não forçar “preço” em coleção se a página não tem esse conceito. A UI apresenta apenas valores previstos no modelo de filtro existente.

**Mobile:** `ResponsiveFilters` atualmente exibe botão “Mostrar filtros” e painel expansível. A migração mais barata é reusar esse padrão na coleção; transformar em drawer só depois de verificar foco, Escape, scroll lock e manutenção.

**Fonte de verdade:** cada página controla os dados aplicados; `ResponsiveFilters` controla somente *aparecer/ocultar*. Ao remover chip, preservar todos os outros filtros, resetar paginação quando preciso e reconsultar a lista. Sem duplicar requisições apenas para atualizar o visual.

## 9. Modais

### API atual que deve permanecer durante a fase 1

```tsx
<Modal
  open={open}
  onClose={onClose}
  title="Adicionar à coleção"
  presentation="refined"
  size="lg"
  footer={<Actions />}
>
  <CollectionForm />
</Modal>
```

**Atenção:** este exemplo supõe `<Actions />` e `<CollectionForm />` existentes no contexto que os consome, apenas para mostrar a composição. O arquivo `Modal.tsx` já aceita `open`, `onClose`, `title`, `presentation`, `size` e `footer`.

### Regras

- O diálogo gerencia portal, `role="dialog"`, `aria-modal`, título, foco, teclado e rolagem.
- A variante refinada segue o mockup: overlay plum escuro, `GoldFrame` duplo com ornamentos de canto, corpo creme, botão fechar (×) no canto superior direito e ações no footer; a clássica herda superfícies/raios do tema comum.
- O mesmo overlay em todos os casos, ressalvadas necessidades documentadas.
- Não abrir detalhe do catálogo como modal sobre outro modal; detalhe da coleção pode continuar modal.
- Não modificar o fluxo de proposta de troca ao estilizar seu conteúdo. Respeitar diferenças funcionais.
- Ao fechar, devolver foco ao elemento de origem, inclusive com conteúdo assíncrono quando possível.
- Não fechar por backdrop quando houver dados sensíveis não salvos sem confirmação. Usar `closeDisabled` quando o contrato exigir.

### Modais a auditar gradualmente

`AddToCollectionModal`, `CardDetailsModal`, `CollectionOwnershipModalBase`, `EditCollectionItemModal`, `RemoveCollectionItemModal`, `AddressFormModal`, `MyAdModal`, `AdminUserDetailsModal`, `TradeProposalDetailsModal`, `TradeProposalModal` (se disponível no módulo atual) e diálogos de descarte.

## 10. Administração

- Sidebar escura com estado de destino ativo e texto legível; os painéis internos são claros.
- KPIs: label + valor atual + período; variação só com base comparativa real. Quando inexistente, usar `—` ou explicação.
- Gráficos: legenda, título, período e alternativa textual/tabela sempre que necessário.
- Tabelas: headings semânticos, destaque de foco, truncamento moderado, overflow horizontal só em último caso.
- Respeitar separação das cargas de dados; um erro não apaga widgets disponíveis.
- `adminCommand.css` só deve continuar se representar estilos usados; revisar e eliminar seletores obsoletos com prova de não uso.

## 11. Contratos de acessibilidade por interação

| Interação | Teclado | Leitor de tela / semântica | Verificação |
|---|---|---|---|
| Menu | Tab, Escape, Enter | `aria-expanded`, nome acessível | Foco retorna ao disparador |
| Select customizado | Setas, Enter, Escape | combobox/listbox/option | Opção ativa anunciada |
| Filtro recolhível | Enter/Espaço, Escape se aberto | `aria-controls`, `aria-expanded` | Estado nunca perde valores |
| Modal | Tab cíclico, Shift+Tab, Escape quando permitido | `role=dialog`, `aria-modal`, `aria-labelledby` | Foco inicial e retorno |
| Formulário | Tab, Enter | labels, `aria-describedby`, erros | Mensagens claras e persistência correta |
| Card de anúncio | Tab pelos controles | links e botões próprios | Evitar aninhamento clicável inválido |
| Icon button | Enter/Espaço | `aria-label` descritivo | Área de toque adequada |
| Paginação | Tab/Enter | página atual e navegação semântica | Lista mantém filtro/ordenação |

## 12. Definition of Done para componente

- [ ] Usa tokens globais sem novo valor arbitrário desnecessário.
- [ ] Confere com o mockup em captura lado a lado (cores, moldura, tipografia).
- [ ] Mantém contrato público ou possui migração de consumidores explícita.
- [ ] Não contém chamadas à API sem motivo de domínio próprio.
- [ ] Estados de default/hover/focus/disabled/erro previstos conforme aplicável.
- [ ] Não depende somente de cor para informar status.
- [ ] Funciona a 320px e em zoom de 200% sem cortar conteúdo essencial.
- [ ] Funciona por teclado e não cria regressão em foco/ARIA.
- [ ] Possui teste de componente/integração quando o comportamento foi alterado.
- [ ] Documentado no `DesignSystemPage.tsx` com os componentes **de produção**, evitando exemplos antigos desconectados.

---

**Próximo passo:** seguir o [roteiro por arquivo e ordem de execução](../../../../Downloads/IMPLEMENTATION_ROADMAP_V2.md).


<!-- Fim: COMPONENT_PATTERNS_V2.md -->


---

<!-- Início: IMPLEMENTATION_ROADMAP_V2.md -->

# TCG Market — Roteiro de implementação do Design System v2

> **Status:** plano de execução para issues/PRs · **Base de caminhos validada:** `PI3-TCG/TCGMarket`, `main` em 22/11/2026. **Objetivo:** menor retrabalho possível com alterações incrementais e verificáveis, sem reescrever fluxos de negócio.

## 1. Como executar este roteiro

1. Criar branch a partir do `main` atualizado; **não implementar tudo em uma única PR**.
2. Aplicar alterações em **tokens → componentes compartilhados → layout → módulos → limpeza/QA**.
3. Em cada etapa, substituir somente os usos necessários, sem mudar modelos, endpoints ou regras de negócio.
4. Antes de remover uma classe/export/API, buscar todos os consumidores no repositório.
5. Cada PR deve incluir screenshots **antes/depois** em desktop e mobile e apontar regressões testadas.
6. O mockup é a **especificação visual**: reproduzir cores, molduras, tipografia e ornamentos. Não copiar dados falsos (preços, contagens, avaliações) nem funcionalidades inexistentes (favoritos, avaliações e vendas só aparecem quando o backend existir; ver seção 8A). Divergência visual precisa de aprovação de quem criou a arte.

### 1.1 Escopo e não escopo

**Incluído:** UI, tokens, tipografia, densidade, containers, hero/banner, cards, filtros, formulários, modais, responsividade, administração, acessibilidade e consistência visual.

**Fora de escopo:** novas rotas; API/DB; mecanismo novo de busca; importação; pagamentos; ordenação inteligente de destaque; métricas inventadas. Abrir issue separada para evoluções funcionais.

### 1.2 Referência de prioridades

- **P0:** mudanças fundacionais que impedem inconsistências/erros de acessibilidade.
- **P1:** mudanças visíveis de maior impacto, com risco contido.
- **P2:** refinamento e limpeza controlada.
- **P3:** melhorias opcionais, que podem ficar para depois da entrega visual.

## 2. Arquivos novos: mínimo viável

| Arquivo | Necessário? | Motivo |
|---|---|---|
| `docs/design-system/DESIGN_SYSTEM_V2.md` | **Sim** | Fonte de requisitos e tokens |
| `docs/design-system/COMPONENT_PATTERNS_V2.md` | **Sim** | Contratos e regras de interação |
| `docs/design-system/IMPLEMENTATION_ROADMAP_V2.md` | **Sim** | Checklists, etapas e arquivos |
| `frontend/src/components/layout/PageContainer.tsx` | **Recomendado** | Eliminar repetição de `max-w`, gutter e centralização em diversas páginas |
| `frontend/src/components/layout/PageSection.tsx` | **Condicional** | Criar só se a inspeção evidenciar múltiplos headers/seções idênticos |
| `frontend/src/components/ui/GoldFrame.tsx` | **Sim** | Moldura dourada com cantos, reutilizada em hero, filtros, modal e resumo |
| `frontend/src/components/ui/SectionTitle.tsx` | **Sim** | Título de seção com linhas e losango dourados |
| `frontend/src/assets/ornaments/*.svg`, `assets/textures/parchment.webp`, `assets/icons/gold/*.svg` | **Sim** | Assets da arte; sem eles o visual não chega ao mockup |
| `frontend/src/components/ui/theme/tokens.ts` | **Não, por padrão** | Evitar duplicar fonte de verdade: os tokens CSS já ficam em `frontend/src/index.css` (`@theme` do Tailwind v4) |
| `frontend/src/components/ui/theme/componentRecipes.ts` | **Não, por padrão** | Maps de variantes já podem permanecer próximos a `Button`, `Badge` e `Card` |

> O custo de manutenção é menor quando existem **poucas abstrações úteis**, e não um diretório novo de arquitetura apenas para mover strings.

### 2.1 Exemplo seguro de `PageContainer` (opcional, recomendado)

Adicionar em `frontend/src/components/layout/PageContainer.tsx`, usando o utilitário `cn` existente:

```tsx
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/components/ui/cn'

type Width = 'wide' | 'reading' | 'admin'

type PageContainerProps = ComponentPropsWithoutRef<'div'> & {
  width?: Width
}

const widths: Record<Width, string> = {
  wide: 'max-w-[1600px]',
  reading: 'max-w-[1400px]',
  admin: 'max-w-[1600px]',
}

export function PageContainer({
  width = 'wide',
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      {...props}
      className={cn(
        'mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8',
        widths[width],
        className,
      )}
    />
  )
}
```

**Regras:** não colocar `main`, `Outlet`, `session` ou `PageBanner` dentro do container genérico. Usar `className` para espaçamento vertical local. Não migrar todas as páginas no mesmo commit.

## 3. Sequência de execução — tarefas independentes para GitHub Issues

> Cada tarefa abaixo pode ser copiada como issue. A ordem é intencional: primeiro os arquivos mais reutilizados, depois os consumidores.

| Ordem | ID | Prioridade | Tarefa | Dependência | Resultado esperado |
|---:|---|---|---|---|---|
| 01 | DS-01 | P0 | Registrar DS v2 e decisões de marca | — | Especificação revisada e aprovada |
| 02 | DS-02 | P0 | Consolidar tokens, pergaminho e contraste | DS-01 | Paleta semântica no `@theme` sem quebra; fundo pergaminho |
| 02A | DS-02A | P0 | Assets e receitas de ornamento | DS-02 | `GoldFrame`, `SectionTitle`, textura e ícones dourados |
| 03 | DS-03 | P0 | Unificar Button, Input, Select, Dropdown e Badge | DS-02 | Estados e foco coerentes |
| 04 | DS-04 | P0 | Unificar Card, grid e imagem de TCG | DS-02/03 | Mesma base visual nas três listagens |
| 05 | DS-05 | P0 | Normalizar Modal e modalTheme | DS-02/03 | Overlay/comportamento únicos |
| 06 | DS-06 | P1 | Criar PageContainer e normalizar seções | DS-02 | Largura e gutter previsíveis |
| 07 | DS-07 | P1 | Refatorar navbar e navegação mobile | DS-02/03 | Header coeso e compacto |
| 08 | DS-08 | P1 | Refatorar footer e corrigir redes sociais | DS-02/03 | Rodapé acessível sem ações fictícias |
| 09 | DS-09 | P1 | Padronizar PageBanner e hero | DS-02/06 | Banners flexíveis e legíveis |
| 10 | DS-10 | P1 | Unificar filtros e chips | DS-03/06 | Padrão único, inclusive Coleção |
| 11 | DS-11 | P1 | Atualizar Catálogo e Marketplace | DS-04/09/10 | Grids e resultados padronizados |
| 12 | DS-12 | P1 | Atualizar Minha Coleção e Meus Anúncios | DS-04/09/10 | Filtros, cards e ações consistentes |
| 13 | DS-13 | P1 | Atualizar Homepage e seções informativas | DS-04/06/09 | Vitrine coerente, 3 TCGs e 8 anúncios |
| 14 | DS-14 | P1 | Migrar modais especializados | DS-05 | Identidade única sem alterar regra de negócio |
| 15 | DS-15 | P1 | Atualizar detalhes, compra e transações | DS-03/05/06/09 | Jornada legível e consistente |
| 16 | DS-16 | P2 | Atualizar perfil e autenticação | DS-03/05/06 | Formulários e páginas alinhados |
| 17 | DS-17 | P1 | Unificar visual administrativo | DS-02/03/06 | Admin conectado ao DS, sem ornamentos excessivos |
| 18 | DS-18 | P2 | Atualizar página demonstrativa do DS | DS-03/04/05 | Showcase de componentes de produção |
| 19 | DS-19 | P0 | Auditoria de acessibilidade e responsividade | DS-07 a DS-18 | Validação final sem regressões críticas |
| 20 | DS-20 | P2 | Remover classes/estilos obsoletos | DS-19 | Código mais limpo após prova de não uso |

**Nota:** DS-19 tem prioridade de qualidade P0, mas ocorre depois da integração dos módulos. Realizar verificações locais de acessibilidade em **todas** as PRs, sem deixar problemas básicos acumularem até o fim.

## 4. Detalhamento das tarefas com arquivos

### DS-01 — Documentação, marca e matriz visual

**Alterar/criar**

- `docs/design-system/DESIGN_SYSTEM_V2.md` **[novo]**
- `docs/design-system/COMPONENT_PATTERNS_V2.md` **[novo]**
- `docs/design-system/IMPLEMENTATION_ROADMAP_V2.md` **[novo]**
- `docs/design-system/Visual Guide V1.md` **[existente, somente adicionar aviso/ligação para v2; não apagar histórico]**
- `docs/design-system/LAYOUT_GUIDELINES_V2.md` **[existente, revisar referências conflitantes]**

**Ações:** aprovar nome da marca; registrar o mockup de referência como especificação visual normativa e abrir as issues FN-01 a FN-03 (favoritos, avaliações, vendas; seção 8A); definir tokens/estados e o que não será implementado. Escolher 3–5 páginas de referência visual para comparação.

**Aceite:** não existem duas especificações simultaneamente “oficiais” com regras contraditórias. Equipe aceita manter fluxo/negócio fora do escopo.

### DS-02 — Tokens, contraste e fundação

**Alterar**

- `frontend/src/index.css`
- `frontend/src/components/ui/styles.ts`
- `frontend/src/components/layout/siteChrome.css` (somente referências aos novos tokens, deixando a refatoração do layout para DS-07/08)

**Ações:** estender `@theme` (Tailwind v4), sem excluir classes atuais; criar tokens semânticos e manter aliases; corrigir combinações de baixo contraste; criar classes/utilitários só quando compartilhados; padronizar estilos de foco; **substituir** o fundo global (`page-vignette`/`neutral-50`) pelo pergaminho `surface.canvas` com textura, sem halo roxo; adicionar os tokens de `tcg-assets/tokens.css`; carregar **Crimson Text 600;700** no link do Google Fonts de `index.html` e remover o uso de peso 800 (não carregado).

**Aceite:** nenhuma tela perde cores por token removido; lint e build passam; todos os textos de ação principais têm contraste medido.

### DS-02A — Assets e receitas de ornamento

**Criar**

- `frontend/src/components/ui/GoldFrame.tsx` e `SectionTitle.tsx`
- `frontend/src/assets/ornaments/` (cantos, linha com losango), `assets/textures/parchment.webp`, `assets/icons/gold/`
- Classes `.frame-gold`, `.ornament-line` e o fundo do `body` em `frontend/src/index.css` (`@layer components`)

**Ações:** receber os assets exportados da arte; implementar as receitas da seção 2.5 do Design System; documentar o uso no `DesignSystemPage`.

**Aceite:** `GoldFrame` renderizado ao lado do painel de filtros do mockup é visualmente equivalente; sem distorção em larguras de 320 a 1600px; ornamentos são decorativos (`aria-hidden`) e não afetam foco nem leitura.

### DS-03 — Controles de interface

**Alterar**

- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Dropdown.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Checkbox.tsx` (se o estilo de foco divergir)
- `frontend/src/components/ui/styles.ts`

**Ações:** padronizar raios, alturas, tipografia, foco, hover, disabled, erro; `secondary` creme com contorno, como no mockup (azul `#0969D7` só em links e chips informativos); preservar as variantes existentes e `Select` customizado; evitar novo componente universal que substitua tudo.

**Aceite:** props atuais seguem compilando; navegação por teclado e identificação de erro continuam válidas; nenhuma ação sem estado de foco.

### DS-04 — Card base e cards de TCG

**Alterar**

- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/tradingCardStyles.ts`
- `frontend/src/components/ui/TradingCard.tsx` (se compartilhar mídia real)
- `frontend/src/components/catalog/CatalogCard.tsx`
- `frontend/src/components/marketplace/MarketplaceAdCard.tsx`
- `frontend/src/components/collection/CollectionItemCard.tsx`
- `frontend/src/components/ads/AdListingCard.tsx`
- `frontend/src/components/myAds/MyAdCard.tsx`

**Ações:** separar superfície da composição de negócio; imagem proporcional e `object-contain`; harmonizar título, badges, preço quando aplicável e CTA; borda bege fina (`border.default`) nos cards comuns, sem moldura dourada; corrigir nomes acessíveis de botões ícone.

**Aceite:** Catálogo não mostra preço fictício; Coleção mantém editar/remover/criar anúncio; Marketplace mantém vínculo vendedor/oferta; lista fica legível a 320px.

### DS-05 — Modal base e tema

**Alterar**

- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/modalTheme.tsx`
- `frontend/src/components/ui/DetailsModal.tsx` (se for consumidor/alias da base)
- `frontend/src/components/ui/useDismiss.ts` (somente se necessário e com testes)

**Ações:** estabelecer overlay, sombra, borda, raios e espaços únicos; modal de detalhe com `GoldFrame` duplo e ornamentos de canto; reutilizar comportamento de foco, fechar, Escape e scroll; **preservar `presentation="classic" | "refined"` e `size="sm" | "md" | "lg"`** até migração completa; trocar cores hardcoded do tema por tokens quando possível.

**Aceite:** ambos modos funcionam sem alterações forçadas em todos os consumidores; sem foco perdido ou scroll vazando para o body.

### DS-06 — Container padrão

**Criar/alterar**

- `frontend/src/components/layout/PageContainer.tsx` **[novo]**
- `frontend/src/components/layout/SiteLayout.tsx`
- `frontend/src/pages/MarketplacePage.tsx` e `CatalogPage.tsx` (migrar 1–2 páginas piloto para validar API)

**Ações:** centralizar variações de largura e gutter; preservar a árvore de layout e rotas; não introduzir `PageSection` antes de confirmar necessidade.

**Aceite:** largura consistente em mobile e desktop, sem margens duplas ou overflow.

### DS-07 — Header, navegação e mobile

**Alterar**

- `frontend/src/components/layout/SiteHeader.tsx`
- `frontend/src/components/layout/GameNavigation.tsx`
- `frontend/src/components/layout/siteChrome.css`
- `frontend/src/components/layout/SiteLayout.tsx`
- `frontend/src/components/layout/siteGames.ts` (somente se houver item sem rota disponível)

**Ações:** substituir Arial por fonte oficial; simplificar linha dupla no mobile; implementar tab bar inferior (plum, ícone ativo dourado); filete dourado na base do header; ajustar busca/responsividade; padronizar active/hover/focus; decidir sticky e aplicar sem cobrir conteúdo; reutilizar logo atual; verificar interação com menu de conta, notificações e carrinho.

**Aceite:** 320/390/768/1024/1440, sem corte do menu, com foco visível, atalhos de busca preservados e rotas intactas.

### DS-08 — Footer e redes sociais

**Alterar**

- `frontend/src/components/layout/SiteFooter.tsx`
- `frontend/src/components/layout/siteChrome.css`
- `frontend/src/components/layout/SiteLayout.tsx` (somente se `onSoon` perder consumidores)

**Ações:** mesma marca/fonte; corrigir tamanhos-alvo; trocar botão social por `<a>` **apenas** quando existir URL real aprovada; caso contrário, ocultar a rede em vez de prometer link fictício.

**Aceite:** não há controles clicáveis inúteis; footer não amplia a largura da tela em mobile.

### DS-09 — Banners

**Alterar**

- `frontend/src/components/layout/PageBanner.tsx`
- `frontend/src/config/pageBanners.ts` (se necessário para imagens já existentes)
- `frontend/src/pages/HomePage.tsx` (hero como primeiro consumidor)

**Ações:** altura flexível, overlay legível, heading consistente, min-height responsivo; preservar `image` e `imagePosition`; remover quebras manuais nas páginas conforme migração; trocar `banner-text-outline` por overlay em gradiente; hero com `GoldFrame`; breadcrumb acima do H1 nos banners internos.

**Aceite:** frases longas/zoom 200% não cortam; imagem mantém proporção.

### DS-10 — Filtros e chips

**Alterar**

- `frontend/src/components/ui/ResponsiveFilters.tsx`
- `frontend/src/components/collection/CollectionFilters.tsx`
- `frontend/src/components/marketplace/MarketplaceFilters.tsx`
- `frontend/src/pages/CatalogPage.tsx` (filtros existentes na página)
- `frontend/src/pages/MarketplacePage.tsx`
- `frontend/src/pages/MyCollectionPage.tsx`
- `frontend/src/pages/MyAdsPage.tsx` (filtros conforme implementação atual)

**Ações:** aplicar `ResponsiveFilters` na Coleção; painel de filtros em `GoldFrame` com seções colapsáveis e contagens; equalizar labels, bordas, headings e botões; definir chips removíveis, limpar e aplicar sem mudar valores de domínio; não inventar novo tipo de filtro.

**Aceite:** remover chip preserva os demais filtros; mudança de filtro reinicia paginação quando pertinente; mobile apresenta botão/painel com `aria-expanded` e foco correto.

### DS-11 — Marketplace e Catálogo

**Alterar**

- `frontend/src/pages/MarketplacePage.tsx`
- `frontend/src/pages/CatalogPage.tsx`
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/components/marketplace/MarketplaceAdCard.tsx`
- `frontend/src/components/catalog/CatalogCard.tsx`
- `frontend/src/components/ui/Pagination.tsx`

**Ações:** lista com cabeçalho comum (quantidade, ordenação, chips), grid consistente, estados de loading/empty/error unificados; manter query params e paginação; página de busca com tratamento equivalente às outras listagens.

**Aceite:** buscas, ordenação, filters e paginação intactos; `SearchPage` não parece produto visualmente separado.

### DS-12 — Coleção e Meus Anúncios

**Alterar**

- `frontend/src/pages/MyCollectionPage.tsx`
- `frontend/src/pages/MyAdsPage.tsx`
- `frontend/src/components/collection/CollectionSummary.tsx`
- `frontend/src/components/collection/CollectionItemCard.tsx`
- `frontend/src/components/collection/CollectionFilters.tsx`
- `frontend/src/components/myAds/MyAdCard.tsx`

**Ações:** cards harmonizados, filtros responsivos, resumo sem métricas fictícias, CTA “Criar anúncio” preservado no detalhe da coleção; ações editar/remover continuam.

**Aceite:** todas as ações da coleção e anúncios preservadas, sem regressão de condição/idioma/quantidade.

### DS-13 — Homepage

**Alterar**

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/home/HomeInformationSections.tsx`
- `frontend/src/components/layout/siteGames.ts` (se necessário, sem incluir jogos não suportados)
- Assets já existentes sob `frontend/src/assets/images/` (otimização sem alterar caminhos quando possível)

**Ações:** hero com moldura dourada, faixa de 4 valores com ícones dourados, `SectionTitle` "Jogos em destaque"; exatamente 3 TCGs ativos; máximo **8 anúncios** (4×2 desktop quando largura permitir); “Como funciona” e “Guia de condição” abaixo dos anúncios; otimizar imagens grandes.

**Aceite:** ordem acordada e nenhum One Piece/Digimon visível; sem novos dados fictícios; link para marketplace funciona.

### DS-14 — Modais especializados

**Alterar progressivamente, com PRs pequenas**

- `frontend/src/components/catalog/AddToCollectionModal.tsx`
- `frontend/src/components/catalog/CardDetailsModal.tsx`
- `frontend/src/components/collection/CollectionOwnershipModalBase.tsx`
- `frontend/src/components/collection/EditCollectionItemModal.tsx`
- `frontend/src/components/collection/RemoveCollectionItemModal.tsx`
- `frontend/src/components/delivery/AddressFormModal.tsx`
- `frontend/src/components/ads/DiscardChangesDialog.tsx`
- `frontend/src/components/myAds/MyAdModal.tsx`
- `frontend/src/components/admin/AdminUserDetailsModal.tsx`
- `frontend/src/components/trade/TradeProposalDetailsModal.tsx`
- `frontend/src/components/trade/TradeProposalFlow.tsx`

**Ações:** migrar overlays locais para a base quando tecnicamente viável; uniformizar ações e feedback; manter regras de autorização/confirmar/cancelar. Modais que dependem de layout especial podem usar composição sem copiar lógica de foco.

**Aceite:** não houve regressão em diálogos de edição, exclusão, entrega, proposta, troca ou administração; nenhum modal empilhado involuntariamente.

### DS-15 — Detalhes e compra

**Alterar**

- `frontend/src/pages/CardDetailsPage.tsx`
- `frontend/src/pages/MarketplaceAdPage.tsx`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/DeliveryPage.tsx`
- `frontend/src/pages/ReviewPage.tsx`
- `frontend/src/pages/CheckoutResultPage.tsx`
- `frontend/src/pages/CreateAdPage.tsx`
- `frontend/src/pages/TransactionHistoryPage.tsx`
- `frontend/src/pages/TransactionDetailPage.tsx`

**Ações:** containers de leitura, superfícies iguais, resumo de compra claro, etapa atual de checkout reconhecível e responsiva; CTA coerente por fase; preservar dados, frete, validações, status e rotas.

**Aceite:** fluxo de carrinho → endereço → revisão → resultado continua íntegro; erros e loading explicados; subtotal/total nunca inventados ou mascarados.

### DS-16 — Perfil e autenticação

**Alterar**

- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/PublicProfilePage.tsx`
- `frontend/src/pages/ProfileEditPage.tsx`
- `frontend/src/components/profile/ProfileView.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/index.html`
- `frontend/README.md` (se o branding oficial for alterado)

**Ações:** layouts alinhados, formulários sem corte em alturas curtas, label/erro padronizados; alinhar metadados e título do navegador ao nome oficial aprovado.

**Aceite:** login/cadastro/perfil preservados, inclusive mensagem de login genérica decidida anteriormente; teclado não fica escondido atrás de blocos fixos.

### DS-17 — Área administrativa

**Alterar**

- `frontend/src/components/admin/AdminLayout.tsx`
- `frontend/src/components/admin/AdminPanel.tsx`
- `frontend/src/components/admin/adminCommand.css` (avaliar uso antes de remover)
- `frontend/src/pages/admin/AdminOverviewPage.tsx`
- `frontend/src/pages/admin/AdminCatalogPage.tsx`
- `frontend/src/pages/admin/AdminUsersPage.tsx`
- `frontend/src/components/admin/AdminActionList.tsx` (se necessário)

**Ações:** tema claro no conteúdo e sidebar plum sem excesso de brilho; links com foco/ativo unificados; cartões KPI, gráficos e tabelas com cores dos tokens; remover hardcodes repetidos sem alterar hooks/dados.

**Aceite:** widget sem API disponível mantém estado informativo; gráficos apresentam dados reais; navegação admin respeita permissões.

### DS-18 — Página de demonstração do Design System

**Alterar**

- `frontend/src/pages/DesignSystemPage.tsx`
- `frontend/src/components/ui/index.ts` (se algum novo componente público precisar de export)

**Ações:** demonstrar **componentes realmente usados** em produção, suas variantes, responsividade e estados. Remover exemplos que usam navegação/Logo antigos, ou sinalizar que são legados.

**Aceite:** showcase corresponde à aplicação; serve para revisão visual dos PRs seguintes.

### DS-19 — QA integrado (transversal e final)

**Inspecionar/testar**

- Todos os módulos alterados.
- `docs/design-system/Validacao-Responsividade-Marketplace-Issue-201.md` como histórico de baseline (revalidar após a mudança).
- Fluxos públicos, autenticados e administrativos.

**Ações:** checklist da seção 6. Se detectar regressão, corrigir na PR do módulo responsável; não empilhar correções na PR final.

**Aceite:** build/lint/format verificados, sem novos erros relevantes de console, sem controles inacessíveis e sem regressão de fluxos.

### DS-20 — Limpeza comprovada

**Inspecionar/remover somente após busca por referências**

- `frontend/src/index.css` (utilitários duplicados/abandonados)
- `frontend/src/components/layout/siteChrome.css` (seletores legados)
- `frontend/src/components/admin/adminCommand.css` (estilos não usados)
- `frontend/src/components/ui/modalTheme.tsx` (valores hardcoded substituídos)
- `frontend/src/components/ui/index.ts` (exports obsoletos, se houver)

**Ações:** remover dead CSS com evidência de não uso, harmonizar classes e documentar incompatibilidades residuais. Sem renomeação de classes sem necessidade.

**Aceite:** simplificação mensurável, sem regressão nos navegadores e telas-alvo.

## 5. Ordem de PRs sugerida

| PR | Agrupamento | Tarefas | Dependência | Critério de merge |
|---:|---|---|---|---|
| 1 | Contrato + fundação | DS-01, DS-02 | — | Visual especificado; build e cores compatíveis |
| 2 | Componentes base | DS-03, DS-04 | PR 1 | API preservada e componentes demonstráveis |
| 3 | Modal base | DS-05 | PR 1–2 | Foco/Escape/scroll testados |
| 4 | Container + navegação | DS-06, DS-07, DS-08 | PR 1–2 | Mobile 320/390 e desktop conferidos |
| 5 | Banner + filtros | DS-09, DS-10 | PR 2, 4 | Componentes prontos, estado preservado |
| 6 | Listagens | DS-11, DS-12 | PR 2, 5 | Catálogo, anúncio e coleção sem regressão |
| 7 | Home | DS-13 | PR 2, 5 | 3 jogos, 8 anúncios, ordem correta |
| 8 | Modais especializados | DS-14 | PR 3 | Testes dos fluxos dos modais |
| 9 | Compra e detalhes | DS-15 | PR 3, 4, 5 | Etapas e validações íntegros |
| 10 | Perfil + admin | DS-16, DS-17 | PR 2–5 | Permissões e responsividade intactas |
| 11 | Showcase + QA + limpeza | DS-18, DS-19, DS-20 | PRs anteriores | Revisão visual/a11y e sem dead CSS |

**Observação de time:** PRs 8, 9 e 10 podem avançar em paralelo após estabilização dos componentes compartilhados, evitando conflitos no `index.css`, `Modal.tsx` e `siteChrome.css`. Designe um responsável por esses arquivos-base.

## 6. Checklist de QA

### Visual e responsividade

- [ ] Testar `320, 390, 768, 1024, 1440, 1600px`.
- [ ] Testar altura curta e teclado virtual em formulários.
- [ ] Garantir sem scroll horizontal inesperado.
- [ ] Garantir que navbar, drawers, sticky, menus e modais não cubram conteúdo.
- [ ] Verificar zoom de 200%, nomes longos de cartas e texto expandido.
- [ ] Conferir hierarquia visual, badges, subtítulos e CTAs.
- [ ] Imagens de cartas têm proporção preservada.
- [ ] Gradientes/ilustrações não tornam o texto ilegível.
- [ ] **Fidelidade ao mockup:** capturas lado a lado (Home, Marketplace, Detalhe, Carrinho, Entrega, Mobile) aprovadas.
- [ ] Contraste medido sobre o fundo pergaminho, não sobre branco.

### Acessibilidade

- [ ] Tab percorre todos os controles em ordem previsível.
- [ ] Foco visível sobre fundos claros e escuros.
- [ ] Enter/Espaço acionam ações; Escape fecha elementos apropriados.
- [ ] Todos os campos têm label, hint e erro compreensíveis.
- [ ] Modais têm `aria-labelledby` e devolvem foco após fechamento.
- [ ] Ícones clicáveis têm nome acessível e área acionável adequada.
- [ ] Contraste do texto normal `>= 4.5:1`; texto grande e elementos essenciais `>= 3:1`.
- [ ] Alertas não dependem somente da cor.
- [ ] Respeitar `prefers-reduced-motion`.

### Regressão de produto

- [ ] Login/logout e controle de acesso continuam válidos.
- [ ] Catálogo: busca, filtros, paginação, detalhe e adicionar à coleção.
- [ ] Minha Coleção: incluir, agrupar, editar, remover, detalhe e criar anúncio.
- [ ] Marketplace: ordenação, filtros, oferta, vendedor e navegação para detalhe.
- [ ] Meus Anúncios: ações e estados.
- [ ] Carrinho/checkout: quantidade, endereço, frete, revisão e resultado.
- [ ] Propostas de troca: confirmar/recusar/cancelar conforme autorização existente.
- [ ] Admin: cards, gráficos, listas, acesso e estados independentes de carregamento.
- [ ] Nenhum dado de demonstração foi incluído como dado real.

### Comandos reais de validação (projeto atual)

Na pasta `frontend`:

```powershell
npm install
npm run lint
npm run format:check
npm run build
```

`package.json` contém `dev`, `build`, `lint`, `format`, `format:check` e `preview`; **não contém script `test`** atualmente. Para automação de regressões de UI, propor Playwright/Vitest em issue independente e integrar com CI antes de torná-los gate obrigatório.

## 7. Arquitetura orientada a SOLID sem abstração excessiva

| Princípio | Aplicação concreta | Antipadrão evitado |
|---|---|---|
| **S — Responsabilidade única** | `ResponsiveFilters` mostra/esconde; `CollectionFilters` controla campos de coleção; `MyCollectionPage` aplica filtros | Container genérico com requests, layout e regra de negócio juntos |
| **O — Aberto/fechado** | Variante por mapas tipados em `Button`/`Badge` e extensão de `PageContainer` por `width` | Criar cópias do mesmo botão/card por cada página |
| **L — Substituição** | As variantes de `Button` mantêm semântica HTML e API; os modos de `Modal` mantêm comportamento essencial | Variante “bonita” que não funciona por teclado |
| **I — Segregação** | Props pequenas por propósito, card de domínio separado do estilo de superfície | `UniversalCard` com dezenas de props booleanas |
| **D — Inversão de dependência** | Páginas dependem de `Button`, `Card`, `Modal`, `PageContainer` públicos; estilos de marca ficam em tokens | Cada página define sua cópia do tema e ignora componentes base |

### Regras objetivas de código limpo

1. **CSS/Tokens:** não copiar hex e sombras em dezenas de TSX; `@theme` centraliza tokens compartilhados.
2. **Sem lógica no tema:** não importar services, hooks de dados ou rotas em arquivos de estilo.
3. **Props estáveis:** acrescentar propriedades opcionais compatíveis; deprecar antigas com prazo, não quebrar tudo em um só PR.
4. **Composição sobre herança:** `Card` básico + conteúdo especializado, não `MegaCard`.
5. **Sem wrappers vazios:** só extrair componente se houver reutilização verdadeira ou responsabilidade própria.
6. **Sem estado duplicado:** filtros/ordenadores mantêm uma fonte de verdade por módulo.
7. **Sem hacks de acessibilidade:** resolver foco e semântica na base; evitar `tabIndex` espalhado para reparar árvore errada.
8. **Sem alterações funcionais ocultas:** qualquer mudança de comportamento (por exemplo, sticky ou drawer) precisa de aceite e QA explícitos.
9. **Sem apagar evidências antigas:** documentação e screenshots v1 continuam históricos, mas v2 torna-se referência após aprovação.
10. **Sem refatorar backend:** mudanças visuais não exigem alterações em serviços Spring Boot/MongoDB.

## 8. Resultado esperado

- Uma única linguagem de marca, legível e moderna, com fantasia medieval medida.
- Menos divergência entre Navbar, Footer, Home, catálogo, anúncio, coleção, admin e checkout.
- Componentes com contratos previsíveis, sem sobreposição de responsabilidades.
- Menos hardcodes e menos CSS redundante, sem reescrita desnecessária.
- Iterações futuras possíveis sem redesenhar todas as páginas.

---

**Documentos relacionados:** [Design System v2](../../../../Downloads/DESIGN_SYSTEM_V2.md) · [Padrões de componentes](../../../../Downloads/COMPONENT_PATTERNS_V2.md).


<!-- Fim: IMPLEMENTATION_ROADMAP_V2.md -->
