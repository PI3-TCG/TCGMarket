# Handoff — Sistema de Reputação e Avaliações | TCG Market

**Projeto:** TCG Market — Projeto Integrador III (Fatec)  
**Entrega:** Design de alta fidelidade + especificação funcional/técnica para a **Milestone 3**  
**Artefatos:** 9 telas PNG de referência, pasta `png/` e este documento  
**Status:** Conceito visual da página principal aprovado; especificações e contratos abaixo são **propostas para implementação**, não funcionalidades já existentes no backend.

> **Premissas aprovadas:** avaliação com **nota obrigatória de 1 a 5 estrelas** e **comentário opcional**; vinculada a uma **transação concluída**; vendedor/comprador ou participantes de uma troca avaliam **a contraparte**, nunca a si próprios. As operações são exibidas em **modais**. Reputação pública contém **média e número total de avaliações**. Trocas continuam sendo **somente de cartas, sem dinheiro**. **Não utilizar breadcrumb**.

## 1. Objetivo

Permitir que participantes de uma transação concluída avaliem a experiência de negociação com o outro usuário, formando uma reputação pública útil nos **perfis** e no **Marketplace**. A experiência deve mostrar com clareza:

1. **Quem** está sendo avaliado.
2. **Qual transação** originou a avaliação (tipo e identificador).
3. **Qual nota** está sendo atribuída (1–5 estrelas).
4. **Qual comentário** foi escrito (opcional).
5. **Quando** a avaliação foi enviada e **onde** ficará visível.
6. **Qual é a reputação atual** do usuário (média e quantidade).

### Público × privado

- **Perfil público:** identidade pública permitida, reputação agregada, distribuição de notas (se adotada), lista de avaliações recebidas e contexto público limitado da transação.
- **Perfil próprio:** pode reutilizar a mesma visualização pública, mas mantém **edição cadastral, dados pessoais, preferências e ações internas** em páginas/componentes próprios. Não deslocar informações privadas para o perfil público.
- **Histórico pessoal:** é o ponto recomendado para o usuário encontrar a avaliação **pendente** ou **já realizada** vinculada à sua transação.
- **Marketplace:** mostrar um resumo **compacto** da reputação do anunciante, com acesso ao perfil público. Não criar uma segunda origem dos dados.

## 2. Fluxo principal

```text
Usuário autenticado
  └── Histórico de transações
       └── Detalhes da transação
            ├── Transação NÃO concluída
            │    └── Sem ação para avaliar (exibir somente status da operação)
            └── Transação CONCLUÍDA
                 ├── Avaliação ainda não enviada
                 │    └── CTA "Avaliar colecionador"
                 │         └── Modal de avaliação
                 │              ├── Identificar contraparte e transação
                 │              ├── Selecionar 1 a 5 estrelas (obrigatório)
                 │              ├── Escrever comentário (opcional)
                 │              ├── Cancelar / fechar sem enviar
                 │              └── Enviar avaliação
                 │                   ├── Loading: desabilitar reenvio
                 │                   ├── Sucesso: avaliação registrada
                 │                   └── Erro: exibir mensagem e permitir tentativa
                 └── Avaliação já realizada
                      └── Mostrar nota, comentário e data; sem botão de nova avaliação

Perfil público do colecionador
  ├── Sem avaliações: indicar ausência (NÃO exibir nota zero)
  ├── Com avaliações: média + contagem + distribuição + lista
  ├── Loading: placeholders/skeleton
  └── Erro: mensagem + tentar novamente

Marketplace
  └── Card do anúncio → reputação compacta do vendedor → Perfil público
```

**Observação:** a elegibilidade da avaliação deve ser confirmada pelo backend no momento do envio, mesmo que a interface já tenha habilitado o CTA.

## 3. Mapa dos protótipos

Todos os PNGs são **ilustrações estáticas**, com nomes, imagens, datas e IDs fictícios. Não substituem telas implementadas nem dados reais. Na construção, nomes de TCG, cartas, datas, tipo de transação e badges devem refletir os dados efetivos do domínio.

