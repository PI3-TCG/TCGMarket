# TCGMarket — Design System v2.2 | Contrato visual

> **Versão:** 2.2 · **Escopo:** DS-01 · **Data da consolidação:** 23/11/2026  
> **Estado:** contrato técnico consolidado, **aguardando ratificação formal do PO/equipe** sobre marca, domínio e eventuais decisões pendentes da [#237](https://github.com/PI3-TCG/TCGMarket/issues/237).  
> **Base:** `TCGMARKET_DESIGN_SYSTEM_V2_2_COMPLETO.md` (v2.2), mockup de referência do projeto e tokens efetivamente presentes em `frontend/src/index.css`.

## 1. Autoridade e precedência

Este documento é a **referência de implementação proposta para a v2.2**. Ele descreve o padrão aplicado nas tarefas em curso, mas não substitui a aprovação de identidade ou marca por uma pessoa autorizada.

| Prioridade | Fonte | Finalidade |
|---|---|---|
| 1 | Decisões expressamente aprovadas e registradas pela equipe/PO, inclusive atas/comentários e PRs correspondentes | Marca, experiência e exceções de produto |
| 2 | Este documento + `COMPONENT_PATTERNS_V2.md` + `IMPLEMENTATION_ROADMAP_V2.md`, **após aprovação** | Contrato v2.2 para novas implementações |
| 3 | Mockup de referência aprovado | Geometria, proporções, aplicação de cores, molduras e ornamentos |
| 4 | `frontend/src/index.css` (`@theme`) e `frontend/src/assets/design-system/` | **Fonte executável dos valores e dos arquivos**; diferenças exigem correção planejada, não cópias paralelas |
| 5 | `TCGMARKET_DESIGN_SYSTEM_V2_2_COMPLETO.md` | Fonte consolidada de requisitos, detalhes e histórico da revisão 2.2 |
| Histórico | `Visual Guide V1.md`, `Component - ... Referência V1.md` e `LAYOUT_GUIDELINES_V2.md` (V2.1) | Padrões anteriores e decisões históricas; não prevalecem sobre as regras v2.2 aprovadas |

**Na ausência de aprovação para uma mudança funcional:** manter o comportamento atual, registrar a pendência e não presumir que o mockup autoriza uma alteração de fluxo.

## 2. Decisões e pendências de produto — #237

| Assunto | Estado documentado em 23/11/2026 | Regra até aprovação formal |
|---|---|---|
| Nome e identidade | A marca gráfica apresentada é **TCGMARKET**; o projeto também possui referências históricas a **TCC Market** e `TCC — Trading Card Change` | Usar a denominação da UI atual nas telas existentes; **não declarar registro de marca ou domínio aprovado** |
| Logotipo | Navbar e Footer usam o arquivo `frontend/src/assets/design-system/logo-dourada.svg` na versão consultada; a nova marca está em processo de consolidação vetorial | Uma única versão visual por release; alteração da logo deve ser revisada em navbar, footer, login, favicon e metadados |
| Header sticky | O `SiteHeader` atual usa `position: relative`, não sticky | **Preservar o comportamento atual**; ativar sticky somente após decisão aprovada e teste de overlay, `scroll-margin-top` e tab bar |
| Busca global Ctrl+K | O atalho Ctrl+K (ou Cmd+K) funciona no `SiteHeader` atual, sem dica textual visível | **Preservar o atalho** até deliberação; decidir separadamente se mantém a funcionalidade e se exibe a dica |
| Domínio/marca | A #237 foi fechada, mas os campos de avaliação de conflito de marca e aprovação do PO não constam como concluídos | Não afirmar titularidade, disponibilidade ou ausência de conflitos sem evidência externa e validação do responsável |

**Deliberação pendente:** PO/equipe registrar explicitamente o nome exibido, a marca vigente, a política do Ctrl+K, sticky e o destino de domínio; registrar link e data no PR da DS-01.

## 3. Paleta — resolução da divergência

O **Visual Guide V1/V2.1** descrevia o fundo frio `#FAFBFE`; o ZIP antigo usava `#F8E9E0` e roxo `#310D34`. A **revisão v2.2** e o `@theme` atual utilizam o fundo pergaminho `#F7E9E0` e roxo profundo `#310B43`.

**Fonte recomendada para novas telas v2.2: `frontend/src/index.css`.** As cores antigas permanecem apenas em componentes legados até a migração. Não reintroduzir um `tokens.css` antigo ou uma segunda árvore de tokens.

| Semântica | Token de Tailwind v4 | Valor v2.2 | Uso |
|---|---|---|---|
| Fundo geral | `--color-surface-canvas` | `#F7E9E0` | Pergaminho com textura sutil |
| Painel/card/formulário | `--color-surface-default` | `#FAF1E7` | Superfície creme |
| Campo | `--color-surface-input` | `#F9F8F9` | Inputs e selects |
| Superfície discreta | `--color-surface-subtle` | `#ECE1D9` | Chips e hover leve |
| Marca/CTA | `--color-brand-primary` | `#660366` | Ação principal |
| Hover CTA | `--color-brand-primary-hover` | `#4F024F` | Interação |
| Plum profundo | `--color-brand-deep` | `#310B43` | Header, footer, hero |
| Texto principal | `--color-text-ink` | `#1A1216` | Nome/título |
| Texto secundário | `--color-text-secondary` | `#5F565B` | Apoio |
| Preço | `--color-text-price` | `#3A0A38` | Valores |
| Borda padrão | `--color-border-default` | `#E7DDD3` | Superfícies claras |
| Dourado ornamental | `--color-accent-gold` | `#E0A100` | Losangos e ornamentos, **não** texto pequeno |
| Dourado de moldura | `--color-accent-gold-frame` | `#E9A150` | Filetes |
| Bronze | `--color-accent-bronze` | `#B08252` | Filete interno |
| Dourado legível | `--color-accent-gold-deep` | `#8A5A12` | Texto, **após** conferir contraste no fundo real |
| Foco e link auxiliar | `--color-support-blue` | `#0969D7` | Estados funcionais |
| Sucesso / alerta / erro | `--color-state-*` | `#15803D` / `#B45309` / `#B91C1C` | Semântica, sempre com texto/ícone |

**Validação de contraste (WCAG 2.2 AA):** texto comum **≥ 4,5:1**; texto grande e ícones gráficos essenciais **≥ 3:1**; medir no fundo real, inclusive no gradiente. `#E0A100` sobre creme não é tinta de texto. Ver medições e origens na §2.1 do consolidado v2.2.

## 4. Tipografia, formas e espaçamento

| Papel | Família / padrão |
|---|---|
| Hero e H1/H2 temáticos | Cinzel 600–700; maiúsculas somente em títulos apropriados |
| Títulos de detalhe e modais | Crimson Text 700 |
| Corpo, navegação, controles e preço funcional | Plus Jakarta Sans; preço em 700 |
| Escala de espaçamento | Base de 4 px; preferir `4, 8, 12, 16, 24, 32, 48, 64` |
| Controle | Raio de 8 px; altura ~40 px; alvo de toque preferencial 44×44 px |
| Card | Raio 12 px, borda creme/bege, sombra discreta |
| Banner e modal | Raio 16 px; respeitar conteúdo e foco |
| Contêiner amplo | Máximo 1600 px (não largura fixa) |
| Contêiner de leitura/transação | ~1400 px quando apropriado |

Não aplicar Cinzel no texto corrido. Priorizar leitura, teclado, zoom de 200% e redução de movimento.

## 5. Matriz normativa de ornamentação

| Contexto | Intensidade | Regra |
|---|---|---|
| Navbar e Footer | Contextual | Plum profundo, filete dourado fino; marca consistente; sem ornamento sobre a busca |
| Hero da Home | Forte | Moldura dourada, cantos, arte/overlay e gradiente plum; texto acessível |
| Banner de página | Contextual | Imagem/overlay com breadcrumb e H1 em Cinzel; moldura só quando indicada pelo mockup |
| Título de seção | Contextual | Linhas + `linha-losango.svg`, quando presentes na referência |
| Faixa de valores Home | Contextual | Ícones dourados: compra, catálogo, comunidade, coleção |
| Painel de filtros | Forte | `GoldFrame` com cantos, sem comprometer controles |
| Modal de detalhe | Forte | Overlay escuro e moldura com cantos; foco/teclado acima da decoração |
| Painel de resumo do pedido | Contextual | Moldura simples se corresponder à referência aprovada |
| Card de anúncio, catálogo ou coleção | Leve | Borda bege, fundo creme, sem moldura dourada individual |
| Formulários, checkout e itens de carrinho | Leve | Superfície creme, sem ornamentos próprios |
| Tabelas, botões, inputs, badges, chips, listas, admin | Funcional | Sem ornamento próprio; áreas administrativas priorizam densidade e clareza |
| Barra inferior mobile | Contextual | Plum, ícone ativo dourado, safe area, sem cobrir conteúdo |

**Imagem de referência não é dado real.** Não exibir cartas, avaliações, preços, números de vendas ou arte sem licença como se fossem dados de produção.

## 6. Matriz de telas de referência

| Tela | Fonte do projeto | Elementos a comparar em captura |
|---|---|---|
| Home | `frontend/src/pages/HomePage.tsx` | Hero, três jogos, faixa de valores, no máximo oito anúncios, seções informativas |
| Marketplace | `frontend/src/pages/MarketplacePage.tsx` | Banner, filtros, grid, badges, preço, estados vazios |
| Catálogo | `frontend/src/pages/CatalogPage.tsx` | Busca, filtros, carta vertical, paginação, detalhe em página |
| Detalhe/modal | `frontend/src/components/ui/Modal.tsx` e modais especializados | Overlay, foco, moldura, Escape, não empilhar modais |
| Carrinho e checkout | `frontend/src/pages/CartPage.tsx`, `DeliveryPage.tsx`, `ReviewPage.tsx` | Stepper, resumo, formulários, responsividade |
| Mobile | Header/Footer/`MobileBottomNavigation.tsx` | Busca sem corte, tab bar com cinco destinos, touch targets e safe area |

**Viewports mínimas de aceite:** 320, 390, 768, 1024, 1440 e 1600 px. Anexar comparativos nas PRs de implementação; aceitar desvio apenas quando motivado e registrado.

## 7. Limites de produto

- Somente **Pokémon, Yu-Gi-Oh! e Magic: The Gathering** nos destinos suportados. Não introduzir Digimon/One Piece por causa de mockups.
- Home: máximo **8 anúncios**, grade desktop preferencial **4×2**. O código atual declara `HOME_AD_LIMIT = 8`.
- Manter a ordem **hero → categorias → anúncios → Como funciona → Guia de condição** (com faixa de valores após o hero quando aplicada na DS-13).
- Não inventar avaliações, reputação, vendas, saldos, preços nem recomendações. Funcionalidades de favoritos/avaliações/contagem de vendas são demandas independentes (FN-01 a FN-03) e só aparecem com suporte real.
- Não modificar autenticação, rotas, endpoints, pagamentos ou transações apenas para imitar uma imagem.
- O título “Anúncios em destaque” exige um critério real de destaque; ordenar por preço maior não é equivalente.

## 8. Responsividade e critérios de fidelidade

A implementação será considerada fiel quando, nos mesmos viewports e estados, houver correspondência verificável de: paleta, proporções, tipografia, molduras e ornamentos, distribuição das ações e comportamento de menus. Mudanças que melhorem acessibilidade não podem ocultar ações ou quebrar fluxos.

- Sem overflow horizontal inesperado em 320–1600 px.
- Títulos e CTAs legíveis em zoom de 200%.
- Teclado: foco visível; Tab, Enter/Espaço e Escape quando aplicáveis; `aria-expanded`, `aria-controls`, `aria-current` coerentes.
- Modal: foco inicial, retenção/retorno de foco, Escape e rolagem testados.
- Imagens de carta não distorcidas (`object-fit: contain`; recipiente próximo de 5:7).
- Sem links fictícios de redes sociais; exibir somente URLs reais HTTPS.
- Textos e elementos críticos não dependem apenas de cor.
- Cada PR visual deve registrar capturas desktop/mobile e regressões testadas.

## 9. Controle de aprovação

- [ ] Nome da marca e política de logo aprovados explicitamente pelo PO/equipe.
- [ ] Atalho Ctrl+K: comportamento e indicação visual aprovados separadamente.
- [ ] Header sticky ou não-sticky ratificado.
- [ ] Domínio e avaliação de possíveis conflitos de marca tratados pelo responsável.
- [ ] Paleta pergaminho v2.2 e matriz de ornamentação ratificadas.
- [ ] Telas de referência e aceite responsivo ratificados.

> **Atenção:** este checklist não pode ser marcado apenas porque a issue #237 está fechada. Anexar link para decisão/ata/PR e data da aprovação.
