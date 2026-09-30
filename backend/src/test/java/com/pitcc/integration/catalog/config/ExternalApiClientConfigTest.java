package com.pitcc.integration.catalog.config;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.pitcc.integration.catalog.pokemon.PokemonTcgClient;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.RequestMatcher;
import org.springframework.web.client.RestClient;

class ExternalApiClientConfigTest {

  @Test
  void shouldSendPokemonApiKeyWhenConfigured() {
    RestClient.Builder builder = RestClient.builder().baseUrl("http://catalog.test");
    ExternalApiClientConfig.applyPokemonApiKey(builder, " test-key ");
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    PokemonTcgClient client = new PokemonTcgClient(builder.build());

    server.expect(requestTo(containsString("/cards")))
        .andExpect(header("X-Api-Key", "test-key"))
        .andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));

    assertTrue(client.search("pikachu").isEmpty());
    server.verify();
  }

  @Test
  void shouldOmitPokemonApiKeyWhenBlank() {
    RestClient.Builder builder = RestClient.builder().baseUrl("http://catalog.test");
    ExternalApiClientConfig.applyPokemonApiKey(builder, "  ");
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    PokemonTcgClient client = new PokemonTcgClient(builder.build());

    server.expect(requestTo(containsString("/cards")))
        .andExpect(withoutHeader("X-Api-Key"))
        .andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));

    assertTrue(client.search("pikachu").isEmpty());
    server.verify();
  }

  @Test
  void shouldRejectBlankBaseUrl() {
    assertThrows(IllegalStateException.class, () ->
        ExternalApiClientConfig.restClientBuilder(" ", Duration.ofSeconds(1)));
  }

  @Test
  void shouldRedactApiKeyFromPropertiesToString() {
    ExternalApisProperties.Pokemon withKey = new ExternalApisProperties.Pokemon(
        "http://pokemon.test", "super-secret", Duration.ofSeconds(5));
    ExternalApisProperties.Pokemon withoutKey = new ExternalApisProperties.Pokemon(
        "http://pokemon.test", " ", Duration.ofSeconds(5));

    assertFalse(withKey.toString().contains("super-secret"));
    assertTrue(withKey.toString().contains("present"));
    assertTrue(withoutKey.toString().contains("absent"));
    assertEquals("http://pokemon.test", withKey.baseUrl());
  }

  private static RequestMatcher withoutHeader(String name) {
    return (ClientHttpRequest request) -> {
      if (request.getHeaders().getFirst(name) != null) {
        throw new AssertionError("Header " + name + " should be absent");
      }
    };
  }
}
