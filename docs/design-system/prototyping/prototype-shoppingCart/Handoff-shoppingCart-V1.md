# Handoff de carrinho e compra

**Versão:** 1.0 · **Data:** 19/10/2026  
**Entrega:** especificação funcional e visual para orientar a próxima Sprint do Marketplace.  
**Base:** decisões e protótipos produzidos nesta conversa. As telas são mockups desktop; não representam código implementado ou testes executados.

## 1. Decisões finais e precedência

| Tema | Decisão para implementação |
| --- | --- |
| Contador da navbar | Conta itens distintos do carrinho, identificados pelo anúncio. Não soma exemplares e não conta apenas os selecionados. |
| Exemplo do contador | Pikachu com 2 exemplares + Eevee com 1 + Sol Ring com 1 = **3 itens na navbar** e **4 exemplares no carrinho**. |
| Frete | Fora desta rodada. Não calcular, cobrar, escolher transportadora ou prometer prazo. Não apresentar “frete grátis”. |
| Pagamento | Somente simulado, sem movimentação financeira real. Integração com APIs fica para etapa futura. |
| Seleção | O usuário escolhe quais anúncios deseja comprar; os demais permanecem no carrinho. |
| Vendedores | Carrinho aceita anúncios de vendedores diferentes. Nomes não aparecem no carrinho; são consultados nos detalhes do anúncio. |
| Composição visual | Cada anúncio e o resumo ficam em cards separados. Roxo predominante com azul em seleção, links e detalhes funcionais. |
| Navegação | Nome e imagem do item abrem a página do anúncio. Controles de seleção, quantidade e remoção não disparam navegação. |
| Ação principal | “Continuar” no carrinho e na entrega; “Simular pagamento” na revisão. |
| Entrega | Selecionar endereço, adicionar ou editar em modal. Um endereço para todos os itens selecionados nesta compra. |

**Precedência:** estas decisões finais substituem interpretações anteriores da conversa e números divergentes nas imagens. Algumas referências antigas mostram badge 4 para três anúncios porque inicialmente somavam exemplares. Implementar **3**, conforme correção expressa da usuária. As novas telas de erro já aplicam esse critério.

Os mockups também apresentam pequenas variações de títulos, ícones, alinhamentos e arte de carta. Reutilizar os componentes reais do Design System e as imagens do catálogo. Não reproduzir essas variações como novos componentes.

## 2. Fluxo principal

1. Abrir um anúncio com venda habilitada.
2. Escolher quantidade e adicionar ao carrinho.
3. Receber confirmação e acessar o carrinho ou continuar comprando.
4. Selecionar os anúncios que serão comprados, ajustar quantidades e revisar o subtotal.
5. Continuar para entrega; selecionar, cadastrar ou editar endereço.
6. Revisar endereço e itens selecionados.
7. Acionar **Simular pagamento**.
8. Acompanhar processamento e resultado de cada pedido.

Voltar entre carrinho, entrega e revisão preserva a seleção e o preenchimento confirmado, revalidando preço e disponibilidade. Não criar uma compra apenas ao visitar uma página.

## 3. Elegibilidade e adição ao carrinho

### 3.1 Regras

- Comprar apenas anúncios ativos com venda habilitada, inclusive venda e troca. Troca exclusiva não oferece compra.
- Não permitir comprar o próprio anúncio.
- Quantidade inteira, positiva e limitada à disponibilidade atual.
- Adicionar o mesmo anúncio novamente acumula quantidade na mesma linha, respeitando o limite. Anúncios diferentes da mesma carta continuam separados, inclusive quando pertencem a vendedores diferentes.
- O carrinho **não reserva** exemplares. Revalidar disponibilidade na adição e antes de iniciar a compra.
- Atualizar o contador somente com mudanças confirmadas. Alterar quantidade ou seleção não altera o número de itens distintos.

### 3.2 Interface do anúncio

