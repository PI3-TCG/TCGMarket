# Protótipo do Catálogo de Cartas - TCG Market

## Objetivo

O objetivo desta tarefa é definir como vai funcionar a tela de catálogo
do TCG Market, onde o usuário poderá visualizar as cartas disponíveis,
pesquisar pelo nome, utilizar filtros e entrar nos detalhes de uma
carta.

Para montar o catálogo, foi utilizado como base o protótipo que já temos
no projeto:

`docs/design-system/prototyping/wireframe-catalogo.png`

Também devem ser seguidos os padrões visuais definidos no Design System
do projeto.

------------------------------------------------------------------------

## Estrutura da tela

A tela do catálogo será dividida principalmente em:

-   Header;
-   Navegação entre os TCGs;
-   Banner do TCG selecionado;
-   Área de filtros;
-   Área de resultados;
-   Grid de cartas;
-   Paginação.

### Header

O header será mantido como navegação principal do site.

Ele terá:

-   Logo do TCG Market;
-   Campo de busca;
-   Carrinho;
-   Notificações;
-   Perfil do usuário.

O botão que aparece como **"Criar anúncio"** no wireframe atual será
substituído pelo **Carrinho**.

O carrinho ficará no header porque é uma função que o usuário pode
acessar de qualquer parte do site, parecido com o funcionamento de
outros marketplaces.

Caso existam produtos adicionados, poderá ser mostrado um contador junto
ao ícone do carrinho.

Exemplo:

`Carrinho (3)`

### Botão Criar anúncio

A opção **Criar anúncio** continuará existindo, mas ficará na lateral
esquerda do catálogo, acima dos filtros.

A ideia é deixar essa ação próxima da área onde o usuário está navegando
pelas cartas, sem ocupar o espaço do carrinho no header.

Estrutura aproximada:

``` text
[ + Criar anúncio ]

[ Buscar carta... ]

Filtros

Coleção
Raridade
Tipo
Idioma
Condição
Preço
Disponibilidade

[ Limpar filtros ]
```

------------------------------------------------------------------------

## Navegação por TCG

Abaixo do header teremos a navegação entre os jogos disponíveis no TCG
Market.

Inicialmente:

-   Magic;
-   Pokémon;
-   Yu-Gi-Oh!;
-   One Piece;
-   Digimon.

O jogo selecionado deverá ficar destacado para deixar claro qual
catálogo está sendo visualizado.

Depois da seleção será mostrado o banner correspondente ao TCG.

Exemplo:

**Pokémon**

> Explore todas as cartas de Pokémon.

------------------------------------------------------------------------

## Busca de cartas

Na lateral do catálogo teremos um campo para pesquisar diretamente pelo
nome da carta.

Exemplo:

`Buscar carta no catálogo...`

A busca deverá funcionar junto com os filtros.

Por exemplo, o usuário poderá selecionar Pokémon, filtrar uma coleção e
depois pesquisar por "Pikachu".

Também deve ser possível apagar a pesquisa e voltar a visualizar os
outros resultados.

------------------------------------------------------------------------

## Filtros

Os filtros serão exibidos na lateral esquerda seguindo o formato do
protótipo atual.

Teremos como opções:

-   Coleção / Set;
-   Raridade;
-   Tipo;
-   Idioma;
-   Condição;
-   Faixa de preço;
-   Disponibilidade.

Os grupos poderão ser abertos e fechados para não ocupar espaço
desnecessário.

Quando algum filtro estiver selecionado, isso deverá ficar visível para
o usuário.

Exemplo:

``` text
Raridade (1)
Idioma (2)
```

Também teremos a opção:

`Limpar filtros`

Ela remove os filtros aplicados e retorna para a listagem normal.

------------------------------------------------------------------------

## Listagem das cartas

Na área principal será mostrada a quantidade de resultados encontrados.

Exemplo:

`1.248 cartas encontradas`

Também teremos a opção de ordenação.

Exemplo:

`Ordenar por: Mais recentes`

As cartas serão exibidas em grid seguindo o formato que já foi definido
no protótipo do projeto.

