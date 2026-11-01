# TCG Market · Revisão final de estados de feedback e navegação

**Tipo:** auditoria de design + especificação de UX + handoff para implementação  
**Status:** proposta para aprovação visual e aplicação; **não** representa código corrigido  
**Base:** leitura dos arquivos da branch `main` do repositório `PI3-TCG/TCGMarket`, prints de modais já enviados e referências de design/handoffs existentes.  
**Escopo de verificação:** código da branch principal e documentação consultada; **não** houve execução local, teste de navegador responsivo ou acesso a fluxos ainda não integrados.

## 1. Decisões centrais

1. Adotar **um mesmo sistema de feedback** para todo o Marketplace, sem confundir estado vazio, falha e indisponibilidade.
2. Manter o visual refinado recém-aprovado para modais: cabeçalho com gradiente roxo quando há título/contexto, superfícies claras e espaçamento consistente. **Cor semântica prevalece** nas mensagens de alerta; não pintar erros de roxo.
3. Criar caminhos diretos e previsíveis para **Minha Coleção**, **Propostas de troca** e **Histórico de transações**, sem inflar a navegação principal.
4. Remover CTAs repetidos para o mesmo destino e revisar botões que aparentam funcionar, mas apenas mostram “em breve”.
5. Preservar o contexto após falhas (filtros, quantidades, texto digitado, endereço e seleção); evitar repetição involuntária de compras, cancelamentos e propostas.
6. **Detalhes do anúncio passa a modal padronizado**, conforme decisão da tarefa anterior, mantendo a URL profunda como rota que pode abrir o modal sobre o Marketplace.

---

## 2. Achados no repositório: confirmados × pendentes

| ID | Evidência no código da `main` | Situação | Ação recomendada | Prioridade |
|---|---|---|---|---|
| N01 | `frontend/src/router.tsx`: existe `/minha-colecao`; `components/layout/SiteHeader.tsx`: menu do perfil tem Meu perfil e Meus anúncios, mas não Minha Coleção | **Confirmado:** rota existente sem acesso direto no menu | Adicionar “Minha Coleção” ao menu de conta; incluir link no painel de perfil | **P0** |
| N02 | `frontend/src/router.tsx`: não há rota de histórico; `pages/ReviewPage.tsx`: só apresenta resultado após o pedido | **Confirmado na main:** não há página do histórico | Definir área de histórico e sua rota; sem marcar concluído até implementação e dados disponíveis | **P0 de design**, implementação dependente |
| N03 | `frontend/src/router.tsx`: não há rota específica de propostas; `MarketplaceAdPage.tsx` informa que proposta de troca estará disponível em breve | **Confirmado na main:** ainda não implementado como jornada navegável | Preparar IA “Propostas”, com Enviadas/Recebidas, e definir estados, sem afirmar que está funcional | **P1** |
| N04 | `pages/HomePage.tsx`: CTA “Criar anúncio” no hero e repetido no card lateral para usuário autenticado | **Confirmado:** redundância de mesmo destino na Home | Manter CTA principal no hero; trocar CTA lateral por “Minha Coleção” ou um atalho contextual não repetido | **P1** |
| N05 | `components/profile/ProfileView.tsx`: “Minha coleção em destaque” informa que ficará disponível no futuro | **Confirmado:** texto desatualizado com rota já criada | Trocar placeholder por CTA “Abrir Minha Coleção”; preservar coleção em destaque somente quando houver dados | **P1** |
| N06 | `components/layout/SiteHeader.tsx`: busca e sino mostram aviso de implementação futura; `SiteFooter.tsx` tem links igualmente provisórios | **Confirmado:** controles com aparência funcional que não executam a intenção descrita | Se não implementados, sinalizar “Em breve” explicitamente, retirar ação do foco principal ou priorizar funcionalidade real | **P1** |
| N07 | `components/marketplace/MarketplaceAdCard.tsx` usa rota `/marketplace/anuncios/$id` para “Ver detalhes”; `router.tsx` usa `MarketplaceAdPage` | **Confirmado:** detalhes do anúncio ainda são página | Substituir navegação por modal grande padronizado, sem perder deep link e retorno à lista | **P0** (decisão anterior) |
| N08 | `components/ui/Alert.tsx` já tem success/warning/error/info/neutral; `components/collection/CollectionState.tsx`, `pages/MyAdsPage.tsx`, `pages/CartPage.tsx` implementam visualizações diferentes de erro/vazio/loading | **Confirmado:** base funcional com heterogeneidade visual | Usar `Alert`, `EmptyState`, `AsyncState` e `StatusPage` derivados do mesmo padrão | **P1** |
| N09 | `pages/ReviewPage.tsx` contempla pagamento aprovado, recusado, parcial e processamento; `CartPage.tsx` permite desfazer remoção | **Confirmado:** estados críticos parcialmente cobertos | Harmonizar mensagens, ações, focos, persistência, feedback de resultado incerto | **P1** |
| N10 | `pages/MyAdsPage.tsx`, `components/myAds/MyAdModal.tsx` têm confirmações/erros e mudanças de status; `components/ads/DiscardChangesDialog.tsx` protege rascunhos | **Confirmado:** proteção já existe, mas usa padrões diferentes | Unificar modal pequeno de confirmação; preservar texto/estado ao cancelar e validar resultados incertos | **P1** |
| N11 | Telas de troca, gestão de propostas e histórico têm escopo definido na tarefa, mas não há páginas correspondentes na `main` consultada | **Pendente:** revisão integral de interface em execução | Auditar após disponibilização dos protótipos/branch, backend e estados reais | **Não marcar aceite ainda** |

