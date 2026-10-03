# Manual Descritivo das Classes

## Marketplace de TCG

Este documento apresenta as classes que compõem o sistema de marketplace de cartas colecionáveis (TCG — Trading Card Game), explicando a responsabilidade de cada classe e o significado de seus principais atributos.

O sistema trabalha com cartas dos jogos Pokémon, Yu-Gi-Oh!, Magic: The Gathering, Digimon e One Piece, permitindo que usuários cadastrem-se, pesquisem cartas, anunciem cartas para venda, realizem compras e trocas, gerenciem suas coleções e listas de desejos, além de avaliarem outros usuários.

---

# Visão geral das classes

De forma simplificada, as classes podem ser organizadas em alguns grupos:

### 🃏 Cartas

* `Card`

  * `PokemonCard`
  * `YugiohCard`
  * `MagicCard`
  * `DigimonCard`
  * `OnePieceCard`

Responsáveis por representar as cartas disponíveis no sistema e suas características específicas de cada jogo.

### 🏷️ Marketplace

* `Ad`
* `Transaction`

  * `Sale`
  * `Exchange`
* `Payment`

Responsáveis pelas ofertas e pelas negociações realizadas entre os usuários.

### 👤 Usuários e reputação

* `User`
* `Review`

Responsáveis pelo cadastro dos usuários e pelo sistema de avaliações e reputação.

### 📚 Coleção e desejos

* `CollectionItem`
* `Wishlist`

Responsáveis pelo gerenciamento das cartas que o usuário possui e das cartas que deseja adquirir.

### 💬 Comunicação

* `Conversation`
* `Message`

Responsáveis pela comunicação entre os usuários, principalmente em relação aos anúncios.

---

# Resumo da responsabilidade de cada classe

| Classe            | Responsabilidade principal                                           |
| ----------------- | -------------------------------------------------------------------- |
| `Card`            | Representar as características comuns das cartas.                    |
| `PokemonCard`     | Representar cartas de Pokémon.                                       |
| `YugiohCard`      | Representar cartas de Yu-Gi-Oh!.                                     |
| `MagicCard`       | Representar cartas de Magic.                                         |
| `DigimonCard`     | Representar cartas de Digimon.                                       |
| `OnePieceCard`    | Representar cartas de One Piece.                                     |
| `Ad`              | Representar uma carta disponibilizada por um usuário no marketplace. |
| `User`            | Representar os usuários da plataforma.                               |
| `Transaction`     | Representar informações comuns às negociações.                       |
| `Sale`            | Representar uma compra/venda de carta.                               |
| `Exchange`        | Representar uma troca de cartas.                                     |
| `Payment`         | Representar o pagamento de uma venda.                                |
| `Review`          | Registrar a avaliação de um usuário após uma transação.              |
| `CollectionItem`  | Representar uma carta pertencente à coleção de um usuário.           |
| `Wishlist`        | Representar uma carta que o usuário deseja adquirir.                 |
| `Conversation`    | Representar uma conversa relacionada a um anúncio.                   |
| `Message`         | Representar uma mensagem dentro de uma conversa.                     |

---

# 1. Classe `Card`

### Tipo

**Classe abstrata**

### Descrição

A classe `Card` representa uma carta de TCG de forma genérica.

Ela contém as informações que são comuns a todas as cartas, independentemente do jogo ao qual pertencem.

Por ser uma classe abstrata, seu objetivo principal é servir como base para as classes específicas de cada jogo:

* `PokemonCard`
* `YugiohCard`
* `MagicCard`
* `DigimonCard`
* `OnePieceCard`

Dessa forma, informações comuns, como nome, edição e número da coleção, não precisam ser repetidas em cada uma das subclasses.

### Atributos

| Atributo          | Tipo        | Descrição                                                                                 |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `id`              | ObjectId    | Identificador único da carta.                                                             |
| `name`            | String      | Nome da carta.                                                                            |
| `game`            | Enum        | Identifica a qual jogo a carta pertence: Pokémon, Yu-Gi-Oh!, Magic, Digimon ou One Piece. |
| `edition`         | String      | Coleção ou conjunto no qual a carta foi lançada.                                          |
| `codeCollection`  | String      | Código/número impresso na carta dentro da coleção.                                        |
| `officialrarity`  | String/Enum | Raridade oficial da carta, como comum, incomum, rara, ultra rara ou secreta.              |
| `imageUrl`        | String      | URL da imagem cadastrada para representar a carta.                                        |
| `externalId`      | String      | Id externa da API utilizada para a captura de dados.                                      |
| `source`          | Enum        | Fonte da captura dos dados.                                                               |

