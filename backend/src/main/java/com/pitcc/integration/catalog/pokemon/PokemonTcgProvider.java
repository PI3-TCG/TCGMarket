package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.CardCatalogProvider;
import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PokemonTcgProvider implements CardCatalogProvider {

  private static final Logger log = LoggerFactory.getLogger(PokemonTcgProvider.class);

  private final PokemonTcgClient client;

  public PokemonTcgProvider(PokemonTcgClient client) {
    this.client = client;
  }

  @Override
  public CardGame getCardGame() {
    return CardGame.POKEMON;
  }

  @Override
  public List<ExternalCard> searchCards(String query) {
    return client.search(query).stream()
        .map(this::toCard)
        .flatMap(Optional::stream)
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
