# Relatório da issue #94 — Acessibilidade dos principais fluxos

Revisão de 14/11/2026 sobre o checkout local com HEAD em `8b57bee`. A issue #94 está aberta. Foram examinados login, cadastro, catálogo, Minha Coleção, marketplace, compra, troca e perfil. A revisão foi estática, com contraste calculado contra WCAG AA (4,5:1 para texto normal), e não incluiu mudanças na aplicação nem passagem no navegador.

## O que já atende

`Input`, `Button` e `Alert` de erro já expõem estado inválido, anel de foco e `role="alert"`. O modal compartilhado prende o foco e fecha com Escape. O formulário de endereço leva o foco ao primeiro campo inválido. Cartas do catálogo e anúncios do marketplace têm nome acessível e foco visível. As ações da coleção usam `aria-label`.

## Achados

### Alta

1. **Alertas de aviso falham contraste.** `warning-700` (`#d97706`) sobre `warning-50` (`#fff6e8`) fica em 2,97:1. O alerta aparece no carrinho, na revisão do pedido, na entrega, no resultado do checkout e na proposta de troca. Escurecer o texto do aviso para um marrom com contraste de pelo menos 4,5:1 e manter ícone e título, que já existem.

2. **Login e cadastro não ligam o erro ao campo e escondem o foco de vários controles.** O campo recebe `aria-invalid`, mas a mensagem não tem `aria-describedby`. Depois do envio inválido, o foco permanece no botão. Mostrar/ocultar senha, “Esqueceu sua senha?”, “Criar conta gratuita”, “Entrar” e o logo que volta ao início não têm anel de foco. No cadastro, “Termos de uso” e “Política de privacidade” estão dentro do `<label>` do checkbox, então ativar o link também marca a caixa. A regra real da senha só aparece depois do erro, enquanto o placeholder cita só o mínimo de 6 caracteres.

3. **A navegação global não mostra foco.** O botão e os itens do menu do perfil não têm `focus-visible`, nem `aria-haspopup="menu"`, e o menu não fecha com Escape. Os chips de jogo não têm anel de foco nem `aria-current="page"`.

### Média

4. **O badge “Troca”** (`#1688f8` com texto branco) fica em 3,55:1 no anúncio do marketplace. O card da listagem já usa um par que passa: fundo `secondary-100` e texto `info-700` (5,85:1).

5. **Texto secundário abaixo de 4,5:1.** `primary-700` (`#996699`) em branco fica em 4,45:1 e, na aba inativa do modal da carta, em 3,70:1. `neutral-500` (`#74788a`) em branco fica em 4,38:1 e aparece em legendas, placeholders e metadados. `success-700` sobre `success-50` fica em 4,49:1, no limite.

6. **As abas do modal da carta** usam `aria-pressed` em botões soltos. O padrão esperado é `tablist`, `tab`, `aria-selected` e painel associado.

7. **Na troca, os botões de quantidade não têm anel de foco** e o rótulo é um `div`, não um `<label>`.

8. **Na coleção, o erro de edições e raridades** é `role="alert"` com a mesma cor do texto comum (`neutral-700`).

9. **No perfil, o erro de “TCGs que joga” e o erro geral de links** não estão ligados ao grupo. O campo de bio já faz essa associação.

10. **Avisos somem em 6 segundos** no login, no cadastro e no aviso de funcionalidade futura do header. Erro e bloqueio não devem se dispensar sozinhos.

## Critérios visuais para a implementação

- Texto normal com contraste de pelo menos 4,5:1. Texto grande e ícone essencial com pelo menos 3:1. Não usar `#d97706`, `#1688f8` ou `#996699` como cor de texto pequeno.
- Todo controle que recebe foco tem anel de 2px (`secondary-500`, ou branco no header roxo), com offset.
- Erro de formulário: texto visível, `aria-invalid` e `aria-describedby`. No envio inválido, o foco vai ao primeiro campo.
- O estado atual da navegação não depende só da cor: usar `aria-current` junto com peso ou sublinhado.
- Status de venda, troca, indisponível e aviso tem texto ou ícone, nunca só a cor. O badge sólido dourado com texto branco (`#e0a100`, 2,27:1) não deve entrar em fluxo real.

## Protótipos

Não redesenhar os fluxos. Ajustar no design system e nos protótipos de login, header e alertas o token de aviso, o badge de troca, o cinza do texto secundário, o anel de foco dos controles que hoje não têm e a mensagem de erro colada ao campo.

## Validação e situação do aceite

A revisão documenta os problemas prioritários e a orientação de correção. Não houve build de aplicação nem verificação no navegador: contraste, foco e teclado foram lidos no código. A correção fica na issue #97.

[Issue #94 no GitHub](https://github.com/PI3-TCG/TCGMarket/issues/94)