------------------------------------------------------------------------

## Card da carta

O card deverá seguir o modelo que já existe em:

`docs/design-system/prototyping/wireframe-catalogo.png`

Não será criado um novo formato de card para esta tarefa.

As principais informações mostradas serão:

-   Imagem;
-   Nome da carta;
-   Coleção;
-   Número;
-   Raridade;
-   Favorito.

Exemplo simplificado:

``` text
┌────────────────────┐
│                    │
│  Imagem da carta   │  ♡
│                    │
├────────────────────┤
│ Pikachu            │
│ Base Set · Nº 001  │
│                    │
│ [ Comum ]          │
└────────────────────┘
```

Ao passar o mouse pelo card ele poderá receber um pequeno destaque
visual, seguindo o Design System.

------------------------------------------------------------------------

## Detalhes da carta

Ao clicar em uma carta, o usuário será levado para a página de detalhes.

O fluxo será:

`Catálogo → Selecionar carta → Detalhes da carta`

A tela de detalhes já possui uma referência no projeto:

`docs/design-system/prototyping/wireframe-detalheCartas.png`

A especificação completa da tela, com estados e regras de dados, está em
`docs/arquitetura/prototipo-detalhes-carta-tcg-market.md`.

Assim, o catálogo funciona como o ponto de entrada para encontrar uma
carta e depois visualizar suas informações e anúncios disponíveis.

------------------------------------------------------------------------

## Paginação

Como o catálogo poderá possuir muitas cartas, será utilizada paginação.

Exemplo:

`<  1  2  3  4  5  ...  125  >`

A página atual deverá ficar destacada.

Quando o usuário mudar de página, os filtros, a pesquisa e a ordenação
devem continuar aplicados.

------------------------------------------------------------------------

# Estados da tela

Além da tela normal do catálogo, também precisamos representar algumas
situações que podem acontecer durante o uso.

## Loading

Enquanto as cartas estiverem sendo carregadas, serão utilizados cards em
formato de **skeleton**.

Dessa forma o usuário consegue perceber que os resultados estão
carregando sem a página ficar vazia.

A estrutura do catálogo e os filtros continuam aparecendo.

------------------------------------------------------------------------

## Nenhum resultado

Caso nenhuma carta seja encontrada:

### Mensagem

**Nenhuma carta encontrada**

`Não encontramos cartas correspondentes à sua busca ou aos filtros selecionados.`

Quando existirem filtros aplicados, também será mostrada a opção:

`Limpar filtros`

Assim o usuário consegue voltar facilmente para o catálogo completo.

------------------------------------------------------------------------

## Erro

Caso ocorra algum problema ao carregar as cartas:

### Mensagem

**Não foi possível carregar as cartas**

`Ocorreu um problema ao buscar o catálogo. Tente novamente.`

### Ação

`Tentar novamente`

O restante da página continuará funcionando para que o usuário não fique
preso em uma tela de erro.

------------------------------------------------------------------------

## Imagem indisponível

Pode acontecer de uma carta não possuir imagem ou a imagem não carregar
corretamente.

Nesse caso, o card não será removido.

No lugar da imagem aparecerá um placeholder:

``` text
┌────────────────────┐
│                    │
│        🃏          │
│                    │
│ Imagem indisponível│
│                    │
└────────────────────┘
```

As outras informações da carta continuam aparecendo normalmente.

------------------------------------------------------------------------

## Filtros ativos

Quando o usuário utilizar filtros, eles deverão continuar
identificáveis.

Exemplo:

``` text
Raridade (1)
Idioma (1)

Limpar filtros
```

A quantidade de resultados também será atualizada de acordo com os
filtros selecionados.

------------------------------------------------------------------------

# Responsividade

O catálogo também precisa funcionar em dispositivos menores.

## Desktop

No desktop teremos:

