# Handoff — Histórico de Transações | TCG Market

**Projeto:** TCG Market — Projeto Integrador III  
**Entrega:** protótipos de alta fidelidade para Sprint 8  
**Artefatos:** 14 PNGs em 1600 × 1000 px; visão geral; este Markdown  
**Escopo:** interface e especificação; **não representa funcionalidade já implementada**.

> **Diretriz preservada:** compras e vendas podem apresentar valores financeiros; **trocas envolvem apenas cartas**, sem dinheiro e sem complemento financeiro. A tela não utiliza breadcrumb.

## 1. Objetivo e visão geral

Permitir que o usuário autenticado consulte seu **histórico de operações na plataforma**, visualizando compras, vendas e trocas, com informações essenciais e acesso à leitura detalhada de cada registro.

### Entrada sugerida

- Menu da conta/perfil → **Histórico de transações** (sem criar novo item de navegação global enquanto isso não for aprovado pelo PO).
- A barra superior e o rodapé são elementos compartilhados do produto. Reutilizar seus componentes reais; não criar cópias independentes.
- Rota sugerida: `/perfil/historico` e detalhe `/perfil/historico/$transactionId` (confirmar com a árvore atual de rotas).

### Hierarquia da página

1. Navbar padrão;
2. Banner “Histórico de transações”;
3. Filtros segmentados: **Todas | Compras | Vendas | Trocas**;
4. Busca por carta, participante ou identificador;
5. Filtros por período, status e ordenação;
6. Lista de transações com tipo, data, contraparte, cartas, quantidades, total quando aplicável, status e ação **Ver detalhes**;
7. Paginação com contagem dos itens exibidos;
8. Footer padrão.

## 2. Mapa de telas (arquivos PNG)

| Arquivo | Tela / situação | Objetivo visual |
|---|---|---|
| `01_historico_todas_transacoes.png` | Listagem unificada | Apresentar compra, venda e troca na mesma consulta. |
| `02_filtro_compras.png` | Compras | Mostrar compras com vendedor, total e situação. |
| `03_filtro_vendas.png` | Vendas | Mostrar vendas com comprador, total e situação. |
| `04_filtro_trocas.png` | Trocas | Mostrar operações somente de cartas e as duas partes. |
| `05_detalhes_compra_concluida.png` | Detalhe de compra | Cartas, quantidades, participante, valor e linha do tempo. |
| `06_detalhes_venda_em_andamento.png` | Detalhe de venda | Informações da operação ainda não concluída. |
| `07_detalhes_troca_concluida.png` | Detalhe de troca concluída | “Você entregou” × “Você recebeu”, múltiplas cartas, sem dinheiro. |
| `08_detalhes_compra_cancelada.png` | Compra cancelada | Preservação do registro com status final, sem exclusão do histórico. |
| `09_detalhes_troca_em_andamento.png` | Troca em andamento | Aceite sem falsa indicação de conclusão efetiva. |
| `10_historico_vazio.png` | Sem transações | Orientar início de uso com CTA “Explorar anúncios”. |
| `11_filtros_sem_resultados.png` | Filtros sem resultados | Permitir limpar os filtros sem perder o contexto. |
| `12_loading_historico.png` | Loading da listagem | Skeleton do layout para carregamento estável. |
| `13_erro_ao_carregar_historico.png` | Erro de consulta | Mensagem explicativa + “Tentar novamente”. |
| `14_detalhes_pagamento_recusado.png` | Compra não concluída | Estado de pagamento recusado, com registro consultável. |

As telas são **estáticas e ilustrativas**, não são prints de uma funcionalidade em produção. Nomes, datas, preços, imagens e identificadores são fictícios; não foram extraídos do banco de dados real.

## 3. Design System