| Arquivo | Contexto | O que representa |
|---|---|---|
| [`01_perfil_publico_com_reputacao.png`](png/01_perfil_publico_com_reputacao.png) | Perfil público | Identidade do colecionador, nota média, estrelas, contagem, distribuição de notas e avaliações recebidas. **Tela principal aprovada**. |
| [`02_avaliacao_pendente_transacao_concluida.png`](png/02_avaliacao_pendente_transacao_concluida.png) | Histórico/detalhes | Transação concluída elegível e chamada para avaliar contraparte. |
| [`03_modal_avaliar_colecionador.png`](png/03_modal_avaliar_colecionador.png) | Modal | Campos de 1–5 estrelas e comentário opcional, transação de origem e identidade do avaliado. |
| [`04_modal_avaliacao_preenchida.png`](png/04_modal_avaliacao_preenchida.png) | Modal preenchido | Nota selecionada, comentário preenchido, envio habilitado. |
| [`05_avaliacao_enviada_sucesso.png`](png/05_avaliacao_enviada_sucesso.png) | Confirmação | Retorno positivo, vínculo com a transação e leitura da avaliação enviada. |
| [`06_perfil_sem_avaliacoes.png`](png/06_perfil_sem_avaliacoes.png) | Perfil público vazio | Ausência de reputação, sem confundir com nota 0/5. |
| [`07_loading_reputacao.png`](png/07_loading_reputacao.png) | Perfil público | Carregamento com skeleton e preservação da estrutura visual. |
| [`08_reputacao_no_marketplace.png`](png/08_reputacao_no_marketplace.png) | Marketplace | Nota resumida do vendedor nos cards de anúncio e acesso ao perfil. |
| [`09_erro_carregar_reputacao.png`](png/09_erro_carregar_reputacao.png) | Perfil público | Falha de carregamento, mensagem clara e opção “Tentar novamente”. |

> **Ajustes de implementação em relação à arte:** onde uma imagem fictícia apresenta o número `0` em área de nota, **substituir por “—” e “Ainda sem avaliações”**, mantendo o contador `0 avaliações`. A nota é **indefinida** enquanto não existir avaliação. Alguns exemplos ilustrativos mostram transações e cartas diferentes entre si; manter **ID, participantes e tipo consistentes** em uma sessão real. O estado de **erro no envio** é especificado abaixo e deve ser implementado no próprio modal, mesmo sem PNG dedicado.

## 4. Design System e estrutura de página

### Tokens existentes no repositório

Utilizar os tokens definidos em `frontend/src/index.css` do projeto, evitando hexadecimais e estilos duplicados nos componentes:

| Elemento | Token confirmado | Valor no repositório |
|---|---|---|
| Cor primária | `primary-900` | `#660366` |
| Primária escura | `primary-800` | `#4f024f` |
| Roxo de apoio | `primary-700` | `#996699` |
| Fundo roxo claro | `primary-100` | `#f0e3f0` |
| Azul/links/contextos de troca | `secondary-700` | `#0969d7` |
| Superfície clara | `neutral-0` | `#ffffff` |
| Fundo | `neutral-50` | `#fafbfe` |
| Borda | `neutral-200` | `#e6e7f0` |
| Texto | `neutral-900` | `#302b40` |
| Sucesso | `success-700` | `#15803d` |
| Erro | `error-700` | `#b91c1c` |
| Aviso | `warning-700` | `#d97706` |
| Controle | `radius-control` | `8px` |
| Card/superfície | `radius-surface` | `12px` |
| Tipografia de títulos | `font-display` | Cinzel |
| Tipografia de conteúdo | `font-sans` | Plus Jakarta Sans |

**Estrelas:** tom dourado/âmbar com contraste adequado, usando tonalidade do tema (`rare-500: #e0a100`, se apropriado). Estrela preenchida significa nota; estrela vazia significa ausência de seleção ou fração não preenchida. Ao lado, **sempre apresentar o valor numérico** quando houver avaliações, por exemplo **`4,8 de 5 · 32 avaliações`**.

### Navbar, cabeçalho e footer — obrigatórios

