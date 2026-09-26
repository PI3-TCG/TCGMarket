# Frontend — TCC

Interface do Trading Card Change. React, TypeScript e Vite.

## Requisitos

- Node.js 22 ou superior

## Configuração

```bash
cd frontend
npm install
cp .env.example .env
```

O Vite só expõe variáveis que começam com `VITE_`. A URL do backend fica em `VITE_API_URL` (padrão `http://localhost:8080`).

## Executar

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Outros comandos

| Comando                | O que faz                                     |
| ---------------------- | --------------------------------------------- |
| `npm run build`        | Compila TypeScript e gera a build de produção |
| `npm run preview`      | Serve a build de produção localmente          |
| `npm run lint`         | Roda o ESLint                                 |
| `npm run format`       | Formata o código com o Prettier               |
| `npm run format:check` | Verifica a formatação sem alterar arquivos    |

## Estrutura

```text
src/
├── assets/
├── components/
├── hooks/
├── pages/
├── services/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

Imports internos usam o alias `@/`, por exemplo `@/pages/HomePage`.
