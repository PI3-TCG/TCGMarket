# Modal — Referência V1

## 1. Propósito

O Modal apresenta uma informação ou ação que exige atenção do usuário sem abandonar a página atual.

No TCG Market, será utilizado para confirmações, edição rápida, detalhes e ações que exigem decisão.

## 2. Estrutura

1. Overlay
2. Cabeçalho
3. Título
4. Conteúdo
5. Ações
6. Botão de fechamento

## 3. Aparência

| Propriedade        | Valor                    |
| ------------------ | ------------------------ |
| **Fundo do Modal** | `#FFFFFF`                |
| **Overlay**        | `rgba(48, 43, 64, 0.50)` |
| **Border Radius**  | 12px                     |
| **Sombra**         | `shadow-lg`              |
| **Padding**        | 24px                     |
| **Título**         | Cinzel, 24px, 700        |
| **Texto**          | Plus Jakarta Sans, 16px  |
| **Botão fechar**   | Ícone 20–24px            |

## 4. Estados

| Estado      | Comportamento                                      |
| ----------- | -------------------------------------------------- |
| **Closed**  | Modal não aparece                                  |
| **Open**    | Modal e overlay aparecem                           |
| **Focus**   | Foco permanece dentro do Modal durante a interação |
| **Loading** | Conteúdo ou ação em processamento                  |
| **Error**   | Erro apresentado dentro do contexto do Modal       |

## 5. Exemplos

### Confirmação

**Excluir anúncio?**

Esta ação não poderá ser desfeita.

`Cancelar` — Ghost

`Excluir anúncio` — Danger

### Adicionar à coleção

**Adicionar carta à coleção**

`Quantidade`

`Condição`

`Idioma`

`Adicionar` — Primary

### Detalhes

**Detalhes da carta**

Informações completas da carta e suas características.

## 6. Regras

* O Modal deve ter uma finalidade clara.
* Utilizar títulos objetivos.
* A ação principal deve ser facilmente identificável.
* Ações destrutivas devem utilizar Danger.
* O fechamento deve estar disponível de forma clara.
* O foco deve ser gerenciado corretamente para acessibilidade.
* Evitar Modal dentro de Modal.
