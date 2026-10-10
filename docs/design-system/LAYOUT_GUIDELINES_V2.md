# TCG Market — Layout Guidelines V2.1 | Padronização de telas

> **Referências:** Visual Guide V1 (identidade visual oficial) + inventário do código real.
>
> **Base auditada:** `frontend.zip` enviado em 09/10/2026. Documento para desenvolvedores e assistentes de IA. **O código existente é a fonte de verdade; este arquivo registra os padrões observados, não altera automaticamente telas.**
>
> **Status:** inventário técnico do frontend atual + decisões de padronização confirmadas pelo responsável. **Decisão posterior ao ZIP:** páginas principais terão contêiner de até 1600 px; a Home ainda está em migração. Validar outras mudanças de padrão com a equipe.

## 0. Autoridade, escopo e como resolver divergências

**Objetivo:** padronizar novas telas do TCG Market sem confundir identidade visual com dimensões particulares de cada página.

- **Identidade visual oficial:** `Visual Guide V1` (fornecido pela equipe). Suas regras de cor, tipografia, semântica, componentes e acessibilidade são a referência de design.
- **Implementação atual:** `src/index.css`, componentes e páginas do `frontend.zip`. Descrevem o que já está no código; não significam necessariamente que toda diferença tenha sido aprovada.
- **Documentos complementares citados pelo Visual Guide:** `Design Tokens V1` e `Component Reference V1`. **Não foram disponibilizados nesta revisão**, portanto não atribuir a eles regras não verificadas.
- **Protótipo aprovado da funcionalidade:** fonte para composição e comportamento específicos, desde que não contrarie regras oficiais sem decisão explícita da equipe.

**Em caso de divergência:** documente o conflito, preserve o comportamento existente, não altere silenciosamente o código e solicite decisão da equipe. Não trate o inventário do Catálogo como novo Design System global.

### Regras visuais oficiais (Visual Guide V1)

| Tema | Regra | Referência |
| --- | --- | --- |
| Identidade | Roxo identifica a marca; azul orienta interação; neutros predominam no conteúdo | §§ 2–4 |
| Ações | `primary` `#660366`; `secondary` `#1688F8`; `outline`, `ghost` e `danger` conforme hierarquia | § 13 |
| Semântica | `success #15803D`, `warning #D97706`, `error #B91C1C`, `info #1D4ED8`; vermelho não é decorativo | § 5 |
| Tipografia | Cinzel para logo, títulos, preços, raridades e destaques; Plus Jakarta Sans para conteúdo funcional | §§ 6–7 |
| Escala de texto | Display 40, H1 32, H2 24, H3 20, body-lg 18, body 16, body-sm 14, caption 12 px | § 7 |
| Espaçamento | Base de 4 px; preferir escala de 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px | § 8 |
| Bordas | Pequenos elementos 4 px; controles 8 px; cards e modais 12 px; grandes 16 px; badges circulares | § 9 |
| Sombras | `sm` discreta, `md` para dropdowns, `lg` para modais | § 10 |
| Ícones | Outline preferencial; tamanhos 16/20/24/32 px por contexto | § 11 |
| Foco | Visível, `#1688F8`; não depender só de cor | § 12 |
| Input / Select | Altura 40 px, raio 8 px, fonte funcional 14 px, fundo branco | §§ 14–15 |
| Checkbox | 20 × 20 px, raio 4 px, espaçamento de 8 px para o rótulo | § 16 |
| Badge | Fonte 12 px/600, padding horizontal 8 px, altura mínima 24 px, formato pill | § 17 |
| Card de anúncio | Fundo branco, borda `#E6E7F0`, raio 12 px, padding 16 px; preço em Cinzel 700 | § 18 |
| Modal genérico | Overlay `rgba(48,43,64,.50)`, raio 12 px, padding 24 px; título Cinzel 24 px | § 20 |
| Navegação | Duas camadas: logo/pesquisa/conta e navegação por TCGs | § 21 |
| Responsividade | Adaptar grid, navegação, formulários, modais e espaçamento sem depender de tamanhos fixos | § 28 |

**Importante:** as medidas do Visual Guide são **padrões de design**. As medidas registradas adiante para Home, Catálogo e autenticação são **constatações do código atual**, não substituem automaticamente o guia oficial.

### Hierarquia tipográfica oficial

