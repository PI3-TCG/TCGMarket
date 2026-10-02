# Modelagem de Usuário e Autenticação

Este documento define como o TCG Market representa um usuário e qual estratégia de autenticação e autorização a aplicação vai usar. Nesta etapa existem o documento MongoDB, o enum de perfil e o repositório. Cadastro, login, emissão de token e proteção de endpoints ficam para as tarefas seguintes.

## Princípio

O usuário é um documento da coleção `users` no MongoDB. Não há banco relacional, JPA nem SQL.

A arquitetura continua MVC na API: o controller recebe a requisição, o service aplica a regra e o repository persiste ou consulta o documento. O React não acessa o MongoDB.

## Modelo `User`

Coleção: `users`.

| Campo | Tipo no Java | No MongoDB | Regra |
| --- | --- | --- | --- |
| `id` | `String` | `ObjectId` | Gerado pelo MongoDB. O Spring Data mapeia o `ObjectId` para `String`. |
| `name` | `String` | `String` | Nome informado no cadastro. |
| `email` | `String` | `String` | Identificador de login. Índice único. Gravado em minúsculas, sem espaços nas pontas. |
| `passwordHash` | `String` | `String` | Hash BCrypt. Nunca a senha em texto puro. Nunca devolvido pela API. |
| `role` | `UserRole` | `String` | Definido pela aplicação. O cliente não escolhe o perfil. |
| `registrationDate` | `LocalDateTime` | `Date` | Preenchido pelo servidor, em UTC, no momento da persistência. |

```mermaid
classDiagram
    class User {
        String id
        String name
        String email
        String passwordHash
        UserRole role
        LocalDateTime registrationDate
    }
    class UserRole {
        <<enumeration>>
        USER
        ADMIN
    }
    User --> UserRole
```

O e-mail único está declarado com `@Indexed(unique = true)`. A aplicação cria esse índice porque `spring.data.mongodb.auto-index-creation` está habilitado. A comparação de duplicidade usa o valor já normalizado: `Joao@Email.com` e `joao@email.com` são o mesmo e-mail.

`passwordHash` existe para deixar explícito que o campo persistido é o hash. A senha em claro só atravessa a requisição de cadastro ou de login e é descartada depois do BCrypt.

## Perfis

| Perfil | Quem recebe | O que poderá fazer |
| --- | --- | --- |
| `USER` | Todo cadastro público | Operar a própria conta: anúncios, compras, trocas, carrinho, coleção e perfil. |
| `ADMIN` | Atribuição interna, nunca pelo formulário público | Moderar anúncios e gerenciar usuários (RF18). |

Um documento novo nasce com `role = USER`. Promover alguém a `ADMIN` será uma operação administrativa, numa tarefa própria.

## Autenticação

A estratégia é **JWT stateless com Spring Security**.

- A senha é conferida com BCrypt contra `passwordHash`.
- O login bem-sucedido devolve um token assinado. O token carrega o `id` do usuário e o `role`.
- As requisições seguintes enviam `Authorization: Bearer <token>`.
- O backend valida o token e coloca o usuário no contexto de segurança. As operações leem essa identidade. O corpo da requisição não informa quem é o usuário nem qual é o perfil.
- O MongoDB não guarda sessão. O token é a prova da autenticação até expirar.

Essa escolha acompanha o que o projeto já é: API REST e frontend React em outra origem. O Axios em `frontend/src/services/api.ts` passa a enviar o header quando o login existir. O CORS atual já libera o header.

O `spring-boot-starter-security` entra na tarefa de login, junto com o filtro do token e o `PasswordEncoder`. Incluir o starter agora, sem essa configuração, fecharia os endpoints atuais atrás do login padrão do Spring Security.

## Autorização

A autorização é por perfil, lido do token e conferido no backend.

| Acesso | Exemplos previstos |
| --- | --- |
| Público | `GET /api/health`, cadastro e login |
| Autenticado (`USER` ou `ADMIN`) | Perfil, anúncios, carrinho, trocas e coleção do próprio usuário |
| Somente `ADMIN` | Moderação e gestão de usuários |

Uma conta `USER` só altera dados ligados ao próprio `id`. O `id` vem do token, não de um campo enviado pelo cliente.

## O que esta etapa entrega

- `com.pitcc.model.User`
- `com.pitcc.model.UserRole`
- `com.pitcc.repository.UserRepository`, com `findByEmail` e `existsByEmail`
- Índice único de e-mail, criado automaticamente na subida da aplicação

## O que fica para as próximas tarefas

1. Cadastro: validar `name`, `email` e senha, recusar e-mail duplicado, gravar o hash e fixar `role = USER`.
2. Login: conferir o hash e emitir o JWT.
3. Filtro de autenticação e contexto do usuário autenticado.
4. Proteção dos endpoints.
5. Autorização por `USER` e `ADMIN`.
6. Uso do `id` autenticado nas operações de negócio.