### Métodos

* `getId()` — retorna o identificador da carta.
* `setName()` — atualiza o nome da carta.
* `getName()` — retorna o nome da carta.
* `setGame()` — atualiza qual jogo a carta pertence.
* `getGame()` — retorna qual jogo a carta pertence.
* `setEdition()` — atualiza a edição da carta.
* `getEdition()` — retorna a edição da carta.
* `setCodeCollection()` — atualiza o código de coleção da carta.
* `getCodeCollection()` — retorna o código de coleção da carta.
* `setOfficialRarity()` — atualiza a raridade oficial da carta.
* `getOfficialRarity()` — retorna a raridade oficial da carta.
* `setImageUrl()` — atualiza a imagem da carta.
* `getImageUrl()` — retorna a imagem da carta.
* `getExternalId()`— retorna o identificador usado na API.
* `getSource()`— retorna a fonte da captura dos dados.

---

# 2. Classe `PokemonCard`

### Tipo

**Subclasse de `Card`**

### Descrição

Representa uma carta pertencente ao jogo Pokémon.

Além das informações herdadas de `Card`, essa classe possui características específicas das cartas Pokémon, como pontos de vida, tipo de energia, estágio de evolução e ataques.

### Atributos

| Atributo           | Tipo             | Descrição                                                                                                                        |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `hp`               | Integer          | Pontos de vida da carta Pokémon.                                                                                                 |
| `energyType`       | Enum             | Tipo de energia associado à carta, como Fogo, Água, Grama, Elétrico, Psíquico, Lutador, Sombrio, Metal, Fada, Incolor ou Dragão. |
| `evolutionStage`   | Enum             | Indica o estágio evolutivo: Básico, Estágio 1 ou Estágio 2.                                                                      |
| `pokemonCardType`  | Enum             | Indica se a carta é Pokémon, Treinador ou Energia.                                                                               |
| `recoilCost`       | Integer          | Quantidade de energia necessária para realizar o recuo do Pokémon.                                                               |
| `attack`           | Lista de objetos | Lista contendo os ataques da carta, incluindo informações como nome, custo e dano.                                               |

### Métodos

* `setHp()` — atualiza o hp da carta.
* `getHp()` — retorna o hp da carta.
* `setEnergyType()` — atualiza o tipo de energia da carta.
* `getEnergyType()` — retorna o tipo de energia da carta.
* `setEvolutionStage()` — atualiza o estágio evolutivo da carta.
* `getEvolutionStage()` — retorna o estágio evolutivo da carta.
* `setRecoilCost()` — atualiza o custo de recuo da carta.
* `getRecoilCost()` — retorna o custo de recuo da carta.
* `setAttack()` — atualiza o ataque da carta.
* `getAttack()` — retorna o ataque da carta.

---

# 3. Classe `YugiohCard`

### Tipo

**Subclasse de `Card`**

### Descrição

Representa uma carta pertencente ao jogo Yu-Gi-Oh!.

A classe possui atributos específicos para representar monstros, cartas de Magia e cartas de Armadilha.

### Atributos

| Atributo          | Tipo    | Descrição                                                                               |
| ----------------- | ------- | --------------------------------------------------------------------------------------- |
| `atk`             | Integer | Pontos de ataque da carta.                                                              |
| `def`             | Integer | Pontos de defesa. Pode ser nulo para cartas de Magia e Armadilha.                       |
| `level`           | Integer | Nível, Rank ou valor de Link da carta, conforme o tipo de monstro.                      |
| `attribute`       | Enum    | Atributo do monstro, como Trevas, Luz, Terra, Água, Fogo, Vento ou Divino.              |
| `monsterType`     | String  | Tipo do monstro, como Guerreiro, Dragão, Mago etc.                                      |
| `yugiohCardType`  | Enum    | Indica se a carta é Monstro, Magia ou Armadilha.                                        |
| `invocationForm`  | Enum    | Forma de invocação do monstro, como Normal, Efeito, Fusão, Sincro, Xyz, Link ou Ritual. |

### Método

