<html>
<body>
<!--StartFragment--><html><head></head><body><h1>Spike — Integração com Métodos de Pagamento</h1><h2>Objetivo</h2><p>Avaliar opções de APIs de pagamento que possam ser utilizadas no PI, considerando principalmente:</p><ul><li><p>Facilidade de integração;</p></li><li><p>Suporte a diferentes tecnologias de backend;</p></li><li><p>Disponibilidade de ambiente de testes;</p></li><li><p>Possibilidade de simular pagamentos sem movimentação financeira real;</p></li><li><p>Documentação e facilidade de uso.</p></li></ul><hr>
## Opções avaliadas

Existem diversas plataformas de pagamento disponíveis no mercado brasileiro. Entre as principais opções consideradas estão:

| Plataforma | Pix | Cartão | Boleto | Ambiente de teste | Observação |
| --- | :---: | :---: | :---: | :---: | --- |
| **Mercado Pago** | ✅ | ✅ | ✅ | ✅ | Ecossistema consolidado e boa documentação |
| **Pagar.me** | ✅ | ✅ | ✅ | ✅ | Muito utilizado em e-commerce e marketplaces |
| **PagBank** | ✅ | ✅ | ✅ | ✅ | Plataforma brasileira com diversos meios de pagamento |
| **Asaas** | ✅ | ✅ | ✅ | ✅ | Forte em cobranças e recorrência |
| **Efí Bank** | ✅ | ✅ | ✅ | ✅ | Boa opção para Pix e boleto |
| **AbacatePay** | ✅ | ✅ | — | ✅ | API com proposta simplificada e focada em desenvolvedores |
| **Stripe** | ✅* | ✅ | ✅ | ✅ | Plataforma internacional com excelente experiência para desenvolvedores |

> **Nota:** Algumas funcionalidades podem depender do produto contratado, região ou configuração da conta.</blockquote><p>Para o contexto do PI, o <strong>Mercado Pago</strong> se mostrou uma alternativa interessante principalmente pela disponibilidade de ferramentas de teste, documentação e suporte a diferentes stacks.</p><hr><h2>Mercado Pago</h2><p>O Mercado Pago disponibiliza APIs e SDKs que permitem integrar pagamentos diretamente a uma aplicação.</p><p>A integração pode contemplar diferentes formas de pagamento, como:</p><ul><li><p>Cartão de crédito;</p></li><li><p>Pix;</p></li><li><p>Boleto;</p></li><li><p>Checkout hospedado;</p></li><li><p>Checkout integrado à aplicação.</p></li></ul><p>Além disso, a plataforma possui SDKs para diferentes linguagens, incluindo <strong>Java</strong>, o que permite utilizar a solução caso o backend do projeto seja desenvolvido, por exemplo, com <strong>Spring Boot</strong>.</p><p>Também é possível realizar a integração diretamente através da API REST, evitando que a escolha do gateway determine a tecnologia utilizada no backend.</p><p>Exemplos de arquiteturas possíveis:</p><pre><code class="language-text">React
  ↓
Spring Boot
  ↓
Mercado Pago
</code></pre><p>ou:</p><pre><code class="language-text">React
  ↓
NestJS
  ↓
Mercado Pago
</code></pre><hr><h2>Ambiente de testes</h2><p>Um dos principais pontos para utilização no PI é a possibilidade de trabalhar com um <strong>ambiente de testes</strong>, sem necessidade de realizar pagamentos reais.</p><p>O Mercado Pago disponibiliza credenciais de teste que permitem desenvolver e validar a integração antes de utilizar credenciais de produção.</p><p>Com isso, podemos simular o fluxo completo de uma compra:</p><pre><code class="language-text">Usuário adiciona produtos ao carrinho
        ↓
Finaliza o pedido
        ↓
Backend cria o pagamento
        ↓
Mercado Pago processa a simulação
        ↓
Webhook informa o resultado
        ↓
Backend atualiza o pedido
</code></pre><p>Podemos trabalhar com diferentes estados do pagamento, por exemplo:</p><pre><code class="language-text">PENDING
   ↓
APPROVED

ou

PENDING
   ↓
REJECTED
</code></pre><p>Isso permite demonstrar no PI não apenas uma interface de checkout, mas uma integração real com uma API externa e o tratamento do ciclo de vida de um pagamento.</p><hr><h2>Conclusão da Spike</h2><p>Para o PI, a proposta inicial é utilizar o <strong>Mercado Pago em ambiente de testes</strong>.</p><p>A escolha não limita a tecnologia utilizada no backend, já que a integração pode ser realizada por API REST e também existem SDKs para diferentes linguagens, incluindo Java.</p><p>O ambiente de testes também permite demonstrar pagamentos e seus diferentes estados sem movimentar dinheiro real, tornando a solução adequada para desenvolvimento e apresentação acadêmica.</p><h3>Referências</h3><ul><li><p>Mercado Pago Developers — documentação geral</p></li><li><p>Mercado Pago — credenciais e ambiente de testes</p></li><li><p>Mercado Pago — SDK Java</p></li><li><p>Documentações oficiais das plataformas Pagar.me, PagBank, Asaas, Efí Bank, AbacatePay e Stripe</p></li></ul></body></html><!--EndFragment-->
</body>
</html>