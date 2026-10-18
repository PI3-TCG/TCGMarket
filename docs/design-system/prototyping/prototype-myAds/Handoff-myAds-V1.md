# Handoff de gerenciamento de anúncios

**Versão:** 1.0 · **Data:** 18/10/2026  
**Escopo:** página Meus anúncios e modal de detalhes, edição e cancelamento.  
**Base:** decisões e mockups desenvolvidos nesta conversa. Documento de especificação para implementação; não representa funcionalidade já implementada ou testada.

## 1. Objetivo e limites

Permitir que o usuário consulte seus anúncios, filtre a listagem, visualize detalhes e gerencie anúncios ativos. A entrada acontece pelo perfil do usuário, em **Meus anúncios**.

A criação de anúncios continua em uma página própria, documentada separadamente. Detalhes, edição e cancelamento são estados de **um único modal** sobre a listagem. Não empilhar modais.

O cancelamento retira o anúncio do marketplace e preserva o histórico. Não existe exclusão definitiva neste fluxo.

## 2. Decisões consolidadas

| Assunto | Especificação |
| --- | --- |
| Estrutura | Navbar dupla, banner e footer nos padrões existentes do projeto, inclusive dimensões e espaçamentos |
| Breadcrumb | Não utilizar |
| Filtros | Coluna esquerda: tipo de anúncio, TCG, nome da carta e status |
| Resultados | Coluna direita ocupando mais de dois terços da área útil |
| Grade | Até cinco cards por linha em desktop; vinte anúncios por página |
| Mockup | Não precisa representar os vinte cards; cinco são suficientes como referência visual |
| Status | ATIVO, PENDENTE, FINALIZADO e CANCELADO |
| Pendente | Significa aguardando pagamento |
| Permissões | Somente ATIVO permite editar ou cancelar |
| Edição | Apenas modalidade e preço; carta, idioma, condição e quantidade são somente leitura |
| Modalidade | Venda, troca ou ambas; pelo menos uma deve permanecer habilitada |
| Preço | Obrigatório quando venda estiver habilitada |
| Cancelamento | Confirmação explícita; libera exemplares restantes e mantém o registro |

## 3. Página Meus anúncios

### 3.1 Estrutura e navegação

1. Acessar o perfil e selecionar **Meus anúncios**.
2. Carregar apenas anúncios pertencentes ao usuário autenticado.
3. Exibir banner com título **Meus anúncios** e apoio curto: “Acompanhe e gerencie seus anúncios.”
4. Abaixo do banner, alinhar o início dos filtros ao início da área de resultados.
5. Exibir contagem de resultados, ordenação conforme o padrão existente e paginação.

Reutilizar as rotas e componentes de navegação existentes. Este documento não define um endereço de rota ou endpoint já implementado.

### 3.2 Filtros

| Filtro | Comportamento |
| --- | --- |
| Nome da carta | Busca nos anúncios do próprio usuário |
| Tipo de anúncio | Todos, venda, troca e venda e troca |
| TCG | Todos ou um jogo disponível no catálogo do projeto |
| Status | Todos, ativo, pendente, finalizado e cancelado |
| Aplicar filtros | Executa a consulta com os valores preenchidos |
| Limpar filtros | Remove filtros e busca, retornando à primeira página |

**Convenção recomendada para implementação:** “Venda” inclui venda exclusiva e anúncios combinados; “Troca” inclui troca exclusiva e combinados; “Venda e troca” exige ambas. Essa semântica deve ser a mesma no frontend e no backend.

Ao aplicar filtros, voltar à página 1. Preservar filtros e paginação ao abrir e fechar o modal. Após uma mutação, atualizar a listagem com esses critérios; se o anúncio deixar de atender ao filtro, ele sai dos resultados. Se a página ficar vazia após essa atualização, ajustar para a última página válida.

A quantidade de jogos na navbar visual não determina os jogos disponíveis para filtro: usar os jogos efetivamente suportados pelo catálogo, sem incluir integrações ainda indisponíveis.

### 3.3 Card de anúncio

Apresentar imagem e nome da carta, TCG/edição, condição, idioma, modalidade, preço por unidade quando houver venda, quantidade restante e badge de status.

