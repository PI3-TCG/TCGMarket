package com.pitcc.integration.catalog;

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.Optional;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

public final class ExternalApiErrors {

  private ExternalApiErrors() {}

  /**
   * Executa uma chamada HTTP e traduz as falhas para {@link ExternalApiException}.
   * HTTP 404, sinalizado por {@link #errorHandler}, vira {@link Optional#empty()}.
   */
  public static <T> Optional<T> fetch(CardGame cardGame, Supplier<T> call) {
    T body;
    try {
      body = call.get();
    } catch (NotFound exception) {
      return Optional.empty();
    } catch (ExternalApiException exception) {
      throw exception;
    } catch (ResourceAccessException exception) {
      throw accessFailure(cardGame, exception);
    } catch (RestClientException | HttpMessageNotReadableException exception) {
      throw invalid(cardGame, "Invalid response from " + cardGame + " catalog", exception);
    } catch (RuntimeException exception) {
      if (isJackson(exception)) {
        throw invalid(cardGame, "Invalid response from " + cardGame + " catalog", exception);
      }
      throw exception;
    }
    if (body == null) {
      throw invalid(cardGame, cardGame + " catalog returned an empty body", null);
    }
    return Optional.of(body);
  }

  public static RestClient.ResponseSpec.ErrorHandler errorHandler(CardGame cardGame) {
    return (_, response) -> {
      int status = response.getStatusCode().value();
      if (status == 404) {
        throw new NotFound();
      }
      throw new ExternalApiException(
          cardGame,
          classify(status),
          status,
          cardGame + " catalog returned HTTP " + status,
          null);
    };
  }

  static ExternalApiErrorType classify(int status) {
    if (status == 429) {
      return ExternalApiErrorType.RATE_LIMITED;
    }
    if (status == 401 || status == 403) {
      return ExternalApiErrorType.UNAUTHORIZED;
    }
    if (status >= 500 && status <= 599) {
      return ExternalApiErrorType.SERVER_ERROR;
    }
    return ExternalApiErrorType.INVALID_RESPONSE;
  }

  private static ExternalApiException accessFailure(CardGame cardGame, ResourceAccessException exception) {
    if (isTimeout(exception)) {
      return new ExternalApiException(
          cardGame,
          ExternalApiErrorType.TIMEOUT,
          null,
          "Timeout calling " + cardGame + " catalog",
          exception);
    }
    return new ExternalApiException(
        cardGame,
        ExternalApiErrorType.UNAVAILABLE,
        null,
        "Catalog unavailable for " + cardGame,
        exception);
  }

  private static ExternalApiException invalid(CardGame cardGame, String message, Throwable cause) {
    return new ExternalApiException(cardGame, ExternalApiErrorType.INVALID_RESPONSE, null, message, cause);
  }

  private static boolean isTimeout(Throwable error) {
    Throwable current = error;
    while (current != null) {
      if (current instanceof HttpTimeoutException
          || current instanceof SocketTimeoutException
          || current instanceof TimeoutException) {
        return true;
      }
      current = current.getCause();
    }
    return false;
  }

  private static boolean isJackson(Throwable error) {
    Throwable current = error;
    while (current != null) {
      if (current.getClass().getName().startsWith("tools.jackson.")) {
        return true;
      }
      current = current.getCause();
    }
    return false;
  }

  private static final class NotFound extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private NotFound() {
      super(null, null, false, false);
    }
  }
}
