# Card — Referência V1

## 1. Propósito

O Card é o principal componente de apresentação de conteúdo do marketplace.

No TCG Market, será utilizado para apresentar cartas, anúncios, produtos, usuários e outros conteúdos relacionados.

## 2. Estrutura

A estrutura padrão de um Card de anúncio é:

1. Imagem da carta
2. Nome da carta
3. Usuário/vendedor
4. Reputação
5. Tipo de transação
6. Preço, quando aplicável

## 3. Aparência

| Propriedade         | Valor                   |
| ------------------- | ----------------------- |
| **Fundo**           | `#FFFFFF`               |
| **Borda**           | `#E6E7F0`               |
| **Border Radius**   | 12px                    |
| **Sombra**          | `shadow-sm`             |
| **Padding interno** | 16px                    |
| **Imagem**          | Área superior do Card   |
| **Título**          | Cinzel, 16–20px, 600    |
| **Informações**     | Plus Jakarta Sans, 14px |
| **Preço**           | Cinzel, 16–20px, 700    |

## 4. Estados

| Estado       | Comportamento                                     |
| ------------ | ------------------------------------------------- |
| **Default**  | Borda neutra + `shadow-sm`                        |
| **Hover**    | `shadow-md` + leve destaque da borda              |
| **Selected** | Borda `#660366`                                   |
| **Focus**    | Focus ring `#1688F8` quando o Card for interativo |
| **Disabled** | Redução de contraste quando aplicável             |

## 5. Hierarquia visual

**Imagem → Nome da carta → Vendedor/reputação → Transação → Preço**

O preço deve receber destaque visual sem competir com a imagem da carta.

## 6. Exemplos

### Card de anúncio

**Pikachu — Base Set**

`Vendedor: CardMaster ⭐⭐⭐⭐⭐`

`Venda`

**R$ 120,00**

### Card de troca

**Charizard ex**

`Vendedor: TCGPlayer ⭐⭐⭐⭐⭐`

`Troca`

`Ver proposta`

## 7. Grid

Os Cards devem ser apresentados em grid responsivo.

A quantidade de Cards por linha pode variar de acordo com o tamanho da tela, mantendo espaçamento consistente e evitando componentes excessivamente estreitos.

## 8. Regras

* Imagens devem possuir proporção consistente.
* Informações importantes devem aparecer sem exigir interação.
* O Card não deve receber excesso de elementos.
* Cards interativos devem possuir indicação clara de interação.
* O mesmo padrão visual deve ser utilizado para diferentes tipos de conteúdo.
