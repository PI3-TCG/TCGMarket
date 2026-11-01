# TCG Market — Handoff técnico | Sistema de Modais v1.0

**Status:** especificação de design aprovada; **implementação e testes pendentes**  
**Objetivo:** unificar a apresentação e o comportamento dos modais e migrar **Detalhes do anúncio** da página atual para o novo padrão.  
**Referências:** `TCGMarket-Auditoria-Modais-e-Correcoes.md` e mockup aprovado `sistema_de_modais_tcg_market_em_roxo.png`.

> **Limite desta entrega:** as divergências visuais foram identificadas nos prints do projeto em execução. Esta entrega **não** representa análise linha a linha dos arquivos do repositório, alteração de código ou validação em diferentes dispositivos. As medidas abaixo são **propostas de implementação** a confirmar visualmente durante o refinamento, e não valores já existentes no frontend.

---

## 1. Decisão de produto

Estabelecer **um componente base reutilizável** de modal, com três tamanhos e variações de conteúdo, preservando a identidade do TCG Market.

- **Grande / leitura e detalhes:** catálogo, minha coleção, detalhe do anúncio, detalhe de proposta.
- **Médio / formulário:** criar/editar anúncio, editar coleção, propor troca.
- **Pequeno / confirmação:** remover item, cancelar anúncio, cancelar proposta.

Todos compartilham overlay, cabeçalho com gradiente, fechamento, áreas internas, bordas, sombras, espaçamento, estados de foco e lógica do rodapé. O conteúdo muda conforme o fluxo; a estrutura não.

### Fora do escopo deste handoff

Não redesenhar a home, o carrinho ou o checkout nesta subtarefa; esses fluxos deverão ser auditados na revisão responsiva geral. Não alterar as regras de negócio de anúncios, inventário ou trocas.

---

## 2. Diagnóstico e ações por tela

| Superfície observada | Problema visual/estrutural | Correção | Prioridade |
|---|---|---|---|
| **Detalhes da carta — catálogo** | Header roxo pesado, áreas internas rígidas e ação inferior pouco refinada | Aplicar variante **large/view**, gradiente, cards internos leves, footer padrão | Alta |
| **Detalhes da carta — coleção** | Parecida com catálogo, mas ainda sem unidade de contexto/ação | Reutilizar estrutura **large/view** com CTA específico de coleção | Alta |
| **Editar item da coleção** | Header quase sem identidade roxa; largura/altura e espaços pouco equilibrados | Variante **medium/form**, miniatura + resumo compacto, campos agrupados, footer persistente | Alta |
| **Remover item da coleção** | Usa composição grande demais para simples confirmação; hierarquia pesada | Variante **small/danger** com resumo breve, aviso e CTA destrutivo | Alta |
| **Detalhes do anúncio** | **É uma página, não um modal**; interrompe a navegação de exploração | Substituir a experiência por **large/view** sobre a listagem, preservando link direto e retorno | **Crítica** |

**Pontos visíveis nos prints:** ao rolar, os modais de detalhes mantêm cabeçalho e rodapé, enquanto formulários têm estrutura distinta; a solução é preservar essa característica útil, mas padronizar dimensões, hierarquia, estilo e comportamento de rolagem.

---

## 3. Tokens e medidas propostas

Utilizar os tokens existentes sempre que houver equivalentes. **Não duplicar variáveis** no CSS ou criar uma segunda identidade visual.

| Token | Valor de referência | Uso |
|---|---|---|
| `--modal-purple-main` | `#660366` | Destaque da marca, títulos/CTA |
| `--modal-purple-soft` | `#996699` | Acentos e gradiente, com contraste conferido |
| `--modal-neutral` | `#F2F2F2` | Fundo neutro |
| `--modal-ink` | `#1E1E1E` | Corpo de texto |
| `--modal-gold` | `#FCD203` | Pontos de ênfase; uso moderado |
| `--modal-surface` | `#FFFFFF` | Fundo dos conteúdos |
| `--modal-surface-soft` | `#F7F3FA` | Cards informativos e seções |
| `--modal-radius` | `20px` | Container |
| `--modal-inner-radius` | `12px` | Cards internos |
| `--modal-gap` | `8px` | Base de espaçamento: `8/16/24/32px` |
| `--modal-header-gradient` | `linear-gradient(115deg, #3C0B51 0%, #660366 58%, #7E358A 100%)` | Header, sempre com texto legível |

**Nota de acessibilidade:** não usar `#996699` como cor de fundo do texto branco pequeno sem validar contraste; prefira um roxo mais escuro no trecho do gradiente sob os títulos. A arte de referência possui brilhos decorativos que não devem comprometer legibilidade.

### Dimensões sugeridas para validação

| Variante | Largura desktop | Altura | Composição |
|---|---|---|---|
| `sm` | `min(440px, calc(100vw - 32px))` | Conteúdo; limite `90dvh` | Confirmação compacta |
| `md` | `min(720px, calc(100vw - 48px))` | Limite `90dvh` | Formulário ou resumo + formulário |
| `lg` | `min(960px, calc(100vw - 48px))` | Limite `90dvh` | Duas colunas quando houver espaço |

