# API

API = Application Programming Interface.
Em português: **Interface de Programação de Aplicações**.

## Como funciona uma API?

O exemplo mais clássico para explicar o que é uma API é a comparação com um garçom. Imagine que estamos em um restaurante: nós somos o cliente, o garçom é a API e a cozinha representa o sistema que vai processar nosso pedido.

O garçom recebe o nosso pedido, leva até a cozinha e depois traz a resposta para nós.

Porém, essa comparação pode causar uma confusão, pois algumas pessoas acabam pensando que a cozinha seria o banco de dados. Na realidade, uma API não serve apenas para fazer a comunicação entre um usuário e um banco de dados.

Uma API é uma **interface que permite a comunicação entre diferentes softwares ou sistemas**.

Por exemplo, imagine que uma empresa possui um sistema responsável por armazenar informações de seus usuários. Outra empresa possui um sistema que precisa consultar algumas dessas informações.

O segundo sistema não precisa ter acesso direto ao banco de dados do primeiro sistema. Em vez disso, o primeiro sistema pode disponibilizar uma API.

O segundo sistema então faz uma requisição para um endereço disponibilizado pela API, por exemplo:

GET /api/usuarios

A API recebe essa requisição, verifica o que foi solicitado, executa as regras necessárias e pode consultar o banco de dados internamente. Depois disso, ela retorna uma resposta para o sistema que fez a requisição.

Um exemplo de resposta poderia ser:

```
{
  "id": 1,
  "nome": "Gabriel",
  "email": "[[gabriel@email.com](mailto:gabriel@email.com)](mailto:gabriel@email.com)"
}
```

Dessa forma, o segundo sistema não precisa saber como o banco de dados do primeiro sistema funciona. Ele apenas precisa saber **como utilizar a API**.

## O que é um endpoint?

Um **endpoint** é um endereço específico disponibilizado por uma API para realizar determinada operação ou acessar determinado recurso.

Por exemplo:

GET /api/usuarios

Esse endereço pode ser um endpoint responsável por consultar usuários.

Podemos ter vários endpoints diferentes:

GET /api/usuarios
→ Consulta os usuários.

GET /api/usuarios/10
→ Consulta o usuário de ID 10.

POST /api/usuarios
→ Envia informações para criar um novo usuário.

PUT /api/usuarios/10
→ Atualiza o usuário de ID 10.

DELETE /api/usuarios/10
→ Solicita a exclusão do usuário de ID 10.

Portanto, uma API pode possuir vários endpoints, cada um responsável por uma determinada função ou recurso.

## O contrato entre os sistemas

Quando dois softwares se comunicam através de uma API, existe uma espécie de **contrato** entre eles.

Esse contrato define como um sistema deve conversar com o outro.

Por exemplo, uma API pode determinar que para criar um usuário deve ser enviada uma requisição:

POST /api/usuarios

Com os seguintes dados:

```
{
  "nome": "Gabriel",
  "email": "[[gabriel@email.com](mailto:gabriel@email.com)](mailto:gabriel@email.com)"
}
```

E a API pode definir que, após o cadastro, responderá:

```
{
  "id": 15,
  "nome": "Gabriel",
  "email": "[[gabriel@email.com](mailto:gabriel@email.com)](mailto:gabriel@email.com)"
}
```

Nesse caso, o sistema que está consumindo a API precisa respeitar as regras estabelecidas.

O contrato pode definir:

* quais endpoints existem;
* quais métodos HTTP devem ser utilizados;
* quais informações devem ser enviadas;
* quais informações serão retornadas;
* formato dos dados, como JSON;
* códigos de resposta HTTP;
* regras de autenticação;
* quais campos são obrigatórios;
* quais operações são permitidas.

Por exemplo, se a API determina que o campo "email" é obrigatório, o sistema que estiver consumindo essa API precisa enviar esse campo.

Assim, podemos imaginar a comunicação da seguinte maneira:

Sistema A → Requisição → API → Processamento → Resposta → Sistema A

Os dois sistemas não precisam conhecer toda a implementação interna um do outro. Eles precisam apenas conhecer e respeitar o contrato definido pela API.

## API não é apenas para banco de dados

Uma API pode ser utilizada para diversas finalidades e não necessariamente envolve diretamente um banco de dados.

Por exemplo, um sistema pode utilizar uma API de pagamento para conversar com uma empresa de pagamentos.

Outro sistema pode utilizar uma API de mapas para obter localizações.

Um aplicativo de previsão do tempo pode utilizar uma API para receber informações sobre o clima.

Um aplicativo pode utilizar uma API de uma rede social para obter determinadas informações permitidas pela plataforma.

Também é possível que uma API converse com outro sistema sem que o objetivo principal seja consultar um banco de dados.

Por exemplo:

Aplicativo → API de pagamento → Serviço de pagamento

ou:

Site → API de mapas → Serviço de mapas

ou ainda:

Sistema A → API → Sistema B

## Exemplo prático

Imagine que temos um sistema chamado PATRIMOV.

O PATRIMOV possui um banco de dados com informações sobre patrimônios.

Um aplicativo externo precisa consultar os patrimônios cadastrados.

Seria uma má ideia dar ao aplicativo acesso direto ao banco de dados do PATRIMOV e permitir que ele execute comandos como:

SELECT * FROM patrimonios;

Em vez disso, o PATRIMOV pode disponibilizar um endpoint:

GET /api/patrimonios

O aplicativo faz uma requisição para esse endpoint.

A API recebe a requisição, consulta o banco de dados conforme as regras do sistema e retorna somente as informações que devem ser disponibilizadas.

Por exemplo:

```
[
  {
    "id": 1,
    "descricao": "Computador Dell",
    "numero_patrimonio": "PAT001",
    "status": "ATIVO"
  },
  {
    "id": 2,
    "descricao": "Impressora HP",
    "numero_patrimonio": "PAT002",
    "status": "BAIXADO"
  }
]
```

O aplicativo não precisa conhecer as tabelas, relacionamentos ou comandos SQL utilizados pelo PATRIMOV.

Ele precisa apenas conhecer o **contrato da API**.

## Resumindo

Uma API é uma **interface que permite que diferentes softwares se comuniquem**.

Ela funciona como um ponto de comunicação entre sistemas. Um sistema faz uma requisição seguindo as regras definidas pela API, e a API processa essa requisição e devolve uma resposta.

A API pode utilizar um banco de dados internamente, mas ela não é o banco de dados.

Uma API pode possuir diversos **endpoints**, que são os endereços utilizados para acessar determinados recursos ou executar determinadas operações.

Além disso, existe um **contrato** entre o sistema que fornece a API e o sistema que a utiliza. Esse contrato determina como a comunicação deve acontecer, quais dados devem ser enviados, quais dados podem ser recebidos e quais regras precisam ser respeitadas.

Portanto:

Sistema A
↓
Faz uma requisição seguindo o contrato
↓
API / Endpoint
↓
Processa a requisição
↓
Pode consultar ou alterar dados internamente
↓
Retorna uma resposta
↓
Sistema A