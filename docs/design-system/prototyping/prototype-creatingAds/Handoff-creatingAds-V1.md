# TCG Market — Handoff de criação de anúncios

**Versão:** 1.0 · **Data:** 18/10/2026  
**Entrega:** especificação de UX/UI para implementação  
**Escopo:** seleção de item da coleção, configuração e publicação de anúncio  
**Status:** protótipos visuais produzidos e decisões consolidadas. Não representa implementação funcional nem validação de integração.

## 1. Objetivo e limites

Permitir que uma pessoa autenticada transforme exemplares de sua coleção em um anúncio de venda, troca ou ambas, respeitando a disponibilidade do item.

Esta entrega cobre as duas entradas da criação, seleção da carta, formulário, validações, carregamento, publicação, falhas, disponibilidade e confirmação de sucesso. **Meus anúncios, edição, cancelamento e estados dos anúncios no gerenciamento são uma próxima entrega.** Os botões que levam a essas áreas representam destinos do fluxo, não telas já implementadas por este trabalho.

Referências consultadas: projeto `TCGMarket-main(4).zip`, Visual Guide V1, Layout Guidelines V2.1, tokens de `frontend/src/index.css`, componentes compartilhados, Minha Coleção, handoff do Marketplace e capturas da página atual enviadas em 18/10/2026. As capturas atuais orientam navbar, distância até o banner e footer, substituindo a composição antiga desses elementos nos primeiros protótipos.

## 2. Decisões visuais consolidadas

- Criar anúncio é uma **página**, não um modal.
- Sem breadcrumb.
- Reutilizar navbar global em duas faixas: marca/busca/conta e navegação por jogos.
- Preservar o banner no tamanho padrão da Minha Coleção, com margens e afastamento da navegação equivalentes à página atual.
- Título: **Criar anúncio**.
- Apoio: **Defina como você deseja negociar esta carta da sua coleção.**
- Reutilizar footer atual: marca, tagline, links horizontais e redes sociais.
- Textos de apoio curtos, objetivos e próximos do elemento correspondente.
- Formulário desktop em duas colunas: carta e disponibilidade à esquerda; configuração à direita.
- Venda usa roxo; troca usa azul. Seleção também identificada por checkbox e texto.
- A versão válida mais recente, com **Alterar carta**, é a referência principal do formulário. Versões anteriores sem esse link continuam úteis para os estados, mas devem receber a ação quando aplicável.

### Tokens e componentes

| Elemento | Referência |
|---|---|
| Primária | `primary-900` — #660366 |
| Apoio roxo | `primary-700` — #996699; `primary-100` — #F0E3F0 |
| Azul de interação | `secondary-500` — #1688F8 |
| Fundo | `neutral-50` — #FAFBFE |
| Superfícies e bordas | Branco; `neutral-200` — #E6E7F0 |
| Sucesso / aviso / erro | #15803D / #D97706 / #B91C1C |
| Títulos e preços | Cinzel |
| Conteúdo funcional | Plus Jakarta Sans |
| Controles | Altura de referência 40 px; raio 8 px |
| Painéis | Raio 12 px; sombra discreta |
| Espaçamento | Escala de 4 px; preferir 16/24/32 px entre grupos |
| Largura externa | Até 1600 px, com margens responsivas |

Reutilizar Button, Input, Checkbox, Alert, Card, Icon e o layout global quando compatíveis. Não reconstruir navbar e footer dentro da página. As imagens são referências de composição: tokens, textos e regras deste documento prevalecem sobre pequenas imprecisões da geração visual. Artes de cartas nos mockups são ilustrativas; usar imagens e metadados reais do catálogo na implementação.

## 3. Duas entradas, um formulário

| Entrada | Comportamento |
|---|---|
| Anunciar no item/detalhes de uma carta da coleção | Abrir a página com o item de posse identificado; carregar seus dados e disponibilidade antes de habilitar a configuração. |
| Criar anúncio no resumo abaixo do banner da coleção | Abrir a seleção de um item da coleção; após escolher, apresentar o mesmo formulário. |

O vínculo é com o **item da coleção**, não somente com a carta de catálogo. Carta, condição e idioma identificam a posse selecionada. Dois itens da mesma carta podem ter idiomas, condições e disponibilidades diferentes.