Usar `dvh` para altura disponível; garantir margens externas e não fixar a altura se o conteúdo for menor.

---

## 4. Anatomia obrigatória

```text
ModalOverlay
└── ModalContainer (size = sm | md | lg)
    ├── ModalHeader (gradiente, ícone opcional, título, subtítulo, fechar)
    ├── ModalBody (área única rolável; composição variável)
    └── ModalFooter (ações persistentes; secundária e primária)
```

**Header:** altura definida pelo conteúdo, padding uniforme, ícone contextual opcional, título claro, botão `X` à direita. **Body:** fundo claro, agrupamentos com títulos, rótulos e separações legíveis. **Footer:** borda superior sutil, fundo sólido, botões alinhados e visíveis; não deixar o rodapé desaparecido em formulários longos. Em modal `sm`, usar rodapé compacto, sem faixas vazias.

**Botões:** primário roxo; secundário contornado; ação destrutiva vermelha **somente** para confirmar exclusão/cancelamento. Ajustar labels à ação real (ex.: `Salvar alterações`, `Remover`, `Adicionar ao carrinho`), sem botões redundantes.

**Rolar:** somente a área do conteúdo rola por padrão; header e footer permanecem acessíveis. Não usar barra de rolagem na janela **e** outra no modal ao mesmo tempo.

---

## 5. API recomendada do componente base

> Exemplo **conceitual**, não representa código já existente e não pressupõe um nome de pasta específico.

```tsx
type ModalSize = 'sm' | 'md' | 'lg';
type ModalVariant = 'view' | 'form' | 'danger';

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  variant?: ModalVariant;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  preventDismiss?: boolean; // p.ex. durante envio/salvamento
};
```

**Componentização recomendada:** `ModalBase`, `ModalHeader`, `ModalBody`, `ModalFooter`. Preferir migrar/adaptar o componente já existente caso cumpra essas responsabilidades, em vez de criar uma segunda infraestrutura de diálogo. Extrair estilos compartilhados em tokens; evitar classes globais que afetem outras páginas.

### Estados necessários

- Inicial, carregando, sucesso, erro de carregamento, vazio/inexistente e erro de ação quando aplicável.
- Se houver alterações não salvas, fechamento deve respeitar confirmação de descarte definida no fluxo.
- Quando `open=false`, não manter elementos do diálogo acessíveis ao teclado.

---

## 6. Regra especial — Detalhes do anúncio: **página → modal**

### Fluxo alvo

1. Usuário explora anúncios no Marketplace, com filtros, ordenação e paginação aplicados.
2. Seleciona um card → abre o **modal grande de detalhes**, sobre a listagem atual.
3. No modal, consulta imagem, nome, jogo, edição, raridade, condição, idioma, vendedor, estoque e modalidades disponíveis.
4. Se anúncio admite **venda**, mostrar preço e ação de compra; se admite **troca**, mostrar ação de iniciar proposta. Se ambas, oferecer ambas sem competir visualmente.
5. Usuário fecha com `X`, `Fechar` ou `Esc` (quando seguro) → retorna à mesma listagem, preservando filtros, página, posição de rolagem e foco no card.
6. Se anúncio deixou de estar disponível, apresentar estado claro de indisponibilidade, impedir negociação e permitir fechar.

### Contratos de navegação

- **Não quebrar links já existentes** como `/marketplace/anuncios/:id`.
- Implementar navegação baseada em rota com contexto de fundo, **ou** outra estratégia equivalente do roteador atual; a URL deve ser compartilhável.
- Acesso direto, atualização da página e abertura em nova aba devem continuar funcionando. Nesse cenário, exibir o modal em uma base de navegação apropriada ou usar fallback de detalhe sem erro.
- Histórico do navegador (Voltar/Avançar) deve acompanhar abertura/fechamento sem empilhar entradas indevidas.
- Retornar ao card que abriu o modal ao fechá-lo, quando o card ainda existir.

### Dados e regras que não podem regredir

- Exibir **somente** as modalidades habilitadas no anúncio.
- Preço somente quando a venda estiver habilitada.
- Quantidade restante, condição, idioma e identificação da carta devem refletir dados reais do anúncio.
- Anúncios cancelados ou esgotados não devem voltar à listagem por causa dessa mudança; acesso direto pode mostrar estado indisponível.
- Manter ações e validações de carrinho/proposta já existentes; esta etapa não altera regras de negócio.
- Preservar loading, erro, anúncio não encontrado e imagem ausente.

### Layout do detalhe

**Desktop:** coluna esquerda com imagem do card e ação `Ver imagem`; coluna direita com identificação, chips de `Venda` (roxo) e `Troca` (azul), atributos, vendedor, estoque e valor quando houver. Footer com ações contextuais. **Mobile:** coluna única, imagem reduzida, detalhes abaixo, CTAs visíveis sem sobreposição.

---

## 7. Comportamento responsivo

