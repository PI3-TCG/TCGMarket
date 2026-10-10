package com.pitcc.integration.catalog.mtg;

import com.pitcc.integration.catalog.ExternalApiErrors;
import com.pitcc.integration.catalog.ExternalApiException;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgCardsResponse;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.pitcc.model.CardGame;
import org.springframework.util.Assert;
import org.springframework.web.client.RestClient;

public class MtgClient {

  private final RestClient restClient;

  public MtgClient(RestClient restClient) {
    this.restClient = Objects.requireNonNull(restClient, "restClient");
  }

  /** Devolve a primeira página da Scryfall, uma entrada por impressão. */
  public List<MtgCardDto> search(String query) {
    Assert.hasText(query, "query must not be blank");
    String term = query.trim();
    return ExternalApiErrors.fetch(com.pitcc.model.CardGame.MAGIC_THE_GATHERING, () -> restClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/cards/search")
                .queryParam("q", nameQuery(term))
                .queryParam("unique", "prints")
                .build())
            .retrieve()
            .onStatus(status -> status.isError(), ExternalApiErrors.errorHandler(com.pitcc.model.CardGame.MAGIC_THE_GATHERING))
            .body(MtgCardsResponse.class))
        .map(response -> cardsOf(response.data()))
        .orElse(List.of());
  }

  public Optional<MtgCardDto> findById(String externalId) {
    Assert.hasText(externalId, "externalId must not be blank");
    String id = externalId.trim();
    return ExternalApiErrors.fetch(com.pitcc.model.CardGame.MAGIC_THE_GATHERING, () -> restClient.get()
        .uri("/cards/{id}", id)
        .retrieve()
        .onStatus(status -> status.isError(), ExternalApiErrors.errorHandler(CardGame.MAGIC_THE_GATHERING))
        .body(MtgCardDto.class));
  }

  private static List<MtgCardDto> cardsOf(List<MtgCardDto> cards) {
    if (cards == null) {
      throw new ExternalApiException(CardGame.MAGIC_THE_GATHERING, ExternalApiErrorType.INVALID_RESPONSE,
          null, "Resposta de catálogo sem a lista data", null);
    }
    // Preserva entradas nulas para que a importação as registre como falhas de mapeamento.
    return new java.util.ArrayList<>(cards);
  }

  private static String nameQuery(String query) {
    return "name:\"" + query.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }
}