Para troca exclusiva, utilizar **Somente troca** no lugar do preço. Em anúncios combinados, apresentar as duas modalidades e um único preço por unidade.

**Detalhes** está disponível em todos os status. Os controles de editar/cancelar, quando expostos no card, devem seguir a mesma matriz de permissões do modal. Não mostrar “Excluir”. Para status não ativos, apresentar apenas ações de consulta.

### 3.4 Estados da listagem

| Estado | Apresentação | Ação |
| --- | --- | --- |
| Carregando | Skeleton na área dos cards, preservando a estrutura da página | Aguardar; evitar cliques repetidos |
| Carregado | Grade com resultados reais e paginação | Filtrar, paginar ou abrir detalhes |
| Erro ao carregar | “Não foi possível carregar seus anúncios.” | “Tentar novamente”, mantendo filtros |
| Sem anúncios | “Você ainda não tem anúncios.” | Orientar para a coleção, onde começa a criação |
| Sem resultados | “Nenhum anúncio encontrado.” / “Altere a busca ou os filtros.” | “Limpar filtros” |

Não confundir ausência de anúncios com ausência de resultados filtrados. Erros não devem ser apresentados como uma lista vazia.

## 4. Status e permissões

| Status | Significado na interface | Detalhes | Editar | Cancelar |
| --- | --- | --- | --- | --- |
| ATIVO | Anúncio ativo | Sim | Sim | Sim |
| PENDENTE | Aguardando pagamento | Sim | Não | Não |
| FINALIZADO | Anúncio encerrado por conclusão | Sim | Não | Não |
| CANCELADO | Anúncio cancelado, com histórico preservado | Sim | Não | Não |

Combinar rótulo e ícone com a cor semântica: ativo em verde, pendente em âmbar, finalizado em azul e cancelado em neutro. A cor não pode ser a única forma de identificar o estado.

**Quantidade não é status.** O mockup de finalizado mostra zero exemplares restantes, mas o frontend não deve deduzir nem gravar um status a partir dessa quantidade. O domínio retorna o estado oficial. Não criar um quinto status “Sem quantidade”.

As transições de pagamento, conclusão de troca, pagamento expirado ou falha no pagamento pertencem aos fluxos de transação. Este handoff não define retorno automático de PENDENTE para ATIVO nem prazo de expiração.

## 5. Modal de detalhes

### 5.1 Conteúdo

- Cabeçalho **Detalhes do anúncio**, badge de status e controle de fechar.
- Imagem da carta, nome, TCG, edição, número/raridade quando disponíveis.
- Condição, idioma e quantidade com identificação clara.
- Modalidade e preço por unidade, quando aplicável.
- Área de feedback e ações conforme o status.

Usar o registro de posse associado ao anúncio para condição e idioma. Diferentes exemplares da mesma carta podem ter características distintas. Não permitir trocar esse vínculo durante a edição.

### 5.2 Rodapé e avisos

| Estado | Aviso | Ações |
| --- | --- | --- |
| Ativo | Resumo de quantidade e modalidade | Cancelar anúncio, Fechar e Editar |
| Pendente | “Aguardando pagamento. Este anúncio não pode ser editado ou cancelado.” | Fechar |
| Finalizado | “Anúncio finalizado. Histórico preservado.” | Fechar |
| Cancelado | “Anúncio cancelado. Histórico preservado.” | Fechar |

No cancelado, quando houver registro dessa informação, mostrar **Liberados no cancelamento: N exemplares**. Isso representa o evento histórico; não representa disponibilidade atual da coleção, pois esses exemplares podem ter sido comprometidos novamente.

Valores e modalidades de anúncios encerrados permanecem consultáveis como histórico. Não oferecer reativação ou duplicação neste escopo.

## 6. Edição no mesmo modal

Ao selecionar **Editar**, mudar o título para **Editar anúncio**, manter os dados de identificação e habilitar apenas modalidade e preço. Carregar os valores atuais como estado inicial do formulário.

### 6.1 Campos e validações

| Campo | Regra | Feedback |
| --- | --- | --- |
| Venda/Troca | Pelo menos uma modalidade selecionada | “Selecione uma modalidade.” |
| Preço por unidade | Obrigatório com venda habilitada | “Informe o preço por unidade.” |
| Valor monetário | Validar formato e restrições do domínio | “Informe um preço válido.” |
| Carta, condição, idioma e quantidade | Somente leitura | Não enviar como campos editáveis |