| Token | Valor / uso |
|---|---|
| Primário | `#660366` — ações e destaque da navegação. |
| Roxo secundário | `#996699` — detalhes e superfícies de apoio. |
| Fundo claro | `#F2F2F2` ou neutros claros do sistema. |
| Texto | `#1E1E1E`, com variações neutras acessíveis. |
| Acento | `#FCD203` — destaque pontual (ex.: compra). |
| Tipografia | **Cinzel** em títulos/marca; **Plus Jakarta Sans** para corpo e controles. |
| Venda | chip **roxo**. |
| Troca | chip **azul**. |
| Compra | chip amarelo suave para não competir com a semântica venda/troca. |
| Status concluída | verde + texto/ícone, nunca apenas cor. |
| Status em andamento | amarelo/âmbar + texto/ícone. |
| Status cancelada/recusada | vermelho suave + texto/ícone. |
| Cards | superfície branca, borda neutra, cantos arredondados, sombra leve. |

**Importante:** navbar e footer dos PNGs são uma representação visual de referência dos protótipos anteriores. Na implementação, **reutilizar os componentes existentes no repositório** e seus links, estilos, comportamento de autenticação e responsividade. Não duplicar o shell.

## 4. Regras de exibição por operação

### Compra

- Tipo **Compra**, ID, data/hora, vendedor, cartas compradas e quantidades, valor unitário e total registrado, status.
- O usuário autenticado é o **comprador**.
- Em listagem, o número apresentado é o **total da transação**, não necessariamente o preço unitário do anúncio.
- Se houver vários itens, detalhes exibem todos em lista; a prévia pode mostrar algumas miniaturas e “+N”.

### Venda

- Tipo **Venda**, ID, data/hora, comprador, cartas vendidas e quantidades, valor unitário e total, status.
- O usuário autenticado é o **vendedor**.
- Para uma compra contendo anúncios de vários vendedores, definir se o histórico do vendedor representa uma venda individual/subpedido (preferencial) ou o pedido geral; não expor outros vendedores indevidamente.

### Troca

- Tipo **Troca**, ID, data/hora, participante contraparte, status e cartas de cada lado.
- **Você entregou**: itens originalmente pertencentes à coleção do usuário autenticado.
- **Você recebeu**: itens oferecidos pelo outro participante.
- Quantidade de cada item explicitamente indicada.
- **Não exibir preço, total, frete, checkout ou complemento financeiro** na troca. Usar a indicação “Somente cartas”.
- O aceite de uma **proposta** não indica, por si só, que a **troca foi concluída**. Exibir conclusão somente com evidência de encerramento definida pelo domínio e validada pelo PO.
- Propostas pendentes/recusadas/canceladas são geridas na área **Minhas propostas de troca**; não classificá-las como transações realizadas automaticamente. A definição do momento em que uma proposta passa a gerar registro operacional é pendência de negócio.

## 5. Estados e semântica

### Estados de transações (proposta de nomenclatura)

| Tipo | Status proposto | Rótulo UI | Observação |
|---|---|---|---|
| Compra | `PENDING_PAYMENT` | Aguardando pagamento | Apenas se backend realmente representar o estado. |
| Compra | `PAYMENT_DECLINED` | Pagamento recusado | Retém registro do pedido, não afirma pagamento. |
| Compra/Venda | `IN_PROGRESS` | Em andamento | Não confundir com “Concluída”. |
| Compra/Venda/Troca | `COMPLETED` | Concluída | Somente após evento definitivo de conclusão. |
| Compra/Venda/Troca | `CANCELLED` | Cancelada | Preserva histórico e data de cancelamento. |
| Troca | `IN_PROGRESS` | Em andamento | Exige proposta aceita e início de operação, **se** regra aprovada. |

`PAYMENT_DECLINED`, `PENDING_PAYMENT` e os demais valores acima são **contratos sugeridos**, não enumeradores já confirmados no backend. Mapear para os nomes reais antes da implementação.

### Estados da consulta

- `loading`: skeleton nas linhas, evitar layout shift.
- `successWithData`: listagem/filtros/paginação ativos.
- `emptyHistory`: usuário ainda não possui registros; CTA de exploração.
- `emptyFilter`: há histórico, mas filtro não retornou registros; CTA limpar filtros.
- `error`: mensagem de erro e retry, preservar filtros no reprocessamento.
- `notFound` / `forbidden` no detalhe: mensagem específica, não apresentar dados de outro usuário.
- Imagem indisponível: usar fallback já adotado pelo projeto, sem perder nome/ID.

