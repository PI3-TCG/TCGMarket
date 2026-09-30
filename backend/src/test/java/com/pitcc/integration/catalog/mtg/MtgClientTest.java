package com.pitcc.integration.catalog.mtg;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
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

class MtgClientTest {

  private MockRestServiceServer server;
  private MtgClient client;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder().baseUrl("http://catalog.test");
    server = MockRestServiceServer.bindTo(builder).build();
    client = new MtgClient(builder.build());
  }

  @Test
  void shouldRequestIndividualPrintingsAndReturnTheWholePage() {
    StringBuilder cards = new StringBuilder();
    for (int index = 0; index < 25; index++) {
      if (index > 0) {
        cards.append(',');
      }
      cards.append("{\"id\":\"print-").append(index)
          .append("\",\"oracle_id\":\"oracle-lotus\",\"name\":\"Black Lotus\",\"set\":\"s")
          .append(index).append("\"}");
    }
    server.expect(requestTo(allOf(
            containsString("/cards/search"),
            containsString("unique=prints"),
            not(containsString("unique=cards")))))
        .andRespond(withSuccess("{\"object\":\"list\",\"data\":[" + cards + "]}", MediaType.APPLICATION_JSON));

    var result = client.search("black lotus");

    assertEquals(25, result.size());
    assertEquals("print-0", result.getFirst().id());
    assertEquals("oracle-lotus", result.getFirst().oracleId());
    assertEquals("s24", result.getLast().setCode());
    server.verify();
  }

  @Test
  void shouldDeserializePrintingFields() {
    server.expect(requestTo("http://catalog.test/cards/lotus"))
        .andRespond(withSuccess("""
            {"object":"card","id":"lotus","oracle_id":"oracle-lotus","name":"Black Lotus","set":"lea",
            "set_name":"Limited Edition Alpha","collector_number":"232","rarity":"rare","cmc":0,
            "image_uris":{"small":"https://img.example/s.jpg","normal":"https://img.example/n.jpg"}}
            """, MediaType.APPLICATION_JSON));

    var card = client.findById("lotus").orElseThrow();

    assertEquals("oracle-lotus", card.oracleId());
    assertEquals("lea", card.setCode());
    assertEquals("Limited Edition Alpha", card.setName());
    assertEquals("232", card.cardNumber());
    assertEquals("https://img.example/n.jpg", card.imageUris().normal());
    server.verify();
  }

  @Test
  void shouldReturnEmptyWhenSearchOrLookupFindsNothing() {
    server.expect(requestTo(containsString("/cards/search")))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));
    assertTrue(client.search("not-a-card").isEmpty());

    server.reset();
    server.expect(requestTo("http://catalog.test/cards/missing"))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));
    assertTrue(client.findById("missing").isEmpty());
  }

  @Test
  void shouldTranslateForbiddenAndMalformedPayload() {
    server.expect(requestTo(containsString("/cards/search")))
        .andRespond(withStatus(HttpStatus.FORBIDDEN));
    ExternalApiException forbidden = assertThrows(ExternalApiException.class, () -> client.search("lotus"));
    assertEquals(ExternalApiErrorType.UNAUTHORIZED, forbidden.getErrorType());
    assertEquals(403, forbidden.getStatusCode());

    server.reset();
    server.expect(requestTo(containsString("/cards/search")))
        .andRespond(withSuccess("{\"data\":", MediaType.APPLICATION_JSON));
    ExternalApiException malformed = assertThrows(ExternalApiException.class, () -> client.search("lotus"));
    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, malformed.getErrorType());
    assertEquals(CardGame.MAGIC_THE_GATHERING, malformed.getCardGame());
  }
}
