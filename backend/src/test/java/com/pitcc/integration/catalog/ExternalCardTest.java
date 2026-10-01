package com.pitcc.integration.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ExternalCardTest {

  @Test
  void shouldNormalizeBlankOptionalFields() {
    ExternalCard card = new ExternalCard(
        " id ",
        "  ",
        " Name ",
        CardGame.POKEMON,
        "  ",
        null,
        "",
        " rare ",
        null);

    assertEquals("id", card.externalId());
    assertNull(card.conceptualId());
    assertEquals("Name", card.name());
    assertNull(card.setName());
    assertNull(card.setCode());
    assertNull(card.cardNumber());
    assertEquals("rare", card.rarity());
    assertNull(card.imageUrl());
  }

  @Test
  void shouldKeepConceptualIdSeparateFromPrintingId() {
    ExternalCard card = new ExternalCard(
        "89631139:LOB-EN001:Ultra Rare",
        " 89631139 ",
        "Blue-Eyes White Dragon",
        CardGame.YUGIOH,
        null,
        null,
        null,
        null,
        null);

    assertEquals("89631139:LOB-EN001:Ultra Rare", card.externalId());
    assertEquals("89631139", card.conceptualId());
  }

  @Test
  void shouldRejectCardWithoutIdentity() {
    assertThrows(IllegalArgumentException.class, () ->
        new ExternalCard(" ", null, "Name", CardGame.POKEMON, null, null, null, null, null));
    assertThrows(IllegalArgumentException.class, () ->
        new ExternalCard("id", null, " ", CardGame.POKEMON, null, null, null, null, null));
  }
}