## 6. Fluxos de usuário

```text
Perfil do usuário
  └─ Histórico de transações
       ├─ Todas ──────────────────┐
       ├─ Compras ────────────────┤
       ├─ Vendas ─────────────────┤ → Buscar/Filtrar/Paginar → Ver detalhes
       └─ Trocas ────────────────┘                               ├─ Compra
                                                                  ├─ Venda
                                                                  └─ Troca
                                                                     ↓
                                                              Voltar ao histórico
```

**Ações:** o histórico é de **consulta**. Não disponibilizar botões para refazer pagamento, aprovar, recusar ou cancelar a partir desta tarefa. Essas operações pertencem a fluxos próprios. “Ver detalhes” e “Voltar ao histórico” devem preservar filtro, ordenação e página (query string ou estado de navegação).

## 7. Contratos de dados sugeridos

```ts
type TransactionType = 'PURCHASE' | 'SALE' | 'TRADE';

type TransactionStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_DECLINED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

type HistoryItem = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;                 // ISO 8601; converter para timezone de exibição
  updatedAt?: string;
  completedAt?: string | null;
  counterparty: {
    id: string;
    displayName: string;
  };
  items: Array<{
    cardId: string;
    cardName: string;                 // snapshot na data da operação
    imageUrl?: string | null;
    game: string;
    edition?: string;
    condition?: string;
    language?: string;
    quantity: number;
    unitPrice?: number | null;        // apenas compra/venda
  }>;
  totalAmount?: number | null;       // apenas compra/venda; moeda BRL
};

type TradeTransactionDetail = Omit<HistoryItem, 'type' | 'items' | 'totalAmount'> & {
  type: 'TRADE';
  givenItems: HistoryItem['items'];  // perspectiva do usuário autenticado
  receivedItems: HistoryItem['items'];
  events: Array<{
    code: string;
    occurredAt: string;
    label: string;
  }>;
};

type HistoryQuery = {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;                // YYYY-MM-DD, inclusive
  endDate?: string;                  // YYYY-MM-DD, inclusive
  search?: string;
  sort?: 'recent' | 'oldest';
  page?: number;                     // esclarecer convenção da API
  size?: number;
};
```

A estrutura é **proposta para o handoff**, não modelo MongoDB já aprovado. Evitar introduzir coleção persistente duplicada sem decidir origem dos eventos e a fronteira entre pedidos, transações e propostas.

## 8. API sugerida (não existente/confirmada)

```http
GET /api/users/me/transactions?type=&status=&search=&startDate=&endDate=&sort=recent&page=1&size=10
GET /api/users/me/transactions/{transactionId}
```

Respostas devem conter dados da **perspectiva do usuário autenticado**, inclusive a contraparte e os lados da troca. Paginação: `items`, `page`, `size`, `totalItems`, `totalPages` (adaptar ao contrato utilizado nos endpoints existentes). Nunca aceitar um `userId` arbitrário sem autorização.

## 9. Componentização React sugerida

```text
pages/history/
  TransactionHistoryPage.tsx
  TransactionDetailPage.tsx
components/history/
  HistoryBanner.tsx
  HistoryTabs.tsx
  HistoryFilters.tsx
  TransactionList.tsx
  TransactionRow.tsx
  TransactionStatusBadge.tsx
  TransactionTypeBadge.tsx
  TransactionCardPreview.tsx
  HistoryPagination.tsx
  TransactionDetailHeader.tsx
  TransactionItemsPanel.tsx
  TransactionTimeline.tsx
  HistoryEmptyState.tsx
  HistoryErrorState.tsx
  HistorySkeleton.tsx
services/
  historyApi.ts
```

Reutilizar onde possível `Navbar`, `Footer`, componentes de `Button`, `Modal`, badges, cards e `useRemoteData` já consolidados, se existentes na branch de implementação.

## 10. Formatação e ordenação

