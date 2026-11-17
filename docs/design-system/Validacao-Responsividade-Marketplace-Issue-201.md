# Issue #201 — Responsividade dos fluxos do Marketplace

## Implementação

- Marketplace e Meus anúncios exibem um botão de filtros abaixo de 1024 px. O painel mantém o formulário montado para preservar rascunho e filtros aplicados. Escape e o botão de fechamento devolvem o foco ao controle de abertura.
- A grade do Marketplace usa a largura disponível na área de resultados. Os cards distribuem as colunas com largura mínima de 10,5 rem quando há espaço e mantêm o link de detalhes com área de toque de 44 px.
- Textos longos, totais, listas e ações se acomodam à largura disponível em anúncios, carrinho, entrega, revisão, resultado, trocas e histórico. Os modais usam rolagem do painel inteiro em telas baixas para manter conteúdo e ações acessíveis.
- Em navegadores que aceitam `interactive-widget=resizes-content`, o teclado virtual pode reduzir a área de layout para que os modais se ajustem à altura restante.

## Validação em Chromium

Verificação automatizada com Playwright e respostas simuladas da API. Os casos incluem títulos sem espaços, preços longos, 16 anúncios no Marketplace, 12 anúncios próprios, 12 propostas e 12 transações no histórico. A largura de 320 px também foi testada com altura de 330 px nos fluxos de troca, compra e edição de anúncio.

| Rota ou fluxo | 320 px | 390 px | 768 px | 1023 px | 1024 px | 1440 px |
| --- | --- | --- | --- | --- | --- | --- |
| `/marketplace` | 1 coluna | 1 coluna | 3 colunas | 5 colunas | 3 colunas | 5 colunas |
| `/meus-anuncios` | OK | OK | OK | OK | OK | OK |
| `/marketplace/anuncios/:id` | OK | OK | OK | OK | OK | OK |
| `/anuncios/novo` e formulário com carta selecionada | OK | OK | OK | OK | OK | OK |
| `/carrinho`, `/carrinho/entrega`, `/carrinho/revisao`, `/carrinho/resultado/:id` | Fluxo OK | Fluxo OK | Fluxo OK | Rotas OK | Fluxo OK | Fluxo OK |
| `/perfil/propostas` | OK | OK | OK | Vazio OK | OK | OK |
| `/perfil/historico` | OK | OK | OK | Vazio OK | OK | OK |
| Seleção de carta até confirmação de proposta | Fluxo OK | Fluxo OK | Fluxo OK | — | Fluxo OK | Fluxo OK |

OK indica que a rota ou fluxo testado permaneceu dentro da largura da página. Nos fluxos de compra e troca, as ações de navegação e confirmação chegaram às respectivas telas de sucesso. A largura de 1023 px foi usada para comparar o layout imediatamente anterior à entrada da barra lateral.

- Marketplace e Meus anúncios foram verificados em estados vazios e de erro nas cinco larguras de referência.
- A 390 px, os dois painéis foram abertos por teclado, aplicaram e limparam filtros, fecharam com Escape e com toque e mantiveram o valor ao fechar e reabrir.
- `npm run lint` e `npm run build` passaram no checkout que inclui as correções anteriores de lint.
- A redução de altura foi simulada. A validação com teclado virtual nativo em aparelhos físicos e com serviços reais permanece pendente.

[Issue #201](https://github.com/PI3-TCG/TCGMarket/issues/201) · [Issue #92](https://github.com/PI3-TCG/TCGMarket/issues/92)