* `setAtk()` — atualiza ataque da carta.
* `getAtk()` — retorna ataque da carta.
* `setDef()` — atualiza defesa da carta.
* `getDef()` — retorna defesa da carta.
* `setLevel()` — atualiza o nível da carta.
* `getLevel()` — retorna o nível da carta.
* `setAttribute()` — atualiza o atributo da carta.
* `getAttribute()` — retorna o atributo da carta.
* `setMonsterType()` — atualiza o tipo de monstro da carta.
* `getMonsterType()` — retorna o tipo de monstro da carta.
* `setYugiohCardType:()` — atualiza o tipo de carta yugioh.
* `getYugiohCardType:()` — retorna o tipo de carta yugioh.
* `setInvocationForm:()` — atualiza a forma de invocação da carta.
* `getInvocationForm:()` — retorna a forma de invocação da carta.

---

# 4. Classe `MagicCard`

### Tipo

**Subclasse de `Card`**

### Descrição

Representa uma carta pertencente ao jogo Magic: The Gathering.

A classe armazena informações específicas utilizadas para caracterizar as cartas de Magic, incluindo custo de mana, cor, tipo de carta e atributos de criaturas.

### Atributos

| Atributo      | Tipo     | Descrição                                                                                                   |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `manaCost`    | String   | Custo de mana necessário para utilizar a carta, por exemplo `2RR`.                                          |
| `cmc`         | Integer  | Custo total convertido da carta.                                                                            |
| `color`       | Enum/Set | Cor ou conjunto de cores da carta: Branco, Azul, Preto, Vermelho, Verde, Incolor ou Multicolor.             |
| `cardType`    | Enum     | Tipo da carta, como Criatura, Feitiço, Mágica Instantânea, Artefato, Encantamento, Planeswalker ou Terreno. |
| `strength`    | Integer  | Poder da criatura. Utilizado apenas quando a carta representa uma criatura.                                 |
| `resistance`  | Integer  | Resistência da criatura. Utilizado apenas quando a carta representa uma criatura.                           |
| `superType`   | String   | Supertipo da carta, como "Lendária".                                                                        |
| `rulesText`   | String   | Texto que descreve as regras e efeitos da carta.                                                            |

### Método

* `setManaCost()` — atualiza o custo de mana da carta.
* `getManaCost()` — retorna o custo de mana da carta.
* `setCmc()` — atualiza o custo de mana convertido da carta.
* `getCmc()` — retorna o curto de mana convertido da carta.
* `setColor()` — atualiza a cor da carta.
* `getColor()` — retorna a cor da carta.
* `setCardType()` — atualiza o tipo de carta.
* `getCardType()` — retorna o tipo de carta.
* `setStrength()` — atualiza a força da carta.
* `getStrength()` — retorna a força da carta.
* `setResistance()` — atualiza a resistência da carta.
* `getResistance()` — retorna a resistência da carta.
* `setSuperType()` — atualiza o supertipo.
* `getSuperType()` — retorna o supertipo.
* `setRulesText()` — atualiza o texto que descreve a carta.
* `getRulesText()` — retorna o texto que descreve a carta.

---

# 5. Classe `DigimonCard`

### Tipo

**Subclasse de `Card`**

### Descrição

Representa uma carta pertencente ao jogo Digimon.

A classe possui informações específicas dos Digimon, como nível, poder, atributo, tipo e custos relacionados à utilização e evolução da carta.

### Atributos

| Atributo        | Tipo    | Descrição                                                                |
| --------------- | ------- | ------------------------------------------------------------------------ |
| `level`         | Enum    | Nível do Digimon: Baby, In-Training, Rookie, Champion, Ultimate ou Mega. |
| `dp`            | Integer | Poder do Digimon (Digimon Power).                                        |
| `attribute`     | Enum    | Atributo do Digimon: Vaccine, Data, Virus ou Free.                       |
| `digimonType`   | String  | Tipo do Digimon, como Dragon ou Beast.                                   |
| `gameCost`      | Integer | Custo necessário para colocar a carta em jogo.                           |
| `evolutionCost` | Integer | Custo necessário para realizar a evolução.                               |
| `color`         | Enum    | Cor associada à carta Digimon.                                           |

### Método

