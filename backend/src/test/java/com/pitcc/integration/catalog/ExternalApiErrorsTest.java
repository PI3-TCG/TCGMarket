package com.pitcc.integration.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.ConnectException;
import java.net.http.HttpTimeoutException;

import com.pitcc.model.CardGame;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

class ExternalApiErrorsTest {

  @Test
  void shouldClassifyHttpStatuses() {
    assertEquals(ExternalApiErrorType.RATE_LIMITED, ExternalApiErrors.classify(429));
    assertEquals(ExternalApiErrorType.UNAUTHORIZED, ExternalApiErrors.classify(401));
    assertEquals(ExternalApiErrorType.UNAUTHORIZED, ExternalApiErrors.classify(403));
    assertEquals(ExternalApiErrorType.SERVER_ERROR, ExternalApiErrors.classify(500));
    assertEquals(ExternalApiErrorType.SERVER_ERROR, ExternalApiErrors.classify(503));
    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, ExternalApiErrors.classify(400));
  }

  @Test
  void shouldTranslateTimeoutAndConnectionFailures() {
    ExternalApiException timeout = assertThrows(ExternalApiException.class, () ->
        ExternalApiErrors.fetch(com.pitcc.model.CardGame.MAGIC_THE_GATHERING, () -> {
          throw new ResourceAccessException("read timed out", new HttpTimeoutException("read timed out"));
        }));
    assertEquals(ExternalApiErrorType.TIMEOUT, timeout.getErrorType());
    assertEquals(com.pitcc.model.CardGame.MAGIC_THE_GATHERING, timeout.getCardGame());
    assertNull(timeout.getStatusCode());

    ExternalApiException unavailable = assertThrows(ExternalApiException.class, () ->
        ExternalApiErrors.fetch(com.pitcc.model.CardGame.POKEMON, () -> {
          throw new ResourceAccessException("connect failed", new ConnectException("refused"));
        }));
    assertEquals(ExternalApiErrorType.UNAVAILABLE, unavailable.getErrorType());
  }

  @Test
  void shouldHideRawRestClientFailures() {
    ExternalApiException exception = assertThrows(ExternalApiException.class, () ->
        ExternalApiErrors.fetch(com.pitcc.model.CardGame.YUGIOH, () -> {
          throw new RestClientException("broken payload");
        }));

    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, exception.getErrorType());
  }

  @Test
  void shouldRejectEmptyBody() {
    ExternalApiException exception = assertThrows(ExternalApiException.class, () ->
        ExternalApiErrors.fetch(com.pitcc.model.CardGame.POKEMON, () -> null));

    assertEquals(ExternalApiErrorType.INVALID_RESPONSE, exception.getErrorType());
  }

  @Test
  void shouldPreserveIntegrationExceptions() {
    ExternalApiException original = new ExternalApiException(
        com.pitcc.model.CardGame.POKEMON,
        ExternalApiErrorType.RATE_LIMITED,
        429,
        "limited",
        null);

    ExternalApiException thrown = assertThrows(ExternalApiException.class, () ->
        ExternalApiErrors.fetch(CardGame.POKEMON, () -> {
          throw original;
        }));

    assertSame(original, thrown);
  }
}