O servidor deve confirmar autenticação e propriedade mesmo quando a navegação trouxer um identificador. Não aceitar uma carta arbitrária do catálogo como item anunciável. Identificador inexistente ou de outro usuário não deve expor dados de terceiros; tratar com mensagem de acesso/indisponibilidade e retorno à coleção. Esse caso é orientação de implementação, sem mockup específico nesta entrega.

### Sequência funcional

1. Resolver sessão e entrada utilizada.
2. Selecionar item, quando não houver item informado.
3. Carregar posse e disponibilidade atual.
4. Configurar quantidade e modalidades; preencher preço se venda estiver habilitada.
5. Validar e enviar a publicação.
6. Revalidar disponibilidade e propriedade no servidor.
7. Exibir confirmação e dados atualizados; oferecer Ver anúncio e Meus anúncios.

## 4. Seleção de item

Título do painel: **Selecione uma carta da sua coleção**. Apoio: **Escolha o item que deseja anunciar.**

Busca: **Buscar na minha coleção...**. Filtro: **TCG**, com opção **Todos**. Mostrar apenas jogos realmente habilitados para os dados consultados; a presença de cinco jogos nas artes/navegação não comprova integração de todos.

Cada card mostra imagem completa, nome, TCG, edição, condição, idioma, quantidade disponível e **Selecionar**. Não exibir preço, reputação ou vendedor nessa etapa. Cada card representa uma posse; não agrupar idiomas ou condições diferentes.

Itens com zero disponível permanecem identificáveis e têm Selecionar desabilitado, com **Sem disponibilidade** e **Todos os exemplares em anúncios**. Preservar condição e idioma também nesses cards — o mockup inicial os omitiu no último card, mas esses dados são necessários para identificar a posse.

Ao selecionar, carregar novamente a disponibilidade do item antes de habilitar a publicação. A lista pode estar desatualizada. Conservar busca e filtro durante a navegação interna para facilitar o retorno.

A amostra visual contém cinco itens; esse número não é uma regra de tamanho da coleção. **Recomendação de implementação:** paginação de 20 itens, consistente com Minha Coleção, com até cinco colunas no desktop. O tamanho da página desta seleção não foi validado em protótipo específico; confirmar com a equipe antes de tratá-lo como decisão de produto.

### Estados da seleção

| Estado | Texto / ação | Comportamento |
|---|---|---|
| Carregando | Carregando sua coleção... | Skeletons; sem contagem inventada; controles de consulta temporariamente indisponíveis. |
| Busca sem resultados | Nenhuma carta encontrada · Tente outro nome ou limpe a busca. | Preservar termo; Limpar busca. O exemplo usa Lugia e filtro Todos. |
| Coleção vazia | Sua coleção está vazia · Adicione cartas à coleção para anunciar. | Explorar catálogo; não confundir com busca vazia. |
| Nenhum item disponível | Nenhum item disponível · Todos os exemplares estão em anúncios. | Meus anúncios. Aplicar somente quando essa condição da coleção inteira estiver confirmada. |
| Erro ao carregar | Não foi possível carregar sua coleção. · Tente novamente para selecionar uma carta. | Tentar novamente; não afirmar que a coleção possui zero itens. |

Voltar à coleção permanece disponível. Se apenas um filtro não encontrar itens disponíveis, não afirmar que toda a coleção está comprometida. Com filtros ativos, oferecer limpeza dos filtros aplicáveis.

## 5. Formulário

### Coluna esquerda

Painel **Carta selecionada**, com badge **Da sua coleção**, imagem sem corte, nome, TCG, edição/número/raridade quando disponíveis, condição e idioma. Dados de identificação são somente leitura.

Ação **Alterar carta** abaixo dos metadados e antes da disponibilidade. Retorna à seleção de itens da própria coleção.

| Disponibilidade antes da publicação — exemplo | Valor |
|---|---:|
| Na sua coleção | 5 |
| Em outros anúncios | 2 |
| Disponíveis para anunciar | 3 |

Disponibilidade refere-se à posse selecionada, não à soma de todas as versões da carta.

### Coluna direita

| Campo | Comportamento |
|---|---|
| Quantidade | Inteiro positivo; stepper −/+ e digitação. Limite igual à disponibilidade atual. |
| Modalidade | Duas opções independentes, Venda e Troca. Uma ou ambas devem estar habilitadas. |
| Preço por unidade (R$) | Exibido e obrigatório somente com venda habilitada. Formato monetário brasileiro. |
| Resumo | Quantidade, modalidade(s) e preço unitário quando aplicável. Não apresentar como válido um resumo com campos inválidos. |