* `setLevel()` — atualiza o nível da carta.
* `getLevel()` — retorna o nível da carta.
* `setDp()` — atualiza o poder do digimon.
* `getDp()` — retorna o poder do digimon.
* `setAttribute()` — atualiza o atributo da carta.
* `getAttribute()` — retorna o atributo da carta.
* `setDigimonType()` — atualiza o tipo de digimon.
* `getDigimonType()` — retorna o tipo de digimon.
* `setGameCost()` — atualiza o custo do jogo.
* `getGameCost()` — retorna o custo do jogo.
* `setEvolutionCost()` — atualiza o custo de evolução.
* `getEvolutionCost()` — retorna o custo de evolução.
* `setColor()` — atualiza a cor da carta.
* `getColor()` — retorna a cor da carta.

---

# 6. Classe `OnePieceCard`

### Tipo

**Subclasse de `Card`**

### Descrição

Representa uma carta pertencente ao jogo One Piece Card Game.

A classe contém atributos específicos das cartas de One Piece, incluindo custo, poder, contador, vida, tipo, cor e atributos.

### Atributos

| Atributo      | Tipo            | Descrição                                                         |
| ------------- | --------------- | ----------------------------------------------------------------- |
| `cost`        | Integer         | Custo necessário para jogar a carta.                              |
| `power`       | Integer         | Poder da carta.                                                   |
| `counter`     | Integer         | Valor de contador utilizado durante o bloqueio. Pode ser nulo.    |
| `life`        | Integer         | Quantidade de vida. Utilizado quando o tipo da carta é Líder.     |
| `opCardType`  | Enum            | Tipo da carta: Líder, Personagem, Evento ou Estágio.              |
| `color`       | Enum/Set        | Cor da carta: Vermelho, Verde, Azul, Roxo, Preto ou Amarelo.      |
| `attribute`   | Enum            | Atributo da carta, como Slash, Strike, Ranged, Special ou Wisdom. |
| `traits`      | Lista de String | Características ou afiliações da carta, como "Straw Hat Crew".    |

### Métodos

* `setCost()` — atualiza o custo da carta.
* `getCost()` — retorna o custo da carta.
* `setPower()` — atualiza o poder da carta.
* `getPower()` — retorna o poder da carta.
* `setCounter()` — atualiza o contador da carta.
* `getCounter()` — retorna o contador da carta.
* `setLife()` — atualiza a vida da carta
* `getLife()` — retorna a vida da carta
* `setOpCardType()` — atualiza o tipo de carta.
* `getOpCardType()` — retorna o tipo de carta.
* `setColor()` — atualiza a cor da carta.
* `getColor()` — retorna a cor da carta.
* `setAttribute()` — atualiza o atributo da carta.
* `getAttribute()` — retorna o atributo da carta.
* `setTraits()` — atualiza os traços da carta.
* `getTraits()` — retorna os traços da carta.

---

# 7. Classe `Ad`

### Descrição

A classe `Ad` representa uma oferta publicada por um usuário para disponibilizar uma carta no marketplace.

Um anúncio relaciona uma carta a um vendedor e contém as informações necessárias para apresentar a oferta aos demais usuários, como preço, condição, idioma, quantidade disponível e status.

### Atributos

| Atributo            | Tipo          | Descrição                                                                |
| ------------------- | ------------- | ------------------------------------------------------------------------ |
| `id`                | ObjectId      | Identificador único do anúncio.                                          |
| `collectionItemId`  | ObjectId      | Referência à carta da collection que foi anunciada.                      |
| `price`             | BigDecimal    | Preço da carta anunciada.                                                |
| `condition`         | Enum          | Estado de conservação da carta, como Mint, Near Mint, Boa ou Danificada. |
| `idiom`             | Enum          | Idioma da carta, como Português, Inglês ou Japonês.                      |
| `stockQuantity`     | Integer       | Quantidade de unidades disponíveis no anúncio.                           |
| `description`       | String        | Informações adicionais fornecidas pelo vendedor sobre o anúncio.         |
| `status`            | Enum          | Situação do anúncio: Ativo, Vendido, Reservado ou Removido.              |
| `availableForSale`  | Boolean       | Disponível ou não para venda (true or false).                            |
| `availableForTrade` | Boolean       | Disponível ou não para troca. (true or false).                           |
| `date`              | LocalDateTime | Data e horário em que o anúncio foi cadastrado.                          |

### Métodos

