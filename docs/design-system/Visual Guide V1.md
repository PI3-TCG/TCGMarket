# Visual Guide V1

## 1. Objetivo

Este documento apresenta a identidade visual inicial do TCG Market e estabelece os principais padrões visuais que devem orientar os protótipos e futuras implementações da plataforma.

O objetivo é garantir consistência entre telas, componentes e interações, permitindo que o produto evolua mantendo uma identidade visual reconhecível.

Este guia complementa o **Design Tokens V1** e o **Component Reference V1**.

---

# 2. Identidade Visual

## 2.1 Conceito

A identidade visual do TCG Market combina quatro conceitos principais:

* **Colecionismo** — valorização das cartas e da experiência de coleção.
* **Comunidade** — conexão entre jogadores, colecionadores e vendedores.
* **Tecnologia** — experiência digital moderna e funcional.
* **Confiabilidade** — organização, clareza e segurança nas transações.

A identidade utiliza o **roxo como cor principal**, representando a personalidade e o universo do produto, enquanto o **azul atua como cor secundária**, reforçando ações e interações.

Os tons neutros predominam nas áreas de conteúdo para garantir equilíbrio visual e facilitar a leitura.

### Princípio visual

> **Roxo cria identidade. Azul orienta interação. Neutros organizam o conteúdo.**

A aplicação das cores deve ser equilibrada, evitando que a interface fique excessivamente saturada.

---

# 3. Paleta de Cores

## 3.1 Cores Primárias

| Token               | Cor       | Uso                                                       |
| ------------------- | --------- | --------------------------------------------------------- |
| `color-primary-900` | `#660366` | Identidade principal, ações primárias, títulos destacados |
| `color-primary-700` | `#996699` | Navegação, header, footer e elementos institucionais      |
| `color-primary-500` | `#803D80` | Variações da identidade                                   |
| `color-primary-300` | `#B98FB9` | Elementos suaves e apoio visual                           |
| `color-primary-100` | `#F0E3F0` | Backgrounds suaves, hover e destaques                     |

### Regra

O roxo é a principal representação visual da marca e deve aparecer principalmente em elementos de identidade e hierarquia.

---

## 3.2 Cores Secundárias

| Token                 | Cor       | Uso                                     |
| --------------------- | --------- | --------------------------------------- |
| `color-secondary-700` | `#0969D7` | Ações secundárias e estados interativos |
| `color-secondary-500` | `#1688F8` | CTAs, links, foco e interação           |
| `color-secondary-300` | `#73B8FF` | Destaques suaves                        |
| `color-secondary-100` | `#E4F1FF` | Backgrounds e seleção                   |

### Regra

O azul representa **ação, interação e direcionamento**.

Deve complementar o roxo e não substituí-lo como identidade principal.

---

# 4. Cores Neutras

| Token               | Cor       | Uso                                 |
| ------------------- | --------- | ----------------------------------- |
| `color-neutral-0`   | `#FFFFFF` | Superfícies e Cards                 |
| `color-neutral-50`  | `#FAFBFE` | Backgrounds                         |
| `color-neutral-100` | `#F4F4FD` | Superfícies secundárias             |
| `color-neutral-200` | `#E6E7F0` | Bordas e divisores                  |
| `color-neutral-300` | `#D1D3DE` | Bordas de campos                    |
| `color-neutral-500` | `#74788A` | Placeholder e texto secundário      |
| `color-neutral-700` | `#484B5A` | Texto secundário de maior contraste |
| `color-neutral-900` | `#302B40` | Texto principal                     |

### Regra

Os neutros devem ocupar a maior parte da interface.

A prioridade visual deve ser:

**Conteúdo → estrutura → identidade → destaque.**

---

# 5. Cores Semânticas

| Token           | Cor       | Significado                                 |
| --------------- | --------- | ------------------------------------------- |
| `color-success` | `#15803D` | Sucesso, confirmação, disponibilidade       |
| `color-warning` | `#D97706` | Atenção, alerta, condição que exige cuidado |
| `color-error`   | `#B91C1C` | Erro, falha e ações destrutivas             |
| `color-info`    | `#1D4ED8` | Informação e comunicação                    |

As cores semânticas devem ser utilizadas exclusivamente para representar seus respectivos significados.

### Regra importante

**Vermelho não deve ser utilizado apenas como escolha estética.**

Ele deve estar associado a erro, perigo ou ação destrutiva.

---

# 6. Tipografia

## 6.1 Famílias

### Cinzel

Utilizada para:

* Logo
* Títulos principais
* Títulos de seção
* Preços
* Raridades
* Informações de destaque

A fonte reforça a identidade relacionada ao universo de colecionismo e TCG.

### Plus Jakarta Sans

Utilizada para:

