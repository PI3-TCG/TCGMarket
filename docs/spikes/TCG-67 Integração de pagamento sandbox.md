# Spike — Integração de pagamento sandbox

Issue: #67. Complementa o [TCG-8 Spike Métodos de pagamento](./TCG-8%20Spike%20Métodos%20de%20pagamento%20.md), que comparou os gateways e indicou o Mercado Pago. Este documento leva aquela indicação até o nível de implementação.

Pesquisa feita em outubro de 2026 na documentação oficial do Mercado Pago (Checkout Transparente via Orders, contas de teste, webhooks) e do Stripe, usado como comparação.

## 1. Resumo das decisões

| Pergunta | Decisão |
| --- | --- |
| Qual solução será utilizada? | **Mercado Pago, Checkout Transparente via API de Orders (`/v1/orders`), em ambiente de teste.** O pagamento padrão é **Pix**. |
| Como será a integração? | O backend chama a API REST do Mercado Pago com `RestClient`, atrás de uma interface `PaymentGateway`. Existem duas implementações: `SimulatedPaymentGateway` (padrão em dev, testes e CI) e `MercadoPagoPaymentGateway` (sandbox, ligada por configuração). |
| Quais configurações são necessárias? | Access Token e chave secreta do webhook **de teste**, URL pública do webhook e a escolha do provedor. Todas vêm de variáveis de ambiente. Detalhes na seção 6. |
| Como representar aprovado e recusado? | Com um enum próprio, `PaymentStatus` (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED`), mapeado a partir do status da order do Mercado Pago. O domínio nunca depende do texto do gateway. |
| Será necessário webhook? | **Sim, com o Pix**, porque a aprovação é assíncrona. O webhook é validado pela assinatura `x-signature`. Também há a consulta `GET /v1/orders/{id}`, que serve de reserva quando o webhook não chega e para testar localmente. |
| Como testar localmente? | Pelo simulador, sem rede, no dia a dia e na CI. Pelo sandbox, com o Access Token de teste e a consulta da order, sem precisar de URL pública. Webhook de verdade só em HML, que já tem HTTPS, ou com túnel (ngrok ou cloudflared). |
| Como garantir que não haja cobrança real? | Só existem credenciais da **conta vendedora de teste**, não há credencial de produção no projeto, nenhum dado de cartão real é pedido e a aplicação recusa respostas e notificações com `live_mode: true`. Detalhes na seção 8. |
| Como tratar falha? | Recusa vira `REJECTED` e o comprador pode tentar de novo (nova tentativa, nova chave de idempotência). Erro técnico ou timeout deixa a tentativa `PENDING` e ela é reconciliada pela consulta. Uma falha do gateway não derruba o resto da aplicação (RNF06). Detalhes na seção 9. |

## 2. Contexto e restrições do projeto

- **RF02**: sistema de pagamento, "mesmo que simulado, já que é projeto acadêmico" (essencial).
- **RNF03**: dados de pagamento não devem ser armazenados no banco da aplicação.
- **RNF06**: uma falha no pagamento não pode derrubar navegação e busca.
- **Handoff do carrinho (#59)**: o checkout mostra "Pagamento simulado. Nenhum valor será cobrado." e o botão **Simular pagamento**. Não pede dados de cartão, e aprovação ou recusa são acionadas **por configuração interna do simulador**, não por um seletor na tela. Cada vendedor gera um pedido separado, e uma única ação do comprador pode ter resultado parcial (um pedido aprovado e outro recusado). O handoff também exige idempotência para criar tentativa, processar resultado e baixar quantidade.
- **Backend**: Spring Boot 4 com Java 25 e MongoDB. HML roda em `https://tcc-market.duckdns.org`, atrás do Caddy com TLS.

Essas restrições pesam na escolha. A tela não pede cartão, então um fluxo que dependa de formulário de cartão (Card Payment Brick ou Checkout Pro) contraria o protótipo. E a CI não pode depender de rede nem de credencial externa.

## 3. Soluções avaliadas

| Critério | Mercado Pago, Orders (Checkout Transparente) | Mercado Pago, Checkout Pro | Stripe (test mode) | Simulador interno |
| --- | --- | --- | --- | --- |
| Integração | REST simples, um `POST /v1/orders` | Cria uma *preference* e redireciona o comprador para o Mercado Pago | REST e SDK muito bons | Código nosso |
| Documentação | Boa, em português | Boa, em português | Excelente, em inglês | — |
| Credenciais de teste | Criadas automaticamente com a aplicação (prefixo `APP_USR`) | As mesmas, mas exige conta compradora de teste com login | Chave `sk_test_` imediata | Não precisa |
| Criação do pagamento | Pix sem dados de cartão; cartão exige token gerado no front | Página hospedada pelo Mercado Pago | PaymentIntent | Imediata |
| Aprovação no teste | Pix com `payer.first_name = "APRO"` é aprovado automaticamente; cartão com titular `APRO` | Login de comprador de teste com cartão de teste | Cartão `4242…` | Configurável |
| Recusa no teste | Cartão com titular `OTHE`, `FUND`, `SECU` e outros | Igual | Cartões de recusa | Configurável |
| Cancelamento | Cancelar order (`canceled`) e expiração | Expiração da preference | Cancelar PaymentIntent | Configurável |
| Webhook | Sim, assinado com HMAC (`x-signature`), com simulador no painel | Sim | Sim, e o Stripe CLI encaminha para localhost | Não precisa |
| Complexidade operacional | Baixa a média | Média: redirecionamento, `back_urls` não aceitam localhost e a conta de teste exige confirmação | Média: conta e foco internacional | Muito baixa |
| Limites gratuitos | Teste sem custo; até 15 contas de teste; *rate limit* (`429` com `Retry-After`) | Igual | Teste sem custo | — |
| Java e Spring Boot | REST direto ou SDK oficial `com.mercadopago:sdk-java` 3.7.0 (Java 8+) | Igual | SDK `stripe-java` | Nativo |
| Aderência ao protótipo | **Alta**: Pix não pede cartão, e o botão "Simular pagamento" continua fazendo sentido | Baixa: tira o usuário do site | Média: sem Pix no teste para BR, só cartão | **Alta** |

**Conclusão:** o Mercado Pago via Orders com Pix é a solução com mais aderência. Ele confirma a indicação do TCG-8, aceita pagamento sem pedir dados de cartão (alinhado ao handoff e ao RNF03) e aprova automaticamente no sandbox. O simulador interno não é uma alternativa ao Mercado Pago, e sim a implementação padrão da mesma interface. É ele que deixa a CI e o desenvolvimento independentes de rede e credencial. O Checkout Pro foi descartado por tirar o usuário do site e pelos problemas conhecidos com contas de teste. O Stripe, por ser menos alinhado ao público brasileiro (Pix).

## 4. Arquitetura proposta

```text
React (Revisão do pedido: "Simular pagamento")
   │  POST /api/users/me/checkout  (Idempotency-Key)
   ▼
CheckoutService ── agrupa itens por vendedor ──► 1 Order (pedido) por vendedor
   │                                               │
   │                           cria PaymentAttempt (PENDING) para cada pedido
   ▼                                               ▼
PaymentGateway (interface)
   ├── SimulatedPaymentGateway   (padrão: dev, testes, CI)
   └── MercadoPagoPaymentGateway (payment.provider=mercadopago)
            │  POST /v1/orders  (X-Idempotency-Key = id da tentativa)
            ▼
       Mercado Pago (sandbox)
            │  webhook "order"  ──►  POST /api/payments/webhooks/mercadopago
            │                          valida x-signature, responde 200 rápido
            ▼                          e consulta GET /v1/orders/{id}
       PaymentResultService ── aplica o resultado uma única vez (idempotente)
            ├─ APPROVED → pedido confirmado, baixa remainingQuantity do anúncio, remove itens do carrinho
            └─ REJECTED/EXPIRED/CANCELLED → libera a reserva, itens continuam no carrinho
```

Interface sugerida:

```java
public interface PaymentGateway {
    PaymentResult create(PaymentRequest request);   // valor, referência externa, chave de idempotência
    PaymentResult fetch(String providerPaymentId);  // fonte da verdade para reconciliação
}
```

`PaymentResult` traz o `PaymentStatus` já mapeado, o id no provedor e, para Pix, o `qr_code` e o `ticket_url`. Guardamos só esses identificadores e o status. **Nenhum dado de cartão é salvo** (RNF03).

Por que REST direto em vez do SDK: são só três chamadas (criar order, consultar order e validar webhook). Com `RestClient` fica fácil simular nos testes, seguimos o padrão dos clientes de catálogo que já existem em `external-apis` e evitamos uma dependência grande. O SDK oficial (`sdk-java` 3.7.0) continua sendo uma opção válida se o time preferir.

## 5. Fluxo técnico

1. O comprador revisa o carrinho e clica em **Simular pagamento**. O front envia o checkout com um `Idempotency-Key` gerado uma vez por clique.
2. O backend revalida preço e disponibilidade (ver #66), agrupa os itens **por vendedor** e cria um pedido para cada um, com cópia histórica de carta, preço, condição, idioma, vendedor e endereço.
3. Para cada pedido, o backend cria uma `PaymentAttempt` `PENDING`, reserva a quantidade e chama `PaymentGateway.create`.
4. No Mercado Pago, isso é um `POST /v1/orders`, com:
   - `X-Idempotency-Key`: id da tentativa, para que um reenvio não duplique cobrança;
   - `external_reference`: id do pedido;
   - `total_amount` e `transactions.payments[0].amount` como texto com 2 casas;
   - `payment_method: { id: "pix", type: "bank_transfer" }`;
   - `payer.email` do comprador. No sandbox, `payer.first_name` define o cenário (ver seção 7).
5. A resposta vem com `status: action_required` / `waiting_transfer`, que mapeamos para `PENDING`, e os dados do Pix. O front mostra "Processando pagamento simulado...".
6. O Mercado Pago aprova o Pix de teste e envia um webhook do tópico `order`. O backend:
   1. valida o `x-signature` e responde `200` logo (o prazo é de 22 segundos, depois disso ele reenvia a cada 15 minutos);
   2. ignora notificações repetidas (deduplicação pelo id do recurso e pelo status já aplicado);
   3. consulta `GET /v1/orders/{id}`. O corpo do webhook é só um sinal, e a consulta é a fonte da verdade;
   4. aplica o resultado de forma idempotente: só sai de `PENDING` uma vez.
7. O front acompanha o resultado consultando o pedido (`GET /api/users/me/orders/{id}`) até sair de `PENDING`, e mostra aprovado, recusado ou parcial por pedido, como no handoff.

### Mapeamento de status

| Order do Mercado Pago (`status` / `status_detail`) | `PaymentStatus` | Efeito no domínio |
| --- | --- | --- |
| `created`, `processing`, `action_required` (`waiting_transfer`, `waiting_payment`) | `PENDING` | Reserva mantida |
| `processed` / `accredited` | `APPROVED` | Pedido confirmado; baixa `remainingQuantity` (e o anúncio vira `SOLD_OUT` se chegar a 0); remove os itens do carrinho |
| `failed` / `failed`, ou pagamento `rejected` | `REJECTED` | Libera a reserva; itens continuam no carrinho |
| `canceled` / `canceled` | `CANCELLED` | Libera a reserva |
| `canceled` / `expired`, ou `failed` / `expired` | `EXPIRED` | Libera a reserva |
| `refunded`, `charged_back` | Fora do escopo | Registrar em log; não tratar nesta etapa |

Os status de pagamento **não são status de anúncio**. O anúncio só muda quando a quantidade restante chega a zero (regra do handoff e da #61).

## 6. Configuração

Bloco novo no `application.yaml`, no mesmo estilo de `external-apis`:

```yaml
# Pagamento. "simulated" não acessa a rede; "mercadopago" usa o sandbox com credenciais de teste.
payment:
  provider: ${PAYMENT_PROVIDER:simulated}
  simulated:
    # Resultado padrão do simulador: approved, rejected ou pending.
    outcome: ${PAYMENT_SIMULATED_OUTCOME:approved}
  mercadopago:
    base-url: ${MP_BASE_URL:https://api.mercadopago.com}
    access-token: ${MP_ACCESS_TOKEN:}
    webhook-secret: ${MP_WEBHOOK_SECRET:}
    notification-url: ${MP_NOTIFICATION_URL:}
    timeout: ${MP_TIMEOUT:10s}
```

| Variável | Onde obter | Observação |
| --- | --- | --- |
| `MP_ACCESS_TOKEN` | Mercado Pago Developers → Suas integrações → aplicação → **Credenciais de teste** | O token de teste também começa com `APP_USR` (igual ao de produção), então o prefixo não serve para diferenciar. Usar **somente** o da conta vendedora de teste. |
| `MP_WEBHOOK_SECRET` | Suas integrações → **Webhooks → Configurar notificações** → assinatura secreta | Usado no HMAC do `x-signature`. |
| `MP_NOTIFICATION_URL` | HML: `https://tcc-market.duckdns.org/api/payments/webhooks/mercadopago` | Não aceita `localhost`. Localmente, usar túnel ou depender só da consulta. |
| `PAYMENT_PROVIDER` | — | `simulated` (padrão) ou `mercadopago`. |

As chaves ficam só no `.env` e nas variáveis do servidor, nunca no repositório. Se `provider=mercadopago` estiver sem `access-token`, a aplicação não sobe (falha rápida na inicialização), como já acontece com o CORS em HML.

O endpoint do webhook precisa ser **público** no `SecurityConfig`, porque o Mercado Pago não manda JWT. A proteção é a assinatura.

### Validação do webhook

O Mercado Pago envia `x-signature: ts=<timestamp>,v1=<hash>` e `x-request-id`. Para validar:

1. extrair `ts` e `v1`;
2. montar o manifesto `id:<data.id em minúsculas>;request-id:<x-request-id>;ts:<ts>;`, com `data.id` vindo da query string;
3. calcular o HMAC-SHA256 do manifesto com o `MP_WEBHOOK_SECRET`, em hexadecimal;
4. comparar com `v1` em tempo constante (`MessageDigest.isEqual`) e responder `401` se não bater;
5. opcionalmente, recusar `ts` muito antigo (tolerância de 5 minutos) para evitar replay.

Nunca registrar o segredo nem a assinatura completa em log.

## 7. Estratégia de teste

### Testes automatizados (CI, sem rede)

- `SimulatedPaymentGateway` com o resultado configurável cobre aprovado, recusado e pendente nos testes de serviço.
- `MercadoPagoPaymentGateway` testado com `MockRestServiceServer` (ou WireMock), usando respostas reais da documentação: criação com `action_required`, consulta com `processed`/`accredited`, `failed`, `429` e timeout.
- Validador do `x-signature` com vetores conhecidos: assinatura válida, segredo errado, cabeçalho ausente ou malformado.
- Idempotência: o mesmo webhook aplicado duas vezes baixa a quantidade só uma vez; a mesma chave de checkout não cria pedido duplicado.

### Testes manuais no sandbox

Pré-requisitos: conta no Mercado Pago Developers, uma aplicação criada (a conta vendedora de teste é criada junto) e o **Access Token de teste**.

**Pix aprovado**, que é o fluxo principal e não precisa de cartão:

```bash
curl -s -X POST https://api.mercadopago.com/v1/orders \
  -H "Authorization: Bearer $MP_ACCESS_TOKEN" \
  -H "X-Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "online",
    "external_reference": "spike-67-pix",
    "total_amount": "45.00",
    "payer": { "email": "test@testuser.com", "first_name": "APRO" },
    "transactions": { "payments": [ {
      "amount": "45.00",
      "payment_method": { "id": "pix", "type": "bank_transfer" }
    } ] }
  }'
# Resposta esperada: status "action_required" / "waiting_transfer".
# Alguns segundos depois:
curl -s https://api.mercadopago.com/v1/orders/<ID_DA_ORDER> \
  -H "Authorization: Bearer $MP_ACCESS_TOKEN"
# Esperado: status "processed" / "accredited".
```

**Cartão aprovado ou recusado**, para documentar a recusa. O resultado é definido pelo nome do titular:

| Titular | Resultado |
| --- | --- |
| `APRO` (CPF `12345678909`) | Aprovado |
| `OTHE` (CPF `12345678909`) | Recusado por erro geral |
| `CONT` | Pendente |
| `FUND` | Recusado por saldo insuficiente |
| `SECU` | Recusado por código de segurança inválido |
| `EXPI` | Recusado por problema na validade |

Cartões de teste: Visa `4235 6477 2802 5682`, Mastercard `5480 8328 0103 3311` e Elo débito `5067 7667 8388 8311`, todos com CVV `123` e validade `11/30`. Em uma integração com cartão, o token vem do Card Payment Brick no front. Como o protótipo não pede cartão, o cartão fica só para validar o comportamento de recusa no sandbox, não para o produto.

**Webhook**: em Suas integrações → Webhooks, cadastrar a URL de HML com o evento **Order** e usar o botão **Simular** do painel para conferir a resposta `200` e a validação da assinatura.

### Teste local de ponta a ponta

- Dia a dia: `PAYMENT_PROVIDER=simulated`, sem rede.
- Sandbox sem webhook: `PAYMENT_PROVIDER=mercadopago` e reconciliação por consulta; a tentativa sai de `PENDING` quando o job ou a tela consultam a order.
- Sandbox com webhook: `cloudflared tunnel --url http://localhost:8080` (ou ngrok) e a URL gerada em `MP_NOTIFICATION_URL`.

## 8. Garantia de que não há cobrança real

1. **Só credenciais de teste.** O projeto não tem nem documenta credencial de produção. A conta é a vendedora de teste criada com a aplicação, que não movimenta dinheiro.
2. **Bloqueio por `live_mode`.** Notificações e respostas com `live_mode: true` são rejeitadas e registradas como erro de configuração.
3. **Sem dados de cartão reais.** A tela não pede cartão (Pix simulado), e nos testes manuais só se usam os cartões de teste oficiais.
4. **Simulador por padrão.** Sem configuração explícita, a aplicação usa `simulated` e nem acessa a rede.
5. **Comunicação da interface.** O texto "Pagamento simulado. Nenhum valor será cobrado." continua na revisão, como no handoff.

## 9. Tratamento de falhas

| Situação | Comportamento |
| --- | --- |
| Pagamento recusado | Tentativa `REJECTED`; reserva liberada; itens continuam no carrinho. "Tentar novamente" cria **nova** tentativa com nova chave de idempotência, revalidando preço e disponibilidade. |
| Resultado parcial (vários vendedores) | Cada pedido tem seu status. Repetir só os recusados; nunca reprocessar o aprovado. |
| Timeout ou erro de rede ao criar | Tentativa fica `PENDING` (o pagamento pode ter sido criado). Reconciliar consultando pela tentativa; reenviar com a **mesma** `X-Idempotency-Key` é seguro. |
| `429 Too Many Requests` | Respeitar `Retry-After`; responder ao comprador que o pagamento está em processamento. |
| Gateway fora do ar (5xx) | Erro tratado no `GlobalExceptionHandler` (`503`), com mensagem amigável. Catálogo, coleção e anúncios continuam funcionando (RNF06). |
| Webhook não chega | Job de reconciliação (por exemplo, a cada 5 minutos) consulta tentativas `PENDING` antigas; a tela também consulta enquanto o comprador espera. |
| Webhook repetido ou fora de ordem | Aplicação idempotente: só a transição a partir de `PENDING` produz efeito; status final não volta atrás. |
| Pix não pago a tempo | A order expira (`expired`); tentativa `EXPIRED`, reserva liberada. |
| Assinatura inválida | `401`, sem processar e sem detalhar o motivo na resposta. |

## 10. Riscos e limitações

- **Prefixo igual entre teste e produção** (`APP_USR`): o risco de usar a credencial errada é mitigado pela checagem de `live_mode` e por não haver credencial de produção no projeto.
- **Webhook exige URL pública**: localmente depende de túnel; em HML funciona direto. A reconciliação por consulta cobre a ausência do webhook.
- **Pix no sandbox só tem cenário de aprovação documentado** (`APRO`). A recusa é demonstrada com o simulador ou com cartão de teste.
- **Rate limit** na criação de orders: irrelevante para o volume do PI, mas tratado (`429`).
- **Contas de teste não podem ser apagadas** e o limite é de 15 simultâneas.
- **Dependência da #66**: a reserva durante o pagamento, a liberação na recusa e a baixa na aprovação precisam da regra de quantidade comprometida.
- **Sandbox pode mudar**: a documentação foi atualizada várias vezes (a API de Orders substituiu a de Payments no Checkout Transparente). Revalidar os passos da seção 7 antes da implementação.
- **Fora do escopo**: reembolso, estorno (chargeback), split de pagamento entre vendedores (*marketplace*) e frete.

## 11. Próximos passos de implementação

1. Criar `PaymentStatus`, `PaymentAttempt` e a interface `PaymentGateway`, com o `SimulatedPaymentGateway` como padrão.
2. Integrar o checkout (pedido por vendedor) com a reserva da #66.
3. Implementar o `MercadoPagoPaymentGateway` (Pix) com `RestClient` e testes com `MockRestServiceServer`.
4. Criar o endpoint público do webhook, com validação do `x-signature`, e o job de reconciliação.
5. Configurar as variáveis em HML e cadastrar o webhook no painel do Mercado Pago.
6. Adicionar as requisições ao Insomnia.

## Referências

- Mercado Pago — [Checkout Transparente via Orders: modelo de integração](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-model)
- Mercado Pago — [Integração com Pix](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix)
- Mercado Pago — [Compra de teste com Pix](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix)
- Mercado Pago — [Compra de teste com cartões](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/cards)
- Mercado Pago — [Contas de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/resources/test-accounts)
- Mercado Pago — [Status da order](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-management/status/order-status)
- Mercado Pago — [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- Mercado Pago — [SDK Java](https://github.com/mercadopago/sdk-java)
- Stripe — [Testes](https://docs.stripe.com/testing) e [Webhooks](https://docs.stripe.com/webhooks)
