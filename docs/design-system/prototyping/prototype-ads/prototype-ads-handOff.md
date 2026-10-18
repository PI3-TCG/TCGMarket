# TCGMarket — Handoff de Design: Marketplace

> **Projeto:** Projeto Integrador 3 (PI3) — TCGMarket  
> **Área:** Marketplace — listagem de anúncios  
> **Tipo de entrega:** Protótipos de alta fidelidade + especificação visual  
> **Situação:** Prototipação visual consolidada; implementação ainda não realizada por este entregável  
> **Documento complementar:** `02_Especificacao_Funcional_Marketplace.md`  
> **Validação:** `03_Checklist_de_Aceite_e_QA.md`

## 1. Objetivo

Documentar a experiência visual da página principal do Marketplace para que visitantes e usuários possam **descobrir, pesquisar, filtrar e acessar anúncios ativos** de cartas colecionáveis, identificando com clareza se um anúncio é destinado a **venda**, **troca** ou **venda + troca**. A interface deve reutilizar a identidade e os componentes já aprovados para o TCGMarket.

**Fora deste entregável:** implementação em HTML/React, endpoints funcionais, fluxo de pagamento, chat, conclusão de compra, publicação de anúncios e tela completa de detalhes do anúncio. A navegação **até** os detalhes é contemplada; o desenvolvimento dessas funções pertence a outras tarefas.

## 2. Identidade visual e Design System

### 2.1 Paleta

| Token | Valor / origem | Aplicação |
|---|---|---|
| Primária P1 | `#660366` | Botões principais, ênfase, áreas de destaque |
| Primária P2 | `#996699` | Detalhes, superfícies de apoio, estados suaves |
| Primária P3 | `#C8A2C8` | Fundos de chips roxos, bordas e destaques leves |
| Modalidade `Venda` | **Família roxa do Design System** | Badge com ícone de carrinho + texto "Venda" |
| Modalidade `Troca` | **Família azul secundária do Design System** | Badge com ícone de troca + texto "Troca" |
| Neutros | Escala neutra previamente aprovada | Fundo claro, cartões brancos, texto, divisórias |
| Feedback | Tokens semânticos já aprovados | Sucesso, aviso, erro e informação |

**Não trocar a semântica:** `Venda = roxo` e `Troca = azul`. Os ícones e os textos devem aparecer **além** da cor, para não depender da percepção cromática. Os tons exatos de azul, textos contrastantes e estados hover/focus devem ser recuperados do Design System oficial, sem inventar novos hexadecimais.

### 2.2 Tipografia

- **Cinzel:** título da página, títulos de destaque e elementos de caráter fantástico; preços e informações-chave podem usar Cinzel em peso forte conforme o componente aprovado.
- **Plus Jakarta Sans:** navegação, filtros, descrição, labels, botões, mensagens, contadores e metadados.
- Manter escala e tokens tipográficos aprovados, com pesos distinguindo conteúdo principal de metadados.

### 2.3 Componentes e linguagem

- **Ícones:** Lucide quando aplicável; ícones personalizados de TCG apenas se já integrantes da biblioteca aprovada.
- **Espaçamento:** usar a escala do projeto (`4–64`); evitar medidas arbitrárias no código.
- **Raios:** `4 / 8 / 12 / 16`, segundo a hierarquia de componentes existente.
- **Superfícies:** fundo principal claro; cartões brancos; bordas e sombras discretas; roxo usado pontualmente, sem tornar todo o conteúdo escuro.
- **Microinterações:** hover/focus visível, sem movimentação excessiva de layout; elementos desabilitados distinguíveis.
- **Acessibilidade:** verificar contraste de texto e foco; não confiar somente nas cores dos badges.

## 3. Anatomia da página

```text
[Navbar global / largura total]
[Breadcrumb + hero de Marketplace / largura total]
[Atalhos por TCG / no hero]
+---------------------------+-----------------------------------------------+
| Painel lateral de filtros | Contador + ordenação + modo de visualização    |
| (alinhado ao topo do      | Grid de anúncios: no máximo 5 colunas         |
| painel de listagem)       | (20 anúncios por página)                      |
|                           | Paginação                                    |
+---------------------------+-----------------------------------------------+
[Footer global / largura total]
```

### 3.1 Navbar padrão

Reutilizar o **mesmo componente global** do projeto e de "Minha Coleção": logotipo TCGMarket, links `Explorar`, `Catálogo`, `Marketplace`, `Trocas`, `Coleção`, busca global e controles de conta. O item **Marketplace** indica a rota ativa. Navbar ocupa toda a largura da viewport, sem sidebar lateral substitutiva.

**Atenção:** a busca da navbar é um componente **global**. A busca presente no painel do Marketplace tem **escopo restrito aos anúncios**, e não deve ser confundida com a busca do catálogo ou da coleção pessoal.

### 3.2 Hero e navegação de categorias

