# Levantamento de Requisitos Funcionais e Não Funcionais do Sistema

O Levantamento de Requisitos foi realizado por meio de estudo e análise das plataforma existentes de compra e venda de cards colecionáveis. Além disso, foi acrescentado requisitos particulares deste projeto como o módulo de troca de cartas. 
Os RFs foram classificados, baseado no método MoSCoW, em: Essencial, Importante, Desejável e Opcional.  O objetivo da classificação é facilitar a priorização da construção dos requisitos conforme sua relevância dentro do projeto. 

## Requisitos Funcionais (RF)

- RF01 — Cadastro e login de usuário (autenticação) — **Essencial**
- RF02 — Sistema de pagamento (mesmo que simulado, já que é projeto acadêmico) — **Essencial**
- RF03 — Filtro de busca avançado (por jogo, raridade, edição, condição, preço, idioma) — **Importante**
- RF04 — Divisão de catálogo por jogo (Magic, Pokémon, Yu-Gi-Oh) — **Importante**
- RF05 — Carrinho de compras — **Essencial**
- RF06 — Lista de desejos (wishlist) — **Desejável**
- RF07 — Perfil de usuário (dados, histórico, avaliações) — **Importante**
- RF08 — Feed de últimos anúncios — **Desejável**
- RF09 — Ranking de cartas mais procuradas/vendidas — **Desejável**
- RF10 — Estatística/histórico de preço por carta — **Desejável**
- RF11 — Cadastro de anúncio (usuário anuncia carta pra venda, com condição/quantidade/preço) — **Essencial**
- RF12 — Sistema de troca de cartas entre usuários (proposta, aceite, recusa) — **Importante**
- RF13 — Busca textual por nome da carta — **Importante**
- RF14 — Avaliação de vendedor/comprador (sistema de reputação) — **Importante**
- RF15 — Histórico de transações do usuário — **Importante**
- RF16 — Minha coleção (catalogar cartas que o usuário já possui, separado do que está à venda) — **Desejável**
- RF17 — Notificações (proposta de troca recebida, item da wishlist com preço baixo, etc.) — **Opcional**
- RF18 — Painel administrativo (moderação de anúncios, denúncias, gestão de usuários) — **Opcional**
- RF19 — Comparação de preços entre vendedores para a mesma carta — **Desejável**
- RF20 — Sistema de Venda e Compra — **Essencial**
- RF21 — Chat entre vendedor e comprador — **Desejável**

## Requisitos Não Funcionais (RNF)

- RNF01 — **Desempenho:** Consultas de busca e filtro devem retornar resultados em até 2 segundos, mesmo com a base contendo 1 milhão ou mais de registros de anúncios.
- RNF02 — **Escalabilidade:** A estrutura de dados (schema do MongoDB) deve suportar crescimento de volume sem necessidade de redesenho, validado por meio de testes de carga com inserção progressiva de registros (ex.: 100k, 500k, 1M).
- RNF03 — **Segurança:** Senhas de usuário devem ser armazenadas com hash (bcrypt ou equivalente), nunca em texto puro; toda comunicação entre cliente e servidor deve ocorrer via HTTPS; dados de pagamento não devem ser armazenados diretamente no banco da aplicação.
- RNF04 — **Usabilidade:** A interface deve ser responsiva, funcionando corretamente em resoluções de desktop (≥1280px) e mobile (≥360px), com no máximo 3 cliques entre a tela inicial e a finalização de uma compra.
- RNF05 — **Manutenibilidade:** O código deve seguir controle de versão via Git com commits organizados por funcionalidade, e a arquitetura deve ser modular o suficiente para permitir que os 5 integrantes do grupo trabalhem em módulos distintos simultaneamente sem conflitos frequentes.
- RNF06 — **Confiabilidade/Disponibilidade:** O sistema deve tratar erros de forma que uma falha em uma funcionalidade (ex.: pagamento) não derrube as demais (ex.: navegação, busca), validado por testes de exceção controlada.
- RNF07 — **Conformidade legal (LGPD):** O sistema deve apresentar termo claro de coleta e uso de dados pessoais no cadastro, e permitir que o usuário solicite exclusão de sua conta e dados associados em até 15 dias.
- RNF08 — **Portabilidade/Compatibilidade:** O sistema deve funcionar corretamente nas duas versões mais recentes dos navegadores Chrome, Firefox e Edge, testado manualmente em cada um antes da entrega final.