| Token conceitual | Tamanho | Peso | Uso |
| --- | ---: | ---: | --- |
| `font-display` (escala tipográfica, não confundir com a utility de família de fonte) | 40 px | 700 | Grandes destaques |
| `font-h1` | 32 px | 700 | Título principal |
| `font-h2` | 24 px | 700 | Seção |
| `font-h3` | 20 px | 600 | Subseção |
| `font-body-lg` | 18 px | 400 | Destaque textual |
| `font-body` | 16 px | 400 | Corpo |
| `font-body-sm` | 14 px | 400 | Auxiliar |
| `font-caption` | 12 px | 400 | Legenda |

Esses nomes vêm do Visual Guide; **não presumir que existam como utilities CSS**. Em Tailwind, conferir os tokens implementados antes de usá-los.

---

## 1. Ordem de consulta obrigatória

Antes de implementar ou refatorar uma tela:

1. Leia `docs/Visual Guide V1.md` (identidade e princípios oficiais; ajuste o caminho conforme o repositório).
2. Consulte `Design Tokens V1` e `Component Reference V1`, **se disponíveis**; não presumir seu conteúdo sem lê-los.
3. Leia `src/index.css` (tokens reais do Tailwind v4).
4. Consulte `src/components/ui/` e `src/components/ui/styles.ts` (componentes, foco e alturas).
5. Consulte `src/components/layout/` e `src/router.tsx` (estrutura global).
6. Compare com a página do mesmo tipo (`HomePage`, `CatalogPage`, `LoginPage`, `RegisterPage`, etc.).
7. Consulte o protótipo aprovado da funcionalidade. Em caso de conflito, **pergunte antes de redefinir um padrão global**.

**Não invente tokens, endpoints, componentes ou funcionalidades. Não modifique a Home sem alinhamento com a pessoa responsável.**

## 2. Design tokens existentes — `src/index.css`

O projeto utiliza **Tailwind CSS v4** com `@theme`, não depende de um `tailwind.config` para os tokens listados abaixo.

### Tipografia

| Papel | Fonte/classe |
| --- | --- |
| Texto de interface | `font-sans`: Plus Jakarta Sans, fallback system-ui |
| Títulos de marca/destaque | `font-display`: Cinzel, fallback serif |

Use a hierarquia semântica de títulos. **Não aplique Cinzel a todo texto**: o código utiliza `font-display` seletivamente.

### Cores principais

| Token Tailwind | Hex |
| --- | --- |
| `primary-900` | `#660366` |
| `primary-800` | `#4f024f` |
| `primary-700` | `#996699` |
| `primary-500` | `#803d80` |
| `primary-300` | `#b98fb9` |
| `primary-100` | `#f0e3f0` |
| `secondary-700` | `#0969d7` |
| `secondary-500` | `#1688f8` |
| `secondary-300` | `#73b8ff` |
| `secondary-100` | `#e4f1ff` |
| `neutral-0` | `#ffffff` |
| `neutral-50` | `#fafbfe` |
| `neutral-100` | `#f4f4fd` |
| `neutral-200` | `#e6e7f0` |
| `neutral-300` | `#d1d3de` |
| `neutral-500` | `#74788a` |
| `neutral-700` | `#484b5a` |
| `neutral-900` | `#302b40` |

Existem também famílias `success`, `warning`, `error`, `info` e `rare` no mesmo arquivo. **Antes de usar um tom, confirme que o token realmente existe**; por exemplo, `primary-50` e `neutral-600` não estão declarados em `@theme` nesta versão, embora apareçam em alguns componentes.

### Escala, bordas e sombras

- `--spacing: 4px`: utilitários como `p-4` = 16 px, `gap-6` = 24 px, `h-10` = 40 px.
- `--radius-control: 8px`: `rounded-control` para controles quando aplicável.
- `--radius-surface: 12px`: `rounded-surface` para superfícies quando aplicável.
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`: sombras oficiais definidas em `@theme`.
- Fundo e texto padrão do `body`: `bg-neutral-50 font-sans text-neutral-900 antialiased`.
- Foco compartilhado em `src/components/ui/styles.ts`: `focusRing`, com `secondary-500` e `ring-offset`.
- `controlHeight = 'h-10'` (40 px) nos controles que o reutilizam.

**Preferência:** usar os tokens e componentes existentes antes de criar valores hexadecimais ou dimensões arbitrárias.

## 3. Larguras: padrão compartilhado de 1600 px para páginas principais

**Decisão de layout confirmada em 09/10/2026:** as **páginas principais** do TCG Market, incluindo **Home e Catálogo**, devem usar um contêiner de **largura máxima de 1600 px**. O limite é um teto, não uma largura fixa: em telas menores, o contêiner deve ocupar o espaço disponível, com margens responsivas.

**Exemplo de referência para novas páginas principais:**

```tsx
<main className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
  {/* Conteúdo da página */}