* Textos
* Menus
* Botões
* Formulários
* Filtros
* Informações de Cards
* Mensagens
* Navegação

A fonte proporciona maior legibilidade para informações funcionais.

---

# 7. Hierarquia Tipográfica

| Token          | Tamanho | Peso | Uso                             |
| -------------- | ------: | ---: | ------------------------------- |
| `font-display` |    40px |  700 | Grandes títulos e destaques     |
| `font-h1`      |    32px |  700 | Títulos principais              |
| `font-h2`      |    24px |  700 | Títulos de seção                |
| `font-h3`      |    20px |  600 | Subtítulos                      |
| `font-body-lg` |    18px |  400 | Texto destacado                 |
| `font-body`    |    16px |  400 | Texto padrão                    |
| `font-body-sm` |    14px |  400 | Informações auxiliares          |
| `font-caption` |    12px |  400 | Legendas e informações pequenas |

### Hierarquia

**Display → H1 → H2 → H3 → Body → Body Small → Caption**

---

# 8. Espaçamento

O sistema utiliza uma base de **4px**.

| Token        | Valor |
| ------------ | ----: |
| `spacing-1`  |   4px |
| `spacing-2`  |   8px |
| `spacing-3`  |  12px |
| `spacing-4`  |  16px |
| `spacing-5`  |  20px |
| `spacing-6`  |  24px |
| `spacing-8`  |  32px |
| `spacing-10` |  40px |
| `spacing-12` |  48px |
| `spacing-16` |  64px |
| `spacing-20` |  80px |

### Regra

Sempre que possível, utilizar os valores definidos no sistema em vez de criar espaçamentos arbitrários.

---

# 9. Border Radius

| Token         | Valor | Uso                           |
| ------------- | ----: | ----------------------------- |
| `radius-sm`   |   4px | Pequenos elementos            |
| `radius-md`   |   8px | Inputs, Buttons e controles   |
| `radius-lg`   |  12px | Cards e Modais                |
| `radius-xl`   |  16px | Elementos maiores             |
| `radius-full` | 999px | Badges e elementos circulares |

---

# 10. Sombras

| Token       | Valor                               | Uso                                  |
| ----------- | ----------------------------------- | ------------------------------------ |
| `shadow-sm` | `0 1px 3px rgba(48, 43, 64, 0.08)`  | Cards e elementos discretos          |
| `shadow-md` | `0 4px 12px rgba(48, 43, 64, 0.10)` | Dropdowns e elementos elevados       |
| `shadow-lg` | `0 8px 24px rgba(48, 43, 64, 0.14)` | Modais e elementos de maior destaque |

As sombras devem ser utilizadas com moderação.

---

# 11. Iconografia

A iconografia deve seguir um estilo:

* Simples
* Moderno
* Consistente
* Preferencialmente outline
* Filled apenas quando necessário para indicar estado ativo

## Tamanhos

| Tamanho | Uso                           |
| ------- | ----------------------------- |
| 16px    | Pequenos indicadores          |
| 20px    | Buttons e formulários         |
| 24px    | Navegação e ações principais  |
| 32px    | Destaques e elementos maiores |

Ícones não devem ser utilizados apenas como decoração quando puderem gerar ambiguidade.

---

# 12. Estados de Interação

Todos os componentes interativos devem considerar, quando aplicável:

**Default → Hover → Active → Focus → Disabled → Selected**

## Focus

O Focus deve possuir uma indicação visual clara.

### Focus ring padrão

`#1688F8`

O foco **não deve depender apenas de uma alteração sutil de cor**.

Isso é especialmente importante para navegação por teclado e acessibilidade.

---

# 13. Botões

## Hierarquia

**Primary → Secondary → Outline → Ghost**

### Primary

Cor: `#660366`

Utilizado para a ação principal.

Exemplos:

* Explorar agora
* Comprar carta
* Publicar anúncio
* Salvar alterações

### Secondary

Cor: `#1688F8`

Utilizado para ações importantes alternativas.

Exemplos:

* Criar anúncio
* Adicionar à coleção
* Fazer proposta
* Confirmar troca

### Outline

Borda: `#660366`

Utilizado para ações secundárias.

Exemplos:

* Ver catálogo
* Ver detalhes
* Editar anúncio
* Filtrar resultados

### Ghost

Utilizado para ações de baixa prioridade.

Exemplos:

* Cancelar
* Voltar
* Fechar
* Limpar filtros

### Danger

Cor: `#B91C1C`

Reservado para ações destrutivas.

Exemplos:

* Excluir anúncio
* Remover carta
* Excluir conta

### Focus

Todos os Buttons utilizam:

`#1688F8`

como focus ring.

---

# 14. Inputs

Inputs utilizam:

