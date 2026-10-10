package com.pitcc.integration.catalog.pokemon.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PokemonCardDto(
        String id,
        String name,
        String hp,
        Integer convertedRetreatCost,
        String supertype,
        List<String> subtypes,
        String number,
        String rarity,
        PokemonSetDto set,
        PokemonImagesDto images,
        List<String> types,
        List<PokemonAttackDto> attacks
) {
    public PokemonCardDto(
            String id,
            String name,
            String number,
            String rarity,
            PokemonSetDto set,
            PokemonImagesDto images
    ) {
        this(
                id,
                name,
                null,  // hp
                null,  // convertedRetreatCost
                null,  // supertype
                null,  // subtypes
                number,
                rarity,
                set,
                images,
                null,  // types
                null   // attacks
        );
    }
}