- Datas exibidas como `dd/MM/aaaa` e hora local brasileira quando pertinente, com preferência por `Intl.DateTimeFormat('pt-BR')`.
- Valores de compra/venda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Quantidade: número inteiro positivo; nunca inferir múltiplas cartas apenas pelo número de miniaturas da listagem.
- Ordenação padrão: mais recentes primeiro (`createdAt desc`), com desempate determinístico (`id desc`).
- Busca em campos acessíveis ao usuário (nome da carta, ID, participante); usar debounce para evitar requisições excessivas.
- Tipo de operação e status são dimensões diferentes. A mudança de filtro deve reiniciar para a primeira página.

## 11. Restrições, segurança e consistência

1. Histórico pertence ao usuário autenticado: somente compras em que é comprador, vendas em que é vendedor e trocas em que participa.
2. Manter **snapshot** de carta, quantidade, preço e participantes na transação. Excluir/editar anúncio não altera retroativamente o histórico.
3. Não calcular preços históricos com o **preço atual do anúncio**.
4. Pagamento simulado no protótipo não deve ser interpretado como integração real com meio de pagamento.
5. Não concluir troca automaticamente no aceite da proposta sem regra explícita do PO.
6. Tratamento do endereço e eventuais dados pessoais **fora desta interface**, exceto detalhes mínimos expressamente aprovados.
7. Não duplicar um pedido de múltiplos vendedores como se fosse uma venda única de todo o valor para cada vendedor.
8. Cancelamento e falhas devem continuar visíveis quando o evento tiver sido registrado; confirmar política de retenção com o PO.
9. Estado de troca deve refletir se as cartas foram de fato transferidas ou a operação apenas aceita; evitar promessa de entrega ou atualização da coleção sem suporte do backend.

## 12. Acessibilidade e responsividade

- Breakpoints conforme o Design System atual, evitando novos valores arbitrários.
- No mobile, cartões tornam-se pilhas: tipo/data → carta/contraparte → status/valor → ação.
- Indicar status com texto e, quando fizer sentido, ícone; não depender somente de cor.
- Foco visível nos filtros e botões; controles acionáveis por teclado.
- Filtros com nome acessível e estados `aria-pressed`/`aria-selected` quando aplicável.
- Skeleton com `aria-busy`, anúncio de erro via `role="alert"` e contador de resultados anunciado moderadamente.
- Imagem com alt contendo carta; fallback identificado em caso de falha.
- Contraste WCAG AA; truncamentos com forma de acesso ao texto completo.

## 13. Dependências / alinhamento com PO e backend

- **O que constitui a operação de troca no histórico?** Proposta aceita, confirmação bilateral de transferência, ou outra etapa? O protótipo assume diferença entre “em andamento” e “concluída”.
- **Fonte de dados de compras/vendas:** agregado por pedido, subpedido por vendedor ou transação de item?
- **Status reais** disponíveis para compra/venda/troca, inclusive pagamento recusado/cancelamento.
- **Metadados de valores:** subtotal, frete, taxas, descontos; este protótipo mostra apenas valor unitário e total para não pressupor essas regras.
- **Persistência de snapshot histórico** e identificação de cartas em multi-itens.
- **Política de retenção** dos registros e estados de estorno/devolução, caso previstos.
- **Padrão de navegação** de acesso ao histórico via perfil.

## 14. Critérios de aceite (rastreabilidade)

- [x] Listagem com compra, venda e troca.
- [x] Tipo, data, contraparte, cartas, quantidade e status.
- [x] Valor nas compras/vendas e ausência de valores nas trocas.
- [x] Acesso a detalhes de cada tipo.
- [x] Histórico vazio e filtros sem resultado.
- [x] Loading e erro com retry.
- [x] Estilos de referência consistentes com os protótipos do TCG Market.
- [x] Material de handoff preparado para a Sprint 8.
- [ ] Contratos, status e eventos definitivos a validar com o PO e com o backend.

**Pronto para revisão de design e refinamento técnico.** A implementação deve reutilizar o shell e os componentes reais do projeto, adotar a API efetiva e validar as regras ainda em aberto antes de abrir a tarefa de código.
