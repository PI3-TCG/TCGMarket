# Relatório da issue #92 — Responsividade do Marketplace

**Data:** 13/11/2026  
**Base revisada:** checkout local com HEAD em `54beec8` e alterações locais da issue #190.  
**Método:** leitura da issue e dos comentários pela API do GitHub, inspeção das rotas, componentes e guias de design do repositório, seguida de build do front-end. A issue está aberta e não tinha comentários na consulta. Esta etapa foi de revisão, sem alterações no código do produto.

## Resultado da revisão

O principal desvio encontrado está na descoberta de anúncios. Em telas abaixo de `lg`, os filtros inteiros aparecem antes dos resultados. Isso diverge da orientação de design para filtros recolhíveis em telas estreitas. Em `lg`, a grade do Marketplace passa de três para cinco colunas justamente quando a barra lateral de 240 px passa a ocupar parte da largura. A 1024 px, descontando margens e espaçamentos declarados, sobram aproximadamente 136 px por card. É uma estimativa do CSS, que orienta a validação de preços, textos longos e botões no navegador.

Carrinho, checkout, trocas e histórico já têm pontos de adaptação no código. A prioridade nesses fluxos é verificar se os controles continuam acessíveis com dados longos, telas baixas e teclado aberto.

| Fluxo | Resultado observado no código | Perspectiva e prioridade sugerida |
| --- | --- | --- |
| Home do Marketplace e cards | Filtros antecedem a grade em telas estreitas. A grade usa uma, duas, três e cinco colunas conforme o breakpoint. | **Alta.** Reutilizar um painel recolhível com botão visível e ajustar a quantidade de colunas à largura disponível. Conferir filtros ativos, ordenação e paginação. |
| Detalhe do anúncio | Página empilha abaixo de `md`, com ações em largura total. A ficha reserva 120 px para rótulos e usa uma coluna flexível para valores. | **Média.** Exercitar nomes e descrições longos, compra e troca a 320–390 px, e verificar a largura útil quando a página se divide em duas colunas. |
| Criação e gerenciamento de anúncios | O formulário de criação só se divide em duas colunas em `lg`. Em Meus anúncios, os filtros ficam inteiros acima da lista em telas estreitas, embora o guia proponha recolhimento. | **Alta para filtros, média para formulário.** Reutilizar a solução do Marketplace. Testar seleção, disponibilidade, publicação, edição e ações dos modais. |
| Carrinho | Itens e resumo passam a duas colunas em `lg`. | **Alta na validação.** Conferir quantidade, remoção, mensagens de indisponibilidade e avanço para entrega, com um item e com vários. |
| Checkout | Entrega e revisão empilham abaixo de `lg`. O resumo da revisão fica fixo durante a rolagem em desktop. | **Alta na validação.** Exercitar endereço, erros de campo, retorno ao carrinho e confirmação com teclado aberto e viewport baixo. |
| Resultado da compra | Ações empilhadas no mobile e com quebra de linha a partir de `sm`. | **Média.** Conferir sucesso, processamento e falha, com múltiplos itens e acesso às ações de retorno. |
| Trocas | Modais compartilhados têm altura máxima de 90 dvh e corpo rolável. A seleção e a confirmação usam grades que passam a duas colunas em `sm` ou `md`. | **Alta na validação.** Conferir se as colunas cabem na largura interna do modal e se voltar, avançar e confirmar permanecem acessíveis com listas longas. |
| Histórico de transações | A lista empilha no mobile e usa três colunas a partir de `md`. O detalhe usa barra lateral de 320 px a partir de `lg`. | **Média.** Conferir nomes longos, filtros, paginação e acesso ao detalhe a 768 px e em telas estreitas. |

A navegação usa o shell compartilhado e a faixa de jogos permite rolagem horizontal interna. Na validação, vale separar essa rolagem intencional de overflow da página e verificar busca, conta, carrinho e navegação por teclado.

## Situação dos critérios de aceite

- **Ajustes da revisão de Design e aderência aos protótipos:** há divergências de filtros identificadas e recomendações registradas nos guias. A issue não lista ocorrências por tela, e alguns guias usam referências desktop que exigem validação própria no mobile.
- **Fluxos em mobile, tablet e desktop:** as adaptações foram inspecionadas no código. A execução dos fluxos nas três larguras ainda está pendente.
- **Ações acessíveis, navegação e consistência visual:** a estrutura reutiliza componentes do projeto. Overflow, foco, corte de conteúdo e aparência ainda precisam ser conferidos no navegador.
- **Build:** `npm run build` passou. A compilação não verifica o layout renderizado. O Chromium local falhou ao iniciar porque o ambiente bloqueou a criação de socket, portanto esta revisão não produziu medições reais de viewport ou testes de compra e troca.

## Próxima etapa sugerida

1. Ajustar filtros e grade em Marketplace e Meus anúncios, reaproveitando os controles e o estado de filtragem existentes.
2. Validar carrinho → entrega → revisão → resultado e seleção → revisão → envio de proposta. Usar cenários de sucesso, falha, carregamento e lista vazia.
3. Conferir os fluxos a 320 e 390 px, 768 e 1024 px, e 1440 px. Incluir a transição de 1023 para 1024 px e uma tela baixa. Registrar por rota a largura testada, se existe rolagem lateral da página e se todas as ações podem ser alcançadas por toque e teclado.
4. Comparar os resultados com os guias de anúncios, criação, gerenciamento, carrinho, trocas e histórico em `docs/design-system/prototyping/`. Registrar com Design as decisões para os estados sem referência mobile.

[Issue #92 no GitHub](https://github.com/PI3-TCG/TCGMarket/issues/92#issue-5608829057)
