# Dropdown — Referência V1

## 1. Propósito

O Dropdown apresenta uma lista de ações ou opções que aparece após uma interação do usuário.

Diferentemente do Select, o Dropdown é destinado principalmente a **ações e navegação**, e não à escolha de um valor de formulário.

## 2. Aparência

| Propriedade                  | Valor                   |
| ---------------------------- | ----------------------- |
| **Fundo**                    | `#FFFFFF`               |
| **Borda**                    | `#E6E7F0`               |
| **Border Radius**            | 8px                     |
| **Sombra**                   | `shadow-md`             |
| **Texto**                    | Plus Jakarta Sans, 14px |
| **Ícone**                    | 20px                    |
| **Padding da opção**         | 12px                    |
| **Espaçamento entre opções** | 4px                     |

## 3. Estados das opções

| Estado       | Fundo                      | Texto     |
| ------------ | -------------------------- | --------- |
| **Default**  | `#FFFFFF`                  | `#302B40` |
| **Hover**    | `#F0E3F0`                  | `#660366` |
| **Focus**    | `#F0E3F0` + ring `#1688F8` | `#660366` |
| **Selected** | `#E4F1FF`                  | `#0969D7` |
| **Disabled** | `#F4F4FD`                  | `#74788A` |
| **Danger**   | `#FFFFFF`                  | `#B91C1C` |

## 4. Exemplos

### Menu do usuário

* Meu perfil
* Minha coleção
* Meus anúncios
* Favoritos
* Configurações
* Sair

### Menu de anúncio

* Ver anúncio
* Editar anúncio
* Compartilhar
* Marcar como favorito
* Excluir anúncio

## 5. Regras

* Dropdowns devem abrir próximos ao elemento que os acionou.
* A lista deve permanecer dentro dos limites visíveis da interface.
* A navegação por teclado deve ser suportada.
* A opção Danger deve ser utilizada somente para ações destrutivas.
* Dropdown não deve substituir Select em formulários.
