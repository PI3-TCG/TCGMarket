package com.pitcc.integration.catalog.yugioh;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.pitcc.integration.catalog.ExternalApiErrorType;
import com.pitcc.integration.catalog.ExternalApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class YugiohClientTest {

  private static final String NO_CARD_BODY =
      "{\"error\":\"No card matching your query was found in the database.\"}";

  private MockRestServiceServer server;
  private YugiohClient client;

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder().baseUrl("http://catalog.test");
    server = MockRestServiceServer.bindTo(builder).build();
    client = new YugiohClient(builder.build());
  }

  @Test
  void shouldSendNumTogetherWithOffsetOnSearch() {
    server.expect(requestTo(containsString("/cardinfo.php")))
        .andExpect(queryParam("fname", "Blue-Eyes%20White%20Dragon"))
        .andExpect(queryParam("num", "20"))
        .andExpect(queryParam("offset", "0"))
        .andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));

    assertTrue(client.search("Blue-Eyes White Dragon").isEmpty());
    server.verify();
  }

  @Test
  void shouldDeserializeSnakeCasePayloadWithAllCardSets() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withSuccess("""
            {"data":[{"id":46986414,"name":"Dark Magician","type":"Normal Monster",
            "card_sets":[
              {"set_name":"Legend of Blue Eyes White Dragon","set_code":"LOB-EN005","set_rarity":"Ultra Rare"},
              {"set_name":"Starter Deck: Yugi","set_code":"SDY-006","set_rarity":"Ultra Rare"}],
            "card_images":[{"image_url":"https://img.example/dm.jpg","image_url_small":"https://img.example/dm-small.jpg"}]}]}
            """, MediaType.APPLICATION_JSON));

    var cards = client.search("dark magician");

    assertEquals(1, cards.size());
    assertEquals(46986414L, cards.getFirst().id());
    assertEquals(2, cards.getFirst().cardSets().size());
    assertEquals("SDY-006", cards.getFirst().cardSets().get(1).setCode());
    assertEquals("https://img.example/dm.jpg", cards.getFirst().cardImages().getFirst().imageUrl());
    server.verify();
  }

  @Test
  void shouldFindCardByPasscode() {
    server.expect(requestTo("http://catalog.test/cardinfo.php?id=46986414"))
        .andRespond(withSuccess("""
            {"data":[{"id":46986414,"name":"Dark Magician","card_sets":[]}]}
            """, MediaType.APPLICATION_JSON));

    assertEquals("Dark Magician", client.findByPasscode(46986414L).orElseThrow().name());
    server.verify();
  }

  @Test
  void shouldIgnoreCardWithDifferentPasscode() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withSuccess("""
            {"data":[{"id":1,"name":"Other"}]}
            """, MediaType.APPLICATION_JSON));

    assertTrue(client.findByPasscode(46986414L).isEmpty());
  }

  @Test
  void shouldTreatNoMatchingCard400AsEmptyResult() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withStatus(HttpStatus.BAD_REQUEST).body(NO_CARD_BODY).contentType(MediaType.APPLICATION_JSON));

    assertTrue(client.search("not-a-card").isEmpty());

    server.reset();
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withStatus(HttpStatus.BAD_REQUEST).body(NO_CARD_BODY).contentType(MediaType.APPLICATION_JSON));

    assertTrue(client.findByPasscode(999L).isEmpty());
  }

  @Test
  void shouldFailWhenBadRequestIsNotAnEmptyResult() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withStatus(HttpStatus.BAD_REQUEST)
            .body("{\"error\":\"Invalid\"}")
            .contentType(MediaType.APPLICATION_JSON));

    ExternalApiException exception = assertThrows(ExternalApiException.class, () -> client.findByPasscode(1L));

    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, exception.getErrorType());
    assertEquals(400, exception.getStatusCode());
  }

  @Test
  void shouldTranslateServerErrorAndRateLimit() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));
    ExternalApiException serverError = assertThrows(ExternalApiException.class, () -> client.search("magician"));
    assertEquals(ExternalApiErrorType.SERVER_ERROR, serverError.getErrorType());
    assertEquals(500, serverError.getStatusCode());

    server.reset();
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
    ExternalApiException rateLimited = assertThrows(ExternalApiException.class, () -> client.search("magician"));
    assertEquals(ExternalApiErrorType.RATE_LIMITED, rateLimited.getErrorType());
  }

  @Test
  void shouldTranslateMalformedPayload() {
    server.expect(requestTo(containsString("cardinfo.php")))
        .andRespond(withSuccess("{\"data\":[", MediaType.APPLICATION_JSON));

    ExternalApiException exception = assertThrows(ExternalApiException.class, () -> client.search("magician"));

    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, exception.getErrorType());
  }
}
