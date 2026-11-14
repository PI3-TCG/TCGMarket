# Relatório da issue #93 — Estados de feedback

Revisão de 13/11/2026 sobre o checkout local com HEAD em `54beec8` e as alterações da issue #190 em andamento. A issue #93 está aberta e não tinha comentários na consulta à API do GitHub. Foram examinados os oito fluxos prioritários e o guia de feedback do projeto. A revisão foi estática e não incluiu mudanças na aplicação.

## Resultados por fluxo

| Fluxo | O que já existe | O que revisar na implementação |
| --- | --- | --- |
| Autenticação | Login e cadastro tratam falhas. O login pode exibir a mensagem devolvida pela API. | Padronizar sessão expirada, credenciais inválidas e indisponibilidade. Preservar campos úteis e associar erros aos inputs. |
| Catálogo | A página usa feedback de erro e o detalhe tem estado de carregamento. | Distinguir catálogo vazio de busca sem resultados. Conferir ação de limpar filtros e tratamento de erro ao adicionar carta. |
| Coleção | Há feedback no resumo e nos filtros, além de confirmação e sucesso nas operações de posse. | Reaproveitar os modais existentes. Conferir falha ao editar ou remover, repetição de clique e atualização da lista após sucesso. |
| Marketplace | Listagem e detalhe possuem estados de carregamento. A criação tem validação, e Meus anúncios usa feedback dentro dos modais. | Consolidar os padrões de vazio, erro recuperável, anúncio indisponível e confirmação de cancelamento. |
| Carrinho e compra | Carrinho oferece desfazer remoção e mensagem quando uma alteração não pôde ser confirmada. Entrega, revisão e resultado têm estados próprios. | Testar recusa, processamento e perda de resposta após confirmar. Consultar o resultado antes de oferecer nova tentativa de envio. |
| Trocas | Envio mostra progresso e confirmação de sucesso. O modal de detalhes informa processamento. | Conferir erros nas decisões, proposta já decidida, carta indisponível e resposta incerta sem reenviar automaticamente. |
| Histórico | A lista distingue carregamento, falha e ausência de transações. O detalhe possui seu próprio carregamento. | Padronizar erros recuperáveis e estados vazios com e sem filtro. Conferir acesso direto a transação inexistente. |
| Avaliações | O perfil já tem os componentes de reputação e avaliações com estados de carregamento, indisponibilidade e ausência de avaliações. | Manter a preparação no front-end. Validar criação, confirmação e erro com o serviço da tarefa de avaliações quando estiver disponível. |

## Achados transversais

1. **Mensagens da API chegam diretamente à interface em alguns fluxos.** Foram observados usos de `response.data.message` no login, na criação de anúncios, nos modais da coleção e nas decisões de troca. Isso confirma um caminho de exibição da mensagem do servidor, sem evidência de que algum dado sensível tenha sido exibido. Priorizar uma regra compartilhada para códigos e mensagens de campo conhecidos, com texto seguro para respostas inesperadas.
2. **Há componentes reutilizáveis, mas os estados ainda aparecem em implementações locais.** `Alert` já diferencia avisos de erro e mensagens de status para tecnologias assistivas. `useRemoteData` oferece carregamento, sucesso, 404, erro e nova tentativa. A apresentação do vazio, da busca sem resultados e da indisponibilidade ainda depende de cada fluxo. Aproveitar esses componentes e consolidar o que se repete, mantendo a ação contextual de cada tela.
3. **Falha confirmada e resultado desconhecido precisam de ações diferentes.** Uma consulta pode oferecer nova tentativa. Após uma operação com efeito, como pagamento ou envio de proposta, a perda da resposta deve levar à verificação do estado antes do reenvio. O carrinho já oferece uma referência de mensagem para alterações não confirmadas.
4. **A confirmação deve acompanhar a consequência.** Preservar possibilidade de desfazer remoções reversíveis, como no carrinho. Para cancelamentos definitivos e outras ações destrutivas, usar diálogo com consequência clara, foco acessível e opção explícita de manter o estado atual.

## Perspectiva de execução

- **Prioridade alta.** Mapear mensagens seguras e validar falhas e resultados incertos em compra, troca e cancelamento. Cobrir clique duplo e perda de rede depois do envio.
- **Depois.** Reutilizar os padrões de carregamento, vazio real, filtro sem resultados, erro recuperável e operação indisponível no catálogo, coleção, Marketplace e histórico.
- **Por fim.** Conferir os oito fluxos com teclado, leitor de tela e movimento reduzido. Validar foco e retorno ao disparador nos modais, anúncio dos estados dinâmicos e compatibilidade com os protótipos do guia de Design.

## Validação e situação do aceite

O build do front-end passou com `npm run build`. A revisão identifica tratamentos já existentes e lacunas de padronização. O build deixa em aberto o comportamento com rede lenta, falhas, foco, leitura assistiva e comparação visual. Os critérios de aceite seguem pendentes de validação em execução.

Referência de design no repositório em `docs/design-system/Auditoria-Feedback-Navegacao-Handoff.md`, especialmente a matriz por fluxo, os contratos de estado e o roteiro de QA.

[Issue #93 no GitHub](https://github.com/PI3-TCG/TCGMarket/issues/93#issue-5608830922)
