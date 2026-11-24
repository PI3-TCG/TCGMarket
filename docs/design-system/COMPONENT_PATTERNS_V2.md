# TCGMarket — Padrões de componentes e interação v2.2

> **Status:** especificação técnica para DS-01, aguardando aprovação do contrato visual.  
> **Fonte:** §2.5 e §§3–6 do `TCGMARKET_DESIGN_SYSTEM_V2_2_COMPLETO.md`; detalhamento de componentes da revisão 2.2.  
> **Norma base:** [`DESIGN_SYSTEM_V2.md`](./DESIGN_SYSTEM_V2.md). Não criar novas regras de negócio neste documento.

## 1. Princípios de composição

A identidade fantasy commerce está **na estrutura e em poucos pontos ornamentais**, não em todos os controles. Compartilhar estilo e semântica, preservar regras de negócio específicas de cada página. Componentes reutilizáveis devem evitar dependência de sessão, API ou roteamento quando não precisam deles.

- `@theme` em `frontend/src/index.css`: única fonte executável de tokens.
- `frontend/src/assets/design-system/`: diretório canônico dos SVGs e textura.
- Classes legadas só podem ser removidas depois de verificar os consumidores.
- Todo estado visual deve ter equivalente acessível (texto, ícone, nome ou atributo).

## 2. Matriz de contratos

| Componente | Responsabilidade visual | Comportamento obrigatório | Ornamentação |
|---|---|---|---|
| `SiteHeader` | Marca, busca, navegação, conta, notificações | Links reais, fechamento de menu, foco, Ctrl+K existente | Plum + filete fino |
| `MobileBottomNavigation` | Cinco destinos essenciais | Não cobrir conteúdo; safe area; expandir/fechar Explorar | Plum contextual |
| `SiteFooter` | Institucional e redes | Somente URLs HTTPS reais; `alt` adequado | Plum + filete fino |
| `PageBanner` | Breadcrumb, H1, arte/overlay | Título não pode ser cortado | Contextual |
| `GoldFrame` (planejado) | Moldura reutilizável de espaços específicos | Não conter lógica de domínio | Forte, mapa controlado |
| `SectionTitle` (planejado) | H2 com linhas e losango | Heading semântico | Contextual |
| `Button` | CTA, loading, disabled e foco | Botão para ação; link para navegação | Nenhuma |
| `Input` e `Select` | Valor, label, hint, erro | Teclado, `aria-invalid`, `aria-describedby` | Nenhuma |
| `Dropdown` | Menu/seleção de opções | Escape, teclado, foco e estado expandido | Nenhuma |
| `Badge` | Raridade/estado/condição | Cor não é único canal de significado | Nenhuma |
| `Card` e cards especializados | Superfície comum; composição própria | Não mostrar preço/ação sem dado válido | Leve, borda bege |
| `ResponsiveFilters` | Filtros desktop/mobile | Controles acessíveis, estado preservado | Painel pode ter moldura |
| `Modal` / `modalTheme` | Overlay, foco, título, ações | Escape e retorno de foco, sem modal sobre modal | Forte **somente** nos modais indicados |
| `AdminPanel` / dashboard | Indicadores, tabelas, erros | Dados reais, falhas isoladas | Funcional |

`GoldFrame` e `SectionTitle` são **componentes planejados** no roteiro, não afirmar que já estão implementados enquanto não existirem no repositório.

## 3. Header / Footer

**Desktop:** marca à esquerda; menu Explorar (Pokémon, Yu-Gi-Oh!, Magic); Marketplace e Minha Coleção; busca global; carrinho; notificações quando disponíveis; menu do usuário. A busca deve manter o Ctrl+K **enquanto** a #237 não ratificar sua remoção. Não adicionar indicação visual do atalho por padrão.

**Estado observado no CSS:** `SiteHeader` usa `position: relative`. A aprovação de sticky é independente da aparência da navbar. Nunca alterar para fixed/sticky apenas por estética.

**Mobile:** header compacto, ações essenciais e barra inferior com **Início, Explorar, Carrinho, Coleção e Perfil**. `44×44px` é alvo recomendado para toque. Usar `env(safe-area-inset-bottom)` quando aplicável. Busca e menus não devem sobrepor conteúdo.

**Footer:** marca/copyright; links sociais somente com endereço HTTPS válido. Ícones com nomes acessíveis nos links. Se não houver URLs, a seção social não é renderizada.