</main>
```

Os paddings horizontais são uma referência inicial, **não uma exigência de que toda página use os mesmos paddings internos**. O Catálogo, por exemplo, já utiliza `xl:px-[38px]`; preserve os valores específicos aprovados para a composição da tela.

| Contexto | Estado no `frontend.zip` | Padrão-alvo / orientação |
| --- | --- | --- |
| Home — conteúdo principal | `max-w-6xl` (1152 px), `px-4 py-8` | **Migrar para até 1600 px**; a largura antiga é temporária, não o padrão futuro |
| Header global (`SiteHeader`) | `max-w-6xl`, `px-4 py-3` | **Alinhar ao contêiner de até 1600 px** durante a integração do layout compartilhado |
| Navegação de jogos (`GameNavigation`) | `max-w-6xl`, `px-2` | **Alinhar ao contêiner de até 1600 px**; rolagem horizontal continua restrita à faixa de navegação |
| Footer (`SiteFooter`) | `max-w-6xl`, `px-4 py-10` | **Alinhar ao contêiner de até 1600 px** durante a integração |
| Catálogo | `max-w-[1600px]`, `px-4 sm:px-6 xl:px-[38px]` | **Já corresponde à largura-alvo**; manter seu grid e paddings específicos |
| Outras páginas principais | Variável / ainda não auditadas | **Adotar até 1600 px**, sem copiar sidebar, grid ou banner do Catálogo |
| Formulários de autenticação (`BrandShell`) | Formulário `max-w-md` (448 px) | **Exceção:** formulário estreito e centralizado, mesmo quando a área externa for ampla |
| Modais, diálogos e seções full-width | Larguras próprias por componente | **Exceções intencionais:** largura adequada ao conteúdo ou à viewport |

**Importante:** não editar a Home ou componentes mantidos por outro desenvolvedor apenas para antecipar a migração. A alteração deve ser coordenada com o responsável. Até lá, o código pode continuar com `max-w-6xl` sem que isso altere a regra-alvo documentada.

**A largura de 1600 px não padroniza a composição interna:** número de colunas, sidebar, dimensões dos cards e densidade variam conforme o objetivo da tela.

## 4. Arquitetura global e propriedade das páginas

Estrutura observada no router:

```text
RootLayout
├── HomePage                 (header/footer próprios na versão enviada)
├── LoginPage / RegisterPage (BrandShell)
├── AdminPage                (RequireAuth)
├── DesignSystemPage
└── SiteLayout (rota sem path, id: site-layout)
    ├── SiteHeader
    ├── GameNavigation
    ├── Outlet -> CatalogPage
    └── SiteFooter
