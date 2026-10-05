# Select — Referência V1

## 1. Propósito

O Select permite que o usuário escolha uma opção dentro de uma lista predefinida.

No TCG Market, será utilizado principalmente em filtros, formulários de anúncios, cadastro de cartas e configurações da coleção.

---

## 2. Variantes

| Variante     | Uso                          | Cor padrão                        | Cor Hover       | Cor Focus                        | Texto/Ícone | Borda     | Exemplos                   |
| ------------ | ---------------------------- | --------------------------------- | --------------- | -------------------------------- | ----------- | --------- | -------------------------- |
| **Default**  | Seleção comum                | Fundo `#FFFFFF` + borda `#D1D3DE` | Borda `#74788A` | Borda `#660366` + ring `#1688F8` | `#302B40`   | `#D1D3DE` | TCG · Condição · Idioma    |
| **Filter**   | Filtragem de resultados      | Fundo `#FFFFFF` + borda `#D1D3DE` | Borda `#74788A` | Borda `#1688F8` + ring `#1688F8` | `#302B40`   | `#D1D3DE` | Edição · Raridade · Preço  |
| **Error**    | Seleção obrigatória inválida | Fundo `#FFFFFF` + borda `#B91C1C` | Borda `#991B1B` | Borda `#B91C1C` + ring `#B91C1C` | `#302B40`   | `#B91C1C` | Tipo de anúncio · Condição |
| **Disabled** | Seleção indisponível         | Fundo `#F4F4FD` + borda `#E6E7F0` | —               | —                                | `#74788A`   | `#E6E7F0` | TCG indisponível           |

---

## 3. Propriedades

| Propriedade            | Valor             |
| ---------------------- | ----------------- |
| **Fonte**              | Plus Jakarta Sans |
| **Tamanho**            | 14px              |
| **Peso**               | 400               |
| **Altura**             | 40px              |
| **Padding horizontal** | 12px              |
| **Border Radius**      | 8px               |
| **Borda**              | 1px               |
| **Ícone de abertura**  | 20px              |
| **Fundo padrão**       | `#FFFFFF`         |
| **Texto**              | `#302B40`         |
| **Placeholder**        | `#74788A`         |

---

## 4. Estados

| Estado       | Comportamento                                  |
| ------------ | ---------------------------------------------- |
| **Default**  | Select disponível para interação               |
| **Hover**    | Borda recebe maior contraste                   |
| **Focus**    | Borda + focus ring indicam o componente ativo  |
| **Open**     | Lista de opções está aberta                    |
| **Selected** | Opção escolhida recebe destaque                |
| **Error**    | Seleção inválida ou obrigatória não preenchida |
| **Disabled** | Componente não pode receber interação          |

---

## 5. Cores das opções

Quando o Select estiver aberto:

* Fundo da lista: `#FFFFFF`
* Texto: `#302B40`
* Hover da opção: `#F0E3F0`
* Opção selecionada: `#E4F1FF`
* Texto da opção selecionada: `#0969D7`
* Divisores, quando necessários: `#E6E7F0`

A opção selecionada deve possuir uma indicação visual além da simples mudança de cor, como um ícone ou indicador.

---

## 6. Exemplos no TCG Market

### Cadastro de anúncio

* Tipo de transação → Venda / Troca / Venda e troca
* Condição → Nova / Excelente / Boa / Usada
* Idioma → Português / Inglês / Japonês etc.

### Catálogo

* TCG → Pokémon / Magic / Yu-Gi-Oh! / One Piece / Digimon
* Edição
* Raridade
* Coleção

### Filtros

* Faixa de preço
* Raridade
* Condição
* Idioma
* Tipo de transação
* Ordenação → Mais recentes / Menor preço / Maior preço

---

## 7. Regras de uso

* Utilizar Select quando as opções forem previamente conhecidas.
* Para listas muito extensas, considerar um campo de pesquisa/autocomplete em vez de uma lista excessivamente longa.
* O Select deve possuir um label claro.
* A opção selecionada deve permanecer visualmente identificável.
* Não utilizar cores semânticas apenas para decoração.
* O estado Focus deve permanecer visível durante a navegação por teclado.
* O estado Disabled deve ser reservado para situações em que a seleção realmente não está disponível.