**Fonte consultada:** https://github.com/PI3-TCG/TCGMarket. Os caminhos acima correspondem à estrutura da branch `main` consultada em 01/11/2026; diferenças em branches de trabalho devem ser reconciliadas antes da implementação.

---

## 3. Navegação de conta proposta

### 3.1 Estrutura de informações

**Navbar pública (permanente):** logo → Home; explorar anúncios; categorias TCG; busca **apenas quando funcional**; carrinho; menu da conta. A organização deve caber em telas estreitas sem criar duas barras de CTAs concorrentes.

**Menu da conta autenticada, em agrupamentos:**

```text
MINHA CONTA
  Meu perfil                        /perfil
  Minha Coleção                    /minha-colecao

NEGOCIAÇÕES
  Meus anúncios                    /meus-anuncios
  Propostas de troca               /propostas       (rota proposta)
  Histórico de transações          /historico       (rota proposta)

  Sair
```

**Regras:**

- *Propostas de troca*: uma página com duas abas — **Recebidas** e **Enviadas** — e filtros de status; evitar dois links permanentes para a mesma finalidade.
- *Histórico de transações*: uma área com segmentos **Compras**, **Vendas**, **Trocas** e, se necessário, **Todas**. Não misturar anúncio cancelado com uma transação efetivamente realizada; um anúncio pode ser cancelado sem transação.
- *Minha Coleção*: acesso tanto no menu quanto no perfil, onde há contexto relevante; isso não é redundância indevida porque atende dois pontos naturais de entrada.
- *Criar anúncio*: manter CTA no hero e na página Minha Coleção/Meus anúncios, onde o usuário consegue agir sobre seu acervo. Na Home autenticada, substituir o CTA lateral repetido por **Minha Coleção**.
- *Voltar/Fechar*: em modal sobre anúncio, voltar fecha modal e preserva pesquisa, filtros, ordenação, paginação e posição da lista; deep link direto deve abrir detalhe e oferecer retorno claro ao Marketplace.
- *Mobile*: menu da conta por painel/dropdown com rolagem; os mesmos destinos devem existir, sem depender de hover; touch targets ≥ 44×44 px.

### 3.2 Revisão de botões e links