Mostrar identificação da carta, condição, idioma, vendedor, preço unitário, disponibilidade, seletor de quantidade e subtotal. Vendedor permanece identificável nesta página, conforme refinamento aprovado.

| Estado | Interface e ação |
| --- | --- |
| Pronto | “Adicionar ao carrinho” e subtotal da quantidade escolhida |
| Limite atingido | Desabilitar incremento; manter limite visível e validar também entrada manual |
| Adicionando | Desabilitar envio repetido; botão “Adicionando...” |
| Sucesso | “N exemplares adicionados ao carrinho.”; “Ver carrinho” e “Continuar comprando” |
| Falha confirmada | “Não foi possível adicionar ao carrinho.” / “Tente novamente. A quantidade escolhida foi mantida.” |
| Sem disponibilidade | Bloquear adição e informar indisponibilidade |

Quando todos os exemplares disponíveis já estiverem no carrinho, apresentar “Neste carrinho: N exemplares” e acesso ao carrinho, evitando adicionar além do limite.

A variante visual de adição mostra o caso de limite atingido. Outras quantidades seguem a mesma estrutura, com incremento habilitado enquanto houver disponibilidade.

## 4. Carrinho

### 4.1 Estrutura

Página própria com navbar dupla, banner e footer padrão, sem breadcrumb. Coluna de itens com aproximadamente dois terços da área útil; resumo à direita. Cards brancos independentes com espaçamento visível, bordas arredondadas e sombras suaves.

Cada item contém checkbox, imagem e nome clicáveis, edição/TCG, condição, idioma, preço unitário, quantidade, subtotal e ação **Remover**. Não agrupar visualmente por vendedor nem exibir nomes de vendedores nesta página.

Usar barra **Selecionar todos** com estados marcado, desmarcado e indeterminado. Selecionar todos atua sobre anúncios elegíveis; indisponíveis não podem ser selecionados. Na primeira entrada, a proposta é selecionar os itens elegíveis; depois, preservar as escolhas explícitas do usuário. Essa é uma convenção operacional recomendada para implementação.

### 4.2 Valores e contador

- Subtotal do item = quantidade × preço unitário.
- Subtotal selecionado = soma somente dos itens selecionados.
- Anúncios selecionados = número de linhas selecionadas.
- Exemplares selecionados = soma das quantidades dessas linhas.
- Badge da navbar = número de anúncios distintos ainda presentes no carrinho, incluindo os não selecionados.
- Item indisponível que continua listado ainda integra o contador até sua remoção.
- Carrinho vazio: ocultar badge. Durante carregamento inicial desconhecido, não inventar zero nem uma contagem.

| Situação de exemplo | Badge navbar | Exemplares no carrinho | Subtotal selecionado |
| --- | ---: | ---: | ---: |
| Pikachu 2, Eevee 1, Sol Ring 1; Pikachu e Sol Ring selecionados | 3 | 4 | R$ 115,00 |
| Pikachu reduzido para 1, mesma seleção | 3 | 3 | R$ 70,00 |
| Eevee removido; Pikachu 2 e Sol Ring 1 | 2 | 3 | R$ 115,00 |
| Nenhum selecionado, três anúncios mantidos | 3 | 4 | R$ 0,00 |
| Compra de Pikachu e Sol Ring aprovada; Eevee permanece | 1 | 1 | Depende da seleção remanescente |
| Apenas Pikachu aprovado; Sol Ring recusado e Eevee permanecem | 2 | 2 | Depende da seleção remanescente |

Nunca usar números de seleção no badge. Contagem total, contagem selecionada e quantidade de exemplares são conceitos distintos.

### 4.3 Quantidade e remoção

Atualizar subtotal e resumo após confirmação da alteração. Durante a requisição, bloquear ações concorrentes no item e impedir avançar com dados em transição. Em otimização visual antecipada, reverter para o último estado confirmado caso a operação falhe.

**Erro de quantidade:** “Não foi possível atualizar a quantidade.” / “Mantivemos 2 exemplares.” A referência mostra tentativa de reduzir de 2 para 1; conservar 2, subtotal do item R$ 90,00 e subtotal selecionado R$ 115,00. A ação de tentar novamente conserva a intenção de usar 1, sem exibi-la como persistida.

