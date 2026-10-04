# Fluxo de Navegação — Marketplace TCG

Este documento resume os principais fluxos de navegação definidos para o marketplace de TCG, contemplando o acesso ao sistema, navegação do usuário, anúncios, compras e trocas.

---

## 1. Navegação Geral

O fluxo geral começa na **Home** do sistema.

A partir da Home, o sistema verifica se o usuário está logado:

* **Não está logado:** o usuário é direcionado para **Login / Cadastro**.

  * Após informar as credenciais, o sistema verifica sua validade.
  * Com credenciais válidas, o sistema verifica o **perfil de acesso**.
* **Está logado:** o usuário segue diretamente para as funcionalidades disponíveis.

### Perfil Administrador

O administrador possui acesso ao **Painel Admin**, onde pode:

* **Moderar anúncios**
* **Gerenciar usuários e denúncias**

### Perfil Usuário

O usuário comum pode acessar as principais funcionalidades do marketplace:

* **Catálogo por jogo**
* **Filtros avançados**
* **Detalhes da carta**
* **Página do anúncio**
* **Perfil**
* **Minha coleção**
* **Lista de desejos**
* **Histórico de transações**
* **Avaliações recebidas**

A partir da página de um anúncio, o usuário pode escolher diferentes ações:

* Adicionar ao **carrinho**
* Iniciar o **fluxo de compra**
* Iniciar o **fluxo de troca**
* Adicionar à **lista de desejos**
* Utilizar o **chat com o vendedor**

---

# 2. Fluxo de Anúncio

O fluxo de anúncio permite que um usuário disponibilize uma carta para venda no marketplace.

### Etapas

1. Acessar **Minha coleção**.
2. O sistema verifica se a carta já está cadastrada na coleção.
3. Caso a carta não esteja na coleção:

   * Buscar a carta no catálogo.
   * Adicionar a carta à coleção.
4. Selecionar a carta.
5. Clicar em **Anunciar**.
6. Informar:

   * Preço;
   * Idioma;
   * Quantidade.
7. O sistema realiza a validação dos dados e da quantidade disponível.

### Validação

**Dados válidos e quantidade disponível?**

* **Não:** exibir os erros de validação para o usuário.
* **Sim:** permitir a publicação do anúncio.

Após a publicação:

> O anúncio aparece no **feed** e no **catálogo**.

---

# 3. Fluxo de Compra

O fluxo de compra começa quando o usuário acessa o **carrinho**.

### Etapas

1. Acessar **Carrinho**.
2. O sistema verifica se os itens estão disponíveis em estoque.

### Itens disponíveis?

* **Não:** avisar o usuário sobre a indisponibilidade e remover o item.
* **Sim:** continuar o processo.

Em seguida, o sistema verifica se o usuário está logado.

### Usuário logado?

* **Não:** direcionar para **Login / Cadastro**.
* **Sim:** continuar para o checkout.

### Checkout

3. Confirmar o **endereço de entrega**.
4. Escolher a **forma de pagamento**.
5. Processar o pagamento.

### Pagamento aprovado?

* **Não:** exibir o erro e permitir uma nova tentativa.
* **Sim:** confirmar o pedido.

Após a confirmação:

1. Atualizar o estoque.
2. Registrar a operação no **histórico de transações**.
3. Verificar se o usuário deseja avaliar o vendedor.

### Avaliação

Caso o usuário queira avaliar o vendedor:

* Abrir a **tela de avaliação**.
* Informar **nota e comentário**.

---

# 4. Fluxo de Troca

O fluxo de troca começa quando existe um **anúncio de troca disponível**.

### Etapas

1. Acessar o **anúncio de troca**.
2. Selecionar **Propor troca**.
3. Selecionar uma carta da **Minha coleção**.
4. Verificar a **diferença de valor**, quando aplicável.
5. Enviar a proposta.
6. O dono do anúncio é notificado.

### Resposta do dono do anúncio

O dono do anúncio analisa a proposta.

#### Proposta recusada

Caso a proposta seja recusada:

> O solicitante é notificado sobre a recusa.

#### Proposta aceita

Caso a proposta seja aceita:

> Os usuários combinam a entrega pelo **chat**.

Após a combinação:

1. Ambos realizam a entrega.
2. O sistema verifica se **ambos confirmaram o recebimento**.
3. A troca é concluída.
4. A operação é registrada no **histórico**.
5. O usuário pode **avaliar a outra parte**.

---

# 5. Visão Geral dos Fluxos

| Fluxo               | Início           | Principais etapas                                            | Resultado                              |
| ------------------- | ---------------- | ------------------------------------------------------------ | -------------------------------------- |
| **Navegação Geral** | Home             | Login → Perfil de acesso → Funcionalidades                   | Acesso às funcionalidades do sistema   |
| **Anúncio**         | Minha coleção    | Selecionar carta → Informar dados → Validar → Publicar       | Anúncio disponível no feed e catálogo  |
| **Compra**          | Carrinho         | Estoque → Login → Checkout → Pagamento → Pedido              | Compra registrada e estoque atualizado |
| **Troca**           | Anúncio de troca | Proposta → Carta da coleção → Aceite → Entrega → Confirmação | Troca concluída e registrada           |

---

# 6. Relação entre os Fluxos

Os fluxos estão interligados durante a utilização do marketplace:

```text
                         HOME
                           │
                    Usuário está logado?
                     /              \
                   Não               Sim
                   │                  │
            Login / Cadastro          │
                   │                  │
                   └────────┬─────────┘
                            │
                     Perfil de acesso
                       /          \
                   Admin          Usuário
                    │               │
              Painel Admin      Catálogo / Perfil
                    │               │
            ┌───────┴───────┐       │
            │               │       │
      Moderar anúncios   Gerenciar  Página do
                         usuários    anúncio
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                Carrinho          Propor troca     Lista de desejos
                    │                 │
              Fluxo de compra    Fluxo de troca
```

O **fluxo de anúncio** possui uma relação importante com a coleção do usuário: a carta precisa estar disponível em **Minha coleção** para que possa ser selecionada e anunciada.

Já os fluxos de **compra** e **troca** partem da interação do usuário com os anúncios publicados no marketplace.

Dessa forma, os quatro diagramas representam diferentes partes de uma mesma jornada dentro do sistema:

> **Usuário acessa o marketplace → encontra uma carta → pode adicioná-la aos desejos, comprar, propor uma troca ou conversar com o vendedor.**

Enquanto isso, o usuário que possui uma carta pode:

> **Adicionar à coleção → anunciar a carta → receber propostas/compras → concluir a negociação → registrar a transação e receber avaliações.**