- Hero/banner se estende horizontalmente por toda a área disponível, abaixo da navbar.
- Breadcrumb: `Início > Marketplace`.
- Título: **Marketplace**.
- Descrição de apoio: "Compre, venda e troque cartas de diversos TCGs em um só lugar."
- Atalhos para jogos, com estado selecionado visível e opção **Todos**.
- Os atalhos por jogo e o filtro `TCG` da lateral refletem **o mesmo estado**: alterar um atualiza o outro.
- **Importante:** as artes incluem Pokémon, Magic, Yu-Gi-Oh!, One Piece e Digimon como representação visual. A visibilidade de categorias na implementação deve corresponder aos TCGs realmente habilitados no produto; não presumir integração concluída para todos.

### 3.3 Sidebar de filtros

Começa **na mesma altura do cabeçalho da listagem**, abaixo do hero — nunca alinhada ao topo do banner. Campos previstos:

1. Busca específica do Marketplace.
2. TCG.
3. Coleção / Set (dependente do TCG quando aplicável).
4. Raridade oficial.
5. Condição da carta.
6. Modalidade: Venda e/ou Troca.
7. Faixa de preço (somente para anúncios com venda).
8. Idioma.
9. **Aplicar filtros** e **Limpar filtros**.

Ao lado/abaixo do contador, mostrar filtros ativos como **chips removíveis** quando houver critérios não padrão. Ordenação e alternância de grade/lista ficam acima dos resultados; o modo lista só deve ser interativo quando tiver uma variante definida ou implementada.

### 3.4 Área de anúncios

- **Máximo:** **5 cards por linha** em desktop amplo.
- **Página:** **20 anúncios**; em 5 colunas são até 4 linhas, caso haja 20 resultados.
- Um card representa **um anúncio ativo**, não uma carta abstrata do catálogo nem um agrupamento de posse pessoal.
- Cards com a mesma altura visual sempre que possível, preservando CTA alinhado inferiormente.
- Cada card inteiro ou o botão "Ver detalhes" deve conduzir ao **anúncio específico**; clique no coração ou em outras ações não pode disparar também a navegação do card.
- Dados sempre dinâmicos. Quantidade de resultados, preços e avaliações **não são fixos** e não devem ser copiados do mockup.

### 3.5 Paginação e footer

- Contador no formato `Exibindo 1–20 de N anúncios` na primeira página cheia.
- Página corrente identificada; controles anterior/próxima somente quando aplicáveis.
- **Tamanho fixo de 20 por página nesta entrega.** Se o mockup tiver seletor `20 por página`, exibi-lo como indicação fixa ou removê-lo até existir requisito de tamanhos alternativos.
- Footer padrão, com logotipo, tagline "Sua coleção, suas trocas, novos mundos.", grupos institucionais/de navegação e redes sociais; sem criar footer exclusivo do Marketplace.

## 4. Componente: Card do anúncio

### 4.1 Hierarquia de informações

1. **Imagem da carta** (ou placeholder se ausente) com proporção constante.
2. Favorito, se disponível como funcionalidade; a ausência dessa feature não impede a navegação.
3. TCG e coleção/set (badges informativos, diferentes das badges de modalidade).
4. **Nome da carta**.
5. Número da carta e raridade, se existirem.
6. **Modalidade(s) de anúncio**: atributos claros e persistentes, com ícone + texto.
7. Condição e idioma do **exemplar anunciado**.
8. Vendedor, e reputação **somente quando o dado estiver disponível e aprovado**.
9. **Preço**, exclusivamente quando for um anúncio com venda e houver valor cadastrado.
10. **CTA principal:** `Ver detalhes`.

Não exibir contador de exemplares da coleção pessoal (`x3`, `x4`) no card de Marketplace, pois a quantidade do anúncio tem semântica distinta.

### 4.2 Três variantes visuais obrigatórias

| Tipo | Atributos exibidos | Preço | CTA |
|---|---|---|---|
| **Somente venda** | Badge **Venda roxa** | Mostrar preço cadastrado | Ver detalhes |
| **Somente troca** | Badge **Troca azul** | **Não mostrar valor de venda** | Ver detalhes / conhecer proposta de troca |
| **Venda + troca** | Badges **Venda roxa** e **Troca azul**, simultâneas | Mostrar preço cadastrado | Ver detalhes |

**Fonte visual principal:** `02_cards_modalidades.png`.

Para "Somente troca", **não apresentar carrinho de compras**: o mockup do board tem um ícone secundário genérico por coerência de composição, mas ele não deve acionar compra quando não existe venda. O atalho de carrinho, caso seja implementado em outra tarefa, será restrito a anúncios com venda e fluxos de compra suportados. Para esta tarefa, **"Ver detalhes" é suficiente e é o CTA obrigatório**.

Caso a equipe decida exigir preço para publicar anúncios com venda, esta será uma validação **do fluxo de cadastro de anúncios**, a ser confirmada com o PO. Neste handoff, apenas garantimos que não se fabrica nem se exibe um preço indisponível.

### 4.3 Imagem ausente

O erro de imagem é **local ao card**: o restante do card continua disponível, inclusive nome, modalidades, preço e botão de detalhes. Renderizar placeholder, ícone ilustrativo de imagem, texto/alt equivalente `Imagem indisponível` e manter as dimensões da mídia. Não substituir por arte de outra carta.

## 5. Estados visuais de interface