- **Reutilizar a Navbar e o Footer já existentes na aplicação**, sem criar versões exclusivas para reputação.
- Manter as áreas, espaçamento, ações globais, estado autenticado, avatar, responsividade e rodapé padronizados pelo produto.
- Usar banner de título de seção no conteúdo, no padrão dos últimos protótipos; o banner **não substitui** a navbar global.
- **Não incluir breadcrumbs**.
- Modal centralizado sobre a página de detalhes, com backdrop; navbar/footer permanecem visíveis ao fundo, sem interação enquanto o modal estiver aberto.
- Não reproduzir literalmente mudanças ilustrativas de navegação que eventualmente apareçam nos PNGs; **o código atual do repositório é a fonte de verdade**.

### Composição sugerida da página pública

1. Navbar global do TCG Market.
2. Banner “Perfil do colecionador”.
3. Card de identidade (avatar, nome público, data de ingresso *se disponível e permitida*).
4. Destaque da reputação (média numérica, estrelas, quantidade de avaliações).
5. Coluna de distribuição por nota (`5★` a `1★`) com barras e contagens.
6. Seção “Avaliações recebidas” (autor, nota, data, tipo de transação, identificador público e comentário quando houver).
7. Paginação/“Ver mais avaliações”.
8. Footer global.

## 5. Regras de negócio

### Regras obrigatórias (derivadas da tarefa)

| ID | Regra | Comportamento |
|---|---|---|
| RN-01 | Avaliação vinculada a transação concluída | Exigir `COMPLETED` ou status equivalente efetivamente confirmado. Proposta **aceita** não equivale automaticamente a troca concluída. |
| RN-02 | Avaliação entre participantes | Autor e avaliado precisam participar da mesma operação. |
| RN-03 | Proibido autoavaliar-se | `reviewerId !== reviewedUserId`, verificado no servidor. |
| RN-04 | Nota de 1 a 5 | Apenas **valores inteiros** `1`, `2`, `3`, `4`, `5`. |
| RN-05 | Comentário opcional | Ausência de comentário não impede avaliação. Não exibir área vazia como se fosse erro. |
| RN-06 | Reputação | Média aritmética das notas recebidas; quantidade = total de avaliações válidas recebidas. |
| RN-07 | Origem identificável | Mostrar tipo/ID da transação ao avaliar e na área privada do usuário. |
| RN-08 | Sem avaliações | Estado “Ainda sem avaliações”, sem atribuir a nota zero ao usuário. |
| RN-09 | Mercado | Reputação do anunciante deve referenciar o mesmo agregado do perfil público. |

### Propostas de comportamento para alinhar com o PO

- **Uma avaliação por autor, contraparte e transação.** Ambos os participantes podem avaliar um ao outro de modo independente. Impede duplicidade e inflar artificialmente a média.
- A avaliação enviada fica **somente leitura** nesta entrega. Edição, remoção, denúncia, moderação e direito de resposta exigem escopo separado.
- **Tamanho máximo sugerido:** 500 caracteres para comentário (validar com PO/back). Usar `trim()`; comentário vazio vira `null`.
- A nota e o comentário devem ser salvos **juntos em uma operação atômica**.
- Exibir a média com **uma casa decimal**, arredondada para visualização e formatada em `pt-BR` (`4,8`). Persistir a nota original em inteiro; evitar arredondar ao armazenar o agregado.
- **Distribuição** recomendada: contagem de avaliações por estrela, 5 → 1, consistente com o total. Exemplo real: 26 notas 5★ + 5 notas 4★ + 1 nota 3★ = 32 avaliações, média 4,78125 → **4,8** na UI.
- Em resultados de compra com **múltiplos vendedores**, avaliar somente a contraparte relacionada à **transação/suboperação efetivamente concluída**; não selecionar destinatário arbitrário pelo front.
- Se existirem operações encerradas e posteriormente revertidas, confirmar com o PO se a avaliação permanece elegível ou deve ser sinalizada. Não ocultar arbitrariamente uma nota sem decisão de negócio.
- **Não conceder nota automática** a usuários que ainda não foram avaliados e não ordenar “sem avaliações” como reputação 0.
- Ao publicar comentário, evitar exposição de endereço, contato, pagamento e outros dados sensíveis da transação no perfil público.

## 6. Estados de interface e mensagens

