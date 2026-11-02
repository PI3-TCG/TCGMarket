# TCG Market — Auditoria Visual dos Modais e Plano de Padronização

## 1. Objetivo

Consolidar a análise visual dos principais modais do TCG Market, registrar os problemas encontrados e definir um padrão único de modal para guiar o refinamento do projeto.

Este documento também registra uma correção estrutural importante: **a tela de detalhes do anúncio deve deixar de ser uma página própria e passar a utilizar o modal padronizado**, mantendo a experiência mais coesa com o restante do Marketplace.

---

## 2. Base da análise

A análise foi realizada com base nos prints fornecidos da aplicação em execução, contemplando principalmente:

- Home do Marketplace;
- Modal de detalhes da carta no catálogo;
- Modal de detalhes da carta na coleção;
- Modal de edição de item da coleção;
- Modal de remoção de item da coleção;
- Página atual de detalhes do anúncio.

> **Observação importante:** esta auditoria documenta os problemas visuais e estruturais já identificados com segurança a partir dos materiais enviados. As demais áreas do escopo geral (carrinho, checkout, propostas, histórico etc.) ainda devem ser verificadas seguindo a mesma lógica de responsividade e consistência visual.

---

## 3. Diagnóstico geral

Os modais atuais cumprem a função de exibir e editar informações, porém ainda não se comportam como um sistema visual unificado.

### Principais problemas percebidos

1. **Falta de padronização de cabeçalho**
   - Alguns modais possuem faixa roxa muito pesada;
   - Outros quase não apresentam identidade visual da marca;
   - A hierarquia entre título, contexto e ação de fechar varia demais.

2. **Linguagem visual inconsistente**
   - Há diferenças de borda, espaçamento, blocos internos e pesos visuais;
   - Alguns modais parecem “duros” e grosseiros;
   - Outros possuem aparência próxima de formulário, mas sem refinamento estético.

3. **Tamanhos e proporções pouco controlados**
   - Os modais não demonstram um sistema claro de largura e altura;
   - Alguns parecem grandes demais para o conteúdo;
   - Outros ficam com sensação de vazio ou de excesso de área em branco.

4. **Rodapé e ações sem padrão único**
   - A posição e o tratamento visual dos botões mudam bastante;
   - Em alguns casos o CTA principal não se destaca de forma elegante;
   - Falta consistência entre ações primárias, secundárias e destrutivas.

5. **Detalhe do anúncio fora do sistema**
   - Hoje a experiência de “Detalhes do anúncio” abre em página própria;
   - Isso quebra a lógica de visualização rápida já utilizada nas outras áreas;
   - Também dificulta a padronização de comportamento e responsividade.

6. **Marca visual pouco sofisticada**
   - O roxo existe, mas nem sempre com refinamento;
   - Falta uso mais estratégico de gradiente, profundidade, contraste e hierarquia;
   - O resultado atual passa menos sensação de produto premium do que o restante do projeto pede.

---

## 4. Proposta de padronização dos modais

A proposta aprovada visualmente para o TCG Market estabelece um **Sistema de Modais** com identidade premium, coesa e consistente com o Design System já adotado.

### 4.1 Conceito visual

- Base clara e elegante;
- Cabeçalho roxo com **gradiente suave**, sem ficar pesado;
- Bordas arredondadas com acabamento refinado;
- Uso de sombra suave para destacar o modal sem endurecer o layout;
- Tipografia com títulos de maior personalidade e corpo de texto limpo;
- Hierarquia clara entre informação, formulário e ações.

### 4.2 Estrutura padrão

Todo modal deve seguir a seguinte estrutura:

1. **Overlay**
   - Fundo escurecido e levemente desfocado;
   - Deve reforçar o foco no conteúdo ativo.

2. **Container do modal**
   - Largura máxima definida por tipo;
   - Altura controlada com rolagem interna quando necessário;
   - Cantos arredondados e sombra padrão.

3. **Header**
   - Faixa superior com gradiente roxo;
   - Ícone contextual opcional à esquerda;
   - Título principal;
   - Subtítulo opcional para explicar a ação;
   - Botão de fechar no canto superior direito.

4. **Body**
   - Conteúdo dividido em blocos internos claros;
   - Cards informativos, grids e campos com espaçamento consistente;
   - Uso moderado de áreas de destaque em fundo lavanda claro.

5. **Footer**
   - Botões sempre alinhados no mesmo padrão;
   - Ação secundária à esquerda;
   - Ação principal à direita;
   - Em modais destrutivos, ação principal em vermelho.

---

## 5. Tipos oficiais de modal

### 5.1 Modal grande — visualização de conteúdo rico
**Uso:** detalhes de carta, detalhes de anúncio, detalhes de propostas.

**Características:**
- Maior largura;
- Duas colunas em desktop;
- Card/imagem à esquerda e conteúdo à direita;
- Área adicional para atributos, abas e observações;
- Footer com ações relacionadas ao contexto.

### 5.2 Modal médio — formulário
**Uso:** editar item da coleção, criar anúncio, editar anúncio, envio de proposta.