* Altura: 40px
* Radius: 8px
* Padding horizontal: 12px
* Fonte: Plus Jakarta Sans 14px
* Borda padrão: `#D1D3DE`
* Fundo: `#FFFFFF`

## Estados

**Default → Hover → Focus → Filled → Error → Disabled → Read-only**

### Focus padrão

Borda `#660366`

Focus ring `#1688F8`

### Search

O campo de pesquisa pode utilizar o azul como principal indicação de interação.

---

# 15. Select

O Select utiliza o mesmo padrão estrutural do Input:

* 40px de altura
* Radius 8px
* Borda 1px
* Plus Jakarta Sans 14px
* Fundo branco

## Estados

**Default → Hover → Focus → Open → Selected → Error → Disabled**

### Opções

* Default: `#FFFFFF`
* Hover: `#F0E3F0`
* Selected: `#E4F1FF`
* Texto selecionado: `#0969D7`

---

# 16. Checkbox

Checkbox:

* 20 × 20px
* Radius 4px
* Borda 1px
* Espaçamento de 8px para o texto

### Selecionado

Fundo:

`#660366`

O estado selecionado deve possuir um indicador visual claro.

### Focus

Focus ring:

`#1688F8`

### Indeterminate

Utilizado quando apenas parte de um conjunto está selecionada.

---

# 17. Badge

Badges representam informações curtas e categóricas.

## Exemplos

**Venda**

**Troca**

**Venda e troca**

**Disponível**

**Vendido**

**Rara**

**Foil**

### Características

* 12px
* Peso 600
* Padding horizontal 8px
* Altura mínima 24px
* Radius 999px

As cores devem seguir a semântica definida pelo sistema.

---

# 18. Card

O Card é um dos principais elementos visuais do TCG Market.

## Estrutura do Card de anúncio

```text
┌──────────────────────────┐
│                          │
│      IMAGEM DA CARTA     │
│                          │
├──────────────────────────┤
│ Nome da carta            │
│                          │
│ Vendedor ⭐⭐⭐⭐⭐        │
│                          │
│ [ VENDA ]                │
│                          │
│              R$ 120,00   │
└──────────────────────────┘
```

## Hierarquia

**Imagem → Nome → Vendedor → Reputação → Transação → Preço**

## Aparência

* Fundo: `#FFFFFF`
* Borda: `#E6E7F0`
* Radius: 12px
* Sombra: `shadow-sm`
* Padding: 16px

### Hover

Utilizar `shadow-md` e destaque discreto da borda.

### Preço

Utilizar Cinzel com peso 700.

---

# 19. Dropdown

Dropdowns são utilizados para ações ou menus contextuais.

## Aparência

* Fundo: `#FFFFFF`
* Borda: `#E6E7F0`
* Radius: 8px
* Sombra: `shadow-md`

## Estados

### Default

Fundo branco.

### Hover

Fundo `#F0E3F0`.

### Selected

Fundo `#E4F1FF`.

### Focus

Focus ring `#1688F8`.

### Danger

Texto `#B91C1C`.

---

# 20. Modal

O Modal apresenta uma ação ou informação que exige atenção.

## Estrutura

**Overlay → Header → Título → Conteúdo → Ações**

## Aparência

* Fundo: `#FFFFFF`
* Overlay: `rgba(48, 43, 64, 0.50)`
* Radius: 12px
* Padding: 24px
* Sombra: `shadow-lg`

### Título

Cinzel, 24px, 700.

### Conteúdo

Plus Jakarta Sans, 16px.

### Ações

Devem seguir a hierarquia de Buttons.

---

# 21. Navigation

A navegação utiliza duas camadas.

## Primeira camada

```text
[ LOGO ]   [ PESQUISA ]                    [ LOGIN / PERFIL ]
```

## Segunda camada

```text
Magic | Pokémon | Yu-Gi-Oh! | One Piece | Digimon
```

## Objetivos

A primeira camada concentra:

* Identidade
* Pesquisa
* Conta

A segunda concentra:

* Catálogos
* Navegação entre TCGs

A navegação deve ser clara e não competir visualmente com o conteúdo principal.

---

# 22. Alert / Feedback

## Variantes

### Success

`#15803D`

Para operações concluídas.

Exemplo:

> Anúncio publicado com sucesso!

### Warning

`#D97706`

Para situações que exigem atenção.

Exemplo:

> Este anúncio possui poucas unidades disponíveis.

### Error

`#B91C1C`

Para erros e falhas.

Exemplo:

> Não foi possível publicar o anúncio.

### Info

`#1D4ED8`

Para informações gerais.

Exemplo:

> Existem novas cartas disponíveis.

### Neutral

`#484B5A`

Para informações sem significado semântico específico.

---

# 23. Hierarquia Visual Geral

A interface deve priorizar:

1. **Conteúdo principal**
2. **Ações**
3. **Informações importantes**
4. **Navegação**
5. **Informações secundárias**