| Estado | Gatilho | Exibição / ação |
|---|---|---|
| **Com avaliações** | `count > 0` | Média, estrelas, contagem, distribuição e avaliações recentes. |
| **Sem avaliações** | `count = 0` | Estrelas vazias, “Ainda sem avaliações” e `0 avaliações`; sem “0,0/5”. |
| **Avaliação pendente** | Transação `COMPLETED` e sem avaliação do autor | CTA **Avaliar colecionador**, nome da contraparte e ID da operação. |
| **Modal sem nota** | Aberto, `rating = null` | Botão Enviar **desabilitado**; texto “Selecione de 1 a 5 estrelas”. |
| **Modal válido** | Nota 1–5 selecionada | Envio habilitado, comentário opcional. |
| **Enviando** | POST em andamento | Spinner e botão desabilitado; impedir clique duplicado. |
| **Avaliação realizada** | Sucesso retornado pela API | Mensagem de sucesso e leitura de nota/comentário; remover CTA. |
| **Duplicada** | `409` ou elegibilidade negativa | “Esta transação já foi avaliada.”, fechar ação e atualizar detalhe. |
| **Inelegível** | Operação não concluída, não é participante ou autoavaliação | Não disponibilizar CTA. Caso API recuse, mostrar mensagem apropriada. |
| **Erro no envio** | Falha de rede/5xx | Mensagem no modal, dados preservados, botão “Tentar novamente”. Verificar se envio ocorreu antes de repetir após timeout. |
| **Loading do perfil** | GET em andamento | Skeleton para avatar, indicadores, barras e avaliações. |
| **Erro no perfil** | GET falhou | Mensagem + “Tentar novamente”, sem mostrar nota fictícia. |
| **Lista vazia** | Nenhuma avaliação recebida | Ilustração de estado vazio e texto explicativo. |
| **Imagem indisponível** | Falha ao carregar avatar/card | Fallback compartilhado, preservando informação textual. |

### Texto de interface recomendado

- Nota inexistente: **“Ainda sem avaliações”**.
- Sem comentários no item: **“Avaliação sem comentário.”** ou omitir a área de comentário; manter nota e data.
- Modal: **“Avaliar colecionador”**, **“Sua avaliação *”**, **“Comentário (opcional)”**, **“Enviar avaliação”**.
- Confirmação: **“Avaliação enviada com sucesso. Sua avaliação foi vinculada à transação.”**
- Erro de submissão: **“Não foi possível registrar sua avaliação. Verifique a conexão e tente novamente.”**
- Erro de consulta: **“Não foi possível carregar as avaliações.”**

## 7. Componentes React sugeridos

> **Pasta e nomes são sugestões**, adaptar ao padrão real da árvore do frontend; não criar componentes duplicados de Navbar, Footer, Modal, Badge, Button ou Card se já existirem.

```text
frontend/src/
  pages/
    PublicCollectorProfilePage.tsx
  components/
    reputation/
      ReputationSummary.tsx         # média + estrelas + quantidade
      RatingStars.tsx               # leitura e seleção acessível
      RatingDistribution.tsx        # 1–5 estrelas e quantidades
      ReviewList.tsx                # lista paginada
      ReviewCard.tsx                # autor, nota, data, transação, comentário
      ReputationInline.tsx          # compacto para anúncio e outros contextos
      ReviewEntryPoint.tsx          # CTA no detalhe da transação
      CreateReviewModal.tsx         # avaliação, validação e envio
      ReviewSubmittedState.tsx      # sucesso / avaliação realizada
  services/
    reputationApi.ts
  types/
    reputation.ts
```

### Comportamentos de componentes

**`ReputationSummary`**

- Recebe `averageRating: number | null` e `reviewCount: number`.
- Se `reviewCount === 0`: retornar estado sem nota e 0 avaliações.
- Se `reviewCount > 0`: renderizar média numérica (pt-BR), estrelas proporcionais (somente leitura) e contador.

**`RatingStars`**

- `mode="display"`: somente leitura, texto alternativo com valor completo, sem focos de teclado inúteis.
- `mode="input"`: cinco opções com comportamento equivalente a **radiogroup** (`aria-label="Sua avaliação"`, valores 1 a 5). Habilitar navegação por teclado (Tab para entrada; setas para mudar, Enter/Espaço para confirmar, conforme padrão ARIA adotado).
- `onChange(value: 1 | 2 | 3 | 4 | 5)`; valor inicial `null` na criação.