**Características:**
- Largura intermediária;
- Cabeçalho com contexto da ação;
- Resumo do item no topo;
- Formulário organizado por seções;
- Footer fixo com CTA principal.

### 5.3 Modal pequeno — confirmação
**Uso:** remover item, cancelar anúncio, cancelar proposta, excluir item do carrinho.

**Características:**
- Largura reduzida;
- Texto objetivo;
- Ícone de alerta/remoção em destaque;
- Poucos elementos;
- CTA destrutivo bem sinalizado.

---

## 6. Correções recomendadas por modal revisado

## 6.1 Detalhes da carta — catálogo

### Problemas identificados
- Cabeçalho roxo muito chapado e visualmente pesado;
- Estrutura funcional, mas com aparência ainda rígida;
- Blocos internos poderiam ter hierarquia mais clara;
- Footer ainda pouco refinado;
- A composição geral não conversa tão bem com a sofisticação do restante da interface.

### Correções recomendadas
- Aplicar header com gradiente roxo e brilho suave;
- Reorganizar o conteúdo em blocos internos com melhor respiro;
- Valorizar título da carta e chips de atributos;
- Refinar a área de ações no rodapé;
- Definir largura padrão do modal grande.

---

## 6.2 Detalhes da carta — coleção

### Problemas identificados
- Muito semelhante ao modal do catálogo, porém sem se afirmar como parte de um sistema padronizado;
- A ação principal (“Criar anúncio”) está funcional, mas ainda sem o refinamento visual desejado;
- Falta uma linguagem compartilhada mais evidente entre contexto, conteúdo e ação.

### Correções recomendadas
- Unificar totalmente com o padrão do modal grande;
- Manter o mesmo modelo visual do catálogo, alterando apenas o contexto e as ações;
- Melhorar a apresentação do CTA principal;
- Garantir que título, subtítulo e rodapé sigam a mesma lógica em todos os modais de visualização.

---

## 6.3 Editar item da coleção

### Problemas identificados
- Estrutura de formulário bem mais clara do que os modais de visualização, mas visualmente desconectada deles;
- Cabeçalho branco/perda de força da marca;
- Sensação de modal “grande demais” em relação ao conteúdo;
- Excesso de área neutra em alguns trechos;
- Footer correto em posição, porém ainda sem a elegância do padrão proposto.

### Correções recomendadas
- Aplicar o header roxo padronizado com subtítulo;
- Organizar o topo com mini resumo da carta + metadados;
- Trabalhar a área do formulário com agrupamentos mais leves e consistentes;
- Ajustar largura para modal médio padrão;
- Manter botões “Cancelar” e “Salvar alterações” no footer padronizado;
- Usar componentes internos mais harmonizados (inputs, selects, textarea, contador de caracteres).

---

## 6.4 Remover item da coleção

### Problemas identificados
- Boa clareza funcional, mas ainda visualmente duro;
- O layout atual usa estrutura de formulário herdada, quando o contexto é apenas confirmação;
- Há informação demais para uma ação destrutiva simples;
- O cabeçalho ainda não acompanha um padrão premium.

### Correções recomendadas
- Converter para modal pequeno de confirmação;
- Centralizar a mensagem principal;
- Exibir um resumo curto do item e da consequência da ação;
- Destacar o aviso destrutivo em bloco vermelho claro;
- Usar CTA destrutivo vermelho no padrão do sistema.

---

## 6.5 Detalhes do anúncio (situação atual em página)

### Problema estrutural principal
Atualmente, **Detalhes do anúncio está sendo exibido como página completa**, o que destoa do comportamento esperado para uma visualização rápida dentro do fluxo do Marketplace.

### Por que isso deve mudar
- Quebra a continuidade da navegação;
- Aumenta a sensação de “deslocamento” do usuário;
- Exige mais esforço para voltar à listagem;
- Dificulta padronizar interação, responsividade e hierarquia com o restante do sistema;
- Contraria a lógica já utilizada para visualização rápida de cartas e ações contextuais.

### Diretriz de correção
**Detalhes do anúncio deve ser convertido para modal grande padronizado.**

### Estrutura recomendada para o novo modal
- Header com gradiente roxo e título contextual, como “Detalhes do anúncio”;
- Coluna esquerda com imagem da carta;
- Coluna direita com:
  - nome da carta;
  - coleção/set;
  - raridade/atributos;
  - condição;
  - idioma;
  - vendedor;
  - quantidade disponível;
  - preço, quando aplicável;
  - modalidade (venda, troca ou ambas);
- Bloco adicional para descrição/observações do anúncio, quando houver;
- Footer com ações coerentes ao contexto, como:
  - “Fechar”;
  - “Adicionar ao carrinho”, quando venda estiver ativa;
  - “Iniciar proposta de troca”, quando troca estiver ativa.

### Benefícios esperados
- Melhora da coerência do fluxo;
- Redução da quebra de contexto;
- Melhor experiência em mobile;
- Maior consistência com coleção e catálogo;
- Reaproveitamento do mesmo componente base.

