# TCG Market

**Projeto Integrador III (PI3) — Fatec**

O **TCG Market** é uma plataforma web voltada a jogadores e colecionadores de *Trading Card Games* (TCGs). O projeto busca reunir, em um só ambiente, um catálogo de cartas, a organização de coleções pessoais e, progressivamente, funcionalidades de negociação entre usuários.

## Sobre o projeto

Encontrar cartas específicas, acompanhar diferentes edições e organizar uma coleção pode ser trabalhoso, especialmente quando as informações estão espalhadas por várias fontes.

O TCG Market propõe uma experiência integrada: o usuário consulta um catálogo de cartas, registra os exemplares que possui e gerencia características como **quantidade, idioma e condição de conservação**. A evolução do produto prevê anúncios de venda e troca, conectando colecionadores interessados nas mesmas cartas.

### TCGs priorizados nesta etapa

- **Pokémon TCG**
- **Yu-Gi-Oh!**
- **Magic: The Gathering**

**One Piece Card Game** e **Digimon Card Game** fazem parte das possibilidades de expansão do catálogo, mas não integram o escopo inicial de importação.

## Funcionalidades e escopo

O projeto está em desenvolvimento incremental. Os módulos contemplados incluem:

- **Autenticação e usuários:** cadastro, login e controle de acesso por perfis `USER` e `ADMIN`.
- **Catálogo de cartas:** consulta de cartas e seus detalhes a partir de dados armazenados no MongoDB.
- **Minha Coleção:** registro e gerenciamento dos exemplares pertencentes ao usuário, com quantidade, idioma, condição, pesquisa, filtros e paginação.
- **Perfil:** visualização e atualização de informações do usuário.
- **Administração:** funcionalidades restritas a administradores.

**Evoluções previstas:** publicação de anúncios de venda e/ou troca e recursos para aproximar colecionadores. A presença de um módulo nesta lista não significa que todas as suas funcionalidades já estejam disponíveis em produção.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript e Vite |
| Backend | Java 25, Spring Boot 4 e API REST |
| Banco de dados | MongoDB |
| Desenvolvimento local | Docker e Docker Compose |
| Integração de catálogo | Pokémon TCG API, YGOPRODeck e Scryfall |
| Integração e entrega | GitHub Actions, GitHub Container Registry (GHCR) e infraestrutura de homologação na AWS |

### Arquitetura e catálogo

O backend segue a organização **Controller → Service → Repository**, separando o recebimento das requisições HTTP, as regras de negócio e o acesso aos dados.

Os dados de cartas são obtidos de APIs externas, normalizados e persistidos no **catálogo interno do MongoDB**. Assim, as consultas da aplicação podem utilizar os registros locais, sem depender de uma chamada à API externa a cada pesquisa. A importação considera a identificação da origem e do registro externo para evitar duplicidades.

As informações de posse de cada usuário — como idioma, condição e quantidade — são tratadas separadamente dos dados gerais do catálogo.

## Estrutura do repositório

```text
TCGMarket/
├── backend/            # API REST, regras de negócio e persistência
├── frontend/           # Aplicação React e componentes de interface
├── docs/               # Documentação funcional e técnica
├── infra/hml/          # Configuração e procedimentos de homologação
└── .github/workflows/  # Automações do GitHub Actions
```

## Como executar localmente

### Pré-requisitos

- **Java 25** para o backend.
- **Node.js 22 ou superior** para o frontend.
- **Docker** com o Docker Compose disponível para o ambiente local de banco de dados.

### 1. Backend

A partir da raiz do repositório:

```bash
cd backend
docker compose up -d
```

Antes de subir o MongoDB, configure `MONGO_USERNAME` e `MONGO_PASSWORD` em um arquivo `backend/.env` (use `backend/.env.example` como referência). Para executar o Spring Boot, também configure no ambiente as variáveis necessárias, incluindo `MONGODB_URI` e `JWT_SECRET`. **O Spring Boot não carrega automaticamente o arquivo `.env`.** Nunca versione credenciais ou segredos.

No **Linux, macOS ou Git Bash**:

```bash
./mvnw spring-boot:run
```

No **Windows (PowerShell)**:

```powershell
.\mvnw.cmd spring-boot:run
```

O projeto utiliza **Maven Wrapper**, portanto não é necessário instalar o Maven globalmente. Consulte também o [README do backend](backend/README.md).

### 2. Frontend

Abra outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

No **Windows (PowerShell)**, substitua `cp .env.example .env` por `Copy-Item .env.example .env`.

A variável `VITE_API_URL` define a URL da API (por padrão, `http://localhost:8080`). O frontend é disponibilizado localmente em `http://localhost:5173`.

Para mais detalhes e comandos de build, lint e formatação, consulte o [README do frontend](frontend/README.md).

## Status do desenvolvimento

**Referência: outubro de 2026.**

- Estruturas do frontend e do backend estabelecidas.
- Modelagem do domínio e arquitetura do catálogo em evolução.
- Integrações com **Pokémon, Yu-Gi-Oh! e Magic** desenvolvidas, com importação parcial de registros para apoiar a implementação.
- Fluxos, componentes visuais e protótipos de interface definidos para os principais módulos.
- Funcionalidades de coleção, perfis e demais módulos evoluindo por tarefas e *pull requests*.

A expansão das importações e a disponibilidade de funcionalidades dependem das próximas etapas do projeto.

## Homologação

O pipeline do backend executa testes e publica imagens no **GHCR** conforme as regras do workflow. O deploy na instância **EC2** de homologação é **condicional**: só é executado quando a configuração `HML_DEPLOY_ENABLED` estiver habilitada e os demais requisitos estiverem atendidos.

Os procedimentos de configuração, implantação e rollback estão documentados em [infra/hml/README.md](infra/hml/README.md).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [README do backend](backend/README.md) | Requisitos, execução e informações da API |
| [README do frontend](frontend/README.md) | Configuração, execução e comandos do frontend |
| [Arquitetura do Catálogo de Cartas](docs/arquitetura/TCG-32%20Arquitetura%20do%20Cat%C3%A1logo%20de%20Cartas.md) | Fontes externas, persistência e consultas do catálogo |
| [Modelagem de Usuário e Autenticação](docs/arquitetura/Modelagem%20de%20Usu%C3%A1rio%20e%20Autentica%C3%A7%C3%A3o.md) | Modelo de usuário e estratégia de autenticação |
| [Infraestrutura de homologação](infra/hml/README.md) | Pipeline, ambiente AWS, implantação e rollback |
| [Outros documentos](docs/) | Pesquisas, decisões e documentação complementar |

> Algumas páginas de `docs/` podem representar decisões de etapas anteriores e estão sujeitas a atualização conforme a implementação evolui.

## Próximos passos

Consolidar os módulos em desenvolvimento, ampliar a cobertura de testes, finalizar as integrações entre frontend e backend e expandir progressivamente o catálogo e as funcionalidades de negociação.