**`CreateReviewModal`**

- Exibir contexto da operação e pessoa avaliada; ambos são campos somente leitura.
- Não permitir edição de `reviewerId`, `reviewedUserId` nem `transactionId` dentro do corpo do POST.
- Bloquear botão Enviar sem nota ou durante submissão; exibir erro de API sem limpar o formulário.
- Ao fechar, restaurar foco ao botão que o abriu; usar foco preso (focus trap), título acessível, Escape e clique no backdrop se não houver operação em andamento; quando enviando, evitar fechar por acidente.
- Em sucesso, invalidar/atualizar resumo de reputação, listagem de avaliações e a situação da avaliação no histórico.

**`ReviewCard`**

- Exibir nota, nome público do autor, data de avaliação, tipo de transação e referência pública permitida.
- Exibir comentário **somente se existente**, sem caixa vazia.
- Comentário renderizado como **texto**, sem HTML arbitrário.

**`ReputationInline`**

- No rodapé do card do Marketplace, associar o indicador ao anunciante correto.
- Formato compacto preferencial: `★ 4,8 · 32 avaliações`; sem notas: `Ainda sem avaliações`.
- Link “Ver perfil” deve apontar ao perfil público correto. Não alterar a lógica de filtragem/paginação dos anúncios.

## 8. Contratos de dados sugeridos (TypeScript)

```ts
export type RatingValue = 1 | 2 | 3 | 4 | 5;
export type TransactionType = 'PURCHASE' | 'SALE' | 'TRADE';

export interface ReputationSummary {
  userId: string;
  averageRating: number | null; // null quando totalReviews = 0
  totalReviews: number;
  countsByRating: Record<RatingValue, number>;
}

export interface Review {
  id: string;
  transactionId: string;
  transactionPublicCode?: string; // ex.: TC-10455
  transactionType: TransactionType;
  reviewer: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  reviewedUserId: string;
  rating: RatingValue;
  comment: string | null;
  createdAt: string; // ISO 8601
}

export interface CreateReviewRequest {
  rating: RatingValue;
  comment?: string | null;
}

export interface ReviewEligibility {
  transactionId: string;
  eligible: boolean;
  alreadyReviewed: boolean;
  reviewedUser: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  reason?:
    | 'TRANSACTION_NOT_COMPLETED'
    | 'NOT_PARTICIPANT'
    | 'SELF_REVIEW'
    | 'ALREADY_REVIEWED';
}

export interface PagedReviews {
  items: Review[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
```

**Exemplo de retorno do resumo** — dados exclusivamente ilustrativos:

```json
{
  "userId": "u-204",
  "averageRating": 4.78125,
  "totalReviews": 32,
  "countsByRating": {
    "1": 0,
    "2": 0,
    "3": 1,
    "4": 5,
    "5": 26
  }
}
```

A UI formata `4.78125` como `4,8`, sem alterar a precisão de armazenamento. A distribuição soma exatamente 32. **Caso haja zero avaliações**, `averageRating` deve ser `null`, e as contagens devem ser todas zero.

## 9. API REST sugerida — não implementada/confirmada

> Alinhar nomes, paginação, DTOs e autenticação com os padrões existentes no backend (Java/Spring Boot + MongoDB). Estes endpoints **não são uma afirmação de que já existem**.

```http
GET  /api/users/{userId}/reputation
GET  /api/users/{userId}/reviews?page=1&size=10
GET  /api/users/me/transactions/{transactionId}/review-eligibility
POST /api/users/me/transactions/{transactionId}/reviews
GET  /api/users/me/transactions/{transactionId}/my-review
```

**POST — corpo mínimo:**

```json
{
  "rating": 5,
  "comment": "Negociação tranquila, cartas em ótimo estado!"
}
```

Para avaliação sem comentário: `{"rating": 5}`. **O usuário avaliado precisa ser resolvido no servidor** a partir da operação autenticada; não confiar em um ID de destinatário enviado pelo cliente.

**Respostas orientativas:**

