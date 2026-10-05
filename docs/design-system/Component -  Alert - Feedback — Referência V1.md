# Alert / Feedback — Referência V1

## 1. Propósito

Alert e Feedback comunicam ao usuário o resultado de uma ação, uma situação importante ou uma informação que exige atenção.

## 2. Variantes

| Variante    | Uso                                | Cor principal | Exemplos                                     |
| ----------- | ---------------------------------- | ------------- | -------------------------------------------- |
| **Success** | Operação concluída                 | `#15803D`     | Anúncio publicado · Carta adicionada         |
| **Warning** | Atenção necessária                 | `#D97706`     | Poucas unidades · Alteração pendente         |
| **Error**   | Erro ou falha                      | `#B91C1C`     | Falha ao publicar · Dados inválidos          |
| **Info**    | Informação geral                   | `#1D4ED8`     | Nova atualização · Informação sobre catálogo |
| **Neutral** | Feedback sem significado semântico | `#484B5A`     | Alteração salva como rascunho                |

## 3. Aparência

| Propriedade         | Valor             |
| ------------------- | ----------------- |
| **Fonte**           | Plus Jakarta Sans |
| **Texto**           | 14px              |
| **Peso**            | 400               |
| **Título opcional** | 600               |
| **Ícone**           | 20px              |
| **Padding**         | 12px 16px         |
| **Border Radius**   | 8px               |
| **Borda**           | 1px               |
| **Botão fechar**    | Ícone 20px        |

As superfícies devem utilizar versões suaves das respectivas cores semânticas, mantendo o texto e os ícones em tons mais escuros.

## 4. Estados

| Estado          | Comportamento                               |
| --------------- | ------------------------------------------- |
| **Default**     | Feedback apresentado normalmente            |
| **Dismissible** | Pode ser fechado pelo usuário               |
| **Persistent**  | Permanece até que a condição seja resolvida |
| **Loading**     | Indica que uma operação está em andamento   |

## 5. Exemplos

### Success

> Anúncio publicado com sucesso!

### Warning

> Este anúncio possui poucas unidades disponíveis.

### Error

> Não foi possível publicar o anúncio. Verifique os dados informados.

### Info

> Existem novas cartas disponíveis neste catálogo.

### Neutral

> O anúncio foi salvo como rascunho.

## 6. Regras

* Utilizar cores semânticas somente para seus respectivos significados.
* Mensagens devem ser objetivas.
* O usuário deve entender o que aconteceu e, quando necessário, como resolver.
* Não utilizar Alert para informações puramente decorativas.
* Erros devem possuir linguagem clara e orientada à ação.
* Feedbacks temporários não devem desaparecer rápido demais para serem compreendidos.
