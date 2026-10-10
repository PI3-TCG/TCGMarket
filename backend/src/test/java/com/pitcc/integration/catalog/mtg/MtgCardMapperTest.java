package com.pitcc.integration.catalog.mtg;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.mtg.dto.MtgCardDto;
import com.pitcc.integration.catalog.mtg.dto.MtgCardFaceDto;
import com.pitcc.integration.catalog.mtg.dto.MtgImageUris;
import java.util.List;
import com.pitcc.model.MagicCard;
import com.pitcc.model.MagicCardType;
import com.pitcc.model.MagicColor;
import com.pitcc.model.CardGame;

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
        com.pitcc.model.CardGame.MAGIC_THE_GATHERING,
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

  @Test
  void shouldConvertMagicCreature() {

    MtgCardDto dto = new MtgCardDto(
            "dragon-001",
            "oracle-dragon-001",
            "Flame Dragon",
            "tst",
            "Test Set",
            "42",
            "rare",
            null,
            null,
            "{3}{R}{R}",
            5.0,
            List.of("R"),
            "Creature — Dragon",
            "5",
            "4",
            "Flying"
    );

    MagicCard card = MtgCardMapper
            .toMagicCard(dto)
            .orElseThrow();

    assertEquals("Flame Dragon", card.getName());
    assertEquals("{3}{R}{R}", card.getManaCost());
    assertEquals(5.0, card.getCmc());
    assertEquals("5", card.getStrength());
    assertEquals("4", card.getResistance());

    assertTrue(card.getCardTypes().contains(MagicCardType.CREATURE));
    assertTrue(card.getColor().contains(MagicColor.RED));
    assertTrue(card.getSubTypes().contains("Dragon"));
    assertEquals("Flying", card.getRulesText());
  }

  @Test
  void shouldConvertColorlessMagicCard() {

    MtgCardDto dto = new MtgCardDto(
            "artifact-001",
            "oracle-artifact-001",
            "Ancient Relic",
            "tst",
            "Test Set",
            "100",
            "rare",
            null,
            null,
            "{3}",
            3.0,
            List.of(),
            "Artifact",
            null,
            null,
            "Add one mana of any color."
    );

    MagicCard card = MtgCardMapper
            .toMagicCard(dto)
            .orElseThrow();

    assertEquals("Ancient Relic", card.getName());
    assertEquals(3.0, card.getCmc());

    assertTrue(card.getColor().isEmpty());
    assertTrue(card.getCardTypes().contains(MagicCardType.ARTIFACT));

    assertNull(card.getStrength());
    assertNull(card.getResistance());
  }



}
