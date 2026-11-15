# TCGMarket · Relatório de refinamentos de UX

**Referência** — [Issue #96 · Melhorias de experiência](https://github.com/PI3-TCG/TCGMarket/issues/96#issue-5608836934)  
**Versão avaliada** — branch `main`, commit [`756b38d`](https://github.com/PI3-TCG/TCGMarket/commit/756b38dd0467635846a53bbe3adda711b3f9d551), de 14/11/2026.  
**Método** — inspeção das rotas, componentes e serviços que controlam os oito fluxos solicitados. A tentativa de acesso à homologação por HTTP não retornou resposta neste ambiente. Os comportamentos abaixo foram identificados no código. A reprodução no navegador, os estados dependentes de dados e o efeito sobre usuários ficam pendentes de validação em HML.

## Priorização sugerida

| Prioridade | Fluxos | Motivo |
| --- | --- | --- |
| P1 · Próxima implementação | Cadastro e login (UX-01), compra (UX-05) | O cadastro pede informações obrigatórias que não envia. No checkout, uma falha de atualização pode deixar a pessoa tomando decisões sobre um estado desatualizado. |
| P2 · Após P1 | Coleção (UX-03), anúncio (UX-04), troca (UX-06), histórico (UX-07), perfil (UX-08) | Os fluxos existentes exigem reconfiguração, novas buscas ou passos adicionais para concluir uma tarefa ou voltar a ela. |
| P3 · Ajuste pontual | Catálogo (UX-02) | Controles visualmente semelhantes a filtros ocupam espaço mesmo sem oferecer interação. |

## UX-01 · Cadastro e login | P1

- **Fluxo atual** — O cadastro exige nome de usuário, data de nascimento, país e aceite dos termos. O envio inclui apenas nome, e-mail e senha. Após sucesso, abre o login com uma mensagem de confirmação. Quando a validação local do cadastro falha, o código retorna sem mover o foco. O login já foca o primeiro campo inválido.
- **Problema e impacto** — A interface exige esforço para informar dados que o formulário não transmite. A pessoa também pode precisar procurar manualmente o campo com erro, sobretudo quando ele estiver fora da área visível.
- **Proposta** — Conferir quais dados fazem parte do contrato de cadastro. Para campos que a tarefa de cadastro precisa coletar, enviar e validar conforme o contrato. Retirar do formulário os campos que não fazem parte desse fluxo, após confirmar com a equipe o tratamento de aceite e elegibilidade. Reaproveitar no cadastro o padrão de foco do login.
- **Aceite** — Ao tentar cadastrar com o primeiro campo obrigatório inválido, o foco vai para ele e a mensagem associada é anunciada. Os dados exigidos pela interface correspondem ao que o fluxo efetivamente processa. A confirmação de conta criada continua visível no login.
- **Evidência** — [Validação e envio do cadastro](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/RegisterPage.tsx#L85), [validação e foco no login](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/LoginPage.tsx#L91).

## UX-02 · Filtros do catálogo | P3

- **Fluxo atual** — O catálogo oferece busca e filtros funcionais, mantém parâmetros na URL, mostra filtros ativos e permite tentar novamente após falha. Na mesma área aparecem Idioma, Condição, Preço e Disponibilidade marcados como “Em breve”.
- **Problema e impacto** — Esses quatro itens ocupam espaço na área de filtros e sugerem critérios que a pessoa ainda não consegue aplicar no catálogo.
- **Proposta** — Exibir no painel apenas os filtros operacionais. Preservar os filtros ativos e a opção de limpá-los.
- **Aceite** — No desktop e no celular, cada critério listado na área de filtros pode ser aplicado. A busca e os filtros atuais continuam recuperáveis pela URL.
- **Evidência** — [Definição dos filtros futuros](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/CatalogPage.tsx#L41), [exibição no painel](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/CatalogPage.tsx#L286).

## UX-03 · Retorno à coleção | P2

- **Fluxo atual** — A pessoa filtra a coleção, muda de página e abre “Anunciar” em um item. A navegação leva o identificador do item. Os filtros e a página ficam no estado local da tela da coleção, inicializado com os valores padrão.
- **Problema e impacto** — Ao reabrir a coleção pelo fluxo de anúncios, a pessoa precisa localizar novamente o conjunto de cartas que estava gerenciando.
- **Proposta** — Guardar filtros e paginação nos parâmetros da rota e transportar esse contexto no retorno à coleção. Reutilizar o padrão do catálogo. Se uma operação reduzir o número de páginas, voltar para uma página válida.
- **Aceite** — Partir da página 2 de uma coleção filtrada, abrir um anúncio e voltar. Os filtros e a página são restaurados quando a página ainda existe. Entrar diretamente na coleção continua abrindo a visão inicial.
- **Evidência** — [Estado inicial e navegação para anúncio](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/MyCollectionPage.tsx#L55), [ação Anunciar](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/MyCollectionPage.tsx#L200).

## UX-04 · Recuperação de disponibilidade ao anunciar | P2

- **Fluxo atual** — A pessoa escolhe a carta na coleção, informa quantidade, modalidade e preço quando houver venda, e publica. Se a API retornar conflito, o formulário busca a disponibilidade atual e pede revisão. Se essa consulta falhar, aparece uma mensagem genérica de falha de publicação.
- **Problema e impacto** — No conflito, a pessoa precisa interpretar a mudança e corrigir a quantidade. Se a consulta de disponibilidade falhar, a mensagem de publicação induz a repetir o envio sem esclarecer que a quantidade precisa ser conferida.
- **Proposta** — Mostrar, junto à quantidade, o valor informado e o máximo publicável atualizado. Oferecer “Usar quantidade disponível” quando houver cópias. Se a consulta após o conflito falhar, oferecer “Consultar disponibilidade” com os dados preenchidos preservados. Se o máximo for zero, direcionar de volta à coleção.
- **Aceite** — Simular os três resultados após um conflito: quantidade positiva menor que a solicitada, zero cópias e falha na consulta. Cada cenário apresenta a ação correspondente, preservando modalidade, preço e descrição enquanto o formulário estiver aberto.
- **Evidência** — [Tratamento de conflito de publicação](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/ads/CreateAdForm.tsx#L184), [aviso próximo ao formulário](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/ads/CreateAdForm.tsx#L259).

## UX-05 · Estado do pagamento no checkout | P1

- **Fluxo atual** — O resultado do checkout consulta automaticamente pedidos com pagamento pendente ou pago. Falhas nas consultas automáticas mantêm o último estado exibido em silêncio. A ação “Verificar resultado” só aparece quando existe pedido com pagamento pendente.
- **Problema e impacto** — Um pedido já pago aguardando conclusão pode ficar sem atualização visível e sem ação manual de consulta. Em uma compra com vários pedidos, também fica mais difícil saber quais estados estão atualizados.
- **Proposta** — Manter o último estado confirmado por pedido e informar quando a atualização falhar. Exibir “Verificar resultado” para pagamento pendente e para pagamento confirmado com pedido em processamento. Identificar a ação de voltar ao carrinho como recuperação dos pedidos com falha.
- **Aceite** — Simular falha da consulta automática com um pedido pago e ainda em processamento. A tela mantém o estado confirmado, sinaliza a falha e permite nova consulta sem iniciar outro pagamento. Validar também um checkout com resultados mistos.
- **Evidência** — [Consulta automática e tratamento de falha](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/CheckoutResultPage.tsx#L83), [ações do resultado](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/CheckoutResultPage.tsx#L258).

## UX-06 · Revisão e acompanhamento da troca | P2

- **Fluxo atual** — A pessoa monta a proposta, revisa as duas partes, avança com “Continuar” e confirma numa tela que reapresenta a revisão com um aviso adicional. Após enviar, a ação do rodapé retorna ao Marketplace.
- **Problema e impacto** — A revisão e a confirmação repetem informações em dois passos consecutivos. A ação de sucesso leva para a listagem de anúncios, embora a tarefa seguinte possa ser acompanhar a proposta enviada.
- **Proposta** — Juntar o resumo e o aviso de envio em uma etapa final com “Editar proposta” e “Confirmar e enviar”. Preservar o aviso de que o envio não transfere nem reserva cartas e a proteção existente para reenvio. No sucesso, oferecer “Acompanhar proposta” como ação principal e manter “Voltar ao Marketplace” como secundária.
- **Aceite** — Conferir cartas, quantidades e responsável pelo complemento, quando houver, antes de enviar. Voltar à edição preserva os dados. Após enviar, “Acompanhar proposta” leva à proposta enviada ou abre a lista de enviadas com ela destacada.
- **Evidência** — [Ações de revisão, confirmação e sucesso](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/trade/TradeProposalFlow.tsx#L368), [resumo e aviso de envio](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/trade/TradeProposalFlow.tsx#L725).

## UX-07 · Retorno do detalhe ao histórico | P2

- **Fluxo atual** — A lista mantém tipo de transação e página na URL. O link de detalhe leva o ID da transação. “Voltar ao histórico” aponta para a rota do histórico sem os parâmetros anteriores.
- **Problema e impacto** — Quem compara várias transações precisa reaplicar a categoria e avançar novamente até a página que estava consultando.
- **Proposta** — Transportar os parâmetros válidos de tipo e página da lista para o link de detalhe e reutilizá-los no retorno. Para acessos diretos ao detalhe, usar a visão padrão do histórico.
- **Aceite** — Abrir uma transação na segunda página de “Compras” e usar “Voltar ao histórico”. A lista reabre em “Compras”, página 2. Abrir o detalhe por link direto continua oferecendo retorno funcional.
- **Evidência** — [Leitura dos filtros](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/TransactionHistoryPage.tsx#L46), [link para detalhe](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/TransactionHistoryPage.tsx#L292), [link de retorno](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/TransactionDetailPage.tsx#L47).

## UX-08 · Atividades recentes no perfil | P2

- **Fluxo atual** — O perfil privado já mostra a tabela com tipo, status e ação. Ela tem largura mínima de 480 px e rolagem horizontal. Transações abrem o detalhe correspondente, enquanto anúncios e propostas levam às respectivas listagens.
- **Problema e impacto** — Em telas estreitas, a ação pode ficar fora da área visível. Nos casos de anúncio e proposta, há uma busca adicional para reencontrar a atividade selecionada.
- **Proposta** — Preservar a tabela de três colunas no desktop. No celular, apresentar cada linha em um bloco compacto com descrição, data, status e ação. Quando a rota permitir, abrir o registro correspondente. Caso seja necessário usar a listagem, indicar e destacar o item de origem.
- **Aceite** — Em larguras de 360 e 390 px, a atividade e sua ação ficam legíveis sem rolagem horizontal. Em desktop, a tabela mantém as três colunas. No perfil público, conferir como regressão o banner, o “Sobre mim”, a reputação e a visibilidade configurada da coleção.
- **Evidência** — [Largura e colunas da tabela](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/profile/ProfileDashboard.tsx#L257), [ações por tipo de atividade](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/components/profile/ProfileDashboard.tsx#L308), [perfil público](https://github.com/PI3-TCG/TCGMarket/blob/756b38d/frontend/src/pages/PublicProfilePage.tsx).

## Protótipos textuais

Rascunhos de conteúdo e ordem de leitura para os ajustes que mudam a composição da tela. Os valores abaixo são ilustrativos. Reutilizar botões, alertas e cores semânticas do projeto.

| Tela | Ordem de leitura proposta |
| --- | --- |
| Publicação após mudança de disponibilidade | **A disponibilidade mudou** → “Você informou 3 cópias. Agora há 2 disponíveis.” → campo **Quantidade** → **Usar 2 cópias** → **Publicar anúncio**. |
| Checkout pago com atualização interrompida | **Pagamento confirmado** → “Seu pedido está em processamento.” → “Não conseguimos atualizar o pedido agora.” → **Verificar resultado**. |
| Revisão de troca | **Revise sua proposta** → **Você oferece** → **Você receberá** → complemento, se houver → aviso de envio → **Editar proposta** · **Confirmar e enviar**. |
| Atividade recente no celular | **Proposta de troca enviada** → data → **Pendente** → **Ver proposta**. No desktop, os mesmos dados ficam nas três colunas existentes. |

## Validação em homologação

Executar os critérios de aceite com duas contas de teste, uma carta com mais de uma cópia disponível, histórico paginado e dados de compra simulada. Conferir teclado, foco após erro e largura de 360 px. Nos pontos de compra e anúncio, simular as falhas de consulta para verificar a recuperação sem perder o estado do usuário. Registrar por item o cenário reproduzido, o resultado e, quando a disposição visual mudar, uma captura da tela ajustada.
