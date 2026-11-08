package com.pitcc.integration.catalog.tcgdex;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Cartas Pokémon por idioma na TCGdex; usada só para traduzir o catálogo. */
@Component
public class TcgdexClient {

  public record CardBrief(String id, String localId, String name, String image) {}

  public record SetBrief(String id, String name) {}

  private final RestClient client;

  public TcgdexClient(
          @Value("${catalog.localize.tcgdex-base-url:https://api.tcgdex.net/v2}") String baseUrl) {
    this.client = RestClient.builder().baseUrl(baseUrl).build();
  }

  public List<CardBrief> cards(String language) {
    return client.get()
            .uri("/{language}/cards", language)
            .retrieve()
            .body(new ParameterizedTypeReference<List<CardBrief>>() {});
  }

  public List<SetBrief> sets(String language) {
    return client.get()
            .uri("/{language}/sets", language)
            .retrieve()
            .body(new ParameterizedTypeReference<List<SetBrief>>() {});
  }
}