| Contexto | Situação | Diretriz |
|---|---|---|
| Home hero | “Explorar anúncios” e “Criar anúncio” | **Manter** dois objetivos distintos |
| Home lateral (logado) | “Criar anúncio” repetido | **Trocar** por “Minha Coleção” |
| Destaques da Home | “Ver todos os anúncios” com ordenação por preço | **Revisar rótulo e destino**: preferir `/marketplace?sort=recent` se prometer listagem geral, ou explicitar ordenação |
| Home: últimos anúncios | “Ver todos” para recentes | **Manter** porque é atalho contextual da seção |
| Profile: coleção em destaque | Placeholder “Em breve” | **Substituir** por link para Minha Coleção enquanto destaque de cartas não existir |
| Navbar: sino, busca | “Será implementado no futuro” | **Ajustar affordance**: implementar, ou deixar claramente indisponível com explicação; evitar surpresa após clique |
| Footer: links sociais/institucionais | Mensagem genérica de recurso futuro | **Não simular link funcional**; mostrar apenas os links implementados ou rótulos claramente marcados |
| Marketplace: anúncios | “Ver detalhes” abre página | **Migrar** para modal; manter URL compartilhável |
| Detalhes de anúncio: troca | “Somente troca”, mas ação não disponível | Enquanto não funcional: estado informativo, não botão clicável; com fluxo pronto, “Propor troca” |
| Carrinho | “Continuar” e “Continuar comprando” | **Manter** porque avançar ao checkout e retornar ao catálogo são objetivos diferentes |
| Carrinho: remover | Desfazer oferecido após remoção | **Manter**, observando confirmação real e janela de desfazer |
| Check-out | “Voltar à entrega” e “Simular pagamento” | **Manter** porque o primeiro preserva dados e o segundo executa operação |
| Ações destrutivas | “Cancelar” pode significar sair ou cancelar anúncio | **Rotular com precisão**: “Voltar”, “Manter anúncio”, “Confirmar cancelamento”, “Remover item” |

---

## 4. Padrão visual oficial de feedback

### 4.1 Fundamentos

- **Marca:** roxo `#660366` (primário), roxo suave `#996699` (secundário); Cinzel em títulos de seção/estado e Plus Jakarta Sans no texto.
- **Superfície:** branca ou neutra clara. Painéis de detalhe opcionais em lavanda muito suave. O gradiente roxo é assinatura em cabeçalhos e CTAs principais, **não substitui** cores semânticas.
- **Semanticidade preservada do Design System V1:** sucesso verde `#15803D`; atenção âmbar `#D97706`; erro `#B91C1C`; informação azul `#1D4ED8`; neutro `#484B5A`.
- **Alert inline:** ícone de 20 px, texto 14 px, padding 12×16 px, borda de 1 px, raio 8 px, título opcional semibold. Cores claras de fundo com texto escuro de contraste adequado.
- **State panel:** superfície clara com ícone de 32–40 px, título 20–24 px, descrição breve, um CTA principal e no máximo um secundário.
- **Toast:** canto superior direito no desktop, abaixo da barra em mobile; ação opcional “Desfazer”, sem bloquear navegação; até um por operação, evitando duplicar Alert idêntico na mesma tela.
- **Confirmação:** modal `sm` do sistema aprovado; título claro, consequência objetiva, botão neutro para manter situação, botão vermelho para remoção/cancelamento destrutivo. Não reaproveitar modal complexo de formulário.
- **Loading:** skeleton com a mesma geometria da tela pronta; spinner apenas em operação pontual; nunca mostrar conteúdo fictício como definitivo.
- **Motion:** discreto e respeitando `prefers-reduced-motion`; mensagens não devem depender somente de animação.

### 4.2 Quando usar cada padrão

