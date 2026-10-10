package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonImagesDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonAttackDto;
import com.pitcc.model.CardGame;
import com.pitcc.model.PokemonCardType;
import com.pitcc.model.PokemonEnergyType;
import com.pitcc.model.PokemonAttack;
import com.pitcc.model.PokemonEvolutionStage;
import com.pitcc.model.PokemonCard;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

final class PokemonCardMapper {

  private PokemonCardMapper() {}

  static Optional<ExternalCard> toExternalCard(PokemonCardDto dto) {
    if (dto == null || isBlank(dto.id()) || isBlank(dto.name())) {
      return Optional.empty();
    }
    PokemonSetDto set = dto.set();
    // O id da API v2 já é a impressão (ex.: base1-4). A API não expõe um id da carta
    // conceitual, e o nome não serve para isso, então conceptualId fica null.
    return Optional.of(new ExternalCard(
        dto.id(),
        null,
        dto.name(),
        CardGame.POKEMON,
        set == null ? null : set.name(),
        set == null ? null : set.id(),
        dto.number(),
        dto.rarity(),
        imageUrl(dto.images())));
  }

  static Optional<PokemonCard> toPokemonCard(PokemonCardDto dto) {

    if (dto == null || isBlank(dto.id()) || isBlank(dto.name())) {
      return Optional.empty();
    }

    PokemonSetDto set = dto.set();

    PokemonCardType cardType = parseCardType(dto.supertype());

    List<PokemonEnergyType> energyTypes = parseTypes(dto.types());

    PokemonEvolutionStage evolutionStage =
            parseEvolutionStage(dto.subtypes());

    List<PokemonAttack> attacks = parseAttacks(dto.attacks());

    PokemonCard card = new PokemonCard(
            dto.name(),
            set == null ? null : set.name(),
            set == null ? null : set.id(),
            dto.number(),
            dto.rarity(),
            imageUrl(dto.images()),
            dto.id(),
            parseHp(dto.hp()),
            cardType,
            energyTypes,
            evolutionStage,
            dto.convertedRetreatCost(),
            attacks
    );

    return Optional.of(card);
  }

  private static Integer parseHp(String hp) {

    if (hp == null || hp.isBlank()) {
      return null;
    }

    try {
      return Integer.parseInt(hp);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("HP inválido recebido da API: " + hp, e);
    }

  }

  private static List<PokemonEnergyType> parseTypes(List<String> types) {

    if (types == null || types.isEmpty()) {
      return List.of();
    }

    List<PokemonEnergyType> convertedTypes = new ArrayList<>();

    for (String type : types) {
      try {
        PokemonEnergyType energyType =
                PokemonEnergyType.valueOf(
                        type.strip().toUpperCase(Locale.ROOT)
                );

        convertedTypes.add(energyType);

      } catch (IllegalArgumentException | NullPointerException e) {
        throw new IllegalArgumentException("Tipo Pokémon inválido recebido da API: " + type, e);
      }
    }

    return List.copyOf(convertedTypes);
  }

  private static PokemonCardType parseCardType(String supertype) {

    if (supertype == null || supertype.isBlank()) {
      throw new IllegalArgumentException(
              "Categoria da carta Pokémon não informada"
      );
    }

    return switch (supertype.strip().toLowerCase(Locale.ROOT)) {
      case "pokémon", "pokemon" -> PokemonCardType.POKEMON;
      case "trainer" -> PokemonCardType.TRAINER;
      case "energy" -> PokemonCardType.ENERGY;
      default -> throw new IllegalArgumentException(
              "Categoria Pokémon desconhecida: " + supertype
      );
    };

  }

  private static PokemonEvolutionStage parseEvolutionStage(
          List<String> subtypes
  ) {
    if (subtypes == null || subtypes.isEmpty()) {
      return null;
    }

    for (String subtype : subtypes) {

      if (subtype == null) {
        continue;
      }

      switch (subtype.strip().toLowerCase(Locale.ROOT)) {
        case "basic":
          return PokemonEvolutionStage.BASIC;

        case "stage 1":
          return PokemonEvolutionStage.STAGE_1;

        case "stage 2":
          return PokemonEvolutionStage.STAGE_2;
      }
    }

    return null;
  }

  private static List<PokemonAttack> parseAttacks(
          List<PokemonAttackDto> attacks
  ) {
    if (attacks == null || attacks.isEmpty()) {
      return List.of();
    }

    List<PokemonAttack> convertedAttacks = new ArrayList<>();

    for (PokemonAttackDto attack : attacks) {

      PokemonAttack convertedAttack = new PokemonAttack(
              attack.name(),
              parseTypes(attack.cost()),
              attack.damage()
      );

      convertedAttacks.add(convertedAttack);
    }

    return List.copyOf(convertedAttacks);
  }

  private static String imageUrl(PokemonImagesDto images) {
    if (images == null) {
      return null;
    }
    if (!isBlank(images.large())) {
      return images.large();
    }
    return images.small();
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
