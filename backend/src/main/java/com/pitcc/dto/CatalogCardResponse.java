package com.pitcc.dto;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.model.CardGame;
import com.pitcc.model.Card;

public record CatalogCardResponse(
    String externalId,
    String conceptualId,
    String name,
    CardGame cardGame,
    String setName,
    String setCode,
    String cardNumber,
    String rarity,
    String imageUrl) {

  public static CatalogCardResponse from(Card card) {
    return new CatalogCardResponse(card.getExternalId(), card.getConceptualId(), card.getName(),
        card.getGame(), card.getEdition(), card.getCodeCollection(), card.getCardNumber(),
        card.getOfficialRarity(), card.getImageUrl());
  }

  public static CatalogCardResponse from(ExternalCard card) {
    return new CatalogCardResponse(
        card.externalId(),
        card.conceptualId(),
        card.name(),
        card.cardGame(),
        card.setName(),
        card.setCode(),
        card.cardNumber(),
        card.rarity(),
        card.imageUrl());
  }
}
