# Relatório da issue #95 — Consistência visual da aplicação

Revisão de 18/11/2026 com HEAD em `59453dc`. A issue #95 está aberta. A leitura foi estática no código, sem alteração de tela e sem passagem no navegador.

**M1 (Gerenciar Coleção):** login, cadastro, home, catálogo, detalhes da carta, Minha Coleção, perfil e área administrativa.

**M2 (Marketplace):** marketplace, criação e gestão de anúncios, carrinho, entrega, revisão, resultado da compra, propostas de troca e histórico.

Contraste e foco inacessível já estão na [#94](task-94-revisar-acessibilidade-dos-principais-fluxos.md). Aqui o critério é o mesmo controle parecer o mesmo em todo o produto.

## O que já atende

`Button`, `Input`, `Select`, `Badge`, `Card` e `Alert` existem e os tokens de cor, `radius-control` (8px) e `radius-surface` (12px) estão em `frontend/src/index.css`. O `PageBanner` é o mesmo no catálogo, na coleção, no marketplace, nos anúncios, no carrinho e no histórico. Vários modais de M2 já usam `Modal` com `presentation="refined"` e a camada `modalTheme`.

## Achados

### Alta

1. **Três botões para a mesma ação.** O `Button` do design system tem 40px, raio 8px e cinco variantes. Login e cadastro desenham o envio à mão: `h-12` e `rounded-xl`. Histórico, propostas e vários estados vazios usam `min-h-11` e `rounded-lg` ou `rounded-full`, com foco em `outline` em vez do anel do `Button`. Os modais de carta, coleção, anúncio e descarte usam `modalPrimaryButton`: gradiente azul, `rounded-xl` e `py-3`. O rodapé do `Modal` compartilhado, quando recebe `primaryAction`, ainda renderiza o `Button` roxo. Unificar: ação de página no `Button`; ação de modal em um único conjunto, o do `modalTheme` ou o `Button`, nos dois casos sem medida nova.

2. **Três shells de modal.** `Modal` clássico é superfície branca de raio 12px. `Modal` refinado é raio 22px, cabeçalho em gradiente e divisória dourada. Detalhe da carta, posse na coleção, meus anúncios e descarte de anúncio recriam o portal com raio 21px ou 23px e as classes do `modalTheme` copiadas. Passar esses fluxos para `Modal` refinado e apagar o portal duplicado. A auditoria em `docs/design-system/Auditoria-e-Correcoes.md` já escolheu o shell refinado.

3. **O card de carta muda de família entre M1 e M2.** Catálogo usa `Card`, proporção 4/5 e fundo `neutral-50`. Coleção usa `Card`, mas a imagem é uma faixa `h-36` em `primary-100` e as ações são uma grade de ícones com rótulo de 10px. Marketplace não usa `Card`: o artigo é `rounded-xl`, a imagem é 4/5 em `neutral-100` e os status são `span` soltos. Meus anúncios voltam ao `Card`, com miniatura horizontal de 112×80. Usar `Card` nesses quatro e a mesma área de imagem (4/5, `object-contain`, fundo neutro). Status só pelo `Badge`.

4. **O `Badge` do código não segue a referência V1, e as telas também não o usam.** A referência pede cápsula suave: primary `#F0E3F0`/`#660366`, secondary `#E4F1FF`/`#0969D7`, raio total, 12px, peso 600. No componente, venda é roxo sólido com texto branco e troca é azul sólido com texto branco. No marketplace, venda é cápsula sólida e troca é o par suave `secondary-100`/`info-700`. Na coleção e em meus anúncios há outras cápsulas avulsas. Ajustar as variantes do `Badge` à referência e substituir os `span` de status.

5. **Filtros da mesma função têm três medidas.** Coleção chega perto do `Input`: `h-10`, `rounded-control`, anel `secondary-500`. Marketplace usa `min-h-11`, `rounded-lg`, borda `primary-300/40` e foco em `outline`. Catálogo usa `rounded-lg`, `py-3`, borda `#e1def5` e anel `primary-100`. Login e cadastro repetem o campo alto com `rounded-xl`. Meus anúncios misturam `min-h-11` com `rounded-control`. Trocar esses campos por `Input` e `Select`.

### Média

6. **A largura da página muda no meio do fluxo de compra.** Catálogo, coleção, marketplace, meus anúncios, criar anúncio e home limitam a 1600px. Carrinho, entrega, revisão, resultado, histórico, detalhe do anúncio, propostas e perfil público limitam a 1400px. A área administrativa usa `max-w-6xl` (1152px). Levar o fluxo de transação para 1600px, como o guia de layout já pede para as páginas principais. A administração pode permanecer mais estreita se ficar registrado como exceção.

7. **O título do card não usa a mesma fonte.** Catálogo e coleção usam `font-display`. O título do anúncio no marketplace usa a fonte de interface. O preço, ao contrário, usa `font-display` no marketplace e some na coleção. Título da carta em `font-display`; preço, quando existir, também.

8. **Estado sem imagem não é o mesmo.** O catálogo mostra o emoji 🃏. Coleção, marketplace e meus anúncios usam o `Icon`. Usar o `Icon` também no catálogo.

9. **Abas de filtro não são um componente.** Histórico: aba selecionada roxa sólida, raio herdado de `tabBase`. Propostas: `rounded-full` e `min-h-11`. Não criar um terceiro desenho. Um controle de aba, com o estado selecionado em peso e preenchimento, reutilizado nos dois.

10. **Cores de marca fora do token.** `PageBanner` e o cabeçalho do perfil usam `#130b30` e `#FCD203`. O detalhe da carta e o formulário de endereço espalham dezenas de hex (`#29123E`, `#DCCAE7`, `#174D8E` e outros) que não existem em `index.css`. O banner compartilhado pode virar token. Texto e borda de modal devem usar `neutral`, `primary` e `secondary`.

## Orientação para os componentes

- `Button`: altura 40px, raio 8px, padding horizontal 16px, texto 14px, peso 600, anel `secondary-500` com offset. Primary roxo, secondary azul, outline e ghost com texto roxo, danger vermelho. Sem `h-12`, `min-h-11`, `rounded-xl` ou `rounded-full` em ação.
- Ação dentro de modal: uma classe só. Se o shell refinado continuar valendo, `modalPrimaryButton`, `modalSecondaryButton` e `modalDangerButton` passam a ser a ação oficial do modal, e o rodapé do `Modal` deixa de renderizar o `Button` por baixo.
- `Input` e `Select`: altura 40px, raio 8px, borda `neutral-200`, foco com borda `primary-900` e anel `secondary-500`. Placeholder `neutral-500`.
- `Card`: raio 12px, borda `neutral-200`, sombra `shadow-sm`, hover com borda `primary-900`.
- `Badge`: só as variantes suaves da referência V1. Venda, troca, condição, raridade e status de anúncio passam por ele.
- `Modal`: um portal. Fluxos de carta, coleção, anúncio e descarte entram em `presentation="refined"`.

## Protótipos

Não redesenhar os fluxos. No design system e nos protótipos de login, catálogo, coleção, marketplace e modal, alinhar o controle a 40px e raio 8px, o card a uma única área de imagem e o badge à cápsula suave. O shell de modal refinado da auditoria permanece; o que muda no protótipo é o botão de ação, que hoje aparece roxo numa tela e azul em degradê na outra.

## Validação e situação do aceite

M1 e M2 foram lidos no código. Componentes fora do design system, uso incorreto do `Badge` e dos tokens, e os ajustes de maior impacto estão listados acima, com orientação para implementar. Não houve build nem verificação no navegador: raio, altura, fonte e cor foram lidos nas classes.

[Issue #95 no GitHub](https://github.com/PI3-TCG/TCGMarket/issues/95)