Apoio da quantidade: **Até 3 exemplares disponíveis.** Adaptar singular/plural e valor. Apoio das modalidades: **Selecione uma ou as duas.**

Venda: **Venda por um preço definido.** Troca: **Receba propostas de troca.** Quando ambas estão habilitadas: **Venda e troca usam a mesma quantidade.**

Ações: **Voltar à coleção** (secundária) e **Publicar anúncio** (primária). “Voltar à coleção” evita confusão com o futuro cancelamento de um anúncio já publicado.

### Modalidades e resumo

| Configuração | Preço | Resumo ilustrativo |
|---|---|---|
| Venda | Visível e obrigatório | 2 exemplares · Somente venda · R$ 45,00 por unidade |
| Troca | Ausente | 2 exemplares · Somente troca · Disponível para troca |
| Venda e troca | Visível e obrigatório | 2 exemplares · Venda e troca · R$ 45,00 por unidade |

As duas modalidades compartilham a mesma reserva: anunciar dois exemplares para venda e troca compromete dois, nunca quatro. Desabilitar venda remove o preço do resumo e da publicação como valor ativo; eventual preservação temporária no formulário não pode gerar preço em anúncio de troca.

Os valores preenchidos nos protótipos são exemplos, não defaults. **Recomendação a validar:** iniciar quantidade em 1 quando houver disponibilidade e modalidades sem seleção; apresentar erro apenas após interação/validação, não ao abrir a página. Preço começa vazio.

### Alterar carta e saída

- Alterar carta retorna ao seletor. Não modificar a posse original.
- Ao escolher outro item, recalcular disponibilidade e redefinir quantidade; não transportar preço da carta anterior sem revisão.
- **Recomendação de implementação:** reiniciar os dados comerciais ao confirmar outro item. Se isso descartar alterações, explicar e pedir confirmação antes de substituir. Esse diálogo específico não recebeu mockup próprio.
- Se voltar do seletor sem escolher outro item, preservar o formulário anterior.
- Ao tentar sair do fluxo com alterações não publicadas, exibir **Sair sem publicar?** / **Os dados preenchidos serão perdidos.**
- **Continuar preenchendo**, X e Escape fecham o diálogo sem perda. **Sair sem publicar** descarta o preenchimento e segue ao destino solicitado.
- Não mostrar confirmação quando não houver alterações nem após publicação concluída. O formulário é página; apenas essa confirmação é modal.

## 6. Validações e disponibilidade

| Regra | Feedback |
|---|---|
| Nenhuma modalidade | Selecione uma modalidade. |
| Venda sem preço | Informe o preço por unidade. |
| Quantidade acima do limite | Máximo de 3 exemplares. |
| Quantidade ausente, zero, negativa ou fracionada | Informe uma quantidade inteira maior que zero. — texto recomendado, sem mockup específico. |
| Preço inválido | Informe um preço válido. — texto recomendado; limites monetários pendentes de definição. |

Preço obrigatório foi confirmado no escopo do usuário. Valor mínimo, máximo, aceitação de zero e precisão monetária precisam de contrato de negócio; **recomenda-se preço positivo e duas casas decimais**, sem apresentar isso como regra previamente aprovada.

Mostrar erros junto aos campos, com texto e ícone, além da cor. O alerta geral pode dizer **Revise os campos destacados.** ou **Revise o campo destacado.** Após tentativa inválida, focar o primeiro problema. Publicação bloqueada enquanto houver inconsistências; evitar que um botão desabilitado seja a única explicação do erro.

Stepper não deve permitir ultrapassar o limite conhecido. A validação de excesso continua necessária para digitação manual, dados antigos ou alteração concorrente.

**Disponíveis = quantidade da posse − quantidades ainda comprometidas em outros anúncios**, conforme a regra de reserva do domínio. Não somar quantidades históricas já consumidas ou liberadas. Transações pendentes e cancelamento precisam ter sua contabilização definida na etapa de gerenciamento.

### Sem quantidade e mudança concorrente

