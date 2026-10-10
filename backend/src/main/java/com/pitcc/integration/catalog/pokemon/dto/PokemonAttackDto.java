package com.pitcc.integration.catalog.pokemon.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PokemonAttackDto(
        String name,
        List<String> cost,
        Integer convertedEnergyCost,
        String damage,
        String text
) {}