| Estado | Local do feedback | Comportamento | Ação |
|---|---|---|---|
| Loading inicial | Skeleton no conteúdo | `aria-busy`, preservar estrutura; desabilitar ações afetadas | Nenhuma |
| Loading de operação | Botão com indicador e verbo no gerúndio | Impedir duplo envio; preservar formulário | Nenhuma |
| Vazio real | EmptyState na área de conteúdo | Diferenciar da falha de carregamento | CTA útil e contextual |
| Sem resultado filtrado | EmptyState com lupa | Preservar filtro até usuário limpar | “Limpar filtros” |
| Sucesso reversível | Toast + ação opcional | Após confirmação real; foco continua útil | “Desfazer” quando seguro |
| Sucesso definitivo | Alert/StatusPage | Não sumir antes do usuário compreender | Próximo passo coerente |
| Erro de campo | Mensagem abaixo do campo | Preservar valor, explicar restrição, `aria-describedby` | Corrigir valor |
| Erro recuperável | Alert inline + retry | Não confundir com vazio; manter contexto | “Tentar novamente” |
| Resultado incerto | Alert persistente | Consultar status antes de permitir repetir operação | “Verificar resultado” |
| Operação indisponível | Estado informativo junto ao CTA | Explicar motivo e alternativa; não apenas botão desabilitado | Alternativa permitida |
| Confirmação destrutiva | Modal pequeno | Foco acessível, não confirmar por Escape/backdrop | “Manter” / ação destrutiva |
| Pagamento recusado | StatusPage ou painel persistente | Preservar apenas itens recusados conforme retorno real | “Revisar carrinho” |

---

## 5. Catálogo de mensagens e comportamentos — 11 casos obrigatórios

| ID | Estado | Título e mensagem sugeridos | Comportamento e CTA |
|---|---|---|---|
| F01 | **Loading** | “Carregando anúncios…” / “Publicando anúncio…” / “Processando pagamento simulado…” | Skeleton para listagem; botão bloqueado na operação; impedir envio repetido; manter `aria-busy` |
| F02 | **Vazio** | “Você ainda não tem cartas na coleção.” / “Os itens que você adicionar aparecerão aqui.” | “Explorar catálogo”; diferenciar de “Nenhum resultado encontrado” → “Limpar filtros” |
| F03 | **Sucesso** | “Anúncio publicado com sucesso.” / “Sua carta já pode ser encontrada no Marketplace.” | Exibir depois da confirmação; “Ver anúncio” ou “Meus anúncios”; sem múltiplos avisos repetidos |
| F04 | **Erro** | “Não foi possível carregar seus anúncios.” / “Seus filtros foram mantidos.” | “Tentar novamente”; não substituir lista por vazio, não zerar formulário |
| F05 | **Confirmação** | “Publicar este anúncio?” / “Confira quantidade e modalidade antes de continuar.” | Usar somente quando decisão relevante não está clara no formulário; evitar confirmar todo clique trivially reversível |
| F06 | **Operação indisponível** | “Esta ação não está disponível.” / “O anúncio não aceita essa modalidade de negociação.” | Informar alternativa (comprar/trocar, conforme habilitado); ocultar ação impossibilitada quando adequado |
| F07 | **Quantidade insuficiente** | “Quantidade indisponível.” / “Você solicitou 3 exemplares, mas há 2 disponíveis.” | Erro associado ao item/campo; impedir avanço; “Ajustar para 2” (quando aplicável); revalidar no servidor |
| F08 | **Pagamento recusado** | “Pagamento simulado recusado.” / “Nenhuma cobrança foi realizada. Os itens recusados permanecem no carrinho.” | Diferenciar recusado, parcial e incerto; “Revisar carrinho”; não repetir automaticamente |
| F09 | **Anúncio indisponível** | “Este anúncio não está mais disponível.” / “Pode ter sido cancelado ou esgotado.” | “Voltar aos anúncios”; se houver cache, atualizar listagem; não adicionar ao carrinho |
| F10 | **Proposta inválida** | “Não foi possível enviar a proposta.” / “Uma das cartas oferecidas não está mais disponível na quantidade selecionada.” | Manter seleção possível, destacar itens inválidos, “Revisar proposta”; sem complemento financeiro, apenas cartas |
| F11 | **Ação destrutiva** | “Cancelar este anúncio?” / “Ele deixará de aparecer no Marketplace, mas o histórico será preservado.” | Modal `sm`, botão “Manter anúncio” e botão vermelho “Confirmar cancelamento”; cancelamento só como concluído após retorno confirmado |

### 5.1 Complementos críticos que não devem faltar

