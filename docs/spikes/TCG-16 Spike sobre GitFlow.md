# GITFLOW

O **Gitflow** é um modelo de **branching** (ramificação) para Git, criado por Vincent Driessen, que define um fluxo de trabalho estruturado para *gerenciar o desenvolvimento de projetos*, especialmente aqueles com ciclos de release bem definidos.

## Estrutura de branches

**Branches principais (permanentes):**

- `main` (ou `master`) — contém o código em produção, sempre estável e pronto para deploy
- `develop`  — branch de integração, onde as funcionalidades em desenvolvimento se encontram antes de irem para produção

**Branches de suporte (temporárias):**

- `feature/*` — para desenvolver novas funcionalidades. Nascem de `develop` e voltam para `develop` quando terminadas
- `release/*` — preparam uma nova versão para produção (ajustes finais, correções de bugs pequenos). Nascem de `develop` e, ao final, são mescladas tanto em `main` quanto em `develop`
- `hotfix/*` — para correções urgentes em produção. Nascem de `main` e voltam para `main` e `develop`

## Fluxo típico

1. Você cria uma `feature/nova-funcionalidade` a partir de `develop`
2. Desenvolve e testa
3. Faz merge de volta em `develop`
4. Quando há funcionalidades suficientes para uma nova versão, cria-se `release/1.2.0` a partir de `develop`
5. Faz ajustes finais na release
6. Merge da release em `main` (com tag de versão) e em `develop`
7. Se surgir um bug crítico em produção, cria-se um `hotfix/*` a partir de `main`, corrige, e mescla de volta em `main` e `develop`

## Vantagens

- Organização clara entre código estável e código em desenvolvimento
- Facilita trabalho em equipe, já que cada feature fica isolada
- Bom para projetos com releases programadas (versões bem definidas)

## Desvantagens / críticas

- Considerado "pesado" para times que fazem deploy contínuo (CI/CD), pois tem muitas branches e merges
- Alternativas mais simples, como GitHub Flow (só main + branches de feature) ou Trunk-Based Development, são preferidas por equipes que priorizam entregas rápidas e frequentes

# Spike — Git Flow

## Objetivo

Estudar o funcionamento do **Git Flow** e entender como ele pode ser aplicado para organizar o desenvolvimento e a colaboração no projeto.

## Pontos para estudo

* O que é Git Flow e qual seu objetivo.
* Diferença entre `main` e `develop`.
* Uso de branches:

  * `feature/*`
  * `fix/*`
  * `hotfix/*`
  * `release/*`
* Como criar e finalizar uma feature.
* Como funciona a integração entre branches.
* Uso de **Pull Requests** e Code Review.
* Boas práticas para nomes de branches.
* Como lidar com conflitos durante merges.
* Quando utilizar Git Flow e quais suas vantagens e desvantagens.

## Resultado esperado

Ao final da Spike, entender o fluxo básico do Git Flow e como utilizá-lo no desenvolvimento colaborativo do projeto.