| Contexto | `sm` confirmação | `md` formulário | `lg` detalhes |
|---|---|---|---|
| **Desktop ≥ 1024px** | Centralizado e compacto | Centralizado | Até duas colunas |
| **Tablet 768–1023px** | Centralizado | Largura fluida | Duas colunas só se legíveis; caso contrário empilhar |
| **Mobile < 768px** | Diálogo compacto com largura fluida ou sheet acessível | Modal em tela inteira | Modal em tela inteira, coluna única |

**Em mobile:**

- Cabeçalho e rodapé persistentes; conteúdo interno com `overflow-y: auto`.
- Respeitar `env(safe-area-inset-bottom)` e teclado virtual.
- Ações com área de toque mínima recomendada de `44 × 44px`.
- Campos com largura integral e sem cortes laterais; botões podem ocupar largura integral, sem esconder ação secundária.
- Não usar rolagem horizontal para visualizar controles essenciais.
- Para mensagens pequenas, preferir confirmação compacta que não ocupe a tela sem necessidade.

**Orientação técnica:** usar breakpoints reais do projeto sempre que compatíveis; os números acima são referência para revisar desktop/tablet/mobile, não substituição automática do sistema responsivo atual.

---

## 8. Acessibilidade e comportamento do diálogo

- Exibir com semântica adequada: elemento `dialog` (quando viável) ou `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, e `aria-describedby` quando fizer sentido.
- Ao abrir, posicionar foco em elemento apropriado ao contexto; prender foco dentro do modal.
- Ao fechar, devolver foco ao gatilho, quando presente.
- Tratar `Esc` e clique no overlay de acordo com riscos de perda de dados; não fechar silenciosamente durante operação importante.
- Impedir rolagem da página de fundo enquanto aberto.
- Garantir contraste e estados `hover`, `focus-visible`, `disabled`, `loading`.
- Respeitar `prefers-reduced-motion` em animações; evitar motion exagerado.
- Verificar leitura por leitor de tela, ordem tabulável e ausência de modais aninhados inesperados.

---

## 9. Plano de implementação sugerido

1. **Inventariar componentes existentes**: localizar modais, wrappers, CSS e estilos duplicados; identificar o componente base atual.
2. **Consolidar tokens e estrutura compartilhada**: criar/ajustar base, tamanhos, header, footer, overlay e estados.
3. **Migrar telas representativas**: primeiro detalhes de carta, editar item e remover item; comparar com o mockup aprovado.
4. **Migrar detalhes do anúncio**: criar modal grande a partir do detalhe atual, preservando dados, rotas, ações e estados.
5. **Aplicar aos demais fluxos com modal** (criar/gerenciar anúncios, propostas etc.) mantendo o mesmo padrão visual.
6. **Validar responsividade e regressões** em desktop, tablet e mobile.

**Não remover a rota de detalhes do anúncio sem antes garantir acesso direto e atualização/retorno corretos.**

---

## 10. Critérios de aceite técnicos

### Estrutura e visual

- [ ] Um sistema base compartilhado é utilizado nos modais migrados.
- [ ] `sm`, `md` e `lg` possuem dimensões e comportamento definidos.
- [ ] Header em gradiente roxo, título, `X` e footer seguem padrão único.
- [ ] Títulos, chips, inputs, divisores, bordas e CTAs respeitam o Design System.
- [ ] Modais não apresentam altura artificial excessiva, cortes ou ações ocultas.

### Funcionalidade e navegação

- [ ] Detalhes do anúncio abrem em modal a partir da listagem.
- [ ] Link direto de anúncio continua acessível e compartilhável.
- [ ] Fechar retorna a filtros, página e posição anteriores quando houver contexto.
- [ ] Estados `loading`, erro, não encontrado, indisponível e imagem ausente estão cobertos.
- [ ] Venda e troca exibem apenas informações e ações cabíveis.

### Responsividade e acessibilidade

- [ ] Testado em larguras de referência **1440, 1024, 768, 390 e 320px**.
- [ ] Sem rolagem horizontal ou controles encobertos em telas pequenas.
- [ ] Header/footer acessíveis, inclusive com teclado móvel.
- [ ] Foco, `Esc`, rolagem de fundo e retorno de foco funcionam.
- [ ] Botões e textos estão legíveis e possuem contraste adequado.

### Revisões ainda pendentes na tarefa mais ampla

- [ ] Home do Marketplace e cards de anúncios.
- [ ] Carrinho, checkout e resultado da compra.
- [ ] Propostas, gerenciamento de propostas e histórico.
- [ ] Testes visuais de todo o fluxo em desktop, tablet e mobile.

---

## 11. Evidências de aprovação e entrega

- **Aprovado:** direção visual dos modais (gradiente roxo, superfícies claras, refinamento, variantes de tamanho e footer padronizado).
- **Identificado nos prints:** inconsistências entre os modais; tela própria para detalhes do anúncio.
- **Especificado neste handoff:** correções e critérios para implementação.
- **Não verificado:** resultado final no código ou em dispositivos, até que haja implementação e QA.

**Referência visual aprovada:** `sistema_de_modais_tcg_market_em_roxo.png` — conceito, não mockup pixel-perfect de todas as telas.