| Situação | HTTP sugerido | Tratamento UI |
|---|---|---|
| Criada | `201 Created` | Sucesso + substituir CTA por avaliação realizada. |
| Nota inválida / comentário acima do limite | `400 Bad Request` | Mensagem junto ao controle. |
| Não autenticado | `401 Unauthorized` | Fluxo de login existente. |
| Sem participação/permissão | `403 Forbidden` | Não expor dados do outro participante. |
| Transação inexistente ou não visível | `404 Not Found` | Aviso específico, sem vazamento de dados. |
| Já avaliada ou estado mudou | `409 Conflict` | Atualizar elegibilidade e mostrar motivo; não duplicar registro. |
| Falha temporária | `5xx` | Erro recuperável e tentativa, sem descartar nota/comentário. |

### Fonte de verdade e atualização

- O backend deve decidir **elegibilidade** e registrar a avaliação.
- A contagem/nota do perfil e o card de anúncio devem usar a mesma fonte de dados.
- Após envio: refetch ou invalidação de cache do resumo e dos comentários; o histórico muda para “Avaliação realizada”.
- A API pode calcular a média a partir dos registros de reviews ou manter um agregado atualizado de modo consistente. Evitar médias calculadas apenas no frontend a partir da página de reviews carregada.

## 10. Persistência e validações do backend (proposta)

Coleção MongoDB sugerida: **`reviews`**, a confirmar conforme modelagem aprovada do grupo.

```json
{
  "_id": "review-001",
  "transactionId": "transaction-001",
  "reviewerId": "user-A",
  "reviewedUserId": "user-B",
  "rating": 5,
  "comment": "Negociação excelente.",
  "createdAt": "2026-10-24T19:00:00Z"
}
```

**Validações no `Service` (não apenas no Controller/UI):**

1. Usuário autenticado existe e é participante da transação.
2. Transação está concluída de acordo com o status efetivo de negócio.
3. Avaliado é a contraparte correta; `reviewerId != reviewedUserId`.
4. Nota é inteiro 1–5; comentário opcional dentro do limite acordado.
5. Não existe uma avaliação desse autor para a mesma contraparte e transação.
6. Persistir com proteção contra requisições concorrentes.

**Índice único sugerido:** `{ transactionId: 1, reviewerId: 1, reviewedUserId: 1 }`. Se o domínio fixar uma única contraparte por transação, uma composição menor poderá ser suficiente; manter compatibilidade com compras envolvendo múltiplos vendedores. Outros índices sugeridos: `{ reviewedUserId: 1, createdAt: -1 }` para paginar avaliações públicas.

**Sobre média e contagem:** usar somente avaliações válidas **recebidas** pelo perfil exibido; excluir avaliações **feitas** por esse perfil. Se futuramente houver moderação, definir previamente se avaliações ocultadas integram a média.

## 11. Segurança, privacidade e acessibilidade

- Autorizar no backend com identidade do token, sem aceitar impersonação pelo request.
- Não expor dados privados da transação em reviews públicas: endereço, dados de pagamento, CPF, contatos e observações internas.
- O identificador **público** da transação é útil para rastreabilidade; se revelar informações sensíveis, optar por referência reduzida ou vínculo apenas para os participantes.
- Renderizar comentários como texto escapado; não inserir HTML do usuário (`dangerouslySetInnerHTML`). Considerar mecanismo de denúncia/moderação como evolução futura.
- Botões, estrelas e modais com foco visível, contrastes adequados, `aria-label`, descrição de erros e navegação por teclado.
- Não comunicar situação somente pela cor; estrela acompanhada de número ou texto acessível.
- Resultados e avaliações paginados; tratar imagens quebradas, textos longos e nomes grandes.
- Layout responsivo: cards e distribuição empilham em telas pequenas; modal usa altura rolável sem esconder rodapé de ações; evitar deslocamento horizontal.
- Datas no fuso da interface; armazenar no backend em UTC e formatar no cliente conforme o padrão do projeto.

## 12. Critérios de aceite e testes recomendados

