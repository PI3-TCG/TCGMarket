# Collection do Insomnia

Arquivo: `tcg-market.insomnia.json`.

No Insomnia, use **Import** e selecione esse arquivo. A variável `base_url` aponta para `http://localhost:8080`. O backend precisa estar rodando.

A collection cobre só o que a API já expõe:

- `GET /api/health`
- `POST /api/users`
- `GET /api/catalog/{game}/cards?q=`
- `GET /api/catalog/{game}/cards/by-external-id?externalId=`

Os jogos do catálogo são `pokemon`, `yugioh` e `magic`. A resposta da busca já vem convertida para o formato interno. O JSON original da Pokémon TCG API, da YGOPRODeck e da Scryfall não aparece nessa rota.