``` text
┌────────────────────────────────────────────────────┐
│ Header                                  Carrinho   │
├────────────────────────────────────────────────────┤
│ Navegação entre TCGs                              │
├────────────────────────────────────────────────────┤
│ Banner                                             │
├───────────────┬────────────────────────────────────┤
│ Criar anúncio │                                    │
│               │                                    │
│ Busca         │       Grid de cartas               │
│               │                                    │
│ Filtros       │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

## Mobile

No celular não teremos espaço suficiente para deixar os filtros sempre
abertos na lateral.

Por isso, eles poderão ser acessados através de um botão.

Exemplo:

``` text
[ Buscar carta... ]

[ Filtros (2) ]   [ Ordenar ]

[ Carta ] [ Carta ]
[ Carta ] [ Carta ]

< 1 2 ... >
```

Ao clicar em **Filtros**, será aberta uma área com todas as opções
disponíveis.

O botão poderá mostrar a quantidade de filtros ativos.

------------------------------------------------------------------------

# Design System

O catálogo deve seguir o Design System que já existe no projeto.

Referência:

`docs/design-system/`

Alguns dos padrões principais são:

### Cores

-   Primary: `#660366`
-   Secondary: `#1688F8`
-   Background: `#FAFBFE`
-   Surface: `#FFFFFF`
-   Texto principal: `#302B40`
-   Error: `#B91C1C`

### Tipografia

-   **Cinzel:** títulos e elementos de identidade;
-   **Plus Jakarta Sans:** textos, campos e controles.

Também devem ser reutilizados os componentes existentes sempre que
possível, como:

-   Botões;
-   Inputs;
-   Selects;
-   Cards;
-   Badges;
-   Alertas.

------------------------------------------------------------------------

# Fluxo principal

O fluxo normal do catálogo será:

``` text
Entrar no catálogo
        ↓
Selecionar um TCG
        ↓
Visualizar as cartas
        ↓
Pesquisar ou utilizar filtros
        ↓
Selecionar uma carta
        ↓
Visualizar detalhes
```

Também teremos os fluxos alternativos:

``` text
Carregando
    ↓
Skeleton
    ↓
Cartas
```

``` text
Busca / filtros
      ↓
Nenhum resultado
      ↓
Alterar busca ou limpar filtros
```

``` text
Erro ao carregar
      ↓
Mensagem de erro
      ↓
Tentar novamente
```

------------------------------------------------------------------------

# Telas / estados que devem aparecer no protótipo

Para representar a funcionalidade completa, serão considerados:

1.  Catálogo normal;
2.  Busca realizada;
3.  Filtros ativos;
4.  Loading;
5.  Nenhum resultado;
6.  Erro;
7.  Imagem indisponível;
8.  Navegação para detalhes da carta;
9.  Catálogo no mobile;
10. Filtros abertos no mobile.

Não é necessário criar um layout diferente para cada situação. A ideia é
utilizar os mesmos componentes e apenas demonstrar como eles se
comportam em cada estado.

------------------------------------------------------------------------

# Observação para implementação

Alguns filtros, como **condição, preço, idioma e disponibilidade**,
podem depender dos dados dos anúncios e não somente das informações
básicas de uma carta.

Por isso, na implementação será necessário verificar quais dessas
informações estarão disponíveis na API do catálogo e quais precisarão
ser obtidas através dos anúncios.

A paginação também deverá estar de acordo com o retorno da API utilizada
pelo Front-end.

------------------------------------------------------------------------

# Checklist da tarefa

-   [x] Estrutura do catálogo definida;
-   [x] Busca por nome representada;
-   [x] Filtros representados;
-   [x] Filtros ativos representados;
-   [x] Grid de cartas definido;
-   [x] Formato dos cards seguindo o protótipo existente;
-   [x] Paginação definida;
-   [x] Navegação para detalhes definida;
-   [x] Loading definido;
-   [x] Estado sem resultados definido;
-   [x] Estado de erro definido;
-   [x] Imagem indisponível definida;
-   [x] Responsividade considerada;
-   [x] Carrinho definido no header;
-   [x] Criar anúncio definido acima dos filtros;
-   [x] Design System considerado;
-   [x] Informações suficientes para orientar o desenvolvimento
    Front-end.