- Sem quantidade: exemplo 5 na coleção, 5 em outros anúncios, 0 disponíveis. Mostrar **Sem quantidade disponível** / **Todos os exemplares estão em outros anúncios.** Oferecer Voltar à coleção e Meus anúncios; publicar indisponível.
- Disponibilidade alterada: exemplo 5 na coleção, 4 em outros anúncios, 1 disponível. Manter quantidade digitada 2 para revisão, atualizar o limite e mostrar **A disponibilidade mudou. Revise a quantidade.** / **Agora há apenas 1 exemplar disponível.**
- Não reduzir silenciosamente a quantidade solicitada.
- Validar e reservar no servidor de forma consistente sob concorrência; validação visual não impede dois envios simultâneos.

## 7. Estados do formulário e publicação

| Estado | Representação / comportamento |
|---|---|
| Loading inicial | Navbar, banner e footer preservados; skeletons da carta, disponibilidade e configuração; Carregando dados do anúncio... Sem valores fictícios. |
| Publicando | Preservar valores; bloquear reenvio e controles do formulário; botão com spinner e Publicando...; Voltar à coleção temporariamente indisponível. |
| Erro ao carregar dados | Não foi possível carregar os dados. · Tente novamente para criar seu anúncio. · Tentar novamente / Voltar à coleção. |
| Erro ao publicar | Alerta Não foi possível publicar. Tente novamente. · Seus dados foram mantidos. Controles voltam a ficar disponíveis e ação Tentar publicar novamente. |
| Sucesso | Anúncio publicado! · Sua carta já está disponível no marketplace. Resumo publicado; Meus anúncios e Ver anúncio. |

Após sucesso, remover o estado de formulário não salvo e impedir publicação duplicada por retorno/reenvio. Usar identificador do anúncio devolvido pelo servidor para Ver anúncio. Não inventar confirmação local se o servidor não confirmou a operação.

**Exemplo de disponibilidade após publicar dois exemplares:** 5 na coleção, **4 em anúncios**, **1 disponível**. O rótulo muda para Em anúncios porque agora inclui o anúncio recém-criado. Esses são os números da versão corrigida de sucesso; desconsiderar a primeira versão com 5/2/3.

Em timeout com resultado incerto, a implementação deve verificar a operação ou usar mecanismo de idempotência antes de repetir a criação. Não duplicar o anúncio ao clicar em Tentar publicar novamente. Contrato de idempotência e recuperação deve ser definido com o backend.

## 8. Orientações para implementação

Nomes de componentes, rotas e endpoints não são contratos estabelecidos por este documento. Integrar à arquitetura React/TypeScript e ao layout existente, sem criar APIs fictícias.

Dados conceituais necessários:

| Contexto | Dados |
|---|---|
| Seleção | Identificador do item de posse; carta; jogo; edição; imagem; condição; idioma; disponibilidade; paginação quando adotada. |
| Formulário | Posse selecionada; quantidade total; quantidade comprometida; quantidade disponível; quantidade solicitada; flags de venda/troca; preço condicional. |
| Publicação | Item da coleção, quantidade, modalidades e preço se aplicável. Identidade do usuário validada pela sessão no servidor. |
| Resposta | Identificador e estado do anúncio confirmado; quantidades atualizadas ou informação suficiente para recarregá-las. |

Conferir tipos e contratos existentes antes de codificar. No projeto inspecionado, o card da coleção já expunha a ação Anunciar, mas sem ligação funcional na página; este handoff não afirma que endpoints de publicação já existam.

Imagem ausente: placeholder local, mantendo nome e metadados; não substituir por outra carta. Falha de imagem não deve inutilizar um item com dados válidos.

### Responsividade e acessibilidade

- Desktop: duas colunas no formulário; grid de seleção com até cinco colunas.
- Tablet/mobile: reduzir colunas; carta e disponibilidade antes da configuração; ações sem corte ou rolagem horizontal.
- Adaptar navbar e footer por seus componentes globais. Não criar versões divergentes.
- Labels associados a campos; erros vinculados ao controle; estados anunciados por região de status/alerta adequada.
- Checkbox das modalidades operável por teclado; não depender só da cor.
- Modal com foco contido, foco inicial em Continuar preenchendo e retorno ao acionador ao fechar; Escape preserva dados.
- Em navegação do navegador/fechamento da aba, a confirmação nativa pode substituir o modal; não prometer personalização do texto nativo.
- Skeletons decorativos não devem poluir a leitura assistiva. Usar indicação de carregamento no contêiner.
- Validar contraste, leitura, foco e tamanhos reais no frontend. Os protótipos são estáticos: não houve teste de teclado, mobile ou integração neste entregável.