Exibir preço apenas quando venda estiver habilitada. Ao desligar venda, o preço deixa de ser obrigatório e não deve continuar aparecendo no anúncio de troca. O contrato deve representar essa ausência de forma consistente, preferencialmente com valor nulo. Pode-se preservar o rascunho local do preço durante a sessão de edição para restaurá-lo caso venda seja habilitada novamente.

Recomendação técnica: exibir moeda no padrão brasileiro e transportar valor decimal exato ou centavos inteiros, conforme o contrato do projeto. Evitar cálculos monetários com ponto flutuante binário. Limites mínimo/máximo e número de casas devem seguir a regra de preço do domínio; os mockups não estabelecem esses limites.

Mostrar validação junto ao grupo/campo, após interação ou tentativa de envio. Manter **Salvar alterações** desabilitado quando o formulário for inválido ou estiver salvando. Recomenda-se desabilitar também quando não houver alterações.

### 6.2 Ações e processamento

- **Cancelar edição:** retorna aos detalhes se não houver mudanças; com alterações não salvas, abre o estado de confirmação de descarte no mesmo modal.
- **Salvar alterações:** valida e envia somente os campos permitidos.
- Durante a requisição, desabilitar campos, fechamento e ações concorrentes; botão com spinner e texto **Salvando...**.
- No sucesso, retornar aos detalhes com dados confirmados pelo servidor e mensagem **Alterações salvas!**; atualizar o card correspondente.
- No erro, manter o formulário e os dados digitados, reabilitar ações e permitir nova tentativa.

**Erro de gravação:** “Não foi possível salvar.” / “Tente novamente. Seus dados foram mantidos.” Botões: **Cancelar edição** e **Tentar novamente**. Um erro de servidor não torna todos os campos inválidos.

### 6.3 Descartar alterações

Título: **Descartar alterações?**  
Mensagem: **As alterações não salvas serão perdidas.**  
Apoio: **O anúncio continuará como está.**  
Ações: **Descartar alterações** e **Continuar editando**.

Descartar retorna aos detalhes com os últimos dados persistidos. Continuar editando restaura o rascunho. Fechar pelo X ou Escape durante uma edição modificada deve seguir a mesma proteção. Descartar edição nunca cancela o anúncio.

## 7. Cancelamento

Disponível exclusivamente para anúncio ativo. Ao selecionar **Cancelar anúncio**, substituir o conteúdo do modal pela confirmação, mantendo a identificação do anúncio.

### 7.1 Confirmação

**Título:** Cancelar anúncio?

**Mensagem:**

> O anúncio sairá do marketplace.  
> Os N exemplares restantes serão liberados para novos anúncios.  
> O histórico será mantido.

**Ações:** Voltar e Confirmar cancelamento. A confirmação usa estilo danger; voltar não altera o anúncio.

### 7.2 Estados da operação

| Estado | Feedback | Comportamento |
| --- | --- | --- |
| Processando | Spinner e “Cancelando...” | Desabilitar voltar, fechar e confirmação; não antecipar sucesso |
| Sucesso | “Anúncio cancelado.” / “N exemplares liberados para novos anúncios.” / “Histórico preservado.” | Badge Cancelado, apenas Fechar; atualizar listagem e disponibilidade |
| Erro confirmado sem alteração | “Não foi possível cancelar.” / “Tente novamente. O anúncio continua ativo.” | Voltar e Tentar novamente; não liberar exemplares |
| Resposta incerta por timeout | “Não foi possível confirmar o cancelamento. Atualize para verificar.” | Consultar estado atual antes de afirmar que continua ativo ou reenviar |

O último caso é uma orientação de implementação para falhas de rede; não é uma tela adicional aprovada. O mockup de erro pressupõe que a operação não ocorreu e o anúncio continua ativo.

Liberar apenas a quantidade ainda comprometida por esse anúncio. Cancelamento não aumenta a quantidade total pertencente ao usuário. Não liberar exemplares vendidos, transferidos ou vinculados a outro anúncio. A alteração de status e a liberação devem ocorrer de forma consistente e uma única vez, inclusive diante de reenvio da requisição.