| Estado | Gatilho | Representação e comportamento |
|---|---|---|
| **Normal** | Resposta com anúncios | Grid, contador, filtros, paginação e footer |
| **Loading** | Busca inicial, troca de página ou filtros | Skeleton dos cards no lugar da grade, sem números/resultados inventados; `Carregando anúncios...` |
| **Marketplace sem anúncios** | Não há anúncios ativos e a consulta está sem critérios de busca/filtro | Ilustração, mensagem `Ainda não há anúncios no marketplace`; CTA de anúncio condicionado à autorização do usuário |
| **Pesquisa sem resultados** | Consulta textual não encontra correspondência | Mensagem `Nenhum resultado encontrado`; busca preservada; ação `Limpar busca` |
| **Filtros sem resultados** | Filtros selecionados não encontram correspondência | Mensagem `Nenhum anúncio com esses filtros`; chips preservados; ação `Limpar filtros` |
| **Erro ao carregar** | Rede/servidor indisponível | Ilustração de aviso; `Não foi possível carregar os anúncios`; `Tentar novamente` |
| **Imagem indisponível** | URL ausente/quebrada em anúncio individual | Placeholder apenas naquela mídia; informações e navegação preservadas |

**Correções de interpretação dos mockups:**

- Não exibir paginação como `1` quando o total for **zero**.
- Durante falha de carregamento, não afirmar `0 anúncios` — o total é **desconhecido**, não zero.
- Loading não deve preservar um total antigo fingindo ser o resultado da busca atual.
- Skeletons são representação do estado, não anúncios reais.
- Não inserir CTA para anunciar que burle a autenticação; visitante deve seguir ao login/cadastro e depois retornar ao fluxo, se essa ação estiver disponível.

## 6. Responsividade (diretriz para implementação)

O protótipo é **desktop-first** e deve se adaptar sem ultrapassar 5 cards por linha:

- **Desktop largo:** até 5 colunas e sidebar visível.
- **Desktop estreito/tablet:** reduzir colunas conforme a largura disponível, preservando leitura e botões clicáveis; sidebar pode virar painel recolhível.
- **Mobile:** grid reduzido, filtro em drawer com botão visível, navbar adaptada e paginação acessível.
- **20 anúncios por página** permanece igual em todos os tamanhos; o número de **colunas** muda, não o `size`.
- Breakpoints exatos devem reutilizar os do front-end/Design System; os mockups não aprovam novos números rígidos.

## 7. Acessibilidade e interações

- Busca, filtros e botões possuem rótulos acessíveis; ícones isolados necessitam nome (`aria-label`).
- Badges de modalidade possuem **palavra + ícone**, não apenas cor.
- Teclado: focos visíveis e ordem lógica (navbar → hero → filtros → ordenação → cards → paginação → footer).
- Erros e estados sem resultado são comunicados em texto, não apenas por imagem.
- Imagens de carta utilizam `alt` descritivo quando disponíveis; imagens decorativas do hero não devem ser lidas como dados.
- Cards acionáveis não contêm áreas com eventos concorrentes sem prevenção de propagação.
- As cores precisam ser validadas em contraste no front-end, não inferidas da geração da imagem.

## 8. Handoff para front-end

**Componentes recomendados (nomes referenciais, não imposição de arquitetura):**

- `MarketplacePage`, `MarketplaceHero`, `MarketplaceFilters`, `MarketplaceToolbar`
- `MarketplaceAdCard`, `AdModalityBadge`, `SellerSummary`, `AdCardImage`
- `MarketplacePagination`, `MarketplaceEmptyState`, `MarketplaceErrorState`, `AdCardSkeleton`
- `GlobalNavbar`, `GlobalFooter` **reutilizados**

**Dados mínimos para renderizar:** `adId`, `status`, `cardName`, `game`, `setName/setCode` (quando houver), `cardNumber`, `rarity`, `imageUrl`, `condition`, `language`, `modalities`, `price` (quando houver), e identificação pública do vendedor. Avaliações somente se houver fonte confiável. Campos ausentes não recebem valores fictícios.

Os parâmetros e regras de interação estão detalhados na **Especificação Funcional**. A **Checklist de Aceite e QA** cobre os cenários de validação.

## 9. Revisões pendentes de produto (não bloqueiam o handoff visual)

1. Confirmar quais TCGs estarão ativos na primeira versão (a arte mostra cinco, mas a disponibilidade técnica pode ser menor).
2. Confirmar se preço será obrigatório em anúncios com venda e qual mensagem aparece em caso de preço ausente.
3. Confirmar regras de autenticado/não autenticado para favoritar, anunciar e carrinho, caso essas ações façam parte do produto inicial.
4. Confirmar opções oficiais de ordenação (em especial "Mais relevantes" e anúncios sem preço).
5. Confirmar se a visão em lista será desenvolvida nesta entrega ou apresentada como evolução futura.

**Conclusão:** O design visual da listagem e dos estados foi produzido. O aceite final exige checagem de coerência com as regras documentadas, especialmente modalidades roxo/azul, anúncios somente troca, paginação de 20 e tratamento de estados zerados ou com erro.
