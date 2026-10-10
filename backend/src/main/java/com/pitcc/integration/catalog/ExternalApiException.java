package com.pitcc.integration.catalog;

import com.pitcc.model.CardGame;

import java.util.Objects;

public final class ExternalApiException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  private final com.pitcc.model.CardGame cardGame;
  private final ExternalApiErrorType errorType;
  private final Integer statusCode;

  public ExternalApiException(
      CardGame cardGame,
      ExternalApiErrorType errorType,
      Integer statusCode,
      String message,
      Throwable cause) {
    super(message, cause);
    this.cardGame = Objects.requireNonNull(cardGame, "cardGame");
    this.errorType = Objects.requireNonNull(errorType, "errorType");
    this.statusCode = statusCode;
  }

  public CardGame getCardGame() {
    return cardGame;
  }

  public ExternalApiErrorType getErrorType() {
    return errorType;
  }

  public Integer getStatusCode() {
    return statusCode;
  }
}