## 8. Mudança de status durante a interação

O anúncio pode deixar de estar ativo entre a abertura do modal e a confirmação de uma ação. Revalidar proprietário, status e versão atual no servidor ao salvar ou cancelar.

Quando o servidor informar que está pendente:

- Atualizar badge para **Pendente** e mostrar os dados persistidos em modo de consulta.
- Exibir **O status do anúncio mudou.**
- Durante edição: **Agora está aguardando pagamento. As alterações não foram salvas.**
- Mostrar **Edição e cancelamento indisponíveis.**
- Remover ações de edição e cancelamento; manter **Fechar**.

No cancelamento, adaptar a mensagem para **O anúncio está aguardando pagamento e não pode ser cancelado.** Não afirmar que foi cancelado ou que exemplares foram liberados.

Aplicar o mesmo bloqueio se o novo estado for FINALIZADO ou CANCELADO, com texto correspondente ao estado real. Não reutilizar uma mensagem de pagamento para esses status.

## 9. Design System e acessibilidade

Reutilizar componentes e tokens existentes, sem extrair novas cores dos pixels das imagens geradas. Os mockups orientam composição; o Design System é a referência de implementação.

| Elemento | Diretriz |
| --- | --- |
| Cor principal | P1 #660366; apoio P2 #996699 e demais tokens existentes |
| Tipografia | Cinzel em títulos e preços; Plus Jakarta Sans em textos, campos e botões |
| Componentes | Buttons, inputs, selects, badges, cards, alertas e modal do projeto |
| Geometria | Tokens existentes de espaçamento, radius e sombras; referência de cards/modal com cantos arredondados e controles consistentes |
| Semântica | Tokens success, warning, error e info do DS |
| Estrutura global | Navbar dupla, banner e footer com tamanhos e distâncias já aprovados |
| Textos | Curtos, diretos e em português; usar “Cancelar anúncio” |

Requisitos de implementação:

- Modal com nome acessível, foco contido e fundo não interativo; devolver foco ao disparador ao fechar.
- Navegação por teclado, foco visível e nomes acessíveis nos botões de ícone.
- Anunciar erros, sucesso e processamento por região de feedback acessível; marcar operação pendente com estado ocupado.
- Vincular mensagens de validação aos respectivos campos; foco no primeiro erro quando houver tentativa inválida.
- Preservar os textos das ações durante loading, acompanhados de spinner.
- Usar imagens reais do catálogo e ícones oficiais do projeto; a arte de carta nos mockups é ilustrativa.

**Adaptação responsiva recomendada:** reduzir colunas conforme o espaço, manter vinte itens por página e impedir rolagem horizontal. Em telas estreitas, levar filtros para uma área recolhível e permitir rolagem interna do modal, com ações acessíveis. As imagens desta entrega representam desktop; não constituem uma aprovação visual de telas mobile.

## 10. Dados e integração

O backend deve fornecer identificação estável do anúncio, vínculo com o item da coleção, dados da carta, condição, idioma, modalidade, preço quando houver venda, status e quantidade restante. Para preservar dados históricos, retornar quantidade liberada no cancelamento quando registrada. Uma versão ou mecanismo equivalente ajuda a detectar gravações concorrentes.

Responsabilidades obrigatórias:

1. Autenticar e verificar propriedade em listagem, consulta e mutações.
2. Rejeitar edição/cancelamento para qualquer status diferente de ATIVO, mesmo se a UI estiver desatualizada.
3. Validar modalidade e preço no servidor, sem depender apenas do formulário.
4. Impedir alteração de carta, condição, idioma e quantidade por payload manipulado.
5. Retornar dados atuais após mutação e conflito para sincronizar modal e listagem.
6. Preservar histórico; não mapear a ação de cancelar para exclusão definitiva do registro.
7. Manter consistência entre quantidade comprometida e disponível na coleção.
8. Evitar duplicidade de operação por clique repetido ou retry.

Este handoff não inventa endpoints, nomes de propriedades ou códigos de erro existentes. O contrato técnico deve mapear claramente erro de validação, conflito de status/versão, falta de autorização, registro indisponível e falha temporária.

