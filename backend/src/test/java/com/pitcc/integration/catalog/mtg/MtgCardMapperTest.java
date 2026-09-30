package com.pitcc.integration.catalog.mtg;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgCardFaceDto;
import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import java.util.List;
import org.junit.jupiter.api.Test;

class MtgCardMapperTest {

  @Test
  void shouldMapScryfallPrintingToExternalCard() {
    MtgCardDto dto = new MtgCardDto(
        "bd8fa327-ddb5-4f6b-b9b2-2c6e0e5d0e0a",
        "5089ec1a-f881-4d55-af14-5d996171203b",
        "Black Lotus",
        "lea",
        "Limited Edition Alpha",
        "232",
        "rare",
        new MtgImageUris("https://img.example/lotus-small.jpg", "https://img.example/lotus.jpg"),
        null);

    ExternalCard card = MtgCardMapper.toExternalCard(dto).orElseThrow();

    assertEquals(new ExternalCard(
        "bd8fa327-ddb5-4f6b-b9b2-2c6e0e5d0e0a",
        "5089ec1a-f881-4d55-af14-5d996171203b",
        "Black Lotus",
        CardGame.MAGIC_THE_GATHERING,
        "Limited Edition Alpha",
        "lea",
        "232",
        "rare",
        "https://img.example/lotus.jpg"), card);
  }

  @Test
  void shouldShareOracleIdAcrossPrintings() {
    ExternalCard alpha = MtgCardMapper.toExternalCard(new MtgCardDto(
        "alpha-uuid", "oracle-1", "Black Lotus", "lea", "Limited Edition Alpha", "232", "rare", null, null))
        .orElseThrow();
    ExternalCard beta = MtgCardMapper.toExternalCard(new MtgCardDto(
        "beta-uuid", "oracle-1", "Black Lotus", "leb", "Limited Edition Beta", "233", "rare", null, null))
        .orElseThrow();

    assertEquals("alpha-uuid", alpha.externalId());
    assertEquals("beta-uuid", beta.externalId());
    assertEquals("oracle-1", alpha.conceptualId());
    assertEquals(alpha.conceptualId(), beta.conceptualId());
    assertEquals("leb", beta.setCode());
    assertEquals("233", beta.cardNumber());
  }

  @Test
  void shouldTolerateMissingOptionalFields() {
    MtgCardDto dto = new MtgCardDto("id-1", null, "Island", null, " ", "", null, null, null);

    ExternalCard card = MtgCardMapper.toExternalCard(dto).orElseThrow();

    assertEquals("id-1", card.externalId());
    assertNull(card.conceptualId());
    assertEquals("Island", card.name());
    assertEquals(CardGame.MAGIC_THE_GATHERING, card.cardGame());
    assertNull(card.setName());
    assertNull(card.setCode());
    assertNull(card.cardNumber());
    assertNull(card.rarity());
    assertNull(card.imageUrl());
  }

  @Test
  void shouldUseCardFaceImageWhenTopLevelImageIsMissing() {
    MtgCardDto dto = new MtgCardDto(
        "face-1",
        "oracle-delver",
        "Delver of Secrets // Insectile Aberration",
        "isd",
        "Innistrad",
        "51",
        "common",
        null,
        List.of(
            new MtgCardFaceDto(null),
            new MtgCardFaceDto(new MtgImageUris("https://img.example/face-small.jpg", "https://img.example/face.jpg"))));

    assertEquals("https://img.example/face.jpg", MtgCardMapper.toExternalCard(dto).orElseThrow().imageUrl());
  }

  @Test
  void shouldSkipCardWithoutIdentity() {
    assertTrue(MtgCardMapper.toExternalCard(null).isEmpty());
    assertTrue(MtgCardMapper.toExternalCard(new MtgCardDto(null, "o", "Island", null, null, null, null, null, null)).isEmpty());
    assertTrue(MtgCardMapper.toExternalCard(new MtgCardDto("id", "o", " ", null, null, null, null, null, null)).isEmpty());
  }
}