* `getId()` — retorna o identificador do anúncio.
* `getCollectionItemId()` — retorna o identificador do item colecionado.
* `setPrice()` — atualiza o preço do anúncio.
* `getPrice()` — retorna o preço do anúncio.
* `setCondition()` — atualiza a condição da carta do anúncio.
* `getCondition()` — retorna a condição da carta do anúncio.
* `setIdiom()` — atualiza o idioma da carta do anúncio.
* `getIdiom()` — retorna o idioma da carta do anúncio.
* `setStockQuantity()` — atualiza a quantidade de cartas no anúncio.
* `getStockQuantity()` — retorna a quantidade de cartas no anúncio.
* `setDescription()` — atualiza a descrição do anúncio.
* `getDescription()` — retorna a descrição do anúncio.
* `setStatus()` — atualiza o status do anúncio.
* `getStatus()` — retorna o status do anúncio.
* `setAvailableForSale()` — atualiza o valor booleano.
* `isAvailableForTrade()` — retorna valor booleano.
* `setAvailableForSale()` — atualiza valor booleano.
* `isAvailableForTrade()` — retorna o valor booleano.
* `getDate()` — retorna data e horário de quando o anúncio foi criado.

---

# 8. Classe `User`

### Descrição

A classe `User` representa uma pessoa cadastrada na plataforma.

O usuário pode utilizar as funcionalidades do marketplace, como gerenciar seu perfil, anunciar cartas, realizar compras e trocas, administrar sua coleção e lista de desejos e avaliar outros usuários.

### Atributos

| Atributo            | Tipo                | Descrição                                              |
| ------------------- | ------------------- | ------------------------------------------------------ |
| `id`                | ObjectId            | Identificador único do usuário.                        |
| `name`              | String              | Nome do usuário.                                       |
| `role`              | Enum                | Papel do usuário (Admin ou não).                       |
| `email`             | String              | E-mail utilizado pelo usuário.                         |
| `passwordHash`      | String              | Senha armazenada em formato de hash.                   |
| `phoneNumber`       | String              | Telefone do usuário.                                   |
| `address`           | Objeto/Subdocumento | Endereço associado ao usuário.                         |
| `profilePhoto`      | String              | URL da foto de perfil.                                 |
| `reputation`        | Double              | Reputação calculada a partir das avaliações recebidas. |
| `totalReview`       | Integer             | Quantidade total de avaliações recebidas pelo usuário. |
| `registrationDate`  | LocalDateTime       | Data e horário de cadastro do usuário.                 |

### Métodos

* `getId()` — retorna o identificador do usuário.
* `setName()` — atualiza o nome do usuário.
* `getName()` — retorna o nome do usuário.
* `setRole()` — atualiza o papel do usuário.
* `getRole()` — retorna o papel do usuário.
* `setEmail()` — atualiza o email do usuário.
* `getEmail()` — retorna o email do usuário.
* `setPasswordHash()` — atualiza a senha do usuário.
* `getPasswordHash()` — retorna a senha do usuário.
* `setPhoneNumber()` — atualiza o telefone do usuário.
* `getPhoneNumber()` — retorna o telefone do usuário.
* `setAddress()` — atualiza o endereço do usuário.
* `getAddress()` — retorna o endereço do usuário.
* `setProfilePhoto()` — atualiza a foto de perfil do usuário.
* `getProfilePhoto()` — retorna a foto de perfil do usuário.
* `recalculateReputation()` — recalcula a reputação do usuário automaticamente após cada avaliação.
* `getReputation()` — retorna a reputação do usuário.
* `setTotalReview()` — atualiza o número total de avaliações.
* `getTotalReview()` — retorna o número total de avaliações.
* `getRegistrationDate()` — retorna data e horário do cadastro do usuário.

---

# 9. Classe `Transaction`

### Tipo

**Classe abstrata**

### Descrição

A classe `Transaction` representa uma operação realizada entre dois usuários dentro do marketplace.

Ela contém as informações comuns às diferentes formas de negociação disponíveis no sistema.

As transações são especializadas pelas classes:

* `Sale`
* `Exchange`

### Atributos