- **Pagamento parcial:** “Alguns pedidos foram aprovados e outros recusados.” Exibir resultado **por pedido/vendedor**, preservar somente itens não concluídos, oferecer revisão do carrinho; não repetir pedidos aprovados.
- **Resultado não confirmado:** “Não foi possível confirmar o resultado da operação. Verifique o status antes de tentar novamente.” Persistir o aviso; consultar servidor por identificador da tentativa, quando disponível.
- **Item indisponível no carrinho:** marcar item, impedir seleção/pagamento e permitir removê-lo sem perder demais itens.
- **Preço alterado:** manter o preço antigo como contexto e exigir aceite do novo preço antes de prosseguir; não atualizar silenciosamente valor aprovado.
- **Alterações não salvas:** “Sair sem salvar?” com botões “Continuar editando” e “Descartar alterações”; ao voltar, manter o rascunho.
- **Proposta expirada/recusada/aceita:** título contextual + status e data + detalhes da negociação; não misturar com feedback de pagamento.
- **Histórico vazio:** “Você ainda não realizou transações.” com “Explorar anúncios”; quando houver filtros, diferenciar “Nenhuma transação corresponde aos filtros.”
- **Ação no próprio anúncio:** explicar “Este anúncio é seu. Gerencie-o em Meus anúncios”; não permitir comprar ou propor troca consigo mesmo.

---

## 6. Matriz por fluxo: situações e próximos passos

| Fluxo | Feedbacks que já aparecem na `main` ou têm documentação | Ajuste necessário / pendência |
|---|---|---|
| Home / Marketplace | Skeleton, erro com retry, lista vazia, filtros | Harmonizar com feedback base; revisão da busca global ainda provisória |
| Minha Coleção | Skeleton, vazio, erro, filtros, modais | Acesso direto; estado sem resultados filtrados padronizado; feedback de mutação único |
| Criar anúncio | Skeleton, campos inválidos, quantidade indisponível, sucesso/erro, proteção contra descarte | Uniformizar estilos com modal/formulário; evitar confirmações duplicadas |
| Meus anúncios | Skeleton, erro, vazio e filtros, edição, cancelamento, conflito de status | Usar um modal base aprovado; preservar contexto e diferenciar cancelado de excluído |
| Detalhes do anúncio | Loading, não encontrado, erro, quantidade, adição ao carrinho | Migrar página para modal; retestar sucessos e retornos de erro nele; venda/troca condicionais |
| Carrinho | Vazio, loading, erro, desfazer, quantidade, indisponibilidade, alteração de preço | Convergir mensagens por linha + resumo; evitar alertas duplicados; não iniciar checkout com item inválido |
| Entrega | Skeleton, vazio de endereços, seleção, salvar/erro | Preservar campos no erro; único CTA de continuar; feedback de endereço salvo |
| Revisão/resultado | Processando, aprovado, recusado, parcial, erro | Tornar resultado incerto mais explícito e recuperável; mostrar resultado por pedido |
| Proposta de troca | Protótipos/decisões de design; não há rota na `main` | Definir vazio, seleção inválida, sucesso do envio, falha e alteração de disponibilidade |
| Gerenciamento de propostas | Não há página na `main` | Definir Enviadas/Recebidas, confirmação de aceite/recusa/cancelamento, conflito de estado |
| Histórico de transações | Não há página na `main` | Definir estados loading, vazio, erro, detalhe, resultados e filtros; link no menu |

**Não marcar propostas/histórico como “revisados na aplicação”** antes de a versão navegável correspondente estar disponível.

---

## 7. Regras para propostas de troca

- Modalidade **troca somente de cartas**, sem complemento financeiro (decisão já aprovada).
- Ao selecionar cartas e quantidades: comparar com disponibilidade atual; garantir que a quantidade seja válida; informar individualmente qual item impede o envio.
- Quando o anúncio-alvo deixar de aceitar troca: estado **Anúncio indisponível para troca**, com opção de voltar ao Marketplace.
- Quando usuário tentar propor troca ao próprio anúncio: não disponibilizar a ação, com explicação breve.
- Ao enviar: botão “Enviando proposta…” e bloqueio de duplicidade; sucesso “Proposta enviada” + “Ver propostas enviadas”.
- Recusa/aceite: confirmar quando houver consequência de negócio; atualização de status atômica; se houver conflito, recarregar situação atual.
- Acompanhamento: abas **Recebidas** e **Enviadas**; estados **pendente**, **aceita**, **recusada**, **cancelada**, **expirada** (somente se esse estado existir no domínio). Não inventar status no frontend sem acordo com backend.

