package com.pitcc.integration.catalog.yugioh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardImageDto;
import com.pitcc.integration.catalog.yugioh.dto.YugiohCardSetDto;
import java.util.List;
import org.junit.jupiter.api.Test;

class YugiohCardMapperTest {

  @Test
  void shouldMapEachCardSetToItsOwnPrinting() {
    YugiohCardDto dto = new YugiohCardDto(
        89631139L,
        "Blue-Eyes White Dragon",
        List.of(
            new YugiohCardSetDto("Legend of Blue Eyes White Dragon", "LOB-EN001", "Ultra Rare"),
            new YugiohCardSetDto("Starter Deck: Kaiba", "SDK-001", "Ultra Rare"),
            new YugiohCardSetDto("Legendary Collection", "LC01-EN004", "Ultra Rare")),
        List.of(new YugiohCardImageDto("https://img.example/bewd.jpg", null)));

    List<ExternalCard> cards = YugiohCardMapper.toExternalCards(dto);

    assertEquals(3, cards.size());
    assertEquals(new ExternalCard(
        "89631139:LOB-EN001:Ultra Rare",
        "89631139",
        "Blue-Eyes White Dragon",
        CardGame.YUGIOH,
        "Legend of Blue Eyes White Dragon",
        "LOB-EN001",
        null,
        "Ultra Rare",
        "https://img.example/bewd.jpg"), cards.get(0));
    assertEquals("89631139:SDK-001:Ultra Rare", cards.get(1).externalId());
    assertEquals("Starter Deck: Kaiba", cards.get(1).setName());
    assertEquals("LC01-EN004", cards.get(2).setCode());
    assertTrue(cards.stream().allMatch(card -> "89631139".equals(card.conceptualId())));
  }

  @Test
  void shouldKeepRaritiesOfTheSameSetCodeAsDistinctPrintings() {
    YugiohCardDto dto = new YugiohCardDto(
        14558127L,
        "Ash Blossom & Joyous Spring",
        List.of(
            new YugiohCardSetDto("25th Anniversary Rarity Collection", "RA01-EN008", "Super Rare"),
            new YugiohCardSetDto("25th Anniversary Rarity Collection", "RA01-EN008", "Ultra Rare"),
            new YugiohCardSetDto("25th Anniversary Rarity Collection", "RA01-EN008", "Ultra Rare")),
        null);

    List<ExternalCard> cards = YugiohCardMapper.toExternalCards(dto);

    assertEquals(2, cards.size());
    assertEquals("14558127:RA01-EN008:Super Rare", cards.get(0).externalId());
    assertEquals("Super Rare", cards.get(0).rarity());
    assertEquals("14558127:RA01-EN008:Ultra Rare", cards.get(1).externalId());
    assertEquals("Ultra Rare", cards.get(1).rarity());
  }

  @Test
  void shouldProduceNoPrintingWithoutUsableCardSets() {
    assertTrue(YugiohCardMapper.toExternalCards(new YugiohCardDto(1L, "Token", null, null)).isEmpty());
    assertTrue(YugiohCardMapper.toExternalCards(new YugiohCardDto(1L, "Token", List.of(), null)).isEmpty());
    assertTrue(YugiohCardMapper.toExternalCards(new YugiohCardDto(
        1L, "Token", List.of(new YugiohCardSetDto("Set", " ", "Common")), null)).isEmpty());
  }

  @Test
  void shouldTolerateMissingOptionalPrintingFields() {
    YugiohCardDto dto = new YugiohCardDto(
        46986414L,
        "Dark Magician",
        List.of(new YugiohCardSetDto(null, "LOB-EN005", null)),
        List.of(new YugiohCardImageDto(" ", "https://img.example/dm-small.jpg")));

    ExternalCard card = YugiohCardMapper.toExternalCards(dto).getFirst();

    assertEquals("46986414:LOB-EN005", card.externalId());
    assertEquals("46986414", card.conceptualId());
    assertNull(card.setName());
    assertNull(card.cardNumber());
    assertNull(card.rarity());
    assertEquals("https://img.example/dm-small.jpg", card.imageUrl());
  }

  @Test
  void shouldSkipCardWithoutIdentity() {
    List<YugiohCardSetDto> sets = List.of(new YugiohCardSetDto("Set", "SET-001", "Common"));
    assertTrue(YugiohCardMapper.toExternalCards(null).isEmpty());
    assertTrue(YugiohCardMapper.toExternalCards(new YugiohCardDto(null, "Dark Magician", sets, null)).isEmpty());
    assertTrue(YugiohCardMapper.toExternalCards(new YugiohCardDto(1L, " ", sets, null)).isEmpty());
  }
}
