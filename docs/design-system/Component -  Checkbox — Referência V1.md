# Checkbox — Referência V1

## 1. Propósito

O Checkbox permite que o usuário selecione ou desmarque uma ou mais opções de forma independente.

No TCG Market, será utilizado principalmente em filtros, preferências, configurações e seleções múltiplas.

## 2. Variantes

| Variante     | Uso                            | Estado padrão                     | Hover           | Focus          | Selecionado     |
| ------------ | ------------------------------ | --------------------------------- | --------------- | -------------- | --------------- |
| **Default**  | Seleção comum                  | Fundo `#FFFFFF` + borda `#D1D3DE` | Borda `#660366` | Ring `#1688F8` | Fundo `#660366` |
| **Filter**   | Filtros de catálogo e anúncios | Fundo `#FFFFFF` + borda `#D1D3DE` | Fundo `#F0E3F0` | Ring `#1688F8` | Fundo `#660366` |
| **Disabled** | Opção indisponível             | Fundo `#F4F4FD` + borda `#E6E7F0` | —               | —              | —               |
| **Error**    | Seleção obrigatória inválida   | Borda `#B91C1C`                   | Borda `#991B1B` | Ring `#B91C1C` | Fundo `#B91C1C` |

## 3. Propriedades

| Propriedade                    | Valor                   |
| ------------------------------ | ----------------------- |
| **Tamanho**                    | 20 × 20px               |
| **Border Radius**              | 4px                     |
| **Borda**                      | 1px                     |
| **Ícone de seleção**           | 14–16px                 |
| **Texto**                      | Plus Jakarta Sans, 14px |
| **Peso do texto**              | 400                     |
| **Espaçamento checkbox/texto** | 8px                     |

## 4. Estados

| Estado            | Comportamento                          |
| ----------------- | -------------------------------------- |
| **Default**       | Checkbox disponível e não selecionado  |
| **Hover**         | Maior contraste na área de interação   |
| **Focus**         | Focus ring `#1688F8`                   |
| **Selected**      | Fundo `#660366` + indicador de seleção |
| **Indeterminate** | Indicador de seleção parcial           |
| **Disabled**      | Baixo contraste e sem interação        |
| **Error**         | Indicação de erro associada ao campo   |

## 5. Exemplos no TCG Market

* Somente cartas à venda
* Somente cartas para troca
* Mostrar cartas favoritas
* Pokémon
* Magic
* Yu-Gi-Oh!
* One Piece
* Digimon
* Raridade: Rara
* Raridade: Lendária
* Idioma: Português

## 6. Regras de uso

* Utilizar Checkbox quando múltiplas opções puderem ser selecionadas.
* Para uma escolha exclusiva entre opções, utilizar Select ou outro componente apropriado.
* O texto associado deve ser clicável sempre que possível.
* O estado Indeterminate deve representar seleção parcial real.
* O foco deve permanecer visualmente perceptível.