| Atributo            | Tipo          | Descrição                                                          |
| ------------------- | ------------- | ------------------------------------------------------------------ |
| `id`                | ObjectId      | Identificador único da transação.                                  |
| `adId`              | ObjectId      | Referência ao anúncio envolvido na transação.                      |
| `sellerId`          | ObjectId      | Referência ao usuário que está oferecendo a carta.                 |
| `buyerId`           | ObjectId      | Referência ao usuário que está adquirindo a carta.                 |
| `status`            | Enum          | Estado da transação: Pendente, Confirmada, Concluída ou Cancelada. |
| `creationDate`      | LocalDateTime | Data e horário de criação da transação.                            |
| `conclusionDate`    | LocalDateTime | Data e horário de conclusão da transação.                          |


### Métodos

* `getId()` — retorna o identificador da transação.
* `getAdId()` —  retorna o identificador do anúncio.
* `getSellerId()` — retorna o identificador do usuário vendedor.
* `getBuyerId()` — retorna o identificador do usuário comprador.
* `setStatus()` — atualiza status da transação.
* `getStatus()` — retorna status da transação.
* `getCreationDate()` — retorna data e horário da criação da transação.
* `setConclusionDate()` — atualiza a data e horário da conclusão da transação.
* `getConclusionDate()` — retorna a data e horário da conclusão da transação.
* `finish()` — Métodos para finalizar a transação.

---

# 10. Classe `Sale`

### Tipo

**Subclasse de `Transaction`**

### Descrição

Representa uma transação de compra e venda de uma carta.

Além das informações herdadas de `Transaction`, a venda possui informações relacionadas ao pagamento e à entrega do produto.

### Atributos

| Atributo          | Tipo                | Descrição                                      |
| ----------------- | ------------------- | ---------------------------------------------- |
| `deliveryAddress` | String/Subdocumento | Endereço para onde a carta deverá ser enviada. |

### Métodos

* `setDeliveryAddress()` — atualiza o endereço de entrega.
* `getDeliveryAddress()` — retorna o endereço de entrega.

---

# 11. Classe `Exchange`

### Tipo

**Subclasse de `Transaction`**

### Descrição

Representa uma negociação na qual os usuários realizam uma troca de cartas.

A classe permite registrar qual carta está sendo oferecida pelo usuário que deseja realizar a troca.

### Atributos
 
| Atributo            | Tipo             | Descrição                                                                            |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `offeredCardId`     | List<ObjectId>   | Referência à carta que o usuário está oferecendo em troca.                           |
| `valueDifference`   | BigDecimal       | Diferença de valor entre as cartas, caso a troca envolva uma compensação financeira. |

### Métodos

* `setOfeeredCardId()`— atualiza as cartas oferecidas na troca.
* `getOfferedCardId()` — retorna o identificador da carta oferecida na troca (`collectionItemId`).
* `setValueDifference()` — atualiza o valor oferecido na troca.
* `getValueDifference()` — retorna o valor oferecido na troca.

---

# 12. Classe `Payment`

### Descrição

A classe `Payment` representa o pagamento associado a uma venda realizada no marketplace.

Ela registra o método utilizado, o valor, o status do pagamento e as informações relacionadas à transação com um possível gateway externo.

### Atributos

| Atributo                 | Tipo          | Descrição                                                                           |
| ------------------------ | ------------- | ----------------------------------------------------------------------------------- |
| `id`                     | ObjectId      | Identificador único do pagamento.                                                   |
| `saleId`                 | ObjectId      | Referência à venda relacionada ao pagamento.                                        |
| `method`                 | Enum          | Método utilizado para pagamento: Pix, Cartão de Crédito ou Boleto.                  |
| `value`                  | BigDecimal    | Valor do pagamento.                                                                 |
| `status`                 | Enum          | Situação do pagamento: Pendente, Aprovado, Recusado ou Estornado.                   |
| `paymentDate`            | LocalDateTime | Data e horário em que o pagamento foi realizado.                                    |
| `gatewayTransactionCode` | String        | Código retornado por um gateway externo de pagamento, caso seja utilizado/simulado. |

### Métodos

* `getId()` — retorna o identificador do pagamento.
* `getSaleId()` — retorna o identificador da venda.
* `setMethod()` — atualiza o método de pagamento.
* `getMethod()` — retorna o método de pagamento.
* `setValue()` — atualiza o valor do pagamento.
* `getValue()` — retorna o valor do pagamento.
* `setStatus()` — atualiza status do pagamento.
* `getStatus()` — retorna status do pagamento.
* `getPaymentDate()` — retorna data e horário do pagamento.
* `setGatewayTransactionCode()` — atualiza código.
* `getGatewayTransactionCode()` — retorna código.

