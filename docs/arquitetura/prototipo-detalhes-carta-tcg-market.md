# Protótipo da Tela de Detalhes da Carta - TCG Market

## Objetivo

Definir como funciona a tela de detalhes de uma carta do catálogo: quais
informações aparecem, em que ordem, como a tela se comporta quando algum
dado não existe e como o usuário entra no fluxo de adicionar a carta à
coleção.

A base visual é o protótipo que já existe no projeto:

`docs/design-system/prototyping/wireframe-detalheCartas.png`

O modal aberto pela ação principal já está desenhado em:

`docs/design-system/prototyping/wireframe-adicionarCarta.png`

Este documento complementa o wireframe com os estados alternativos, as
regras para dados opcionais e o mapeamento de cada informação com o
modelo de dados, para orientar a implementação (issue #49).

Referências usadas:

-   `docs/arquitetura/prototipo-catalogo-tcg-market.md` (de onde o
    usuário chega);
-   `docs/arquitetura/fluxo-navegacao-arquitetura-telas.md` (rota e
    regras de acesso);
-   `docs/arquitetura/TCG-32 Arquitetura do Catálogo de Cartas.md`
    (origem dos dados);
-   `docs/diagrams/Manual Descritivo das Classes.md` (atributos de cada
    TCG);
-   `docs/design-system/Visual Guide V1.md`.

------------------------------------------------------------------------

## Rota e acesso

| Rota | Tela | Acesso |
|---|---|---|
| `/cartas/:id` | Detalhes da carta | Público |

Qualquer pessoa pode ver os detalhes de uma carta. Apenas as ações
pessoais (adicionar à coleção e favoritar) exigem login.

O `:id` é o identificador da carta no **catálogo interno** do TCG Market,
não o id da API externa. A tela nunca consulta a API externa
diretamente.

------------------------------------------------------------------------

## Estrutura da tela

A tela é dividida em:

-   Header;
-   Navegação entre os TCGs;
-   Breadcrumb;
-   Bloco principal: imagem, informações e ações;
-   Abas de informações complementares;
-   Painel de anúncios da carta (futuro).

``` text
┌──────────────────────────────────────────────────────────────────────┐
│ Header                                                    Carrinho   │
├──────────────────────────────────────────────────────────────────────┤
│ Magic   Pokémon   Yu-Gi-Oh!   One Piece   Digimon                    │
├──────────────────────────────────────────────────────────────────────┤
│ 🏠 > Pokémon > Scarlet & Violet > 151 > Pikachu                      │
├──────────────┬─────────────────────────────┬─────────────────────────┤
│              │ [Pokémon]                   │ [ ♡ Adicionar aos       │
│              │ Pikachu                     │     favoritos ]         │
│   Imagem     │ 151 • Nº 025/165            │ [ + Adicionar à minha   │
│   da carta   │ [Comum] [Básico] [Elétrico] │     coleção ]           │
│              │                             ├─────────────────────────┤
│              │ Coleção ........... 151     │ Anúncios desta carta    │
│              │ Número ........ 025/165     │ (futuro)                │
│              │ Raridade ........ Comum     │                         │
├──────────────┴─────────────────────────────┤                         │
│ [ Detalhes ]  [ Mais informações ]         │                         │
│ Conteúdo específico do TCG                 │                         │
└────────────────────────────────────────────┴─────────────────────────┘
```

### Header

O header segue a decisão do protótipo do catálogo: o **Carrinho** ocupa
o lugar do botão "Criar anúncio" que aparece no wireframe. O restante
(logo, busca, notificações e perfil) é igual ao das outras telas.

### Navegação entre os TCGs

O TCG da carta fica destacado na barra de jogos, para o usuário saber em
qual catálogo está.

### Breadcrumb

Mostra o caminho até a carta e permite voltar para o catálogo já
filtrado:

`Início > TCG > Set > Nome da carta`

-   **TCG** leva para `/catalogo/:tcg`;
-   **Set** leva para o catálogo do TCG com o filtro de set aplicado;
-   O nome da carta é o item atual e não é um link.

O wireframe mostra também o bloco ("Scarlet & Violet") antes do set. Esse
nível só aparece se o catálogo tiver essa informação; caso contrário o
breadcrumb vai direto do TCG para o set.

------------------------------------------------------------------------

## Hierarquia visual

A ordem de leitura da tela é:

1.  **Imagem da carta**: é a informação mais reconhecível para quem
    coleciona;
2.  **Nome** (`h1`, fonte Cinzel): identifica a carta;
3.  **Set e número**: diferencia esta impressão das outras da mesma
    carta;
4.  **Ação principal "Adicionar à minha coleção"**: botão primário, o
    único com fundo roxo cheio na tela;
5.  **Chips**: raridade e até dois atributos de destaque do TCG;
6.  **Tabela de informações**: dados comuns a todos os TCGs;
7.  **Abas**: dados específicos do TCG e informações da fonte;
8.  **Anúncios**: quando o Marketplace existir.

Cada impressão é uma página própria. O Pikachu de *151* e o Pikachu de
*Base Set* são cartas diferentes no catálogo, cada uma com seu `:id`.

------------------------------------------------------------------------

## Imagem da carta

-   A imagem ocupa a coluna da esquerda, na proporção de uma carta
    (63 × 88);
-   Abaixo dela há a ação **Ver imagem completa**, que abre a imagem
    ampliada em um modal;
-   O texto alternativo segue o formato
    `Nome da carta — Set, Nº número`. Exemplo:
    `Pikachu — 151, Nº 025/165`.

### Galeria de miniaturas

O wireframe mostra quatro miniaturas (frente, verso e ângulos). As APIs
externas usadas hoje devolvem **uma imagem por impressão**. Por isso:

-   Com uma única imagem, a coluna de miniaturas **não aparece** e a
    imagem principal ocupa o espaço;
-   A galeria só aparece quando houver mais de uma imagem, por exemplo
    as duas faces de uma carta de Magic.

------------------------------------------------------------------------

## Informações principais

Ficam na coluna central, abaixo do badge do TCG.

| Elemento | Exemplo | Regra |
|---|---|---|
| Badge do TCG | `Pokémon` | Sempre aparece. Usa o `Badge` do Design System. |
| Nome | `Pikachu` | Sempre aparece. Nomes longos quebram em até duas linhas. |
| Set e número | `151 • Nº 025/165` | Mostra só as partes que existirem. Sem número: `151`. |
| Chips | `Comum` `Básico` `Elétrico` | Raridade primeiro, depois até dois atributos de destaque do TCG. |

### Tabela de informações

Lista os dados comuns a todos os TCGs. Cada linha só aparece se o valor
existir:

| Linha | Exemplo |
|---|---|
| Coleção | `151` |
| Código da coleção | `MEW` |
| Número | `025/165` |
| Raridade | `Comum` |

Abaixo da tabela pode aparecer um texto descritivo da carta (no
wireframe, o texto do Pikachu). Ele só aparece quando o dado existir.

------------------------------------------------------------------------

## Informações específicas de cada TCG

Cada TCG tem atributos próprios, conforme o
`Manual Descritivo das Classes`. Eles aparecem nos chips de destaque e
na aba **Detalhes**.

| TCG | Chips de destaque | Aba Detalhes |
|---|---|---|
| Pokémon | Tipo da carta (Pokémon, Treinador, Energia), tipo de energia | HP, estágio de evolução, ataques (nome, custo e dano), custo de recuo |
| Yu-Gi-Oh! | Tipo da carta (Monstro, Magia, Armadilha), atributo | ATK / DEF, nível / rank / link, tipo de monstro, forma de invocação |
| Magic | Cor, tipo da carta | Custo de mana, custo convertido, poder / resistência, supertipo, texto de regras |
| One Piece | — | Atributos definidos quando houver provedor |
| Digimon | — | Atributos definidos quando houver provedor |

Regras:

-   Cartas de Magia e Armadilha (Yu-Gi-Oh!) não têm ATK, DEF e nível:
    essas linhas não aparecem;
-   Em Magic, poder e resistência só aparecem para criaturas;
-   One Piece e Digimon ainda não têm provedor de dados. Enquanto isso,
    mostram apenas as informações comuns;
-   O wireframe mostra **fraqueza, resistência** e **ilustrador** no
    Pikachu. Esses campos não estão no modelo atual. Eles só aparecem se
    forem adicionados ao modelo do catálogo; até lá, o bloco é omitido.

### Aba Mais informações

Concentra os dados de origem da carta:

-   Fonte dos dados (exemplo: `Pokémon TCG API`);
-   Identificador da carta na fonte (exemplo: `sv3pt5-25`);
-   Outras impressões da mesma carta, quando o catálogo tiver o id
    conceitual (Yu-Gi-Oh! e Magic). Exemplo:
    `Também aparece em: Legend of Blue Eyes, Starter Deck: Kaiba`.

Se nenhum desses dados existir, a aba não aparece e a tela mostra apenas
a aba Detalhes, sem a barra de abas.

------------------------------------------------------------------------

## Ações

Ficam no cartão da coluna da direita, sempre visíveis no desktop.

### Adicionar à minha coleção

Botão primário (`Button` variante `primary`), com ícone `+`.

-   **Usuário logado:** abre o modal **Adicionar carta à coleção**
    (`wireframe-adicionarCarta.png`) sobre a própria tela de detalhes. O
    modal já mostra imagem, nome, set, número e raridade da carta;
-   **Visitante:** vai para o Login. Depois de entrar, volta para esta
    carta e o modal abre automaticamente, preservando a intenção do
    usuário, como definido no fluxo de navegação;
-   **Carta já na coleção** (quando a coleção existir): o botão continua
    disponível, e abaixo dele aparece `Você tem 2 cópias na coleção`, com
    link para Minha Coleção.

Depois de adicionar, o modal fecha e aparece um alerta de sucesso:

`Pikachu foi adicionada à sua coleção.`

### Adicionar aos favoritos

Botão secundário (`Button` variante `outline`), com ícone de coração.

-   Visitante: vai para o Login, como na ação principal;
-   Já favoritada: o coração fica preenchido e o texto muda para
    `Remover dos favoritos`.

Favoritos dependem de uma funcionalidade própria. Enquanto ela não
existir, o botão não é exibido.

------------------------------------------------------------------------

## Anúncios desta carta

O painel "Anúncios desta carta" do wireframe depende do Marketplace, que
pertence a outro milestone.

-   **Enquanto o Marketplace não existir:** o painel não aparece. A
    coluna da direita mostra só o cartão de ações;
-   **Com o Marketplace e sem anúncios:**
    `Nenhum anúncio para esta carta ainda.`;
-   **Com anúncios:** lista até três anúncios, com preço, condição,
    vendedor e avaliação, e o link `Ver todos`, como no wireframe.

------------------------------------------------------------------------

# Estados da tela

Além da tela completa, precisamos representar as situações abaixo. Todas
usam a mesma estrutura e os mesmos componentes; muda apenas o conteúdo.

## Loading

Enquanto a carta carrega, a estrutura da tela aparece em formato de
**skeleton**:

``` text
┌──────────────┬─────────────────────────────┬─────────────────────────┐
│ ░░░░░░░░░░░░ │ ░░░░░░                      │ ░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░░            │ ░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░ │ ░░░░░░░░░░                  │                         │
│ ░░░░░░░░░░░░ │ ░░░░  ░░░░░  ░░░░░          │                         │
│ ░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │                         │
│ ░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │                         │
└──────────────┴─────────────────────────────┴─────────────────────────┘
```

-   Header, barra de TCGs e breadcrumb continuam visíveis. O último item
    do breadcrumb mostra `Carregando...`;
-   Os botões de ação aparecem desativados até a carta carregar.

------------------------------------------------------------------------

## Dados opcionais ausentes

Uma carta pode chegar só com os dados obrigatórios (nome e TCG). A tela
continua equilibrada porque cada bloco se ajusta ao que existe:

-   Linhas sem valor não aparecem. A tela nunca mostra `null`,
    `undefined`, `-` ou campos vazios;
-   Se um bloco inteiro ficar vazio (descrição, aba Detalhes, aba Mais
    informações), ele não aparece;
-   A linha de set e número mostra apenas o que existir;
-   Sem raridade, o chip de raridade não aparece;
-   O botão **Adicionar à minha coleção** aparece sempre, porque não
    depende de dados opcionais.

Exemplo de uma carta com o mínimo de informações:

``` text
┌──────────────┬─────────────────────────────┬─────────────────────────┐
│              │ [Digimon]                   │ [ + Adicionar à minha   │
│   Imagem     │ Agumon                      │     coleção ]           │
│   da carta   │ BT1                         │                         │
│              │                             │                         │
│              │ Coleção .............. BT1  │                         │
└──────────────┴─────────────────────────────┴─────────────────────────┘
```

------------------------------------------------------------------------

## Imagem indisponível

Quando a carta não tem imagem, ou a imagem não carrega, aparece um
placeholder no mesmo tamanho e proporção da imagem, para o layout não
mudar:

``` text
┌────────────────────┐
│                    │
│                    │
│        🃏          │
│                    │
│ Imagem indisponível│
│                    │
│                    │
└────────────────────┘
```

-   O placeholder usa fundo `neutral-100` e texto `neutral-500`;
-   A ação **Ver imagem completa** não aparece;
-   As demais informações continuam normalmente.

------------------------------------------------------------------------

## Erro ao carregar a carta

Há dois casos, com mensagens diferentes.

### Carta não encontrada

Quando o `:id` não existe no catálogo (link antigo ou digitado errado):

**Carta não encontrada**

`Esta carta não existe ou foi removida do catálogo.`

Ação: `Voltar ao catálogo`

### Falha ao carregar

Quando a API falha ou não responde:

**Não foi possível carregar a carta**

`Ocorreu um problema ao buscar as informações desta carta. Tente novamente.`

Ações: `Tentar novamente` e `Voltar ao catálogo`

Nos dois casos, header e barra de TCGs continuam funcionando. A mensagem
usa o componente `Alert` (variante `error` para a falha e `neutral` para
carta não encontrada), centralizado no lugar do bloco principal.

------------------------------------------------------------------------

# Responsividade

## Desktop

Três colunas: imagem, informações e ações, como no wireframe.

## Tablet

Duas colunas. A imagem fica à esquerda; informações e ações ficam
empilhadas à direita. O painel de anúncios desce para baixo das abas.

## Mobile

Uma coluna, nesta ordem:

``` text
🏠 > Pokémon > 151 > Pikachu

┌────────────────────┐
│   Imagem da carta  │
└────────────────────┘
[Pokémon]
Pikachu
151 • Nº 025/165
[Comum] [Básico] [Elétrico]

Coleção ........... 151
Número ........ 025/165
Raridade ........ Comum

[ Detalhes ] [ Mais informações ]
...

┌──────────────────────────────────┐
│ [ + Adicionar à minha coleção ]  │  ← barra fixa no rodapé
└──────────────────────────────────┘
```

-   O botão **Adicionar à minha coleção** fica numa barra fixa no rodapé
    da tela, sempre ao alcance do polegar;
-   O breadcrumb esconde os níveis intermediários quando não couber;
-   As abas viram uma rolagem horizontal se não couberem.

------------------------------------------------------------------------

# Design System

A tela reutiliza os componentes de `frontend/src/components/ui`:

| Componente | Uso |
|---|---|
| `Badge` | TCG e chips de raridade e atributos |
| `Button` | Adicionar à coleção (`primary`), favoritos (`outline`), tentar novamente |
| `Card` | Cartão de ações e painel de anúncios |
| `Modal` | Adicionar carta à coleção e imagem ampliada |
| `Alert` | Estados de erro e sucesso ao adicionar |

Tokens principais:

-   Primary `#660366` (`primary-900`): botão principal e badge do TCG;
-   Secondary `#1688F8` (`secondary-500`): links e foco;
-   Surface `#FFFFFF` e background `#FAFBFE`;
-   Texto principal `#302B40` (`neutral-900`);
-   Raridades especiais usam a família `rare` (`rare-100`, `rare-700`).

Tipografia: **Cinzel** no nome da carta; **Plus Jakarta Sans** no
restante.

### Acessibilidade

-   O nome da carta é o único `h1` da página;
-   A imagem tem texto alternativo com nome, set e número;
-   Os chips de energia ou cor mostram ícone **e** texto, para não
    depender só da cor;
-   Os botões de ação têm texto visível, não apenas ícone.

------------------------------------------------------------------------

# Mapeamento com os dados

Para a implementação (#49), cada informação da tela corresponde a um
campo do catálogo interno. Os nomes abaixo seguem o `ExternalCard`, que
é o formato normalizado que sai da integração com as APIs, e o
`Manual Descritivo das Classes`.

| Informação na tela | Campo | Obrigatório |
|---|---|---|
| Nome | `name` | Sim |
| TCG | `cardGame` / `game` | Sim |
| Coleção | `setName` / `edition` | Não |
| Código da coleção | `setCode` | Não |
| Número | `cardNumber` / `codeCollection` | Não |
| Raridade | `rarity` / `officialRarity` | Não |
| Imagem | `imageUrl` | Não |
| Fonte | `source` | Não |
| Id na fonte | `externalId` | Sim |
| Outras impressões | `conceptualId` | Não |
| Atributos do TCG | Campos das subclasses (`PokemonCard`, `YugiohCard`, `MagicCard`...) | Não |

A resposta de detalhes pode trazer mais campos do que a da listagem do
catálogo. A listagem (#44) deve enviar só o necessário para o card; a
tela de detalhes busca a carta completa pelo `:id`.

------------------------------------------------------------------------

# Fluxo principal

``` text
Catálogo
    ↓
Selecionar uma carta
    ↓
Detalhes da carta
    ↓
Adicionar à minha coleção
    ↓
Modal: Adicionar carta à coleção
    ↓
Carta adicionada (alerta de sucesso)
```

Fluxos alternativos:

``` text
Visitante clica em Adicionar à minha coleção
    ↓
Login
    ↓
Volta para a carta
    ↓
Modal: Adicionar carta à coleção
```

``` text
Carregando → Skeleton → Detalhes da carta
```

``` text
Erro ao carregar → Mensagem → Tentar novamente ou Voltar ao catálogo
```

------------------------------------------------------------------------

# Telas / estados que devem aparecer no protótipo

1.  Detalhes completos (wireframe existente);
2.  Loading;
3.  Dados opcionais ausentes;
4.  Imagem indisponível;
5.  Carta não encontrada;
6.  Falha ao carregar;
7.  Visitante clicando em adicionar à coleção;
8.  Modal de adicionar à coleção (wireframe existente);
9.  Detalhes no mobile.

Não é necessário um layout novo para cada estado. Os estados reutilizam a
estrutura do wireframe e mudam apenas o conteúdo de cada bloco.

------------------------------------------------------------------------

# Observações para implementação

-   A tela lê apenas o catálogo interno. Uma API externa fora do ar não
    pode impedir a exibição de uma carta já importada;
-   Galeria de miniaturas, favoritos e anúncios dependem de dados que
    ainda não existem. Devem ficar ocultos até existirem, sem deixar
    espaço vazio;
-   Fraqueza, resistência e ilustrador só entram se forem adicionados ao
    modelo do catálogo;
-   Os atributos específicos de cada TCG dependem de como a importação
    (#43) gravar as cartas. A aba Detalhes deve ser montada a partir dos
    campos presentes, sem assumir que todos existem.

------------------------------------------------------------------------

# Checklist da tarefa

-   [x] Hierarquia das informações definida;
-   [x] Ação de adicionar à coleção representada, para usuário logado e
    visitante;
-   [x] Campos opcionais não quebram a composição;
-   [x] Estado de loading representado;
-   [x] Estado de erro representado (carta não encontrada e falha ao
    carregar);
-   [x] Imagem indisponível com tratamento previsto;
-   [x] Diferenças entre os TCGs consideradas;
-   [x] Responsividade considerada;
-   [x] Design System aplicado;
-   [x] Mapeamento com o modelo de dados para orientar a implementação.
