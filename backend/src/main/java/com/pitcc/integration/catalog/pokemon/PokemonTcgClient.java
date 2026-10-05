package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalApiErrors;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardResponse;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardsResponse;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.util.Assert;
import org.springframework.web.client.RestClient;

public class PokemonTcgClient {

  static final int SEARCH_PAGE_SIZE = 20;

  private final RestClient restClient;

  public PokemonTcgClient(RestClient restClient) {
    this.restClient = Objects.requireNonNull(restClient, "restClient");
  }

  public List<PokemonCardDto> search(String query) {
    Assert.hasText(query, "query must not be blank");
    String term = query.trim();
    return ExternalApiErrors.fetch(CardGame.POKEMON, () -> restClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/cards")
                .queryParam("q", nameQuery(term))
                .queryParam("pageSize", SEARCH_PAGE_SIZE)
                .build())
            .retrieve()
            .onStatus(status -> status.isError(), ExternalApiErrors.errorHandler(CardGame.POKEMON))
            .body(PokemonCardsResponse.class))
        .map(response -> cardsOf(response.data()))
        .orElse(List.of());
  }

  public Optional<PokemonCardDto> findById(String externalId) {
    Assert.hasText(externalId, "externalId must not be blank");
    String id = externalId.trim();
    return ExternalApiErrors.fetch(CardGame.POKEMON, () -> restClient.get()
            .uri("/cards/{id}", id)
            .retrieve()
            .onStatus(status -> status.isError(), ExternalApiErrors.errorHandler(CardGame.POKEMON))
            .body(PokemonCardResponse.class))
        .map(response -> response.data());
  }

  private static List<PokemonCardDto> cardsOf(List<PokemonCardDto> cards) {
    if (cards == null) {
      return List.of();
    }
    return cards.stream().filter(Objects::nonNull).toList();
  }

  private static String nameQuery(String query) {
    return "name:\"" + query.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }
}