```

- `SiteLayout` é componente de rota e utiliza `<Outlet />`; não exige `children`.
- A `CatalogPage` **não** deve duplicar header/footer.
- A Home enviada ainda possui sua própria implementação de navegação e footer. **Não substituí-los automaticamente**, para evitar conflitos de trabalho.
- `BrandShell` é um layout diferente, adequado a autenticação; usa `children` porque é chamado como wrapper React, não como rota pai com `Outlet`.
- Manter a lógica existente de sessão, menus, notificações e acessibilidade.

## 5. Medidas reais do Catálogo — `src/pages/CatalogPage.tsx`

| Elemento | Valor observado |
| --- | --- |
| Fundo | `#FAFBFE` (equivale a `neutral-50`); texto específico `#171443` |
| Contêiner | `max-w-[1600px]`, `px-4 sm:px-6 xl:px-[38px]`, `pt-4` |
| Banner | `min-h-[116px]`, `mb-4`, `px-6 py-5 sm:px-8`, `rounded-xl` |
| Grade principal | `lg:grid-cols-[280px_minmax(0,1fr)]` |
| Grade principal em `xl` | `xl:grid-cols-[335px_minmax(0,1fr)]` |
| Espaço entre filtros e resultados | `gap-4` (16 px), `xl:gap-[26px]` |
| Sidebar | `p-4`, `rounded-xl`, `lg:min-h-[590px]` |
| Grid de cartas | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5` |
| Espaço entre cartas | `gap-2.5` (10 px) |
| Cartas por página | 10 (`PAGE_SIZE = 10`) |
| Padding inferior | `pb-12` (48 px) |
| Busca | `px-3 py-3`, `rounded-lg`, `text-sm` |
| Filtros em telas menores | botão mostra/oculta; sidebar visível a partir de `lg` |

### Cartas — `src/components/catalog/CatalogCard.tsx`

- Área de arte `aspect-[4/5]`, `p-3`, fundo `neutral-50`.
- Imagem `h-full w-full object-contain`: **não cortar a imagem** com `object-cover`.
- Corpo `p-3.5`, `gap-2`; nome `font-display text-sm`; metadados `text-xs`.
- Hover usa leve escala da arte; preservar foco visível e clique por teclado.
- O clique na carta na página atual abre diretamente `AddToCollectionModal`.

### Modal de coleção — `src/components/catalog/AddToCollectionModal.tsx`

- Overlay `fixed inset-0 z-50`, `p-4`.
- Janela `w-full max-w-[744px] max-h-[92dvh] overflow-y-auto rounded-3xl`.
- Conteúdo interno `grid gap-6 p-5`, duas colunas a partir de `md` (`276px` + restante).
- Imagem com `aspect-[3/4]` e `object-contain`.
- Existe também `CardDetailsModal.tsx` no repositório, mas **não é o modal acionado no clique do Catálogo nesta versão**. Não alterar o fluxo sem alinhamento.

## 6. Home — implementação atual e migração planejada

Referência: `src/pages/HomePage.tsx`.

- **Estado atual do ZIP:** conteúdo `max-w-6xl space-y-10 px-4 py-8` (**1152 px; temporário**).
- **Estado-alvo aprovado:** atualizar o contêiner principal para `max-w-[1600px]` e revisar o alinhamento de header, navegação e footer com a equipe responsável. Não ampliar automaticamente o tamanho dos cards ou a quantidade de colunas.
- Hero `min-h-88`, `rounded-3xl`, título `text-4xl sm:text-5xl`.
- Grid de jogos `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, `gap-3`.
- Destaques: `sm:grid-cols-2 xl:grid-cols-4`, `gap-3`.
- Bloco de anúncios + lateral: `lg:grid-cols-[minmax(0,1fr)_320px]`, `gap-6`.
- Cards da Home usam frequentemente `rounded-2xl`, ao passo que painéis do Catálogo usam `rounded-xl`.

**Conclusão:** manter coerência de tokens e componentes, mas respeitar densidade, raios e proporções específicas de cada tela. Não uniformizar à força layouts com funções diferentes.

## 7. Componentes compartilhados e acessibilidade

Consulte `src/components/ui/` antes de criar variantes locais. A versão enviada inclui `Alert`, `Badge`, `Button`, `Card`, `Checkbox`, `Dropdown`, `Input`, `Modal`, `Navigation`, `Select`, `Logo`, `Icon`.

- Botões: preferir `Button` e variantes existentes (`primary`, `secondary`, `outline`, `ghost`, `danger`).
- Campos: preferir `Input`/`Select`; verificar altura e foco em `styles.ts`.
- Modal genérico: preferir `Modal` quando os requisitos coincidirem; não trocar modais específicos sem revisar interações.
- Respeitar `focus-visible`, labels, estados `disabled`, semântica e fechamento de diálogos.
- Não criar overflow horizontal na página. Navegação de jogos pode rolar horizontalmente dentro do próprio componente.

## 8. Responsividade

Breakpoints utilizados no código: `sm`, `md`, `lg`, `xl`. Use os breakpoints padrão do Tailwind configurado no projeto, sem inventar outros.

- **Mobile:** contêineres com padding lateral, grids compactos, filtros recolhíveis.
- **Tablet:** aumentar colunas progressivamente sem comprimir imagens ou controles.
- **Desktop:** sidebar no Catálogo a partir de `lg`; layouts de duas colunas quando houver espaço.
- **Desktop amplo:** Catálogo com cinco colunas e sidebar de 335 px em `xl`.
- Testar visualmente telas estreitas e largas; `minmax(0,1fr)`/`min-w-0` quando necessário para evitar overflow.

## 9. Diferenças e pendências detectadas — não tratar como padrão aprovado