---

## 8. Handoff técnico sugerido

### 8.1 Componentes reutilizáveis

```text
ui/
  Alert.tsx                     // existente: preservar semântica
  FeedbackToast.tsx             // feedback temporário com ação opcional
  EmptyState.tsx                // real-empty / filtered-empty
  AsyncState.tsx                // skeleton / erro / retry / vazio
  StatusPanel.tsx               // sucesso, indisponibilidade, recusa, parcial
  ConfirmDialog.tsx             // modal sm para consequência/destruição
  ModalBase.tsx                 // modal aprovado na tarefa anterior
```

**Recomendação:** evitar criar três implementações de `EmptyState` em páginas diferentes. Migrar progressivamente componentes de página para `ui/`, mantendo textos/contexto específicos em cada tela.

### 8.2 Contratos de estado para UX

```ts
type AsyncView<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message?: string }

type ActionView =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'failed'; message: string }
  | { status: 'unknown'; operationId?: string }
```

*Ilustração de contrato visual; não é migração obrigatória do modelo de domínio.* Distinguir explicitamente estado incerto de falha confirmada, sobretudo em pagamentos/cancelamentos/propostas.

### 8.3 Regras técnicas mínimas

- Durante mutação, bloquear **somente** controles que possam gerar conflito; preservar navegação segura quando possível.
- Erros de campo: `aria-invalid`, texto associado por `aria-describedby` e foco no primeiro campo inválido após envio.
- Feedback dinâmico: `role="status"` para informação/sucesso; `role="alert"` para erro crítico, sem excesso de anúncios repetidos.
- Em modal, usar `aria-labelledby`/`aria-describedby`, foco contido e retorno ao disparador; não descartar dados por Escape ou backdrop sem confirmação.
- Não mostrar feedback de sucesso antes de confirmação da API. Para resultado desconhecido, **consultar**, não reenviar automaticamente.
- Para navegação de conta e estados vazios, nunca deixar o usuário em beco sem saída; oferecer CTA contextual.
- Spinner/skeleton com movimento suave e `prefers-reduced-motion`; texto de feedback sempre visível.
- Verificar widths 320/375/768/1024/1440 px, teclado virtual e botões com alvo de pelo menos 44 px em mobile.
- Persistir filtros e ordenação ao abrir/fechar o novo modal de detalhe de anúncio; preservar parâmetro/deep link quando compartilhado.

### 8.4 Arquivos sugeridos para intervenção

| Arquivo | Alteração |
|---|---|
| `frontend/src/components/layout/SiteHeader.tsx` | Menu da conta: coleção, propostas e histórico (estes últimos após existência das páginas); tratar busca/sino provisórios |
| `frontend/src/router.tsx` | Rotas de propostas e histórico quando houver páginas; integração do detalhe como modal/deep link |
| `frontend/src/pages/HomePage.tsx` | Remover CTA duplicado, revisar destinos e rótulos |
| `frontend/src/components/profile/ProfileView.tsx` | Remover “coleção em breve”; CTA para coleção existente |
| `frontend/src/components/marketplace/MarketplaceAdCard.tsx` | Disparar modal de detalhe sem perder contexto |
| `frontend/src/pages/MarketplaceAdPage.tsx` | Adaptar componente de detalhes para modal e suportar acesso profundo |
| `frontend/src/components/ui/Alert.tsx` | Manter base semântica; harmonizar espaçamento e estrutura compartilhada |
| `frontend/src/components/collection/CollectionState.tsx` | Migrar para padrão de estado vazio/loading/erro |
| `frontend/src/pages/MyAdsPage.tsx` | Reutilizar padrões e textos por contexto |
| `frontend/src/components/myAds/MyAdModal.tsx` | ConfirmDialog e feedback de conflito sem mudar regras |
| `frontend/src/components/ads/DiscardChangesDialog.tsx` | Unificar com modal pequeno aprovado, sem descartar rascunho |
| `frontend/src/pages/CartPage.tsx`, `components/cart/CartSummary.tsx` | Validação contextual, resultado incerto, sem feedback duplicado |
| `frontend/src/pages/DeliveryPage.tsx`, `pages/ReviewPage.tsx` | Unificar feedback e estados de checkout |

