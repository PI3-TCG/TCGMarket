# Input — Referência V1

## 1. Propósito

O Input é utilizado para permitir que o usuário insira ou edite informações no sistema.

No TCG Market, será utilizado principalmente em formulários, pesquisas, filtros, login, cadastro, anúncios e gerenciamento de coleção.

---

## 2. Variantes

| Variante      | Uso                                        | Cor padrão                        | Cor Hover       | Cor Focus                        | Texto/Ícone | Borda     | Exemplos                                       |
| ------------- | ------------------------------------------ | --------------------------------- | --------------- | -------------------------------- | ----------- | --------- | ---------------------------------------------- |
| **Default**   | Entrada de informação comum                | Fundo `#FFFFFF` + borda `#D1D3DE` | Borda `#74788A` | Borda `#660366` + ring `#1688F8` | `#302B40`   | `#D1D3DE` | Nome da carta · Nome do anúncio · E-mail       |
| **Search**    | Pesquisa de conteúdo                       | Fundo `#FFFFFF` + borda `#D1D3DE` | Borda `#74788A` | Borda `#1688F8` + ring `#1688F8` | `#302B40`   | `#D1D3DE` | Buscar carta · Buscar anúncio · Buscar usuário |
| **Error**     | Campo com informação inválida              | Fundo `#FFFFFF` + borda `#B91C1C` | Borda `#991B1B` | Borda `#B91C1C` + ring `#B91C1C` | `#302B40`   | `#B91C1C` | E-mail inválido · Campo obrigatório            |
| **Disabled**  | Campo indisponível para edição             | Fundo `#F4F4FD` + borda `#E6E7F0` | —               | —                                | `#74788A`   | `#E6E7F0` | Campo bloqueado                                |
| **Read-only** | Informação disponível apenas para consulta | Fundo `#F4F4FD` + borda `#E6E7F0` | —               | —                                | `#484B5A`   | `#E6E7F0` | ID da conta · Código da carta                  |

---

## 3. Propriedades

| Propriedade                 | Valor             |
| --------------------------- | ----------------- |
| **Fonte**                   | Plus Jakarta Sans |
| **Tamanho**                 | 14px              |
| **Peso**                    | 400               |
| **Altura**                  | 40px              |
| **Padding horizontal**      | 12px              |
| **Border Radius**           | 8px               |
| **Borda**                   | 1px               |
| **Ícone**                   | 20px              |
| **Espaçamento ícone/texto** | 8px               |
| **Fundo padrão**            | `#FFFFFF`         |
| **Texto principal**         | `#302B40`         |
| **Placeholder**             | `#74788A`         |

---

## 4. Focus

O estado Focus deve apresentar uma indicação visual clara quando o campo estiver selecionado, inclusive durante a navegação por teclado.

**Focus padrão:**

* Borda: `#660366`
* Focus ring: `#1688F8`

**Search:**

* Borda: `#1688F8`
* Focus ring: `#1688F8`

**Error:**

* Borda: `#B91C1C`
* Focus ring: `#B91C1C`

O Focus não deve depender somente de uma alteração sutil de cor.

---

## 5. Estados

| Estado        | Comportamento                                                     |
| ------------- | ----------------------------------------------------------------- |
| **Default**   | Campo disponível para preenchimento                               |
| **Hover**     | Borda recebe maior contraste                                      |
| **Focus**     | Borda e focus ring indicam o campo ativo                          |
| **Filled**    | Campo contém uma informação inserida                              |
| **Error**     | Campo apresenta informação inválida ou obrigatória não preenchida |
| **Disabled**  | Campo não pode receber interação                                  |
| **Read-only** | Informação pode ser visualizada, mas não editada                  |

---

## 6. Placeholder

O placeholder deve servir como orientação e exemplo do formato esperado.

### Exemplos

* `Digite o nome da carta`
* `Digite seu e-mail`
* `Digite o preço`
* `Busque por carta, anúncio ou usuário...`

O placeholder não deve substituir o **label** do campo.

---

## 7. Exemplos no TCG Market

* Nome da carta
* Nome do anúncio
* Preço
* E-mail
* Senha
* Nome de usuário
* Quantidade
* Observações
* Buscar cartas
* Buscar anúncios
* Buscar usuários
* Código da carta
* Endereço
* Telefone

---

## 8. Regras de uso

* Utilizar **label** para identificar o campo.
* Utilizar placeholder apenas como orientação complementar.
* Manter altura e espaçamento consistentes entre campos.
* Utilizar Error somente quando houver uma situação real de erro.
* Utilizar Disabled quando a interação estiver temporariamente indisponível.
* Utilizar Read-only quando a informação puder ser consultada, mas não alterada.
* Inputs de pesquisa podem utilizar ícones de busca.
* Mensagens de erro devem explicar de forma objetiva o que precisa ser corrigido.