| Critério | Evidência |
|---|---|
| Fluxo de avaliação | Telas 02–05; entrada a partir de transação concluída. |
| Reputação representada | Tela 01 (média + contagem) e 08 (Marketplace). |
| Avaliações recebidas | Tela 01: lista e distribuição. |
| Estado sem avaliações | Tela 06; sem usar nota 0 para reputação ausente. |
| Relação com transação | Telas 02–04: ID, tipo, contraparte. |
| Estados principais | Telas 05–07 e 09; erro no envio descrito neste handoff. |
| Design System | Seção 4; reutilização dos tokens e componentes do projeto. |
| Material para implementação | Seções 5–11; DTOs, API sugerida, regras, estados e segurança. |

### Casos para QA

- [ ] Usuário com 0 avaliações vê “Ainda sem avaliações”, sem `0,0` de média.
- [ ] Média e distribuição batem com o total de notas; formatação em pt-BR.
- [ ] Avaliação com 1 estrela e sem comentário é aceita.
- [ ] Avaliação com 5 estrelas e comentário válido é aceita.
- [ ] Não é possível enviar sem selecionar nota; nota fora de 1–5 é recusada no servidor.
- [ ] Não é possível avaliar antes da conclusão da operação nem apenas por proposta aceita.
- [ ] Não é possível avaliar a si próprio nem alguém fora da operação.
- [ ] Participantes opostos podem se avaliar separadamente.
- [ ] Duplo clique/requests simultâneos não criam reviews duplicadas.
- [ ] Um segundo envio da mesma avaliação retorna conflito e sincroniza UI.
- [ ] Erro ao enviar preserva dados preenchidos e mostra ação de recuperação.
- [ ] Loading, erro e lista vazia são distinguíveis.
- [ ] Reputação compacta no Marketplace reflete a mesma média/contagem do perfil.
- [ ] Comentário longo e caracteres especiais não quebram o layout ou permitem HTML executável.
- [ ] Modal acessível por teclado e com retorno de foco após fechar.

## 13. Decisões pendentes para PO / implementação

1. **Uma review por transação/contraparte:** recomendação técnica de unicidade; validar formalmente.
2. **Comentários:** limite sugerido de 500 caracteres, política de linguagem inadequada, edição e remoção — definir escopo.
3. **Quando a operação é `COMPLETED`:** especialmente nas trocas, onde o aceite da proposta não representa necessariamente a entrega/conclusão.
4. **Compras com vendedores diferentes:** avaliar cada vendedor por subtransação concluída; especificar identificadores.
5. **Reversões/reembolsos:** impacto posterior nas avaliações recebidas.
6. **Identificador público nas avaliações:** garantir rastreabilidade sem vazar dados privados de transações.
7. **Perfil público:** rota, quais campos são públicos e como o visitante chega ao perfil.
8. **Ordenação de reviews:** recomenda-se mais recentes primeiro; paginação de 10 por vez como ponto de partida.
9. **Reputação no Marketplace:** indicador informativo; eventual filtro/ordenação por nota é um escopo separado.
10. **Momento da atualização do agregado:** cálculo em leitura vs. agregação persistida e política de consistência.

## 14. Ordem sugerida de desenvolvimento

1. Definir modelagem `Review`, elegibilidade e vínculo com transação concluída no backend.
2. Criar endpoints de avaliação, resumo e paginação de avaliações recebidas.
3. Construir `RatingStars`, `ReputationSummary` e `ReviewCard` reutilizáveis.
4. Inserir reputação no perfil público, com lista, zero, loading e erro.
5. Ligar `ReviewEntryPoint` ao histórico de transações e criar modal.
6. Implementar submissão, proteção de duplicação e feedback de sucesso/erro.
7. Aplicar `ReputationInline` aos anúncios e integrar acesso ao perfil público.
8. Executar testes de regras de negócio, atualização do agregado e acessibilidade.

---

### Referências do projeto

- Repositório: https://github.com/PI3-TCG/TCGMarket
- Tokens visuais: https://github.com/PI3-TCG/TCGMarket/blob/main/frontend/src/index.css
- Protótipos deste handoff: `png/01_...` a `png/09_...`.

**Conclusão:** o conjunto descreve uma solução de interface de **reputação com notas de 1 a 5 estrelas, média, total de avaliações, comentário opcional e vínculo verificável à transação concluída**, preservando o design já aprovado e estabelecendo orientações para o desenvolvimento na Milestone 3.