---

## 7. Regras obrigatórias de consistência

Para garantir a padronização real do sistema, os modais devem obedecer a estas regras:

1. **Todo modal deve ter largura definida por variante**
   - Pequeno, médio ou grande.

2. **Todo modal deve ter header padronizado**
   - Mesmo tratamento de gradiente, espaçamento, botão fechar e hierarquia tipográfica.

3. **Todo modal deve ter footer padronizado**
   - Botão secundário à esquerda, principal à direita;
   - Ações destrutivas em vermelho;
   - Distância e alinhamento constantes.

4. **Blocos internos devem usar o mesmo sistema de espaçamento**
   - Base 8px;
   - Respiros consistentes entre seções.

5. **A tipografia deve obedecer uma hierarquia única**
   - Título do modal;
   - subtítulo/contexto;
   - títulos de seção;
   - rótulos de campo;
   - conteúdo.

6. **Chips, badges e estados visuais devem seguir o mesmo padrão**
   - Raridade;
   - tipo de carta;
   - modalidade de anúncio;
   - status.

7. **Áreas de aviso devem ser semânticas**
   - Informação neutra: lavanda claro;
   - atenção: amarelo claro, se necessário;
   - destrutivo: vermelho claro.

---

## 8. Responsividade dos modais

## 8.1 Desktop
- Modal centralizado;
- Overlay escurecido com leve blur;
- Estruturas de duas colunas permitidas no modal grande;
- Footer sempre visível e organizado.

## 8.2 Tablet
- Redução da largura máxima;
- Layout pode manter duas colunas em alguns casos, desde que sem compressão excessiva;
- Se necessário, transformar em coluna única com resumo acima e conteúdo abaixo;
- Margens laterais mais generosas que no mobile.

## 8.3 Mobile
- Modais complexos devem virar **full-screen modal / bottom sheet expandido**, não mini-janelas apertadas;
- Header permanece fixo com fechar;
- Footer fixo com CTA principal acessível;
- Conteúdo rolável internamente;
- Blocos empilhados em coluna única;
- Imagem e informações devem ser reorganizadas verticalmente.

### Diretriz importante
No mobile, o objetivo não é “encolher o modal desktop”, e sim **adaptar a experiência** para leitura e ação confortáveis.

---

## 9. Orientações de implementação

### 9.1 Criar um componente base de modal
Sugestão estrutural:
- `ModalBase`
- `ModalHeader`
- `ModalBody`
- `ModalFooter`

### 9.2 Criar variantes por tamanho
- `size="sm"`
- `size="md"`
- `size="lg"`

### 9.3 Criar variantes por contexto
- `variant="view"`
- `variant="form"`
- `variant="danger"`

### 9.4 Reaproveitar o mesmo padrão nas áreas
- Catálogo;
- Minha coleção;
- Marketplace;
- Meus anúncios;
- Propostas de troca;
- Histórico.

### 9.5 Padronizar os CTAs
- Primário: roxo sólido;
- Secundário: outline roxo;
- Destrutivo: vermelho sólido;
- Destrutivo secundário: outline vermelho, se necessário.

### 9.6 Garantir acessibilidade
- Fechar com `Esc`;
- Foco preso dentro do modal;
- Botão fechar acessível;
- Labels claros;
- Ordem de tabulação lógica;
- Contraste suficiente entre texto e fundo.

---

## 10. Prioridade de correção

### Prioridade alta
1. Definir e implementar o componente base de modal;
2. Padronizar header, body e footer;
3. Converter **Detalhes do anúncio** de página para modal;
4. Refinar modal de edição de item;
5. Refinar modal de remoção de item.

### Prioridade média
6. Harmonizar blocos internos e chips dos modais de detalhes;
7. Revisar espaçamentos, alturas e áreas de respiro;
8. Validar o comportamento em tablet.

### Prioridade baixa
9. Refinos microvisuais adicionais;
10. Ajustes de animação de entrada/saída, se houver tempo.

---

## 11. Resultado esperado após a correção

Após aplicar este plano, o TCG Market deve passar a ter:

- Um sistema de modais visualmente coerente;
- Mais sofisticação e identidade de produto;
- Melhor hierarquia informacional;
- Melhor experiência em desktop, tablet e mobile;
- Menor sensação de improviso entre telas;
- Navegação mais consistente dentro do Marketplace.

---

## 12. Conclusão

A revisão visual mostrou que o problema principal não está nas funcionalidades dos modais, mas na **ausência de um sistema unificado**.

A proposta aprovada resolve isso ao transformar os modais em um conjunto consistente, elegante e alinhado à identidade do TCG Market.

A mudança mais importante e obrigatória desta etapa é:

> **O detalhe do anúncio deve deixar de ser página e passar a utilizar o modal grande padronizado do sistema.**

Esse ajuste, somado à padronização de cabeçalho, rodapé, dimensões e comportamento responsivo, cria uma base muito mais forte para o refinamento final do projeto.
