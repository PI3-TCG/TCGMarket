# NOSQL - MongoDB

### Vantagens:

- Schema flexível: não possui uma estrutura rídiga
- Escalabilidade horizontal: facilidade na distribuição de dados entre vários servidores,
- Alta Performance: velocidade no manejo de grandes volumes de dados
- Uso de dados semi-estruturados (JSON)


### Desvantagens (pontos de atenção):

- Pode apresentar inconsistência nos dados
- Menor padronização dos dados salvos
- A Integridade dos dados fica por conta da aplicação e não do banco
- Joins complexos são difíceis ou inexistentes.

### Melhores Cenários:

- Sistemas com volumes de dados variados como: Redes Sociais, catálogo de produtos com atributos variáveis...
- Sistemas com grandes volumes de dados como: Aplicações de tempo real (chats, Iot), Big Data, Sistema de cache...


##  MODELAGEM

No NoSQL, especialmente no MongoDB, o pensamento deve ser voltado para **documentos** que representam um 'objeto completo' da aplicação.
No Banco Relacional, para montar uma venda completa são necessários diversos JOINs entre pelo menos 3 tabelas, enquanto no NoSQL o pedido pode ser apresentado diretamente por um único documento.
O que antes era estruturado em um conjunto de tabela conectadas por chaves primárias e estrangeiras, agora passa a ser rearranjado em documentos únicos mais completos e flexíveis agrupados em coleções.

O MongoDB foi criado para solucionar *dois problemas* existentes dentro do Banco de Dados Relacional:

- Primeiro, os dados não possuem estrutura fixa. Dentro do SQL isso significa que na tabela de produtos algunas colunas sempre ficarão vazias. Já dentro do NoSQL, cada documentos pode ter sua própria estrutura de forma independente.
- Segundo, a escalabilidade de grandes volumes de dados. Lidar com volumes enormes de dados distribuidos e relacionados em diversas tabelas afeta diretamente a performance do banco. A independencia dos documentos dentro do NoSQL também facilidade a distribuição desses dados por vários servidores diferentes.

### Em Resumo:

*Ganha-se em flexibilidade e velocidade, porém perde-se em integridade de dados e consultas relacionais complexas.*


### Os Conceitos-Chave do MongoDB (equivalências com SQL):

SQL -> MongoDB
Banco de dados -> Banco de dados (database)
Tabela -> Collection (Coleção)
Linha/registro -> Document (documento, formato JSON/BSON)
Coluna -> Field (campo)
Chave primária -> _id

### Embedding vs Referencing

- **Embedding** (embutir): é quando um dado **"pertence"** ao documento e **NÃO** é reutilizado em outro local, como por exemplo a raridade de um carta em específico.
- **Referencing** (referenciar): quando um dado é compartilhado por muitos documentos ou que pode mudar com frequência é utilizado a referenciação (como no SQL, com um ID). Por exemplo usuários, assim se o usuário mudar o nome ou o endereço não é necessário fazer a alteração em vários locais.


## DOCUMENTS (DOCUMENTOS)

Um documento no MongoDB é a **UNIDADE BÁSICA DE DADOS**, e é composto por **PARES DE CAMPO-VALOR** (*field-value pairs*), parecido com um dicionário.

### Estrutura de um Documento:

Todo documento deve possuir um **_id**, é *obrigatório*. Caso não seja fornecido um na hora da inserção, o próprio MongoDB gera automaticmente um *ObjectId* único.
O Documento pode receber dados de tipos variados, como: string, números, booleano, data, null, array e até outro documento(aninhado).
Como dito anteriormente, um campo poder conter um *array* (*[]* - lista de valores) e um **documento aninhado** (**{}** - objeto aninhado).

Como o schema do banco é flexível, dois ou mais documentos de uma mesma collection (coleção) não precisam ter os mesmos campos.

Cada documento tem um limite de tamanho de 16 MB, por isso é tão importante utilizar o Embedding (embutir) e o Referencing (referenciar) durante a modelagem.

Exemplo:

```
{
    "_id": ObjectId("64f1a2b3c4d5e6f7a8b9c0d1"),
    "nome": "Ana Silva",
    "idade": 28,
    "ativo": true,
    "tags": ["admin", "premium"],
    "endereco": **{
        "rua": "Av. Paulista",
        "cidade": "São Paulo",
        "cep": "01310-100"
    },
    "ultimoLogin": null
}
```



##  JSON/BSON


### JSON  - JavaScript Object Notion:

É um formato de texto usado para representar dados estruturados.
É um texto puro, pode ser facilmente lido por pessoas.
Suporta tipo básicos (strign, número, booleano, null, array, objeto aninhado), porém **NÃO** tem tipo de data nativo. As datas viram uma string ou timestamp numérico.
O JSON não diferencia os tipos de números, não há diferença entre int de float, por exemplo, tudo é "number".
É um formato universal, usando por API REST, arquivos de configuração, etc...

### BSON - Binary JSON:

É o formato que o MongoDB armazena o seus dados.
É a representação binária do JSON, criada especialmente para o MongoDB.

O BSON é a solução para alguns problemaa encontrados no formato tradicional do JSON, como por exemplo:

- O texto é mais lento de ser lido/processado, já o sistema binário é muito mais leve e rápido,
- No BSON tem o tipo *Date* nativo, ao contrário do JSON
- No BSON, também ao contrário do JSON, existe diferenciação entre os números (Int32, Int64, Double, Decimal128),
- Enquanto no JSON não tem tipo binário para armazenamento de imagens e arquivos, o BSON tem o tipo Binary, 
- No JSON o sistema percorre o arquivo todo para ler, já o BSON guarda o tamanho de cada campo, permitindo pular direto para o campo que interessa, acelerando assim as buscas.

Em resumo, escreve-se em formato JSON, mas o MongoDB guarda e processa esses dados no formato BSON, convertendo-o sempre que necessário.


##  PERFORMANCE

A Alta Performance do MongoDB se dá basicamente pelo conjunto de três fatores:

1. **Documentos autocontidos e independentes**: permite que os dados sejam distribuidos entre servidores (sharding) sem depender de outros servidores para resonder uma consulta
2. **Sem necssidade de JOIN**: uma consulta busca um documento completo, ao invés de várias tabelas associadas
3. **Formato de armazenamento binário**: este formato garante que velocidade na leitura e armazenagem de dados, mais que um parsing de texto (JSON).