**Remoção:** retirar somente a linha do carrinho, nunca excluir o anúncio no marketplace. Mostrar “Eevee removido do carrinho.” e **Desfazer**. Desfazer tenta restaurar o item e sua seleção anterior, revalidando preço e disponibilidade; se não for possível, informar o motivo. Não prometer reserva de estoque.

**Erro de remoção:** manter a linha, quantidade e seleção; mostrar “Não foi possível remover o item.” / “Eevee continua no carrinho.” e **Tentar remover novamente**. Não mostrar sucesso nem Desfazer quando a remoção falhou.

Esses erros visuais pressupõem falha confirmada. Se a resposta se perder e o resultado for desconhecido, consultar o estado atual antes de reenviar ou afirmar que nada mudou.

### 4.4 Estados do carrinho

| Estado | Comportamento |
| --- | --- |
| Loading | Skeleton dos cards e do resumo; Continuar desabilitado; não mostrar valores fictícios |
| Vazio | “Seu carrinho está vazio”; “Explorar anúncios”; sem resumo financeiro ou checkout |
| Erro ao carregar | “Não foi possível carregar seu carrinho”; “Tentar novamente”; não confundir com vazio |
| Nenhuma seleção | Itens continuam editáveis; subtotal selecionado zero; orientar seleção; Continuar desabilitado |
| Item indisponível | Desmarcar, bloquear seleção e quantidade, informar motivo; permitir remover e comprar os outros itens válidos |
| Disponibilidade reduzida | Preservar quantidade solicitada, informar quantidade atual e oferecer ajuste explícito ou desmarcação |
| Quantidade insuficiente | Erro junto ao campo; impedir envio inválido e continuidade enquanto item problemático estiver selecionado |
| Preço alterado | Exibir preço anterior e atual, recalcular valor proposto e pedir aceite ou desmarcação |
| Atualização concluída | Resumo sincronizado; feedback breve “Quantidade atualizada.” |

Quando quantidade solicitada estiver inválida, valores podem aparecer como **Subtotal a revisar**, nunca como compra confirmada. A tela de referência mostra 3 Pikachu × R$ 45,00 + 1 Sol Ring × R$ 25,00 = R$ 160,00 solicitados; só existem 2 Pikachu disponíveis.

Na redução de disponibilidade de 2 para 1, não ajustar silenciosamente: oferecer **Ajustar para 1**. Na alteração de preço de R$ 45,00 para R$ 50,00, com 2 Pikachu e 1 Sol Ring, o novo subtotal proposto é R$ 125,00. Exigir **Aceitar novo preço** antes de continuar com esse item selecionado.

## 5. Entrega e endereços

Página com cards de endereços e seleção única. Card selecionado tem radio e destaque azul. Endereço principal pode ser sugerido inicialmente, mas o usuário pode escolher outro. **Principal** é preferência de cadastro; **selecionado** é o endereço desta compra.

Ações: **Adicionar endereço**, **Editar**, **Continuar** e **Voltar ao carrinho**. Apenas os itens selecionados aparecem no resumo. Continuar exige endereço válido selecionado e dados da compra válidos.

Cadastrar e editar usam o mesmo modal, com título e botão correspondentes. Ao salvar com sucesso, fechar o modal, atualizar a lista e selecionar o endereço salvo. Cancelar sem alterações fecha sem gravar; com alterações, recomendar proteção de descarte antes de abandonar o rascunho. Esta proteção é especificação de comportamento, sem mockup dedicado nesta entrega.

