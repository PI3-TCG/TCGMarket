package com.pitcc.integration.catalog.pokemon;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonImagesDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
import org.junit.jupiter.api.Test;

class PokemonCardMapperTest {

  @Test
  void shouldMapOneApiCardToOnePrinting() {
    PokemonCardDto dto = new PokemonCardDto(
        "base1-4",
        "Charizard",
        "4",
        "Rare Holo",
        new PokemonSetDto("base1", "Base"),
        new PokemonImagesDto("https://img.example/small.png", "https://img.example/large.png"));

    ExternalCard card = PokemonCardMapper.toExternalCard(dto).orElseThrow();

    assertEquals(new ExternalCard(
        "base1-4",
        null,
        "Charizard",
        CardGame.POKEMON,
        "Base",
        "base1",
        "4",
        "Rare Holo",
        "https://img.example/large.png"), card);
  }

  @Test
  void shouldKeepDistinctPrintingsOfTheSameName() {
    ExternalCard base = PokemonCardMapper.toExternalCard(
        new PokemonCardDto("base1-4", "Charizard", "4", null, new PokemonSetDto("base1", "Base"), null)).orElseThrow();
    ExternalCard reprint = PokemonCardMapper.toExternalCard(
        new PokemonCardDto("base4-4", "Charizard", "4", null, new PokemonSetDto("base4", "Base Set 2"), null)).orElseThrow();

    assertEquals("base1-4", base.externalId());
    assertEquals("base4-4", reprint.externalId());
    assertNull(base.conceptualId());
    assertNull(reprint.conceptualId());
  }

  @Test
  void shouldTolerateMissingOptionalFields() {
    PokemonCardDto dto = new PokemonCardDto("base1-58", "Pikachu", null, " ", null, new PokemonImagesDto(" ", null));

    ExternalCard card = PokemonCardMapper.toExternalCard(dto).orElseThrow();

    assertEquals("base1-58", card.externalId());
    assertNull(card.conceptualId());
    assertEquals("Pikachu", card.name());
    assertEquals(CardGame.POKEMON, card.cardGame());
    assertNull(card.setName());
    assertNull(card.setCode());
    assertNull(card.cardNumber());
    assertNull(card.rarity());
    assertNull(card.imageUrl());
  }

  @Test
  void shouldUseSmallImageWhenLargeIsMissing() {
    PokemonCardDto dto = new PokemonCardDto(
        "sv1-1",
        "Sprigatito",
        "1",
        null,
        null,
        new PokemonImagesDto("https://img.example/small.png", " "));

    assertEquals("https://img.example/small.png", PokemonCardMapper.toExternalCard(dto).orElseThrow().imageUrl());
  }

  @Test
  void shouldSkipCardWithoutIdentity() {
    assertTrue(PokemonCardMapper.toExternalCard(null).isEmpty());
    assertTrue(PokemonCardMapper.toExternalCard(new PokemonCardDto(null, "Charizard", null, null, null, null)).isEmpty());
    assertTrue(PokemonCardMapper.toExternalCard(new PokemonCardDto("base1-4", " ", null, null, null, null)).isEmpty());
  }
}
