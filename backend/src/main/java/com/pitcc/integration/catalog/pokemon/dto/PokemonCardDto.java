package com.pitcc.integration.catalog.pokemon.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PokemonCardDto(
    String id,
    String name,
    String number,
    String rarity,
    PokemonSetDto set,
    PokemonImagesDto images) {}