| Campo | Regra |
| --- | --- |
| Nome do destinatário | Obrigatório |
| Identificação | Opcional; exemplo Casa ou Trabalho |
| CEP | Obrigatório; oito dígitos, máscara 00000-000 |
| Rua / Avenida | Obrigatório |
| Número | Obrigatório, exceto com “Sem número” marcado |
| Sem número | Desabilita a entrada de número; persistir a condição de forma explícita |
| Complemento | Opcional |
| Bairro | Obrigatório |
| Cidade | Obrigatório |
| UF | Obrigatória; seleção entre UFs válidas |
| Definir como principal | Opcional; manter somente um principal conforme o domínio |

Não pressupor API de CEP implementada: entrada manual permanece suficiente. Validação de formato do CEP não comprova existência ou entregabilidade. Dados dos protótipos são ilustrativos.

| Estado | Feedback e ação |
| --- | --- |
| Sem endereço | “Você ainda não tem endereço cadastrado”; Adicionar endereço; Continuar desabilitado |
| Validação | Mensagens junto aos campos, como “Informe o nome do destinatário.” e “Informe um CEP com 8 dígitos.” |
| Salvando | “Salvando...” com spinner; bloquear campos e envio repetido |
| Erro | “Não foi possível salvar o endereço.” / “Tente novamente. Seus dados foram mantidos.” |
| Sucesso | “Endereço salvo e selecionado.”; retornar à entrega |

Preservar rascunho no erro. Não marcar campos válidos em vermelho por uma falha de servidor. Falha ao carregar endereços usa padrão de erro e nova tentativa; nunca deve ser interpretada como ausência de endereços cadastrados.

## 6. Revisão e pagamento simulado

A revisão reúne endereço selecionado, itens selecionados e resumo financeiro. Permitir voltar à entrega e ao carrinho antes de iniciar a simulação.

**Frete fora de escopo, decisão confirmada:** não incluir linha “Frete R$ 0,00”, opção de transportadora ou prazo. Mostrar **Frete não incluído nesta simulação.** Nesta rodada, total simulado equivale ao subtotal dos itens; não inventar taxas ou descontos.

Usar os textos:

- “Pagamento simulado. Nenhum valor será cobrado.”
- Botão **Simular pagamento**.
- Durante processamento: **Processando pagamento simulado...**
- Na confirmação: **Compra simulada concluída!** / **Nenhuma cobrança foi realizada.**

Não solicitar dados reais de cartão. A proposta inicial de seletor de aprovação/recusa não foi incorporada à tela final: resultados de teste devem ser acionados por configuração interna do simulador, sem poluir a experiência do comprador. Isso não implica API ou ferramenta de teste já implementada.

Antes de iniciar, servidor revalida seleção, propriedade, elegibilidade, quantidades, disponibilidade e preços aceitos. Se houver conflito, retornar à revisão/carrinho com indicação do item afetado, sem iniciar uma compra com valores diferentes dos revisados.

## 7. Vários vendedores e resultados por pedido

Preservar a associação entre anúncio e vendedor mesmo que o nome não apareça no carrinho. A proposta de implementação é agrupar itens selecionados por vendedor para gerar pedidos/transações separados. Uma única ação do comprador pode acompanhar múltiplos resultados.

Os IDs #SIM-001 e #SIM-002 são exemplos ilustrativos. A confirmação identifica pedidos e seus itens. O vínculo histórico com vendedor, carta, preço, condição, idioma e endereço não pode depender de dados que serão editados posteriormente.

| Resultado | Interface | Ação |
| --- | --- | --- |
| Processando | Spinner, valor da tentativa, sem conclusão antecipada | Aguardar; bloquear reenvio |
| Aprovado | Pedido aprovado, itens e total aprovado na simulação | Continuar comprando / Voltar ao carrinho |
| Recusado | “Pagamento simulado recusado”; itens mantidos | Tentar novamente, revalidando dados |
| Resultado parcial | Cada pedido com seu status e valor; separar aprovado e recusado | Repetir somente o recusado |
| Resultado desconhecido | “Não foi possível confirmar o resultado” | Verificar resultado, sem criar nova compra |

No resultado parcial de referência, Pikachu é aprovado por R$ 90,00 e Sol Ring recusado por R$ 25,00. A soma da tentativa é R$ 115,00. Não repetir o pedido aprovado.

