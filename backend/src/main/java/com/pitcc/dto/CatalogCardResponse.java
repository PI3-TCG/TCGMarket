package com.pitcc.dto;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.model.CardGame;
import com.pitcc.model.Card;
import com.pitcc.model.CardLocalization;
import java.util.Map;

/** {@code id} é o identificador no catálogo interno; vem null quando a carta ainda não foi importada. */
public record CatalogCardResponse(
    String id,
    String externalId,
    String conceptualId,
    String name,
    CardGame cardGame,
    String setName,
    String setCode,
    String cardNumber,
    String rarity,
    String imageUrl,
    Map<String, CardLocalization> localizations) {

  public static CatalogCardResponse from(Card card) {
    return new CatalogCardResponse(card.getId(), card.getExternalId(), card.getConceptualId(),
        card.getName(), card.getGame(), card.getEdition(), card.getCodeCollection(),
        card.getCardNumber(), card.getOfficialRarity(), card.getImageUrl(),
        card.getLocalizations());
  }

  public static CatalogCardResponse from(ExternalCard card) {
    return new CatalogCardResponse(
        null,
        card.externalId(),
        card.conceptualId(),
        card.name(),
        card.cardGame(),
        card.setName(),
        card.setCode(),
        card.cardNumber(),
        card.rarity(),
        card.imageUrl(),
        null);
  }
}