---

## 9. Roteiro de QA / critérios de aceite

- [ ] Loading de listagens, detalhes e operações revisados visualmente nas três larguras.
- [ ] Estados vazios **reais** e **por filtro** distinguíveis.
- [ ] Sucesso só após confirmação e com destino útil, sem aviso duplicado.
- [ ] Erro recuperável preserva valores/filtros e oferece retentativa.
- [ ] Resultado incerto de pagamento/cancelamento/proposta não gera reenvio automático.
- [ ] Confirmações com modal pequeno e botões semanticamente corretos.
- [ ] Remoção/cancelamento deixam consequências claras, com histórico preservado quando aplicável.
- [ ] Quantidade insuficiente e anúncio indisponível impedem continuação inválida.
- [ ] Pagamento recusado e parcial mostram status por pedido e permitem recuperação.
- [ ] Proposta inválida indica exatamente a carta/quantidade problemática; sem complemento financeiro.
- [ ] Menu autenticado oferece Minha Coleção, Meus anúncios e demais rotas **quando implementadas**.
- [ ] Texto “Minha Coleção em breve” removido do perfil.
- [ ] CTA duplicado “Criar anúncio” da Home revisado.
- [ ] Controles provisórios deixam de sugerir funcionalidades prontas.
- [ ] Detalhe do anúncio segue modal padronizado e preserva deep link/retorno à listagem.
- [ ] Telas de troca, gerenciamento de propostas e histórico validadas em protótipo e app quando disponíveis.
- [ ] Verificação de acessibilidade básica: navegação por teclado, foco, contraste, leitor de tela e responsividade.

**Resultado:** os critérios não estão integralmente atendidos na aplicação neste momento. Esta entrega **documenta o padrão, os problemas e as correções**; validar e marcar cada item após a implementação.

---

## 10. Ordem sugerida de execução

1. **P0:** corrigir o acesso a Minha Coleção, o placeholder do perfil e o destino de detalhes do anúncio.
2. **P0 design / dependência de implementação:** especificar rota, layout e modelo para Histórico de Transações; não criar menu clicável para rota inexistente.
3. **P1:** padronizar componentes de feedback, confirmar recuperação de erros e estados incertos.
4. **P1:** reduzir redundância de CTAs e revisar affordances provisórias.
5. **P1:** especificar propostas e histórico (vazios, erros, sucesso, filtros e status).
6. **QA:** revisar protótipos e telas desktop/tablet/mobile, inclusive teclado e leitores de tela.

## 11. Limitações e validação final

Esta auditoria **não equivale a um teste visual ao vivo** de todas as jornadas: são confirmadas no código da `main` as rotas e partes dos estados descritos; os fluxos de propostas, histórico e a versão nova do modal de anúncio dependem de protótipos/branches e futuras implementações. Nenhuma alteração foi aplicada ao repositório nesta entrega.

### Referências internas

- `docs/design-system/Component -  Alert - Feedback — Referência V1.md`
- `docs/design-system/Component -  Button — Referência V1.md`
- `docs/design-system/prototyping/prototype-shoppingCart/Handoff-shoppingCart-V1.md`
- `docs/design-system/prototyping/prototype-myAds/Handoff-myAds-V1.md`
- `frontend/src/router.tsx`, `components/layout/SiteHeader.tsx`, `pages/HomePage.tsx`, `components/profile/ProfileView.tsx`
- `frontend/src/pages/{CartPage,DeliveryPage,ReviewPage,MarketplaceAdPage,MyCollectionPage,MyAdsPage}.tsx`