Remover do carrinho somente itens cuja compra foi confirmada na simulação. Manter os recusados e os não selecionados. A sincronização deve tratar cada pedido uma única vez, sem duplicar baixa ou restaurar unidades já consumidas. A aprovação simulada não comprova entrega nem deve prometer envio real.

**Separação de estados:** aprovado/recusado/processando são resultados do pagamento/pedido; não são novos status de anúncio. A integração com ATIVO, PENDENTE, FINALIZADO e CANCELADO deve seguir o domínio. Não finalizar um anúncio inteiro automaticamente se ainda houver quantidade restante. Reserva durante pagamento, expiração, falha e compra parcial precisam de contrato técnico consistente antes da implementação das transações.

## 8. Design System e acessibilidade

- Reutilizar navbar dupla, banner e footer existentes, com dimensões e distâncias aprovadas. Sem breadcrumb.
- Usar tokens do DS: roxo principal #660366 e apoio #996699, azul funcional, neutros claros e cores semânticas. A cor renderizada nas imagens não cria um token novo.
- Cinzel para títulos e preços; Plus Jakarta Sans para campos, ações e textos.
- Cards separados, seleção por checkbox/radio com ícone e estado visual, foco visível e controles com nomes acessíveis.
- Identificar erros por texto e ícone, não apenas cor; vincular mensagens aos campos e anunciar feedbacks acessivelmente.
- Modal com foco contido, fundo não interativo e retorno de foco ao disparador. Fechamento não pode descartar rascunho silenciosamente.
- Não transformar o card inteiro em link se isso interferir nos controles internos. Nome e imagem são os alvos de navegação.
- Sem pedido por arrastar ou interação exclusiva de mouse. Stepper também aceita teclado; seleção e remoção precisam funcionar por teclado.
- Em telas estreitas, empilhar resumo e itens, mantendo ações e mensagens acessíveis. Mockups desta entrega são desktop; mobile requer verificação própria.

**Normalização visual:** manter o layout do carrinho refinado como referência principal. Algumas variantes posteriores envolveram cards em um painel ou mudaram ícones/banners; implementar o componente canônico, alterando apenas dados e estados. A versão inicial agrupada por vendedor foi substituída. A imagem inicial de remoção conservou título Entrega por engano; a correção traz Meu carrinho, mas perdeu o toast. Combinar o layout corrigido com o feedback de remoção especificado aqui.

## 9. Orientações técnicas para integração

Estas são exigências de comportamento, não afirmações sobre endpoints existentes.

1. Autenticar e isolar carrinho, endereços e pedidos por usuário.
2. Usar identidade do anúncio na linha do carrinho; evitar deduplicação apenas pelo nome da carta.
3. Servidor é autoridade de preço, elegibilidade e disponibilidade. Não confiar em subtotal enviado pelo cliente.
4. Usar valores monetários exatos, por exemplo centavos inteiros ou decimal do domínio.
5. Salvar seleção para continuidade do fluxo; checkout envia somente anúncios escolhidos e endereço selecionado.
6. Atualizações de quantidade trabalham com versão/controle de concorrência ou mecanismo equivalente; rejeitar quantidade impossível.
7. Usar idempotência nas ações de criar tentativa, processar resultado e consumir quantidade. Requisição repetida não pode duplicar pedido.
8. Em timeout, distinguir “falhou” de “resultado desconhecido”; reconciliar antes de reenviar.
9. Guardar no pedido os dados históricos necessários, inclusive endereço confirmado, evitando que edição futura altere uma compra anterior.
10. Manter ambiente e resposta identificados como simulação, sem credenciais ou cobrança real.

Persistência do carrinho, contratos de API, autenticação após expiração de sessão, política de reserva no checkout e expiração de tentativa são decisões técnicas a alinhar com o backend. Não estão validadas por estas imagens. Frete e integração real de pagamento ficam explicitamente fora da Sprint coberta por este handoff.

