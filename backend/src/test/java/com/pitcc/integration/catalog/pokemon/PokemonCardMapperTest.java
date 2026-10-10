package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonImagesDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
import com.pitcc.model.CardGame;
import com.pitcc.model.PokemonCard;
import com.pitcc.model.PokemonCardType;
import com.pitcc.model.PokemonEnergyType;
import com.pitcc.model.PokemonEvolutionStage;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PokemonCardMapperTest {

  private static PokemonCardDto dto(String id, String name, String hp, String supertype,
                                    List<String> subtypes, List<String> types) {
    return new PokemonCardDto(id, name, hp, null, supertype, subtypes,
            "4", "Rare", new PokemonSetDto("base1", "Base Set"),
            null, types, List.of());
  }

  @Test
  void shouldMapOneApiCardToOnePrinting() {
    PokemonCardDto input = new PokemonCardDto("base1-4", "Charizard", "120", 3,
            "Pokémon", List.of("Stage 2"), "4", "Rare Holo",
            new PokemonSetDto("base1", "Base"),
            new PokemonImagesDto("https://img.example/small.png", "https://img.example/large.png"),
            List.of("Fire"), List.of());
    ExternalCard card = PokemonCardMapper.toExternalCard(input).orElseThrow();
    assertEquals(new ExternalCard("base1-4", null, "Charizard", CardGame.POKEMON,
            "Base", "base1", "4", "Rare Holo", "https://img.example/large.png"), card);
  }

  @Test
  void shouldKeepDistinctPrintingsOfTheSameName() {
    ExternalCard base = PokemonCardMapper.toExternalCard(dto("base1-4", "Charizard", "120", "Pokémon", List.of("Stage 2"), List.of("Fire"))).orElseThrow();
    ExternalCard reprint = PokemonCardMapper.toExternalCard(dto("base4-4", "Charizard", "120", "Pokémon", List.of("Stage 2"), List.of("Fire"))).orElseThrow();
    assertEquals("base1-4", base.externalId());
    assertEquals("base4-4", reprint.externalId());
    assertNull(base.conceptualId());
    assertNull(reprint.conceptualId());
  }

  @Test
  void shouldTolerateMissingOptionalFields() {
    PokemonCardDto input = new PokemonCardDto("base1-58", "Pikachu", null, null,
            null, null, null, " ", null, new PokemonImagesDto(" ", null), null, null);
    ExternalCard card = PokemonCardMapper.toExternalCard(input).orElseThrow();
    assertEquals("Pikachu", card.name());
    assertNull(card.setName());
    assertNull(card.setCode());
    assertNull(card.cardNumber());
    assertNull(card.rarity());
    assertNull(card.imageUrl());
  }

  @Test
  void shouldUseSmallImageWhenLargeIsMissing() {
    PokemonCardDto input = new PokemonCardDto("sv1-1", "Sprigatito", null, null,
            null, null, "1", null, null,
            new PokemonImagesDto("https://img.example/small.png", " "), null, null);
    assertEquals("https://img.example/small.png",
            PokemonCardMapper.toExternalCard(input).orElseThrow().imageUrl());
  }

  @Test
  void shouldSkipCardWithoutIdentity() {
    assertTrue(PokemonCardMapper.toExternalCard(null).isEmpty());
    assertTrue(PokemonCardMapper.toExternalCard(dto(null, "Charizard", "120", "Pokémon", List.of("Stage 2"), List.of("Fire"))).isEmpty());
    assertTrue(PokemonCardMapper.toExternalCard(dto("base1-4", " ", "120", "Pokémon", List.of("Stage 2"), List.of("Fire"))).isEmpty());
  }

  @Test
  void shouldConvertPokemonDtoToPokemonCard() {
    PokemonCard card = PokemonCardMapper.toPokemonCard(
                    dto("base1-4", "Charizard", "120", "Pokémon", List.of("Stage 2"), List.of("Fire")))
            .orElseThrow();
    assertEquals("Charizard", card.getName());
    assertEquals(120, card.getHp());
    assertEquals(PokemonCardType.POKEMON, card.getPokemonCardType());
    assertEquals(PokemonEvolutionStage.STAGE_2, card.getEvolutionStage());
    assertEquals(List.of(PokemonEnergyType.FIRE), card.getEnergyTypes());
    assertTrue(card.getAttacks().isEmpty());
  }

  @Test
  void shouldConvertEnergyCardWithoutTypes() {
    PokemonCard card = PokemonCardMapper.toPokemonCard(
                    dto("energy-1", "Special Energy", null, "Energy", List.of("Special"), null))
            .orElseThrow();
    assertEquals(PokemonCardType.ENERGY, card.getPokemonCardType());
    assertNull(card.getHp());
    assertNull(card.getEvolutionStage());
    assertTrue(card.getEnergyTypes().isEmpty());
  }

  @Test
  void shouldConvertTrainerCard() {
    PokemonCard card = PokemonCardMapper.toPokemonCard(
                    dto("sv1-190", "Professor's Research", null, "Trainer", List.of("Supporter"), null))
            .orElseThrow();
    assertEquals(PokemonCardType.TRAINER, card.getPokemonCardType());
    assertNull(card.getHp());
    assertNull(card.getEvolutionStage());
    assertTrue(card.getEnergyTypes().isEmpty());
    assertTrue(card.getAttacks().isEmpty());
  }

  @Test
  void shouldRejectInvalidHp() {
    PokemonCardDto input = dto("base1-4", "Charizard", "invalid",
            "Pokémon", List.of("Stage 2"), List.of("Fire"));
    assertThrows(IllegalArgumentException.class, () -> PokemonCardMapper.toPokemonCard(input));
  }

  @Test
  void shouldRejectUnknownPokemonType() {
    PokemonCardDto input = dto("base1-4", "Charizard", "120",
            "Unknown", List.of("Stage 2"), List.of("Fire"));
    assertThrows(IllegalArgumentException.class, () -> PokemonCardMapper.toPokemonCard(input));
  }

  @Test
  void shouldConvertOfficialPokemonTypes() {
    for (PokemonEnergyType type : PokemonEnergyType.values()) {
      PokemonCard card = PokemonCardMapper.toPokemonCard(
                      dto("type-" + type, "Test Pokemon", "100", "Pokémon",
                              List.of("Basic"), List.of(toApiType(type))))
              .orElseThrow();
      assertEquals(List.of(type), card.getEnergyTypes());
    }
  }

  private static String toApiType(PokemonEnergyType type) {
    return switch (type) {
      case GRASS -> "Grass";
      case FIRE -> "Fire";
      case WATER -> "Water";
      case LIGHTNING -> "Lightning";
      case PSYCHIC -> "Psychic";
      case FIGHTING -> "Fighting";
      case DARKNESS -> "Darkness";
      case METAL -> "Metal";
      case FAIRY -> "Fairy";
      case DRAGON -> "Dragon";
      case COLORLESS -> "Colorless";
    };
  }
}