---

# 13. Classe `Review`

### Descrição

A classe `Review` representa uma avaliação realizada por um usuário após uma transação.

Ela permite registrar a nota e um comentário sobre outro usuário, contribuindo para a composição da reputação dentro do marketplace.

### Atributos

| Atributo        | Tipo          | Descrição                                        |
| --------------- | ------------- | ------------------------------------------------ |
| `id`            | ObjectId      | Identificador único da avaliação.                |
| `transactionId` | ObjectId      | Referência à transação relacionada à avaliação.  |
| `reviewerId`    | ObjectId      | Usuário que realizou a avaliação.                |
| `revieweeId`    | ObjectId      | Usuário que recebeu a avaliação.                 |
| `grade`         | Integer       | Nota atribuída ao usuário.                       |
| `comment`       | String        | Comentário escrito pelo avaliador.               |
| `reviewDate`    | LocalDateTime | Data e horário em que a avaliação foi realizada. |

### Métodos

* `getId()` — retorna o identificador da avaliação.
* `getTransactionId()` — retorna o identificador da transação.
* `getReviewerId()` — retorna o identificador do avaliador.
* `getRevieweeId()` — retorna o identificador do avaiado.
* `setGrade()` — atualiza a nota da avaliação.
* `getGrade()` — retorna a nota da avaliação.
* `setComment()` — atualiza o conteúdo da avaliação.
* `getComment()` — retorna o conteúdo da avaliação.
* `getReviewDate()` — retorna a data e horário que a avaliação foi reatualizada.

---

# 14. Classe `CollectionItem`

### Descrição

A classe `CollectionItem` representa uma carta que faz parte da coleção pessoal de um usuário.

Ela permite registrar quais cartas pertencem à coleção do usuário e a quantidade de unidades que ele possui.

### Atributos

| Atributo       | Tipo          | Descrição                                               |
| -------------- | ------------- | ------------------------------------------------------- |
| `id`           | ObjectId      | Identificador único do item da coleção.                 |
| `userId`       | ObjectId      | Referência ao usuário proprietário da carta.            |
| `cardId`       | ObjectId      | Referência à carta pertencente à coleção.               |
| `quantity`     | Integer       | Quantidade de unidades da carta que o usuário possui.   |
| `condition`    | Enum          | Estado em que se encontra a carta.                      |
| `additionDate` | LocalDateTime | Data e horário em que a carta foi adicionada à coleção. |

### Métodos

* `getId()` — retorna o identificador do item colecionado.
* `getUserId()` — retorna o identificador do usuário dono da coleção.
* `getCardId()` — retorna o identificador da carta colecionada.
* `setQuantity()` — atualiza a quantidade de cartas colecionadas.
* `getQuantity()` — retorna a quantidade de cartas colecionadas.
* `setCondition()` — atualiza a condição da carta.
* `getCondition()` — retorna a condição da carta.
* `getAddition()` — retorna data e horário em que a carta foi adicionada a coleção.


---

# 15. Classe `Wishlist`

### Descrição

A classe `Wishlist` representa uma carta adicionada à lista de desejos de um usuário.

Ela permite que o usuário registre cartas que deseja adquirir futuramente e, opcionalmente, receba uma notificação quando houver disponibilidade.

### Atributos

| Atributo                   | Tipo          | Descrição                                                                             |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `id`                       | ObjectId      | Identificador único do item desejado.                                                 |
| `userId`                   | ObjectId      | Referência ao usuário que deseja a carta.                                             |
| `cardId`                   | ObjectId      | Referência à carta desejada.                                                          |
| `additionDate`             | LocalDateTime | Data e horário em que a carta foi adicionada à lista.                                 |
| `notifyAvailability`       | Boolean       | Indica se o usuário deseja receber uma notificação quando a carta estiver disponível. |


### Métodos

* `getId()` — retorna o identificador do item desejado. 
* `getUserId()` — retorna o identificador do usuário.
* `getCardId()` — retorna o identificador da carta.
* `getAdditionDate()` — retorna a data de adição do item.
* `setNotifyAvailability()` — atualiza se o usuário quer ou não notificação.
* `isNotifyAvailability()` — verifica se o usuário quer ser notificado.

---

# 16. Classe `Conversation`

### Descrição

A classe `Conversation` representa uma conversa entre usuários relacionada a um anúncio.