## 4. Banners e imagens

- Hero da Home: ilustração licenciada, fundo plum/overlay para leitura, moldura dourada com cantos nos pontos aprovados.
- Banner interno: H1 em Cinzel, breadcrumb acima do título, altura adaptativa; evitar quebras rígidas (`<br />` para forçar layout).
- Não usar `-webkit-text-stroke` para compensar imagem ilegível.
- Foto decorativa: `alt=""` e `aria-hidden`; imagem informativa: descrição apropriada.
- Imagens de cartas: aspecto visual ~5:7, `object-fit: contain`, sem distorcer arte, sem usar mockup como carta real.

## 5. Botões, campos e filtros

- Botões: primário plum, textos acessíveis, foco perceptível; controlar loading/disabled sem click falso.
- Inputs/selects: label sempre definido; mensagem de erro ligada ao campo; estado inválido perceptível sem depender apenas de cor.
- Menus/selects customizados: setas, Enter, Escape e rolagem ao item ativo quando pertinente; preservar API já consumida.
- Filtros: lado desktop com largura fluida de referência 240–264 px; mobile deve abrir/fechar sem perder seleções.
- Chips: valor semanticamente correto, contraste verificado com os tons reais do fundo.
- Dourado claro decorativo **não substitui** foco de alta visibilidade.

## 6. Cards e listagens

`CatalogCard`, `MarketplaceAdCard` e `CollectionItemCard` compartilham **superfície, imagem, espaçamento e estados visuais**, mas possuem responsabilidades distintas:

| Contexto | Dados válidos | Ação correta |
|---|---|---|
| Catálogo | Carta, jogo, edição, raridade | Detalhe em página; inclusão na coleção quando autenticado |
| Marketplace | Anúncio, disponibilidade, preço real, vendedor | Ver oferta/comprar somente quando fluxo permitido |
| Minha Coleção | Carta possuída, idioma, condição e quantidade | Gerenciar item; criar anúncio quando cabível |

Card padrão: `surface.default`, borda `border.default`, raio 12 px, sombra discreta; nome legível em até duas linhas quando apropriado. Coração/favorito, avaliação e contagem de vendas são **funcionalidades condicionais**, nunca ícones inertes.

**Responsividade:** desktop até 4 colunas quando a largura permitir, tablet 2–3 e mobile 1–2 conforme legibilidade. Home tem limite independente de **8 anúncios**.

## 7. Modal e checkout

**Modal:** overlay plum, moldura com ornamentos apenas no detalhe/ação que pede esse tratamento; título visível (Crimson Text), foco e Escape. Não empilhar modal sobre modal. Modal de detalhe da coleção pode continuar modal; catálogo segue página de detalhe.

**Checkout:** stepper legível, círculos numerados, estado concluído com check, etapa atual destacada; resumo do pedido pode usar moldura contextual; formulário, carrinho e entrega mantêm borda bege. Não alterar regras de frete, autorização ou compra.

## 8. Administração e autenticação

Admin: consistência de fontes e tokens sem ornamentos excessivos. Cards, gráficos e listas podem carregar/falhar independentemente; nunca fabricar totais ou vendas.

Auth: formulário legível e reduzido, preservando login/cadastro, sem disputar espaço com decoração. A identidade da marca deve ser consistente com as páginas públicas.

## 9. Acessibilidade e definição de pronto

- [ ] Sem erros de TypeScript/build e sem imports ausentes.
- [ ] Testes em `320`, `390`, `768`, `1024`, `1440`, `1600` px e zoom 200%.
- [ ] Texto comum ≥ 4,5:1; texto grande e gráfico essencial ≥ 3:1 (WCAG 2.2 AA).
- [ ] Foco visível; Tab, Enter, Espaço, Escape apropriados.
- [ ] Rótulos acessíveis, semântica, `aria-current`, `aria-expanded`, `aria-controls` quando aplicáveis.
- [ ] Estados de loading, vazio e erro honestos e independentes.
- [ ] Screenshots antes/depois e regressões testadas.
- [ ] Comportamento e contratos HTTP preservados.
- [ ] Respeito a `prefers-reduced-motion`.

Ver também [`IMPLEMENTATION_ROADMAP_V2.md`](./IMPLEMENTATION_ROADMAP_V2.md) e a fonte histórica consolidada.