No Card:

**Imagem → Carta → Vendedor → Transação → Preço**

Na tela:

**Título → Contexto → Conteúdo → Ação**

---

# 24. Homepage

A Homepage representa o marketplace para usuários autenticados e visitantes.

## Estrutura

### Header

Primeira navegação:

**Logo → Pesquisa → Login/Perfil**

Segunda navegação:

**Magic → Pokémon → Yu-Gi-Oh! → One Piece → Digimon**

### Seção 1 — Principais anúncios

Apresenta anúncios de maior destaque.

### Seção 2 — Novos anúncios

Apresenta anúncios recentemente publicados.

### Seção 3 — Em alta / Favoritos

Apresenta anúncios relacionados a buscas, interesse e demanda.

### Footer

Concentra informações institucionais e links auxiliares.

---

# 25. Perfil / Dashboard

O Dashboard pertence à área do usuário e não deve substituir a Homepage.

Pode apresentar:

* Resumo da conta
* Minha coleção
* Meus anúncios
* Favoritos
* Histórico
* Reputação
* Ações rápidas

A interface deve priorizar informações pessoais e gerenciamento da conta.

---

# 26. Princípios de Consistência

Toda nova tela ou componente deve seguir os princípios:

### 1. Reutilizar tokens

Evitar criar novas cores, espaçamentos ou radius sem necessidade.

### 2. Priorizar neutros

A interface deve possuir áreas de respiro e não utilizar roxo ou azul em excesso.

### 3. Roxo para identidade

O roxo representa o TCG Market.

### 4. Azul para interação

O azul orienta o usuário em ações, links e foco.

### 5. Semântica possui significado

Verde, laranja, vermelho e azul informativo devem comunicar estados reais.

### 6. Informação antes da decoração

Elementos visuais devem facilitar a compreensão do conteúdo.

### 7. Consistência antes da novidade

Um novo componente deve seguir padrões existentes antes de criar uma nova solução visual.

---

# 27. Acessibilidade

A acessibilidade deve ser considerada desde os protótipos.

## Diretrizes principais

* Focus sempre visível.
* Não depender somente de cores para transmitir informações.
* Textos devem possuir contraste adequado.
* Inputs devem possuir labels.
* Ícones importantes devem possuir significado compreensível.
* Elementos interativos devem possuir estados claros.
* Navegação por teclado deve ser considerada.
* Mensagens de erro devem explicar o problema.
* Componentes Disabled devem permanecer distinguíveis sem parecerem ativos.

---

# 28. Responsividade

Os componentes devem ser projetados pensando em diferentes tamanhos de tela.

A interface deve adaptar:

* Grid de Cards
* Navegação
* Formulários
* Modais
* Espaçamentos
* Quantidade de elementos por linha

O conteúdo deve continuar legível e funcional sem depender exclusivamente de dimensões fixas.

---

# 29. Referência Rápida

| Elemento                 | Padrão                |
| ------------------------ | --------------------- |
| **Primary**              | `#660366`             |
| **Secondary**            | `#1688F8`             |
| **Texto principal**      | `#302B40`             |
| **Texto secundário**     | `#484B5A`             |
| **Placeholder**          | `#74788A`             |
| **Borda**                | `#D1D3DE` / `#E6E7F0` |
| **Background**           | `#FAFBFE`             |
| **Superfície**           | `#FFFFFF`             |
| **Focus**                | `#1688F8`             |
| **Success**              | `#15803D`             |
| **Warning**              | `#D97706`             |
| **Error**                | `#B91C1C`             |
| **Info**                 | `#1D4ED8`             |
| **Fonte de identidade**  | Cinzel                |
| **Fonte funcional**      | Plus Jakarta Sans     |
| **Radius de controle**   | 8px                   |
| **Radius de Card/Modal** | 12px                  |
| **Base de espaçamento**  | 4px                   |

---

# 30. Aplicação na Milestone 1

Este Visual Guide deve servir como referência para os primeiros protótipos do TCG Market.

A implementação inicial deve priorizar:

1. Homepage / Marketplace
2. Perfil / Dashboard
3. Login
4. Catálogo
5. Detalhes do anúncio

Os componentes definidos no **Component Reference V1** devem ser reutilizados nessas telas.

---

# 31. Evolução do Design System

Este documento representa a **versão inicial da identidade visual**.

Novos componentes, tokens ou padrões podem ser adicionados conforme as necessidades do projeto forem identificadas.

Alterações devem preservar os princípios fundamentais:

> **Identidade em roxo.
> Interação em azul.
> Conteúdo organizado por neutros.
> Semântica clara.
> Consistência entre componentes.**

**Versão:** V1
**Escopo:** Milestone 1
**Status:** Base visual definida