Ela funciona como o agrupador das mensagens trocadas durante uma negociação ou comunicação relacionada à carta anunciada.

### Atributos

| Atributo          | Tipo           | Descrição                                                                 |
| ----------------- | -------------- | ------------------------------------------------------------------------- |
| `id`              | ObjectId       | Identificador único da conversa.                                          |
| `adId`            | ObjectId       | Referência ao anúncio relacionado à conversa.                             |
| `participantIds`  | List<ObjectId> | Lista contendo os identificadores dos usuários participantes da conversa. |
| `creationDate`    | LocalDateTime  | Data e horário de criação da conversa.                                    |
| `lastMessageDate` | LocalDateTime  | Data e horário da mensagem mais recente.                                  |

### Métodos

* `getId()` — retorna o identificador da conversa.
* `getAdId()` — retorna o identificador do anúncio relacionado.
* `getParticipantIds()` — retorna os participantes da conversa.
* `getCreationDate()` — retorna a data de criação.
* `setLastMessageDate()` — atualiza a data da última mensagem.
* `getLastMessageDate()` — retorna a data da última mensagem.

---

# 17. Classe `Message`

### Descrição

A classe `Message` representa uma mensagem enviada dentro de uma conversa.

Ela registra quem enviou a mensagem, qual conversa a mensagem pertence, seu conteúdo, o momento do envio e se ela já foi lida.

### Atributos

| Atributo         | Tipo          | Descrição                                         |
| ---------------- | ------------- | ------------------------------------------------- |
| `id`             | ObjectId      | Identificador único da mensagem.                  |
| `conversationId` | ObjectId      | Referência à conversa à qual a mensagem pertence. |
| `senderId`       | ObjectId      | Referência ao usuário que enviou a mensagem.      |
| `text`           | String        | Conteúdo da mensagem.                             |
| `sentDate`       | LocalDateTime | Data e horário em que a mensagem foi enviada.     |
| `read`           | Boolean       | Indica se a mensagem já foi lida.                 |

### Métodos

* `getId()` — retorna o identificador da mensagem.
* `getConversationId()` — retorna a conversa relacionada.
* `getSenderId()` — retorna o usuário que enviou a mensagem.
* `getText()` — retorna o conteúdo da mensagem.
* `getSentDate()` — retorna a data de envio.
* `setRead()` — altera o status de leitura da mensagem.
* `isRead()` — verifica se a mensagem foi lida.

---

# 18. Classe `CardRequest`

### Descrição

A Classe `CardRequest` representa a solicitação de adicioçao de carta ao catálogo feita por um usuário.

Ela registra as informações bases da carta a ser adicionada.

### Atributos

| Atributo         | Tipo          | Descrição                                              |
| ---------------- | ------------- | ------------------------------------------------------ |
| `id`             | ObjectId      | Identificador único da solicitação.                    |
| `userId`         | ObjectId      | Referência ao usuário que solicitpu a inclusão.        |
| `reviewerId`     | ObjectId      | Referência do administrador que revisou o pedido.      |
| `tcg`            | Enum          | qual TCG que a carta faz parte.                        |
| `cardName`       | String        | Nome da carta solicitada.                              |
| `collection`     | String        | Data e horário em que a mensagem foi enviada.          |
| `status`         | Enum          | Indica o status da solicitação.                        |
| `createdAt`      | LocalDateTime | Data e horário que o pedido foi criado.                |
| `reviewedAt`     | LocalDateTime | Data e horário que o pedido foi revisado por um admin. |

### Métodos

* `getId()` — retorna o identificador da requisição.
* `getUserId()` — retorna o identificador do usuário que criou a requisição.
* `getReviewed()` — retorna o identificador do administrador que revisou a solicitação.
* `setTcg()` — atualiza a qual TCG a carta pertence.
* `getTcg()` — retorna qual o TCG que a carta pertence.
* `setCardName()` — atualiza o nome da carta solicitada.
* `getCardName()` — retorna o nome da carta solicitada.
* `setCollection()` — atualiza qual a collection que a carta pertence.
* `getCollection()` — retorna qual a collection que a carta pertence.
* `setStatus()` — atualiza o status da requisição.
* `getStatus()` — retorna o status da requisição.
* `getCreatedAt()` — retorna a data em que a solicitação foi criada.
* `getReviewedAt()` — retorna a data que a solicitação foi revisada.

---

