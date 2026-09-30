package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.CardGame;
import com.pitcc.integration.catalog.ExternalCard;
import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonImagesDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
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
