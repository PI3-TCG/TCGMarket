package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CatalogImportProvider;
import com.pitcc.integration.catalog.ImportBatch;
import com.pitcc.model.CardSource;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import java.util.List;
import java.util.Optional;

import com.pitcc.model.CardGame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PokemonTcgProvider implements CardCatalogProvider, CatalogImportProvider {

  private static final Logger log = LoggerFactory.getLogger(PokemonTcgProvider.class);

  private final PokemonTcgClient client;

  public PokemonTcgProvider(PokemonTcgClient client) {
    this.client = client;
  }

  @Override
  public com.pitcc.model.CardGame getCardGame() {
    return CardGame.POKEMON;
  }

  @Override
  public CardSource getSource() {
    return CardSource.POKEMON_TCG_API;
  }

  @Override
  public ImportBatch fetchForImport(String query) {
    return ImportBatch.map(client.search(query), getSource(),
        dto -> dto.id(), dto -> PokemonCardMapper.toPokemonCard(dto).stream().toList());
  }

  @Override
  public List<ExternalCard> searchCards(String query) {
    return client.search(query).stream()
        .map(this::toCard)
        .flatMap(card -> card.stream())
        .toList();
  }

  @Override
  public Optional<ExternalCard> findByExternalId(String externalId) {
    return client.findById(externalId).flatMap(this::toCard);
  }

  private Optional<ExternalCard> toCard(PokemonCardDto dto) {
    Optional<ExternalCard> card = PokemonCardMapper.toExternalCard(dto);
    if (card.isEmpty()) {
      log.warn("Ignorando carta do catálogo Pokémon sem id ou nome");
    }
    return card;
  }
}