1. **Tokens usados sem declaração em `@theme`:** alguns componentes usam classes como `bg-primary-50`, `text-neutral-600` e `bg-neutral-950/65`, que não aparecem entre os tokens personalizados de `src/index.css`. Revisar antes de depender dessas classes; não adicionar tokens por suposição.
2. **Cores literais no Catálogo:** há vários hexadecimais diretamente nas classes, mesmo quando existem cores próximas no design system. Uma eventual migração exige aprovação visual.
3. **Duplicação temporária de header/footer:** Home e `SiteLayout` têm implementações distintas. Consolidar apenas em tarefa específica e coordenada; nessa integração, alinhar os contêineres compartilhados ao padrão-alvo de 1600 px.
4. **Questão de código no router:** no `src/router.tsx` enviado, `catalogRoute` referencia `siteLayoutRoute` antes da declaração de `siteLayoutRoute`. A ordem precisa ser corrigida antes de executar/buildar. Isso é um problema técnico, não uma convenção de layout.
5. **Divergência com o Visual Guide — raios:** o guia oficial especifica 12 px para cards/modais genéricos, enquanto a Home usa `rounded-2xl` e o modal específico do Catálogo usa `rounded-3xl`. São exceções **observadas**, não aprovadas automaticamente; revisar com a equipe antes de generalizar.
6. **Divergência com o Visual Guide — espaçamento e controles:** a busca do Catálogo usa `py-3`, o que pode resultar em altura diferente dos 40 px oficiais para Input/Select. Verificar componente real antes de uniformizar.
7. **Divergência com o Visual Guide — cores:** o Catálogo usa `#171443` e outros hexadecimais diretos, apesar do texto oficial `neutral-900 #302B40`. Reconciliar apenas mediante revisão visual.
8. **Questão de React no Catálogo:** há `setState` síncrono em `useEffect` para redefinir filtros/paginação; o linter pode sinalizar. Corrigir separadamente, sem mudar o visual.

## 10. Checklist para novas telas

- [ ] Consultei o **Visual Guide V1**, `index.css`, componentes `ui` e layouts existentes.
- [ ] Usei a hierarquia de tipografia e a semântica de cores oficiais; não confundi tokens documentados com utilities já existentes.
- [ ] Comparei controles (40 px), raios e espaçamento com o Visual Guide; registrei exceções.
- [ ] Usei `max-w-[1600px]` como limite das páginas principais, preservando exceções (formulários, modais, seções full-width) e a responsividade.
- [ ] Usei fontes e cores existentes e verifiquei os nomes dos tokens.
- [ ] Mantive a estrutura de header/footer da rota, sem duplicação.
- [ ] Preservei o comportamento do protótipo aprovado.
- [ ] Validei `sm`/`md`/`lg`/`xl` e ausência de overflow indevido.
- [ ] Usei componentes compartilhados e foco/labels acessíveis.
- [ ] Não alterei arquivos de outro responsável sem combinar.
- [ ] Executei TypeScript, lint e build quando disponíveis; reportei resultados reais.

## 11. Instrução pronta para outra IA

> Implemente a funcionalidade solicitada no frontend TCG Market. Considere o `Visual Guide V1` como referência oficial de identidade visual e leia `frontend/docs/LAYOUT_GUIDELINES.md`, `src/index.css`, `src/components/ui`, `src/components/layout` e a página mais parecida. Preserve React, TypeScript, Tailwind v4 e TanStack Router. Use os tokens existentes; não crie novos valores arbitrários. **Páginas principais têm largura máxima-alvo de 1600 px**, mas não devem copiar o grid ou a sidebar do Catálogo. **No ZIP auditado**, a Home ainda usa `max-w-6xl` (1152 px) e **será migrada para 1600 px**; o Catálogo já usa `max-w-[1600px]`. A autenticação usa `BrandShell` com formulário `max-w-md` como exceção. Não duplique header/footer nem altere a Home sem alinhamento. Preserve o fluxo atual de clique nas cartas e a integridade das imagens (`object-contain`). Diferencie padrões observados de recomendações e aponte inconsistências em vez de corrigi-las silenciosamente. Informe os arquivos alterados e os testes executados.

## 12. Evolução do documento

Ao aprovar novos padrões, atualize esta documentação no mesmo PR e registre se a regra é **global**, **por tipo de tela** ou **exclusiva de uma página**. Este documento não substitui o design system nem a decisão da equipe.


## 13. Registro de origem e manutenção

- **Oficial, documento da equipe:** `Visual Guide V1.md` (V1, Milestone 1). Os valores na seção 0 foram transcritos/sintetizados desse guia.
- **Observado no código:** `frontend.zip` analisado para a revisão anterior, descrito nas seções 2–9. Pode mudar após novos commits.
- **Decisão de padronização posterior ao ZIP:** largura máxima de 1600 px para Home, Catálogo e demais páginas principais; Home e contêineres compartilhados ainda pendentes de migração.
- **Recomendação editorial:** ordem de leitura, política de conflitos e checklist deste arquivo.
- **Ainda não verificados:** conteúdo integral de `Design Tokens V1` e `Component Reference V1`; validar quando forem enviados.

Ao alterar tokens ou componentes, atualize este arquivo e indique no PR **o que é regra oficial, o que foi implementado e o que ainda está pendente de aprovação**.
