package com.pitcc.integration.catalog;

import com.pitcc.model.CardGame;

import java.util.Objects;

/**
 * Uma impressão específica de uma carta num catálogo externo.
 *
 * <p>{@code externalId} identifica a impressão. {@code conceptualId} identifica a carta
 * conceitual compartilhada entre impressões, quando o provedor expõe esse identificador;
 * caso contrário, é {@code null}.
 */
public record ExternalCard(
    String externalId,
    String conceptualId,
    String name,
    CardGame cardGame,
    String setName,
    String setCode,
    String cardNumber,
    String rarity,
    String imageUrl) {

  public ExternalCard {
    if (externalId == null || externalId.isBlank()) {
      throw new IllegalArgumentException("externalId must not be blank");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("name must not be blank");
    }
    cardGame = Objects.requireNonNull(cardGame, "cardGame");
    externalId = externalId.trim();
    conceptualId = normalize(conceptualId);
    name = name.trim();
    setName = normalize(setName);
    setCode = normalize(setCode);
    cardNumber = normalize(cardNumber);
    rarity = normalize(rarity);
    imageUrl = normalize(imageUrl);
  }

  private static String normalize(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
