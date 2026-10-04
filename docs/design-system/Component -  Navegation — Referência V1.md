# Navigation — Referência V1

## 1. Propósito

A Navigation organiza o acesso às principais áreas do TCG Market e estabelece a identidade visual principal da plataforma.

O sistema utilizará uma navegação em duas camadas.

## 2. Estrutura

### Primeira camada

```text
[ LOGO ]      [ PESQUISA ]                         [ LOGIN / PERFIL ]
```

Responsável pela identidade, pesquisa global e acesso à conta.

### Segunda camada

```text
Magic | Pokémon | Yu-Gi-Oh! | One Piece | Digimon
```

Responsável pelo acesso aos catálogos dos diferentes TCGs.

## 3. Aparência

| Elemento                       | Padrão                                       |
| ------------------------------ | -------------------------------------------- |
| **Identidade**                 | Roxo                                         |
| **Texto principal**            | `#FFFFFF` ou `#302B40`, conforme superfície  |
| **Ação/Link**                  | `#1688F8`                                    |
| **Hover**                      | `#F0E3F0` ou destaque em `#1688F8`           |
| **Focus**                      | Ring `#1688F8`                               |
| **Fonte funcional**            | Plus Jakarta Sans                            |
| **Logo/títulos de identidade** | Cinzel                                       |
| **Altura**                     | Definida conforme protótipo e responsividade |

## 4. Estados

| Estado       | Comportamento                       |
| ------------ | ----------------------------------- |
| **Default**  | Item disponível                     |
| **Hover**    | Destaque visual discreto            |
| **Active**   | Indica seção atualmente acessada    |
| **Focus**    | Focus ring `#1688F8`                |
| **Selected** | Indica catálogo ou seção ativa      |
| **Disabled** | Item indisponível, quando aplicável |

## 5. Exemplos

### Catálogos

* Magic
* Pokémon
* Yu-Gi-Oh!
* One Piece
* Digimon

### Área do usuário

* Meu perfil
* Minha coleção
* Meus anúncios
* Favoritos
* Mensagens

### Ações

* Criar anúncio
* Buscar
* Entrar

## 6. Regras

* A navegação deve permanecer clara e previsível.
* O logo deve funcionar como acesso à página inicial.
* O catálogo deve estar visualmente separado da navegação da conta.
* A seção atual deve possuir indicação visual clara.
* A navegação não deve competir visualmente com o conteúdo principal.
* A pesquisa deve permanecer facilmente acessível.
