# TCC — Trading Card Change

Projeto Integrador 3 (PI3) da Fatec. Plataforma brasileira para conectar jogadores e colecionadores de TCGs, facilitando a descoberta, a negociação e a troca de cartas.

## Sobre o projeto

O TCC (Trading Card Change) nasce da dificuldade de encontrar cartas específicas no mercado brasileiro, principalmente em jogos com comunidades menores. A ideia não é só um marketplace de anúncios: a plataforma deve ajudar a conectar quem **tem** uma carta com quem **procura** essa carta, inclusive sugerindo possíveis matches de troca.

Foco inicial:

- Cardfight!! Vanguard
- One Piece Card Game
- Dragon Ball Super Card Game
- Digimon Card Game

Outros TCGs (Pokémon, Magic, Yu-Gi-Oh! e jogos de nicho) podem entrar depois.

## Status

O backend Spring Boot e o frontend React já têm a base inicial. A documentação de alinhamento do grupo continua em `docs/`.

## Como executar

O frontend está em [`frontend/README.md`](frontend/README.md).

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/NovosTCG.md](docs/TCG-11%20Pesquisa%20de%20possíveis%20Novos%20TCG%20a%20entrar%20no%20catálogo.md) | Escolha dos TCGs e visão da plataforma |
| [docs/Pagamentos.md](docs/TCG-8%20Spike%20Métodos%20de%20pagamento%20.md) | Spike de integração com métodos de pagamento |
| [docs/BasicAPI.md](docs/TCG-1%20Basico%20sobre%20API.md) | Conceitos básicos de API |

## Próximos passos

A arquitetura ainda vai evoluir. Este README será atualizado conforme o grupo for definindo contribuição e a execução do backend.
