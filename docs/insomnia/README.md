# Collection do Insomnia

Arquivo: `tcg-market.insomnia.json`.

No Insomnia, use **Import** e selecione esse arquivo. A variável `base_url` aponta para `http://localhost:8080`. O backend precisa estar rodando.

A collection cobre só o que a API já expõe:

- `GET /api/health`
- `POST /api/users`
- `GET /api/catalog/{game}/cards?q=&set=&rarity=&type=&page=&size=&sort=`
- `GET /api/catalog/{game}/filters`
- `GET /api/catalog/{game}/cards/by-external-id?externalId=`
- `GET /api/catalog/cards/{id}`: carta completa pelo `id` do catálogo interno, com os atributos do TCG (`pokemon`, `yugioh` ou `magic`) e `otherPrintings`
- `DELETE /api/users/me/collection/{itemId}`: remove o item da coleção do usuário autenticado (exige `token`). Devolve `204` ao remover, `404` se o item não existe ou é de outro usuário e `409` se o item está em um anúncio ativo. A carta do catálogo não é apagada.
- `GET /api/users/me/collection/{itemId}`: devolve o item da coleção do usuário autenticado com a disponibilidade para anúncio (`totalQuantity`, `committedQuantity` e `availableQuantity`). Exige `token` e devolve `404` se o item não existe ou é de outro usuário.
- `POST /api/users/me/ads`: cria um anúncio ativo a partir de um item da coleção (exige `token`). Pelo menos uma modalidade (`saleEnabled` ou `tradeEnabled`) é obrigatória, e `unitPrice` só é obrigatório com venda (de 0,01 a 999.999,99, com até 2 casas). Devolve `201`, `400` para dados inválidos, `404` se o item não existe ou é de outro usuário e `409` se a quantidade passa da disponível.

Os jogos do catálogo são `pokemon`, `yugioh` e `magic`. As rotas consultam só o catálogo interno (MongoDB); o JSON original da Pokémon TCG API, da YGOPRODeck e da Scryfall não aparece nelas.

Na pesquisa, todos os parâmetros são opcionais e podem ser combinados. `set` é o nome da coleção (o mesmo `setName` da resposta), `type` é o tipo de carta do jogo (por exemplo `TRAINER`, `TRAP` ou `CREATURE`), `page` começa em 0, `size` vai de 1 a 50 (padrão 20) e `sort` aceita `name-asc` ou `name-desc`. A resposta vem paginada:

```json
{ "content": [], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }
```

`/filters` devolve as opções que existem no catálogo daquele jogo: `sets` (nomes das coleções), `rarities` e `types`.
