# TCGMarket — Roteiro de implementação do Design System v2.2

> **Status:** planejamento técnico; decisões de marca e aceite final da DS-01 ainda precisam de aprovação explícita.  
> **Fonte principal:** `TCGMARKET_DESIGN_SYSTEM_V2_2_COMPLETO.md` (seção do roadmap) + estado inspecionado do repositório em 23/11/2026.

## 1. Objetivo

Migrar a UI para a v2.2 de modo incremental. Ordem preferencial: contrato → tokens/ativos → componentes compartilhados → layouts → páginas → QA → limpeza. Não reescrever serviços, rotas, modelos ou autorização para acompanhar mockups.

Cada PR deve trazer descrição de escopo, arquivos, imagens desktop/mobile e validação de regressões. Não remover CSS legado antes de verificar todos os consumidores.

## 2. Estados verificados e pressupostos

- `TCGMARKET_DESIGN_SYSTEM_V2_2_COMPLETO.md`: **já existe no repositório**.
- `frontend/src/index.css`: já contém base pergaminho e tokens v2.2.
- `frontend/src/assets/design-system/`: já contém SVGs e textura; o uso de uma logo oficial depende do fechamento da decisão de marca.
- PR [#259](https://github.com/PI3-TCG/TCGMarket/pull/259): Navbar e Footer foram integrados à `main`.
- `SiteHeader` atualmente não é sticky (`position: relative`); Ctrl+K está ativo sem dica visível.
- `HomePage.tsx` já declara `HOME_AD_LIMIT = 8` e escopo de três jogos. Novas alterações visuais do hero e faixa de valores pertencem à DS-13.
- **Não marcar como aprovado** o registro de marca/domínio apenas pelo fechamento da [#237](https://github.com/PI3-TCG/TCGMarket/issues/237).

## 3. Matriz de tarefas

| Ordem | ID | P | Entrega | Dependências | Estado a confirmar |
|---:|---|---|---|---|---|
| 0 | DS-00 | P0 | Assets vetoriais e textura | Marca | Implementação reportada; auditar uso de imagens ao fim da migração |
| 1 | DS-01 | P0 | Este contrato, padrões e roteiro; resolver referências históricas | #237 | **Documentação preparada; aprovação PO pendente** |
| 2 | DS-02 | P0 | Tokens, contraste e base do pergaminho | DS-01 | `index.css` já possui base, mas QA transversal permanece |
| 3 | DS-03 | P0 | Botões, inputs, selects, dropdowns, badges | DS-02 | Pendente de verificação |
| 4 | DS-04 | P0 | Cards e imagens de TCG | DS-02/03 | Pendente de verificação |
| 5 | DS-05 | P0 | Modal base / modalTheme | DS-02/03 | Pendente de verificação |
| 6 | DS-06 | P1 | Containers e seções reutilizáveis | DS-02 | Pendente |
| 7 | DS-07 | P1 | Navbar e mobile | DS-02/03 | **PR #259 integrado**, verificar QA pós-deploy |
| 8 | DS-08 | P1 | Footer / redes sociais | DS-02/03 | **PR #259 integrado**, verificar QA pós-deploy |
| 9 | DS-09 | P1 | Banner e hero | DS-02/06 | Pendente |
| 10 | DS-10 | P1 | Filtros e chips | DS-03/06 | Pendente |
| 11 | DS-11 | P1 | Catálogo e Marketplace | DS-04/09/10 | Pendente |
| 12 | DS-12 | P1 | Coleção e anúncios | DS-04/09/10 | Pendente |
| 13 | DS-13 | P1 | Home, faixa de valores, seções informativas | DS-04/06/09 | Pendente |
| 14 | DS-14 | P1 | Modais especializados | DS-05 | Pendente |
| 15 | DS-15 | P1 | Detalhes, carrinho, checkout, transações | DS-03/05/06/09 | Pendente |
| 16 | DS-16 | P2 | Perfil e autenticação | DS-03/05/06 | Pendente |
| 17 | DS-17 | P1 | Área administrativa | DS-02/03/06 | Pendente |
| 18 | DS-18 | P2 | Página de exemplos DS | DS-03/04/05 | Pendente |
| 19 | DS-19 | P0 | QA responsivo e acessibilidade | DS-07 a DS-18 | Ao longo das PRs + auditoria final |
| 20 | DS-20 | P2 | Remover classes/assets comprovadamente obsoletos | DS-19 | Só após prova de não uso |

**Nota histórica:** o documento consolidado original nomeia uma etapa **DS-02A** de ornamentos. A issue atual usa **DS-00** para inventário/integração inicial. As receitas de componentes visuais (`GoldFrame`, `SectionTitle`) continuam atribuídas à DS-02/03 ou às suas issues específicas; não foi criada outra tarefa obrigatória apenas para renomear arquivos.

## 4. Critérios e entregas da DS-01

### Arquivos a versionar

- `docs/design-system/DESIGN_SYSTEM_V2.md`
- `docs/design-system/COMPONENT_PATTERNS_V2.md`
- `docs/design-system/IMPLEMENTATION_ROADMAP_V2.md`
- Atualizar `docs/design-system/ReadME.md` com as referências atuais.
- Preservar `Visual Guide V1.md` e `LAYOUT_GUIDELINES_V2.md`; adicionar aviso de precedência histórica **sem apagar o conteúdo**.

### Critérios

- [x] Documentação técnica v2.2 proposta e organizada em três arquivos.
- [x] Divergência entre paleta fria (V1), ZIP antigo e v2.2 **documentada**.
- [x] Contratos de ornamentação e responsividade **documentados**.
- [x] Escopo limitado a três TCGs e oito anúncios na Home **documentado**.
- [ ] Documentos versionados em branch/PR de DS-01.
- [ ] Avisos nos guias históricos aplicados ao repositório.
- [ ] Nome, identidade, domínio e aprovações pendentes da #237 concluídos pelo PO/equipe.
- [ ] Contratos, mapa de ornamentos e critérios de fidelidade aprovados explicitamente.

Não transformar essas últimas quatro caixas em `[x]` sem a ação correspondente.

## 5. Matriz de capturas de referência

| Tela | Capturas esperadas | Verificar |
|---|---|---|
| Home | 390 e 1440 px | Hero, três TCGs, oito anúncios, seções |
| Marketplace | 390 e 1440 px | Banner, filtros, cards e preço |
| Catálogo | 390 e 1440 px | Busca, filtros, paginação, detalhe |
| Modal | Mobile e desktop | Overlay, foco, título, tamanho, borda |
| Carrinho/Checkout | Mobile e desktop | Stepper, resumo, campos e erro |
| Navegação mobile | 320 e 390 px | Sem recorte, tab bar e safe area |

Medidas de teste complementares: **320, 768, 1024, 1600 px**, zoom de 200%, textos longos, estados vazios e erros.

## 6. Comandos de validação

Executar em `frontend/`:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run lint
npm.cmd run format:check
```

Em Windows PowerShell 5.1, `npm.cmd` evita bloqueio do `npm.ps1` pela política de execução de scripts. `npm ci` só é necessário quando dependências ainda não estão instaladas; não fazer `npm audit fix` em PR apenas documental.

A DS-01 é de documentação: testes de UI e build servem para proteger a integração, mas não são evidência de aprovação do PO.
