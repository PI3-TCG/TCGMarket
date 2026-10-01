package com.pitcc.integration.catalog.pokemon;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class PokemonTcgClientTest {

  private MockRestServiceServer server;
  private PokemonTcgClient client;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder().baseUrl("http://catalog.test");
    server = MockRestServiceServer.bindTo(builder).build();
    client = new PokemonTcgClient(builder.build());
  }

  @Test
  void shouldDeserializeSearchResponse() {
    server.expect(requestTo(containsString("/cards")))
        .andRespond(withSuccess("""
            {"data":[{"id":"base1-4","name":"Charizard","number":"4","rarity":"Rare Holo","hp":"120",
            "set":{"id":"base1","name":"Base"},
            "images":{"small":"https://img.example/s.png","large":"https://img.example/l.png"}}]}
            """, MediaType.APPLICATION_JSON));

    var cards = client.search("charizard");

    assertEquals(1, cards.size());
    assertEquals("base1-4", cards.getFirst().id());
    assertEquals("Charizard", cards.getFirst().name());
    assertEquals("Base", cards.getFirst().set().name());
    assertEquals("https://img.example/l.png", cards.getFirst().images().large());
    server.verify();
  }

  @Test
  void shouldReturnEmptyWhenCardIsMissing() {
    server.expect(requestTo(containsString("/cards/missing")))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertTrue(client.findById("missing").isEmpty());
    server.verify();
  }

  @Test
  void shouldTranslateRateLimitUnauthorizedAndServerErrors() {
    server.expect(requestTo(containsString("/cards")))
        .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
    ExternalApiException rateLimited = assertThrows(ExternalApiException.class, () -> client.search("pikachu"));
    assertEquals(ExternalApiErrorType.RATE_LIMITED, rateLimited.getErrorType());
    assertEquals(CardGame.POKEMON, rateLimited.getCardGame());
    assertEquals(429, rateLimited.getStatusCode());

    server.reset();
    server.expect(requestTo(containsString("/cards")))
        .andRespond(withStatus(HttpStatus.UNAUTHORIZED));
    ExternalApiException unauthorized = assertThrows(ExternalApiException.class, () -> client.search("pikachu"));
    assertEquals(ExternalApiErrorType.UNAUTHORIZED, unauthorized.getErrorType());
    assertEquals(401, unauthorized.getStatusCode());

    server.reset();
    server.expect(requestTo(containsString("/cards")))
        .andRespond(withStatus(HttpStatus.BAD_GATEWAY));
    ExternalApiException serverError = assertThrows(ExternalApiException.class, () -> client.search("pikachu"));
    assertEquals(ExternalApiErrorType.SERVER_ERROR, serverError.getErrorType());
    assertEquals(502, serverError.getStatusCode());
  }

  @Test
  void shouldTranslateMalformedPayload() {
    server.expect(requestTo(containsString("/cards")))
        .andRespond(withSuccess("{not-json", MediaType.APPLICATION_JSON));

    ExternalApiException exception = assertThrows(ExternalApiException.class, () -> client.search("pikachu"));

    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, exception.getErrorType());
    assertEquals(CardGame.POKEMON, exception.getCardGame());
  }

  @Test
  void shouldRejectBlankQueryBeforeCallingApi() {
    assertThrows(IllegalArgumentException.class, () -> client.search(" "));
    server.verify();
  }
}
